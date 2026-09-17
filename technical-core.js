/* Technical documents are allowlisted on the server. Price placeholders are
 * local calculation inputs, never copies of confidential commercial values. */
(function(root){'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
const nodeKeys=['id','kind','name','manualName','namePattern','qty','unit','materialId','rule','params','dims','paramLinks','model','dimensionLinks','thicknessRequirement','measurementRules','materialEstimate','productGroup','requestSpecification','templateKind','requestLineId','auxiliaryPercent'];
const specKeys=['id','name','group','unit','shape','substance','grade','characteristic','brand','specification','props','density','stockL','stockW','shapeDefinition','massOverride','areaOverride'];
const opKeys=['id','instanceId','mode','amount','basisMode','workQuantity','measurementConfirmed','afterPackage','suppliesIncluded'];
const ruleKeys=['id','name','shape','length','width','measurementRules'];
const quoteKeys=['id','customer','project','date','kerf','remnantMode','remnantSelections','request','customerInfo'];
const pick=(x,keys)=>Object.fromEntries(keys.filter(k=>x?.[k]!==undefined).map(k=>[k,copy(x[k])]));
const spec=x=>({...pick(x,specKeys),price:0});
function recipe(x){return {...pick(x,['id','norm','basis','layers','loss']),spec:spec(x.spec)};}
function rate(x){return {...pick(x,['id','name','unit','insideUnit','outsideUnit','finishing','productGroups']),inside:0,outside:0,factors:[],...(x.consumption?{consumption:recipe(x.consumption)}:{}),...(x.consumptions?{consumptions:x.consumptions.map(recipe)}:{})};}
function node(x,q={}){return {...pick(x,nodeKeys),...(x.spec?{spec:spec(x.spec)}:{}),...(x.ruleSpec?{ruleSpec:pick(x.ruleSpec,ruleKeys)}:{}),...(x.outsource?{outsource:{...pick(x.outsource,['enabled','supplier','output','materialSupply','unit','quantity']),price:0}}:{}),ops:(x.ops||[]).map(o=>{const r=q.ratesSnapshot?.find(r=>r.id===o.id),option=r?.priceOptions?.find(p=>p.id===(q.operationPriceOptions?.[o.id]||o.priceOptionId)),method=option?.method||q.operationMethods?.[o.id]||o.pricingMethod;
 const unit=method==='fixed'?'gói':method==='direct'&&!option?o.priceUnit:(option||r)?.[o.mode+'Unit']||r?.unit;
 return {...pick(o,opKeys),pricingMethod:'direct',unitPrice:0,priceUnit:unit||'kg'};
 }),children:(x.children||[]).map(n=>node(n,q))};}
function project(d){return {version:2,materials:(d.materials||[]).map(spec),rates:(d.rates||[]).map(rate),rules:(d.rules||[]).map(x=>pick(x,ruleKeys)),library:(d.library||[]).map(n=>node(n,{ratesSnapshot:d.rates})),shapeDefinitions:copy(d.shapeDefinitions||[]),stockSizes:copy(d.stockSizes||[]),conventions:{},materialPrices:[],history:[],quote:{...pick(d.quote,quoteKeys),...(d.quote.customerInfo?{customerInfo:pick(d.quote.customerInfo,['id','name','contact','phone','email','address','taxId'])}:{}),status:d.quote.status,products:d.quote.products.map(n=>node(n,d.quote)),ratesSnapshot:(d.quote.ratesSnapshot||[]).map(rate),pricing:{version:2,selected:'detail',comparisonMethods:['detail'],overhead:0,management:0,special:0,profit:0,processing:0,order:0,customer:0,incoming:0,outgoing:0,delivery:0,install:0},vat:0,expenses:[]}};}
function merge(original,input){
 // Only a technical projection is accepted; hidden values must never round-trip.
 const submitted=copy(input),before=project(original);
 delete submitted.quote?.workspaceKey;
 // Browser identities may be assigned to legacy recipes without changing them.
 for(const r of submitted.quote?.ratesSnapshot||[]){const old=before.quote.ratesSnapshot.find(x=>x.id===r.id);if(!old)continue;for(const [i,recipe] of (r.consumptions||[]).entries())if(old.consumptions?.[i]?.id===undefined)delete recipe.id;if(r.consumption&&old.consumption?.id===undefined)delete r.consumption.id;}
 const projected=project(submitted);
 if(JSON.stringify(canonical(submitted))!==JSON.stringify(canonical(projected)))throw Error('Dữ liệu kỹ thuật chứa trường giá hoặc trường không được phép');
 for(const k of Object.keys(before))if(k!=='quote'&&!equal(before[k],submitted[k]))throw Error('Không sửa danh mục qua báo giá kỹ thuật');
 for(const k of Object.keys(before.quote))if(![...quoteKeys,'products','ratesSnapshot'].includes(k)&&!equal(before.quote[k],submitted.quote[k]))throw Error('Không sửa cấu hình giá hoặc đơn giá nguyên công');
 const rates=copy(original.quote.ratesSnapshot),technicalRates=copy(submitted.quote.ratesSnapshot);
 if(rates.length!==technicalRates.length)throw Error('Nguyên công mới cần được đưa vào báo giá từ danh mục chung');
 for(const [i,r] of technicalRates.entries()){
  const old=before.quote.ratesSnapshot[i];
  for(const key of ['consumption','consumptions']){
   const rows=key==='consumption'?(r[key]?[r[key]]:[]):r[key]||[],previous=key==='consumption'?(old[key]?[old[key]]:[]):old[key]||[];
   if(rows.length!==previous.length)throw Error('Thay mã vật tư định mức tại danh mục nguyên công');
   for(const [j,recipe] of rows.entries())for(const field of ['norm','layers','loss']){
    const value=recipe[field];if(value!==undefined&&(!Number.isFinite(value)||value<0||field==='layers'&&value===0))throw Error('Định mức, số lớp và hao hụt không hợp lệ');
    const target=key==='consumption'?rates[i][key]:rates[i][key][j];if(value===undefined)delete target[field];else target[field]=value;
    if(previous[j][field]===undefined)delete recipe[field];else recipe[field]=previous[j][field];
   }
  }
  if(!equal(r,old))throw Error('Không sửa đơn giá hoặc cấu hình nguyên công');
 }
 const result=copy(original),old=new Map();const walk=ns=>{for(const n of ns){old.set(n.id,n);walk(n.children||[]);}};walk(original.quote.products);
 result.quote.ratesSnapshot=rates;
 const assign=(target,source,keys)=>{for(const k of keys){if(source[k]===undefined)delete target[k];else target[k]=copy(source[k]);}return target;};
 function combine(n){const prev=old.get(n.id),next=assign(prev?copy(prev):{},n,nodeKeys);
  if(n.auxiliaryPercent!==undefined&&(!Number.isFinite(n.auxiliaryPercent)||n.auxiliaryPercent<0||n.auxiliaryPercent>100||n.kind!=='material'||n.spec?.shape==='piece'))throw Error('Vật tư phụ chỉ khai cho phôi, từ 0 đến 100%');
  if(!equal(n.outsource,prev?node(prev,original.quote).outsource:undefined))throw Error('Gói thuê được quản lý tại Giá & hệ số');
  if(n.kind==='product'&&n.productGroup!==prev?.productGroup&&n.productGroup){next.priceGroupId=n.productGroup==='Thang máng cáp'?'tmc':'detail';next.tmcScope=next.priceGroupId;if(next.priceGroupId==='tmc'&&!result.quote.pricing.comparisonMethods?.includes('tmc'))(result.quote.pricing.comparisonMethods??=['detail']).push('tmc');}
  if(n.spec){const material=prev?.materialId===n.materialId?prev.spec:original.materials.find(m=>m.id===n.materialId);if(!material)throw Error('Chọn mã vật tư có trong danh mục');next.spec=assign(copy(material),n.spec,specKeys);}
  if(n.ruleSpec)next.ruleSpec=copy(n.ruleSpec);
  const used=new Set();next.ops=n.ops.map((op,index)=>{if(!original.quote.ratesSnapshot.some(r=>r.id===op.id))throw Error('Chọn công đoạn có trong báo giá');const existing=(prev?.ops||[]).find((o,i)=>!used.has(i)&&o.id===op.id&&(op.instanceId&&o.instanceId?o.instanceId===op.instanceId:i===index));if(existing)used.add(prev.ops.indexOf(existing));return assign(existing?copy(existing):{},op,opKeys);});
  next.children=n.children.map(combine);return next;
 }
 assign(result.quote,submitted.quote,quoteKeys);result.quote.products=submitted.quote.products.map(combine);return result;
}
function canonical(x){return Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;}
function equal(a,b){return JSON.stringify(canonical(a))===JSON.stringify(canonical(b));}
const api={project,merge,nodeKeys,opKeys};if(typeof module!=='undefined')module.exports=api;else root.TPTechnical=api;
})(typeof globalThis!=='undefined'?globalThis:this);
