'use strict';
const {permissions}=require('./access.cjs');
function createWorkTeams({sql,fail,readBody,transaction,audit}){
 sql.exec('CREATE TABLE IF NOT EXISTS work_teams(id INTEGER PRIMARY KEY,version INTEGER NOT NULL,document TEXT NOT NULL)');
 const get=()=>{const r=sql.prepare('SELECT * FROM work_teams WHERE id=1').get();return {version:r?.version||0,teams:r?JSON.parse(r.document):{}};};
 const eligible=(u,stage)=>{const p=permissions(u);return stage==='sales'?p.customers||p.sections.includes('customer')&&p.edit:stage==='technical'?p.edit&&p.sections.some(k=>['bom','operations'].includes(k)):p.edit&&p.costs&&p.sections.includes('materials');};
 const users=()=>sql.prepare('SELECT * FROM users WHERE active=1 AND deleted_at IS NULL').all();
 const allowed=(user,stage)=>user.role==='admin'||get().teams[stage]?.lead===user.id;
 const choices=(user,stage)=>users().filter(u=>eligible(u,stage)&&(user.role==='admin'||allowed(user,stage)&&(u.id===user.id||get().teams[stage]?.members?.includes(u.id))));
 return {get,eligible,allowed,choices,async handle({req,route,user,send}){
  if(route!=='/api/work-teams')return false;
  if(req.method==='GET'){const data=get();send(200,{...data,canConfigure:user.role==='admin',users:user.role==='admin'?users().map(u=>({id:u.id,name:u.name,stages:['sales','technical','materials'].filter(s=>eligible(u,s))})):[]});return true;}
  if(req.method!=='PUT')fail(405,'Phương thức không hỗ trợ');if(user.role!=='admin')fail(403,'Chỉ Admin được phân cấp bộ phận');const b=await readBody(req,30000);
  const data=transaction(()=>{const old=get();if(b.expectedVersion!==old.version)fail(409,'Phân cấp đã thay đổi; mở lại để đối chiếu');const teams={};for(const stage of ['sales','technical','materials']){const entry=b.teams?.[stage]||{},lead=entry.lead||null,members=entry.members||[];if(!Array.isArray(members)||members.length>100||members.some(id=>typeof id!=='string'))fail(400,'Danh sách cấp dưới không hợp lệ');const valid=users().filter(u=>eligible(u,stage));if(lead&&!valid.some(u=>u.id===lead)||members.some(id=>!valid.some(u=>u.id===id)))fail(400,'Người phụ trách hoặc cấp dưới chưa có quyền bộ phận tương ứng');if(!lead&&members.length)fail(400,'Chọn phụ trách bộ phận trước khi chọn cấp dưới');teams[stage]={lead,members:[...new Set(members.filter(id=>id!==lead))]};}sql.prepare('INSERT INTO work_teams VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,document=excluded.document').run(old.version+1,JSON.stringify(teams));audit(user,'work:teams','1',JSON.stringify({before:old.teams,after:teams}));return get();});send(200,data);return true;
 }};
}
module.exports={createWorkTeams};
