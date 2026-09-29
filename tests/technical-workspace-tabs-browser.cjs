const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage();await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 const id=await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Logistics-save-test-2026!'}));const d=TPPrice.demoSeed();d.quote.products=[{id:'product',kind:'product',name:'Technical save',qty:2,children:[],ops:[],transport:123,install:456}];const q=await teamApi('quotes','POST',{document:d});await teamApi('users','POST',{username:'tech',name:'Technical',password:'Logistics-save-test-2026!',role:'estimator',sections:['bom','operations']});teamSession(await teamApi('login','POST',{username:'tech',password:'Logistics-save-test-2026!'}));await teamOpenRequestedQuote();await teamLoad(q.id);page='quote';tab='bom';UX.mode='quick';render();window.baselineLogistics=C.copy(db.quote);return q.id;});
 for(const target of ['bom','operations','waste','mass','prices','pricing','preview']){
  await p.evaluate(target=>{tab=target;render();},target);
  for(const key of ['prices','pricing','preview'])await expect(p.locator('#content [data-tab="'+key+'"]')).toHaveCount(0);
  expect(await p.evaluate(()=>['intake','bom','operations','waste','mass'].includes(tab))).toBe(true);
 }
 await p.reload();await p.waitForFunction(()=>Team.user&&Team.loaded);expect(await p.evaluate(()=>['intake','bom','operations','waste','mass'].includes(tab))).toBe(true);
 for(const key of ['prices','pricing','preview'])await expect(p.locator('#content [data-tab="'+key+'"]')).toHaveCount(0);
 // Multi-role pricing staff and admins retain commercial navigation.
 await p.evaluate(()=>{Team.permissions.sections.push('materials');tab='prices';render();});await expect(p.locator('#content [data-tab=prices]')).toHaveCount(1);
 await p.evaluate(()=>{Team.permissions.sections=['bom','operations'];Team.permissions.users=true;tab='preview';render();});await expect(p.locator('#content [data-tab=preview]')).toHaveCount(1);
 console.log('PASS technical workspace hides three commercial stages, blocks restored navigation, preserves pricing/admin access');
 }finally{await browser.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
