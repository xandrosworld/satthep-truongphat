'use strict';
const C=require('../core.js'),T=require('../technical-core.js');
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const settings=['operationColumns','kerf','nestingPlans','remnantMode','remnantSelections','request','customer','project'];
const value=n=>{const v=C.copy(n);delete v.children;return v;};
function describe(before,after){
 const a=C.flatten(before.quote.products),b=C.flatten(after.quote.products),ids=[...new Set([...a,...b].map(n=>n.id))];
 const rows=ids.filter(id=>!equal(a.find(n=>n.id===id)&&value(a.find(n=>n.id===id)),b.find(n=>n.id===id)&&value(b.find(n=>n.id===id)))).map(id=>({id,name:b.find(n=>n.id===id)?.name||a.find(n=>n.id===id)?.name,kind:!a.some(n=>n.id===id)?'add':!b.some(n=>n.id===id)?'remove':'edit'}));
 const topology=ns=>ns.map(n=>({id:n.id,children:topology(n.children||[])}));
 const structural=!equal(topology(before.quote.products),topology(after.quote.products));
 if(structural&&!rows.length)rows.push({id:before.quote.products[0].id,name:'Thứ tự cấu thành',kind:'edit'});
 if(settings.some(k=>!equal(before.quote[k],after.quote[k]))||(before.quote.ratesSnapshot||[]).some(r=>{const next=after.quote.ratesSnapshot.find(x=>x.id===r.id);return next&&!equal(r,next)&&!r.id.startsWith('production-price-');}))rows.push({id:'$settings',name:'Đầu vào, khai triển và định mức dùng chung',kind:'settings'});
 return {rows,structural};
}
function mergeDocument(base,input,fail,machine){
 const original=C.copy(base);original.quote.status='draft';let d;
 try{d=T.merge(original,input,original);}catch(e){fail(400,e.message);}
 if(d.quote.products.length!==1||d.quote.products[0].id!==base.quote.products[0].id||d.quote.products[0].qty!==base.quote.products[0].qty)fail(400,'Giữ nguyên sản phẩm và số lượng lệnh; dùng chia lô để thay đổi phạm vi sản xuất');
 const nodes=C.flatten(d.quote.products);if(nodes.length>2000||new Set(nodes.map(n=>n.id)).size!==nodes.length)fail(400,'Cấu thành quá lớn hoặc trùng mã dòng');
 for(const n of nodes){if(!['product','component','material'].includes(n.kind)||!Number.isFinite(n.qty)||n.qty<=0)fail(400,'Loại dòng hoặc số lượng không hợp lệ');for(const op of n.ops||[])if(op.machineId){const m=machine(op.machineId);if(!m||m.active===false)fail(400,'Máy không tồn tại hoặc đã ngừng sử dụng');op.machine=m.name;}}
 d.quote.status=base.quote.status;return d;
}
function apply(base,proposal,selection,fail){
 const diff=describe(base,proposal),all=diff.rows.map(r=>r.id),out=C.copy(base);
 if(diff.structural&&all.some(id=>!selection.includes(id)))fail(409,'Thêm, bỏ hoặc di chuyển cấu thành cần duyệt cùng các mục liên quan để giữ đầy đủ cấu trúc');
 if(diff.structural)out.quote.products=C.copy(proposal.quote.products);
 else{const a=C.flatten(out.quote.products),b=C.flatten(proposal.quote.products);for(const id of selection){if(id==='$settings')continue;const dest=a.find(n=>n.id===id),src=b.find(n=>n.id===id);if(!dest||!src)fail(409,'Mục điều chỉnh không còn trong hồ sơ');const children=dest.children;for(const k of Object.keys(dest))delete dest[k];Object.assign(dest,C.copy(src),{children});}}
 if(selection.includes('$settings'))for(const k of settings){if(proposal.quote[k]===undefined)delete out.quote[k];else out.quote[k]=C.copy(proposal.quote[k]);}
 // Copy only rates used by approved nodes; shared recipe edits are an explicit review item.
 const ids=new Set(C.flatten(out.quote.products).filter(n=>selection.includes(n.id)).flatMap(n=>(n.ops||[]).map(o=>o.id)));
 for(const r of proposal.quote.ratesSnapshot||[])if(selection.includes('$settings')||ids.has(r.id)&&(!out.quote.ratesSnapshot.some(x=>x.id===r.id)||r.id.startsWith('production-price-'))){const i=out.quote.ratesSnapshot.findIndex(x=>x.id===r.id);if(i<0)out.quote.ratesSnapshot.push(C.copy(r));else out.quote.ratesSnapshot[i]=C.copy(r);}
 if(!selection.includes('$settings')){const fields=['materialId','spec','qty','dims','params','rule','ruleSpec','productionBlank','dimensionLinks','paramLinks'],old=C.flatten(base.quote.products),changed=C.flatten(out.quote.products).some(n=>{const prev=old.find(x=>x.id===n.id);return !prev||fields.some(k=>!equal(prev[k],n[k]));});if(changed||diff.structural){out.quote.nestingPlans=[];out.quote.remnantSelections={};}}
 return out;
}
// Keep approved route overrides unless this proposal actually changes the same field.
function reconcileRoute(previousSource,nextSource,actual){
 const prior=new Map(previousSource.map(o=>[o.id,o])),next=new Map(nextSource.map(o=>[o.id,o]));
 const result=actual.flatMap(o=>{const before=prior.get(o.id),after=next.get(o.id);if(!before)return [o];if(!after)return [];const merged={...o};for(const k of Object.keys(after))if(!equal(before[k],after[k]))merged[k]=after[k];next.delete(o.id);return [merged];});
 for(const [id,o]of next)if(!prior.has(id))result.push(o);
 return result.map((o,i)=>({...o,sequence:i+1}));
}
module.exports={describe,mergeDocument,apply,reconcileRoute};
