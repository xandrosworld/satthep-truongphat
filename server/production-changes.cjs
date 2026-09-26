'use strict';
const {randomUUID}=require('node:crypto'),C=require('../core.js'),AA=require('../action-access.js');
// Full calculation documents stay server-side. Only technical packets are returned.
function createProductionChanges({sql,fail,readBody,transaction,audit,packet,canWork}){
 const one=(s,...a)=>sql.prepare(s).get(...a),all=(s,...a)=>sql.prepare(s).all(...a);
 const get=(kind,id)=>{const r=one('SELECT document FROM ops_records WHERE kind=? AND id=?',kind,id);return r?JSON.parse(r.document):null;};
 const put=(kind,id,d)=>sql.prepare('INSERT INTO ops_records VALUES(?,?,1,?) ON CONFLICT(kind,id) DO UPDATE SET version=version+1,document=excluded.document').run(kind,id,JSON.stringify(d));
 const clean=c=>{const {document,...v}=c;return v;};
 const confirmable=u=>u.role==='admin'||AA.allows(u,'production','confirm',u.role==='technical'&&require('./access.cjs').permissions(u).sections.includes('operations'));
 const proposeable=u=>AA.allows(u,'production','edit',canWork(u));
 function source(j){let d=get('production-source',j.id);if(d)return d;const o=one('SELECT * FROM orders WHERE id=?',j.order_id),r=one('SELECT document FROM revisions WHERE id=? AND version=?',o.quote_id,o.quote_version);d=JSON.parse(r.document);const p=d.quote.products.find(p=>p.id===j.product_id);d.quote.products=[C.copy(p)];d.quote.products[0].qty=j.quantity;d.quote.nestingPlans=[];d.quote.remnantSelections={};return d;}
 function editable(j){const p=JSON.parse(j.progress);if(j.state!=='ready'||p.operations.some(o=>o.status!=='pending')||p.qc?.passed||p.qc?.rejected)fail(409,'Lệnh đã bắt đầu sản xuất hoặc QC; không thay đổi thông số của lô đang thực hiện');if(all("SELECT document FROM ops_records WHERE kind='hold'").some(r=>{const h=JSON.parse(r.document);return h.jobId===j.id&&['issued','settled'].includes(h.state);}))fail(409,'Lệnh đã cấp vật tư; cần xử lý lô đang thực hiện trước');}
 function materials(d){const catalog=one('SELECT document FROM catalog ORDER BY version DESC LIMIT 1');const rows=[...(d.materials||[]),...C.flatten(d.quote.products).filter(n=>n.spec).map(n=>n.spec),...(catalog?JSON.parse(catalog.document).materials||[]:[])];return [...new Map(rows.map(m=>[m.id,m])).values()];}
 const safeMaterial=m=>Object.fromEntries(['id','name','shape','props','stockL','stockW','substance','grade'].filter(k=>m[k]!==undefined).map(k=>[k,m[k]]));
 async function handle({req,route,user,send}){
  const m=route.match(/^\/api\/production\/([a-f0-9-]+)\/changes(?:\/([a-f0-9-]+)\/(confirm|approve|reject))?$/);if(!m)return false;
  const j=one('SELECT * FROM production_jobs WHERE id=?',m[1]);if(!j)fail(404,'Không tìm thấy lệnh');
  if(req.method==='GET'&&!m[2]){const d=source(j),nodes=C.flatten(d.quote.products);send(200,{canPropose:proposeable(user),canConfirm:confirmable(user),canApprove:user.role==='admin',jobVersion:j.version,materials:materials(d).map(safeMaterial),rows:packet(d).materials.map(r=>{const n=nodes.find(n=>n.id===r.id),numeric=v=>Object.fromEntries(Object.entries(v||{}).filter(([,x])=>typeof x==='number'));return {...r,dims:numeric(n.dims),params:numeric(n.params)};}),changes:all("SELECT document FROM ops_records WHERE kind='production-change'").map(r=>JSON.parse(r.document)).filter(c=>c.jobId===j.id).map(clean)});return true;}
  if(req.method!=='POST')fail(405,'Thao tác không hợp lệ');const b=await readBody(req);
  const out=transaction(()=>{const current=one('SELECT * FROM production_jobs WHERE id=?',j.id);if(current.version!==b.expectedVersion)fail(409,'Lệnh đã thay đổi; tải lại trước khi xử lý');
   if(!m[2]){
    if(!proposeable(user))fail(403,'Chưa có quyền đề nghị thay đổi kỹ thuật');editable(current);
    const reason=typeof b.reason==='string'?b.reason.trim():'';if(!reason||reason.length>2000)fail(400,'Nhập lý do thay đổi (tối đa 2000 ký tự)');
    const d=source(current),before=packet(d),rows=b.rowIds===undefined?[b.rowId]:b.rowIds;
    if(!Array.isArray(rows)||!rows.length||rows.length>500||new Set(rows).size!==rows.length)fail(400,'Chọn từ 1 đến 500 dòng khác nhau');
    let changed=false;
    for(const rowId of rows){const n=C.flatten(d.quote.products).find(n=>n.id===rowId&&n.kind==='material');if(!n)fail(400,'Dòng vật tư không thuộc lệnh');const original=JSON.stringify(n);
    if(b.materialId!==undefined&&b.materialId!==n.materialId){const s=materials(d).find(x=>x.id===b.materialId);if(!s||s.shape!==n.spec.shape)fail(400,'Chọn vật tư cùng hình dạng để giữ đúng quy tắc khai triển');n.materialId=s.id;n.spec=C.copy(s);n.name=s.name;}
    const numeric=(v)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1e7)fail(400,'Thông số kích thước không hợp lệ');return v;};
    for(const [field,allowed]of [['dims',Object.keys(n.dims||{})],['params',Object.keys(n.params||{})],['props',Object.keys(n.spec.props||{})]]){const values=b[field]||{};if(typeof values!=='object'||Array.isArray(values))fail(400,'Thông số không hợp lệ');for(const [k,v]of Object.entries(values)){if(!allowed.includes(k))fail(400,'Thông số không được hỗ trợ: '+k);(field==='props'?n.spec.props:n[field])[k]=numeric(v);}}
    for(const k of ['stockL','stockW'])if(b[k]!==undefined)n.spec[k]=numeric(b[k]);
    if(JSON.stringify(n)!==original)changed=true;
    }
    if(!changed)fail(400,'Chưa có thông số thay đổi');d.quote.nestingPlans=[];d.quote.remnantSelections={};const after=packet(d);if(after.issues.length||after.cutting.some(g=>g.error))fail(400,'Thông số đề nghị không tạo được phương án sản xuất hợp lệ');
    const c={id:randomUUID(),jobId:j.id,baseVersion:j.version,rowId:rows[0],rowIds:rows,reason,state:'pending',at:new Date().toISOString(),actor:user.name,before,after,document:d};put('production-change',c.id,c);audit(user,'production-change-proposed',j.id,reason);return clean(c);
   }
   const c=get('production-change',m[2]);if(!c||c.jobId!==j.id)fail(404,'Không tìm thấy đề nghị');
   if(!['pending','confirmed'].includes(c.state))fail(409,'Đề nghị đã được xử lý');
   const action=m[3];if(action==='reject'){if(!confirmable(user)&&user.role!=='admin')fail(403,'Chưa có quyền trả lại');if(typeof b.reason!=='string'||!b.reason.trim()||b.reason.length>2000)fail(400,'Nhập lý do trả lại');c.state='rejected';c.rejection=b.reason.trim();}
   else {editable(current);if(c.baseVersion!==current.version)fail(409,'Thông số lệnh đã đổi; lập đề nghị mới để xác nhận lại');
    if(action==='confirm'){if(!confirmable(user))fail(403,'Cần người có quyền xác nhận kỹ thuật');if(c.state!=='pending')fail(409,'Đã xác nhận kỹ thuật');c.state='confirmed';c.technical={id:user.id,name:user.name,at:new Date().toISOString()};}
    if(action==='approve'){if(user.role!=='admin')fail(403,'Chỉ Admin được duyệt áp dụng');if(c.state!=='confirmed'||!c.technical)fail(409,'Cần xác nhận kỹ thuật trước khi Admin duyệt');
     const data=packet(c.document),old=JSON.parse(current.packet),progress=JSON.parse(current.progress);if(data.issues.length||data.cutting.some(g=>g.error))fail(409,'Phương án cần kiểm tra lại');
     const next={...old,technicalInput:data.technicalInput,product:data.products[0],materials:data.materials,operations:old.flowApproved?old.operations:[...data.operations,...old.operations.filter(o=>o.catalogId&&!o.nodeId)],cutting:data.cutting,finishing:data.finishing,kerf:data.kerf,layoutBasis:'engineering-change'};
     const dossier=get('production-dossier',j.id);if(dossier){delete dossier.reviewed;dossier.reviewChecks={};dossier.confirmations={};put('production-dossier',j.id,dossier);}delete next.flowApproved;progress.materialsReady=false;progress.drawingReady=false;progress.operations=next.operations.map(o=>({...progress.operations.find(p=>p.id===o.id),id:o.id,status:'pending',output:0}));
     // Reservations must be rechecked against the new geometry. No stock has been issued.
     for(const r of all("SELECT id,document FROM ops_records WHERE kind='hold'")){const h=JSON.parse(r.document);if(h.jobId===j.id&&h.state==='reserved')put('hold',r.id,{...h,state:'released',reason:'Thay đổi kỹ thuật '+c.id});}
     const at=new Date().toISOString();sql.prepare('UPDATE production_jobs SET packet=?,progress=?,version=version+1,updated=?,actor=? WHERE id=?').run(JSON.stringify(next),JSON.stringify(progress),at,user.id,j.id);put('production-source',j.id,c.document);c.state='approved';c.appliedVersion=current.version+1;
     sql.prepare('INSERT INTO production_events(job_id,at,actor,detail) VALUES(?,?,?,?)').run(j.id,at,user.name,'Duyệt thay đổi kỹ thuật: '+c.reason+' · xác nhận bởi '+c.technical.name);
    }
   }
   c.reviewedBy=user.name;c.reviewedAt=new Date().toISOString();put('production-change',c.id,c);audit(user,'production-change-'+action,j.id,c.reason);return clean(c);
  });send(200,out);return true;
 }
 return {handle};
}
module.exports={createProductionChanges};
