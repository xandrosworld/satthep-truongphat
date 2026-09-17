const {test}=require('node:test'),A=require('node:assert/strict'),P=require('../pricing-core.js'),T=require('../tax-core.js'),C=require('../core.js');
const confirm=q=>T.review(q,{reason:'QA',costConfirmed:true,outputConfirmed:true,inputs:Object.fromEntries(q.products.map(n=>[n.id,{competitor:{status:'excluded'}}]))});
test('mixed output VAT totals group taxable bases, preserve inputs, apply to all methods and final overrides',()=>{
 const d=P.demoSeed(),q=d.quote;q.remnantMode='all';q.pricing.selected='competitor';q.products.forEach(n=>{n.qty=2;n.competitorPrice=100001;});q.outputTax={scope:'product',rates:{[q.products[0].id]:8,[q.products[1].id]:10}};confirm(q);
 let r=P.calculate(d);A.equal(r.total.beforeTax,400004);A.equal(r.total.vat,36000);A.equal(r.total.grand,436004);A.equal(r.tax.outputKnown,true);A.equal(r.tax.releaseErrors.length,0);
 for(const a of Object.values(r.alternatives))A.deepEqual(a.total.taxBreakdown,T.outputTotals(q,a.products).taxBreakdown);
 const p=r.products[0];q.pricing.overrides={[p.node.id]:{mode:'competitor',signature:p.priceSignature,value:120000,reason:'QA'}};r=P.calculate(d);A.equal(r.total.vat,39200);A.equal(q.products[0].competitorPrice,100001);
 const offer=require('../server/access.cjs').publicOffer(d,r);A.equal(offer.vatRate,null);A.deepEqual(offer.taxBreakdown,r.total.taxBreakdown);A.deepEqual(offer.products.map(p=>p.vatRate),[8,10]);
});
test('same rate rounds subtotal once, legacy review preserved, changed scope/products invalidate',()=>{
 const d=P.demoSeed(),q=d.quote;q.vat=10;q.products.forEach(n=>{n.qty=1;n.competitorPrice=5;});q.pricing.selected='competitor';confirm(q);let r=P.calculate(d);A.equal(r.total.vat,1);
 delete q.pricing.taxReview.outputSignature;A.equal(P.calculate(d).tax.outputKnown,true);
 q.outputTax={scope:'product',rates:Object.fromEntries(q.products.map(n=>[n.id,10]))};A.equal(P.calculate(d).tax.outputKnown,false);confirm(q);A.equal(P.calculate(d).total.vat,1);
 q.outputTax.rates[q.products[0].id]=0;A.equal(P.calculate(d).tax.outputKnown,false);confirm(q);A.equal(P.calculate(d).tax.costKnown,true);
 q.products.push(C.cloneNode(q.products[0]));A.equal(P.calculate(d).tax.outputKnown,false);A.ok(P.calculate(d).errors.some(e=>e.includes('thuế suất')));
});
test('missing or invalid product VAT cannot be confirmed; no implicit zero or quote fallback',()=>{
 for(const value of [undefined,null,'',-1,101,'abc']){const d=P.demoSeed(),q=d.quote;q.outputTax={scope:'product',rates:Object.fromEntries(q.products.map(n=>[n.id,value]))};const before=JSON.stringify(q);A.throws(()=>confirm(q),/Thuế suất/);A.equal(JSON.stringify(q),before);A.ok(P.calculate(d).errors.length);}
});
test('material value quantities reconcile with cost including zero prices, units, auxiliary and legacy remnants',()=>{
 for(const unit of ['kg','m²'])for(const price of [0,20000]){const d=P.demoSeed(),q=d.quote,n=C.flatten(q.products).find(n=>n.kind==='material'&&n.spec.shape==='sheet');n.spec.unit=unit;n.spec.price=price;n.materialEstimate={method:'percent',percent:10};n.auxiliaryPercent=7;const r=P.calculate(d),row=r.rows.find(r=>r.id===n.id),v=P.materialValuation(row,r,q);A.equal(v.weight,row.geometry.weight*1.1);A.equal(v.basis*price,row.cost);A.equal(v.auxiliaryCost,r.nodes[n.id].parts.allowance);A.ok(Math.abs(v.auxiliaryWeight-v.weight*.07)<1e-9);}
 for(const mode of ['all','exclude']){const d=P.demoSeed();d.quote.remnantMode=mode;const r=P.calculate(d);for(const row of r.rows){const v=P.materialValuation(row,r,d.quote);A.ok(Math.abs(v.basis*row.spec.price-row.cost)<1e-6);}}
});
test('vendor material has no billable or auxiliary quantities and does not require stock layout',()=>{
 const d=P.demoSeed(),q=d.quote,n=q.products[0];n.outsource={enabled:true,materialSupply:'vendor',price:100,unit:'bộ'};const r=P.calculate(d);for(const row of r.rows.filter(r=>r.productId===n.id)){const v=P.materialValuation(row,r,q);A.equal(v.basis,0);A.equal(v.weight,0);A.equal(v.auxiliaryCost,0);A.equal(v.error,undefined);}
});
test('output VAT belongs to commercial permissions and is absent from technical projection',()=>{
 const d=P.demoSeed(),changed=C.copy(d);changed.quote.outputTax={scope:'product',rates:Object.fromEntries(d.quote.products.map(n=>[n.id,8]))};
 const S=require('../section-access.js');A.deepEqual(S.denied(d,changed,{sections:['commercial'],factors:false}),[]);A.deepEqual(S.denied(d,changed,{sections:['bom','operations'],factors:false}),['commercial']);
 A.equal(require('../technical-core.js').project(changed).quote.outputTax,undefined);
});
