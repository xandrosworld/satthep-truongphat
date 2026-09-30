const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs');
test('admin early approval is atomic, audited, restricted and still requires real receipt',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;
 const call=async(path,method='GET',body,s=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};},ok=r=>{A.equal(r.status,200,JSON.stringify(r.data));return r.data;},post=(path,b)=>call(path,'POST',{requestId:randomUUID(),...b});
 admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Receipt-test-2026!'});
 await require('./helpers/personnel-user.cjs')(call,admin,{username:'keeper',name:'Keeper',password:'Receipt-test-2026!',role:'estimator',actionAccess:{processRouting:['view','submit','confirm','assign'],production:['view'],inventory:['view','create','edit','approve'],purchasing:['view','edit'],serviceRequests:['view','create']}});
 const org=ok(await call('organization')),departmentId=org.departments.find(d=>d.name==='Fixture keeper').id;org.positions.find(p=>p.departmentId===departmentId).manager=true;app.sql.prepare('UPDATE organization SET document=? WHERE id=1').run(JSON.stringify(org));
 const d=ok(await call('process-routing')).definitions.find(d=>d.id==='service:supply');const config={action:'save',id:d.id,expectedVersion:0,active:true,receiptCompletion:true,steps:d.steps.map(s=>({...s,parallelWithPrevious:['stock','price'].includes(s.key),admin:s.key==='approve',departmentId:s.key==='approve'?'':departmentId,instructions:'Kiểm tra'}))};ok(await post('process-routing',config));
 app.sql.prepare('INSERT INTO ops_records VALUES(?,?,?,?)').run('material-purpose','office',1,JSON.stringify({type:'office',code:'VP',name:'Office',active:true}));ok(await post('ops/master',{kind:'material',expectedVersion:0,document:{id:'WIRE',code:'WIRE',name:'Dây hàn',form:'bulk',unit:'kg'}}));
 let r=ok(await post('ops/service-requests',{action:'create',type:'supply',departmentId,purposeType:'office',sourceId:'office',recipient:'Kho',reason:'Nhập dây hàn',neededDate:'2026-10-02',lines:[{materialId:'WIRE',quantity:75}]}));
 const flow=async()=>ok(await call('process-routing')).instances.find(x=>x.sourceId===r.id),complete=async()=>{const f=await flow();return post('process-routing',{action:'complete',id:f.id,expectedVersion:f.version,note:'Đạt'});};
 const f0=await flow(),req={action:'approve',earlyApproval:true,id:r.id,expectedVersion:r.version,processVersion:f0.version,note:'Cần mua gấp theo quyết định Admin'};
 const keeper=await call('login','POST',{username:'keeper',password:'Receipt-test-2026!'});
 A.equal((await call('ops/service-requests','POST',{...req,requestId:randomUUID()},keeper)).status,403);
 A.equal((await post('ops/service-requests',{...req,note:''})).status,400);
 A.equal((await post('ops/service-requests',{...req,processVersion:999})).status,409);
 A.equal((await flow()).index,0);
 const valid={...req,requestId:randomUUID()};r=ok(await post('ops/service-requests',valid));ok(await post('ops/service-requests',valid));
 const approved=await flow();A.equal(r.state,'approved');A.equal(approved.steps[approved.index].key,'purchase');A.ok(approved.steps.slice(0,3).every(s=>!s.completedAt&&s.bypassedApproval));A.equal(approved.history.filter(h=>h.action==='approve-early').length,1);A.equal(approved.canApproveEarly,false);
 ok(await complete());
 A.equal((await complete()).status,409);A.equal((await post('ops/service-requests',{action:'issue',id:r.id,expectedVersion:r.version,allocations:[]})).status,403);
 const receipt={action:'receive',id:r.id,expectedVersion:r.version,lineId:r.lines[0].id,materialId:'WIRE',quantity:30,unitWeight:1,unitCost:100,warehouse:'Kho chính',receiptType:'other',reference:'PN-001',requestId:randomUUID()};
 r=ok(await post('ops/service-requests',receipt));A.equal(r.state,'partial');A.equal(r.lines[0].received,30);A.equal((await flow()).state,'running');const count=app.sql.prepare('SELECT COUNT(*) n FROM stock_movements').get().n;ok(await post('ops/service-requests',receipt));A.equal(app.sql.prepare('SELECT COUNT(*) n FROM stock_movements').get().n,count);
 const next={...receipt,expectedVersion:r.version,quantity:46,requestId:randomUUID()};A.equal((await post('ops/service-requests',next)).status,409);A.equal(app.sql.prepare('SELECT COUNT(*) n FROM stock_movements').get().n,count);
 const modes=ok(await post('process-routing',{...config,expectedVersion:1,receiptCompletion:false}));const f=await flow();A.equal((await post('process-routing',{action:'migrate',id:f.id,expectedVersion:f.version,definitionVersion:modes.version,note:'Sai cách hoàn tất'})).status,409);
 r=ok(await post('ops/service-requests',{...next,quantity:45,requestId:randomUUID(),reference:'PN-002'}));A.equal(r.state,'completed');A.equal((await flow()).state,'completed');A.ok(r.history.filter(h=>h.action==='receive').every(h=>h.allocations[0].movementId));const moves=app.sql.prepare('SELECT document FROM stock_movements').all().map(x=>JSON.parse(x.document));A.equal(moves.reduce((n,m)=>n+m.quantity,0),75);A.ok(moves.every(m=>m.kind==='receipt'&&m.serviceRequestId===r.id));
});

