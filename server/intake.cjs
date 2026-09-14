'use strict';
const {customer}=require('../intake-core.js');
function createIntake({sql,fail,readBody,audit}){
 sql.exec('CREATE TABLE IF NOT EXISTS intake_customers(id TEXT PRIMARY KEY,version INTEGER NOT NULL,document TEXT NOT NULL); CREATE TABLE IF NOT EXISTS intake_files(id TEXT PRIMARY KEY,name TEXT NOT NULL,size INTEGER NOT NULL,data TEXT NOT NULL,actor TEXT NOT NULL);');
 return {async handle({req,route,user,rights,send}){
  if(!route.startsWith('/api/intake/'))return false;
  if(!rights.costs)fail(403,'Không có quyền xem tài liệu yêu cầu và danh bạ nội bộ');
  if(route==='/api/intake/customers'&&req.method==='GET'){send(200,sql.prepare('SELECT document,version FROM intake_customers ORDER BY rowid DESC').all().map(r=>({...JSON.parse(r.document),version:r.version})));return true;}
  if(!['GET','HEAD'].includes(req.method)&&!rights.edit)fail(403,'Không có quyền sửa dữ liệu đầu vào');
  if(route==='/api/intake/customers'&&req.method==='POST'){const body=await readBody(req);let value;try{value=customer(body.customer||{});}catch(e){fail(400,e.message);}const old=sql.prepare('SELECT version FROM intake_customers WHERE id=?').get(value.id);if((old?.version||0)!==body.expectedVersion)fail(409,'Thông tin khách đã đổi. Tải lại trước khi lưu.');const version=(old?.version||0)+1;sql.prepare('INSERT INTO intake_customers(id,version,document) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,document=excluded.document').run(value.id,version,JSON.stringify(value));audit(user,'customer',value.id);send(200,{...value,version});return true;}
  if(route==='/api/intake/files'&&req.method==='POST'){const b=await readBody(req,15000000);if(!/^[a-zA-Z0-9_-]{1,100}$/.test(b.id||'')||typeof b.name!=='string'||b.name.length>250||!(/\.(png|jpe?g|webp|pdf|xlsx|xls|csv)$/i).test(b.name)||typeof b.data!=='string'||!(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/).test(b.data))fail(400,'Tệp nguồn không hợp lệ');const size=Buffer.from(b.data,'base64').length;if(size>10*1024*1024||size!==b.size)fail(413,'Dung lượng tệp không hợp lệ, tối đa 10 MB');if(sql.prepare('SELECT id FROM intake_files WHERE id=?').get(b.id))fail(409,'Mã tệp đã tồn tại');sql.prepare('INSERT INTO intake_files VALUES(?,?,?,?,?)').run(b.id,b.name,size,b.data,user.id);audit(user,'source-file',b.id);send(201,{id:b.id,name:b.name,size});return true;}
  const match=route.match(/^\/api\/intake\/files\/([a-zA-Z0-9_-]{1,100})$/);if(match&&req.method==='GET'){const r=sql.prepare('SELECT id,name,size,data FROM intake_files WHERE id=?').get(match[1]);if(!r)fail(404,'Không tìm thấy tệp nguồn');send(200,r);return true;}
  fail(404,'Không tìm thấy dữ liệu đầu vào');
 }};
}
module.exports={createIntake};
