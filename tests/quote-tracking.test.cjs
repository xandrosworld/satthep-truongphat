'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('list tracking: permissions, concurrent saves, sent evidence and immutable quotation',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;
 async function call(path,method='GET',body,s=session){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 session=await call('setup','POST',{username:'admin',name:'Admin',password:'Tracking-password-2026!'});
 await call('users','POST',{username:'tech',name:'Tech',role:'technical',password:'Tracking-password-2026!'});const tech=await call('login','POST',{username:'tech',password:'Tracking-password-2026!'});
 const document=P.demoSeed();document.quote.date=require('../completion-core.js').todayVN();document.materialPrices=[{substance:'Thép',grade:'CT3',unit:'kg',price:21000}];const made=await call('quotes','POST',{document}),id=made.data.id,path='quotes/'+id+'/tracking';
 let body={status:'sent',reason:'Customer received quotation',expectedVersion:0,expectedQuoteVersion:1,offerVersion:null};A.equal((await call(path,'POST',body)).status,409);A.equal((await call(path,'POST',body,tech)).status,403);A.equal((await call(path,'POST',body,{...session,csrf:''})).status,403);
 A.equal((await call('quotes/'+id+'/submit','POST',{expectedVersion:1})).status,200);A.equal((await call('quotes/'+id+'/approve','POST',{expectedVersion:2})).status,200);
 const before=app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=3').get(id).document;body={...body,offerVersion:3,expectedQuoteVersion:3,status:'accepted'};
 A.equal((await call(path,'POST',body)).status,200);A.equal((await call(path,'POST',body)).status,409);let list=(await call('quotes')).data;A.equal(list.find(q=>q.id===id).trackingStatus,'accepted');A.equal(list.find(q=>q.id===id).progress.sentCount,1);
 A.equal((await call(path,'POST',{...body,status:'draft',expectedVersion:1})).status,200);const state=(await call('quotes/'+id+'/workflow')).data;A.equal(state.storedStatus,'draft');A.ok(state.events.some(e=>e.to==='sent'&&e.offerVersion===3));A.equal((await call('quotes/'+id+'/formula-update')).data.sent,true);
 A.equal(app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=3').get(id).document,before);A.equal((await call('quotes/'+id)).data.version,3);A.equal((await call(path,'POST',{...body,status:'invalid',expectedVersion:2})).status,400);
});
