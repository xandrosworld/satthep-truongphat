'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
async function fixture(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;async function call(path,method='GET',body){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}session=await call('setup','POST',{username:'admin',name:'Admin',password:'Corrections-2026!'});const admin=session;await call('users','POST',{username:'worker',name:'Worker',role:'estimator',canReopen:false,password:'Corrections-2026!'});const worker=await call('login','POST',{username:'worker',password:'Corrections-2026!'});session=admin;return {app,call,set:s=>session=s,admin,worker};}


test('pending price edits keep status, enforce rights, reason, latest revision and approved immutability',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';let q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;
 for(const stage of ['intake','technical','materials'])assert.equal((await call(path+'/handoff/'+stage,'POST',{expectedVersion:q.version})).status,200);
 q=(await call(path+'/submit','POST',{expectedVersion:q.version})).data;const pendingVersion=q.version;
 f.set(f.worker);let doc=(await call(path)).data.document;doc.quote.pricing.management=0;doc.quote.notes='New offer';
 assert.equal((await call(path,'PUT',{document:doc,expectedVersion:q.version})).status,400);
 let r=await call(path,'PUT',{document:doc,expectedVersion:q.version,reason:'Giá điều chỉnh trước duyệt'});assert.equal(r.status,200,JSON.stringify(r.data));q=r.data;assert.equal(q.status,'submitted');
 assert.equal((await call(path+'/handoff')).data.technical.current,true);
 doc=(await call(path)).data.document;doc.quote.products[0].qty++;assert.equal((await call(path,'PUT',{document:doc,expectedVersion:q.version,reason:'Bypass'})).status,409);
 f.set(f.admin);assert.equal((await call(path+'/approve','POST',{expectedVersion:pendingVersion})).status,409);
 assert.equal((await call(path+'/approve','POST',{expectedVersion:q.version})).status,409);
 f.set(f.worker);r=await call(path+'/handoff/materials','POST',{expectedVersion:q.version});assert.equal(r.status,200,JSON.stringify(r.data));
 f.set(f.admin);r=await call(path+'/approve','POST',{expectedVersion:q.version,acknowledgeBelowCost:true,reason:'Reviewed latest'});assert.equal(r.status,200,JSON.stringify(r.data));q=r.data;
 doc=(await call(path)).data.document;doc.quote.notes='Forbidden';assert.equal((await call(path,'PUT',{document:doc,expectedVersion:q.version,reason:'Bypass'})).status,409);
 assert.notEqual((await call(path+'/revision/'+pendingVersion)).data.document.quote.notes,'New offer');
});
test('next department reviews predecessor, denial retains Admin override and downstream confirmations reset',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';
 await call('users','POST',{username:'tech',name:'Technical',role:'estimator',sections:['customer','bom','operations'],canReopen:false,password:'Corrections-2026!'});
 const tech=await call('login','POST',{username:'tech',password:'Corrections-2026!'});f.set(f.admin);
 await call('users','POST',{username:'price',name:'Price',role:'estimator',sections:['materials','factors','commercial'],canReopen:false,password:'Corrections-2026!'});
 const price=await call('login','POST',{username:'price',password:'Corrections-2026!'});f.set(f.admin);
 let q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;
 for(const stage of ['intake','technical','materials'])assert.equal((await call(path+'/handoff/'+stage,'POST',{expectedVersion:q.version})).status,200);
 q=(await call(path+'/submit','POST',{expectedVersion:q.version})).data;
 f.set(tech);let r=await call(path+'/corrections','POST',{action:'request',sections:['bom'],reason:'Đổi quy cách',expectedVersion:q.version});assert.equal(r.data.status,'pending');
 let x=(await call(path+'/corrections')).data.items[0];assert.equal((await call(path+'/corrections','POST',{action:'approve',id:x.id,expectedVersion:q.version})).status,403);
 f.set(price);assert.equal((await call(path+'/corrections')).data.items[0].canReview,true);
 r=await call(path+'/corrections','POST',{action:'reject',id:x.id,reason:'Không thống nhất',expectedVersion:q.version});assert.equal(r.status,200,JSON.stringify(r.data));
 assert.equal((await call(path+'/corrections','POST',{action:'approve',id:x.id,expectedVersion:q.version})).status,403);
 f.set(f.admin);r=await call(path+'/corrections','POST',{action:'approve',id:x.id,expectedVersion:q.version,reason:'Admin cho sửa'});assert.equal(r.status,200,JSON.stringify(r.data));q={...q,version:r.data.version};
 assert.equal((await call(path)).data.status,'draft');let state=(await call(path+'/handoff')).data;assert.equal(state.technical.current,false);assert.equal(state.materials.current,false);assert.equal(state.intake.current,true);
 x=(await call(path+'/corrections')).data.items[0];assert.equal(x.decisions.length,3);
 assert.equal((await call(path+'/submit','POST',{expectedVersion:q.version})).status,409);
 for(const stage of ['technical','materials'])assert.equal((await call(path+'/handoff/'+stage,'POST',{expectedVersion:q.version})).status,200);
 await call(path+'/corrections','POST',{action:'complete',id:x.id,expectedVersion:q.version});
 // Input changes are reviewed by technical, and invalidate both later stages.
 f.set(f.worker);r=await call(path+'/corrections','POST',{action:'request',sections:['customer'],reason:'Đổi đầu vào',expectedVersion:q.version});assert.equal(r.data.status,'pending');
 x=(await call(path+'/corrections')).data.items.find(x=>x.status==='pending');f.set(price);assert.equal((await call(path+'/corrections','POST',{action:'approve',id:x.id,expectedVersion:q.version})).status,403);
 f.set(tech);r=await call(path+'/corrections','POST',{action:'approve',id:x.id,expectedVersion:q.version});assert.equal(r.status,200,JSON.stringify(r.data));state=(await call(path+'/handoff')).data;assert.equal(state.intake.current,false);assert.equal(state.technical.current,false);assert.equal(state.materials.current,false);
});

