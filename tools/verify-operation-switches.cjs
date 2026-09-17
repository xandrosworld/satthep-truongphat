'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{pathToFileURL}=require('url'),{chromium,expect}=require('@playwright/test');
(async()=>{
 const live=process.argv.includes('--live'),dir=path.resolve('artifacts/customer-review/operation-switches/'+(live?'live':'local'));fs.mkdirSync(dir,{recursive:true});
 const c=live?JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')):null,url=c?.url||pathToFileURL(path.resolve('dist/index.html')).href;
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex'),localHash=hash(fs.readFileSync('dist/index.html','utf8'));
 if(live)expect(hash(await fetch(url).then(r=>r.text()))).toBe(localHash);
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1680,height:1100}}),errors=[],writes=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(12000);
 if(live)await p.route('**/api/**',route=>{const r=route.request();if(['GET','HEAD'].includes(r.method())||new URL(r.url()).pathname==='/api/login')return route.continue();writes.push(r.method()+' '+new URL(r.url()).pathname);return route.abort();});
 const pass=t=>{checks.push(t);console.log('PASS '+t);},submit=async()=>{await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();},open=async(catalog=true)=>{await p.evaluate(catalog=>workRateEdit('paint',catalog),catalog);await expect(p.locator('#dialog')).toBeVisible();};
 try{
 await p.goto(url);let before;
 if(live){await p.waitForFunction(()=>typeof Team!=='undefined'&&Team.available);await p.evaluate(async c=>{teamSession(await teamApi('login','POST',c));render();},c);before=await p.evaluate(async()=>await teamApi('catalog'));await p.locator('[data-team=catalog-workspace]').click();await p.waitForFunction(()=>Team.loaded);}
 else await p.evaluate(()=>{db=TPPrice.demoSeed();persist();render();});
 await p.locator('[data-page=rules]').first().click();
 expect(await p.locator('[data-rc-tab]').evaluateAll(els=>els.map(e=>e.dataset.rcTab))).toEqual(['productGroups','materialGroups','substances','shapes','operations','factors','parameters','stocks','units','symbols']);
 await p.screenshot({path:path.join(dir,'01-thu-tu-danh-muc.png'),fullPage:true});pass('Thứ tự 9 danh mục đúng ảnh; Bảng ký hiệu ở cuối.');
 await open();await expect(p.locator('[name=factorsEnabled]')).toBeVisible();await expect(p.locator('[name=consumptionsEnabled]')).toBeVisible();
 const declared=await p.locator('#work-recipes').evaluate(e=>e.textContent),factorDeclaration=await p.locator('[data-factor-catalog-readonly]').textContent();
 await p.locator('[name=factorsEnabled]').uncheck();await p.locator('[name=consumptionsEnabled]').uncheck();
 await expect(p.locator('[data-rate-feature=factorsEnabled]')).toHaveAttribute('data-applied','false');
 await expect(p.locator('#work-recipes')).toHaveText(declared);await expect(p.locator('[data-factor-catalog-readonly]')).toHaveText(factorDeclaration);
 await p.locator('[name=factorsEnabled]').scrollIntoViewIfNeeded();await p.locator('#dialog').screenshot({path:path.join(dir,'02-bo-tich-giu-khai-bao.png')});
 if(!live){
 const quoteBefore=await p.evaluate(()=>JSON.stringify(db.quote));await submit();expect(await p.evaluate(()=>JSON.stringify(db.quote))).toBe(quoteBefore);
 await p.reload();await open();await expect(p.locator('[name=factorsEnabled]')).not.toBeChecked();await expect(p.locator('[name=consumptionsEnabled]')).not.toBeChecked();await expect(p.locator('#work-recipes')).toHaveText(declared);
 await p.locator('[name=factorsEnabled]').check();await p.locator('[name=consumptionsEnabled]').check();await submit();pass('Lưu danh mục, tải lại trang giữ trạng thái và định mức; báo giá đã lưu không tự đổi.');
 const priceBefore=await p.evaluate(()=>C.calculate(db).total.grand);
 await open(false);await p.locator('[name=factorsEnabled]').uncheck();await p.locator('[name=consumptionsEnabled]').uncheck();await submit();
 const after=await p.evaluate(()=>{const r=db.quote.ratesSnapshot.find(r=>r.id==='paint');return {price:TPWork.price(r,{mode:'inside',pricingMethod:'factors'},{},TPPrice.tier).value,base:r.inside,recipes:TPWork.recipes(r).length,declared:TPWork.declaredRecipes(r).length,total:C.calculate(db).total.grand};});
 expect(after.price).toBe(after.base);expect(after.recipes).toBe(0);expect(after.declared).toBeGreaterThan(0);expect(after.total).toBeLessThan(priceBefore);
 await p.reload();await open(false);await expect(p.locator('[name=factorsEnabled]')).not.toBeChecked();await expect(p.locator('[name=consumptionsEnabled]')).not.toBeChecked();await p.locator('[name=factorsEnabled]').check();await p.locator('[name=consumptionsEnabled]').check();await submit();expect(await p.evaluate(()=>C.calculate(db).total.grand)).toBe(priceBefore);
 pass('Báo giá: tắt bỏ tiền hệ số và vật tư định mức, bật lại khôi phục đúng tổng tiền ban đầu.');
 await open();await p.evaluate(()=>{Team.user={id:'qa'};Team.permissions={factors:false};poToggle();});await expect(p.locator('[name=factorsEnabled]')).toBeDisabled();await p.evaluate(()=>{Team.user=null;Team.permissions={};closeDialog();});pass('Tài khoản thiếu quyền hệ số không được bật/tắt hệ số.');
 }else{await p.evaluate(()=>closeDialog());expect(await p.evaluate(async()=>await teamApi('catalog'))).toEqual(before);pass('Railway: hai ô tích hoạt động, bỏ tích vẫn giữ khai báo trong form; không lưu thay đổi dữ liệu khách.');}
 expect(errors).toEqual([]);expect(writes).toEqual([]);
 fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify({passed:true,url,at:new Date().toISOString(),buildHash:localHash,checks,businessWrites:live?0:'Local test only',errors},null,2));
 fs.writeFileSync(path.join(dir,'index.html'),'<!doctype html><meta charset="utf-8"><title>Kiểm chứng bật/tắt nguyên công</title><style>body{font:17px system-ui;max-width:1200px;margin:40px auto}img{max-width:100%;border:1px solid #ccc}li{margin:12px}</style><h1>Kiểm chứng bật/tắt nguyên công</h1><p>'+url+'</p><p>'+new Date().toISOString()+'</p><ul>'+checks.map(t=>'<li>'+t+'</li>').join('')+'</ul><p>'+(live?'Ảnh chụp trên Railway; ô tích được thử trong form chưa lưu, không sửa danh mục của khách.':'Kiểm thử cục bộ có lưu và tải lại dữ liệu.')+'</p><h2>Thứ tự danh mục</h2><img src="01-thu-tu-danh-muc.png"><h2>Bỏ tích nhưng giữ khai báo</h2><img src="02-bo-tich-giu-khai-bao.png">');
 }catch(e){await p.screenshot({path:path.join(dir,'failure.png'),fullPage:true}).catch(()=>{});console.error(errors);throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
