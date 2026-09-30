const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),C=require('../core.js');
(async()=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port,password='Unit-repair-browser-2026!';let browser;
 try{
  const call=async(route,method='GET',body,session)=>{const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),raw=await r.json(),data=raw.__formulaProtected?raw.value:raw;return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
  const admin=await call('setup','POST',{username:'admin',name:'Admin',password});
  await require('./helpers/personnel-user.cjs')(call,admin,{username:'prices',name:'Price reviewer',password,role:'estimator',sections:['materials'],canFormulaEdit:false,canFormulaView:true},{direct:true});
  const d=P.demoSeed();for(const n of C.flatten(d.quote.products))n.ops=[];
  const ids=['weld','bend','pack'];for(const [i,id]of ids.entries()){const rate=d.quote.ratesSnapshot.find(r=>r.id===id);rate.insideUnit=['m','lần','bộ'][i];rate.inside=35000;d.quote.products[0].ops.push({id,instanceId:'work-'+id,mode:'inside',quantityUnit:'kg',amount:1,basisMode:'auto'});}
  d.quote.ratesSnapshot.find(r=>!ids.includes(r.id)).outside=123456;
  const made=await call('quotes','POST',{document:d},admin);expect(made.status).toBe(201);
  const master=JSON.parse(app.sql.prepare('SELECT document FROM catalog WHERE id=1').get().document);
  for(const id of ids)Object.assign(master.rates.find(r=>r.id===id),{insideUnit:'kg',inside:2000});
  app.sql.prepare('UPDATE catalog SET document=? WHERE id=1').run(JSON.stringify(master));app.sql.exec("UPDATE formula_locks SET locked=1 WHERE key='operationPricing:all'");
  browser=await chromium.launch({channel:'msedge',headless:true});const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base);await p.waitForFunction(()=>Team.available);
  await p.evaluate(async({password,id})=>{teamSession(await teamApi('login','POST',{username:'prices',password}));await teamLoad(id);tab='prices';Intake.priceTab='operations';render();},{password,id:made.data.id});
  await p.locator('[data-intake=rate-unit-refresh]').first().click();await expect(p.locator('#dialog')).toContainText('kg');
  await p.route('**/api/quotes/'+made.data.id,async route=>{if(route.request().method()==='PUT')return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Temporary test outage'})});return route.continue();});
  await p.locator('#dialog button[type=submit]').click();
  await p.waitForFunction(()=>Team.saveFeedback?.error&&!Team.savePending);
  expect(await p.evaluate(()=>Team.dirty)).toBe(true);
  expect(await p.evaluate(()=>TPIntake.operationUnitUpdates(inOperationUnitDb()).length)).toBe(0);
  await p.unroute('**/api/quotes/'+made.data.id);await p.evaluate(()=>teamSave());
  await p.waitForFunction(()=>!Team.dirty&&!Team.savePending,{},{timeout:15000});
  await p.reload();await p.waitForFunction(()=>Team.available);
  await p.evaluate(async id=>{await teamLoad(id);tab='prices';Intake.priceTab='operations';render();},made.data.id);
  expect(await p.evaluate(()=>TPIntake.operationUnitUpdates(inOperationUnitDb()).length)).toBe(0);
  expect(await p.evaluate(ids=>db.quote.ratesSnapshot.filter(r=>ids.includes(r.id)).map(r=>[r.insideUnit,r.inside]),ids)).toEqual(ids.map(()=>['kg',2000]));
  expect(await p.evaluate(()=>result.errors.filter(e=>String(e).includes('đơn giá đang theo')))).toEqual([]);
  const after=(await call('quotes/'+made.data.id,'GET',undefined,admin)).data.document;
  expect(after.quote.products).toEqual(d.quote.products);expect(after.quote.ratesSnapshot.find(r=>!ids.includes(r.id)).outside).toBe(123456);
  expect(errors).toEqual([]);console.log('PASS restricted price reviewer: three unit repairs, actual dialog, failed save retained, retry, server save, browser reload, preserved technical data and unrelated price');
 }finally{await browser?.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
