const {test}=require('node:test'),A=require('node:assert/strict'),{groups,compare}=require('../server/reference-norm-controls.cjs');
test('12 production groups compare matching evidence, distinguish unfinished data and protect units',()=>{
 A.equal(groups.filter(g=>g.id!=='other').length,12);
 const j={state:'completed',quantity:10,packet:{product:{name:'A',unit:'bộ'},operations:[{id:'O',rateId:'cut',name:'Cut',outputUnit:'bộ',machineId:'M'}]},progress:{operations:[{id:'O',output:10,handedOverAt:'now'}],qc:{at:'now',passed:9,rejected:1}}};
 const actual={materials:[{materialId:'S',balance:'balanced',inputWeight:100,remnantWeight:20,scrapWeight:5,issued:[{quantity:2,unit:'tấm',length:3000,width:1500,thickness:2}]}],costs:[{entries:[{amount:900}]}],recordedTotal:900},review={rows:[{id:'O',actualHours:5}]};
 const n=(category,quantity,extra={})=>({id:category,version:2,name:category,active:true,category,product:'A',unit:groups.find(g=>g.id===category).unit,outputUnit:groups.find(g=>g.id===category).outputUnit,materialId:'S',operationRateId:'cut',quantity,...extra});
 const norms=[n('loss',4),n('recovery',15),n('material',9),n('nesting',.2,{length:3000,width:1500,thickness:2}),n('routing',1,{sequence:['cut']}),n('time',.4),n('productivity',3),n('labor',1),n('machineHours',1),n('quality',5),n('finance',100),n('consumable',1)];
 const run=()=>compare({norms,j,actual,review}),rows=run(),find=k=>rows.find(r=>r.category===k);
 A.equal(find('loss').actualValue,5);A.equal(find('loss').status,'outside');A.equal(find('recovery').status,'within');
 A.equal(find('material').target,90);A.equal(find('material').actualValue,80);A.equal(find('nesting').status,'provisional');
 A.equal(find('routing').status,'within');A.equal(find('time').target,4);A.equal(find('time').actualValue,5);A.equal(find('productivity').actualValue,2);A.equal(find('productivity').status,'outside');
 for(const k of ['labor','machineHours','consumable'])A.equal(find(k).status,'missing');
 A.equal(find('quality').actualValue,10);A.equal(find('finance').status,'provisional');A.equal(find('finance').target,1000);
 review.rows[0].actualHours=null;A.equal(run().find(r=>r.category==='time').actualValue,null);
 actual.materials[0].balance='pending';A.equal(run().find(r=>r.category==='loss').actualValue,null);
 actual.materials[0].issued[0].width=1200;A.equal(run().find(r=>r.category==='nesting').actualValue,null);
 norms.find(n=>n.category==='routing').sequence=['cut','cut'];A.equal(run().find(r=>r.category==='routing').status,'outside');
 j.progress.qc={};A.equal(run().find(r=>r.category==='quality').actualValue,null);
 norms.forEach(n=>n.product='Other');A.equal(run().length,0);
});

test('control records validate limits, units, catalogue references and preserve restricted history',async t=>{
 const {createApp}=require('../server/app.cjs'),{randomUUID}=require('node:crypto'),app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;
 async function call(p,method='GET',body){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+p,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 session=await call('setup','POST',{username:'admin',name:'Admin',password:'Controls-test-2026!'});const admin=session;
 const choices=(await call('ops/norms')).data,materialId=choices.materials[0].id,operationRateId=choices.operations[0].id;
 const body=g=>({category:g.id,name:g.name,product:'A',quantity:g.percent?0:2,unit:g.unit,outputUnit:g.outputUnit,materialId:g.material?materialId:'',operationRateId:g.operation?operationRateId:'',sequence:g.id==='routing'?[operationRateId,operationRateId]:[],source:'production',evidence:'Batch A',expectedVersion:0});
 const save=b=>call('ops/norm','POST',{...b,requestId:randomUUID()});
 for(const g of groups){const r=await save(body(g));A.equal(r.status,200,JSON.stringify(r.data));}
 const loss=body(groups.find(g=>g.id==='loss'));A.equal((await save({...loss,quantity:101})).status,400);A.equal((await save({...loss,unit:'kg'})).status,400);
 const time=body(groups.find(g=>g.id==='time'));A.equal((await save({...time,operationRateId:'missing'})).status,400);A.equal((await save({...time,machineId:'missing'})).status,400);
 const routing=body(groups.find(g=>g.id==='routing'));A.equal((await save({...routing,sequence:[]})).status,400);A.equal((await save({...routing,sequence:['missing']})).status,400);
 const finance=(await call('ops/norms')).data.rows.find(n=>n.category==='finance');
 A.equal((await save({...body(groups.find(g=>g.id==='other')),id:finance.id,expectedVersion:finance.version})).status,200);
 const d=require('../pricing-core.js').demoSeed(),quote=(await call('quotes','POST',{document:d})).data;
 A.equal((await call('quotes/'+quote.id+'/submit','POST',{expectedVersion:1})).status,200);
 A.equal((await call('quotes/'+quote.id+'/approve','POST',{expectedVersion:2})).status,200);
 const order=(await call('quotes/'+quote.id+'/order','POST',{expectedVersion:3,code:'QA-NORMS'})).data;
 await call('orders/'+order.id+'/confirm','POST',{quoteVersion:3});
 const created=await call('production','POST',{orderId:order.id,productId:d.quote.products[0].id,quantity:1,code:'QA-NORMS'});A.equal(created.status,201,JSON.stringify(created.data));const j=created.data;
 await save({...routing,product:j.packet.product.name,sequence:j.packet.operations.map(o=>o.rateId)});
 await save({...body(groups.find(g=>g.id==='finance')),product:j.packet.product.name});
 const comparison=await call('ops/norms?job='+j.id);A.equal(comparison.status,200,JSON.stringify(comparison.data));A.equal(comparison.data.controls.find(n=>n.category==='routing').status,'within');
 await call('users','POST',{username:'tech',name:'Tech',role:'technical',password:'Controls-test-2026!',actionAccess:{workshop:['view','edit']}});session=await call('login','POST',{username:'tech',password:'Controls-test-2026!'});
 const visible=(await call('ops/norms')).data;A.ok(!visible.groups.some(g=>g.id==='finance'));A.ok(!visible.rows.some(n=>n.category==='finance'));A.equal(visible.rows.find(n=>n.id===finance.id).history.length,0);
 const safe=await call('ops/norms?job='+j.id);A.equal(safe.status,200,JSON.stringify(safe.data));A.ok(!safe.data.controls.some(n=>n.category==='finance'));A.equal(typeof safe.data.controls.find(n=>n.category==='routing').actualValue,'string');A.equal(safe.data.actual.recordedTotal,undefined);
 A.equal((await save(body(groups.find(g=>g.id==='finance')))).status,403);session=admin;
});
