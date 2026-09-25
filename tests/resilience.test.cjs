'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),{randomUUID}=require('node:crypto');
async function fixture(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;
 const call=async(route,method='GET',body,s=session)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+route,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};session=await call('setup','POST',{username:'admin',name:'QA',password:'Resilience-only-2026!'});return {app,call,session};}
test('simultaneous quotation saves admit one writer; approval snapshot cannot be mutated by stale saves',async t=>{
 const {app,call}=await fixture(t),d=P.demoSeed(),q=(await call('quotes','POST',{document:d})).data;
 await call('users','POST',{username:'writer',name:'Writer',role:'estimator',password:'Resilience-only-2026!'});const second=await call('login','POST',{username:'writer',password:'Resilience-only-2026!'});
 const rs=await Promise.all(Array.from({length:12},(_,i)=>call('quotes/'+q.id,'PUT',{expectedVersion:1,document:{...d,quote:{...d.quote,project:'Writer '+i}}},i%2?second:undefined)));
 A.equal(rs.filter(r=>r.status===200).length,1);A.equal(rs.filter(r=>r.status===409).length,11);A.equal(app.sql.prepare('SELECT COUNT(*) n FROM revisions WHERE id=?').get(q.id).n,2);
 A.equal((await call('quotes/'+q.id+'/submit','POST',{expectedVersion:2})).status,200);A.equal((await call('quotes/'+q.id+'/approve','POST',{expectedVersion:3})).status,200);
 const approved=app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=4').get(q.id).document;
 A.equal((await call('quotes/'+q.id,'PUT',{expectedVersion:4,document:d})).status,409);A.equal(app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=4').get(q.id).document,approved);
});
test('concurrent receipt retries post once, reject changed payload, overpayment and revoked permission',async t=>{
 const {app,call,session}=await fixture(t),today=require('../completion-core.js').todayVN();app.sql.prepare('INSERT INTO intake_customers VALUES(?,?,?)').run('qa',1,JSON.stringify({id:'qa',name:'QA'}));
 const c=await call('business/contracts','POST',{expectedVersion:0,document:{code:'HD-QA',customerId:'qa',value:1000,status:'active',signDate:today,startDate:today,dueDate:today}});A.equal(c.status,200,JSON.stringify(c.data));
 const body={contractId:c.data.id,expectedVersion:c.data.version,requestId:randomUUID(),amount:400,date:today,reference:'PT-QA'};
 const rs=await Promise.all(Array.from({length:12},()=>call('business/payments','POST',body)));A.ok(rs.every(r=>r.status===200));A.equal(new Set(rs.map(r=>r.data.id)).size,1);
 A.equal((await call('business/payments','POST',{...body,amount:401})).status,409);
 const fresh=(await call('business/contracts/'+c.data.id)).data;
 A.equal((await call('business/payments','POST',{...body,requestId:randomUUID(),reference:'PT-OVER',expectedVersion:fresh.version,amount:601})).status,400);
 A.equal(app.sql.prepare("SELECT COUNT(*) n FROM business_records WHERE kind='payment'").get().n,1);
 const u=(await call('users','POST',{username:'cashier',name:'Cashier',role:'sales',password:'Resilience-only-2026!'})).data;
 app.sql.prepare('UPDATE users SET action_access=? WHERE id=?').run(JSON.stringify({payments:['view','create']}),u.id);const s=await call('login','POST',{username:'cashier',password:'Resilience-only-2026!'});
 app.sql.prepare('UPDATE users SET action_access=? WHERE id=?').run(JSON.stringify({payments:['view']}),u.id);A.equal((await call('business/payments','POST',body,s)).status,403);
 A.equal((await call('backup','GET',undefined,s)).status,403);A.equal((await call('quotes','GET',undefined,null)).status,401);
});
test('shared quotation list refreshes after writes and never shares per-user delete permissions',async t=>{
 const {app,call}=await fixture(t),d=P.demoSeed(),q=(await call('quotes','POST',{document:d})).data;
 const u=(await call('users','POST',{username:'maker',name:'Maker',role:'estimator',password:'Resilience-only-2026!'})).data,s=await call('login','POST',{username:'maker',password:'Resilience-only-2026!'});
 A.equal((await call('quotes')).data.find(x=>x.id===q.id).canDelete,true);
 A.equal((await call('quotes','GET',undefined,s)).data.find(x=>x.id===q.id).canDelete,false);
 const next=structuredClone(d);next.quote.project='Updated while list cached';A.equal((await call('quotes/'+q.id,'PUT',{expectedVersion:1,document:next})).status,200);
 A.equal((await call('quotes','GET',undefined,s)).data.find(x=>x.id===q.id).project,next.quote.project);
 app.sql.prepare('UPDATE users SET role=? WHERE id=?').run('technical',u.id);
 const technical=(await call('quotes','GET',undefined,s)).data.find(x=>x.id===q.id);A.equal(technical.total,undefined);A.equal(technical.canDelete,undefined);
});
