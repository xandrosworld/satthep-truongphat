'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../core.js'),P=require('../pricing-core.js'),W=require('../work-core.js'),IP=require('../input-prices-core.js'),G=require('../group-pricing-core.js'),FM=require('../factor-matrix-core.js');
const near=(a,b)=>A.ok(Math.abs(a-b)<1e-7,a+' != '+b);
function fixture(){
 const d=P.demoSeed(),a=C.copy(C.flatten(d.quote.products).find(n=>n.kind==='material'&&n.spec.shape==='sheet'));
 Object.assign(a,{id:'thin',qty:4,dims:{L:1000,W:100},params:{T:99},ops:[{id:'cut',mode:'inside',amount:1}]});a.spec.props.T=1;delete a.paramLinks;a.ruleSpec={id:'flat',name:'Flat',shape:'sheet',length:'L',width:'W'};a.rule='flat';
 const b=C.copy(a);b.id='thick';b.spec.props.T=2;
 d.quote.products=[{id:'p',name:'Product',kind:'product',qty:2,params:{T:77},ops:[],children:[{id:'c',name:'Component',kind:'component',qty:3,ops:[],children:[a,b]}]}];
 d.quote.customer='Customer A';d.quote.customerInfo={id:'KH-A',name:'Customer A'};
 d.quote.ratesSnapshot.find(r=>r.id==='cut').factors=[
 {id:'t',name:'Thickness',param:'T',tiers:[{max:1,percent:10},{max:null,percent:20}]},
 {id:'q',name:'Quantity',param:'count',tiers:[{max:20,percent:0},{max:null,percent:-5}]},
 {id:'customer',name:'Customer',param:'customerId',kind:'category',categories:[{key:'KH-A',percent:20},{key:'KH-B',percent:0}]}];
 return d;
}
test('each material uses its own fixed thickness and multiplied count; customer comes from quote snapshot',()=>{
 const d=fixture(),before=JSON.stringify(d),r=P.calculate(d),a=r.nodes.thin.ownOps[0],b=r.nodes.thick.ownOps[0];
 near(a.rate,1254);near(b.rate,1368);near(a.basis,18.84);near(b.basis,37.68);near(a.cost,23625.36);near(b.cost,51546.24);
 A.deepEqual(a.factors.map(f=>f.input),[1,24,'KH-A']);A.ok(a.factors.every(f=>f.source==='linked'));A.equal(JSON.stringify(d),before);
 d.quote.customerInfo.id='KH-B';near(P.calculate(d).nodes.thin.ownOps[0].rate,1045);
 d.quote.products[0].qty=1;near(P.calculate(d).nodes.thin.ownOps[0].rate,1100);
});
test('missing customer or mixed assembly thickness reports the named factor, never prices as zero or picks first leaf',()=>{
 const d=fixture();delete d.quote.customerInfo;const r=P.calculate(d);A.match(r.nodes.thin.ownOps[0].error,/Customer.*customerId/);
 d.quote.products[0].children[0].ops=[{id:'cut',mode:'inside',amount:1}];
 A.match(P.calculate(d).nodes.c.ownOps[0].error,/Thickness.*T/);
 const c=d.quote.products[0].children[0];c.children[1].spec.props.T=1;delete c.children[0].spec.props.T;
 A.equal(P.context(c,{count:6}).T,undefined);
});
test('component self and ancestor counts, whole quote component count, and product quantities are distinct',()=>{
 const d=fixture(),second=C.copy(d.quote.products[0]);second.id='p2';second.qty=5;second.children[0].id='c2';second.children[0].qty=2;second.children[0].children=[];d.quote.products.push(second);
 const r=P.calculate(d),c=d.quote.products[0].children[0],n=c.children[0],ctx=W.context(n,r.nodes.thin,d.quote.products,d.quote);
 A.equal(ctx.localQty,4);A.equal(ctx.parentCount,6);A.equal(ctx.componentCount,6);A.equal(ctx.totalComponentCount,16);A.equal(ctx.productQty,2);
 A.equal(W.context(c,r.nodes.c,d.quote.products,d.quote).componentCount,6);
});
test('explicit overrides are traceable and inside/outside factor policies remain independent',()=>{
 const d=fixture(),n=d.quote.products[0].children[0].children[0];n.ops[0].inputs={T:2};
 let a=P.calculate(d).nodes.thin.ownOps[0];near(a.rate,1368);A.equal(a.factors[0].source,'override');
 n.ops[0].mode='outside';near(P.calculate(d).nodes.thin.ownOps[0].rate,6000);
 d.quote.ratesSnapshot.find(r=>r.id==='cut').outsideFactors=true;near(P.calculate(d).nodes.thin.ownOps[0].rate,8208);
});
test('customer factor can bind to operations; saved snapshot remains independent of master factor edits',()=>{
 const d=fixture(),def={id:'customer',name:'Customer',param:'customerId',kind:'category',categories:[{key:'KH-A',percent:20}]};
 A.ok(FM.compatible(def,{rate:d.rates[0]}));A.equal(FM.compatible(def,{expense:true}),false);
 const before=P.calculate(d).nodes.thin.ownOps[0].rate;d.rates.find(r=>r.id==='cut').factors=[def];def.categories[0].percent=90;near(P.calculate(d).nodes.thin.ownOps[0].rate,before);
});
test('group price catalogue validates custom parameters and quote copies calculate independently',()=>{
 const d=fixture(),g={id:'grp-cabinet',name:'Tủ điện',engine:'formula',formula:'Q * P_RATE',parameters:[{key:'P_RATE',name:'Đơn giá',unit:'đ/bộ',value:12345}],netConfirmed:true,source:'Synthetic QA'};
 d.pricingDefaults={...IP.defaults(d),productGroups:[g]};IP.validateMaster(d.pricingDefaults);
 const before=JSON.stringify(d.quote);A.equal(JSON.stringify(d.quote),before);G.saveGroup(d.quote,C.copy(g));G.assign(d.quote,'p',g.id);d.quote.pricing.selected='group:'+g.id;
 near(P.calculate(d).products[0].sell,24690);g.parameters[0].value=999;near(P.calculate(d).products[0].sell,24690);
 A.throws(()=>IP.validateMaster({...d.pricingDefaults,productGroups:[g,g]}),/Trùng/);
 A.throws(()=>IP.validateMaster({...d.pricingDefaults,productGroups:[{...g,formula:'UNKNOWN'}]}),/Biến/);
});

test('renaming a quote customer cannot reuse stale customer ID factors',()=>{
 const d=fixture();d.quote.customer='Customer B';const r=P.calculate(d),n=d.quote.products[0].children[0].children[0],ctx=W.context(n,r.nodes.thin,d.quote.products,d.quote);
 A.equal(ctx.customer,'Customer B');A.equal(ctx.customerId,undefined);A.match(r.nodes.thin.ownOps[0].error,/Customer.*customerId/);
 d.quote.customerInfo={id:'KH-B',name:'Customer B'};near(P.calculate(d).nodes.thin.ownOps[0].rate,1045);
});

test('an assembly cannot infer a material category while any child lacks it',()=>{
 const d=fixture(),c=d.quote.products[0].children[0];c.children[0].spec.grade='CT3';c.children[1].spec.grade='';
 const r=P.calculate(d);A.equal(W.context(c,r.nodes.c,d.quote.products,d.quote).grade,undefined);
 c.children[1].spec.grade='CT3';A.equal(W.context(c,r.nodes.c,d.quote.products,d.quote).grade,'CT3');
 c.children[1].spec.grade='SS400';A.equal(W.context(c,r.nodes.c,d.quote.products,d.quote).grade,undefined);
});
