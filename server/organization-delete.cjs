'use strict';
function removeDepartment(old,id,fail){
 const d=structuredClone(old),unit=d.departments.find(x=>x.id===id);
 if(!unit)fail(404,'Đơn vị không còn tồn tại; tải lại cơ cấu');
 const children=d.departments.filter(x=>x.parentId===id);
 if(children.length)fail(409,'Chuyển hoặc xóa các đơn vị trực thuộc trước: '+children.map(x=>x.name).join(', '));
 const positions=d.positions.filter(p=>p.departmentId===id),ids=new Set(positions.map(p=>p.id));
 if(unit.active&&positions.length)fail(409,'Đơn vị còn vị trí làm việc. Chuyển Ngừng sử dụng trước khi xóa để kiểm tra các bố trí liên quan.');
 const employees=d.employees.filter(e=>e.positionIds.some(p=>ids.has(p)));
 d.departments=d.departments.filter(x=>x.id!==id);d.positions=d.positions.filter(p=>!ids.has(p.id));
 for(const e of employees)e.positionIds=e.positionIds.filter(p=>!ids.has(p));
 return {document:d,removed:{department:unit,positions,employeeIds:employees.map(e=>e.id)}};
}
module.exports={removeDepartment};
