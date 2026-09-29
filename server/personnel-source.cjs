'use strict';
const {equal}=require('../section-access.js');
function placement(document,old,fail){
 if(!Array.isArray(document?.employees))fail(400,'Thiếu danh sách nhân sự');
 const ids=new Set();
 for(const e of document.employees){
  const prior=old.employees.find(p=>p.id===e.id);
  if(!prior)fail(409,'Khai hồ sơ tại Nhân sự và duyệt trước khi bố trí vị trí');
  if(ids.has(e.id))fail(400,'Nhân sự bị trùng');ids.add(e.id);
  for(const key of new Set([...Object.keys(prior),...Object.keys(e)])){
   if(['positionIds','managed','permissionSource'].includes(key))continue;
   if(!equal(e[key],prior[key]))fail(409,'Thông tin hồ sơ chỉ cập nhật qua Nhân sự và phê duyệt');
  }
 }
 if(old.employees.some(e=>!ids.has(e.id)))fail(409,'Không xóa hồ sơ tại cơ cấu; cập nhật trạng thái qua Nhân sự');
 return {...document,employees:document.employees.map(e=>({...old.employees.find(p=>p.id===e.id),positionIds:e.positionIds}))};
}
function staff(d){
 const rows=new Map(),activeDepartment=id=>{const seen=new Set();while(id){if(seen.has(id))return false;seen.add(id);const x=d.departments.find(x=>x.id===id);if(!x||x.active===false)return false;id=x.parentId;}return true;};
 for(const e of d.employees.filter(e=>e.active!==false)){
  const positions=d.positions.filter(p=>(e.positionIds||[]).includes(p.id)&&p.active!==false&&activeDepartment(p.departmentId));
  for(const p of positions.length?positions:[{id:'unassigned',name:'Chưa bố trí vị trí',departmentId:''}]){
   const key=p.id;let row=rows.get(key);if(!row){row={id:key,department:d.departments.find(x=>x.id===p.departmentId)?.name||'Chưa bố trí phòng',position:p.name,count:0,qualification:'Theo hồ sơ nhân sự',files:[]};rows.set(key,row);}row.count++;
  }
 }
 return [...rows.values()].map(r=>({...r,count:String(r.count)}));
}
module.exports={placement,staff};
