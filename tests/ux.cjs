const {chromium,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
  const fallback=path.join(process.env.LOCALAPPDATA||'','ms-playwright','chromium-1228','chrome-win64','chrome.exe');
  const browser=await chromium.launch({headless:true,...(fs.existsSync(fallback)?{executablePath:fallback}:{})});
  const p=await browser.newPage({viewport:{width:1512,height:1050}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:4173');
  const seed=async()=>{await p.evaluate(()=>{localStorage.clear();});await p.reload();await expect(p.locator('.quick-product')).toHaveCount(2);};
  const submit=()=>p.locator('#dialog button[type=submit]').click();
  const edit=async(selector,value)=>{await p.locator(selector).fill(String(value));await p.locator(selector).press('Tab');};
  await seed();
  const ids=await p.evaluate(()=>({product:db.quote.products[0].id,body:db.quote.products[0].children[0].children[0].id,cover:db.quote.products[0].children[1].children[0].id,component:db.quote.products[0].children[0].id}));
  // A single common dimension changes both rows, unfolding, prices and name; Tab keeps entry focus.
  const before=await p.evaluate(()=>result.total.grand);
  await edit('[data-param-product="'+ids.product+'"][data-param-key="W"]',400);
  await expect(p.locator('[data-qid="'+ids.body+'"][data-qkey="W"]')).toHaveValue('400');
  await expect(p.locator('[data-qid="'+ids.cover+'"][data-qkey="W"]')).toHaveValue('400');
  await expect(p.locator('[data-param-product="'+ids.product+'"][data-param-key="H"]')).toBeFocused();
  await expect(p.locator('[data-live-name="'+ids.product+'"]')).toContainText('400');
  await expect(p.locator('[data-qgeometry="'+ids.body+'"]')).toContainText('530');
  expect(await p.evaluate(()=>result.total.grand)).not.toBe(before);
  await edit('[data-qid="'+ids.body+'"][data-qkey="W"]',350);
  await expect(p.locator('[data-param-product="'+ids.product+'"][data-param-key="W"]')).toHaveValue('350');
  expect(await p.evaluate(()=>db.materials[0].props.T)).toBe(1.5);
  await p.locator('[data-action="ux-undo"]').click();
  await expect(p.locator('[data-qid="'+ids.body+'"][data-qkey="W"]')).toHaveValue('400');
  await p.locator('[data-action="ux-redo"]').click();
  await expect(p.locator('[data-qid="'+ids.cover+'"][data-qkey="W"]')).toHaveValue('350');
  // Detach is explicit and does not silently change a related part; paper reports actual dimensions.
  await p.locator('[data-ux="row-actions"][data-id="'+ids.body+'"]').click();
  await p.locator('[data-ux="detach"]').click();
  await edit('[data-qid="'+ids.body+'"][data-qkey="W"]',450);
  await expect(p.locator('[data-qid="'+ids.cover+'"][data-qkey="W"]')).toHaveValue('350');
  expect(await p.evaluate(()=>paper())).toContain('W 450');
  await expect(p.locator('[data-live-name="'+ids.product+'"]')).toContainText('tùy chỉnh');
  await p.locator('[data-action="ux-undo"]').click();await p.locator('[data-action="ux-undo"]').click();
  // A linked component template inherits current product dimensions immediately.
  await p.locator('[data-action="pick-template"][data-parent="'+ids.product+'"]').click();await submit();
  expect(await p.evaluate(()=>db.quote.products[0].children.at(-1).children[0].dims.W)).toBe(350);
  await p.locator('[data-action="ux-undo"]').click();
  // Multi-selection survives a search; quantity entry automatically selects the row.
  const lineCount=await p.evaluate(()=>result.rows.length);
  await p.locator('[data-action="add-material"][data-parent="'+ids.product+'"]').click();
  await p.locator('#pick-search').fill('PH-T20');await p.locator('[data-basket-id="PH-T20"]').check();
  await p.locator('#pick-search').fill('bu long');await expect(p.locator('.batch-option')).toHaveCount(1);
  await edit('[data-basket-qty="LK-M8"]',6);
  await p.locator('#pick-search').fill('dau');await p.locator('[data-basket-id="DM-DAU"]').check();
  await expect(p.locator('#basket-summary')).toContainText('3 mã');
  await p.screenshot({path:'artifacts/ux-chon-nhieu-vat-tu.png'});
  await submit();expect(await p.evaluate(()=>result.rows.length)).toBe(lineCount+3);
  expect(await p.evaluate(()=>db.quote.products[0].children.at(-2).qty)).toBe(6);
  await p.locator('[data-action="ux-undo"]').click();expect(await p.evaluate(()=>result.rows.length)).toBe(lineCount);
  // Variants are copies and retain linked quantities; source is unchanged.
  await p.locator('[data-action="variant"]').click();await p.locator('#dialog [name=W]').fill('500');await p.locator('#dialog [name=qty]').fill('3');await submit();
  expect(await p.evaluate(()=>db.quote.products.at(-1).children[1].children[0].dims.W)).toBe(500);
  expect(await p.evaluate(()=>db.quote.products[0].params.W)).toBe(350);
  await p.locator('[data-action="ux-undo"]').click();
  // Excel import is atomic: unknown code rejects the entire batch without partial additions.
  // Parameter linking is configurable, not just a hard-coded demonstration.
  await p.locator('[data-ux="row-actions"][data-id="'+ids.product+'"]').click();await p.locator('[data-ux="configure-links"]').click();
  await p.locator('#dialog [name=W]').fill('375');await p.locator('#dialog [name=pattern]').fill('Máng tùy biến {W} x {H} mm');await submit();
  await expect(p.locator('[data-qid="'+ids.cover+'"][data-qkey="W"]')).toHaveValue('375');
  await expect(p.locator('[data-live-name="'+ids.product+'"]')).toContainText('Máng tùy biến 375 x 50 mm');
  await p.locator('[data-action="ux-undo"]').click();
  // Excel import is atomic: unknown code rejects the entire batch without partial additions.
  await p.locator('[data-action="paste-excel"]').first().click();
  await p.locator('#excel-paste').fill('PH-T20\t2\t1000\t400\nUNKNOWN\t1');
  await submit();await expect(p.locator('#dialog-error')).toContainText('UNKNOWN');
  expect(await p.evaluate(()=>result.rows.length)).toBe(lineCount);
  await p.locator('#excel-paste').fill('Mã vật tư\tSố lượng\tDài\tRộng\nPH-T20\t2\t1000\t400\nLK-M8\t4');
  await submit();expect(await p.evaluate(()=>result.rows.length)).toBe(lineCount+2);
  await p.locator('[data-action="ux-undo"]').click();
  // Selecting a component and its material must not add the same operation to both levels.
  await p.locator('[data-check-id="'+ids.component+'"]').check();await p.locator('[data-check-id="'+ids.body+'"]').check();
  await p.locator('[data-ux="bulk-op"]').click();await p.locator('#dialog [name=op]').selectOption('weld');await submit();
  expect(await p.evaluate(id=>TP.findNode(db.quote.products,id).ops.filter(o=>o.id==='weld').length,ids.component)).toBe(1);
  expect(await p.evaluate(id=>TP.findNode(db.quote.products,id).ops.filter(o=>o.id==='weld').length,ids.body)).toBe(0);
  await p.locator('[data-action="ux-undo"]').click();
  // Inline transport/install is available at every level and does not duplicate descendants.
  await p.locator('[data-tab="pricing"]').click();
  const prior=await p.evaluate(()=>result.total.transport);
  await edit('[data-node-cost="transport"][data-id="'+ids.body+'"]',1000);
  expect(await p.evaluate(()=>result.total.transport)).toBe(prior+12000);
  await edit('[data-node-cost="transport"][data-id="'+ids.component+'"]',2000);
  expect(await p.evaluate(()=>result.total.transport)).toBe(prior+36000);
  const catalogPrice=await p.evaluate(()=>db.materials[0].price);
  const stockCount=await p.evaluate(()=>result.groups.filter(g=>g.spec.id==='PH-T15').reduce((s,g)=>s+g.layout.stocks.length,0));
  await edit('[data-quote-price="'+ids.body+'"]',22000);
  expect(await p.evaluate(()=>db.materials[0].price)).toBe(catalogPrice);
  await expect(p.locator('[data-quote-price="'+ids.cover+'"]')).toHaveValue('22000');
  expect(await p.evaluate(()=>result.groups.filter(g=>g.spec.id==='PH-T15').reduce((s,g)=>s+g.layout.stocks.length,0))).toBe(stockCount);
  await p.locator('[data-ux="price-ops"][data-id="'+ids.component+'"]').click();
  const undoCount=await p.evaluate(()=>UX.undo.length);
  await p.locator('#dialog [data-op-mode="0"]').selectOption('outside');
  expect(await p.evaluate(()=>UX.undo.length)).toBe(undoCount+1);
  await p.locator('#dialog [data-action=close]').first().click();
  await p.screenshot({path:'artifacts/ux-chi-phi-theo-ma.png',fullPage:true});
  // Catalog dimensional filters combine with diacritic-insensitive search.
  await p.locator('[data-page="materials"]').click();
  await p.locator('[data-catalog-filter="shape"]').selectOption('sheet');
  await edit('[data-catalog-filter="T"]',1.5);await p.locator('[data-catalog-filter="grade"]').selectOption('CT3');
  await expect(p.locator('#content tbody tr')).toHaveCount(1);
  await p.locator('#catalog-search').fill('thep');await expect(p.locator('#content tbody tr')).toHaveCount(1);
  await p.locator('[data-ux="clear-filters"]').click();
  // Missing code can be created without losing the basket or product context.
  await p.locator('[data-page="quote"]').click();await p.locator('[data-tab="bom"]').click();
  await p.locator('[data-action="add-material"]').first().click();
  await p.locator('[data-basket-id="LK-M8"]').check();await p.locator('[data-ux="create-in-picker"]').click();
  await p.locator('#dialog [data-action=close]').first().click();await expect(p.locator('#basket-summary')).toContainText('1 mã');
  await p.locator('[data-ux="create-in-picker"]').click();
  await p.locator('#dialog [name=id]').fill('PH-I100');await p.locator('#dialog [name=name]').fill('Thép I thử nghiệm');await p.locator('#dialog [name=shape]').selectOption('i');
  await expect(p.locator('#dialog [name=TF]')).toHaveValue('4');await submit();
  await expect(p.locator('#basket-summary')).toContainText('2 mã');await submit();
  expect(await p.evaluate(()=>result.errors)).toEqual([]);
  // Persistence, mobile boundaries, actual keyboard 3D and fresh delivery screenshots.
  const saved=await p.evaluate(()=>result.total.grand);await p.reload();expect(await p.evaluate(()=>result.total.grand)).toBe(saved);
  await seed();await p.screenshot({path:'artifacts/ux-nhap-nhanh.png',fullPage:true});
  await p.locator('[data-action="quick-3d"]').first().click();const model=p.locator('#dialog .model-scene'),style=await model.getAttribute('style');await p.locator('#dialog .model-stage').press('ArrowRight');expect(await model.getAttribute('style')).not.toBe(style);await p.locator('#dialog [data-action=close]').first().click();
  await p.setViewportSize({width:390,height:844});
  for(const t of ['bom','pricing','mass','waste','preview']){await p.evaluate(t=>{tab=t;render();},t);expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}
  await p.evaluate(()=>{tab='bom';render();});await p.screenshot({path:'artifacts/ux-mobile.png',fullPage:true});
  expect(errors).toEqual([]);console.log('UX passed: linked keyboard entry, undo/redo, custom dimensions, batch picker, variants, atomic Excel paste, bulk operations, 4 cost types, catalog filters, inline catalog creation, persistence, 3D and mobile.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
