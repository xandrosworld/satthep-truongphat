'use strict';
const {randomUUID}=require('node:crypto'),AA=require('../action-access.js'),Controls=require('./reference-norm-controls.cjs');
module.exports=function({sql,list,get,put,job,number,text,fail,now}){
 const costs=u=>require('./access.cjs').permissions(u).costs&&AA.allows(u,'costs','view',u.role==='admin');
 const financial=k=>['finance','machineCost','spending'].includes(k);
 const rights=u=>({technicalView:['production','workshop','purchasing'].some(k=>AA.allows(u,k,'view',false)),spendingView:AA.allows(u,'finance','view',false),spendingEdit:AA.allows(u,'finance','approve',false),view:['production','workshop','purchasing','finance'].some(k=>AA.allows(u,k,'view',false)),edit:AA.allows(u,'workshop','edit',false),costs:!!costs(u)});
 function save(b,u){
  if(!(b.category==='spending'?rights(u).spendingEdit:rights(u).edit))fail(403,'Chưa có quyền sửa định mức');
  const old=b.id?get('reference-norm',b.id):null;if(b.id&&!old)fail(404,'Không có định mức');if((old?.version||0)!==b.expectedVersion)fail(409,'Định mức đã đổi; tải lại trước khi lưu');
  const category=text(b.category,30,true);if(!Controls.groups.some(g=>g.id===category))fail(400,'Nhóm định mức không hợp lệ');if(old?.category==='spending'&&category!=='spending'||category==='spending'&&old&&old.category!=='spending')fail(400,'Không chuyển hạn mức chi tiêu sang định mức sản xuất');if(category==='loss'&&(!old||b.active!==false))fail(400,'Hao hụt lấy từ báo giá, phương án phôi và thực tế; không khai thêm tỷ lệ chuẩn');if((financial(category)&&category!=='spending'||financial(old?.category)&&old?.category!=='spending')&&!costs(u))fail(403,'Chưa có quyền định mức tài chính');
  const source=text(b.source,30,true);if(!['manufacturer','production'].includes(source))fail(400,'Chọn căn cứ định mức');
  const materialId=text(b.materialId||'',100);if(Controls.groups.find(g=>g.id===category).material||materialId){const catalog=sql.prepare('SELECT document FROM catalog WHERE id=1').get();if(!(catalog&&JSON.parse(catalog.document).materials?.some(m=>m.id===materialId))&&!get('material',materialId))fail(400,'Chọn mã vật tư có trong danh mục');}
  const control=Controls.validate({...b,category},{text,number,fail});
  const catalog=JSON.parse(sql.prepare('SELECT document FROM catalog WHERE id=1').get()?.document||'{}');
  if([control.operationRateId,...control.sequence].filter(Boolean).some(id=>!catalog.rates?.some(r=>r.id===id)))fail(400,'Nguyên công không có trong danh mục');
  if(control.machineId&&!get('machine',control.machineId))fail(400,'Máy không có trong danh mục');
  const v={...control,name:text(b.name,200,true),category,materialId,unit:text(b.unit,30,true),outputUnit:text(b.outputUnit,30,true),product:text(b.product,300,true),quantity:category==='routing'?1:number(b.quantity,1e12,!Controls.groups.find(g=>g.id===category).percent),source,evidence:text(b.evidence,3000,true),note:text(b.note||'',2000),active:b.active!==false,length:number(b.length||0),width:number(b.width||0),thickness:number(b.thickness||0),updated:now(),actor:u.name};
  return put('reference-norm',old?.id||randomUUID(),{...v,history:[...(old?.history||[]),...(old?[{...old,history:undefined}]:[])]},(old?.version||0)+1);
 }
 function visible(u){const allowed=k=>k==='spending'?rights(u).spendingView:rights(u).technicalView&&(!financial(k)||costs(u));return list('reference-norm').filter(n=>allowed(n.category)).map(n=>({...n,history:(n.history||[]).filter(h=>allowed(h.category))}));}
 function reference(j,d){
  const lots=list('hold').filter(h=>h.jobId===j.id&&h.materialId===d.materialId&&['reserved','issued','settled'].includes(h.state)).map(h=>get('lot',h.lotId));
  for(const a of d.nesting?.allocations||[])lots.push(get('lot',a.lotId));
  if(lots.some(l=>!l||['length','width','thickness'].some(k=>Number(l[k]||0)!==Number(d[k]||0))))return [];
  return list('reference-norm').filter(n=>n.active&&['material','consumable','nesting'].includes(n.category)&&n.materialId===d.materialId&&n.unit===d.unit&&n.outputUnit===(j.packet.product.unit||'bộ')&&n.product===j.packet.product.name&&['length','width','thickness'].every(k=>Number(n[k]||0)===Number(d[k]||0))).map(n=>({id:n.id,version:n.version,name:n.name,source:n.source,evidence:n.evidence,quantity:n.quantity*j.quantity,unit:n.unit}));
 }
 function comparison(j,d,requested=0){
  const holds=list('hold').filter(h=>h.jobId===j.id&&h.materialId===d.materialId&&['issued','settled'].includes(h.state));
  const issued=holds.filter(h=>{const l=get('lot',h.lotId);return l&&l.unit===d.unit&&['length','width','thickness'].every(k=>Number(l[k]||0)===Number(d[k]||0));}).reduce((s,h)=>s+h.quantity,0);
  return {jobId:j.id,jobCode:j.code,jobVersion:j.version,materialId:d.materialId,name:d.name,unit:d.unit,length:d.length,width:d.width,thickness:d.thickness,required:d.quantity,assigned:d.assigned||0,onOrder:d.onOrder||0,remaining:d.remaining??d.unassigned,requested,issued,issuedWeight:holds.reduce((s,h)=>s+h.quantity*(get('lot',h.lotId)?.unitWeight||0),0),references:reference(j,d),at:now(),basis:'Hồ sơ kỹ thuật và phương án phôi của lệnh'};
 }
 function attach(p,plans){return {...p,normComparison:p.lines.flatMap(l=>(l.allocations||[{jobId:p.jobId,quantity:l.quantity}]).map(a=>{const plan=plans.find(x=>x.jobId===a.jobId),d=plan?.rows.find(r=>r.materialId===l.materialId);if(!d)fail(409,'Không đủ căn cứ đối chiếu định mức');return comparison(job(a.jobId),d,a.quantity);} ))};}
 return {rights,save,visible,comparison,attach,groups:u=>Controls.groups.filter(g=>g.id==='spending'?rights(u).spendingView:rights(u).technicalView&&(!financial(g.id)||costs(u))),controls:(j,u,actual,review)=>Controls.compare({norms:visible(u).filter(n=>n.category!=='loss'),j,actual,review})};
};
