'use strict';
// Creating a new factor definition is reserved for administrators. Existing
// numeric values remain subject to the normal factor permissions and locks.
function guard(before,after,user,fail){
 if(user.role==='admin')return;
 for(const key of ['productionFactors','salesFactors']){
  const prior=[...(before?.[key]||[])];
  if(key==='salesFactors'&&before?.reserve)prior.push({id:'old-reserve',name:'Dự phòng bổ sung'});
  const available=new Map();for(const f of prior){const signature=JSON.stringify([f.id,f.name]);available.set(signature,(available.get(signature)||0)+1);}
  for(const f of after?.[key]||[]){const signature=JSON.stringify([f.id,f.name]),count=available.get(signature)||0;if(!count)fail(403,'Chỉ Admin được bổ sung yếu tố sản xuất hoặc yếu tố giá bán');available.set(signature,count-1);}
 }
}
module.exports={guard};
