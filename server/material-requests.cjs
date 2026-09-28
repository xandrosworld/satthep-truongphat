'use strict';
const {randomUUID,createHash}=require('node:crypto'),AA=require('../action-access.js');
module.exports=function({sql,list,get,put,job,plan,number,text,fail,now}){
 const rights=u=>({request:AA.allows(u,'production','edit',false)||AA.allows(u,'purchasing','create',false),technical:AA.allows(u,'production','confirm',false),pricing:(AA.allows(u,'production','reviewPricing',false)||AA.allows(u,'purchasing','edit',false))&&require('./access.cjs').permissions(u).costs&&AA.allows(u,'costs','view',u.role==='admin')});
 const signature=id=>{const j=job(id);return createHash('sha256').update(JSON.stringify([j.packet.materials,j.packet.cutting,get('production-purchase-sizes',id)||null])).digest('hex');};
 function notify(p,state){const N=require('./work-notifications.cjs'),recipients=sql.prepare('SELECT * FROM users WHERE active=1 AND deleted_at IS NULL').all().filter(u=>state==='technical-review'?rights(u).technical:state==='pricing-review'?rights(u).pricing:AA.allows(u,'purchasing','approve',false)).map(u=>u.id);N.notify(sql,[...recipients,p.actor],p.code+' · '+({'technical-review':'Đề nghị vật tư chờ kỹ thuật','pricing-review':'Vật tư chờ bổ sung giá và nhà cung cấp',pending:'Đề nghị mua chờ duyệt',rejected:'Đề nghị vật tư đã trả lại'})[state],'source:production:'+p.jobIds[0]);}
 function create(b,u){
  if(!rights(u).request)fail(403,'Chưa có quyền đề nghị vật tư');
  if(!Array.isArray(b.allocations)||!b.allocations.length||b.allocations.length>1000)fail(400,'Chọn số lượng vật tư');
  const ids=[...new Set(b.allocations.map(a=>a.jobId))],plans=plan(ids),seen=new Set(),lines=[];
  for(const p of plans){if(b.jobVersions?.[p.jobId]!==p.version)fail(409,'Lệnh đã đổi; tải lại nhu cầu');require('./production-review.cjs').requireReview(sql,job(p.jobId),fail);}
  for(const a of b.allocations){const key=a.jobId+'|'+a.materialId;if(seen.has(key))fail(400,'Trùng dòng vật tư');seen.add(key);const d=plans.find(p=>p.jobId===a.jobId).rows.find(r=>r.materialId===a.materialId),j=job(a.jobId),qty=number(a.quantity,1e9,true);if(!d||qty>d.remaining+1e-6)fail(409,'Số đề nghị vượt nhu cầu còn lại');if(['tấm','thanh','cái','bộ','chiếc'].includes(d.unit)&&!Number.isInteger(qty))fail(400,'Số lượng phải nguyên');lines.push({id:randomUUID(),materialId:d.materialId,name:d.name,unit:d.unit,length:d.length,width:d.width,thickness:d.thickness,quantity:qty,allocations:[{jobId:j.id,jobCode:j.code,orderId:j.order_id,quantity:qty}]});}
  const prefix='DNVT-'+require('../completion-core.js').todayVN().replaceAll('-','')+'-',codes=new Set(list('purchase').map(p=>p.code));let n=1;while(codes.has(prefix+String(n).padStart(4,'0')))n++;
  const p=put('purchase',randomUUID(),{code:prefix+String(n).padStart(4,'0'),workflow:'material-request',jobId:ids.length===1?ids[0]:null,jobIds:ids,orderId:ids.length===1?job(ids[0]).order_id:null,lines,allocationMode:'jobs',batchNote:text(b.batchNote||'',2000),state:'technical-review',created:now(),actor:u.id,signatures:Object.fromEntries(ids.map(id=>[id,signature(id)])),history:[{state:'technical-review',at:now(),actor:u.name}]},1);notify(p,p.state);return p;
 }
 function review(b,u){
  const p=get('purchase',b.id);if(!p||p.workflow!=='material-request')fail(404,'Không có đề nghị vật tư');if(p.version!==b.expectedVersion)fail(409,'Đề nghị đã thay đổi; mở lại để xử lý');if(!['technical-review','pricing-review'].includes(p.state))fail(409,'Đề nghị đã chuyển bước');const r=rights(u),note=text(b.note||'',2000);
  if(b.action==='reject'){if(u.id!==p.actor&&!r.technical&&!r.pricing)fail(403,'Chưa có quyền trả lại');if(!note)fail(400,'Nhập lý do trả lại / rút đề nghị');p.state='rejected';}
  else{
   for(const id of p.jobIds){require('./material-identity.cjs').guard(sql,job(id).packet,fail);if(job(id).state==='completed'||signature(id)!==p.signatures[id])fail(409,'Thông số vật tư hoặc khổ mua đã thay đổi. Trả lại và lập đề nghị theo nhu cầu mới.');require('./production-review.cjs').requireReview(sql,job(id),fail);}
   if(b.action==='technical'&&p.state==='technical-review'){if(!r.technical)fail(403,'Chưa có quyền xác nhận kỹ thuật');p.technical={at:now(),actor:u.name,actorId:u.id,note};p.state='pricing-review';}
   else if(b.action==='pricing'&&p.state==='pricing-review'){
    if(!r.pricing)fail(403,'Chưa có quyền cập nhật giá mua');const current=plan(p.jobIds);for(const l of p.lines)for(const a of l.allocations){const row=current.find(j=>j.jobId===a.jobId).rows.find(r=>r.materialId===l.materialId);if(!row||a.quantity>Math.max(0,row.unassigned-(row.onOrder-a.quantity))+1e-6)fail(409,'Nhu cầu đã giảm sau khi giữ kho hoặc đặt thêm. Trả lại và lập đề nghị mới.');}const s=get('supplier',b.supplierId);if(!s||!s.active)fail(400,'Chọn nhà cung cấp đang hoạt động');
    if(!Array.isArray(b.prices)||b.prices.length!==p.lines.length||new Set(b.prices.map(x=>x.lineId)).size!==p.lines.length)fail(400,'Bổ sung giá cho đủ các dòng');
    for(const l of p.lines){const price=b.prices.find(x=>x.lineId===l.id);if(!price)fail(400,'Thiếu giá vật tư');l.unitCost=number(price.unitCost,1e12,true);l.leadDays=number(price.leadDays||0,3650);const master=get('material',l.materialId);if(master&&(master.active===false||master.unit!==l.unit))fail(409,'Đối chiếu đơn vị vật tư kho trước khi chuyển mua');if(!master)put('material',l.materialId,{code:l.materialId,name:l.name,unit:l.unit,form:l.unit==='tấm'?'sheet':l.unit==='thanh'?'bar':'bulk',active:true,minimum:0},1);}
    p.supplierId=s.id;p.supplierName=s.name;p.pricing={at:now(),actor:u.name,actorId:u.id,note};p.state='pending';
   }else fail(409,'Cần kỹ thuật xác nhận trước khi bổ sung giá và chuyển đề nghị mua');
  }
  p.history.push({state:p.state,at:now(),actor:u.name,note});const saved=put('purchase',p.id,p,p.version+1);notify(saved,p.state);return saved;
 }
 return {create,review,rights};
};
