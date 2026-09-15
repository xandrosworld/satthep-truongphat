/* Read-only checks. Samples demonstrate the declared calculation, not workshop standards. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const W=typeof module!=='undefined'?require('./work-core.js'):root.TPWork;
const D=typeof module!=='undefined'?require('./definition-core.js'):root.TPDefinitions;
const CV=typeof module!=='undefined'?require('./conventions-core.js'):root.TPConventions;
function collect(){const checks=[];return {checks,check(label,fn){try{const detail=fn();checks.push({label,ok:true,detail:detail??'Hợp lệ'});}catch(e){checks.push({label,ok:false,detail:e.message});}},result(){return {checks,ok:checks.every(x=>x.ok)};}};}
function shape(d,db,inputs,density=7850,stock={length:6000,width:1220}){
  const out=collect();let g;
  out.check('Ký hiệu, nơi nhập và đơn vị',()=>{D.validateShape(d);return d.fields.map(f=>f.key+' · '+(f.name||CV.parameterName(db,f.key)||'chưa khai tên')+' · '+f.unit).join('; ');});
  out.check('Tên thông số',()=>{const missing=d.fields.filter(f=>!(f.name||CV.parameterName(db,f.key)));if(missing.length)throw Error('Bổ sung tên cho '+missing.map(f=>f.key).join(', '));});
  const values=inputs||Object.fromEntries(d.fields.map(f=>[f.key,f.sample]));
  out.check('Khai triển, khối lượng và diện tích phôi',()=>{g=D.testShape(d,values,density);return `${g.length} × ${g.width} mm; ${g.weight} kg; ${g.blankArea} m² / chi tiết`;});
  out.check('Khổ mua và lượng vật tư mua',()=>{if(!g)throw Error('Sửa công thức phôi trước khi kiểm tra khổ mua');const v=D.trial(d,{inputs:values,density,stockL:stock.length,stockW:stock.width,count:stock.count??1,kerf:stock.kerf??0});return `${v.stocks} khổ; ${v.buyKg} kg; ${v.buyArea} m²; ${v.count} chi tiết`;});
  return {...out.result(),geometry:g};
}
function rate(rate,tier){
  const out=collect(),samples=[],ctx={L:1000,W:200,H:50,T:2,count:1,localQty:1,productQty:1,parentQty:1,parentCount:1,componentCount:1,weight:1,area:1,unitWeight:1,unitArea:1,workQuantity:1};
  out.check('Tên và các đơn giá',()=>{if(!String(rate.name||'').trim())throw Error('Thiếu tên nguyên công');for(const mode of ['inside','outside']){W.number(rate[mode],'Giá '+mode);if(!String(rate[mode+'Unit']||rate.unit||'').trim())throw Error('Thiếu đơn vị');}W.validatePriceOptions(rate);});
  const factorIds=new Set();for(const f of rate.factors||[])out.check('Bảng hệ số · '+f.name,()=>{if(!String(f.id||'').trim()||factorIds.has(f.id)||!String(f.name||'').trim()||!String(f.param||'').trim())throw Error('Yếu tố thiếu mã/tên/tham số hoặc bị trùng mã');factorIds.add(f.id);const rows=f.kind==='category'?f.categories:f.tiers;if(!rows?.length)throw Error('Chưa khai bậc / nhóm');let sample;for(const [i,row]of rows.entries()){const v=f.kind==='category'?row.key:row.max??(Number(rows[i-1]?.max)||0)+1;W.factor(f,v,tier);sample??=v;}ctx[f.param]=sample;return rows.length+' bậc / nhóm hợp lệ';});
  const options=[{id:'',name:'Theo đơn giá cơ sở',method:'catalog'},{id:'',name:'Giá cơ sở × hệ số',method:'factors'},...(rate.priceOptions||[]).filter(x=>x.enabled!==false)];
  for(const option of options)for(const mode of ['inside','outside'])out.check(option.name+' · '+(mode==='inside'?'tại xưởng':'thuê ngoài'),()=>{const r=W.operation(rate,{mode,pricingMethod:option.method,priceOptionId:option.id,amount:1,basisMode:'manual_total',workQuantity:1},ctx,{count:1,weight:1,area:1,volume:1},tier);samples.push({...r,mode,name:option.name,inputs:{...ctx}});return `1 ${r.unit} × ${r.rate} = ${r.cost} đ`;});
  for(const [i,recipe]of W.recipes(rate).entries())out.check('Định mức vật tư · '+(recipe.spec?.name||i+1),()=>{const g=W.consume(recipe,{id:'TEST',kind:'material',ops:[{basisMode:'manual_total',workQuantity:1}]},{count:1,weight:1,area:1,volume:1},i,0,rate.name,recipe.basis);return `${g.quantity} ${g.unit} × ${g.price} = ${g.cost} đ / 1 ${recipe.basis}`;});
  return {...out.result(),samples};
}
function convention(db,kind,item){const out=collect();out.check('Dữ liệu khai báo',()=>CV.save(C.copy(db),kind,C.copy(item),item.name));if(kind==='parameters')out.check('Tên và đơn vị thông số',()=>{if(!item.label?.trim())throw Error('Chưa khai tên / diễn giải');if(!item.unit?.trim())throw Error('Chưa khai đơn vị');return item.name+' — '+item.label+' ('+item.unit+')';});out.check('Liên kết đang sử dụng',()=>{const refs=CV.references(db,kind,item);return refs.length?refs.join('; '):'Chưa sử dụng trong báo giá / danh mục';});return out.result();}
const api={collect,shape,rate,convention};if(typeof module!=='undefined')module.exports=api;else root.TPReview=api;
})(typeof window!=='undefined'?window:globalThis);
