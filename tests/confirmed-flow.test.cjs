'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),P=require('../pricing-core.js'),C=require('../core.js'),F=require('./tmc-fixture.cjs'),CF=require('./cost-flow-fixture.cjs'),Tax=require('../tax-core.js'),SA=require('../section-access.js'),Access=require('../server/access.cjs');
const near=(a,b)=>A.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function modern(d=F.seed()){P.adoptFlow(d.quote);return d;}
function scope(n,method,overrides={}){n.benchmarkScope??={};n.benchmarkScope[method]={incoming:'included',outgoing:'included',delivery:'included',install:'included',...overrides};}
test('confirmed flow: direct 2200 + delivery/install 140, then 20% and 30%, independent of production',()=>{
 const d=modern(),q=d.quote;q.pricing.selected='detail';q.pricing.special=0;
 const before=JSON.stringify(d),r=P.calculate(d),p=r.products[0];A.deepEqual(r.errors,[]);
 near(p.production,2200);near(p.baseBeforeCommon,2340);near(p.overhead,468);near(p.management,842.4);near(p.cost,3650.4);
 q.pricing.delivery+=100;const changed=P.calculate(d).products[0];near(changed.production,2200);near(changed.cost-p.cost,156);
 A.equal(JSON.stringify(JSON.parse(before)),before);A.equal(P.calculate(JSON.parse(before)).total.grand,r.total.grand);
});
test('confirmed flow: production-only extras stay before delivery; common and management never enter production',()=>{
 const d=modern(),q=d.quote;q.pricing.selected='detail';q.pricing.productionFactors=[{name:'SX thử',percent:10}];
 const p=P.calculate(d).products[0];near(p.production,2200*1.04*1.1);near(p.cost,(2200*1.04*1.1+140)*1.2*1.3);
});
test('confirmed TMC mixed quote uses shared physical quantities and retains detailed branch outside TMC',()=>{
 const d=modern(F.mixed()),r=P.calculate(d);A.deepEqual(r.errors,[]);
 for(let i=0;i<2;i++){near(r.alternatives.tmc.products[i].weight,r.alternatives.detail.products[i].weight);near(r.alternatives.tmc.products[i].area,r.alternatives.detail.products[i].area);}
 A.deepEqual(r.alternatives.tmc.products[1].parts,r.alternatives.detail.products[1].parts);near(r.alternatives.tmc.products[1].cost,r.alternatives.detail.products[1].cost);
 near(r.total.cost,r.products.reduce((sum,p)=>sum+p.cost,0));
});
test('confirmed TMC 2510 production + 140 delivery/install then 5%, 3%; kg geometry unchanged',()=>{
 const d=modern(),p=P.calculate(d).products[0];near(p.weight,20);near(p.production,2510);near(p.cost,2865.975);
});
test('one special quotation combines TMC, a configured cabinet method and detailed mechanical products',()=>{
 const d=modern(CF.seed()),q=d.quote;
 const tmc=C.copy(F.seed().quote.products[0]);tmc.id='mix-tmc';tmc.children[0].id='mix-tmc-material';tmc.priceGroupId='tmc';q.products.push(tmc);
 const mechanical=C.copy(tmc);mechanical.id='mix-mechanical';mechanical.children[0].id='mix-mechanical-material';mechanical.priceGroupId='detail';mechanical.tmcScope='detail';q.products.push(mechanical);
 q.pricing.selected='special';const before=JSON.stringify(d),r=P.calculate(d);A.deepEqual(r.errors,[]);
 A.deepEqual(r.products.map(p=>p.sourceMethod),['group:grp-cabinet-flow','tmc','detail']);
 for(const [i,id]of ['group:grp-cabinet-flow','tmc','detail'].entries()){A.equal(r.products[i].sell,r.alternatives[id].products[i].sell);A.equal(r.products[i].weight,r.alternatives.detail.products[i].weight);}
 A.equal(r.total.beforeTax,r.products.reduce((sum,p)=>sum+p.sell,0));A.equal(JSON.stringify(d),before);
 F.confirm(q);A.deepEqual(P.calculate(d).tax.releaseErrors,[]);delete q.pricing.tmcPolicy;A.ok(P.calculate(d).tax.releaseErrors.some(e=>e.includes('TMC')));
 q.products[0].priceGroupId='unknown';A.equal(P.calculate(d).alternatives.special.ready,false);
});
test('special method without any special group has an explicit blocking reason',()=>{
 const d=modern(),q=d.quote;q.products[0].priceGroupId='detail';q.pricing.selected='special';
 const r=P.calculate(d);A.equal(r.alternatives.special.ready,false);A.ok(r.errors.some(e=>e.includes('Không có sản phẩm thuộc nhóm đặc thù')));
});
test('additional named expense rows and sequential factors roll up without a fixed number of charges',()=>{
 const d=modern(),q=d.quote,n=q.products[0];q.pricing.selected='detail';q.pricing.special=0;
 q.expenses=[['loading','Bốc xếp nhập phôi','incoming',50],['dispatch','Giao chặng bổ sung','delivery',30],['crane','Cẩu hạ tại công trình','install',20]].map(([id,name,category,rate])=>({id,name,category,rate,method:'fixed',scope:'all',allocation:'equal'}));
 q.pricing.productionFactors=[{id:'p1',name:'Yếu tố sản xuất A',percent:10},{id:'p2',name:'Yếu tố sản xuất B',percent:5}];
 const r=P.calculate(d);A.deepEqual(r.errors,[]);near(r.products[0].production,2250*1.1*1.05);near(r.total.cost,(2250*1.1*1.05+190)*1.2*1.3);
 for(const item of r.logistics.items)near(item.cost,item.detail.reduce((sum,x)=>sum+x.cost,0));
 scope(n,'competitor',{incoming:'detail',delivery:'detail',install:'detail'});n.competitorPrice=1000;q.pricing.selected='competitor';
 const benchmark=P.calculate(d);near(benchmark.products[0].benchmarkSupplement.amount,300);near(benchmark.total.beforeTax,2300);
 A.deepEqual(P.calculate(JSON.parse(JSON.stringify(d))).total,benchmark.total);
});
test('included delivery in component flow removed exactly once before common and management',()=>{
 const d=modern(CF.seed()),q=d.quote,before=P.calculate(d),bom=JSON.stringify(q.products);
 near(before.products[0].cost,2622.4);q.pricing.productGroups[0].flow.rules.delivery={mode:'included',includedIn:'factory',reason:'Gói công gồm giao hàng'};
 const after=P.calculate(d);near(before.products[0].cost-after.products[0].cost,22);A.deepEqual(after.alternatives.detail.total,before.alternatives.detail.total);A.equal(JSON.stringify(q.products),bom);
});
test('benchmark: incomplete scope blocks; add only calculated missing fees, no sale markup and tax normalized once',()=>{
 const d=modern(),q=d.quote,n=q.products[0];q.pricing.selected='competitor';n.competitorPrice=1100;
 A.equal(P.calculate(d).alternatives.competitor.ready,false);
 scope(n,'competitor',{delivery:'detail',install:'detail'});F.confirm(q);
 Tax.review(q,{reason:'QA gross input',costConfirmed:true,outputConfirmed:true,inputs:{[n.id]:{competitor:{status:'included',rate:10},kg:{status:'unknown'},market:{status:'unknown'}}}});
 const r=P.calculate(d);A.deepEqual(r.errors,[]);A.deepEqual(r.tax.releaseErrors,[]);A.equal(r.total.beforeTax,2140);A.equal(r.total.vat,171);A.equal(r.total.grand,2311);near(r.products[0].benchmarkSupplement.amount,140);
 scope(n,'competitor');near(P.calculate(d).total.beforeTax,2000);
 scope(n,'competitor',{delivery:'invalid'});A.equal(P.calculate(d).alternatives.competitor.ready,false);
});
test('kg benchmark uses calculated blank mass and per-product supplements only once',()=>{
 const d=modern(),q=d.quote,n=q.products[0];q.pricing.selected='kg';scope(n,'kg',{incoming:'detail',delivery:'detail'});
 const r=P.calculate(d);A.deepEqual(r.errors,[]);A.equal(r.total.beforeTax,4160);near(r.products[0].benchmarkSupplement.amount,160);
});
test('historical quote unchanged until explicit draft conversion; locked quote cannot convert; factor permission covers sequence',()=>{
 const d=F.seed(),old=C.copy(d),r=P.calculate(d);delete d.quote.pricing.costSequence;
 A.equal(P.calculate(d).total.grand,r.total.grand);const fp=Access.factorFingerprint(d);
 d.quote.status='approved';const locked=JSON.stringify(d);A.throws(()=>P.adoptFlow(d.quote),/khóa/);A.equal(JSON.stringify(d),locked);
 d.quote.status='draft';d.quote.pricing.overrides={x:{value:1}};P.adoptFlow(d.quote);A.deepEqual(d.quote.pricing.overrides,{});A.notEqual(Access.factorFingerprint(d),fp);
 A.ok(SA.denied(old,d,{sections:['commercial'],factors:false}).includes('factors'));
 const changed=C.copy(old);scope(changed.quote.products[0],'kg');A.ok(SA.denied(old,changed,{sections:['bom'],factors:false}).includes('commercial'));
 A.equal(P.calculate(old).total.grand,r.total.grand);
});
