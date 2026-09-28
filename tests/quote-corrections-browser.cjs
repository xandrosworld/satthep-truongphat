'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Corrections-browser-2026!'}));const d=TPPrice.demoSeed();d.quote.remnantMode='all';const q=await teamApi('quotes','POST',{document:d});await teamApi('quotes/'+q.id+'/submit','POST',{expectedVersion:q.version});await teamApi('quotes/'+q.id+'/approve','POST',{expectedVersion:2,acknowledgeBelowCost:true,reason:'Approved fixture'});await teamLoad(q.id);});
 await expect(p.locator('[data-corrections-open]')).toHaveText('Sửa lại');

 await p.locator('[data-corrections-open]').click();await expect(p.locator('[data-correction-empty]')).toBeVisible();await expect(p.locator('#dialog [name=reason]')).toHaveCount(0);await p.locator('[data-correction-extend]').click();await p.locator('[name=sections][value=commercial]').check();await p.locator('[name=reason]').fill('Bổ sung điều kiện giao hàng');await p.locator('#dialog button[type=submit]').click();
 await expect(p.locator('#dialog')).toContainText('Đang sửa');await expect(p.locator('[data-correction-scope]')).toContainText('Bổ sung điều kiện giao hàng');
 await p.locator('#dialog [data-correction-goto=commercial]').click();await expect(p.locator('#dialog')).not.toBeVisible();
 expect(await p.evaluate(()=>{try{mutation(()=>db.quote.project='outside scope');return false;}catch(e){return e.message.includes('Ngoài vùng');}})).toBe(true);
 await p.evaluate(async()=>{mutation(()=>db.quote.notes='Điều kiện bổ sung');await teamSave();});await expect(p.locator('[data-correction-scope]')).toBeVisible();
 await p.setViewportSize({width:390,height:844});await p.locator('[data-corrections-open]').click();expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await p.screenshot({path:'artifacts/corrections-mobile.png'});
 await p.evaluate(async()=>{
  closeDialog();await teamApi('users','POST',{username:'worker',name:'Worker',role:'estimator',canReopen:false,password:'Corrections-browser-2026!'});
  const d=TPPrice.demoSeed();d.quote.id='BG-CORRECTION-STALE';d.quote.remnantMode='all';const q=await teamApi('quotes','POST',{document:d});await teamApi('quotes/'+q.id+'/submit','POST',{expectedVersion:1});
  teamSession(await teamApi('login','POST',{username:'worker',password:'Corrections-browser-2026!'}));await teamApi('quotes/'+q.id+'/corrections','POST',{action:'request',expectedVersion:2,sections:['commercial'],reason:'Đề nghị trước khi đổi phiên bản'});
  teamSession(await teamApi('login','POST',{username:'admin',password:'Corrections-browser-2026!'}));await teamLoad(q.id);
 });
 await p.locator('[data-corrections-open]').click();await p.locator('[data-correction-review=approve]').click();await p.evaluate(()=>teamApi('quotes/'+teamCurrent().id+'/approve','POST',{expectedVersion:2,acknowledgeBelowCost:true,reason:'Concurrent approval'}));await p.locator('#dialog button[type=submit]').click();await expect(p.locator('[data-correction-refresh]')).toBeVisible();await p.locator('[data-correction-refresh]').click();await expect(p.locator('#dialog')).toContainText('Đề nghị được lập ở phiên bản 2');await expect(p.locator('#dialog')).toContainText('phiên bản 3');await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).toContainText('Đang sửa');expect(await p.evaluate(()=>teamCurrent().status)).toBe('draft');
 await p.evaluate(()=>quoteCorrectionsDialog(['bom'],'Giữ lý do khi có phiên bản mới'));
 await p.evaluate(async()=>{const q=await teamApi('quotes/'+teamCurrent().id);q.document.quote.notes+=' concurrent edit';await teamApi('quotes/'+q.id,'PUT',{expectedVersion:q.version,document:q.document});});
 await p.locator('#dialog button[type=submit]').click();await expect(p.locator('[data-correction-refresh]')).toBeVisible();await p.locator('[data-correction-refresh]').click();await expect(p.locator('#dialog [name=reason]')).toHaveValue('Giữ lý do khi có phiên bản mới');await expect(p.locator('#dialog [name=sections][value=bom]')).toBeChecked();
 expect(errors).toEqual([]);console.log('PASS correction UI: concurrent review recovery, request reason/scope preservation, save and mobile');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
