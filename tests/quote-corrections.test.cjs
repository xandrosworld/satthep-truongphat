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
 const current=(await call(path)).data.document;current.quote.products[0].qty++;assert.equal((await call(path,'PUT',{expectedVersion:version,document:current})).status,403);
 current.quote.products[0].qty--;current.quote.notes='Nội dung đã sửa';r=await call(path,'PUT',{expectedVersion:version,document:current});assert.equal(r.status,200,JSON.stringify(r.data));version=r.data.version;
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
test('review current revision opens an older request without losing updates; concurrency and rights stay enforced',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;
 await call(path+'/submit','POST',{expectedVersion:1});f.set(f.worker);
 assert.equal((await call(path+'/corrections','POST',{action:'request',expectedVersion:2,sections:['commercial'],reason:'Update notes'})).data.status,'pending');
 const item=(await call(path+'/corrections')).data.items[0];f.set(f.admin);
 const approved=await call(path+'/approve','POST',{expectedVersion:2,acknowledgeBelowCost:true,reason:'Reviewed'});assert.equal(approved.status,200,JSON.stringify(approved.data));
 const version=approved.data.version,snapshot=(await call(path+'/revision/'+version)).data;
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:item.id,expectedVersion:2,reviewedVersion:2})).status,409);
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:item.id,expectedVersion:version})).status,409);
 f.set(f.worker);assert.equal((await call(path+'/corrections','POST',{action:'approve',id:item.id,expectedVersion:version,reviewedVersion:version})).status,403);f.set(f.admin);
 const out=await call(path+'/corrections','POST',{action:'approve',id:item.id,expectedVersion:version,reviewedVersion:version});assert.equal(out.status,200,JSON.stringify(out.data));
 const now=(await call(path)).data;assert.equal(now.status,'draft');for(const key of ['products','pricing','notes','project'])assert.deepEqual(now.document.quote[key],snapshot.document.quote[key]);assert.deepEqual((await call(path+'/revision/'+version)).data,snapshot);
 const opened=(await call(path+'/corrections')).data.items[0];assert.equal(opened.sourceVersion,2);assert.equal(opened.reviewedSourceVersion,version);assert.deepEqual(opened.sections,['commercial']);
 now.document.quote.products[0].qty++;assert.equal((await call(path,'PUT',{expectedVersion:now.version,document:now.document})).status,403);
});
test('extend an open scope only after authorized approval and retain its original sections',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;
 assert.equal((await call(path+'/corrections','POST',{action:'request',expectedVersion:1,sections:['materials'],reason:'Materials'})).status,200);
 f.set(f.worker);let r=await call(path+'/corrections','POST',{action:'request',expectedVersion:1,sections:['factors','logistics'],reason:'Cost factors'});assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.status,'pending');
 let items=(await call(path+'/corrections')).data.items;const pending=items.find(x=>x.status==='pending');assert.deepEqual(items.find(x=>x.status==='open').sections,['materials']);
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:pending.id,expectedVersion:1})).status,403);
 f.set(f.admin);assert.equal((await call(path+'/corrections','POST',{action:'approve',id:pending.id,expectedVersion:1})).status,200);
 items=(await call(path+'/corrections')).data.items;assert.equal(items.filter(x=>x.status==='open').length,1);assert.deepEqual(items.find(x=>x.status==='open').sections,['materials','factors','logistics']);assert.equal(items[0].status,'extended');
 const document=(await call(path)).data.document;document.quote.pricing.overhead=18;document.quote.pricing.incoming=1234;r=await call(path,'PUT',{expectedVersion:1,document});assert.equal(r.status,200,JSON.stringify(r.data));assert.equal((await call(path)).data.document.quote.pricing.overhead,18);
});

test('parallel requesters, explicit reviewers, withdrawal and stale parent scope recover without implicit approval',async t=>{
 const f=await fixture(t),{call}=f;
 await call('users','POST',{username:'price',name:'Pricing',role:'estimator',canReopen:false,sections:['materials','factors','commercial','operations','logistics'],password:'Corrections-2026!'});
 const price=await call('login','POST',{username:'price',password:'Corrections-2026!'});f.set(f.admin);
 const q=(await call('quotes','POST',{document:P.demoSeed()})).data,path='quotes/'+q.id;
 for(const stage of ['intake','technical','materials'])assert.equal((await call(path+'/handoff/'+stage,'POST',{expectedVersion:1})).status,200);
 f.set(price);assert.equal((await call(path+'/corrections','POST',{action:'request',expectedVersion:1,sections:['commercial'],reason:'Old price request'})).status,200);
 const old=(await call(path+'/corrections')).data.items[0];assert.equal(old.canWithdraw,true);assert.equal(old.reviewers.some(u=>u.name==='Pricing'),false);
 f.set(f.worker);assert.equal((await call(path+'/corrections','POST',{action:'request',expectedVersion:1,sections:['bom'],reason:'Technical change'})).status,200);
 let state=(await call(path+'/corrections')).data,tech=state.items[1];assert.equal(tech.reviewers.some(u=>u.name==='Pricing'),true);
 assert.equal((await call(path+'/corrections','POST',{action:'request',expectedVersion:1,sections:['operations'],reason:'Duplicate pending'})).status,409);
 assert.equal((await call(path+'/corrections','POST',{action:'withdraw',id:old.id,expectedVersion:1,reason:'Not mine'})).status,403);
 f.set(price);assert.ok((await call('notifications')).data.items.some(n=>n.stage==='correction'&&n.note.includes('Technical change')&&n.note.includes('Người có quyền xét:')));
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:tech.id,expectedVersion:1})).status,200);
 // Parent was absent when old request was created; require explicit refreshed scope before merging.
 f.set(f.admin);assert.equal((await call(path+'/corrections','POST',{action:'approve',id:old.id,expectedVersion:1})).status,409);
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:old.id,expectedVersion:1,reviewedActiveId:tech.id})).status,200);
 state=(await call(path+'/corrections')).data;assert.equal(state.items.filter(x=>x.status==='open').length,1);assert.deepEqual(state.items.find(x=>x.id===old.id).sections,['bom','commercial']);
 f.set(f.worker);assert.equal((await call(path+'/corrections','POST',{action:'request',expectedVersion:1,sections:['operations'],reason:'Later request'})).status,200);
 const later=(await call(path+'/corrections')).data.items.at(-1);
 assert.equal((await call(path+'/corrections','POST',{action:'withdraw',id:later.id,expectedVersion:1,reason:''})).status,400);
 assert.equal((await call(path+'/corrections','POST',{action:'withdraw',id:later.id,expectedVersion:1,reason:'No longer needed'})).status,200);
 assert.equal((await call(path+'/corrections','POST',{action:'withdraw',id:later.id,expectedVersion:1,reason:'Again'})).status,409);
 assert.equal((await call(path+'/corrections','POST',{action:'request',expectedVersion:1,sections:['operations'],reason:'New scope'})).status,200);
 const pending=(await call(path+'/corrections')).data.items.at(-1);f.set(f.admin);
 for(const stage of ['technical','materials'])assert.equal((await call(path+'/handoff/'+stage,'POST',{expectedVersion:1})).status,200);
 assert.equal((await call(path+'/corrections','POST',{action:'complete',id:old.id,expectedVersion:1})).status,200);
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:pending.id,expectedVersion:1})).status,409);
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:pending.id,expectedVersion:1,reviewedActiveId:null})).status,200);
 assert.deepEqual((await call(path+'/corrections')).data.items.at(-1).sections,['operations']);
});
