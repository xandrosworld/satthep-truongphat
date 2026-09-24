'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),P=require('../pricing-core.js'),S=require('../source-core.js'),F=require('./tmc-fixture.cjs');
test('overall comparison exposes individual factors and uses chosen final price with independent kg arithmetic',()=>{
 const d=F.seed();d.quote.pricing.selected='detail';d.quote.pricing.reserve=2;d.quote.pricing.salesFactors=[{id:'custom-sale',name:'Bảo hành',percent:1}];d.quote.pricing.productionFactors=[{id:'custom-production',name:'Gia cố',percent:3}];F.confirm(d.quote);
 const result=P.calculate(d),methods=Object.keys(result.alternatives),rows=S.summary(result),at=(name,id='detail')=>rows.find(r=>r.name===name).values[methods.indexOf(id)];
 A.equal(at('Khối lượng phôi sản phẩm').amount,20);A.equal(at('Hệ số chi phí chung').rate,'20%');A.equal(at('Dự phòng giảm giá').rate,'2%');A.equal(at('SX bổ sung · Gia cố').rate,'3%');A.equal(at('Bán bổ sung · Bảo hành').rate,'1%');
 A.equal(at('Vận chuyển nhập vật tư').amount,60);A.equal(at('Vận chuyển nhập vật tư').perKg,3);A.equal(at('Vận chuyển giao hàng').perKg,5);A.equal(at('Lắp đặt').perKg,2);
 A.equal(at('Lợi nhuận còn lại dự kiến').amount,result.total.beforeTax-result.total.cost-result.total.processing);
 A.equal(at('Hệ số lợi nhuận','kg').amount,null);A.equal(at('Hệ số lợi nhuận','kg').rate,'Trong giá trọn gói');
 d.quote.pricing.overrides[d.quote.products[0].id]={mode:'detail',signature:result.products[0].priceSignature,value:6000,reason:'QA price override'};const finalResult=P.calculate(d),finalRows=S.summary(finalResult);A.equal(finalRows.find(r=>r.name==='Giá chào trước thuế').values[0].perKg,600);A.equal(finalRows.find(r=>r.name==='Tổng tiền sau thuế').values[0].amount,12960);
 result.alternatives.kg.ready=false;A.equal(S.summary(result).find(r=>r.name==='Giá gốc').values[methods.indexOf('kg')].amount,null);
 result.alternatives.detail.total.weight=0;A.equal(S.summary(result).find(r=>r.name==='Giá gốc').values[0].perKg,null);
});
test('visible analysis follows chosen comparison methods and retains selected price, sections and negative margin',()=>{
 const d=F.seed();d.quote.pricing.selected='detail';d.quote.pricing.comparisonMethods=['detail'];F.confirm(d.quote);let r=P.calculate(d);
 A.deepEqual(S.visibleMethods(r).map(a=>a.id),['detail']);A.ok(S.visibleSummary(r).every(x=>x.values.length===1));
 r.comparisonIds=['kg'];A.deepEqual(S.visibleMethods(r).map(a=>a.id),['detail','kg']);
 r.total.beforeTax=0;const rows=S.visibleSummary(r),profit=rows.find(x=>x.name==='Lợi nhuận còn lại dự kiến');A.equal(profit.values[0].amount,-r.total.cost-r.total.processing);
 A.deepEqual([...new Set(rows.map(x=>x.section))],['Hệ số áp dụng','Khối lượng và diện tích','Cơ cấu chi phí và giá chào']);
 A.equal(rows.find(x=>x.name==='Tổng chi phí đã tính (giá gốc + xử lý)').values[0].amount,r.total.cost+r.total.processing);
});
