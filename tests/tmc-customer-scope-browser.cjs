'use strict';
const {chromium,expect}=require('@playwright/test');
const {pathToFileURL}=require('node:url');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 try{
  await page.goto(pathToFileURL(path.resolve('dist/index.html')).href,{waitUntil:'domcontentloaded'});
  await page.locator('[data-page=rates]').click();
  await expect(page.locator('[aria-label="Các bảng đơn giá"] [data-rate-tab=tmc]')).toHaveCount(0);
  await page.locator('[data-rate-tab=operations]').click();
  await expect(page.locator('[data-rate-subtab]')).toHaveCount(0);await page.locator('[data-ip-tmc-details] summary').click();
  await expect(page.locator('[data-input-price=tray]')).toContainText('đ/m');
  await page.locator('[data-input-price=tray] [data-ot=edit]').click();
  await expect(page.locator('[name=unit] option:not([disabled])')).toHaveCount(2);
  await page.locator('#dialog [data-action=close]').first().click();

  const ids=await page.evaluate(()=>{db.quote.products[0].priceGroupId='tmc';db.quote.products[1].priceGroupId='detail';db.quote.products[1].tmcScope='detail';page='quote';tab='prices';render();return db.quote.products.map(n=>n.id);});
  await page.locator('[data-intake=price-tab][data-id=logistics]').click();
  await page.locator('[data-work=expense]:not([data-id])').click();
  await page.locator('[name=name]').fill('Phí riêng cơ khí');
  await page.locator('[name=scope]').selectOption('productGroups');
  await page.locator('[name=productGroups][value=detail]').check();
  await page.locator('[name=method]').selectOption('fixed');
  await page.locator('[name=rate]').fill('50000');
  await page.locator('[name=allocation]').selectOption('equal');
  await expect(page.locator('#work-expense-result')).toContainText('50.000');
  await page.locator('#dialog button[type=submit]').click();
  await expect(page.locator('#dialog')).not.toBeVisible();
  const outcome=await page.evaluate(()=>({expense:db.quote.expenses.at(-1),allocations:result.logistics.allocations,errors:result.logistics.errors}));
  expect(outcome.errors).toEqual([]);
  expect(outcome.expense.groupIds).toEqual(['detail']);
  expect(outcome.allocations[ids[0]]).toBeUndefined();
  expect(outcome.allocations[ids[1]].incoming).toBe(50000);
  await expect(page.locator('.work-expenses tbody tr').last()).toContainText('Cơ khí khác');
  console.log('PASS TMC price table is nested under operations; labour units are m/cái; group freight charges only mechanics');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
