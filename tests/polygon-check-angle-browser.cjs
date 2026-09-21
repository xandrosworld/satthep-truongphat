const {chromium,expect}=require('@playwright/test'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));try{
await p.goto(pathToFileURL(path.resolve('artifacts/gd1-report-2026-09-20/release/dist/index.html')).href);
for(let n=4;n<=10;n++){
await p.evaluate(n=>{page='rules';render();dfShapeEdit(null,{...DFC().polygonPreset('interior',n),id:'QA-CHECK-'+n,name:'Đa giác '+n});},n);
await expect(p.locator('[name=polygonCheckAngle]')).toBeVisible();await expect(p.locator('[data-df-check-angle]')).toContainText('A'+(n-2));
await p.locator('[name=polygonCheckAngle]').fill(String((n-2)*180/n));await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');
await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();}
await p.reload();await p.evaluate(()=>dfShapeEdit('QA-CHECK-5'));await expect(p.locator('[name=polygonCheckAngle]')).toHaveValue('108');
await p.locator('[name=polygonCheckAngle]').fill('90');await expect(p.locator('#definition-preview')).toContainText('Góc kiểm tra không khớp');await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog-error')).toContainText('Góc kiểm tra');
await p.locator('[name=polygonCheckAngle]').fill('');await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');await p.locator('#dialog button[type=submit]').click();expect(await p.evaluate(()=>db.shapeDefinitions.find(d=>d.id==='QA-CHECK-5').polygon.checkAngle)).toBeUndefined();
await p.evaluate(()=>{ReviewUI.open.set('shape-advanced',true);dfShapeEdit('QA-CHECK-5');});await expect(p.locator('[name=key1] option:checked')).toHaveText('C1 — Cạnh 1');
await p.setViewportSize({width:390,height:850});await p.locator('[name=polygonCheckAngle]').scrollIntoViewIfNeeded();await expect(p.locator('[name=polygonCheckAngle]')).toBeInViewport();
await p.evaluate(()=>{closeDialog();dfShapeEdit(null,{...DFC().polygonPreset('triangle',3),id:'QA-TRI',name:'Tam giác'});});await expect(p.locator('[name=polygonCheckAngle]')).toHaveCount(0);await expect(p.locator('#definition-preview')).toHaveAttribute('data-valid','true');
expect(errors).toEqual([]);console.log('PASS optional n-2 angle, 4–10 sides, save/reload, mismatch blocked, blank clears, names and mobile; triangle unchanged');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
