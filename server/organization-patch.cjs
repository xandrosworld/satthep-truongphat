'use strict';
function patchDepartment(old,id,body,fail){
 const d=structuredClone(old),unit=d.departments.find(x=>x.id===id);
 if(!unit)fail(409,'Phòng ban đã bị xóa; nội dung đang nhập vẫn được giữ');
 const labels={name:'Tên phòng ban',kind:'Loại đơn vị',parentId:'Đơn vị cấp trên',workflowId:'Luồng công việc',stage:'Phần việc',active:'Trạng thái'};
 const norm=(u,k)=>k==='kind'?(u[k]||'department'):['parentId','workflowId'].includes(k)?(u[k]||null):k==='active'?u[k]!==false:u[k];
 if(!body.before||!body.changes||Array.isArray(body.changes)||typeof body.changes!=='object')fail(400,'Dữ liệu sửa phòng ban không hợp lệ');
 for(const [key,value]of Object.entries(body.changes)){
  if(!Object.hasOwn(labels,key)||!Object.hasOwn(body.before,key))fail(400,'Trường sửa phòng ban không hợp lệ');
  if(norm(unit,key)!==body.before[key]&&norm(unit,key)!==value)fail(409,labels[key]+' vừa được người khác sửa. Nội dung của bạn vẫn được giữ; mở lại phòng ban để đối chiếu.');
  unit[key]=value;
 }
 return d;
}
module.exports={patchDepartment};
