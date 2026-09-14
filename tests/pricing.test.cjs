const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../core.js'),P=require('../pricing-core.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<.00001,`${a} ≠ ${b}`);
const seed=()=>P.demoSeed();
test('pricing: legacy quotation remains byte-for-byte equivalent until explicitly enabled',()=>{
  const db=C.seed(),before=JSON.stringify(db);
  assert.deepEqual(P.calculate(db),P.legacyCalculate(db));assert.equal(JSON.stringify(db),before);
});
test('pricing: customer formula separates production, base cost and multiplicative sale factors',()=>{
  const db=seed();Object.assign(db.quote.pricing,{overhead:10,management:20,special:5,profit:11,processing:3,order:4,customer:7,delivery:300000,install:100000,salesFactors:[{id:'extra',name:'Yếu tố thêm',percent:2}]});
  const r=P.calculate(db);assert.deepEqual(r.errors,[]);
  for(const p of r.products){const x=p.parts,direct=x.stock+x.ancillary+x.finishing+x.factory+x.outside+x.incoming+x.outgoing;
    near(p.production,direct*1.1*1.2*1.05);near(p.cost,p.production+x.delivery+x.install);
    assert.equal(p.unitSell,Math.round(p.cost*1.11*1.03*1.04*1.07*1.02/p.node.qty));
  }
  near(r.total.cost,r.total.production+300000+100000);assert.equal(r.total.beforeTax,r.total.sell);
  assert.equal(r.total.vat,Math.round(r.total.sell*db.quote.vat/100));assert.equal(r.total.grand,r.total.sell+r.total.vat);
});
test('pricing: delivery and installation added AFTER production factors, BEFORE sale factors, exactly once',()=>{
  const db=seed();Object.assign(db.quote.pricing,{delivery:0,install:0});const a=P.calculate(db);
  Object.assign(db.quote.pricing,{delivery:80000,install:120000});const b=P.calculate(db);
  near(a.total.production,b.total.production);near(b.total.cost-a.total.cost,200000);
  near(b.total.parts.delivery,80000);near(b.total.parts.install,120000);
  assert.equal(b.total.beforeTax,b.total.sell);assert.ok(b.total.sell-a.total.sell>200000);
});
test('pricing: incoming / outsourcing freight belongs to production basis',()=>{
  const db=seed(),a=P.calculate(db);db.quote.pricing.incoming+=100000;const b=P.calculate(db);
  near(b.total.production-a.total.production,100000*1.02*1.03);
});
test('pricing: order and customer factors are multiplied, never added to each other or reserve',()=>{
  const db=seed();Object.assign(db.quote.pricing,{order:10,customer:20,reserve:5});const r=P.calculate(db);
  for(const p of r.products)assert.equal(p.unitSell,Math.round(p.cost*1.1*1.03*1.1*1.2*1.05/p.node.qty));
});
test('pricing: sample has four ready alternatives and stable independent expected totals',()=>{
  const r=P.calculate(seed());assert.deepEqual(r.errors,[]);
  assert.deepEqual(Object.fromEntries(Object.entries(r.alternatives).map(([id,a])=>[id,a.total.grand])),{detail:7126053,tmc:6765858,kg:7616070,competitor:7865000});
  assert.ok(Object.values(r.alternatives).every(a=>a.ready));
});
test('pricing: same method applies to every product; competitors entered by product; kg uses blank mass',()=>{
  const db=seed();db.quote.pricing.selected='kg';let r=P.calculate(db);
  for(const p of r.products)assert.equal(p.unitSell,Math.round(p.weight/p.node.qty*p.node.pricePerKg));
  db.quote.pricing.selected='competitor';r=P.calculate(db);
  assert.deepEqual(r.products.map(p=>p.unitSell),[395000,320000]);
});
test('pricing: missing method data is not interpreted as a valid zero-priced offer',()=>{
  const db=seed();db.quote.products[0].pricePerKg=null;let r=P.calculate(db);
  assert.equal(r.alternatives.kg.ready,false);assert.equal(r.alternatives.detail.ready,true);assert.deepEqual(r.errors,[]);
  db.quote.pricing.selected='kg';r=P.calculate(db);assert.ok(r.errors.some(e=>e.includes('đơn giá/kg')));
});
test('pricing: tiers include the upper bound, validate the whole table, reject missing/outside ranges',()=>{
  const tiers=[{max:100,percent:1},{max:500,percent:2},{max:null,percent:3}];
  assert.deepEqual([0,100,100.01,500,501].map(n=>P.tier(n,tiers).value),[1,1,2,2,3]);
  assert.throws(()=>P.tier(null,tiers));assert.throws(()=>P.tier(1,[{max:100,percent:1},{max:90,percent:2}]));
  assert.throws(()=>P.tier(1,[{max:null,percent:1},{max:900,percent:2}]));assert.throws(()=>P.tier(600,[{max:500,percent:2}]));
});
test('pricing: operation rates multiply each factor; outside prices explicitly control factors',()=>{
  const rate={inside:1000,outside:2000,factors:[{name:'a',param:'T',tiers:[{max:null,percent:10}]},{name:'b',param:'count',tiers:[{max:null,percent:20}]}]};
  near(P.appliedRate(rate,{mode:'inside'},{T:1,count:10}).value,1320);
  near(P.appliedRate(rate,{mode:'outside'},{T:1,count:10}).value,2000);
  rate.outsideFactors=true;near(P.appliedRate(rate,{mode:'outside'},{T:1,count:10}).value,2640);
});
test('pricing: operations use local multiplied quantity; material / component / product work adds once',()=>{
  const db=seed(),product=db.quote.products[0],component=product.children[0],material=component.children[0];
  db.quote.remnantMode='all';db.quote.remnantSelections={};product.qty=3;component.qty=2;material.qty=4;
  for(const n of C.flatten(db.quote.products))n.ops=[];
  db.quote.ratesSnapshot.push({id:'test',name:'Công việc',unit:'lần',inside:100,outside:200});
  for(const n of [product,component,material])n.ops=[{id:'test',mode:'inside',amount:2}];
  const r=P.calculate(db);near(r.nodes[material.id].ownOps[0].cost,3*2*4*2*100);
  near(r.nodes[component.id].ownOps[0].cost,3*2*2*100);near(r.nodes[product.id].ownOps[0].cost,3*2*100);
  near(r.products[0].parts.factory,(24+6+3)*2*100);
});
test('pricing: finishing generates physical consumption, snapshot price independent of catalog changes',()=>{
  const db=seed(),r=P.calculate(db),g=r.generated[0];near(g.quantity,16*.12);near(g.cost,153600);
  db.materials.find(m=>m.id==='BM-SON').price=999999;near(P.calculate(db).generated[0].cost,153600);
});
test('pricing: all-in outsourced finishing does not double count consumables',()=>{
  const db=seed(),n=db.quote.products[0];n.ops[0].mode='outside';let r=P.calculate(db);
  assert.equal(r.generated.length,0);n.ops[0].suppliesIncluded=false;r=P.calculate(db);
  assert.equal(r.generated.length,1);near(r.generated[0].quantity,1.92);
});
test('pricing: explicit catalog refresh updates finishing snapshots as well as material codes',()=>{
  const db=seed();db.materials.find(m=>m.id==='BM-SON').price=100000;
  near(P.calculate(db).generated[0].cost,153600);P.refreshPrices(db);near(P.calculate(db).generated[0].cost,192000);
});
test('pricing: TMC loss changes TMC costing only; stock purchase geometry and detailed quote stay unchanged',()=>{
  const db=seed(),a=P.calculate(db);db.quote.pricing.tmcLoss=10;const b=P.calculate(db);
  assert.equal(a.alternatives.detail.total.grand,b.alternatives.detail.total.grand);
  assert.ok(b.alternatives.tmc.total.grand>a.alternatives.tmc.total.grand);
  assert.deepEqual(a.groups.map(g=>g.layout),b.groups.map(g=>g.layout));
});
test('pricing: remnant options compare the detailed method without changing physical purchases',()=>{
  const db=seed(),a=P.calculate(db);near(a.reuse.excludeSelected.grand,a.total.grand);
  db.quote.remnantMode='all';const b=P.calculate(db);near(a.reuse.chargeAll.grand,b.total.grand);
  assert.deepEqual(a.groups.map(g=>g.layout),b.groups.map(g=>g.layout));
});
test('pricing: manual price requires a reason, becomes stale on cost changes and warns below cost',()=>{
  const db=seed(),p=P.calculate(db).products[0];db.quote.pricing.overrides[p.node.id]={mode:'detail',signature:p.priceSignature,value:1,reason:'Thử cảnh báo'};
  let r=P.calculate(db);assert.deepEqual(r.errors,[]);assert.ok(r.warnings.length);assert.equal(r.products[0].unitSell,1);
  db.quote.pricing.customer=10;r=P.calculate(db);assert.ok(r.errors.some(e=>e.includes('xác nhận lại')));
});
test('pricing: calculation is pure, JSON roundtrip preserves all four alternatives',()=>{
  const db=seed(),before=JSON.stringify(db),r=P.calculate(db);assert.equal(JSON.stringify(db),before);
  assert.equal(P.calculate(JSON.parse(before)).total.grand,r.total.grand);
});
test('pricing: invalid manufacturing geometry / rate / factor prevents exportable selected quote',()=>{
  const db=seed();db.quote.ratesSnapshot.find(r=>r.id==='cut').inside=-1;assert.ok(P.calculate(db).errors.length);
  const other=seed();other.quote.pricing.salesFactors=[{name:'Sai',percent:-100}];assert.ok(P.calculate(other).errors.length);
});
