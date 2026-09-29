'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('permission source switches preserve direct rights and survive organization updates',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port,password='Organization-test-2026!';
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password});const users={};for(const name of ['head','worker','outside'])users[name]=(await call('users','POST',{username:name,name,role:'technical',sections:['bom','operations'],password},admin)).data;
 const login=name=>call('login','POST',{username:name,password});let head=await login('head');A.equal((await call('organization','GET',undefined,head)).status,403);
 const role=async(name,role,sections,canViewCosts=false)=>(await call('roles','POST',{name,role,sections,canViewCosts,canFormulaUse:true,canFormulaView:true},admin)).data;
 const tech=await role('Technical','technical',['bom','operations']),price=await role('Pricing','estimator',['materials'],true);
 let state=(await call('organization','GET',undefined,admin)).data;A.equal(state.employees.length,4);A.ok(state.employees.every(e=>!e.managed));A.equal((await call('me','GET',undefined,head)).status,200,'migration does not revoke sessions');
 const doc={departments:[{id:'a',name:'Technical A',stage:'technical',active:true},{id:'b',name:'Technical B',stage:'technical',active:true},{id:'p',name:'Price',stage:'materials',active:true}],positions:[{id:'ha',name:'Head',departmentId:'a',manager:true,roleIds:[tech.id],active:true},{id:'wa',name:'Worker',departmentId:'a',manager:false,roleIds:[tech.id],active:true},{id:'wb',name:'Worker',departmentId:'b',manager:false,roleIds:[tech.id],active:true},{id:'pr',name:'Pricing',departmentId:'p',manager:false,roleIds:[price.id],active:true}],employees:state.employees.map(e=>({...e,positionIds:e.userId===users.head.id?['ha']:e.userId===users.worker.id?['wa']:e.userId===users.outside.id?['wb']:[]}))};
 async function save(d=doc,extra={}){const r=await call('organization','PUT',{expectedVersion:state.version,document:d,...extra},admin);if(r.status===200)state=(await call('organization','GET',undefined,admin)).data;return r;}
 A.equal((await save()).status,200);A.equal((await call('me','GET',undefined,head)).status,401);head=await login('head');
 A.equal((await call('organization','PUT',{expectedVersion:0,document:doc},admin)).status,409);
 const employee=state.employees.find(e=>e.userId===users.worker.id),route='organization/permission-source';
 A.equal((await call(route,'POST',{employeeId:employee.id,source:'direct',expectedVersion:state.version},head)).status,403);
 A.equal((await call(route,'POST',{employeeId:employee.id,source:'bad',expectedVersion:state.version},admin)).status,400);
 A.equal((await call(route,'POST',{employeeId:employee.id,source:'direct',expectedVersion:0},admin)).status,409);
 let res=await call(route,'POST',{employeeId:employee.id,source:'direct',expectedVersion:state.version},admin);A.equal(res.status,200,JSON.stringify(res.data));state=(await call('organization','GET',undefined,admin)).data;
 A.equal(state.employees.find(e=>e.id===employee.id).managed,false);A.equal(app.sql.prepare('SELECT follow_role_templates FROM users WHERE id=?').get(users.worker.id).follow_role_templates,0);
 A.equal((await save(state)).status,200);A.equal(state.employees.find(e=>e.id===employee.id).managed,false,'ordinary org save must not turn position rights back on');
 A.equal((await call('users/'+users.worker.id+'/access','POST',{role:'technical',sections:['bom'],technicalDelegation:true},admin)).status,200);
 res=await call(route,'POST',{employeeId:employee.id,source:'position',expectedVersion:state.version},admin);A.equal(res.status,200,JSON.stringify(res.data));state=(await call('organization','GET',undefined,admin)).data;
 A.equal(state.employees.find(e=>e.id===employee.id).managed,true);A.ok(JSON.parse(app.sql.prepare('SELECT section_access FROM users WHERE id=?').get(users.worker.id).section_access).operations);
 const adminEmployee=state.employees.find(e=>e.userId===admin.data.user.id);A.equal((await call(route,'POST',{employeeId:adminEmployee.id,source:'position',expectedVersion:state.version},admin)).status,400);
});
