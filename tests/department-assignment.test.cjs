const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('department assignment requires both manager position and quote action; follows current organization membership',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port,password='Department-assignment-2026!';
 const call=async(route,method='GET',body,s)=>{const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password}),users={};
 for(const name of ['head','worker','outside'])users[name]=(await require('./helpers/personnel-user.cjs')(call,admin,{username:name,name,password,role:'technical',sections:['bom','operations']},{direct:true}));
 const d={departments:[{id:'tech',name:'Technical',stage:'technical',active:true},{id:'other',name:'Other',stage:'technical',active:true}],positions:[{id:'head',departmentId:'tech',manager:false,active:true},{id:'worker',departmentId:'tech',manager:false,active:true},{id:'outside',departmentId:'other',manager:false,active:true}],employees:Object.entries(users).map(([name,u])=>({id:u.id,userId:u.id,active:true,managed:true,positionIds:[name]}))};
 const write=()=>app.sql.prepare('INSERT INTO organization VALUES(1,1,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document').run(JSON.stringify(d));write();app.sql.prepare('INSERT INTO work_teams VALUES(1,1,?)').run(JSON.stringify({technical:{managers:[],members:[]}}));
 const actions=values=>app.sql.prepare('UPDATE users SET action_access=? WHERE id=?').run(JSON.stringify({quotes:values}),users.head.id);actions(['view','edit','confirm']);
 const head=await call('login','POST',{username:'head',password}),q=(await call('quotes','POST',{document:P.demoSeed()},admin)).data,path='quotes/'+q.id,work=path+'/work';
 A.equal((await call(work,'GET',undefined,head)).data.canEdit,false);
 d.positions[0].manager=true;write();A.equal((await call(work,'GET',undefined,head)).data.canEdit,false,'manager without assign action cannot edit');A.equal((await call(path+'/handoff','GET',undefined,head)).data.work.canEdit,false);
 const body={expectedRevision:0,technicalId:users.worker.id,materialsId:null,status:'not-started'};A.equal((await call(work,'PUT',body,head)).status,403);
 actions(['view','edit','confirm','assign']);const w=(await call(work,'GET',undefined,head)).data;A.equal(w.canEdit,true);A.deepEqual(w.candidates.technical.map(x=>x.id).sort(),[users.head.id,users.worker.id].sort());A.equal(w.canStatus,false);
 A.equal((await call(work,'PUT',{...body,technicalId:users.outside.id},head)).status,403);A.equal((await call(work,'PUT',{...body,status:'completed'},head)).status,403);A.equal((await call(work,'PUT',body,head)).status,200);A.equal((await call(work,'PUT',body,head)).status,409);A.equal((await call(work,'GET',undefined,head)).data.technical.id,users.worker.id);
 A.equal(app.sql.prepare("SELECT COUNT(*) n FROM notifications n JOIN handoff_events e ON e.id=n.event_id WHERE n.user_id=? AND e.stage='assigned-technical'").get(users.worker.id).n,1);
 // Personnel changes affect assignment options immediately without widening the user's data rights.
 d.employees.find(e=>e.id===users.outside.id).positionIds=['worker'];write();A.ok((await call(work,'GET',undefined,head)).data.candidates.technical.some(x=>x.id===users.outside.id));
 d.employees.find(e=>e.id===users.outside.id).active=false;write();A.ok(!(await call(work,'GET',undefined,head)).data.candidates.technical.some(x=>x.id===users.outside.id));
 const worker=await call('login','POST',{username:'worker',password});A.equal((await call(work,'PUT',{...body,expectedRevision:1},worker)).status,403);
 A.equal(app.sql.prepare('SELECT version FROM quotes WHERE id=?').get(q.id).version,1);A.equal((await call('me','GET',undefined,head)).data.permissions.costs,false);
});
