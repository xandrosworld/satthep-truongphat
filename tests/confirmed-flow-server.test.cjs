'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),F=require('./tmc-fixture.cjs');
test('API saves new cost sequence and scope; restricted user cannot change sequence; reopen preserves approved historical offer',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));
 const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,session){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const password='QA-confirmed-flow-only-42!',admin=await call('setup','POST',{username:'admin',name:'QA',role:'admin',password});
 const created=await call('quotes','POST',{document:F.seed()},admin);A.equal(created.status,201);const id=created.data.id;
 await call('users','POST',{username:'limited',name:'Limited',role:'estimator',password,sections:['commercial'],canEditFactors:false},admin);
 const limited=await call('login','POST',{username:'limited',password});
 let q=(await call('quotes/'+id,'GET',undefined,admin)).data;P.adoptFlow(q.document.quote);
 const body={document:q.document,expectedVersion:q.version};A.equal((await call('quotes/'+id,'PUT',body,limited)).status,403);
 A.equal((await call('quotes/'+id,'PUT',body,admin)).status,200);
 q=(await call('quotes/'+id,'GET',undefined,admin)).data;const quote=q.document.quote,n=quote.products[0];quote.pricing.selected='competitor';n.competitorPrice=1000;n.benchmarkScope={competitor:{incoming:'included',outgoing:'included',delivery:'detail',install:'detail'}};F.confirm(quote);
 A.equal((await call('quotes/'+id,'PUT',{document:q.document,expectedVersion:q.version},admin)).status,200);
 q=(await call('quotes/'+id,'GET',undefined,admin)).data;A.equal(q.document.quote.pricing.costSequence,P.FLOW_SEQUENCE);A.equal(P.calculate(q.document).total.grand,2311);
 const historyDoc=P.demoSeed();historyDoc.quote.id='QA-HISTORY-1909';delete historyDoc.quote.workspaceKey;
 const historical=await call('quotes','POST',{document:historyDoc},admin);A.equal(historical.status,201);const hid=historical.data.id;
 A.equal((await call('quotes/'+hid+'/submit','POST',{expectedVersion:1},admin)).status,200);
 A.equal((await call('quotes/'+hid+'/approve','POST',{expectedVersion:2},admin)).status,200);
 const saved=(await call('quotes/'+hid+'/revision/3','GET',undefined,admin)).data;A.equal(P.calculate(saved.document).total.grand,7126053);
 A.equal((await call('quotes/'+hid+'/reopen','POST',{expectedVersion:3,reason:'Áp dụng luồng đã chốt'},admin)).status,200);
 const reopened=(await call('quotes/'+hid,'GET',undefined,admin)).data;P.adoptFlow(reopened.document.quote);
 A.equal((await call('quotes/'+hid,'PUT',{document:reopened.document,expectedVersion:reopened.version},admin)).status,200);
 A.deepEqual((await call('quotes/'+hid+'/revision/3','GET',undefined,admin)).data,saved);
 const stale=await call('quotes/'+id,'PUT',body,admin);A.equal(stale.status,409);
});
