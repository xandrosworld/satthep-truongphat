'use strict';
const {randomUUID}=require('node:crypto'),SA=require('../section-access.js'),{permissions}=require('./access.cjs'),A=require('../action-access.js'),Policy=require('./correction-policy.cjs'),Partial=require('../partial-handoff-core.js');
const sections=SA.keys.filter(k=>!k.startsWith('catalog'));
const stageFor=k=>k==='customer'?'intake':['bom','operations','logistics','commercial','manage'].includes(k)?'technical':'materials';
module.exports=function({sql,fail,readBody,transaction,audit,getQuote,saveQuote,notifications}){
 const get=id=>JSON.parse(sql.prepare('SELECT document FROM quote_handoffs WHERE quote_id=?').get(id)?.document||'{}');
 const put=(id,s)=>sql.prepare('INSERT INTO quote_handoffs VALUES(?,?) ON CONFLICT(quote_id) DO UPDATE SET document=excluded.document').run(id,JSON.stringify(s));
 const active=s=>(s.corrections||[]).find(x=>x.status==='open');
 function emit(q,user,entry,kind){
  const people=sql.prepare('SELECT * FROM users WHERE active=1').all(),s=get(q.id),ids=new Set([entry.requesterId,s.work?.technicalId,s.work?.materialsId]);
  for(const stage of Policy.stages){for(const id of s[stage]?.targetIds||[])ids.add(id);if(s[stage]?.actorId)ids.add(s[stage].actorId);if(s[stage]?.eventId)ids.add(sql.prepare('SELECT actor FROM handoff_events WHERE id=?').get(s[stage].eventId)?.actor);}
  const eligible=people.filter(u=>A.allows(u,'quotes','view')&&(Policy.reviewer(u,q.status)||ids.has(u.id)||permissions(u).edit&&entry.sections.some(k=>permissions(u).sections.includes(k))));
  if(kind==='requested'&&!eligible.some(u=>Policy.reviewer(u,q.status)))fail(422,'Chưa có người đủ quyền xét yêu cầu mở sửa');
  const id=randomUUID(),note=({requested:'Đề nghị mở sửa',open:'Đã cho sửa lại',rejected:'Từ chối mở sửa',completed:'Đã hoàn tất sửa lại'}[kind])+': '+entry.sections.map(k=>SA.labels[k]).join(', ')+'. '+entry.reason+(entry.reviewNote?' · '+entry.reviewNote:'');
  sql.prepare('INSERT INTO handoff_events VALUES(?,?,?,?,?,?,?)').run(id,q.id,'correction',q.version,user.id,new Date().toISOString(),note);
  for(const u of eligible)sql.prepare('INSERT INTO notifications VALUES(?,?,?,NULL)').run(randomUUID(),u.id,id);
 }
 function ready(q,s,x){const current=notifications.summary(q);return x.requiredFull.every(k=>current[k]?.current)&&x.requiredPartial.every(key=>(s.partial||[]).some(r=>r.nodeId+'|'+r.stage===key&&!r.unlocked&&Partial.signature(JSON.parse(q.document),r.nodeId,r.stage)===r.signature));}
 function guard(q,d,status){const s=get(q.id),x=active(s);if(!x)return;const denied=SA.denied({quote:JSON.parse(q.document).quote},{quote:d.quote},{sections:x.sections,factors:x.sections.includes('factors')});if(denied.length)fail(403,'Chỉ được sửa vùng đã mở: '+x.sections.map(k=>SA.labels[k]).join(', ')+'. Ngoài phạm vi: '+denied.map(k=>SA.labels[k]).join(', '));if(['submitted','approved'].includes(status)&&!ready(q,s,x))fail(409,'Cần bàn giao và xác nhận lại các phần liên quan trước khi trình duyệt');}
 function afterSave(q,user){const s=get(q.id),x=active(s);if(x&&q.status==='submitted'){x.status='completed';x.completedAt=new Date().toISOString();x.completedBy=user.id;put(q.id,s);emit(q,user,x,'completed');}}
 function open(q,s,x,user){
  const previous=active(s);if(previous&&previous.id!==x.extends)fail(409,'Đang có một phạm vi sửa; hoàn tất trước khi mở yêu cầu khác');
  if(x.extends){if(!previous)fail(409,'Phạm vi sửa đã thay đổi; mở lại yêu cầu để kiểm tra');x.sections=[...new Set([...previous.sections,...x.sections])];previous.status='extended';previous.extendedBy=x.id;previous.extendedAt=new Date().toISOString();}
  const index=Math.min(...x.sections.map(k=>Policy.stages.indexOf(stageFor(k)))),affected=Policy.stages.slice(index),at=new Date().toISOString();
  x.requiredFull=[...new Set([...(previous?.requiredFull||[]),...affected.filter(k=>s[k])])];x.requiredPartial=(s.partial||[]).filter(r=>affected.includes(r.stage)&&!r.unlocked).map(r=>r.nodeId+'|'+r.stage);
  x.requiredPartial=[...new Set([...(previous?.requiredPartial||[]),...x.requiredPartial])];
  for(const k of affected)if(s[k])s[k]={...s[k],unlocked:true,changeReason:x.reason,changedBy:user.name,changedAt:at};
  for(const r of s.partial||[])if(affected.includes(r.stage)){r.unlocked=true;r.reason=x.reason;r.reopenedBy=user.name;r.reopenedAt=at;}
  x.status='open';x.reviewedBy=user.id;x.reviewer=user.name;x.reviewedAt=at;put(q.id,s);
  // Same quote identity, a new immutable revision: approved/sent snapshots stay intact.
  if(q.status!=='draft')saveQuote(q.id,JSON.parse(q.document),user,q.version,'draft','Sửa lại: '+x.reason);
  emit(getQuote(q.id),user,x,'open');audit(user,'correction:open',q.id,JSON.stringify(x));
 }
 function canSelf(q,s,keys,user){const r=permissions(user);return q.status==='draft'&&r.edit&&A.allows(user,'quotes','confirm')&&keys.every(k=>r.sections.includes(k)&&Policy.mayReopen(sql,q,s,stageFor(k),s[stageFor(k)],user));}
 async function handle({req,route,user,rights,send}){
  const m=route.match(/^\/api\/quotes\/([a-f0-9-]+)\/corrections$/);if(!m)return false;
  if(!(rights.costs||rights.technical)||!A.allows(user,'quotes','view'))fail(403,'Không có quyền xem luồng sửa nội bộ');
  if(req.method==='GET'){const q=getQuote(m[1]),s=get(q.id);send(200,{version:q.version,canReview:Policy.reviewer(user,q.status),sections:sections.filter(k=>rights.sectionModes?.[k]!=='none'),items:(s.corrections||[]).map(x=>({...x,canComplete:x.status==='open'&&Policy.reviewer(user,q.status)&&ready(q,s,x)}))});return true;}
  if(req.method!=='POST')fail(405,'Phương thức không hỗ trợ');const b=await readBody(req,10000);
  const result=transaction(()=>{
   const q=getQuote(m[1]),s=get(q.id);if(q.version!==b.expectedVersion)fail(409,'Báo giá đã thay đổi; tải lại trước khi xử lý');
   const rows=s.corrections||(s.corrections=[]),reviewer=Policy.reviewer(user,q.status),reason=String(b.reason||'').trim();
   if(b.action==='request'){
    if(!reviewer&&(!rights.edit||!A.allows(user,'quotes','confirm')))fail(403,'Chưa có quyền đề nghị mở sửa');
    if(!reason||reason.length>2000)fail(400,'Nhập lý do sửa lại, tối đa 2000 ký tự');
    if(!Array.isArray(b.sections)||!b.sections.length||b.sections.some(k=>!sections.includes(k)))fail(400,'Chọn vùng thông tin cần sửa');
    const selected=[...new Set(b.sections)];if(!reviewer&&selected.some(k=>!rights.sections.includes(k)))fail(403,'Chỉ đề nghị sửa phần được phân công');
    if(rows.some(x=>x.status==='pending'))fail(409,'Đã có yêu cầu đang xử lý; mở danh sách yêu cầu để tiếp tục');
    const x={id:randomUUID(),status:'pending',sourceVersion:q.version,sourceStatus:q.status,sections:selected,extends:active(s)?.id||null,reason,requesterId:user.id,requester:user.name,at:new Date().toISOString()};rows.push(x);
    if(reviewer||canSelf(q,s,selected,user))open(q,s,x,user);else{put(q.id,s);emit(q,user,x,'requested');audit(user,'correction:request',q.id,JSON.stringify(x));}
    return {status:x.status,version:getQuote(q.id).version};
   }
   const x=rows.find(x=>x.id===b.id);if(!x)fail(404,'Không tìm thấy yêu cầu sửa');
   if(!reviewer)fail(403,'Chỉ người có quyền được xét yêu cầu');
   if(b.action==='approve'||b.action==='reject'){
    if(x.status!=='pending')fail(409,'Yêu cầu đã được xử lý');if(b.action==='approve'&&(q.version!==x.sourceVersion||q.status!==x.sourceStatus))fail(409,'Báo giá đã đổi sau khi đề nghị; từ chối yêu cầu cũ và tạo lại');
    if(b.action==='approve')open(q,s,x,user);else {if(!reason)fail(400,'Nhập lý do từ chối');x.status='rejected';x.reviewNote=reason.slice(0,2000);x.reviewedBy=user.id;x.reviewedAt=new Date().toISOString();put(q.id,s);emit(q,user,x,'rejected');audit(user,'correction:reject',q.id,reason);}
   }else if(b.action==='complete'){
    if(x.status!=='open'||!ready(q,s,x))fail(409,'Cần bàn giao và xác nhận lại đầy đủ trước khi đóng phạm vi sửa');x.status='completed';x.completedBy=user.id;x.completedAt=new Date().toISOString();put(q.id,s);emit(q,user,x,'completed');audit(user,'correction:complete',q.id,x.id);
   }else fail(400,'Thao tác không hợp lệ');
   return {status:x.status,version:getQuote(q.id).version};
  });send(200,result);return true;
 }
 return {handle,guard,afterSave};
};
