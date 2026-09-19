/* Quotation analysis extension. Pure calculations; legacy quotes remain unchanged
 * until explicitly enabled. All seed rates and policies are demonstration values. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const W=typeof module!=='undefined'?require('./work-core.js'):root.TPWork;
const M=typeof module!=='undefined'?require('./manufacturing-core.js'):root.TPMfg;
const D=typeof module!=='undefined'?require('./device-core.js'):root.TPDevice;
const Tax=typeof module!=='undefined'?require('./tax-core.js'):root.TPTax;
const Offer=typeof module!=='undefined'?require('./offer-terms-core.js'):root.TPOfferTerms;
const G=typeof module!=='undefined'?require('./group-pricing-core.js'):root.TPGroupPrice;
const Flow=typeof module!=='undefined'?require('./cost-flow-core.js'):root.TPCostFlow;
const legacyCalculate=C.calculate, legacySeed=C.seed;
const METHODS=[['detail','Theo tính toán'],['tmc','Theo thang máng cáp'],['kg','Theo kg phôi'],['competitor','Theo đối thủ']];
const PARTS=['stock','ancillary','allowance','finishing','factory','outside','tmcCommon','incoming','outgoing','install','delivery'];
const copy=C.copy, finite=v=>v!==null&&v!==''&&v!==undefined&&Number.isFinite(Number(v));
function amount(v,label,errors,allowNegative=false){if(!finite(v)||(!allowNegative&&Number(v)<0)){errors.push(label+': cần nhập số '+(allowNegative?'hợp lệ':'không âm'));return 0;}return Number(v);}
function defaults(){return {version:2,selected:'detail',comparisonMethods:['detail'],overhead:2,management:3,special:0,profit:10,processing:3,order:5,reserve:0,customer:0,salesFactors:[],productionFactors:[],incoming:0,outgoing:0,delivery:0,install:0,overrides:{},tmcLoss:1.5,tmcTables:[
  {id:'tray',name:'Máng cáp',unit:'m',tiers:[{max:100,price:2000},{max:500,price:5000},{max:1000,price:7000},{max:null,price:10000}]},
  {id:'ladder',name:'Thang cáp',unit:'m',tiers:[{max:100,price:2000},{max:500,price:5000},{max:1000,price:7000},{max:null,price:10000}]},
  {id:'cover',name:'Nắp thang / máng',unit:'cái',tiers:[{max:100,price:1000},{max:500,price:1000},{max:1000,price:2000},{max:null,price:2000}]},
  {id:'accessory',name:'Phụ kiện máng',unit:'cái',tiers:[{max:100,price:2000},{max:500,price:5000},{max:1000,price:7000},{max:null,price:10000}]}
]};}
const FLOW_SEQUENCE='delivery-before-overhead-v1';
function currentFlow(q){return q.pricing?.costSequence===FLOW_SEQUENCE;}
function adoptFlow(q){
 if(['submitted','approved'].includes(q.status))throw Error('Bản đã khóa; mở bản sửa trước khi đổi luồng giá');
 if(!q.pricing)throw Error('Cần bật luồng báo giá');
 q.pricing.costSequence=FLOW_SEQUENCE;q.pricing.overrides={};delete q.pricing.taxReview;
}
function enable(db){if(db.quote.pricing)return;db.quote.pricing=defaults();db.quote.status='draft';adoptFlow(db.quote);}
function supplement(q,n,id,detail,errors){
 const x=n.benchmarkScope?.[id];
 if(x===undefined&&!currentFlow(q))return {amount:0,legacy:true,rows:[]};
 const rows=[];
 for(const key of ['incoming','outgoing','delivery','install']){
  const status=x?.[key];
  if(!['included','detail','none'].includes(status)){errors.push(n.name+': xác nhận phạm vi '+id+' / '+key);continue;}
  const amount=status==='detail'?detail.parts[key]:0;
  if(!Number.isFinite(amount)||amount<0)errors.push(n.name+': chưa tính được phí '+key);
  rows.push({key,status,amount});
 }
 return {rows,amount:rows.reduce((sum,r)=>sum+r.amount,0),legacy:false};
}

function refreshPrices(db){
  for(const n of C.flatten(db.quote.products))if(n.kind==='material'){
    const m=db.materials.find(m=>m.id===n.materialId);if(m&&m.unit===n.spec.unit&&(m.brand||'')===(n.spec.brand||'')&&(m.specification||'')===(n.spec.specification||''))n.spec.price=m.price;
  }
  db.quote.ratesSnapshot=copy(db.rates);
  for(const rate of db.quote.ratesSnapshot)for(const recipe of W.recipes(rate)){const spec=recipe.spec;if(!spec)continue;const m=db.materials.find(m=>m.id===spec.id);if(m&&m.unit===spec.unit&&(m.brand||'')===(spec.brand||'')&&(m.specification||'')===(spec.specification||''))spec.price=m.price;}
}
function tier(value,tiers,key='percent'){
  if(!finite(value)||Number(value)<0)throw Error('Thiếu giá trị đầu vào để tra bậc');
  if(!Array.isArray(tiers)||!tiers.length)throw Error('Chưa khai báo các bậc');
  let previous=0,found=null;
  tiers.forEach((s,i)=>{
    const last=i===tiers.length-1,upper=s.max===null?Infinity:Number(s.max);
    if(!finite(s[key])||(key==='percent'?Number(s[key])<=-100:Number(s[key])<0))throw Error('Giá trị của bậc chưa hợp lệ');
    if(s.max===null&&!last||s.max!==null&&(!finite(s.max)||upper<=previous))throw Error('Mốc bậc phải tăng dần, không chồng nhau');
    if(found===null&&Number(value)<=upper)found={value:Number(s[key]),min:previous,max:s.max,index:i};
    previous=upper;
  });
  if(!found)throw Error('Giá trị vượt các bậc đã khai báo; cần thêm bậc cuối');
  return found;
}
function context(n,r){
  const leaves=C.flatten([n]).filter(x=>x.kind==='material'&&x.spec.shape!=='piece');
  const unique=k=>{const raw=leaves.map(x=>({...x.dims,...x.spec.props})[k]);const values=[...new Set(raw.filter(finite).map(Number))];return raw.length&&raw.every(finite)&&values.length===1?values[0]:undefined;};
  return {...Object.fromEntries(['T','W','H','L'].map(k=>[k,n.kind==='material'?({...n.dims,...n.spec.props})[k]:(n.params?.[k]??unique(k))])),count:r.count,weight:r.workWeight??r.weight,area:r.workArea??r.area};
}
function appliedRate(rate,op,ctx){
  return W.price(rate,op,ctx,tier);
}
function stockNet(row){const {spec:m,geometry:g}=row;
  if(m.unit==='kg')return g.weight*m.price;
  if(m.unit==='m'||m.unit==='m²')return g.measure*m.price;
  const unitMeasure=m.shape==='sheet'?m.stockL*m.stockW/1e6:m.stockL/1000;
  return unitMeasure>0?g.measure/unitMeasure*m.price:0;
}
// Quantities used to value materials, independent of prices (including zero prices).
// Auxiliary equivalent quantities are monetary allowances, never physical demand.
function materialValuation(row,result,q){
  const m=row.spec,physical=m.shape!=='piece',percent=physical?Number(row.node.auxiliaryPercent||0):0;
  if(row.externallySupplied)return {weight:0,area:0,basis:0,unit:m.unit,method:'Bên gia công cấp — đã gồm trong gói',percent,cost:0,auxiliaryWeight:0,auxiliaryBasis:0,auxiliaryCost:0};
  if(row.node.materialEstimate&&physical&&!row.estimate)return {error:'Chưa tính được phôi và hao hụt'};
  let weight=0,basis=0,area=0,method='Theo số lượng';
  if(!physical)basis=row.count;
  else if(row.estimate){({weight,area,basis}=row.estimate);method='Phôi + hao hụt '+row.estimate.percent+'%';}
  else {const group=result.groups.find(g=>g.rows.some(r=>r.id===row.id));
    if(!group||group.error)return {error:group?.error||'Chưa có lượng vật tư tính tiền'};
    const share=row.geometry.measure/group.rows.reduce((s,r)=>s+r.geometry.measure,0),kept=q.remnantMode==='exclude'?1-group.reusableMeasure/group.layout.purchased:1;
    weight=row.purchasedWeight*kept;area=row.purchasedArea*kept;
    basis=m.unit==='kg'?weight:['m','m²'].includes(m.unit)?group.purchasedMeasure*share*kept:group.layout.stocks.length*share*kept;
    method=q.remnantMode==='exclude'?'Khổ mua trừ phần dư tận dụng':'Theo khổ mua';
  }
  if(row.externallySupplied){weight=area=basis=0;method='Bên gia công cấp — đã gồm trong gói';}
  return {weight,area,basis,unit:m.unit,method,percent,cost:row.cost,auxiliaryWeight:weight*percent/100,auxiliaryBasis:basis*percent/100,auxiliaryCost:row.cost*percent/100};
}
function calculate(db){
  const base=legacyCalculate(db),q={...db.quote,products:base.products.map(r=>r.node)},config=q.pricing;
  if(!config)return base;
  const errors=[...base.errors.filter(e=>!e.startsWith('Biên lợi nhuận')),...W.methodErrors(q),...G.profileErrors(q)],warnings=[],includedGenerated=[];
  if(!q.products.length)errors.push('Chưa có sản phẩm trong báo giá');
  const p={...defaults(),...config};
  if(config.costSequence!==undefined&&!['legacy',FLOW_SEQUENCE].includes(config.costSequence))errors.push('Phiên bản luồng giá không hợp lệ');
  for(const key of ['overhead','management','special','profit','processing','order','reserve','customer']){
    if(!finite(p[key])||Number(p[key])<=-100)errors.push('Hệ số '+key+' phải lớn hơn -100%');
    p[key]=finite(p[key])?Number(p[key]):0;
  }
  const productionFactors=(p.productionFactors||[]).filter(f=>f.enabled!==false);for(const f of productionFactors)if(!String(f.name||'').trim()||!finite(f.percent)||Number(f.percent)<=-100)errors.push('Yếu tố sản xuất cần tên và hệ số lớn hơn -100%');
  const salesFactors=[...(p.reserve?[{id:'reserve',name:'Dự phòng bổ sung',percent:p.reserve}]:[]),...(p.salesFactors||[])].filter(f=>f.enabled!==false);
  for(const f of salesFactors)if(!finite(f.percent)||Number(f.percent)<=-100)errors.push('Yếu tố bán '+f.name+': hệ số phải lớn hơn -100%');
  if(!finite(q.vat)||q.vat<0||q.vat>100)errors.push('Thuế suất chưa hợp lệ');
  errors.push(...Tax.outputErrors(q));
  const globals=Object.fromEntries(['incoming','outgoing','install','delivery'].map(k=>[k,amount(p[k],{incoming:'Vận chuyển nhập',outgoing:'Vận chuyển thuê ngoài',install:'Lắp đặt',delivery:'Giao hàng'}[k],errors)]));
  const zeros=()=>Object.fromEntries(PARTS.map(k=>[k,0]));
  const rowMap=new Map(base.rows.map(r=>[r.id,r]));
  function walk(n){const r=base.nodes[n.id],parts=zeros();r.ownGenerated=[];r.ownOps=[];r.replaceableFactory=0;r.ownReplaceableFactory=0;
    for(const child of n.children||[]){const childResult=walk(child);for(const key of PARTS)parts[key]+=childResult.parts[key];r.replaceableFactory+=childResult.replaceableFactory;}
    if(n.kind==='material'){
      if(!rowMap.get(n.id)?.externallySupplied)amount(n.spec.price,n.materialId+' / đơn giá vật tư',errors);
      const row=rowMap.get(n.id);parts[n.spec.shape==='piece'?'ancillary':'stock']+=row?.cost||0;if(n.spec.shape!=='piece')parts.allowance+=(row?.cost||0)*amount(n.auxiliaryPercent??0,n.name+' / vật tư phụ %',errors)/100;
    }
    for(const [i,op] of (n.ops||[]).entries()){
      let item={name:'Nguyên công chưa có giá',mode:op.mode,unit:'',basis:0,rate:0,cost:0,factors:[],index:i};
if(r.coveredBy&&!op.afterPackage){const rate=q.ratesSnapshot.find(x=>x.id===op.id);r.ownOps.push({...item,name:rate?.name||op.id,skipped:true,reason:'Đã nằm trong gói thuê '+base.nodes[r.coveredBy].node.name});for(const [ri,recipe]of W.recipes(rate||{}).entries())try{const g=W.consume(recipe,n,r,ri,i,rate.name,W.methodFor(op,q)==='fixed'?'gói':W.methodFor(op,q)==='direct'?op.priceUnit:(rate[op.mode+'Unit']||rate.unit));includedGenerated.push({...g,referenceCost:g.cost,cost:0,included:true,reason:'Đã gồm trong gói thuê '+base.nodes[r.coveredBy].node.name});}catch(e){includedGenerated.push({ownerId:n.id,rateName:rate.name,materialId:recipe.spec?.id,error:e.message,included:true,cost:0});}continue;}
      try{
        const rate=q.ratesSnapshot.find(x=>x.id===op.id);if(!rate)throw Error('Không tìm thấy mã nguyên công');
        const ctx={...context(n,r),...W.context(n,r,q.products,q)};
        const applied=W.operation(rate,{...op,pricingMethod:W.methodFor(op,q),priceOptionId:W.optionFor(op,q)},ctx,r,tier),cost=applied.cost;
        item={...item,...applied,name:rate.name};
        parts[op.mode==='outside'?'outside':'factory']+=cost;
        if(op.mode==='inside'&&(M.laborReplaces(q.pricing,rate.id)??rate.tmcReplace)){r.replaceableFactory+=cost;if(!op.afterPackage)r.ownReplaceableFactory+=cost;}
        for(const [recipeIndex,recipe] of W.recipes(rate).entries()){if(applied.skipped&&recipe.basis==='kg')continue;
          const generated=W.consume(recipe,n,r,recipeIndex,i,rate.name,applied.unit);if(op.mode==='outside'&&op.suppliesIncluded!==false)includedGenerated.push({...generated,referenceCost:generated.cost,cost:0,included:true,reason:'Vật tư đã gồm trong giá thuê nguyên công'});else{r.ownGenerated.push(generated);parts.finishing+=generated.cost;}
        }
      }catch(e){item.error=e.message;errors.push(n.name+' / '+e.message);}
      r.ownOps.push(item);
    }
    if(r.packageOwner){try{r.packageCharge=M.packageCost(n,r);parts.outside+=r.packageCharge.cost;}catch(e){errors.push(n.name+' / '+e.message);r.packageCharge={error:e.message,ownerId:n.id};}}
    // Legacy unclassified node transport is shown explicitly as delivery in this mode.
    for(const [field,key] of [['freightIn','incoming'],['freightOut','outgoing'],['transport','delivery'],['install','install']])parts[key]+=amount(n[field]??0,n.name+' / '+field,errors)*r.count;
    r.parts=parts;r.material=parts.stock+parts.ancillary+parts.allowance+parts.finishing;r.ops=parts.factory+parts.outside;
    r.transport=parts.incoming+parts.outgoing+parts.delivery;r.install=parts.install;
    return r;
  }
  const roots=q.products.map(walk),weight=roots.reduce((s,r)=>s+r.weight,0),qty=roots.reduce((s,r)=>s+r.count,0);
  for(const r of roots){const share=weight>0?r.weight/weight:qty>0?r.count/qty:0;for(const key of Object.keys(globals))r.parts[key]+=globals[key]*share;}
  const generated=Object.values(base.nodes).flatMap(r=>r.ownGenerated||[]),logistics=W.expenses(q.expenses||[],{...base,products:roots,quote:q},generated);
  errors.push(...logistics.errors);
  for(const r of roots)for(const key of ['incoming','outgoing','delivery','install'])r.parts[key]+=logistics.allocations[r.node.id]?.[key]||0;
  const devices=D.calculate(q,base,logistics);errors.push(...devices.errors);
  for(const r of Object.values(base.nodes))r.deviceParts={factory:0,install:0};
  for(const e of devices.items)if(!e.error&&e.cost)for(const n of C.nodePath(q.products,e.nodeId)||[]){const r=base.nodes[n.id],key=e.stage==='production'?'factory':'install';r.deviceParts[key]+=e.cost;r.parts[key]+=e.cost;if(key==='factory')r.ops+=e.cost;else r.install+=e.cost;}
  const makeCost=(r,parts,includeProductionExtras=true,policy=p)=>{
    // Preserve historical quotes; new flow moves common/management after delivery/install.
    const direct=PARTS.filter(k=>!['delivery','install'].includes(k)).reduce((s,k)=>s+parts[k],0),modern=currentFlow(q);
    let overhead=0,management=0,special=0,production=direct;
    if(modern){special=direct*policy.special/100;production+=special;}
    else {overhead=direct*policy.overhead/100;management=(direct+overhead)*policy.management/100;special=(direct+overhead+management)*policy.special/100;production+=overhead+management+special;}
    const productionSteps=[];for(const f of includeProductionExtras?productionFactors:[]){const percent=Number(f.percent)||0,base=production,value=base*percent/100;production+=value;productionSteps.push({...f,percent,base,value,total:production});}
    const productionExtras=productionSteps.reduce((sum,f)=>sum+f.value,0),baseBeforeCommon=production+parts.delivery+parts.install;
    const overheadBase=modern?baseBeforeCommon:direct;
    if(modern){overhead=overheadBase*policy.overhead/100;management=(overheadBase+overhead)*policy.management/100;}
    const managementBase=overheadBase+overhead,cost=baseBeforeCommon+(modern?overhead+management:0);
    let running=cost;const saleSteps=[];
    for(const f of [{id:'profitMarkup',name:'Lợi nhuận',percent:policy.profit},{id:'processing',name:'Xử lý',percent:policy.processing},{id:'order',name:'Đơn hàng',percent:policy.order},{id:'customer',name:'Khách hàng',percent:policy.customer},...(policy===p?salesFactors:[])]){
      const percent=Number(f.percent)||0,base=running,value=base*percent/100;running+=value;saleSteps.push({...f,percent,base,value,total:running});
    }
    const stepValue=id=>saleSteps.find(f=>f.id===id)?.value||0;
    return {...r,parts:{...parts},direct,overhead,management,special,production,cost,baseBeforeCommon,overheadBase,managementBase,policyRates:{overhead:policy.overhead,management:policy.management,special:policy.special},productionSteps,productionExtras,saleSteps,profitMarkup:stepValue('profitMarkup'),processing:stepValue('processing'),order:stepValue('order'),customer:stepValue('customer'),reserve:stepValue('reserve'),saleExtras:saleSteps.slice(4).reduce((s,f)=>s+f.value,0),
      material:parts.stock+parts.ancillary+parts.allowance+parts.finishing,ops:parts.factory+parts.outside,
      suggestedUnit:r.node.qty>0?Math.round(running/r.node.qty):0};
  };
  const detailErrors=[];
  const flowCost=(r,reference,flow,parameters,methodErrors,extras=true,policy=p)=>{try{const x=Flow.apply(q,r,reference,flow,parameters,base);return {...makeCost(r,x.parts,extras,policy),costFlow:x.rows,flowDeviceParts:x.deviceParts};}catch(e){methodErrors.push(r.node.name+' / luồng giá: '+e.message);return {...makeCost(r,r.parts,extras,policy),flowError:e.message};}};
  const detail=roots.map(r=>flowCost(r,r,p.costFlows?.detail,[],detailErrors));
  const tmcErrors=[];
  const tmc=roots.map((r,index)=>{
const scope=G.resolve(q,r.node).scope;
    if(scope==='detail')return {...detail[index],tmc:{items:[],scope:'detail',note:'Ngoài thang máng cáp — tính chi tiết'}};
    if(scope!=='tmc')tmcErrors.push(r.node.name+': chưa xác định nhóm sản phẩm TMC hay cơ khí khác');
    const tmcRoot={...r,parts:{...r.parts,factory:r.parts.factory-r.deviceParts.factory,install:r.parts.install-r.deviceParts.install}};
    let computed={parts:{...tmcRoot.parts},items:[]};try{computed=M.tmc(tmcRoot,base,p,tier,stockNet,(n,rr)=>({...context(n,rr),...W.context(n,rr,q.products,q)}));}catch(e){tmcErrors.push(r.node.name+': '+e.message);}
    return {...flowCost({...r,parts:computed.parts,flowDeviceParts:{factory:0,install:0}},r,p.costFlows?.tmc,[],tmcErrors,false,M.policyErrors(p).length?p:p.tmcPolicy),tmc:{...computed,scope:'tmc'}};
  });
  const alternatives={};
  function totalOf(products){const totals={parts:zeros(),material:0,ops:0,transport:0,install:0,cost:0,sell:0,weight:0,area:0,direct:0,production:0,overhead:0,management:0,special:0,productionExtras:0,profitMarkup:0,processing:0,order:0,customer:0,reserve:0,saleExtras:0};
    for(const r of products){for(const key of PARTS)totals.parts[key]+=r.parts[key];for(const key of ['material','ops','cost','sell','weight','area','direct','production','overhead','management','special','productionExtras','profitMarkup','processing','order','customer','reserve','saleExtras'])totals[key]+=r[key]||0;}
    // Delivery/install already form base cost and therefore the quoted unit price.
    totals.delivery=totals.parts.delivery;totals.beforeTax=totals.sell;
    totals.transport=totals.parts.incoming+totals.parts.outgoing+totals.parts.delivery;totals.install=totals.parts.install;
    Object.assign(totals,Tax.outputTotals(q,products));totals.grand=totals.beforeTax+totals.vat;totals.profit=totals.beforeTax-totals.cost;
    return totals;
  }
for(const [id,name] of G.methods(q)){
    const applicability=G.applicability(q,id);
    const methodErrors=[...detailErrors,...(id==='tmc'?tmcErrors:[]),...applicability.reasons];
    const products=(id==='tmc'?tmc:detail).map((row,index)=>{
let r=row;const profile=id.startsWith('group:')&&G.resolve(q,r.node).id===id.slice(6)?G.resolve(q,r.node).group:null;
if(profile?.engine==='components'){if(!W.groupsMatch(profile.productGroups,r.node.productGroup))methodErrors.push(r.node.name+': ngoài nhóm áp dụng '+profile.name);r=flowCost(roots[index],roots[index],profile.flow,profile.parameters,methodErrors);}
let suggested=r.suggestedUnit,groupCalculation=null;
      if(profile?.engine==='formula')try{groupCalculation=G.evaluate(profile,r);suggested=groupCalculation.unit;}catch(e){methodErrors.push(r.node.name+': '+e.message);}
      let benchmarkSupplement=null;
      if(['kg','competitor'].includes(id))benchmarkSupplement=supplement(q,r.node,id,detail[index],methodErrors);
      if(id==='kg'){
        if(!(r.weight>0))methodErrors.push(r.node.name+': không có kg phôi để áp giá/kg');
        const entered=amount(r.node.pricePerKg,r.node.name+' / đơn giá/kg',methodErrors),tax=Tax.declaration(db.quote,r.node,'kg');
        suggested=Math.round(((tax.known?tax.net:entered)*r.weight+benchmarkSupplement.amount)/r.node.qty);
      }
      if(id==='competitor'){const entered=amount(r.node.competitorPrice,r.node.name+' / giá đối thủ',methodErrors),tax=Tax.declaration(db.quote,r.node,'competitor');suggested=Math.round((tax.known?tax.net:entered)+benchmarkSupplement.amount/r.node.qty);}
return {...r,benchmarkSupplement,...(id.startsWith('group:')?{groupCalculation,groupBranch:profile?.engine==='components'?'components':groupCalculation?'formula':'detail'}:{}),suggestedUnit:suggested,unitSell:suggested,sell:Math.round(suggested*r.node.qty)};
    });
alternatives[id]={id,name,products,total:totalOf(products),applicable:applicability.applicable,errors:[...new Set(methodErrors)],ready:applicability.applicable&&!methodErrors.length&&!errors.length};
  }
  const selected=Object.hasOwn(alternatives,p.selected)?alternatives[p.selected]:alternatives.detail;
  if(!Object.hasOwn(alternatives,p.selected))errors.push('Phương án được chọn không hợp lệ');
  errors.push(...selected.errors);
  function signature(product){return JSON.stringify([selected.id,product.node.qty,product.weight,product.cost,product.suggestedUnit]);}
  const products=selected.products.map(product=>{
    const override=p.overrides?.[product.node.id];const r={...product,override:null,priceSignature:signature(product)};
    if(override){
      if(override.mode!==selected.id||override.signature!==r.priceSignature)errors.push(product.node.name+': cần xác nhận lại giá chốt tay sau khi thay dữ liệu');
      if(!String(override.reason||'').trim())errors.push(product.node.name+': giá chốt tay cần lý do');
      r.unitSell=Math.round(amount(override.value,product.node.name+' / giá chốt',errors));r.sell=Math.round(r.unitSell*r.node.qty);r.override=override;
    }
    if(r.sell<r.cost-.01)warnings.push(product.node.name+': giá chào thấp hơn giá gốc '+Math.round(r.cost-r.sell).toLocaleString('vi-VN')+' đồng');
    return r;
  });
  const reuseCost=exclude=>totalOf(roots.map(r=>{
    const parts={...r.parts,stock:r.materialPurchase-r.parts.ancillary-(exclude?r.materialRecoverable:0)};
    parts.allowance=base.rows.filter(row=>row.productId===r.node.id&&row.spec.shape!=='piece').reduce((s,row)=>s+((row.purchaseCost||0)-(exclude?(row.recoverableCredit||0):0))*(row.node.auxiliaryPercent||0)/100,0);
    const x=makeCost(r,parts);return {...x,unitSell:x.suggestedUnit,sell:Math.round(x.suggestedUnit*x.node.qty)};
  }));
  const total=totalOf(products);
  if(!Number.isFinite(total.grand))errors.push('Kết quả tính vượt giới hạn; kiểm tra số liệu');
  const output={...base,products,total,alternatives,pricing:{...p,selected:selected.id},warnings,generated,includedGenerated,logistics,devices,packages:Object.values(base.nodes).filter(r=>r.packageCharge).map(r=>r.packageCharge),
    reuse:{...base.reuse,chargeAll:reuseCost(false),excludeSelected:reuseCost(true)},errors:[...new Set(errors)]};
output.tmcPolicyErrors=roots.some(r=>G.resolve(q,r.node).scope==='tmc')?M.policyErrors(p):[];
  output.comparisonIds=G.comparisonIds(q);
  output.groupIssues=q.products.map(n=>G.resolve(q,n)).filter(x=>!x.known).map(x=>x.reason);
  output.tax=Tax.assess(db.quote,output);
  if(q.documentMode==='official')output.errors=[...new Set([...output.errors,...output.tax.releaseErrors,...Offer.errors(db.quote)])];
  return output;
}
function demoSeed(){
  const db=legacySeed();enable(db);
  const material=db.materials.find(m=>m.id==='PH-T15');Object.assign(material,{price:20000,stockL:2500,stockW:1250});
  const paint=db.materials.find(m=>m.id==='BM-SON');paint.price=80000;
  db.materials.find(m=>m.id==='LK-M8').price=1000;
  const packing={id:'VP-DONGGOI',name:'Vật tư đóng gói',group:'Vật tư phụ',shape:'piece',unit:'cái',price:5000,props:{},substance:'Đóng gói',grade:'',density:1};db.materials.push(packing);
  const factors=[{id:'thickness',name:'Chiều dày',param:'T',enabled:true,tiers:[{max:2,percent:10},{max:4,percent:20},{max:null,percent:30}]},
    {id:'quantity',name:'Số lượng tại cấp thực hiện',param:'count',enabled:true,tiers:[{max:10,percent:-5},{max:50,percent:-10},{max:null,percent:-15}]}];
  Object.assign(db.rates.find(r=>r.id==='cut'),{inside:1000,tmcReplace:true,factors});
  Object.assign(db.rates.find(r=>r.id==='bend'),{inside:4000,tmcReplace:true,factors:[{id:'width',name:'Khổ rộng',param:'W',enabled:true,tiers:[{max:500,percent:20},{max:null,percent:30}]}]});
  Object.assign(db.rates.find(r=>r.id==='paint'),{inside:6000,consumption:{basis:'m²',norm:.12,spec:copy(paint)},factors:[{id:'surface',name:'Diện tích bề mặt',param:'area',enabled:true,tiers:[{max:20,percent:10},{max:null,percent:5}]}]});
  db.rates.push({id:'galvanize',name:'Mạ nhúng nóng',unit:'kg',inside:8000,outside:8000});
  function product(width,finish){
    const body=copy(db.quote.products[0].children[0]);body.id=C.uid();body.ops=[{id:'cut',mode:'inside',amount:1},{id:'bend',mode:'inside',amount:2}];
    const leaf=body.children[0];leaf.id=C.uid();leaf.spec=copy(material);leaf.dims={L:2000,W:width,H:50,F:0};delete leaf.paramLinks;
    const bolt=copy(db.quote.products[0].children[2]);bolt.id=C.uid();bolt.qty=4;bolt.spec=copy(db.materials.find(m=>m.id==='LK-M8'));
    const pack={id:C.uid(),kind:'material',materialId:packing.id,name:packing.name,qty:1,spec:copy(packing),dims:{},rule:'bar',ruleSpec:copy(db.rules.find(r=>r.id==='bar')),ops:[]};
    const n={id:C.uid(),kind:'product',name:'Máng cáp',namePattern:'Máng cáp {W} × {H}, dài {L} mm',params:{L:2000,W:width,H:50},qty:10,unit:'cái',model:'tray',children:[body,bolt,pack],ops:[{id:finish,mode:finish==='paint'?'inside':'outside',amount:1,suppliesIncluded:true,measurementConfirmed:true}],transport:0,install:0,tmcKind:'tray',pricePerKg:42000,competitorPrice:width===300?395000:320000};
    leaf.paramLinks={L:'L',W:'W',H:'H'};C.formatName(n);return n;
  }
  db.quote.products=[product(300,'paint'),product(200,'galvanize')];
  Object.assign(db.quote,{id:'BG-DEMO-0912',project:'Máng cáp sơn & mạ / số liệu minh họa',date:'2026-09-12',kerf:0,remnantMode:'exclude',ratesSnapshot:copy(db.rates)});
  Object.assign(db.quote.pricing,{incoming:120000,delivery:200000,comparisonMethods:METHODS.map(m=>m[0])});db.quote.products[1].freightOut=6000;
  const base=legacyCalculate(db);db.quote.remnantSelections={};
  for(const g of base.groups)if(!g.error)db.quote.remnantSelections[g.signature]=g.remnants.filter(r=>r.l>=250&&r.w>=250).map(r=>r.id);
  // Historical demonstration fixture retains its published numerical answers.
  db.quote.pricing.costSequence='legacy';
  return db;
}
C.pricingTier=tier;
const api={METHODS,PARTS,defaults,FLOW_SEQUENCE,currentFlow,adoptFlow,supplement,enable,refreshPrices,tier,context,appliedRate,materialValuation,calculate,demoSeed,legacyCalculate};
// One shared calculation path for BOM, operations, comparison, print and exports.
C.calculate=calculate;
if(typeof module!=='undefined')module.exports=api;else root.TPPrice=api;
})(typeof window!=='undefined'?window:globalThis);
