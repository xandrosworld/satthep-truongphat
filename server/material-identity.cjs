'use strict';
// Stock size and calculated blank dimensions are not a material identity.
const norm=v=>String(v??'').trim().toLowerCase();
function different(a,b){
 if(!a||!b)return false;
 for(const k of ['shape','substance','grade','brand'])if(norm(a[k])&&norm(b[k])&&norm(a[k])!==norm(b[k]))return true;
 const keys=a.shape==='sheet'?['T']:a.shape==='piece'?[]:['W','H','T','D','F','B'];
 return keys.some(k=>a.props?.[k]!==undefined&&b.props?.[k]!==undefined&&Math.abs(Number(a.props[k])-Number(b.props[k]))>1e-6);
}
function conflicts(sql,packet){
 const row=sql.prepare('SELECT document FROM catalog WHERE id=1').get(),catalog=row?JSON.parse(row.document).materials||[]:[];
 return (packet.materials||[]).flatMap(m=>{const current=catalog.find(c=>c.id===m.material.id),frozen={...m.material,props:m.properties};return different(frozen,current)?[{rowId:m.id,materialId:m.material.id,productionName:m.material.name||m.name,catalogName:current.name}]:[];});
}
function guard(sql,packet,fail){const c=conflicts(sql,packet);if(c.length)fail(409,'Mã vật tư '+[...new Set(c.map(x=>x.materialId))].join(', ')+' khác quy cách giữa lệnh và danh mục kho. Đồng bộ mã vật tư trên lệnh trước khi giữ, mua hoặc xuất kho.');}
module.exports={different,conflicts,guard};
