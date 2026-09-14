/* Product-group applicability and comparison selection. Pure; no inferred brands,
 * business formulas or automatic changes to the selected selling method. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const BUILTINS=[{id:'tmc',name:'Thang máng cáp',engine:'tmc'},{id:'detail',name:'Cơ khí khác',engine:'detail'}];
const BASE_METHODS=[['detail','Theo tính toán'],['tmc','Theo thang máng cáp'],['kg','Theo kg phôi'],['competitor','Theo đối thủ']];
const KEYS=['L','W','H','T','Q','KG','AREA','COST','DETAIL'];
const valid=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
function writable(q){if(['approved','submitted'].includes(q.status))throw Error('Bản đã khóa; tạo bản sửa trước');if(!q.pricing)throw Error('Cần bật luồng báo giá');}
function profiles(q){return Array.isArray(q.pricing?.productGroups)?q.pricing.productGroups.filter(g=>g&&typeof g==='object'&&typeof g.id==='string'):[];}
function groups(q){return [...BUILTINS,...profiles(q)];}
function profileErrors(q){
 if(q.pricing?.productGroups!=null&&!Array.isArray(q.pricing.productGroups))return ['Cấu hình nhóm phải là danh sách'];
 const errors=[],ids=new Set(BUILTINS.map(g=>g.id)),names=new Set(BUILTINS.map(g=>g.name));
 for(const g of q.pricing?.productGroups||[])try{const v=validateGroup(g);if(ids.has(v.id)||names.has(v.name))throw Error('Trùng mã hoặc tên nhóm');ids.add(v.id);names.add(v.name);}catch(e){errors.push('Cấu hình nhóm: '+e.message);}
 return errors;
}
function resolve(q,n){
 const id=n.priceGroupId??(n.tmcScope==='tmc'?'tmc':n.tmcScope==='detail'?'detail':n.tmcScope?'unknown':n.tmcKind||n.tmcBreakdown?.length?'tmc':'unknown');
 const matches=groups(q).filter(g=>g.id===id),group=matches.length===1?matches[0]:null;
 return {id,group,known:!!group,scope:group?(group.engine==='tmc'?'tmc':'detail'):'unknown',reason:group?'':n.name+': chưa xác định nhóm sản phẩm hợp lệ'};
}
function methods(q){const list=[...BASE_METHODS,...profiles(q).map(g=>['group:'+g.id,'Theo '+g.name])],selected=q.pricing?.selected;if(typeof selected==='string'&&/^group:grp-[A-Za-z0-9_-]{1,60}$/.test(selected)&&!list.some(m=>m[0]===selected))list.push([selected,'Phương án đã chọn không còn hợp lệ']);return [...new Map(list.map(m=>[m[0],m])).values()];}
function applicability(q,id){
 if(['detail','kg','competitor'].includes(id))return {applicable:true,reasons:[]};
 const target=id==='tmc'?'tmc':id.startsWith('group:')?id.slice(6):null,known=groups(q).some(g=>g.id===target),items=(q.products||[]).map(n=>resolve(q,n)),has=known&&items.some(x=>x.id===target&&x.known),missing=items.filter(x=>!x.known).map(x=>x.reason);
 return {applicable:has,reasons:[...(!has?[known?'Không có sản phẩm thuộc nhóm áp dụng phương án này':'Nhóm tính giá không còn tồn tại']:[]),...missing]};
}
function comparisonIds(q){
 const choices=Array.isArray(q.pricing?.comparisonMethods)?q.pricing.comparisonMethods:methods(q).map(m=>m[0]);
 return [...new Set(choices)].filter(id=>methods(q).some(m=>m[0]===id)&&applicability(q,id).applicable);
}
function setComparisons(q,ids){writable(q);if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'||!methods(q).some(m=>m[0]===id)))throw Error('Cách so sánh không hợp lệ');q.pricing.comparisonMethods=[...new Set(ids)];}
function assign(q,nodeId,groupId){writable(q);const n=q.products.find(n=>n.id===nodeId);if(!n)throw Error('Không tìm thấy sản phẩm');if(groupId!=='unknown'&&!groups(q).some(g=>g.id===groupId))throw Error('Nhóm không tồn tại');n.priceGroupId=groupId;n.tmcScope=groupId==='unknown'?'unknown':groupId==='tmc'?'tmc':'detail';}
function validateGroup(g){
 if(!g||!/^grp-[A-Za-z0-9_-]{1,60}$/.test(g.id)||!String(g.name||'').trim()||g.engine!=='formula')throw Error('Nhóm cần mã grp-…, tên và cách tính công thức');
 if(!String(g.source||'').trim()||!String(g.formula||'').trim())throw Error('Cần công thức giá và căn cứ của nhóm');
 if(!Array.isArray(g.parameters)||g.parameters.length>30)throw Error('Tham số nhóm chưa hợp lệ');
 const names=new Set(KEYS),vars=Object.fromEntries(KEYS.map(k=>[k,1]));
 for(const p of g.parameters){if(!/^P_[A-Z][A-Z0-9_]{0,28}$/.test(p.key)||names.has(p.key)||!valid(p.value)||!String(p.unit||'').trim()||!String(p.name||'').trim())throw Error('Tham số cần mã P_… không trùng, tên, đơn vị và giá trị số');names.add(p.key);vars[p.key]=Number(p.value);}
 if(g.netConfirmed!==true)throw Error('Cần xác nhận các giá tiền trong tham số là chưa thuế');
 if(g.formula.length>500)throw Error('Công thức tối đa 500 ký tự');
 // Token validation is separate from evaluating real data (which may legitimately be zero).
 for(const token of g.formula.match(/[A-Za-z_][A-Za-z_0-9]*/g)||[])if(!names.has(token))throw Error('Biến chưa khai báo: '+token);
 try{C.formula(g.formula,vars);}catch(e){if(!e.message.includes('chia cho 0'))throw e;}
 return {...g,name:g.name.trim(),source:g.source.trim(),formula:g.formula.trim(),parameters:g.parameters.map(p=>({...p,value:Number(p.value)}))};
}
function saveGroup(q,input){writable(q);const g=validateGroup({...input,engine:'formula'}),list=q.pricing.productGroups||[],i=list.findIndex(x=>x.id===g.id);if(groups(q).some(x=>x.id!==g.id&&x.name===g.name))throw Error('Tên nhóm đã tồn tại');q.pricing.productGroups=i<0?[...list,g]:list.map(x=>x.id===g.id?g:x);return g;}
function removeGroup(q,id){writable(q);if(BUILTINS.some(g=>g.id===id))throw Error('Không xóa nhóm nền');if(q.products.some(n=>resolve(q,n).id===id)||q.pricing.selected==='group:'+id)throw Error('Nhóm đang dùng; đổi phân loại/phương án trước khi xóa');q.pricing.productGroups=(q.pricing.productGroups||[]).filter(g=>g.id!==id);q.pricing.comparisonMethods=(q.pricing.comparisonMethods||[]).filter(m=>m!=='group:'+id);}
function evaluate(group,r){
 const g=validateGroup(group),params=r.node.params||{},vars={Q:r.node.qty,KG:r.weight,AREA:r.area,COST:r.cost,DETAIL:r.suggestedUnit*r.node.qty};
 for(const k of ['L','W','H','T'])if(valid(params[k]))vars[k]=Number(params[k]);
 for(const p of g.parameters)vars[p.key]=Number(p.value);
 const total=C.formula(g.formula,vars);if(!Number.isFinite(total)||total<0)throw Error('Công thức nhóm phải cho tổng trước thuế không âm');
 if(!(r.node.qty>0))throw Error('Số lượng sản phẩm phải lớn hơn 0');
 return {formula:g.formula,source:g.source,vars,total,unit:Math.round(total/r.node.qty)};
}
const api={groups,profileErrors,resolve,methods,applicability,comparisonIds,setComparisons,assign,validateGroup,saveGroup,removeGroup,evaluate};
if(typeof module!=='undefined')module.exports=api;else root.TPGroupPrice=api;
})(typeof window!=='undefined'?window:globalThis);
