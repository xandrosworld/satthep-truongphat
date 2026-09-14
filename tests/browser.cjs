const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
(async()=>{
  const fallback=path.join(process.env.LOCALAPPDATA||'','ms-playwright','chromium-1228','chrome-win64','chrome.exe');
  const browser=await chromium.launch({headless:true,...(fs.existsSync(fallback)?{executablePath:fallback}:{})});
  const page=await browser.newPage({viewport:{width:1512,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  fs.mkdirSync(path.join(__dirname,'../artifacts'),{recursive:true});
  await page.goto('http://127.0.0.1:4173');
  await page.evaluate(()=>{localStorage.clear();location.reload();});await page.waitForLoadState();
  await expect(page.locator('h1')).toHaveText('Báo giá cơ khí');
  await page.locator('[data-ux="detail-mode"]').click();
  await expect(page.locator('.tree-node.depth-0')).toHaveCount(2);
  await expect(page.locator('.notice.error')).toHaveCount(0);
  await page.screenshot({path:'artifacts/01-bao-gia-desktop.png',fullPage:true});
  const initial=await page.evaluate(()=>result.total.grand);
  // Material -> actual dimensions -> safe recalculation; catalog specifications remain fixed.
  await page.locator('.tree-node').filter({hasText:'PH-T15'}).first().click();
  await page.locator('[data-dimension="W"]').fill('350');
  await page.locator('[data-dimension="W"]').press('Tab');
  await expect(page.locator('.formula-box')).toContainText('480 mm');
  await expect(page.locator('.notice.error')).toHaveCount(0);
  const changed=await page.evaluate(()=>result.total.grand);expect(changed).not.toBe(initial);
  await page.screenshot({path:'artifacts/02-vat-tu-cong-thuc.png',fullPage:true});
  // Direct material insertion at product level.
  await page.locator('.tree-node.depth-0').first().click();
  await page.locator('[data-action="add-material"]').click();
  await page.locator('#pick-search').fill('LK-M8');
  await page.locator('[data-basket-id="LK-M8"]').check();
  await page.locator('[data-basket-qty="LK-M8"]').fill('2');await page.locator('[data-basket-qty="LK-M8"]').press('Tab');
  await page.locator('#dialog button[type=submit]').click();
  await expect(page.locator('#dialog')).not.toBeVisible();
  expect(await page.evaluate(()=>db.quote.products[0].children.at(-1).materialId)).toBe('LK-M8');
  // Empty component, fill it, then template snapshot.
  await page.locator('.tree-node.depth-0').first().click();
  await page.locator('[data-action="add-component"]').click();
  await page.locator('#dialog [name=name]').fill('Cấu kiện thử nghiệm');
  await page.locator('#dialog button[type=submit]').click();
  await page.locator('[data-action="add-material"]').click();
  await page.locator('#pick-search').fill('PH-T20');await page.locator('[data-basket-id="PH-T20"]').check();await page.locator('#dialog button[type=submit]').click();
  await page.locator('.tree-node').filter({hasText:'Cấu kiện thử nghiệm'}).click();
  await page.locator('[data-action="save-template"]').click();await page.locator('#dialog button[type=submit]').click();
  expect(await page.evaluate(()=>db.library.at(-1).name)).toBe('Cấu kiện thử nghiệm');
  await page.locator('[data-action="add-op"]').click();await page.locator('#dialog [name=mode]').selectOption('outside');await page.locator('#dialog button[type=submit]').click();
  await expect(page.locator('[data-op-mode]')).toHaveValue('outside');
  // All computation views, opening later stocks.
  for(const t of ['waste','mass','pricing','preview']){await page.locator(`[data-tab="${t}"]`).click();await expect(page.locator('.notice.error')).toHaveCount(0);await page.screenshot({path:`artifacts/03-${t}.png`,fullPage:true});}
  // PDF rendering: a real document with only the client-facing quote.
  await page.evaluate(()=>document.querySelector('#print-area').innerHTML=paper());
  await page.pdf({path:'artifacts/bao-gia-mau.pdf',format:'A4',printBackground:true});
  // Quote-local stock specification, oversized warning, then recovery.
  await page.locator('[data-tab="waste"]').click();
  await page.locator('[data-action="edit-stock"]').first().click();await page.locator('#dialog [name=stockL]').fill('100');await page.locator('#dialog button[type=submit]').click();
  await expect(page.locator('.notice.error')).toContainText('vượt khổ');
  await page.locator('[data-action="edit-stock"]').first().click();await page.locator('#dialog [name=stockL]').fill('2440');await page.locator('#dialog button[type=submit]').click();await expect(page.locator('.notice.error')).toHaveCount(0);
  // Catalog creation with code validation and existing material edits.
  await page.locator('[data-page="materials"]').click();await page.locator('[data-action="new-material"]').click();
  await page.locator('#dialog [name=id]').fill('PH-TEST');await page.locator('#dialog [name=name]').fill('Thép tấm thử nghiệm 3 mm');await page.locator('#dialog [name=T]').fill('3');await page.locator('#dialog button[type=submit]').click();
  await page.locator('#catalog-search').fill('PH-TEST');await expect(page.locator('#content tbody tr')).toHaveCount(1);await page.locator('[data-action="edit-material"]').click();await page.locator('#dialog [name=price]').fill('23000');await page.locator('#dialog button[type=submit]').click();await expect(page.locator('#content tbody')).toContainText('23.000');
  await page.locator('#catalog-search').fill('');await page.screenshot({path:'artifacts/04-danh-muc.png',fullPage:true});
  // Formula editing with live results; unsafe expression rejected without execution.
  await page.locator('[data-page="rules"]').click();await page.locator('[data-action="new-rule"]').click();
  await page.locator('#dialog [name=name]').fill('Tấm thử gấp mép');await page.locator('#dialog [name=width]').fill('W + 2 * F');await expect(page.locator('#formula-test')).toContainText('330');
  await page.locator('#dialog [name=width]').fill('alert(1)');await page.locator('#dialog button[type=submit]').click();await expect(page.locator('#dialog-error')).toBeVisible();
  await page.locator('#dialog [name=width]').fill('W + 2 * F');await page.locator('#dialog button[type=submit]').click();await expect(page.locator('#dialog')).not.toBeVisible();
  // Snapshot isolation and explicit update.
  const old=await page.evaluate(()=>result.total.grand);await page.locator('[data-page="rates"]').click();await page.locator('[data-material-price="PH-T15"]').fill('30000');await page.locator('[data-material-price="PH-T15"]').press('Tab');
  expect(await page.evaluate(()=>TP.calculate(db).total.grand)).toBe(old);
  await page.locator('[data-action="refresh-prices"]').click();await page.locator('#dialog button[type=submit]').click();expect(await page.evaluate(()=>result.total.grand)).toBeGreaterThan(old);
  await page.locator('[data-rate-tab="operations"]').click();await page.screenshot({path:'artifacts/05-nguyen-cong.png',fullPage:true});
  await page.locator('[data-rate-unit="outside"][data-id="paint"]').selectOption('kg');
  await page.locator('[data-action="refresh-prices"]').click();await page.locator('#dialog button[type=submit]').click();
  expect(await page.evaluate(()=>db.quote.ratesSnapshot.find(r=>r.id==='paint').outsideUnit)).toBe('kg');
  await page.locator('[data-action="new-rate"]').click();await page.locator('#dialog [name=name]').fill('Đánh bóng thử nghiệm');await page.locator('#dialog [name=inside]').fill('12000');await page.locator('#dialog [name=outsideUnit]').selectOption('kg');await page.locator('#dialog [name=outside]').fill('15000');await page.locator('#dialog button[type=submit]').click();
  expect(await page.evaluate(()=>db.rates.at(-1).name)).toBe('Đánh bóng thử nghiệm');
  await page.locator('[data-page="library"]').click();await expect(page.locator('.template-card')).toHaveCount(6);await page.screenshot({path:'artifacts/06-thu-vien.png',fullPage:true});
  // Approve, edit returns to draft, local persistence.
  await page.locator('[data-page="quote"]').click();await page.locator('[data-tab="preview"]').click();await page.locator('[data-action="approve"]').click();await page.locator('#dialog button[type=submit]').click();
  expect(await page.evaluate(()=>db.quote.status)).toBe('approved');
  await page.reload();expect(await page.evaluate(()=>db.quote.status)).toBe('approved');expect(await page.evaluate(()=>db.history.length)).toBe(1);
  // Overflow prevention on mobile, including data-table pages.
  await page.setViewportSize({width:390,height:844});
  for(const p of ['quote','materials','library','rates','rules']){await page.evaluate(p=>{page=p;render();},p);const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,nodes:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&getComputedStyle(e).display!=='none').slice(0,10).map(e=>({tag:e.tagName,cls:e.className,w:e.getBoundingClientRect().width}))}));if(overflow.scroll>overflow.width+1)console.log(p,overflow);expect(overflow.scroll<=overflow.width+1).toBe(true);}
  await page.evaluate(()=>{page='quote';tab='bom';render();});expect(await page.locator('#sidebar').evaluate(e=>e.getBoundingClientRect().right)).toBeLessThanOrEqual(0);await page.screenshot({path:'artifacts/07-mobile.png',fullPage:true});
  // Keyboard-controlled 3D.
  const stage=page.locator('.model-stage');if(await stage.count()){const before=await page.locator('.model-scene').getAttribute('style');await stage.focus();await stage.press('ArrowRight');expect(await page.locator('.model-scene').getAttribute('style')).not.toBe(before);}
  expect(errors).toEqual([]);
  console.log('Browser: BOM, direct materials, component templates, operations, formulas, nesting, pricing, catalog CRUD, snapshot updates, approval, persistence, mobile, PDF all passed.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
