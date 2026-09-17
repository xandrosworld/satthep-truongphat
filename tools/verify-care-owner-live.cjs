'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),{chromium,expect}=require('@playwright/test');
(async()=>{
 const c=JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,''));
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex');
 const buildHash=hash(fs.readFileSync('dist/index.html','utf8'));expect(hash(await fetch(c.url).then(r=>r.text()))).toBe(buildHash);
 const dir='artifacts/customer-review/care-owner/live';fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1600,height:1200}}),writes=[],errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/api/**',async route=>{const req=route.request();if(!['GET','HEAD'].includes(req.method())&&new URL(req.url()).pathname!=='/api/login'){writes.push(req.url());await route.abort();}else await route.continue();});
 try{
  await p.goto(c.url);await p.evaluate(async c=>{teamSession(await teamApi('login','POST',{username:c.username,password:c.password}));render();},c);
  await p.locator('[data-page=customers]').click();await expect.poll(()=>p.evaluate(()=>Intake.remoteLoaded)).toBe(true);await p.evaluate(()=>crmLoad());
  const before=await p.evaluate(()=>teamApi('intake/customers'));
  await p.locator('[data-intake=customer]').first().click();const owner=p.locator('#dialog [name=ownerId]');await expect(owner).toBeEnabled();
  const users=await p.evaluate(()=>Crm.owners.filter(u=>u.active!==0));expect(await owner.locator('option').count()).toBe(users.length);await expect(owner).toHaveValue(await p.evaluate(()=>Team.user.id));
  const currentUser=await p.evaluate(()=>Team.user.id);await owner.selectOption(users.find(u=>u.id!==currentUser)?.id||currentUser);
  await p.locator('#dialog').screenshot({path:dir+'/01-chon-nhan-vien-cham-soc.png'});await p.evaluate(()=>closeDialog());
  const id=await p.evaluate(()=>Intake.customers[0]?.id);
  if(id){await p.evaluate(id=>inEditCustomer(id),id);await expect(owner).toBeDisabled();await expect(owner).toHaveValue(await p.evaluate(id=>Intake.customers.find(c=>c.id===id).ownerId||'',id));await expect(p.locator('#dialog')).toContainText('Điều chuyển');await p.locator('#dialog').screenshot({path:dir+'/02-nguoi-phu-trach-khach-cu.png'});await p.evaluate(()=>closeDialog());}
  expect(await p.evaluate(()=>teamApi('intake/customers'))).toEqual(before);expect(writes).toEqual([]);expect(errors).toEqual([]);
  fs.writeFileSync(dir+'/verification.json',JSON.stringify({passed:true,url:c.url,at:new Date().toISOString(),buildHash,activeOwners:users.length,checkedExisting:!!id,writes,errors},null,2));
  fs.writeFileSync(dir+'/index.html','<!doctype html><meta charset="utf-8"><title>Nhân viên chăm sóc khách hàng</title><style>body{font:16px system-ui;max-width:1100px;margin:32px auto}img{max-width:100%;border:1px solid #ddd}h2{margin-top:40px}</style><h1>Nhân viên chăm sóc khách hàng</h1><p>Kiểm tra trực tiếp Railway. Chỉ mở form và chọn thử, không lưu thay đổi dữ liệu khách hàng.</p><h2>Thêm khách: chọn nhân viên chăm sóc</h2><img src="01-chon-nhan-vien-cham-soc.png">'+(id?'<h2>Khách cũ: hiển thị người phụ trách, điều chuyển có lịch sử</h2><img src="02-nguoi-phu-trach-khach-cu.png">':''));
  console.log('PASS Railway matching build; active care owner selector; existing owner preserved; no business writes');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
