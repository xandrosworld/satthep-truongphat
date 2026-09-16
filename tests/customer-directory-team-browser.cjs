 'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs'),fs=require('node:fs');
(async()=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+app.server.address().port,browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage(),errors=[],checks=[],dir='artifacts/railway-team/customers';fs.mkdirSync(dir,{recursive:true});
 const pass=s=>{checks.push(s);console.log('PASS '+s);},submit=async page=>{await page.locator('#dialog button[type=submit]').click();await expect(page.locator('#dialog')).not.toBeVisible();};
 async function init(page){page.on('pageerror',e=>errors.push(e.message));await page.route('**/api/status',async route=>{const r=await route.fetch();await route.fulfill({response:r,json:{...await r.json(),requireLogin:true}});});await page.goto(origin);await expect(page.locator('#team-entry')).toBeVisible();}
 try{
  await init(p);await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin QA',password:'Customer-directory-QA-42!'}));render();});
  expect(await p.evaluate(()=>Team.loaded)).toBe(false);await p.locator('[data-page=customers]').click();await expect(p.locator('[data-intake=customer]').first()).toBeVisible();
  await p.locator('[data-intake=customer]').first().click();await p.locator('[name=name]').fill('Khách hàng dùng chung QA');await p.locator('[name=phone]').fill('0901234567');await submit(p);
  const customers=await p.evaluate(()=>teamApi('intake/customers'));expect(customers).toHaveLength(1);const cid=customers[0].id;expect(customers[0].name).toBe('Khách hàng dùng chung QA');expect(await p.evaluate(()=>Team.loaded)).toBe(false);expect(await p.evaluate(()=>db.customers?.some(c=>c.name==='Khách hàng dùng chung QA'))).toBe(false);
  await p.reload();await expect.poll(()=>p.evaluate(()=>Team.user?.username)).toBe('admin');await p.locator('[data-page=customers]').click();await expect(p.locator('#content')).toContainText('Khách hàng dùng chung QA');pass('Admin thêm khách hàng ngay sau đăng nhập, chưa mở báo giá; dữ liệu lưu máy chủ và còn sau F5');
  await p.locator('[data-intake=start]').click();await expect(p.locator('[name=customer]')).toHaveValue('Khách hàng dùng chung QA');await p.locator('[name=code]').fill('BG-CUSTOMER-QA');await p.locator('[name=project]').fill('Kiểm tra liên kết khách hàng');await submit(p);
  const quote=await p.evaluate(()=>({id:Team.link.id,customer:db.quote.customerInfo}));expect(quote.customer.id).toBe(cid);expect(quote.customer.phone).toBe('0901234567');
  await p.evaluate(async id=>{await teamLoad(id,1);},quote.id);await p.locator('[data-page=customers]').click();await p.locator('[data-intake=customer][data-id="'+cid+'"]').click();await p.locator('[name=phone]').fill('0907654321');await submit(p);
  const after=await p.evaluate(async id=>({quote:(await teamApi('quotes/'+id)).document.quote,customers:await teamApi('intake/customers'),dirty:Team.dirty}),quote.id);expect(after.customers[0].phone).toBe('0907654321');expect(after.quote.customerInfo.phone).toBe('0901234567');expect(after.dirty).toBe(false);pass('Lập báo giá từ danh bạ liên kết đúng khách; sửa danh bạ khi xem phiên bản cũ không sửa snapshot báo giá');
  await p.evaluate(async()=>{for(const [username,sections]of [['customerstaff',['customer']],['materialstaff',['materials']]])await teamApi('users','POST',{username,name:username,role:'estimator',password:'Customer-directory-QA-42!',sections});});
  for(const [username,allowed]of [['customerstaff',true],['materialstaff',false]]){
   const page=await browser.newPage();await init(page);await page.evaluate(async username=>{teamSession(await teamApi('login','POST',{username,password:'Customer-directory-QA-42!'}));render();},username);await page.locator('[data-page=customers]').click();await expect(page.locator('#content')).toContainText('Khách hàng dùng chung QA');await expect(page.locator('[data-intake=customer]').first()).toHaveCount(allowed?1:0);await expect(page.locator('[data-intake=start]')).toHaveCount(0);
   if(allowed){await page.locator('[data-intake=customer][data-id="'+cid+'"]').click();await page.locator('[name=contact]').fill('Nhân viên cập nhật');await submit(page);}else{const status=await page.evaluate(async()=>{try{await teamApi('intake/customers','POST',{customer:{name:'Không được ghi'},expectedVersion:0});return 200;}catch(e){return e.status;}});expect(status).toBe(403);}
   await page.close();
  }
  pass('Nhân viên có quyền khách hàng sửa được; nhân viên không được cấp quyền chỉ xem và API từ chối ghi');
  await p.screenshot({path:dir+'/directory.png',fullPage:true});expect(errors).toEqual([]);fs.writeFileSync(dir+'/results.json',JSON.stringify({passed:true,checks,errors},null,2));
 }catch(e){console.error(e);await p.screenshot({path:dir+'/failure.png'});process.exitCode=1;}finally{await browser.close();await new Promise(r=>app.server.close(r));}
})();
