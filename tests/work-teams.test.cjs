'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('department leads assign only their team; notices and individual work track assignment',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const password='Work-team-test-2026!',admin=await call('setup','POST',{username:'admin',name:'Admin',password}),people={};
 for(const [username,role,sections]of [['lead','technical',['bom','operations']],['worker','technical',['bom','operations']],['outsider','technical',['bom','operations']],['pricing','estimator',['materials']],['sales','sales',['customer']]]){await call('users','POST',{username,name:username,role,sections,password},admin);people[username]=await call('login','POST',{username,password});}
 const id=k=>people[k].data.user.id,teams={technical:{lead:id('lead'),members:[id('worker')]},materials:{lead:id('pricing'),members:[]},sales:{lead:id('sales'),members:[]}};
 A.equal((await call('work-teams','PUT',{expectedVersion:0,teams},people.lead)).status,403);A.equal((await call('work-teams','PUT',{expectedVersion:0,teams},admin)).status,200);A.equal((await call('work-teams','PUT',{expectedVersion:0,teams},admin)).status,409);
 const d=P.demoSeed();d.quote.remnantMode='all';const q=(await call('quotes','POST',{document:d},admin)).data,root='quotes/'+q.id;
 A.equal((await call(root+'/handoff/intake','POST',{expectedVersion:q.version},admin)).status,200);
 for(const s of [admin,people.lead,people.pricing,people.sales])A.ok((await call('notifications','GET',undefined,s)).data.items.some(n=>n.stage==='intake'));
 const options=(await call(root+'/work','GET',undefined,people.lead)).data;A.equal(options.canEdit,true);A.deepEqual(options.candidates.technical.map(u=>u.id).sort(),[id('lead'),id('worker')].sort());A.equal(options.candidates.materials.length,0);
 const assignment={expectedRevision:0,technicalId:id('worker'),materialsId:null,status:'in-progress'};
 A.equal((await call(root+'/work','PUT',{...assignment,technicalId:id('outsider')},people.lead)).status,403);
 A.equal((await call(root+'/work','PUT',{...assignment,materialsId:id('pricing')},people.lead)).status,403);
 A.equal((await call(root+'/work','PUT',assignment,people.lead)).status,200);
 A.ok((await call('notifications','GET',undefined,people.worker)).data.items.some(n=>n.stage==='assigned-technical'));
 let rows=(await call('my-quote-work','GET',undefined,people.worker)).data;A.equal(rows[0].status,'not-started');A.equal((await call('my-quote-work','GET',undefined,people.outsider)).data.length,0);
 A.equal((await call(root+'/work-start/technical','POST',{expectedRevision:1},people.outsider)).status,403);
 A.equal((await call(root+'/work-start/technical','POST',{expectedRevision:1},people.worker)).status,200);rows=(await call('my-quote-work','GET',undefined,people.worker)).data;A.equal(rows[0].status,'in-progress');
 A.equal((await call(root+'/handoff/technical','POST',{expectedVersion:q.version},people.worker)).status,200);A.equal((await call('my-quote-work','GET',undefined,people.worker)).data[0].status,'completed');
 A.equal((await call(root+'/work','PUT',{...assignment,expectedRevision:1},people.lead)).status,409);
 A.equal((await call(root+'/work','PUT',{...assignment,expectedRevision:2,technicalId:id('lead')},people.lead)).status,200);A.equal((await call('my-quote-work','GET',undefined,people.worker)).data.length,0);
 const changed={...teams,technical:{managers:[id('worker'),id('outsider')],members:[id('lead')]}};A.equal((await call('work-teams','PUT',{expectedVersion:1,teams:changed},admin)).status,200);A.equal((await call(root+'/work','GET',undefined,people.lead)).data.canEdit,false);for(const manager of ['worker','outsider']){const w=(await call(root+'/work','GET',undefined,people[manager])).data;A.equal(w.canEdit,true);A.ok(w.candidates.technical.some(u=>u.id===id('lead')));}A.equal((await call(root+'/work','PUT',{...assignment,expectedRevision:3},people.lead)).status,403);

});
