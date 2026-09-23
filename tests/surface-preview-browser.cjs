'use strict';
const {chromium,expect}=require('@playwright/test'),{pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage();try{
 await p.goto(pathToFileURL(path.resolve('dist/index.html')).href);await p.evaluate(()=>{db=TPPrice.demoSeed();page='rules';const d={id:'SURFACE-QA',name:'Tam giác QA',...DFC().polygonPreset('triangle',3)};db.shapeDefinitions=[d];dfShapeEdit(d.id);});
 await p.locator('#dialog [name=surface]').evaluate(el=>{for(let x=el.parentElement;x;x=x.parentElement)if(x.tagName==='DETAILS')x.open=true;});
 const value=key=>p.locator('[data-df-result="'+key+'"]').getAttribute('data-value');
 await p.locator('#dialog [name=surface]').fill('1');await expect.poll(()=>value('surfacePiece')).toBe('0.06');const mass=await value('blankMass'),buy=await value('buyArea');
 await p.locator('#dialog [name=surface]').fill('2');await expect.poll(()=>value('surfacePiece')).toBe('0.12');expect(await value('blankSurface')).toBe('0.06');expect(await value('blankMass')).toBe(mass);expect(await value('buyArea')).toBe(buy);
 await expect(p.locator('[data-df-substitute=surfacePiece]')).toHaveText('0,06 × 2');await expect(p.locator('[data-df-substitute=totalSurface]')).toHaveText('0,12 × 1');await expect(p.locator('[data-df-explanation=buyArea]')).not.toContainText('× A');
 await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();await p.evaluate(()=>dfShapeEdit('SURFACE-QA'));expect(await value('surfacePiece')).toBe('0.12');
 console.log('PASS changing A updates visible per-piece/total surface immediately and after save; blank area, mass and purchased area stay unchanged');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

