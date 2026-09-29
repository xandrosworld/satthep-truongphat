'use strict';
const AA=require('../action-access.js'),{randomUUID}=require('node:crypto');
module.exports=function({sql,list,get,put,fail}){
 const types={quote:'Theo báo giá',order:'Theo đơn hàng',job:'Theo lệnh sản xuất',project:'Theo dự án',contract:'Theo hợp đồng',production:'Phục vụ sản xuất',office:'Theo văn phòng'};
 const registryKinds=['project','production','office'];
 function departments(){const org=require('./organization.cjs').stored(sql);if(!org)return [];return org.departments.filter(d=>{let p=d,seen=new Set();while(p){if(p.active===false||seen.has(p.id))return false;seen.add(p.id);if(!p.parentId)return true;p=org.departments.find(x=>x.id===p.parentId);}return false;}).map(d=>({id:d.id,name:d.name,parentId:d.parentId||null}));}
 function sources(u){const out=[],can=k=>AA.allows(u,k,'view',u.role==='admin');
  if(can('quotes'))for(const q of sql.prepare('SELECT id,code,status FROM quotes WHERE id NOT IN (SELECT id FROM quote_deletions)').all())if(require('./access.cjs').permissions(u).costs||require('./access.cjs').permissions(u).technical||q.status==='approved')out.push({type:'quote',id:q.id,code:q.code,name:q.code});
  if(can('orders'))for(const r of sql.prepare('SELECT id,code FROM orders').all()){const meta=sql.prepare("SELECT document FROM business_records WHERE kind='order' AND id=?").get(r.id);if(meta&&JSON.parse(meta.document).status==='cancelled')continue;out.push({type:'order',...r,name:r.code});}
  if(can('production'))for(const r of sql.prepare("SELECT id,code FROM production_jobs WHERE state NOT IN ('cancelled','completed')").all())out.push({type:'job',...r,name:r.code});
  if(can('contracts'))for(const r of sql.prepare("SELECT id,document FROM business_records WHERE kind='contract'").all()){const d=JSON.parse(r.document);if(['cancelled','terminated'].includes(d.status))continue;out.push({type:'contract',id:r.id,code:d.code||d.number||r.id,name:d.code||d.number||r.id});}
  for(const r of list('material-purpose'))if(r.active!==false&&registryKinds.includes(r.type))out.push({type:r.type,id:r.id,code:r.code,name:r.name});return out;
 }
 function requester(u){
  const org=require('./organization.cjs').stored(sql),e=org?.employees.find(e=>e.userId===u.id&&e.active!==false);
  const own=new Set((org?.positions||[]).filter(p=>p.active!==false&&e?.positionIds?.includes(p.id)).map(p=>p.departmentId));
  return {id:u.id,employeeId:e?.id||null,code:e?.code||'',name:e?.name||u.name,departments:departments().filter(d=>own.has(d.id))};
 }
 function options(u){const person=requester(u);return {requester:person,departments:u.role==='admin'?departments():person.departments,types,sources:sources(u),canManage:u.role==='admin',registry:u.role==='admin'?list('material-purpose'):[]};}
 function identity(b,u){const person=requester(u),c={requester:person,departments:u.role==='admin'?departments():person.departments},id=b.departmentId||(c.requester.departments.length===1?c.requester.departments[0].id:'');const department=c.departments.find(d=>d.id===id);if(!department)fail(400,'Chọn bộ phận đang hoạt động trong vị trí được bố trí; liên hệ quản trị nếu chưa có vị trí');return {departmentId:department.id,department:department.name,requesterId:u.id,requesterName:c.requester.name,requesterEmployeeId:c.requester.employeeId,requesterCode:c.requester.code};}
 function target(source){
  const out={sourceType:source.type,sourceId:source.id};
  if(source.type==='job'){const j=sql.prepare('SELECT order_id FROM production_jobs WHERE id=?').get(source.id);out.jobId=source.id;out.orderId=j.order_id;}
  if(source.type==='order')out.orderId=source.id;
  if(source.type==='contract'){out.contractId=source.id;const c=JSON.parse(sql.prepare("SELECT document FROM business_records WHERE kind='contract' AND id=?").get(source.id).document);if(c.orderId)out.orderId=c.orderId;}
  if(out.orderId){const o=sql.prepare('SELECT quote_id FROM orders WHERE id=?').get(out.orderId);if(o)out.quoteId=o.quote_id;}
  if(source.type==='quote')out.quoteId=source.id;
  return out;
 }
 function resolve(b,u){const person=identity(b,u),source=sources(u).find(s=>s.type===b.purposeType&&s.id===b.sourceId);if(!source)fail(400,'Chọn mã căn cứ đang hoạt động và trong quyền truy cập');return {...person,purpose:{...source,typeName:types[source.type]},costTarget:target(source),basis:types[source.type]+' · '+source.code+(source.name!==source.code?' · '+source.name:'')};}
 function save(b,u){if(u.role!=='admin')fail(403,'Chỉ Admin quản lý mã mục đích');const old=b.id?get('material-purpose',b.id):null;if(b.id&&!old)fail(404,'Không tìm thấy mã mục đích');if((old?.version||0)!==b.expectedVersion)fail(409,'Danh mục đã đổi, tải lại');if(!registryKinds.includes(b.type))fail(400,'Loại mục đích không hợp lệ');if(b.active!==undefined&&typeof b.active!=='boolean')fail(400,'Trạng thái mã không hợp lệ');const code=String(b.code||'').trim(),name=String(b.name||'').trim();if(!/^[\p{L}\p{N}_.\/-]{1,60}$/u.test(code)||!name||name.length>200)fail(400,'Nhập mã và tên mục đích hợp lệ');if(old&&(old.code!==code||old.type!==b.type))fail(400,'Giữ nguyên mã và loại đã tạo');if(list('material-purpose').some(r=>r.id!==old?.id&&r.type===b.type&&r.code.toLowerCase()===code.toLowerCase()))fail(409,'Mã mục đích đã tồn tại');return put('material-purpose',old?.id||randomUUID(),{type:b.type,code,name,active:b.active!==false,history:[...(old?.history||[]),{at:new Date().toISOString(),actor:u.id,before:old?{name:old.name,active:old.active}:null,after:{name,active:b.active!==false}}]},(old?.version||0)+1);}
 return {options,resolve,identity,save};
};
