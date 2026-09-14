/* Manufacturing scopes, safe work measurements and configurable TMC partitioning. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
// Existing explicit assignments are retained. Missing classification is NOT a
// non-TMC declaration and must never silently produce a detailed fallback.
function scope(node){return node.tmcScope||((node.tmcKind||node.tmcBreakdown?.length)?'tmc':'unknown');}
const policyKeys=['overhead','management','special','profit','processing','order','customer'];
function policyErrors(p){const x=p.tmcPolicy;if(!x||x.version!==1||!String(x.reason||'').trim())return ['TMC: chưa khai chuỗi giá riêng và căn cứ CĐ-01 cho báo giá'];const errors=[];for(const k of policyKeys)if(!finite(x[k])||Number(x[k])<=-100||Number(x[k])>10000)errors.push('TMC: hệ số '+k+' chưa hợp lệ');return errors;}
function setPolicy(q,data,at=new Date().toISOString()){
  if(['submitted','approved'].includes(q.status))throw Error('Bản đã khóa; tạo bản sửa trước');
  const x={version:1,reason:String(data.reason||'').trim(),at};for(const k of policyKeys)x[k]=data[k];
  const errors=policyErrors({tmcPolicy:x});if(errors.length)throw Error(errors.join('; '));
  for(const k of policyKeys)x[k]=Number(x[k]);q.pricing.tmcPolicy=x;return x;
}
const finite=v=>v!==null&&v!==''&&v!==undefined&&Number.isFinite(Number(v));
function nonnegative(v,label){if(!finite(v)||Number(v)<0)throw Error(label+' phải là số không âm');return Number(v);}
function measure(n,r,nodes){
  const childWeight=(n.children||[]).reduce((s,c)=>s+(nodes[c.id].workWeight??nodes[c.id].weight),0),childArea=(n.children||[]).reduce((s,c)=>s+(nodes[c.id].workArea??nodes[c.id].area),0);
  const defaultWeight=n.kind==='material'?r.weight:childWeight,defaultArea=n.kind==='material'?r.area:childArea;
  const rules=n.measurementRules||n.ruleSpec?.measurementRules||{},vars={...n.params,...n.dims,...n.spec?.props,BW:r.weight/r.count,SA:r.area/r.count,CW:defaultWeight/r.count,CA:defaultArea/r.count,...(n.spec?.density!==undefined?{RHO:n.spec.density}:{})};
  for(const [key,value]of Object.entries(rules.vars||{})){if(!/^[A-Za-z_][A-Za-z_0-9]{0,24}$/.test(key)||Object.hasOwn(vars,key)||['__proto__','constructor','prototype'].includes(key))throw Error('Tên biến riêng không hợp lệ hoặc trùng: '+key);if(!finite(value))throw Error('Biến '+key+' chưa có số');vars[key]=Number(value);}
  const weight=rules.weight?C.formula(rules.weight,vars):defaultWeight/r.count,area=rules.area?C.formula(rules.area,vars):defaultArea/r.count;
  if(!Number.isFinite(weight)||weight<0||!Number.isFinite(area)||area<0)throw Error('Công thức lượng thực hiện phải cho kết quả không âm');
  return {workWeight:weight*r.count,workArea:area*r.count,measurement:{vars,weight:rules.weight||'CW',area:rules.area||'CA',unitWeight:weight,unitArea:area,custom:!!(rules.weight||rules.area)}};
}
function packageCost(n,r){const x=n.outsource;
  if(!['vendor','company'].includes(x.materialSupply))throw Error('Chọn bên cấp vật tư cho gói thuê');
  if(!String(x.supplier||'').trim()||!String(x.output||'').trim())throw Error('Gói thuê cần đơn vị nhận gia công và đầu ra bàn giao');
  const rate=nonnegative(x.price,'Đơn giá gói thuê'),bases={'kg':r.workWeight??r.weight,'kg_phoi':r.weight,'m²':r.workArea??r.area,'cái':r.count,'gói':1};
  if(!Object.hasOwn(bases,x.unit))throw Error('Đơn vị gói thuê chưa hợp lệ');const basis=nonnegative(x.quantity??bases[x.unit],'Lượng gói thuê');if(!(basis>0))throw Error('Chưa có lượng gói thuê');
  const cost=basis*rate;if(!Number.isFinite(cost))throw Error('Giá gói thuê vượt giới hạn');return {...x,ownerId:n.id,productId:r.productId,basis,rate,cost};
}
function extraCost(entry,basis,stock,labor){const amount=nonnegative(entry?.value??0,'Chi phí bổ sung TMC');if(!entry||entry.kind==='fixed')return amount*basis;if(entry.kind!=='percent')throw Error('Chọn cách tính khoản TMC');const bases={material:stock,labor,direct:stock+labor};if(!Object.hasOwn(bases,entry.basis))throw Error('Chọn cơ sở phần trăm TMC');return bases[entry.basis]*amount/100;}
function tmc(r,base,p,tier,stockNet){
  const node=r.node,parts={...r.parts};if(r.packageOwner)return {parts,items:[],packageOnly:true};
  const assignments=node.tmcBreakdown?.length?node.tmcBreakdown:[{id:'whole',nodeId:node.id,tableId:node.tmcKind,width:node.tmcWidth,length:node.tmcLength,factor:1}];
  const eligible=base.rows.filter(row=>row.productId===node.id&&!row.externallySupplied&&row.spec.shape!=='piece');
  const stockCovered=new Set(),opsCovered=new Set(),items=[];let stock=0,replace=0,laborTotal=0,ancillary=0,common=0;
  for(const entry of assignments){
    const target=C.findNode([node],entry.nodeId),table=p.tmcTables.find(t=>t.id===entry.tableId);if(!target)throw Error('Dòng cấu thành TMC đã bị xóa');if(!table)throw Error('chưa chọn chủng loại TMC');
    const rr=base.nodes[target.id];if(rr.coveredBy&&!entry.laborOnly)throw Error('Phần đã thuê trọn không áp thêm công TMC; bỏ khỏi phân rã TMC');
    const ids=new Set(C.flatten([target]).map(n=>n.id)),rows=eligible.filter(row=>ids.has(row.id)&&!base.nodes[row.id].coveredBy),width=entry.width??target.params?.W??target.dims?.W??target.spec?.props?.W??node.params?.W,length=entry.length??target.params?.L??target.dims?.L??node.params?.L;
    if(!finite(width)||Number(width)<=0)throw Error('cần khổ rộng TMC');let bound=tier(width,table.tiers,'price');if(table.thresholdMode==='exact'){const i=table.tiers.findIndex((s,i)=>s.max===null?Number(width)>(table.tiers[i-1]?.max??0):Number(width)===Number(s.max));if(i<0)throw Error('Không có đơn giá TMC cho đúng khổ '+width);bound={value:Number(table.tiers[i].price),min:table.tiers[i-1]?.max??0,max:table.tiers[i].max,index:i};}else if(table.thresholdMode&&table.thresholdMode!=='upper')throw Error('Cách hiểu mốc TMC chưa hợp lệ');const factor=nonnegative(entry.factor??1,'Hệ số số lượng TMC');if(!(factor>0))throw Error('Hệ số số lượng TMC phải lớn hơn 0');
    const loss=nonnegative(table.loss??p.tmcLoss,'Hao hụt TMC');let basis;
    if(table.unit==='m'){if(!finite(length)||length<=0)throw Error('cần chiều dài TMC');basis=Number(length)/1000*rr.count*factor;}
    else if(table.unit==='cái')basis=rr.count*factor;else if(table.unit==='kg')basis=rr.weight*factor;else if(table.unit==='m²')basis=(rr.workArea??rr.area)*factor;else throw Error('đơn vị nhân công TMC không hợp lệ');
    let material=0;if(!entry.laborOnly){for(const row of rows){if(stockCovered.has(row.id))throw Error('Phạm vi TMC chồng nhau; một mã vật tư chỉ nhận hao hụt một lần');stockCovered.add(row.id);material+=stockNet(row)*(1+loss/100);}
      for(const id of ids){const work=base.nodes[id];if(work.coveredBy)continue;const own=work.ownReplaceableFactory||0;if(own&&opsCovered.has(id))throw Error('Công TMC bị tính lặp theo cấp');opsCovered.add(id);replace+=own;}
    }
    const labor=basis*bound.value,aux=extraCost(table.ancillary,basis,material,labor),overhead=table.common?.kind==='percent'&&table.common.basis==='scope'?0:extraCost(table.common,basis,material,labor);if(table.common?.kind==='percent'&&table.common.basis==='scope'&&entry.laborOnly)throw Error('Chi phí chung toàn sản phẩm không gắn vào phần chỉ bổ sung nhân công');stock+=material;laborTotal+=labor;ancillary+=aux;common+=overhead;
    items.push({nodeId:target.id,name:target.name,tableId:table.id,table:table.name,basis,unit:table.unit,rate:bound.value,bound,loss,material,labor,ancillary:aux,common:overhead,laborOnly:!!entry.laborOnly});
  }
  for(const row of eligible)if(!stockCovered.has(row.id)&&!base.nodes[row.id].coveredBy)throw Error('Chưa gán bảng TMC cho '+row.node.name);
  // Retain company-supplied materials within outsourced scopes at their detailed purchasing cost.
  stock+=eligible.filter(row=>!stockCovered.has(row.id)&&base.nodes[row.id].coveredBy).reduce((s,row)=>s+row.cost,0);
  for(const n of C.flatten([node])){const rr=base.nodes[n.id];if(!rr.coveredBy&&rr.ownReplaceableFactory>0&&!opsCovered.has(n.id))throw Error('Chưa phân nhóm TMC cho công đoạn tại '+n.name);}
  parts.allowance=eligible.reduce((s,row)=>{const item=items.find(x=>!x.laborOnly&&C.flatten([C.findNode([node],x.nodeId)]).some(n=>n.id===row.id));return s+(item?stockNet(row)*(1+item.loss/100):row.cost)*(row.node.auxiliaryPercent||0)/100;},0);
  parts.stock=stock;parts.factory=parts.factory-replace+laborTotal;parts.ancillary+=ancillary;parts.tmcCommon=common;
  let commonSummary;const wholeTables=items.map(i=>p.tmcTables.find(t=>t.id===i.tableId)).filter(t=>t.common?.kind==='percent'&&t.common.basis==='scope');if(wholeTables.length){
    const rates=wholeTables.map(t=>nonnegative(t.common.value,'Tỷ lệ chi phí chung'));if(rates.some(v=>v!==rates[0])||common!==0)throw Error('Chi phí chung toàn sản phẩm cần cùng một tỷ lệ, không cộng thêm khoản chung của bảng khác');
    // XD Gia!CB4: BP+BQ+BR+BU+BV+BW+BY, BEFORE common cost.
    // Delivery is outside this base. Do not include another common charge or factors.
    const commonBase=['stock','ancillary','allowance','factory','outside','finishing','incoming','outgoing','install'].reduce((sum,k)=>sum+(parts[k]||0),0),percent=rates[0];
    common=commonBase*percent/100;parts.tmcCommon=common;commonSummary={productId:node.id,basis:commonBase,percent,amount:common,source:'XL CB: toàn sản phẩm trước CP chung, không giao hàng'};if(items.length===1)Object.assign(items[0],{common,commonBase,commonPercent:percent,commonBasis:'scope'});
  }
  return {parts,items,commonSummary,basis:items[0]?.basis,rate:items[0]?.rate,bound:items[0]?.bound};
}
function presets(){return [
  {id:'ladder-accessory',name:'Phụ kiện thang cáp',unit:'cái',tiers:[{max:100,price:28000},{max:500,price:28000},{max:1000,price:28000},{max:null,price:70000}]},
  {id:'accessory-cover',name:'Nắp phụ kiện thang / máng',unit:'cái',tiers:[{max:100,price:3000},{max:500,price:3000},{max:1000,price:3000},{max:null,price:20000}]},
  {id:'join',name:'Nối thang máng',unit:'cái',tiers:[{max:400,price:1000},{max:700,price:1000},{max:1000,price:1000},{max:1500,price:1000},{max:2000,price:1000},{max:null,price:1000}]},
  {id:'z-clamp',name:'Kẹp Z',unit:'cái',tiers:[{max:400,price:1000},{max:700,price:1000},{max:1000,price:1000},{max:1500,price:1000},{max:2000,price:1000},{max:null,price:1000}]},
  {id:'u-v-bar',name:'Thanh U / V',unit:'cái',tiers:[{max:400,price:7000},{max:700,price:10000},{max:1000,price:15000},{max:1500,price:20000},{max:2000,price:25000},{max:null,price:30000}]}
].map(t=>({...t,loss:1.5,thresholdMode:'upper'}));}
const api={measure,packageCost,tmc,presets,scope,policyKeys,policyErrors,setPolicy};C.manufacturing=api;
if(typeof module!=='undefined')module.exports=api;else root.TPMfg=api;
})(typeof window!=='undefined'?window:globalThis);
