const {chromium,expect}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
  const fallback=path.join(process.env.LOCALAPPDATA||'','ms-playwright','chromium-1228','chrome-win64','chrome.exe'),browser=await chromium.launch({headless:true,...(fs.existsSync(fallback)?{executablePath:fallback}:{})});
  try{
    const offline=process.argv.includes('--offline'),p=await browser.newPage({offline}),errors=[];p.on('pageerror',e=>errors.push(e.message));
    await p.goto(offline?pathToFileURL(path.resolve('dist/index.html')).href:'http://127.0.0.1:4173');
    let count=0;
    for(const width of [1512,1024,390]){
      await p.setViewportSize({width,height:1000});
      for(const page of ['materials','library','rates','rules','quote']){
        const nav=p.locator('[data-page="'+page+'"]').first();
        if(width<=700)await p.locator('.mobile-menu').click();await nav.click();
        await expect(p.locator('h1')).toBeVisible();await expect(p.locator('#content')).not.toBeEmpty();
        expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),page+' at '+width).toBe(true);count++;
        if(page==='rates'){await p.locator('[data-rate-tab=operations]').click();await expect(p.locator('[data-rate-id]').first()).toBeVisible();}
      }
      for(const tab of ['bom','waste','mass','pricing','preview']){
        await p.locator('[data-tab="'+tab+'"]').click();await expect(p.locator('[data-tab="'+tab+'"]')).toHaveAttribute('aria-selected','true');
        expect(await p.locator('.workspace-tabs').evaluate(bar=>{const active=bar.querySelector('[aria-selected=true]').getBoundingClientRect(),bounds=bar.getBoundingClientRect();return active.left>=bounds.left-1&&active.right<=bounds.right+1;}),'active tab remains visible: '+tab+' at '+width).toBe(true);
        expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),tab+' at '+width).toBe(true);
        await expect(p.locator('.notice.error')).toHaveCount(0);count++;
      }
      await p.screenshot({path:'artifacts/site-review-'+width+'.png',fullPage:true});
    }
    expect(errors).toEqual([]);console.log('Site review passed'+(offline?' offline':'')+': '+count+' page/tab viewport checks across desktop, tablet and mobile; navigation, active tab visibility, content, overflow, operation rates and runtime errors.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
