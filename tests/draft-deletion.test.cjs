'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),C=require('../core.js'),E=require('../shape-expression-core.js');
const password='Formula-permissions-test-42!';
async function harness(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 const call=async(route,method='GET',body,session)=>{const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),raw=await r.json(),data=raw.__formulaProtected?raw.value:raw;return {status:r.status,data,raw,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password});
 const create=async(name,rights={})=>{const body={username:name,name,password,role:'estimator',...rights};const u=await call('users','POST',body,admin);A.equal(u.status,201,JSON.stringify(u.data));return {id:u.data.id,body,session:await call('login','POST',{username:name,password})};};
 const grant=async(u,flags)=>{Object.assign(u.body,flags);const r=await call('users/'+u.id+'/access','POST',u.body,admin);A.equal(r.status,200,JSON.stringify(r.data));u.session=await call('login','POST',{username:u.body.username,password});};
 return {...app,call,admin,create,grant};
}
test('draft deletion is admin-only, versioned, confirmed and retains history',async t=>{
 const {call,admin,create}=await harness(t),u=await create('draft-editor'),tech=await create('draft-tech',{role:'technical'}),doc=P.demoSeed(),made=await call('quotes','POST',{document:doc},admin),id=made.data.id;
 A.equal(made.status,201);const payload={expectedVersion:1,confirmCode:doc.quote.id};
 A.equal((await call('quotes/'+id,'DELETE',payload,u.session)).status,403);
 A.equal((await call('quotes/'+id,'DELETE',{...payload,expectedVersion:99},admin)).status,409);
 A.equal((await call('quotes/'+id,'DELETE',{...payload,confirmCode:'wrong'},admin)).status,400);
 A.equal((await call('quotes','GET',undefined,admin)).data.find(q=>q.id===id).canDelete,true);
 A.equal((await call('quotes/'+id,'DELETE',payload,admin)).status,200);
 for(const session of [admin,u.session,tech.session]){A.ok(!(await call('quotes','GET',undefined,session)).data.some(q=>q.id===id));A.equal((await call('quotes/'+id,'GET',undefined,session)).status,404);}
 A.equal((await call('quotes/'+id,'PUT',{document:doc,expectedVersion:1},admin)).status,404);
 A.equal((await call('quotes/'+id+'/restore','POST',{expectedVersion:1,sourceVersion:1,reason:'old'},admin)).status,404);
 A.equal((await call('quotes/'+id,'DELETE',payload,admin)).status,404);
 const backup=(await call('backup','GET',undefined,admin)).data;A.ok(backup.quotes.some(q=>q.id===id));A.ok(backup.revisions.some(q=>q.id===id));A.ok(backup.quoteDeletions.some(q=>q.id===id));A.ok(backup.audit.some(a=>a.action==='delete-draft'&&a.entity===id));
});
test('submitted, approved and reopened approved quotes cannot be deleted',async t=>{
 const {call,admin}=await harness(t),doc=P.demoSeed(),made=await call('quotes','POST',{document:doc},admin),id=made.data.id;
 A.equal((await call('quotes/'+id+'/submit','POST',{expectedVersion:1},admin)).status,200);
 A.equal((await call('quotes/'+id,'DELETE',{expectedVersion:2,confirmCode:doc.quote.id},admin)).status,409);
 A.equal((await call('quotes/'+id+'/approve','POST',{expectedVersion:2},admin)).status,200);
 A.equal((await call('quotes/'+id,'DELETE',{expectedVersion:3,confirmCode:doc.quote.id},admin)).status,409);
 A.equal((await call('quotes/'+id+'/reopen','POST',{expectedVersion:3,reason:'Revision'},admin)).status,200);
 A.equal((await call('quotes','GET',undefined,admin)).data.find(q=>q.id===id).canDelete,false);
 A.equal((await call('quotes/'+id,'DELETE',{expectedVersion:4,confirmCode:doc.quote.id},admin)).status,409);
});
