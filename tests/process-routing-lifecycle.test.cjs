const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('native quote, order, contract and production transitions are gated atomically and keep draft saves',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;
 const call=async(path,method='GET',body,s=admin)=>{const response=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await response.json();return {status:response.status,data,cookie:response.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const ok=(r,status=200)=>{A.equal(r.status,status,JSON.stringify(r.data));return r.data;};admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Routing-test-2026!'});
 await require('./helpers/personnel-user.cjs')(call,admin,{username:'operator',name:'Operator',role:'estimator',canViewCosts:true,sectionModes:Object.fromEntries(Object.keys(require('../section-access.js').labels).map(k=>[k,'configure'])),password:'Routing-test-2026!',actionAccess:{quotes:['view','confirm','edit','approve'],customers:['view','edit'],orders:['view','edit'],contracts:['view','edit'],production:['view','confirm','issue','complete'],purchasing:['view','edit']}});
 const operator=await call('login','POST',{username:'operator',password:'Routing-test-2026!'}),d=ok(await call('process-routing')),dept=d.departments[0].id;
 for(const id of ['quote','order','contract','production']){const def=d.definitions.find(x=>x.id===id);ok(await call('process-routing','POST',{action:'save',id,expectedVersion:0,active:true,steps:def.steps.map(s=>({...s,departmentId:s.admin?'':dept}))}));}
 const doc=P.demoSeed();doc.quote.date=require('../completion-core.js').todayVN();doc.quote.customer='Khách thử';doc.quote.customerInfo={...doc.quote.customerInfo,id:'C1',name:'Khách thử'};app.sql.prepare('INSERT INTO intake_customers VALUES(?,?,?)').run('C1',1,JSON.stringify({id:'C1',name:doc.quote.customer,ownerId:admin.data.user.id}));
 let q=ok(await call('quotes','POST',{document:doc}),201);
 const flow=async(kind,id)=>ok(await call('process-routing')).instances.find(x=>x.id===kind+':'+id),next=async(kind,id,s=admin)=>{const r=await flow(kind,id);return call('process-routing','POST',{action:'complete',id:r.id,expectedVersion:r.version,note:'Đối chiếu hồ sơ đạt'},s);};
 A.equal((await flow('quote',q.id)).index,0);
 A.equal((await call('quotes/'+q.id+'/handoff/technical','POST',{expectedVersion:q.version})).status,409);A.equal(app.sql.prepare("SELECT COUNT(*) n FROM handoff_events WHERE quote_id=? AND stage='technical'").get(q.id).n,0);
 for(const stage of ['intake','technical','materials'])ok(await call('quotes/'+q.id+'/handoff/'+stage,'POST',{expectedVersion:q.version,note:'Đạt'}));
 A.equal((await flow('quote',q.id)).steps[(await flow('quote',q.id)).index].key,'approve');
 q=ok(await call('quotes/'+q.id+'/submit','POST',{expectedVersion:q.version}));q=ok(await call('quotes/'+q.id+'/approve','POST',{expectedVersion:q.version}));A.equal((await flow('quote',q.id)).index,4);
 A.equal((await call('quotes/'+q.id+'/order','POST',{expectedVersion:q.version,code:'PREMATURE'})).status,409);A.equal(app.sql.prepare('SELECT COUNT(*) n FROM orders').get().n,0);
 let follow=ok(await call('quotes/'+q.id+'/followup'));ok(await call('quotes/'+q.id+'/followup/assign','POST',{expectedVersion:follow.revision,offerVersion:q.version,senderId:admin.data.user.id,careOwnerId:admin.data.user.id}));follow=ok(await call('quotes/'+q.id+'/followup'));ok(await call('quotes/'+q.id+'/workflow','POST',{expectedVersion:follow.revision,offerVersion:q.version,status:'sent',confirmedSent:true,recipient:'Khách hàng',channel:'Email',reason:'Đã gửi'}));A.equal((await flow('quote',q.id)).index,5);
 // Current approved source is used to create an order; order has a distinct workflow snapshot.
 const order=ok(await call('quotes/'+q.id+'/order','POST',{expectedVersion:q.version,code:'ORDER-FLOW'}),201);
 A.equal((await call('orders/'+order.id+'/confirm','POST',{quoteVersion:q.version})).status,409);A.equal(JSON.parse(app.sql.prepare('SELECT package FROM orders WHERE id=?').get(order.id).package).status,'draft');
 ok(await next('order',order.id));ok(await call('orders/'+order.id+'/confirm','POST',{quoteVersion:q.version}));
 const contractDoc={code:'CONTRACT-FLOW',customerId:'C1',orderId:order.id,value:1000,status:'active',signDate:'2026-09-30',startDate:'2026-09-30'};
 A.equal((await call('business/contracts','POST',{expectedVersion:0,document:contractDoc})).status,409);A.equal(app.sql.prepare("SELECT COUNT(*) n FROM business_records WHERE kind='contract'").get().n,0);
 const c=ok(await call('business/contracts','POST',{expectedVersion:0,document:{...contractDoc,status:'draft'}}));ok(await next('contract',c.id));
 A.equal((await call('business/contracts/'+c.id,'POST',{expectedVersion:c.version,document:contractDoc},operator)).status,403);A.equal(JSON.parse(app.sql.prepare("SELECT document FROM business_records WHERE kind='contract' AND id=?").get(c.id).document).status,'draft');
 ok(await call('business/contracts/'+c.id,'POST',{expectedVersion:c.version,document:contractDoc}));A.equal((await flow('contract',c.id)).state,'completed');A.equal((await flow('order',order.id)).steps[(await flow('order',order.id)).index].key,'production-request');
 const job={orderId:order.id,productId:doc.quote.products[0].id,quantity:1,code:'JOB-FLOW'};
 A.equal((await call('production','POST',job)).status,409);A.equal(app.sql.prepare('SELECT COUNT(*) n FROM production_jobs').get().n,0);
 ok(await next('order',order.id));A.equal((await next('order',order.id,operator)).status,403);ok(await next('order',order.id));const j=ok(await call('production','POST',job),201);A.equal((await flow('order',order.id)).state,'completed');A.equal((await flow('production',j.id)).index,0);
 const again=ok(await call('production','POST',job),201);A.equal(again.id,j.id);A.equal((await flow('production',j.id)).index,0);
});
