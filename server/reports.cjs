'use strict';
const AA=require('../action-access.js'),F=require('../completion-core.js'),R=require('../reporting-core.js');
function createReports({sql,fail,audit}){
 const all=(s,...a)=>sql.prepare(s).all(...a),list=(table,kind)=>all('SELECT id,document FROM '+table+' WHERE kind=?',kind).map(r=>({...JSON.parse(r.document),id:r.id}));
 async function handle({req,route,user,send}){
  if(route!=='/api/reports')return false;
  if(req.method!=='GET')fail(405,'Báo cáo chỉ đọc dữ liệu');const can=(key,action='view')=>AA.allows(user,key,action,false);
  if(!can('reports'))fail(403,'Chưa có quyền xem báo cáo');const p=require('./access.cjs').permissions(user),rights={production:can('production'),inventory:can('inventory'),revenue:can('orders'),debt:can('contracts')&&can('payments'),finance:can('finance')&&p.costs,inventoryValue:can('costs')&&p.costs};
  const url=new URL(req.url,'http://localhost'),kind=url.searchParams.get('kind')||'overview',from=url.searchParams.get('from')||F.todayVN().slice(0,7)+'-01',to=url.searchParams.get('to')||F.todayVN();
  if(!['overview','production','revenue','inventory'].includes(kind))fail(400,'Báo cáo không hợp lệ');if(!F.validDate(from)||!F.validDate(to)||from>to)fail(400,'Khoảng ngày không hợp lệ');
  if(kind!=='overview'&&!rights[kind]||kind==='overview'&&!['production','inventory','revenue','finance'].some(k=>rights[k]))fail(403,'Chưa có quyền dữ liệu nguồn của báo cáo');
  const exportRequested=url.searchParams.get('export')==='1';if(exportRequested&&!can('reports','export'))fail(403,'Chưa có quyền xuất báo cáo');
  const exportable={production:can('production','export'),inventory:can('inventory','export'),revenue:can('orders','export')&&(!rights.debt||can('contracts','export')),finance:can('finance','export')};
  if(exportRequested&&(kind==='overview'?Object.keys(exportable).some(k=>rights[k]&&!exportable[k]):!exportable[kind]))fail(403,'Chưa có quyền xuất dữ liệu phân hệ nguồn');
  const orderMeta=new Map(list('business_records','order').map(o=>[o.id,o]));
  const data={now:new Date().toISOString(),stageMovements:rights.inventory?list('ops_records','stage-movement'):[],orders:rights.revenue?all('SELECT * FROM orders').map(o=>{const d=JSON.parse(o.package);return {id:o.id,code:o.code,customer:d.customer,customerKey:d.quote?.customerInfo?.id||d.customer||'Chưa khai',offer:d.offer,meta:orderMeta.get(o.id)||{}};}):[],contracts:rights.debt?list('business_records','contract'):[],payments:rights.debt||rights.finance?list('business_records','payment'):[],cash:rights.finance?list('enterprise_records','cash'):[],jobs:rights.production?all('SELECT * FROM production_jobs').map(j=>({...j,packet:JSON.parse(j.packet),progress:JSON.parse(j.progress)})):[],lots:rights.inventory?list('ops_records','lot'):[],materials:rights.inventory?list('ops_records','material'):[],movements:rights.inventory?all('SELECT document FROM stock_movements').map(r=>JSON.parse(r.document)):[]};
  const filter={kind,from,to,...Object.fromEntries(['customer','workshop','warehouse'].map(k=>[k,(url.searchParams.get(k)||'').slice(0,200)]))};const out=R.build(data,filter,rights);
  out.filter=filter;out.available=['overview',...['production','revenue','inventory'].filter(k=>rights[k])];out.canExport=can('reports','export')&&(kind==='overview'?Object.keys(exportable).every(k=>!rights[k]||exportable[k]):exportable[kind]);
  if(exportRequested)audit(user,'report-export',kind,JSON.stringify(filter));send(200,out);return true;
 }
 return {handle};
}
module.exports={createReports};
