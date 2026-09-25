/* Verified source: Input Info B:AM, 38 columns. Units and calculation versions stay explicit. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const FIELDS=['STT','Tên sản phẩm','Thông số cấu kiện','Vật liệu','Kiểu dáng','Đặc tính / mác','Hoàn thiện bề mặt','L (mm)','W (mm)','H (mm)','Đường kính (mm)','W1 (mm)','H1 (mm)','Bước (mm)','Dày (mm)','Mã / quy cách vật tư','Hao hụt vật lý (%)','Cắt tấm','Cắt ống','Chấn','Uốn','Hàn','Mài','Làm sạch','Khác','SL / cấp cha','Độ phức tạp cấu kiện','SL sản phẩm','Đơn vị','KL vật tư tính báo giá (kg)','KL phôi sản phẩm (kg)','KL thuê ngoài (kg)','S thực hiện (m²)','Vật tư phụ (%)','Kiểm tra khai báo','Phôi đặc thù (kg/m; tấm kg/m²)','S bề mặt riêng (m²/cái)','Ghi chú'];
function rows(db,result){return result.rows.map((row,i)=>{const n=row.node,r=result.nodes[n.id],p=C.findNode(db.quote.products,row.productId),ancestor=C.flatten([p]).filter(x=>x.kind!=='material'&&C.findNode([x],n.id)),parent=ancestor.at(-1)||p,pr=result.nodes[parent.id];const names=['Cắt tấm','Cắt ống','Chấn','Uốn','Hàn','Mài','Làm sạch'];const ops=(r.ownOps||[]).filter(o=>!o.skipped),scope=[...ancestor,n].map(x=>x.finishType).filter(Boolean).join(' / ');const own=(name,other=false)=>[...ancestor,n].flatMap(owner=>(result.nodes[owner.id].ownOps||[]).filter(o=>!o.skipped&&(other?!names.includes(o.name):o.name===name)).map(o=>owner.name+' → '+o.name+': '+o.basis+' '+o.unit+' × '+o.rate+(o.mode==='outside'?' (thuê)':' (xưởng)'))).join('; ');return {id:n.id,productId:p.id,values:[i+1,p.name,parent===p?n.name:parent.name+' / '+n.name,n.spec.substance,C.shapes[n.spec.shape]?.name,[n.spec.characteristic,n.spec.grade].filter(Boolean).join(' / '),scope||ancestor.flatMap(x=>(result.nodes[x.id].ownOps||[]).filter(o=>/sơn|mạ/i.test(o.name)).map(o=>o.name)).join('; '),...['L','W','H','D','W1','H1','P','T'].map(k=>n.spec.props[k]??n.dims[k]??''),n.materialId+' / '+n.spec.name,row.geometry.weight?((row.externallySupplied?0:row.estimate?.weight??row.allocatedWeight??row.purchasedWeight??0)/row.geometry.weight-1)*100:0,...names.map(name=>own(name)),own('',true),n.qty,n.complexity||parent.complexity||'',p.qty,p.unit||'bộ',row.externallySupplied?0:row.estimate?.weight??row.allocatedWeight??row.purchasedWeight??0,row.geometry.weight,r.coveredBy||ops.some(o=>o.mode==='outside')||ancestor.some(x=>(result.nodes[x.id].ownOps||[]).some(o=>o.mode==='outside'&&!o.skipped))?r.weight:0,r.workArea??r.area,n.auxiliaryPercent||0,result.errors.filter(e=>e.includes(n.name)).join('; ')||'Đã tính',n.spec.massOverride?C.materialMass(n.spec):'',(r.workArea??r.area)/r.count,n.notes||'']};});}
function analysis(result){const values=Object.values(result.alternatives);return [
 ['Khối lượng vật tư tính cho báo giá',a=>result.rows.reduce((s,r)=>s+(r.externallySupplied?0:r.estimate?.weight??r.allocatedWeight??r.purchasedWeight??0),0),'kg'],['Khối lượng phôi sản phẩm',a=>a.total.weight,'kg'],
 ['Phôi gia công',a=>a.total.parts.stock],['Linh kiện / vật tư phụ khai mã',a=>a.total.parts.ancillary],['Vật tư phụ dự tính theo %',a=>a.total.parts.allowance],['Vật tư hoàn thiện theo định mức',a=>a.total.parts.finishing],['Công đoạn tại xưởng',a=>a.total.parts.factory],['Gia công thuê ngoài',a=>a.total.parts.outside],['Chi phí chung riêng TMC',a=>a.total.parts.tmcCommon],['Vận chuyển nhập phôi / vật tư',a=>a.total.parts.incoming],['Vận chuyển thuê ngoài',a=>a.total.parts.outgoing],['Chi phí trực tiếp sản xuất',a=>a.total.direct],['Chi phí chung / hệ số sản xuất',a=>a.total.overhead],['Chi phí quản lý',a=>a.total.management],['Yếu tố khác trong sản xuất',a=>a.total.special],['Yếu tố sản xuất bổ sung',a=>a.total.productionExtras||0],['Giá sản xuất',a=>a.total.production],['Vận chuyển giao hàng',a=>a.total.parts.delivery],['Lắp đặt',a=>a.total.parts.install],['Giá gốc',a=>a.total.cost],
 ['Lợi nhuận dự kiến cộng vào giá',a=>['kg','competitor'].includes(a.id)?null:a.total.profitMarkup],['Chi phí xử lý cộng vào giá',a=>['kg','competitor'].includes(a.id)?null:a.total.processing],['Hệ số đơn hàng',a=>['kg','competitor'].includes(a.id)?null:a.total.order],['Hệ số khách hàng',a=>['kg','competitor'].includes(a.id)?null:a.total.customer],['Dự phòng / yếu tố bán thêm',a=>['kg','competitor'].includes(a.id)?null:a.total.saleExtras],['Giá chào trước thuế',a=>(a.id===result.pricing.selected?result.total:a.total).beforeTax],['Còn lại so với giá gốc — chưa phải lãi ròng',a=>(a.id===result.pricing.selected?result.total:a.total).beforeTax-a.total.cost]
 ].map(([name,get,unit='đ'])=>({name,unit,values:values.map(a=>{const amount=a.ready?get(a):null;return {amount,perKg:unit==='đ'&&amount!==null&&a.total.weight>0?amount/a.total.weight:null};})}));}
function visibleMethods(result){const ids=new Set([result.pricing.selected,...result.comparisonIds||[result.pricing.selected]]);return Object.values(result.alternatives).filter(a=>ids.has(a.id));}
function visibleSummary(result){const all=Object.values(result.alternatives),ids=new Set(visibleMethods(result).map(a=>a.id));return summary(result).map(r=>({...r,values:r.values.filter((_,i)=>ids.has(all[i].id))}));}
// Destinations refer to existing quote forms; totals are derived, not editable inputs.
function destination(row){
 const name=row.name;
 if(name==='Phân loại khách hàng')return {tab:'prices',group:'factors',focus:'[data-policy-target="customer"]'};
 if(row.section==='Hệ số áp dụng'||['Chi phí chung','Chi phí quản lý','Đặc thù sản xuất','Sản xuất bổ sung','Chi phí xử lý'].includes(name))return {tab:'prices',group:'factors'};
 if(row.section==='Khối lượng và diện tích')return {tab:'bom'};
 if(name==='Vật tư chính + phụ + hoàn thiện')return {tab:'prices',group:'materials'};
 if(['Sản xuất tại xưởng','Sản xuất thuê ngoài','Chi phí chung riêng TMC'].includes(name))return {tab:'prices',group:'operations'};
 if(name.startsWith('Vận chuyển')||name==='Lắp đặt')return {tab:'prices',group:'logistics'};
 if(name==='Thuế đầu ra')return {tab:'pricing',focus:'[data-tax-panel]'};
 return null;
}
function summary(result){
 const methods=Object.values(result.alternatives),out=[],sum=(a,get)=>a.products.reduce((s,p)=>s+(get(p)||0),0),bundled=a=>['kg','competitor'].includes(a.id)||a.products.some(p=>p.groupCalculation),final=a=>a.id===result.pricing.selected?result.total:a.total;
 let section='Hệ số áp dụng';
 const add=(name,unit,get,rate)=>out.push({name,unit,section,values:methods.map(a=>{const amount=a.ready?get(a):null;return {amount:Number.isFinite(amount)?amount:null,perKg:unit==='đ'&&Number.isFinite(amount)&&a.total.weight>0?amount/a.total.weight:null,rate:rate&&a.ready?rate(a):null};})});
 const factor=(name,get,values)=>add(name,'%',a=>bundled(a)?null:sum(a,get),a=>bundled(a)?'Trong giá trọn gói':[...new Set(a.products.map(values))].map(v=>v+'%').join(' / '));
 factor('Hệ số chi phí chung',p=>p.overhead,p=>p.policyRates.overhead);
 factor('Hệ số quản lý',p=>p.management,p=>p.policyRates.management);
 factor('Hệ số đặc thù sản xuất',p=>p.special,p=>p.policyRates.special);
 const sale=[['profitMarkup','Hệ số lợi nhuận'],['processing','Hệ số xử lý'],['order','Hệ số đơn hàng'],['customer','Hệ số khách hàng'],['reserve','Dự phòng giảm giá']];
 for(const [id,name]of sale)factor(name,p=>(p.saleSteps||[]).find(f=>f.id===id)?.value,p=>(p.saleSteps||[]).find(f=>f.id===id)?.percent||0);
 for(const [field,label]of [['productionSteps','SX bổ sung'],['saleSteps','Bán bổ sung']]){const ids=new Map();for(const a of methods)for(const p of a.products)for(const f of p[field]||[])if(field==='productionSteps'||!sale.some(([id])=>id===f.id))ids.set(f.id,f.name||f.id);for(const [id,name]of ids)factor(label+' · '+name,p=>(p[field]||[]).find(f=>f.id===id)?.value,p=>(p[field]||[]).find(f=>f.id===id)?.percent||0);}
 add('Phân loại khách hàng','',()=>null,()=>result.pricing.classificationLabel||result.pricing.policySelections?.customer?.name||'Chưa khai');
 add('Cấp độ đặc thù sản xuất','',()=>null,a=>[...new Set(a.products.map(p=>p.node.productionLevelChoice||result.pricing.policySelections?.['product:'+p.node.id]?.name||'Chưa khai'))].join(' / '));
 section='Khối lượng và diện tích';
 add('Khối lượng vật tư tính cho báo giá','kg',()=>result.rows.reduce((s,r)=>s+(r.externallySupplied?0:r.estimate?.weight??r.allocatedWeight??r.purchasedWeight??0),0));
 add('Khối lượng phôi sản phẩm','kg',a=>a.total.weight);add('Diện tích bề mặt','m²',a=>a.total.area);
 section='Cơ cấu chi phí và giá chào';
 for(const [name,get]of [
 ['Giá gốc',a=>a.total.cost],['Giá chào trước thuế',a=>final(a).beforeTax],
 ['Vật tư chính + phụ + hoàn thiện',a=>a.total.material],['Sản xuất tại xưởng',a=>a.total.parts.factory],['Sản xuất thuê ngoài',a=>a.total.parts.outside],['Chi phí chung riêng TMC',a=>a.total.parts.tmcCommon],
 ['Vận chuyển nhập vật tư',a=>a.total.parts.incoming],['Vận chuyển gia công thuê ngoài',a=>a.total.parts.outgoing],['Vận chuyển giao hàng',a=>a.total.parts.delivery],['Lắp đặt',a=>a.total.parts.install],
 ['Chi phí chung',a=>a.total.overhead],['Chi phí quản lý',a=>a.total.management],['Đặc thù sản xuất',a=>a.total.special],['Sản xuất bổ sung',a=>a.total.productionExtras],['Chi phí xử lý',a=>bundled(a)?null:a.total.processing],
 ['Tổng chi phí đã tính (giá gốc + xử lý)',a=>a.total.cost+a.total.processing],['Lợi nhuận còn lại dự kiến',a=>final(a).beforeTax-a.total.cost-a.total.processing],['Thuế đầu ra',a=>final(a).vat],['Tổng tiền sau thuế',a=>final(a).grand]
 ])add(name,'đ',get);
 return out;
}
const api={destination,FIELDS,rows,analysis,summary,visibleMethods,visibleSummary};if(typeof module!=='undefined')module.exports=api;else root.TPSource=api;
})(typeof window!=='undefined'?window:globalThis);
