const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage();try{
 await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 await p.evaluate(async()=>{const password='Resume-workspace-2026!';teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password}));const q=await teamApi('quotes','POST',{document:TPPrice.demoSeed()});await teamApi('users','POST',{username:'phu-test',name:'Phu QA',password,role:'technical',sections:['bom','operations']});teamSession(await teamApi('login','POST',{username:'phu-test',password}));await teamLoad(q.id);page='quote';tab='bom';mutation(()=>db.quote.products[0].qty+=1);render();openDialog('Đang khai kỹ thuật',field('Ghi chú chưa áp dụng','draftNote',''),'Áp dụng',()=>{});});
 await p.locator('#dialog [name=draftNote]').fill('Nội dung chưa bấm áp dụng');
 const baseline=await p.evaluate(()=>({quote:JSON.stringify(db.quote),generation:Team.sessionGeneration,link:teamCurrent().id,tab}));
 // Network failure must not be mistaken for an expired authenticated session.
 await p.route('**/api/expiry-network-test',r=>r.abort());
 await p.evaluate(async()=>{try{await teamApi('expiry-network-test');}catch{}});
 await expect(p.locator('#team-session-resume')).toHaveCount(0);
 // A stale 401 from a background request is recovered if /me is still valid.
 let count=0;await p.route('**/api/expiry-late-test',r=>r.fulfill({status:++count===1?401:200,contentType:'application/json',body:count===1?'{}':'{"ok":true}'}));
 expect(await p.evaluate(async()=>await teamApi('expiry-late-test'))).toEqual({ok:true});expect(count).toBe(2);
 // Expire the actual server session while a form and unsaved quote are open.
 app.sql.prepare('UPDATE sessions SET expires=0 WHERE user_id=(SELECT id FROM users WHERE username=?)').run('phu-test');
 await p.evaluate(async()=>{await Promise.all([1,2,3].map(async()=>{try{await teamApi('notifications');}catch{}}));});
 await expect(p.locator('#team-session-resume')).toHaveCount(1);await expect(p.locator('#team-session-resume')).toBeVisible();
 expect(await p.evaluate(()=>({quote:JSON.stringify(db.quote),generation:Team.sessionGeneration,link:teamCurrent().id,tab}))).toEqual(baseline);
 await p.locator('#team-session-resume [name=password]').fill('Wrong-password');await p.locator('#team-session-resume [type=submit]').click();await expect(p.locator('[data-resume-error]')).toBeVisible();
 await p.locator('#team-session-resume [name=password]').fill('Resume-workspace-2026!');await p.locator('#team-session-resume [type=submit]').click();await expect(p.locator('#team-session-resume')).toHaveCount(0);
 await expect(p.locator('#dialog [name=draftNote]')).toHaveValue('Nội dung chưa bấm áp dụng');
 expect(await p.evaluate(()=>Team.sessionGeneration)).toBe(baseline.generation);
 await p.evaluate(async()=>{closeDialog();await teamSave();await teamLoad(teamCurrent().id);});expect(await p.evaluate(()=>db.quote.products[0].qty)).toBe(JSON.parse(baseline.quote).products[0].qty);
 // Revocation is real: reauth must not restore revoked edit rights on the server.
 app.sql.prepare('UPDATE users SET section_access=? WHERE username=?').run('[]','phu-test');app.sql.prepare('DELETE FROM sessions WHERE user_id=(SELECT id FROM users WHERE username=?)').run('phu-test');
 await p.evaluate(async()=>{try{await teamApi('notifications');}catch{}});await p.locator('#team-session-resume [name=password]').fill('Resume-workspace-2026!');await p.locator('#team-session-resume [type=submit]').click();await expect(p.locator('#team-session-resume')).toHaveCount(0);
 const denied=await p.evaluate(async()=>{db.quote.products[0].qty+=1;try{await teamSave();return false;}catch{return true;}});expect(denied).toBe(true);
 console.log('PASS network/late-401, concurrent expiry, same-tab reauth, open form and quote preserved, save/reload, revoked rights enforced');
}finally{await browser.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
