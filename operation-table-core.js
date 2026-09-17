/* Shared declarations and lookup for all product families. TMC keeps its
 * existing quote adapter; new families do not inherit TMC's material policy. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP,W=typeof module!=='undefined'?require('./work-core.js'):root.TPWork;
const tier=(...args)=>(typeof module!=='undefined'?require('./pricing-core.js').tier:C.pricingTier)(...args);
const PARAMETERS=[['W','Chiều rộng','mm'],['L','Chiều dài','mm'],['H','Chiều cao','mm'],['T','Chiều dày','mm'],['weight','Khối lượng','kg'],['area','Diện tích','m²'],['count','Số lượng','cái']];
const UNITS=['m','cái','bộ','kg','m²','gói'];
function tables(p){return [...(p.tmcTables||[]).map(t=>({...C.copy(t),source:'tmc',productGroups:t.productGroups||['Thang máng cáp'],lookupParam:t.lookupParam||'W'})),...(p.operationPriceTables||[]).map(t=>({...C.copy(t),source:'operation'}))];}
function validate(t){
 if(!t||typeof t.id!=='string'||!t.id.trim()||typeof t.name!=='string'||!t.name.trim())throw Error('Nhập mã và tên bảng giá');
 W.validateGroups(t.productGroups);if(!PARAMETERS.some(p=>p[0]===t.lookupParam))throw Error('Chọn đại lượng tra giá');
 if(!UNITS.includes(t.unit))throw Error('Chọn đơn vị tính giá');
 if(!['upper','exact'].includes(t.thresholdMode||'upper'))throw Error('Chọn cách tra bậc');
 tier(0,t.tiers,'price');if(t.tiers.some(x=>x.price===null||x.price===''||!Number.isFinite(Number(x.price))||Number(x.price)<0))throw Error('Đơn giá phải là số không âm');
 return t;
}
function validateAll(p){
 if(p.operationPriceTables!==undefined&&(!Array.isArray(p.operationPriceTables)||p.operationPriceTables.length>2000))throw Error('Bảng giá nguyên công không hợp lệ');
 const ids=new Set();for(const t of tables(p)){validate(t);if(ids.has(t.id))throw Error('Trùng mã bảng giá nguyên công: '+t.id);ids.add(t.id);}
}
function lookup(t,ctx){validate(t);if(!W.groupsMatch(t.productGroups,ctx.productGroup))throw Error(t.name+': không áp dụng cho nhóm sản phẩm này');const value=ctx[t.lookupParam];if(value===null||value===undefined||value===''||!Number.isFinite(Number(value))||Number(value)<0)throw Error('Thiếu '+PARAMETERS.find(x=>x[0]===t.lookupParam)[1]+' để tra giá');
 if(t.thresholdMode==='exact'){const i=t.tiers.findIndex((b,i)=>b.max===null?Number(value)>(t.tiers[i-1]?.max??0):Number(value)===Number(b.max));if(i<0)throw Error('Chưa khai đơn giá cho đúng mốc này');return {value:Number(t.tiers[i].price),index:i,input:Number(value)};}
 return {...tier(Number(value),t.tiers,'price'),input:Number(value)};
}
function price(rate,p,id,ctx,quantity){const t=tables(p).find(t=>t.id===id);if(!t)throw Error('Bảng giá không còn tồn tại');const bound=lookup(t,ctx);if(quantity===null||quantity===''||!Number.isFinite(Number(quantity))||Number(quantity)<0)throw Error('Nhập lượng tính công không âm');const priced=W.price({...rate,inside:bound.value,insideUnit:t.unit},{id:rate.id,mode:'inside',pricingMethod:'factors'},{...ctx,workQuantity:Number(quantity)},C.pricingTier);return {...priced,table:t.name,param:t.lookupParam,input:bound.input,bound,basis:Number(quantity),unit:t.unit,cost:priced.value*Number(quantity)};}
function save(db,raw){const P=typeof module!=='undefined'?require('./pricing-core.js'):root.TPPrice,K=typeof module!=='undefined'?require('./package-operation-core.js'):root.TPPackageOperation,p={...P.defaults(),...C.copy(db.pricingDefaults||{})},t=C.copy(raw),source=t.source||'operation';delete t.source;validate(t);
 if(source==='tmc'&&(t.lookupParam!=='W'||t.productGroups?.length!==1||t.productGroups[0]!=='Thang máng cáp'))throw Error('Bảng đang phục vụ phương án TMC: giữ nhóm Thang máng cáp và đại lượng chiều rộng. Tạo bảng mới cho nhóm khác.');
 const key=source==='tmc'?'tmcTables':'operationPriceTables',rows=p[key]||[],i=rows.findIndex(x=>x.id===t.id);if(i<0)rows.push(t);else rows[i]=t;p[key]=rows;validateAll(p);K.synchronize(p,db.rates);(typeof module!=='undefined'?require('./input-prices-core.js'):root.TPInputPrices).validateMaster(p);db.pricingDefaults=p;return t;
}
const api={PARAMETERS,UNITS,tables,validate,validateAll,lookup,price,save};if(typeof module!=='undefined')module.exports=api;else root.TPOperationTable=api;
})(typeof globalThis!=='undefined'?globalThis:this);