test('price can directly allow technical correction, but assigned reviewer and approved boundary remain enforced',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';
 await call('users','POST',{username:'reviewprice',name:'Review price',role:'estimator',sections:['materials'],canReopen:false,password:'Corrections-2026!'});
 const price=await call('login','POST',{username:'reviewprice',password:'Corrections-2026!'});f.set(f.admin);
 let q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;
 for(const stage of ['technical','materials'])await call(path+'/handoff/'+stage,'POST',{expectedVersion:q.version});
 f.set(f.worker);await call(path+'/corrections','POST',{action:'request',sections:['bom'],reason:'Technical change',expectedVersion:q.version});let x=(await call(path+'/corrections')).data.items[0];
 const row=f.app.sql.prepare('SELECT document FROM quote_handoffs WHERE quote_id=?').get(q.id),state=JSON.parse(row.document);state.work={materialsId:'someone-else'};f.app.sql.prepare('UPDATE quote_handoffs SET document=? WHERE quote_id=?').run(JSON.stringify(state),q.id);
 f.set(price);assert.equal((await call(path+'/corrections','POST',{action:'approve',id:x.id,expectedVersion:q.version})).status,403);
 delete state.work;f.app.sql.prepare('UPDATE quote_handoffs SET document=? WHERE quote_id=?').run(JSON.stringify(state),q.id);
 let r=await call(path+'/corrections','POST',{action:'approve',id:x.id,expectedVersion:q.version});assert.equal(r.status,200,JSON.stringify(r.data));
 f.set(f.admin);for(const stage of ['technical','materials'])await call(path+'/handoff/'+stage,'POST',{expectedVersion:q.version});q=(await call(path+'/submit','POST',{expectedVersion:q.version})).data;q=(await call(path+'/approve','POST',{expectedVersion:q.version,acknowledgeBelowCost:true,reason:'Approved'})).data;
 f.set(f.worker);r=await call(path+'/corrections','POST',{action:'request',sections:['bom'],reason:'After approval',expectedVersion:q.version});assert.equal(r.status,200);x=(await call(path+'/corrections')).data.items.find(x=>x.status==='pending');f.set(price);assert.equal((await call(path+'/corrections','POST',{action:'approve',id:x.id,expectedVersion:q.version})).status,403);
});
