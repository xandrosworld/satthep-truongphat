'use strict';
const {equal}=require('../section-access.js');
const copy=x=>JSON.parse(JSON.stringify(x));
// Old clients serialize their separate catalogue draft with the quote. Only
// exact server-published historical values may be replaced by the quote's
// current catalogue snapshot. Never touch quote nodes or their embedded specs.
function retainPublishedHistory(document,current,loadHistory){
 let history;
 const known=()=>history||(history=loadHistory());
 for(const key of ['rates','pricingDefaults','shapeDefinitions','rules','materials','library','stockSizes','materialPrices','conventions']){
  if(equal(document[key],current[key])||document[key]===undefined||current[key]===undefined)continue;
  if(known().some(c=>equal(c[key],document[key]))){document[key]=copy(current[key]);continue;}
  if(!Array.isArray(document[key])||!Array.isArray(current[key]))continue;
  document[key]=document[key].map(row=>{
   const original=row?.id&&current[key].find(r=>r.id===row.id);
   if(!original||equal(row,original))return row;
   return known().some(c=>(c[key]||[]).some(r=>r.id===row.id&&equal(r,row)))?copy(original):row;
  });
 }
}
// Quote saves are not a write channel for catalog pricing outside the actor's
// rights. Retain stored values even for mixed/stale browser catalog drafts.
function retainReadOnlyPricing(document,current,rights){
 if(rights.users)return;
 const allowed=new Set(rights.sections||[]);
 const retain=(target,source,key)=>{if(Object.hasOwn(source||{},key))target[key]=copy(source[key]);else delete target[key];};
 if(!allowed.has('catalogOperations'))retain(document,current,'rates');
 const section=k=>['expenseRates','incoming','outgoing','delivery','install'].includes(k)?'catalogLogistics':['factorDefinitions','salesFactors','productionFactors','overhead','management','special','profit','processing','order','reserve','customer'].includes(k)?'factors':'catalogOperations';
 const target=document.pricingDefaults||(document.pricingDefaults={}),source=current.pricingDefaults||{};
 for(const key of new Set([...Object.keys(target),...Object.keys(source)])){
  const owner=section(key);
  if(!allowed.has(owner)||owner==='factors'&&!rights.factors)retain(target,source,key);
 }
 if(current.pricingDefaults===undefined&&!Object.keys(target).length)delete document.pricingDefaults;
}
module.exports={retainPublishedHistory,retainReadOnlyPricing};
