'use strict';
// Read-only production check: login, GETs and unsaved editor previews only.
const fs=require('node:fs'),crypto=require('node:crypto'),{chromium,expect}=require('@playwright/test');
(async()=>{
 const c=JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,''));
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex');
 const expected=hash(fs.readFileSync(process.argv[2]||'dist/index.html','utf8'));
 expect(hash(await fetch(c.url).then(r=>r.text()))).toBe(expected);
 const dir='artifacts/customer-review/catalog-finish-20260919/live';fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1500,height:1050}}),errors=[],writes=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/api/**',route=>{const r=route.request();if(['GET','HEAD'].includes(r.method())||new URL(r.url()).pathname==='/api/login')return route.continue();writes.push(new URL(r.url()).pathname);return route.abort();});
 try{
  await p.goto(c.url);await p.waitForFunction(()=>Team.available);
  await p.evaluate(async c=>{teamSession(await teamApi('login','POST',c));render();},c);
  const before=await p.evaluate(async()=>JSON.stringify([await teamApi('catalog'),await teamApi('quotes')]));
  await p.locator('[data-page=rules]').click();await p.waitForFunction(()=>Team.loaded&&page==='rules');await p.locator('[data-rc-tab=operations]').click();
  await expect(p.locator('#content')).toContainText('Máy sử dụng');await expect(p.locator('#content')).not.toContainText('Cách giá đã khai');
  const first=p.locator('[data-technical-rate]').first(),id=await first.getAttribute('data-technical-rate');await first.click();
  await expect(p.locator('[name=machine]')).toBeVisible();await expect(p.locator('[name=inside],#review-price-options,[data-operation-package]')).toHaveCount(0);
  await p.screenshot({path:dir+'/01-cong-doan.png'});await p.evaluate(()=>closeDialog());
  await p.locator('[data-rc-tab=shapes]').click();await p.locator('[data-definition=shape-new]').click();
  await expect(p.locator('[name=blankShapeName]')).toBeVisible();await p.locator('[name=name]').fill('Quy ước kiểm tra — không lưu');await p.locator('[name=blankShapeName]').fill('Phôi kiểm tra — không lưu');await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');
  await p.screenshot({path:dir+'/02-them-hinh-dang.png'});await p.evaluate(()=>closeDialog());
  await p.locator('[data-page=rates]').click();await p.waitForFunction(()=>page==='rates');await p.evaluate(id=>workRateEdit(id,true),id);
  await expect(p.locator('[name=inside]')).toBeVisible();await expect(p.locator('[name=outside]')).toBeVisible();await p.evaluate(()=>closeDialog());
  expect(await p.evaluate(async()=>JSON.stringify([await teamApi('catalog'),await teamApi('quotes')]))).toBe(before);
  expect(errors).toEqual([]);expect(writes).toEqual([]);
  fs.writeFileSync(dir+'/results.json',JSON.stringify({passed:true,buildHash:expected,errors,writes,checks:['Technical editor has machine and no price controls','Custom blank name and valid formula preview','Input-price editor retains both prices','Catalog and quotation summaries unchanged'],at:new Date().toISOString()},null,2));
  console.log('PASS Railway: correct build; technical editor, custom blank shape and input prices; no business writes');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
