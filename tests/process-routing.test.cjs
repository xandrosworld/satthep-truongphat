const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs');
test('routing: review sequence, source approval, department delegation, snapshots, rollback, stock and replay',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;
 const call=async(path,method='GET',body,s=admin)=>{const response=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await response.json();return {status:response.status,data,cookie:response.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const ok=r=>{A.equal(r.status,200,JSON.stringify(r.data));return r.data;},post=(path,b,s)=>call(path,'POST',{requestId:randomUUID(),...b},s);
 admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Routing-test-2026!'});
 const sessions={};for(const [name,actionAccess]of Object.entries({tech:{production:['view'],serviceRequests:['view']},stock:{inventory:['view','create','edit','approve'],serviceRequests:['view']},price:{purchasing:['view','edit','approve'],serviceRequests:['view']},outsider:{inventory:['view','edit','approve'],serviceRequests:['view']}})){
  await require('./helpers/personnel-user.cjs')(call,admin,{username:name,name,role:'estimator',password:'Routing-test-2026!',actionAccess});sessions[name]=await call('login','POST',{username:name,password:'Routing-test-2026!'});
 }
 let org=ok(await call('organization'));const department=name=>org.departments.find(d=>d.name==='Fixture '+name).id;
 for(const name of ['tech','stock','price'])org.positions.find(p=>p.departmentId===department(name)).manager=true;app.sql.prepare('UPDATE organization SET document=? WHERE id=1').run(JSON.stringify(org));
 let d=ok(await call('process-routing'));let template=d.definitions.find(x=>x.id==='service:supply');const configured={action:'save',id:template.id,expectedVersion:0,active:true,steps:template.steps.map(s=>({...s,departmentId:department(s.key==='technical'?'tech':['price','purchase'].includes(s.key)?'price':'stock'),instructions:'Kiểm tra '+s.name}))};
 A.equal((await post('process-routing',configured,sessions.tech)).status,403);
 A.equal((await post('process-routing',{...configured,steps:configured.steps.map(s=>({...s,departmentId:'missing'}))})).status,400);
 ok(await post('process-routing',configured));A.equal((await post('process-routing',configured)).status,409);
 app.sql.prepare('INSERT INTO ops_records VALUES(?,?,?,?)').run('material-purpose','purpose',1,JSON.stringify({type:'office',code:'VP',name:'Office',active:true}));
 ok(await post('ops/master',{kind:'material',expectedVersion:0,document:{id:'MAT',code:'MAT',name:'Material',unit:'cái',form:'bulk'}}));const lot=ok(await post('ops/receipt',{materialId:'MAT',warehouse:'Main',quantity:10,unitWeight:1,unitCost:10,reference:'INITIAL',length:0,width:0,thickness:0}));
 const make=()=>post('ops/service-requests',{action:'create',type:'supply',departmentId:department('tech'),purposeType:'office',sourceId:'purpose',recipient:'Xưởng',reason:'Cấp vật tư',neededDate:'2026-10-02',lines:[{materialId:'MAT',quantity:4}]});const request=ok(await make());
 const flow=async s=>ok(await call('process-routing','GET',undefined,s)).instances.find(x=>x.sourceId===request.id);
 let r=await flow();A.equal(r.index,0);A.equal(r.definitionVersion,1);A.equal((await flow(sessions.outsider)),undefined);
 A.equal((await post('ops/service-requests',{action:'approve',id:request.id,expectedVersion:request.version})).status,403);
 A.equal(JSON.parse(app.sql.prepare("SELECT document FROM ops_records WHERE kind='service-request' AND id=?").get(request.id).document).state,'pending');
 A.equal((await post('process-routing',{action:'complete',id:r.id,expectedVersion:r.version,note:'Không được'},sessions.stock)).status,403);
 const techId=app.sql.prepare("SELECT id FROM users WHERE username='tech'").get().id,stockId=app.sql.prepare("SELECT id FROM users WHERE username='stock'").get().id;
 A.equal((await post('process-routing',{action:'assign',id:r.id,expectedVersion:r.version,note:'Sai phòng',assigneeId:stockId},sessions.tech)).status,400);
 r=ok(await post('process-routing',{action:'assign',id:r.id,expectedVersion:r.version,note:'Phân công đúng phòng',assigneeId:techId},sessions.tech));
 const stale=r.version;r=ok(await post('process-routing',{action:'complete',id:r.id,expectedVersion:r.version,note:'Thông số đạt'},sessions.tech));A.equal(r.index,1);
 A.equal((await post('process-routing',{action:'complete',id:r.id,expectedVersion:stale,note:'Gửi lại'},sessions.tech)).status,409);
 // Configuration edits do not silently reroute in-flight requests.
 const updated=ok(await post('process-routing',{...configured,expectedVersion:1,steps:configured.steps.map(s=>({...s,instructions:'Mới '+s.name}))}));A.equal(updated.version,2);A.equal((await flow()).definitionVersion,1);A.equal((await flow()).steps[1].instructions.startsWith('Kiểm tra'),true);
 r=ok(await post('process-routing',{action:'migrate',id:r.id,expectedVersion:r.version,definitionVersion:2,note:'Áp dụng nội dung rà soát mới'}));A.equal(r.definitionVersion,2);A.equal(r.steps[0].instructions.startsWith('Kiểm tra'),true);A.equal(r.steps[1].instructions.startsWith('Mới'),true);
 r=ok(await post('process-routing',{action:'complete',id:r.id,expectedVersion:r.version,note:'Kho đáp ứng 4 cái; không thiếu'},sessions.stock));
 r=ok(await post('process-routing',{action:'complete',id:r.id,expectedVersion:r.version,note:'Giá và đáp ứng đã xác nhận'},sessions.price));A.equal(r.steps[r.index].key,'approve');
 A.equal((await post('process-routing',{action:'complete',id:r.id,expectedVersion:r.version,note:'Không thay chứng từ'})).status,409);
 A.equal((await post('ops/service-requests',{action:'approve',id:request.id,expectedVersion:request.version},sessions.outsider)).status,404);
 let approved=ok(await post('ops/service-requests',{action:'approve',id:request.id,expectedVersion:request.version},sessions.stock));r=await flow();A.equal(r.steps[r.index].key,'purchase');
 A.equal((await post('ops/service-requests',{action:'issue',id:request.id,expectedVersion:approved.version,recipient:'Xưởng',allocations:[{lineId:approved.lines[0].id,lotId:lot.id,quantity:4}]},sessions.stock)).status,403);
 r=ok(await post('process-routing',{action:'complete',id:r.id,expectedVersion:r.version,note:'Vật tư đã sẵn sàng, không cần mua thêm'},sessions.price));A.equal(r.steps[r.index].key,'execute');
 const issue={action:'issue',requestId:randomUUID(),id:request.id,expectedVersion:approved.version,recipient:'Xưởng',allocations:[{lineId:approved.lines[0].id,lotId:lot.id,quantity:2}]};approved=ok(await post('ops/service-requests',issue,sessions.stock));A.equal(approved.state,'partial');A.equal((await flow()).state,'running');ok(await post('ops/service-requests',issue,sessions.stock));
 approved=ok(await post('ops/service-requests',{...issue,requestId:randomUUID(),expectedVersion:approved.version},sessions.stock));A.equal(approved.state,'completed');A.equal((await flow()).state,'completed');
 const stock=app.sql.prepare("SELECT document FROM ops_records WHERE kind='lot' AND id=?").get(lot.id);A.equal(JSON.parse(stock.document).quantity,6);
 const next=ok(await make());A.equal(ok(await call('process-routing')).instances.find(r=>r.sourceId===next.id).definitionVersion,2);
 // The purchase source keeps native supplier, receipt and accounting checks.
 const purchaseDef=ok(await call('process-routing')).definitions.find(x=>x.id==='purchase');ok(await post('process-routing',{action:'save',id:'purchase',expectedVersion:0,active:true,steps:purchaseDef.steps.map(s=>({...s,departmentId:department(s.key==='stock'?'stock':'price')}))}));
 const supplier=ok(await post('ops/master',{kind:'supplier',expectedVersion:0,document:{code:'SUP',name:'Supplier',active:true,prices:[]}}));
 let purchase=ok(await post('ops/material-request',{scope:'department',departmentId:department('tech'),purposeType:'office',sourceId:'purpose',lines:[{materialId:'MAT',quantity:2}]}));
 purchase=ok(await post('ops/material-request-review',{id:purchase.id,expectedVersion:purchase.version,action:'pricing',supplierId:supplier.id,prices:purchase.lines.map(l=>({lineId:l.id,unitCost:20}))}));
 A.equal((await post('ops/transition',{id:purchase.id,expectedVersion:purchase.version,state:'approved'})).status,409);
 const purchaseFlow=ok(await call('process-routing')).instances.find(r=>r.sourceId===purchase.id);ok(await post('process-routing',{action:'complete',id:purchaseFlow.id,expectedVersion:purchaseFlow.version,note:'Nhu cầu và giá đã đối chiếu'},sessions.price));
 for(const state of ['approved','ordered','shipping','received','stocked'])purchase=ok(await post('ops/transition',{id:purchase.id,expectedVersion:purchase.version,state,receipts:purchase.lines.map(l=>({lineId:l.id,materialId:l.materialId,quantity:l.quantity,warehouse:'Main',unitWeight:1,length:0,width:0,thickness:0}))}));
 A.equal(ok(await call('process-routing')).instances.find(r=>r.sourceId===purchase.id).state,'completed');A.ok(app.sql.prepare("SELECT id FROM business_records WHERE kind='cost' AND id=?").get('purchase-'+purchase.id));
 // Deactivating a department removes execution access, rather than falling back to another department.
 org.departments.find(d=>d.id===department('tech')).active=false;app.sql.prepare('UPDATE organization SET document=? WHERE id=1').run(JSON.stringify(org));const nextFlow=ok(await call('process-routing')).instances.find(r=>r.sourceId===next.id);
 A.equal((await post('process-routing',{action:'complete',id:nextFlow.id,expectedVersion:nextFlow.version,note:'Phòng đã dừng'},sessions.tech)).status,404);
});
