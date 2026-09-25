'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
async function fixture(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;async function call(path,method='GET',body){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}session=await call('setup','POST',{username:'admin',name:'Admin',password:'Corrections-2026!'});const admin=session;await call('users','POST',{username:'worker',name:'Worker',role:'estimator',canReopen:false,password:'Corrections-2026!'});const worker=await call('login','POST',{username:'worker',password:'Corrections-2026!'});session=admin;return {call,set:s=>session=s,admin,worker};}
test('submitted correction requires approver, limits edit scope, keeps quote identity and prior revisions',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;
 let r=await call(path+'/submit','POST',{expectedVersion:q.version});assert.equal(r.status,200,JSON.stringify(r.data));let version=r.data.version;
 f.set(f.worker);assert.equal((await call(path+'/reopen','POST',{expectedVersion:version,reason:'Bypass'})).status,403);
 r=await call(path+'/corrections','POST',{action:'request',expectedVersion:version,sections:['commercial'],reason:'Sửa ghi chú khách hàng'});assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.status,'pending');
 let review=(await call(path+'/corrections')).data.items[0];assert.equal((await call(path+'/corrections','POST',{action:'approve',id:review.id,expectedVersion:version})).status,403);
 f.set(f.admin);assert.ok((await call('notifications')).data.items.some(n=>n.stage==='correction'));
 r=await call(path+'/corrections','POST',{action:'approve',id:review.id,expectedVersion:version});assert.equal(r.status,200,JSON.stringify(r.data));version=r.data.version;
 assert.equal((await call(path)).data.status,'draft');assert.equal((await call(path+'/revision/2')).data.status,'submitted');
 const current=(await call(path)).data.document;current.quote.project='Unauthorized field';assert.equal((await call(path,'PUT',{expectedVersion:version,document:current})).status,403);
 current.quote.project=d.quote.project;current.quote.notes='Nội dung đã sửa';r=await call(path,'PUT',{expectedVersion:version,document:current});assert.equal(r.status,200,JSON.stringify(r.data));version=r.data.version;
 r=await call(path+'/submit','POST',{expectedVersion:version});assert.equal(r.status,200,JSON.stringify(r.data));assert.equal((await call(path+'/corrections')).data.items[0].status,'completed');
 assert.notEqual((await call(path+'/revision/2')).data.document.quote.notes,'Nội dung đã sửa');
});
test('own stage may reopen before downstream work, later requires request, approval and reconfirmation',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;let version=q.version;
 f.set(f.worker);let r=await call(path+'/handoff/technical','POST',{expectedVersion:version});assert.equal(r.status,200,JSON.stringify(r.data));
 r=await call(path+'/handoff/technical/reopen','POST',{expectedVersion:version,reason:'Own work'});assert.equal(r.status,200,JSON.stringify(r.data));
 assert.equal((await call(path+'/handoff/technical','POST',{expectedVersion:version})).status,200);
 f.set(f.admin);assert.equal((await call(path+'/handoff/materials','POST',{expectedVersion:version})).status,200);
 f.set(f.worker);assert.equal((await call(path+'/handoff/technical/reopen','POST',{expectedVersion:version,reason:'Downstream started'})).status,403);
 r=await call(path+'/corrections','POST',{action:'request',expectedVersion:version,sections:['bom'],reason:'Đổi kích thước'});assert.equal(r.status,200);assert.equal(r.data.status,'pending');
 const item=(await call(path+'/corrections')).data.items[0];f.set(f.admin);r=await call(path+'/corrections','POST',{action:'approve',id:item.id,expectedVersion:version});assert.equal(r.status,200,JSON.stringify(r.data));
 assert.equal((await call(path+'/submit','POST',{expectedVersion:version})).status,409);
 assert.equal((await call(path+'/corrections','POST',{action:'complete',id:item.id,expectedVersion:version})).status,409);
 for(const stage of ['technical','materials'])assert.equal((await call(path+'/handoff/'+stage,'POST',{expectedVersion:version})).status,200);
 assert.equal((await call(path+'/corrections','POST',{action:'complete',id:item.id,expectedVersion:version})).status,200);
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:item.id,expectedVersion:version})).status,409);
});
test('approved snapshot survives correction, invalid requests and stale decisions make no partial writes',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;
 let r=await call(path+'/submit','POST',{expectedVersion:q.version});r=await call(path+'/approve','POST',{expectedVersion:r.data.version,acknowledgeBelowCost:true,reason:'Approve'});assert.equal(r.status,200,JSON.stringify(r.data));const version=r.data.version,old=(await call(path+'/revision/'+version)).data;
 assert.equal((await call(path+'/corrections','POST',{action:'request',expectedVersion:version,sections:['bom'],reason:''})).status,400);
 assert.equal((await call(path+'/corrections','POST',{action:'request',expectedVersion:version-1,sections:['bom'],reason:'Stale'})).status,409);
 r=await call(path+'/corrections','POST',{action:'request',expectedVersion:version,sections:['bom'],reason:'Sửa kích thước'});assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.status,'open');assert.deepEqual((await call(path+'/revision/'+version)).data,old);
 assert.equal((await call(path+'/corrections')).data.items.length,1);
});
test('downstream edits alone require authorization; stale request can be rejected but cannot be approved',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;
 f.set(f.worker);assert.equal((await call(path+'/handoff/technical','POST',{expectedVersion:1})).status,200);
 f.set(f.admin);const current=(await call(path)).data.document;require('../core.js').flatten(current.quote.products).find(n=>n.kind==='material').spec.price+=10;let r=await call(path,'PUT',{document:current,expectedVersion:1});assert.equal(r.status,200);
 f.set(f.worker);assert.equal((await call(path+'/handoff/technical/reopen','POST',{expectedVersion:r.data.version,reason:'Downstream price entered'})).status,403);
 r=await call(path+'/corrections','POST',{action:'request',expectedVersion:2,sections:['bom'],reason:'Need change'});assert.equal(r.data.status,'pending');const item=(await call(path+'/corrections')).data.items[0];
 f.set(f.admin);assert.equal((await call(path,'PUT',{document:current,expectedVersion:2})).status,200);
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:item.id,expectedVersion:3})).status,409);
 assert.equal((await call(path+'/corrections')).data.items[0].status,'pending');
 assert.equal((await call(path+'/corrections','POST',{action:'reject',id:item.id,expectedVersion:3,reason:'Bản đã thay đổi, lập đề nghị mới'})).status,200);
});
