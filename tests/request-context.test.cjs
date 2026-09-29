const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {createApp}=require('../server/app.cjs'),personnelUser=require('./helpers/personnel-user.cjs');
test('request context: canonical personnel, authorized sources, snapshots, stock and purchase cost destinations',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>{app.server.closeAllConnections();return new Promise(r=>app.server.close(r));});let admin;
 const call=async(path,method='GET',body,auth=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:auth?.cookie||'','X-CSRF-Token':auth?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const ok=r=>{A.equal(r.status,200,JSON.stringify(r.data));return r.data;},post=(path,b,auth)=>call('ops/'+path,'POST',{requestId:randomUUID(),...b},auth);
 admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Request-context-2026!'});
 await personnelUser(call,admin,{username:'requester',name:'Người đề nghị',role:'technical',password:'Request-context-2026!',actionAccess:{serviceRequests:['view','create'],purchasing:['view','create'],orders:['view'],production:['view'],contracts:['view']}});
 const person=await call('login','POST',{username:'requester',password:'Request-context-2026!'});
 const view=ok(await call('ops/service-requests','GET',undefined,person));const dep=view.context.departments[0];A.equal(view.context.departments.length,1);A.equal(view.context.requester.name,'Người đề nghị');A.ok(view.context.requester.employeeId);
 const q=await call('quotes','POST',{document:require('../pricing-core.js').demoSeed()});A.equal(q.status,201);
 app.sql.prepare('INSERT INTO orders VALUES(?,?,?,?,?,?,?)').run('order-ref','DH-REF',q.data.id,1,'{}',new Date().toISOString(),'admin');
 app.sql.prepare('INSERT INTO production_jobs VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run('job-ref','LSX-REF','order-ref','product',1,1,'draft','{}','{}','2026-09-29','2026-09-29','admin');
 app.sql.prepare('INSERT INTO business_records VALUES(?,?,?,?)').run('contract','contract-ref',1,JSON.stringify({code:'HD-REF',status:'active',orderId:'order-ref'}));
 const mat=ok(await post('master',{kind:'material',expectedVersion:0,document:{code:'M-REQ',name:'Vật tư phụ',unit:'cái',form:'bulk',active:true}}));
 const lot=ok(await post('receipt',{materialId:mat.id,warehouse:'Kho',quantity:10,unitWeight:1,unitCost:200,reference:'Tồn đầu'}));
 const body={action:'create',type:'supply',departmentId:dep.id,purposeType:'job',sourceId:'job-ref',recipient:'Người nhận',reason:'Bổ sung cho lệnh',lines:[{materialId:mat.id,quantity:2}],requesterName:'Forged',requesterId:'admin',department:'Forged',costTarget:{orderId:'forged'}};
 A.equal((await post('service-requests',{...body,departmentId:'outside'},person)).status,400);
 A.equal((await post('service-requests',{...body,sourceId:'missing'},person)).status,400);
 A.equal((await post('service-requests',{...body,purposeType:'quote',sourceId:q.data.id},person)).status,400);
 A.equal((await post('service-requests',{...body,purposeType:'',sourceId:''},person)).status,400);
 const idempotent={...body,requestId:randomUUID()};let r=ok(await post('service-requests',idempotent,person));
 A.equal(r.id,ok(await post('service-requests',idempotent,person)).id);A.equal(r.requesterName,'Người đề nghị');A.equal(r.department,dep.name);A.equal(r.requesterEmployeeId,view.context.requester.employeeId);A.equal(r.costTarget.orderId,'order-ref');A.equal(r.costTarget.jobId,'job-ref');A.equal(r.costTarget.quoteId,q.data.id);
 r=ok(await post('service-requests',{action:'approve',id:r.id,expectedVersion:r.version}));
 r=ok(await post('service-requests',{action:'issue',id:r.id,expectedVersion:r.version,recipient:'Người nhận',allocations:[{lineId:r.lines[0].id,lotId:lot.id,quantity:2}]}));
 const move=app.sql.prepare('SELECT document FROM stock_movements').all().map(x=>JSON.parse(x.document)).find(x=>x.serviceRequestId===r.id);A.equal(move.quantity,-2);A.equal(move.costTarget.orderId,'order-ref');A.equal(move.purpose.code,'LSX-REF');
 // Every generic kind, plus repair/maintenance/supplement, shares the same mandatory context.
 for(const type of view.types.filter(x=>!x.external)){
  const details=Object.fromEntries((type.fields||[]).map(f=>[f.key,f.type==='number'?2:f.type==='date'?'2026-10-01':'Chi tiết công việc']));
  const saved=ok(await post('service-requests',{...body,type:type.id,purposeType:'contract',sourceId:'contract-ref',details,equipment:'Máy khoan',problem:'Cần bảo dưỡng'},person));A.equal(saved.costTarget.contractId,'contract-ref',type.id);A.equal(saved.costTarget.orderId,'order-ref',type.id);
 }
 // Purchase cost follows destination without turning supplementary items into planned BOM allocations.
 const supplier=ok(await post('master',{kind:'supplier',expectedVersion:0,document:{code:'NCC-REQ',name:'Nhà cung cấp',active:true,prices:[]}}));
 let p=ok(await post('material-request',{scope:'department',departmentId:dep.id,purposeType:'contract',sourceId:'contract-ref',lines:[{materialId:mat.id,quantity:3}]},person));A.equal(p.requesterName,'Người đề nghị');A.deepEqual(p.jobIds,[]);A.equal(p.costTarget.contractId,'contract-ref');
 p=ok(await post('material-request-review',{id:p.id,expectedVersion:p.version,action:'pricing',supplierId:supplier.id,prices:p.lines.map(l=>({lineId:l.id,unitCost:300}))}));
 for(const state of ['approved','ordered','shipping','received','stocked']){const b={id:p.id,expectedVersion:p.version,state,requestId:randomUUID(),receipts:p.lines.map(l=>({lineId:l.id,materialId:l.materialId,quantity:l.quantity,warehouse:'Kho',unitWeight:1,length:0,width:0,thickness:0}))};p=ok(await post('transition',b));if(state==='stocked')A.equal(ok(await post('transition',b)).id,p.id);}
 const costs=app.sql.prepare("SELECT document FROM business_records WHERE kind='cost'").all().map(x=>JSON.parse(x.document));A.equal(costs.length,1);A.equal(costs[0].amount,900);A.equal(costs[0].orderId,'order-ref');A.equal(costs[0].contractId,'contract-ref');
 const purchasedLot=app.sql.prepare("SELECT document,id FROM ops_records WHERE kind='lot'").all().find(x=>JSON.parse(x.document).purchaseId===p.id);A.ok(purchasedLot);
 const issued=ok(await post('issue',{lotId:purchasedLot.id,quantity:1,reference:p.code,note:'Cấp vật tư phụ'}));A.equal(issued.costTarget.orderId,'order-ref');A.equal(issued.purchaseId,p.id);
 A.equal(app.sql.prepare("SELECT count(*) n FROM business_records WHERE kind='cost'").get().n,1);
 // Changing organization cannot rewrite historical identity or allow a new request from a disabled unit.
 const org=JSON.parse(app.sql.prepare('SELECT document FROM organization WHERE id=1').get().document);org.departments.find(x=>x.id===dep.id).active=false;app.sql.prepare('UPDATE organization SET document=? WHERE id=1').run(JSON.stringify(org));
 A.equal((await post('service-requests',body,person)).status,400);const stored=ok(await call('ops/service-requests','GET',undefined,person)).rows.find(x=>x.id===r.id);A.equal(stored.department,dep.name);A.equal(stored.costTarget.orderId,'order-ref');
});
