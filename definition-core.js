/* Versioned shape definitions, shared stock sizes and explicit unfinished BOM rows. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const units={mm:[0,1],number:[0,0],'kg/m':[1,-1],'m²/m':[0,1]};
const validKey=k=>/^[A-Z][A-Z0-9_]{0,23}$/.test(k)&&!['RHO','PI','BW','SA','CW','CA'].includes(k);
const positive=(v,label,zero=false)=>{if(v===''||v==null||!Number.isFinite(Number(v))||(zero?Number(v)<0:Number(v)<=0))throw Error(label+' phải là số '+(zero?'không âm':'dương'));return Number(v);};
function dimension(source,vars){
  // The arithmetic parser checks syntax/size first; dimensional checking never executes code.
  try{C.formula(source,Object.fromEntries(Object.keys(vars).map(k=>[k,1])));}catch(e){if(e.message!=='Không thể chia cho 0')throw e;}
  const ts=String(source).match(/(?:\d+(?:\.\d*)?|\.\d+)|[A-Za-z_][A-Za-z_0-9]*|[()+\-*/]/g);let p=0;
  function atom(){const t=ts[p++];if(t==='+'||t==='-')return atom();if(t==='('){const r=expr();if(ts[p++]!==')')throw Error('Thiếu dấu đóng ngoặc');return r;}if(t&&/^\d|^\./.test(t))return {d:[0,0],literal:true};if(!Object.hasOwn(vars,t))throw Error('Tham số không hợp lệ: '+t);return {d:vars[t],literal:false};}
  function term(){let a=atom();while(ts[p]==='*'||ts[p]==='/'){const op=ts[p++],b=atom();a={d:a.d.map((v,i)=>v+(op==='*'?1:-1)*b.d[i]),literal:a.literal&&b.literal};}return a;}
  function expr(){let a=term();while(ts[p]==='+'||ts[p]==='-'){p++;const b=term();if(a.literal&&!b.literal)a={d:b.d,literal:false};else if(!b.literal&&a.d.some((v,i)=>v!==b.d[i]))throw Error('Cộng/trừ các đại lượng khác đơn vị');a.literal=a.literal&&b.literal;}return a;}
  const result=expr();if(p!==ts.length)throw Error('Công thức không hợp lệ');return result;
}
function validateShape(d){
  if(!d||!/^[A-Za-z0-9_-]{1,80}$/.test(d.id)||!String(d.name||'').trim()||d.name.length>200||!['sheet','bar'].includes(d.base))throw Error('Quy ước cần mã, tên và dạng tấm/thanh');
  if(!Array.isArray(d.fields)||!d.fields.length||d.fields.length>24)throw Error('Khai từ 1 đến 24 thông số');
  const seen=new Set(),dims={RHO:[1,-3],PI:[0,0]};
  for(const f of d.fields){if(!validKey(f.key)||seen.has(f.key)||!['fixed','input'].includes(f.mode)||!Object.hasOwn(units,f.unit))throw Error('Thông số bị trùng, sai ký hiệu, nơi nhập hoặc đơn vị: '+f.key);seen.add(f.key);dims[f.key]=units[f.unit];positive(f.sample,'Số thử '+f.key,true);}
  const expected={length:[0,1],width:d.base==='sheet'?[0,1]:[0,0],mass:[1,d.base==='sheet'?-2:-1],surface:[0,d.base==='sheet'?0:1]};
  for(const [key,unit]of Object.entries(expected)){const result=dimension(d[key],dims);if(!result.literal&&result.d.some((v,i)=>v!==unit[i]))throw Error('Công thức '+key+' sai đơn vị đầu ra');if(result.literal&&key!=='width'&&key!=='surface')throw Error('Công thức '+key+' cần biến có đơn vị, không dùng số trần');}
  if(typeof(d.notes??'')!=='string'||(d.notes||'').length>2000||typeof(d.condition??'')!=='string'||(d.condition||'').length>2000)throw Error('Ghi chú/điều kiện tối đa 2.000 ký tự');
  return d;
}
function info(m){return m.shapeDefinition?{name:m.shapeDefinition.name,fixed:m.shapeDefinition.fields.filter(f=>f.mode==='fixed').map(f=>f.key),input:m.shapeDefinition.fields.filter(f=>f.mode==='input').map(f=>f.key)}:C.shapes[m.shape];}
function values(m,dims={},sample=false){const d=m.shapeDefinition;const out={RHO:positive(m.density,'Khối lượng riêng'),PI:Math.PI};for(const f of d.fields){const raw=f.mode==='fixed'?m.props?.[f.key]:dims[f.key]??m.props?.[f.key];out[f.key]=positive(raw??(sample?f.sample:undefined),'Thông số '+f.key,true);}return out;}
function effective(n){if(!n.spec.shapeDefinition)return n.spec;const vars=values(n.spec,n.dims);return {...n.spec,props:Object.fromEntries(n.spec.shapeDefinition.fields.map(f=>[f.key,vars[f.key]]))};}
function stockProperties(m){if(!m.shapeDefinition)return m.props;const d=m.shapeDefinition,used=new Set([d.mass,d.surface,m.massOverride?.formula||''].join(' ').match(/[A-Za-z_][A-Za-z_0-9]*/g)||[]);return Object.fromEntries(d.fields.filter(f=>f.mode==='fixed'||used.has(f.key)).map(f=>[f.key,m.props[f.key]]));}
function coefficients(m,sample=false){const d=m.shapeDefinition;validateShape(d);const vars=values(m,{},sample);return {mass:positive(C.formula(d.mass,vars),'Khối lượng trên đơn vị'),surface:positive(C.formula(d.surface,vars),'Diện tích trên đơn vị')};}
function geometry(n,count){const m=n.spec,d=m.shapeDefinition;validateShape(d);if(m.shape!==(d.base==='sheet'?'sheet':'profile'))throw Error('Dạng vật tư không khớp quy ước đã lưu');if(!Number.isFinite(count)||count<0)throw Error('Số lượng không hợp lệ');const vars=values(m,n.dims),length=positive(C.formula(d.length,vars),'Dài khai triển'),width=d.base==='sheet'?positive(C.formula(d.width,vars),'Rộng khai triển'):0;
  const factor=d.base==='sheet'?length*width/1e6:length/1000,rates=coefficients(effective(n));
  const mass=m.massOverride?C.materialMass(effective(n)):rates.mass,surface=m.areaOverride?C.materialSurface(effective(n)):rates.surface;
  return {length,width,weight:factor*mass*count,blankArea:factor*surface*count,area:factor*surface*count,volume:factor*mass*count/m.density,quantity:count,measure:factor*count};
}
function applyShape(m,d,fixed={}){validateShape(d);const updated=C.copy(m);updated.shapeDefinition=C.copy(d);updated.shape=d.base==='sheet'?'sheet':'profile';updated.props={};for(const f of d.fields.filter(f=>f.mode==='fixed'))updated.props[f.key]=positive(fixed[f.key],'Thông số cố định '+f.key,true);delete updated.massOverride;delete updated.areaOverride;return updated;}
function testShape(d,inputs,density=7850){const m=applyShape({id:'PREVIEW',density},d,inputs),dims=Object.fromEntries(d.fields.filter(f=>f.mode==='input').map(f=>[f.key,inputs[f.key]]));return geometry({spec:m,dims},1);}
function saveShape(db,d){validateShape(d);testShape(d,Object.fromEntries(d.fields.map(f=>[f.key,f.sample])));db.shapeDefinitions??=[];const old=db.shapeDefinitions.find(x=>x.id===d.id),next={...C.copy(d),version:(old?.version||0)+1};if(old)Object.assign(old,next);else db.shapeDefinitions.push(next);return next;}
function validateStock(s){if(!s||!/^[A-Za-z0-9_-]{1,80}$/.test(s.id)||!String(s.name||'').trim()||!['sheet','bar'].includes(s.base))throw Error('Khổ chuẩn cần mã, tên và dạng tấm/thanh');positive(s.length,'Chiều dài khổ');if(s.base==='sheet')positive(s.width,'Chiều rộng khổ');if(s.length>100000||s.width>100000)throw Error('Khổ mua tối đa 100.000 mm');for(const k of ['name','workshop','machine'])if(typeof(s[k]??'')!=='string'||(s[k]||'').length>200)throw Error('Tên/xưởng/máy tối đa 200 ký tự');return s;}
function saveStock(db,s){validateStock(s);db.stockSizes??=[];const old=db.stockSizes.find(x=>x.id===s.id),v={...C.copy(s),version:(old?.version||0)+1};if(old)Object.assign(old,v);else db.stockSizes.push(v);return v;}
function stocks(db,m){return (db.stockSizes||[]).filter(s=>s.active!==false&&s.base===(m.shape==='sheet'?'sheet':'bar'));}
function draft(name='Vật tư chưa chọn mã',qty=1){positive(qty,'Số lượng');return {id:C.uid(),kind:'material',draftMaterial:true,materialId:'',name,qty,dims:{},spec:{id:'UNASSIGNED',name,shape:'piece',props:{},unit:'cái',price:0},rule:'',ruleSpec:{name:'Chưa chọn mã',length:'0',width:'0'},ops:[]};}
function assign(n,m,rules){if(!m)throw Error('Chọn mã vật tư');const original=C.copy(n),shape=m.shapeDefinition;Object.assign(n,{draftMaterial:false,materialId:m.id,spec:C.copy(m),name:m.name,dims:{L:1000,W:300,H:50,F:15,...original.dims},rule:shape?shape.id:m.shape==='sheet'?'flat':'bar',ruleSpec:C.copy(shape?{id:shape.id,name:shape.name,shape:shape.base,length:shape.length,width:shape.width}:rules.find(r=>r.id===(m.shape==='sheet'?'flat':'bar')))});if(shape)for(const f of shape.fields.filter(f=>f.mode==='input'))if(original.dims?.[f.key]===undefined)n.dims[f.key]=f.sample;delete n.paramLinks;return n;}
function validateCatalog(db){for(const [key,validate]of [['shapeDefinitions',validateShape],['stockSizes',validateStock]]){const rows=db[key]||[];if(!Array.isArray(rows)||rows.length>2000)throw Error('Danh mục '+key+' không hợp lệ');const seen=new Set();for(const row of rows){validate(row);if(seen.has(row.id))throw Error('Trùng mã '+row.id);seen.add(row.id);}}for(const m of [...db.materials||[],...C.flatten([...db.quote?.products||[],...db.library||[]]).map(n=>n.spec).filter(Boolean)])if(m.shapeDefinition){validateShape(m.shapeDefinition);if(m.shape!==(m.shapeDefinition.base==='sheet'?'sheet':'profile'))throw Error('Dạng vật tư không khớp quy ước');}}
const api={dimension,validateShape,info,values,effective,stockProperties,coefficients,geometry,applyShape,testShape,saveShape,validateStock,saveStock,stocks,draft,assign,validateCatalog};if(typeof module!=='undefined')module.exports=api;else root.TPDefinitions=api;
})(typeof window!=='undefined'?window:globalThis);
