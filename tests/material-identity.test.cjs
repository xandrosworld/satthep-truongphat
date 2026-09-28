'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),I=require('../server/material-identity.cjs'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('identity excludes blank dimensions but distinguishes grade and fixed section',()=>{
 A.equal(I.different({shape:'sheet',props:{L:100,T:2}},{shape:'sheet',props:{L:3000,T:2}}),false);
 A.equal(I.different({shape:'sheet',grade:'SUS304',props:{T:2}},{shape:'sheet',grade:'CT3',props:{T:2}}),true);
 A.equal(I.different({shape:'box',props:{W:20,T:2}},{shape:'box',props:{W:40,T:2}}),true);
});
test('conflicting production identity is blocked and admin repair preserves engineering and source revision',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;
 const call=async(path,method='GET',body)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 session=await call('setup','POST',{username:'admin',name:'Admin',password:'Identity-test-2026!'});
 const d=P.demoSeed(),q=(await call('quotes','POST',{document:d})).data;await call('quotes/'+q.id+'/submit','POST',{expectedVersion:1});await call('quotes/'+q.id+'/approve','POST',{expectedVersion:2});const o=(await call('quotes/'+q.id+'/order','POST',{expectedVersion:3,code:'IDENTITY'})).data;await call('orders/'+o.id+'/confirm','POST',{quoteVersion:3});let j=(await call('production','POST',{orderId:o.id,productId:d.quote.products[0].id,quantity:1,code:'IDENTITY-01'})).data;
 A.ok(j.packet,JSON.stringify(j));const m=j.packet.materials.find(m=>m.material.shape==='sheet'),oldId=m.material.id,cat=app.sql.prepare('SELECT * FROM catalog WHERE id=1').get(),catalog=JSON.parse(cat.document),c=catalog.materials.find(x=>x.id===oldId);c.props.T=99;c.substance='Different metal';app.sql.prepare('UPDATE catalog SET document=? WHERE id=1').run(JSON.stringify(catalog));
 const original=app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=3').get(q.id).document;
 j=(await call('production/'+j.id)).data;A.ok(j.materialIdentity.conflicts.some(c=>c.materialId===oldId));
 A.throws(()=>I.guard(app.sql,j.packet,(status,message)=>{throw Error(message);}),/khác quy cách/);
 const body={expectedVersion:j.version,catalogVersion:cat.version};
 A.equal((await call('production/'+j.id+'/material-identity','POST',{...body,expectedVersion:0})).status,409);
 app.sql.prepare('INSERT INTO ops_records VALUES(?,?,?,?)').run('hold','test-hold',1,JSON.stringify({jobId:j.id,state:'reserved'}));
 A.equal((await call('production/'+j.id+'/material-identity','POST',body)).status,409);app.sql.prepare("DELETE FROM ops_records WHERE kind='hold' AND id='test-hold'").run();
 const r=await call('production/'+j.id+'/material-identity','POST',body);A.equal(r.status,200,JSON.stringify(r.data));const newId=r.data.mappings.find(m=>m.oldId===oldId).newId;
 const fixed=(await call('production/'+j.id)).data;A.equal(fixed.materialIdentity.conflicts.length,0);A.deepEqual(fixed.packet.operations,j.packet.operations);A.deepEqual(fixed.progress,j.progress);
 const row=fixed.packet.materials.find(x=>x.id===m.id);A.equal(row.material.id,newId);A.deepEqual(row.properties,m.properties);A.deepEqual(row.dimensions,m.dimensions);A.equal(row.material.name,m.material.name);
 A.equal(app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=3').get(q.id).document,original);
 const fresh=JSON.parse(app.sql.prepare('SELECT document FROM catalog WHERE id=1').get().document);A.equal(fresh.materials.find(x=>x.id===oldId).props.T,99);A.equal(fresh.materials.find(x=>x.id===newId).props.T,m.properties.T);
 const source=JSON.parse(app.sql.prepare("SELECT document FROM ops_records WHERE kind='production-source' AND id=?").get(j.id).document),recomputed=require('../server/production.cjs').packet(source);A.equal(recomputed.materials.find(x=>x.id===m.id).material.id,newId);A.deepEqual(recomputed.materials.find(x=>x.id===m.id).dimensions,m.dimensions);
 A.equal((await call('production/'+j.id+'/material-identity','POST',body)).status,409);
});
