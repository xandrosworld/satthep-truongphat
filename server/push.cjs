'use strict';
const webpush=require('web-push'),{permissions}=require('./access.cjs'),{receives}=require('./notifications.cjs');
// An outbox is filled in the same transaction as the message/notification.
function createPush({sql,fail,readBody,transport=webpush.sendNotification.bind(webpush),interval=3000}){
 const one=(s,...a)=>sql.prepare(s).get(...a),all=(s,...a)=>sql.prepare(s).all(...a),run=(s,...a)=>sql.prepare(s).run(...a);
 sql.exec(`CREATE TABLE IF NOT EXISTS push_keys(id INTEGER PRIMARY KEY,public_key TEXT NOT NULL,private_key TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS push_subscriptions(endpoint TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),session_token TEXT NOT NULL,subscription TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS push_outbox(id INTEGER PRIMARY KEY,endpoint TEXT NOT NULL,kind TEXT NOT NULL,reference TEXT NOT NULL,user_id TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,due INTEGER NOT NULL,created INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS push_due ON push_outbox(due);
 CREATE TRIGGER IF NOT EXISTS push_account_change AFTER UPDATE OF password,active,role,section_access,can_view_costs,can_approve,deleted_at ON users BEGIN DELETE FROM push_subscriptions WHERE user_id=NEW.id; END;
 CREATE TRIGGER IF NOT EXISTS push_chat AFTER INSERT ON chat_messages BEGIN
 INSERT INTO push_outbox(endpoint,kind,reference,user_id,due,created) SELECT s.endpoint,'chat',CAST(NEW.seq AS TEXT),s.user_id,unixepoch()*1000,unixepoch()*1000 FROM push_subscriptions s JOIN chat_members m ON m.user_id=s.user_id AND m.room=NEW.room WHERE s.user_id!=NEW.sender; END;
 CREATE TRIGGER IF NOT EXISTS push_work AFTER INSERT ON notifications BEGIN
 INSERT INTO push_outbox(endpoint,kind,reference,user_id,due,created) SELECT endpoint,'work',NEW.id,user_id,unixepoch()*1000,unixepoch()*1000 FROM push_subscriptions WHERE user_id=NEW.user_id; END;
 CREATE TRIGGER IF NOT EXISTS push_unsubscribe AFTER DELETE ON push_subscriptions BEGIN DELETE FROM push_outbox WHERE endpoint=OLD.endpoint; END;`);
 let keys=one('SELECT * FROM push_keys WHERE id=1');if(!keys){const k=webpush.generateVAPIDKeys();run('INSERT INTO push_keys VALUES(1,?,?)',k.publicKey,k.privateKey);keys=one('SELECT * FROM push_keys WHERE id=1');}
 const vapidDetails={subject:'mailto:notifications@truongphat-group.xyz',publicKey:keys.public_key,privateKey:keys.private_key};
 let busy=false,stopped=false;const testTimes=new Map();
 function eligible(job){const user=one('SELECT * FROM users WHERE id=? AND active=1 AND deleted_at IS NULL',job.user_id);if(!user)return false;
  if(job.kind==='test')return true;
  if(job.kind==='chat')return one('SELECT 1 FROM chat_messages c JOIN chat_members m ON m.room=c.room WHERE c.seq=? AND c.recalled_at IS NULL AND m.user_id=? AND m.last_read<c.seq',job.reference,user.id);
  const n=one('SELECT e.stage,e.actor FROM notifications n JOIN handoff_events e ON e.id=n.event_id WHERE n.id=? AND n.user_id=? AND n.read_at IS NULL',job.reference,user.id);return n&&n.actor!==user.id&&receives(permissions(user),n.stage);
 }
 async function flush(){if(busy||stopped)return;busy=true;try{
  run('DELETE FROM push_outbox WHERE created<?',Date.now()-86400000);
  for(const job of all('SELECT * FROM push_outbox WHERE due<=? ORDER BY id LIMIT 30',Date.now())){if(stopped)break;const sub=one('SELECT * FROM push_subscriptions WHERE endpoint=? AND user_id=?',job.endpoint,job.user_id);if(!sub||!eligible(job)){run('DELETE FROM push_outbox WHERE id=?',job.id);continue;}
   try{await transport(JSON.parse(sub.subscription),JSON.stringify({title:'Trường Phát',body:job.kind==='test'?'Thông báo thử đã đến thiết bị của bạn.':job.kind==='chat'?'Bạn có tin nhắn mới. Mở phần mềm để xem.':'Bạn có thông báo công việc mới. Mở phần mềm để xem.',tag:'tp-'+job.kind+'-'+job.reference,url:'/',userId:job.user_id}),{vapidDetails,TTL:3600,urgency:'high',timeout:10000});if(!stopped)run('DELETE FROM push_outbox WHERE id=?',job.id);}
   catch(e){if(stopped)break;if([404,410].includes(e.statusCode))run('DELETE FROM push_subscriptions WHERE endpoint=?',job.endpoint);else if(job.attempts>=5)run('DELETE FROM push_outbox WHERE id=?',job.id);else run('UPDATE push_outbox SET attempts=attempts+1,due=? WHERE id=?',Date.now()+Math.min(3600000,30000*2**job.attempts),job.id);}
  }
 }finally{busy=false;}}
 const timer=interval?setInterval(()=>flush().catch(()=>{}),interval):null;timer?.unref();
 function validSubscription(s){let u;try{u=new URL(s?.endpoint);}catch{fail(400,'Địa chỉ thông báo không hợp lệ');}
  const host=u.hostname; // Only browser push providers; never fetch arbitrary caller URLs.
  if(u.protocol!=='https:'||u.port||u.username||u.password||u.hash||s.endpoint.length>2048||!(host==='fcm.googleapis.com'||host==='updates.push.services.mozilla.com'||host.endsWith('.push.apple.com')||host==='web.push.apple.com'||host.endsWith('.notify.windows.com')))fail(400,'Nhà cung cấp thông báo không hỗ trợ');
  if(!/^[A-Za-z0-9_-]{87}$/.test(s.keys?.p256dh||'')||!/^[A-Za-z0-9_-]{22}$/.test(s.keys?.auth||''))fail(400,'Khóa thiết bị không hợp lệ');
  return {endpoint:s.endpoint,keys:{p256dh:s.keys.p256dh,auth:s.keys.auth}};
 }
 async function handle({req,route,user,send}){if(route==='/api/push/test'&&req.method==='POST'){
   const body=await readBody(req),endpoint=String(body.endpoint||'');if(!one('SELECT 1 FROM push_subscriptions WHERE endpoint=? AND user_id=?',endpoint,user.id))fail(400,'Thiết bị chưa bật thông báo cho tài khoản này');
   const now=Date.now();if(now-(testTimes.get(user.id)||0)<60000)fail(429,'Chờ một phút trước khi gửi thử lại');for(const [id,at]of testTimes)if(now-at>=60000)testTimes.delete(id);testTimes.set(user.id,now);
   run('INSERT INTO push_outbox(endpoint,kind,reference,user_id,due,created) VALUES(?,?,?,?,?,?)',endpoint,'test',String(now),user.id,now+10000,now);send(202,{ok:true,delaySeconds:10});return true;
  }if(route!=='/api/push')return false;
  if(req.method==='GET'){send(200,{publicKey:keys.public_key});return true;}
  const body=await readBody(req);
  if(req.method==='POST'){const s=validSubscription(body.subscription);if(!one('SELECT 1 FROM push_subscriptions WHERE endpoint=?',s.endpoint)&&one('SELECT COUNT(*) AS n FROM push_subscriptions WHERE user_id=?',user.id).n>=20)fail(400,'Đã đăng ký quá nhiều thiết bị');if(one('SELECT user_id FROM push_subscriptions WHERE endpoint=?',s.endpoint)?.user_id!==user.id)run('DELETE FROM push_subscriptions WHERE endpoint=?',s.endpoint);run('INSERT INTO push_subscriptions VALUES(?,?,?,?,?) ON CONFLICT(endpoint) DO UPDATE SET session_token=excluded.session_token,subscription=excluded.subscription',s.endpoint,user.id,user.token,JSON.stringify(s),Date.now());send(200,{ok:true});return true;}
  if(req.method==='DELETE'){run('DELETE FROM push_subscriptions WHERE endpoint=? AND user_id=?',String(body.endpoint||''),user.id);send(200,{ok:true});return true;}return false;
 }
 return {handle,flush,stop(){stopped=true;clearInterval(timer);},logout(token){run('DELETE FROM push_subscriptions WHERE session_token=?',token);}};
}
module.exports={createPush};
