'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('multiple custom roles combine explicit grants and enforce department delegation',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));
 const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const password='Multi-roles-local-2026!',admin=await call('setup','POST',{username:'admin',name:'Admin',password});
 const role=async d=>{const r=await call('roles','POST',d,admin);A.equal(r.status,201,JSON.stringify(r.data));return r.data;};
 const tech=await role({name:'Kỹ thuật',role:'technical',sections:['bom','operations'],workRoles:{technical:'member'}});
 const head=await role({name:'Phụ trách kỹ thuật',role:'technical',sections:['bom','operations'],workRoles:{technical:'manager'}});
 const pricing=await role({name:'Giá',role:'estimator',sections:['materials'],canViewCosts:true,workRoles:{materials:'member'}});
 const create=async(name,ids)=>{const r=await call('users','POST',{username:name,name,password,roleTemplateIds:ids},admin);A.equal(r.status,201,JSON.stringify(r.data));return r.data.id;};
 const manager=await create('manager',[head.id,tech.id]),worker=await create('worker',[tech.id]),dual=await create('dual',[tech.id,pricing.id]);
 let m=await call('login','POST',{username:'manager',password}),d=await call('login','POST',{username:'dual',password});
 A.equal(m.data.permissions.costs,false);A.equal(m.data.permissions.approve,false);A.equal(m.data.permissions.users,false);
 A.equal(d.data.permissions.costs,true);A.equal(d.data.permissions.approve,false);A.equal(d.data.permissions.users,false);A.equal(d.data.permissions.factors,false);A.deepEqual(d.data.permissions.sections,['bom','operations','materials']);
 const q=(await call('quotes','POST',{document:P.demoSeed()},admin)).data,root='quotes/'+q.id;
 const choices=(await call(root+'/work','GET',undefined,m)).data;A.equal(choices.canEdit,true);A.ok(choices.candidates.technical.some(u=>u.id===worker));A.equal(choices.candidates.materials.length,0);
 A.equal((await call(root+'/work','PUT',{technicalId:worker,materialsId:null,status:'not-started',expectedRevision:0},m)).status,200);
 A.equal((await call('users/'+worker+'/access','POST',{roleTemplateIds:[head.id]},m)).status,403);
 A.equal((await call('roles/'+pricing.id,'DELETE',{expectedVersion:1},admin)).status,409,'secondary role cannot be deleted');
 const oldTeams=(await call('work-teams','GET',undefined,admin)).data;
 A.equal((await call('users/'+manager+'/access','POST',{roleTemplateIds:[tech.id]},admin)).status,200);A.equal((await call('me','GET',undefined,m)).status,401);A.equal((await call('work-teams','PUT',{expectedVersion:oldTeams.version,teams:oldTeams.teams},admin)).status,409);m=await call('login','POST',{username:'manager',password});A.equal((await call(root+'/work','GET',undefined,m)).data.canEdit,false);
 A.equal((await call('users/'+dual+'/access','POST',{roleTemplateIds:[tech.id]},admin)).status,200);d=await call('login','POST',{username:'dual',password});A.equal(d.data.permissions.costs,false);A.equal(d.data.permissions.sections.includes('materials'),false);
 const users=(await call('users','GET',undefined,admin)).data;A.deepEqual(JSON.parse(users.find(u=>u.id===dual).role_template_ids),[tech.id]);A.equal(JSON.parse(users.find(u=>u.id===manager).work_roles).technical,'member');
 const backup=(await call('backup','GET',undefined,admin)).data;A.ok(backup.users.find(u=>u.id===worker).role_template_ids);
 A.equal((await call('users','POST',{username:'bad',name:'Bad',password,roleTemplateIds:'invalid'},admin)).status,400);
 A.equal((await call('roles','POST',{name:'Bad work role',role:'technical',sections:['bom'],workRoles:{technical:'admin'}},admin)).status,400);
});
