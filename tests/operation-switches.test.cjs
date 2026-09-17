const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../core.js'),P=require('../pricing-core.js'),W=require('../work-core.js'),T=require('../technical-core.js'),SA=require('../section-access.js'),{factorFingerprint}=require('../server/access.cjs');
test('Rate feature switches stop calculation without removing factor/recipe declarations; legacy remains enabled',()=>{
 const d=P.demoSeed(),r=d.quote.ratesSnapshot.find(x=>x.id==='paint'),saved=C.copy(r),before=C.calculate(d);A.ok(before.generated.length>0);
 const op={mode:'inside',pricingMethod:'factors'},ctx={area:1};const price=W.price(r,op,ctx,P.tier).value;A.ok(price>r.inside);
 r.factorsEnabled=false;r.consumptionsEnabled=false;A.equal(W.price(r,op,{},P.tier).value,r.inside);A.equal(W.recipes(r).length,0);A.ok(W.declaredRecipes(r).length>0);
 const after=C.calculate(d);A.equal(after.generated.filter(x=>x.rateName===r.name).length,0);A.ok(after.total.parts.finishing<before.total.parts.finishing);A.deepEqual(r.factors,saved.factors);A.deepEqual(r.consumption,saved.consumption);
 r.factorsEnabled=true;r.consumptionsEnabled=true;const restored=C.calculate(d);A.equal(restored.total.grand,before.total.grand);A.equal(W.price(r,op,ctx,P.tier).value,price);
 A.equal(d.rates.find(x=>x.id==='paint').consumptionsEnabled,undefined);A.throws(()=>W.validatePriceOptions({...r,factorsEnabled:'false'}),/Trạng thái/);
});
test('Recipe switch survives technical projection; factor switch requires factor permission',()=>{
 const d=P.demoSeed(),next=C.copy(d);next.quote.ratesSnapshot[0].factorsEnabled=false;A.notEqual(factorFingerprint(d),factorFingerprint(next));
 d.quote.ratesSnapshot.find(r=>r.id==='paint').consumptionsEnabled=false;A.equal(W.recipes(T.project(d).quote.ratesSnapshot.find(r=>r.id==='paint')).length,0);
 const a={rates:C.copy(d.rates)},b=C.copy(a);b.rates[0].factorsEnabled=false;A.ok(SA.denied(a,b,{sections:['catalogOperations'],factors:false},{catalog:true}).includes('factors'));
});
