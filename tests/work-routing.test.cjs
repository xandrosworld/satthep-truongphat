'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('intake alerts all department heads; assigned tasks move through start, confirmation and rework',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const password='Routing-local-2026!',admin=await call('setup','POST',{username:'admin',name:'Admin',password}),people={};
 for(const [name,role,sections,workRoles]of [['sales','sales',['customer'],{sales:'manager'}],['tech-head','technical',['bom','operations'],{technical:'manager'}],['tech-worker','technical',['bom','operations'],{technical:'member'}],['price-head','estimator',['materials'],{materials:'manager'}],['price-worker','estimator',['materials'],{materials:'member'}]]){A.equal((await call('users','POST',{username:name,name,password,role,sections,workRoles},admin)).status,201);people[name]=await call('login','POST',{username:name,password});}
 const id=name=>people[name].data.user.id;
 const q=(await call('quotes','POST',{document:P.demoSeed()},admin)).data,root='quotes/'+q.id;
 const assign={expectedRevision:0,technicalId:id('tech-worker'),materialsId:null,status:'not-started'};
 A.equal((await call(root+'/work','PUT',assign,people['tech-worker'])).status,403);
 A.equal((await call(root+'/work','PUT',assign,people['tech-head'])).status,200);
 A.equal((await call(root+'/work','PUT',{...assign,expectedRevision:1,materialsId:id('price-worker')},people['price-head'])).status,200);
 for(const [name,stage]of [['tech-worker','technical'],['price-worker','materials']]){const inbox=(await call('notifications','GET',undefined,people[name])).data.items;A.equal(inbox.filter(n=>n.stage==='assigned-'+stage).length,1);A.equal((await call('my-quote-work','GET',undefined,people[name])).data[0].status,'not-started');}
 A.equal((await call(root+'/work-start/technical','POST',{expectedRevision:2},people['tech-worker'])).status,200);
 A.equal((await call(root+'/work','GET',undefined,admin)).data.status,'in-progress','starting assigned work updates overall status before handoff');
 A.equal((await call(root+'/handoff/intake','POST',{expectedVersion:q.version},admin)).status,200);
 for(const [name,s]of [['admin',admin],...Object.entries(people)])A.equal((await call('notifications','GET',undefined,s)).data.items.some(n=>n.stage==='intake'),['admin','sales','tech-head','price-head'].includes(name),name);
 A.equal((await call(root+'/handoff/technical','POST',{expectedVersion:q.version},people['tech-worker'])).status,200);
 A.equal((await call('my-quote-work','GET',undefined,people['tech-worker'])).data[0].status,'completed');
 A.equal((await call(root+'/handoff/materials','POST',{expectedVersion:q.version},people['price-worker'])).status,200);
 A.equal((await call('my-quote-work','GET',undefined,people['price-worker'])).data[0].status,'completed');
 A.equal((await call(root+'/handoff/technical/reopen','POST',{expectedVersion:q.version,reason:'Review dimensions'},admin)).status,200);
 for(const name of ['tech-worker','price-worker'])A.equal((await call('my-quote-work','GET',undefined,people[name])).data[0].status,'in-progress');
 A.equal((await call(root+'/work','PUT',{...assign,expectedRevision:3,materialsId:id('price-worker'),status:'cancelled'},admin)).status,200);
 A.equal((await call('my-quote-work','GET',undefined,people['price-worker'])).data[0].status,'cancelled');
 A.equal((await call(root+'/work-start/materials','POST',{expectedRevision:4},people['price-worker'])).status,409);
});
