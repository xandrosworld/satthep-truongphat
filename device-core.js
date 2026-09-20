/* Explicit device work. No inferred tax, production stage, brand or duplicate scope. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const clean=v=>String(v??'').trim(),fold=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ');
const MODES=[['none','Không thực hiện'],['supplier','Đã gồm trong giá nhà cung cấp'],['covered','Đã tính ở công việc khác'],['percent','% giá trị thiết bị'],['unit','Đơn giá lắp / thiết bị']];
function variant(m){return JSON.stringify([m.id,m.unit,fold(m.brand),clean(m.specification)]);}
function value(v,label,positive=false){if(v===''||v==null||!Number.isFinite(Number(v))||Number(v)<0||positive&&Number(v)<=0)throw Error(label+' cần số '+(positive?'lớn hơn 0':'không âm'));return Number(v);}
function objects(q){return C.flatten(q.products).filter(n=>n.kind==='material'&&n.spec?.shape==='piece');}
function sources(q,base,logistics,nodeId){
 const path=C.nodePath(q.products,nodeId)||[],ids=new Set(path.map(n=>n.id)),r=base.nodes[nodeId],out=[];if(!r)return out;
 for(const n of path){const rr=base.nodes[n.id];for(const [i,op]of (rr.ownOps||[]).entries())if(!op.skipped&&!op.error&&Number.isFinite(op.cost))out.push({key:JSON.stringify(['op',n.id,i,n.ops[i].id,n.ops[i].mode,n.ops[i].amount]),work:n.ops[i].id,name:n.name+' / '+op.name,cost:op.cost});if(rr.packageCharge&&!rr.packageCharge.error)out.push({key:JSON.stringify(['package',n.id,n.outsource.supplier,n.outsource.output,n.outsource.materialSupply]),name:n.name+' / gói thuê '+(n.outsource?.supplier||''),cost:rr.packageCharge.cost});}
 for(const e of logistics.items||[]){if(e.error||e.category!=='install')continue;const inScope=e.scope==='nodes'?(e.nodeIds||[]).some(id=>ids.has(id)):e.scope==='materials'?(e.materialIds||[]).includes(r.node.materialId):e.scope==='products'?(e.productIds||[]).includes(r.productId):e.scope==='supplier'?(r.node.supplier||r.node.spec.supplier||'')===e.supplier:e.scope==='productGroups'||e.scope==='all'||!e.scope;if(inScope&&(!e.detail||e.detail.some(d=>d.productId===r.productId)))out.push({key:JSON.stringify(['expense',e.id,e.name,e.scope,e.nodeIds,e.productIds,e.materialIds,e.supplier,e.from,e.to,...(e.quoteProductGroups?.length?[e.quoteProductGroups]:[])]),name:e.name+' / phân bổ lắp đặt',cost:e.cost});}
 return out;
}
function calculate(q,base,logistics){
 const entries=q.deviceInstallations||[],items=[],errors=[],allocations={},ids=new Set(),work=new Set();
 if(!Array.isArray(entries))return {items,errors:['Danh sách lắp đặt thiết bị không hợp lệ'],allocations};
 for(const e of entries){try{
  if(!e||!clean(e.id)||ids.has(e.id))throw Error('Mã công việc thiết bị trống/trùng');ids.add(e.id);
  const r=base.nodes[e.nodeId],n=r?.node;if(!n||n.kind!=='material'||n.spec?.shape!=='piece')throw Error('Chọn lại dòng thiết bị còn trong cấu thành');
  if(!MODES.some(([id])=>id===e.mode))throw Error('Chọn cách tính lắp đặt');
  if(!clean(e.work)||!clean(e.location)||!clean(e.reason))throw Error('Cần công việc, vị trí thực hiện và căn cứ phạm vi');
  const key=JSON.stringify([n.id,fold(e.work),fold(e.location)]);if(work.has(key))throw Error('Trùng cùng thiết bị, công việc và vị trí; sửa dòng đã có');work.add(key);
  if(e.variant!==variant(n.spec))throw Error('Mã / thương hiệu / thông số / ĐVT đã đổi; xác nhận lại thiết bị và phạm vi');
  let quantity=value(r.count,'Số lượng thiết bị',true),basis=0,rate=0,cost=0,source=null;
  if(['percent','unit'].includes(e.mode)){
   if(!['production','base'].includes(e.stage))throw Error('Chưa xác nhận lớp giá sản xuất hay giá gốc');
   rate=value(e.rate,e.mode==='percent'?'Tỷ lệ %':'Đơn giá công');
   if(e.mode==='percent'){
    if(e.basis==='selected-price'){basis=value(n.spec.price,'Đơn giá thiết bị')*quantity;if(e.priceConfirmed!==true)throw Error('Chưa xác nhận cơ sở giá thiết bị');}
    else if(e.basis==='declared-total'){basis=value(e.deviceTotal,'Tổng giá trị đúng phạm vi');if(e.totalQuantity!==quantity)throw Error('Số lượng đã đổi; xác nhận lại tổng giá trị thiết bị');}
    else throw Error('Chọn cơ sở tiền tính phần trăm');
    cost=basis*rate/100;
   }else {basis=quantity;cost=basis*rate;}
  }else if(e.mode==='covered'){
   source=sources(q,base,logistics,n.id).find(s=>s.key===e.sourceKey);if(!source)throw Error('Công việc bao gồm đã đổi/xóa hoặc ngoài phạm vi; chọn lại');
   if(e.scopeConfirmed!==true)throw Error('Xác nhận nguồn đã bao gồm đúng công việc này');
  }else if(e.mode==='supplier'&&e.scopeConfirmed!==true)throw Error('Xác nhận nhà cung cấp đã gồm đúng công việc này');
  if(!Number.isFinite(cost)||!Number.isFinite(basis))throw Error('Chi phí thiết bị vượt giới hạn');
  const warning=['percent','unit'].includes(e.mode)&&e.scopeConfirmed!==true&&sources(q,base,logistics,n.id).length?'Có công đoạn hoặc khoản lắp đặt trong cùng phạm vi; rà lại để tránh tính trùng.':'';
  const item={...e,warning,name:n.name,materialId:n.materialId,brand:n.spec.brand||'',unit:n.spec.unit,productId:r.productId,purchaseUnitPrice:n.spec.price,quantity,basis,rate,cost,source};items.push(item);
  const target=allocations[r.productId]??={factory:0,install:0};target[e.stage==='production'?'factory':'install']+=cost;
 }catch(err){const message=(e?.work||'Lắp đặt thiết bị')+': '+err.message;errors.push(message);items.push({...e,error:message,cost:0});}}
 for(const n of objects(q))if(n.deviceWorkRequired&&!entries.some(e=>e?.nodeId===n.id))errors.push(n.name+': dòng đã yêu cầu công lắp nhưng chưa có cấu hình trong báo giá này; khai lại sau khi nhân bản/gọi mẫu');
 return {items,errors,allocations};
}
function writable(q){if(['approved','submitted'].includes(q.status))throw Error('Bản đã gửi duyệt/duyệt không được sửa');}
function save(q,entry){writable(q);const n=C.findNode(q.products,entry.nodeId);if(!n)throw Error('Không tìm thấy thiết bị');n.deviceWorkRequired=true;q.deviceInstallations??=[];const i=q.deviceInstallations.findIndex(x=>x.id===entry.id);q.deviceWorkHistory??=[];q.deviceWorkHistory.push({at:new Date().toISOString(),before:i<0?null:C.copy(q.deviceInstallations[i]),after:C.copy(entry)});if(i<0)q.deviceInstallations.push(C.copy(entry));else q.deviceInstallations[i]=C.copy(entry);}
function remove(q,id){writable(q);const entry=(q.deviceInstallations||[]).find(e=>e.id===id);if(!entry)throw Error('Không tìm thấy công việc');q.deviceInstallations=q.deviceInstallations.filter(e=>e.id!==id);const n=C.findNode(q.products,entry.nodeId);if(n&&!q.deviceInstallations.some(e=>e.nodeId===n.id))delete n.deviceWorkRequired;q.deviceWorkHistory??=[];q.deviceWorkHistory.push({at:new Date().toISOString(),before:C.copy(entry),after:null});}
function replaceMaterial(db,nodeId,materialId,confirmed,price){
 writable(db.quote);const n=objects(db.quote).find(n=>n.id===nodeId),m=db.materials.find(m=>m.id===materialId);if(!n||!m||m.shape!=='piece')throw Error('Chọn thiết bị theo đơn vị trong danh mục');if(confirmed!==true)throw Error('Xác nhận quy cách, thương hiệu, giá và giữ phạm vi công việc');
 const chosen=value(price,'Giá của thiết bị mới'),before={id:n.materialId,brand:n.spec.brand||'',unit:n.spec.unit,price:n.spec.price};
 if(n.spec.unit!==m.unit&&(db.quote.deviceInstallations||[]).some(e=>e.nodeId===nodeId&&e.mode!=='none'))throw Error('Đổi đơn vị cần rà lại số lượng và đơn giá công; không đổi tự động');
 n.materialId=m.id;n.name=m.name;n.spec={...C.copy(m),price:chosen};
 n.spec.priceSelection={source:Number(m.price)===chosen?'catalog':'manual',at:new Date().toISOString(),value:chosen};
 for(const e of db.quote.deviceInstallations||[])if(e.nodeId===nodeId){e.variant=variant(n.spec);if(e.basis==='declared-total'){e.totalQuantity=null;}e.priceConfirmed=true;}
 db.quote.deviceHistory??=[];db.quote.deviceHistory.push({kind:'Đổi thiết bị / thương hiệu có xác nhận',nodeId,before,after:{id:m.id,brand:m.brand||'',unit:m.unit,price:chosen},at:new Date().toISOString()});
 return n;
}
const api={MODES,variant,objects,sources,calculate,save,remove,replaceMaterial};if(typeof module!=='undefined')module.exports=api;else root.TPDevice=api;
})(typeof window!=='undefined'?window:globalThis);
