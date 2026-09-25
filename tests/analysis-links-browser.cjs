'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:'+app.server.address().port);await expect(page.locator('#team-entry')).toBeVisible();
 await page.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'QA admin',password:'Analysis-links-only-42!'}));const q=await teamApi('quotes','POST',{document:TPPrice.demoSeed()});await teamLoad(q.id);tab='pricing';render();});
 const analysis=page.locator('[data-overall-analysis]');await expect(analysis).toContainText('Nơi khai báo');
 await analysis.getByRole('button',{name:'Nơi khai báo: Phân loại khách hàng',exact:true}).click();
 await expect(page.locator('[data-policy-target="customer"]')).toBeVisible();
 expect(await page.evaluate(()=>Intake.priceTab)).toBe('factors');
 for(const [label,group]of [['Vật tư chính + phụ + hoàn thiện','materials'],['Sản xuất tại xưởng','operations'],['Vận chuyển nhập vật tư','logistics']]){
  await page.evaluate(()=>{tab='pricing';render();});await analysis.getByRole('button',{name:'Nơi khai báo: '+label,exact:true}).click();expect(await page.evaluate(()=>Intake.priceTab)).toBe(group);
 }
 await page.evaluate(()=>{db.quote.status='approved';Team.link.status='approved';tab='pricing';render();});await analysis.getByRole('button',{name:'Nơi khai báo: Phân loại khách hàng',exact:true}).click();
 expect(await page.evaluate(()=>db.quote.status)).toBe('approved');await expect(page.locator('[data-policy-target="customer"]')).toBeDisabled();
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{tab='pricing';render();});await expect(analysis.getByRole('button',{name:'Nơi khai báo: Phân loại khách hàng',exact:true})).toBeAttached();
 expect(errors).toEqual([]);console.log('PASS analysis links: correct forms, approved lock retained, desktop/mobile');
}finally{await browser.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});

