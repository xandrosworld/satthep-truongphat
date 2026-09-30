'use strict';
const C=require('../core.js'),Costs=require('../cost-input-core.js');
function estimate(document,catalog){
 const copy=structuredClone(document),sources=[],missing=[];
 const refs=new Map(Costs.catalogReferences(catalog).map(r=>[r.identity+'|'+r.unit,r]));
 for(const row of Costs.rows(copy.quote)){
  if(!row.key.startsWith('material:'))continue;
  if(Costs.state(copy.quote,row).known){sources.push({key:row.key,code:row.target.id,status:'reviewed',value:row.value,unit:row.unit});continue;}
  const ref=refs.get(row.identity+'|'+row.unit);
  if(!ref){missing.push({code:row.target.id,unit:row.unit,reason:'Chưa có giá danh mục cùng mã, quy cách và đơn vị'});continue;}
  row.target[row.field]=ref.value;sources.push({key:row.key,code:row.target.id,status:'catalog',value:ref.value,unit:row.unit});
 }
 const result=C.calculate(copy),incomplete=missing.length>0||result.errors.length>0;
 return {weight:result.total.weight,area:result.total.area,material:incomplete?null:result.total.material,total:incomplete?null:result.total.grand,sources,missing,errors:result.errors,provisional:true};
}
module.exports={estimate};
