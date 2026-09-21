'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),R=require('../calculation-report-core'),P=require('../pricing-core'),C=require('../core'),D=require('../definition-core'),Cost=require('../cost-input-core'),F=require('./tmc-fixture.cjs');
const rows=(r,name)=>r.sheets.find(s=>s.name===name).rows,step=(r,s,n)=>rows(r,s).find(x=>x[1]===n),near=(a,b)=>A.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function seed(){const d=F.seed();d.quote.pricing.selected='detail';d.quote.pricing.special=0;P.adoptFlow(d.quote);F.confirm(d.quote);return d;}
test('explanation matches independent quantity, surface and sequential cost answers without changing the quote',()=>{
 const d=seed(),before=JSON.stringify(d),r=R.build(d);A.equal(JSON.stringify(d),before);
 near(step(r,'Dien giai khoi luong','Số lượng toàn báo giá')[4],2);
 near(step(r,'Dien giai khoi luong','Khối lượng phôi toàn dòng')[4],20);
 near(step(r,'Dien giai khoi luong','Diện tích phôi toàn dòng')[4],2);
 near(step(r,'Luong thuc hien','Diện tích thực hiện')[4],4);
 near(step(r,'Gia phuong an da chon','Chi phí chung')[4],468);
 near(step(r,'Gia phuong an da chon','Chi phí quản lý')[4],842.4);
 near(step(r,'Gia phuong an da chon','Giá gốc')[4],3650.4);
 A.match(step(r,'Gia phuong an da chon','Khối lượng')?.[3]||step(r,'Dien giai khoi luong','Khối lượng phôi toàn dòng')[3],/1000/);
 const order=rows(r,'Gia phuong an da chon').map(x=>x[1]);A.ok(order.indexOf('Giá gốc')<order.indexOf('Lợi nhuận'));
 A.equal(rows(r,'Tong hop doi chieu').find(x=>x[0]==='Giá trước thuế')[2],P.calculate(d).total.beforeTax);
});
test('triangle report uses actual three-side contour and loss percentage excluding selected reuse',()=>{
 const d=seed(),def={id:'POLY',name:'Tam giác ba cạnh',...D.polygonPreset('triangle')},m=D.applyShape({id:'POLY-M',name:'Phôi thử',density:7850,unit:'kg',price:100,stockL:1000,stockW:1000},def,{T:2});
 const n=D.assign(D.draft('Tam giác',2),m,d.rules);d.quote.products[0].qty=1;d.quote.products[0].children=[n];
 const old=P.calculate(d),g=old.groups[0];d.quote.remnantSelections={[g.signature]:[g.remnants[0].id]};const r=R.build(d);
 near(step(r,'Dien giai khoi luong','Khối lượng phôi toàn dòng')[4],1.884);near(step(r,'Dien giai khoi luong','Diện tích phôi toàn dòng')[4],.12);
 const geometry=rows(r,'Dien giai khoi luong');A.ok(geometry.some(x=>x[1]==='C01'));A.ok(!geometry.some(x=>['L0','W0'].includes(x[1])));
 const waste=step(r,'Vat tu va hao hut','Phần còn lại và mạch cắt')[4],percent=step(r,'Vat tu va hao hut','Hao hụt sau tận dụng')[4];near(percent,waste/(1.884+waste)*100);A.ok(step(r,'Vat tu va hao hut','Phần dư đã chọn tận dụng')[4]>0);
});
test('declared price source and VAT normalization remain traceable',()=>{
 const d=seed(),x=Cost.rows(d.quote).find(x=>x.key.startsWith('material:'));
 Cost.apply(d.quote,[{key:x.key,original:108,status:'included',rate:8}],'Hóa đơn thử');const r=R.build(d),line=rows(r,'Nguon gia va thue').find(x=>x[8]==='Hóa đơn thử');
 near(line[2],100);A.equal(line[3],108);A.equal(line[5],8);near(line[6],100);A.match(line[7],/108 \/ \(1 \+ 8 \/ 100\)/);
});
test('partial or empty quotes export diagnostics without presenting zero or partial totals as complete',()=>{
 const d=seed();d.quote.products[0].children[0].dims.L=0;const r=R.build(d);A.equal(r.valid,false);A.equal(rows(r,'Tong hop doi chieu').find(x=>x[0]==='Tổng sau thuế')[2],'Chưa đủ dữ liệu');A.ok(r.issues.length);
 d.quote.products=[];A.equal(R.build(d).valid,false);
});
test('legacy price sequence is retained and clearly flagged',()=>{
 const d=F.seed(),before=JSON.stringify(d),r=R.build(d);A.ok(r.issues.some(x=>x.includes('luồng giá cũ')));A.equal(JSON.stringify(d),before);
});
test('TMC mixture identifies detailed fallback and exports the selected total only',()=>{
 const d=F.mixed();P.adoptFlow(d.quote);F.confirm(d.quote);const calc=P.calculate(d),r=R.build(d,calc);A.equal(r.selected,'tmc');
 A.equal(rows(r,'Tong hop doi chieu').find(x=>x[0]==='Giá trước thuế')[2],calc.total.beforeTax);
 A.equal(rows(r,'Gia phuong an da chon').filter(x=>x[1]==='Giá đang áp dụng').length,2);
 A.ok(rows(r,'Gia phuong an da chon').some(x=>x[1].startsWith('TMC:')));
});
test('freight trace retains manual basis, minimum, repeats and allocation',()=>{
 const d=seed();d.quote.expenses=[{id:'E',name:'Giao hàng thử',category:'delivery',scope:'all',method:'kg_net',rate:2,minimum:100,repeats:2,allocation:'equal'}];
 const r=R.build(d),line=rows(r,'Van chuyen lap dat')[1];A.equal(line[9],200);A.equal(line[11],'MAX(20 * 2, 100) * 2');A.match(line[10],/200 đ/);
});
test('permissions and protected formula references block explanation exports',()=>{
 const d=seed();A.throws(()=>R.build(d,null,{costs:false}),/quyền/);A.throws(()=>R.build(d,null,{formulaView:false}),/quyền/);
 d.quote.products[0].children[0].ruleSpec.length='__TPF_'+'a'.repeat(32);A.throws(()=>R.build(d),/bảo vệ/);
 A.equal(R.substitute('D0 * D0 + MAX(D, 1)',{D0:200,D:100}),'(200) * (200) + MAX((100), 1)');
});
