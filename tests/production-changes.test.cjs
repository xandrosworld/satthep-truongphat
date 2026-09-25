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
 let j=(await call('production','POST',{orderId:order.id,productId:p.id,quantity:1,code:'LSX-CHANGE'},admin)).data;A.ok(j.id);
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
 A.equal((await step('approve')).status,200);const changed=(await call('production/'+j.id,'GET',undefined,tech)).data;
 A.equal(changed.version,j.version+1);A.equal(changed.packet.layoutBasis,'engineering-change');A.notDeepEqual(changed.packet.cutting,j.packet.cutting);A.equal(changed.progress.materialsReady,false);A.equal(changed.progress.drawingReady,false);
 A.ok((await call('ops/job/'+j.id,'GET',undefined,admin)).data.holds.every(h=>h.state==='released'));
 const backup=(await call('backup','GET',undefined,admin)).data;A.equal(JSON.parse(backup.revisions.find(r=>r.id===q.id&&r.version===3).document).quote.products[0].qty,p.qty);A.deepEqual(JSON.parse(backup.orders[0].package).quote,order.package.quote);
 j=changed;A.equal((await step('approve')).status,409);
 // A later job edit invalidates previously reviewed changes, even before production starts.
 c=(await call(route,'POST',{...body,expectedVersion:j.version,dims:{L:row.dims.L+20}},tech)).data;
 A.equal((await step('confirm',tech)).status,200);
 j=(await call('production/'+j.id,'PUT',{expectedVersion:j.version,action:'prepare',workshop:'Xưởng',deadline:'',drawingReady:true,materialsReady:true,note:''},tech)).data;
 A.equal((await step('approve')).status,409);
 A.equal((await step('reject',admin,{reason:'Thông số đã thay đổi'})).status,200);
 // Switching to an approved catalog material and stock size changes the job only.
 c=(await call(route,'POST',{expectedVersion:j.version,rowId:row.id,materialId:'PH-T20',stockL:3000,stockW:1250,reason:'Đổi mã vật tư và khổ tấm'},tech)).data;
 A.ok(c.id);A.equal((await step('confirm',tech)).status,200);A.equal((await step('approve')).status,200);j=(await call('production/'+j.id,'GET',undefined,tech)).data;
 A.equal(j.packet.materials.find(r=>r.id===row.id).material.id,'PH-T20');A.equal(j.packet.cutting.find(g=>g.materialId==='PH-T20').stockL,3000);
 // Stock/thickness modification is separately captured and recalculated.
 const current=await get(),rr=current.rows.find(r=>r.id===row.id);r=await call(route,'POST',{expectedVersion:j.version,rowId:rr.id,materialId:rr.material.id,props:{T:rr.properties.T+1},reason:'Đổi chiều dày'},tech);A.equal(r.status,200,JSON.stringify(r.data));c=r.data;
 A.equal((await step('confirm',tech)).status,200);A.equal((await step('approve')).status,200);j=(await call('production/'+j.id,'GET',undefined,tech)).data;
 A.equal(j.packet.materials.find(r=>r.id===row.id).properties.T,rr.properties.T+1);
 await require('./ops-fixture.cjs').seedStock(call,admin,j.id);
 j=(await call('production/'+j.id,'PUT',{expectedVersion:j.version,action:'prepare',workshop:'Xưởng',deadline:'',drawingReady:true,materialsReady:true,note:''},tech)).data;
 const op=j.progress.operations[0];j=(await call('production/'+j.id,'PUT',{expectedVersion:j.version,action:'operation',operationId:op.id,assignee:'',status:'running',output:0,note:''},tech)).data;
 A.equal((await call(route,'POST',{...body,expectedVersion:j.version},tech)).status,409);
});
