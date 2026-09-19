'use strict';
const {chromium,expect}=require('@playwright/test'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),crypto=require('crypto'),F=require('./tmc-fixture.cjs');
(async()=>{
 const live=process.argv.includes('--live'),dir=path.resolve('artifacts/customer-review/confirmed-flow/'+(live?'live':'local'));fs.mkdirSync(dir,{recursive:true});
 const credentials=live?JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')):null;
 const hash=x=>crypto.createHash('sha256').update(x.replace(/\r\n/g,'\n').trim()).digest('hex'),url=credentials?.url||pathToFileURL(path.resolve('dist/index.html')).href;
 if(live)expect(hash(await fetch(url).then(r=>r.text()))).toBe(hash(fs.readFileSync('dist/index.html','utf8')));
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1520,height:1000}}),errors=[],writes=[];p.on('pageerror',e=>errors.push(e.message));
 if(live)await p.route('**/api/**',route=>{const r=route.request();if(['GET','HEAD'].includes(r.method())||new URL(r.url()).pathname==='/api/login')return route.continue();writes.push(r.method()+' '+r.url());return route.abort();});
 try{
  await p.goto(url);let before;
  if(live){await p.waitForFunction(()=>typeof Team!=='undefined'&&Team.available);await p.evaluate(async c=>{teamSession(await teamApi('login','POST',c));render();},credentials);before=await p.evaluate(async()=>({catalog:await teamApi('catalog'),quotes:await teamApi('quotes')}));}
  const d=F.seed();d.quote.pricing.selected='detail';d.quote.pricing.special=0;
  await p.evaluate(d=>{db=d;db.quote.id='QA-FLOW-1909';db.quote.workspaceKey='qa-confirmed-flow';if(Team.user){Team.loaded=true;Team.link={workspaceKey:db.quote.workspaceKey,status:'draft',version:0};}page='quote';tab='pricing';render();},d);
  await p.locator('[data-pa=adopt-flow]').click();await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
  expect(await p.evaluate(()=>result.products[0].cost)).toBeCloseTo(3650.4,7);await expect(p.locator('[data-flow-sequence]')).toContainText('giao hàng + lắp đặt');
  await p.screenshot({path:dir+'/01-luong-gia.png',fullPage:true});
  await p.evaluate(()=>{tab='prices';Intake.priceTab='competitor';render();});
  await p.locator('[data-benchmark-edit=competitor]').click();await p.locator('[name=benchmarkPrice]').fill('1000');
  for(const [key,value]of Object.entries({incoming:'included',outgoing:'included',delivery:'detail',install:'detail'}))await p.locator(`[name="scope-competitor-${key}-qa-tmc"]`).selectOption(value);
  await p.screenshot({path:dir+'/02-pham-vi-gia.png'});await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
  expect(await p.evaluate(()=>result.alternatives.competitor.total.beforeTax)).toBe(2140);
  await p.evaluate(()=>{const updates=TPCostInput.rows(db.quote).filter(r=>r.tmcOnly&&!TPCostInput.state(db.quote,r).known).map(r=>({key:r.key,status:'excluded',original:r.value}));if(updates.length)TPCostInput.apply(db.quote,updates,'QA không phải giá khách');TPTax.review(db.quote,{reason:'QA đối chiếu',costConfirmed:true,outputConfirmed:true,inputs:{'qa-tmc':{competitor:{status:'excluded'},kg:{status:'unknown'},market:{status:'unknown'}}}});db.quote.pricing.comparisonMethods=['detail','competitor'];tab='pricing';render();});
  await p.locator('.gp-final-choice [data-pa=choose][data-method=competitor]').click();
  expect(await p.evaluate(()=>result.total.grand)).toBe(2311);
  const out=await p.evaluate(()=>({internal:exportSheets(true),customer:exportSheets(false),offer:result.total}));
  expect(out.customer[0].rows.find(r=>r[5]==='Cộng trước thuế')[6]).toBe(2140);expect(out.customer[0].rows.find(r=>r[5]==='Tổng thanh toán')[6]).toBe(2311);
  expect(out.internal.find(s=>s.name==='Phan tich gia').rows.find(r=>r[0]==='Phí chưa gồm — cộng từ tính toán')).toEqual(['Phí chưa gồm — cộng từ tính toán',0,140]);
  await p.evaluate(()=>{tab='preview';render();});await expect(p.locator('.paper')).toContainText('2.311');await p.screenshot({path:dir+'/03-ban-chao.png',fullPage:true});
  if(!live){await p.evaluate(()=>persist());await p.reload();expect(await p.evaluate(()=>result.total.grand)).toBe(2311);expect(await p.evaluate(()=>db.quote.products[0].benchmarkScope.competitor.delivery)).toBe('detail');}
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{tab='prices';Intake.priceTab='competitor';render();});await p.locator('[data-benchmark-edit=competitor]').click();await expect(p.locator('[name=scope-competitor-delivery-qa-tmc]')).toHaveValue('detail');await p.screenshot({path:dir+'/04-mobile.png'});
  const mixed=require('./cost-flow-fixture.cjs').seed(),tmc=F.seed().quote.products[0];tmc.id='mix-tmc';tmc.children[0].id='mix-tmc-leaf';tmc.priceGroupId='tmc';mixed.quote.products.push(tmc);
  const mechanical=JSON.parse(JSON.stringify(tmc));mechanical.id='mix-mechanical';mechanical.children[0].id='mix-mechanical-leaf';mechanical.priceGroupId='detail';mechanical.tmcScope='detail';mixed.quote.products.push(mechanical);
  await p.setViewportSize({width:1520,height:1000});await p.evaluate(d=>{closeDialog();db=d;TPPrice.adoptFlow(db.quote);db.quote.workspaceKey='qa-confirmed-flow';db.quote.pricing.comparisonMethods=['detail','special'];page='quote';tab='pricing';render();},mixed);
  await p.locator('.gp-final-choice [data-pa=choose][data-method=special]').click();expect(await p.evaluate(()=>result.products.map(p=>p.sourceMethod))).toEqual(['group:grp-cabinet-flow','tmc','detail']);
  await p.locator('[data-cf=view][data-id=special]').click();await expect(p.locator('[data-cost-flow]')).toContainText('Theo Tủ điện');await expect(p.locator('[data-cost-flow]')).toContainText('Theo thang máng cáp');await p.screenshot({path:dir+'/05-pa-dac-thu-hon-hop.png',fullPage:true});
  expect(await p.evaluate(()=>exportSheets(true).find(s=>s.name==='Phan tich gia').rows[0].length)).toBe(3);
  await p.evaluate(d=>{db=d;TPPrice.adoptFlow(db.quote);db.quote.workspaceKey='qa-confirmed-flow';page='quote';tab='prices';Intake.priceTab='logistics';render();},d);
  await p.locator('[data-work=expense]:not([data-id])').click();await p.locator('[name=name]').fill('Bốc xếp nhập phôi bổ sung');await p.locator('[name=category]').selectOption('incoming');await p.locator('[name=method]').selectOption('fixed');await p.locator('[name=rate]').fill('50');await p.locator('[name=allocation]').selectOption('equal');await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
  expect(await p.evaluate(()=>result.products[0].production)).toBe(2250);expect(await p.evaluate(()=>result.total.cost)).toBeCloseTo(3728.4,7);
  expect(await p.evaluate(()=>exportSheets(true).find(s=>s.name==='Van chuyen lap dat').rows.some(row=>row[0]==='Bốc xếp nhập phôi bổ sung'&&row[5]===50))).toBe(true);
  await p.screenshot({path:dir+'/06-khoan-chi-bo-sung.png',fullPage:true});
  if(live)expect(await p.evaluate(async()=>({catalog:await teamApi('catalog'),quotes:await teamApi('quotes')}))).toEqual(before);
  expect(errors).toEqual([]);expect(writes).toEqual([]);fs.writeFileSync(dir+'/results.json',JSON.stringify({passed:true,live,at:new Date().toISOString(),checks:['explicit draft migration','common/management after delivery/install','benchmark missing charges exactly once','selected offer','Excel','mobile','one special PA across TMC/cabinet/mechanical','add named expense through form and reconcile Excel',live?'production data unchanged':'browser persistence'],errors,writes},null,2));
  console.log('PASS confirmed flow UI, supplementary costs, comparison, offer, Excel, persistence and mobile'+(live?' on production (no business writes)':''));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
