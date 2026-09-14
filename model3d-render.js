/* Orthographic technical renderer: cached topology, studio shading and real dimensions. */
(function(root){
'use strict';
const cache=new WeakMap(),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),sub=(a,b)=>a.map((v,i)=>v-b[i]);
const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
const normalize=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function topology(scene){
  if(cache.has(scene))return cache.get(scene);const faces=[];
  for(const mesh of scene.meshes){const edges=new Map(),local=mesh.faces.map(points=>({points,normal:normalize(cross(sub(points[1],points[0]),sub(points[2],points[0]))),id:mesh.id,edges:[]}));
    for(const face of local)for(let i=0;i<face.points.length;i++){const a=face.points[i],b=face.points[(i+1)%face.points.length],key=[a.join(','),b.join(',')].sort().join('|');if(!edges.has(key))edges.set(key,{a,b,faces:[]});const edge=edges.get(key);edge.faces.push(face);face.edges.push(edge);}
    faces.push(...local);
  }cache.set(scene,faces);return faces;
}
function hull(points){
  const sorted=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]),turn=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const chain=points=>{const h=[];for(const p of points){while(h.length>1&&turn(h.at(-2),h.at(-1),p)<=0)h.pop();h.push(p);}return h;};
  const a=chain(sorted),b=chain(sorted.slice().reverse());return a.slice(0,-1).concat(b.slice(0,-1));
}
function render(scene,camera,{prefix='model',selectedIds=[],context=false,dimensions=true}={}){
  if(!scene.meshes.length)return {html:'',dimensions:[],faceCount:0};
  const rad=Math.PI/180,cy=Math.cos(camera.yaw*rad),sy=Math.sin(camera.yaw*rad),cp=Math.cos(camera.pitch*rad),sp=Math.sin(camera.pitch*rad);
  const rotate=([x,y,z])=>{const a=x*cy+z*sy,b=-x*sy+z*cy;return [a,y*cp-b*sp,y*sp+b*cp];};
  const projected=p=>{const r=rotate(p);return [r[0],-r[1],r[2]];},faces=topology(scene),coordinates=faces.flatMap(f=>f.points.map(projected));
  let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;for(const [x,y]of coordinates){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const scale=Math.min(450/Math.max(1,x1-x0),238/Math.max(1,y1-y0))*camera.zoom,cx=(x0+x1)/2,cy2=(y0+y1)/2;
  const screen=p=>{const q=projected(p);return [(q[0]-cx)*scale+300,(q[1]-cy2)*scale+186,q[2]];},xy=p=>p.slice(0,2).map(v=>v.toFixed(2)).join(','),selected=new Set(selectedIds),gradients=new Map();
  const keyLight=normalize([-.45,.78,.55]),fillLight=normalize([.75,.2,.45]);
  const normals=new Map(faces.map(f=>[f,rotate(f.normal)]));
  const visible=faces.filter(f=>normals.get(f)[2]>1e-8).map(f=>({...f,source:f,points:f.points.map(screen),z:f.points.reduce((s,p)=>s+projected(p)[2],0)/f.points.length})).sort((a,b)=>a.z-b.z);
  const color=(base,t)=>'rgb('+base.map(v=>Math.max(0,Math.min(255,Math.round(v*t)))).join(',')+')';
  const polygons=visible.map(f=>{
    const normal=normals.get(f.source),highlight=context&&selected.has(f.id),base=highlight?[226,160,79]:context?[189,202,215]:[156,184,209];
    const illumination=.42+.47*Math.max(0,dot(normal,keyLight))+.19*Math.max(0,dot(normal,fillLight))+.1*Math.pow(1-normal[2],3),band=Math.round(illumination*28)/28,key=(highlight?'selected':context?'muted':'steel')+band;
    if(!gradients.has(key))gradients.set(key,{id:prefix+'-g'+gradients.size,base,band});const gradient=gradients.get(key);
    const lines=f.edges.filter(edge=>edge.faces.length===1||edge.faces.some(other=>normals.get(other)[2]<=1e-8)||edge.faces.some(other=>dot(other.normal,f.normal)<.92)).map(edge=>'M'+xy(screen(edge.a))+'L'+xy(screen(edge.b))).join('');
    return `<g class="model-surface"><polygon data-mesh-id="${escape(f.id)}" points="${f.points.map(xy).join(' ')}" fill="url(#${gradient.id})" stroke="url(#${gradient.id})" stroke-width="0.6" stroke-linejoin="round"/>${lines?`<path class="model-feature-edge" d="${lines}" fill="none" stroke="${highlight?'#97642d':'#46647f'}" stroke-opacity=".78" stroke-width=".8" stroke-linejoin="round"/>`:''}</g>`;
  }).join('');
  let ground='';const studio=Math.abs(camera.pitch)>5&&Math.abs(camera.pitch)<85&&Math.abs(camera.yaw%90)>5;
  if(studio){
    const min=scene.bounds.min,size=scene.bounds.size,floor=min[1]-Math.max(1,size[1]*.04),shadow=hull(faces.flatMap(f=>f.points.map(p=>screen([p[0]+size[0]*.018,floor,p[2]+size[2]*.12]))));
    ground=`<g class="model-ground" opacity=".68"><path d="${shadow.map((p,i)=>(i?'L':'M')+xy(p)).join('')}Z" fill="#58718c" opacity=".18" filter="url(#${prefix}-shadow)"/></g>`;
  }
  const labels=[],boxes=[];
  if(dimensions)for(const m of scene.measurements||[]){
    const a=screen(m.a),b=screen(m.b),dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);if(length<27||[...a.slice(0,2),...b.slice(0,2)].some(v=>!Number.isFinite(v)))continue;
    if([a,b].some(p=>p[0]<28||p[0]>572||p[1]<48||p[1]>326))continue;
    let nx=-dy/length,ny=dx/length;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;if(nx*(mx-300)+ny*(my-186)<0){nx=-nx;ny=-ny;}
    const text=m.key+' '+Number(m.value).toLocaleString('vi-VN',{maximumFractionDigits:2})+' mm',width=text.length*7.4+18;let chosen;
    for(const offset of [25,43,61]){const x=Math.max(14+width/2,Math.min(586-width/2,mx+nx*offset)),y=Math.max(44,Math.min(341,my+ny*offset)),box={x:x-width/2,y:y-13,w:width,h:26};if(!boxes.some(r=>box.x<r.x+r.w+5&&box.x+box.w+5>r.x&&box.y<r.y+r.h+4&&box.y+box.h+4>r.y)){chosen={x,y,box,offset};break;}}
    if(!chosen)continue;boxes.push(chosen.box);const {offset,x,y}=chosen,aa=[a[0]+nx*offset,a[1]+ny*offset],bb=[b[0]+nx*offset,b[1]+ny*offset];
    const tick=p=>'M'+xy([p[0]-nx*3-dx/length*3,p[1]-ny*3-dy/length*3])+'L'+xy([p[0]+nx*3+dx/length*3,p[1]+ny*3+dy/length*3]);
    labels.push({key:m.key,value:m.value,text,box:chosen.box,html:`<g class="model-measure" data-dimension-label="${escape(m.key)}" data-measured-value="${m.value}"><path d="M${xy(a)}L${xy([aa[0]+nx*4,aa[1]+ny*4])}M${xy(b)}L${xy([bb[0]+nx*4,bb[1]+ny*4])}" stroke="#8ea3bc" stroke-width=".65" fill="none"/><path d="M${xy(aa)}L${xy(bb)}${tick(aa)}${tick(bb)}" stroke="#627d9e" stroke-width=".8" fill="none"/><rect x="${x-width/2}" y="${y-13}" width="${width}" height="26" rx="4" fill="#f8fbff" stroke="#d4dfed" stroke-width=".65"/><text x="${x}" y="${y+5}" text-anchor="middle" fill="#365b83" font-family="system-ui, sans-serif" font-size="14" font-weight="550">${escape(text)}</text></g>`});
  }
  const defs=`<defs><filter id="${prefix}-shadow" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>${[...gradients.values()].map(g=>`<linearGradient id="${g.id}" gradientUnits="userSpaceOnUse" x1="80" y1="30" x2="460" y2="350"><stop offset="0" stop-color="${color(g.base,g.band+.22)}"/><stop offset=".32" stop-color="${color(g.base,g.band+.06)}"/><stop offset=".68" stop-color="${color(g.base,g.band-.045)}"/><stop offset="1" stop-color="${color(g.base,g.band+.055)}"/></linearGradient>`).join('')}</defs>`;
  return {html:defs+ground+'<g class="model-object">'+polygons+'</g><g class="model-annotations">'+labels.map(x=>x.html).join('')+'</g>',dimensions:labels,faceCount:visible.length,scale};
}
const api={render,topology};if(typeof module!=='undefined')module.exports=api;else root.TP3DRender=api;
})(typeof window!=='undefined'?window:globalThis);
