'use strict';
const {permissions}=require('./access.cjs');
const A=require('../action-access.js');
const stages=['intake','technical','materials'];
const stageFor=k=>k==='customer'?'intake':['bom','operations','manage'].includes(k)?'technical':'materials';
function nextReviewer(sql,q,s,entry,user){
 if(q.status==='approved'||entry.requesterId===user.id||entry.status==='rejected')return false;
 const r=permissions(user);if(!r.edit||!A.allows(user,'quotes','confirm'))return false;
 return entry.sections.every(k=>{const next=stageFor(k)==='intake'?'technical':stageFor(k)==='technical'?'materials':null;if(!next)return false;
 const assigned=s.work?.[next+'Id'];if(assigned&&assigned!==user.id)return false;
 return next==='technical'?r.sections.some(k=>['bom','operations'].includes(k)):r.costs&&r.sections.includes('materials');});
}
function reviewer(user,status){const r=permissions(user);return status==='draft'?(r.approve&&A.allows(user,'quotes','approve')||r.reopen&&A.allows(user,'quotes','reopen')):r.approve&&A.allows(user,'quotes','approve');}
function downstream(s,stage){const next=stages.slice(stages.indexOf(stage)+1);return next.some(k=>s[k]||s.work?.[k+'StartedFor']||(s.partial||[]).some(x=>x.stage===k));}
function owner(sql,entry,user){return entry?.actorId===user.id||!!entry?.eventId&&sql.prepare('SELECT actor FROM handoff_events WHERE id=?').get(entry.eventId)?.actor===user.id;}
function downstreamEdits(sql,q,stage,entry){
 const row=entry?.quoteVersion&&sql.prepare('SELECT document FROM revisions WHERE id=? AND version=?').get(q.id,entry.quoteVersion);if(!row)return false;
 const SA=require('../section-access.js'),next=stage==='intake'?['bom','operations','materials','logistics','factors','commercial']:stage==='technical'?['materials','logistics','factors','commercial']:['commercial'];
 return SA.denied({quote:JSON.parse(row.document).quote},{quote:JSON.parse(q.document).quote},{sections:SA.keys.filter(k=>!next.includes(k)),factors:!next.includes('factors')}).length>0;
}
function mayReopen(sql,q,s,stage,entry,user){return reviewer(user,q.status)||q.status==='draft'&&!downstream(s,stage)&&!downstreamEdits(sql,q,stage,entry)&&owner(sql,entry,user);}
function guard(sql,fail,q,s,stage,entry,user){if(!mayReopen(sql,q,s,stage,entry,user))fail(403,'Cần gửi yêu cầu mở sửa để người có quyền xác nhận; bước sau đã thực hiện hoặc phần này do người khác bàn giao.');}
module.exports={stages,stageFor,nextReviewer,reviewer,downstream,owner,mayReopen,guard};
