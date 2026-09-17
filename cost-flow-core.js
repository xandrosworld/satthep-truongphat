/* Cost flows are quotation snapshots. Switching comparisons never mutates inputs. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const FIELDS=[['stock','Phôi / vật tư chính'],['allowance','Vật tư phụ theo %'],['finishing','Vật tư hoàn thiện'],['ancillary','Thiết bị / vật tư theo đơn vị'],['factory','Nguyên công tại xưởng'],['outside','Nguyên công thuê ngoài'],['deviceProduction','Công lắp thiết bị trong sản xuất'],['incoming','Vận chuyển nhập vật tư'],['outgoing','Vận chuyển thuê ngoài'],['tmcCommon','Chi phí chung theo bảng'],['delivery','Vận chuyển giao hàng'],['install','Lắp đặt sản phẩm'],['deviceInstallation','Công lắp thiết bị tại công trình']];
const MODES=[['base','Theo cách tính của phương án'],['detail','Lấy từ tính toán chi tiết'],['formula','Công thức riêng của đầu mục'],['package','Nguyên công trọn gói theo bảng'],['included','Đã gồm trong đầu mục khác'],['none','Không áp dụng']];
const KEYS=['Q','KG','AREA','L','W','H','T','BASE',...FIELDS.map(([k])=>k.toUpperCase())];
const api=name=>typeof module!=='undefined'?require('./'+({W:'work-core',OT:'operation-table-core'}[name])+'.js'):root[{W:'TPWork',OT:'TPOperationTable'}[name]];
function expression(value,parameters=[]){if(typeof value!=='string'||!value.trim()||value.length>500)throw Error('Khai công thức không quá 500 ký tự');const keys=new Set([...KEYS,...parameters.map(p=>p.key)]);for(const token of value.match(/[A-Za-z_][A-Za-z_0-9]*/g)||[])if(!keys.has(token))throw Error('Biến chưa khai báo: '+token);try{C.formula(value,Object.fromEntries([...keys].map(k=>[k,1])));}catch(e){if(!e.message.includes('chia cho 0'))throw e;}}
function validate(flow,parameters=[]){
 if(flow===undefined)return;if(!flow||typeof flow!=='object'||Array.isArray(flow)||!flow.rules||typeof flow.rules!=='object'||Array.isArray(flow.rules))throw Error('Luồng giá cần bảng đầu mục');
 for(const [key,r]of Object.entries(flow.rules)){
  if(!FIELDS.some(([k])=>k===key)||!r||!MODES.some(([m])=>m===r.mode))throw Error('Đầu mục / cách tính luồng giá không hợp lệ');
  if(['formula','included','none','package'].includes(r.mode)&&!String(r.reason||'').trim())throw Error('Khai căn cứ cho '+FIELDS.find(([k])=>k===key)[1]);
  if(r.mode==='formula')expression(r.formula,parameters);
  if(r.mode==='included'&&(!FIELDS.some(([k])=>k===r.includedIn)||key===r.includedIn||['included','none'].includes(flow.rules[r.includedIn]?.mode)))throw Error('Khoản đã gồm phải dẫn tới một đầu mục tính tiền độc lập');
  if(r.mode==='package'){if(key!=='factory'||!r.rateId||!r.tableId)throw Error('Chọn nguyên công và bảng giá trọn gói tại đầu mục công xưởng');expression(r.quantityFormula,parameters);}
 }
}
function values(r){const d=r.flowDeviceParts||r.deviceParts||{factory:0,install:0};return {...r.parts,factory:r.parts.factory-(d.factory||0),install:r.parts.install-(d.install||0),deviceProduction:d.factory||0,deviceInstallation:d.install||0};}
function vars(r,detail,parameters=[]){return {...Object.fromEntries(FIELDS.map(([k])=>[k.toUpperCase(),detail[k]||0])),...Object.fromEntries(Object.entries(r.node.params||{}).filter(([k,v])=>['L','W','H','T'].includes(k)&&v!==''&&v!=null).map(([k,v])=>[k,Number(v)])),Q:r.node.qty,KG:r.weight,AREA:r.area,...Object.fromEntries(parameters.map(p=>[p.key,Number(p.value)]))};}
function apply(q,r,reference,flow,parameters=[],base){
 validate(flow,parameters);const original=values(r),detail=values(reference),input=vars(r,detail,parameters),rows=[],resolved={};
 for(const [key,label]of FIELDS){const rule=flow?.rules[key]||{mode:'base'};let amount=rule.mode==='detail'?detail[key]:original[key],calculation=null;
  if(rule.mode==='none'||rule.mode==='included')amount=0;
  if(rule.mode==='formula'){const used={...input,BASE:original[key]};amount=C.formula(rule.formula,used);calculation={formula:rule.formula,vars:used};}
  if(rule.mode==='package'){
   const rate=q.ratesSnapshot.find(x=>x.id===rule.rateId),table=api('OT').tables(q.pricing).find(x=>x.id===rule.tableId);
   if(!rate||rate.operationType!=='package'||!rate.tmcPackage?.tableIds.includes(rule.tableId)||!table)throw Error('Nguyên công / bảng trọn gói đã đổi; khai lại luồng giá');
   (typeof module!=='undefined'?require('./package-operation-core.js'):root.TPPackageOperation).validate(rate,q.pricing,q.ratesSnapshot);
   if(!api('W').groupsMatch(rate.productGroups,r.node.productGroup))throw Error(rate.name+': ngoài nhóm sản phẩm áp dụng');
   const quantity=C.formula(rule.quantityFormula,{...input,BASE:original[key]}),ctx={...r.node.params,...api('W').context(r.node,r,q.products,q),count:r.count,weight:r.weight,area:r.area,productGroup:r.node.productGroup};
   const priced=api('OT').price(rate,q.pricing,table.id,ctx,quantity);let replaced=0;
   for(const n of C.flatten([r.node]))for(const [i,op]of (n.ops||[]).entries()){const computed=base?.nodes[n.id]?.ownOps?.[i];if(op.mode==='inside'&&!op.afterPackage&&(rate.tmcPackage.replaces.includes(op.id)||op.id===rate.id)&&computed&&!computed.skipped&&!computed.error)replaced+=computed.cost;}
   amount=detail.factory-replaced+priced.cost;calculation={package:rate.name,table:table.name,quantity,unit:priced.unit,rate:priced.value,packageCost:priced.cost,replaced,retained:detail.factory-replaced,factors:priced.factors,formula:rule.quantityFormula};
  }
  if(!Number.isFinite(amount)||amount<-.001)throw Error(label+': chi phí phải là số không âm');amount=Math.max(0,amount);resolved[key]=amount;rows.push({key,label,mode:rule.mode,amount,original:original[key],reference:detail[key],reason:rule.reason||'',includedIn:rule.includedIn||'',calculation});
 }
 const parts={...r.parts,...Object.fromEntries(FIELDS.filter(([k])=>!k.startsWith('device')).map(([k])=>[k,resolved[k]]))};parts.factory+=resolved.deviceProduction;parts.install+=resolved.deviceInstallation;
 return {parts,rows,deviceParts:{factory:resolved.deviceProduction,install:resolved.deviceInstallation},input};
}
const out={FIELDS,MODES,KEYS,validate,expression,values,apply};if(typeof module!=='undefined')module.exports=out;else root.TPCostFlow=out;
})(typeof globalThis!=='undefined'?globalThis:this);
