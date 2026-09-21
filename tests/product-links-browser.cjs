const {chromium,expect}=require('@playwright/test'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(pathToFileURL(path.resolve('artifacts/gd1-report-2026-09-20/release/dist/index.html')).href);
const ids=await p.evaluate(()=>{db=TPPrice.demoSeed();page='quote';tab='bom';UX.mode='quick';const product=db.quote.products[0];product.params={L:800,W:300,H:1200};render();return {p:product.id,n:C.scopedLeaves(product).find(n=>n.spec.shape==='sheet').id};});
await p.locator('[data-ux=configure-links][data-id="'+ids.p+'"]').first().click();
const tool=p.locator('[data-link-node="'+ids.n+'"][data-link-key=L]'),input=p.locator('[name="'+ids.n+'_L"]');
await input.fill('');await tool.locator('[data-link-insert=PRODUCT_L]').click();await input.press('End');await input.type(' - 20');await expect(tool.locator('output')).toContainText('780');
await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();expect(await p.evaluate(id=>C.findNode(db.quote.products,id).dims.L,ids.n)).toBe(780);
await p.reload();expect(await p.evaluate(id=>C.findNode(db.quote.products,id).dimensionLinks.L.expression,ids.n)).toBe('PRODUCT_L - 20');
await p.evaluate(id=>{window.originalWritable=inWritable;inWritable=()=>{throw Error('Locked quote');};configureLinks(id);},ids.p);await expect(p.locator('#dialog .notice').first()).toContainText('Locked quote');await expect(input).toBeDisabled();expect(await p.locator('#dialog button[type=submit]').count()).toBe(0);
await p.evaluate(()=>{closeDialog();inWritable=window.originalWritable;Team.user={id:'test'};Team.permissions={formulaView:true,formulaEdit:false};});await p.evaluate(id=>configureLinks(id),ids.p);await expect(input).toBeDisabled();expect(await p.locator('#dialog button[type=submit]').count()).toBe(0);
await p.evaluate(id=>{closeDialog();Team.loaded=true;Team.permissions={formulaView:true,formulaEdit:true,edit:true,reopen:true};window.originalCurrent=teamCurrent;teamCurrent=()=>({status:'approved',readOnly:false});configureLinks(id);},ids.p);
await expect(p.locator('[data-link-reopen]')).toBeVisible();
await expect(p.locator('.dialog-footer .link-readonly-notice')).toBeVisible();
await p.locator('[data-link-reopen]').click();await expect(p.locator('#dialog-title')).toHaveText('Tạo bản sửa');await expect(p.locator('#dialog [name=reason]')).toBeVisible();
await p.evaluate(()=>{closeDialog();Team.loaded=false;teamCurrent=window.originalCurrent;Team.user=null;});await p.evaluate(id=>configureLinks(id),ids.p);
for(const width of [1100,600]){await p.setViewportSize({width,height:900});expect(await p.locator('.link-formula-tools').first().evaluate(el=>[...el.querySelectorAll('button')].every(b=>b.getBoundingClientRect().right<=el.closest('table').getBoundingClientRect().right+1))).toBe(true);}
await p.evaluate(()=>{Team.user={id:'test'};Team.permissions={formulaView:false};});
await p.evaluate(()=>{closeDialog();Team.permissions.formulaView=false;});await p.evaluate(id=>configureLinks(id),ids.p);await expect(p.locator('#dialog')).not.toBeVisible();expect(errors).toEqual([]);console.log('PASS formula insertion, preview, apply, reload, locked view and formula permissions');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
