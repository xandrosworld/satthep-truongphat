'use strict';
const C=require('../core.js');
function rows(d,ids){const result=C.calculate(d);return C.flatten(d.quote.products).filter(n=>ids.includes(n.id)).flatMap(n=>(n.ops||[]).map((op,index)=>{const rate=d.quote.ratesSnapshot.find(r=>r.id===op.id)||{},computed=result.nodes[n.id]?.ownOps?.find(x=>x.index===index)||{};return {rowId:n.id,index,name:n.name+' · '+(rate.name||op.id),unit:computed.unit||op.quantityUnit||rate.unit||'kg',unitPrice:computed.base??computed.rate??0};}));}
function update(d,selection,prices,fail){
 if(!Array.isArray(prices)||prices.length>500||new Set(prices.map(p=>p.rowId+':'+p.index)).size!==prices.length)fail(400,'Danh sách giá nguyên công không hợp lệ');
 const available=rows(d,selection);
 for(const p of prices){const row=available.find(x=>x.rowId===p.rowId&&x.index===p.index);if(!row||!Number.isFinite(p.unitPrice)||p.unitPrice<0||p.unitPrice>1e12)fail(400,'Đơn giá nguyên công không hợp lệ');const n=C.flatten(d.quote.products).find(n=>n.id===p.rowId),op=n.ops[p.index],rate=d.quote.ratesSnapshot.find(r=>r.id===op.id);const id='production-price-'+n.id+'-'+p.index,copy={...C.copy(rate),id,inside:p.unitPrice,outside:p.unitPrice,unit:row.unit,insideUnit:row.unit,outsideUnit:row.unit};delete copy.priceOptions;const i=d.quote.ratesSnapshot.findIndex(r=>r.id===id);if(i<0)d.quote.ratesSnapshot.push(copy);else d.quote.ratesSnapshot[i]=copy;op.id=id;op.pricingMethod='direct';op.unitPrice=p.unitPrice;op.priceUnit=row.unit;delete op.priceOptionId;}
}
module.exports={rows,update};
