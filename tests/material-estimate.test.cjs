const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../core.js');
const fixture=()=>{const d=C.seed(),n=d.quote.products[0].children[0].children[0];d.quote.products=[{id:'product',kind:'product',name:'SP',qty:2,children:[n],ops:[]}];n.qty=3;n.paramLinks={};n.dims={L:500,W:200,H:0,F:0};n.materialEstimate={method:'percent',percent:10};return {d,n};};
test('estimate uses unfolded sheet demand and hierarchy quantity once, independent from stock size',()=>{const {d,n}=fixture(),r=C.calculate(d),row=r.rows[0];assert.equal(row.count,6);assert.ok(Math.abs(row.estimate.weight-row.geometry.weight*1.1)<1e-9);assert.ok(Math.abs(row.cost-row.estimate.weight*n.spec.price)<1e-8);assert.equal(r.nodes.product.material,row.cost);n.spec.stockL=12000;n.spec.stockW=3000;assert.equal(C.calculate(d).rows[0].cost,row.cost);});
test('estimate can cost before stock is declared and proposal retains its own error',()=>{const {d,n}=fixture();n.spec.stockL=0;n.spec.stockW=0;const r=C.calculate(d);assert.deepEqual(r.errors,[]);assert.ok(r.groups[0].error);assert.ok(r.rows[0].cost>0);});
test('legacy quotation retains exact prior purchasing calculation until explicitly selected',()=>{const {d,n}=fixture();delete n.materialEstimate;const r=C.calculate(d);assert.equal(r.rows[0].estimate,undefined);assert.equal(r.rows[0].cost,r.groups[0].cost);assert.ok(r.rows[0].cost>r.rows[0].geometry.weight*n.spec.price);});
test('net and zero percent agree; invalid percentages and units fail instead of zero-cost success',()=>{const {d,n}=fixture(),g=C.geometry(n,6);for(const percent of [-1,101,NaN,Infinity,'5'])assert.throws(()=>C.materialEstimate({...n,materialEstimate:{method:'percent',percent}},g));n.materialEstimate={method:'net',percent:0};assert.equal(C.materialEstimate(n,g).weight,g.weight);n.spec.unit='tấm';assert.throws(()=>C.materialEstimate(n,g),/đơn giá/);assert.ok(C.calculate(d).errors.some(e=>e.includes('đơn giá')));});
test('bar estimate by meters uses length not surface area; sheet area uses unfolded area',()=>{const {d,n}=fixture(),bar=C.copy(C.seed().quote.products[1].children[0].children[0]);bar.materialEstimate={method:'percent',percent:5};bar.spec.unit='m';bar.dims.L=2000;const e=C.materialEstimate(bar,C.geometry(bar,3));assert.ok(Math.abs(e.basis-6.3)<1e-9);n.spec.unit='m²';const s=C.materialEstimate(n,C.geometry(n,6));assert.ok(Math.abs(s.basis-.66)<1e-9);});
test('purchase proposal groups compatible rows over multiple products; estimates sum separately',()=>{const {d,n}=fixture(),other=C.cloneNode(d.quote.products[0]);d.quote.products.push(other);const r=C.calculate(d);assert.equal(r.groups.length,1);assert.equal(r.groups[0].rows.length,2);assert.ok(Math.abs(r.total.material-r.rows.reduce((s,x)=>s+x.estimate.cost,0))<1e-8);});
test('quotation estimates never alter input catalogue, rules or template dimensions',()=>{const {d,n}=fixture(),masters=JSON.stringify([d.materials,d.rules,d.library]);C.calculate(d);assert.equal(JSON.stringify([d.materials,d.rules,d.library]),masters);});

test('pricing uses estimate cost and vendor-supplied stock is not charged',()=>{const P=require('../pricing-core.js'),d=P.demoSeed(),n=C.flatten(d.quote.products).find(n=>n.kind==='material'&&n.spec.shape==='sheet');n.materialEstimate={method:'percent',percent:10};let r=P.calculate(d),row=r.rows.find(x=>x.id===n.id);assert.equal(r.nodes[n.id].parts.stock,row.estimate.cost);const parent=C.nodePath(d.quote.products,n.id)[0];parent.outsource={enabled:true,materialSupply:'vendor',price:100,unit:'bộ'};r=P.calculate(d);row=r.rows.find(x=>x.id===n.id);assert.equal(row.cost,0);assert.equal(r.nodes[n.id].parts.stock,0);});

test('fully estimated quote is not blocked by stale purchasing remnants',()=>{const {d,n}=fixture();d.quote.remnantMode='exclude';d.quote.remnantSelections={old:['0:0']};const r=C.calculate(d);assert.ok(r.reuse.staleCount);assert.ok(!r.errors.some(e=>e.includes('Phương án cắt')));assert.equal(r.rows[0].recoverableCredit,0);});

test('incoming freight uses estimated mass when chosen, independent of a missing purchasing stock',()=>{const W=require('../work-core.js'),{d,n}=fixture();n.spec.stockL=0;n.spec.stockW=0;const base=C.calculate(d),r=W.expenses([{id:'e',name:'Nhập',category:'incoming',scope:'all',method:'kg_purchase',rate:10,allocation:'weight'}],base,[]);assert.deepEqual(r.errors,[]);assert.ok(Math.abs(r.totals.incoming-base.rows[0].estimate.weight*10)<1e-8);});

const ME=require('../material-estimate-core.js');
test('nesting comparison is whole-order, same for net/percent, and never changes estimates',()=>{
 const {d,n}=fixture();n.spec.stockL=1000;n.spec.stockW=1000;d.quote.kerf=0;
 const other=C.cloneNode(d.quote.products[0]);d.quote.products.push(other);
 const before=JSON.stringify(d),r=C.calculate(d),[x]=ME.comparisons(r,[n.id]);
 assert.equal(x.pieceCount,12);assert.equal(x.stockCount,2);assert.ok(Math.abs(x.percent-(2/1.2-1)*100)<1e-8);assert.equal(x.rows.length,1);assert.equal(JSON.stringify(d),before);
 n.materialEstimate={method:'net',percent:0};assert.equal(ME.comparisons(C.calculate(d),[n.id])[0].percent,x.percent);
});
test('nesting comparison surfaces missing stock, oversized blanks and excessive allowance',()=>{
 const {d,n}=fixture();n.spec.stockL=0;assert.match(ME.comparisons(C.calculate(d),[n.id])[0].error,/Khổ/);
 n.spec.stockL=100;n.spec.stockW=100;assert.match(ME.comparisons(C.calculate(d),[n.id])[0].error,/vượt khổ/);
 n.spec.stockL=6000;n.spec.stockW=2000;const x=ME.comparisons(C.calculate(d),[n.id])[0];assert.ok(x.percent>100);assert.equal(x.applicable,false);
});
test('bar nesting allowance uses length including kerf and partial stock',()=>{
 const {d,n}=fixture();n.spec=C.copy(d.materials.find(m=>m.shape==='box'));n.dims={L:1000};n.spec.stockL=6000;d.quote.kerf=3;
 const x=ME.comparisons(C.calculate(d),[n.id])[0];assert.equal(x.stockCount,2);assert.equal(x.percent,100);
});
