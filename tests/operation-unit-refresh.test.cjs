const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../core.js'),P=require('../pricing-core.js'),I=require('../intake-core.js'),W=require('../work-core.js');
function fixture(){const d=P.demoSeed(),n=d.quote.products[0];n.ops=[{id:'unit-test',mode:'inside',quantityUnit:'kg',basisMode:'auto',amount:1}];for(const x of C.flatten(d.quote.products))if(x!==n)x.ops=[];d.quote.ratesSnapshot=[{id:'unit-test',name:'Cắt ống',unit:'lần',inside:100,outside:200,factors:[]}];d.rates=[{id:'unit-test',name:'Cắt ống',unit:'lần',inside:300,outside:400,insideUnit:'kg',outsideUnit:'kg'}];return d;}
test('refresh pairs catalogue price with matching unit, preserves source and calculates kg',()=>{const d=fixture(),n=d.quote.products[0],ops=C.copy(n.ops),master=C.copy(d.rates);const rows=I.operationUnitUpdates(d);A.equal(rows.length,1);A.throws(()=>W.operation(d.quote.ratesSnapshot[0],n.ops[0],{},{weight:2,count:1},P.tier),/đơn giá đang theo lần/);I.applyOperationUnitUpdates(d,rows);A.equal(W.operation(d.quote.ratesSnapshot[0],n.ops[0],{},{weight:2,count:1},P.tier).cost,600);A.deepEqual(n.ops,ops);A.deepEqual(d.rates,master);A.equal(d.quote.ratesSnapshot[0].outside,200);A.equal(I.operationUnitUpdates(d).length,0);A.equal(JSON.parse(JSON.stringify(d)).quote.ratesSnapshot[0].insideUnit,'kg');});
test('does not overwrite explicit direct or alternative prices; no silent unit conversion',()=>{for(const patch of [{pricingMethod:'direct',priceUnit:'lần',unitPrice:100},{priceOptionId:'opt-other'}]){const d=fixture();Object.assign(d.quote.products[0].ops[0],patch);A.equal(I.operationUnitUpdates(d).length,0);}const d=fixture();d.rates[0].insideUnit='bộ';A.equal(I.operationUnitUpdates(d).length,0);});
test('refresh rejects approved, stale and duplicate updates without partial mutation',()=>{const d=fixture(),rows=I.operationUnitUpdates(d),before=C.copy(d.quote);A.throws(()=>I.applyOperationUnitUpdates(d,[...rows,...rows]));A.deepEqual(d.quote,before);d.rates[0].inside=999;A.throws(()=>I.applyOperationUnitUpdates(d,rows));A.deepEqual(d.quote,before);d.quote.status='approved';A.throws(()=>I.applyOperationUnitUpdates(d,I.operationUnitUpdates(d)),/đã duyệt/);});

test('price unit refresh preserves technical full/partial signatures but technical quantity changes remain locked',()=>{
 const T=require('../technical-core.js'),H=require('../server/notifications.cjs'),PH=require('../partial-handoff-core.js');
 const d=fixture(),before=C.copy(d),id=d.quote.products[0].id;
 d.rates[0].name='Tên mới trong danh mục';const rows=I.operationUnitUpdates(d);A.equal(rows[0].name,'Tên mới trong danh mục');A.equal(rows[0].snapshotName,'Cắt ống');
 I.applyOperationUnitUpdates(d,rows);
 A.deepEqual(T.handoffQuote(before),T.handoffQuote(d));
 A.equal(H.fingerprints(before).technical,H.fingerprints(d).technical);
 A.equal(PH.signature(before,id,'technical'),PH.signature(d,id,'technical'));
 A.notEqual(H.fingerprints(before,'units').technical,H.fingerprints(d,'units').technical);
 A.notEqual(H.fingerprints(before).materials,H.fingerprints(d).materials);
 d.quote.products[0].ops[0].quantityUnit='m';
 A.notEqual(H.fingerprints(before).technical,H.fingerprints(d).technical);
 A.notEqual(PH.signature(before,id,'technical'),PH.signature(d,id,'technical'));
});


test('price staff can refresh base price and unit without technical editing rights',()=>{
 const S=require('../section-access.js'),before=fixture(),after=C.copy(before),rights={sections:['materials']};
 I.applyOperationUnitUpdates(after,I.operationUnitUpdates(after));
 A.deepEqual(S.denied(before,after,rights),[]);
 A.ok(S.denied(before,after,{sections:[]}).includes('materials'));
 A.deepEqual(S.denied(before,after,{sections:['operations']}),[]);
 for(const alter of [
  d=>d.quote.products[0].ops[0].quantityUnit='m',
  d=>d.quote.ratesSnapshot[0].consumptions=[{norm:2}],
  d=>d.quote.ratesSnapshot[0].factors=[{name:'Changed',value:2}],
  d=>d.quote.ratesSnapshot[0].name='Another operation'
 ]){
  const changed=C.copy(after);alter(changed);
  A.ok(S.denied(before,changed,rights).includes('operations'));
 }
});
