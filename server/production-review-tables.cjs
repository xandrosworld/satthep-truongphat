'use strict';
const C=require('../core.js'),AA=require('../action-access.js');
function create({sql,fail}){
 const get=(kind,id)=>{const r=sql.prepare('SELECT document FROM ops_records WHERE kind=? AND id=?').get(kind,id);return r?JSON.parse(r.document):null;};
 const list=kind=>sql.prepare('SELECT id,version,document FROM ops_records WHERE kind=?').all(kind).map(r=>({...JSON.parse(r.document),id:r.id,version:r.version}));
 function view(j,u){
  const prices=require('./access.cjs').permissions(u).costs&&AA.allows(u,'costs','view',u.role==='admin');
  const order=sql.prepare('SELECT quote_id,quote_version FROM orders WHERE id=?').get(j.order_id),rev=order&&sql.prepare('SELECT document FROM revisions WHERE id=? AND version=?').get(order.quote_id,order.quote_version);
  let result=null;if(rev){const d=JSON.parse(rev.document);d.quote.products=d.quote.products.filter(p=>p.id===j.product_id);if(d.quote.products[0]){d.quote.products[0].qty=j.quantity;result=C.calculate(d);}}
  const norms=list('reference-norm'),dossier=get('production-dossier',j.id);const machines=list('machine'),catalog=list('operation'),history=sql.prepare('SELECT id,code,packet,progress FROM production_jobs WHERE id<>?').all(j.id).map(r=>({...r,packet:JSON.parse(r.packet),progress:JSON.parse(r.progress)}));
  const rows=j.packet.operations.map(o=>{
   const progress=j.progress.operations.find(x=>x.id===o.id)||{},equipment=dossier?.equipment?.find(e=>e.operationId===o.id),machineId=equipment?.machineId||progress.machineId||o.machineId||'',machine=machines.find(m=>m.id===machineId),catalogue=catalog.find(x=>x.rateId&&x.rateId===o.rateId),rate=machine?.hourRate??catalogue?.hourRate;
   const index=Number(o.id.split(':').pop()),node=result?.nodes[o.nodeId],computed=node?.node.ops?.[index]?.id===o.rateId?node.ownOps?.find(x=>x.index===index):null,cost=Number.isFinite(computed?.cost)?computed.cost:null;
   const samples=history.flatMap(h=>h.packet.operations.filter(x=>o.rateId&&x.rateId===o.rateId&&(x.machineId||x.machine||'')===(o.machineId||o.machine||'')&&x.outputUnit===o.outputUnit).flatMap(x=>{const p=h.progress.operations.find(v=>v.id===x.id);return p?.status==='done'&&p.output>0&&Number.isFinite(p.hours)&&p.hours>0?[{jobId:h.id,code:h.code,output:p.output,hours:p.hours}]:[];}));
   const output=samples.reduce((s,x)=>s+x.output,0),hours=samples.reduce((s,x)=>s+x.hours,0),standard=Number.isFinite(o.standardHours)?o.standardHours:null,total=standard===null?null:standard*o.quantity;
   const source=require('./production-norm-source.cjs').resolve(norms,j,o,machineId);
   const row={quoteWorkQuantity:Number.isFinite(computed?.basis)?computed.basis:null,quoteWorkUnit:computed?.unit||'',machineId,normStatus:o.standardNormStatus|| (standard!==null?'legacy':'missing'),normBasis:o.standardNormBasis||'',suggestedNorm:source.suggestion,normReferences:source.references.filter(n=>prices||n.category!=='machineCost'),id:o.id,name:o.name,object:o.object,quantity:o.quantity,unit:o.outputUnit,workshop:machine?.workshop||catalogue?.workshop||j.progress.workshop||'',machine:machine?.name||equipment?.machine||progress.machine||o.machine||'',standardHours:standard,totalStandardHours:total,actualHours:(()=>{const r=sql.prepare("SELECT document FROM enterprise_records WHERE kind='work-wait' AND id=?").get('source:production:'+j.id+':'+o.id);return require('./production-working-time.cjs').fromSql(sql,progress,r?JSON.parse(r.document).waits:[])?.actualHours??null;})(),history:{samples,hours,output,hoursPerUnit:output?hours/output:null}};
   // Commercial quantities are omitted, not merely masked, for workshop roles.
   if(prices)Object.assign(row,{hourRate:Number.isFinite(rate)?rate:null,quoteCost:cost,quoteHours:rate>0&&cost!==null?cost/rate:null,standardCost:total!==null&&Number.isFinite(rate)?total*rate:null});
   return row;
  });return {jobId:j.id,version:j.version,canSeeCosts:prices,rows};
 }
 async function handle({req,route,user,send}){const m=route.match(/^\/api\/production\/([^/]+)\/review-tables$/);if(!m)return false;if(req.method!=='GET')fail(405,'Chỉ đọc bảng rà soát');const raw=sql.prepare('SELECT * FROM production_jobs WHERE id=?').get(m[1]);if(!raw)fail(404,'Không có lệnh');send(200,view({...raw,packet:JSON.parse(raw.packet),progress:JSON.parse(raw.progress)},user));return true;}
 return {handle,view};
}
module.exports={create};
