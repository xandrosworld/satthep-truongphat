'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),E=require('../expense-preview-core.js');
test('every reference tariff reproduces an independently specified expected amount',()=>{
 const expected={'MAU-product_m':450000,'MAU-kg_km':3000000,'MAU-vehicle':1500000,'MAU-product_unit':1000000,'MAU-kg_net':600000,'MAU-kg_purchase':750000,'MAU-ton_net':600000,'MAU-ton_purchase':750000,'MAU-ton_km':3000000,'MAU-m2':400000,'MAU-m':450000,'MAU-unit':300000,'MAU-trip':1200000,'MAU-km':500000,'MAU-fixed':800000,'MAU-he-so':3300000,'MAU-toi-thieu':1000000,'MAU-lap-m2':400000,'MAU-lap-m':450000,'MAU-lap-fixed':800000};
 for(const r of E.samples()){const result=E.trial(r);A.ok(Math.abs(result.cost-expected[r.id])<1e-6,r.id);A.equal(result.detail.reduce((n,x)=>n+x.cost,0),result.cost);}
 A.equal(E.samples().length,Object.keys(expected).length);
});
test('trials change distance, vehicle load and minimum correctly without changing source tariffs',()=>{
 const rows=E.samples(),before=JSON.stringify(rows),r=id=>rows.find(x=>x.id===id);
 A.equal(E.trial(r('MAU-kg_km'),{distance:50}).cost,6000000);
 A.equal(E.trial(r('MAU-vehicle'),{netKg:1600}).tripCount,4);
 A.equal(E.trial(r('MAU-toi-thieu'),{trips:3,repeats:2}).cost,3000000);
 A.equal(E.trial({...r('MAU-he-so'),priceMode:'catalog'}).cost,3000000);
 A.equal(JSON.stringify(rows),before);
 for(const v of [{trips:1.5},{trips:''},{netKg:-1},{quantity:0}])A.throws(()=>E.trial(r('MAU-vehicle'),v));
 A.throws(()=>E.trial(r('MAU-kg_km'),{distance:0}));
 A.throws(()=>E.trial(r('MAU-fixed'),{repeats:2}));
});
test('real tariff scope and categorical factors are enforced during trial',()=>{
 const r={...E.samples()[0],productGroups:['Cơ khí'],priceMode:'factors',factors:[{id:'route',name:'Tuyến',param:'to',kind:'category',categories:[{key:'A',percent:20}]}]};
 A.equal(E.trial(r,{to:'A'}).cost,3600000);A.throws(()=>E.trial(r,{to:'B'}));A.throws(()=>E.trial(r,{to:'A',productGroup:'Thang máng cáp'}));
});
