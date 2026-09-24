'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs');
test('chat reactions and recall enforce membership, ownership, retries and sanitize every message surface',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=(r.headers.get('content-type')||'').includes('json')?await r.json():null;return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data?.csrf};}
 const password='Interaction-test-2026!',admin=await call('setup','POST',{username:'admin',name:'Admin',password}),users={};for(const name of ['staff','other']){const u=await call('users','POST',{username:name,name,role:'technical',password},admin);users[name]={...await call('login','POST',{username:name,password}),id:u.data.id};}
 const room=(await call('chat/rooms','POST',{kind:'direct',members:[users.staff.id]},admin)).data.id,path='chat/rooms/'+room+'/messages';
 const payload={clientId:randomUUID(),body:'Sensitive original',mentions:[users.staff.id],image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='};
 const msg=(await call(path,'POST',payload,admin)).data,react='chat/messages/'+msg.seq+'/reaction',recall='chat/messages/'+msg.seq+'/recall';
 A.equal((await call(react,'PUT',{emoji:'like'},users.other)).status,404);A.equal((await call(react,'PUT',{emoji:'bad'},users.staff)).status,400);A.equal((await call(react,'PUT',{emoji:'heart'},{...users.staff,csrf:''})).status,403);
 A.equal((await call(react,'PUT',{emoji:'like'},users.staff)).status,200);A.equal((await call(react,'PUT',{emoji:'like'},users.staff)).data.reactions.length,1);A.equal((await call(react,'PUT',{emoji:'heart'},users.staff)).data.reactions[0].emoji,'heart');
 A.equal((await call(react,'PUT',{emoji:'like'},admin)).data.reactions.length,2);A.equal((await call(react,'PUT',{emoji:null},users.staff)).data.reactions.length,1);
 let data=(await call(path+'?after='+msg.seq,'GET',undefined,users.staff)).data;A.equal(data.items.length,0);A.equal(data.reactions.length,1);A.equal(data.reactions[0].name,'Admin');
 A.equal(app.sql.prepare('SELECT last_read FROM chat_members WHERE room=? AND user_id=?').get(room,users.staff.id).last_read,0,'reactions do not forge read receipts');
 const reply=(await call(path,'POST',{clientId:randomUUID(),body:'Reply',replyTo:msg.seq},users.staff)).data;
 A.equal((await call(recall,'POST',{},users.staff)).status,403);A.equal((await call(recall,'POST',{},users.other)).status,404);A.equal((await call(recall,'POST',{},admin)).status,200);A.equal((await call(recall,'POST',{},admin)).status,200);
 A.equal((await call('chat/images/'+msg.seq,'GET',undefined,users.staff)).status,404);A.equal((await call(react,'PUT',{emoji:'like'},users.staff)).status,409);A.equal((await call(path,'POST',{clientId:randomUUID(),body:'Late reply',replyTo:msg.seq},users.staff)).status,400);
 data=(await call(path,'GET',undefined,users.staff)).data;const recalled=data.items.find(m=>m.seq===msg.seq);A.equal(recalled.recalled,true);A.equal(recalled.hasImage,false);A.deepEqual(recalled.reactions,[]);A.deepEqual(recalled.mentions,[]);A.ok(!JSON.stringify(data).includes('Sensitive original'));A.equal(data.items.find(m=>m.seq===reply.seq).reply.body,recalled.body);A.ok(data.recalled.includes(msg.seq));
 const retry=(await call(path,'POST',payload,admin)).data;A.equal(retry.recalled,true);A.equal(retry.hasImage,false);
 const backup=(await call('backup','GET',undefined,admin)).data;A.ok(Array.isArray(backup.chatReactions));A.ok(backup.chatMessages.find(m=>m.seq===msg.seq).recalled_at);A.equal(backup.chatMessages.find(m=>m.seq===msg.seq).image,null);
});
