'use strict';
const {chromium,expect}=require('@playwright/test'),{pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));try{
 await p.goto(pathToFileURL(path.resolve('dist/index.html')).href);
 await p.evaluate(()=>{db=TPPrice.demoSeed();const product=db.quote.products[0];db.quote.products=Array.from({length:25},()=>C.cloneNode(product));db.quote.ratesSnapshot.push(...Array.from({length:12},(_,i)=>({...C.copy(db.quote.ratesSnapshot[0]),id:'scroll-rate-'+i,name:'Extra operation '+i})));db.quote.products[0].ops.push(...db.quote.ratesSnapshot.filter(r=>r.id.startsWith('scroll-rate-')).map(r=>({id:r.id,mode:'inside',amount:1})));page='quote';tab='operations';render();});
 const matrix=p.locator('[data-operation-quote]');
 const position=()=>p.evaluate(()=>{const el=document.querySelector('[data-operation-quote]');return [el.scrollTop,el.scrollLeft,scrollY];});
 await matrix.evaluate(el=>{el.scrollTop=1200;el.scrollLeft=150;});
 let before=await position();expect(before[0]).toBeGreaterThan(500);expect(before[1]).toBeGreaterThan(0);
 await p.evaluate(()=>render());expect(await position()).toEqual(before);
 // Use a real cell button in the middle of the scrolled matrix, then save twice.
 for(let i=0;i<2;i++){
  const target=await matrix.locator('[data-technical-operation]').evaluateAll(els=>{const box=document.querySelector('[data-operation-quote]').getBoundingClientRect();const el=els.find(x=>{const r=x.getBoundingClientRect();return r.top>box.top+80&&r.bottom<box.bottom-20&&r.left>box.left&&r.right<box.right;});return el?{id:el.dataset.id,index:el.dataset.index}:null;});
  expect(target).not.toBeNull();
  await p.locator('[data-technical-operation][data-id="'+target.id+'"][data-index="'+target.index+'"]').click();
  before=await position();
  await p.locator('#dialog [name=declareQuantity]').check();await p.locator('#dialog [name=basisMode]').selectOption('manual_unit');await p.locator('#dialog [name=quantity]').fill(String(7+i));
  await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
  expect(await position()).toEqual(before);
  expect(await p.evaluate(t=>C.findNode(db.quote.products,t.id).ops[Number(t.index)].workQuantity,target)).toBe(7+i);
 }
 // A different quote must not inherit the previous quote's scroll position.
 await p.evaluate(()=>{db=TPPrice.demoSeed();db.quote.id="OTHER-QUOTE";render();});expect((await position())[0]).toBe(0);
 expect(errors).toEqual([]);console.log('PASS operation matrix scroll retained on full refresh and repeated real modal saves; quantity persisted; different quote starts fresh');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

