'use strict';
const {randomUUID}=require('node:crypto'),AA=require('../action-access.js');
// Stage quantities and weights are physical records; commercial snapshots are never returned.
function createProductionFlow({sql,fail,readBody,transaction,audit,operationsERP}){
 const one=(s,...a)=>sql.prepare(s).get(...a),all=(s,...a)=>sql.prepare(s).all(...a),now=()=>new Date().toISOString();
 const get=(k,id)=>{const r=one('SELECT document FROM ops_records WHERE kind=? AND id=?',k,id);return r?JSON.parse(r.document):null;};
 const list=k=>all('SELECT document FROM ops_records WHERE kind=?',k).map(r=>JSON.parse(r.document));
 const put=(k,id,d)=>{sql.prepare('INSERT INTO ops_records VALUES(?,?,1,?) ON CONFLICT(kind,id) DO UPDATE SET version=version+1,document=excluded.document').run(k,id,JSON.stringify(d));return d;};
 const text=(v,max=2000,required=false)=>{if(typeof v!=='string'||v.length>max||required&&!v.trim())fail(400,'Nhập đủ nội dung, lý do và nơi lưu kho');return v.trim();};
 const num=(v,positive=false)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>1e12||positive&&!v)fail(400,'Khối lượng / định mức không hợp lệ');return v;};
 const technical=u=>u.role==='technical'&&require('./access.cjs').permissions(u).sections.includes('operations');
 const need=(u,a)=>{if(!AA.allows(u,'production',a,u.role==='admin'||technical(u)&&['view','edit','confirm'].includes(a)))fail(403,'Chưa có quyền '+a+' sản xuất');};
 const job=id=>{const j=one('SELECT * FROM production_jobs WHERE id=?',id);if(!j)fail(404,'Không tìm thấy lệnh');return {...j,packet:JSON.parse(j.packet),progress:JSON.parse(j.progress)};};
 const save=(j,u,detail)=>{const at=now();sql.prepare('UPDATE production_jobs SET packet=?,progress=?,state=?,version=version+1,updated=?,actor=? WHERE id=?').run(JSON.stringify(j.packet),JSON.stringify(j.progress),j.state,at,u.id,j.id);sql.prepare('INSERT INTO production_events(job_id,at,actor,detail) VALUES(?,?,?,?)').run(j.id,at,u.name,detail);audit(u,'production-flow',j.id,detail);return job(j.id);};
 const stageId=(j,op)=>j.id+':'+op,stage=(j,op)=>get('stage-stock',stageId(j,op));
 const frozen=j=>j.progress.operations.filter(o=>o.status!=='pending').map(o=>o.id);
 function proposals(j){return list('route-proposal').filter(p=>p.jobId===j.id);}
 function inputRows(j,index){
  if(index>0){const prev=stage(j,j.packet.operations[index-1].id);if(!prev)fail(409,'Nhập kho phôi / bán thành phẩm công đoạn trước trước khi chuyển bước');return prev.materials.map(m=>({holdId:m.holdId,materialId:m.materialId,name:m.name,inputWeight:m.productWeight,external:m.external}));}
  const holds=list('hold').filter(h=>h.jobId===j.id&&['issued','settled'].includes(h.state));
  const rows=holds.map(h=>{const l=get('lot',h.lotId);return {holdId:h.id,materialId:l.materialId,name:l.materialName||l.materialId,inputWeight:h.quantity*l.unitWeight,settled:h.state==='settled',productWeight:h.productWeight,scrapWeight:h.scrapWeight,remnantWeight:h.remnantWeight,remnants:list('lot').filter(l=>l.jobId===j.id&&l.sourceLotId===h.lotId).map(l=>({quantity:l.initialQuantity,unitWeight:l.unitWeight,length:l.length,width:l.width,thickness:l.thickness}))};});
  const ext=new Map();for(const m of j.packet.materials||[])if(m.externallySupplied){const key=m.material.id;if(!ext.has(key))ext.set(key,{holdId:'external:'+key,materialId:key,name:m.material.name||m.name,external:true,inputWeight:0});ext.get(key).inputWeight+=m.dimensions.weight||0;}return rows.concat([...ext.values()]);
 }
 function move(j,stock,kind,u){const id=randomUUID();put('stage-movement',id,{id,jobId:j.id,orderId:j.order_id,stockId:stock.id,code:j.code,operationId:stock.operationId,kind,quantity:kind==='issue'?-stock.quantity:stock.quantity,weight:kind==='issue'?-stock.weight:stock.weight,unit:stock.unit,warehouse:stock.warehouse,product:stock.name,at:now(),actor:u.name});}
 function consumePrevious(j,index,u){if(index<=0)return;const prev=stage(j,j.packet.operations[index-1].id);if(!prev)fail(409,'Chưa nhập kho công đoạn trước');if(prev.consumedBy&&prev.consumedBy!==j.packet.operations[index].id)fail(409,'Bán thành phẩm đã xuất cho bước khác');if(!prev.consumedBy){prev.consumedBy=j.packet.operations[index].id;prev.consumedAt=now();put('stage-stock',prev.id,prev);move(j,prev,'issue',u);}}
 function guard(j,b,u){
  if(!['operation','qc','complete'].includes(b.action))return;
  if(!j.packet.flowApproved)fail(409,'Cần xác nhận kỹ thuật và Admin duyệt tiến trình công nghệ trước khi sản xuất');
  if(b.action==='operation'){
   if(b.status==='pending')return;
   const index=j.packet.operations.findIndex(o=>o.id===b.operationId);if(index<0)fail(400,'Công đoạn không tồn tại');
   if(j.progress.operations.slice(0,index).some(o=>o.status!=='done')||index>0&&!stage(j,j.packet.operations[index-1].id))fail(409,'Hoàn thành, đối soát và nhập kho công đoạn trước khi chuyển bước');
   if(!b.assignee||!one('SELECT id FROM users WHERE id=? AND active=1 AND deleted_at IS NULL',b.assignee))fail(400,'Phân công người thực hiện còn hoạt động');
   if(!String(b.machine||j.packet.operations[index].machine||'').trim())fail(400,'Khai thiết bị thực hiện; ghi Thủ công nếu không dùng máy');
   if(b.status==='done'&&!stage(j,b.operationId))fail(409,'Dùng Đối soát & nhập kho để khai sản phẩm, tấm tận dụng và phế trước khi kết thúc công đoạn');
   if(!j.packet.stockManaged&&(j.packet.materials||[]).some(m=>!m.externallySupplied))fail(409,'Lệnh cũ chưa đối chiếu kho; giữ đủ vật tư cho lệnh trước khi bắt đầu');
   consumePrevious(j,index,u);
  }else if(j.packet.operations.some(o=>!stage(j,o.id)))fail(409,'Đối soát và nhập kho đầy đủ các công đoạn trước QC / hoàn thành');
 }
 function finish(j,u){
  const last=j.packet.operations.at(-1),s=last&&stage(j,last.id);if(!s)fail(409,'Thiếu nhập kho công đoạn cuối');const id=j.id+':finished';if(get('stage-stock',id))return;
  if(!s.consumedBy){s.consumedBy='finished';s.consumedAt=now();put('stage-stock',s.id,s);move(j,s,'issue',u);}
  const d={id,jobId:j.id,operationId:'finished',name:j.packet.product.name,kind:'finished',quantity:j.quantity,unit:j.packet.product.unit||'bộ',weight:s.weight,warehouse:s.warehouse,materials:s.materials,at:now(),actor:u.name};put('stage-stock',id,d);move(j,d,'receipt',u);
 }
 function shipOrder(orderId,u){for(const r of all('SELECT id FROM production_jobs WHERE order_id=?',orderId)){const j=job(r.id);if(!j.packet.flowApproved)continue;const s=get('stage-stock',j.id+':finished');if(!s)fail(409,'Lệnh chưa nhập kho thành phẩm');if(!s.consumedBy){s.consumedBy='delivery';s.consumedAt=now();put('stage-stock',s.id,s);move(j,s,'issue',u);}}}
 function settle(j,b,u){
  const index=j.packet.operations.findIndex(o=>o.id===b.operationId),op=j.packet.operations[index],progress=j.progress.operations.find(o=>o.id===b.operationId);if(!op||!progress)fail(400,'Chọn công đoạn');if(stage(j,op.id))fail(409,'Công đoạn đã nhập kho; không ghi trùng');
  if(!j.packet.flowApproved||progress.status==='pending')fail(409,'Bắt đầu công đoạn trước khi đối soát');if(j.progress.operations.slice(0,index).some(o=>o.status!=='done'))fail(409,'Chưa hoàn tất công đoạn trước');
  const output=num(b.output,true);if(output!==op.quantity||output<(progress.output||0))fail(400,'Xác nhận đủ số lượng công đoạn trước khi nhập kho; phần chưa xong tiếp tục cập nhật tiến độ');
  const expected=inputRows(j,index);if(!Array.isArray(b.materials)||b.materials.length!==expected.length||new Set(b.materials.map(m=>m.holdId)).size!==expected.length)fail(400,'Khai đủ và không lặp từng lô vật tư đã cấp');
  const reason=text(b.reason,2000,true),warehouse=text(b.warehouse,100,true),materials=[];
  for(const e of expected){const m=b.materials.find(m=>m.holdId===e.holdId);if(!m)fail(400,'Thiếu lô vật tư');const input=e.external&&index===0?num(m.inputWeight):e.inputWeight,productWeight=num(m.productWeight),scrapWeight=num(m.scrapWeight),remnants=m.remnants||[];if(!Array.isArray(remnants)||remnants.length>100)fail(400,'Danh sách tấm tận dụng không hợp lệ');const remnantWeight=remnants.reduce((s,r)=>s+num(r.quantity,true)*num(r.unitWeight,true),0);
   if(Math.abs(input-productWeight-scrapWeight-remnantWeight)>Math.max(.001,input*1e-6))fail(400,'Vật tư cấp ra phải bằng phôi sản phẩm + tấm tận dụng + phế: '+e.name);
   if(e.external&&remnants.length)fail(400,'Vật tư nhà gia công cấp: ghi phần hoàn trả trong ghi chú, không nhập vào kho sở hữu');
   if(!e.external){if(index===0&&e.settled){if(Math.abs(e.productWeight-productWeight)>.001||Math.abs(e.scrapWeight-scrapWeight)>.001||Math.abs(e.remnantWeight-remnantWeight)>.001)fail(409,'Lô đã đối soát tại Kho; số liệu phải khớp phiếu đã ghi');}else operationsERP.settleStage({holdId:e.holdId,productWeight,scrapWeight,remnants,inputWeight:input,operationId:op.id,first:index===0},u);}
   materials.push({...e,inputWeight:input,productWeight,scrapWeight,remnantWeight,external:!!e.external});
  }
  consumePrevious(j,index,u);const weight=materials.reduce((s,m)=>s+m.productWeight,0),inputWeight=materials.reduce((s,m)=>s+m.inputWeight,0),scrapWeight=materials.reduce((s,m)=>s+m.scrapWeight,0),planned=index===0?(j.packet.materials||[]).reduce((s,m)=>s+(m.dimensions.weight||0),0):inputWeight;
  const d={id:stageId(j,op.id),jobId:j.id,operationId:op.id,name:op.object||j.packet.product.name,kind:index===0?'blank':'semi',quantity:op.quantity,unit:op.outputUnit||'chi tiết',weight,warehouse,materials,reason,plannedProductWeight:planned,variance:weight-planned,inputWeight,scrapWeight,lossPercent:(weight+scrapWeight)?scrapWeight/(weight+scrapWeight)*100:0,plannedLossPercent:op.lossPercent,at:now(),actor:u.name};put('stage-stock',d.id,d);move(j,d,'receipt',u);
  progress.status='done';progress.output=op.quantity;progress.finishedAt=now();progress.note=(progress.note||'')+'\nĐối soát: '+reason;j.state=j.progress.operations.every(o=>o.status==='done')?'qc':'running';return save(j,u,'Đối soát và nhập kho '+op.name+' · '+reason);
 }
 async function handle({req,route,user,send}){
  const m=route.match(/^\/api\/production\/([a-f0-9-]+)\/flow(?:\/(plan|confirm|approve|reject|settle))?$/);if(!m)return false;need(user,'view');const j=job(m[1]);
  if(req.method==='GET'&&!m[2]){const active=j.packet.operations.find(o=>j.progress.operations.find(p=>p.id===o.id)?.status!=='pending'&&!stage(j,o.id));send(200,{jobVersion:j.version,approved:!!j.packet.flowApproved,operations:j.packet.operations,proposals:proposals(j),stocks:list('stage-stock').filter(s=>s.jobId===j.id),movements:list('stage-movement').filter(s=>s.jobId===j.id),active:active?.id,inputs:active?inputRows(j,j.packet.operations.findIndex(o=>o.id===active.id)):[],canEdit:AA.allows(user,'production','edit',technical(user)),canConfirm:AA.allows(user,'production','confirm',technical(user)),canApprove:user.role==='admin',canSettle:AA.allows(user,'production','edit',technical(user))&&AA.allows(user,'production','confirm',technical(user))&&AA.allows(user,'inventory','edit',false)});return true;}
  if(req.method!=='POST'||!m[2])fail(405,'Thao tác không hợp lệ');const b=await readBody(req,400000),action=m[2];
  const result=transaction(()=>{const j=job(m[1]);if(j.state==='completed')fail(409,'Lệnh đã hoàn thành');if(b.expectedVersion!==j.version)fail(409,'Lệnh đã đổi; tải lại trước khi lưu');
   if(action==='settle'){need(user,'edit');need(user,'confirm');if(!AA.allows(user,'inventory','edit',user.role==='admin'))fail(403,'Cần quyền cập nhật kho để xác nhận nhập phôi / hoàn dư');return settle(j,b,user);}
   if(action==='plan'){
    need(user,'edit');const reason=text(b.reason,2000,true);if(!Array.isArray(b.operations)||!b.operations.length||b.operations.length>300)fail(400,'Khai từ 1 đến 300 công đoạn');const ids=new Set();
    const operations=b.operations.map(o=>{const old=j.packet.operations.find(x=>x.id===o.id);const id=old?.id||randomUUID();if(ids.has(id))fail(400,'Công đoạn trùng');ids.add(id);return {...old,id,name:text(o.name,200,true),object:old?.object||j.packet.product.name,quantity:old?.quantity||j.quantity,mode:o.mode==='outside'?'outside':'inside',machine:text(o.machine||'',200,true),instructions:text(o.instructions||'',2000),lossPercent:(()=>{const v=num(o.lossPercent);if(v>100)fail(400,'Hao hụt dự kiến không vượt 100%');return v;})(),workQuantity:num(o.workQuantity,true),unit:text(o.unit,40,true),outputUnit:text(o.outputUnit||old?.outputUnit||'chi tiết',40,true),sequence:ids.size};});
    const fixed=frozen(j);for(let i=0;i<fixed.length;i++){const old=j.packet.operations.find(o=>o.id===fixed[i]);if(j.packet.operations[i]?.id!==fixed[i]||operations[i]?.id!==fixed[i]||['name','machine','workQuantity','unit','instructions','mode','lossPercent','outputUnit'].some(k=>(old[k]||'')!==(operations[i][k]||'')))fail(409,'Giữ nguyên thứ tự và thông số công đoạn đã bắt đầu; chỉ đề nghị thay đổi phần chưa thực hiện');}
    const d={id:randomUUID(),jobId:j.id,baseVersion:j.version,operations,before:j.packet.operations,reason,state:'pending',at:now(),actor:user.name};put('route-proposal',d.id,d);audit(user,'route-proposed',j.id,reason);return d;
   }
   const p=get('route-proposal',b.id);if(!p||p.jobId!==j.id||!['pending','confirmed'].includes(p.state))fail(409,'Đề nghị không còn chờ xử lý');
   if(action==='reject'){need(user,'confirm');p.state='rejected';p.rejection=text(b.reason,2000,true);}
   else {if(p.baseVersion!==j.version)fail(409,'Lệnh đã thay đổi; lập đề nghị mới');if(action==='confirm'){need(user,'confirm');if(p.state!=='pending')fail(409,'Đã xác nhận');p.state='confirmed';p.technical={name:user.name,id:user.id,at:now()};}
    else if(action==='approve'){if(user.role!=='admin')fail(403,'Chỉ Admin duyệt áp dụng công nghệ');if(p.state!=='confirmed'||!p.technical)fail(409,'Cần xác nhận kỹ thuật trước');j.packet.operations=p.operations;j.packet.flowApproved={proposalId:p.id,at:now(),technical:p.technical.name,admin:user.name};j.progress.operations=p.operations.map(o=>j.progress.operations.find(x=>x.id===o.id)||{id:o.id,status:'pending',output:0,assignee:'',note:''});save(j,user,'Duyệt tiến trình công nghệ: '+p.reason);p.state='approved';}else fail(400,'Thao tác không hợp lệ');}
   p.reviewedBy=user.name;p.reviewedAt=now();put('route-proposal',p.id,p);audit(user,'route-'+action,j.id,p.reason);return p;
  });send(200,result);return true;
 }
 return {handle,guard,finish,shipOrder};
}
module.exports={createProductionFlow};
