'use strict';
// Exact scope only. Ambiguous records must be reconciled, never averaged silently.
function resolve(norms,j,o,machineId=''){
 const groups=new Map();
 for(const n of norms){if(!n.active||!['time','labor','machineHours','electricity','consumable','machineCost'].includes(n.category)||n.product!==j.packet.product.name||n.operationRateId!==o.rateId||n.outputUnit!==o.outputUnit||n.machineId&&n.machineId!==machineId||['length','width','thickness'].some(k=>n[k]>0))continue;
  const key=n.category+':'+(n.materialId||''),rows=groups.get(key)||[];rows.push(n);groups.set(key,rows);
 }
 const references=[...groups.values()].flatMap(rows=>{const exact=rows.filter(n=>n.machineId===machineId&&machineId),chosen=exact.length?exact:rows;return chosen.map(n=>({id:n.id,version:n.version,category:n.category,name:n.name,quantity:n.quantity,unit:n.unit,outputUnit:n.outputUnit,materialId:n.materialId||'',machineId:n.machineId||'',evidence:n.evidence,conflict:chosen.length>1}));});
 const category=machineId?'machineHours':'time',candidates=references.filter(n=>n.category===category&&!n.materialId),suggestion=candidates.length===1&&!candidates[0].conflict?candidates[0]:null;
 return {references,suggestion};
}
module.exports={resolve};
