/* Versioned shape definitions, shared stock sizes and explicit unfinished BOM rows. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const CV=typeof module!=='undefined'?require('./conventions-core.js'):root.TPConventions;
const E=typeof module!=='undefined'?require('./shape-expression-core.js'):root.TPShapeExpression;
const PG=typeof module!=='undefined'?require('./polygon-core.js'):root.TPPolygon;
const units={mm:[0,1],number:[0,0],'kg/m':[1,-1],'m²/m':[0,1]};
const blankVariables=['PHOI_D','PHOI_R','KL_DV','DT_DV'];
// Keep any historic input named L0/W0 intact; use legacy output aliases in that definition only.
function unfoldSymbols(d){const used=new Set([...d.fields||[],...d.unfoldOutputs||[]].map(f=>f.key));return {length:used.has('L0')?'PHOI_D':'L0',width:used.has('W0')?'PHOI_R':'W0'};}
// Display the declared contour dimensions, not the rectangular envelope aliases.
function displayedUnfolding(d){
 const outputs=(d.unfoldOutputs||[]).map(o=>({symbol:o.key,key:'output-'+o.key,formula:o.formula}));
 if(outputs.length)return outputs;
 const compact=x=>String(x||'').replace(/\s/g,'');
 const diameter=compact(d.length),legacyCircle=d.base==='sheet'&&diameter===compact(d.width)&&['D','D0'].includes(diameter)&&/PI/.test(d.blankSurface||'');
 if(d.nesting==='circle'||legacyCircle)return [{symbol:'D0',key:'output-D0',formula:d.length}];
 const names=unfoldSymbols(d);return [{symbol:names.length,key:'length',formula:d.length},...(d.base==='sheet'?[{symbol:names.width,key:'width',formula:d.width}]:[])];
}
function unfoldAliases(d,length,width){const names=unfoldSymbols(d);return {PHOI_D:length,PHOI_R:width,[names.length]:length,[names.width]:width};}
function editorFormulas(d){const names=unfoldSymbols(d);return Object.fromEntries(Object.entries(blankFormulas(d)).map(([key,value])=>[key,value.replace(/\b(PHOI_D|PHOI_R)\b/g,name=>name==='PHOI_D'?names.length:names.width)]));}
function blankFormulas(d){const factor=d.base==='sheet'?'PHOI_D * PHOI_R / 1000000':'PHOI_D / 1000';return {blankMass:d.blankMass||factor+' * KL_DV',blankSurface:d.blankSurface||factor+' * DT_DV'};}
// Outputs are versioned formulas, never additional quantities to enter in a quote.
function outputOrder(d){
 const outputs=d.unfoldOutputs||[];
 if(!Array.isArray(outputs)||outputs.length>24)throw Error('Khai tối đa 24 kích thước khai triển');
 const inputs=new Set((d.fields||[]).map(f=>f.key)),byKey=new Map();
 for(const o of outputs){if(!o||!validKey(o.key)||inputs.has(o.key)||byKey.has(o.key)||blankVariables.includes(o.key)||o.unit!=='mm'||typeof o.formula!=='string'||!o.formula.trim()||o.formula.length>2000||typeof(o.name??'')!=='string'||(o.name||'').length>120)throw Error('Kích thước khai triển trùng hoặc chưa hợp lệ: '+(o?.key||''));byKey.set(o.key,o);}
 const ordered=[],active=new Set(),done=new Set();
 function visit(o){if(done.has(o.key))return;if(active.has(o.key))throw Error('Công thức khai triển tham chiếu vòng: '+o.key);active.add(o.key);for(const key of C.formulaNames(o.formula))if(byKey.has(key))visit(byKey.get(key));active.delete(o.key);done.add(o.key);ordered.push(o);}
 outputs.forEach(visit);return ordered;
}
function outputValues(d,vars){const result={...vars};for(const o of outputOrder(d))result[o.key]=positive(E.formula(o.formula,result),'Kích thước khai triển '+o.key);return result;}
function expandedFormulas(d){const names=unfoldSymbols(d),replacements={};
 const expand=source=>String(source).replace(/\b[A-Za-z][A-Za-z0-9_]*\b/g,name=>Object.hasOwn(replacements,name)?'('+replacements[name]+')':name);
 for(const o of outputOrder(d)){replacements[o.key]=expand(o.formula);if(replacements[o.key].length>50000)throw Error('Công thức khai triển quá phức tạp');}
 const length=expand(d.length),width=expand(d.width),mass=expand(d.mass),surface=expand(d.surface);
 Object.assign(replacements,{PHOI_D:length,PHOI_R:width,[names.length]:length,[names.width]:width,KL_DV:mass,DT_DV:d.base==='sheet'?1:surface});
 return Object.fromEntries(Object.entries(blankFormulas(d)).map(([key,value])=>[key,expand(value)]));
}

const validKey=k=>!Object.hasOwn(PG.symbols,k)&&/^[A-Za-z][A-Za-z0-9_]{0,23}$/.test(k)&&!['RHO','PI','BW','SA','CW','CA','constructor','prototype','__proto__'].includes(k);
const positive=(v,label,zero=false)=>{if(v===''||v==null||!Number.isFinite(Number(v))||(zero?Number(v)<0:Number(v)<=0))throw Error(label+' phải là số '+(zero?'không âm':'dương'));return Number(v);};
function dimension(source,vars){return E.dimension(E.parse(source),vars);}
function validateShape(d){
  if(!d||!/^[A-Za-z0-9_-]{1,80}$/.test(d.id)||!String(d.name||'').trim()||d.name.length>200||!['sheet','bar'].includes(d.base))throw Error('Quy ước cần mã, tên và dạng tấm/thanh');
  if(d.nesting!==undefined&&(!['bounding','bounding-fixed','right-triangle','circle'].includes(d.nesting)||d.nesting!=='bounding'&&d.base!=='sheet'))throw Error('Cách xếp phôi không khớp dạng tấm/thanh');
  if(d.blankShapeName!==undefined&&(typeof d.blankShapeName!=='string'||d.blankShapeName.length>200))throw Error('Tên hình dạng phôi tối đa 200 ký tự');
  if(d.productGroup!==undefined&&(typeof d.productGroup!=='string'||d.productGroup.length>80))throw Error('Nhóm lớn tối đa 80 ký tự');
  if(!Array.isArray(d.fields)||!d.fields.length||d.fields.length>24)throw Error('Khai từ 1 đến 24 thông số');
  const seen=new Set(),dims={RHO:[1,-3],PI:[0,0]};
  for(const f of d.fields)if(f.name!==undefined&&(typeof f.name!=='string'||f.name.length>120))throw Error('Tên thông số tối đa 120 ký tự');
  for(const f of d.fields){if(!validKey(f.key)||seen.has(f.key)||!['fixed','input'].includes(f.mode)||!Object.hasOwn(units,f.unit))throw Error('Thông số bị trùng, sai ký hiệu, nơi nhập hoặc đơn vị: '+f.key);seen.add(f.key);dims[f.key]=units[f.unit];positive(f.sample,'Số thử '+f.key,true);}
  for(const o of outputOrder(d)){const result=dimension(o.formula,dims);if(result.literal||result.d.some((v,i)=>v!==[0,1][i]))throw Error('Công thức '+o.key+' phải trả về kích thước mm');dims[o.key]=[0,1];}
  if(d.polygon){if(d.base!=='sheet')throw Error('Đa giác chỉ dùng cho tấm');PG.validate(d.polygon,dims);Object.assign(dims,PG.symbols);}
  const expected={length:[0,1],width:d.base==='sheet'?[0,1]:[0,0],mass:[1,d.base==='sheet'?-2:-1],surface:[0,d.base==='sheet'?0:1]};
  for(const [key,unit]of Object.entries(expected)){const result=dimension(d[key],dims);if(!result.literal&&result.d.some((v,i)=>v!==unit[i]))throw Error('Công thức '+key+' sai đơn vị đầu ra');if(result.literal&&key!=='width'&&key!=='surface')throw Error('Công thức '+key+' cần biến có đơn vị, không dùng số trần');}
  if(d.blankShape&&(!Object.hasOwn(C.shapes,d.blankShape)||d.blankShape==='piece'||(d.blankShape==='sheet')!==(d.base==='sheet')))throw Error('Hình dạng phôi không khớp cách tính tấm/thanh');
  if(d.sourceRuleId!==undefined&&(typeof d.sourceRuleId!=='string'||d.sourceRuleId.length>100))throw Error('Quy tắc nguồn không hợp lệ');
  const blankDims={...dims,...unfoldAliases(d,[0,1],[0,1]),KL_DV:expected.mass,DT_DV:expected.surface};
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
function values(m,dims={},sample=false){const d=m.shapeDefinition;const out={RHO:positive(m.density,'Khối lượng riêng'),PI:Math.PI};for(const f of d.fields){const raw=f.mode==='fixed'?m.props?.[f.key]:dims[f.key]??m.props?.[f.key];out[f.key]=positive(raw??(sample?f.sample:undefined),'Thông số '+f.key,true);}const result=outputValues(d,out);return d.polygon?{...result,...PG.values(d.polygon,result)}:result;}
function effective(n){if(!n.spec.shapeDefinition)return n.spec;const vars=values(n.spec,n.dims);return {...n.spec,props:Object.fromEntries(n.spec.shapeDefinition.fields.map(f=>[f.key,vars[f.key]]))};}
function stockProperties(m){if(!m.shapeDefinition)return m.props;const d=m.shapeDefinition,used=new Set([d.mass,d.surface,m.massOverride?.formula||''].flatMap(C.formulaNames));for(const o of outputOrder(d).reverse())if(used.has(o.key))for(const key of C.formulaNames(o.formula))used.add(key);return Object.fromEntries(d.fields.filter(f=>f.mode==='fixed'||used.has(f.key)).map(f=>[f.key,m.props[f.key]]));}
function coefficients(m,sample=false){const d=m.shapeDefinition;validateShape(d);const vars=values(m,{},sample);return {mass:positive(E.formula(d.mass,vars),'Khối lượng trên đơn vị'),surface:positive(E.formula(d.surface,vars),'Diện tích trên đơn vị')};}
function geometry(n,count){const m=n.spec,d=m.shapeDefinition;validateShape(d);if(m.shape!==(d.base==='sheet'?'sheet':'profile'))throw Error('Dạng vật tư không khớp quy ước đã lưu');if(!Number.isFinite(count)||count<0)throw Error('Số lượng không hợp lệ');const vars=values(m,n.dims),length=positive(E.formula(d.length,vars),'Dài khai triển'),width=d.base==='sheet'?positive(E.formula(d.width,vars),'Rộng khai triển'):0;
  const factor=d.base==='sheet'?length*width/1e6:length/1000,rates=coefficients(effective(n));
  const mass=m.massOverride?C.materialMass(effective(n)):rates.mass,surface=m.areaOverride?C.materialSurface(effective(n)):rates.surface;
  const blankVars={...vars,...unfoldAliases(d,length,width),KL_DV:mass,DT_DV:d.base==='sheet'?1:surface};
  const weight=(d.blankMass?positive(E.formula(d.blankMass,blankVars),'Khối lượng phôi sản phẩm'):factor*mass)*count;
  let area=(d.blankSurface?positive(E.formula(d.blankSurface,blankVars),'Diện tích phôi sản phẩm'):factor*(d.base==='sheet'?1:surface))*count;
  // Older rectangular sheet declarations put the two-face multiplier in blankSurface.
  // Recognize only an explicit leading 2, with matching one-layer mass and bounding area.
  // Never suppress arbitrary oversized contours or inconsistent mass formulas.
  const legacyTwoFaces=d.base==='sheet'&&!d.polygon&&!['circle','right-triangle'].includes(d.nesting)&&count>0&&surface===1&&/^\s*2\s*\*/.test(d.blankSurface||'')&&Math.abs(area-2*factor*count)<=Math.max(1e-9,factor*count*1e-8)&&Math.abs(weight-factor*count*mass)<=Math.max(1e-8,factor*count*mass*1e-8);
  if(legacyTwoFaces)area/=2;
  if(d.nesting==='right-triangle'&&count>0){const expected=factor*count/2;if(Math.abs(area-expected)>Math.max(1e-9,expected*1e-8)||Math.abs(weight-expected*mass)>Math.max(1e-8,expected*mass*1e-8))throw Error('Ghép tam giác vuông cần diện tích dài × rộng / 2 và khối lượng theo diện tích đó; kiểm tra công thức hoặc chọn xếp khổ bao');}
  if(d.nesting==='circle'&&count>0){const expected=Math.PI*length*length/4/1e6*count;if(Math.abs(length-width)>1e-8||Math.abs(area-expected)>Math.max(1e-9,expected*1e-8)||Math.abs(weight-expected*mass)>Math.max(1e-8,expected*mass*1e-8))throw Error('Xếp tấm tròn cần dài = rộng = đường kính, diện tích PI × D0² / 4 và khối lượng theo diện tích đó');}
  const polygon=d.polygon?PG.geometry(d.polygon,vars):d.nesting==='right-triangle'?{points:[[0,0],[length,0],[0,width]],sides:[length,Math.hypot(length,width),width],length,width,area:length*width/2}:null;if(polygon&&(Math.abs(length-polygon.length)>1e-6||Math.abs(width-polygon.width)>1e-6||count>0&&Math.abs(area/count-polygon.area/1e6)>Math.max(1e-9,polygon.area/1e6*1e-8)))throw Error('Công thức khổ bao/diện tích không khớp biên đa giác');
  return {...(polygon?{polygon:polygon.points,sideLengths:polygon.sides}:{}),...(d.unfoldOutputs?.length?{unfolded:Object.fromEntries(d.unfoldOutputs.map(o=>[o.key,vars[o.key]]))}:{}),length,width,weight,blankArea:area,area:d.base==='sheet'?area*(legacyTwoFaces?2:surface):area,volume:weight/m.density,quantity:count,measure:factor*count};
}
function applyShape(m,d,fixed={}){validateShape(d);const updated=C.copy(m);updated.shapeDefinition=C.copy(d);updated.shape=d.base==='sheet'?'sheet':'profile';updated.props={};for(const f of d.fields.filter(f=>f.mode==='fixed'))updated.props[f.key]=positive(fixed[f.key],'Thông số cố định '+f.key,true);delete updated.massOverride;delete updated.areaOverride;return updated;}
function testShape(d,inputs,density=7850){const m=applyShape({id:'PREVIEW',density},d,inputs),dims=Object.fromEntries(d.fields.filter(f=>f.mode==='input').map(f=>[f.key,inputs[f.key]]));return geometry({spec:m,dims},1);}
function trial(d,options={}){
  const inputs=options.inputs||Object.fromEntries(d.fields.map(f=>[f.key,f.sample]));
  const density=positive(options.density??7850,'Khối lượng riêng thử'),stockL=positive(options.stockL??6000,'Dài khổ mua thử'),stockW=d.base==='sheet'?positive(options.stockW??1220,'Rộng khổ mua thử'):0,count=positive(options.count??1,'Số lượng thử'),kerf=positive(options.kerf??0,'Mạch cắt thử',true);
  if(!Number.isInteger(count)||count>5000)throw Error('Số lượng thử từ 1 đến 5.000 chi tiết nguyên');
  if(stockL>100000||stockW>100000)throw Error('Khổ mua thử tối đa 100.000 mm');
  const g=testShape(d,inputs,density),m=applyShape({id:'PREVIEW',density,stockL,stockW},d,inputs),n={spec:m,dims:inputs},spec=effective(n),rates=coefficients(spec),layout=C.nest([{id:'preview',label:'Chi tiết thử',color:'#3568aa',count,geometry:g}],spec,kerf);
  const stocks=layout.stocks.length,measure=stocks*stockL/1000*(d.base==='sheet'?stockW/1000:1);
  const vars={...values(m,inputs),...unfoldAliases(d,g.length,g.width),KL_DV:rates.mass,DT_DV:rates.surface};
  const netMeasure=d.base==='sheet'?g.blankArea*count:g.length*count/1000,boundingMeasure=layout.used/(d.base==='sheet'?1e6:1000),remaining=measure-netMeasure;
  const allowance=netMeasure>0&&netMeasure<=boundingMeasure+1e-9?{netMeasure,boundingMeasure,purchasedMeasure:measure,remaining:Math.max(0,remaining),shapeOffcut:Math.max(0,boundingMeasure-netMeasure),stockOffcut:Math.max(0,measure-boundingMeasure),percent:Math.max(0,remaining/netMeasure*100),stockPercent:Math.max(0,remaining/measure*100),utilization:netMeasure/measure*100}:null;
  return {g,vars,rates,stocks,stockL,stockW,count,kerf,measure,layout,allowance,buyKg:measure*rates.mass,buyArea:d.base==='sheet'?measure:measure*rates.surface,totalKg:g.weight*count,totalArea:g.blankArea*count};
}
function saveShape(db,d){validateShape(d);testShape(d,Object.fromEntries(d.fields.map(f=>[f.key,f.sample])));db.shapeDefinitions??=[];const old=db.shapeDefinitions.find(x=>x.id===d.id),next={...C.copy(d),version:(old?.version||0)+1};if(d.productGroup!==undefined)next.productGroup=CV.productGroup(db,d.productGroup,old?.productGroup);if(old)Object.assign(old,next);else db.shapeDefinitions.push(next);for(const m of db.materials||[]){const prior=m.shapeDefinition;if(prior?.id!==next.id||prior.name===next.name)continue;if(prior.name&&m.name?.includes(prior.name))m.name=m.name.replace(prior.name,next.name);m.shapeDefinition={...prior,name:next.name};}return next;}
function validateStock(s){if(!s||!/^[A-Za-z0-9_-]{1,80}$/.test(s.id)||!String(s.name||'').trim()||!['sheet','bar'].includes(s.base))throw Error('Khổ chuẩn cần mã, tên và dạng tấm/thanh');positive(s.length,'Chiều dài khổ');if(s.base==='sheet')positive(s.width,'Chiều rộng khổ');if(s.length>100000||s.width>100000)throw Error('Khổ mua tối đa 100.000 mm');for(const k of ['name','workshop','machine'])if(typeof(s[k]??'')!=='string'||(s[k]||'').length>200)throw Error('Tên/xưởng/máy tối đa 200 ký tự');return s;}
function saveStock(db,s){validateStock(s);db.stockSizes??=[];const old=db.stockSizes.find(x=>x.id===s.id),v={...C.copy(s),version:(old?.version||0)+1};if(old)Object.assign(old,v);else db.stockSizes.push(v);return v;}
function stocks(db,m){return (db.stockSizes||[]).filter(s=>s.active!==false&&s.base===(m.shape==='sheet'?'sheet':'bar'));}
function draft(name='Vật tư chưa chọn mã',qty=1){positive(qty,'Số lượng');return {id:C.uid(),kind:'material',draftMaterial:true,materialId:'',name,qty,dims:{},spec:{id:'UNASSIGNED',name,shape:'piece',props:{},unit:'cái',price:0},rule:'',ruleSpec:{name:'Chưa chọn mã',length:'0',width:'0'},ops:[]};}
function assign(n,m,rules){if(!m)throw Error('Chọn mã vật tư');const original=C.copy(n),shape=m.shapeDefinition;Object.assign(n,{draftMaterial:false,materialId:m.id,spec:C.copy(m),name:m.name,dims:{L:1000,W:300,H:50,F:15,...original.dims},rule:shape?shape.id:m.shape==='sheet'?'flat':'bar',ruleSpec:C.copy(shape?{id:shape.id,name:shape.name,shape:shape.base,length:shape.length,width:shape.width}:rules.find(r=>r.id===(m.shape==='sheet'?'flat':'bar')))});if(shape)for(const f of shape.fields.filter(f=>f.mode==='input'))if(original.dims?.[f.key]===undefined)n.dims[f.key]=f.sample;delete n.paramLinks;return n;}
function validateCatalog(db){for(const [key,validate]of [['shapeDefinitions',validateShape],['stockSizes',validateStock]]){const rows=db[key]||[];if(!Array.isArray(rows)||rows.length>2000)throw Error('Danh mục '+key+' không hợp lệ');const seen=new Set();for(const row of rows){validate(row);if(seen.has(row.id))throw Error('Trùng mã '+row.id);seen.add(row.id);}}for(const m of [...db.materials||[],...C.flatten([...db.quote?.products||[],...db.library||[]]).map(n=>n.spec).filter(Boolean)])if(m.shapeDefinition){validateShape(m.shapeDefinition);if(m.shape!==(m.shapeDefinition.base==='sheet'?'sheet':'profile'))throw Error('Dạng vật tư không khớp quy ước');}}
function sheetPreset(kind){
 if(kind==='triangle-sides')return PG.preset('triangle');
 const field=(key,name,sample,mode='input')=>({key,name,mode,unit:'mm',sample});
 const choices={rectangle:{blankShapeName:'Tấm chữ nhật',fields:[field('L','Chiều dài',1000),field('W','Chiều rộng',200)],length:'L',width:'W',area:'L * W / 1000000'},circle:{blankShapeName:'Tấm tròn',fields:[field('D','Đường kính',1000)],length:'D',width:'D',area:'PI * D * D / 4 / 1000000'},triangle:{blankShapeName:'Tấm tam giác vuông',fields:[field('L','Cạnh đáy',1000),field('H','Chiều cao vuông góc',200)],length:'L',width:'H',area:'L * H / 2 / 1000000'}};
 if(['trapezoid','rhombus'].includes(kind)){
  const trapezoid=kind==='trapezoid',fields=trapezoid?[field('L','Đáy thứ nhất',1000),field('W','Đáy thứ hai',600),field('H','Chiều cao vuông góc',400)]:[field('L','Đường chéo thứ nhất',1000),field('W','Đường chéo thứ hai',600)],unfoldOutputs=fields.map(f=>({key:f.key+'0',name:f.name+' khai triển',unit:'mm',formula:f.key})),area=trapezoid?'(L0 + W0) * H0 / 2000000':'L0 * W0 / 2000000';
  return {polygon:undefined,base:'sheet',nesting:'bounding',blankShape:'sheet',blankShapeName:trapezoid?'Tấm hình thang':'Tấm hình thoi',fields:[field('T','Chiều dày',2,'fixed'),...fields],unfoldOutputs,length:trapezoid?'MAX(L0, W0)':'L0',width:trapezoid?'H0':'W0',mass:'RHO * T / 1000',surface:'1',blankMass:'('+area+') * KL_DV',blankSurface:area,condition:trapezoid?'Mẫu hình thang có đáy nhỏ nằm trong bề rộng đáy lớn (ví dụ hình thang cân/vuông); nếu đáy lệch ra ngoài, phải khai lại khổ bao thực. Xếp khổ bao, chưa ghép sát cạnh.':'Hình thoi khai theo hai đường chéo vuông góc; xếp khổ bao chữ nhật, chưa ghép sát cạnh.'};
 }
 const x=choices[kind];if(!x)throw Error('Chọn dạng khai triển được hỗ trợ');
 return {polygon:undefined,condition:'',base:'sheet',nesting:kind==='triangle'?'right-triangle':kind==='circle'?'circle':'bounding',blankShape:'sheet',blankShapeName:x.blankShapeName,fields:[field('T','Chiều dày',2,'fixed'),...x.fields],unfoldOutputs:kind==='circle'?[{key:'D0',name:'Đường kính khai triển',unit:'mm',formula:'D'}]:[],length:kind==='circle'?'D0':x.length,width:kind==='circle'?'D0':x.width,mass:'RHO * T / 1000',surface:'1',blankMass:'('+(kind==='circle'?'PI * D0 * D0 / 4 / 1000000':x.area)+') * KL_DV',blankSurface:kind==='circle'?'PI * D0 * D0 / 4 / 1000000':x.area};
}
function barPreset(kind){
 const f=(key,name,sample,unit='mm',mode='fixed')=>({key,name,sample,unit,mode});
 const choices={round:{blankShape:'round',blankShapeName:'Thanh tròn đặc',fields:[f('D','Đường kính',10)],mass:'PI * D * D / 4000000 * RHO',surface:'PI * D / 1000'},box:{blankShape:'box',blankShapeName:'Thanh hộp chữ nhật',fields:[f('W','Rộng ngoài',40),f('H','Cao ngoài',60),f('T','Chiều dày',2)],mass:'(W * H - (W - 2 * T) * (H - 2 * T)) / 1000000 * RHO',surface:'2 * (W + H) / 1000'},pipe:{blankShape:'pipe',blankShapeName:'Ống tròn',fields:[f('D','Đường kính ngoài',40),f('T','Chiều dày',2)],mass:'PI * (D * D - (D - 2 * T) * (D - 2 * T)) / 4000000 * RHO',surface:'PI * D / 1000'},angle:{blankShape:'angle',blankShapeName:'Thanh góc L',fields:[f('W','Cánh ngang',50),f('H','Cánh đứng',50),f('T','Chiều dày',5)],mass:'T * (W + H - T) / 1000000 * RHO',surface:'2 * (W + H) / 1000'},table:{blankShape:'profile',blankShapeName:'Thanh định hình theo bảng kê',fields:[f('KM','Khối lượng theo bảng kê',10,'kg/m'),f('AM','Diện tích theo bảng kê',.5,'m²/m')],mass:'KM',surface:'AM'}};
 const x=choices[kind];if(!x)throw Error('Chọn mẫu thanh hợp lệ');return {polygon:undefined,...x,unfoldOutputs:[],base:'bar',nesting:'bounding',fields:[f('L','Chiều dài cắt',2000,'mm','input'),...x.fields],length:'L',width:'0',blankMass:'L / 1000 * KL_DV',blankSurface:'L / 1000 * DT_DV'};
}
function example(kind){
 const sheet=['rectangle','circle','triangle','triangle-sides','trapezoid','rhombus'].includes(kind),d=sheet?sheetPreset(kind):barPreset(kind),name=d.blankShapeName;
 if(kind==='circle')d.fields.find(f=>f.key==='D').sample=500;
 if(kind==='triangle'){d.fields.find(f=>f.key==='L').sample=1000;d.fields.find(f=>f.key==='H').sample=500;}
 if(kind==='rectangle'){d.fields.find(f=>f.key==='L').sample=900;d.fields.find(f=>f.key==='W').sample=400;}
 return {...d,name:'Mẫu · '+name,notes:kind==='table'?'Số minh họa KM = 10 kg/m, AM = 0,5 m²/m, không phải bảng tra tiêu chuẩn. Thay bằng số liệu nhà cung cấp theo từng mã; KM và AM nhập cố định khi tạo mã vật tư.':sheet?'Mẫu kiểm thử; thay kích thước, khổ mua và mạch cắt theo thực tế.':'Tiết diện hình học lý tưởng, bỏ qua bo góc và dung sai. Diện tích dọc thanh, không tính hai mặt đầu; hộp/ống chỉ tính mặt ngoài. Đối chiếu bảng nhà cung cấp trước khi dùng.',_testDensity:7850,_testStockL:sheet?2000:6000,_testStockW:sheet?1000:0,_testCount:['circle','triangle'].includes(kind)?8:3,_testKerf:sheet?(kind==='rectangle'?3:0):3};
}
const blankShapeName=d=>d.blankShapeName?.trim()||C.shapes[d.blankShape||(d.base==='sheet'?'sheet':'profile')]?.name||'';
const api={polygonPreset:PG.preset,displayedUnfolding,outputOrder,outputValues,barPreset,example,sheetPreset,blankShapeName,unfoldSymbols,editorFormulas,trial,expression:E,blankFormulas,expandedFormulas,dimension,validateShape,info,values,effective,stockProperties,coefficients,geometry,applyShape,testShape,saveShape,validateStock,saveStock,stocks,draft,assign,validateCatalog};if(typeof module!=='undefined')module.exports=api;else root.TPDefinitions=api;
})(typeof window!=='undefined'?window:globalThis);
