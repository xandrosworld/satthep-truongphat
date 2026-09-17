const {test}=require('node:test'),A=require('node:assert/strict'),P=require('../pricing-core.js'),W=require('../work-core.js'),I=require('../input-prices-core.js'),G=require('../group-pricing-core.js'),CV=require('../conventions-core.js');
test('transport and installation family scope limits quantities and allocation; saved quotes keep their snapshot',()=>{
 for(const category of ['incoming','install']){const d=P.demoSeed(),[a,b]=d.quote.products;a.productGroup='Cơ khí';b.productGroup='Thang máng cáp';
 const rate={id:'family',name:'Chỉ cơ khí',category,method:'unit',rate:1000,minimum:0,productGroups:['Cơ khí']},e=I.applyExpense({id:'e',scope:'all',allocation:'quantity'},rate),base=P.calculate(d),out=W.expenses([e],base,base.generated);
 A.deepEqual(out.errors,[]);A.equal(out.items[0].basis,a.qty);A.equal(out.items[0].cost,a.qty*1000);A.equal(out.allocations[b.id],undefined);
 d.quote.expenses=[e];I.save(d,'expenseRates',{...rate,productGroups:['Thang máng cáp']});A.deepEqual(e.priceSource.productGroups,['Cơ khí']);I.refresh(d);A.deepEqual(d.quote.expenses[0].priceSource.productGroups,['Thang máng cáp']);
 const noMatch=I.applyExpense({...e,scope:'products',productIds:[a.id]}, {...rate,productGroups:['Tủ điện']});A.ok(W.expenses([noMatch],base,base.generated).errors.length);
 delete a.productGroup;A.ok(W.expenses([e],P.calculate(d),[]).errors.some(x=>x.includes('nhóm sản phẩm')));
 }
});
test('legacy price-method restrictions intersect product-family scope, malformed scopes are rejected',()=>{
 const d=P.demoSeed();d.quote.products.forEach(n=>{n.productGroup='Cơ khí';n.priceGroupId='tmc';});const r={id:'x',name:'X',category:'incoming',method:'unit',rate:1,productGroups:['Cơ khí'],applicableGroupIds:['detail']},base=P.calculate(d);
 A.ok(W.expenses([I.applyExpense({id:'e'},r)],base,base.generated).errors.length);
 A.throws(()=>I.validateExpense({...r,productGroups:'Cơ khí'}));
 I.save(d,'expenseRates',{...r,applicableGroupIds:[]});A.ok(CV.references(d,'productGroups',{name:'Cơ khí'}).length);
});
test('custom methods enforce family scope; optional labor formula is a breakdown, not an extra charge',()=>{
 const d=P.demoSeed(),g={id:'grp-gate',name:'Bảng lan can',engine:'formula',formula:'Q * P_PRICE',laborFormula:'Q * P_LABOR',source:'Đơn giá kiểm thử',parameters:[{key:'P_PRICE',name:'Giá',unit:'đ/bộ',value:100000},{key:'P_LABOR',name:'Công',unit:'đ/bộ',value:20000}],netConfirmed:true,productGroups:['Lan can']};G.saveGroup(d.quote,g);const n=d.quote.products[0];n.productGroup='Lan can';G.assign(d.quote,n.id,g.id);
 const base=P.calculate(d),p=base.products[0],labor=G.labor(g,p);A.equal(labor.total,n.qty*20000);A.equal(base.alternatives['group:'+g.id].products[0].sell,n.qty*100000);
 A.throws(()=>G.evaluate(g,{...p,node:{...n,productGroup:'Tủ điện'}}),/chỉ áp dụng nhóm/);A.equal(G.labor({...g,laborFormula:''},p),null);A.throws(()=>G.validateGroup({...g,laborFormula:'UNKNOWN'}),/Biến chưa khai/);A.throws(()=>G.validateGroup({...g,productGroups:['Lan can','Lan can']}));
});
