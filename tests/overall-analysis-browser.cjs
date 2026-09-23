'use strict';
const {chromium,expect}=require('@playwright/test'),{pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));try{
 await p.goto(pathToFileURL(path.resolve('dist/index.html')).href);await p.evaluate(()=>{db=TPPrice.demoSeed();db.quote.remnantMode='all';db.quote.pricing.reserve=2;page='quote';tab='pricing';render();});
 await expect(p.locator('[data-overall-analysis]')).toBeVisible();await expect(p.locator('[data-overall-analysis]')).toContainText('Dự phòng giảm giá');await expect(p.locator('[data-price-total]')).toBeVisible();await expect(p.locator('[data-price-per-kg]')).toContainText('Giá trước thuế / kg phôi');await expect(p.locator('[data-cost-flow]')).not.toBeVisible();
 const values=await p.evaluate(()=>({total:money(result.total.grand),unit:num(result.total.beforeTax/result.total.weight,2)}));await expect(p.locator('[data-price-total] strong')).toContainText(values.total);await expect(p.locator('[data-price-per-kg] strong')).toContainText(values.unit);
 await p.locator('.pa-full-detail > summary').click();await expect(p.locator('[data-cost-flow]')).toBeVisible();await p.locator('.pa-full-detail > summary').click();
 const xlsx=await p.evaluate(()=>sourceSheets()[1].rows);expect(xlsx.some(r=>r[0]==='Dự phòng giảm giá')).toBe(true);
 await p.screenshot({path:'artifacts/overall-analysis-desktop.png'});await p.setViewportSize({width:390,height:844});await p.evaluate(()=>render());expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await p.evaluate(()=>{Team.user={id:'technical'};Team.permissions={costs:false,technical:true};tab='bom';document.body.innerHTML=quoteTechnicalOverview();});await expect(p.locator('[data-price-total]')).toHaveCount(0);expect(errors).toEqual([]);console.log('PASS visible summary, collapsed detail, accurate header totals, Excel factor rows, mobile overflow and technical price privacy');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
