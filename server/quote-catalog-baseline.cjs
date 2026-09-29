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
module.exports={retainPublishedHistory};
