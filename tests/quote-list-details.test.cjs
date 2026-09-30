const {test}=require('node:test'),A=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),{listDetails}=require('../server/quote-list-details.cjs');
test('list metadata uses customer owner, declared deadline, approved revision date and explicit care records',()=>{
 const sql=new DatabaseSync(':memory:');try{
 sql.exec('CREATE TABLE users(id TEXT,name TEXT); CREATE TABLE intake_customers(id TEXT,document TEXT); CREATE TABLE commercial(id TEXT,document TEXT); CREATE TABLE quote_handoffs(quote_id TEXT,document TEXT); CREATE TABLE revisions(id TEXT,version INTEGER,status TEXT,at TEXT); CREATE TABLE organization(id INTEGER,version INTEGER,document TEXT)');
 sql.exec("INSERT INTO users VALUES('sales','Sales Owner'),('tech','Engineer'),('sender','Sender'); INSERT INTO revisions VALUES('q',2,'approved','2026-09-29T02:00:00Z'),('q',3,'draft','2026-09-30T02:00:00Z')");
 const put=(table,key,value)=>sql.prepare(`INSERT INTO ${table} VALUES(?,?)`).run(key,JSON.stringify(value));
 put('intake_customers','customer',{ownerId:'sales'});put('commercial','q',{dispatches:{1:{entries:[{kind:'care'},{kind:'feedback'},{kind:'schedule'}]},2:{senderId:'sender',entries:[{kind:'sent'},{kind:'care'},{kind:'care'}]}}});put('quote_handoffs','q',{technical:{actorId:'tech'}});
 sql.prepare('INSERT INTO organization VALUES(1,1,?)').run(JSON.stringify({employees:[{userId:'tech',active:true,positionIds:['position']}],positions:[{id:'position',active:true,departmentId:'dep'}],departments:[{id:'dep',name:'Engineering',active:true,stage:'technical'}]}));
 const q={status:'approved',customerInfo:{id:'customer'},request:{quoteDeadline:'2026-10-03'}},r=listDetails(sql,'q',q,{});
 A.equal(r.salesOwner.name,'Sales Owner');A.equal(r.deadline,'2026-10-03');A.equal(r.approvedAt,'2026-09-29T02:00:00Z');A.equal(r.careCount,3);A.deepEqual(r.stages.technical,{person:'Engineer',departments:['Engineering']});A.equal(listDetails(sql,'q',{...q,status:'draft'},{}).approvedAt,null);
 A.equal(listDetails(sql,'empty',{},{}).salesOwner,null);A.equal(listDetails(sql,'empty',{},{}).careCount,0);
 }finally{sql.close();}
});
