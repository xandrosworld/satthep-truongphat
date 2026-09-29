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
