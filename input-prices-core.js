(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const P=typeof module!=='undefined'?require('./pricing-core.js'):root.TPPrice;
const W=typeof module!=='undefined'?require('./work-core.js'):root.TPWork;
const copy=C.copy;
function defaults(db){return {...P.defaults(),...copy(db.pricingDefaults||{})};}
function amount(value,label){if(value===null||value===undefined||value===''||!Number.isFinite(Number(value))||Number(value)<0)throw Error(label+': nhập số không âm');return Number(value);}
function validateExpense(r){
 if(!r||typeof r.id!=='string'||!r.id.trim()||typeof r.name!=='string'||!r.name.trim())throw Error('Nhập mã và tên phương thức');
 if(!W.EXPENSES.some(x=>x[0]===r.category))throw Error('Chọn loại vận chuyển / lắp đặt');
 if(!W.METHODS.some(x=>x[0]===r.method))throw Error('Chọn cách tính phí');
 amount(r.rate,'Đơn giá');amount(r.minimum??0,'Phí tối thiểu');if(r.priceMode!==undefined&&!['catalog','factors'].includes(r.priceMode))throw Error('Chọn đơn giá cơ sở hoặc giá có hệ số');
 if(r.method==='ton_km'&&!['net','purchase'].includes(r.massBasis))throw Error('Chọn cơ sở khối lượng');
 if(r.factors!==undefined&&!Array.isArray(r.factors))throw Error('Bảng hệ số không hợp lệ');
 for(const f of r.factors||[]){if(!['weight','area','length','count','quantity','distance','trips','complexity','from','to'].includes(f.param))throw Error('Tham số hệ số khoản chi không hợp lệ');W.validateFactor(f,P.tier);}
 return r;
}
function validateTmc(t){
 if(!t||!t.id?.trim()||!t.name?.trim())throw Error('Nhập mã và tên bảng TMC');
 if(!['m','cái','kg','m²'].includes(t.unit))throw Error('Chọn đơn vị TMC');
 P.tier(0,t.tiers,'price');for(const b of t.tiers)amount(b.price,'Đơn giá TMC');
 if(t.loss!==undefined)amount(t.loss,'Hao hụt TMC');if(t.thresholdMode!==undefined&&!['upper','exact'].includes(t.thresholdMode))throw Error('Chọn cách tra bậc TMC');for(const key of ['ancillary','common']){const x=t[key];if(x===undefined)continue;if(!x||!['fixed','percent'].includes(x.kind))throw Error('Chọn cách tính khoản phụ/chung');amount(x.value,'Khoản phụ/chung');if(x.kind==='percent'&&!["material","labor","direct",...(key==='common'?["scope"]:[])].includes(x.basis))throw Error('Chọn cơ sở tính khoản phụ/chung');}return t;
}
function validateMaster(p){
 if(!p||typeof p!=='object'||Array.isArray(p))throw Error('Bảng đơn giá chung không hợp lệ');
 for(const [key,validate] of [['expenseRates',validateExpense],['tmcTables',validateTmc]]){
  if(p[key]===undefined)continue;if(!Array.isArray(p[key])||p[key].length>2000)throw Error('Bảng đơn giá quá lớn hoặc sai định dạng');
  const ids=new Set();for(const row of p[key]){validate(row);if(ids.has(row.id))throw Error('Trùng mã đơn giá: '+row.id);ids.add(row.id);}
 }if(p.factorDefinitions!==undefined){if(!Array.isArray(p.factorDefinitions)||p.factorDefinitions.length>2000)throw Error('Bảng yếu tố dùng chung không hợp lệ');const ids=new Set();for(const f of p.factorDefinitions){W.validateFactor(f,P.tier);if(ids.has(f.id))throw Error('Trùng mã yếu tố dùng chung');ids.add(f.id);}}if(p.tmcLoss!==undefined)amount(p.tmcLoss,'Hao hụt TMC');return p;
}
function save(db,key,row){const p=defaults(db),rows=p[key]||[],next=copy(row);(key==='expenseRates'?validateExpense:validateTmc)(next);const i=rows.findIndex(r=>r.id===next.id);if(i<0)rows.push(next);else rows[i]=next;p[key]=rows;validateMaster(p);db.pricingDefaults=p;return next;}
function recordChanges(before,after,at=new Date().toISOString()){
 const prior=new Map(before.map(m=>[m.id,m]));for(const m of after){const old=prior.get(m.id);if(!old||old.unit!==m.unit||Number(old.price)===Number(m.price))continue;amount(m.price,'Giá vật tư '+m.id);if(!Number.isFinite(Number(old.price)))continue;
  m.priceHistory=[{at,from:Number(old.price),to:Number(m.price),unit:m.unit},...(old.priceHistory||[])];
 }
}
function applyExpense(entry,rate){validateExpense(rate);return {...copy(entry),category:rate.category,method:rate.method,rate:Number(rate.rate),minimum:Number(rate.minimum||0),massBasis:rate.massBasis||'net',factors:rate.priceMode==='catalog'?[]:copy(rate.factors||[]),priceSource:copy(rate)};}
function refresh(db){const p=defaults(db);db.quote.expenses=(db.quote.expenses||[]).map(e=>{const r=p.expenseRates?.find(r=>r.id===e.priceSource?.id&&r.enabled!==false);return r?applyExpense(e,r):e;});if(db.quote.pricing){db.quote.pricing.tmcTables=copy(p.tmcTables);db.quote.pricing.tmcLoss=p.tmcLoss;}}
const api={defaults,validateExpense,validateTmc,validateMaster,save,recordChanges,applyExpense,refresh};if(typeof module!=='undefined')module.exports=api;else root.TPInputPrices=api;
})(typeof globalThis!=='undefined'?globalThis:this);
