'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),C=require('../core.js');
test('partial handoff locks selected subtree while siblings and pricing remain editable, validates dependencies and notifies',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;async function call(path,method='GET',body){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 session=await call('setup','POST',{username:'admin',name:'Admin',password:'Partial-test-2026!'});const d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d})).data,path='quotes/'+q.id+'/partial-handoff';let version=1;const n=C.flatten(d.quote.products).find(n=>n.kind==='material'),sib=C.flatten(d.quote.products).find(x=>x.kind==='material'&&x.id!==n.id);const hand=(stage,action='confirm',nodeId=n.id,note='Ready')=>call(path,'POST',{stage,action,nodeId,note,expectedVersion:version});
 A.equal((await hand('materials')).status,409);let r=await hand('technical');A.equal(r.status,200,JSON.stringify(r.data));A.ok(r.data.recipients>0);A.equal((await hand('technical')).data.duplicate,true);
 n.qty++;A.equal((await call('quotes/'+q.id,'PUT',{expectedVersion:version,document:d})).status,409);n.qty--;
 sib.qty++;r=await call('quotes/'+q.id,'PUT',{expectedVersion:version,document:d});A.equal(r.status,200,JSON.stringify(r.data));version++;
 n.spec.price+=1;r=await call('quotes/'+q.id,'PUT',{expectedVersion:version,document:d});A.equal(r.status,200,JSON.stringify(r.data));version++;
 A.equal((await hand('materials','confirm',d.quote.products[0].id)).status,409,'a child handoff does not confirm its whole parent');
 A.equal((await hand('materials')).status,200);n.spec.price+=1;A.equal((await call('quotes/'+q.id,'PUT',{expectedVersion:version,document:d})).status,409);n.spec.price--;
 A.equal((await hand('technical','reopen',n.id,'')).status,400);A.equal((await hand('technical','reopen',n.id,'Change dimensions')).status,200);A.equal((await call(path)).data.every(x=>x.unlocked),true);
 n.qty++;r=await call('quotes/'+q.id,'PUT',{expectedVersion:version,document:d});A.equal(r.status,200,JSON.stringify(r.data));version++;A.equal((await hand('materials')).status,409);A.equal((await hand('technical')).status,200);
 A.equal((await call(path,'POST',{stage:'technical',action:'confirm',nodeId:n.id,expectedVersion:1})).status,409);
 const admin=session;await call('users','POST',{username:'reader',name:'Reader',role:'sales',password:'Partial-test-2026!'});session=await call('login','POST',{username:'reader',password:'Partial-test-2026!'});A.equal((await hand('technical')).status,403);session=admin;
});
