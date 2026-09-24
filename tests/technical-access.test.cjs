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
 const child=C.flatten(safe.document.quote.products).find(n=>n.id==='new-material-node');child.materialId='UNPUBLISHED';child.spec.id='UNPUBLISHED';const pending=await call('quotes/'+id,'PUT',{document:safe.document,expectedVersion:safe.version},tech);A.equal(pending.status,200);const draft=(await call('quotes/'+id,'GET',undefined,admin)).data;const item=C.findNode(draft.document.quote.products,child.id);A.equal(item.draftMaterial,true);A.equal(item.spec.price,null);A.equal(item.materialId,'UNPUBLISHED');A.equal((await call('quotes/'+id+'/submit','POST',{expectedVersion:draft.version},admin)).status,422);
 child.materialId=m.id;child.spec.id=m.id;child.spec.price=999;A.equal((await call('quotes/'+id,'PUT',{document:safe.document,expectedVersion:draft.version},tech)).status,403);
});

test('unfinished geometry and missing stock save as technical drafts for admin repair',async t=>{
 const {call,admin,tech,id}=await harness(t),PG=require('../polygon-core.js');const master=(await call('catalog','GET',undefined,admin)).data;master.catalog.shapeDefinitions.push({id:'DRAFT-FOUR',name:'Approved four sides',...PG.preset('interior',4)});A.equal((await call('catalog','PUT',{expectedVersion:master.version,catalog:master.catalog},admin)).status,200);
 const v=(await call('quotes/'+id,'GET',undefined,tech)).data;
 const n=C.flatten(v.document.quote.products).find(n=>n.kind==='material'&&n.spec.shape==='sheet');
 n.spec.shapeDefinition={id:'DRAFT-FOUR',name:'Phôi 4 cạnh',...PG.preset('interior',4)};
 n.spec.props={T:2};n.spec.stockL=0;n.spec.stockW=0;
 n.dims={C1:3746,C2:100,C3:40,C4:2,A1:90};
 const saved=await call('quotes/'+id,'PUT',{document:v.document,expectedVersion:v.version},tech);
 A.equal(saved.status,200,JSON.stringify(saved.data));
 const stored=(await call('quotes/'+id,'GET',undefined,admin)).data;
 A.deepEqual(C.findNode(stored.document.quote.products,n.id).dims,n.dims);
 A.equal(C.findNode(stored.document.quote.products,n.id).spec.stockL,0);
 A.equal(stored.status,'draft');
 A.equal((await call('quotes/'+id+'/handoff/technical','POST',{expectedVersion:stored.version},tech)).status,422);
 const submit=await call('quotes/'+id+'/submit','POST',{expectedVersion:stored.version},admin);
 A.equal(submit.status,422,JSON.stringify(submit.data));
});
test('technical production level saves through API with authoritative hidden coefficient',async t=>{const {call,admin,tech,id}=await harness(t);const m=(await call('catalog','GET',undefined,admin)).data;m.catalog.pricingDefaults.policyTypes={production:[{name:'C6',description:'High precision',multiplier:1.6}]};A.equal((await call('catalog','PUT',{catalog:m.catalog,expectedVersion:m.version},admin)).status,200);const choices=await call('operation-catalog','GET',undefined,tech);A.deepEqual(choices.data.productionLevels,[{name:'C6',description:'High precision'}]);const v=(await call('quotes/'+id,'GET',undefined,tech)).data;v.document.quote.products[0].productionLevelChoice='C6';const saved=await call('quotes/'+id,'PUT',{document:v.document,expectedVersion:v.version},tech);A.equal(saved.status,200,JSON.stringify(saved.data));const full=(await call('quotes/'+id,'GET',undefined,admin)).data;A.equal(full.document.quote.products[0].productionSpecialPercent,60);A.equal((await call('quotes/'+id,'GET',undefined,tech)).data.document.quote.products[0].productionSpecialPercent,undefined);});

test('reopen then technical edit retains prices entered for draft materials and all commercial sections',async t=>{
 const {app,call,admin,tech,id}=await harness(t);
 const before=(await call('quotes/'+id,'GET',undefined,admin)).data;
 for(const [i,n] of C.flatten(before.document.quote.products).filter(n=>n.kind==='material').entries()){n.draftMaterial=true;n.spec.price=83000+i;n.spec.priceSelection={supplier:'nv-002',at:'2026-09-23',price:n.spec.price};n.spec.costSource={sourcePrice:n.spec.price,evidence:'Supplier quotation'};}
 const written=await call('quotes/'+id,'PUT',{document:before.document,expectedVersion:before.version},admin);A.equal(written.status,200,JSON.stringify(written.data));
 const baseline=(await call('quotes/'+id,'GET',undefined,admin)).data;
 app.sql.prepare("UPDATE quotes SET status='submitted' WHERE id=?").run(id);
 const reopened=await call('quotes/'+id+'/reopen','POST',{expectedVersion:baseline.version,reason:'Adjust technical quantities only'},admin);A.equal(reopened.status,200,JSON.stringify(reopened.data));
 const draft=(await call('quotes/'+id,'GET',undefined,admin)).data;A.deepEqual(draft.document.quote.products,baseline.document.quote.products);
 const view=(await call('quotes/'+id,'GET',undefined,tech)).data;view.document.quote.products[0].qty++;
 const saved=await call('quotes/'+id,'PUT',{document:view.document,expectedVersion:view.version},tech);A.equal(saved.status,200,JSON.stringify(saved.data));
 const after=(await call('quotes/'+id,'GET',undefined,admin)).data;
 for(const n of C.flatten(baseline.document.quote.products).filter(n=>n.kind==='material'))A.deepEqual(C.findNode(after.document.quote.products,n.id).spec,n.spec);
 for(const key of ['pricing','vat','outputTax','expenses','ratesSnapshot'])A.deepEqual(after.document.quote[key],baseline.document.quote[key],key);
 A.equal(after.document.quote.products[0].qty,baseline.document.quote.products[0].qty+1);
 const revision=(await call('quotes/'+id+'/revision/'+baseline.version,'GET',undefined,admin)).data;A.deepEqual(revision.document.quote.products,baseline.document.quote.products);
});
