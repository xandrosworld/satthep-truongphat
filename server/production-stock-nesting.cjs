'use strict';
const C=require('../core.js');
// Repack actual free lots, then calculate the remaining purchase stock. Rectangular
// envelopes are deliberately conservative for shaped blanks; no optimality claim.
function plan(packet,d,lots,holds){
 const rows=(packet.materials||[]).filter(r=>r.material.id===d.materialId&&!r.externallySupplied);
 if(!rows.length||!['tấm','thanh'].includes(d.unit)||rows.some(r=>!Number.isInteger(r.count)||r.count<0||!(r.dimensions.length>0)))return null;
 const fixed=rows.some(r=>r.nestingMode==='bounding-fixed'),sheet=d.unit==='tấm',left=new Map(rows.map(r=>[r.id,r.count])),allocations=[];
 const eligible=l=>l.materialId===d.materialId&&l.unit===d.unit&&(!d.thickness||Math.abs(l.thickness-d.thickness)<1e-6)&&l.length>0&&(!sheet||l.width>0);
 const pending=()=>rows.filter(r=>left.get(r.id)>0).map(r=>({id:r.id,label:r.name,count:left.get(r.id),geometry:{length:r.dimensions.length,width:sheet?r.dimensions.width:0}}));
 const consume=(lot,quantity,held)=>{quantity=Math.floor(quantity);if(!quantity||!eligible(lot))return;const items=pending().filter(r=>sheet?(r.geometry.length<=lot.length&&r.geometry.width<=lot.width||!fixed&&r.geometry.width<=lot.length&&r.geometry.length<=lot.width):r.geometry.length<=lot.length);if(!items.length)return;const layout=C.nest(items,{shape:sheet?'sheet':'bar',shapeDefinition:{nesting:fixed?'bounding-fixed':'bounding'},stockL:lot.length,stockW:lot.width},packet.kerf||0),stocks=layout.stocks.slice(0,quantity);for(const s of stocks)for(const p of s.placements)left.set(p.rowId,left.get(p.rowId)-1);if(stocks.length)allocations.push({lotId:lot.id,warehouse:lot.warehouse,length:lot.length,width:lot.width,quantity:stocks.length,held,stocks});};
 for(const h of holds.filter(h=>h.materialId===d.materialId)){const lot=lots.find(l=>l.id===h.lotId);if(lot)consume(lot,h.quantity,true);}
 for(const lot of lots.filter(eligible).sort((a,b)=>(sheet?a.length*a.width-b.length*b.width:a.length-b.length)||String(a.id).localeCompare(String(b.id))))consume(lot,lot.available,false);
 const remaining=pending(),spec={...rows[0].material,...(d.purchaseSize?{stockL:d.purchaseSize.length,stockW:d.purchaseSize.width}:{})};let purchase={stocks:[]};if(remaining.length)purchase=C.nest(remaining,{shape:sheet?'sheet':'bar',shapeDefinition:{nesting:fixed?'bounding-fixed':'bounding'},stockL:spec.stockL,stockW:spec.stockW},packet.kerf||0);
 const candidates=lots.filter(l=>eligible(l)&&l.available>0&&rows.some(r=>sheet?(r.dimensions.length<=l.length&&r.dimensions.width<=l.width||!fixed&&r.dimensions.width<=l.length&&r.dimensions.length<=l.width):r.dimensions.length<=l.length)).map(l=>({id:l.id,warehouse:l.warehouse,length:l.length,width:l.width,thickness:l.thickness,available:l.available}));
 return {candidates,allocations,remaining:remaining.map(r=>({rowId:r.id,name:r.label,quantity:r.count,length:r.geometry.length,width:r.geometry.width})),purchaseQuantity:purchase.stocks.length,purchaseLength:spec.stockL,purchaseWidth:sheet?spec.stockW:0,purchaseStocks:purchase.stocks,requiredParts:rows.reduce((s,r)=>s+r.count,0),missingParts:remaining.reduce((s,r)=>s+r.count,0)};
}
module.exports={plan};
