'use strict';
const {randomUUID}=require('node:crypto'),{fields}=require('../personnel-fields.js');
function createPersonnel({sql,fail,readBody,transaction,audit,get,validate,apply,write,effective,addUser,accounts}){
 const AA=require('../action-access.js'),admin=u=>u.role==='admin',allowed=u=>AA.allows(u,'personnel','view',admin(u)||(get().personnelEditors||[]).includes(u.id)),review=u=>AA.allows(u,'personnel','review',admin(u));
 const cleanText=(v,max=2000)=>{if(v==null)return '';if(typeof v!=='string'||v.length>max)fail(400,'Thông tin hồ sơ không hợp lệ hoặc quá dài');return v.trim();};
 function date(v){const s=cleanText(v,10);if(s&&(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s))fail(400,'Ngày trong hồ sơ không hợp lệ');return s;}
 function record(raw,old,d){
  if(!raw||typeof raw!=='object')fail(400,'Thiếu hồ sơ');const e={...(old||{}),id:old?.id||randomUUID(),profile:{}};
  for(const k of ['name','code','email','phone','duties'])e[k]=cleanText(raw[k],k==='duties'?2000:k==='phone'?40:160);
  if(!e.name||!e.code)fail(400,'Nhập mã và họ tên nhân sự');
  if(e.name.length>100||e.code.length>100)fail(400,'Mã và họ tên tối đa 100 ký tự');if(e.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.email))fail(400,'Email không hợp lệ');
  e.startDate=date(raw.startDate);e.endDate=date(raw.endDate);e.active=raw.active!==false;
  if(e.startDate&&e.endDate&&e.endDate<e.startDate)fail(400,'Ngày nghỉ việc không được trước ngày vào làm');
  if(!Array.isArray(raw.positionIds)||raw.positionIds.some(id=>!d.positions.some(p=>p.id===id)))fail(400,'Vị trí không còn tồn tại');e.positionIds=[...new Set(raw.positionIds)];
  for(const f of fields.filter(f=>!f.base)){let v=raw.profile?.[f.key]??'';if(f.type==='date')v=date(v);else{v=cleanText(v);if(f.type==='number'&&v!==''&&(!Number.isFinite(Number(v))||Number(v)<0))fail(400,f.label+' phải là số không âm');}e.profile[f.key]=v;}
  if(!Array.isArray(raw.workHistory||[])||(raw.workHistory||[]).length>100)fail(400,'Tối đa 100 dòng quá trình công tác');
  e.workHistory=(raw.workHistory||[]).map(r=>{const x={from:date(r.from),to:date(r.to)};if(x.from&&x.to&&x.to<x.from)fail(400,'Ngày kết thúc công tác trước ngày bắt đầu');for(const k of ['department','position','manager','indirectManager'])x[k]=cleanText(r[k],200);return x;});
  return e;
 }
 function save(d,u){const {version,...document}=d;write(document,version+1,u);return {version:version+1};}
 async function handle({req,route,user,send}){
  if(!route.startsWith('/api/personnel'))return false;
  if(route==='/api/personnel/access'&&req.method==='GET'){send(200,{allowed:allowed(user),admin:admin(user)});return true;}
  if(!allowed(user))fail(403,'Chưa được cấp quyền quản lý hồ sơ nhân sự');
  if(route==='/api/personnel'&&req.method==='GET'){const d=get();send(200,{...d,canApprove:review(user),requests:(d.personnelRequests||[]).filter(r=>review(user)||r.actorId===user.id),users:admin(user)?sql.prepare('SELECT id,name,username,active FROM users WHERE deleted_at IS NULL').all():[]});return true;}
  if(req.method!=='POST')fail(405,'Phương thức không hỗ trợ');const b=await readBody(req,500000);
  const result=transaction(()=>{const d=get();if(b.expectedVersion!==d.version)fail(409,'Hồ sơ đã thay đổi; tải lại trước khi lưu');d.personnelRequests??=[];
   if(route==='/api/personnel/editors'){if(!admin(user))fail(403,'Chỉ quản trị được phân quyền nhân sự');if(!Array.isArray(b.ids)||b.ids.some(id=>!sql.prepare('SELECT 1 FROM users WHERE id=? AND active=1 AND deleted_at IS NULL').get(id)))fail(400,'Tài khoản phụ trách không hợp lệ');d.personnelEditors=[...new Set(b.ids)];audit(user,'personnel:editors','1');return save(d,user);}
   if(route==='/api/personnel/submit'){
    const old=b.employeeId?d.employees.find(e=>e.id===b.employeeId):null;if(b.employeeId&&!old)fail(404,'Không tìm thấy nhân sự');
    const e=record(b.employee,old,d);if(d.employees.some(x=>x.id!==e.id&&x.code.toLocaleLowerCase('vi')===e.code.toLocaleLowerCase('vi')))fail(409,'Mã nhân sự đã tồn tại');
    if(d.personnelRequests.some(r=>r.status==='pending'&&r.kind==='profile'&&r.employeeId===e.id))fail(409,'Hồ sơ này đang chờ duyệt');
    d.personnelRequests.push({id:randomUUID(),kind:'profile',employeeId:e.id,employee:e,before:old||null,status:'pending',actorId:user.id,actor:user.name,at:new Date().toISOString()});audit(user,'personnel:submit',e.id);return save(d,user);
   }
   if(route==='/api/personnel/activation'){
    const e=d.employees.find(e=>e.id===b.employeeId);if(!e||!e.active||e.userId)fail(400,'Nhân sự phải đang làm việc và chưa có tài khoản');if(d.personnelRequests.some(r=>r.kind==='activation'&&r.employeeId===e.id&&r.status==='pending'))fail(409,'Đã có yêu cầu kích hoạt');
    d.personnelRequests.push({id:randomUUID(),kind:'activation',employeeId:e.id,status:'pending',actorId:user.id,actor:user.name,at:new Date().toISOString()});audit(user,'personnel:activation',e.id);return save(d,user);
   }
   if(route==='/api/personnel/review'){
    if(!review(user))fail(403,'Chưa có quyền duyệt hồ sơ');const r=d.personnelRequests.find(r=>r.id===b.id);if(!r||r.status!=='pending')fail(409,'Yêu cầu không còn chờ duyệt');if(!['approve','reject'].includes(b.action))fail(400,'Chọn duyệt hoặc từ chối');const reason=cleanText(b.reason,1000);if(b.action==='reject'&&!reason)fail(400,'Nhập lý do từ chối');
    if(b.action==='approve'){
     if(!admin(user)&&(r.kind==='activation'||JSON.stringify(r.employee?.positionIds||[])!==JSON.stringify(r.before?.positionIds||[])||r.before?.userId&&r.employee.active!==r.before.active))fail(403,'Thay đổi vị trí, trạng thái tài khoản và kích hoạt cần quản trị duyệt');
     if(r.kind==='profile'){
      const old=d.employees.find(e=>e.id===r.employeeId);if(JSON.stringify(old||null)!==JSON.stringify(r.before))fail(409,'Hồ sơ gốc đã thay đổi; từ chối để khai lại trên bản mới');
      const e=record(r.employee,old,d);if(old)d.employees=d.employees.map(x=>x.id===e.id?e:x);else d.employees.push(e);
      const checked=validate(d,get());apply(checked,user);d.employees=checked.employees;
     }else{
      const e=d.employees.find(e=>e.id===r.employeeId);if(!e||!e.active||e.userId||!e.positionIds.length)fail(409,'Nhân sự cần bố trí vị trí, đang làm việc và chưa có tài khoản');const rights=effective(d,e);if(!rights.roleTemplateIds.length)fail(400,'Vị trí cần bộ quyền hoạt động');
      const u=addUser({...rights,name:e.name,username:b.username,password:b.password});e.userId=u.id;e.managed=true;accounts.saveRoles(u.id,rights);
     }
    }
    r.status=b.action==='approve'?'approved':'rejected';r.reviewedBy=user.name;r.reviewedAt=new Date().toISOString();r.reason=reason;audit(user,'personnel:'+r.status,r.employeeId);return save(d,user);
   }
   fail(404,'Không tìm thấy thao tác nhân sự');
  });send(200,result);return true;
 }
 return {handle};
}
module.exports={createPersonnel};
