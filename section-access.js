(function(root){
'use strict';
const labels={customer:'Khách hàng và yêu cầu',bom:'Cấu thành, kích thước và hao hụt',operations:'Nguyên công và định mức',materials:'Giá vật tư',logistics:'Vận chuyển và lắp đặt',factors:'Hệ số tác động',commercial:'Giá chào, thuế và lịch sử gửi',manage:'Tạo và trình báo giá',catalogMaterials:'Danh mục vật tư',catalogOperations:'Đơn giá nguyên công và nhóm sản phẩm',catalogLogistics:'Bảng giá vận chuyển, lắp đặt',catalogRules:'Danh mục quy ước và công thức',catalogLibrary:'Thư viện mẫu'};
const keys=Object.keys(labels),catalogKeys=keys.filter(k=>k.startsWith('catalog'));
function parse(value){if(value==null)return null;const x=typeof value==='string'?JSON.parse(value):value;if(!Array.isArray(x)||x.some(k=>!keys.includes(k)))throw Error('Danh sách quyền không hợp lệ');return [...new Set(x)];}
function sections(user){if(user.role==='admin')return keys;const custom=parse(user.section_access);if(custom!==null)return custom;return user.role==='technical'?['customer','bom','operations']:user.role==='estimator'?keys.filter(k=>!catalogKeys.includes(k)):user.role==='sales'?['commercial']:[];}
function canonical(x){if(Array.isArray(x))return x.map(canonical);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().filter(k=>x[k]!==undefined).map(k=>[k,canonical(x[k])]));return x;}
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const nodeSection=k=>k==='ops'||['outsource','workQuantities','measurementConfirmed','workMeasurement','processMass','processArea'].includes(k)?'operations':['transport','install','freightIn','freightOut'].includes(k)?'logistics':['pricePerKg','competitorPrice','marketPrice','marketSource','groupPricing','tmcKind','tmcTableId'].includes(k)?'commercial':'bom';
const quoteSection=k=>['customer','customerInfo','request','requestId','opportunityId','requestSpecification','attachments','sourceFiles','project'].includes(k)?'customer':['expenses','purchaseSources','deviceInstallations'].includes(k)?'logistics':['ratesSnapshot','operationPriceChoices','operationChoices','operationMethods','operationPriceOptions'].includes(k)?'operations':['materialPriceHistory','materialPriceSelections','priceHistory'].includes(k)?'materials':['kerf','remnantMode','remnantSelections','wasteMode','materialEstimate','stockSelections'].includes(k)?'bom':['date','valid','notes','vat','outputTax','issuer','offerTerms','documentMode','costPriceSources','costPriceHistory'].includes(k)?'commercial':'manage';
const priceSection=k=>['incoming','outgoing','delivery','install','expenseRates'].includes(k)?'logistics':['selected','comparisonMethods','overrides','taxReview','tmcPolicy','productGroupSelections'].includes(k)?'commercial':'factors';
const catalogSection=k=>['materials','materialPrices','stockSizes','catalogPriceBaseline'].includes(k)?'catalogMaterials':k==='rates'?'catalogOperations':k==='library'?'catalogLibrary':k==='pricingDefaults'?'catalogOperations':'catalogRules';
function denied(before,after,rights,{catalog=false}={}){
 if(rights.users)return [];const allowed=new Set(rights.sections||[]),bad=new Set();
 const check=(s,a,b)=>{if(!equal(a,b)&&(!allowed.has(s)||s==='factors'&&!rights.factors))bad.add(s);};
 function fields(a,b,fn,ignore=[]){a=a||{};b=b||{};for(const k of new Set([...Object.keys(a),...Object.keys(b)]))if(!ignore.includes(k))check(fn(k),a[k],b[k]);}
 function defaults(a,b){fields(a,b,k=>['expenseRates','incoming','outgoing','delivery','install'].includes(k)?'catalogLogistics':['factorDefinitions','salesFactors','productionFactors','overhead','management','special','profit','processing','order','reserve','customer'].includes(k)?'factors':'catalogOperations');}
 if(catalog){fields(before,after,catalogSection,['pricingDefaults']);defaults(before?.pricingDefaults,after?.pricingDefaults);
  const factorData=d=>({rates:(d?.rates||[]).map(r=>({id:r.id,factorsEnabled:r.factorsEnabled!==false,factors:r.factors||[],outsideFactors:!!r.outsideFactors,options:(r.priceOptions||[]).filter(o=>o.outsideFactors).map(o=>o.id)})).filter(r=>!r.factorsEnabled||r.factors.length||r.outsideFactors||r.options.length).sort((a,b)=>a.id.localeCompare(b.id)),packageFactors:Object.entries(d?.pricingDefaults?.tmcLaborOperation?.tables||{}).concat(d?.pricingDefaults?.tmcLaborOperation?.default?[['default',d.pricingDefaults.tmcLaborOperation.default]]:[]).map(([id,b])=>({id,choice:b.choice,factorsEnabled:b.rate?.factorsEnabled!==false,factors:b.rate?.factors||[]})).sort((a,b)=>a.id.localeCompare(b.id)),policy:d?.pricingDefaults?.tmcPolicy||null,groups:d?.pricingDefaults?.productGroups||[],costFlows:d?.pricingDefaults?.costFlows,loss:d?.pricingDefaults?.tmcLoss,tables:(d?.pricingDefaults?.tmcTables||[]).map(t=>({id:t.id,loss:t.loss,ancillary:t.ancillary?.kind==='percent'?t.ancillary:null,common:t.common?.kind==='percent'?t.common:null})).filter(t=>t.loss!==undefined||t.ancillary||t.common),customers:d?.conventions?.customers||[],complexity:d?.conventions?.complexity||[]});
  check('factors',factorData(before),factorData(after));return [...bad];}
 fields(before,after,catalogSection,['quote','version','history','pricingDefaults']);defaults(before?.pricingDefaults,after?.pricingDefaults);
 const a=before?.quote||{},b=after?.quote||{};
 fields(a,b,quoteSection,['products','ratesSnapshot','pricing','status','workspaceKey','changeHistory','inputPriceAudit','approvedOffer','approvedBaseline']);
 fields(a.pricing,b.pricing,priceSection);
function rateParts(rows){const prices={},structure=JSON.parse(JSON.stringify(rows||[]));function walk(x,path){if(!x||typeof x!=='object')return;for(const k of Object.keys(x)){if(k==='spec'&&x[k]){for(const f of ['price','priceHistory','priceSource','priceSelection']){if(x[k][f]!==undefined)prices[path+'.spec.'+f]=x[k][f];delete x[k][f];}}walk(x[k],path+'.'+k);}}walk(structure,'rates');return {prices,structure};}
const ar=rateParts(a.ratesSnapshot),br=rateParts(b.ratesSnapshot);for(const r of br.structure){const old=ar.structure.find(x=>x.id===r.id);if(!old)continue;for(const [i,x]of (r.consumptions||[]).entries())if(old.consumptions?.[i]&&old.consumptions[i].id===undefined)delete x.id;if(r.consumption&&old.consumption&&old.consumption.id===undefined)delete r.consumption.id;}check('operations',ar.structure,br.structure);check('materials',ar.prices,br.prices);

 const map=nodes=>{const m=new Map();function walk(ns,parent=''){for(const n of ns||[]){m.set(n.id,{n,parent});walk(n.children,n.id);}}walk(nodes);return m;},old=map(a.products),next=map(b.products);
 check('bom',[...old].map(([id,v])=>[id,v.parent]),[...next].map(([id,v])=>[id,v.parent]));
 for(const [id,{n}]of next){const prev=old.get(id)?.n;if(!prev){
   if(n.ops?.length)check('operations',[],n.ops);
   const source=(before?.materials||[]).find(m=>m.id===n.materialId);if(n.spec&&source)check('materials',source.price,n.spec.price);else if(n.spec?.price)check('materials',undefined,n.spec.price);
   for(const k of ['transport','install','outsource','pricePerKg','competitorPrice','marketPrice'])if(n[k])check(nodeSection(k),undefined,n[k]);
   continue;
  }
  const compared={...n,ops:(n.ops||[]).map((op,i)=>{const copy={...op};if(prev.ops?.[i]?.id===op.id&&prev.ops[i].instanceId===undefined)delete copy.instanceId;return copy;})};if(n.ops===undefined)delete compared.ops;fields(prev,compared,nodeSection,['children','spec']);fields(prev.spec,n.spec,k=>['price','priceHistory','priceSource','priceSelection'].includes(k)?'materials':'bom');
 }
 return [...bad];
}
const api={labels,keys,catalogKeys,parse,sections,denied,equal};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TPSectionAccess=api;
})(typeof globalThis!=='undefined'?globalThis:this);
