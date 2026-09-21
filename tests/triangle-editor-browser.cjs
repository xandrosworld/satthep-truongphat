'use strict';
const {chromium,expect}=require('@playwright/test'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{
 const build=path.resolve(process.env.UNFOLD_BUILD||'artifacts/gd1-report-2026-09-20/release/dist/index.html'),dir='artifacts/customer-review/triangle-editor';fs.mkdirSync(dir,{recursive:true});
 const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1560,height:1050}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const close=()=>p.locator('#dialog .dialog-head [data-action=close]').click();
 try{
  await p.goto(pathToFileURL(build).href);await p.evaluate(()=>ReviewUI.open.set('shape-advanced',true));
  await p.evaluate(()=>{page='rules';RulesCatalog.kind='shapes';render();dfShapeEdit(null,{...DFC().polygonPreset('edges',3),id:'QA-THREE-SIDES',name:'Tam giác giữ công thức'});});
  await p.locator('[name=sample1]').fill('290');await p.locator('[name=outputFormula0]').fill('C1 + 10');await p.locator('[name=outputName0]').fill('Cạnh riêng');
  await p.locator('#definition-fields [name=key2]').locator('..').locator('..').locator('..').locator('[data-definition=drop-field]').click();
  await expect(p.locator('[name=polygonKind]')).toHaveValue('triangle');await expect(p.locator('[name=sample1]')).toHaveValue('290');await expect(p.locator('[name=outputFormula0]')).toHaveValue('C1 + 10');await expect(p.locator('[name=outputName0]')).toHaveValue('Cạnh riêng');
  await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');expect(Number(await p.locator('[data-df-result=blankSurface]').getAttribute('data-value'))).toBeCloseTo(Math.sqrt(3)*300*300/4e6,8);
  await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
  const saved=await p.evaluate(()=>db.shapeDefinitions.find(d=>d.id==='QA-THREE-SIDES'));expect(saved.polygon.kind).toBe('triangle');expect(saved.polygon.angles).toBeUndefined();expect(saved.fields.map(f=>f.key)).toEqual(['T','C1','C2','C3']);
  await p.reload();await p.evaluate(()=>ReviewUI.open.set('shape-advanced',true));await p.evaluate(()=>dfShapeEdit('QA-THREE-SIDES'));await expect(p.locator('[name=sample1]')).toHaveValue('290');await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');
  await p.locator('[name=sample1]').fill('1000');await expect(p.locator('#definition-preview')).toContainText('không tạo thành tam giác');await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog-error')).toContainText('không tạo thành tam giác');await close();
  // A saved legacy draft with missing angle inputs repairs without rewriting formulas or the saved source.
  await p.evaluate(()=>{const d={...DFC().polygonPreset('edges',3),id:'QA-INCOMPLETE',name:'Tam giác cũ'};d.fields=d.fields.filter(f=>!['G2','G3'].includes(f.key));db.shapeDefinitions.push(d);dfShapeEdit(d.id);});
  await expect(p.locator('[name=polygonKind]')).toHaveValue('triangle');await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');expect(await p.evaluate(()=>db.shapeDefinitions.find(d=>d.id==='QA-INCOMPLETE').polygon.kind)).toBe('edges');await close();
  await p.evaluate(()=>dfShapeEdit(null,{...DFC().polygonPreset('edges',3),id:'QA-CONVERT',name:'Tam giác chuyển cách khai'}));await p.locator('[name=sample1]').fill('350');await p.locator('[data-df-triangle-only]').click();await expect(p.locator('[name=sample1]')).toHaveValue('350');await expect(p.locator('[name=polygonKind]')).toHaveValue('triangle');await close();
  // Changing the visible mode must update the draft without requiring the preset button.
  await p.evaluate(()=>{const d={...DFC().polygonPreset('edges',3),id:'QA-DROPDOWN',name:'Đổi trực tiếp ba cạnh'};d.fields.find(f=>f.key==='G1').unit='mm';dfShapeEdit(null,d);});
  await p.locator('[name=sample1]').fill('290');await p.locator('[name=outputFormula0]').fill('C1 + 10');await p.locator('[name=testStockL]').fill('2440');
  await p.locator('[name=polygonKind]').selectOption('triangle');await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');await expect(p.locator('[name=sample1]')).toHaveValue('290');await expect(p.locator('[name=outputFormula0]')).toHaveValue('C1 + 10');await expect(p.locator('[name=testStockL]')).toHaveValue('2440');
  await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();await p.reload();await p.evaluate(()=>ReviewUI.open.set('shape-advanced',true));await p.evaluate(()=>dfShapeEdit('QA-DROPDOWN'));await expect(p.locator('[name=polygonKind]')).toHaveValue('triangle');await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');await close();
  await p.evaluate(()=>dfShapeEdit(null,{...DFC().polygonPreset('regular',3),id:'QA-REGULAR',name:'Tam giác từ đa giác đều'}));await p.locator('[name=sample1]').fill('350');await p.locator('[name=polygonKind]').selectOption('triangle');await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');await close();
  // Four-sided polygons still require angles; the triangle correction must not weaken this check.
  await p.evaluate(()=>dfShapeEdit(null,{...DFC().polygonPreset('edges',4),id:'QA-FOUR',name:'Tứ giác'}));await p.locator('[name=polygonKind]').selectOption('triangle');await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog-error')).toContainText('Tạo các cạnh và công thức');expect(await p.evaluate(()=>db.shapeDefinitions.some(d=>d.id==='QA-FOUR'))).toBe(false);await p.locator('[name=polygonKind]').selectOption('edges');await p.locator('[name=polygonCount]').fill('4');await p.locator('[data-definition=drop-field][data-id="2"]').click();await expect(p.locator('[name=polygonKind]')).toHaveValue('edges');await expect(p.locator('#definition-preview')).toContainText('G1');await close();
  await p.evaluate(()=>dfShapeEdit('QA-THREE-SIDES'));
  for(const width of [1560,1280,1024,800,390]){
   await p.setViewportSize({width,height:900});await p.locator('#definition-fields').scrollIntoViewIfNeeded();
   const metrics=await p.evaluate(()=>{const t=document.querySelector('#definition-fields'),d=document.querySelector('#dialog'),body=d.querySelector('.dialog-body'),box=t.getBoundingClientRect();return {tableFits:t.scrollWidth<=t.clientWidth+1,dialogFits:d.scrollWidth<=d.clientWidth+1,singleScroll:d.scrollHeight<=d.clientHeight+2,bodyScroll:body.scrollHeight>body.clientHeight,controlsFit:[...t.querySelectorAll('input,select,button')].every(e=>{const r=e.getBoundingClientRect();return r.left>=box.left-1&&r.right<=box.right+1;})};});
   expect(metrics).toEqual({tableFits:true,dialogFits:true,singleScroll:true,bodyScroll:true,controlsFit:true});
   await p.locator('[data-definition=drop-output]').last().scrollIntoViewIfNeeded();await expect(p.locator('[data-definition=drop-output]').last()).toBeInViewport();await expect(p.locator('#dialog button[type=submit]')).toBeInViewport();await p.screenshot({path:dir+'/editor-'+width+'.png'});
  }
  expect(errors).toEqual([]);console.log('PASS direct dropdown conversion, pending topology changes blocked, deleting triangle angles, incomplete old draft and explicit conversion preserve dimensions/formulas; save/reload; invalid triangle and missing quadrilateral angles rejected; complete controls and single scroll at five widths');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
