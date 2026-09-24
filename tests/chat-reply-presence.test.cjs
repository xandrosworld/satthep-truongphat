const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs');
test('reply isolation, retry, history, session presence and expiry',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const password='Reply-test-password-2026!',a=await call('setup','POST',{username:'admin',name:'Admin',password});await call('users','POST',{username:'tech',name:'Tech',role:'technical',password},a);const b=await call('login','POST',{username:'tech',password}),b2=await call('login','POST',{username:'tech',password});
 const room=(await call('chat/rooms','POST',{kind:'direct',members:[b.data.user.id]},a)).data;
 const status=async()=>((await call('chat/rooms','GET',undefined,a)).data[0].members.find(m=>m.id===b.data.user.id).online);
 A.equal(await status(),false);await call('chat/rooms','GET',undefined,b);A.equal(await status(),true);
 await call('chat/rooms','GET',undefined,b2);await call('logout','POST',{},b);A.equal(await status(),true);
 app.sql.prepare('UPDATE sessions SET chat_seen=? WHERE user_id=?').run(Date.now()-76000,b.data.user.id);A.equal(await status(),false);await call('chat/rooms','GET',undefined,b2);A.equal(await status(),true);
 const original=(await call('chat/rooms/'+room.id+'/messages','POST',{clientId:randomUUID(),body:'<script>original</script>'},a)).data;
 const payload={clientId:randomUUID(),body:'Reply',replyTo:original.seq},reply=await call('chat/rooms/'+room.id+'/messages','POST',payload,b2);A.equal(reply.status,201);A.equal(reply.data.reply.body,original.body);A.equal(reply.data.reply.seq,original.seq);A.equal((await call('chat/rooms/'+room.id+'/messages','POST',payload,b2)).data.seq,reply.data.seq);
 A.equal((await call('chat/rooms/'+room.id+'/messages','GET',undefined,a)).data.items.at(-1).reply.seq,original.seq);
 const foreign=app.sql.prepare('INSERT INTO chat_rooms VALUES(?,?,?,?,?,?)');const rid=randomUUID();foreign.run(rid,'group','Other',a.data.user.id,null,new Date().toISOString());const seq=Number(app.sql.prepare('INSERT INTO chat_messages(room,sender,client_id,body,at) VALUES(?,?,?,?,?)').run(rid,a.data.user.id,randomUUID(),'Private','2026-01-01').lastInsertRowid);
 for(const replyTo of [seq,999999,'1',-1])A.equal((await call('chat/rooms/'+room.id+'/messages','POST',{clientId:randomUUID(),body:'bad',replyTo},b2)).status,400);
 await call('logout','POST',{},b2);A.equal(await status(),false);
});
