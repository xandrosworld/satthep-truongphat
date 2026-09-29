const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs');
test('one personnel source: approved profile, placement, account, payroll and company capacity',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port,password='Personnel-source-2026!';
 async function call(route,method='GET',body,s=admin){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password},null);
 const org=async()=>(await call('organization')).data,hr=async()=>(await call('personnel')).data;
 async function submit(employee,employeeId){const d=await hr(),r=await call('personnel/submit','POST',{expectedVersion:d.version,employee,employeeId});A.equal(r.status,200,JSON.stringify(r.data));return (await hr()).requests.at(-1);}
 async function approve(r){const d=await hr();return call('personnel/review','POST',{expectedVersion:d.version,id:r.id,action:'approve'});}
 const role=(await call('roles','POST',{name:'Technical employee',role:'technical',sections:['bom','operations'],canFormulaUse:true,canFormulaView:true})).data;
 let d=await org();d.departments.push({id:'technical',name:'Technical',active:true,stage:'technical'});d.positions.push({id:'worker',name:'Worker',departmentId:'technical',active:true,manager:false,roleIds:[role.id]});A.equal((await call('organization','PUT',{expectedVersion:d.version,document:d})).status,200);
 A.equal((await call('users','POST',{username:'bypass',name:'Bypass',role:'technical',password})).status,409);
 const person={code:'NV-SOURCE',name:'Canonical person',email:'person@example.test',phone:'0123',active:true,positionIds:[],profile:{f17_2:'Private ID'},workHistory:[]};
 const r=await submit(person);A.ok(!(await org()).employees.some(e=>e.id===r.employeeId));
 d=await org();d.employees.push({...person,id:r.employeeId});A.equal((await call('organization','PUT',{expectedVersion:d.version,document:d})).status,409);
 A.equal((await call('users','POST',{employeeId:r.employeeId,username:'pending',password})).status,409);
 A.equal((await approve(r)).status,200);d=await org();let e=d.employees.find(e=>e.id===r.employeeId);A.ok(e,'approval preserves request employee ID');A.equal(e.profile.f17_2,'Private ID');
 for(const change of [{name:'Bypassed name'},{profile:{}},{active:false}]){const altered=structuredClone(d);Object.assign(altered.employees.find(x=>x.id===e.id),change);A.equal((await call('organization','PUT',{expectedVersion:d.version,document:altered})).status,409);}
 const deleted=structuredClone(d);deleted.employees=deleted.employees.filter(x=>x.id!==e.id);A.equal((await call('organization','PUT',{expectedVersion:d.version,document:deleted})).status,409);
 e.positionIds=['worker'];A.equal((await call('organization','PUT',{expectedVersion:d.version,document:d})).status,200);
 const created=await call('users','POST',{employeeId:e.id,username:'canonical',name:'Ignored name',password});A.equal(created.status,201,JSON.stringify(created.data));A.equal(created.data.name,person.name);A.equal((await call('users','POST',{employeeId:e.id,username:'duplicate',password})).status,409);
 const login=await call('login','POST',{username:'canonical',password},null);A.equal(login.status,200);A.equal(login.data.permissions.costs,false);
 A.equal((await call('users/'+created.data.id+'/profile','POST',{username:'canonical',name:'Bypass'})).status,409);
 e=(await hr()).employees.find(x=>x.id===e.id);const update=await submit({...e,name:'Approved new name'},e.id);A.equal((await org()).employees.find(x=>x.id===e.id).name,person.name);A.equal((await approve(update)).status,200);A.equal((await call('users')).data.find(x=>x.id===created.data.id).name,'Approved new name');
 const capacity=(await call('business/profile')).data;const row=capacity.staff.find(x=>x.id==='worker');A.equal(row.count,'1');A.equal(row.position,'Worker');A.ok(!JSON.stringify(capacity).includes('Private ID'));
 const companySave=await call('business/profile','POST',{expectedVersion:capacity.version,document:{...capacity,staff:[{department:'Fake',position:'Fake',count:'999',qualification:'Fake'}]}});A.equal(companySave.status,200,JSON.stringify(companySave.data));A.equal(companySave.data.staff.find(x=>x.id==='worker').count,'1');A.ok(!companySave.data.staff.some(x=>x.department==='Fake'));
 const payroll=(await call('enterprise/attendance')).data;A.ok(payroll.people.some(x=>x.id===e.id&&x.name==='Approved new name'));
 // Two new pending profiles cannot both claim the same employee code at approval.
 const one=await submit({...person,code:'DUP',name:'One'}),two=await submit({...person,code:'DUP',name:'Two'});A.equal((await approve(one)).status,200);A.equal((await approve(two)).status,409);
});
