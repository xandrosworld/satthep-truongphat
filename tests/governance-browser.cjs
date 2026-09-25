'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+app.server.address().port);await page.waitForFunction(()=>Team.available);
  await page.evaluate(async()=>{
   const password='Governance-browser-2026!';teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password}));
   const base={permissionModel:'matrix',sectionModes:Object.fromEntries(TPSectionAccess.keys.map(k=>[k,'none']))};
   const r=await teamApi('roles','POST',{...base,name:'Delegated manager',actionAccess:{accounts:['view','create','edit','activate','assign'],roles:['view','create','edit'],organization:['view','edit'],audit:['view'],formulaLocks:['view']}});
   await teamApi('users','POST',{username:'delegate',name:'Delegate',password,roleTemplateIds:[r.id],followRoleTemplates:true});
   await arRoles();
  });
  await page.locator('[data-ar=new-role]').click();
  await expect(page.locator('[data-action-scope=accounts][data-action-grant=assign]')).toBeVisible();
  await expect(page.locator('#dialog')).toContainText('Khóa / mở tài khoản');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'artifacts/governance-matrix-mobile.png'});
  await page.evaluate(async()=>{closeDialog();await teamApi('logout','POST',{});teamSession(await teamApi('login','POST',{username:'delegate',password:'Governance-browser-2026!'}));render();});
  await page.setViewportSize({width:1440,height:1000});
  await expect(page.locator('[data-governance-open]')).toBeVisible();await page.locator('[data-governance-open]').click();
  await expect(page.locator('[data-gov=backup]')).toHaveCount(0);await page.locator('[data-gov=accounts]').click();
  await expect(page.locator('[data-access=new-user]')).toBeVisible();
  await expect(page.locator('tr').filter({has:page.locator('td', {hasText:/^admin$/})}).locator('button')).toHaveCount(0);
  await page.locator('[data-access=new-user]').click();await page.locator('[name=username]').fill('blankuser');await page.locator('[name=name]').fill('Blank user');await page.locator('[name=password]').fill('Blank-user-browser-2026!');await page.locator('#dialog button[type=submit]').click();
  await expect(page.locator('#dialog')).toContainText('blankuser');
  await page.evaluate(()=>{closeDialog();governancePanel();});await page.locator('[data-gov=organization]').click();
  await page.locator('[data-org=edit]').first().click();await page.locator('[name=name]').fill('Delegated department');await page.locator('#dialog button[type=submit]').click();
  await expect(page.locator('#dialog')).toContainText('Delegated department');await page.locator('[data-gov-placement]').click();await expect(page.locator('#dialog')).toContainText('Blank user');
  await page.evaluate(()=>{closeDialog();governancePanel();});await page.locator('[data-gov=audit]').click();await expect(page.locator('[data-review=matrix-export]')).toBeHidden();await page.locator('[data-review=audit]').click();await expect(page.locator('[data-review=audit-export]')).toBeHidden();
  await page.evaluate(()=>{closeDialog();governancePanel();});await page.locator('[data-gov=formulaLocks]').click();await expect(page.locator('[data-formula-lock]')).toHaveCount(0);
  await page.evaluate(()=>{closeDialog();governancePanel();});await page.locator('[data-gov=roles]').click();await page.locator('[data-ar=new-role]').click();await page.locator('[name=name]').fill('Blank role');await page.locator('#dialog button[type=submit]').click();await expect(page.locator('#dialog')).toContainText('Blank role');
  expect(errors).toEqual([]);console.log('PASS delegated account creation, protected admin/self, department editing, placement access, read-only audit/locks, role editor and mobile matrix');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
