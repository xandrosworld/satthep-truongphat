const {test}=require('node:test'),A=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),T=require('../technical-core.js'),P=require('../pricing-core.js'),C=require('../core.js');
test('technical quote save projects with its loaded catalogue after local catalogue changes',()=>{
 const original=P.demoSeed(),baseline=T.project(original),working=structuredClone(original);working.rates[0].factors=[{id:'complex',param:'complexity',kind:'category',categories:[{key:'New',percent:10}]}];working.quote.products[0].qty=19;
 const old={...baseline,quote:T.project(working).quote};A.throws(()=>T.merge(original,old),/trường.*không được phép/);
 const context={TPTechnical:T,C,Team:{loaded:true,quoteTechnicalBaseline:{id:'quote',document:baseline}},teamCurrent:()=>({id:'quote'})};vm.createContext(context);vm.runInContext(fs.readFileSync('technical-ui.js','utf8').split("'use strict';")[0],context);const payload=context.technicalQuoteDocument(working),merged=T.merge(original,payload);
 A.equal(merged.quote.products[0].qty,19);A.deepEqual(merged.materials,original.materials);A.deepEqual(merged.quote.ratesSnapshot,original.quote.ratesSnapshot);A.deepEqual(merged.quote.pricing,original.quote.pricing);
 payload.quote.products[0].ops[0].unitPrice=999999;A.throws(()=>T.merge(original,payload),/document.quote.products.0.ops.0.unitPrice/);
});
