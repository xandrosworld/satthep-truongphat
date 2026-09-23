const {test}=require('node:test'),A=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),T=require('../technical-core.js'),P=require('../pricing-core.js'),C=require('../core.js');
test('technical operation column selection round-trips without modifying prices or jobs',()=>{
 const original=P.demoSeed(),payload=T.project(original);
 payload.quote.operationColumns=payload.quote.ratesSnapshot.slice(0,2).map(r=>r.id);
 const merged=T.merge(original,payload);
 A.deepEqual(T.project(merged).quote.operationColumns,payload.quote.operationColumns);
 A.deepEqual(merged.quote.pricing,original.quote.pricing);
 A.deepEqual(merged.quote.ratesSnapshot,original.quote.ratesSnapshot);
 A.deepEqual(merged.quote.products.map(n=>n.ops),original.quote.products.map(n=>n.ops));
});
test('technical quote save projects with its loaded catalogue after local catalogue changes',()=>{
 const original=P.demoSeed(),baseline=T.project(original),working=structuredClone(original);working.rates[0].factors=[{id:'complex',param:'complexity',kind:'category',categories:[{key:'New',percent:10}]}];working.quote.products[0].qty=19;
 const old={...baseline,quote:T.project(working).quote};A.throws(()=>T.merge(original,old),/trường.*không được phép/);
 const context={TPTechnical:T,C,Team:{loaded:true,quoteTechnicalBaseline:{id:'quote',document:baseline}},teamCurrent:()=>({id:'quote'})};vm.createContext(context);vm.runInContext(fs.readFileSync('technical-ui.js','utf8').split("'use strict';")[0],context);const payload=context.technicalQuoteDocument(working),merged=T.merge(original,payload);
 A.equal(merged.quote.products[0].qty,19);A.deepEqual(merged.materials,original.materials);A.deepEqual(merged.quote.ratesSnapshot,original.quote.ratesSnapshot);A.deepEqual(merged.quote.pricing,original.quote.pricing);
 payload.quote.products[0].ops[0].unitPrice=999999;A.throws(()=>T.merge(original,payload),/document.quote.products.0.ops.0.unitPrice/);
});
test('technical can add only canonical published operations and cannot forge their prices',()=>{const d=P.demoSeed(),master=C.copy(d),r={...C.copy(d.rates[0]),id:'new-published',name:'New cutting'};master.rates.push(r);const input=T.project(d,master);input.quote.ratesSnapshot.push(T.projectCatalog(master).rates.find(x=>x.id===r.id));const merged=T.merge(d,input,master);A.equal(merged.quote.ratesSnapshot.at(-1).inside,r.inside);A.equal(merged.quote.ratesSnapshot.at(-1).name,r.name);input.quote.ratesSnapshot.at(-1).name='Forged';A.throws(()=>T.merge(d,input,master));});

test('draft material confirmation and technical saves preserve per-line commercial snapshots',()=>{
 const d=P.demoSeed(),nodes=C.flatten(d.quote.products).filter(n=>n.kind==='material');
 for(const [i,n] of nodes.entries()){n.draftMaterial=true;n.spec.price=70001+i;n.spec.priceSelection={at:'saved',supplier:'nv-002',price:70001+i};n.spec.costSource={confirmed:true,sourcePrice:70001+i,evidence:'Supplier quotation'};}
 const catalog=C.copy(d);for(const m of catalog.materials)m.price=null;
 const snapshots=nodes.map(n=>({id:n.id,spec:C.copy(n.spec)}));
 const reconciled=T.reconcileDrafts(C.copy(d),catalog);
 for(const x of snapshots)A.deepEqual(C.findNode(reconciled.quote.products,x.id).spec,x.spec);
 for(const published of [undefined,catalog]){
  const input=T.project(d,published);input.quote.products[0].qty++;
  const merged=T.merge(d,input,published);
  for(const x of snapshots)A.deepEqual(C.findNode(merged.quote.products,x.id).spec,x.spec);
  A.deepEqual(merged.quote.pricing,d.quote.pricing);A.deepEqual(merged.materials,d.materials);
 }
 const unpublished=C.copy(d);for(const n of C.flatten(unpublished.quote.products).filter(n=>n.kind==='material')){n.materialId=n.spec.id='PRIVATE-'+n.id;}
 const merged=T.merge(unpublished,T.project(unpublished));
 for(const n of C.flatten(unpublished.quote.products).filter(n=>n.kind==='material')){A.deepEqual(C.findNode(merged.quote.products,n.id).spec,n.spec);A.equal(C.findNode(merged.quote.products,n.id).draftMaterial,true);}
});
