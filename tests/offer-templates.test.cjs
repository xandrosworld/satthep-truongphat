const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs');
test('shared offer templates validate permissions, preserve versions and omit quote-specific confirmation',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const password='Template-test-2026!',admin=await call('setup','POST',{username:'admin',name:'Admin',password});
 await call('users','POST',{username:'tech',name:'Tech',role:'technical',password},admin);const tech=await call('login','POST',{username:'tech',password});
 const route='intake/offer-templates',body={name:'Standard',data:{signature:'issuer',delivery:'At factory',payment:'30/70',confirmation:'old',customerSigner:'Old customer',signer:'Director'}};
 A.equal((await call(route,'POST',body,tech)).status,403);A.equal((await call(route,'GET',undefined,tech)).status,403);A.equal((await call(route,'POST',body,{...admin,csrf:''})).status,403);
 A.equal((await call(route,'POST',{...body,name:''},admin)).status,400);A.equal((await call(route,'POST',{...body,data:{payment:'x'.repeat(2001)}},admin)).status,400);
 A.equal((await call(route,'POST',body,admin)).status,201);A.equal((await call(route,'POST',body,admin)).status,200);
 A.equal((await call(route,'POST',{...body,data:{...body.data,payment:'50/50'}},admin)).status,201);
 const rows=(await call(route,'GET',undefined,admin)).data;A.equal(rows.length,2);A.equal(rows[0].data.payment,'50/50');A.equal(rows[1].data.payment,'30/70');A.equal(rows[0].data.customerSigner,undefined);A.equal(rows[0].data.confirmation,undefined);
 const backup=(await call('backup','GET',undefined,admin)).data;A.equal(backup.offerTermTemplates.length,2);A.equal(backup.quotes.length,0);
});
