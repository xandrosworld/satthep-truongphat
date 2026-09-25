'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),AA=require('../action-access.js'),SA=require('../section-access.js'),{createApp}=require('../server/app.cjs');
const modes=Object.fromEntries(SA.keys.map(k=>[k,'none']));
const blank={role:'sales',sectionModes:modes,actionAccess:{},...Object.fromEntries(require('../role-access.js').flags.map(k=>[k,false]))};
const accountActions={accounts:['view','create','edit','delete','activate','assign']};
test('delegated readers have independent governance access and cannot mutate or export',async t=>{
 const {call,role,user}=await fixture(t),r=await role('Readers',{accounts:['view'],roles:['view'],organization:['view'],formulaLocks:['view'],audit:['view'],backup:['view']}),u=await user('reader',[r]);
 for(const route of ['users','roles','organization','formulas/locks','access-review','access-history','audit-search'])assert.equal((await call(route,'GET',undefined,u)).status,200,route);
 for(const [route,method] of [['users','POST'],['roles','POST'],['organization','PUT'],['formulas/locks','POST'],['backup','GET'],['quotes','GET']])assert.equal((await call(route,method,method==='GET'?undefined:{},u)).status,403,route);
 assert.equal(u.data.permissions.users,false);assert.equal(u.data.permissions.costs,false);
});
test('delegated account manager cannot escalate through defaults, legacy roles, flags, self or admin',async t=>{
 const {app,call,admin,role,user,password}=await fixture(t),r=await role('Account manager',accountActions),u=await user('manager',[r]);
 const body={...blank,username:'newaccount',name:'New account',password};
 const created=await call('users','POST',body,u);assert.equal(created.status,201,JSON.stringify(created.data));const id=created.data.id;
 assert.equal((await call('users/'+id+'/profile','POST',{username:'newaccount',name:'Updated'},u)).status,200);
 assert.equal((await call('users/'+id+'/disable','POST',{},u)).status,200);
 assert.equal((await call('users/'+id+'/enable','POST',{},u)).status,200);
 assert.equal((await call('users/'+id+'/password','POST',{password:password+'new'},u)).status,200);
 for(const extra of [{role:'admin'},{actionAccess:null},{actionAccess:{quotes:['view']}},{sectionModes:{...modes,commercial:'configure'}},{canFormulaUse:true},{canViewCosts:true},{workRoles:{sales:'manager'}}]){
  const response=await call('users/'+id+'/access','POST',{...blank,...extra},u);assert.equal(response.status,403,JSON.stringify(extra)+' '+JSON.stringify(response.data));
 }
 const missing={...blank,username:'defaults',name:'Defaults',password};delete missing.canFormulaUse;assert.equal((await call('users','POST',missing,u)).status,403);
 for(const target of [u.id,admin.data.user.id])for(const action of ['disable','password','access','profile','delete'])assert.equal((await call('users/'+target+'/'+action,'POST',{...blank,password,username:'hijack',name:'Hijack',confirmUsername:'admin'},u)).status,403,target+'/'+action);
 assert.equal((await call('users/'+id+'/access','POST',blank,u)).status,200);
 assert.deepEqual(JSON.parse(app.sql.prepare('SELECT action_access FROM users WHERE id=?').get(id).action_access),{});
 assert.equal((await call('backup','GET',undefined,u)).status,403);
 assert.equal((await call('users/'+id+'/delete','POST',{confirmUsername:'newaccount'},u)).status,200);
});
test('role delegation preserves ceiling and rolls back self-bound template edits',async t=>{
 const {call,admin,role,user}=await fixture(t),actions={roles:['view','create','edit','delete'],personnel:['view']},r=await role('Role manager',actions),u=await user('rolemanager',[r]);
 let created=await call('roles','POST',{...blank,name:'HR reader',permissionModel:'matrix',actionAccess:{personnel:['view']}},u);assert.equal(created.status,201,JSON.stringify(created.data));let d=created.data;
 assert.equal((await call('roles/'+d.id,'PUT',{...d,name:'HR updated',expectedVersion:d.version},u)).status,200);
 assert.equal((await call('roles','POST',{...blank,name:'Escalate',actionAccess:{accounts:['view','create']}},u)).status,403);
 assert.equal((await call('roles/'+r.id,'PUT',{...r,name:'Self rename',expectedVersion:r.version},u)).status,403);
 assert.equal((await call('roles','GET',undefined,admin)).data.find(x=>x.id===r.id).name,r.name);
 assert.equal((await call('roles/'+d.id,'DELETE',{expectedVersion:2},u)).status,200);
 assert.equal((await call('me','GET',undefined,u)).status,200);
});
test('organization delegation permits structure edits but prevents elevated positions and self changes',async t=>{
 const {call,admin,role,user}=await fixture(t),r=await role('Organization manager',{organization:['view','edit']}),u=await user('orgmanager',[r]),elevated=await role('Elevated',{accounts:['view']});
 let d=(await call('organization','GET',undefined,u)).data;d.departments.push({id:'dep',name:'Department',stage:'other'});
 let response=await call('organization','PUT',{expectedVersion:d.version,document:d},u);assert.equal(response.status,200,JSON.stringify(response.data));
 d=(await call('organization','GET',undefined,u)).data;d.positions.push({id:'elevated',name:'Elevated position',departmentId:'dep',roleIds:[elevated.id]});
 assert.equal((await call('organization','PUT',{expectedVersion:d.version,document:d},u)).status,403);
 d=(await call('organization','GET',undefined,u)).data;d.employees.find(e=>e.userId===u.id).active=false;
 assert.equal((await call('organization','PUT',{expectedVersion:d.version,document:d},u)).status,403);
 d=(await call('organization','GET',undefined,u)).data;d.employees.find(e=>e.userId===admin.data.user.id).name='Changed';
 assert.equal((await call('organization','PUT',{expectedVersion:d.version,document:d},u)).status,403);
});
test('explicit backup and formula lock privileges do not grant quote editing or account management',async t=>{
 const {call,admin,role,user}=await fixture(t),r=await role('Data custodian',{backup:['view','export'],formulaLocks:['view','edit']}),u=await user('custodian',[r]);
 const data=await call('backup','GET',undefined,u);assert.equal(data.status,200,JSON.stringify(data.data));assert.ok(data.data.users.length);assert.ok(data.data.users.every(x=>!Object.hasOwn(x,'password')&&!Object.hasOwn(x,'token')));
 const rows=(await call('formulas/locks','GET',undefined,u)).data;const lock=rows.find(x=>x.key==='calculationFactors:all');assert.ok(lock);
 const response=await call('formulas/locks','POST',{key:lock.key,expectedVersion:lock.version,locked:true,reason:'Lock verified factors'},u);assert.equal(response.status,200,JSON.stringify(response.data));
 assert.equal((await call('formulas/locks','GET',undefined,admin)).data.find(x=>x.key===lock.key).locked,1);
 for(const route of ['users','quotes','roles','audit-search'])assert.equal((await call(route,'GET',undefined,u)).status,403,route);
});
test('delegated role edits cannot change a stronger bound account and failed edits are atomic',async t=>{
 const {call,admin,role,user}=await fixture(t),r=await role('Role editor',{roles:['view','edit'],personnel:['view']}),u=await user('limitededitor',[r]),low=await role('Low',{personnel:['view']}),high=await role('High',{backup:['view','export']});await user('combined',[low,high]);
 const result=await call('roles/'+low.id,'PUT',{...low,name:'Forbidden rename',expectedVersion:low.version},u);assert.equal(result.status,403,JSON.stringify(result.data));
 const saved=(await call('roles','GET',undefined,admin)).data.find(x=>x.id===low.id);assert.equal(saved.name,low.name);assert.equal(saved.version,low.version);
});
test('governance permissions inherited from multiple positions revoke with removed position',async t=>{
 const {call,admin,role,user,password}=await fixture(t),a=await role('Accounts reader',{accounts:['view']}),b=await role('Audit reader',{audit:['view']}),u=await user('positionmanager',[a]);
 let d=(await call('organization','GET',undefined,admin)).data;d.departments.push({id:'dep',name:'Department',stage:'other'});d.positions.push({id:'accounts',name:'Accounts',departmentId:'dep',roleIds:[a.id]},{id:'audit',name:'Audit',departmentId:'dep',roleIds:[b.id]});d.employees.find(e=>e.userId===u.id).positionIds=['accounts','audit'];assert.equal((await call('organization','PUT',{expectedVersion:d.version,document:d},admin)).status,200);
 let s=await call('login','POST',{username:'positionmanager',password});for(const path of ['users','audit-search'])assert.equal((await call(path,'GET',undefined,s)).status,200);
 d=(await call('organization','GET',undefined,admin)).data;d.employees.find(e=>e.userId===u.id).positionIds=['accounts'];assert.equal((await call('organization','PUT',{expectedVersion:d.version,document:d},admin)).status,200);assert.equal((await call('me','GET',undefined,s)).status,401);
 s=await call('login','POST',{username:'positionmanager',password});assert.equal((await call('users','GET',undefined,s)).status,200);assert.equal((await call('audit-search','GET',undefined,s)).status,403);
});
async function fixture(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port,password='Action-access-test-2026!';async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}const admin=await call('setup','POST',{username:'admin',name:'Admin',password});const role=async(name,actions,extra={})=>{const r=await call('roles','POST',{name,permissionModel:'matrix',sectionModes:modes,actionAccess:actions,...extra},admin);assert.equal(r.status,201,JSON.stringify(r.data));return r.data;};const user=async(name,roles)=>{const r=await call('users','POST',{username:name,name,password,roleTemplateIds:roles.map(r=>r.id),followRoleTemplates:true},admin);assert.equal(r.status,201,JSON.stringify(r.data));const s=await call('login','POST',{username:name,password});assert.equal(s.status,200,JSON.stringify(s.data));return {...s,id:r.data.id};};return {app,call,admin,role,user,password};}
