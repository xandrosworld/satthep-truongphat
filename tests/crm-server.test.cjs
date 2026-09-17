const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),I=require('../intake-core.js');
test('CRM API persists customer history/opportunities, protects assignment/policy, links by ID and backs up CRM',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,session){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Local-CRM-tests-42!'});const staffBody={username:'staff',name:'Staff',password:'Local-CRM-tests-42!',role:'estimator',sections:['customer']},user=await call('users','POST',staffBody,admin),staff=await call('login','POST',staffBody);
 let c=(await call('intake/customers','POST',{customer:{id:'customer-a',name:'Same name',type:'company'},expectedVersion:0},admin)).data;A.equal(c.ownerId,admin.data.user.id);A.equal(c.events.length,1);
 let r=await call('intake/customers/'+c.id+'/interaction','POST',{expectedVersion:c.version,content:'Meeting',channel:'meeting',actor:'Spoof'},staff);A.equal(r.status,200);c=r.data;A.equal(c.events.at(-1).actor,'Staff');
 A.equal((await call('intake/customers/'+c.id+'/interaction','POST',{expectedVersion:1,content:'Stale'},staff)).status,409);
 c=(await call('intake/customers/'+c.id+'/opportunity','POST',{expectedVersion:c.version,title:'Project',stage:'qualifying',value:100},staff)).data;const oid=c.opportunities[0].id;
 A.equal((await call('intake/customers/'+c.id+'/assign','POST',{expectedVersion:c.version,ownerId:user.data.id,reason:'QA'},staff)).status,403);
 c=(await call('intake/customers/'+c.id+'/assign','POST',{expectedVersion:c.version,ownerId:user.data.id,reason:'QA'},admin)).data;A.equal(c.ownerId,user.data.id);
 c=(await call('intake/customers','POST',{customer:{id:c.id,name:c.name,phone:'123',events:[],opportunities:[]},expectedVersion:c.version},staff)).data;A.equal(c.opportunities[0].id,oid);A.equal(c.type,'company');A.equal(c.events.length,5);A.equal(c.ownerId,user.data.id);
 const d=P.demoSeed();d.quote.customer=c.name;d.quote.customerInfo=I.customerSnapshot(c);d.quote.opportunityId=oid;let quote=await call('quotes','POST',{document:d},admin);A.equal(quote.status,201,JSON.stringify(quote.data));
 await call('intake/customers','POST',{customer:{id:'customer-b',name:c.name},expectedVersion:0},admin);let detail=(await call('intake/customers/'+c.id,'GET',undefined,staff)).data;A.equal(detail.quotes.length,1);A.equal(detail.quotes[0].opportunityId,oid);A.equal(detail.orderCount,0);A.equal((await call('intake/customers/customer-b','GET',undefined,staff)).data.quotes.length,0);
 d.quote.customerInfo.id='customer-b';A.equal((await call('quotes','POST',{document:d},admin)).status,400);
 // Historical orders are identified by their frozen customer snapshot, not current quote names.
 app.sql.prepare('INSERT INTO orders VALUES(?,?,?,?,?,?,?)').run('order-test','DH-CRM',quote.data.id,1,JSON.stringify({quote:{customerInfo:{id:c.id}}}),new Date().toISOString(),admin.data.user.id);
 A.equal((await call('intake/customers/'+c.id,'GET',undefined,staff)).data.orderCount,1);
 A.equal((await call('intake/policy','POST',{policy:{careDays:7},expectedVersion:0},staff)).status,403);const policies=await Promise.all([1,2].map(n=>call('intake/policy','POST',{policy:{careDays:n,vipOrders:3},expectedVersion:0},admin)));A.deepEqual(policies.map(p=>p.status).sort(),[200,409]);
 const owners=(await call('intake/owners','GET',undefined,staff)).data;A.ok(owners.every(o=>!('password'in o)&&!('username'in o)));
 const backup=(await call('backup','GET',undefined,admin)).data;A.equal(backup.customers.length,2);A.equal(backup.customerPolicy.length,1);
});
