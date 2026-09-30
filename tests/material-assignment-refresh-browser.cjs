const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));try{
 await page.goto('http://127.0.0.1:'+app.server.address().port);await page.locator('#team-entry').click();await page.locator('#dialog [name=username]').fill('admin');await page.locator('#dialog [name=name]').fill('QA');await page.locator('#dialog [name=password]').fill('Provisional-browser-local-42!');await page.locator('#dialog button[type=submit]').click();await expect.poll(()=>page.evaluate(()=>!!Team.user)).toBe(true);await page.locator('#dialog [data-action=close]').first().click();
 await page.evaluate(async()=>{const q=await teamApi('quotes','POST',{document:TPPrice.demoSeed()});await teamLoad(q.id);});

 const target=await page.evaluate(()=>{const n=C.flatten(db.quote.products).find(n=>n.kind==='material');mutation(()=>{n.qty=4;n.dims={...n.dims,L:2462.5,W:160};});return {id:n.id,qty:n.qty,dims:C.copy(n.dims),ops:C.copy(n.ops)};});
 const master=JSON.parse(app.sql.prepare('SELECT document FROM catalog WHERE id=1').get().document),material={...master.materials.find(m=>m.shape==='sheet'),id:'VT-NEW-PUBLISHED',name:'Published after quote opened'};master.materials.push(material);app.sql.prepare('UPDATE catalog SET document=?,version=version+1 WHERE id=1').run(JSON.stringify(master));
 await page.evaluate(async id=>{CatalogDraft.published=null;await dfAssign(id);},target.id);
 await expect(page.locator('#dialog select[name=material] option[value=VT-NEW-PUBLISHED]')).toHaveCount(1);
 await page.locator('#dialog select[name=material]').selectOption('VT-NEW-PUBLISHED');await page.locator('#dialog button[type=submit]').click();
 const changed=await page.evaluate(id=>{const n=C.findNode(db.quote.products,id);return {id:n.materialId,draft:!!n.draftMaterial,qty:n.qty,dims:n.dims,ops:n.ops};},target.id);
 expect(changed.id).toBe(material.id);expect(changed.draft).toBe(false);expect(changed.qty).toBe(target.qty);expect(changed.dims).toEqual(target.dims);expect(changed.ops).toEqual(target.ops);
 await page.evaluate(async id=>{db.materials.push({...C.copy(db.materials[0]),id:'LOCAL-UNPUBLISHED'});await dfAssign(id);},target.id);
 await expect(page.locator('#dialog option[value=LOCAL-UNPUBLISHED]')).toContainText('danh m');
 await page.locator('#dialog select[name=material]').selectOption('LOCAL-UNPUBLISHED');await page.locator('#dialog button[type=submit]').click();expect(await page.evaluate(id=>C.findNode(db.quote.products,id).draftMaterial,target.id)).toBe(true);
 expect(errors).toEqual([]);console.log('PASS fresh published choice, stale cache, preserved dimensions/quantity/operations, unpublished remains draft');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
