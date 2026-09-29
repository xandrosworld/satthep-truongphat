const {test}=require('node:test'),A=require('node:assert/strict'),SA=require('../section-access.js'),P=require('../pricing-core.js');
test('technical draft transport payload retains loaded logistics without changing technical input or baseline',()=>{
 const base=P.demoSeed().quote,original=structuredClone(base),draft=structuredClone(base);
 base.costPriceSources={'quote:incoming':{net:120000},'material:one':{net:5}};base.costPriceHistory=[{key:'quote:incoming',after:{net:120000}}];
 draft.expenses=[{id:'accidental',rate:999}];draft.pricing.incoming=999;draft.pricing.expenseRates=[{rate:999}];draft.purchaseSources={accidental:true};draft.deviceInstallations=[{rate:999}];draft.products[0].transport=999;draft.products[0].freightIn=999;draft.products[0].qty=77;draft.products.push({id:'new',kind:'product',qty:1,transport:999,install:999,children:[]});draft.kerf=3;
 draft.costPriceSources={'quote:incoming':{net:999},'material:one':{net:8}};draft.costPriceHistory=[{key:'quote:incoming',after:{net:999}},{key:'material:one',after:{net:8}}];
 const kept=SA.retainLogistics(draft,base);A.equal(kept.products[0].qty,77);A.equal(kept.kerf,3);A.equal(kept.products.length,3);A.equal(kept.products[2].transport,undefined);A.deepEqual(kept.expenses,base.expenses);A.equal(kept.pricing.incoming,base.pricing.incoming);A.equal(kept.purchaseSources,undefined);A.equal(kept.deviceInstallations,undefined);A.deepEqual(kept.costPriceSources['quote:incoming'],base.costPriceSources['quote:incoming']);A.equal(kept.costPriceSources['material:one'].net,8);A.equal(kept.costPriceHistory.find(x=>x.key==='quote:incoming').after.net,120000);
 A.equal(SA.denied({quote:base},{quote:kept},{sections:['bom','materials']}).includes('logistics'),false);
 A.equal(SA.denied({quote:base},{quote:draft},{sections:['bom','materials']}).includes('logistics'),true);
 A.equal(draft.products[0].transport,999);A.deepEqual(base.products,original.products);
});
