const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs');
test('personnel profiles require review, restrict sensitive data, preserve history and activate separately',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const password='Personnel-test-2026!',admin=await call('setup','POST',{username:'admin',name:'Admin',password}),worker=(await call('users','POST',{username:'hrworker',name:'HR worker',role:'sales',password},admin)).data,hr=await call('login','POST',{username:'hrworker',password});
 A.equal((await call('personnel','GET',undefined,hr)).status,403);let d=(await call('personnel','GET',undefined,admin)).data;
 const role=(await call('roles','POST',{name:'Sales personnel',role:'sales',sections:['commercial']},admin)).data;
 d.departments.push({id:'dep',name:'HR',stage:'other',active:true});d.positions.push({id:'pos',name:'Employee',departmentId:'dep',roleIds:[role.id],active:true});A.equal((await call('organization','PUT',{expectedVersion:d.version,document:d},admin)).status,200);
 d=(await call('personnel','GET',undefined,admin)).data;A.equal((await call('personnel/editors','POST',{expectedVersion:d.version,ids:[worker.id]},admin)).status,200);
 async function post(route,b,s=hr){d=(await call('personnel','GET',undefined,admin)).data;return call('personnel/'+route,'POST',{expectedVersion:d.version,...b},s);}
 const employee={code:'NV-TEST',name:'Person Test',email:'person@example.test',phone:'',positionIds:['pos'],active:true,startDate:'2026-09-25',profile:{f17_2:'ID test',f97_8:'Private health note'},workHistory:[{from:'2020-01-01',to:'2021-01-01',department:'Old company'}]};
 A.equal((await post('submit',{employee:{...employee,startDate:'2026-02-30'}})).status,400);
 A.equal((await post('submit',{employee})).status,200);d=(await call('personnel','GET',undefined,admin)).data;A.equal(d.employees.some(e=>e.code==='NV-TEST'),false);const request=d.requests.at(-1);
 A.equal((await post('review',{id:request.id,action:'approve'})).status,403);A.equal((await post('review',{id:request.id,action:'approve'},admin)).status,200);
 d=(await call('personnel','GET',undefined,admin)).data;let e=d.employees.find(e=>e.code==='NV-TEST');A.equal(e.profile.f97_8,'Private health note');A.equal(e.userId,null);
 A.equal((await post('activation',{employeeId:e.id})).status,200);A.equal((await post('activation',{employeeId:e.id})).status,409);d=(await call('personnel','GET',undefined,admin)).data;const activation=d.requests.at(-1);
 A.equal((await post('review',{id:activation.id,action:'approve',username:'newperson',password},admin)).status,200);A.equal((await call('login','POST',{username:'newperson',password})).status,200);
 d=(await call('personnel','GET',undefined,admin)).data;e=d.employees.find(e=>e.code==='NV-TEST');A.equal((await post('submit',{employeeId:e.id,employee:{...e,name:'Changed'}})).status,200);d=(await call('personnel','GET',undefined,admin)).data;A.equal(d.employees.find(x=>x.id===e.id).name,'Person Test');const update=d.requests.at(-1);A.equal((await post('review',{id:update.id,action:'reject',reason:'Check name'},admin)).status,200);
 d=(await call('personnel','GET',undefined,admin)).data;A.equal(d.employees.find(x=>x.id===e.id).name,'Person Test');A.equal(d.requests.find(r=>r.id===update.id).reason,'Check name');
 A.equal((await post('editors',{ids:[]},admin)).status,200);A.equal((await call('personnel','GET',undefined,hr)).status,403);A.ok(app.sql.prepare('SELECT COUNT(*) n FROM organization_revisions').get().n>5);
});
