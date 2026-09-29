'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
async function fixture(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;async function call(path,method='GET',body){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}session=await call('setup','POST',{username:'admin',name:'Admin',password:'Corrections-2026!'});const admin=session;await call('users','POST',{username:'worker',name:'Worker',role:'estimator',canReopen:false,password:'Corrections-2026!'});const worker=await call('login','POST',{username:'worker',password:'Corrections-2026!'});session=admin;return {app,call,set:s=>session=s,admin,worker};}

test('draft price edits bypass handoff and narrow corrections while preserving technical confirmation and rights',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;let v=q.version;
 for(const stage of ['intake','technical','materials']){const r=await call(path+'/handoff/'+stage,'POST',{expectedVersion:v});assert.equal(r.status,200,JSON.stringify(r.data));}
 // A pending request must not be required for draft pricing.
 f.set(f.worker);let r=await call(path+'/corrections','POST',{action:'request',expectedVersion:v,sections:['materials'],reason:'Old pending price request'});assert.equal(r.status,200);
 let doc=(await call(path)).data.document;
 doc.quote.pricing.profit=0.21;doc.quote.notes='New offer terms';doc.quote.vat=8;
 const node=require('../core.js').flatten(doc.quote.products).find(n=>n.spec);node.spec.price=12345;doc.quote.ratesSnapshot[0].inside+=100;
 r=await call(path,'PUT',{document:doc,expectedVersion:v,reason:'Điều chỉnh giá'});assert.equal(r.status,200,JSON.stringify(r.data));v=r.data.version;
 const state=(await call(path+'/handoff')).data;assert.equal(state.technical.current,true,'commercial changes must preserve technical confirmation');
 doc=(await call(path)).data.document;assert.equal(require('../core.js').flatten(doc.quote.products).find(n=>n.spec).spec.price,12345);
 doc.quote.products[0].qty++;r=await call(path,'PUT',{document:doc,expectedVersion:v,reason:'Điều chỉnh giá'});assert.equal(r.status,409,'technical changes stay locked');
 // Wrong account cannot acquire pricing rights through the draft exception.
 f.set(f.admin);await call('users','POST',{username:'readonly',name:'Read only',role:'estimator',sections:['commercial'],password:'Corrections-2026!'});const viewer=await call('login','POST',{username:'readonly',password:'Corrections-2026!'});f.set(viewer);assert.equal((await call(path,'PUT',{document:doc,expectedVersion:v,reason:'Điều chỉnh giá'})).status,403);
 f.set(f.admin);r=await call(path+'/submit','POST',{expectedVersion:v});assert.equal(r.status,200,JSON.stringify(r.data));v=r.data.version;
 doc=(await call(path)).data.document;doc.quote.notes='May edit submitted';assert.equal((await call(path,'PUT',{document:doc,expectedVersion:v,reason:'Điều chỉnh giá'})).status,200);
});
test('draft price remains editable within BOM-only correction, and legacy technical evidence is retained',async t=>{
 const f=await fixture(t),{call}=f,d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;let v=q.version;
 let r=await call(path+'/corrections','POST',{action:'request',expectedVersion:v,sections:['bom'],reason:'Loss only'});assert.equal(r.status,200);
 for(const stage of ['intake','technical','materials'])assert.equal((await call(path+'/handoff/'+stage,'POST',{expectedVersion:v})).status,200);
 const row=f.app.sql.prepare('SELECT document FROM quote_handoffs WHERE quote_id=?').get(q.id),handoffs=JSON.parse(row.document),original=(await call(path)).data.document;
 handoffs.technical.signature=require('../server/notifications.cjs').fingerprints(original,true).technical;
 f.app.sql.prepare('UPDATE quote_handoffs SET document=? WHERE quote_id=?').run(JSON.stringify(handoffs),q.id);
 f.set(f.worker);let doc=(await call(path)).data.document;doc.quote.pricing.profit=0.19;doc.quote.ratesSnapshot[0].inside+=200;doc.quote.notes='Offer';
 r=await call(path,'PUT',{document:doc,expectedVersion:v,reason:'Điều chỉnh giá'});assert.equal(r.status,200,JSON.stringify(r.data));assert.equal((await call(path+'/handoff')).data.technical.current,true);
});

test('factor department saves after handoff and pending request, but cannot edit prices or an approved quote',async t=>{
 const f=await fixture(t),{call}=f,SA=require('../section-access.js'),d=P.demoSeed();d.quote.remnantMode='all';
 const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id;let v=q.version;
 for(const stage of ['intake','technical','materials'])assert.equal((await call(path+'/handoff/'+stage,'POST',{expectedVersion:v})).status,200);
 let r=await call('users','POST',{username:'factors',name:'Factors only',role:'estimator',canViewCosts:true,canApprove:false,canEditFactors:true,sectionModes:Object.fromEntries(SA.keys.map(k=>[k,k==='factors'?'configure':'view'])),password:'Corrections-2026!'});assert.equal(r.status,201,JSON.stringify(r.data));
 f.set(await call('login','POST',{username:'factors',password:'Corrections-2026!'}));
 r=await call(path+'/corrections','POST',{action:'request',expectedVersion:v,sections:['factors'],reason:'Legacy pending request'});assert.equal(r.status,200,JSON.stringify(r.data));
 for(const status of ['draft','submitted']){
  // Set only workflow state in this isolated fixture: test the save boundary independently of release prerequisites.
  f.app.sql.prepare('UPDATE quotes SET status=? WHERE id=?').run(status,q.id);
  let doc=(await call(path)).data.document;doc.quote.pricing.overhead+=1;
  r=await call(path,'PUT',{document:doc,expectedVersion:v,reason:'Factor adjustment'});assert.equal(r.status,200,JSON.stringify(r.data));v=r.data.version;
  doc=(await call(path)).data.document;doc.quote.pricing.delivery+=1;
  r=await call(path,'PUT',{document:doc,expectedVersion:v,reason:'Cross-scope write'});assert.equal(r.status,403,JSON.stringify(r.data));
 }
 f.app.sql.prepare("UPDATE quotes SET status='approved' WHERE id=?").run(q.id);
 const doc=(await call(path)).data.document;doc.quote.pricing.overhead+=1;
 r=await call(path,'PUT',{document:doc,expectedVersion:v,reason:'Requires reopening'});assert.equal(r.status,409,JSON.stringify(r.data));
});
