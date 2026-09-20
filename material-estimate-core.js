(function(root){'use strict';
// Compare the saved estimate with whole-order stock nesting, without changing it.
function comparisons(result,ids){
 const selected=new Set(ids);
 return (result.groups||[]).filter(g=>g.rows.some(r=>selected.has(r.id))).map(g=>{
  const rows=g.rows.filter(r=>selected.has(r.id));
  if(g.error||!g.layout||!(g.layout.used>0))return {group:g,rows,error:g.error||'Chưa đủ dữ liệu để trải phôi'};
  const {purchased}=g.layout,sheet=g.spec.shape==='sheet',used=sheet?g.rows.reduce((s,r)=>s+r.geometry.blankArea*1e6,0):g.layout.used;
  if(!(used>0)||used>g.layout.used+1e-6)return {group:g,rows,error:'Diện tích phôi thực không hợp lệ hoặc vượt khổ bao; kiểm tra công thức diện tích'};
  const reusable=g.reusableMeasure||0,purchasedWeight=g.purchasedWeight,blankWeight=g.totalWeight,reusableWeight=purchasedWeight*reusable/purchased;
  const remainingWeight=purchasedWeight-blankWeight-reusableWeight;
  if(!(blankWeight>0)||!Number.isFinite(remainingWeight)||remainingWeight < -1e-7)return {group:g,rows,error:'Khối lượng phôi và phần tận dụng vượt lượng mua; kiểm tra công thức khối lượng'};
  const rawPercent=Math.max(0,remainingWeight)/blankWeight*100,percent=rawPercent>100&&rawPercent<100+1e-8?100:rawPercent;
  return {group:g,rows,used,purchased,reusable,purchasedWeight,blankWeight,reusableWeight,remainingWeight:Math.max(0,remainingWeight),stockPercent:Math.max(0,remainingWeight)/purchasedWeight*100,boundingUsed:g.layout.used,shapeOffcut:Math.max(0,g.layout.used-used),percent,applicable:Number.isFinite(percent)&&percent<=100,
   stockCount:g.layout.stocks.length,pieceCount:g.rows.reduce((s,r)=>s+r.count,0),
   utilization:used/purchased*100,remaining:Math.max(0,purchased-used-reusable),
   current:rows.map(r=>({id:r.id,percent:r.node.materialEstimate?.percent??null}))};
 });
}
const api={comparisons};if(typeof module!=='undefined')module.exports=api;else root.TPMaterialEstimate=api;
})(typeof window!=='undefined'?window:globalThis);
