'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Corrections-browser-2026!'}));const d=TPPrice.demoSeed();d.quote.remnantMode='all';const q=await teamApi('quotes','POST',{document:d});await teamApi('quotes/'+q.id+'/submit','POST',{expectedVersion:q.version});await teamLoad(q.id);});
 await expect(p.locator('[data-team=approve]')).toBeVisible();await expect(p.locator('[data-corrections-open]')).toHaveText('Sửa lại');
 expect(await p.locator('[data-team=approve]').evaluate(el=>el.previousElementSibling.hasAttribute('data-corrections-open'))).toBe(true);
 await p.locator('[data-corrections-open]').click();await p.locator('[name=sections][value=commercial]').check();await p.locator('[name=reason]').fill('Bổ sung điều kiện giao hàng');await p.locator('#dialog button[type=submit]').click();
 await expect(p.locator('#dialog')).toContainText('Đang sửa');await expect(p.locator('[data-correction-scope]')).toContainText('Bổ sung điều kiện giao hàng');
 await p.locator('#dialog [data-correction-goto=commercial]').click();await expect(p.locator('#dialog')).not.toBeVisible();
 expect(await p.evaluate(()=>{try{mutation(()=>db.quote.project='outside scope');return false;}catch(e){return e.message.includes('Ngoài vùng');}})).toBe(true);
 await p.evaluate(async()=>{mutation(()=>db.quote.notes='Điều kiện bổ sung');await teamSave();});await expect(p.locator('[data-correction-scope]')).toBeVisible();
 await p.setViewportSize({width:390,height:844});await p.locator('[data-corrections-open]').click();expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await p.screenshot({path:'artifacts/corrections-mobile.png'});
 expect(errors).toEqual([]);console.log('PASS correction UI: adjacent review actions, selected scope, mandatory reason, navigation, save and mobile');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
