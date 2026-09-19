(function(root){'use strict';
// Compare the saved estimate with whole-order stock nesting, without changing it.
function comparisons(result,ids){
 const selected=new Set(ids);
 return (result.groups||[]).filter(g=>g.rows.some(r=>selected.has(r.id))).map(g=>{
  const rows=g.rows.filter(r=>selected.has(r.id));
  if(g.error||!g.layout||!(g.layout.used>0))return {group:g,rows,error:g.error||'Chưa đủ dữ liệu để trải phôi'};
  const {purchased}=g.layout,sheet=g.spec.shape==='sheet',used=sheet?g.rows.reduce((s,r)=>s+r.geometry.blankArea*1e6,0):g.layout.used;
  if(!(used>0)||used>g.layout.used+1e-6)return {group:g,rows,error:'Diện tích phôi thực không hợp lệ hoặc vượt khổ bao; kiểm tra công thức diện tích'};
  const percent=Math.max(0,(purchased/used-1)*100);
  return {group:g,rows,used,purchased,boundingUsed:g.layout.used,shapeOffcut:Math.max(0,g.layout.used-used),percent,applicable:Number.isFinite(percent)&&percent<=100,
   stockCount:g.layout.stocks.length,pieceCount:g.rows.reduce((s,r)=>s+r.count,0),
   utilization:used/purchased*100,remaining:Math.max(0,purchased-used),
   current:rows.map(r=>({id:r.id,percent:r.node.materialEstimate?.percent??null}))};
 });
}
const api={comparisons};if(typeof module!=='undefined')module.exports=api;else root.TPMaterialEstimate=api;
})(typeof window!=='undefined'?window:globalThis);
