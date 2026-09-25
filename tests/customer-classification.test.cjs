'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),SA=require('../section-access.js');
test('customer classification uses published choices without exposing or unlocking factors',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;
 async function call(path,method='GET',body){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 session=await call('setup','POST',{username:'admin',name:'Admin',password:'Classification-2026!'});const admin=session;
 const catalog=JSON.parse(app.sql.prepare('SELECT document FROM catalog WHERE id=1').get().document);catalog.pricingDefaults.policyTypes={customer:[{name:'VIP',description:'Returning customer',multiplier:0.95},{name:'New',description:'New customer',multiplier:1.05}]};app.sql.prepare('UPDATE catalog SET document=? WHERE id=1').run(JSON.stringify(catalog));
 const d=P.demoSeed();d.quote.pricing.overhead=12;const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id+'/customer-classification';
 const modes=Object.fromEntries(SA.keys.map(k=>[k,'view']));modes.customer='use';modes.factors='use';
 const u=await call('users','POST',{username:'declarer',name:'Declarer',password:'Classification-2026!',role:'estimator',sectionModes:modes,canEditFactors:false});A.equal(u.status,201,JSON.stringify(u.data));
 app.sql.prepare('INSERT INTO formula_locks VALUES(?,?,?,?,?)').run('calculationFactors:all',1,1,admin.data.user.id,new Date().toISOString());
 session=await call('login','POST',{username:'declarer',password:'Classification-2026!'});A.equal(session.data.permissions.factorsHidden,true);A.equal(session.data.permissions.factors,false);
 let r=await call(path);A.equal(r.status,200);A.equal(r.data.canDeclare,true);A.equal(JSON.stringify(r.data).includes('multiplier'),false);
 A.equal((await call(path,'POST',{name:'Fake',expectedVersion:q.version})).status,400);
 A.equal((await call(path,'POST',{name:'VIP',expectedVersion:q.version,customer:99})).status,400);
 r=await call(path,'POST',{name:'VIP',expectedVersion:q.version});A.equal(r.status,200,JSON.stringify(r.data));const version=r.data.version;
 let saved=JSON.parse(app.sql.prepare('SELECT document FROM quotes WHERE id=?').get(q.id).document);A.equal(saved.quote.pricing.customer,-5);A.equal(saved.quote.pricing.overhead,12);A.equal(saved.quote.pricing.policySelections.customer.name,'VIP');
 A.equal((await call(path,'POST',{name:'New',expectedVersion:q.version})).status,409);
 r=await call('quotes/'+q.id);A.equal(r.data.document.quote.pricing.customer,0);A.equal(r.data.document.quote.pricing.classificationLabel,'VIP');
 const copy=structuredClone(r.data.document);copy.quote.pricing.classificationLabel='Forged display';A.equal((await call('quotes/'+q.id,'PUT',{document:copy,expectedVersion:version})).status,200,'projected label must not prevent later saves or become authoritative');
 r.data.document.quote.pricing.customer=99;A.equal((await call('quotes/'+q.id,'PUT',{document:r.data.document,expectedVersion:version})).status,403);
 app.sql.prepare("UPDATE quotes SET status='approved' WHERE id=?").run(q.id);A.equal((await call(path,'POST',{name:'New',expectedVersion:version})).status,409);A.equal((await call(path)).data.canDeclare,false);
 app.sql.prepare("UPDATE quotes SET status='draft' WHERE id=?").run(q.id);
 app.sql.prepare('UPDATE users SET section_access=? WHERE username=?').run(JSON.stringify(Object.fromEntries(SA.keys.map(k=>[k,'view']))),'declarer');A.equal((await call(path,'POST',{name:'New',expectedVersion:version})).status,403);
 A.equal(app.sql.prepare("SELECT locked FROM formula_locks WHERE key='calculationFactors:all'").get().locked,1);
});
