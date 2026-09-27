'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('engineering proposal requires technical confirmation then admin, recomputes and preserves approved source',async t=>{
 const app=createApp({databasePath:':memory:'});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 const call=async(route,method='GET',body,s)=>{const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 const password='Test-engineering-changes-2026!';const admin=await call('setup','POST',{username:'admin',name:'Admin',password});admin.csrf=admin.data.csrf;
 for(const [username,role,extra]of [['tech','technical',{actionAccess:{production:['view','edit','confirm']}}],['sales','sales',{}],['worker','technical',{actionAccess:{production:['view','edit']}}]]){const v=await call('users','POST',{username,name:username,password,role,...extra},admin);A.equal(v.status,201,JSON.stringify(v.data));}
 const login=async username=>{const s=await call('login','POST',{username,password});s.csrf=s.data.csrf;return s;};const tech=await login('tech'),sales=await login('sales'),worker=await login('worker');
 const d=P.demoSeed(),p=d.quote.products[0],q=(await call('quotes','POST',{document:d},admin)).data;await call('quotes/'+q.id+'/submit','POST',{expectedVersion:1},admin);await call('quotes/'+q.id+'/approve','POST',{expectedVersion:2},admin);
 const order=(await call('quotes/'+q.id+'/order','POST',{expectedVersion:3,code:'DH-CHANGE'},admin)).data;await call('orders/'+order.id+'/confirm','POST',{quoteVersion:3},admin);
 let j=(await call('production','POST',{orderId:order.id,productId:p.id,quantity:1,code:'LSX-CHANGE'},admin)).data;j=await require('./production-review-fixture.cjs').review(call,admin,j.id);A.ok(j.id);
 const route='production/'+j.id+'/changes',get=async()=>{const r=await call(route,'GET',undefined,tech);A.equal(r.status,200);return r.data;};
 A.equal((await call(route,'GET',undefined,sales)).status,403);
 const source=await get(),row=source.rows.find(r=>r.dims.L);A.ok(row);A.ok(!JSON.stringify(source).includes('unitPrice'));A.ok(!JSON.stringify(source).includes('document'));
 const body={rowId:row.id,materialId:row.material.id,dims:{L:row.dims.L+10},reason:'Điều chỉnh kích thước theo bản vẽ xưởng',expectedVersion:j.version};
 A.equal((await call(route,'POST',{...body,reason:''},tech)).status,400);
 A.equal((await call(route,'POST',{...body,dims:{L:-1}},tech)).status,400);
 A.equal((await call(route,'POST',{...body,dims:{arbitrary:1}},tech)).status,400);
 let r=await call(route,'POST',body,tech);A.equal(r.status,200,JSON.stringify(r.data));let c=r.data;A.equal(c.state,'pending');A.ok(!c.document);A.deepEqual((await call('production/'+j.id,'GET',undefined,tech)).data.packet,j.packet);
 const step=(a,s=admin,extra={})=>call(route+'/'+c.id+'/'+a,'POST',{expectedVersion:j.version,...extra},s);
 A.equal((await step('approve')).status,409);A.equal((await step('confirm',worker)).status,403);
 A.equal((await step('confirm',tech)).status,200);A.equal((await step('approve',tech)).status,403);
 await require('./ops-fixture.cjs').seedStock(call,admin,j.id);
 A.equal((await step('approve')).status,409);A.equal((await step('business',admin,{note:'Khách chấp thuận theo bản vẽ'})).status,200);A.equal((await step('pricing',admin,{note:'Đã đối chiếu chi phí, chấp thuận'})).status,200);A.equal((await step('approve')).status,200);const changed=(await call('production/'+j.id,'GET',undefined,tech)).data;
 A.equal(changed.version,j.version+1);A.equal(changed.packet.layoutBasis,'engineering-change');A.notDeepEqual(changed.packet.cutting,j.packet.cutting);A.equal(changed.progress.materialsReady,false);A.equal(changed.progress.drawingReady,false);
 A.ok((await call('ops/job/'+j.id,'GET',undefined,admin)).data.holds.every(h=>h.state==='released'));
 const backup=(await call('backup','GET',undefined,admin)).data;A.equal(JSON.parse(backup.revisions.find(r=>r.id===q.id&&r.version===3).document).quote.products[0].qty,p.qty);A.deepEqual(JSON.parse(backup.orders[0].package).quote,order.package.quote);
 j=changed;A.equal((await step('approve')).status,409);
 // A later job edit invalidates previously reviewed changes, even before production starts.
 c=(await call(route,'POST',{...body,expectedVersion:j.version,dims:{L:row.dims.L+20}},tech)).data;
 A.equal((await step('confirm',tech)).status,200);
 j=(await call('production/'+j.id,'PUT',{expectedVersion:j.version,action:'prepare',workshop:'Xưởng',deadline:'',drawingReady:false,materialsReady:true,note:''},tech)).data;
 A.equal((await step('approve')).status,409);
 A.equal((await step('reject',admin,{reason:'Thông số đã thay đổi'})).status,200);
 // Switching to an approved catalog material and stock size changes the job only.
 c=(await call(route,'POST',{expectedVersion:j.version,rowId:row.id,materialId:'PH-T20',stockL:3000,stockW:1250,reason:'Đổi mã vật tư và khổ tấm'},tech)).data;
 A.ok(c.id);A.equal((await step('confirm',tech)).status,200);A.equal((await step('approve')).status,409);A.equal((await step('business',admin,{note:'Khách chấp thuận theo bản vẽ'})).status,200);A.equal((await step('pricing',admin,{note:'Đã đối chiếu chi phí, chấp thuận'})).status,200);A.equal((await step('approve')).status,200);j=(await call('production/'+j.id,'GET',undefined,tech)).data;
 A.equal(j.packet.materials.find(r=>r.id===row.id).material.id,'PH-T20');A.equal(j.packet.cutting.find(g=>g.materialId==='PH-T20').stockL,3000);
 // Stock/thickness modification is separately captured and recalculated.
 const current=await get(),rr=current.rows.find(r=>r.id===row.id);r=await call(route,'POST',{expectedVersion:j.version,rowId:rr.id,materialId:rr.material.id,props:{T:rr.properties.T+1},reason:'Đổi chiều dày'},tech);A.equal(r.status,200,JSON.stringify(r.data));c=r.data;
 A.equal((await step('confirm',tech)).status,200);A.equal((await step('approve')).status,409);A.equal((await step('business',admin,{note:'Khách chấp thuận theo bản vẽ'})).status,200);A.equal((await step('pricing',admin,{note:'Đã đối chiếu chi phí, chấp thuận'})).status,200);A.equal((await step('approve')).status,200);j=(await call('production/'+j.id,'GET',undefined,tech)).data;
 A.equal(j.packet.materials.find(r=>r.id===row.id).properties.T,rr.properties.T+1);

 // Machine/norm proposal is inert until every review and final approval.
 const machine=await call('ops/master','POST',{requestId:'change-machine-test',expectedVersion:0,kind:'machine',document:{code:'MC-01',name:'Máy chấn kiểm thử',workshop:'Xưởng',hoursPerDay:8,active:true}},admin);A.equal(machine.status,200,JSON.stringify(machine.data));
 const operation=(await get()).operations[0],index=Number(operation.id.split(':').pop());
 const machineBody={expectedVersion:j.version,rowId:operation.nodeId,reason:'Đổi máy và định mức',operations:[{index,amount:operation.norm+1,machineId:machine.data.id,instructions:'Theo bản vẽ đã duyệt'}]};
 A.equal((await call(route,'POST',{...machineBody,operations:[{index,machineId:'missing'}]},tech)).status,400);
 c=(await call(route,'POST',machineBody,tech)).data;A.ok(c.id);
 A.equal((await call('production/'+j.id,'GET',undefined,tech)).data.packet.operations.find(o=>o.id===operation.id).machine,operation.machine);
 A.equal((await step('confirm',tech)).status,200);
 for(const action of ['business','pricing'])A.equal((await step(action,admin,{note:'Đã xem tác động và chấp thuận'})).status,200);
 A.equal((await step('approve')).status,200);j=(await call('production/'+j.id,'GET',undefined,tech)).data;
 A.equal(j.packet.operations.find(o=>o.id===operation.id).machineId,machine.data.id);A.equal(j.packet.operations.find(o=>o.id===operation.id).norm,operation.norm+1);
 // Mixed-row proposal, selective reviews must match the exact approved selection.
 const rowsNow=(await get()).rows.filter(r=>r.dims.L),a=rowsNow[0],z=rowsNow[1];A.ok(z);
 const oldPacket=(await call('production/'+j.id,'GET',undefined,tech)).data.packet;
 c=(await call(route,'POST',{expectedVersion:j.version,reason:'Bảng kiến nghị hai chi tiết',items:[{rowId:a.id,dims:{L:a.dims.L+5}},{rowId:z.id,dims:{L:z.dims.L+7}}]},tech)).data;A.ok(c.id);
 A.equal((await step('business',tech,{note:'Không được phép'})).status,403);
 A.equal((await step('confirm',tech)).status,200);
 A.equal((await step('business',admin,{note:'Khách chấp thuận',rowIds:[a.id]})).status,200);
 A.equal((await step('pricing',admin,{note:'Giá đã kiểm tra',rowIds:[a.id]})).status,200);
 A.equal((await step('approve',admin,{rowIds:[a.id]})).status,409);
 A.equal((await step('confirm',tech,{rowIds:[a.id]})).status,200);
 const preview=await step('preview',admin,{rowIds:[a.id]});A.equal(preview.status,200,JSON.stringify(preview.data));A.deepEqual(preview.data.rowIds,[a.id]);A.equal((await step('preview',tech,{rowIds:[a.id]})).status,403);
 const quoted=(await call(route,'GET',undefined,admin)).data.changes.find(x=>x.id===c.id).impact.materialPrices.find(x=>x.rowId===a.id);
 A.equal((await step('pricing',admin,{note:'Cập nhật đơn giá',rowIds:[a.id],prices:[{rowId:a.id,unitPrice:quoted.unitPrice+100}]})).status,200);
 A.equal((await step('approve',admin,{rowIds:[a.id]})).status,409,'price changes require fresh business consent');
 const hidden=(await get()).changes.find(x=>x.id===c.id);A.equal(hidden.impact,undefined);A.equal(hidden.appliedImpact,undefined);
 A.equal((await step('business',admin,{note:'Khách chấp thuận giá cập nhật',rowIds:[a.id]})).status,200);
 const partial=await step('approve',admin,{rowIds:[a.id]});A.equal(partial.status,200,JSON.stringify(partial.data));A.deepEqual(partial.data.notAppliedRowIds,[z.id]);
 j=(await call('production/'+j.id,'GET',undefined,tech)).data;
 A.deepEqual(j.packet.materials.find(r=>r.id===z.id).dimensions,oldPacket.materials.find(r=>r.id===z.id).dimensions);
 A.notDeepEqual(j.packet.materials.find(r=>r.id===a.id).dimensions,oldPacket.materials.find(r=>r.id===a.id).dimensions);
 const extended=await get(),er=extended.rows.find(r=>r.material.shape==='sheet'&&r.dims.L&&r.dims.W),ed=extended.nodeDetails.find(n=>n.id===er.id),eo=extended.operations.find(o=>o.nodeId===er.id);
 A.equal((await call(route,'POST',{expectedVersion:j.version,rowId:er.id,qty:-1,reason:'Invalid quantity'},tech)).status,400);
 A.equal((await call(route,'POST',{expectedVersion:j.version,rowId:er.id,formula:{length:'invalid(',width:'W'},reason:'Invalid formula'},tech)).status,400);
 const extendedBody={expectedVersion:j.version,rowId:er.id,qty:ed.qty+1,lineNote:'Bản vẽ shop điều chỉnh',formula:{length:'L+25',width:'W'},reason:'Điều chỉnh cấu thành và công thức'};
 if(eo)extendedBody.operations=[{index:Number(eo.id.split(':').pop()),mode:'outside',basisMode:'manual_total',workQuantity:7,quantityUnit:'kg'}];
 const proposed=await call(route,'POST',extendedBody,tech);A.equal(proposed.status,200,JSON.stringify(proposed.data));c=proposed.data;
 const immutable=(await call('production/'+j.id,'GET',undefined,tech)).data;A.deepEqual(immutable.packet,j.packet);
 for(const action of ['confirm','business','pricing'])A.equal((await step(action,admin,{note:'Đã kiểm tra cấu thành / công thức / định mức'})).status,200);
 A.equal((await step('approve')).status,200);j=(await call('production/'+j.id,'GET',undefined,tech)).data;
 A.equal(j.packet.materials.find(r=>r.id===er.id).dimensions.length,er.dims.L+25);
 const saved=(await get()).nodeDetails.find(n=>n.id===er.id);A.equal(saved.qty,ed.qty+1);A.equal(saved.lineNote,extendedBody.lineNote);
 if(eo){const appliedOp=j.packet.operations.find(o=>o.id===eo.id);A.equal(appliedOp.mode,'outside');A.equal(appliedOp.workQuantity,7);}

 // Full editor supports added structure and rejects root changes / commercial injection.
 const editor=(await call(route+'/editor','GET',undefined,tech));A.equal(editor.status,200,JSON.stringify(editor.data));
 const full=structuredClone(editor.data.document),root=full.quote.products[0],C=require('../core.js');
 const child=C.flatten(root.children).find(n=>n.kind==='material'&&n.dims.L),extra=structuredClone(child);extra.id='new-production-detail';extra.name='Chi tiết bổ sung';extra.children=[];extra.ops=structuredClone(C.flatten(full.quote.products).find(n=>n.ops.length).ops);root.children.push(extra);
 const badRoot=structuredClone(full);badRoot.quote.products[0].qty+=1;A.equal((await call(route,'POST',{expectedVersion:j.version,reason:'Sai phạm vi',technicalDocument:badRoot},tech)).status,400);
 const badPrice=structuredClone(full);C.flatten(badPrice.quote.products).find(n=>n.kind==='material').spec.price=12345;A.equal((await call(route,'POST',{expectedVersion:j.version,reason:'Giá trái quyền',technicalDocument:badPrice},tech)).status,400);
 let fullProposal=await call(route,'POST',{expectedVersion:j.version,reason:'Bổ sung cấu thành',technicalDocument:full},tech);A.equal(fullProposal.status,200,JSON.stringify(fullProposal.data));c=fullProposal.data;A.equal(c.structural,true);
 for(const action of ['confirm','business','pricing'])A.equal((await step(action,admin,{note:'Đồng ý bổ sung cấu thành'})).status,200);
 const opPrice=(await call(route,'GET',undefined,admin)).data.changes.find(x=>x.id===c.id).impact.operationPrices.find(x=>x.rowId===extra.id);A.ok(opPrice);
 A.equal((await step('pricing',tech,{note:'Không được sửa giá',operationPrices:[{rowId:extra.id,index:opPrice.index,unitPrice:777}]})).status,403);
 A.equal((await step('pricing',admin,{note:'Giá nguyên công mới',operationPrices:[{rowId:extra.id,index:opPrice.index,unitPrice:777}]})).status,200);
 A.equal((await step('approve')).status,409);A.equal((await step('business',admin,{note:'Khách đồng ý giá mới'})).status,200);
 let appliedFull=await step('approve');A.equal(appliedFull.status,200,JSON.stringify(appliedFull.data));j=(await call('production/'+j.id,'GET',undefined,admin)).data;A.ok(j.packet.materials.some(m=>m.id===extra.id));
 const priceBackup=(await call('backup','GET',undefined,admin)).data,sourceRecord=priceBackup.opsRecords.find(r=>r.kind==='production-source'&&r.id===j.id),priceSource=JSON.parse(sourceRecord.document);A.equal(C.flatten(priceSource.quote.products).find(n=>n.id===extra.id).ops[opPrice.index].unitPrice,777);
 // Approved routing must survive later engineering changes, including removed and added stages.
 const ops=j.packet.operations.slice(1).map(o=>({...o,machineId:'',machine:'Máy đã duyệt',instructions:'Giữ phương pháp đã duyệt',lossPercent:0,workQuantity:o.workQuantity||1,unit:o.unit||'kg'}));ops.push({name:'Kiểm tra bổ sung',machine:'Thủ công',mode:'inside',workQuantity:1,unit:'lần',lossPercent:0});
 const routePlan=await call('production/'+j.id+'/flow/plan','POST',{expectedVersion:j.version,reason:'Duyệt quy trình riêng',operations:ops},admin);A.equal(routePlan.status,200,JSON.stringify(routePlan.data));
 for(const action of ['confirm','pricing','business','approve']){const r=await call('production/'+j.id+'/flow/'+action,'POST',{id:routePlan.data.id,expectedVersion:j.version,note:'Đã xem xét',...(action==='pricing'?{operationPrices:routePlan.data.operationPrices.filter(x=>x.unitPrice===null).map(x=>({operationId:x.operationId,unitPrice:500}))}:{})},admin);A.equal(r.status,200,JSON.stringify(r.data));}
 j=(await call('production/'+j.id,'GET',undefined,admin)).data;const approvedOps=structuredClone(j.packet.operations);
 const noteRow=(await get()).rows[0];c=(await call(route,'POST',{expectedVersion:j.version,rowId:noteRow.id,lineNote:'Chỉ cập nhật ghi chú',reason:'Bổ sung ghi chú'},tech)).data;
 for(const action of ['confirm','business','pricing','approve']){const r=await step(action,admin,{note:'Đồng ý ghi chú'});A.equal(r.status,200,JSON.stringify(r.data));}
 j=(await call('production/'+j.id,'GET',undefined,admin)).data;A.deepEqual(j.packet.operations,approvedOps);
 j=await require('./production-review-fixture.cjs').review(call,admin,j.id);await require('./ops-fixture.cjs').seedStock(call,admin,j.id);
 j=(await call('production/'+j.id,'PUT',{expectedVersion:j.version,action:'prepare',workshop:'Xưởng',deadline:'',drawingReady:true,materialsReady:true,note:''},tech)).data;
 const op=j.progress.operations[0];j=(await call('production/'+j.id,'PUT',{expectedVersion:j.version,action:'operation',operationId:op.id,assignee:'',status:'running',output:0,note:''},tech)).data;
 A.equal((await call(route,'POST',{...body,expectedVersion:j.version},tech)).status,409);
});
