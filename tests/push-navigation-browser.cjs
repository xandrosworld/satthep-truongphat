const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp({pushInterval:0});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 await p.evaluate(async()=>{await pushOpen('chat');if(pushPending!=='chat')throw Error('Lost pending notification');teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Push-navigation-2026!'}));});
 await expect(p.locator('#team-chat')).toBeVisible();expect(await p.evaluate(()=>pushPending)).toBe(null);
 await p.evaluate(()=>{pushActive=true;chatAlertsPaint();});await expect(p.locator('[data-push-test]')).toBeVisible();
 await p.evaluate(()=>{pushActive=false;chatAlertsPaint();});await expect(p.locator('[data-push-test]')).toBeHidden();
 await p.locator('[data-chat-action=close]').click();await p.evaluate(async()=>{await pushOpen('work');});await expect(p.locator('#dialog')).toContainText('Thông báo công việc');
 await p.evaluate(()=>{pushActive=true;chatAlertsPaint();});await expect(p.locator('#dialog [data-push-test]')).toBeVisible();
 expect(await p.locator('#dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1)).toBe(true);expect(errors).toEqual([]);console.log('PASS mobile pending notification after login, chat/work destinations and self-test button state');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
