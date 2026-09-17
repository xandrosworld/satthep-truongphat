'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),B=require('../batch-one-core.js'),C=require('../core.js'),P=require('../pricing-core.js'),T=require('../technical-core.js'),{createApp}=require('../server/app.cjs');
function geometryFixture(){const db=P.demoSeed(),spec=C.copy(db.materials.find(m=>m.shape==='sheet'));spec.props={T:1};spec.density=7850;const leaf={id:'leaf',kind:'material',name:'Plate',materialId:spec.id,qty:4,spec,dims:{L:1000,W:200},rule:'flat',ruleSpec:{id:'flat',name:'Flat',shape:'sheet',length:'L',width:'W'},ops:[]};db.quote.products=[{id:'product',kind:'product',name:'Product',qty:2,ops:[],children:[{id:'component',kind:'component',name:'Component',qty:3,ops:[],children:[leaf]},{...C.copy(leaf),id:'direct',qty:1}]}];return db;}
test('daily quotation codes use the highest suffix, handle gaps and rollover, and reject invalid dates',()=>{
 A.equal(B.nextQuoteCode('2026-09-17',['BG-20260917-001','BG-20260917-007','BG-20260916-999','BG-20260917-900-COPY']),'BG-20260917-008');
 A.equal(B.nextQuoteCode('2026-09-17',['BG-20260917-999']),'BG-20260917-1000');A.equal(B.nextQuoteCode('2026-09-18',[]),'BG-20260918-001');A.throws(()=>B.nextQuoteCode('2026-02-30'),/Ngày/);
});
test('technical totals sum leaf geometry once and multiply component quantities through the hierarchy',()=>{
 const db=geometryFixture(),s=B.technicalSummary(db.quote.products,C.calculate(db));A.ok(Math.abs(s.weight-40.82)<1e-9);A.ok(Math.abs(s.area-5.2)<1e-9);A.equal(s.components,6);A.equal(s.componentRows,1);A.equal(s.complete,true);
 db.quote.products[0].children[0].children[0].dims.L=0;const incomplete=B.technicalSummary(db.quote.products,C.calculate(db));A.equal(incomplete.complete,false);A.ok(incomplete.issues.some(s=>s.includes('Plate')));A.ok(Math.abs(incomplete.area-0.4)<1e-9);
 A.equal(B.technicalSummary([],{rows:[],nodes:{}}).complete,false);
});
test('technical auxiliary percentages round-trip without revealing or changing price inputs and are charged once',()=>{
 const db=geometryFixture(),view=T.project(db);view.quote.products[0].children[0].children[0].auxiliaryPercent=5;
 const merged=T.merge(db,view),calculated=P.calculate(merged),leaf=calculated.rows.find(r=>r.id==='leaf');A.ok(Math.abs(calculated.products[0].parts.allowance-leaf.cost*0.05)<1e-8);
 A.equal(T.project(merged).quote.products[0].children[0].children[0].auxiliaryPercent,5);A.equal(T.project(merged).quote.products[0].children[0].children[0].spec.price,0);A.deepEqual(merged.quote.ratesSnapshot,db.quote.ratesSnapshot);A.deepEqual(merged.materials,db.materials);
 for(const v of [-1,101,'5']){view.quote.products[0].children[0].children[0].auxiliaryPercent=v;A.throws(()=>T.merge(db,view),/100%/);}
});
test('server allocates unique daily numbers atomically for concurrent creates and preserves explicit codes',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;let session;
 const call=async(route,method='GET',body)=>{const response=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};};
 const setup=await call('setup','POST',{username:'admin',name:'Code QA',password:'Only-for-code-tests-42!'});session={cookie:setup.cookie,csrf:setup.data.csrf};
 const document=P.demoSeed();document.quote.date='2026-09-17';document.quote.id='BG-20260917-999';A.equal((await call('quotes','POST',{document})).status,201);
 const created=await Promise.all(Array.from({length:4},()=>call('quotes','POST',{document,autoCode:true})));for(const r of created)A.equal(r.status,201,JSON.stringify(r.data));
 const codes=(await call('quotes')).data.map(x=>x.code);A.equal(new Set(codes).size,5);for(const i of [1000,1001,1002,1003])A.ok(codes.includes('BG-20260917-'+i));
 document.quote.date='2026-09-18';const next=await call('quotes','POST',{document,autoCode:true});A.equal(next.status,201);A.equal((await call('quotes/'+next.data.id)).data.document.quote.id,'BG-20260918-001');
 document.quote.id='BG-CUSTOM';const custom=await call('quotes','POST',{document});A.equal(custom.status,201);A.equal((await call('quotes/'+custom.data.id)).data.document.quote.id,'BG-CUSTOM');
 document.quote.date='2026-02-30';A.equal((await call('quotes','POST',{document,autoCode:true})).status,400);
});
