'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),C=require('../core.js'),T=require('../technical-core.js');
async function harness(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 const call=async(route,method='GET',body,session)=>{const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const account={username:'admin',name:'QA',password:'Technical-tests-only-42!'},admin=await call('setup','POST',account),d=P.demoSeed();d.quote.products[0].ops[0].unitPrice=987654321;d.quote.products[0].ops[0].pricingMethod='direct';d.quote.products[0].ops[0].priceUnit='kg';
 const created=await call('quotes','POST',{document:d},admin);A.equal(created.status,201);
 A.equal((await call('users','POST',{...account,username:'technical',role:'technical',canViewCosts:true,canApprove:true,sections:['bom','operations','commercial']},admin)).status,201);
 const tech=await call('login','POST',{...account,username:'technical'});return {app,call,admin,tech,id:created.data.id};
}
test('technical API: no prices in list/read/save; hidden commercial data survives technical edits',async t=>{const h=await harness(t),{call,admin,tech,id}=h;
 A.equal(tech.data.permissions.costs,false);A.equal(tech.data.permissions.approve,false);A.equal(tech.data.permissions.sections.includes('commercial'),false);
 const list=await call('quotes','GET',undefined,tech);A.equal(list.status,200);A.equal(Object.hasOwn(list.data[0],'total'),false);
 const before=(await call('quotes/'+id,'GET',undefined,admin)).data,view=(await call('quotes/'+id,'GET',undefined,tech)).data;
 A.equal(JSON.stringify(view).includes('987654321'),false);A.equal(view.document.quote.products[0].ops[0].unitPrice,0);A.equal(view.document.materials[0].price,0);
 view.document.quote.products[0].ops[0].amount=3;view.document.quote.products[0].qty=12;
 const saved=await call('quotes/'+id,'PUT',{document:view.document,expectedVersion:view.version},tech);A.equal(saved.status,200,JSON.stringify(saved.data));A.equal(saved.data.total,undefined);A.equal(saved.data.errors,undefined);
 const after=(await call('quotes/'+id,'GET',undefined,admin)).data;A.equal(after.document.quote.products[0].ops[0].unitPrice,987654321);A.equal(after.document.quote.products[0].ops[0].amount,3);A.equal(after.document.quote.products[0].qty,12);A.deepEqual(after.document.quote.pricing,before.document.quote.pricing);A.deepEqual(after.document.quote.ratesSnapshot,before.document.quote.ratesSnapshot);A.deepEqual(after.document.materials,before.document.materials);
 A.equal((await call('quotes/'+id,'PUT',{document:view.document,expectedVersion:view.version},tech)).status,409);
 for(const route of ['catalog','orders','backup','audit','quotes/'+id+'/revisions','quotes/'+id+'/revision/1','quotes/'+id+'/commercial','intake/customers'])A.equal((await call(route,'GET',undefined,tech)).status,403,route);
});
test('technical API rejects forged prices, other sections and locked documents',async t=>{const h=await harness(t),{call,admin,tech,id}=h;
 const read=async()=>(await call('quotes/'+id,'GET',undefined,tech)).data;
 for(const change of [d=>d.quote.pricing.profit=99,d=>d.quote.products[0].ops[0].unitPrice=1,d=>d.quote.products[0].spec={price:1},d=>d.quote.customer='Unauthorized',d=>d.materials[0].price=9]){const v=await read();change(v.document);A.equal((await call('quotes/'+id,'PUT',{document:v.document,expectedVersion:v.version},tech)).status,403);}
 for(const action of ['submit','approve','reopen','restore','order'])A.equal((await call('quotes/'+id+'/'+action,'POST',{},tech)).status,403);
 A.equal((await call('quotes','POST',{document:P.demoSeed()},tech)).status,403);
 const view=await read();h.app.sql.prepare("UPDATE quotes SET status='submitted' WHERE id=?").run(id);
 A.equal((await call('quotes/'+id,'PUT',{document:view.document,expectedVersion:view.version},tech)).status,409);
});
test('technical merge is pure and rejects extra fields; material replacement takes authoritative prices',()=>{const d=P.demoSeed(),snapshot=JSON.stringify(d),v=T.project(d);v.quote.products[0].qty++;
 const result=T.merge(d,v);A.equal(JSON.stringify(d),snapshot);A.equal(result.quote.products[0].qty,d.quote.products[0].qty+1);
 const target=C.flatten(v.quote.products).find(n=>n.kind==='material'),replacement=d.materials.find(m=>m.id!==target.materialId&&m.shape==='sheet');target.materialId=replacement.id;target.spec=T.project({...d,quote:{...d.quote,products:[{...target,spec:replacement}]}}).quote.products[0].spec;
 A.equal(C.findNode(T.merge(d,v).quote.products,target.id).spec.price,replacement.price);
 const rate=v.quote.ratesSnapshot.find(r=>r.consumption);if(rate){rate.consumption.norm=0.25;const merged=T.merge(d,v).quote.ratesSnapshot.find(r=>r.id===rate.id),old=d.quote.ratesSnapshot.find(r=>r.id===rate.id);A.equal(merged.consumption.norm,0.25);A.equal(merged.consumption.spec.price,old.consumption.spec.price);A.equal(merged.inside,old.inside);}
 v.quote.secretPrice=123;A.throws(()=>T.merge(d,v),/không được phép/);
});
test('technical projection preserves geometry and selected work units without the chosen prices',()=>{
 const d=P.demoSeed(),op=d.quote.products[0].ops[0],rate=d.quote.ratesSnapshot.find(r=>r.id===op.id);
 rate.priceOptions=[{id:'opt-qa-area',name:'QA area',method:'catalog',inside:98765,outside:76543,insideUnit:'m²',outsideUnit:'m²'}];require('../work-core.js').setPriceOption(d.quote,op.id,'opt-qa-area');
 const view=T.project(d),before=P.calculate(d),after=P.calculate(view),id=d.quote.products[0].id;
 A.equal(after.total.weight,before.total.weight);A.equal(after.nodes[id].ownOps[0].unit,'m²');A.equal(after.nodes[id].ownOps[0].basis,before.nodes[id].ownOps[0].basis);A.equal(after.nodes[id].ownOps[0].rate,0);A.deepEqual(T.project(view),view);
 A.deepEqual(T.merge(d,view).quote.ratesSnapshot,d.quote.ratesSnapshot);
});

test('technical saves newly published material into older quote without exposing or overwriting prices',async t=>{
 const {call,admin,tech,id}=await harness(t),old=(await call('quotes/'+id,'GET',undefined,admin)).data;
 const master=(await call('catalog','GET',undefined,admin)).data,m={...C.copy(master.catalog.materials[0]),id:'VT-NEW',price:45678};master.catalog.materials.push(m);
 A.equal((await call('catalog','PUT',{catalog:master.catalog,expectedVersion:master.version},admin)).status,200);
 const view=(await call('quotes/'+id,'GET',undefined,tech)).data,n=C.copy(view.document.quote.products[0].children.find(n=>n.kind==='material'));
 n.id='new-material-node';n.materialId=m.id;n.spec={...T.project({...old.document,materials:[m]}).materials[0]};n.ops=[];view.document.quote.products[0].children.push(n);
 const saved=await call('quotes/'+id,'PUT',{document:view.document,expectedVersion:view.version},tech);A.equal(saved.status,200,JSON.stringify(saved.data));
 const full=(await call('quotes/'+id,'GET',undefined,admin)).data;A.equal(C.flatten(full.document.quote.products).find(n=>n.id==='new-material-node').spec.price,45678);A.deepEqual(full.document.materials,old.document.materials);
 const safe=(await call('quotes/'+id,'GET',undefined,tech)).data;A.equal(C.flatten(safe.document.quote.products).find(n=>n.id==='new-material-node').spec.price,0);
 const child=C.flatten(safe.document.quote.products).find(n=>n.id==='new-material-node');child.materialId='UNPUBLISHED';child.spec.id='UNPUBLISHED';A.equal((await call('quotes/'+id,'PUT',{document:safe.document,expectedVersion:safe.version},tech)).status,403);
 child.materialId=m.id;child.spec.id=m.id;child.spec.price=999;A.equal((await call('quotes/'+id,'PUT',{document:safe.document,expectedVersion:safe.version},tech)).status,403);
});
