(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP,P=typeof module!=='undefined'?require('./pricing-core.js'):root.TPPrice,W=typeof module!=='undefined'?require('./work-core.js'):root.TPWork,copy=C.copy;
const EXPENSE_PARAMS=['weight','area','length','count','quantity','distance','trips','complexity','from','to'];
const OP_PARAMS=['customer','customerId','totalComponentCount','T','W','L','H','count','workQuantity','localQty','productQty','parentQty','parentCount','componentCount','weight','unitWeight','area','unitArea','substance','grade','complexity','finish'];
function targets(db){return [...db.rates.map(rate=>({id:rate.id,name:rate.name,rate})),...(db.pricingDefaults?.expenseRates||[]).map(rate=>({id:'expense:'+rate.id,name:rate.name,rate,expense:true}))];}
function definition(f){const d=copy(f);delete d.sharedFactorId;delete d.enabled;return d;}
function fingerprint(f){const d=definition(f);delete d.id;function sort(v){return Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;}return JSON.stringify(sort(d));}
function catalog(db){const definitions=copy(db.pricingDefaults?.factorDefinitions||[]),bindings=[];for(const t of targets(db))for(const f of t.rate.factors||[]){let d=f.sharedFactorId?definitions.find(x=>x.id===f.sharedFactorId):definitions.find(x=>fingerprint(x)===fingerprint(f));if(!d){let id=f.id,i=2;while(definitions.some(x=>x.id===id))id=f.id+'-'+i++;d={...definition(f),id};definitions.push(d);}bindings.push({target:t.id,key:d.id,localId:f.id,enabled:f.enabled!==false});}return {definitions,bindings};}
function compatible(d,target){return (target.expense?EXPENSE_PARAMS:OP_PARAMS).includes(d.param);}
function validate(d){W.validateFactor(d,P.tier);if(![...EXPENSE_PARAMS,...OP_PARAMS].includes(d.param))throw Error('Đại lượng tra không được hỗ trợ');return d;}
function write(db,state){const list=targets(db);for(const d of state.definitions)validate(d);const ids=new Set();for(const d of state.definitions){if(ids.has(d.id))throw Error('Trùng mã yếu tố');ids.add(d.id);}for(const b of state.bindings){const d=state.definitions.find(x=>x.id===b.key),t=list.find(x=>x.id===b.target);if(!d||!t)throw Error('Liên kết yếu tố không còn tồn tại');if(b.enabled&&!compatible(d,t))throw Error(d.name+': không có đại lượng '+d.param+' tại '+t.name);}
 const rows=new Map(list.map(t=>[t.id,[]]));for(const b of state.bindings){const d=state.definitions.find(x=>x.id===b.key);rows.get(b.target).push({...copy(d),id:b.localId||d.id,sharedFactorId:d.id,enabled:b.enabled});}
 // Validate the complete result before changing any shared data.
 for(const [target,factors]of rows){const ids=new Set();for(const f of factors){if(ids.has(f.id))throw Error('Trùng mã yếu tố trong '+target);ids.add(f.id);}}
 db.pricingDefaults??=P.defaults();db.pricingDefaults.factorDefinitions=copy(state.definitions);for(const t of list)t.rate.factors=rows.get(t.id);
}
function save(db,value,initialTarget=''){const state=catalog(db),d=definition(value);validate(d);const i=state.definitions.findIndex(x=>x.id===d.id);if(i<0)state.definitions.push(d);else state.definitions[i]=d;if(initialTarget&&!state.bindings.some(b=>b.target===initialTarget&&b.key===d.id))state.bindings.push({target:initialTarget,key:d.id,localId:d.id,enabled:true});write(db,state);return d;}
function applyMatrix(db,links){const state=catalog(db),seen=new Set();const bindings=links.map(b=>{const key=b.target+'\0'+b.key;if(seen.has(key))throw Error('Liên kết bị trùng');seen.add(key);const old=state.bindings.find(x=>x.target===b.target&&x.key===b.key);return {target:b.target,key:b.key,localId:old?.localId||b.key,enabled:true};});write(db,{definitions:state.definitions,bindings});}
function remove(db,key){const state=catalog(db);write(db,{definitions:state.definitions.filter(d=>d.id!==key),bindings:state.bindings.filter(b=>b.key!==key)});}
const api={targets,catalog,compatible,validate,save,applyMatrix,remove};if(typeof module!=='undefined')module.exports=api;else root.TPFactorMatrix=api;
})(typeof globalThis!=='undefined'?globalThis:this);
