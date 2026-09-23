/* Quotation-owned nesting choices. Geometry and catalogue formulas remain unchanged. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const modes=['bounding','bounding-fixed','circle','right-triangle'];
const ids=rows=>rows.map(r=>r.id).sort();
function fingerprint(rows,spec,kerf){return JSON.stringify([spec.id,spec.shape,spec.stockL,spec.stockW,Number(kerf),rows.map(r=>[r.id,r.count,r.geometry.length,r.geometry.width,r.geometry.blankArea,...(r.geometry.polygon?[r.geometry.polygon]:[])]).sort((a,b)=>a[0].localeCompare(b[0]))]);}
// Accept only the former two-face area fingerprint; every physical input stays identical.
function matches(rows,spec,kerf,plan){
 const current=fingerprint(rows,spec,kerf);if(plan.fingerprint===current)return true;
 if(spec.shape!=='sheet'||!/^\s*2\s*\*/.test(spec.shapeDefinition?.blankSurface||''))return false;
 try{const old=JSON.parse(plan.fingerprint),now=JSON.parse(current);if(!Array.isArray(old[5])||old[5].length!==now[5].length)return false;
 for(let i=0;i<now[5].length;i++){const a=old[5][i],b=now[5][i],r=rows.find(r=>r.id===b[0]);if(a[4]===b[4])continue;
 if(!Number.isFinite(a[4])||!(b[4]>0)||Math.abs(a[4]-2*b[4])>1e-9||Math.abs(r.geometry.area-2*b[4])>1e-9)return false;a[4]=b[4];}
 return JSON.stringify(old)===current;
 }catch{return false;}
}
function validatePlans(plans){if(plans===undefined)return;if(!Array.isArray(plans)||plans.length>1000)throw Error('Danh sách phương án xếp phôi không hợp lệ');const seen=new Set();for(const p of plans){if(!p||!Array.isArray(p.rowIds)||!p.rowIds.length||p.rowIds.some(id=>typeof id!=='string'||seen.has(id))||new Set(p.rowIds).size!==p.rowIds.length||typeof p.fingerprint!=='string'||p.fingerprint.length>150000||!modes.includes(p.mode)||p.placements!==undefined&&(!Array.isArray(p.placements)||p.placements.length>500))throw Error('Phương án xếp phôi không hợp lệ hoặc trùng dòng');p.rowIds.forEach(id=>seen.add(id));}}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function triangles(poly){
 const points=poly.map(p=>[...p]),area=points.reduce((s,a,i)=>{const b=points[(i+1)%points.length];return s+a[0]*b[1]-a[1]*b[0];},0);if(area<0)points.reverse();const out=[];
 for(let i=points.length-1;i>=0&&points.length>3;i--)if(Math.abs(cross(points[(i+points.length-1)%points.length],points[i],points[(i+1)%points.length]))<1e-8)points.splice(i,1);
 while(points.length>3){let found=false;for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length];if(cross(a,b,c)<=1e-8)continue;if(points.some(p=>p!==a&&p!==b&&p!==c&&cross(a,b,p)>=-1e-8&&cross(b,c,p)>=-1e-8&&cross(c,a,p)>=-1e-8))continue;out.push([a,b,c]);points.splice(i,1);found=true;break;}if(!found)throw Error('Biên phôi không hợp lệ để sắp xếp');}
 out.push(points);return out;
}
function overlap(a,b){return triangles(a).some(t=>triangles(b).some(u=>{for(const poly of [t,u])for(let i=0;i<3;i++){const v=poly[i],w=poly[(i+1)%3],axis=[v[1]-w[1],w[0]-v[0]],len=Math.hypot(...axis),pa=t.map(p=>(p[0]*axis[0]+p[1]*axis[1])/len),pb=u.map(p=>(p[0]*axis[0]+p[1]*axis[1])/len);if(Math.min(Math.max(...pa),Math.max(...pb))-Math.max(Math.min(...pa),Math.min(...pb))<=1e-7)return false;}return true;}));}
function pointDistance(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],q=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-q*dx,p[1]-a[1]-q*dy);}
function separatedPolygons(a,b,kerf){if(overlap(a,b))return false;if(kerf<=1e-7)return true;for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++){const x=a[i],y=a[(i+1)%a.length],v=b[j],w=b[(j+1)%b.length];if(cross(x,y,v)*cross(x,y,w)<0&&cross(v,w,x)*cross(v,w,y)<0)return false;if(Math.min(pointDistance(x,v,w),pointDistance(y,v,w),pointDistance(v,x,y),pointDistance(w,x,y))+1e-7<kerf)return false;}return true;}
function outline(g,angle=0){angle=((angle%360)+360)%360;const pts=g.polygon||[[0,0],[g.length,0],[g.length,g.width],[0,g.width]],a=angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),r=pts.map(([x,y])=>[x*c-y*s,x*s+y*c]),x0=Math.min(...r.map(p=>p[0])),y0=Math.min(...r.map(p=>p[1]));return r.map(([x,y])=>[x-x0,y-y0]);}
function rightTriangle(g){if(!g.polygon||g.polygon.length!==3)return false;return g.polygon.some((a,i)=>{const b=g.polygon[(i+1)%3],c=g.polygon[(i+2)%3],u=[b[0]-a[0],b[1]-a[1]],v=[c[0]-a[0],c[1]-a[1]];return Math.abs(u[0]*v[0]+u[1]*v[1])<=Math.hypot(...u)*Math.hypot(...v)*1e-7;});}
function rowGeometry(g,mode){return mode==='right-triangle'&&!g.polygon?{...g,polygon:[[0,0],[g.length,0],[0,g.width]]}:g;}
function normalizedTriangle(g){if(!rightTriangle(g))return g;const a=g.polygon.find((a,i)=>{const b=g.polygon[(i+1)%3],c=g.polygon[(i+2)%3];return Math.abs(cross(a,b,[a[0]-(c[1]-a[1]),a[1]+c[0]-a[0]]))<=Math.hypot(b[0]-a[0],b[1]-a[1])*Math.hypot(c[0]-a[0],c[1]-a[1])*1e-7;}),b=g.polygon[(g.polygon.indexOf(a)+1)%3],angle=-Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI,poly=outline(g,angle);return {...g,length:Math.max(...poly.map(p=>p[0])),width:Math.max(...poly.map(p=>p[1])),polygon:poly};}
function choice(rows,spec,mode){
 if(!modes.includes(mode))throw Error('Chọn cách xếp phôi hợp lệ');
 if(spec.shape!=='sheet'&&mode!=='bounding')throw Error('Thanh chỉ xếp theo chiều dài');
 if(['circle','right-triangle'].includes(mode))for(const r of rows){const g=r.geometry,area=g.blankArea/r.count*1e6,expected=mode==='circle'?Math.PI*g.length*g.length/4:rightTriangle(g)?Math.abs(cross(...g.polygon))/2:g.length*g.width/2;
  if(g.polygon&&mode==='circle')throw Error('Biên đa giác không dùng cách xếp tấm tròn');
  if(mode==='circle'&&Math.abs(g.length-g.width)>1e-7||Math.abs(area-expected)>Math.max(1e-5,expected*1e-8))throw Error('Hình dạng/diện tích phôi không khớp cách xếp đã chọn');
  if(mode==='right-triangle'&&spec.shapeDefinition?.nesting!=='right-triangle'&&!rightTriangle(g))throw Error('Chỉ ghép cặp quy ước tam giác vuông đã khai; không suy đoán từ diện tích');
 }
 return {...spec,shapeDefinition:{...spec.shapeDefinition,nesting:mode}};
}
function available(rows,spec){return modes.filter(mode=>{try{choice(rows,spec,mode);return true;}catch(_){return false;}});}
function auto(rows,spec,kerf,mode){const selected=choice(rows,spec,mode);const layout=C.nest(mode==='right-triangle'?rows.map(r=>({...r,geometry:normalizedTriangle(r.geometry)})):rows,selected,kerf);if(['bounding','bounding-fixed'].includes(mode)&&available(rows,spec).includes('circle')){for(const stock of layout.stocks)for(const p of stock.placements)p.circle=true;layout.netUsed=rows.reduce((sum,r)=>sum+r.geometry.blankArea*1e6,0);layout.contourOffcut=Math.max(0,layout.used-layout.netUsed);layout.util=layout.purchased?layout.netUsed/layout.purchased:0;}return layout;}
function draft(rows,spec,kerf,mode){const layout=auto(rows,spec,kerf,mode),counts={};return layout.stocks.flatMap((s,stock)=>s.placements.map(p=>{const g=rowGeometry(rows.find(r=>r.id===p.rowId).geometry,mode);let angle=Math.abs(p.l-g.length)>1e-7?90:0;if(p.polygon){const target=p.polygon.map(([x,y])=>[x-p.x,y-p.y]);const base=outline(g),angles=[0,90,180,270,...base.flatMap((v,i)=>target.map((t,j)=>(Math.atan2(target[(j+1)%target.length][1]-t[1],target[(j+1)%target.length][0]-t[0])-Math.atan2(base[(i+1)%base.length][1]-v[1],base[(i+1)%base.length][0]-v[0]))*180/Math.PI))];angle=angles.find(a=>outline(g,a).every(v=>target.some(t=>Math.hypot(v[0]-t[0],v[1]-t[1])<1e-5)));if(angle===undefined)throw Error('Không chuyển được hướng phôi từ gợi ý');}return {rowId:p.rowId,index:counts[p.rowId]=(counts[p.rowId]??-1)+1,stock,x:p.x,y:p.y,rotate:angle===90,...(![0,90].includes(angle)?{angle}:{})};}));}
function manual(rows,spec,kerf,mode,placements){
 choice(rows,spec,mode);
 const sheet=spec.shape==='sheet',stockL=Number(spec.stockL),stockW=sheet?Number(spec.stockW):0;
 if(!Number.isFinite(kerf)||kerf<0||!Number.isFinite(stockL)||stockL<=0||sheet&&(!Number.isFinite(stockW)||stockW<=0))throw Error('Khổ mua/mạch cắt không hợp lệ');
 const total=rows.reduce((s,r)=>s+r.count,0);if(total>500||!Array.isArray(placements)||placements.length!==total)throw Error('Chỉnh tay cần đủ từng phôi, tối đa 500 phôi');
 const seen=new Set(),stocks=[],byId=new Map(rows.map(r=>[r.id,r]));let netUsed=0,used=0;
 for(const p of placements){const r=byId.get(p.rowId),key=p.rowId+':'+p.index;if(!r||!Number.isInteger(p.index)||p.index<0||p.index>=r.count||seen.has(key)||!Number.isInteger(p.stock)||p.stock<0||p.stock>=total||(p.angle===undefined?typeof p.rotate!=='boolean':!Number.isFinite(p.angle))||![p.x,p.y].every(Number.isFinite)||p.x<0||p.y<0)throw Error('Vị trí, tấm hoặc định danh phôi không hợp lệ');seen.add(key);
  if((p.angle??(p.rotate?90:0))%360!==0&&(!sheet||mode==='bounding-fixed'))throw Error('Phương án này không cho phép xoay');
  const angle=p.angle??(p.rotate?90:0),poly=sheet?outline(rowGeometry(r.geometry,mode),mode==='circle'?0:angle):null,l=sheet?Math.max(...poly.map(v=>v[0])):r.geometry.length,w=sheet?Math.max(...poly.map(v=>v[1])):0;
  if(p.x+l>stockL+1e-7||sheet&&p.y+w>stockW+1e-7||!sheet&&p.y!==0)throw Error('Phôi vượt ra ngoài khổ mua');
  const stock=stocks[p.stock]??={placements:[],free:[]};const piece={rowId:r.id,label:r.label,color:r.color,x:p.x,y:p.y,l,w,...(mode==='circle'?{circle:true}:sheet?{polygon:poly.map(([x,y])=>[p.x+x,p.y+y])}:{})};
  for(const q of stock.placements){const separated=sheet&&mode!=='circle'?separatedPolygons(piece.polygon,q.polygon,kerf):mode==='circle'?Math.hypot(piece.x+l/2-q.x-q.l/2,piece.y+w/2-q.y-q.w/2)+1e-7>=(l+q.l)/2+kerf:p.x+l+kerf<=q.x+1e-7||q.x+q.l+kerf<=p.x+1e-7||sheet&&(p.y+w+kerf<=q.y+1e-7||q.y+q.w+kerf<=p.y+1e-7);if(!separated)throw Error('Phôi chồng nhau hoặc chưa đủ khoảng cách mạch cắt');}
  stock.placements.push(piece);used+=sheet?l*w:l;netUsed+=sheet?r.geometry.blankArea/r.count*1e6:l;
 }
 if(Array.from({length:stocks.length},(_,i)=>stocks[i]).some(s=>!s))throw Error('Số thứ tự khổ mua phải liên tục, không để tấm/thanh trống');
 // Return only provably free rectangular regions outside piece envelopes and kerf.
 for(const s of stocks){if(!sheet){const end=Math.max(...s.placements.map(p=>p.x+p.l+kerf));s.remaining=Math.max(0,stockL-end);continue;}let free=[{x:0,y:0,l:stockL,w:stockW}];for(const p of s.placements){const a={x:Math.max(0,p.x-kerf),y:Math.max(0,p.y-kerf),r:Math.min(stockL,p.x+p.l+kerf),b:Math.min(stockW,p.y+p.w+kerf)};free=free.flatMap(f=>{const x=Math.max(f.x,a.x),y=Math.max(f.y,a.y),r=Math.min(f.x+f.l,a.r),b=Math.min(f.y+f.w,a.b);if(x>=r||y>=b)return [f];return [{x:f.x,y:f.y,l:f.l,w:y-f.y},{x:f.x,y:b,l:f.l,w:f.y+f.w-b},{x:f.x,y,l:x-f.x,w:b-y},{x:r,y,l:f.x+f.l-r,w:b-y}].filter(v=>v.l>1e-7&&v.w>1e-7);});}s.free=free;}
 const purchased=stocks.length*(sheet?stockL*stockW:stockL);if(sheet)used=netUsed;
 return {stocks,stockL,stockW,used,netUsed,purchased,util:used/purchased,manual:true,mode:mode==='circle'?'circle':undefined};
}
function apply(rows,spec,kerf,plan){if(!matches(rows,spec,kerf,plan)||JSON.stringify([...plan.rowIds].sort())!==JSON.stringify(ids(rows)))throw Error('Phương án xếp phôi đã cũ: kích thước, số lượng, khổ mua hoặc mạch cắt đã đổi. Mở Sắp xếp phôi để lập lại');return plan.placements?manual(rows,spec,kerf,plan.mode,plan.placements):auto(rows,spec,kerf,plan.mode);}
function make(rows,spec,kerf,mode,placements){const p={rowIds:ids(rows),fingerprint:fingerprint(rows,spec,kerf),mode,...(placements?{placements}: {})};apply(rows,spec,kerf,p);return p;}
const api={available,outline,rightTriangle,separatedPolygons,modes,ids,fingerprint,matches,validatePlans,auto,draft,manual,apply,make};C.nestingPlans=api;if(typeof module!=='undefined')module.exports=api;else root.TPNestingPlan=api;
})(typeof window!=='undefined'?window:globalThis);
