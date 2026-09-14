/* Price provenance for the monetary inputs of a quote. No inferred VAT. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const copy=C.copy, valid=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=1e15;
const stable=v=>Array.isArray(v)?v.map(stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,stable(v[k])])):v;
const signature=v=>JSON.stringify(stable(v));
function rows(q){
 const out=[],usedRates=new Set(),usedOptions=new Map();
 const add=(target,field,key,label,unit,identity)=>{if(!target||!Object.hasOwn(target,field))return;out.push({key,label,unit:unit||'đ',value:target[field],identity:signature(identity),target,field});};
 const material=(m,key,label)=>add(m,'price',key,label+' · '+m.id+' · '+(m.brand||'chưa khai hãng'),m.unit,[m.id,m.unit,m.brand||'',m.specification||'',m.props,m.substance,m.grade]);
 function walk(nodes,path=[]){for(const n of nodes||[]){const names=[...path,n.name],label=names.join(' / ');if(n.kind==='material')material(n.spec,'material:'+n.id,label);
  for(const field of ['freightIn','freightOut','transport','install'])if(Number(n[field])!==0)add(n,field,'node:'+n.id+':'+field,label+' / '+field,'đ / đối tượng',[n.id,field,n.kind]);
  if(n.outsource?.enabled)add(n.outsource,'price','package:'+n.id,label+' / gói thuê',n.outsource.unit,[n.id,n.outsource.unit,n.outsource.supplier,n.outsource.output,n.outsource.materialSupply]);
  for(const [i,op]of (n.ops||[]).entries()){usedRates.add(op.id);const option=q.operationPriceOptions?.[op.id]??op.priceOptionId??'';if(!usedOptions.has(op.id))usedOptions.set(op.id,new Set());usedOptions.get(op.id).add(option);const method=q.operationMethods?.[op.id]||op.pricingMethod||'factors';if(!option&&['direct','fixed'].includes(method))add(op,'unitPrice','operation:'+n.id+':'+i,label+' / '+op.id+' / '+op.mode,method==='fixed'?'gói':op.priceUnit,[n.id,op.id,op.mode,method,op.priceUnit,op.fixedScope]);}
  walk(n.children,names);
 }}walk(q.products);
 for(const r of q.ratesSnapshot||[]){if(!usedRates.has(r.id))continue;for(const x of r.priceOptions||[])if(usedOptions.get(r.id)?.has(x.id))for(const mode of ['inside','outside'])add(x,mode,'rate-option:'+r.id+':'+x.id+':'+mode,r.name+' / '+x.name+' / '+(mode==='inside'?'tại xưởng':'thuê ngoài'),x.method==='fixed'?'gói':x[mode+'Unit'],[r.id,x.id,mode,x.method,x[mode+'Unit'],x.fixedScope]);if(usedOptions.get(r.id)?.has(''))for(const mode of ['inside','outside'])add(r,mode,'rate:'+r.id+':'+mode,r.name+' / '+(mode==='inside'?'tại xưởng':'thuê ngoài'),r[mode+'Unit']||r.unit,[r.id,mode,r[mode+'Unit']||r.unit]);
  const recipes=r.consumptions!==undefined?r.consumptions:r.consumption?[r.consumption]:[];for(const [i,recipe]of recipes.entries())if(recipe.spec)material(recipe.spec,'recipe:'+r.id+':'+i,r.name+' / vật tư định mức');
 }
 for(const e of q.expenses||[])if(e.enabled!==false)for(const field of ['rate','minimum'])add(e,field,'expense:'+e.id+':'+field,e.name+' / '+(field==='minimum'?'phí tối thiểu':'đơn giá'),e.method,[e.id,e.category,e.method,e.scope,e.nodeIds,e.productIds,e.materialIds,e.supplier,e.from,e.to]);
 for(const e of q.deviceInstallations||[]){if(e.mode==='unit')add(e,'rate','device-rate:'+e.id,e.work+' / '+e.location,'đ / thiết bị',[e.id,e.nodeId,e.variant,e.work,e.location,e.mode]);if(e.mode==='percent'&&e.basis==='declared-total')add(e,'deviceTotal','device-base:'+e.id,e.work+' / tổng giá trị thiết bị','đ / toàn phạm vi',[e.id,e.nodeId,e.variant,e.work,e.location,e.totalQuantity]);}
 for(const field of ['incoming','outgoing','delivery','install'])add(q.pricing,field,'quote:'+field,'Khoản chung / '+field,'đ / báo giá',[field]);
 for(const t of q.pricing?.tmcTables||[]){for(const [i,b]of (t.tiers||[]).entries())add(b,'price','tmc:'+t.id+':'+i,'TMC / '+t.name+' / bậc '+(i+1),t.unit,[t.id,t.unit,i,b.max,t.thresholdMode]);for(const field of ['ancillary','common'])if(t[field]?.kind==='fixed')add(t[field],'value','tmc:'+t.id+':'+field,'TMC / '+t.name+' / '+field,t.unit,[t.id,t.unit,field]);}for(const r of out)if(r.key.startsWith('tmc:'))r.tmcOnly=true;
 return out;
}
function state(q,row){const d=q.costPriceSources?.[row.key],known=!!d&&d.identity===row.identity&&valid(d.net)&&valid(row.value)&&Number(d.net)===Number(row.value)&&['excluded','included'].includes(d.status)&&valid(d.original)&&(d.status!=='included'||valid(d.rate)&&Number(d.rate)<=100)&&Number(d.net)===Number(d.original)/(d.status==='included'?1+Number(d.rate)/100:1);return {known,record:d||null,status:known?d.status:'unknown'};}
function view(q){return rows(q).map(r=>({key:r.key,label:r.label,unit:r.unit,value:r.value,identity:r.identity,tmcOnly:!!r.tmcOnly,...state(q,r)}));}
function apply(q,updates,reason,at=new Date().toISOString()){
 if(['approved','submitted'].includes(q.status))throw Error('Bản đã khóa; tạo bản sửa trước');
 if(!String(reason||'').trim())throw Error('Ghi căn cứ nguồn giá / thuế');
 if(!Array.isArray(updates)||!updates.length)throw Error('Chọn giá cần khai');
 const current=new Map(rows(q).map(r=>[r.key,r])),seen=new Set(),changes=[];
 for(const u of updates){const r=current.get(u.key);if(!r||seen.has(u.key))throw Error('Dòng giá đã đổi/xóa hoặc chọn trùng');seen.add(u.key);
  if(u.expected!==undefined&&(u.expected!==signature([r.identity,r.value])))throw Error('Giá hoặc quy cách đã đổi; mở lại bảng để rà');
  if(!['unknown','excluded','included'].includes(u.status))throw Error('Chọn tình trạng thuế');
  if(!valid(u.original))throw Error(r.label+': giá nguồn phải là số không âm');
  if(u.status==='included'&&(!valid(u.rate)||Number(u.rate)>100))throw Error(r.label+': cần thuế suất nằm trong giá');
  const net=Number(u.original)/(u.status==='included'?1+Number(u.rate)/100:1);
  const after={identity:r.identity,original:Number(u.original),status:u.status,rate:u.status==='included'?Number(u.rate):null,net,reason:String(reason).trim(),at};
  changes.push({r,before:r.value,previous:copy(q.costPriceSources?.[u.key]||null),after});
 }
 q.costPriceSources??={};q.costPriceHistory??=[];
 for(const {r,before,previous,after}of changes){r.target[r.field]=after.net;q.costPriceSources[r.key]=after;q.costPriceHistory.push({key:r.key,label:r.label,unit:r.unit,before,previous,after:copy(after),at});}
 return changes.map(({r,before,after})=>({key:r.key,label:r.label,before,after:copy(after)}));
}
// Explicit bulk assertion, called only by the operator's unchecked-by-default
// "all current costs are net" checkbox. Never divides already-normalized prices.
function confirmNet(q,reason,at){const updates=rows(q).filter(r=>!r.tmcOnly&&!state(q,r).known).map(r=>({key:r.key,original:r.value,status:'excluded'}));if(updates.length)apply(q,updates,reason,at);}
function catalogPrices(db){const out={};for(const m of db.materials||[])out['material:'+m.id]={price:m.price,unit:m.unit,brand:m.brand||'',specification:m.specification||'',priceSource:m.priceSource};for(const r of db.rates||[])out['rate:'+r.id]={inside:r.inside,outside:r.outside,unit:r.unit,insideUnit:r.insideUnit,outsideUnit:r.outsideUnit,priceOptions:copy(r.priceOptions||[]),consumptions:copy(r.consumptions!==undefined?r.consumptions:r.consumption?[r.consumption]:[])};for(const [i,r]of (db.materialPrices||[]).entries())out['book:'+i]=copy(r);for(const [kind,values]of Object.entries(db.conventions||{}))for(const r of values)if(Object.hasOwn(r,'price'))out['convention:'+kind+':'+r.name]={price:r.price};return out;}
function differences(before,after){return [...new Set([...Object.keys(before),...Object.keys(after)])].filter(key=>signature(before[key])!==signature(after[key])).map(key=>({key,before:copy(before[key]??null),after:copy(after[key]??null)}));}
const api={rows,view,state,apply,confirmNet,catalogPrices,differences,signature};if(typeof module!=='undefined')module.exports=api;else root.TPCostInput=api;
})(typeof window!=='undefined'?window:globalThis);
