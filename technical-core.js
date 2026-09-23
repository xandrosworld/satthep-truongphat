/* Technical documents are allowlisted on the server. Price placeholders are
 * local calculation inputs, never copies of confidential commercial values. */
(function(root){'use strict';
const copy=x=>JSON.parse(JSON.stringify(x));
const nodeKeys=['dimensionProfile','aiSourceKey','draftMaterial','lineNote','id','kind','name','manualName','namePattern','qty','unit','materialId','rule','params','dims','paramLinks','model','dimensionLinks','thicknessRequirement','measurementRules','materialEstimate','productGroup','requestSpecification','templateKind','requestLineId','auxiliaryPercent','pieceMass'];
const specKeys=['id','name','group','unit','shape','substance','grade','characteristic','brand','specification','props','density','stockL','stockW','stockOptions','shapeDefinition','massOverride','areaOverride'];
const opKeys=['quantityDeclared','complexityChoice','id','instanceId','mode','amount','basisMode','workQuantity','measurementConfirmed','afterPackage','suppliesIncluded'];
const ruleKeys=['id','name','shape','length','width','measurementRules','fields','shapes'];
const quoteKeys=['operationColumns','customer','project','id','date','kerf','nestingPlans','remnantMode','remnantSelections','request'];
const pick=(x,keys)=>Object.fromEntries(keys.filter(k=>x?.[k]!==undefined).map(k=>[k,copy(x[k])]));
const spec=x=>({...pick(x,specKeys),price:0});
function recipe(x){return {...pick(x,['id','norm','basis','layers','loss']),spec:spec(x.spec)};}
// Only labels and references cross the technical API; factors remain authoritative server data.
function complexityRate(r,catalog){
 const master=catalog?.rates?.find(x=>x.id===r?.id)||r;if(!master)return {};
 if((master.factors||[]).some(f=>f.param==='complexity'))return master;
 const shared=(catalog?.pricingDefaults?.factorDefinitions||[]).filter(f=>f.param==='complexity'&&f.kind==='category'&&f.enabled!==false);
 return shared.length?{...master,factors:[...(master.factors||[]),...shared]}:master;
}
function complexityLevels(r){
 if(r?.complexityLevels)return r.complexityLevels.map(x=>pick(x,['factorId','label','groups','rateGroups']));
 const rows=[];for(const f of r?.factors||[]){if(f.enabled===false||f.param!=='complexity'||f.kind!=='category')continue;for(const c of f.categories||[])rows.push({factorId:f.sharedFactorId||f.id,label:String(c.key),groups:copy(f.productGroups||[]),rateGroups:copy(r.productGroups||[])});}return rows;
}
function choiceFor(op){return op?.complexityChoice?pick(op.complexityChoice,['factorId','label']):(op?.complexity?{factorId:'',label:op.complexity.label}:undefined);}
function resolveComplexity(rate,choice,group){
 const allowed=complexityLevels(rate).some(x=>x.factorId===choice?.factorId&&x.label===choice?.label&&(!x.groups.length||x.groups.includes(group))&&(!x.rateGroups.length||x.rateGroups.includes(group)));
 if(!allowed){
  const matching=complexityLevels(rate).filter(x=>x.factorId===choice?.factorId&&x.label===choice?.label);
  if(matching.length&&!group)throw Error('Sản phẩm chưa phân nhóm. Chọn nhóm sản phẩm để lấy mức độ phức tạp phù hợp trong danh mục.');
  if(matching.length)throw Error('Mức độ phức tạp đã chọn không áp dụng cho nhóm '+group+'. Chọn lại mức theo nhóm sản phẩm hiện tại.');
  throw Error('Mức độ phức tạp đã chọn không còn trong danh mục của nguyên công. Mở lại khai báo để chọn mức hiện có.');
 }
 const f=rate.factors.find(x=>(x.sharedFactorId||x.id)===choice.factorId&&x.param==='complexity'),c=f.categories.find(x=>String(x.key)===choice.label),value=Number(c.percent),multiplier=f.valueMode==='multiplier'?value:1+value/100;
 if(c.percent===null||c.percent===''||!Number.isFinite(multiplier)||multiplier<=0)throw Error('Hệ số trong danh mục chưa hợp lệ; người phụ trách giá cần kiểm tra.');
 return {label:choice.label,multiplier};
}
function resolveDocumentChoices(d,before,catalog,canFactors){
 const old=new Map();const index=ns=>{for(const n of ns||[]){old.set(n.id,n);index(n.children);}};index(before?.quote?.products);
 function visit(ns,group=''){for(const n of ns||[]){const g=n.productGroup||group,prev=old.get(n.id);for(const [i,op]of (n.ops||[]).entries()){
  const previous=(prev?.ops||[]).find((o,j)=>o.id===op.id&&(o.instanceId&&op.instanceId?o.instanceId===op.instanceId:j===i));
  if(!equal(choiceFor(previous),choiceFor(op))){
   if(op.complexityChoice?.factorId){const rate=complexityRate(d.quote.ratesSnapshot.find(r=>r.id===op.id),catalog||d);op.complexity=resolveComplexity(rate,op.complexityChoice,g);}
   else if(!op.complexityChoice&&!op.complexity)delete op.complexity;
   else if(!canFactors)throw Error('Chỉ chọn mức độ đã khai; không được nhập hệ số phức tạp.');
  }else if(!canFactors&&!equal(previous?.complexity,op.complexity))throw Error('Không được thay hệ số phức tạp; chỉ chọn mức độ từ danh mục.');
 }visit(n.children,g);}}
 visit(d.quote.products);return d;
}
function rate(x,source){return {...pick(x,['id','name','machine','technicalNotes','unit','insideUnit','outsideUnit','finishing','productGroups','operationType','consumptionsEnabled']),...(complexityLevels(source||x).length?{complexityLevels:complexityLevels(source||x)}:{}),inside:0,outside:0,factors:[],...(x.consumption?{consumption:recipe(x.consumption)}:{}),...(x.consumptions?{consumptions:x.consumptions.map(recipe)}:{})};}
function node(x,q={}){return {...pick(x,nodeKeys),...(x.spec?{spec:spec(x.spec)}:{}),...(x.ruleSpec?{ruleSpec:pick(x.ruleSpec,ruleKeys)}:{}),...(x.outsource?{outsource:{...pick(x.outsource,['enabled','supplier','output','materialSupply','unit','quantity']),price:0}}:{}),ops:(x.ops||[]).map(o=>{const r=q.ratesSnapshot?.find(r=>r.id===o.id),option=r?.priceOptions?.find(p=>p.id===(q.operationPriceOptions?.[o.id]||o.priceOptionId)),method=option?.method||q.operationMethods?.[o.id]||o.pricingMethod;
 const unit=method==='fixed'?'gói':method==='direct'&&!option?o.priceUnit:(option||r)?.[o.mode+'Unit']||r?.unit;
 return {...pick(o,opKeys),...(choiceFor(o)?{complexityChoice:copy(choiceFor(o))}:{}),pricingMethod:'direct',unitPrice:0,priceUnit:unit||'kg'};
 }),children:(x.children||[]).map(n=>node(n,q))};}
function project(d,catalog){const source=r=>complexityRate(r,catalog||d);return {version:2,materials:(d.materials||[]).map(spec),rates:(d.rates||[]).map(r=>rate(r,source(r))),rules:(d.rules||[]).map(x=>pick(x,ruleKeys)),library:(d.library||[]).map(n=>node(n,{ratesSnapshot:d.rates})),shapeDefinitions:copy(d.shapeDefinitions||[]),stockSizes:copy(d.stockSizes||[]),conventions:{},materialPrices:[],history:[],quote:{...pick(d.quote,quoteKeys),...(d.quote.customerInfo?{customerInfo:pick(d.quote.customerInfo,['id','name','contact','phone','email','address','taxId'])}:{}),status:d.quote.status,products:d.quote.products.map(n=>node(n,d.quote)),ratesSnapshot:(d.quote.ratesSnapshot||[]).map(r=>rate(r,source(r))),pricing:{version:2,selected:'detail',comparisonMethods:['detail'],overhead:0,management:0,special:0,profit:0,processing:0,order:0,customer:0,incoming:0,outgoing:0,delivery:0,install:0},vat:0,expenses:[]}};}
function merge(original,input,catalog){
 // Only a technical projection is accepted; hidden values must never round-trip.
 original=copy(original);
 for(const incoming of input.quote?.ratesSnapshot||[]){if(original.quote.ratesSnapshot.some(r=>r.id===incoming.id))continue;const master=catalog?.rates?.find(r=>r.id===incoming.id&&r.enabled!==false);if(!master)throw Error('Công đoạn không có trong danh mục đang dùng');const projectedMaster=rate(master,complexityRate(master,catalog));if(!equal(incoming,projectedMaster))throw Error('Công đoạn mới phải đúng bảng danh mục');original.quote.ratesSnapshot.push(copy(master));}
 const submitted=copy(input),before=project(original,catalog);
 delete submitted.quote?.workspaceKey;
 // Browser identities may be assigned to legacy recipes without changing them.
 for(const r of submitted.quote?.ratesSnapshot||[]){const old=before.quote.ratesSnapshot.find(x=>x.id===r.id);if(!old)continue;for(const [i,recipe] of (r.consumptions||[]).entries())if(old.consumptions?.[i]?.id===undefined)delete recipe.id;if(r.consumption&&old.consumption?.id===undefined)delete r.consumption.id;}
 const projected=project(submitted);
 if(JSON.stringify(canonical(submitted))!==JSON.stringify(canonical(projected)))throw Error('Dữ liệu kỹ thuật chứa trường giá hoặc trường không được phép: '+differencePaths(submitted,projected).slice(0,4).join(', '));
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
  if(n.auxiliaryPercent!==undefined&&(!Number.isFinite(n.auxiliaryPercent)||n.auxiliaryPercent<0||n.auxiliaryPercent>100||n.kind!=='material'))throw Error('Vật tư phụ chỉ khai cho vật tư, từ 0 đến 100%');
  if(!equal(n.outsource,prev?node(prev,original.quote).outsource:undefined))throw Error('Gói thuê được quản lý tại Giá & hệ số');
  if(n.kind==='product'&&n.productGroup!==prev?.productGroup&&n.productGroup){next.priceGroupId=n.productGroup==='Thang máng cáp'?'tmc':'detail';next.tmcScope=next.priceGroupId;if(next.priceGroupId==='tmc'&&!result.quote.pricing.comparisonMethods?.includes('tmc'))(result.quote.pricing.comparisonMethods??=['detail']).push('tmc');}
  if(n.spec){const material=prev?.materialId===n.materialId&&!prev.draftMaterial?prev.spec:original.materials.find(m=>m.id===n.materialId)||catalog?.materials?.find(m=>m.id===n.materialId);next.spec=assign(copy(material||{price:null}),n.spec,specKeys);if(!material)next.draftMaterial=true;else if(prev?.draftMaterial)delete next.draftMaterial;}
  if(n.ruleSpec)next.ruleSpec=copy(n.ruleSpec);
  const used=new Set();next.ops=n.ops.map((op,index)=>{if(!original.quote.ratesSnapshot.some(r=>r.id===op.id))throw Error('Chọn công đoạn có trong báo giá');const existing=(prev?.ops||[]).find((o,i)=>!used.has(i)&&o.id===op.id&&(op.instanceId&&o.instanceId?o.instanceId===op.instanceId:i===index));if(existing)used.add(prev.ops.indexOf(existing));const merged=assign(existing?copy(existing):{},op,opKeys);
   if(!equal(choiceFor(existing),op.complexityChoice)){
    if(!op.complexityChoice)delete merged.complexity;
    else {const r=complexityRate(original.quote.ratesSnapshot.find(r=>r.id===op.id),catalog||original);let group='';const path=(nodes,parents=[])=>{for(const x of nodes){const chain=parents.concat(x);if(x.id===n.id)return chain;const found=path(x.children||[],chain);if(found)return found;}};group=(path(submitted.quote.products)||[]).reverse().find(x=>x.productGroup)?.productGroup||'';merged.complexity=resolveComplexity(r,op.complexityChoice,group);}
   }
   return merged;});
  next.children=n.children.map(combine);return next;
 }
 assign(result.quote,submitted.quote,quoteKeys.filter(k=>!['customer','project'].includes(k)||Object.hasOwn(submitted.quote,k)));result.quote.products=submitted.quote.products.map(combine);return result;
}
function differencePaths(a,b,path='document'){
 if(equal(a,b))return [];
 if(a&&b&&typeof a==='object'&&typeof b==='object')return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>differencePaths(a[k],b[k],path+'.'+k));
 return [path];
}
function canonical(x){return Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;}
function equal(a,b){return JSON.stringify(canonical(a))===JSON.stringify(canonical(b));}
// Catalogue editing is independent from permission to see commercial values.
const catalogSections=['catalogMaterials','catalogRules','catalogLibrary','catalogTechnicalOperations'];
const conventionKinds=['productGroups','materialGroups','parameters','substances','grades','characteristics','units'];
const conventionKeys=['name','label','parent','unit','density','stock','hidden'];
function projectCatalog(d){
 const empty={quote:{status:'draft',products:[],ratesSnapshot:[]}},p=project({...d,...empty});
 return {materials:p.materials,rates:p.rates,rules:p.rules,library:p.library,shapeDefinitions:p.shapeDefinitions,stockSizes:p.stockSizes,materialPrices:[],pricingDefaults:{},conventions:Object.fromEntries(conventionKinds.filter(k=>d.conventions?.[k]).map(k=>[k,d.conventions[k].map(x=>pick(x,conventionKeys))]))};
}
function mergeCatalog(original,input){
 if(!input||!equal(input,projectCatalog(input)))throw Error('Danh mục kỹ thuật chứa giá, hệ số hoặc trường không được phép');
 const before=projectCatalog(original),result=copy(original);
 for(const k of ['pricingDefaults','materialPrices'])if(!equal(before[k],input[k]))throw Error('Không được thay đổi đơn giá hoặc hệ số');
 // Technical edits never replace commercial fields. New operations start with zero placeholders.
 const technicalKeys=['name','machine','technicalNotes'];
 if(original.rates.some(r=>!input.rates.some(x=>x.id===r.id)))throw Error('Không xóa công đoạn qua danh mục kỹ thuật');
 result.rates=input.rates.map(r=>{
  const old=original.rates.find(x=>x.id===r.id),base=old||{id:r.id,unit:'kg',insideUnit:'kg',outsideUnit:'kg',inside:0,outside:0,factors:[],operationType:'detail'};
  const expected=rate(base,old?complexityRate(base,original):base),submitted=copy(r);for(const k of technicalKeys)delete expected[k],delete submitted[k];
  if(!equal(expected,submitted))throw Error('Chỉ sửa thông tin kỹ thuật của công đoạn');
  if(typeof r.name!=='string'||!r.name.trim()||r.name.length>200||typeof(r.machine??'')!=='string'||(r.machine||'').length>200||typeof(r.technicalNotes??'')!=='string'||(r.technicalNotes||'').length>2000)throw Error('Thông tin công đoạn không hợp lệ');
  const out=copy(base);for(const k of technicalKeys){if(r[k]===undefined)delete out[k];else out[k]=copy(r[k]);}return out;
 });
 const assign=(old,item,keys)=>{const out=copy(old||{});for(const k of keys){if(item[k]===undefined)delete out[k];else out[k]=copy(item[k]);}return out;};
 result.materials=input.materials.map(m=>{const old=original.materials.find(x=>x.id===m.id);return {...assign(old,m,specKeys),price:old?.price??0};});
 result.rules=input.rules.map(r=>assign(original.rules.find(x=>x.id===r.id),r,ruleKeys));
 for(const k of ['shapeDefinitions','stockSizes'])result[k]=copy(input[k]);
 result.conventions??={};for(const k of conventionKinds){if(!Object.hasOwn(input.conventions,k)){delete result.conventions[k];continue;}result.conventions[k]=input.conventions[k].map(x=>assign(original.conventions?.[k]?.find(o=>o.name===x.name),x,conventionKeys));}
 // Reuse the quote merge to retain hidden prices and operation choices in templates.
 const fake={...result,quote:{status:'draft',products:original.library||[],ratesSnapshot:original.rates,pricing:{}}};
 const technical=project(fake);technical.quote.products=copy(input.library);
 const merged=merge(fake,technical).quote.products,oldNodes=new Map();
 const index=ns=>{for(const n of ns){oldNodes.set(n.id,n);index(n.children||[]);}};index(original.library||[]);
 const retain=n=>{const old=oldNodes.get(n.id);if(old&&equal(node(n,{ratesSnapshot:original.rates}),node(old,{ratesSnapshot:original.rates})))return copy(old);n.children=(n.children||[]).map(retain);if(old&&!old.children&&!n.children.length)delete n.children;return n;};
 result.library=merged.map(retain);
 return result;
}
const api={complexityRate,resolveDocumentChoices,complexityLevels,choiceFor,resolveComplexity,project,merge,nodeKeys,opKeys,projectCatalog,mergeCatalog,catalogSections};if(typeof module!=='undefined')module.exports=api;else root.TPTechnical=api;
})(typeof globalThis!=='undefined'?globalThis:this);
