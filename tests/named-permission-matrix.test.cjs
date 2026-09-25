'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),SA=require('../section-access.js');
test('named matrices derive compatible access, combine positions and revoke without granting administrator',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));
 const base='http://127.0.0.1:'+app.server.address().port+'/api/',password='Matrix-position-2026!';
 async function call(path,method='GET',body,session){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password}),modes=extra=>({...Object.fromEntries(SA.keys.map(k=>[k,'none'])),...extra});
 const payload={name:'Chief accountant',permissionModel:'matrix',role:'admin',sectionModes:modes({materials:'view',commercial:'view'}),canViewCosts:true,canApprove:false,canEditFactors:false};
 const accounting=await call('roles','POST',payload,admin);A.equal(accounting.status,201);A.equal(accounting.data.role,'estimator','submitted admin role must not escalate a matrix');
 const technical=await call('roles','POST',{name:'Technical operator',permissionModel:'matrix',sectionModes:modes({bom:'use'}),canViewCosts:false},admin);A.equal(technical.status,201);A.equal(technical.data.role,'technical');
 A.equal((await call('roles','POST',{name:'Invalid price',permissionModel:'matrix',sectionModes:modes({materials:'use'}),canViewCosts:false},admin)).status,400);
 const account=await call('users','POST',{username:'accountant',name:'Accountant',password,roleTemplateIds:[accounting.data.id],followRoleTemplates:true},admin);A.equal(account.status,201);
 let org=(await call('organization','GET',undefined,admin)).data;
 const document={departments:[{id:'dept',name:'Office',active:true,stage:'other'}],positions:[{id:'chief',name:'Chief accountant',departmentId:'dept',active:true,roleIds:[accounting.data.id]},{id:'tech',name:'Technical operator',departmentId:'dept',active:true,roleIds:[technical.data.id]}],employees:org.employees.map(e=>({...e,positionIds:e.userId===account.data.id?['chief','tech']:[]}))};
 A.equal((await call('organization','PUT',{expectedVersion:org.version,document},admin)).status,200);
 let staff=await call('login','POST',{username:'accountant',password});A.equal(staff.data.permissions.users,false);A.equal(staff.data.permissions.approve,false);A.equal(staff.data.permissions.sectionModes.materials,'view');A.equal(staff.data.permissions.sectionModes.bom,'use');A.equal(staff.data.permissions.sections.includes('materials'),false);
 A.equal((await call('roles','POST',payload,staff)).status,403);
 const updated=await call('roles/'+technical.data.id,'PUT',{...technical.data,sectionModes:modes({bom:'view'}),expectedVersion:technical.data.version},admin);A.equal(updated.status,200);A.equal((await call('me','GET',undefined,staff)).status,401);
 staff=await call('login','POST',{username:'accountant',password});A.equal(staff.data.permissions.sectionModes.bom,'view');A.equal(staff.data.permissions.edit,false);
 org=(await call('organization','GET',undefined,admin)).data;document.employees.find(e=>e.userId===account.data.id).positionIds=['tech'];A.equal((await call('organization','PUT',{expectedVersion:org.version,document},admin)).status,200);
 staff=await call('login','POST',{username:'accountant',password});A.equal(staff.data.permissions.costs,false);A.equal(staff.data.permissions.sectionModes.materials,'none');
});
