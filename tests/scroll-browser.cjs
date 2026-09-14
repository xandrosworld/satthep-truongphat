const {chromium,expect}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
  const fallback=path.join(process.env.LOCALAPPDATA||'','ms-playwright','chromium-1228','chrome-win64','chrome.exe');
  const browser=await chromium.launch({headless:true,...(fs.existsSync(fallback)?{executablePath:fallback}:{})});
  try{
    const offline=process.argv.includes('--offline'),p=await browser.newPage({viewport:{width:1512,height:1000},offline}),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(offline?pathToFileURL(path.resolve('dist/index.html')).href:'http://127.0.0.1:4173');
    await p.locator('[data-ux=detail-mode]').click();
    const rows=await p.evaluate(()=>C.flatten(db.quote.products).filter(n=>n.kind==='material'&&n.spec.shape==='box').map(n=>n.id));
    const position=()=>p.locator('.tree-body').evaluate(el=>el.scrollTop);
    const assertPosition=async value=>expect(Math.abs(await position()-value)).toBeLessThanOrEqual(1);
    // Real pointer clicks, with no Playwright auto-scroll between measuring and clicking.
    for(const id of rows.slice().reverse()){
      const row=p.locator('.tree-node[data-select="'+id+'"]');await row.scrollIntoViewIfNeeded();
      const before=await position();expect(before).toBeGreaterThan(0);const box=await row.boundingBox();
      await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await assertPosition(before);
      await expect(row).toHaveClass(/selected/);await expect(row).toBeFocused();
    }
    const before=await position();await p.keyboard.press('Enter');await assertPosition(before);
    await p.locator('[data-dimension=L]').fill('900');await p.locator('[data-dimension=L]').press('Tab');await assertPosition(before);
    // A full redraw after undo and after returning from another tab preserves the tree viewport.
    await p.locator('[data-action=ux-undo]').click();await assertPosition(before);
    await p.locator('[data-tab=mass]').click();await p.locator('[data-tab=bom]').click();await assertPosition(before);
    await p.locator('[data-page=materials]').click();await p.locator('[data-page=quote]').click();await assertPosition(before);
    await p.locator('[data-ux=quick-mode]').click();await p.locator('[data-ux=detail-mode]').click();await assertPosition(before);
    // Inserting above the viewport changes scrollTop but must not move the visible row.
    const anchor=await p.locator('.tree-body').evaluate(tree=>{const top=tree.getBoundingClientRect().top,row=[...tree.querySelectorAll('[data-select]')].find(r=>r.getBoundingClientRect().bottom>top);return {id:row.dataset.select,offset:row.getBoundingClientRect().top-top};});
    await p.evaluate(()=>mutation(()=>db.quote.products.unshift(C.cloneNode(db.quote.products[0]))));
    const anchorOffset=await p.locator('.tree-node[data-select="'+anchor.id+'"]').evaluate(row=>row.getBoundingClientRect().top-row.closest('.tree-body').getBoundingClientRect().top);
    expect(Math.abs(anchorOffset-anchor.offset)).toBeLessThanOrEqual(1);
    await p.locator('[data-action=ux-undo]').click();await assertPosition(before);
    await p.locator('.tree-panel').screenshot({path:'artifacts/tree-scroll-preserved.png'});
    // Repeat on a small display with the actual nested scrollbar.
    await p.setViewportSize({width:390,height:844});
    const row=p.locator('.tree-node[data-select="'+rows.at(-1)+'"]');await row.scrollIntoViewIfNeeded();const mobileBefore=await position(),box=await row.boundingBox();
    await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await assertPosition(mobileBefore);
    expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    expect(errors).toEqual([]);console.log('Scroll regression passed'+(offline?' offline':'')+': repeated real tree clicks, keyboard focus, dimension edit, undo, tabs, page navigation, entry modes, insertion above viewport and mobile.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
