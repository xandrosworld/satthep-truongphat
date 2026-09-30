'use strict';
// Compare snapshots already calculated for the job, never create a new loss norm.
module.exports=(j,actual)=>(actual?.materials||[]).map(m=>{
 const rows=j.packet.materials.filter(r=>r.material.id===m.materialId),sum=fn=>rows.length&&rows.every(r=>Number.isFinite(fn(r)))?rows.reduce((s,r)=>s+fn(r),0):null;
 const input=sum(r=>r.planned?.purchasedWeight),product=sum(r=>r.dimensions?.weight),reusable=sum(r=>r.planned?.reusableWeight);
 const valid=input>0&&product!==null&&reusable!==null&&input+1e-6>=product+reusable;
 const nesting=valid?Math.max(0,input-product-reusable)/input*100:null;
 const measured=m.balance==='balanced'&&m.inputWeight>0?m.actualLossPercent:null;
 return {materialId:m.materialId,name:m.name,quotePercent:m.quoteLossPercent,nestingPercent:nesting,actualPercent:measured,delta:measured!==null&&nesting!==null?measured-nesting:null,
  state:measured===null?'Chưa đủ đối soát':j.state==='completed'?'Đã đối soát lệnh hoàn thành':'Đang sản xuất — số liệu tạm thời',
  basis:'Phế / đầu vào × 100%; trừ phần tận dụng. Phương án phôi lấy từ hồ sơ kỹ thuật của lệnh, không phải phương án tồn kho đang thử.',layoutBasis:j.packet.layoutBasis||''};
});
