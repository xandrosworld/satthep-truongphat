'use strict';
const AA=require('../action-access.js'),F=require('../completion-core.js'),R=require('../reporting-core.js');
function createDashboard({sql,fail,business}){
 const all=(query,...args)=>sql.prepare(query).all(...args);
 const list=(table,kind)=>all('SELECT id,document FROM '+table+' WHERE kind=?',kind).map(r=>({...JSON.parse(r.document),id:r.id}));
 function handle({req,route,user,send}){
  if(route!=='/api/dashboard')return false;
  if(req.method!=='GET')fail(405,'Tổng quan chỉ đọc dữ liệu');
  const can=key=>AA.allows(user,key,'view',false);
  if(!can('reports'))fail(403,'Chưa có quyền xem tổng quan');
  const today=F.todayVN(),month=today.slice(0,7),start=new Date(Date.UTC(Number(today.slice(0,4)),Number(today.slice(5,7))-12,1)).toISOString().slice(0,10),now=new Date().toISOString();
  const rights={revenue:can('orders'),production:can('production'),inventory:can('inventory'),inventoryValue:can('costs')&&require('./access.cjs').permissions(user).costs,debt:can('contracts')&&can('payments'),finance:false};
  const orders=rights.revenue?all('SELECT id FROM orders').map(o=>business.order(o.id)):[];
  const jobs=rights.production?all('SELECT * FROM production_jobs').map(j=>({...j,packet:JSON.parse(j.packet),progress:JSON.parse(j.progress)})):[];
  const contracts=can('contracts')?list('business_records','contract'):[];
  const data={now,orders:orders.map(o=>({...o,customerKey:o.customerId,meta:o.meta})),jobs,contracts:[],payments:[],cash:[],stageMovements:[],lots:rights.inventory?list('ops_records','lot'):[],materials:rights.inventory?list('ops_records','material'):[],movements:rights.inventory?all('SELECT document FROM stock_movements').map(r=>JSON.parse(r.document)):[]};
  const report=R.build(data,{kind:'overview',from:start,to:today},{...rights,debt:false}),table=id=>report.tables.find(t=>t.id===id)?.rows||[];
  const monthly=table('revenue-month'),current=monthly.find(r=>r.month===month)?.revenue||0;
  const payments=rights.debt?list('business_records','payment').filter(p=>!p.voidedAt&&p.date<=today):[];
  const debt=rights.debt?contracts.filter(c=>['active','completed'].includes(c.status)&&(c.startDate||c.createdAt||'').slice(0,10)<=today).reduce((sum,c)=>sum+Math.max(0,Number(c.value||0)-payments.filter(p=>p.contractId===c.id).reduce((n,p)=>n+Number(p.amount||0),0)),0):null;
  const cards=[
   {label:'Doanh thu tháng này',value:rights.revenue?current:null,unit:'đ',note:'Đơn đã giao · chưa thuế'},
   {label:'Đơn hàng',value:rights.revenue?orders.filter(o=>o.status!=='cancelled').length:null,unit:'đơn',note:'Tổng đơn còn hiệu lực'},
   {label:'Lệnh sản xuất',value:rights.production?jobs.length:null,unit:'lệnh',note:'Tổng lệnh đã phát hành'},
   {label:'Đang sản xuất',value:rights.production?jobs.filter(j=>j.state==='running').length:null,unit:'lệnh',note:'Không gồm lệnh chờ QC'},
   {label:'Giá trị tồn vật tư',value:rights.inventory&&rights.inventoryValue?table('inventory-balance').reduce((n,r)=>n+Number(r.closingValue||0),0):null,unit:'đ',note:'Theo chứng từ kho đến hôm nay'},
   {label:'Công nợ phải thu',value:debt,unit:'đ',note:'Hợp đồng hiệu lực trừ tiền đã thu'}
  ];
  const months=rights.revenue?Array.from({length:12},(_,i)=>{const m=new Date(Date.UTC(Number(start.slice(0,4)),Number(start.slice(5,7))-1+i,1)).toISOString().slice(0,7);return {label:m,value:monthly.find(r=>r.month===m)?.revenue||0};}):[];
  const orderStates=rights.revenue?Object.entries(require('./business.cjs').ORDER_STATES).map(([key,label])=>({label,value:orders.filter(o=>o.status===key).length})):[];
  const stageMap=new Map();for(const j of jobs){const op=j.progress.operations?.find(o=>o.status==='running')||j.progress.operations?.find(o=>o.status!=='done'),label=j.state==='completed'?'Hoàn thành':j.state==='qc'?'Chờ QC':op?(j.packet.operations.find(o=>o.id===op.id)?.name||'Chưa khai tên công đoạn'):'Chưa khai công đoạn';stageMap.set(label,(stageMap.get(label)||0)+1);}
  const alerts=[],add=(type,title,rows,target)=>alerts.push({type,title,count:rows.length,rows:rows.slice(0,20),target});
  if(rights.production)add('late','Lệnh trễ hạn',jobs.filter(j=>j.state!=='completed'&&j.progress.deadline&&j.progress.deadline<today).map(j=>({id:j.id,label:j.code,detail:j.progress.deadline})), 'production');
  if(rights.inventory)add('low','Vật tư đến ngưỡng tối thiểu',table('inventory-low').map(m=>({id:m.materialId,label:m.name,detail:m.closing+' / '+m.minimum+' '+m.unit})),'inventory');
  const limit=new Date(Date.parse(today+'T00:00:00Z')+30*86400000).toISOString().slice(0,10);
  if(can('contracts'))add('expiring','Hợp đồng hết hạn trong 30 ngày',contracts.filter(c=>c.status==='active'&&c.endDate>=today&&c.endDate<=limit).map(c=>({id:c.id,label:c.code,detail:c.endDate})),'contracts');
  if(can('purchasing'))add('purchases','Đề nghị mua chờ duyệt',list('ops_records','purchase').filter(p=>p.state==='pending').map(p=>({id:p.id,label:p.code,detail:p.created?.slice(0,10)||''})),'purchasing');
  // Audit details can contain prices, personal data and before/after payloads: never return them here.
  const activity=can('audit')?all('SELECT a.at,a.action,u.name AS actor FROM audit a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.seq DESC LIMIT 10'):null;
  send(200,{generatedAt:now,today,cards,months,orderStates,stages:[...stageMap].map(([label,value])=>({label,value})),alerts,activity,rights});return true;
 }
 return {handle};
}
module.exports={createDashboard};
