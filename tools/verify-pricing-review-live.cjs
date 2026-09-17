'use strict';
// Authenticated read-only check. Customer documents and credentials are never logged.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{chromium,expect}=require('@playwright/test');
(async()=>{
 const credentials=JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')),url=credentials.url,dir=path.resolve('artifacts/customer-review/pricing-review-2026-09-17/live');fs.mkdirSync(dir,{recursive:true});
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex'),expected=hash(fs.readFileSync('dist/index.html','utf8'));
 let actual;for(let i=0;i<24;i++){actual=hash(await fetch(url).then(r=>r.text()));if(actual===expected)break;await new Promise(r=>setTimeout(r,5000));}expect(actual).toBe(expected);expect((await fetch(new URL('/healthz',url)).then(r=>r.json())).ok).toBe(true);
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1560,height:1000}}),errors=[],writes=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/**',async route=>{const req=route.request(),pathname=new URL(req.url()).pathname;if(!['GET','HEAD'].includes(req.method())&&!['/api/login','/api/logout'].includes(pathname)){writes.push(req.method()+' '+pathname);await route.abort();}else await route.continue();});
 try{
  await page.goto(url);await page.evaluate(async c=>{teamSession(await teamApi('login','POST',{username:c.username,password:c.password}));render();},credentials);
  const target=await page.evaluate(async()=>{closeDialog();const quotes=await teamApi('quotes');if(!quotes.length)throw Error('No quotation available');const target=quotes.find(q=>q.status==='draft')||quotes[0];await teamLoad(target.id);return {id:target.id,version:Team.link.version};});
  for(const stage of ['intake','bom','operations','waste','mass','prices','pricing','preview']){await page.evaluate(stage=>{closeDialog();page='quote';tab=stage;render();},stage);await expect(page.locator('#content')).not.toBeEmpty();if(stage==='prices'){await expect(page.locator('[data-b1-tree=prices] thead')).toContainText('KL vật tư tính tiền');await expect(page.locator('[data-b1-tree=prices] thead')).toContainText('Tiền vật tư phụ');}if(stage==='pricing')await expect(page.locator('.pa-comparison')).toContainText('5. Giá chào và phần còn lại');}
  // Exercise new form with a fixture in browser memory only, never save it.
  await page.evaluate(()=>{db=TPPrice.demoSeed();page='quote';tab='pricing';render();taxEdit();});await expect(page.locator('#dialog [name=competitor-value-0]')).toHaveCount(0);await page.locator('#dialog [name=outputScope]').selectOption('product');await expect(page.locator('#dialog [name=output-product-0]')).toBeVisible();await page.evaluate(()=>closeDialog());
  const after=await page.evaluate(id=>teamApi('quotes/'+id),target.id);expect(after.version).toBe(target.version);expect(writes).toEqual([]);expect(errors).toEqual([]);
  fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify({passed:true,at:new Date().toISOString(),buildHash:expected,checks:['health','matching deployed build','authenticated quote load','eight workflow stages','material columns','analysis order','tax form without duplicate input prices','no quote writes'],errors,writes},null,2));console.log('PASS production build, health, authenticated eight-stage workflow and new pricing/tax UI; no customer quote writes');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
