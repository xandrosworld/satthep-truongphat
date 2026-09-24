'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs');
test('central role bindings update rights and revoke sessions without changing legacy overrides; safe review and history',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port,password='Access-review-2026!';
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password});
 const role=(await call('roles','POST',{name:'Pricing',role:'estimator',sections:['materials'],canViewCosts:true},admin)).data;
 A.equal((await call('roles','POST',{name:'Invalid',role:'estimator',canViewCosts:'false'},admin)).status,400);
 const create=(username,follow)=>call('users','POST',{username,name:username,password,roleTemplateId:role.id,followRoleTemplates:follow},admin);
 const bound=await create('bound',true),legacy=await create('legacy',false);A.equal(bound.status,201);A.equal(legacy.status,201);
 const login=username=>call('login','POST',{username,password});let session=await login('bound'),oldSession=await login('legacy');
 A.equal((await call('users','POST',{username:'missing',name:'Missing',password,followRoleTemplates:true},admin)).status,400);
 A.equal((await call('roles/'+role.id,'PUT',{...role,sections:['logistics'],expectedVersion:role.version},admin)).status,200);
 A.equal((await call('me','GET',undefined,session)).status,401);session=await login('bound');A.deepEqual(session.data.permissions.sections,['logistics']);
 A.deepEqual((await call('me','GET',undefined,oldSession)).data.permissions.sections,['materials'],'legacy individual rights retained');
 // A bound account cannot sneak independent rights into the assignment payload.
 A.equal((await call('users/'+bound.data.id+'/access','POST',{roleTemplateId:role.id,followRoleTemplates:true,role:'admin',canApprove:true,sections:['manage']},admin)).status,200);
 session=await login('bound');A.equal(session.data.permissions.users,false);A.equal(session.data.permissions.approve,false);A.deepEqual(session.data.permissions.sections,['logistics']);
 for(const route of ['access-review','audit-search','access-history'])A.equal((await call(route,'GET',undefined,session)).status,403);
 const review=(await call('access-review','GET',undefined,admin)).data;A.equal(review.users.find(u=>u.id===bound.data.id).binding,'roles');A.equal(review.users.find(u=>u.id===legacy.data.id).binding,'individual');A.deepEqual(review.users.find(u=>u.id===bound.data.id).permissions,session.data.permissions);
 A.ok(!JSON.stringify(review).includes('password'));const history=(await call('access-history','GET',undefined,admin)).data;A.ok(history.rows.some(r=>r.action==='role-access-updated'&&r.entity===bound.data.id));A.ok(history.rows.some(r=>r.action==='update-role'&&r.before.sections.includes('materials')&&r.after.sections.includes('logistics')));A.ok(!JSON.stringify(history).includes(password));A.ok(!JSON.stringify(history).includes('"password"'));
 const ownRole=(await call('roles','POST',{name:'Admin binding',role:'admin',sections:[]},admin)).data;
 A.equal((await call('users/'+admin.data.user.id+'/access','POST',{roleTemplateId:ownRole.id,followRoleTemplates:true},admin)).status,200);const admin2=await login('admin');
 A.equal((await call('roles/'+ownRole.id,'PUT',{...ownRole,role:'sales',canViewCosts:false,expectedVersion:ownRole.version},admin2)).status,409,'self-demotion rolls back whole role update');
 A.equal((await call('roles','GET',undefined,admin2)).data.find(r=>r.id===ownRole.id).version,ownRole.version);
 A.equal((await call('users/'+bound.data.id+'/disable','POST',{},admin2)).status,200);A.equal((await call('me','GET',undefined,session)).status,401);A.equal((await login('bound')).status,401);
 // Audit pagination has no overlap and accepts only bounded, validated filters.
 const add=app.sql.prepare('INSERT INTO audit(at,user_id,action,entity,detail) VALUES(?,?,?,?,?)');for(let i=0;i<120;i++)add.run('2026-09-24T10:00:00.000Z',admin.data.user.id,'review-test','item-'+i,'example');
 const page=(await call('audit-search?action=review-test','GET',undefined,admin2)).data;A.equal(page.rows.length,100);const next=(await call('audit-search?action=review-test&before='+page.nextBefore,'GET',undefined,admin2)).data;A.equal(next.rows.length,20);A.equal(new Set([...page.rows,...next.rows].map(r=>r.seq)).size,120);A.equal(next.nextBefore,null);
 A.equal((await call('audit-search?from=2026-02-30','GET',undefined,admin2)).status,400);A.equal((await call('audit-search?before=invalid','GET',undefined,admin2)).status,400);A.equal((await call('audit-search','DELETE',{},admin2)).status,405);
 const backup=(await call('backup','GET',undefined,admin2)).data;A.ok(backup.accessHistory.length);A.equal(backup.users.find(u=>u.id===bound.data.id).follow_role_templates,1);
});

test('personnel dates, duties and deletion protect identity and history',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 let cookie,csrf;async function call(route,method='GET',body){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie,'X-CSRF-Token':csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();if(route==='setup'){cookie=r.headers.get('set-cookie').split(';')[0];csrf=data.csrf;}return {status:r.status,data};}
 await call('setup','POST',{username:'admin',name:'Admin',password:'Personnel-review-2026!'});let d=(await call('organization')).data;
 async function save(doc){const r=await call('organization','PUT',{expectedVersion:d.version,document:doc});if(r.status===200)d=(await call('organization')).data;return r;}
 const e={id:'person',name:'Person',code:'NV-1',active:true,positionIds:[],startDate:'2026-09-24',endDate:'',duties:'Cutting / assembly'};
 A.equal((await save({...d,employees:[...d.employees,e]})).status,200);A.equal(d.employees.find(x=>x.id===e.id).duties,e.duties);
 for(const changes of [{startDate:'2026-02-30'},{endDate:'2025-01-01'},{duties:'x'.repeat(2001)}])A.equal((await save({...d,employees:d.employees.map(x=>x.id===e.id?{...x,...changes}:x)})).status,400);
 A.equal((await save({...d,employees:d.employees.filter(x=>x.id!==e.id)})).status,200);
 A.equal((await save({...d,employees:[]})).status,409,'cannot delete linked account employee');
});
