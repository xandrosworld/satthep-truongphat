(function(root){'use strict';
// Compare the saved estimate with whole-order stock nesting, without changing it.
function comparisons(result,ids){
 const selected=new Set(ids);
 return (result.groups||[]).filter(g=>g.rows.some(r=>selected.has(r.id))).map(g=>{
  const rows=g.rows.filter(r=>selected.has(r.id));
  if(g.error||!g.layout||!(g.layout.used>0))return {group:g,rows,error:g.error||'Chưa đủ dữ liệu để trải phôi'};
  const {used,purchased}=g.layout,percent=Math.max(0,(purchased/used-1)*100);
  return {group:g,rows,percent,applicable:Number.isFinite(percent)&&percent<=100,
   stockCount:g.layout.stocks.length,pieceCount:g.rows.reduce((s,r)=>s+r.count,0),
   utilization:used/purchased*100,remaining:Math.max(0,purchased-used),
   current:rows.map(r=>({id:r.id,percent:r.node.materialEstimate?.percent??null}))};
 });
}
const api={comparisons};if(typeof module!=='undefined')module.exports=api;else root.TPMaterialEstimate=api;
})(typeof window!=='undefined'?window:globalThis);
