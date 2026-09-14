const {chromium,expect}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
  const fallback=path.join(process.env.LOCALAPPDATA||'','ms-playwright','chromium-1228','chrome-win64','chrome.exe');
  const browser=await chromium.launch({headless:true,...(fs.existsSync(fallback)?{executablePath:fallback}:{})});
  const offline=process.argv.includes('--offline'),p=await browser.newPage({viewport:{width:1440,height:1100},offline}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  const submit=()=>p.locator('#dialog button[type=submit]').click();
  const snapshot=()=>p.evaluate(()=>({grand:result.total.grand,material:result.total.material,credit:result.reuse.credit,count:result.reuse.selectedCount,buy:result.reuse.chargeAll.material,stock:result.groups.map(g=>g.layout?.stocks.length),weight:result.groups.map(g=>g.purchasedWeight),ops:result.total.ops,all:result.reuse.chargeAll.grand,exclude:result.reuse.excludeSelected.grand}));
  await p.goto(offline?pathToFileURL(path.resolve('dist/index.html')).href:'http://127.0.0.1:4173');
  await p.locator('[data-tab=waste]').click();await expect(p.locator('.remnant-panel')).toHaveCount(2);
  const original=await snapshot();await expect(p.locator('[name=remnant-mode][value=all]')).toBeChecked();await expect(p.locator('[name=remnant-mode][value=exclude]')).toBeDisabled();
  await p.locator('[data-remnant=threshold][data-gi="0"]').click();
  await p.locator('[name=minL]').fill('200');await p.locator('[name=minW]').fill('100');await submit();
  const selected=await snapshot();expect(selected.count).toBeGreaterThan(0);expect(selected.grand).toBe(original.grand);expect(selected.credit).toBeGreaterThan(0);
  await p.locator('[name=remnant-mode][value=exclude]').check();const excluded=await snapshot();
  expect(excluded.grand).toBe(excluded.exclude);expect(excluded.grand).toBeLessThan(original.grand);expect(excluded.all).toBe(original.grand);
  expect(excluded.stock).toEqual(original.stock);expect(excluded.weight).toEqual(original.weight);expect(excluded.ops).toBe(original.ops);
  expect(Math.abs(original.material-excluded.material-excluded.credit)).toBeLessThan(1e-6);
  // A dimension batch can be selected in one click, or partially through a dialog.
  const batchIndex=await p.evaluate(()=>remnantBatches(result.groups[0]).findIndex(b=>b.parts.length>1));expect(batchIndex).toBeGreaterThanOrEqual(0);
  const batch=p.locator('[data-remnant-batch="'+batchIndex+'"][data-gi="0"]');await batch.check();
  await p.locator('[data-remnant=individual][data-gi="0"][data-bi="'+batchIndex+'"]').click();
  await p.locator('#dialog [name=part]').first().uncheck();await submit();expect(await batch.evaluate(el=>el.indeterminate)).toBe(true);
  // Diagram areas are keyboard-operable and synchronized with the selection table.
  const piece=p.locator('[data-remnant=piece][data-gi="0"]').first(),pressed=await piece.getAttribute('aria-pressed');
  await piece.focus();await piece.press('Space');await expect(piece).toHaveAttribute('aria-pressed',pressed==='true'?'false':'true');
  // Bar tails have the same explicit selection flow.
  await p.locator('[data-remnant=threshold][data-gi="1"]').click();await p.locator('[name=minL]').fill('100');await submit();
  const both=await snapshot();expect(both.count).toBeGreaterThan(0);await expect(p.locator('.notice.error')).toHaveCount(0);
  await p.locator('[data-remnant=compare]').first().click();await expect(p.locator('.remnant-comparison')).toBeInViewport();
  await expect(p.locator('#toast')).not.toHaveClass(/visible/);await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:'artifacts/phan-du-so-sanh-gia.png',fullPage:true});
  // Whole-quote rounded prices are the same on the comparison, pricing, paper and CSV.
  await p.locator('[data-tab=pricing]').first().click();await expect(p.locator('.remnant-price-note')).toContainText('không tính phần dư');
  expect((await snapshot()).grand).toBe(both.grand);
  await p.locator('[data-tab=preview]').click();await expect(p.locator('.paper')).toContainText(both.grand.toLocaleString('vi-VN'));
  await expect(p.locator('.paper')).not.toContainText('Phần dư đã chọn');
  const downloaded=p.waitForEvent('download');await p.locator('[data-action=export-quote]').click();const csv=fs.readFileSync(await (await downloaded).path(),'utf8');
  expect(csv).toContain(String(both.grand));expect(csv).not.toContain('Phần dư');
  await p.evaluate(()=>{window.print=()=>{window.didPrint=true;};});await p.locator('[data-action=print]').click();expect(await p.evaluate(()=>window.didPrint)).toBe(true);
  await p.pdf({path:'artifacts/bao-gia-co-tan-dung.pdf',format:'A4',printBackground:true});
  await p.reload();expect(await snapshot()).toEqual(both);
  // A physical change invalidates affected choices; stale discounts cannot be exported.
  await p.locator('[data-tab=waste]').click();const kerf=p.locator('[data-quote-field=kerf]');await kerf.fill('4');await kerf.press('Tab');
  await expect(p.locator('.remnant-stale')).toBeVisible();expect(await p.evaluate(()=>result.reuse.staleCount)).toBeGreaterThan(0);
  await p.locator('[data-tab=preview]').click();await p.evaluate(()=>{window.didPrint=false;window.print=()=>{window.didPrint=true;};});
  await p.locator('[data-action=print]').click();expect(await p.evaluate(()=>window.didPrint)).toBe(false);
  let downloads=0;p.on('download',()=>downloads++);await p.locator('[data-action=export-quote]').click();await expect(p.locator('#toast')).toContainText('Xử lý cảnh báo');expect(downloads).toBe(0);
  await p.locator('[data-tab=waste]').click();await p.locator('[data-action=ux-undo]').click();
  await expect(p.locator('.remnant-stale')).toHaveCount(0);expect(await snapshot()).toEqual(both);
  // Explicit review discards only choices which no longer match, then allows reselection.
  await p.locator('[data-quote-field=kerf]').fill('4');await p.locator('[data-quote-field=kerf]').press('Tab');
  await p.locator('[data-remnant=review]').click();await expect(p.locator('.remnant-stale')).toHaveCount(0);await expect(p.locator('.notice.error')).toHaveCount(0);
  await p.locator('[data-remnant-batch="0"][data-gi="0"]').check();await p.locator('[name=remnant-mode][value=exclude]').check();
  // Switching back never loses physical selections and immediately restores full purchasing allocation.
  const final=await snapshot();await p.locator('[name=remnant-mode][value=all]').check();const all=await snapshot();expect(all.grand).toBe(all.all);expect(all.count).toBe(final.count);
  await p.locator('[name=remnant-mode][value=exclude]').check();expect((await snapshot()).grand).toBe(final.grand);
  await p.setViewportSize({width:390,height:844});await p.evaluate(()=>scrollTo(0,0));
  expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(p.locator('#toast')).not.toHaveClass(/visible/);await p.screenshot({path:'artifacts/phan-du-mobile.png',fullPage:true});
  const mobileCheck=p.locator('[data-remnant-batch="0"][data-gi="0"]');await mobileCheck.uncheck();await mobileCheck.check();
  expect(errors).toEqual([]);await browser.close();
  console.log('Remnant UI passed'+(offline?' offline':'')+': threshold/group/individual/keyboard selection, both material types, two prices, unchanged purchases, PDF/CSV, persistence, stale-export guard, undo/review, mobile.');
})().catch(e=>{console.error(e);process.exit(1);});
