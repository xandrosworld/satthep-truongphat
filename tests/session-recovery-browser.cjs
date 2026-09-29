const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage();
try{
 await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 await p.evaluate(async hidden=>{
 const password='Session-recovery-2026!';
 teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password}));
 const seed=TPPrice.demoSeed();seed.quote.pricing.management=3;const q=await teamApi('quotes','POST',{document:seed});
 for(const username of ['staff','other'])await teamApi('users','POST',{username,name:username,password,role:'estimator',canViewCosts:true,canEditFactors:false,canFormulaView:false,sectionModes:Object.fromEntries(TPSectionAccess.keys.map(k=>[k,['materials','commercial','manage'].includes(k)?'configure':k==='factors'&&hidden?'use':k==='logistics'?'none':'view']))});
 teamSession(await teamApi('login','POST',{username:'staff',password}));await teamLoad(q.id);page='quote';tab='prices';Intake.priceTab='factors';render();
 },process.env.HIDDEN_FACTORS==='1');
 await expect(p.locator('[data-factor-permission-notice]')).toBeVisible();
 if(process.env.HIDDEN_FACTORS!=='1')await expect(p.locator('#intake-policy [type=submit]')).toBeDisabled();
 await p.locator('[data-factor-refresh-rights]').click();if(process.env.HIDDEN_FACTORS!=='1')await expect(p.locator('#intake-policy [type=submit]')).toBeDisabled();
 const asyncResult=await p.evaluate(async()=>{
  const old=Team.csrf;await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'staff',password:'Session-recovery-2026!'})});
  await teamApi('access/calculate','POST',{document:teamDocument()});return old!==Team.csrf;
 });expect(asyncResult).toBe(true);
 const syncResult=await p.evaluate(async()=>{
  const old=Team.csrf;await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'staff',password:'Session-recovery-2026!'})});
  db.quote.notes='Calculate refreshed draft';const hasRef=JSON.stringify(db).includes('__accessRef');C.calculate(db);return {changed:old!==Team.csrf,hasRef};
 });expect(syncResult).toEqual({changed:true,hasRef:true});
 // A revoked/granted account signs in again in another tab. Refresh rights
 // without replacing the loaded quote or its unsaved local fields.
 const userId=await p.evaluate(()=>Team.user.id),url='http://127.0.0.1:'+app.server.address().port;
 const login=await fetch(url+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'admin',password:'Session-recovery-2026!'})});
 const admin=await login.json(),cookie=login.headers.get('set-cookie').split(';')[0];
 const grant=await fetch(url+'/api/users/'+userId+'/access',{method:'POST',headers:{'Content-Type':'application/json','Cookie':cookie,'X-CSRF-Token':admin.csrf},body:JSON.stringify({role:'estimator',canViewCosts:true,canEditFactors:true,sectionModes:Object.fromEntries(require('../section-access.js').keys.map(k=>[k,['materials','commercial','manage','factors'].includes(k)?'configure':k==='logistics'?'none':'view']))})});
 expect(grant.status).toBe(200);
 await p.evaluate(async()=>{db.quote.notes='Draft must survive permission refresh';Team.dirty=true;});
 await p.locator('[data-factor-refresh-rights]').click();await expect(p.locator('#dialog')).toContainText('Đăng nhập lại');await p.locator('#dialog [name=password]').fill('Session-recovery-2026!');await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#intake-policy [type=submit]')).toBeEnabled();expect(await p.locator('#intake-policy [name=management]').inputValue()).toBe('3');
 expect(await p.evaluate(()=>db.quote.notes)).toBe('Draft must survive permission refresh');
 await p.locator('#intake-policy [name=management]').fill('7');
 await p.locator('#intake-policy [type=submit]').click();
 await p.evaluate(()=>teamSave());
 await p.evaluate(()=>teamLoad(teamCurrent().id));
 expect(await p.evaluate(()=>db.quote.pricing.management)).toBe(7);
 expect(await p.evaluate(()=>db.quote.notes)).toBe('Draft must survive permission refresh');
 let retries=0;
 await p.route('**/api/session-retry-test',route=>{retries++;return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'Phiên yêu cầu không hợp lệ'})});});
 await p.evaluate(async()=>{try{await teamApi('session-retry-test','POST',{});}catch(e){if(e.status!==403)throw e;}});expect(retries).toBe(2);
 let denied=0;
 await p.route('**/api/permission-retry-test',route=>{denied++;return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({error:'Không được sửa hệ số'})});});
 await p.evaluate(async()=>{try{await teamApi('permission-retry-test','POST',{});}catch(e){if(e.status!==403)throw e;}});expect(denied).toBe(1);
 const cross=await p.evaluate(async()=>{
  const actor=Team.user.id;await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'other',password:'Session-recovery-2026!'})});
  try{await teamApi('access/calculate','POST',{document:teamDocument()});return 'unexpected';}catch(e){return {error:e.message,same:Team.user.id===actor};}
 });expect(cross.error).toContain('đã đổi');expect(cross.same).toBe(true);
 console.log('PASS same-account async/sync CSRF recovery, cross-account rejection, read-only factors, admin grant, inline reauthentication, factor save/reload and draft preservation');
}catch(e){console.log(await p.evaluate(()=>({dialog:document.querySelector('#dialog')?.textContent,tab,priceTab:Intake.priceTab,dirty:Team.dirty,feedback:Team.saveFeedback?.message})));throw e;}finally{await browser.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});

