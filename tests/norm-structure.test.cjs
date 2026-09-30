const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs'),loss=require('../server/norm-loss-comparison.cjs');
test('loss compares calculated snapshots; missing/unbalanced observations are never zero',()=>{
 const j={state:'running',packet:{materials:[{material:{id:'steel'},planned:{purchasedWeight:100,reusableWeight:10},dimensions:{weight:80}}]}},m={materialId:'steel',quoteLossPercent:12,balance:'balanced',inputWeight:100,actualLossPercent:15};
 let r=loss(j,{materials:[m]})[0];A.equal(r.nestingPercent,10);A.equal(r.delta,5);A.match(r.state,/tạm thời/);m.balance='pending';A.equal(loss(j,{materials:[m]})[0].actualPercent,null);j.packet.materials[0].planned={};A.equal(loss(j,{materials:[m]})[0].nestingPercent,null);
});
test('spending limits have separate finance authority, validity and history; production requires operation',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;
 const call=async(path,method='GET',body,s=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Norm-test-2026!'});
 const save=(b,s)=>call('ops/norm','POST',{requestId:randomUUID(),...b},s),b={category:'spending',name:'Travel policy',expenseType:'travel',product:'All departments',quantity:500000,unit:'VND',outputUnit:'người/ngày',effectiveFrom:'2026-10-01',source:'production',evidence:'Approved policy 01',expectedVersion:0};
 A.equal((await save({...b,effectiveFrom:'2026-02-30'})).status,400);A.equal((await save({...b,effectiveTo:'2026-09-01'})).status,400);A.equal((await save({...b,outputUnit:'bộ'})).status,400);
 for(const [username,actionAccess] of [['accountant',{finance:['view','approve']}],['reader',{finance:['view']}],['tech',{workshop:['view','edit']}]])await require('./helpers/personnel-user.cjs')(call,admin,{username,name:username,role:'technical',password:'Norm-test-2026!',actionAccess},{direct:true});
 const login=username=>call('login','POST',{username,password:'Norm-test-2026!'}),accountant=await login('accountant'),reader=await login('reader'),tech=await login('tech');
 let r=await save(b,accountant);A.equal(r.status,200,JSON.stringify(r.data));const n=r.data;
 A.equal((await save({...b,id:n.id,expectedVersion:1,quantity:600000},accountant)).status,200);A.equal((await save(b,reader)).status,403);A.equal((await save(b,tech)).status,403);
 const view=(await call('ops/norms','GET',undefined,reader)).data;A.equal(view.rows.find(x=>x.id===n.id).history.length,1);A.equal(view.rights.spendingEdit,false);A.deepEqual(view.groups.map(g=>g.id),['spending']);A.equal(view.jobs.length,0);A.ok(!(await call('ops/norms','GET',undefined,tech)).data.rows.some(x=>x.category==='spending'));
 A.equal((await save({...b,id:n.id,expectedVersion:2,category:'other',unit:'kg'})).status,400);
 const choices=(await call('ops/norms')).data,op=choices.operations[0].id,production={...b,category:'electricity',product:'Product',unit:'kWh',outputUnit:'bộ'};
 A.equal((await save(production)).status,400);A.equal((await save({...production,operationRateId:op})).status,200);A.equal((await save({...production,category:'consumable'})).status,400);
 A.equal((await save({...production,category:'loss',materialId:choices.materials[0].id,quantity:2,unit:'%',outputUnit:'kg đầu vào'})).status,400);
});
