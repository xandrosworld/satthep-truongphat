'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('quote list derives approval progress and safe update summaries without inferring customer delivery',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();A.ok(r.ok,JSON.stringify(data));return {data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 session=await call('setup','POST',{username:'admin',name:'Admin',password:'Quote-list-summary-42!'});
 const created=(await call('quotes','POST',{document:P.demoSeed()})).data,id=created.id;
 let row=(await call('quotes')).data.find(x=>x.id===id);A.equal(row.updateSummary,'Tạo báo giá');
 const q=(await call('quotes/'+id)).data;q.document.quote.pricing.delivery+=765432;
 await call('quotes/'+id,'PUT',{document:q.document,expectedVersion:q.version});row=(await call('quotes')).data.find(x=>x.id===id);A.match(row.updateSummary,/Vận chuyển/);A.ok(!row.updateSummary.includes('765432'));
 await call('quotes/'+id+'/submit','POST',{expectedVersion:2});await call('quotes/'+id+'/approve','POST',{expectedVersion:3});
 row=(await call('quotes')).data.find(x=>x.id===id);A.equal(row.progress.work.status,'completed');A.equal(row.commercialStatus,'draft');A.equal(row.updateSummary,'Duyệt báo giá');
 await call('quotes/'+id+'/reopen','POST',{expectedVersion:4,reason:'Customer requested change'});
 row=(await call('quotes')).data.find(x=>x.id===id);A.equal(row.progress.work.status,'in-progress');A.equal(row.updateSummary,'Mở bản sửa');A.equal(row.commercialStatus,'draft');
});
