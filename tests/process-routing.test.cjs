const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs');
test('routing: review sequence, source approval, department delegation, snapshots, rollback, stock and replay',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;
 const call=async(path,method='GET',body,s=admin)=>{const response=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await response.json();return {status:response.status,data,cookie:response.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const ok=r=>{A.equal(r.status,200,JSON.stringify(r.data));return r.data;},post=(path,b,s)=>call(path,'POST',{requestId:randomUUID(),...b},s);
 admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Routing-test-2026!'});
 const sessions={};for(const [name,actionAccess]of Object.entries({readonlymanager:{production:['view'],serviceRequests:['view']},stockworker:{inventory:['view','edit','approve'],serviceRequests:['view']},worker:{production:['view'],serviceRequests:['view']},tech:{production:['view'],serviceRequests:['view']},stock:{inventory:['view','create','edit','approve'],serviceRequests:['view']},price:{purchasing:['view','edit','approve'],serviceRequests:['view']},outsider:{inventory:['view','edit','approve'],serviceRequests:['view']}})){
  await require('./helpers/personnel-user.cjs')(call,admin,{username:name,name,role:'estimator',password:'Routing-test-2026!',actionAccess:{...actionAccess,processRouting:name==='readonlymanager'?['view']:['view','submit','confirm','return','propose','assign']}});sessions[name]=await call('login','POST',{username:name,password:'Routing-test-2026!'});
 }
 let org=ok(await call('organization'));const department=name=>org.departments.find(d=>d.name==='Fixture '+name).id;
 for(const name of ['tech','stock','price'])org.positions.find(p=>p.departmentId===department(name)).manager=true;org.positions.find(p=>p.departmentId===department('worker')).departmentId=department('tech');org.positions.find(p=>p.departmentId===department('stockworker')).departmentId=department('stock');app.sql.prepare('UPDATE organization SET document=? WHERE id=1').run(JSON.stringify(org));
 let d=ok(await call('process-routing'));let template=d.definitions.find(x=>x.id==='service:supply');const configured={action:'save',id:template.id,expectedVersion:0,active:true,steps:template.steps.map(s=>({...s,departmentId:department(s.key==='technical'?'tech':['price','purchase'].includes(s.key)?'price':'stock'),instructions:'Kiểm tra '+s.name}))};
 A.equal((await post('process-routing',configured,sessions.tech)).status,403);
 A.equal((await post('process-routing',{...configured,steps:configured.steps.map(s=>({...s,departmentId:'missing'}))})).status,400);
 A.equal((await post('process-routing',{...configured,steps:configured.steps.map(s=>s.key==='technical'?{...s,admin:true}:s)})).status,400);
 const blocked=await post('process-routing',{...configured,steps:configured.steps.map(s=>({...s,departmentId:department('readonlymanager')}))});
 A.equal(blocked.status,400);A.match(JSON.stringify(blocked.data),/readonlymanager/);A.match(JSON.stringify(blocked.data),/Kho/);
 const readiness=ok(await call('process-routing')).definitions.find(x=>x.id==='service:supply').readiness;A.ok(Array.isArray(readiness));
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
 r=ok(await post('process-routing',{action:'assign',id:r.id,expectedVersion:r.version,note:'Phân công đúng phòng',assigneeId:app.sql.prepare("SELECT id FROM users WHERE username='worker'").get().id},sessions.tech));
 r=ok(await post('process-routing',{action:'submit-review',id:r.id,expectedVersion:r.version,note:'Nhân viên gửi kết quả'},sessions.worker));A.equal(r.index,0);A.ok(r.steps[0].pendingReview);
 A.equal((await post('process-routing',{action:'complete',id:r.id,expectedVersion:r.version,note:'Tự duyệt'},sessions.worker)).status,409);
 r=ok(await post('process-routing',{action:'return-review',id:r.id,expectedVersion:r.version,note:'Bổ sung thông số'},sessions.tech));A.equal(r.index,0);A.equal(r.steps[0].pendingReview,undefined);
 r=ok(await post('process-routing',{action:'submit-review',id:r.id,expectedVersion:r.version,note:'Đã bổ sung'},sessions.worker));
 const stale=r.version;r=ok(await post('process-routing',{action:'complete',id:r.id,expectedVersion:r.version,note:'Thông số đạt'},sessions.tech));A.equal(r.index,1);A.equal(r.steps[0].reviewedBy,techId);

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
 r=ok(await post('process-routing',{action:'assign',id:r.id,expectedVersion:r.version,note:'Giao nhân viên kho',assigneeId:app.sql.prepare("SELECT id FROM users WHERE username='stockworker'").get().id},sessions.stock));
 approved=ok(await call('ops/service-requests')).rows.find(x=>x.id===request.id);
 A.equal((await post('ops/service-requests',{action:'issue',id:request.id,expectedVersion:approved.version,recipient:'Xưởng',allocations:[{lineId:approved.lines[0].id,lotId:lot.id,quantity:2}]},sessions.stockworker)).status,403);
 r=ok(await post('process-routing',{action:'submit-review',id:r.id,expectedVersion:r.version,note:'Đã chuẩn bị vật tư, đề nghị xác nhận xuất kho'},sessions.stockworker));A.equal(r.steps[r.index].key,'execute');
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
 // Review departments can confirm out of order, but native approval waits for all.
 const parallelSteps=configured.steps.map(s=>({...s,parallelWithPrevious:['stock','price'].includes(s.key)}));
 A.equal((await post('process-routing',{...configured,expectedVersion:2,steps:parallelSteps.map(s=>s.key==='approve'?{...s,parallelWithPrevious:true}:s)})).status,400);
 ok(await post('process-routing',{...configured,expectedVersion:2,steps:parallelSteps}));
 const parallelRequest=ok(await make()),parallelId='service:'+parallelRequest.id;
 const readParallel=async()=>ok(await call('process-routing')).instances.find(x=>x.id===parallelId);
 let pr=await readParallel();A.equal(pr.activeSteps.length,3);
 const act=async(action,key,session,extra={})=>{pr=await readParallel();return post('process-routing',{action,stepKey:key,id:parallelId,expectedVersion:pr.version,note:'Kiểm tra thực tế '+action,...extra},session);};
 pr=ok(await act('complete','stock',sessions.stock));A.equal(pr.index,0);A.ok(pr.steps[1].completedAt);A.equal(pr.activeSteps.length,2);
 A.equal((await post('ops/service-requests',{action:'approve',id:parallelRequest.id,expectedVersion:parallelRequest.version},sessions.stock)).status,403);
 A.equal((await act('complete','stock',sessions.stock)).status,409);
 pr=ok(await act('propose','price',sessions.price));A.ok(pr.steps[2].proposal);A.equal((await act('complete','price',sessions.price)).status,403);
 pr=ok(await act('resolve-proposal','price',sessions.price,{decision:'reject'}));A.equal(pr.steps[2].proposal,undefined);
 pr=ok(await act('return','price',sessions.price));A.ok(pr.correction);A.equal(pr.steps[1].completedAt,undefined);A.equal(pr.activeSteps.length,3);
 A.equal((await act('complete','technical',sessions.tech)).status,403);A.equal((await act('resubmit','technical',sessions.tech)).status,403);
 const edited=ok(await post('ops/service-requests',{action:'edit',id:parallelRequest.id,expectedVersion:parallelRequest.version,type:'supply',departmentId:department('tech'),purposeType:'office',sourceId:'purpose',recipient:'Xưởng',reason:'Đã điều chỉnh sau rà soát',neededDate:'2026-10-03',lines:[{materialId:'MAT',quantity:3}]}));A.equal(edited.id,parallelRequest.id);A.equal(edited.lines[0].quantity,3);A.equal(edited.history.at(-1).action,'edit');A.equal((await post('ops/service-requests',{action:'edit',id:parallelRequest.id,expectedVersion:edited.version,type:'repair'})).status,400);
 pr=ok(await act('resubmit','technical',admin));A.equal(pr.correction,undefined);
 // Two simultaneous writes never overwrite each other's results; the loser retries current version.
 const version=pr.version;
 const concurrent=await Promise.all([['stock',sessions.stock],['price',sessions.price]].map(([key,session])=>post('process-routing',{action:'complete',stepKey:key,id:parallelId,expectedVersion:version,note:'Rà soát song song'},session)));
 A.deepEqual(concurrent.map(x=>x.status).sort(),[200,409]);pr=await readParallel();const retry=pr.steps[1].completedAt?'price':'stock';ok(await act('complete',retry,sessions[retry]));
 pr=await readParallel();A.equal(pr.index,0);A.equal(pr.activeSteps.length,1);
 pr=ok(await act('complete','technical',sessions.tech));A.equal(pr.index,3);A.equal(pr.steps[pr.index].key,'approve');A.equal(pr.history.filter(h=>h.action==='complete'&&h.stepKey==='stock').length,2,JSON.stringify(pr.history));
 // A departmental manager with view only cannot confirm, return, propose or assign.

 org=ok(await call('organization'));const readonlyPosition=org.positions.find(p=>p.departmentId===department('readonlymanager'));readonlyPosition.departmentId=department('tech');readonlyPosition.manager=true;app.sql.prepare('UPDATE organization SET document=? WHERE id=1').run(JSON.stringify(org));
 const readonlySession=await call('login','POST',{username:'readonlymanager',password:'Routing-test-2026!'}),restrictedRequest=ok(await make());const restricted=ok(await call('process-routing','GET',undefined,readonlySession)).instances.find(r=>r.sourceId===restrictedRequest.id);
 A.equal(restricted.activeSteps[0].canComplete,false);for(const action of ['complete','return','propose','assign'])A.equal((await post('process-routing',{action,id:restricted.id,expectedVersion:restricted.version,stepKey:'technical',note:'Không được cấp quyền',assigneeId:techId},readonlySession)).status,403);
 // Accepted changes invalidate the group's confirmations and require the originator to resubmit.
 let changeFlow=ok(await call('process-routing')).instances.find(r=>r.id===restricted.id);
 for(const [action,stepKey,decision]of [['complete','stock'],['propose','price'],['resolve-proposal','price','accept']])changeFlow=ok(await post('process-routing',{action,stepKey,decision,id:changeFlow.id,expectedVersion:changeFlow.version,note:'Đề nghị điều chỉnh theo thực tế'}));
 A.ok(changeFlow.correction);A.equal(changeFlow.steps[1].completedAt,undefined);A.equal(changeFlow.steps[2].proposal,undefined);A.equal(changeFlow.activeSteps.some(s=>s.canComplete),false);
 // Deactivating a department removes execution access, rather than falling back to another department.
 org.departments.find(d=>d.id===department('tech')).active=false;app.sql.prepare('UPDATE organization SET document=? WHERE id=1').run(JSON.stringify(org));const nextFlow=ok(await call('process-routing')).instances.find(r=>r.sourceId===next.id);
 A.equal((await post('process-routing',{action:'complete',id:nextFlow.id,expectedVersion:nextFlow.version,note:'Phòng đã dừng'},sessions.tech)).status,404);
});
