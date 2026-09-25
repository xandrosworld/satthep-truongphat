'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),F=require('../completion-core.js');
async function setup(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const password='Followup-test-2026!';async function call(path,method='GET',body,s=admin){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}let admin;admin=await call('setup','POST',{username:'admin',name:'Admin',password},null);const sessions={};for(const name of ['sender','carer','other']){const u=await call('users','POST',{username:name,name,role:'sales',password});sessions[name]={...await call('login','POST',{username:name,password}),id:u.data.id};}const document=P.demoSeed();document.quote.date=F.todayVN();const made=await call('quotes','POST',{document});const id=made.data.id;assert.equal((await call('quotes/'+id+'/submit','POST',{expectedVersion:1})).status,200);assert.equal((await call('quotes/'+id+'/approve','POST',{expectedVersion:2})).status,200);const read=async v=>(await call('quotes/'+id+'/followup'+(v?'?version='+v:''))).data;const post=async(action,body,s=admin,v=3)=>{const state=await read(v);return call('quotes/'+id+'/'+action,'POST',{expectedVersion:state.revision,offerVersion:v,...body},s);};return {app,call,admin,...sessions,id,read,post};}
test('approval creates send task; only assigned sender confirms; care unlocks with immutable evidence',async t=>{
 const {app,call,admin,sender,carer,other,id,read,post}=await setup(t);
 assert.ok((await call('notifications')).data.items.some(n=>n.stage==='offer-assign'));
 assert.equal((await call('quotes/'+id+'/tracking','POST',{status:'accepted'})).status,409);
 assert.equal((await post('followup/care',{kind:'care',content:'Premature'},carer)).status,403);
 assert.equal((await post('followup/assign',{senderId:sender.id,careOwnerId:carer.id})).status,200);
 assert.ok((await call('notifications','GET',undefined,sender)).data.items.some(n=>n.stage==='offer-send'));
 const before=app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=3').get(id).document;
 const sent={status:'sent',confirmedSent:true,recipient:'Customer',channel:'Zalo',reason:'Sent approved offer',careOwnerId:carer.id,nextCareDate:F.todayVN()};
 assert.equal((await post('workflow',sent,other)).status,403);assert.equal((await post('workflow',sent,admin)).status,403);
 assert.equal((await post('workflow',{...sent,confirmedSent:false},sender)).status,400);
 let state=await read(),body={...sent,expectedVersion:state.revision,offerVersion:3};assert.equal((await call('quotes/'+id+'/workflow','POST',body,sender)).status,200);assert.equal((await call('quotes/'+id+'/workflow','POST',body,sender)).status,409);
 state=await read();assert.equal(state.entry.sentById,sender.id);assert.equal(state.entry.careOwnerId,carer.id);assert.equal(state.workflow.storedStatus,'sent');assert.equal(state.entry.entries.filter(e=>e.kind==='sent').length,1);
 assert.equal(app.sql.prepare('SELECT document FROM revisions WHERE id=? AND version=3').get(id).document,before);
 const tasks=(await call('offer-work','GET',undefined,carer)).data;assert.equal(tasks.length,1);assert.equal(tasks[0].sent,true);
 await call('notifications','GET',undefined,carer);await call('notifications','GET',undefined,carer);const notifications=(await call('notifications','GET',undefined,carer)).data.items;assert.equal(notifications.filter(n=>n.stage==='offer-care-due').length,1);assert.equal(notifications.filter(n=>n.stage==='offer-care').length,1);
 assert.equal((await post('followup/care',{kind:'issue',content:'Customer requests delivery date'},other)).status,403);
 assert.equal((await post('followup/care',{kind:'issue',content:'Customer requests delivery date'},carer)).status,200);
 assert.equal((await post('followup/care',{kind:'close',content:'Done'},carer)).status,409);
 const issue=(await read()).entry.entries.find(e=>e.kind==='issue');assert.equal((await post('followup/care',{kind:'resolve',issueId:issue.id,content:'Confirmed delivery'},carer)).status,200);
 assert.equal((await post('followup/care',{kind:'close',content:'Customer informed'},carer)).status,200);assert.equal((await call('offer-work','GET',undefined,carer)).data.length,0);
 assert.equal((await post('followup/care',{kind:'reopen',content:'Follow up again'},carer)).status,200);assert.equal((await call('offer-work','GET',undefined,carer)).data.length,1);
 await post('followup/care',{kind:'close',content:'Close again'},carer);assert.equal((await post('workflow',{...sent,resend:true},sender)).status,200);assert.equal((await read()).entry.careClosed,false);assert.equal((await call('offer-work','GET',undefined,carer)).data.length,1);
});
test('new approved revision requires new send confirmation while prior care remains; revoked sender is blocked',async t=>{
 const {call,admin,sender,carer,id,read,post}=await setup(t);await post('followup/assign',{senderId:sender.id,careOwnerId:carer.id});await post('workflow',{status:'sent',confirmedSent:true,recipient:'Customer',channel:'Email',reason:'Sent',careOwnerId:carer.id},sender);
 assert.equal((await call('quotes/'+id+'/reopen','POST',{expectedVersion:3,reason:'New price'})).status,200);await call('quotes/'+id+'/submit','POST',{expectedVersion:4});await call('quotes/'+id+'/approve','POST',{expectedVersion:5});const current=await read();assert.equal(current.offerVersion,6);assert.equal(current.workflow.status,'draft');assert.equal(current.entry.sentAt,undefined);assert.ok((await read(3)).entry.sentAt);
 assert.equal((await post('followup/care',{kind:'feedback',content:'Discuss earlier offer'},carer,3)).status,200);
 assert.ok((await call('notifications','GET',undefined,sender)).data.items.some(n=>n.stage==='offer-send'&&n.quoteVersion===6));
 assert.equal((await call('users/'+sender.id+'/disable','POST',{})).status,200);assert.equal((await call('quotes/'+id+'/followup','GET',undefined,sender)).status,401);assert.equal((await read()).entry.senderActive,false);
 assert.equal((await post('followup/assign',{senderId:sender.id},admin,6)).status,400);
});
