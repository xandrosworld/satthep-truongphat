'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Production-flow-browser-2026!'}));const d=TPPrice.demoSeed();d.quote.products=[d.quote.products[0]];d.quote.products[0].qty=1;d.quote.remnantMode='all';d.quote.remnantSelections={};const q=await teamApi('quotes','POST',{document:d});await teamApi('quotes/'+q.id+'/submit','POST',{expectedVersion:1});await teamApi('quotes/'+q.id+'/approve','POST',{expectedVersion:2});const o=await teamApi('quotes/'+q.id+'/order','POST',{expectedVersion:3,code:'UI-FLOW'});await teamApi('orders/'+o.id+'/confirm','POST',{quoteVersion:3});const j=await teamApi('production','POST',{orderId:o.id,productId:d.quote.products[0].id,quantity:1,code:'LSX-UI-FLOW'});await teamApi('production/'+j.id+'/dossier','POST',{expectedVersion:j.version,requirements:'Test requirements',noDrawingReason:'Verified test specification',reviewed:true,reviewChecks:{input:true,structure:true,operations:true,quantities:true},equipment:j.packet.operations.map(o=>({operationId:o.id,machine:o.machine||'Manual',method:'Verified drawing'}))});const ds=(await teamApi('ops/job/'+j.id)).requirements;for(const r of ds){await teamApi('ops/master','POST',{requestId:crypto.randomUUID(),kind:'material',expectedVersion:0,document:{id:r.materialId,code:r.materialId,name:r.name||r.materialId,unit:r.unit,form:r.unit==='tấm'?'sheet':'bulk'}});const l=await teamApi('ops/receipt','POST',{requestId:crypto.randomUUID(),materialId:r.materialId,quantity:r.quantity,warehouse:'Kho A',unitWeight:10,unitCost:20,length:r.length,width:r.width,thickness:r.thickness||1,reference:'PN-UI'});await teamApi('ops/reserve','POST',{requestId:crypto.randomUUID(),jobId:j.id,lotId:l.id,quantity:r.quantity});}productionShell().showModal();Production.people=await teamApi('production/people');await productionLoad();await productionLoad(j.id);});

 for(const width of [320,390,430]){
  await p.setViewportSize({width,height:844});
  for(const tab of ['content','preparation','operations']){
   await p.locator('.production-tabs [data-production-tab='+tab+']').click();
   await p.waitForTimeout(150);
   expect(await p.locator('#production-console').evaluate(el=>el.scrollWidth<=el.clientWidth+2)).toBe(true);
   expect(await p.locator('#production-main').evaluate(el=>el.scrollWidth<=el.clientWidth+2)).toBe(true);
   if(tab==='content'){
    expect(await p.locator('.order-sheet-info').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(1);
    const table=p.locator('.order-sheet-products');expect(await table.evaluate(el=>el.scrollWidth>el.clientWidth)).toBe(true);
    await table.evaluate(el=>el.scrollLeft=100);expect(await table.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
    await p.screenshot({path:'artifacts/production-reading-'+width+'.png'});
   }
  }
 }
 await p.setViewportSize({width:1440,height:1000});await p.locator('.production-tabs [data-production-tab=content]').click();
 expect(await p.locator('.order-sheet-info').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(2);
 await p.emulateMedia({media:'print'});expect(await p.locator('.order-sheet-products').evaluate(el=>getComputedStyle(el).display)).toBe('table');
 expect(errors).toEqual([]);console.log('PASS production reading at 320/390/430px: content, review, operations; tables scroll; desktop and print preserved');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
