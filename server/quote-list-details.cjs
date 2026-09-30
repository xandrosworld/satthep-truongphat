'use strict';
const {stored}=require('./organization.cjs');
// Return only display metadata, never personnel profiles or commercial notes.
function listDetails(sql,id,quote,progress){
 const read=(table,key,value)=>{const row=sql.prepare(`SELECT document FROM ${table} WHERE ${key}=?`).get(value);return row?JSON.parse(row.document):{};};
 const customer=quote.customerInfo?.id?read('intake_customers','id',quote.customerInfo.id):{},commercial=read('commercial','id',id),handoffs=read('quote_handoffs','quote_id',id);
 const latest=sql.prepare("SELECT version,at FROM revisions WHERE id=? AND status='approved' ORDER BY version DESC LIMIT 1").get(id);
 const dispatch=latest?commercial.dispatches?.[latest.version]:null;
 const person=id=>id?sql.prepare('SELECT id,name FROM users WHERE id=?').get(id)||null:null;
 const salesOwner=person(customer.ownerId)||person(dispatch?.careOwnerId)||person(dispatch?.senderId);
 const org=stored(sql)||{employees:[],positions:[],departments:[]};
 function departments(userId,stage){
  const employee=org.employees.find(e=>e.userId===userId&&e.active!==false),positions=org.positions.filter(p=>p.active!==false&&employee?.positionIds?.includes(p.id));
  const active=d=>{const seen=new Set();while(d){if(d.active===false||seen.has(d.id))return false;seen.add(d.id);if(!d.parentId)return true;d=org.departments.find(x=>x.id===d.parentId);}return false;};
  return org.departments.filter(d=>d.stage===stage&&active(d)&&positions.some(p=>p.departmentId===d.id)).map(d=>d.name);
 }
 const stages=Object.fromEntries(['intake','technical','materials'].map(key=>{const who=progress?.work?.[key]||person(handoffs[key]?.actorId)||(key==='intake'?salesOwner:null);return [key,{person:who?.name||progress?.[key]?.actor||'',departments:departments(who?.id,key==='intake'?'sales':key)}];}));
 const dispatches=Object.values(commercial.dispatches||{}),careCount=dispatches.reduce((n,d)=>n+(d.entries||[]).filter(e=>e.kind==='care').length,0);
 return {salesOwner,stages,careCount,offerVersion:latest?.version||null,deadline:quote.request?.quoteDeadline||null,approvedAt:quote.status==='approved'?latest?.at||null:null};
}
module.exports={listDetails};
