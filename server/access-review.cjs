'use strict';
const SA=require('../section-access.js'),{permissions}=require('./access.cjs');
// Read-only administration views. Effective rights use the same evaluator as APIs.
function createAccessReview({sql,fail,organization,dataAccess}){
 return {handle({req,route,user,send}){
  if(!['/api/access-review','/api/audit-search','/api/access-history'].includes(route))return false;
  if(user.role!=='admin')fail(403,'Chỉ Admin được rà soát quyền và nhật ký');
  if(req.method!=='GET')fail(405,'Chỉ hỗ trợ xem dữ liệu');
  if(route==='/api/access-review'){
   const d=organization.get(),roles=sql.prepare('SELECT id,name,version,document FROM role_templates ORDER BY name').all().map(r=>({...JSON.parse(r.document),id:r.id,version:r.version}));
   const users=sql.prepare('SELECT * FROM users WHERE deleted_at IS NULL ORDER BY name,username').all().map(u=>{
    const employee=d.employees.find(e=>e.userId===u.id),positions=d.positions.filter(p=>employee?.positionIds.includes(p.id)),ids=JSON.parse(u.role_template_ids||'null')||[u.role_template_id].filter(Boolean);
    return {id:u.id,name:u.name,username:u.username,active:!!u.active,role:u.role,employeeId:employee?.id,code:employee?.code||'',positions:positions.map(p=>({id:p.id,name:p.name,departmentId:p.departmentId,manager:p.manager,active:p.active})),roleIds:ids,binding:employee?.managed?'positions':u.follow_role_templates?'roles':'individual',permissions:{...permissions(u),factorsHidden:dataAccess.hideFactors(u)}};
   });
   send(200,{version:d.version,users,roles,departments:d.departments,sections:SA.labels,modes:SA.modeLabels});return true;
  }
  const q=new URL(req.url,'http://localhost').searchParams,limit=100;
  const raw=q.get('before')||'',before=raw?Number(raw):null;if(raw&&(!Number.isSafeInteger(before)||before<1))fail(400,'Mốc nhật ký không hợp lệ');
  if(route==='/api/access-history'){
   const rows=sql.prepare('SELECT h.*,u.name AS actorName FROM access_history h LEFT JOIN users u ON u.id=h.actor'+(before?' WHERE h.seq < ?':'')+' ORDER BY h.seq DESC LIMIT 101').all(...(before?[before]:[])),more=rows.length>limit;if(more)rows.pop();
   send(200,{rows:rows.map(({before_value,after_value,...r})=>({...r,before:JSON.parse(before_value),after:JSON.parse(after_value)})),nextBefore:more?rows.at(-1).seq:null});return true;
  }
  const where=[],args=[];if(before){where.push('a.seq < ?');args.push(before);}
  const action=(q.get('action')||'').trim(),actor=(q.get('actor')||'').trim(),search=(q.get('q')||'').trim();if([action,actor,search].some(s=>s.length>120))fail(400,'Bộ lọc quá dài');
  if(action){where.push('a.action = ?');args.push(action);}if(actor){where.push('a.user_id = ?');args.push(actor);}
  if(search){where.push('(instr(lower(a.entity),lower(?))>0 OR instr(lower(a.detail),lower(?))>0 OR instr(lower(u.name),lower(?))>0)');args.push(search,search,search);}
  for(const [key,op]of [['from','>='],['to','<=']]){const value=q.get(key);if(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)fail(400,'Ngày lọc không hợp lệ');where.push('a.at '+op+' ?');args.push(value+(key==='from'?'T00:00:00.000Z':'T23:59:59.999Z'));}}
  const rows=sql.prepare('SELECT a.seq,a.at,a.user_id AS userId,u.name,a.action,a.entity,a.detail FROM audit a LEFT JOIN users u ON u.id=a.user_id'+(where.length?' WHERE '+where.join(' AND '):'')+' ORDER BY a.seq DESC LIMIT ?').all(...args,limit+1),more=rows.length>limit;if(more)rows.pop();
  send(200,{rows,nextBefore:more?rows.at(-1).seq:null,actions:sql.prepare('SELECT DISTINCT action FROM audit ORDER BY action').all().map(x=>x.action),actors:sql.prepare('SELECT id,name,username FROM users ORDER BY name').all()});return true;
 }};
}
module.exports={createAccessReview};
