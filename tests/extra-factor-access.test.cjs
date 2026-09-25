'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('only admin adds production/sales factors; delegated factor editor keeps numeric editing',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;
 async function call(path,method='GET',body){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 session=await call('setup','POST',{username:'admin',name:'Admin',password:'Extra-factor-2026!'});const admin=session;
 const d=P.demoSeed();d.quote.pricing.productionFactors=[{id:'p1',name:'Existing production',percent:2,reason:'Existing',enabled:true}];d.quote.pricing.salesFactors=[{id:'s1',name:'Existing sales',percent:3,reason:'Existing',enabled:true}];
 const q=(await call('quotes','POST',{document:d})).data;A.ok(q.id);
 await call('users','POST',{username:'editor',name:'Editor',role:'estimator',password:'Extra-factor-2026!',canEditFactors:true});session=await call('login','POST',{username:'editor',password:'Extra-factor-2026!'});A.equal(session.data.permissions.factors,true);
 let r=await call('quotes/'+q.id),document=r.data.document;
 for(const key of ['productionFactors','salesFactors']){
  const changed=structuredClone(document);changed.quote.pricing[key].push({id:'injected',name:'New factor',percent:4,reason:'New',enabled:true});r=await call('quotes/'+q.id,'PUT',{expectedVersion:q.version,document:changed});A.equal(r.status,403,JSON.stringify(r.data));
  changed.quote.pricing[key]=[...document.quote.pricing[key],...document.quote.pricing[key]];A.equal((await call('quotes/'+q.id,'PUT',{expectedVersion:q.version,document:changed})).status,403);
  changed.quote.pricing[key]=structuredClone(document.quote.pricing[key]);changed.quote.pricing[key][0].name='Renamed definition';A.equal((await call('quotes/'+q.id,'PUT',{expectedVersion:q.version,document:changed})).status,403);
 }
 document.quote.pricing.productionFactors[0].percent=6;document.quote.pricing.salesFactors[0].percent=7;r=await call('quotes/'+q.id,'PUT',{expectedVersion:q.version,document});A.equal(r.status,200,JSON.stringify(r.data));
 const newQuote=P.demoSeed();newQuote.quote.id='NONADMIN-NEW';newQuote.quote.pricing.salesFactors=[{id:'new',name:'New',percent:2}];A.equal((await call('quotes','POST',{document:newQuote})).status,403);
 const catalog=await call('catalog');catalog.data.catalog.pricingDefaults.salesFactors=[{id:'new',name:'New',percent:2}];A.equal((await call('catalog','PUT',{expectedVersion:catalog.data.version,catalog:catalog.data.catalog})).status,403);
 session=admin;document=(await call('quotes/'+q.id)).data.document;document.quote.pricing.salesFactors.push({id:'admin-new',name:'Admin added',percent:1,reason:'Approved'});A.equal((await call('quotes/'+q.id,'PUT',{expectedVersion:r.data.version,document})).status,200);
});
