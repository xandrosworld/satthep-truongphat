'use strict';
const {chromium,expect}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),F=require('./tmc-fixture.cjs'),P=require('../pricing-core');
(async()=>{
 const dir=path.resolve('artifacts/calculation-report');fs.mkdirSync(dir,{recursive:true});
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1520,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(pathToFileURL(path.resolve('dist/index.html')).href);
  const d=F.seed();d.quote.id='QA-DIEN-GIAI';d.quote.customer='Dữ liệu kiểm thử, không phải báo giá thật';d.quote.pricing.selected='detail';d.quote.pricing.special=0;P.adoptFlow(d.quote);F.confirm(d.quote);
  await page.evaluate(d=>{db=d;page='quote';tab='pricing';render();},d);
  const before=await page.evaluate(()=>JSON.stringify(db));
  await page.locator('[data-calculation-report]').click();await expect(page.locator('#dialog')).toContainText('Bảng diễn giải tính giá');
  await page.locator('[data-report-sheet]').selectOption('2');await expect(page.locator('[data-report-preview]')).toContainText('Khối lượng phôi toàn dòng');await expect(page.locator('[data-report-preview]')).toContainText('1000');
  await page.screenshot({path:dir+'/01-khoi-luong.png'});
  await page.locator('[data-report-sheet]').selectOption('8');await expect(page.locator('[data-report-preview]')).toContainText('Chi phí quản lý');await page.screenshot({path:dir+'/02-tinh-gia.png'});
  const downloaded=page.waitForEvent('download');await page.locator('#dialog button[type=submit]').click();const file=await downloaded;expect(file.suggestedFilename()).toBe('QA-DIEN-GIAI-DIEN-GIAI-NOI-BO.xlsx');await file.saveAs(dir+'/'+file.suggestedFilename());
  const zip=fs.readFileSync(dir+'/'+file.suggestedFilename()),xml=zip.toString('utf8');expect(xml).toContain('Dien giai khoi luong');expect(xml).toMatch(/<v>3650\.4\d*<\/v>/);expect(xml).not.toContain('<f>');expect(xml).not.toContain('__TPF_');
  expect(await page.evaluate(()=>JSON.stringify(db))).toBe(before);
  // No extra internal report tables are added to customer output.
  expect(await page.evaluate(()=>exportSheets(false).some(s=>s.name==='Gia phuong an da chon'))).toBe(false);
  await page.evaluate(()=>{db.quote.products[0].children[0].dims.L=0;render();});await page.locator('[data-calculation-report]').click();await page.locator('[data-report-sheet]').selectOption('9');await expect(page.locator('[data-report-preview]')).toContainText('Chưa đủ dữ liệu');
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:dir+'/03-ban-thieu-du-lieu-mobile.png'});
  await page.evaluate(()=>{closeDialog();Team.user={id:'reader'};Team.permissions={costs:true,formulaView:false};});
  expect(await page.evaluate(()=>calculationReportAllowed())).toBe(false);await page.evaluate(()=>openCalculationReport());await expect(page.locator('#dialog')).not.toBeVisible();
  await page.evaluate(()=>{Team.permissions={costs:false,formulaView:true};});expect(await page.evaluate(()=>calculationReportAllowed())).toBe(false);
  // Revoking permissions after opening the report must block its download as well.
  await page.evaluate(()=>{Team.permissions={costs:true,formulaView:true};openCalculationReport();Team.permissions.formulaView=false;});await page.locator('#dialog button[type=submit]').click();await expect(page.locator('#dialog')).toBeVisible();
  expect(errors).toEqual([]);fs.writeFileSync(dir+'/result.json',JSON.stringify({passed:true,errors,checks:['numeric XLSX','formula and price provenance','partial diagnostics','no mutation','customer export separation','permission guard']},null,2));console.log('Calculation report browser passed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
