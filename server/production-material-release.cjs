'use strict';
const {randomUUID,createHash}=require('node:crypto'),AA=require('../action-access.js');
module.exports=function(h){
 const {sql,fail,readBody,transaction,audit,job,list,get,put,stock,demands,reserve,movement,now}=h;
 const signature=j=>createHash('sha256').update(JSON.stringify([j.packet.materials,j.packet.kerf])).digest('hex');
 const requests=id=>list('material-release').filter(r=>r.jobId===id);
 const rows=j=>(j.packet.materials||[]).filter(r=>!r.externallySupplied).map(r=>{const committed=requests(j.id).filter(x=>x.state!=='rejected').flatMap(x=>x.rows).filter(x=>x.rowId===r.id).reduce((s,x)=>s+x.quantity,0);return {rowId:r.id,materialId:r.material.id,name:r.name,quantity:r.count,remaining:Math.max(0,r.count-committed),length:r.dimensions.length,width:r.dimensions.width,unit:r.material.shape==='piece'?r.material.unit||'cái':'chi tiết'};});
 function plan(j,selection){
  if(!Array.isArray(selection)||!selection.length||selection.length>2000||new Set(selection.map(x=>x.rowId)).size!==selection.length)fail(400,'Chọn các chi tiết cần triển khai');
  const available=rows(j);for(const x of selection){const r=available.find(r=>r.rowId===x.rowId);if(!r||!Number.isFinite(x.quantity)||x.quantity<=0||x.quantity>r.remaining||!Number.isInteger(x.quantity))fail(409,'Số lượng chi tiết vượt phần còn lại hoặc không hợp lệ');}
  const packet={...j.packet,materials:j.packet.materials.filter(r=>selection.some(x=>x.rowId===r.id)).map(r=>({...r,count:selection.find(x=>x.rowId===r.id).quantity}))},lots=stock(),holds=list('hold').filter(x=>x.jobId===j.id&&x.state==='reserved'&&!x.releaseRequestId),plans=[];
  for(const materialId of new Set(packet.materials.map(r=>r.material.id))){
   if(list('hold').some(x=>x.jobId===j.id&&x.materialId===materialId&&['issued','settled'].includes(x.state)&&!x.releaseRequestId))fail(409,'Vật tư đã cấp theo luồng cũ; đối chiếu phần đã cấp trước khi lập đợt mới');
   const d=demands(j.id).find(d=>d.materialId===materialId);if(!d)fail(400,'Không có nhu cầu vật tư');let nesting;
   try{nesting=require('./production-stock-nesting.cjs').plan(packet,d,lots,holds);}catch{fail(400,'Khổ phôi không phù hợp kích thước chi tiết; kiểm tra khổ mua');}
   if(nesting){plans.push({materialId,name:d.name,unit:d.unit,...nesting});continue;}
   const selected=packet.materials.filter(r=>r.material.id===materialId),required=selected.reduce((s,r)=>s+(r.material.shape==='piece'?r.count:(r.dimensions.weight||0)*r.count/j.packet.materials.find(x=>x.id===r.id).count),0);let left=required;const allocations=[];
   for(const hold of holds.filter(x=>x.materialId===materialId)){const l=lots.find(l=>l.id===hold.lotId);if(!l||l.unit!==d.unit||require('./material-identity.cjs').different(l.materialSpec,d.materialSpec))continue;const quantity=Math.min(left,hold.quantity);if(quantity>0)allocations.push({lotId:l.id,warehouse:l.warehouse,quantity,held:true,stocks:[]});left-=quantity;}
   for(const l of lots.filter(l=>l.materialId===materialId&&l.unit===d.unit&&!require('./material-identity.cjs').different(l.materialSpec,d.materialSpec))){const quantity=Math.min(left,l.available);if(quantity>0)allocations.push({lotId:l.id,warehouse:l.warehouse,quantity,held:false,stocks:[]});left-=quantity;}
   plans.push({materialId,name:d.name,unit:d.unit,requiredParts:required,missingParts:Math.max(0,left),allocations,purchaseStocks:[],remaining:[]});
  }
  return {jobVersion:j.version,rows:selection,plans,complete:plans.every(p=>p.missingParts<1e-6)};
 }
 function create(j,b,u){
  require('./production-review.cjs').requireReview(sql,j,fail);if(j.state==='completed')fail(409,'Lệnh đã hoàn thành');if(j.version!==b.expectedVersion)fail(409,'Lệnh đã thay đổi; tải lại trước khi đề nghị');
  const preview=plan(j,b.rows);if(!preview.complete)fail(409,'Chưa đủ phôi cho phần đã chọn; giảm số lượng hoặc bổ sung kho trước khi đề nghị xuất');
  if(!j.packet.stockManaged){if(j.state!=='ready'||j.progress.operations.some(o=>o.status!=='pending'))fail(409,'Lệnh cũ đã sản xuất; cần đối chiếu kho trước');j.packet.stockManaged=true;sql.prepare('UPDATE production_jobs SET packet=?,version=version+1 WHERE id=?').run(JSON.stringify(j.packet),j.id);}
  const id=randomUUID(),holdIds=[];
  for(const p of preview.plans)for(const a of p.allocations){
   if(!a.held){const lot=stock().find(l=>l.id===a.lotId);if(!lot||lot.available<a.quantity)fail(409,'Tồn kho đã thay đổi');const hold=put('hold',randomUUID(),{jobId:j.id,lotId:a.lotId,materialId:p.materialId,quantity:a.quantity,state:'reserved',releaseRequestId:id,actor:u.id,at:now()},1);holdIds.push(hold.id);continue;}
   let left=a.quantity;for(const hold of list('hold').filter(x=>x.jobId===j.id&&x.lotId===a.lotId&&x.state==='reserved'&&!x.releaseRequestId)){if(left<=0)break;const quantity=Math.min(left,hold.quantity);if(quantity===hold.quantity){put('hold',hold.id,{...hold,releaseRequestId:id,releaseExisting:true},hold.version+1);holdIds.push(hold.id);}else{put('hold',hold.id,{...hold,quantity:hold.quantity-quantity},hold.version+1);const split=put('hold',randomUUID(),{...hold,id:undefined,quantity,releaseRequestId:id,releaseExisting:true},1);holdIds.push(split.id);}left-=quantity;}if(left>1e-6)fail(409,'Phần giữ kho đã thay đổi');
  }
  const r=put('material-release',id,{jobId:j.id,code:j.code,rows:b.rows,plans:preview.plans,holdIds,state:'pending',source:signature(job(j.id)),created:now(),actor:u.name,note:typeof b.note==='string'?b.note.slice(0,2000):''},1);
  const users=sql.prepare('SELECT * FROM users WHERE active=1 AND deleted_at IS NULL').all().filter(x=>AA.allows(x,'inventory','approve',false)).map(x=>x.id);require('./work-notifications.cjs').notify(sql,users,'Đề nghị xuất phôi: '+j.code,'source:production:'+j.id);return r;
 }
 async function handle({req,route,user,send}){
  const m=route.match(/^\/api\/ops\/material-release(?:\/(preview|request|issue|reject))?$/);if(!m)return false;
  if(!AA.allows(user,'production','view',false))fail(403,'Cần quyền xem sản xuất');
  if(req.method==='GET'&&!m[1]){const j=job(new URL(req.url,'http://local').searchParams.get('job'));send(200,{jobVersion:j.version,rows:rows(j),requests:requests(j.id),canRequest:AA.allows(user,'production','edit',false),canIssue:AA.allows(user,'inventory','approve',false)&&AA.allows(user,'inventory','edit',false)});return true;}
  if(req.method!=='POST'||!m[1])fail(405,'Thao tác không hợp lệ');const b=await readBody(req,200000),action=m[1];
  if(action==='preview'){send(200,plan(job(b.jobId),b.rows));return true;}
  if(action==='request'?!AA.allows(user,'production','edit',false):!AA.allows(user,'inventory','approve',false)||!AA.allows(user,'inventory','edit',false))fail(403,'Chưa có quyền đề nghị hoặc xác nhận xuất kho');
  if(typeof b.requestId!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(b.requestId))fail(400,'Mã thao tác không hợp lệ');
  const result=transaction(()=>{
   const cache=sql.prepare('SELECT * FROM ops_requests WHERE id=?').get(b.requestId),body=JSON.stringify(b);if(cache){if(cache.actor!==user.id||cache.route!==route||cache.body!==body)fail(409,'Mã thao tác đã được sử dụng');return JSON.parse(cache.result);}
   let r;if(action==='request')r=create(job(b.jobId),b,user);else{
    r=get('material-release',b.id);if(!r||r.version!==b.expectedVersion||r.state!=='pending')fail(409,'Đề nghị đã thay đổi hoặc được xử lý');const j=job(r.jobId);
    if(action==='issue'){require('./production-review.cjs').requireReview(sql,j,fail);if(j.state==='completed'||signature(j)!==r.source)fail(409,'Thông số sản xuất đã đổi; trả lại đề nghị và lập lại');}
    for(const id of r.holdIds){const hold=get('hold',id);if(action==='reject'&&(!hold||hold.state==='released'))continue;if(!hold||hold.state!=='reserved'||hold.releaseRequestId!==r.id)fail(409,'Phần giữ kho đã thay đổi');
     if(action==='reject'){const next={...hold,state:hold.releaseExisting?'reserved':'released'};delete next.releaseRequestId;delete next.releaseExisting;put('hold',id,next,hold.version+1);continue;}
     const l=get('lot',hold.lotId);if(!l||l.quantity<hold.quantity)fail(409,'Kho không đủ để cấp');put('lot',l.id,{...l,quantity:l.quantity-hold.quantity},l.version+1);put('hold',id,{...hold,state:'issued',issuedAt:now()},hold.version+1);movement({kind:'issue',jobId:j.id,orderId:j.order_id,holdId:id,releaseRequestId:r.id,lotId:l.id,materialId:l.materialId,warehouse:l.warehouse,quantity:-hold.quantity,weight:-hold.quantity*l.unitWeight,value:-hold.quantity*l.unitCost,reference:j.code},user);
    }
    r=put('material-release',r.id,{...r,state:action==='issue'?'issued':'rejected',reviewedAt:now(),reviewedBy:user.name},r.version+1);
   }
   audit(user,'material-release-'+action,r.jobId,r.id);sql.prepare('INSERT INTO ops_requests VALUES(?,?,?,?,?)').run(b.requestId,user.id,route,body,JSON.stringify(r));return r;
  });send(200,result);return true;
 }
 return {handle};
};
