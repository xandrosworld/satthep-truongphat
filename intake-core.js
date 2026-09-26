(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const CV=typeof module!=='undefined'?require('./conventions-core.js'):root.TPConventions;
const B=typeof module!=='undefined'?require('./batch-one-core.js'):root.TPBatchOne;
const P=typeof module!=='undefined'?require('./pricing-core.js'):root.TPPrice;
const CF=typeof module!=='undefined'?require('./customer-fields-core.js'):root.TPCustomerFields;
const CRM=typeof module!=='undefined'?require('./crm-core.js'):root.TPCrm;
const text=(v,max=200)=>String(v??'').trim().slice(0,max);
function documentLink(value){
 const name=String(value?.name||'').trim(),url=String(value?.url||'').trim();
 if(!name||name.length>200)throw Error('Nhập tên tài liệu, tối đa 200 ký tự');
 let parsed;try{parsed=new URL(url);}catch{throw Error('Nhập link tài liệu đầy đủ, bắt đầu bằng https:// hoặc http://');}
 if(url.length>4000||!['https:','http:'].includes(parsed.protocol)||parsed.username||parsed.password)throw Error('Link tài liệu phải dùng https:// hoặc http://, không kèm tài khoản/mật khẩu');
 return {id:text(value.id||C.uid(),100),name,url:parsed.href};
}
function customer(value){const x={id:text(value.id||C.uid(),100)};for(const k of ['name','contact','phone','email','address','taxId'])x[k]=text(value[k],k==='address'?500:200);if(!x.name)throw Error('Nhập tên khách hàng');x.email=CF.emails(value.email).join(', ');return {...x,...CRM.profile(value)};}
function requestLine(value){const x={id:text(value.id||C.uid(),100),name:text(value.name),specification:text(value.specification,2000),qty:Number(value.qty),unit:text(value.unit||'bộ',30)};if(!x.name)throw Error('Nhập tên sản phẩm cần chào');if(!Number.isFinite(x.qty)||x.qty<=0||x.qty>5000)throw Error('Số lượng phải lớn hơn 0 và không quá 5.000');return x;}
function addRequestProducts(db,ids,templates={}){const q=db.quote,added=[];for(const id of ids){const line=q.request?.items?.find(x=>x.id===id);if(!line)throw Error('Không tìm thấy dòng yêu cầu');if(q.products.some(p=>p.requestLineId===id))continue;const t=db.library.find(x=>x.id===templates[id]&&x.templateKind==='product');const n=t?C.cloneNode(t):{id:C.uid(),kind:'product',children:[],ops:[],transport:0,install:0,model:'assembly'};Object.assign(n,{name:line.name,manualName:true,qty:line.qty,unit:line.unit,requestLineId:id,requestSpecification:line.specification});delete n.templateKind;if(t)C.attachTemplateRates(q,db.rates,n);q.products.push(n);added.push(n.id);}return added;}
function validateRequest(q){if(q.customerInfo)customer(q.customerInfo);const r=q.request;if(!r)return;B.validateDetails(r);if(r.links!==undefined){if(!Array.isArray(r.links)||r.links.length>30)throw Error("Tối đa 30 link tài liệu");const linkIds=new Set();for(const link of r.links){const checked=documentLink(link);if(!link.id||linkIds.has(checked.id))throw Error("Link tài liệu thiếu mã hoặc trùng mã");linkIds.add(checked.id);}}if(!Array.isArray(r.items)||r.items.length>500)throw Error('Yêu cầu tối đa 500 sản phẩm');const ids=new Set();for(const line of r.items){requestLine(line);if(ids.has(line.id))throw Error('Dòng yêu cầu bị trùng');ids.add(line.id);}if(!Array.isArray(r.files)||r.files.length>30)throw Error('Tối đa 30 tệp nguồn');if(text(r.notes,20001).length>20000)throw Error('Nội dung yêu cầu quá dài');for(const f of r.files)if(!f||!String(f.id||'').match(/^[a-zA-Z0-9_-]{1,100}$/)||!['local','server'].includes(f.storage)||!Number.isFinite(f.size)||f.size<0||f.size>10*1024*1024)throw Error('Tệp nguồn không hợp lệ');}
function materialChoices(db,kind,substance){return CV.entries(db,kind).filter(x=>x.parent===substance);}
function materialName(m){
 if(m.shape==='piece')return [m.brand,m.specification].filter(Boolean).join(' / ');
 const props=m.props||{},fmt=v=>Number(v).toLocaleString('vi-VN',{maximumFractionDigits:6}),value=k=>Number(props[k])>0?fmt(props[k]):'',grade=m.substance==='Inox'?String(m.grade||'').replace(/^SUS\s*/i,''):m.grade;
 const base=[m.substance,grade].filter(Boolean).join(' '),shape={sheet:'tấm',box:'hộp',pipe:'ống',round:'tròn đặc',solid:'vuông đặc',angle:'góc L / V',u:'U',c:'C',h:'H',i:'I',profile:'hình'}[m.shape]||C.shapes[m.shape]?.name||'';
 let name,used=[];
 if(m.shapeDefinition){name=[base,m.shapeDefinition.name].filter(Boolean).join(' ');}
 else if(m.shape==='sheet'){name=base+' tấm'+(value('T')?' dày '+value('T')+' mm':'');used=['T'];}
 else {used=(C.shapes[m.shape]?.fixed||[]);const dims=used.filter(k=>value(k)).map(k=>(k==='D'?'Ø':'')+value(k));name=[base,shape,dims.length?dims.join(' × ')+' mm':''].filter(Boolean).join(' ');}
 const extra=Object.entries(props).filter(([k,v])=>!used.includes(k)&&Number(v)>0).map(([k,v])=>k+' '+fmt(v)+' '+(m.shapeDefinition?.fields?.find(f=>f.key===k)?.unit||'mm'));
 return [name.trim(),...extra,m.characteristic&&m.characteristic!=='Cán nóng'?m.characteristic.toLocaleLowerCase('vi-VN'):'',m.brand,m.specification].filter(Boolean).join(', ');
}
function validateMaterial(db,m){if(m.shape==='piece'&&!m.substance){if(m.grade||m.characteristic)throw Error('Chọn vật liệu trước mác / đặc tính');return;}if(!CV.entries(db,'substances').some(x=>x.name===m.substance))throw Error('Chọn vật liệu trong Quy ước');for(const [key,kind]of [['grade','grades'],['characteristic','characteristics']])if(m[key]&&!materialChoices(db,kind,m.substance).some(x=>x.name===m[key]))throw Error((key==='grade'?'Mác':'Đặc tính')+' không thuộc vật liệu đã chọn');}
function priceRows(db){const rows=new Map();function put(spec,target,owner){if(!spec)return;const key=B.variantKey(spec);if(!rows.has(key))rows.set(key,{key,id:spec.id,name:spec.name,brand:spec.brand||'',specification:spec.specification||'',unit:spec.unit,targets:[],owners:[],reference:db.materials.find(m=>B.variantKey(m)===key)?.price});const row=rows.get(key);row.targets.push(target);row.owners.push(owner);}
for(const n of C.flatten(db.quote.products))if(n.kind==='material')put(n.spec,n.spec,n.name);
for(const r of db.quote.ratesSnapshot||[]){const recipes=r.consumptions?.length?r.consumptions:r.consumption?[r.consumption]:[];for(const x of recipes)put(x.spec,x.spec,'Định mức '+r.name);}
return [...rows.values()].map(r=>({...r,prices:[...new Set(r.targets.map(x=>x.price))]}));}
function applyMaterialPrices(db,updates,at=new Date().toISOString()){const rows=priceRows(db),seen=new Set(),pending=[];for(const u of updates){const r=rows.find(x=>x.key===u.key);if(!r||seen.has(u.key))throw Error('Dòng giá không hợp lệ hoặc bị trùng');seen.add(u.key);if(u.value===''||u.value==null||!Number.isFinite(Number(u.value))||Number(u.value)<0)throw Error('Đơn giá phải là số không âm');pending.push({r,u});}if(db.quote.status==='approved')throw Error('Không sửa giá bản đã duyệt');db.quote.priceHistory??=[];for(const {r,u}of pending){const source=u.source==='catalog'&&r.reference!=null&&Number(r.reference)===Number(u.value)?'catalog':'manual';db.quote.priceHistory.push({key:r.key,id:r.id,unit:r.unit,brand:r.brand,before:C.copy(r.prices),after:Number(u.value),source,at,owners:C.copy(r.owners)});for(const target of r.targets){target.price=Number(u.value);target.priceSelection={source,at};}}return pending.length;}
// Refresh only base prices whose catalogue unit matches every declared job in that mode.
function operationUnitUpdates(db){
 const rows=new Map(),q=db.quote;
 for(const n of C.flatten(q.products))for(const op of n.ops||[]){
  const method=q.operationMethods?.[op.id]||op.pricingMethod||'factors';
  if(!['catalog','factors'].includes(method)||(q.operationPriceOptions?.[op.id]??op.priceOptionId)||!op.quantityUnit||!['inside','outside'].includes(op.mode))continue;
  const key=op.id+'|'+op.mode;if(!rows.has(key))rows.set(key,{key,id:op.id,mode:op.mode,units:new Set()});rows.get(key).units.add(op.quantityUnit);
 }
 return [...rows.values()].flatMap(x=>{const old=q.ratesSnapshot?.find(r=>r.id===x.id),ref=db.rates?.find(r=>r.id===x.id);if(!old||!ref||x.units.size!==1)return [];const wanted=[...x.units][0],beforeUnit=old[x.mode+'Unit']||old.unit,unit=ref[x.mode+'Unit']||ref.unit,value=ref[x.mode];if(beforeUnit===wanted||unit!==wanted||value==null||value===''||!Number.isFinite(Number(value))||Number(value)<0)return [];return [{key:x.key,id:x.id,mode:x.mode,name:old.name,beforeUnit,before:old[x.mode],unit,value:Number(value)}];});
}
function applyOperationUnitUpdates(db,updates){
 if(db.quote.status==='approved')throw Error('Không sửa giá bản đã duyệt');
 const available=operationUnitUpdates(db),seen=new Set();
 const pending=updates.map(x=>{const current=available.find(r=>r.key===x.key);if(!current||seen.has(x.key)||JSON.stringify(current)!==JSON.stringify(x))throw Error('Bảng giá đã thay đổi. Mở lại để kiểm tra giá mới.');seen.add(x.key);return current;});
 for(const x of pending){const rate=db.quote.ratesSnapshot.find(r=>r.id===x.id);rate[x.mode]=x.value;rate[x.mode+'Unit']=x.unit;}
 return pending.length;
}
function legacyPreview(db){const trial=C.copy(db),before=C.calculate(db).total.grand;P.enable(trial);const after=C.calculate(trial);return {before,after:after.total.grand,errors:after.errors};}
function convertLegacy(db){if(db.quote.pricing)return false;const before=C.copy(db.quote),price=C.calculate(db).total.grand;db.legacyArchives??=[];db.legacyArchives.push({at:new Date().toISOString(),quote:before,total:price});if(before.status==='approved'){db.quote=C.copy(before);db.quote.id=before.id+'-MOI';db.quote.workspaceKey=C.uid();db.quote.commercial={status:'draft',version:0,events:[]};}P.enable(db);db.quote.pricing.overrides={};db.quote.legacySource={id:before.id,total:price};return true;}
function customerSnapshot(c){return Object.fromEntries(['id','name','contact','phone','email','address','taxId'].map(k=>[k,c[k]||'']));}
const api={operationUnitUpdates,applyOperationUnitUpdates,documentLink,customer,customerSnapshot,requestLine,addRequestProducts,validateRequest,materialChoices,materialName,validateMaterial,priceRows,applyMaterialPrices,legacyPreview,convertLegacy};if(typeof module!=='undefined')module.exports=api;else root.TPIntake=api;
})(typeof window!=='undefined'?window:globalThis);
