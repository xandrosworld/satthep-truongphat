'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage();
 try{
  await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
  const id=await p.evaluate(async()=>{
   const password='Catalog-defaults-test-42!';window.testPassword=password;
   teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password}));
   await teamApi('users','POST',{username:'tech',name:'Technical with catalogue access',password,role:'technical',technicalDelegation:true,canViewCosts:true,canEditFactors:false,sectionModes:Object.fromEntries(TPSectionAccess.keys.map(k=>[k,['bom','operations','catalogMaterials','catalogTechnicalOperations','catalogLibrary'].includes(k)?'configure':['materials','factors'].includes(k)?'none':'view']))});
   const d=TPPrice.demoSeed();d.quote.remnantMode='all';d.pricingDefaults=TPInputPrices.defaults(d);d.pricingDefaults.overhead=17;d.pricingDefaults.expenseRates[0].rate=12345;d.pricingDefaults.expenseRates[0].priceHistory=[{at:'2026-09-01',from:{rate:10},to:{rate:12345}}];
   const q=await teamApi('quotes','POST',{document:d});window.testQuote=q.id;
   await teamApi('formulas/locks','POST',{key:'calculationFactors:all',locked:true,reason:'Protect calculation factors during technical correction',expectedVersion:0});
   for(const stage of ['intake','technical','materials'])await teamApi('quotes/'+q.id+'/handoff/'+stage,'POST',{expectedVersion:q.version});
   teamSession(await teamApi('login','POST',{username:'tech',password}));
   await teamApi('quotes/'+q.id+'/corrections','POST',{action:'request',sections:['operations'],reason:'Update operation notes',expectedVersion:q.version});
   teamSession(await teamApi('login','POST',{username:'admin',password}));
   const pending=(await teamApi('quotes/'+q.id+'/corrections')).items.find(x=>x.status==='pending');
   await teamApi('quotes/'+q.id+'/corrections','POST',{action:'approve',id:pending.id,expectedVersion:q.version});
   teamSession(await teamApi('login','POST',{username:'tech',password}));await teamLoad(q.id);tab='operations';render();
   return q.id;
  });
  const original=JSON.parse(app.sql.prepare('SELECT document FROM quotes WHERE id=?').get(id).document);
  // An already open technical tab retains a server-issued masked pricing
  // reference while the current quote has newer coefficients after reopening.
  const historical=structuredClone(original);historical.quote.pricing.management=77;
  const technicalUser=app.sql.prepare("SELECT * FROM users WHERE username='tech'").get();
  const oldPricing=require('../server/data-access.cjs').createDataAccess({sql:app.sql,fail:(status,message)=>{throw Error(message);}}).protect(historical,technicalUser).quote.pricing;
  await p.evaluate(ref=>{db.quote.pricing.__accessRef=ref;},oldPricing.__accessRef);
  expect(await p.evaluate(()=>Team.permissions.technical)).toBeFalsy();
  expect(await p.evaluate(()=>db.pricingDefaults.expenseRates[0].rate)).not.toBe(12345);
  expect(await p.evaluate(()=>teamDocument().pricingDefaults.expenseRates[0].rate)).toBe(12345);
  await p.evaluate(()=>{mutation(()=>db.quote.products[0].ops[0].notes='Changed in permitted scope');render();});
  const saved=p.waitForResponse(r=>r.request().method()==='PUT'&&r.url().endsWith('/quotes/'+id));await p.evaluate(()=>noticeConfirm('technical'));await expect(p.locator('#dialog')).toContainText('Lưu và tiếp tục');await p.locator('#dialog button[type=submit]').click();expect((await saved).status()).toBe(200);await p.waitForFunction(()=>!Team.dirty&&!Team.savePending);
  await p.reload();await p.waitForFunction(()=>Team.user);await p.evaluate(id=>teamLoad(id),id);
  expect(await p.evaluate(()=>db.quote.products[0].ops[0].notes)).toBe('Changed in permitted scope');
  // An already open, older browser sends published defaults. Preserve the quote
  // snapshot without requiring a reload or widening the account's permissions.
  const checks=await p.evaluate(async testQuote=>{
   const current=await teamApi('quotes/'+testQuote),master=await teamApi('catalog'),doc=C.copy(current.document);
   doc.pricingDefaults=C.copy(master.catalog.pricingDefaults);doc.quote.products[0].ops[0].notes='Old tab saved';
   const saved=await teamApi('quotes/'+testQuote,'PUT',{document:doc,expectedVersion:current.version});
   async function denied(edit,version=saved.version){const d=C.copy((await teamApi('quotes/'+testQuote)).document);edit(d);try{await teamApi('quotes/'+testQuote,'PUT',{document:d,expectedVersion:version});return 200;}catch(e){return e.status;}}
   return {forged:await denied(d=>d.pricingDefaults.expenseRates[0].rate=98765),outsideScope:await denied(d=>d.quote.products[0].qty++),stale:await denied(d=>{},current.version),factors:await denied(d=>d.quote.pricing.overhead=99)};
  },id);
  expect(checks).toEqual({forged:403,outsideScope:403,stale:409,factors:403});
  await p.evaluate(id=>teamLoad(id),id);await p.evaluate(()=>noticeConfirm('technical'));
  const handoff=p.waitForResponse(r=>r.url().endsWith('/handoff/technical')&&r.request().method()==='POST');await p.locator('#dialog button[type=submit]').click();expect((await handoff).status()).toBe(200);
  const stored=JSON.parse(app.sql.prepare('SELECT document FROM quotes WHERE id=?').get(id).document);
  expect(stored.pricingDefaults).toEqual(original.pricingDefaults);expect(stored.quote.pricing).toEqual(original.quote.pricing);
  expect(stored.quote.products[0].ops[0].notes).toBe('Old tab saved');
  console.log('PASS scoped correction save/reload/handoff, isolated catalogue defaults, older open tab, forged defaults/scope/version rejected');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
