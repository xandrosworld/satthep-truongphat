'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),P=require('../pricing-core.js'),W=require('../work-core.js'),I=require('../input-prices-core.js'),D=require('../device-core.js');
function seed(){const d=P.demoSeed();d.quote.products[0].productGroup='Cơ khí';d.quote.products[1].productGroup='Thang máng cáp';return d;}
const fee=(extra={})=>({id:'family-fee',name:'Phí thử theo nhóm',category:'install',scope:'all',method:'unit',rate:1000,allocation:'quantity',quoteProductGroups:['Cơ khí'],...extra});
test('quote family restriction limits quantity and allocation once; survives JSON and tariff refresh',()=>{
 const d=seed(),rate={id:'shared',name:'Chung',category:'install',method:'unit',rate:1000,minimum:0};I.save(d,'expenseRates',rate);d.quote.expenses=[I.applyExpense(fee(),rate)];
 const check=doc=>{const r=P.calculate(doc).logistics;A.deepEqual(r.errors,[]);A.equal(r.items[0].basis,d.quote.products[0].qty);A.equal(r.items[0].cost,d.quote.products[0].qty*1000);A.deepEqual(r.items[0].detail.map(x=>x.productId),[d.quote.products[0].id]);A.equal(r.items[0].detail.reduce((s,x)=>s+x.cost,0),r.items[0].cost);};
 check(d);check(JSON.parse(JSON.stringify(d)));I.refresh(d);A.deepEqual(d.quote.expenses[0].quoteProductGroups,['Cơ khí']);check(d);
});
test('family scope intersects master tariff scope and rejects conflicting or malformed declarations',()=>{
 const d=seed(),base=P.calculate(d);for(const quoteProductGroups of [[],['Cơ khí','Thang máng cáp']]){const e=fee({quoteProductGroups,priceSource:{productGroups:['Thang máng cáp']}}),r=W.expenses([e],base,base.generated);A.deepEqual(r.errors,[]);A.deepEqual(r.items[0].detail.map(x=>x.productId),[d.quote.products[1].id]);}
 for(const quoteProductGroups of ['bad',['missing']])A.ok(W.expenses([fee({quoteProductGroups})],base,base.generated).errors.length);
 A.ok(W.expenses([fee({priceSource:{productGroups:['Thang máng cáp']}})],base,base.generated).errors.length);
});
test('a material shared between families charges only selected-family rows; a shared fixed fee stays single',()=>{
 const d=seed(),p=d.quote.products[0],other=structuredClone(p);other.id='other-family';other.name='Other';other.productGroup='Nhóm mới';const visit=n=>{n.id+='-other';(n.children||[]).forEach(visit);};other.children.forEach(visit);d.quote.products=[p,other];
 const base=P.calculate(d),material=base.logistics.rows.find(x=>x.productId===p.id).materialId;
 const e=fee({category:'incoming',method:'kg_purchase',scope:'materials',materialIds:[material]});const r=W.expenses([e],base,base.generated);A.deepEqual(r.errors,[]);A.equal(r.items[0].basis,base.logistics.rows.filter(x=>x.productId===p.id&&x.materialId===material).reduce((s,x)=>s+x.purchaseKg,0));
 const shared=W.expenses([fee({method:'fixed',quoteProductGroups:[]})],base,base.generated);A.equal(shared.items[0].cost,1000);A.equal(shared.items[0].detail.length,2);A.equal(shared.items[0].detail.reduce((s,x)=>s+x.cost,0),1000);
});
test('device coverage cannot cite installation allocated to another family and becomes invalid when scope changes',()=>{
 const d=seed(),n=d.quote.products[0].children.find(n=>n.kind==='material');d.quote.expenses=[fee({method:'fixed',quoteProductGroups:['Thang máng cáp']})];let r=P.calculate(d);A.equal(D.sources(d.quote,r,r.logistics,n.id).filter(s=>JSON.parse(s.key)[0]==='expense').length,0);
 d.quote.expenses[0].quoteProductGroups=['Cơ khí'];r=P.calculate(d);const source=D.sources(d.quote,r,r.logistics,n.id).find(s=>JSON.parse(s.key)[0]==='expense');A.ok(source);
 d.quote.deviceInstallations=[{id:'work',nodeId:n.id,variant:D.variant(n.spec),mode:'covered',work:'Lắp đặt',location:'Xưởng',sourceKey:source.key,scopeConfirmed:true,reason:'Công trong khoản lắp đặt cùng nhóm'}];A.deepEqual(P.calculate(d).devices.errors,[]);
 d.quote.expenses[0].quoteProductGroups=['Thang máng cáp'];A.ok(P.calculate(d).devices.errors.length);
});
