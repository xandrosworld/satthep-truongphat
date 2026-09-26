'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
async function fixture(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;const call=async(path,method='GET',body,s=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Operations-test-2026!'},null);const d=P.demoSeed();const q=(await call('quotes','POST',{document:d})).data;await call('quotes/'+q.id+'/submit','POST',{expectedVersion:1});await call('quotes/'+q.id+'/approve','POST',{expectedVersion:2});const o=(await call('quotes/'+q.id+'/order','POST',{expectedVersion:3,code:'ORDER-OPS'})).data;await call('orders/'+o.id+'/confirm','POST',{quoteVersion:3});const j=await call('production','POST',{orderId:o.id,productId:d.quote.products[0].id,quantity:2,code:'JOB-OPS'});A.equal(j.status,201,JSON.stringify(j.data));const post=(p,b,s)=>call('ops/'+p,'POST',{requestId:randomUUID(),...b},s);return {app,call,post,admin,job:j.data,order:o,document:d};}
test('partial batches retain allocation and independently enforce review, stock and concurrency',async t=>{
 const {app,call,job,admin}=await fixture(t);
 const split={expectedVersion:job.version,code:'PART-1',quantity:1};
 let r=await call('production/'+job.id+'/parts','POST',{...split,quantity:2});A.equal(r.status,400);
 r=await call('production/'+job.id+'/parts','POST',split);A.equal(r.status,201,JSON.stringify(r.data));const part=r.data.id;
 A.equal((await call('production/'+job.id+'/parts','POST',split)).status,409);
 const a=(await call('production/'+job.id)).data,b=(await call('production/'+part)).data;A.equal(a.quantity+b.quantity,2);A.equal(b.packet.partFamily.id,job.id);A.equal(b.packet.product.quantity,1);A.equal(b.progress.drawingReady,false);
 A.equal((await call('production/'+part,'PUT',{expectedVersion:b.version,action:'operation',operationId:b.packet.operations[0].id,status:'running',output:0,assignee:'',note:''})).status,409);
 await require('./production-review-fixture.cjs').review(call,undefined,part);
 A.ok((await call('production/'+part+'/dossier')).data.reviewed);A.equal((await call('production/'+job.id+'/dossier')).data.reviewed,undefined);
 const list=(await call('production')).data.jobs;A.equal(list.length,2);A.equal(list.find(j=>j.id===part).stages.technical.state,'done');A.equal(list.find(j=>j.id===job.id).stages.technical.state,'pending');A.equal(JSON.stringify(list).includes('ratesSnapshot'),false);
 await require('./production-flow-fixture.cjs').approveRoute(call,undefined,part);await require('./production-review-fixture.cjs').review(call,undefined,part);
 const needs=(await call('ops/job/'+part)).data.requirements;
 const post=(path,b)=>call('ops/'+path,'POST',{requestId:randomUUID(),...b});
 for(const n of needs){
  A.equal((await post('master',{kind:'material',expectedVersion:0,document:{id:n.materialId,code:n.materialId,name:n.name||n.materialId,unit:n.unit,form:n.unit==='tấm'?'sheet':'bulk'}})).status,200);
  const lot=await post('receipt',{materialId:n.materialId,quantity:n.quantity,unitWeight:10,unitCost:1,warehouse:'Kho',reference:'Test',length:n.length||0,width:n.width||0,thickness:n.thickness||1});A.equal(lot.status,200,JSON.stringify(lot.data));
  A.equal((await post('reserve',{jobId:part,lotId:lot.data.id,quantity:n.quantity})).status,200);
 }
 let current=(await call('production/'+part)).data;
 let ready=await call('production/'+part,'PUT',{expectedVersion:current.version,action:'prepare',drawingReady:true,materialsReady:true,workshop:'Xưởng',deadline:'',note:''});A.equal(ready.status,200,JSON.stringify(ready.data));current=ready.data;
 const started=await call('production/'+part,'PUT',{expectedVersion:current.version,action:'operation',operationId:current.packet.operations[0].id,status:'running',output:0,assignee:admin.data.user.id,note:''});A.equal(started.status,200,JSON.stringify(started.data));
 A.equal((await call('production/'+job.id)).data.state,'ready');A.equal((await call('production/'+job.id+'/dossier')).data.reviewed,undefined);
 A.equal((await call('production/'+part+'/parts','POST',{expectedVersion:started.data.version,code:'BLOCKED',quantity:.5})).status,409);
 const allocation=(await call('production/orders/'+job.order_id)).data;A.equal(allocation.allocated.find(x=>x.product_id===job.product_id).quantity,2);
 const u=(await call('users','POST',{username:'readonly',name:'Viewer',role:'sales',password:'Operations-test-2026!'})).data;app.sql.prepare('UPDATE users SET action_access=? WHERE id=?').run(JSON.stringify({production:['view']}),u.id);const session=await call('login','POST',{username:'readonly',password:'Operations-test-2026!'});
 A.equal((await call('production/'+part+'/parts','POST',{expectedVersion:2,code:'NO',quantity:.5},session)).status,403);
});

test('splitting retains issuance instructions in both lots while clearing review and readiness',async t=>{
 const {app,call,job,order,document}=await fixture(t);
 const fields={deadline:'2026-10-30',workshop:'Workshop A',schedule:'30 days',assignee:'owner-id',assigneeName:'Owner',designReference:'SHOP-R2',technicalNotes:'Tolerance 0.5 mm',preparationNote:'Keep coating intact'};
 app.sql.prepare('UPDATE production_jobs SET progress=? WHERE id=?').run(JSON.stringify({...job.progress,...fields,materialsReady:true,drawingReady:true}),job.id);
 const r=await call('production/'+job.id+'/parts','POST',{expectedVersion:job.version,code:'KEEP-FIELDS',quantity:1});A.equal(r.status,201,JSON.stringify(r.data));
 for(const id of [job.id,r.data.id]){const j=(await call('production/'+id)).data;for(const [k,v]of Object.entries(fields))A.equal(j.progress[k],v,k);A.equal(j.progress.materialsReady,false);A.equal(j.progress.drawingReady,false);A.ok(j.packet.issuedBy.name);}
 A.equal((await call('production','POST',{orderId:order.id,productId:document.quote.products[0].id,quantity:0.5,code:'FRACTIONAL'})).status,400);
 const current=(await call('production/'+job.id)).data;A.equal((await call('production/'+job.id,'PUT',{expectedVersion:current.version,action:'prepare',deadline:'2026-02-30',workshop:'A',note:'',materialsReady:false,drawingReady:false})).status,400);
});
