const {chromium,expect}=require('@playwright/test'),path=require('path');
const {createApp}=require('../server/app.cjs');
(async()=>{
 const app=createApp({staticRoot:path.resolve('dist')});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:'+app.server.address().port);await page.waitForFunction(()=>Team.available);
  const ids=await page.evaluate(async()=>{
   teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Missing-price-test-42!'}));
   await teamApi('users','POST',{username:'tech',name:'Technical',password:'Missing-price-test-42!',role:'technical',sections:['bom','operations']});
   const d=TPPrice.demoSeed();d.quote.remnantMode='all';
   for(const n of C.flatten(d.quote.products)){n.ops=[];n.children??=[];}
   const n=d.quote.products[0];n.ops=[{id:'cut',instanceId:C.uid(),mode:'inside',amount:1,basisMode:'manual_total',workQuantity:5,pricingMethod:'direct',priceUnit:'kg',unitPrice:''}];
   const quotes=[];
   for(const suffix of ['full','partial','incomplete']){const doc=C.copy(d);doc.quote.id='QA-MISSING-PRICE-'+suffix;if(suffix==='incomplete')doc.quote.products[0].children=[];const q=await teamApi('quotes','POST',{document:doc});await teamApi('quotes/'+q.id+'/handoff/intake','POST',{expectedVersion:q.version});quotes.push(q.id);}
   await teamApi('logout','POST');teamSession(await teamApi('login','POST',{username:'tech',password:'Missing-price-test-42!'}));return {quotes,node:n.id};
  });
  await page.evaluate(async id=>{await teamLoad(id);tab='bom';render();result.errors.push('PRICE_ONLY_SENTINEL');if(errorStrip().includes('PRICE_ONLY_SENTINEL'))throw Error('Pricing error leaked into technical BOM');},ids.quotes[0]);
  for(const [i,id]of ids.quotes.entries()){
   await page.evaluate(async id=>{await teamLoad(id);tab='operations';mutation(()=>db.quote.products[0].ops[0].workQuantity=7);render();},id);
   await page.locator('[data-team=save]').first().click();await page.waitForFunction(()=>!Team.dirty&&!Team.savePending);
   await page.reload();await page.waitForFunction(()=>Team.user);await page.evaluate(id=>teamLoad(id),id);
   expect(await page.evaluate(()=>db.quote.products[0].ops[0].workQuantity)).toBe(7);
   if(i===0){
    await page.evaluate(()=>noticeConfirm('technical'));
    const response=page.waitForResponse(r=>r.url().endsWith('/handoff/technical')&&r.request().method()==='POST');
    await page.locator('#dialog button[type=submit]').click();expect((await response).status()).toBe(200);await expect(page.locator('#dialog')).not.toBeVisible();
    continue;
   }
   const out=await page.evaluate(async({i,node})=>{const q=teamCurrent(),route=i===1?'/partial-handoff':'/handoff/technical';const r=await fetch('/api/quotes/'+q.id+route,{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':Team.csrf},body:JSON.stringify({expectedVersion:q.version,stage:'technical',action:'confirm',nodeId:node})});return {status:r.status,data:await r.json()};},{i,node:ids.node});
   expect(out.status,JSON.stringify(out.data)).toBe(i===2?422:200);
   if(i===2)expect(out.data.error).toContain('chưa có thành phần');
  }
  const stored=await page.evaluate(async ids=>{await teamApi('logout','POST');teamSession(await teamApi('login','POST',{username:'admin',password:'Missing-price-test-42!'}));return Promise.all(ids.quotes.map(id=>teamApi('quotes/'+id)));},ids);
  for(const q of stored)expect(q.document.quote.products[0].ops[0].unitPrice).toBe('');
  expect(errors).toEqual([]);console.log('PASS technical save/reload with missing operation price; full and partial handoff; missing price preserved; incomplete BOM saves but cannot hand off');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
