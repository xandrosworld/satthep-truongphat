/* Quotation-owned nesting choices. Geometry and catalogue formulas remain unchanged. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const modes=['bounding','bounding-fixed','circle','right-triangle'];
const ids=rows=>rows.map(r=>r.id).sort();
function fingerprint(rows,spec,kerf){return JSON.stringify([spec.id,spec.shape,spec.stockL,spec.stockW,Number(kerf),rows.map(r=>[r.id,r.count,r.geometry.length,r.geometry.width,r.geometry.blankArea]).sort((a,b)=>a[0].localeCompare(b[0]))]);}
function validatePlans(plans){if(plans===undefined)return;if(!Array.isArray(plans)||plans.length>1000)throw Error('Danh sách phương án xếp phôi không hợp lệ');const seen=new Set();for(const p of plans){if(!p||!Array.isArray(p.rowIds)||!p.rowIds.length||p.rowIds.some(id=>typeof id!=='string'||seen.has(id))||new Set(p.rowIds).size!==p.rowIds.length||typeof p.fingerprint!=='string'||p.fingerprint.length>150000||!modes.includes(p.mode)||p.placements!==undefined&&(!Array.isArray(p.placements)||p.placements.length>500))throw Error('Phương án xếp phôi không hợp lệ hoặc trùng dòng');p.rowIds.forEach(id=>seen.add(id));}}
function choice(rows,spec,mode){
 if(!modes.includes(mode))throw Error('Chọn cách xếp phôi hợp lệ');
 if(spec.shape!=='sheet'&&mode!=='bounding')throw Error('Thanh chỉ xếp theo chiều dài');
 if(['circle','right-triangle'].includes(mode))for(const r of rows){const g=r.geometry,area=g.blankArea/r.count*1e6,expected=mode==='circle'?Math.PI*g.length*g.length/4:g.length*g.width/2;
  if(mode==='circle'&&Math.abs(g.length-g.width)>1e-7||Math.abs(area-expected)>Math.max(1e-5,expected*1e-8))throw Error('Hình dạng/diện tích phôi không khớp cách xếp đã chọn');
  if(mode==='right-triangle'&&spec.shapeDefinition?.nesting!=='right-triangle')throw Error('Chỉ ghép cặp quy ước tam giác vuông đã khai; không suy đoán từ diện tích');
 }
 return {...spec,shapeDefinition:{...spec.shapeDefinition,nesting:mode}};
}
function auto(rows,spec,kerf,mode){return C.nest(rows,choice(rows,spec,mode),kerf);}
function draft(rows,spec,kerf,mode){const layout=auto(rows,spec,kerf,mode==='right-triangle'?'bounding':mode),counts={};return layout.stocks.flatMap((s,stock)=>s.placements.map(p=>({rowId:p.rowId,index:counts[p.rowId]=(counts[p.rowId]??-1)+1,stock,x:p.x,y:p.y,rotate:Math.abs(p.l-rows.find(r=>r.id===p.rowId).geometry.length)>1e-7})));}
function manual(rows,spec,kerf,mode,placements){
 choice(rows,spec,mode);if(mode==='right-triangle')throw Error('Chỉnh tay tam giác dùng khổ bao riêng; chọn xếp khổ bao trước');
 const sheet=spec.shape==='sheet',stockL=Number(spec.stockL),stockW=sheet?Number(spec.stockW):0;
 if(!Number.isFinite(kerf)||kerf<0||!Number.isFinite(stockL)||stockL<=0||sheet&&(!Number.isFinite(stockW)||stockW<=0))throw Error('Khổ mua/mạch cắt không hợp lệ');
 const total=rows.reduce((s,r)=>s+r.count,0);if(total>500||!Array.isArray(placements)||placements.length!==total)throw Error('Chỉnh tay cần đủ từng phôi, tối đa 500 phôi');
 const seen=new Set(),stocks=[],byId=new Map(rows.map(r=>[r.id,r]));let netUsed=0,used=0;
 for(const p of placements){const r=byId.get(p.rowId),key=p.rowId+':'+p.index;if(!r||!Number.isInteger(p.index)||p.index<0||p.index>=r.count||seen.has(key)||!Number.isInteger(p.stock)||p.stock<0||p.stock>=total||typeof p.rotate!=='boolean'||![p.x,p.y].every(Number.isFinite)||p.x<0||p.y<0)throw Error('Vị trí, tấm hoặc định danh phôi không hợp lệ');seen.add(key);
  if(p.rotate&&(!sheet||mode==='bounding-fixed'))throw Error('Phương án này không cho phép xoay');
  const l=p.rotate?r.geometry.width:r.geometry.length,w=sheet?(p.rotate?r.geometry.length:r.geometry.width):0;
  if(p.x+l>stockL+1e-7||sheet&&p.y+w>stockW+1e-7||!sheet&&p.y!==0)throw Error('Phôi vượt ra ngoài khổ mua');
  const stock=stocks[p.stock]??={placements:[],free:[]};const piece={rowId:r.id,label:r.label,color:r.color,x:p.x,y:p.y,l,w,...(mode==='circle'?{circle:true}:{})};
  for(const q of stock.placements){const separated=mode==='circle'?Math.hypot(piece.x+l/2-q.x-q.l/2,piece.y+w/2-q.y-q.w/2)+1e-7>=(l+q.l)/2+kerf:p.x+l+kerf<=q.x+1e-7||q.x+q.l+kerf<=p.x+1e-7||sheet&&(p.y+w+kerf<=q.y+1e-7||q.y+q.w+kerf<=p.y+1e-7);if(!separated)throw Error('Phôi chồng nhau hoặc chưa đủ khoảng cách mạch cắt');}
  stock.placements.push(piece);used+=sheet?l*w:l;netUsed+=sheet?r.geometry.blankArea/r.count*1e6:l;
 }
 if(Array.from({length:stocks.length},(_,i)=>stocks[i]).some(s=>!s))throw Error('Số thứ tự khổ mua phải liên tục, không để tấm/thanh trống');
 // Return only provably free rectangular regions outside piece envelopes and kerf.
 for(const s of stocks){if(!sheet){const end=Math.max(...s.placements.map(p=>p.x+p.l+kerf));s.remaining=Math.max(0,stockL-end);continue;}let free=[{x:0,y:0,l:stockL,w:stockW}];for(const p of s.placements){const a={x:Math.max(0,p.x-kerf),y:Math.max(0,p.y-kerf),r:Math.min(stockL,p.x+p.l+kerf),b:Math.min(stockW,p.y+p.w+kerf)};free=free.flatMap(f=>{const x=Math.max(f.x,a.x),y=Math.max(f.y,a.y),r=Math.min(f.x+f.l,a.r),b=Math.min(f.y+f.w,a.b);if(x>=r||y>=b)return [f];return [{x:f.x,y:f.y,l:f.l,w:y-f.y},{x:f.x,y:b,l:f.l,w:f.y+f.w-b},{x:f.x,y,l:x-f.x,w:b-y},{x:r,y,l:f.x+f.l-r,w:b-y}].filter(v=>v.l>1e-7&&v.w>1e-7);});}s.free=free;}
 const purchased=stocks.length*(sheet?stockL*stockW:stockL);if(mode==='circle')used=netUsed;
 return {stocks,stockL,stockW,used,netUsed,purchased,util:used/purchased,manual:true,mode:mode==='circle'?'circle':undefined};
}
function apply(rows,spec,kerf,plan){if(plan.fingerprint!==fingerprint(rows,spec,kerf)||JSON.stringify([...plan.rowIds].sort())!==JSON.stringify(ids(rows)))throw Error('Phương án xếp phôi đã cũ: kích thước, số lượng, khổ mua hoặc mạch cắt đã đổi. Mở Sắp xếp phôi để lập lại');return plan.placements?manual(rows,spec,kerf,plan.mode,plan.placements):auto(rows,spec,kerf,plan.mode);}
function make(rows,spec,kerf,mode,placements){const p={rowIds:ids(rows),fingerprint:fingerprint(rows,spec,kerf),mode,...(placements?{placements}: {})};apply(rows,spec,kerf,p);return p;}
const api={modes,ids,fingerprint,validatePlans,auto,draft,manual,apply,make};C.nestingPlans=api;if(typeof module!=='undefined')module.exports=api;else root.TPNestingPlan=api;
})(typeof window!=='undefined'?window:globalThis);
