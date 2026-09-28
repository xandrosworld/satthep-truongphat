(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
function rate(m,length,width){
 const props={...m.props};for(const f of m.shapeDefinition?.fields||[])if(f.mode==='input'&&['L','W'].includes(f.key)){const v=f.key==='L'?length:width;if(v>0)props[f.key]=v;}
 const spec={...m,props};
 let value;
 if(!m.shapeDefinition||m.massOverride)value=C.materialMass(spec);
 else{
  const vars={...spec.props,RHO:m.density,PI:Math.PI},outputs=new Map((m.shapeDefinition.unfoldOutputs||[]).map(o=>[o.key,o.formula])),visiting=new Set();
  function resolve(formula){for(const key of C.formulaNames(formula)){if(Object.hasOwn(vars,key))continue;if(!outputs.has(key)||visiting.has(key))throw Error('Thiếu thông số tính khối lượng: '+key);visiting.add(key);vars[key]=resolve(outputs.get(key));visiting.delete(key);}return C.formula(formula,vars);}
  value=resolve(m.shapeDefinition.mass);
 }
 if(!Number.isFinite(value)||value<=0)throw Error('Mã vật tư chưa đủ căn cứ tính khối lượng');return value;
}
function weight(m,length,width){if(!(length>0)||m.shape==='sheet'&&!(width>0))throw Error('Nhập đủ kích thước khổ phôi');return rate(m,length,width)*length/1000*(m.shape==='sheet'?width/1000:1);}
function sizes(configured=[]){
 const active=configured.filter(s=>s.active!==false),result=[...active];
 if(!active.some(s=>s.base==='sheet'))for(const [length,width]of [[2000,1000],[2440,1220],[2500,1250],[3000,1250],[3000,1500],[6000,1500]])result.push({id:'common-sheet-'+length+'-'+width,name:'Khổ tấm thông dụng',base:'sheet',length,width});
 if(!active.some(s=>s.base==='bar'))for(const length of [6000,12000])result.push({id:'common-bar-'+length,name:'Chiều dài thanh thông dụng',base:'bar',length,width:0});
 return result;
}
const api={rate,weight,sizes};if(typeof module!=='undefined')module.exports=api;else root.TPInventoryMass=api;
})(typeof globalThis!=='undefined'?globalThis:this);
