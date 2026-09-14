'use strict';
const P=require('../pricing-core.js'),C=require('../core.js'),M=require('../manufacturing-core.js'),Cost=require('../cost-input-core.js'),Tax=require('../tax-core.js');
function seed(){
 const d=P.demoSeed(),q=d.quote,n=q.products[0],leaf=n.children[0].children[0];
 Object.assign(n,{id:'qa-tmc',name:'TMC QA',qty:2,params:{L:1000,W:1000,H:0},ops:[],children:[leaf],tmcKind:'qa',tmcScope:'tmc',pricePerKg:200,competitorPrice:2000});delete n.namePattern;
 Object.assign(leaf,{id:'qa-leaf',qty:1,rule:'flat',ruleSpec:C.copy(d.rules.find(r=>r.id==='flat')),dims:{L:1000,W:1000,H:0},ops:[{id:'cut',mode:'inside',amount:1}]});
 Object.assign(leaf.spec,{density:10000,price:100,props:{T:1},stockL:1000,stockW:1000});
 q.products=[n];q.expenses=[];q.deviceInstallations=[];q.remnantMode='all';q.remnantSelections={};q.kerf=0;q.vat=8;
 Object.assign(q.ratesSnapshot.find(r=>r.id==='cut'),{inside:7,factors:[],tmcReplace:true});
 Object.assign(q.pricing,{incoming:60,outgoing:0,delivery:100,install:40,overhead:20,management:30,special:4,profit:20,processing:3,order:5,customer:0,productionFactors:[],salesFactors:[],reserve:0,tmcLoss:10,selected:'tmc',tmcTables:[{id:'qa',name:'Bảng QA không phải giá khách',unit:'m',thresholdMode:'upper',tiers:[{max:1000,price:100},{max:null,price:200}],ancillary:{kind:'fixed',value:10},common:{kind:'fixed',value:15}}]});
 M.setPolicy(q,{overhead:5,management:3,special:0,profit:10,processing:2,order:0,customer:0,reason:'QA đáp án độc lập; không phải hệ số khách'});
 return d;
}
function mixed(){const d=seed(),n=C.copy(d.quote.products[0]);n.id='qa-mechanical';n.name='Cơ khí QA';n.tmcScope='detail';n.qty=3;n.children[0].id='qa-mechanical-leaf';d.quote.products.push(n);return d;}
function confirm(q){const updates=Cost.rows(q).filter(r=>r.tmcOnly&&!Cost.state(q,r).known).map(r=>({key:r.key,status:'excluded',original:r.value}));if(updates.length)Cost.apply(q,updates,'QA nguồn giá chưa thuế');Tax.review(q,{reason:'QA đối chiếu thử, không phải xác nhận khách',costConfirmed:true,outputConfirmed:true,inputs:Object.fromEntries(q.products.map(n=>[n.id,{kg:{status:'excluded'},competitor:{status:'excluded'},market:{status:n.marketPrice==null?'unknown':'excluded'}}]))});}
module.exports={seed,mixed,confirm};
