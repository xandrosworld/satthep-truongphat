'use strict';
const {randomUUID,createHash}=require('node:crypto'),{permissions}=require('./access.cjs'),Technical=require('../technical-core.js'),P=require('../pricing-core.js'),B=require('../batch-one-core.js'),Tax=require('../tax-core.js');
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])])):v;
const hash=v=>createHash('sha256').update(JSON.stringify(stable(v))).digest('hex');
function fingerprints(document){const q=Technical.project(document).quote;for(const key of ['status','pricing','vat','workspaceKey'])delete q[key];
 // Loading an older quote assigns bookkeeping IDs, without changing technical work.
 const walk=nodes=>{for(const n of nodes){for(const op of n.ops||[])delete op.instanceId;walk(n.children||[]);}};walk(q.products);
 for(const rate of q.ratesSnapshot||[]){if(rate.consumption)delete rate.consumption.id;for(const recipe of rate.consumptions||[])delete recipe.id;}
 return {technical:hash(q),materials:hash(Tax.costSignature(document.quote))};}
const canTechnical=r=>r.edit&&r.sections.some(s=>['bom','operations'].includes(s)),canMaterials=r=>r.edit&&r.costs&&r.sections.includes('materials');
const receives=(r,stage)=>stage==='created'?canTechnical(r):stage==='technical'?(canMaterials(r)||r.approve):r.approve;
function createNotifications({sql,fail,readBody,transaction,audit,getQuote}){
 sql.exec(`CREATE TABLE IF NOT EXISTS quote_handoffs(quote_id TEXT PRIMARY KEY REFERENCES quotes(id),document TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS handoff_events(id TEXT PRIMARY KEY,quote_id TEXT NOT NULL REFERENCES quotes(id),stage TEXT NOT NULL,quote_version INTEGER NOT NULL,actor TEXT NOT NULL,at TEXT NOT NULL,note TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS notifications(id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),event_id TEXT NOT NULL REFERENCES handoff_events(id),read_at TEXT,UNIQUE(user_id,event_id));`);
 const getState=id=>{const r=sql.prepare('SELECT document FROM quote_handoffs WHERE quote_id=?').get(id);return r?JSON.parse(r.document):{};};
 function state(quote){const saved=getState(quote.id),fp=fingerprints(JSON.parse(quote.document));return {quoteVersion:quote.version,technical:saved.technical?{...saved.technical,current:saved.technical.signature===fp.technical}:null,materials:saved.materials?{...saved.materials,current:saved.technical?.signature===fp.technical&&saved.materials.technicalSignature===fp.technical&&saved.materials.signature===fp.materials}:null};}
 return {summary(quote){const s=state(quote);return Object.fromEntries(['technical','materials'].map(k=>[k,s[k]?{current:s[k].current,at:s[k].at,quoteVersion:s[k].quoteVersion}:null]));},created(quoteId,user){
  const q=getQuote(quoteId),id=randomUUID(),at=new Date().toISOString();
  const targets=sql.prepare('SELECT * FROM users WHERE active=1').all().filter(u=>receives(permissions(u),'created'));
  sql.prepare('INSERT INTO handoff_events VALUES(?,?,?,?,?,?,?)').run(id,q.id,'created',q.version,user.id,at,'');
  for(const target of targets)sql.prepare('INSERT INTO notifications VALUES(?,?,?,NULL)').run(randomUUID(),target.id,id);
  audit(user,'handoff:created',q.id,'v'+q.version);return targets.length;
 },async handle({req,route,user,rights,send}){
  if(route==='/api/notifications'&&req.method==='GET'){const rows=sql.prepare('SELECT n.id,n.read_at AS readAt,e.quote_id AS quoteId,e.quote_version AS quoteVersion,e.stage,e.at,e.note,q.code,u.name AS actor FROM notifications n JOIN handoff_events e ON e.id=n.event_id JOIN quotes q ON q.id=e.quote_id JOIN users u ON u.id=e.actor WHERE n.user_id=? ORDER BY e.at DESC,n.rowid DESC').all(user.id).filter(n=>receives(rights,n.stage));send(200,{unread:rows.filter(n=>!n.readAt).length,items:rows.slice(0,200)});return true;}
  const read=route.match(/^\/api\/notifications\/([a-f0-9-]+)\/read$/);if(read&&req.method==='POST'){const n=sql.prepare('SELECT n.id,e.stage FROM notifications n JOIN handoff_events e ON e.id=n.event_id WHERE n.id=? AND n.user_id=?').get(read[1],user.id);if(!n||!receives(rights,n.stage))fail(404,'Không tìm thấy thông báo');sql.prepare('UPDATE notifications SET read_at=COALESCE(read_at,?) WHERE id=?').run(new Date().toISOString(),n.id);send(200,{ok:true});return true;}
  const match=route.match(/^\/api\/quotes\/([a-f0-9-]+)\/handoff(?:\/(technical|materials))?$/);if(!match)return false;
  if(!(rights.costs||rights.technical))fail(403,'Không có quyền xem bàn giao nội bộ');const quote=getQuote(match[1]);
  if(req.method==='GET'&&!match[2]){const s=state(quote);for(const key of ['technical','materials'])if(s[key]){delete s[key].signature;delete s[key].technicalSignature;if(rights.technical)delete s[key].note;}send(200,s);return true;}
  if(req.method!=='POST'||!match[2])fail(405,'Phương thức không hỗ trợ');const stage=match[2];if(!(stage==='technical'?canTechnical(rights):canMaterials(rights)))fail(403,'Chưa được cấp quyền xác nhận phần này');const body=await readBody(req);
  const response=transaction(()=>{const q=getQuote(quote.id);if(q.version!==body.expectedVersion)fail(409,'Báo giá đã đổi. Tải lại bản mới trước khi xác nhận');if(q.status!=='draft')fail(409,'Chỉ xác nhận trên bản nháp hiện tại');const document=JSON.parse(q.document),fp=fingerprints(document),saved=getState(q.id),current=state(q);
   if(stage==='materials'&&!current.technical?.current)fail(409,'Cần kỹ thuật xác nhận lại dữ liệu hiện tại trước');
   if(current[stage]?.current)return {duplicate:true,state:current,recipients:0};
   if(stage==='technical'){const projected=Technical.project(document),calculated=P.calculate(projected),issues=B.technicalSummary(projected.quote.products,calculated).issues;if(issues.length)fail(422,'Bổ sung dữ liệu kỹ thuật trước: '+issues.slice(0,5).join('; '));}
   if(stage==='materials'&&P.calculate(document).rows.some(r=>!r.externallySupplied&&(r.spec.price==null||r.spec.price===''||!Number.isFinite(Number(r.spec.price))||Number(r.spec.price)<0)))fail(422,'Có đơn giá vật tư chưa hợp lệ; cập nhật trước khi xác nhận');
   const targets=sql.prepare('SELECT * FROM users WHERE active=1').all().filter(u=>receives(permissions(u),stage));if(!targets.length)fail(422,'Chưa có tài khoản nhận thông báo; quản trị cần cấp quyền vật tư/phê duyệt');
   const id=randomUUID(),at=new Date().toISOString(),note=String(body.note||'').trim().slice(0,2000),entry={eventId:id,quoteVersion:q.version,actor:user.name,at,note,signature:fp[stage],...(stage==='materials'?{technicalSignature:fp.technical}:{})};saved[stage]=entry;
   if(stage==='technical')delete saved.materials;
   sql.prepare('INSERT INTO quote_handoffs VALUES(?,?) ON CONFLICT(quote_id) DO UPDATE SET document=excluded.document').run(q.id,JSON.stringify(saved));sql.prepare('INSERT INTO handoff_events VALUES(?,?,?,?,?,?,?)').run(id,q.id,stage,q.version,user.id,at,note);
   for(const target of targets)sql.prepare('INSERT INTO notifications VALUES(?,?,?,NULL)').run(randomUUID(),target.id,id);
   audit(user,'handoff:'+stage,q.id,'v'+q.version);return {duplicate:false,state:state(q),recipients:targets.length};
  });for(const key of ['technical','materials'])if(response.state[key]){delete response.state[key].signature;delete response.state[key].technicalSignature;if(rights.technical)delete response.state[key].note;}send(200,response);return true;
 }};
}
module.exports={createNotifications,fingerprints};
