const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs');
test('sales customer permission is independent of costs; projection, preservation, conflict and revocation',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,session){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Local-Customer-42!'});
 const account={username:'sales',name:'Sales',password:'Local-Customer-42!',role:'sales',canViewCosts:false,sections:['customer']};
 const u=await call('users','POST',account,admin),sales=await call('login','POST',account);
 A.equal(sales.data.permissions.customers,true);A.equal(sales.data.permissions.costs,false);A.equal(sales.data.permissions.edit,false);A.equal(sales.data.permissions.manage,false);
 let c=(await call('intake/customers','POST',{customer:{id:'customer-a',name:'Customer',phone:'123',notes:'INTERNAL',account:{annualRevenue:999},rating:'vip',ratingReason:'Internal reason'},expectedVersion:0},admin)).data;
 await call('intake/customers/'+c.id+'/opportunity','POST',{expectedVersion:c.version,title:'Secret project',value:99999},admin);
 c=(await call('intake/customers/'+c.id,'GET',undefined,admin)).data.customer;
 const list=await call('intake/customers','GET',undefined,sales);A.equal(list.status,200);A.deepEqual(Object.keys(list.data[0]).sort(),['id','name','contact','phone','email','address','taxId','version'].sort());
 for(const route of ['intake/policy','intake/owners','intake/customers/customer-a','catalog','backup'])A.equal((await call(route,'GET',undefined,sales)).status,403,route);
 for(const route of ['intake/customers/customer-a/opportunity','intake/customers/import'])A.equal((await call(route,'POST',{},sales)).status,403,route);
 const file=await call('intake/files','POST',{id:'sales-source',name:'request.csv',data:'YQ==',size:1},sales);A.equal(file.status,201);A.equal((await call('intake/files/sales-source','GET',undefined,sales)).status,200);
 const saved=await call('intake/customers','POST',{customer:{...list.data[0],version:c.version,phone:'456',rating:'risk',ownerId:u.data.id,notes:'ATTACK',opportunities:[]},expectedVersion:c.version},sales);A.equal(saved.status,200,JSON.stringify(saved.data));A.equal(saved.data.phone,'456');A.equal(saved.data.notes,undefined);
 const full=(await call('intake/customers/customer-a','GET',undefined,admin)).data.customer;A.equal(full.notes,'INTERNAL');A.equal(full.rating,'vip');A.equal(full.ownerId,admin.data.user.id);A.equal(full.opportunities.length,1);A.equal(full.events.at(-1).actor,'Sales');
 A.equal((await call('intake/customers','POST',{customer:{id:c.id,name:'stale'},expectedVersion:c.version},sales)).status,409);
 const created=await call('intake/customers','POST',{customer:{name:'New customer',ownerId:admin.data.user.id},expectedVersion:0},sales);A.equal(created.status,200);A.equal(created.data.ownerId,undefined);A.equal((await call('intake/customers/'+created.data.id,'GET',undefined,admin)).data.customer.ownerId,u.data.id);
 A.equal((await call('intake/customers','POST',{customer:{name:''},expectedVersion:0},sales)).status,400);
 await call('users/'+u.data.id+'/access','POST',{role:'sales',canViewCosts:false,sections:[]},admin);
 A.equal((await call('intake/customers','GET',undefined,sales)).status,401);
 const revoked=await call('login','POST',account);A.equal((await call('intake/customers','GET',undefined,revoked)).status,403);A.equal((await call('intake/customers','POST',{customer:{name:'Forbidden'},expectedVersion:0},revoked)).status,403);
});
