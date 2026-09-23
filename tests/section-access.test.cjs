'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),C=require('../core.js'),SA=require('../section-access.js'),I=require('../intake-core.js');
async function harness(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;async function call(route,method='GET',body,session){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}const account=(username,sections)=>({username,name:username,role:'estimator',password:'Only-for-section-tests-42!',sections});const admin=await call('setup','POST',account('admin'));async function user(name,sections){assert.equal((await call('users','POST',account(name,sections),admin)).status,201);return call('login','POST',account(name));}const created=await call('quotes','POST',{document:P.demoSeed()},admin),id=created.data.id;async function read(){return (await call('quotes/'+id,'GET',undefined,admin)).data;}return {app,call,admin,user,id,read};}
test('section API: permitted edits persist; forged edits to other sections and raw API bypass rejected',async t=>{
 const h=await harness(t),op=await h.user('operations',['operations']),mat=await h.user('materials',['materials']),log=await h.user('logistics',['logistics']);
 let q=await h.read();q.document.quote.products[0].ops[0].amount=2;assert.equal((await h.call('quotes/'+h.id,'PUT',{document:q.document,expectedVersion:q.version},op)).status,200);
 q=await h.read();q.document.quote.customer='Unauthorized';assert.equal((await h.call('quotes/'+h.id,'PUT',{document:q.document,expectedVersion:q.version},op)).status,403);
 q=await h.read();q.document.quote.pricing.profit=88;assert.equal((await h.call('quotes/'+h.id,'PUT',{document:q.document,expectedVersion:q.version},op)).status,403);
 q=await h.read();const rows=I.priceRows(q.document);I.applyMaterialPrices(q.document,rows.map(r=>({key:r.key,value:12345})));const mr=await h.call('quotes/'+h.id,'PUT',{document:q.document,expectedVersion:q.version},mat);assert.equal(mr.status,200,JSON.stringify(mr.data));
 q=await h.read();q.document.quote.pricing.delivery=1234;assert.equal((await h.call('quotes/'+h.id,'PUT',{document:q.document,expectedVersion:q.version},log)).status,200);
 q=await h.read();q.document.quote.products[0].qty=99;assert.equal((await h.call('quotes/'+h.id,'PUT',{document:q.document,expectedVersion:q.version},mat)).status,403);
 assert.equal((await h.call('quotes','POST',{document:P.demoSeed()},op)).status,403);
 assert.equal((await h.call('quotes/'+h.id+'/reopen','POST',{expectedVersion:q.version,reason:'bypass'},op)).status,403);
 assert.equal((await h.call('intake/customers','POST',{customer:{}},op)).status,403);
 assert.equal((await h.call('users','GET',undefined,op)).status,403);
});
test('section API: catalog publishers limited by part; stale saves, invalid grants and revoked sessions rejected',async t=>{
 const h=await harness(t),u=await h.user('catalog',['catalogMaterials']);let master=(await h.call('catalog','GET',undefined,u)).data;master.catalog.materials[0].price=33333;
 let r=await h.call('catalog','PUT',{expectedVersion:master.version,catalog:master.catalog},u);assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.pending,true);assert.equal((await h.call('catalog','GET',undefined,h.admin)).data.version,master.version);const approval=await h.call('catalog/proposals/'+r.data.proposalId+'/approve','POST',{},h.admin);assert.equal(approval.status,200,JSON.stringify(approval.data));
 assert.equal((await h.call('catalog','PUT',{expectedVersion:master.version,catalog:master.catalog},u)).status,409);
 master=(await h.call('catalog','GET',undefined,u)).data;master.catalog.rates[0].inside=45678;assert.equal((await h.call('catalog','PUT',{expectedVersion:master.version,catalog:master.catalog},u)).status,403);
 assert.equal((await h.call('users','POST',{username:'bad',name:'bad',role:'estimator',password:'Only-for-section-tests-42!',sections:['anything']},h.admin)).status,400);
 const accounts=(await h.call('users','GET',undefined,h.admin)).data,target=accounts.find(x=>x.username==='catalog');assert.equal((await h.call('users/'+target.id+'/access','POST',{role:'estimator',sections:[]},h.admin)).status,200);assert.equal((await h.call('me','GET',undefined,u)).status,401);
});
test('section API: creator can start an empty quote from catalog, save assigned section and cannot approve',async t=>{
 const h=await harness(t),u=await h.user('creator',['manage','customer','bom']),master=(await h.call('catalog','GET',undefined,u)).data.catalog,d=P.demoSeed();Object.assign(d,master);d.quote.id='NEW-SECTION';d.quote.products=[];d.quote.pricing=master.pricingDefaults;d.quote.ratesSnapshot=master.rates;
 const r=await h.call('quotes','POST',{document:d},u);assert.equal(r.status,201,JSON.stringify(r.data));assert.equal((await h.call('quotes/'+r.data.id+'/approve','POST',{expectedVersion:r.data.version},u)).status,403);
});
test('section policy: node identity changes, reorder, finishing material price and unknown fields are checked',()=>{
 const a=P.demoSeed(),b=C.copy(a),rights={sections:['materials'],factors:false};I.applyMaterialPrices(b,I.priceRows(b).map(r=>({key:r.key,value:999})));assert.deepEqual(SA.denied(a,b,rights),[]);
 b.quote.products[0].id='changed';assert.ok(SA.denied(a,b,rights).includes('bom'));b.quote.unrecognizedOverride=100;assert.ok(SA.denied(a,b,rights).includes('manage'));
});
test('Railway health host can probe health only; other API routes still validate the host',async t=>{
 const app=createApp({publicOrigin:'https://example.invalid',setupKey:'Only-for-health-tests-123456789'});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));
 const probe=route=>new Promise((resolve,reject)=>{require('node:http').get({host:'127.0.0.1',port:app.server.address().port,path:route,headers:{Host:'healthcheck.railway.app'}},r=>{let text='';r.on('data',x=>text+=x);r.on('end',()=>resolve({status:r.statusCode,data:JSON.parse(text)}));}).on('error',reject);});
 assert.deepEqual(await probe('/healthz'),{status:200,data:{ok:true}});assert.equal((await probe('/api/status')).status,403);
});
test('personal password change checks existing password and revokes every session',async t=>{
 const h=await harness(t),u=await h.user('passwordtest',['materials']);assert.equal((await h.call('me/password','POST',{currentPassword:'wrong',password:'New-long-password-42!'},u)).status,403);
 assert.equal((await h.call('me/password','POST',{currentPassword:'Only-for-section-tests-42!',password:'New-long-password-42!'},u)).status,200);assert.equal((await h.call('me','GET',undefined,u)).status,401);
 assert.equal((await h.call('login','POST',{username:'passwordtest',password:'Only-for-section-tests-42!'})).status,401);assert.equal((await h.call('login','POST',{username:'passwordtest',password:'New-long-password-42!'})).status,200);
});
