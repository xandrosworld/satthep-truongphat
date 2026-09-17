(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP,W=typeof module!=='undefined'?require('./work-core.js'):root.TPWork;
function validate(rate,p,rates){
 if(rate.operationType!==undefined&&!['detail','package'].includes(rate.operationType))throw Error('Chọn loại nguyên công chi tiết hoặc trọn gói');
 if(rate.operationType!=='package')return;
 const x=rate.tmcPackage;if(!x||!Array.isArray(x.tableIds)||!x.tableIds.length||new Set(x.tableIds).size!==x.tableIds.length||x.tableIds.some(id=>!(p.tmcTables||[]).some(t=>t.id===id)))throw Error('Chọn bảng giá TMC cho nguyên công trọn gói');
 if(!Array.isArray(x.replaces)||!x.replaces.length||new Set(x.replaces).size!==x.replaces.length||x.replaces.some(id=>id===rate.id||!rates.some(r=>r.id===id&&r.operationType!=='package')))throw Error('Chọn công chi tiết đã gồm trong gói');
 if(!rate.name?.trim())throw Error('Nhập tên nguyên công');W.validatePriceOptions(rate);for(const f of rate.factors||[])W.validateFactor(f,C.pricingTier);
}
function synchronize(p,rates){
 const x=C.copy(p.tmcLaborOperation||{default:null,tables:{},replaces:[]});x.tables??={};const packageIds=new Set(rates.filter(r=>r.operationType==='package').map(r=>r.id));
 if(x.default?.managedBy==='package-operation'||packageIds.has(x.default?.rate?.id))x.default=null;
 for(const [id,b]of Object.entries(x.tables))if(b?.managedBy==='package-operation'||packageIds.has(b?.rate?.id))delete x.tables[id];
 const assigned=new Map();for(const rate of rates){validate(rate,p,rates);if(rate.operationType!=='package')continue;for(const id of rate.tmcPackage.tableIds){if(assigned.has(id))throw Error('Bảng '+p.tmcTables.find(t=>t.id===id).name+' đã thuộc gói '+assigned.get(id));assigned.set(id,rate.name);x.tables[id]={rate:C.copy(rate),choice:'table-factors',replaces:C.copy(rate.tmcPackage.replaces),managedBy:'package-operation'};}}
 p.tmcLaborOperation=x.default||Object.values(x.tables).some(Boolean)?x:null;return p;
}
function save(db,next){const rates=C.copy(db.rates),i=rates.findIndex(r=>r.id===next.id);if(i<0)rates.push(C.copy(next));else rates[i]=C.copy(next);const base=(typeof module!=='undefined'?require('./pricing-core.js'):root.TPPrice).defaults(),p=synchronize({...base,...C.copy(db.pricingDefaults||{})},rates);db.rates=rates;db.pricingDefaults=p;}
const api={validate,synchronize,save};if(typeof module!=='undefined')module.exports=api;else root.TPPackageOperation=api;
})(typeof globalThis!=='undefined'?globalThis:this);
