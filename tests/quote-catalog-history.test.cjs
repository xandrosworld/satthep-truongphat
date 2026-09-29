const {test}=require('node:test'),A=require('node:assert/strict'),{retainPublishedHistory}=require('../server/quote-catalog-baseline.cjs');
test('old published operation catalog and defaults never overwrite quote snapshots',()=>{
 const current={rates:[{id:'cut',inside:200}],pricingDefaults:{groups:['new']},quote:{products:[]}};
 const old={rates:[{id:'cut',inside:100}],pricingDefaults:{groups:['old']}},d={...structuredClone(old),quote:{products:[{id:'p',qty:3}]}};
 retainPublishedHistory(d,current,()=>[old]);
 A.deepEqual(d.rates,current.rates);A.deepEqual(d.pricingDefaults,current.pricingDefaults);A.equal(d.quote.products[0].qty,3);
 const forged=structuredClone(old);forged.rates[0].inside=999;forged.pricingDefaults.groups=['injected'];
 retainPublishedHistory(forged,current,()=>[old]);
 A.equal(forged.rates[0].inside,999);A.deepEqual(forged.pricingDefaults.groups,['injected']);
});

test('quote save discards arbitrary unauthorized catalog prices without dropping technical edits',()=>{
 const {retainReadOnlyPricing}=require('../server/quote-catalog-baseline.cjs');
 const current={rates:[{id:'cut',inside:200}],pricingDefaults:{groups:['original'],overhead:2,incoming:10},quote:{products:[]}};
 for(const rates of [[],[{id:'cut',inside:999},{id:'injected',inside:1}],undefined]){
  const d={rates,pricingDefaults:{groups:['mixed'],overhead:99,incoming:999,injected:true},quote:{products:[{id:'p',qty:4}]}};
  retainReadOnlyPricing(d,current,{sections:['bom','operations','catalogTechnicalOperations']});
  A.deepEqual(d.rates,current.rates);A.deepEqual(d.pricingDefaults,current.pricingDefaults);A.equal(d.quote.products[0].qty,4);
 }
 const authorized=structuredClone(current);authorized.rates[0].inside=300;
 retainReadOnlyPricing(authorized,current,{sections:['catalogOperations']});A.equal(authorized.rates[0].inside,300);
});
