const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs'),{resolve}=require('../server/production-norm-source.cjs');
test('norm source requires exact scope, respects machine specificity and rejects ambiguity',()=>{
 const j={packet:{product:{name:'Product'}}},o={rateId:'cut',outputUnit:'piece'},n={id:'a',version:1,active:true,category:'machineHours',product:'Product',operationRateId:'cut',outputUnit:'piece',quantity:.5,unit:'giờ máy'};
 A.equal(resolve([n],j,o,'M').suggestion.id,'a');A.equal(resolve([n],j,o,'').suggestion,null);A.equal(resolve([n,{...n,id:'b'}],j,o,'M').suggestion,null);
 A.equal(resolve([n,{...n,id:'b',machineId:'M'}],j,o,'M').suggestion.id,'b');A.equal(resolve([{...n,outputUnit:'kg'}],j,o,'M').suggestion,null);A.equal(resolve([{...n,product:'Other'}],j,o,'M').suggestion,null);
});
test('review references preserve provenance; proposals verify versions and remain separate until approved',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;
 const call=async(path,method='GET',body,s=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Norm-test-2026!'});const d=require('../pricing-core.js').demoSeed(),q=(await call('quotes','POST',{document:d})).data;await call('quotes/'+q.id+'/submit','POST',{expectedVersion:1});await call('quotes/'+q.id+'/approve','POST',{expectedVersion:2});const order=(await call('quotes/'+q.id+'/order','POST',{expectedVersion:3,code:'NORM-ORDER'})).data;await call('orders/'+order.id+'/confirm','POST',{quoteVersion:3});const j=(await call('production','POST',{orderId:order.id,productId:d.quote.products[0].id,quantity:1,code:'NORM-JOB'})).data,o=j.packet.operations[0];
 const post=(b,s)=>call('ops/norm','POST',{requestId:randomUUID(),...b},s),body={category:'time',name:'Measured time',quantity:.5,unit:'giờ',outputUnit:o.outputUnit,product:j.packet.product.name,operationRateId:o.rateId,source:'production',evidence:'Signed measurement',expectedVersion:0};const n=(await post(body)).data;
 let r=(await call('production/'+j.id+'/review-tables')).data;A.equal(r.rows[0].suggestedNorm.version,1);A.equal(r.rows[0].standardHours,null);
 const ops=j.packet.operations.map(x=>({...x,machine:x.machine||'Manual',lossPercent:0,workQuantity:x.workQuantity||1,unit:x.unit||'lần',standardHours:x.id===o.id?.5:.25,...(x.id===o.id?{standardNormId:n.id,standardNormVersion:1}:{standardNormBasis:'Initial workshop observation'})}));
 const plan=operations=>call('production/'+j.id+'/flow/plan','POST',{expectedVersion:j.version,reason:'Complete missing norms',operations});
 r=await plan(ops);A.equal(r.status,200,JSON.stringify(r.data));A.equal(r.data.operations[0].standardNormStatus,'reference');A.match(r.data.operations[0].standardNormBasis,/v1/);A.equal(r.data.operations[1].standardNormStatus,'provisional');A.equal((await call('production/'+j.id)).data.packet.operations[0].standardHours,undefined);
 await post({...body,id:n.id,expectedVersion:1,quantity:.6});A.equal((await plan(ops)).status,409);
 // Effective equipment in the dossier drives review, not a stale empty machine field.
 const m=(await call('ops/master','POST',{requestId:randomUUID(),kind:'machine',expectedVersion:0,document:{code:'M',name:'Laser',workshop:'A',hoursPerDay:8,hourRate:100}})).data;
 app.sql.prepare('INSERT INTO ops_records VALUES(?,?,?,?)').run('production-dossier',j.id,1,JSON.stringify({equipment:[{operationId:o.id,machineId:m.id,machine:m.name}]}));
 r=(await call('production/'+j.id+'/review-tables')).data;A.equal(r.rows[0].machine,'Laser');A.equal(r.rows[0].suggestedNorm,null);
});
