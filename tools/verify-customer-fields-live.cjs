'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),{chromium,expect}=require('@playwright/test');
(async()=>{
 const c=JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')),hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex'),buildHash=hash(fs.readFileSync('dist/index.html','utf8'));
 expect(hash(await fetch(c.url).then(r=>r.text()))).toBe(buildHash);
 const dir='artifacts/customer-review/customer-fields/live';fs.mkdirSync(dir,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1600,height:1100}}),writes=[],errors=[];
 p.on('pageerror',e=>errors.push(e.message));await p.route('**/api/**',async route=>{const r=route.request();if(!['GET','HEAD'].includes(r.method())&&new URL(r.url()).pathname!=='/api/login'){writes.push(new URL(r.url()).pathname);await route.abort();}else await route.continue();});
 const shot=async name=>p.locator('#dialog').screenshot({path:dir+'/'+name+'.png'});
 try{
  await p.goto(c.url);await p.evaluate(async c=>{teamSession(await teamApi('login','POST',{username:c.username,password:c.password}));render();},c);await p.locator('[data-page=customers]').click();await expect.poll(()=>p.evaluate(()=>Intake.remoteLoaded)).toBe(true);await p.evaluate(()=>crmLoad());
  const before=await p.evaluate(async()=>({policy:await teamApi('intake/policy'),customers:await teamApi('intake/customers')}));
  await p.locator('[data-crm=fields]').click();await expect(p.locator('#dialog [data-cf-visible]')).toHaveCount(57);await expect(p.locator('#dialog [name="required:name"]')).toBeDisabled();
  await shot('01-cai-dat-hien-thi-bat-buoc');
  const phone=p.locator('#dialog [name="visible:phone"]'),required=p.locator('#dialog [name="required:phone"]');await phone.uncheck();await required.check();await expect(phone).toBeChecked();await shot('02-chon-truong-bat-buoc-chua-luu');await p.evaluate(()=>closeDialog());
  await p.locator('[data-intake=customer]').first().click();await expect(p.locator('#dialog')).toBeVisible();await expect(p.locator('#dialog [name=name]')).toHaveAttribute('required','');await expect(p.locator('#dialog [name="account.code"]')).toHaveCount(before.policy.fields?.['account.code']?.visible===false?0:1);await shot('03-form-thong-tin-chung');
  await p.locator('#dialog .crm-field-group').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
  const address=p.locator('#dialog [name="account.billingCountry"]');if(await address.count()){await address.scrollIntoViewIfNeeded();await shot('04-dia-chi-hoa-don-giao-hang');}
  const bank=p.locator('#dialog [name="account.bankAccount"]');if(await bank.count()){await bank.scrollIntoViewIfNeeded();await shot('05-ngan-hang-thanh-toan');}
  await p.evaluate(()=>closeDialog());const after=await p.evaluate(async()=>({policy:await teamApi('intake/policy'),customers:await teamApi('intake/customers')}));expect(after).toEqual(before);expect(writes).toEqual([]);expect(errors).toEqual([]);
  fs.writeFileSync(dir+'/verification.json',JSON.stringify({passed:true,url:c.url,at:new Date().toISOString(),buildHash,templateColumns:52,careFields:5,writes,errors},null,2));
  const pictures=[['01-cai-dat-hien-thi-bat-buoc','Quản trị chọn hiển thị và bắt buộc'],['02-chon-truong-bat-buoc-chua-luu','Chọn thử yêu cầu bắt buộc (chưa lưu)'],['03-form-thong-tin-chung','Form thông tin chung'],['04-dia-chi-hoa-don-giao-hang','Địa chỉ hóa đơn và giao hàng'],['05-ngan-hang-thanh-toan','Ngân hàng và thanh toán']].filter(([f])=>fs.existsSync(dir+'/'+f+'.png'));
  fs.writeFileSync(dir+'/index.html','<!doctype html><meta charset="utf-8"><title>Cài đặt thông tin khách hàng</title><style>body{font:16px system-ui;max-width:1100px;margin:32px auto}img{max-width:100%;border:1px solid #ddd}h2{margin-top:40px}</style><h1>Cài đặt thông tin khách hàng theo Account_Template.xlsx</h1><p>Ảnh chụp trực tiếp Railway. Đã kiểm tra đúng bản build, 52 trường mẫu và 5 trường chăm sóc. Thao tác chọn thử không lưu; cấu hình và dữ liệu thật giữ nguyên. Luồng lưu, kiểm tra bắt buộc và giữ dữ liệu ẩn đã kiểm tra riêng trên máy chủ thử nghiệm.</p>'+pictures.map(([f,title])=>'<h2>'+title+'</h2><img src="'+f+'.png">').join(''));
  console.log('PASS Railway matching build, 57 configurable fields, required implies visible, grouped customer form, unchanged server data');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
