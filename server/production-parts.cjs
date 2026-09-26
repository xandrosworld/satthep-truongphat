'use strict';
const {randomUUID}=require('node:crypto');
// A part is an independently reviewed production batch, with its own stock and progress.
function split({sql,fail,packet,captureBaseline,audit,user,id,body}){
 const row=sql.prepare('SELECT * FROM production_jobs WHERE id=?').get(id);
 if(!row)fail(404,'Không tìm thấy lệnh');
 if(row.version!==body.expectedVersion)fail(409,'Lệnh đã thay đổi; tải lại trước khi chia phần');
 const old=JSON.parse(row.packet),progress=JSON.parse(row.progress),qty=body.quantity;
 if(row.state!=='ready'||progress.operations.some(o=>o.status!=='pending'||o.output>0))fail(409,'Chỉ chia phần chưa bắt đầu sản xuất');
 if(typeof qty!=='number'||!Number.isFinite(qty)||qty<=0||qty>=row.quantity)fail(400,'Số lượng phần phải lớn hơn 0 và nhỏ hơn số lượng còn lại');
 if(['bộ','cái','chiếc','tấm','thanh'].includes(old.product.unit)&&!Number.isInteger(qty))fail(400,'Đơn vị đếm cần số lượng nguyên');
 const code=typeof body.code==='string'?body.code.trim():'';
 if(!code||code.length>100)fail(400,'Nhập mã phần/lô tối đa 100 ký tự');
 if(sql.prepare('SELECT id FROM production_jobs WHERE code=?').get(code))fail(409,'Mã phần/lô đã tồn tại');
 const records=sql.prepare('SELECT kind,id,document FROM ops_records').all();
 if(records.some(r=>{const d=JSON.parse(r.document);return (d.jobId===id||d.jobIds?.includes(id)||d.lines?.some(l=>l.allocations?.some(a=>a.jobId===id)))&&!['production-source','production-dossier','baseline'].includes(r.kind)&&!['cancelled','rejected','released'].includes(d.state);}))fail(409,'Phần này đã có giữ kho, mua hàng hoặc công việc. Xử lý các liên kết trước khi chia');
 if(records.some(r=>r.id===id&&['production-change','production-flow'].includes(r.kind))||old.flowApproved)fail(409,'Lệnh có thay đổi công nghệ; cần giữ nguyên phạm vi đã duyệt');
 const src=records.find(r=>r.kind==='production-source'&&r.id===id);
 if(!src)fail(409,'Thiếu hồ sơ nguồn để tính lại từng phần');
 const source=JSON.parse(src.document),at=new Date().toISOString(),partId=randomUUID();
 const family=old.partFamily||{id:row.id,code:row.code,quantity:row.quantity};
 const store=(kind,key,d)=>sql.prepare('INSERT INTO ops_records VALUES(?,?,1,?) ON CONFLICT(kind,id) DO UPDATE SET version=version+1,document=excluded.document').run(kind,key,JSON.stringify(d));
 for(const [key,n,partCode]of [[id,row.quantity-qty,row.code],[partId,qty,code]]){
  const doc=structuredClone(source);doc.quote.products=doc.quote.products.filter(p=>p.id===row.product_id);if(doc.quote.products.length!==1)fail(409,'Hồ sơ nguồn không khớp sản phẩm');doc.quote.products[0].qty=n;doc.quote.nestingPlans=[];doc.quote.remnantSelections={};
  const data=packet(doc);if(data.issues.length||data.cutting.some(g=>g.error))fail(409,'Cần kiểm tra phương án cắt của phần/lô');
  const snapshot={...old,...(key!==id?{issuedBy:{id:user.id,name:user.name,at}}:{}),technicalInput:data.technicalInput,product:data.products[0],materials:data.materials,operations:data.operations,cutting:data.cutting,finishing:data.finishing,layoutBasis:'batch-recalculated',partFamily:family};
  const p={deadline:progress.deadline,workshop:progress.workshop,materialsReady:false,drawingReady:false,preparationNote:'',operations:data.operations.map(o=>({id:o.id,assignee:progress.operations.find(x=>x.id===o.id)?.assignee||'',status:'pending',output:0,note:''})),qc:{passed:0,rejected:0,note:''}};
  if(key===id)sql.prepare('UPDATE production_jobs SET quantity=?,packet=?,progress=?,version=version+1,updated=?,actor=? WHERE id=?').run(n,JSON.stringify(snapshot),JSON.stringify(p),at,user.id,key);
  else sql.prepare('INSERT INTO production_jobs VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(key,partCode,row.order_id,row.product_id,n,1,'ready',JSON.stringify(snapshot),JSON.stringify(p),at,at,user.id);
  store('production-source',key,doc);captureBaseline(key,doc);
  const dossier=records.find(r=>r.kind==='production-dossier'&&r.id===id);if(dossier){const d=JSON.parse(dossier.document);delete d.reviewed;delete d.reviewChecks;delete d.confirmations;d.history.push({at,actor:user.name,detail:'Chia phần/lô: cần rà soát lại số lượng và phương án cắt'});store('production-dossier',key,d);}
  sql.prepare('INSERT INTO production_events(job_id,at,actor,detail) VALUES(?,?,?,?)').run(key,at,user.name,'Chia phần '+partCode+' · '+n+' '+old.product.unit+' từ '+family.code);audit(user,'production-part',key,partCode);
 }
 return {id:partId,parentId:id,family};
}
function summary(v,{dossier,actor,materialState}){
 const ops=v.progress.operations||[],norm=v.packet.operations||[],ratios=ops.map(o=>{const n=norm.find(n=>n.id===o.id)?.quantity||0;return n?Math.min(1,o.output/n):o.status==='done'?1:0;});
 const active=ops.find(o=>o.status==='running')||ops.find(o=>o.status!=='done')||ops.at(-1),activeNorm=norm.find(n=>n.id===active?.id);
 const percent=ratios.length?Math.round(ratios.reduce((a,b)=>a+b,0)/ratios.length*100):v.state==='completed'?100:0;
 return {...v,product:v.packet.product.name,unit:v.packet.product.unit,orderCode:v.packet.orderCode,customer:v.packet.technicalInput?.customer||'',project:v.packet.technicalInput?.project||'',family:v.packet.partFamily,deadline:v.progress.deadline,workshop:v.progress.workshop,percent,completedOperations:ops.filter(o=>o.status==='done').length,totalOperations:ops.length,work:activeNorm?{name:activeNorm.name,output:active.output,quantity:activeNorm.quantity,unit:activeNorm.outputUnit||v.packet.product.unit}:null,qc:v.progress.qc,actor,
 trackingState:v.state==='completed'?'done':v.state!=='ready'||dossier?.reviewed||dossier?.history?.length||v.progress.materialsReady?'running':'pending',
 stages:{technical:{state:dossier?.reviewed?'done':dossier?.history?.length?'running':'pending',person:dossier?.reviewed?.actor||dossier?.history?.at(-1)?.actor||''},materials:{state:v.progress.materialsReady?'done':materialState?'running':'pending',person:materialState||''},production:{state:v.state==='completed'?'done':ops.some(o=>o.status!=='pending')?'running':'pending',assignees:[...new Set(ops.map(o=>o.assignee).filter(Boolean))]}},packet:undefined,progress:undefined};
}
module.exports={split,summary};
