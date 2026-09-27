'use strict';
const AA=require('../action-access.js');
function create({sql,fail,packet}){
 const records=kind=>sql.prepare('SELECT id,document FROM ops_records WHERE kind=?').all(kind).map(r=>({...JSON.parse(r.document),id:r.id}));
 const sum=(rows,key)=>rows.reduce((s,r)=>s+(Number.isFinite(r[key])?r[key]:0),0);
 function view(j,u){
  const lots=new Map(records('lot').map(l=>[l.id,l])),holds=records('hold').filter(h=>h.jobId===j.id&&['issued','settled'].includes(h.state));
  const stocks=records('stage-stock').filter(s=>s.jobId===j.id&&s.kind!=='finished');
  const stages=j.packet.operations.map(o=>({o,s:stocks.find(s=>s.operationId===o.id)}));
  const moves=sql.prepare('SELECT document FROM stock_movements').all().map(r=>JSON.parse(r.document)).filter(m=>m.jobId===j.id);
  const returns=moves.filter(m=>m.kind==='return').map(m=>{const l=lots.get(m.lotId)||{};return {id:m.id,lotId:m.lotId,materialId:m.materialId,operationId:m.operationId||j.packet.operations[0]?.id,quantity:m.quantity,unit:l.unit,length:l.length,width:l.width,thickness:l.thickness,weight:m.weight,warehouse:m.warehouse,at:m.at};});
  const order=sql.prepare('SELECT quote_id,quote_version FROM orders WHERE id=?').get(j.order_id),revision=order&&sql.prepare('SELECT document FROM revisions WHERE id=? AND version=?').get(order.quote_id,order.quote_version);
  let original=[];
  if(revision){const d=JSON.parse(revision.document);d.quote.products=d.quote.products.filter(p=>p.id===j.product_id);if(d.quote.products.length){d.quote.products[0].qty=j.quantity;original=packet(d).materials;}}
  const ids=[...new Set([...j.packet.materials.map(m=>m.material.id),...original.map(m=>m.material.id),...holds.map(h=>h.materialId),...stocks.flatMap(s=>s.materials.map(m=>m.materialId))])];
  const materials=ids.map(id=>{
   const rows=j.packet.materials.filter(m=>m.material.id===id),planned=original.filter(m=>m.material.id===id),hs=holds.filter(h=>h.materialId===id);
   const issued=hs.map(h=>{const l=lots.get(h.lotId)||{};return {holdId:h.id,lotId:h.lotId,quantity:h.quantity,unit:l.unit,length:l.length,width:l.width,thickness:l.thickness,weight:Number.isFinite(l.unitWeight)?h.quantity*l.unitWeight:null,warehouse:l.warehouse};});
   const chain=stages.filter(x=>x.s).map(x=>({operationId:x.o.id,name:x.o.name,materials:x.s.materials.filter(m=>m.materialId===id)})).filter(x=>x.materials.length);
   const all=chain.flatMap(x=>x.materials),first=chain[0]?.materials,last=chain.at(-1)?.materials;
   const external=sum(first?.filter(m=>m.external)||[],'inputWeight');
   const input=issued.length||first?sum(issued,'weight')+external:null;
   const tracked=new Set(first?.map(m=>m.holdId)||[]),pending=hs.some(h=>!tracked.has(h.id));
   const product=last?sum(last,'productWeight'):null,remnant=all.length?sum(all,'remnantWeight'):null,scrap=all.length?sum(all,'scrapWeight'):null;
   const difference=input!==null&&product!==null&&!pending?input-product-remnant-scrap:null;
   const quoteInput=planned.length&&planned.every(m=>Number.isFinite(m.planned?.purchasedWeight))?planned.reduce((s,m)=>s+m.planned.purchasedWeight,0):null;
   const quoteProduct=planned.length&&planned.every(m=>Number.isFinite(m.dimensions.weight))?planned.reduce((s,m)=>s+m.dimensions.weight,0):null;
   const quoteReusable=planned.length&&planned.every(m=>Number.isFinite(m.planned?.reusableWeight))?planned.reduce((s,m)=>s+m.planned.reusableWeight,0):null;
   const quoteScrap=quoteInput!==null&&quoteProduct!==null&&quoteReusable!==null?Math.max(0,quoteInput-quoteProduct-quoteReusable):null;
   return {materialId:id,name:rows[0]?.material.name||planned[0]?.material.name||id,issued,externalWeight:external,parts:rows.map(m=>({id:m.id,name:m.name,quantity:m.count,length:m.dimensions.length,width:m.dimensions.width,plannedWeight:m.dimensions.weight})),inputWeight:input,productWeight:product,remnantWeight:remnant,scrapWeight:scrap,difference,balance:difference===null?'pending':Math.abs(difference)<=Math.max(.001,input*1e-6)?'balanced':'mismatch',pending,latestOperation:chain.at(-1)?.name||null,quoteInput,quoteProduct,quoteReusable,quoteScrap,actualLossPercent:input>0&&scrap!==null?scrap/input*100:null,quoteLossPercent:quoteInput>0&&quoteScrap!==null?quoteScrap/quoteInput*100:null,issuedVariance:input!==null&&quoteInput!==null?input-quoteInput:null,returns:returns.filter(r=>r.materialId===id)};
  });
  const operations=stages.map(({o,s})=>{const remnant=s?sum(s.materials,'remnantWeight'):null;return {id:o.id,name:o.name,object:o.object,quantity:s?.quantity??null,unit:s?.unit||o.outputUnit,inputWeight:s?.inputWeight??null,productWeight:s?.weight??null,remnantWeight:remnant,scrapWeight:s?.scrapWeight??null,difference:s?s.inputWeight-s.weight-remnant-s.scrapWeight:null,lossPercent:s?.inputWeight>0?s.scrapWeight/s.inputWeight*100:null,plannedLossPercent:o.lossPercent??null,reason:s?.reason||'',at:s?.at||null};});
  const review=require('./production-review-tables.cjs').create({sql,fail}).view(j,u);
  const response={jobId:j.id,version:j.version,materials,operations,canSeeCosts:review.canSeeCosts,canCreateCosts:review.canSeeCosts&&AA.allows(u,'costs','create',u.role==='admin')};
  if(review.canSeeCosts){
   const costs=sql.prepare("SELECT id,document FROM business_records WHERE kind='cost'").all().map(r=>({...JSON.parse(r.document),id:r.id})).filter(c=>c.jobId===j.id&&!c.voidedAt);
   response.costs=review.rows.map(r=>{const entries=costs.filter(c=>c.operationId===r.id),actual=entries.length?sum(entries,'amount'):null;return {id:r.id,name:r.name,object:r.object,quoteCost:r.quoteCost,standardCost:r.standardCost,actualHours:r.actualHours,estimatedMachineCost:Number.isFinite(r.actualHours)&&Number.isFinite(r.hourRate)?r.actualHours*r.hourRate:null,actualCost:actual,variance:actual!==null&&r.quoteCost!==null?actual-r.quoteCost:null,entries:entries.map(c=>({date:c.date,reference:c.reference,category:c.category,amount:c.amount,note:c.note}))};});
   response.unassignedCosts=costs.filter(c=>!j.packet.operations.some(o=>o.id===c.operationId)).map(c=>({date:c.date,reference:c.reference,category:c.category,amount:c.amount,note:c.note}));
   response.recordedTotal=sum(costs,'amount');
  }
  return response;
 }
 async function handle({req,route,user,send}){const m=route.match(/^\/api\/production\/([^/]+)\/reconciliation$/);if(!m)return false;if(req.method!=='GET')fail(405,'Chỉ đọc đối chiếu');const r=sql.prepare('SELECT * FROM production_jobs WHERE id=?').get(m[1]);if(!r)fail(404,'Không có lệnh');send(200,view({...r,packet:JSON.parse(r.packet),progress:JSON.parse(r.progress)},user));return true;}
 return {view,handle};
}
module.exports={create};
