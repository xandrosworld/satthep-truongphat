const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../core.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function fixture(shape='sheet',unit=shape==='sheet'?'tấm':'thanh'){
  const d=C.seed(),m=C.copy(d.materials.find(m=>m.shape===shape));Object.assign(m,{stockL:100,stockW:100,unit,price:1000000});
  const rule=d.rules.find(r=>r.id===(shape==='sheet'?'flat':'bar'));
  const n={id:'test-material',kind:'material',name:m.name,materialId:m.id,qty:1,spec:m,rule:rule.id,ruleSpec:C.copy(rule),dims:{L:70,W:100},ops:[]};
  d.quote.products=[{id:'test-product',kind:'product',name:'Test',qty:1,children:[n],ops:[],transport:0,install:0}];
  Object.assign(d.quote,{kerf:5,overhead:0,margin:0,vat:0});return d;
}
function choose(d,filter=()=>true){const r=C.calculate(d);d.quote.remnantSelections=Object.fromEntries(r.groups.filter(g=>!g.error).map(g=>[g.signature,g.remnants.filter(filter).map(x=>x.id)]));return C.calculate(d);}
test('remnants: explicit choice does not change the default all-cost quotation',()=>{
  const d=fixture(),before=C.calculate(d);const selected=choose(d);assert.equal(selected.total.grand,before.total.grand);assert.equal(selected.reuse.selectedCount,1);assert.equal(selected.reuse.mode,'all');near(selected.reuse.credit,250000);
});
test('sheet: 70% used + 25% reusable + 5% kerf; exclude charges 75%, not 70%',()=>{
  const d=fixture();choose(d);d.quote.remnantMode='exclude';const r=C.calculate(d),g=r.groups[0];
  assert.equal(g.layout.used,7000);assert.equal(g.reusableMeasure,2500);assert.equal(g.kerfMeasure,500);assert.equal(g.remnants[0].l,25);assert.equal(g.remnants[0].w,100);
  assert.equal(g.purchaseCost,1000000);assert.equal(g.cost,750000);assert.equal(r.total.grand,750000);assert.equal(g.layout.stocks.length,1);assert.equal(r.reuse.chargeAll.grand,1000000);
});
test('bar: reusable tail excludes kerf and cannot reduce stock purchases',()=>{
  const d=fixture('box');choose(d);d.quote.remnantMode='exclude';const r=C.calculate(d),g=r.groups[0];
  assert.equal(g.remnants[0].l,25);assert.equal(g.remnants[0].x,75);assert.equal(g.kerfMeasure,5);assert.equal(g.cost,750000);assert.equal(g.layout.stocks.length,1);
});
test('remnants: all supported purchase units use the same physical credit fraction',()=>{
  for(const [shape,units]of [['sheet',['kg','m²','tấm']],['box',['kg','m','thanh']]])for(const unit of units){const d=fixture(shape,unit);choose(d);d.quote.remnantMode='exclude';const r=C.calculate(d),g=r.groups[0];near(g.cost,g.purchaseCost*.75);near(r.total.material,g.cost);}
});
test('remnants: free rectangles are in stock bounds and overlap neither phôi nor each other',()=>{
  const d=C.seed(),r=choose(d);
  for(const g of r.groups){let free=0;for(const f of g.remnants){assert.ok(f.l>0);free+=f.measure;assert.ok(f.x>=0&&f.x+f.l<=g.layout.stockL+1e-8);if(g.spec.shape==='sheet'){assert.ok(f.w>0&&f.y>=0&&f.y+f.w<=g.layout.stockW+1e-8);const others=[...g.layout.stocks[f.stockIndex].placements,...g.remnants.filter(x=>x.stockIndex===f.stockIndex&&x!==f)];for(const p of others)assert.ok(f.x+f.l<=p.x+1e-8||p.x+p.l<=f.x+1e-8||f.y+f.w<=p.y+1e-8||p.y+p.w<=f.y+1e-8);}}
    near(g.layout.used+free+g.kerfMeasure,g.layout.purchased);assert.ok(g.cost>=0);near(g.recoverableCredit,g.purchaseCost*free/g.layout.purchased);
  }
});
test('remnants: allocation across products balances once and preserves mass and operations',()=>{
  const d=C.seed(),p=C.cloneNode(d.quote.products[0]);p.qty=3;d.quote.products.push(p);const original=C.calculate(d);choose(d);d.quote.remnantMode='exclude';const r=C.calculate(d);
  near(original.total.material-r.total.material,r.reuse.credit);near(r.rows.reduce((s,x)=>s+x.cost,0),r.total.material);near(r.products.reduce((s,x)=>s+x.material,0),r.total.material);
  for(const key of ['weight','area','ops','transport','install'])near(r.total[key],original.total[key]);
  for(let i=0;i<r.rows.length;i++){near(r.rows[i].purchasedWeight||0,original.rows[i].purchasedWeight||0);near(r.rows[i].purchasedArea||0,original.rows[i].purchasedArea||0);}
  assert.deepEqual(r.total,r.reuse.excludeSelected);assert.deepEqual(original.total,r.reuse.chargeAll);assert.equal(r.total.grand,r.total.sell+r.total.vat);
});
test('remnants: one physical remainder can be selected independently, duplicate IDs cannot double-credit',()=>{
  const d=fixture();d.quote.products[0].qty=2;const initial=C.calculate(d),g=initial.groups[0],id=g.remnants[0].id;d.quote.remnantSelections={[g.signature]:[id,id]};d.quote.remnantMode='exclude';const r=C.calculate(d);assert.equal(r.reuse.selectedCount,1);near(r.reuse.credit,250000);near(r.total.material,1750000);
});
test('remnants: dimension/quantity/kerf/stock changes invalidate old selections and block discounted export',()=>{
  for(const mutate of [d=>d.quote.products[0].children[0].dims.L=60,d=>d.quote.products[0].qty=2,d=>d.quote.kerf=3,d=>d.quote.products[0].children[0].spec.stockL=120]){
    const d=fixture();choose(d);d.quote.remnantMode='exclude';mutate(d);const r=C.calculate(d);assert.equal(r.reuse.staleCount,1);assert.ok(r.errors.some(e=>e.includes('Rà soát phần dư')));assert.equal(r.reuse.credit,0);near(r.total.material,r.reuse.chargeAll.material);
  }
});
test('remnants: unchanged material groups retain their choices when another group changes',()=>{
  const d=C.seed();choose(d);d.quote.remnantMode='exclude';const before=C.calculate(d),bar=before.groups.find(g=>g.spec.shape==='box');C.applyParam(d.quote.products[0],'W',400);const r=C.calculate(d),after=r.groups.find(g=>g.spec.shape==='box');assert.ok(r.reuse.staleCount>0);near(after.recoverableCredit,bar.recoverableCredit);assert.equal(after.signature,bar.signature);
});
test('remnants: price changes retain physical choices and recalculate their value',()=>{
  const d=fixture();choose(d);d.quote.remnantMode='exclude';d.quote.products[0].children[0].spec.price*=2;const r=C.calculate(d);assert.equal(r.reuse.staleCount,0);assert.equal(r.reuse.selectedCount,1);assert.equal(r.reuse.credit,500000);assert.equal(r.total.material,1500000);
});
test('remnants: JSON round trip and calculation are pure, including pending selections',()=>{
  const d=C.seed();choose(d);d.quote.remnantMode='exclude';const saved=JSON.stringify(d),r=C.calculate(d);assert.equal(JSON.stringify(d),saved);assert.deepEqual(C.calculate(JSON.parse(saved)).total,r.total);assert.equal(C.calculate(JSON.parse(saved)).reuse.selectedCount,r.reuse.selectedCount);
});
test('remnants: exact fit and zero kerf do not invent recoverable cuts',()=>{
  for(const shape of ['sheet','box']){const d=fixture(shape);d.quote.products[0].children[0].dims.L=100;const r=choose(d);assert.equal(r.reuse.selectedCount,0);assert.equal(r.groups[0].kerfMeasure,0);assert.equal(r.groups[0].remnants.length,0);}
  const d=fixture();d.quote.kerf=0;choose(d);d.quote.remnantMode='exclude';const r=C.calculate(d);assert.equal(r.groups[0].kerfMeasure,0);assert.equal(r.groups[0].cost,700000);
});
