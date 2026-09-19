'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),{chromium,expect}=require('@playwright/test');
(async()=>{
 const live=process.argv.includes('--live'),app=live?null:require('../server/app.cjs').createApp();if(app)await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const c=live?JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')):{url:'http://127.0.0.1:'+app.server.address().port,username:'admin',name:'QA',password:'Expense-preview-test-42!'};
 const dir='artifacts/customer-review/expense-preview/'+(live?'live':'local');fs.mkdirSync(dir,{recursive:true});
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex'),expected=hash(fs.readFileSync(process.env.EXPENSE_BUILD||'dist/index.html','utf8'));
 expect(hash(await fetch(c.url).then(r=>r.text()))).toBe(expected);
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1500,height:1050}}),errors=[],writes=[];
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(12000);
 if(live)await p.route('**/api/**',route=>{const r=route.request();if(['GET','HEAD'].includes(r.method())||new URL(r.url()).pathname==='/api/login')return route.continue();writes.push(new URL(r.url()).pathname);return route.abort();});
 const open=async()=>{await p.waitForFunction(()=>Team.user);await p.evaluate(()=>Team.requireLogin=true);await p.locator('[data-page=rates]').click();await p.waitForFunction(()=>Team.loaded&&page==='rates');await p.locator('[data-rate-tab=transport]').click();};
 try{
  await p.goto(c.url);await p.waitForFunction(()=>Team.available);await p.evaluate(async({c,live})=>{teamSession(await teamApi(live?'login':'setup','POST',c));Team.requireLogin=true;render();},{c,live});
  const before=await p.evaluate(async()=>JSON.stringify([await teamApi('catalog'),await teamApi('quotes')]));
  await open();await expect(p.locator('[data-expense-example]')).toHaveCount(15);
  const localBefore=await p.evaluate(()=>JSON.stringify([db.pricingDefaults,db.quote]));
  await p.locator('[data-expense-preview=trial][data-id=MAU-kg_km]').click();await expect(p.locator('#expense-preview-result')).toContainText('3.000.000');
  await p.locator('[name=distance]').fill('50');await expect(p.locator('#expense-preview-result')).toContainText('6.000.000');
  await p.locator('[name=distance]').fill('0');await expect(p.locator('#expense-preview-result')).toHaveAttribute('data-valid','false');await p.locator('[name=distance]').fill('25');
  await p.screenshot({path:dir+'/01-thu-kg-km.png'});await p.evaluate(()=>closeDialog());
  await p.locator('[data-expense-preview=trial][data-id=MAU-vehicle]').click();await expect(p.locator('#expense-preview-result')).toContainText('3 chuyến');await expect(p.locator('#expense-preview-result')).toContainText('1.500.000');await p.evaluate(()=>closeDialog());
  await p.locator('[data-expense-preview=trial][data-id=MAU-toi-thieu]').click();await expect(p.locator('#expense-preview-result')).toContainText('Áp dụng mức tối thiểu');await p.screenshot({path:dir+'/02-phi-toi-thieu.png'});await p.evaluate(()=>closeDialog());
  await p.locator('[data-expense-preview=copy][data-id=MAU-trip]').click();await expect(p.locator('[name=rate]')).toHaveValue('600000');await expect(p.locator('[name=enabled]')).not.toBeChecked();
  if(live)await p.evaluate(()=>closeDialog());
  else{await p.locator('[name=id]').fill('QA-VC');await p.locator('[name=name]').fill('Tuyến kiểm thử');await p.locator('[name=rate]').fill('700000');await p.locator('[name=enabled]').check();await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();await p.evaluate(()=>cdSave());await p.reload();await open();await expect(p.locator('[data-input-price=QA-VC]')).toContainText('700.000');await p.locator('[data-input-price=QA-VC] [data-expense-preview=trial]').click();await expect(p.locator('#expense-preview-result')).toContainText('1.400.000');await p.evaluate(()=>closeDialog());}
  await p.locator('[data-rate-tab=install]').click();await expect(p.locator('[data-expense-example]')).toHaveCount(4);await p.locator('[data-expense-preview=trial][data-id=MAU-product_unit]').click();await expect(p.locator('#expense-preview-result')).toContainText('1.000.000');await p.evaluate(()=>closeDialog());
  await p.setViewportSize({width:390,height:844});expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await p.screenshot({path:dir+'/03-mau-lap-dat-mobile.png',fullPage:true});
  if(live){expect(await p.evaluate(()=>JSON.stringify([db.pricingDefaults,db.quote]))).toBe(localBefore);expect(await p.evaluate(async()=>JSON.stringify([await teamApi('catalog'),await teamApi('quotes')]))).toBe(before);}
  expect(errors).toEqual([]);expect(writes).toEqual([]);fs.writeFileSync(dir+'/results.json',JSON.stringify({passed:true,live,buildHash:expected,samples:19,errors,writes,at:new Date().toISOString()},null,2));console.log('PASS '+(live?'Railway read-only':'local save/reload')+': 19 samples, calculations, custom tariff, mobile and no JS errors');
 }catch(e){console.log(await p.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0&&!e.closest('.table-scroll,.workspace-tabs,dialog,.sidebar')}).slice(0,15).map(e=>({tag:e.tagName,id:e.id,cls:e.className,width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right}))})));await p.screenshot({path:dir+'/failure.png',fullPage:true}).catch(()=>{});throw e;}
 finally{await browser.close();if(app)await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
