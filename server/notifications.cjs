'use strict';
const {randomUUID,createHash}=require('node:crypto'),{permissions}=require('./access.cjs'),Technical=require('../technical-core.js'),P=require('../pricing-core.js'),B=require('../batch-one-core.js'),Tax=require('../tax-core.js');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const hash=v=>createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
function fingerprints(document){const q=Technical.project(document).quote;for(const key of ['status','pricing','vat','workspaceKey'])delete q[key];
 // Loading an older quote assigns bookkeeping IDs, without changing technical work.
 const walk=nodes=>{for(const n of nodes){for(const op of n.ops||[])delete op.instanceId;walk(n.children||[]);}};walk(q.products);
 for(const rate of q.ratesSnapshot||[]){if(rate.consumption)delete rate.consumption.id;for(const recipe of rate.consumptions||[])delete recipe.id;}
 return {intake:hash({customer:q.customer,project:q.project,customerInfo:q.customerInfo,request:q.request}),technical:hash(q),materials:hash(Tax.canonicalCostSignature(Tax.costSignature(document.quote)))};}
const canIntake=r=>r.edit&&r.sections.includes('customer');
const canTechnical=r=>r.edit&&r.sections.some(s=>['bom','operations'].includes(s)),canMaterials=r=>r.edit&&r.costs&&r.sections.includes('materials');
const receives=(r,stage)=>stage==='assigned-technical'?canTechnical(r):stage==='assigned-materials'?canMaterials(r):stage==='intake'?(r.users||r.customers||canIntake(r)||canTechnical(r)||canMaterials(r)): ['created','intake'].includes(stage)?canTechnical(r):stage==='technical'?(canMaterials(r)||r.approve):r.approve;
function createNotifications({sql,fail,readBody,transaction,audit,getQuote}){
 sql.exec(`CREATE TABLE IF NOT EXISTS quote_handoffs(quote_id TEXT PRIMARY KEY REFERENCES quotes(id),document TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS handoff_events(id TEXT PRIMARY KEY,quote_id TEXT NOT NULL REFERENCES quotes(id),stage TEXT NOT NULL,quote_version INTEGER NOT NULL,actor TEXT NOT NULL,at TEXT NOT NULL,note TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),event_id TEXT NOT NULL REFERENCES handoff_events(id),read_at TEXT,UNIQUE(user_id,event_id));`);
 const teams=require('./work-teams.cjs').createWorkTeams({sql,fail,readBody,transaction,audit});
 const getState=id=>{const r=sql.prepare('SELECT document FROM quote_handoffs WHERE quote_id=?').get(id);return r?JSON.parse(r.document):{};};
 const workState=id=>{const saved=getState(id),w=saved.work||{},quote=sql.prepare('SELECT status FROM quotes WHERE id=?').get(id);const started=['intake','technical','materials'].some(stage=>!!saved[stage])||['submitted','approved'].includes(quote?.status);const automatic=(!w.status||w.status==='not-started')&&started;const person=id=>{const u=id?sql.prepare('SELECT * FROM users WHERE id=?').get(id):null;return u?{id:u.id,name:u.name,active:!!u.active}:null;};return {revision:w.revision||0,status:automatic?'in-progress':w.status||'not-started',statusReason:automatic?'Đã có xác nhận bàn giao hoặc gửi duyệt; tự chuyển sang Đang làm.':'',technical:person(w.technicalId),materials:person(w.materialsId),updated:w.updated||null,actor:w.actor||''};};
 const canAssign=r=>r.manage||canIntake(r);
 const candidates=()=>sql.prepare('SELECT * FROM users WHERE active=1').all();
 function targetsFor(q,stage){if(stage==='intake'){const heads=Object.values(teams.get().teams).map(t=>t.lead);return candidates().filter(u=>u.role==='admin'||heads.includes(u.id)||(teams.get().version===0&&receives(permissions(u),stage)));}const w=getState(q.id).work||{},assigned=['created','intake'].includes(stage)?w.technicalId:stage==='technical'?w.materialsId:null;return candidates().filter(u=>{const r=permissions(u);if(!receives(r,stage))return false;if(!assigned)return true;return u.id===assigned||(stage==='technical'&&r.approve);});}
 function validateAssigned(q,stage){const w=getState(q.id).work||{},id=stage==='intake'?w.technicalId:stage==='technical'?w.materialsId:null;if(id&&!candidates().some(u=>u.id===id&&(stage==='intake'?canTechnical(permissions(u)):canMaterials(permissions(u)))))fail(422,'Người được giao việc đã ngừng hoạt động hoặc đổi quyền. Chọn lại người phụ trách trước khi xác nhận.');}
 function materialMatches(quote,saved,fp){if(saved.signature===fp.materials)return true;
  // Accept a legacy confirmation only when its stored revision proves the same costs.
  const rev=sql.prepare('SELECT document FROM revisions WHERE id=? AND version=?').get(quote.id,saved.quoteVersion);if(!rev)return false;const old=JSON.parse(rev.document);
  return hash(Tax.costSignature(old.quote))===saved.signature&&fingerprints(old).materials===fp.materials;
 }
 function state(quote){const saved=getState(quote.id),fp=fingerprints(JSON.parse(quote.document));return {quoteVersion:quote.version,work:workState(quote.id),intake:saved.intake?{...saved.intake,current:!saved.intake.unlocked&&saved.intake.signature===fp.intake}:null,technical:saved.technical?{...saved.technical,current:!saved.technical.unlocked&&saved.technical.signature===fp.technical}:null,materials:saved.materials?{...saved.materials,current:!saved.technical?.unlocked&&!saved.materials.unlocked&&saved.technical?.signature===fp.technical&&saved.materials.technicalSignature===fp.technical&&materialMatches(quote,saved.materials,fp)}:null};}
 const priceLock=q=>({pricing:q.pricing,vat:q.vat,outputTax:q.outputTax,products:Tax.canonicalCostSignature(JSON.stringify({products:q.products}))});
 function guard(quote,document){const before=fingerprints(JSON.parse(quote.document)),after=fingerprints(document),s=state(quote);for(const stage of ['intake','technical','materials'])if(s[stage]&&!s[stage].unlocked&&(before[stage]!==after[stage]||(stage==='materials'&&hash(priceLock(JSON.parse(quote.document).quote))!==hash(priceLock(document.quote)))))fail(409,'Phần '+({intake:'đầu vào',technical:'kỹ thuật',materials:'giá vật tư'}[stage])+' đã xác nhận và khóa. Mở sửa phần này, ghi lý do trước khi thay đổi.');}
 return {guard,summary(quote){const s=state(quote);return {...Object.fromEntries(['intake','technical','materials'].map(k=>[k,s[k]?{current:s[k].current,at:s[k].at,quoteVersion:s[k].quoteVersion}:null])),work:s.work};},created(quoteId,user){
  const q=getQuote(quoteId),id=randomUUID(),at=new Date().toISOString();
  const targets=targetsFor(q,'created');
  sql.prepare('INSERT INTO handoff_events VALUES(?,?,?,?,?,?,?)').run(id,q.id,'created',q.version,user.id,at,'');
  for(const target of targets)sql.prepare('INSERT INTO notifications VALUES(?,?,?,NULL)').run(randomUUID(),target.id,id);
  audit(user,'handoff:created',q.id,'v'+q.version);return targets.length;
 },async handle({req,route,user,rights,send}){
  if(await teams.handle({req,route,user,send}))return;
  if(route==='/api/notifications'&&req.method==='GET'){const rows=sql.prepare('SELECT n.id,n.read_at AS readAt,e.quote_id AS quoteId,e.quote_version AS quoteVersion,e.stage,e.at,e.note,q.code,u.name AS actor FROM notifications n JOIN handoff_events e ON e.id=n.event_id JOIN quotes q ON q.id=e.quote_id JOIN users u ON u.id=e.actor WHERE n.user_id=? ORDER BY e.at DESC,n.rowid DESC').all(user.id).filter(n=>receives(rights,n.stage));send(200,{unread:rows.filter(n=>!n.readAt).length,items:rows.slice(0,200)});return true;}
  const read=route.match(/^\/api\/notifications\/([a-f0-9-]+)\/read$/);if(read&&req.method==='POST'){const n=sql.prepare('SELECT n.id,e.stage FROM notifications n JOIN handoff_events e ON e.id=n.event_id WHERE n.id=? AND n.user_id=?').get(read[1],user.id);if(!n||!receives(rights,n.stage))fail(404,'Không tìm thấy thông báo');sql.prepare('UPDATE notifications SET read_at=COALESCE(read_at,?) WHERE id=?').run(new Date().toISOString(),n.id);send(200,{ok:true});return true;}
  if(route==='/api/my-quote-work'&&req.method==='GET'){
   const rows=[];for(const q of sql.prepare('SELECT * FROM quotes ORDER BY rowid DESC').all()){const saved=getState(q.id),w=saved.work||{},current=state(q);for(const stage of ['technical','materials']){const assignee=w[stage+'Id'];if(!assignee||!(stage==='technical'?canTechnical(rights):canMaterials(rights))&&user.role!=='admin')continue;if(assignee!==user.id&&!(teams.allowed(user,stage)&&teams.choices(user,stage).some(u=>u.id===assignee)))continue;const person=candidates().find(u=>u.id===assignee);rows.push({quoteId:q.id,code:q.code,stage,canStart:assignee===user.id,assignee:person?.name||assignee,status:current[stage]?.current?'completed':w[stage+'StartedFor']===assignee?'in-progress':'not-started',revision:w.revision||0});}}
   send(200,rows);return true;
  }
  const start=route.match(/^\/api\/quotes\/([a-f0-9-]+)\/work-start\/(technical|materials)$/);
  if(start&&req.method==='POST'){const b=await readBody(req,2000),q=getQuote(start[1]),stage=start[2];const value=transaction(()=>{const saved=getState(q.id),w=saved.work||{};if(w[stage+'Id']!==user.id||!(stage==='technical'?canTechnical(rights):canMaterials(rights)))fail(403,'Ch\u1ec9 ng\u01b0\u1eddi \u0111\u01b0\u1ee3c giao vi\u1ec7c nh\u1eadn l\u00e0m');if(b.expectedRevision!==(w.revision||0))fail(409,'Giao vi\u1ec7c \u0111\u00e3 thay \u0111\u1ed5i');saved.work={...w,[stage+'StartedFor']:user.id,revision:(w.revision||0)+1};sql.prepare('INSERT INTO quote_handoffs VALUES(?,?) ON CONFLICT(quote_id) DO UPDATE SET document=excluded.document').run(q.id,JSON.stringify(saved));audit(user,'work:start:'+stage,q.id);return {ok:true};});send(200,value);return true;}
  const work=route.match(/^\/api\/quotes\/([a-f0-9-]+)\/work$/);
  if(work){if(!(rights.costs||rights.technical))fail(403,'Không có quyền xem giao việc nội bộ');const q=getQuote(work[1]);
   if(req.method==='GET'){const list=canAssign(rights)?candidates():[];send(200,{...workState(q.id),canEdit:teams.get().version?['technical','materials'].some(s=>teams.allowed(user,s)):canAssign(rights),canStatus:teams.get().version?user.role==='admin':canAssign(rights),candidates:{technical:(teams.get().version?teams.choices(user,'technical'):list.filter(u=>canTechnical(permissions(u)))).map(u=>({id:u.id,name:u.name})),materials:(teams.get().version?teams.choices(user,'materials'):list.filter(u=>canMaterials(permissions(u)))).map(u=>({id:u.id,name:u.name}))}});return true;}
   if(req.method!=='PUT')fail(405,'Phương thức không hỗ trợ');if(!(teams.get().version?['technical','materials'].some(s=>teams.allowed(user,s)):canAssign(rights)))fail(403,'Chưa có quyền giao việc và cập nhật tình trạng đơn hàng');const body=await readBody(req);
   const result=transaction(()=>{const saved=getState(q.id),before=saved.work||{};if(body.expectedRevision!==(before.revision||0))fail(409,'Giao việc đã được người khác cập nhật. Mở lại để lấy thông tin mới.');if(!['not-started','in-progress','completed','cancelled'].includes(body.status))fail(400,'Tình trạng đơn hàng không hợp lệ');
    for(const [key,allowed]of [['technicalId',canTechnical],['materialsId',canMaterials]]){if(teams.get().version&&(before[key]||null)!==(body[key]||null)){const stage=key==='technicalId'?'technical':'materials';if(!teams.allowed(user,stage)||body[key]&&!teams.choices(user,stage).some(u=>u.id===body[key]))fail(403,'Ch\u1ec9 giao vi\u1ec7c trong b\u1ed9 ph\u1eadn ph\u1ee5 tr\u00e1ch');}if(body[key]!==null&&typeof body[key]!=='string')fail(400,'Người phụ trách không hợp lệ');if(body[key]&&!candidates().some(u=>u.id===body[key]&&allowed(permissions(u))))fail(400,'Người phụ trách không hoạt động hoặc chưa có quyền làm phần việc này');}
    if((before.technicalId||null)!==(body.technicalId||null)&&saved.intake)saved.intake.targetIds=[];if((before.materialsId||null)!==(body.materialsId||null)&&saved.technical)saved.technical.targetIds=[];
    if(teams.get().version&&user.role!=='admin'&&body.status!==workState(q.id).status)fail(403,'Ch\u1ec9 Admin c\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i to\u00e0n b\u00e1o gi\u00e1');
    for(const stage of ['technical','materials'])if((before[stage+'Id']||null)!==(body[stage+'Id']||null))delete before[stage+'StartedFor'];
    saved.work={...before,revision:(before.revision||0)+1,status:body.status,technicalId:body.technicalId||null,materialsId:body.materialsId||null,updated:new Date().toISOString(),actor:user.name};
    sql.prepare('INSERT INTO quote_handoffs VALUES(?,?) ON CONFLICT(quote_id) DO UPDATE SET document=excluded.document').run(q.id,JSON.stringify(saved));for(const stage of ['technical','materials']){const key=stage+'Id';if(body[key]&&body[key]!==before[key]){const id=randomUUID();sql.prepare('INSERT INTO handoff_events VALUES(?,?,?,?,?,?,?)').run(id,q.id,'assigned-'+stage,q.version,user.id,new Date().toISOString(),'B\u1ea1n \u0111\u01b0\u1ee3c giao vi\u1ec7c. M\u1edf b\u00e1o gi\u00e1 \u0111\u1ec3 th\u1ef1c hi\u1ec7n.');sql.prepare('INSERT INTO notifications VALUES(?,?,?,NULL)').run(randomUUID(),body[key],id);}}audit(user,'quote:work',q.id,JSON.stringify({before,after:saved.work}));return workState(q.id);});send(200,result);return true;
  }
  const match=route.match(/^\/api\/quotes\/([a-f0-9-]+)\/handoff(?:\/(intake|technical|materials)(\/reopen)?)?$/);if(!match)return false;
  if(!(rights.costs||rights.technical))fail(403,'Không có quyền xem bàn giao nội bộ');const quote=getQuote(match[1]);
  if(req.method==='GET'&&!match[2]){const s=state(quote);s.work.canEdit=teams.get().version?['technical','materials'].some(stage=>teams.allowed(user,stage)):canAssign(rights);for(const key of ['intake','technical','materials'])if(s[key]){delete s[key].signature;delete s[key].technicalSignature;if(rights.technical)delete s[key].note;}send(200,s);return true;}
  if(req.method!=='POST'||!match[2])fail(405,'Phương thức không hỗ trợ');const stage=match[2];if(!(stage==='intake'?canIntake(rights):stage==='technical'?canTechnical(rights):canMaterials(rights)))fail(403,'Chưa được cấp quyền xác nhận phần này');const body=await readBody(req);
  const response=transaction(()=>{const q=getQuote(quote.id);if(q.version!==body.expectedVersion)fail(409,'Báo giá đã đổi. Tải lại bản mới trước khi xác nhận');if(q.status!=='draft')fail(409,'Chỉ xác nhận trên bản nháp hiện tại');const document=JSON.parse(q.document),fp=fingerprints(document),saved=getState(q.id),current=state(q);
   if(match[3]){
    const reason=String(body.reason||'').trim();if(!reason||reason.length>2000)fail(400,'Nhập lý do mở sửa (tối đa 2000 ký tự)');
    const stages=['intake','technical','materials'],at=new Date().toISOString();
    if(saved[stage]?.unlocked)return {duplicate:true,state:current,recipients:0};
    if(!saved[stage])fail(409,'Phần này chưa được xác nhận');
    let recipients=0;
    for(const affected of stages.slice(stages.indexOf(stage))){
     if(saved[affected])saved[affected]={...saved[affected],unlocked:true,changeReason:reason,changedBy:user.name,changedAt:at,changedStage:stage};
     const id=randomUUID(),note='Mở sửa '+({intake:'đầu vào báo giá',technical:'kỹ thuật',materials:'giá vật tư'}[stage])+': '+reason+'. Cần rà và xác nhận lại phần liên quan.';
     sql.prepare('INSERT INTO handoff_events VALUES(?,?,?,?,?,?,?)').run(id,q.id,affected,q.version,user.id,at,note);
     for(const target of targetsFor(q,affected)){sql.prepare('INSERT INTO notifications VALUES(?,?,?,NULL)').run(randomUUID(),target.id,id);recipients++;}
    }
    sql.prepare('INSERT INTO quote_handoffs VALUES(?,?) ON CONFLICT(quote_id) DO UPDATE SET document=excluded.document').run(q.id,JSON.stringify(saved));
    audit(user,'handoff:reopen:'+stage,q.id,reason);return {duplicate:false,state:state(q),recipients};
   }
   if(stage==='technical'&&saved.intake&&!current.intake?.current)fail(409,'Cần xác nhận lại đầu vào đã thay đổi trước khi xác nhận kỹ thuật');
   if(stage==='materials'&&!current.technical?.current)fail(409,'Cần kỹ thuật xác nhận lại dữ liệu hiện tại trước');
   validateAssigned(q,stage);const targets=targetsFor(q,stage),targetIds=targets.map(u=>u.id).sort();
   if(current[stage]?.current&&(!saved[stage].targetIds||JSON.stringify(saved[stage].targetIds)===JSON.stringify(targetIds)))return {duplicate:true,state:current,recipients:0};
   if(stage==='intake'&&!String(document.quote.customer||'').trim())fail(422,'Khai khách hàng trước khi xác nhận dữ liệu đầu vào');
   if(stage==='technical'){const projected=Technical.project(document),calculated=P.calculate(projected),issues=B.technicalSummary(projected.quote.products,calculated).issues;if(issues.length)fail(422,'Bổ sung dữ liệu kỹ thuật trước: '+issues.slice(0,5).join('; '));}
   if(stage==='materials'&&P.calculate(document).rows.some(r=>!r.externallySupplied&&(r.spec.price==null||r.spec.price===''||!Number.isFinite(Number(r.spec.price))||Number(r.spec.price)<0)))fail(422,'Có đơn giá vật tư chưa hợp lệ; cập nhật trước khi xác nhận');
   if(!targets.length)fail(422,'Chưa có tài khoản nhận thông báo; quản trị cần cấp quyền vật tư/phê duyệt');
   const id=randomUUID(),at=new Date().toISOString(),note=String(body.note||'').trim().slice(0,2000),entry={targetIds,eventId:id,quoteVersion:q.version,actor:user.name,at,note,signature:fp[stage],...(stage==='materials'?{technicalSignature:fp.technical}:{})};saved[stage]=entry;
   // Downstream confirmations remain invalid until explicitly confirmed again.
   sql.prepare('INSERT INTO quote_handoffs VALUES(?,?) ON CONFLICT(quote_id) DO UPDATE SET document=excluded.document').run(q.id,JSON.stringify(saved));sql.prepare('INSERT INTO handoff_events VALUES(?,?,?,?,?,?,?)').run(id,q.id,stage,q.version,user.id,at,note);
   for(const target of targets)sql.prepare('INSERT INTO notifications VALUES(?,?,?,NULL)').run(randomUUID(),target.id,id);
   audit(user,'handoff:'+stage,q.id,'v'+q.version);return {duplicate:false,state:state(q),recipients:targets.length};
  });for(const key of ['intake','technical','materials'])if(response.state[key]){delete response.state[key].signature;delete response.state[key].technicalSignature;if(rights.technical)delete response.state[key].note;}send(200,response);return true;
 }};
}
module.exports={createNotifications,fingerprints};
