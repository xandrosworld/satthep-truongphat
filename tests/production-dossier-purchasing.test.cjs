'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
async function fixture(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;const call=async(path,method='GET',body,s=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Operations-test-2026!'},null);const d=P.demoSeed();const q=(await call('quotes','POST',{document:d})).data;await call('quotes/'+q.id+'/submit','POST',{expectedVersion:1});await call('quotes/'+q.id+'/approve','POST',{expectedVersion:2});const o=(await call('quotes/'+q.id+'/order','POST',{expectedVersion:3,code:'ORDER-OPS'})).data;await call('orders/'+o.id+'/confirm','POST',{quoteVersion:3});const j=await call('production','POST',{orderId:o.id,productId:d.quote.products[0].id,quantity:1,code:'JOB-OPS'});A.equal(j.status,201,JSON.stringify(j.data));const post=(p,b,s)=>call('ops/'+p,'POST',{requestId:randomUUID(),...b},s);return {app,call,post,admin,job:j.data,order:o,document:d};}
test('production dossier isolates prices, stores drawing revisions, enforces review, version and access',async t=>{
 const {app,call,job}=await fixture(t);let d=(await call('production/'+job.id+'/dossier')).data;
 A.ok(d.source.tree.length);A.equal(JSON.stringify(d.source).includes('ratesSnapshot'),false);A.equal(d.source.tree[0].qty,1);
 const upload={expectedVersion:d.jobVersion,name:'production.pdf',size:4,data:Buffer.from('%PDF').toString('base64'),revision:'R1'};
 let r=await call('production/'+job.id+'/files','POST',upload);A.equal(r.status,200,JSON.stringify(r.data));d=r.data;const id=d.files[0].id;
 A.equal((await call('production/'+job.id+'/files','POST',upload)).status,409);
 A.equal((await call('production/'+job.id+'/files/'+id)).data.data,upload.data);
 const body={expectedVersion:d.jobVersion,requirements:'Kiem tra kich thuoc',equipment:job.packet.operations.map(o=>({operationId:o.id,machine:'Thu cong',method:'Theo ban ve'})),reviewed:true};
 r=await call('production/'+job.id+'/dossier','POST',body);A.equal(r.status,200,JSON.stringify(r.data));A.ok(r.data.reviewed);d=r.data;
 r=await call('production/'+job.id+'/files','POST',{...upload,expectedVersion:d.jobVersion,revision:'R2',supersedes:id});A.equal(r.status,200);A.equal(r.data.files.length,2);A.equal(r.data.reviewed,undefined);d=r.data;
 A.equal((await call('production/'+job.id,'PUT',{action:'prepare',expectedVersion:d.jobVersion,drawingReady:true,materialsReady:false,workshop:'A',deadline:'',note:''})).status,409);
 A.equal((await call('production/'+job.id+'/dossier','POST',{...body,expectedVersion:d.jobVersion,equipment:[]})).status,400);
 const u=(await call('users','POST',{username:'viewer',name:'Viewer',role:'sales',password:'Operations-test-2026!'})).data;app.sql.prepare('UPDATE users SET action_access=? WHERE id=?').run(JSON.stringify({production:['view']}),u.id);const session=await call('login','POST',{username:'viewer',password:'Operations-test-2026!'});
 A.equal((await call('production/'+job.id+'/dossier','GET',undefined,session)).status,200);A.equal((await call('production/'+job.id+'/files','POST',{...upload,expectedVersion:d.jobVersion},session)).status,403);
 A.equal((await call('production/'+job.id+'/files/'+randomUUID())).status,403);
 app.sql.prepare("UPDATE production_jobs SET state='running' WHERE id=?").run(job.id);A.equal((await call('production/'+job.id+'/dossier','POST',{...body,expectedVersion:d.jobVersion})).status,409);
});
test('split and grouped purchases allocate stock and costs to each job without duplicate demand',async t=>{
 const {app,call,post,job,order,document}=await fixture(t),j2=(await call('production','POST',{orderId:order.id,productId:document.quote.products[0].id,quantity:1,code:'JOB-SECOND'})).data;
 A.ok(j2.id);const plans=(await call('ops/purchase-plan?jobs='+job.id+','+j2.id)).data;A.equal(plans.length,2,JSON.stringify(plans));const ds=plans[0].rows;
 for(const d of ds)A.equal((await post('master',{kind:'material',expectedVersion:0,document:{id:d.materialId,code:d.materialId,name:d.name||d.materialId,unit:d.unit,form:d.unit==='tấm'?'sheet':'bulk'}})).status,200);
 const supplier=(await post('master',{kind:'supplier',expectedVersion:0,document:{code:'SUP',name:'Supplier',prices:ds.map(d=>({materialId:d.materialId,unitCost:20,leadDays:2}))}})).data;
 const base={supplierId:supplier.id,jobVersions:Object.fromEntries(plans.map(j=>[j.jobId,j.version]))},one=plans[0].rows[0];
 const partial={...base,code:'BATCH-1',allocations:[{jobId:job.id,materialId:one.materialId,quantity:one.remaining>1?1:one.remaining}]};let first=await post('purchase',partial);A.equal(first.status,200,JSON.stringify(first.data));
 let current=(await call('ops/purchase-plan?jobs='+job.id+','+j2.id)).data;A.equal(current[0].rows[0].onOrder,partial.allocations[0].quantity);
 const body={...base,code:'GROUP',allocations:current.flatMap(j=>j.rows.filter(r=>r.remaining>0).map(r=>({jobId:j.jobId,materialId:r.materialId,quantity:r.remaining})))};
 let r=await post('purchase',body);A.equal(r.status,200,JSON.stringify(r.data));let p=r.data;A.equal(p.jobIds.length,2);A.equal((await post('purchase',{...body,code:'DUP'})).status,409);
 for(const state of ['approved','ordered','shipping','received','stocked']){r=await post('transition',{id:p.id,expectedVersion:p.version,state,note:'OK',receipts:p.lines.map(l=>({lineId:l.id,materialId:l.materialId,quantity:l.quantity,warehouse:'Main',unitWeight:10,length:l.length,width:l.width,thickness:l.thickness||1}))});A.equal(r.status,200,JSON.stringify(r.data));p=r.data;}
 A.equal(p.costIds.length,2);const state=(await call('ops/state')).data;for(const j of [job,j2])A.ok(state.holds.some(h=>h.jobId===j.id&&h.purchaseId===p.id));
 const costs=app.sql.prepare("SELECT document FROM business_records WHERE kind='cost'").all().map(x=>JSON.parse(x.document));A.equal(costs.reduce((s,c)=>s+c.amount,0),p.lines.reduce((s,l)=>s+l.quantity*l.unitCost,0));
 current=(await call('ops/purchase-plan?jobs='+job.id+','+j2.id)).data;A.ok(current.every(j=>j.rows.every(r=>r.remaining===0)));A.equal((await post('transition',{id:p.id,expectedVersion:p.version,state:'stocked'})).status,409);
});
test('combined preview does not reuse the same physical stock and purchase rejects stale versions',async t=>{
 const {call,post,job,order,document}=await fixture(t),j2=(await call('production','POST',{orderId:order.id,productId:document.quote.products[0].id,quantity:1,code:'JOB-SECOND'})).data;
 const d=(await call('ops/job/'+job.id)).data.requirements.find(r=>r.unit==='tấm');await post('master',{kind:'material',expectedVersion:0,document:{id:d.materialId,code:d.materialId,name:d.name,unit:d.unit,form:'sheet'}});
 await post('receipt',{materialId:d.materialId,warehouse:'A',quantity:1,unitWeight:10,unitCost:20,length:d.length,width:d.width,thickness:d.thickness,reference:'STOCK'});
 const plan=(await call('ops/purchase-plan?jobs='+job.id+','+j2.id)).data,rows=plan.map(j=>j.rows.find(r=>r.materialId===d.materialId));A.equal(rows.reduce((s,r)=>s+r.remaining-r.suggested,0),1);
 const supplier=(await post('master',{kind:'supplier',expectedVersion:0,document:{code:'SUP',name:'Supplier',prices:[{materialId:d.materialId,unitCost:20,leadDays:2}]}})).data;
 A.equal((await post('purchase',{code:'STALE',supplierId:supplier.id,jobVersions:{[job.id]:0},allocations:[{jobId:job.id,materialId:d.materialId,quantity:1}]})).status,409);
});
test('dossier technical source keeps approved scope and excludes commercial fields',()=>{
 const {technicalInput}=require('../server/production-dossier.cjs'),q=P.demoSeed().quote;q.request={notes:'Manufacturing requirement',location:'Factory',schedule:'October',files:[{id:'drawing',name:'drawing.pdf',storage:'server',size:10},{id:'prices',name:'prices.xlsx',storage:'server'}],items:[{id:'i',name:'Item',specification:'Steel',qty:2,unit:'bộ',price:900}],links:[{name:'CAD',url:'https://example.com/drawing'},{name:'Bad',url:'javascript:alert(1)'}]};const source=technicalInput(q);A.equal(source.location,'Factory');A.deepEqual(source.files.map(f=>f.id),['drawing']);A.equal(source.items[0].price,undefined);A.equal(source.links.length,1);A.equal(source.tree[0].cost,undefined);A.equal(source.tree[0].spec,undefined);
});
test('equipment review is invalidated by a newly approved route; delegated editor can prepare but cannot change source quote',async t=>{
 const {app,call,job,admin,order}=await fixture(t);const revision=app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=3').get(app.sql.prepare('SELECT quote_id FROM orders WHERE id=?').get(order.id).quote_id).document;
 const u=(await call('users','POST',{username:'engineer',name:'Engineer',role:'sales',password:'Operations-test-2026!'})).data;app.sql.prepare('UPDATE users SET action_access=? WHERE id=?').run(JSON.stringify({production:['view','edit']}),u.id);const session=await call('login','POST',{username:'engineer',password:'Operations-test-2026!'});
 const r=await call('production/'+job.id+'/dossier','POST',{expectedVersion:job.version,requirements:'Factory detail',noDrawingReason:'Simple parts per dimensions',reviewed:true,equipment:job.packet.operations.map(o=>({operationId:o.id,machine:'Manual',method:'Specification'}))},session);A.equal(r.status,200,JSON.stringify(r.data));A.ok(r.data.reviewed);
 await require('./production-flow-fixture.cjs').approveRoute(call,admin,job.id);const d=(await call('production/'+job.id+'/dossier')).data;A.equal(d.reviewed,undefined);A.equal((await call('production/'+job.id)).data.progress.drawingReady,false);A.equal(app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=3').get(app.sql.prepare('SELECT quote_id FROM orders WHERE id=?').get(order.id).quote_id).document,revision);
});
