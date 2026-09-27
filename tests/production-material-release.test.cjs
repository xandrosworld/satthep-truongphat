'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
async function fixture(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;const call=async(path,method='GET',body,s=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Operations-test-2026!'},null);const d=P.demoSeed();d.quote.notes='Handle carefully\nKeep dry';d.quote.products[0].lineNote='Mark product A';d.quote.products[0].requestSpecification='Technical specification';d.quote.products[0].children[0].lineNote='Deburr all edges';const q=(await call('quotes','POST',{document:d})).data;await call('quotes/'+q.id+'/submit','POST',{expectedVersion:1});await call('quotes/'+q.id+'/approve','POST',{expectedVersion:2});const o=(await call('quotes/'+q.id+'/order','POST',{expectedVersion:3,code:'ORDER-OPS'})).data;await call('orders/'+o.id+'/confirm','POST',{quoteVersion:3});const j=await call('production','POST',{orderId:o.id,productId:d.quote.products[0].id,quantity:1,code:'JOB-OPS'});A.equal(j.status,201,JSON.stringify(j.data));const post=(p,b,s)=>call('ops/'+p,'POST',{requestId:randomUUID(),...b},s);return {app,call,post,admin,job:j.data,order:o,document:d};}
test('partial material releases nest selected rows, lock stock, require warehouse rights and issue exactly once',async t=>{
 const {call,post,job,app,admin}=await fixture(t);let j=await require('./production-review-fixture.cjs').review(call,admin,job.id);
 const template=j.packet.materials[0],mid=template.material.id,packet=structuredClone(j.packet);
 packet.materials=[{...template,id:'a',count:4,dimensions:{...template.dimensions,length:400,width:200},material:{...template.material,stockL:1000,stockW:500}},{...template,id:'b',count:4,dimensions:{...template.dimensions,length:300,width:200},material:{...template.material,stockL:1000,stockW:500}}];packet.cutting=[{materialId:mid,stocks:[{placements:[{x:0,y:0,l:1000,w:500}]}]}];app.sql.prepare('UPDATE production_jobs SET packet=? WHERE id=?').run(JSON.stringify(packet),j.id);
 await post('master',{kind:'material',expectedVersion:0,document:{id:mid,code:mid,name:'Mixed',unit:'tấm',form:'sheet'}});
 const lot=(await post('receipt',{materialId:mid,warehouse:'Kho',quantity:5,unitWeight:10,unitCost:100,length:1000,width:500,thickness:template.properties.T,reference:'REL'})).data;
 const selection=[{rowId:'a',quantity:2},{rowId:'b',quantity:2}];
 const preview=await post('material-release/preview',{jobId:j.id,rows:selection});A.equal(preview.status,200,JSON.stringify(preview.data));A.equal(preview.data.plans[0].allocations[0].quantity,1);A.equal(new Set(preview.data.plans[0].allocations[0].stocks[0].placements.map(p=>p.rowId)).size,2);
 const requestBody={jobId:j.id,expectedVersion:j.version,rows:selection,requestId:randomUUID()};const created=await post('material-release/request',requestBody);A.equal(created.status,200,JSON.stringify(created.data));A.equal(created.data.state,'pending');
 A.equal((await post('material-release/request',requestBody)).data.id,created.data.id);
 let state=(await call('ops/state')).data;A.equal(state.lots.find(l=>l.id===lot.id).quantity,5);A.equal(state.holds.filter(h=>h.releaseRequestId===created.data.id).length,1);
 const screen=(await call('ops/material-release?job='+j.id)).data;A.equal(screen.rows[0].remaining,2);
 A.equal((await post('material-release/request',{...requestBody,requestId:randomUUID(),rows:[{rowId:'a',quantity:3}]})).status,409);
 A.equal((await post('release',{id:created.data.holdIds[0]})).status,409);
 const u=await call('users','POST',{username:'requester',name:'Requester',role:'technical',password:'Operations-test-2026!',actionAccess:{production:['view','edit']}});A.equal(u.status,201);const session=await call('login','POST',{username:'requester',password:'Operations-test-2026!'});
 const issueBody={id:created.data.id,expectedVersion:created.data.version,requestId:randomUUID()};A.equal((await post('material-release/issue',issueBody,session)).status,403);
 const issued=await post('material-release/issue',issueBody);A.equal(issued.status,200,JSON.stringify(issued.data));A.equal(issued.data.state,'issued');A.deepEqual((await post('material-release/issue',issueBody)).data,issued.data);
 A.equal((await post('material-release/issue',{...issueBody,requestId:randomUUID()})).status,409);state=(await call('ops/state')).data;A.equal(state.lots.find(l=>l.id===lot.id).quantity,4);
 const second=await post('material-release/request',{...requestBody,requestId:randomUUID()});A.equal(second.status,200,JSON.stringify(second.data));A.equal((await call('ops/material-release?job='+j.id)).data.rows[0].remaining,0);
 A.equal((await post('material-release/reject',{id:second.data.id,expectedVersion:second.data.version})).status,200);A.equal((await call('ops/material-release?job='+j.id)).data.rows[0].remaining,2);
 // A hold belonging to another order is never an available source.
 app.sql.prepare('INSERT INTO ops_records VALUES(?,?,1,?)').run('hold','elsewhere',JSON.stringify({jobId:'other',lotId:lot.id,materialId:mid,quantity:4,state:'reserved'}));
 const missing=await post('material-release/preview',{jobId:j.id,rows:selection});A.equal(missing.data.complete,false);A.equal((await post('material-release/request',{...requestBody,requestId:randomUUID()})).status,409);
});

test('existing own reservations split safely and stale engineering blocks issue but can be returned',async t=>{
 const {call,post,job,app,admin}=await fixture(t);let j=await require('./production-review-fixture.cjs').review(call,admin,job.id);
 const template=j.packet.materials[0],mid=template.material.id,packet=structuredClone(j.packet);
 packet.materials=[{...template,id:'a',count:4,dimensions:{...template.dimensions,length:400,width:200},material:{...template.material,stockL:1000,stockW:500}},{...template,id:'b',count:4,dimensions:{...template.dimensions,length:300,width:200},material:{...template.material,stockL:1000,stockW:500}}];packet.cutting=[{materialId:mid,stocks:[{placements:[{x:0,y:0,l:1000,w:500}]}]}];app.sql.prepare('UPDATE production_jobs SET packet=? WHERE id=?').run(JSON.stringify(packet),j.id);
 await post('master',{kind:'material',expectedVersion:0,document:{id:mid,code:mid,name:'Mixed',unit:'tấm',form:'sheet'}});
 const lot=(await post('receipt',{materialId:mid,warehouse:'Kho',quantity:5,unitWeight:10,unitCost:100,length:1000,width:500,thickness:template.properties.T,reference:'REL'})).data;

 const reserved=await post('reserve',{jobId:j.id,lotId:lot.id,quantity:2});A.equal(reserved.status,200,JSON.stringify(reserved.data));
 const selection=[{rowId:'a',quantity:2},{rowId:'b',quantity:2}];
 const req=await post('material-release/request',{jobId:j.id,expectedVersion:j.version,rows:selection});A.equal(req.status,200,JSON.stringify(req.data));
 let state=(await call('ops/state')).data;A.equal(state.holds.filter(h=>h.state==='reserved').reduce((s,h)=>s+h.quantity,0),2);A.equal(state.holds.find(h=>h.releaseRequestId===req.data.id).quantity,1);
 packet.kerf=(packet.kerf||0)+1;app.sql.prepare('UPDATE production_jobs SET packet=? WHERE id=?').run(JSON.stringify(packet),j.id);
 A.equal((await post('material-release/issue',{id:req.data.id,expectedVersion:req.data.version})).status,409);
 A.equal((await post('material-release/reject',{id:req.data.id,expectedVersion:req.data.version})).status,200);
 state=(await call('ops/state')).data;A.equal(state.holds.filter(h=>h.state==='reserved').reduce((s,h)=>s+h.quantity,0),2);A.equal(state.lots.find(l=>l.id===lot.id).quantity,5);
});
