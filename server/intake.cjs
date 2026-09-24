'use strict';
function createIntake({sql,fail,readBody,audit}){
 sql.exec('CREATE TABLE IF NOT EXISTS intake_customers(id TEXT PRIMARY KEY,version INTEGER NOT NULL,document TEXT NOT NULL); CREATE TABLE IF NOT EXISTS intake_files(id TEXT PRIMARY KEY,name TEXT NOT NULL,size INTEGER NOT NULL,data TEXT NOT NULL,actor TEXT NOT NULL);');
 const crm=require('./crm.cjs').createCrm({sql,fail,readBody,audit});
 sql.exec('CREATE TABLE IF NOT EXISTS offer_term_templates(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,document TEXT NOT NULL,actor TEXT NOT NULL,at TEXT NOT NULL)');
 return {async handle({req,route,user,rights,send}){
  if(!route.startsWith('/api/intake/'))return false;
  if(route==='/api/intake/offer-templates'){
   if(!rights.commercial)fail(403,'Không có quyền sửa bản chào giá');
   if(req.method==='GET'){send(200,sql.prepare('SELECT * FROM offer_term_templates ORDER BY id DESC LIMIT 200').all().map(r=>({...r,data:JSON.parse(r.document),document:undefined})));return true;}
   if(req.method==='POST'){
    const b=await readBody(req),name=String(b.name||'').trim(),data={};if(!name||name.length>120)fail(400,'Tên mẫu cần từ 1 đến 120 ký tự');
    for(const key of ['delivery','installation','payment','warranty','scope','signature','signerTitle','customerTitle','signer']){if(b.data?.[key]!=null&&typeof b.data[key]!=='string')fail(400,'Nội dung mẫu không hợp lệ');data[key]=String(b.data?.[key]||'').trim();if(data[key].length>2000)fail(400,'Nội dung mẫu quá dài');}
    if(!['','issuer','both','none'].includes(data.signature))fail(400,'Mẫu ký không hợp lệ');
    const document=JSON.stringify(data),old=sql.prepare('SELECT id FROM offer_term_templates WHERE name=? AND document=?').get(name,document);if(old){send(200,old);return true;}
    const result=sql.prepare('INSERT INTO offer_term_templates(name,document,actor,at) VALUES(?,?,?,?)').run(name,document,user.id,new Date().toISOString());audit(user,'offer-template',String(result.lastInsertRowid));send(201,{id:Number(result.lastInsertRowid)});return true;
   }
   fail(405,'Phương thức không hợp lệ');
  }
  if(!rights.costs&&!(rights.customers&&route==='/api/intake/customers')&&!((rights.technical||rights.customers)&&/^\/api\/intake\/files(?:\/[a-zA-Z0-9_-]{1,100})?$/.test(route)))fail(403,'Không có quyền xem tài liệu yêu cầu và danh bạ nội bộ');
  if(await crm.handle({req,route,user,rights,send}))return true;
  if(route==='/api/intake/customers'&&req.method==='GET'){send(200,sql.prepare('SELECT document,version FROM intake_customers ORDER BY rowid DESC').all().map(r=>{const c={...JSON.parse(r.document),version:r.version};return rights.costs?c:require('./crm.cjs').basicCustomer(c);}));return true;}
  if(!['GET','HEAD'].includes(req.method)&&(!rights.customers&&(!rights.edit||!rights.sections.includes('customer'))))fail(403,'Không có quyền sửa dữ liệu đầu vào');
  if(route==='/api/intake/files'&&req.method==='POST'){const b=await readBody(req,15000000);if(!/^[a-zA-Z0-9_-]{1,100}$/.test(b.id||'')||typeof b.name!=='string'||b.name.length>250||!(/\.(png|jpe?g|webp|pdf|xlsx|xls|csv)$/i).test(b.name)||typeof b.data!=='string'||!(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/).test(b.data))fail(400,'Tệp nguồn không hợp lệ');const size=Buffer.from(b.data,'base64').length;if(size>10*1024*1024||size!==b.size)fail(413,'Dung lượng tệp không hợp lệ, tối đa 10 MB');if(sql.prepare('SELECT id FROM intake_files WHERE id=?').get(b.id))fail(409,'Mã tệp đã tồn tại');sql.prepare('INSERT INTO intake_files VALUES(?,?,?,?,?)').run(b.id,b.name,size,b.data,user.id);audit(user,'source-file',b.id);send(201,{id:b.id,name:b.name,size});return true;}
  const match=route.match(/^\/api\/intake\/files\/([a-zA-Z0-9_-]{1,100})$/);if(match&&req.method==='GET'){
   if(rights.technical||!rights.costs){const linked=sql.prepare('SELECT document FROM quotes').all().some(row=>JSON.parse(row.document).quote?.request?.files?.some(f=>f.id===match[1]&&f.storage==='server')),own=sql.prepare('SELECT actor FROM intake_files WHERE id=?').get(match[1]);if(!linked&&own?.actor!==user.id)fail(403,'Tệp chưa thuộc yêu cầu của báo giá');}
   const r=sql.prepare('SELECT id,name,size,data FROM intake_files WHERE id=?').get(match[1]);if(!r)fail(404,'Không tìm thấy tệp nguồn');send(200,r);return true;}
  fail(404,'Không tìm thấy dữ liệu đầu vào');
 }};
}
module.exports={createIntake};
