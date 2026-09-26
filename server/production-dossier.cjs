'use strict';
const {randomUUID}=require('node:crypto'),AA=require('../action-access.js');
const text=(v,max=20000)=>typeof v==='string'?v.slice(0,max):'';
const pick=(v,keys)=>Object.fromEntries(keys.filter(k=>v?.[k]!==undefined).map(k=>[k,v[k]]));
function technicalInput(q){
 const numeric=v=>Object.fromEntries(Object.entries(v||{}).filter(([,n])=>typeof n==='number'&&Number.isFinite(n)));
 const tree=nodes=>(nodes||[]).map(n=>({id:n.id,kind:n.kind,name:n.name,qty:n.qty,unit:n.unit||'',materialId:n.materialId||'',specification:text(n.requestSpecification),notes:text(n.notes),lineNote:text(n.lineNote),dims:numeric(n.dims),params:numeric(n.params),children:tree(n.children)}));
 return {schemaVersion:2,notes:text(q.notes),customer:text(q.customer,500),project:text(q.project,1000),recipient:text(q.request?.recipient,200),location:text(q.request?.location,500),schedule:text(q.request?.schedule,2000),requirements:text(q.request?.notes),specification:text(q.requestSpecification),items:(q.request?.items||[]).map(x=>pick(x,['id','name','specification','qty','unit','notes','note'])),files:(q.request?.files||[]).filter(f=>/\.(pdf|png|jpe?g|webp|dwg|dxf|step|stp)$/i.test(f.name)).map(f=>pick(f,['id','name','size','storage','note','revision'])),links:(q.request?.links||[]).filter(x=>/^https?:\/\//i.test(x.url||'')).map(x=>pick(x,['id','name','url','title'])),tree:tree(q.products)};
}
function create({sql,fail,transaction,readBody,audit,canWork}){
 const one=(s,...a)=>sql.prepare(s).get(...a),get=(k,id)=>{const r=one('SELECT document FROM ops_records WHERE kind=? AND id=?',k,id);return r?JSON.parse(r.document):null;};
 const store=(k,id,d)=>sql.prepare('INSERT INTO ops_records VALUES(?,?,1,?) ON CONFLICT(kind,id) DO UPDATE SET version=version+1,document=excluded.document').run(k,id,JSON.stringify(d));
 function source(j){
  const packet=JSON.parse(j.packet),saved=packet.technicalInput;
  if(saved?.schemaVersion>=2)return saved;
  let d=get('production-source',j.id);
  if(!d){const o=one('SELECT * FROM orders WHERE id=?',j.order_id),r=o&&one('SELECT document FROM revisions WHERE id=? AND version=?',o.quote_id,o.quote_version);if(!r)return saved||{files:[],links:[],tree:[],items:[]};d=JSON.parse(r.document);d.quote.products=d.quote.products.filter(p=>p.id===j.product_id);if(d.quote.products[0])d.quote.products[0].qty=j.quantity;}
  const full=technicalInput(d.quote);if(!saved)return full;
  // Enrich legacy notes only; never replace frozen dimensions, quantities or approved changes.
  const nodes=new Map();const walk=xs=>{for(const n of xs||[]){nodes.set(n.id,n);walk(n.children);}};walk(full.tree);
  const merge=xs=>(xs||[]).map(n=>{const source=nodes.get(n.id)||{};return {...n,lineNote:n.lineNote??source.lineNote??'',notes:n.notes??source.notes??'',children:merge(n.children)};});
  return {...saved,notes:saved.notes??full.notes,tree:merge(saved.tree),schemaVersion:2};
 }
 function view(j){const d=get('production-dossier',j.id)||{files:[],requirements:'',equipment:[],history:[]};return {jobVersion:j.version,source:source(j),...d,machines:sql.prepare("SELECT id,document FROM ops_records WHERE kind='machine'").all().map(r=>({id:r.id,...pick(JSON.parse(r.document),['name','code','workshop','active'])})).filter(m=>m.active!==false)};}
 async function handle({req,route,user,send}){
  const m=route.match(/^\/api\/production\/([a-f0-9-]+)\/(dossier|files)(?:\/([a-zA-Z0-9_-]{1,100}))?$/);if(!m)return false;const j=one('SELECT * FROM production_jobs WHERE id=?',m[1]);if(!j)fail(404,'Không tìm thấy lệnh');
  if(req.method==='GET'){const d=view(j);if(m[2]==='dossier'){send(200,{...d,canEdit:AA.allows(user,'production','edit',canWork(user))&&j.state==='ready'});return true;}if(![...d.files,...d.source.files].some(f=>f.id===m[3]&&f.storage==='server'))fail(403,'Tệp không thuộc hồ sơ kỹ thuật của lệnh');const f=one('SELECT id,name,size,data FROM intake_files WHERE id=?',m[3]);if(!f)fail(404,'Không tìm thấy tệp');send(200,f);return true;}
  if(req.method!=='POST'||m[3])fail(405,'Thao tác không hợp lệ');if(!AA.allows(user,'production','edit',canWork(user)))fail(403,'Chưa có quyền chuẩn bị sản xuất');const b=await readBody(req,15000000);
  const out=transaction(()=>{const current=one('SELECT * FROM production_jobs WHERE id=?',j.id),p=JSON.parse(current.progress),packet=JSON.parse(current.packet);if(current.version!==b.expectedVersion)fail(409,'Lệnh đã thay đổi; tải lại hồ sơ');if(current.state!=='ready'||p.operations.some(o=>o.status!=='pending'))fail(409,'Hồ sơ lô đã bắt đầu được khóa; lập thay đổi kỹ thuật cho phần chưa thực hiện');
   const d=get('production-dossier',j.id)||{files:[],requirements:'',equipment:[],history:[]},at=new Date().toISOString();let detail;
   if(m[2]==='files'){
    if(typeof b.name!=='string'||b.name.length>250||!(/\.(pdf|png|jpe?g|webp|dwg|dxf|step|stp)$/i).test(b.name)||typeof b.data!=='string'||!b.data||!(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/).test(b.data))fail(400,'Chọn bản vẽ PDF, ảnh hoặc CAD hợp lệ');const size=Buffer.from(b.data,'base64').length;if(size>10*1024*1024||size!==b.size)fail(413,'Tệp tối đa 10 MB');if(d.files.length>=100)fail(400,'Hồ sơ tối đa 100 phiên bản bản vẽ');
    const id=randomUUID();sql.prepare('INSERT INTO intake_files VALUES(?,?,?,?,?)').run(id,b.name,size,b.data,user.id);const f={id,name:b.name,size,storage:'server',revision:text(b.revision,100),note:text(b.note,2000),at,actor:user.name,supersedes:b.supersedes||null};if(f.supersedes&&![...d.files,...source(current).files].some(x=>x.id===f.supersedes))fail(400,'Bản vẽ thay thế không thuộc lệnh');d.files.push(f);detail='Bổ sung bản vẽ sản xuất: '+f.name;
   }else{
    const keys=['input','structure','operations','quantities'];
    if(b.section!==undefined){
     if(![...keys,'technical'].includes(b.section)||typeof b.confirm!=='boolean')fail(400,'Chọn nội dung cần xác nhận');
     const sections=b.section==='technical'?['structure','operations']:[b.section];const checks={...d.reviewChecks,...Object.fromEntries(sections.map(k=>[k,b.confirm]))};
     if(b.section!=='input'){b.requirements=d.requirements||'';b.noDrawingReason=d.noDrawingReason||'';}
     if(!['operations','technical'].includes(b.section)||(!b.confirm&&b.equipment===undefined))b.equipment=packet.operations.map(o=>d.equipment.find(e=>e.operationId===o.id)||{operationId:o.id,machine:o.machine||'',method:o.instructions||''});
     if(b.section==='input'&&b.confirm&&!d.files.length&&!source(current).files.some(f=>f.storage==='server')&&!text(b.noDrawingReason).trim())fail(400,'Bổ sung bản vẽ hoặc ghi căn cứ sản xuất trước khi xác nhận');
     if(['operations','technical'].includes(b.section)&&b.confirm&&(!Array.isArray(b.equipment)||b.equipment.some(e=>!text(e.method).trim()||(!e.machineId&&!text(e.machine).trim()))))fail(400,'Chọn máy hoặc ghi Thủ công và phương pháp cho từng nguyên công');
     b.reviewChecks=checks;b.reviewed=keys.every(k=>checks[k]===true);
     d.confirmations={...d.confirmations,...Object.fromEntries(sections.map(k=>[k,b.confirm?{at,actor:user.name,id:user.id}:null]))};
    }
    if(typeof b.requirements!=='string'||b.requirements.length>20000||!Array.isArray(b.equipment)||b.equipment.length!==packet.operations.length)fail(400,'Khai đủ yêu cầu và chuẩn bị cho từng công đoạn');const ids=new Set();
    d.equipment=b.equipment.map(e=>{if(ids.has(e.operationId)||!packet.operations.some(o=>o.id===e.operationId))fail(400,'Công đoạn thiếu hoặc trùng');ids.add(e.operationId);const machine=e.machineId?get('machine',e.machineId):null;if(e.machineId&&(!machine||machine.active===false))fail(400,'Thiết bị không còn hoạt động');return {operationId:e.operationId,machineId:e.machineId||'',machine:machine?.name||text(e.machine,200),method:text(e.method,2000)};});d.reviewChecks=Object.fromEntries(['input','structure','operations','quantities'].map(k=>[k,b.reviewChecks?.[k]===true]));d.requirements=b.requirements;d.noDrawingReason=text(b.noDrawingReason,2000);if(b.reviewed===true){if(b.reviewChecks!==undefined&&['input','structure','operations','quantities'].some(k=>b.reviewChecks?.[k]!==true))fail(400,'Kiểm tra đủ đầu vào, cấu thành, công đoạn và khối lượng trước khi xác nhận hồ sơ');if(!d.files.length&&!source(current).files.some(f=>f.storage==='server')&&!d.noDrawingReason.trim())fail(400,'Bổ sung bản vẽ hoặc nêu căn cứ sản xuất khi không cần bản vẽ');if(d.equipment.some(e=>!e.machine.trim()||!e.method.trim()))fail(400,'Chọn thiết bị (hoặc Thủ công) và phương pháp cho các công đoạn');d.reviewChecks=b.reviewChecks||null;d.reviewed={at,actor:user.name,id:user.id};}else delete d.reviewed;
    for(const e of d.equipment){const op=p.operations.find(o=>o.id===e.operationId);if(op){op.machine=e.machine;op.machineId=e.machineId;op.preparationMethod=e.method;}}detail=b.section?((b.confirm?'Xác nhận: ':'Mở rà soát lại: ')+({technical:'Thông số, nguyên công và máy',input:'Bản vẽ và yêu cầu',structure:'Thông số sản phẩm',operations:'Nguyên công và máy',quantities:'Vật tư và số lượng'})[b.section]):b.reviewed?'Kỹ sư xác nhận hồ sơ và chuẩn bị sản xuất':'Cập nhật hồ sơ chuẩn bị sản xuất';
   }
   if(m[2]==='files'){delete d.reviewed;if(d.reviewChecks)d.reviewChecks.input=false;if(d.confirmations)delete d.confirmations.input;}p.drawingReady=!!d.reviewed;d.history.push({at,actor:user.name,detail});store('production-dossier',j.id,d);sql.prepare('UPDATE production_jobs SET progress=?,version=version+1,updated=?,actor=? WHERE id=?').run(JSON.stringify(p),at,user.id,j.id);sql.prepare('INSERT INTO production_events(job_id,at,actor,detail) VALUES(?,?,?,?)').run(j.id,at,user.name,detail);audit(user,'production-dossier',j.id,detail);return view(one('SELECT * FROM production_jobs WHERE id=?',j.id));
  });send(200,out);return true;
 }
 return {handle};
}
module.exports={technicalInput,create};
