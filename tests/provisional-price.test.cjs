const {test}=require('node:test'),A=require('node:assert/strict'),P=require('../pricing-core.js'),C=require('../core.js'),Costs=require('../cost-input-core.js'),{estimate}=require('../server/provisional-price.cjs'),T=require('../technical-core.js'),{createApp}=require('../server/app.cjs');
test('latest same-code material price is provisional, preserves reviewed prices, detects missing matches and never mutates quote',()=>{
 const d=P.demoSeed(),before=JSON.stringify(d),catalog=structuredClone(d);catalog.materials.forEach(m=>m.price=Number(m.price||0)+1234);
 const r=estimate(d,catalog);A.equal(JSON.stringify(d),before);A.ok(r.sources.some(x=>x.status==='catalog'));const row=Costs.rows(d.quote).find(x=>x.key.startsWith('material:'));
 Costs.apply(d.quote,[{key:row.key,original:87654,status:'excluded'}],'Reviewed source');
 const reviewed=estimate(d,catalog).sources.find(x=>x.key===row.key);A.equal(reviewed.status,'reviewed');A.equal(reviewed.value,87654);
 const quantityCopy=structuredClone(d);quantityCopy.quote.products[0].qty=Number(quantityCopy.quote.products[0].qty||1)*2;A.ok(estimate(quantityCopy,catalog).weight>estimate(d,catalog).weight);
 const other=Costs.rows(d.quote).find(x=>x.key.startsWith('material:')&&x.key!==row.key);A.ok(other);catalog.materials=catalog.materials.filter(m=>m.id!==other.target.id);const incomplete=estimate(d,catalog);A.equal(incomplete.total,null);A.ok(incomplete.missing.length);
});
test('technical new rows inherit latest compatible catalogue prices but existing rows keep commercial snapshots',()=>{
 const d=P.demoSeed(),catalog=structuredClone(d),input=T.project(d),leaf=C.flatten(input.quote.products).find(x=>x.kind==='material');catalog.materials.find(m=>m.id===leaf.materialId).price=76543;
 const copy=C.cloneNode(leaf);input.quote.products[0].children.push(copy);const result=T.merge(d,input,catalog);
 A.equal(C.findNode(result.quote.products,copy.id).spec.price,76543);A.equal(C.findNode(result.quote.products,leaf.id).spec.price,C.findNode(d.quote.products,leaf.id).spec.price);
});
test('saved estimate endpoint is admin-only, follows catalogue updates and does not change quote version',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;let cookie='',csrf='';
 async function call(path,method='GET',body){const r=await fetch(base+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf},body:body?JSON.stringify(body):undefined});const data=await r.json();if(path==='setup'){cookie=r.headers.get('set-cookie').split(';')[0];csrf=data.csrf;}return {status:r.status,data};}
 A.equal((await call('setup','POST',{username:'admin',name:'Admin',password:'Provisional-only-local-42!'})).status,201);
 const created=await call('quotes','POST',{document:P.demoSeed()});A.equal(created.status,201);const id=created.data.id,route='quotes/'+id+'/provisional-price';
 const before=app.sql.prepare('SELECT document,version FROM quotes WHERE id=?').get(id),value=await call(route);A.equal(value.status,200);A.equal(value.data.provisional,true);A.equal(value.data.quoteVersion,before.version);A.deepEqual(app.sql.prepare('SELECT document,version FROM quotes WHERE id=?').get(id),before);
 const master=app.sql.prepare('SELECT document FROM catalog WHERE id=1').get(),changed=JSON.parse(master.document);changed.materials.forEach(m=>m.price=Number(m.price||0)+5000);
 app.sql.prepare('UPDATE catalog SET document=?,version=version+1 WHERE id=1').run(JSON.stringify(changed));
 const updated=await call(route);A.equal(updated.status,200);A.equal(updated.data.catalogVersion,value.data.catalogVersion+1);A.notDeepEqual(updated.data.sources,value.data.sources);A.deepEqual(app.sql.prepare('SELECT document,version FROM quotes WHERE id=?').get(id),before);
 app.sql.prepare("UPDATE users SET role='estimator' WHERE username='admin'").run();A.equal((await call(route)).status,403);
 app.sql.prepare("UPDATE users SET role='technical' WHERE username='admin'").run();A.equal((await call(route)).status,403);
});
