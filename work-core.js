/* Work and logistics calculations. No DOM, I/O or automatic catalog mutation. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
function number(v,name,{positive=false}={}){if(!finite(v)||Number(v)<0||(positive&&Number(v)===0))throw Error(name+' phải là số '+(positive?'lớn hơn 0':'không âm'));return Number(v);}
const EXPENSES=[['incoming','Vận chuyển nhập vật tư'],['outgoing','Vận chuyển thuê ngoài'],['delivery','Vận chuyển giao hàng'],['install','Lắp đặt']];
const METHODS=[['kg_net','Theo kg vận chuyển'],['kg_purchase','Theo kg vật tư mua'],['ton_net','Theo tấn vận chuyển'],['ton_purchase','Theo tấn vật tư mua'],['ton_km','Theo tấn × km'],['m2','Theo m² bề mặt'],['m','Theo mét dài'],['unit','Theo số lượng đối tượng đã chọn'],['trip','Theo chuyến'],['km','Theo km'],['fixed','Trọn gói']];
function context(n,r,products){
  const leaves=C.flatten([n]).filter(x=>x.kind==='material'&&x.spec.shape!=='piece');
  const unique=key=>{const values=[...new Set(leaves.map(x=>x.spec[key]).filter(x=>x!==undefined&&x!==''))];return values.length===1?values[0]:undefined;};
  const product=C.findNode(products,r.productId),path=C.nodePath(products,n.id)||[],parent=path.at(-2),component=path.slice(0,-1).reverse().find(x=>x.kind==='component'),componentPath=component?path.slice(0,path.indexOf(component)+1):[];
  return {substance:unique('substance'),grade:unique('grade'),complexity:n.complexity,finish:n.finishType,localQty:n.qty,productQty:product?.qty,parentQty:parent?.qty,parentCount:parent?r.count/n.qty:undefined,componentCount:component?componentPath.reduce((s,x)=>s*x.qty,1):undefined,unitWeight:r.count?(r.workWeight??r.weight)/r.count:0,unitArea:r.count?(r.workArea??r.area)/r.count:0};
}
function factor(f,input,tier){
  const convert=v=>{if(!finite(v))throw Error('Thiếu giá trị hệ số');const r=f.valueMode==='multiplier'?(Number(v)-1)*100:Number(v);if(r<=-100)throw Error('Hệ số nhân phải dương / tỷ lệ lớn hơn -100%');return r;};
  if(f.valueMode&&!['percent','multiplier'].includes(f.valueMode))throw Error('Cách nhập hệ số không hợp lệ');
  if(f.kind!=='category'){
    const rows=(f.tiers||[]).map(t=>({...t,percent:convert(t.percent)})),mode=f.boundary||'upper';
    if(!['upper','lower','exact'].includes(mode)||!['error','last'].includes(f.overflow||'error'))throw Error('Quy tắc tra bậc không hợp lệ');
    if(mode==='upper'){try{return tier(input,rows);}catch(e){if(f.overflow==='last'&&e.message.includes('vượt các bậc'))return {...tier(rows.at(-1).max,rows),overflow:true};throw e;}}
    number(input,'Giá trị tra');if(!rows.length)throw Error('Chưa khai báo các bậc');let prev=-1;
    for(const row of rows){if(!finite(row.max)||Number(row.max)<0||Number(row.max)<=prev)throw Error('Mốc phải tăng dần; cách tra này không dùng mốc trống');prev=Number(row.max);}
    const i=mode==='exact'?rows.findIndex(r=>Number(r.max)===Number(input)):rows.findLastIndex(r=>Number(r.max)<=Number(input));
    if(i<0)throw Error('Không có bậc phù hợp với '+input);
    return {value:rows[i].percent,min:Number(rows[i].max),max:rows[i+1]?.max??null,index:i,boundary:mode};
  }
  if(input===null||input===undefined||String(input).trim()==='')throw Error('Thiếu giá trị để tra '+f.name);
  const rows=f.categories||[],seen=new Set();let found;
  for(const row of rows){const key=String(row.key||'').trim().toLocaleLowerCase('vi-VN');if(!key||seen.has(key))throw Error('Nhóm của '+f.name+' bị trống/trùng');seen.add(key);if(!finite(row.percent)||convert(row.percent)<=-100)throw Error('Hệ số nhóm '+row.key+' phải lớn hơn -100%');if(key===String(input).trim().toLocaleLowerCase('vi-VN'))found=row;}
  if(!found)throw Error(f.name+': chưa có nhóm “'+input+'”');
  return {value:convert(found.percent),label:String(found.key),kind:'category'};
}
function price(rate,op,ctx,tier){
  const selected=resolvePriceOption(rate,op);rate=selected.rate;op=selected.op;
  if(!['inside','outside'].includes(op.mode))throw Error('Nơi thực hiện không hợp lệ');
  const method=op.pricingMethod||'factors';
  if(!['factors','catalog','direct','fixed'].includes(method))throw Error('Phương pháp tính công đoạn chưa hợp lệ');
  const raw=['direct','fixed'].includes(method)?op.unitPrice:rate[op.mode];
  let value=number(raw,'Đơn giá '+rate.name);const base=value,factors=[];
  if(method==='factors'&&(op.mode==='inside'||rate.outsideFactors))for(const f of rate.factors||[]){if(f.enabled===false||op.complexity&&f.param==='complexity')continue;
    const input=op.inputs?.[f.param]??ctx[f.param],b=factor(f,input,tier);value*=1+b.value/100;factors.push({name:f.name,param:f.param,input,...b});
  }
  if(op.complexity){validateComplexity(op.complexity);const multiplier=Number(op.complexity.multiplier);value*=multiplier;factors.push({name:'Mức độ phức tạp',param:'complexity',input:op.complexity.label,value:(multiplier-1)*100,multiplier,source:'declared',kind:'category'});}
  if(!Number.isFinite(value))throw Error('Đơn giá tính được vượt giới hạn');
  return {value,base,factors,method,priceOptionId:op.priceOptionId||'',priceOptionName:selected.option?.name||''};
}
function operation(rate,op,ctx,r,tier){
  const selected=resolvePriceOption(rate,op);rate=selected.rate;op=selected.op;
  r={...r,weight:r.workWeight??r.weight,area:r.workArea??r.area};
  const method=op.pricingMethod||'factors';
  const unit=method==='fixed'?'gói':method==='direct'?op.priceUnit:(rate[op.mode+'Unit']||rate.unit);
  if(!['kg','tấn','m²','m³','m','lần','bộ','cái','gói'].includes(unit)&&(!String(unit||'').trim()||!['manual_total','manual_unit'].includes(op.basisMode)))throw Error('Đơn vị riêng cần nhập lượng công việc rõ ràng, không quy đổi ngầm');
  let basis;
  if(method==='fixed')basis=op.fixedScope==='unit'?r.count:1;
  else if(op.basisMode==='manual_total')basis=number(op.workQuantity,'Lượng công việc');
  else if(op.basisMode==='manual_unit')basis=number(op.workQuantity,'Định mức mỗi đơn vị')*r.count;
  else{if(op.basisMode&&op.basisMode!=='auto')throw Error('Cơ sở khối lượng công việc chưa hợp lệ');basis=unit==='kg'?r.weight:unit==='tấn'?r.weight/1000:unit==='m²'?r.area:unit==='m³'?r.volume:r.count*number(op.amount,'Định mức nguyên công');if(!(basis>0))throw Error('Chưa có lượng '+unit+'; chọn nhập lượng công việc nếu không lấy theo phôi');}
  const actual={...ctx,workQuantity:basis};if(['manual_total','manual_unit'].includes(op.basisMode)){if(unit==='m²'){actual.area=basis;actual.unitArea=basis/r.count;}if(unit==='kg'||unit==='tấn'){actual.weight=basis*(unit==='tấn'?1000:1);actual.unitWeight=actual.weight/r.count;}}const applied=price(rate,op,actual,tier);
  const cost=basis*applied.value;if(!Number.isFinite(cost))throw Error('Chi phí công đoạn vượt giới hạn');
  return {...applied,unit,basis,cost,rate:applied.value};
}
function optionFor(op,quote){return quote.operationPriceOptions?.[op.id]??op.priceOptionId??'';}
function methodFor(op,quote){const id=optionFor(op,quote),rate=quote.ratesSnapshot?.find(r=>r.id===op.id),option=rate?.priceOptions?.find(x=>x.id===id);return option?.method||quote.operationMethods?.[op.id]||op.pricingMethod||'factors';}
function setMethod(quote,id,method){if(!['factors','catalog','direct','fixed'].includes(method))throw Error('Cách tính chưa hợp lệ');quote.operationMethods??={};quote.operationMethods[id]=method;if(quote.operationPriceOptions)delete quote.operationPriceOptions[id];for(const n of C.flatten(quote.products))for(const op of n.ops||[])if(op.id===id){op.pricingMethod=method;delete op.priceOptionId;}}
function validateComplexity(x){if(!x||typeof x.label!=='string'||!x.label.trim()||x.label.length>120)throw Error('Mức độ phức tạp cần tên đánh giá');number(x.multiplier,'Hệ số phức tạp',{positive:true});}
function validatePriceOptions(rate){
  if(rate.priceOptions===undefined)return;
  if(!Array.isArray(rate.priceOptions)||rate.priceOptions.length>40)throw Error('Khai tối đa 40 cách tính đơn giá');const seen=new Set();
  for(const x of rate.priceOptions){if(!x||typeof x.id!=='string'||!/^opt-[A-Za-z0-9_-]{1,80}$/.test(x.id)||seen.has(x.id))throw Error('Mã cách tính bị trống, trùng hoặc không hợp lệ');seen.add(x.id);if(typeof x.name!=='string'||!x.name.trim()||x.name.length>160||!['catalog','factors','fixed'].includes(x.method))throw Error('Cách tính cần tên và phương pháp hợp lệ');for(const mode of ['inside','outside']){number(x[mode],'Đơn giá '+x.name+' / '+mode);if(typeof x[mode+'Unit']!=='string'||!x[mode+'Unit'].trim()||x[mode+'Unit'].length>40)throw Error('Cách tính '+x.name+' cần đơn vị');}if(x.method==='fixed'&&!['total','unit'].includes(x.fixedScope))throw Error('Chọn phạm vi giá gói');if(x.enabled!==undefined&&typeof x.enabled!=='boolean'||x.outsideFactors!==undefined&&typeof x.outsideFactors!=='boolean')throw Error('Trạng thái cách tính không hợp lệ');}
}
function resolvePriceOption(rate,op){
  if(!op.priceOptionId)return {rate,op,option:null};validatePriceOptions(rate);const option=rate.priceOptions?.find(x=>x.id===op.priceOptionId);
  if(!option||option.enabled===false)throw Error('Cách tính đơn giá đã chọn không còn khả dụng; chọn lại trong báo giá');
  return {rate:{...rate,inside:option.inside,outside:option.outside,insideUnit:option.insideUnit,outsideUnit:option.outsideUnit,outsideFactors:option.outsideFactors??rate.outsideFactors},op:{...op,pricingMethod:option.method,...(option.method==='fixed'?{unitPrice:option[op.mode],fixedScope:option.fixedScope}:{})},option};
}
function setPriceOption(quote,id,optionId){const rate=quote.ratesSnapshot?.find(r=>r.id===id),option=rate?.priceOptions?.find(x=>x.id===optionId);if(!option||option.enabled===false)throw Error('Chọn cách tính đã khai báo cho nguyên công');validatePriceOptions(rate);setMethod(quote,id,option.method);quote.operationPriceOptions??={};quote.operationPriceOptions[id]=optionId;for(const n of C.flatten(quote.products))for(const op of n.ops||[])if(op.id===id)op.priceOptionId=optionId;}
function methodErrors(quote){const seen=new Map(),errors=[];for(const n of C.flatten(quote.products))for(const op of n.ops||[]){const method=methodFor(op,quote)+'|'+optionFor(op,quote);if(seen.has(op.id)&&seen.get(op.id)!==method)errors.push('Nguyên công '+op.id+': đang có nhiều cách tính. Chọn một cách tính chung cho nguyên công này trong báo giá.');seen.set(op.id,method);}return [...new Set(errors)];}
function recipes(rate){return rate.consumptions!==undefined?rate.consumptions:rate.consumption?[rate.consumption]:[];}
function consume(recipe,n,r,index,opIndex,rateName,workUnit){
  r={...r,weight:r.workWeight??r.weight,area:r.workArea??r.area};
  const m=recipe.spec;if(!m)throw Error('Chưa chọn vật tư hoàn thiện');
  const norm=number(recipe.norm,'Định mức vật tư'),price=number(m.price,'Giá vật tư hoàn thiện');
  const layers=number(recipe.layers??1,'Số lớp',{positive:true}),loss=number(recipe.loss??0,'Hao hụt vật tư hoàn thiện');
  const op=n.ops?.[opIndex]||{},manual=['manual_total','manual_unit'].includes(op.basisMode)&&workUnit===recipe.basis;
  const rules=n.measurementRules||n.ruleSpec?.measurementRules||{},explicit=recipe.basis==='m²'?rules.area:recipe.basis==='kg'?rules.weight:true;
  if(n.kind!=='material'&&!manual&&!explicit&&!op.measurementConfirmed)throw Error('Chưa xác nhận lượng hoàn thiện tại '+n.name+'. Khai công thức KL/DT, nhập lượng công việc đúng đơn vị hoặc xác nhận dùng lượng từ cấu thành.');
  const base=manual?number(op.workQuantity,'Lượng hoàn thiện')*(op.basisMode==='manual_unit'?r.count:1):recipe.basis==='kg'?r.weight:recipe.basis==='m²'?r.area:recipe.basis==='cái'?r.count:recipe.basis==='m³'?r.volume:NaN;
  if(!Number.isFinite(base)||base<=0)throw Error('Chưa có lượng '+recipe.basis+' cho vật tư hoàn thiện');
  const quantity=base*norm*layers*(1+loss/100),cost=quantity*price;
  return {id:n.id+':'+(n.ops?.[opIndex]?.instanceId||(n.ops?.[opIndex]?.id||'operation')+':'+opIndex)+':'+(recipe.id||index),ownerId:n.id,productId:r.productId,opIndex,recipeIndex:index,rateName,materialId:m.id,name:m.name,brand:m.brand||'',unit:m.unit,supplier:m.supplier||'',norm,basis:recipe.basis,layers,loss,quantity,price,cost};
}
function expenseRows(base,generated){
  const rows=base.rows.map(row=>({id:row.id,productId:row.productId,materialId:row.spec.id,supplier:row.node.supplier||row.spec.supplier||'',externallySupplied:!!row.externallySupplied,netKg:row.spec.shape==='piece'?(row.spec.unit==='kg'?row.count:0):row.geometry.weight,purchaseKg:row.externallySupplied?0:row.spec.shape==='piece'?(row.spec.unit==='kg'?row.count:0):row.purchasedWeight||0,area:row.geometry.area||0,length:row.geometry.length?row.geometry.length*row.count/1000:(row.spec.unit==='m'?row.count:0),count:row.count}));
  for(const g of generated)rows.push({id:g.ownerId+':'+g.opIndex+':'+g.recipeIndex,productId:g.productId,materialId:g.materialId,supplier:g.supplier,netKg:g.unit==='kg'?g.quantity:0,purchaseKg:g.unit==='kg'?g.quantity:0,area:g.unit==='m²'?g.quantity:0,length:g.unit==='m'?g.quantity:0,count:g.quantity});
  return rows;
}
function expenses(entries,base,generated){
  const all=expenseRows(base,generated),products=base.products,totals={incoming:0,outgoing:0,delivery:0,install:0},allocations={},items=[],errors=[];
  const seen=new Set();
  for(const e of entries||[]){if(e.enabled===false)continue;
    try{
      if(!e.id||seen.has(e.id))throw Error('Mã khoản chi bị trống hoặc trùng');seen.add(e.id);
      if(!Object.hasOwn(totals,e.category))throw Error('Chọn đầu mục chi phí');
      const eligible=e.category==='incoming'?all.filter(r=>!r.externallySupplied):all;let rows=eligible,targets=products;
      if(e.scope==='products'){targets=products.filter(p=>(e.productIds||[]).includes(p.node.id));rows=eligible.filter(r=>targets.some(p=>p.node.id===r.productId));if(targets.length!==(e.productIds||[]).length)throw Error('Có sản phẩm đã bị xóa; chọn lại phạm vi');}
      else if(e.scope==='nodes'){const ids=e.nodeIds||[];if(!ids.length||new Set(ids).size!==ids.length)throw Error('Chọn đối tượng, không chọn trùng');for(const id of ids){if(!base.nodes[id])throw Error('Đối tượng không còn trong cây');if(C.nodePath(base.products.map(p=>p.node),id).slice(0,-1).some(n=>ids.includes(n.id)))throw Error('Không chọn đồng thời cấp cha và con trong cùng khoản chi');}rows=ids.map(id=>{const r=base.nodes[id],leaves=eligible.filter(x=>C.findNode([r.node],x.id));return {id,productId:r.productId,count:r.count,netKg:e.category==='incoming'?leaves.reduce((s,x)=>s+x.netKg,0):(r.workWeight??r.weight),purchaseKg:leaves.reduce((s,x)=>s+x.purchaseKg,0),area:r.workArea??r.area,length:r.node.kind==='material'?(leaves[0]?.length||0):(Number(r.node.params?.L)||0)*r.count/1000};});targets=products.filter(p=>rows.some(r=>r.productId===p.node.id));}
      else if(e.scope==='materials'){rows=eligible.filter(r=>(e.materialIds||[]).includes(r.materialId));if((e.materialIds||[]).some(id=>!rows.some(r=>r.materialId===id)))throw Error('Mã vật tư đã không còn trong báo giá');targets=products.filter(p=>rows.some(r=>r.productId===p.node.id));}
      else if(e.scope==='supplier'){if(!String(e.supplier||'').trim())throw Error('Chọn nguồn mua');rows=eligible.filter(r=>r.supplier===e.supplier);targets=products.filter(p=>rows.some(r=>r.productId===p.node.id));}
      else if(e.scope!=='all'&&e.scope!==undefined)throw Error('Phạm vi chi phí chưa hợp lệ');
      if(!targets.length)throw Error('Phạm vi chi phí không có sản phẩm');
      const sum=key=>rows.reduce((s,r)=>s+r[key],0),net=sum('netKg'),purchase=sum('purchaseKg'),distance=['ton_km','km'].includes(e.method)?number(e.distance,'Quãng đường',{positive:true}):0;
      const measures={kg_net:[net,'kg'],kg_purchase:[purchase,'kg'],ton_net:[net/1000,'tấn'],ton_purchase:[purchase/1000,'tấn'],ton_km:[(e.massBasis==='purchase'?purchase:net)/1000*distance,'tấn·km'],m2:[sum('area'),'m²'],m:[sum('length'),'m'],unit:[e.scope==='nodes'?sum('count'):targets.reduce((s,p)=>s+p.node.qty,0),'cái'],trip:[e.trips,'chuyến'],km:[distance,'km'],fixed:[1,'gói']};
      if(!Object.hasOwn(measures,e.method))throw Error('Chọn phương pháp tính chi phí');
      if(e.method==='fixed'&&e.manualQuantity!=null&&Number(e.manualQuantity)!==1)throw Error('Giá trọn gói không nhân lượng; bỏ lượng thay thế');
      const repeats=number(e.repeats??1,'Số lượt',{positive:true});if(!Number.isInteger(repeats))throw Error('Số lượt cần số nguyên');if(e.method==='fixed'&&repeats!==1)throw Error('Giá trọn gói chỉ tính một lần');
      const [raw,unit]=measures[e.method],basis=number(e.method==='fixed'?1:(e.manualQuantity??raw),'Lượng tính phí',{positive:true}),baseRate=number(e.rate,'Đơn giá'),minimum=number(e.minimum??0,'Phí tối thiểu');
      const ctx={weight:unit==='kg'?basis:unit==='tấn'?basis*1000:net,area:unit==='m²'?basis:sum('area'),length:unit==='m'?basis:sum('length'),count:e.scope==='nodes'?sum('count'):targets.reduce((s,p)=>s+p.node.qty,0),quantity:basis,distance:Number(e.distance)||0,trips:Number(e.trips)||1,complexity:e.complexity||'',from:e.from||'',to:e.to||''};
      let rate=baseRate;const factors=[];for(const f of e.factors||[]){if(f.enabled===false)continue;const step=factor(f,ctx[f.param],C.pricingTier);rate*=1+step.value/100;factors.push({...step,name:f.name,param:f.param,input:ctx[f.param]});}
      const rawCost=Math.max(basis*rate,minimum)*repeats,cost=e.rounding==='vnd'?Math.round(rawCost):rawCost;
      if(!Number.isFinite(cost))throw Error('Chi phí vượt giới hạn');
      const weights=targets.map(p=>{const rr=rows.filter(r=>r.productId===p.node.id);if(e.allocation==='blankWeight')return p.weight;if(e.allocation==='quantity')return e.scope==='nodes'?rr.reduce((s,r)=>s+r.count,0):p.node.qty;if(e.allocation==='equal')return 1;if(e.allocation==='area')return rr.reduce((s,r)=>s+r.area,0);if(e.allocation==='cost')return p.material||0;return rr.reduce((s,r)=>s+r[e.method.includes('purchase')||e.massBasis==='purchase'?'purchaseKg':'netKg'],0);});
      const totalWeight=weights.reduce((s,n)=>s+n,0);if(!(totalWeight>0))throw Error('Không có cơ sở phân bổ; chọn số lượng hoặc chia đều');
      const rawShares=weights.map(w=>cost*w/totalWeight),shares=e.rounding==='vnd'?rawShares.map(Math.floor):[...rawShares],order=targets.map((p,i)=>i).sort((a,b)=>(rawShares[b]-shares[b])-(rawShares[a]-shares[a])||String(targets[a].node.id).localeCompare(String(targets[b].node.id)));if(e.rounding==='vnd'){const remaining=cost-shares.reduce((s,x)=>s+x,0);for(let i=0;i<remaining;i++)shares[order[i%order.length]]++;}else shares[shares.length-1]=cost-shares.slice(0,-1).reduce((s,x)=>s+x,0);const detail=targets.map((p,i)=>{const value=shares[i];(allocations[p.node.id]??={incoming:0,outgoing:0,delivery:0,install:0})[e.category]+=value;return {productId:p.node.id,name:p.node.name,weight:weights[i],cost:value};});
      totals[e.category]+=cost;items.push({...e,basis,unit,baseRate,rate,repeats,factorsApplied:factors,cost,detail,minimumApplied:minimum>basis*rate});
    }catch(error){errors.push((e.name||'Khoản chi')+': '+error.message);items.push({...e,error:error.message});}
  }
  return {totals,allocations,items,errors,rows:all};
}
function validateFactor(f,tier){
 if(!f||typeof f.id!=='string'||!f.id||f.id.length>100||typeof f.name!=='string'||!f.name.trim()||f.name.length>160||typeof f.param!=='string'||!f.param||f.param.length>60)throw Error('Hệ số cần mã, tên và đại lượng tra');
 if(f.kind&&!['number','category'].includes(f.kind))throw Error('Kiểu bảng hệ số không hợp lệ');
 const rows=f.kind==='category'?f.categories:f.tiers;if(!Array.isArray(rows)||!rows.length||rows.length>200)throw Error('Khai từ 1 đến 200 bậc hệ số');
 for(const [i,row]of rows.entries())factor(f,f.kind==='category'?row.key:row.max??(Number(rows[i-1]?.max)||0)+1,tier);
 return f;
}
function saveFactor(db,rateId,f,tier){validateFactor(f,tier);const rate=db.rates.find(r=>r.id===rateId);if(!rate)throw Error('Chọn nguyên công áp dụng');const rows=rate.factors||[],copy=C.copy(f);if(rows.some(x=>x.id!==f.id&&x.name.trim()===f.name.trim()))throw Error('Tên hệ số đã có trong nguyên công');rate.factors=rows.some(x=>x.id===f.id)?rows.map(x=>x.id===f.id?copy:x):[...rows,copy];return copy;}
const api={validateFactor,saveFactor,EXPENSES,METHODS,optionFor,methodFor,setMethod,setPriceOption,resolvePriceOption,validatePriceOptions,validateComplexity,methodErrors,number,context,factor,price,operation,recipes,consume,expenses};
if(typeof module!=='undefined')module.exports=api;else root.TPWork=api;
})(typeof window!=='undefined'?window:globalThis);
