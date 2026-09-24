'use strict';
const {permissions}=require('./access.cjs');
function createWorkTeams({sql,fail,readBody,transaction,audit}){
 sql.exec('CREATE TABLE IF NOT EXISTS work_teams(id INTEGER PRIMARY KEY,version INTEGER NOT NULL,document TEXT NOT NULL)');
 const normalize=teams=>Object.fromEntries(Object.entries(teams).map(([stage,t])=>[stage,{...t,managers:t.managers||[t.lead].filter(Boolean),members:t.members||[]}]));
 const get=()=>{const r=sql.prepare('SELECT * FROM work_teams WHERE id=1').get();return {version:r?.version||0,configured:!!r,teams:r?normalize(JSON.parse(r.document)):{}};};
 const eligible=(u,stage)=>{const p=permissions(u);return stage==='sales'?p.customers||p.sections.includes('customer')&&p.edit:stage==='technical'?p.edit&&p.sections.some(k=>['bom','operations'].includes(k)):p.edit&&p.costs&&p.sections.includes('materials');};
 const users=()=>sql.prepare('SELECT * FROM users WHERE active=1 AND deleted_at IS NULL').all();
 const allowed=(user,stage)=>user.role==='admin'||eligible(user,stage)&&get().teams[stage]?.managers?.includes(user.id);
 const choices=(user,stage)=>users().filter(u=>eligible(u,stage)&&(user.role==='admin'||allowed(user,stage)&&(u.id===user.id||get().teams[stage]?.members?.includes(u.id))));
 return {get,eligible,allowed,choices,async handle({req,route,user,send}){
  if(route!=='/api/work-teams')return false;
  if(req.method==='GET'){const data=get();send(200,{...data,canConfigure:user.role==='admin',users:user.role==='admin'?users().map(u=>({id:u.id,name:u.name,stages:['sales','technical','materials'].filter(s=>eligible(u,s))})):[]});return true;}
  if(req.method!=='PUT')fail(405,'Phương thức không hỗ trợ');if(user.role!=='admin')fail(403,'Chỉ Admin được phân cấp bộ phận');const b=await readBody(req,30000);
  const data=transaction(()=>{const old=get();if(b.expectedVersion!==old.version)fail(409,'Phân cấp đã thay đổi; mở lại để đối chiếu');const teams={};for(const stage of ['sales','technical','materials']){const entry=b.teams?.[stage]||{},managers=entry.managers??[entry.lead].filter(Boolean),members=entry.members||[];if(!Array.isArray(managers)||managers.length>100||managers.some(id=>typeof id!=='string'))fail(400,'Vai trò quản lý không hợp lệ');if(!Array.isArray(members)||members.length>100||members.some(id=>typeof id!=='string'))fail(400,'Danh sách cấp dưới không hợp lệ');const valid=users().filter(u=>eligible(u,stage));if(managers.some(id=>!valid.some(u=>u.id===id))||members.some(id=>!valid.some(u=>u.id===id)))fail(400,'Người phụ trách hoặc cấp dưới chưa có quyền bộ phận tương ứng');teams[stage]={managers:[...new Set(managers)],members:[...new Set(members.filter(id=>!managers.includes(id)))]};}sql.prepare('INSERT INTO work_teams VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,document=excluded.document').run(old.version+1,JSON.stringify(teams));for(const u of users()){const roles=Object.fromEntries(['sales','technical','materials'].map(k=>[k,teams[k].managers.includes(u.id)?'manager':teams[k].members.includes(u.id)?'member':'']));sql.prepare('UPDATE users SET work_roles=? WHERE id=?').run(JSON.stringify(roles),u.id);}audit(user,'work:teams','1',JSON.stringify({before:old.teams,after:teams}));return get();});send(200,data);return true;
 }};
}
module.exports={createWorkTeams};
