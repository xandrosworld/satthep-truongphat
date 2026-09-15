/* Versioned shape definitions, shared stock sizes and explicit unfinished BOM rows. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const E=typeof module!=='undefined'?require('./shape-expression-core.js'):root.TPShapeExpression;
const units={mm:[0,1],number:[0,0],'kg/m':[1,-1],'m²/m':[0,1]};
const blankVariables=['PHOI_D','PHOI_R','KL_DV','DT_DV'];
function blankFormulas(d){const factor=d.base==='sheet'?'PHOI_D * PHOI_R / 1000000':'PHOI_D / 1000';return {blankMass:d.blankMass||factor+' * KL_DV',blankSurface:d.blankSurface||factor+' * DT_DV'};}
function expandedFormulas(d){const replacements={PHOI_D:d.length,PHOI_R:d.width,KL_DV:d.mass,DT_DV:d.surface};return Object.fromEntries(Object.entries(blankFormulas(d)).map(([key,value])=>[key,value.replace(/\b(PHOI_D|PHOI_R|KL_DV|DT_DV)\b/g,name=>'('+replacements[name]+')')]));}
const validKey=k=>/^[A-Za-z][A-Za-z0-9_]{0,23}$/.test(k)&&!['RHO','PI','BW','SA','CW','CA','constructor','prototype','__proto__'].includes(k);
const positive=(v,label,zero=false)=>{if(v===''||v==null||!Number.isFinite(Number(v))||(zero?Number(v)<0:Number(v)<=0))throw Error(label+' phải là số '+(zero?'không âm':'dương'));return Number(v);};
function dimension(source,vars){return E.dimension(E.parse(source),vars);}
function validateShape(d){
  if(!d||!/^[A-Za-z0-9_-]{1,80}$/.test(d.id)||!String(d.name||'').trim()||d.name.length>200||!['sheet','bar'].includes(d.base))throw Error('Quy ước cần mã, tên và dạng tấm/thanh');
  if(!Array.isArray(d.fields)||!d.fields.length||d.fields.length>24)throw Error('Khai từ 1 đến 24 thông số');
  const seen=new Set(),dims={RHO:[1,-3],PI:[0,0]};
  for(const f of d.fields)if(f.name!==undefined&&(typeof f.name!=='string'||f.name.length>120))throw Error('Tên thông số tối đa 120 ký tự');
  for(const f of d.fields){if(!validKey(f.key)||seen.has(f.key)||!['fixed','input'].includes(f.mode)||!Object.hasOwn(units,f.unit))throw Error('Thông số bị trùng, sai ký hiệu, nơi nhập hoặc đơn vị: '+f.key);seen.add(f.key);dims[f.key]=units[f.unit];positive(f.sample,'Số thử '+f.key,true);}
  const expected={length:[0,1],width:d.base==='sheet'?[0,1]:[0,0],mass:[1,d.base==='sheet'?-2:-1],surface:[0,d.base==='sheet'?0:1]};
  for(const [key,unit]of Object.entries(expected)){const result=dimension(d[key],dims);if(!result.literal&&result.d.some((v,i)=>v!==unit[i]))throw Error('Công thức '+key+' sai đơn vị đầu ra');if(result.literal&&key!=='width'&&key!=='surface')throw Error('Công thức '+key+' cần biến có đơn vị, không dùng số trần');}
  if(d.blankShape&&(!Object.hasOwn(C.shapes,d.blankShape)||d.blankShape==='piece'||(d.blankShape==='sheet')!==(d.base==='sheet')))throw Error('Hình dạng phôi không khớp cách tính tấm/thanh');
  if(d.sourceRuleId!==undefined&&(typeof d.sourceRuleId!=='string'||d.sourceRuleId.length>100))throw Error('Quy tắc nguồn không hợp lệ');
  const blankDims={...dims,PHOI_D:[0,1],PHOI_R:[0,1],KL_DV:expected.mass,DT_DV:expected.surface};
  for(const key of ['blankMass','blankSurface'])if(d[key]!==undefined&&typeof d[key]!=='string')throw Error('Công thức phôi phải là chuỗi ký tự');
  for(const [key,unit]of [['blankMass',[1,0]],['blankSurface',[0,2]]])if(d[key]){
    if(d.fields.some(f=>blankVariables.includes(f.key)))throw Error('PHOI_D, PHOI_R, KL_DV và DT_DV dành cho công thức phôi');
    const result=dimension(d[key],blankDims);
    if(result.literal||result.d.some((v,i)=>v!==unit[i]))throw Error('Công thức '+(key==='blankMass'?'khối lượng phôi':'diện tích phôi')+' sai đơn vị đầu ra');
  }
  if(typeof(d.notes??'')!=='string'||(d.notes||'').length>2000||typeof(d.condition??'')!=='string'||(d.condition||'').length>2000)throw Error('Ghi chú/điều kiện tối đa 2.000 ký tự');
  return d;
}
function info(m){return m.shapeDefinition?{name:m.shapeDefinition.name,fixed:m.shapeDefinition.fields.filter(f=>f.mode==='fixed').map(f=>f.key),input:m.shapeDefinition.fields.filter(f=>f.mode==='input').map(f=>f.key)}:C.shapes[m.shape];}
function values(m,dims={},sample=false){const d=m.shapeDefinition;const out={RHO:positive(m.density,'Khối lượng riêng'),PI:Math.PI};for(const f of d.fields){const raw=f.mode==='fixed'?m.props?.[f.key]:dims[f.key]??m.props?.[f.key];out[f.key]=positive(raw??(sample?f.sample:undefined),'Thông số '+f.key,true);}return out;}
function effective(n){if(!n.spec.shapeDefinition)return n.spec;const vars=values(n.spec,n.dims);return {...n.spec,props:Object.fromEntries(n.spec.shapeDefinition.fields.map(f=>[f.key,vars[f.key]]))};}
function stockProperties(m){if(!m.shapeDefinition)return m.props;const d=m.shapeDefinition,used=new Set([d.mass,d.surface,m.massOverride?.formula||''].join(' ').match(/[A-Za-z_][A-Za-z_0-9]*/g)||[]);return Object.fromEntries(d.fields.filter(f=>f.mode==='fixed'||used.has(f.key)).map(f=>[f.key,m.props[f.key]]));}
function coefficients(m,sample=false){const d=m.shapeDefinition;validateShape(d);const vars=values(m,{},sample);return {mass:positive(E.formula(d.mass,vars),'Khối lượng trên đơn vị'),surface:positive(E.formula(d.surface,vars),'Diện tích trên đơn vị')};}
function geometry(n,count){const m=n.spec,d=m.shapeDefinition;validateShape(d);if(m.shape!==(d.base==='sheet'?'sheet':'profile'))throw Error('Dạng vật tư không khớp quy ước đã lưu');if(!Number.isFinite(count)||count<0)throw Error('Số lượng không hợp lệ');const vars=values(m,n.dims),length=positive(E.formula(d.length,vars),'Dài khai triển'),width=d.base==='sheet'?positive(E.formula(d.width,vars),'Rộng khai triển'):0;
  const factor=d.base==='sheet'?length*width/1e6:length/1000,rates=coefficients(effective(n));
  const mass=m.massOverride?C.materialMass(effective(n)):rates.mass,surface=m.areaOverride?C.materialSurface(effective(n)):rates.surface;
  const blankVars={...vars,PHOI_D:length,PHOI_R:width,KL_DV:mass,DT_DV:surface};
  const weight=(d.blankMass?positive(E.formula(d.blankMass,blankVars),'Khối lượng phôi sản phẩm'):factor*mass)*count;
  const area=(d.blankSurface?positive(E.formula(d.blankSurface,blankVars),'Diện tích phôi sản phẩm'):factor*surface)*count;
  return {length,width,weight,blankArea:area,area,volume:weight/m.density,quantity:count,measure:factor*count};
}
function applyShape(m,d,fixed={}){validateShape(d);const updated=C.copy(m);updated.shapeDefinition=C.copy(d);updated.shape=d.base==='sheet'?'sheet':'profile';updated.props={};for(const f of d.fields.filter(f=>f.mode==='fixed'))updated.props[f.key]=positive(fixed[f.key],'Thông số cố định '+f.key,true);delete updated.massOverride;delete updated.areaOverride;return updated;}
function testShape(d,inputs,density=7850){const m=applyShape({id:'PREVIEW',density},d,inputs),dims=Object.fromEntries(d.fields.filter(f=>f.mode==='input').map(f=>[f.key,inputs[f.key]]));return geometry({spec:m,dims},1);}
function trial(d,options={}){
  const inputs=options.inputs||Object.fromEntries(d.fields.map(f=>[f.key,f.sample]));
  const density=positive(options.density??7850,'Khối lượng riêng thử'),stockL=positive(options.stockL??6000,'Dài khổ mua thử'),stockW=d.base==='sheet'?positive(options.stockW??1220,'Rộng khổ mua thử'):0,count=positive(options.count??1,'Số lượng thử'),kerf=positive(options.kerf??0,'Mạch cắt thử',true);
  if(!Number.isInteger(count)||count>5000)throw Error('Số lượng thử từ 1 đến 5.000 chi tiết nguyên');
  if(stockL>100000||stockW>100000)throw Error('Khổ mua thử tối đa 100.000 mm');
  const g=testShape(d,inputs,density),m=applyShape({id:'PREVIEW',density,stockL,stockW},d,inputs),n={spec:m,dims:inputs},spec=effective(n),rates=coefficients(spec),layout=C.nest([{id:'preview',label:'Chi tiết thử',count,geometry:g}],spec,kerf);
  const stocks=layout.stocks.length,measure=stocks*stockL/1000*(d.base==='sheet'?stockW/1000:1);
  const vars={...inputs,RHO:density,PI:Math.PI,PHOI_D:g.length,PHOI_R:g.width,KL_DV:rates.mass,DT_DV:rates.surface};
  return {g,vars,rates,stocks,stockL,stockW,count,kerf,measure,buyKg:measure*rates.mass,buyArea:measure*rates.surface,totalKg:g.weight*count,totalArea:g.blankArea*count};
}
function saveShape(db,d){validateShape(d);testShape(d,Object.fromEntries(d.fields.map(f=>[f.key,f.sample])));db.shapeDefinitions??=[];const old=db.shapeDefinitions.find(x=>x.id===d.id),next={...C.copy(d),version:(old?.version||0)+1};if(old)Object.assign(old,next);else db.shapeDefinitions.push(next);return next;}
function validateStock(s){if(!s||!/^[A-Za-z0-9_-]{1,80}$/.test(s.id)||!String(s.name||'').trim()||!['sheet','bar'].includes(s.base))throw Error('Khổ chuẩn cần mã, tên và dạng tấm/thanh');positive(s.length,'Chiều dài khổ');if(s.base==='sheet')positive(s.width,'Chiều rộng khổ');if(s.length>100000||s.width>100000)throw Error('Khổ mua tối đa 100.000 mm');for(const k of ['name','workshop','machine'])if(typeof(s[k]??'')!=='string'||(s[k]||'').length>200)throw Error('Tên/xưởng/máy tối đa 200 ký tự');return s;}
function saveStock(db,s){validateStock(s);db.stockSizes??=[];const old=db.stockSizes.find(x=>x.id===s.id),v={...C.copy(s),version:(old?.version||0)+1};if(old)Object.assign(old,v);else db.stockSizes.push(v);return v;}
function stocks(db,m){return (db.stockSizes||[]).filter(s=>s.active!==false&&s.base===(m.shape==='sheet'?'sheet':'bar'));}
function draft(name='Vật tư chưa chọn mã',qty=1){positive(qty,'Số lượng');return {id:C.uid(),kind:'material',draftMaterial:true,materialId:'',name,qty,dims:{},spec:{id:'UNASSIGNED',name,shape:'piece',props:{},unit:'cái',price:0},rule:'',ruleSpec:{name:'Chưa chọn mã',length:'0',width:'0'},ops:[]};}
function assign(n,m,rules){if(!m)throw Error('Chọn mã vật tư');const original=C.copy(n),shape=m.shapeDefinition;Object.assign(n,{draftMaterial:false,materialId:m.id,spec:C.copy(m),name:m.name,dims:{L:1000,W:300,H:50,F:15,...original.dims},rule:shape?shape.id:m.shape==='sheet'?'flat':'bar',ruleSpec:C.copy(shape?{id:shape.id,name:shape.name,shape:shape.base,length:shape.length,width:shape.width}:rules.find(r=>r.id===(m.shape==='sheet'?'flat':'bar')))});if(shape)for(const f of shape.fields.filter(f=>f.mode==='input'))if(original.dims?.[f.key]===undefined)n.dims[f.key]=f.sample;delete n.paramLinks;return n;}
function validateCatalog(db){for(const [key,validate]of [['shapeDefinitions',validateShape],['stockSizes',validateStock]]){const rows=db[key]||[];if(!Array.isArray(rows)||rows.length>2000)throw Error('Danh mục '+key+' không hợp lệ');const seen=new Set();for(const row of rows){validate(row);if(seen.has(row.id))throw Error('Trùng mã '+row.id);seen.add(row.id);}}for(const m of [...db.materials||[],...C.flatten([...db.quote?.products||[],...db.library||[]]).map(n=>n.spec).filter(Boolean)])if(m.shapeDefinition){validateShape(m.shapeDefinition);if(m.shape!==(m.shapeDefinition.base==='sheet'?'sheet':'profile'))throw Error('Dạng vật tư không khớp quy ước');}}
const api={trial,expression:E,blankFormulas,expandedFormulas,dimension,validateShape,info,values,effective,stockProperties,coefficients,geometry,applyShape,testShape,saveShape,validateStock,saveStock,stocks,draft,assign,validateCatalog};if(typeof module!=='undefined')module.exports=api;else root.TPDefinitions=api;
})(typeof window!=='undefined'?window:globalThis);
