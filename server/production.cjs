'use strict';
const {randomUUID}=require('node:crypto');
const C=require('../core.js');require('../pricing-core.js');
// Production packets are built from an explicit allowlist, never a commercial document.
const pick=(x,keys)=>Object.fromEntries(keys.filter(k=>x?.[k]!==undefined).map(k=>[k,x[k]]));
function packet(document){
 const r=C.calculate(document),q=document.quote;
 const rows=r.rows.map(x=>({id:x.id,productId:x.productId,name:x.node.name,count:x.count,material:pick(x.spec,['id','name','shape','substance','grade','brand','unit','stockL','stockW']),dimensions:pick(x.geometry,['length','width','weight','area']),properties:pick(x.spec.props,['L','W','H','T','D','F','B']),params:pick(x.node.params,Object.keys(x.node.params||{}).filter(k=>/^(L|W|H|T|F|D|C[0-9]+|A[0-9]+)$/.test(k))),externallySupplied:!!x.externallySupplied}));
 const operations=Object.values(r.nodes).flatMap(x=>(x.node.ops||[]).map((o,i)=>{const rate=q.ratesSnapshot.find(v=>v.id===o.id)||{},computed=(x.ownOps||[]).find(v=>v.index===i)||{};return {id:x.node.id+':'+i,nodeId:x.node.id,productId:x.productId,object:x.node.name,name:rate.name||o.id,mode:o.mode,machine:rate.machine||'',instructions:rate.technicalNotes||'',quantity:x.count,norm:o.amount||1,workQuantity:computed.basis||0,unit:computed.unit||rate.unit||'',complexity:o.complexityChoice?.label||o.complexity?.label||''};}));
 const cutting=r.groups.map(g=>({materialId:g.spec.id,name:g.spec.name||g.spec.id,rowIds:g.rows.map(x=>x.id),error:g.error||'',stockL:g.layout?.stockL||g.spec.stockL,stockW:g.layout?.stockW||g.spec.stockW,stocks:(g.layout?.stocks||[]).map(s=>({placements:s.placements.map(p=>pick(p,['rowId','label','x','y','l','w','polygon','circle'])),free:(s.free||[]).map(f=>pick(f,['x','y','l','w']))}))}));
 const issues=Object.values(r.nodes).flatMap(x=>x.declarationErrors||[]);for(const n of C.flatten(q.products))if(n.kind==='material'&&!rows.some(x=>x.id===n.id))issues.push('Thiếu thông số chi tiết '+n.name);
 return {issues,quoteCode:q.id,kerf:q.kerf||0,products:q.products.map(n=>({id:n.id,name:n.name,quantity:n.qty,unit:n.unit||'bộ',specification:n.requestSpecification||C.quoteSpecification(n)})),materials:rows,operations,cutting,finishing:(r.generated||[]).map(x=>({name:x.spec?.name||x.name||'',materialId:x.materialId||x.spec?.id||'',quantity:x.quantity??0,unit:x.unit||x.spec?.unit||''}))};
}
function createProduction({sql,fail,readBody,transaction,audit}){
 sql.exec(`CREATE TABLE IF NOT EXISTS production_jobs(id TEXT PRIMARY KEY,code TEXT UNIQUE NOT NULL,order_id TEXT NOT NULL REFERENCES orders(id),product_id TEXT NOT NULL,quantity REAL NOT NULL,version INTEGER NOT NULL,state TEXT NOT NULL,packet TEXT NOT NULL,progress TEXT NOT NULL,created TEXT NOT NULL,updated TEXT NOT NULL,actor TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS production_events(seq INTEGER PRIMARY KEY AUTOINCREMENT,job_id TEXT NOT NULL REFERENCES production_jobs(id),at TEXT NOT NULL,actor TEXT NOT NULL,detail TEXT NOT NULL);`);
 const one=(s,...a)=>sql.prepare(s).get(...a),all=(s,...a)=>sql.prepare(s).all(...a);
 const canIssue=u=>u.role==='admin'||u.role==='estimator'&&require('./access.cjs').permissions(u).manage;
 const canWork=u=>canIssue(u)||u.role==='technical'&&require('./access.cjs').permissions(u).sections.includes('operations');
 const canRead=u=>u.role==='admin'||['technical','estimator','approver'].includes(u.role);
 const read=j=>({...pick(j,['id','code','order_id','product_id','quantity','version','state','created','updated']),packet:JSON.parse(j.packet),progress:JSON.parse(j.progress)});
 const str=(v,max=1000)=>{if(typeof v!=='string'||v.length>max)fail(400,'Nội dung không hợp lệ');return v.trim();};
 const num=(v,max)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)fail(400,'Số lượng không hợp lệ');return v;};
 async function handle({req,route,user,send}){
  if(!route.startsWith('/api/production'))return false;
  if(!canRead(user))fail(403,'Chưa có quyền xem sản xuất');
  if(req.method==='GET'&&route==='/api/production'){
   send(200,{canIssue:canIssue(user),canWork:canWork(user),orders:all('SELECT id,code,quote_version,package FROM orders ORDER BY at DESC').filter(o=>JSON.parse(o.package).status==='awaiting-production').map(({package:raw,...o})=>o),jobs:all('SELECT * FROM production_jobs ORDER BY created DESC').map(j=>{const v=read(j);return {...pick(v,['id','code','order_id','quantity','version','state','updated']),product:v.packet.product.name,deadline:v.progress.deadline,workshop:v.progress.workshop};})});return true;
  }
  if(req.method==='GET'&&route==='/api/production/people'){send(200,all("SELECT id,name FROM users WHERE active=1 AND role IN ('admin','technical','estimator')"));return true;}
  const source=route.match(/^\/api\/production\/orders\/([a-f0-9-]+)$/);
  if(source&&req.method==='GET'){const o=one('SELECT * FROM orders WHERE id=?',source[1]);if(!o)fail(404,'Không tìm thấy đơn hàng');if(JSON.parse(o.package).status!=='awaiting-production')fail(409,'Chốt đơn hàng trước khi phát hành lệnh sản xuất');const d=one('SELECT document FROM revisions WHERE id=? AND version=?',o.quote_id,o.quote_version);if(!d)fail(409,'Thiếu phiên bản nguồn');send(200,{id:o.id,code:o.code,quoteVersion:o.quote_version,...packet(JSON.parse(d.document)),allocated:all('SELECT product_id,SUM(quantity) AS quantity FROM production_jobs WHERE order_id=? GROUP BY product_id',o.id)});return true;}
  if(route==='/api/production'&&req.method==='POST'){
   if(!canIssue(user))fail(403,'Chỉ người quản lý được phát hành lệnh');const b=await readBody(req);
   const job=transaction(()=>{const o=one('SELECT * FROM orders WHERE id=?',b.orderId);if(!o)fail(404,'Không tìm thấy đơn hàng');if(JSON.parse(o.package).status!=='awaiting-production')fail(409,'Chốt đơn hàng trước khi phát hành lệnh sản xuất');const revision=one('SELECT * FROM revisions WHERE id=? AND version=?',o.quote_id,o.quote_version);if(!revision||revision.status!=='approved')fail(409,'Đơn hàng thiếu phiên bản đã duyệt');const d=JSON.parse(revision.document),p=d.quote.products.find(x=>x.id===b.productId);if(!p)fail(400,'Chọn sản phẩm trong đơn hàng');
    const code=str(b.code,100);if(!code)fail(400,'Nhập mã lệnh');const existing=one('SELECT * FROM production_jobs WHERE code=?',code);if(existing){if(existing.order_id===o.id&&existing.product_id===p.id&&existing.quantity===b.quantity)return read(existing);fail(409,'Mã lệnh đã tồn tại');}
    const qty=num(b.quantity,p.qty);if(!qty)fail(400,'Số lượng phải lớn hơn 0');const used=one('SELECT COALESCE(SUM(quantity),0) AS n FROM production_jobs WHERE order_id=? AND product_id=?',o.id,p.id).n;if(used+qty>p.qty+1e-9)fail(409,'Tổng số lượng lệnh vượt đơn hàng');
    // Recompute each batch; do not reuse a whole-order layout for a partial batch.
    d.quote.products=[C.copy(p)];d.quote.products[0].qty=qty;if(qty!==p.qty||d.quote.products.length!==JSON.parse(revision.document).quote.products.length){d.quote.nestingPlans=[];d.quote.remnantSelections={};}
    const data=packet(d);if(data.issues.length||data.cutting.some(g=>g.error))fail(409,'Phương án cắt cần kiểm tra trước khi phát hành');
    const at=new Date().toISOString(),id=randomUUID(),progress={deadline:'',workshop:'',materialsReady:false,drawingReady:false,preparationNote:'',operations:data.operations.map(x=>({id:x.id,assignee:'',status:'pending',output:0,note:''})),qc:{passed:0,rejected:0,note:''}};
    const snapshot={orderCode:o.code,quoteVersion:o.quote_version,quoteCode:data.quoteCode,product:data.products[0],materials:data.materials,operations:data.operations,cutting:data.cutting,finishing:data.finishing,kerf:data.kerf,layoutBasis:qty===p.qty&&JSON.parse(revision.document).quote.products.length===1?'approved':'batch-recalculated'};
    sql.prepare('INSERT INTO production_jobs VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id,code,o.id,p.id,qty,1,'ready',JSON.stringify(snapshot),JSON.stringify(progress),at,at,user.id);
    audit(user,'production-issued',id,code);sql.prepare('INSERT INTO production_events(job_id,at,actor,detail) VALUES(?,?,?,?)').run(id,at,user.name,'Phát hành lệnh '+code);return read(one('SELECT * FROM production_jobs WHERE id=?',id));
   });send(201,job);return true;
  }
  const m=route.match(/^\/api\/production\/([a-f0-9-]+)$/);
  if(m&&req.method==='GET'){const j=one('SELECT * FROM production_jobs WHERE id=?',m[1]);if(!j)fail(404,'Không tìm thấy lệnh');send(200,{...read(j),events:all('SELECT at,actor,detail FROM production_events WHERE job_id=? ORDER BY seq DESC',j.id)});return true;}
  if(m&&req.method==='PUT'){
   if(!canWork(user))fail(403,'Chưa được cấp quyền cập nhật công đoạn');const b=await readBody(req);
   const saved=transaction(()=>{const j=one('SELECT * FROM production_jobs WHERE id=?',m[1]);if(!j)fail(404,'Không tìm thấy lệnh');if(j.version!==b.expectedVersion)fail(409,'Lệnh đã được người khác cập nhật. Tải lại trước khi sửa.');if(j.state==='completed')fail(409,'Lệnh đã hoàn thành và được khóa');const v=read(j),p=v.progress;let detail='';const at=new Date().toISOString();
    if(b.action==='prepare'){if(p.operations.some(o=>o.status!=='pending'))fail(409,'Đã bắt đầu sản xuất, không thay đổi chuẩn bị');p.deadline=str(b.deadline,10);if(p.deadline&&!/^\d{4}-\d{2}-\d{2}$/.test(p.deadline))fail(400,'Ngày không hợp lệ');p.workshop=str(b.workshop,120);if(typeof b.materialsReady!=='boolean'||typeof b.drawingReady!=='boolean')fail(400,'Xác nhận chuẩn bị không hợp lệ');p.materialsReady=b.materialsReady;p.drawingReady=b.drawingReady;p.preparationNote=str(b.note);detail='Cập nhật chuẩn bị sản xuất';}
    else if(b.action==='operation'){const op=p.operations.find(x=>x.id===b.operationId),norm=v.packet.operations.find(x=>x.id===b.operationId);if(!op)fail(400,'Không có công đoạn');if(!['pending','running','done'].includes(b.status))fail(400,'Trạng thái không hợp lệ');if(op.status==='done')fail(409,'Công đoạn đã hoàn thành');if(b.status!=='pending'&&(!p.materialsReady||!p.drawingReady))fail(409,'Cần xác nhận bản vẽ và vật tư sẵn sàng');if(op.status==='running'&&b.status==='pending')fail(409,'Không đưa công đoạn đang làm về chưa bắt đầu');const assignee=str(b.assignee,100);if(assignee&&!one("SELECT id FROM users WHERE id=? AND active=1 AND role IN ('admin','technical','estimator')",assignee))fail(400,'Người phụ trách không còn hoạt động');op.assignee=assignee;op.status=b.status;const output=num(b.output,norm.quantity);if(output<op.output)fail(400,'Sản lượng không được giảm');if(b.status==='done'&&output!==norm.quantity)fail(400,'Sản lượng phải đủ trước khi hoàn thành công đoạn');op.output=output;op.note=str(b.note);if(b.status!=='pending')op.startedAt??=at;if(b.status==='done')op.finishedAt=at;detail=norm.name+': '+b.status+' · '+output;}
    else if(b.action==='qc'){if(!p.materialsReady||!p.drawingReady||p.operations.some(o=>o.status!=='done'))fail(409,'Hoàn tất chuẩn bị và công đoạn trước khi QC');const passed=num(b.passed,j.quantity),rejected=num(b.rejected,j.quantity);if(passed+rejected>j.quantity)fail(400,'Số lượng QC vượt lệnh');p.qc={passed,rejected,note:str(b.note),at,actor:user.name};detail='QC: đạt '+passed+', không đạt '+rejected;}
    else if(b.action==='complete'){if(!p.materialsReady||!p.drawingReady||p.operations.some(o=>o.status!=='done')||p.qc.passed!==j.quantity||p.qc.rejected!==0)fail(409,'Chỉ hoàn thành khi công đoạn và QC đạt đủ số lượng');detail='Hoàn thành lệnh';}
    else fail(400,'Thao tác không hợp lệ');
    const state=b.action==='complete'?'completed':p.operations.length&&p.operations.every(o=>o.status==='done')?'qc':p.operations.some(o=>o.status==='running'||o.status==='done')?'running':'ready';
    sql.prepare('UPDATE production_jobs SET version=version+1,state=?,progress=?,updated=?,actor=? WHERE id=?').run(state,JSON.stringify(p),at,user.id,j.id);sql.prepare('INSERT INTO production_events(job_id,at,actor,detail) VALUES(?,?,?,?)').run(j.id,at,user.name,detail);audit(user,'production-'+b.action,j.id,detail);return read(one('SELECT * FROM production_jobs WHERE id=?',j.id));
   });send(200,saved);return true;
  }
  fail(404,'Không tìm thấy chức năng sản xuất');
 }
 return {handle};
}
module.exports={createProduction,packet};
