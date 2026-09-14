const {chromium,expect}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
(async()=>{
  const fallback=path.join(process.env.LOCALAPPDATA||'','ms-playwright','chromium-1228','chrome-win64','chrome.exe');
  const browser=await chromium.launch({headless:true,...(fs.existsSync(fallback)?{executablePath:fallback}:{})});
  const offline=process.argv.includes('--offline'),p=await browser.newPage({viewport:{width:1600,height:1100},offline}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(offline?pathToFileURL(path.resolve('dist/index.html')).href:'http://127.0.0.1:4173');
  await p.getByRole('button',{name:'Cây chi tiết & 3D',exact:true}).click();
  const ids=await p.evaluate(()=>({product:db.quote.products[0].id,component:db.quote.products[0].children[0].id,material:db.quote.products[0].children[0].children[0].id,unit:db.quote.products[0].children[2].id,frame:db.quote.products[1].id}));
  const pick=async id=>p.locator('.tree-node[data-select="'+id+'"]').click();
  const meshes=()=>p.locator('.viewer3d .model-scene polygon');
  for(const id of [ids.product,ids.component,ids.material]){await pick(id);await expect(p.locator('.viewer3d')).toHaveCount(1);expect(await meshes().count()).toBeGreaterThan(0);}
  // Reproduce the customer's screenshot: PH-T15 now has its own preview beside editable dimensions.
  await expect(p.locator('.model-dimensions')).toContainText('300');
  const before=await p.locator('.model-scene').getAttribute('data-geometry');await p.locator('[data-dimension=W]').fill('400');await p.locator('[data-dimension=W]').press('Tab');
  await expect(p.locator('.model-dimensions')).toContainText('400');expect(await p.locator('.model-scene').getAttribute('data-geometry')).not.toBe(before);
  await p.locator('[data-model-action=unfold]').click();await expect(p.locator('.model-mode')).toContainText('Phôi khai triển');await expect(p.locator('.model-dimensions')).toContainText('530');
  await p.locator('[data-model-action=unfold]').click();
  await p.locator('.material-3d-split').screenshot({path:'artifacts/3d-vat-tu-kich-thuoc.png'});
  const saved=await p.evaluate(()=>JSON.stringify(db));
  await expect(p.locator('[data-dimension-label=L]')).toHaveAttribute('data-measured-value','2000');
  await p.locator('[data-model-action=dimensions]').click();await expect(p.locator('.model-measure')).toHaveCount(0);
  await p.locator('[data-model-action=dimensions]').click();await expect(p.locator('[data-dimension-label=W]')).toHaveAttribute('data-measured-value','400');
  await p.locator('[data-model-action=scope][data-value=product]').click();await expect(p.locator('.model-context-note')).toContainText('tô cam');
  expect(await meshes().evaluateAll(nodes=>new Set(nodes.map(n=>n.getAttribute('data-mesh-id'))).size)).toBe(2);
  await p.locator('[data-model-action=scope][data-value=selected]').click();
  const style=await p.locator('.model-scene').getAttribute('style');await p.locator('.model-stage').press('ArrowRight');expect(await p.locator('.model-scene').getAttribute('style')).not.toBe(style);
  await p.locator('[data-model-action=camera][data-value=side]').click();await p.locator('[data-model-action=zoom-in]').click();await p.locator('[data-action=reset-3d]').click();
  expect(await p.evaluate(()=>JSON.stringify(db))).toBe(saved);
  // Expansion creates an independent scoped viewport; closing it leaves the inline view intact.
  await p.locator('[data-model-action=expand]').click();await expect(p.locator('#dialog .model-scene')).toHaveCount(1);await p.locator('#dialog .model-stage').press('ArrowLeft');
  await p.locator('#dialog [data-action=close]').first().click();await expect(p.locator('#content .model-scene')).toHaveCount(1);
  await pick(ids.frame);await expect(p.locator('.model-mode')).toContainText('Khung theo mẫu');
  await p.locator('[data-model-action=camera][data-value=iso]').click();
  await p.locator('.viewer3d').screenshot({path:'artifacts/3d-khung-theo-mau.png'});
  await p.locator('[data-model-action=expand]').click();await p.locator('#dialog').screenshot({path:'artifacts/3d-studio-mo-rong.png'});await p.locator('#dialog [data-action=close]').first().click();
  await p.locator('[data-model-action=explode]').click();await expect(p.locator('.model-note')).toContainText('không phải vị trí lắp ghép');
  await p.locator('[data-model-part]').selectOption(await p.evaluate(()=>db.quote.products[1].children[0].children[0].id));await expect(p.locator('.model-dimensions')).toContainText('40');
  // Unit-only items retain an explicit viewer area and can return to their containing product.
  await pick(ids.unit);await expect(p.locator('.model-empty')).toBeVisible();await expect(p.locator('.model-stage')).toHaveCount(0);
  await p.locator('[data-model-action=scope][data-value=product]').click();expect(await meshes().count()).toBeGreaterThan(0);await expect(p.locator('.model-context-note')).toContainText('chưa có hình học');
  await p.locator('[data-model-action=scope][data-value=selected]').click();
  // Isolated fixture: all supported physical shapes through the real tree and renderer.
  const shapes=await p.evaluate(()=>{
    const source=C.copy(db.quote.products[1].children[0].children[0]);const cases=[['sheet',{T:2}],['box',{W:40,H:60,T:2}],['pipe',{D:60,T:2}],['round',{D:50}],['solid',{W:40,H:60}],['angle',{W:50,H:80,T:5}],['u',{W:50,H:100,T:5}],['c',{W:50,H:100,T:5}],['h',{W:100,H:150,T:5,TF:8}],['i',{W:100,H:150,T:5,TF:8}]];
    const product={id:'test-3d',kind:'product',name:'Các tiết diện kiểm tra',qty:1,children:[],ops:[]};
    for(const [shape,props]of cases){const n=C.cloneNode(source);n.spec.shape=shape;n.spec.props=props;n.name='Kiểm tra '+shape;n.spec.id=n.materialId='TEST-'+shape;n.dims={L:1000,W:300};delete n.paramLinks;n.rule=shape==='sheet'?'flat':'bar';n.ruleSpec=C.copy(db.rules.find(r=>r.id===n.rule));product.children.push(n);}
    db.quote.products.push(product);selected=product.id;render();return product.children.map(n=>({id:n.id,shape:n.spec.shape}));
  });
  for(const item of shapes){await pick(item.id);expect(await meshes().count(),item.shape).toBeGreaterThan(0);await expect(p.locator('.model-warning')).toHaveCount(0);await expect(p.locator('.model-dimensions')).toContainText('1.000');if(['pipe','h'].includes(item.shape)){await p.locator('[data-model-action=camera][data-value=side]').click();await p.locator('.viewer3d').screenshot({path:'artifacts/3d-tiet-dien-'+item.shape+'.png'});}}
  await pick('test-3d');await expect(p.locator('.model-note')).toContainText('không phải vị trí lắp ghép');expect(await meshes().evaluateAll(ns=>new Set(ns.map(n=>n.dataset.meshId)).size)).toBe(shapes.length);
  // Mobile boundary and interactive material preview remain usable.
  await pick(ids.material);await p.locator('[data-model-action=camera][data-value=iso]').click();await p.setViewportSize({width:390,height:844});expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await p.locator('.viewer3d').screenshot({path:'artifacts/3d-mobile.png'});await p.locator('.model-stage').press('ArrowRight');
  // A new empty product offers a usable next step, not a fabricated default model.
  await p.setViewportSize({width:1600,height:1100});await p.locator('.tree-footer [data-action=add-product]').click();
  await p.locator('#dialog [name=template]').selectOption('');await p.locator('#dialog [name=name]').fill('Sản phẩm mới kiểm tra 3D');await p.locator('#dialog button[type=submit]').click();
  await expect(p.locator('.model-empty')).toBeVisible();await expect(p.locator('.model-scene')).toHaveCount(0);
  await p.locator('[data-model-action=add-material]').click();await expect(p.locator('#dialog-title')).toContainText('Sản phẩm mới kiểm tra 3D');
  await p.locator('#pick-search').fill('PH-T20');await p.locator('[data-basket-id="PH-T20"]').check();await p.locator('#dialog button[type=submit]').click();
  expect(await meshes().count()).toBeGreaterThan(0);await expect(p.locator('.model-empty')).toHaveCount(0);
  expect(errors).toEqual([]);await browser.close();console.log('3D UI passed'+(offline?' offline':'')+': product/component/material preview, live dimensions, unfolding, context highlighting, camera/zoom, expand, frame/parts, all 10 shapes, explicit non-geometric items, mobile.');
})().catch(e=>{console.error(e);process.exit(1);});
