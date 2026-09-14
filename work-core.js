/* Work and logistics calculations. No DOM, I/O or automatic catalog mutation. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
function number(v,name,{positive=false}={}){if(!finite(v)||Number(v)<0||(positive&&Number(v)===0))throw Error(name+' phải là số '+(positive?'lớn hơn 0':'không âm'));return Number(v);}
const EXPENSES=[['incoming','Vận chuyển nhập vật tư'],['outgoing','Vận chuyển thuê ngoài'],['delivery','Vận chuyển giao hàng'],['install','Lắp đặt']];
const METHODS=[['kg_net','Theo kg vận chuyển'],['kg_purchase','Theo kg vật tư mua'],['ton_net','Theo tấn vận chuyển'],['ton_purchase','Theo tấn vật tư mua'],['ton_km','Theo tấn × km'],['m2','Theo m² bề mặt'],['m','Theo mét dài'],['unit','Theo số lượng sản phẩm'],['trip','Theo chuyến'],['km','Theo km'],['fixed','Trọn gói']];
function context(n,r,products){
  const leaves=C.flatten([n]).filter(x=>x.kind==='material'&&x.spec.shape!=='piece');
  const unique=key=>{const values=[...new Set(leaves.map(x=>x.spec[key]).filter(x=>x!==undefined&&x!==''))];return values.length===1?values[0]:undefined;};
  const product=C.findNode(products,r.productId);
  return {substance:unique('substance'),grade:unique('grade'),complexity:n.complexity,finish:n.finishType,localQty:n.qty,productQty:product?.qty,unitWeight:r.count?(r.workWeight??r.weight)/r.count:0,unitArea:r.count?(r.workArea??r.area)/r.count:0};
}
function factor(f,input,tier){
  if(f.kind!=='category')return tier(input,f.tiers);
  if(input===null||input===undefined||String(input).trim()==='')throw Error('Thiếu giá trị để tra '+f.name);
  const rows=f.categories||[],seen=new Set();let found;
  for(const row of rows){const key=String(row.key||'').trim().toLocaleLowerCase('vi-VN');if(!key||seen.has(key))throw Error('Nhóm của '+f.name+' bị trống/trùng');seen.add(key);if(!finite(row.percent)||Number(row.percent)<=-100)throw Error('Hệ số nhóm '+row.key+' phải lớn hơn -100%');if(key===String(input).trim().toLocaleLowerCase('vi-VN'))found=row;}
  if(!found)throw Error(f.name+': chưa có nhóm “'+input+'”');
  return {value:Number(found.percent),label:String(found.key),kind:'category'};
}
function price(rate,op,ctx,tier){
  if(!['inside','outside'].includes(op.mode))throw Error('Nơi thực hiện không hợp lệ');
  const method=op.pricingMethod||'factors';
  if(!['factors','catalog','direct','fixed'].includes(method))throw Error('Phương pháp tính công đoạn chưa hợp lệ');
  const raw=['direct','fixed'].includes(method)?op.unitPrice:rate[op.mode];
  let value=number(raw,'Đơn giá '+rate.name);const base=value,factors=[];
  if(method==='factors'&&(op.mode==='inside'||rate.outsideFactors))for(const f of rate.factors||[]){if(f.enabled===false)continue;
    const input=op.inputs?.[f.param]??ctx[f.param],b=factor(f,input,tier);value*=1+b.value/100;factors.push({name:f.name,param:f.param,input,...b});
  }
  if(!Number.isFinite(value))throw Error('Đơn giá tính được vượt giới hạn');
  return {value,base,factors,method};
}
function operation(rate,op,ctx,r,tier){
  r={...r,weight:r.workWeight??r.weight,area:r.workArea??r.area};
  const applied=price(rate,op,ctx,tier),method=applied.method;
  const unit=method==='fixed'?'gói':method==='direct'?op.priceUnit:(rate[op.mode+'Unit']||rate.unit);
  if(!['kg','tấn','m²','m³','m','lần','bộ','cái','gói'].includes(unit)&&(!String(unit||'').trim()||!['manual_total','manual_unit'].includes(op.basisMode)))throw Error('Đơn vị riêng cần nhập lượng công việc rõ ràng, không quy đổi ngầm');
  let basis;
  if(method==='fixed')basis=op.fixedScope==='unit'?r.count:1;
  else if(op.basisMode==='manual_total')basis=number(op.workQuantity,'Lượng công việc');
  else if(op.basisMode==='manual_unit')basis=number(op.workQuantity,'Định mức mỗi đơn vị')*r.count;
  else{if(op.basisMode&&op.basisMode!=='auto')throw Error('Cơ sở khối lượng công việc chưa hợp lệ');basis=unit==='kg'?r.weight:unit==='tấn'?r.weight/1000:unit==='m²'?r.area:unit==='m³'?r.volume:r.count*number(op.amount,'Định mức nguyên công');if(!(basis>0))throw Error('Chưa có lượng '+unit+'; chọn nhập lượng công việc nếu không lấy theo phôi');}
  const cost=basis*applied.value;if(!Number.isFinite(cost))throw Error('Chi phí công đoạn vượt giới hạn');
  return {...applied,unit,basis,cost,rate:applied.value};
}
function recipes(rate){return rate.consumptions!==undefined?rate.consumptions:rate.consumption?[rate.consumption]:[];}
function consume(recipe,n,r,index,opIndex,rateName){
  r={...r,weight:r.workWeight??r.weight,area:r.workArea??r.area};
  const m=recipe.spec;if(!m)throw Error('Chưa chọn vật tư hoàn thiện');
  const norm=number(recipe.norm,'Định mức vật tư'),price=number(m.price,'Giá vật tư hoàn thiện');
  const layers=number(recipe.layers??1,'Số lớp',{positive:true}),loss=number(recipe.loss??0,'Hao hụt vật tư hoàn thiện');
  const base=recipe.basis==='kg'?r.weight:recipe.basis==='m²'?r.area:recipe.basis==='cái'?r.count:recipe.basis==='m³'?r.volume:NaN;
  if(!Number.isFinite(base)||base<=0)throw Error('Chưa có lượng '+recipe.basis+' cho vật tư hoàn thiện');
  const quantity=base*norm*layers*(1+loss/100),cost=quantity*price;
  return {ownerId:n.id,productId:r.productId,opIndex,recipeIndex:index,rateName,materialId:m.id,name:m.name,unit:m.unit,supplier:m.supplier||'',norm,basis:recipe.basis,layers,loss,quantity,price,cost};
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
      else if(e.scope==='materials'){rows=eligible.filter(r=>(e.materialIds||[]).includes(r.materialId));if((e.materialIds||[]).some(id=>!rows.some(r=>r.materialId===id)))throw Error('Mã vật tư đã không còn trong báo giá');targets=products.filter(p=>rows.some(r=>r.productId===p.node.id));}
      else if(e.scope==='supplier'){if(!String(e.supplier||'').trim())throw Error('Chọn nguồn mua');rows=eligible.filter(r=>r.supplier===e.supplier);targets=products.filter(p=>rows.some(r=>r.productId===p.node.id));}
      else if(e.scope!=='all'&&e.scope!==undefined)throw Error('Phạm vi chi phí chưa hợp lệ');
      if(!targets.length)throw Error('Phạm vi chi phí không có sản phẩm');
      const sum=key=>rows.reduce((s,r)=>s+r[key],0),net=sum('netKg'),purchase=sum('purchaseKg'),distance=['ton_km','km'].includes(e.method)?number(e.distance,'Quãng đường',{positive:true}):0;
      const measures={kg_net:[net,'kg'],kg_purchase:[purchase,'kg'],ton_net:[net/1000,'tấn'],ton_purchase:[purchase/1000,'tấn'],ton_km:[(e.massBasis==='purchase'?purchase:net)/1000*distance,'tấn·km'],m2:[sum('area'),'m²'],m:[sum('length'),'m'],unit:[targets.reduce((s,p)=>s+p.node.qty,0),'cái'],trip:[e.trips,'chuyến'],km:[distance,'km'],fixed:[1,'gói']};
      if(!Object.hasOwn(measures,e.method))throw Error('Chọn phương pháp tính chi phí');
      const [raw,unit]=measures[e.method],basis=number(e.manualQuantity??raw,'Lượng tính phí',{positive:true}),rate=number(e.rate,'Đơn giá'),minimum=number(e.minimum??0,'Phí tối thiểu'),cost=Math.max(basis*rate,minimum);
      if(!Number.isFinite(cost))throw Error('Chi phí vượt giới hạn');
      const weights=targets.map(p=>{const rr=rows.filter(r=>r.productId===p.node.id);if(e.allocation==='blankWeight')return p.weight;if(e.allocation==='quantity')return p.node.qty;if(e.allocation==='equal')return 1;if(e.allocation==='area')return rr.reduce((s,r)=>s+r.area,0);if(e.allocation==='cost')return p.material||0;return rr.reduce((s,r)=>s+r[e.method.includes('purchase')||e.massBasis==='purchase'?'purchaseKg':'netKg'],0);});
      const totalWeight=weights.reduce((s,n)=>s+n,0);if(!(totalWeight>0))throw Error('Không có cơ sở phân bổ; chọn số lượng hoặc chia đều');
      let assigned=0;const detail=targets.map((p,i)=>{const value=i===targets.length-1?cost-assigned:cost*weights[i]/totalWeight;assigned+=value;(allocations[p.node.id]??={incoming:0,outgoing:0,delivery:0,install:0})[e.category]+=value;return {productId:p.node.id,name:p.node.name,weight:weights[i],cost:value};});
      totals[e.category]+=cost;items.push({...e,basis,unit,rate,cost,detail,minimumApplied:cost>basis*rate});
    }catch(error){errors.push((e.name||'Khoản chi')+': '+error.message);items.push({...e,error:error.message});}
  }
  return {totals,allocations,items,errors,rows:all};
}
const api={EXPENSES,METHODS,number,context,factor,price,operation,recipes,consume,expenses};
if(typeof module!=='undefined')module.exports=api;else root.TPWork=api;
})(typeof window!=='undefined'?window:globalThis);
