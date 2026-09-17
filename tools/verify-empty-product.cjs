'use strict';
const fs=require('fs'),crypto=require('crypto'),{chromium,expect}=require('@playwright/test');
(async()=>{
 const live=process.argv.includes('--live'),dir='artifacts/customer-review/empty-product/'+(live?'live':'local');fs.mkdirSync(dir,{recursive:true});
 const app=live?null:require('../server/app.cjs').createApp();if(app)await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const c=live?JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')):{url:'http://127.0.0.1:'+app.server.address().port,username:'admin',name:'Admin QA',password:'Local-empty-product-tests-42!'};
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex');expect(hash(await fetch(c.url).then(r=>r.text()))).toBe(hash(fs.readFileSync('dist/index.html','utf8')));
 const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1500,height:1050}}),errors=[],writes=[],shots=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(12000);
 const shot=async name=>{await p.screenshot({path:dir+'/'+name+'.png'});shots.push(name);};
 if(live)await p.route('**/api/**',route=>{const r=route.request();if(['GET','HEAD'].includes(r.method())||new URL(r.url()).pathname==='/api/login')return route.continue();writes.push(r.method()+' '+new URL(r.url()).pathname);return route.abort();});
 try{
  await p.goto(c.url);await p.waitForFunction(()=>Team.available);await p.evaluate(async({c,live})=>{teamSession(await teamApi(live?'login':'setup','POST',c));render();},{c,live});
  const before=await p.evaluate(async()=>({catalog:await teamApi('catalog'),quotes:await teamApi('quotes')}));
  // Reproduce the reported path: catalogue workspace -> quotation without an open draft.
  await p.evaluate(()=>{page='quote';render();});
  await p.evaluate(async()=>{const record=await teamApi('catalog');db={...db,...record.catalog,quote:{...db.quote,products:[],ratesSnapshot:record.catalog.rates,pricing:record.catalog.pricingDefaults}};Team.loaded=true;Team.link=null;Team.dirty=false;page='quote';tab='bom';render();});
  for(const button of [0,1]){
   await p.locator('[data-action=add-product]').nth(button).click();await expect(p.locator('#dialog-title')).toHaveText('Tạo báo giá mới');await expect(p.locator('#dialog')).toContainText('Chưa mở báo giá nhận sản phẩm');if(button===0)await shot('01-tao-nhap-truoc-khi-them');await p.locator('#dialog [data-action=close]').first().click();
  }
  expect(await p.evaluate(()=>db.quote.products.length)).toBe(0);
  if(!live){
   await p.locator('[data-action=add-product]').first().click();await expect(p.locator('#dialog-title')).toHaveText('Tạo báo giá mới');await p.locator('#dialog [name=customer]').fill('QA tạo sản phẩm trống');await p.locator('#dialog button[type=submit]').click();
   await expect(p.locator('#dialog-title')).toHaveText('Thêm sản phẩm vào báo giá');expect(await p.evaluate(()=>teamCurrent().status)).toBe('draft');await p.evaluate(()=>closeDialog());
  }else await p.evaluate(()=>{db.quote.workspaceKey='qa-empty-product';Team.link={workspaceKey:db.quote.workspaceKey,status:'draft',version:0};Team.dirty=false;render();});
  for(const button of [0,1]){
   await p.evaluate(()=>{db.quote.products=[];selected='';UX.product='';UX.query='';UX.onlyErrors=false;render();});
   await p.locator('[data-action=add-product]').nth(button).click();await expect(p.locator('#dialog [name=template]')).toHaveValue('');
   await p.locator('#dialog [name=name]').fill('QA sản phẩm trống '+(button+1));if(button===0)await shot('02-chon-san-pham-trong');
   await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
   const product=await p.evaluate(()=>db.quote.products[0]);expect(product.name).toBe('QA sản phẩm trống '+(button+1));expect(product.children).toEqual([]);expect(product.ops).toEqual([]);await expect(p.locator('[data-product-panel]')).toHaveCount(1);
  }
  await p.locator('[data-product-panel]').first().scrollIntoViewIfNeeded();await shot('03-da-them-san-pham-trong');
  if(!live){await p.evaluate(()=>teamSave());const id=await p.evaluate(()=>teamCurrent().id);await p.evaluate(async id=>{await teamLoad(id);page='quote';tab='bom';render();},id);expect(await p.evaluate(()=>db.quote.products[0].name)).toBe('QA sản phẩm trống 2');}
  // A stale product filter must not hide the newly created product.
  await p.evaluate(()=>{UX.product=db.quote.products[0].id;UX.query='no-match';render();});await p.locator('[data-action=add-product]').first().click();await p.locator('#dialog button[type=submit]').click();expect(await p.evaluate(()=>db.quote.products.length)).toBe(2);await expect(p.locator('[data-product-panel]')).toHaveCount(2);
  // Template insertion remains available and independent of blank creation.
  await p.locator('[data-action=add-product]').first().click();const template=await p.evaluate(()=>db.library.find(n=>n.templateKind==='product')?.id);if(template){await p.locator('#dialog [name=template]').selectOption(template);await p.locator('#dialog button[type=submit]').click();expect(await p.evaluate(()=>db.quote.products.at(-1).children.length)).toBeGreaterThan(0);}else await p.evaluate(()=>closeDialog());
  // Locked quote: no misleading success message or changes through add-product/saveAndClose.
  const count=await p.evaluate(()=>{Team.link.status='approved';Team.dirty=false;return db.quote.products.length;});await p.locator('[data-action=add-product]').first().click();await expect(p.locator('#dialog')).not.toBeVisible();await p.evaluate(()=>saveAndClose(()=>db.quote.products.push({id:'must-not-add'}),'Đã thêm sản phẩm'));expect(await p.evaluate(()=>db.quote.products.length)).toBe(count);expect(await p.locator('#toast').innerText()).not.toBe('Đã thêm sản phẩm');
  if(live)expect(await p.evaluate(async()=>({catalog:await teamApi('catalog'),quotes:await teamApi('quotes')}))).toEqual(before);expect(errors).toEqual([]);expect(writes).toEqual([]);
  const checks=['Cả hai nút dẫn đến tạo báo giá khi chưa mở bản nháp; hủy không thêm sản phẩm','Mặc định sản phẩm trống; thêm thành công từ cả hai nút','Sản phẩm mới hiện ra kể cả đang lọc sản phẩm khác','Chọn mẫu vẫn hoạt động','Bản khóa không cho thêm và không báo thành công sai'];
  fs.writeFileSync(dir+'/verification.json',JSON.stringify({passed:true,url:c.url,at:new Date().toISOString(),checks,errors,businessWrites:live?0:undefined,persistence:live?'Save/reload tested on local API; live synthetic browser draft only':'Actual local API save/reload passed'},null,2));
  fs.writeFileSync(dir+'/index.html','<!doctype html><meta charset="utf-8"><title>Tạo sản phẩm trống</title><style>body{font:17px system-ui;margin:30px auto;max-width:1500px}img{width:100%}</style><h1>Kiểm tra tạo sản phẩm trống</h1><p>'+c.url+'</p><p>'+ (live?'Ảnh trên Railway với dữ liệu thử riêng trong trình duyệt; không ghi dữ liệu kinh doanh. Lưu/mở lại kiểm trên API cục bộ.':'Đã kiểm lưu/mở lại bằng API cục bộ.')+'</p><ul>'+checks.map(x=>'<li>'+x+'</li>').join('')+'</ul>'+shots.map(x=>'<h2>'+x+'</h2><img src="'+x+'.png">').join(''));console.log('PASS '+(live?'Railway':'local')+' empty product');
 }catch(e){await p.screenshot({path:dir+'/failure.png',fullPage:true});throw e;}finally{await b.close();if(app)await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
