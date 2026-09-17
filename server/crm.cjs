'use strict';
const CF=require('../customer-fields-core.js'),CRM=require('../crm-core.js'),{customer}=require('../intake-core.js');
function createCrm({sql,fail,readBody,audit}){
 sql.exec('CREATE TABLE IF NOT EXISTS customer_policy(id INTEGER PRIMARY KEY CHECK(id=1),version INTEGER NOT NULL,document TEXT NOT NULL)');
 const read=id=>{const r=sql.prepare('SELECT document,version FROM intake_customers WHERE id=?').get(id);if(!r)fail(404,'Không tìm thấy khách hàng');return {...JSON.parse(r.document),version:r.version};};
 const owner=id=>{if(typeof id!=='string'||id.length>100)fail(400,'Người phụ trách không hợp lệ');if(id&&!sql.prepare('SELECT id FROM users WHERE id=? AND active=1').get(id))fail(400,'Người phụ trách không hoạt động');};
 const save=(value,version)=>{const next=version+1;delete value.version;sql.prepare('INSERT INTO intake_customers(id,version,document) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,document=excluded.document').run(value.id,next,JSON.stringify(value));return {...value,version:next};};
 function related(id){const quotes=sql.prepare('SELECT id,code,status,version,total,updated,document FROM quotes ORDER BY updated DESC').all().filter(r=>JSON.parse(r.document).quote.customerInfo?.id===id).map(({document,...r})=>({...r,opportunityId:JSON.parse(document).quote.opportunityId||''}));const orders=sql.prepare('SELECT id,code,quote_id,at,package FROM orders ORDER BY at DESC').all().filter(r=>JSON.parse(r.package).quote?.customerInfo?.id===id).map(({package:packet,...r})=>r);return {quotes,orders,orderCount:orders.length};}
 return {async handle({req,route,user,rights,send}){
  if(route==='/api/intake/owners'&&req.method==='GET'){send(200,sql.prepare('SELECT id,name,role,active FROM users ORDER BY name').all());return true;}
  if(route==='/api/intake/policy'){
   const r=sql.prepare('SELECT version,document FROM customer_policy WHERE id=1').get(),old={...CRM.policy(),...(r?JSON.parse(r.document):{}),version:r?.version||0};
   if(req.method==='GET'){send(200,old);return true;}if(req.method!=='POST')fail(405,'Phương thức không hỗ trợ');if(!rights.users)fail(403,'Chỉ quản trị cấu hình chính sách khách hàng');const b=await readBody(req);const current=sql.prepare('SELECT version FROM customer_policy WHERE id=1').get()?.version||0;if(b.expectedVersion!==current||current!==old.version)fail(409,'Chính sách đã đổi; tải lại');let v;try{v=CRM.policy({...b.policy,fields:b.policy?.fields??old.fields});}catch(e){fail(400,e.message);}sql.prepare('INSERT INTO customer_policy VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,document=excluded.document').run(old.version+1,JSON.stringify(v));audit(user,'customer-policy','policy',JSON.stringify({before:old,after:v}));send(200,{...v,version:old.version+1});return true;
  }
  const match=route.match(/^\/api\/intake\/customers\/([a-zA-Z0-9_-]{1,100})(?:\/(interaction|opportunity|assign))?$/);
  if(match&&req.method==='GET'&&!match[2]){const c=read(match[1]);send(200,{customer:c,...related(c.id)});return true;}
  if(req.method!=='POST'||!match&&route!=='/api/intake/customers')return false;
  if(!rights.edit||!rights.sections.includes('customer'))fail(403,'Không có quyền sửa hồ sơ khách hàng');
  const b=await readBody(req),at=new Date().toISOString();
  if(match){if(!match[2])fail(405,'Phương thức không hỗ trợ');const c=read(match[1]);if(b.expectedVersion!==c.version)fail(409,'Hồ sơ khách hàng đã đổi; tải lại trước khi lưu');if(match[2]==='assign'){if(!rights.users)fail(403,'Chỉ quản trị được điều chuyển');owner(b.ownerId);}let value;try{value=CRM.update(c,match[2],b,user,at);}catch(e){fail(400,e.message);}if(value.events.length>10000||value.opportunities.length>2000)fail(400,'Hồ sơ vượt giới hạn lưu trữ');const saved=save(value,c.version);audit(user,'customer:'+match[2],c.id);send(200,saved);return true;}
  let value;try{value=customer(b.customer||{});}catch(e){fail(400,e.message);}if(!/^[a-zA-Z0-9_-]{1,100}$/.test(value.id))fail(400,'Mã khách hàng không hợp lệ');
  const previous=sql.prepare('SELECT document,version FROM intake_customers WHERE id=?').get(value.id),old=previous?JSON.parse(previous.document):null;
  if((previous?.version||0)!==b.expectedVersion)fail(409,'Thông tin khách đã đổi. Tải lại trước khi lưu.');
  if(old)try{value=customer({...old,...b.customer,account:{...old.account,...b.customer?.account}});}catch(e){fail(400,e.message);}
  const requestedOwner=b.customer?.ownerId;if(old){if(requestedOwner!==undefined&&requestedOwner!==(old.ownerId||''))fail(400,'Dùng Điều chuyển và ghi lý do khi đổi người phụ trách');value.ownerId=old.ownerId||'';}else {value.ownerId=requestedOwner?value.ownerId:user.id;owner(value.ownerId);if(!rights.users&&value.ownerId!==user.id)fail(403,'Chỉ quản trị được giao khách cho người khác');}
  const fieldPolicy=sql.prepare('SELECT document FROM customer_policy WHERE id=1').get();try{CF.validate(value,fieldPolicy?JSON.parse(fieldPolicy.document).fields:undefined);}catch(e){fail(400,e.message);}
  if(['vip','risk'].includes(value.rating)&&!value.ratingReason)fail(400,'Ghi căn cứ đánh giá VIP hoặc rủi ro');
  value=CRM.saveProfile(old,value,user,at);if(value.events.length>10000)fail(400,'Hồ sơ vượt giới hạn lịch sử');const saved=save(value,previous?.version||0);audit(user,'customer',value.id);send(200,saved);return true;
 }};
}
module.exports={createCrm};
