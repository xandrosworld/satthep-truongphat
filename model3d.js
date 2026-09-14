/* Nominal geometry in millimetres. No inventory, quotation or DOM mutations. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const rectangle=(w,h)=>[[-h/2,-w/2],[-h/2,w/2],[h/2,w/2],[h/2,-w/2]];
function extrusion(length,outer,inner){
  const faces=[],at=(x,p)=>[x,p[0],p[1]],a=-length/2,b=length/2;
  for(let i=0;i<outer.length;i++){const j=(i+1)%outer.length;faces.push([at(a,outer[i]),at(b,outer[i]),at(b,outer[j]),at(a,outer[j])]);
    if(inner){faces.push([at(a,inner[j]),at(b,inner[j]),at(b,inner[i]),at(a,inner[i])]);for(const x of [a,b]){const cap=[at(x,outer[i]),at(x,outer[j]),at(x,inner[j]),at(x,inner[i])];faces.push(x===a?cap:cap.reverse());}}}
  if(!inner)faces.push(outer.map(p=>at(a,p)),outer.slice().reverse().map(p=>at(b,p)));
  return faces;
}
const move=(faces,x=0,y=0,z=0)=>faces.map(f=>f.map(p=>[p[0]+x,p[1]+y,p[2]+z]));
const cuboid=(l,h,w,x=0,y=0,z=0)=>move(extrusion(l,rectangle(w,h)),x,y,z);
function bounds(faces){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const f of faces)for(const p of f)for(let i=0;i<3;i++){min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);}if(!faces.length)return {min:[0,0,0],max:[0,0,0],size:[0,0,0]};return {min,max,size:max.map((v,i)=>v-min[i])};}
function formedRule(n){const rule=n.ruleSpec;if(n.spec.shape!=='sheet'||!rule)return '';const l=rule.length.replace(/\s/g,''),w=rule.width.replace(/\s/g,'');if(l==='L'&&w==='W+2*H+2*F')return 'tray';if(l==='L'&&w==='W+2*F')return 'cover';return '';}
function material(n,unfolded=false){
  const m=n.spec;if(m.shape==='piece')return {faces:[],kind:'unit',note:'Vật tư theo '+m.unit+', chưa có kích thước hình học.',dimensions:[]};
  const g=C.geometry(n,1),p=m.props,L=g.length,{W,H,T,D,TF=T}=p,d={...n.dims,...p},formed=formedRule(n);
  let faces=[],kind=C.shapes[m.shape].name,note='Hình học danh nghĩa theo mã và kích thước nhập. Chưa mô phỏng dung sai, bán kính góc hoặc mối hàn.';
  const dimensions=[['Dài',L],...Object.entries(p).map(([k,v])=>[k,v])];
  if(m.shape==='sheet'){
    if(formed&&!unfolded){
      if(!(d.W>0)||!(d.F>=0)||formed==='tray'&&!(d.H>=0))throw Error('Kích thước thành hình W/H/F chưa hợp lệ');
      if(formed==='tray'){
        faces=cuboid(L,T,d.W);for(const sign of [-1,1]){if(d.H>0)faces.push(...cuboid(L,d.H,T,0,d.H/2,sign*d.W/2));if(d.F>0)faces.push(...cuboid(L,T,d.F,0,d.H,sign*(d.W+d.F)/2));}
        kind='Thân máng thành hình';dimensions.splice(1,0,['Rộng',d.W],['Cao',d.H],['Mép',d.F]);
      }else{faces=cuboid(L,T,d.W);if(d.F>0)for(const sign of [-1,1])faces.push(...cuboid(L,d.F,T,0,-d.F/2,sign*d.W/2));kind='Nắp thành hình';dimensions.splice(1,0,['Rộng',d.W],['Mép',d.F]);}
      note='Thành hình danh nghĩa theo mẫu gấp. Chưa xét bán kính chấn/bù chấn; không phải bản vẽ chế tạo.';
    }else{faces=cuboid(L,T,g.width);kind=formed?'Phôi khai triển':'Phôi tấm';dimensions.splice(1,0,['Rộng khai triển',g.width]);if(n.ruleSpec.width.replace(/\s/g,'')!=='W'&&!formed)note='Hiển thị phôi theo công thức khai triển. Công thức này chưa có cấu hình hình dạng sau gia công.';}
  }else if(m.shape==='box')faces=extrusion(L,rectangle(W,H),rectangle(W-2*T,H-2*T));
  else if(['pipe','round'].includes(m.shape)){const ring=r=>Array.from({length:128},(_,i)=>[Math.sin(i*Math.PI/64)*r,Math.cos(i*Math.PI/64)*r]);faces=extrusion(L,ring(D/2),m.shape==='pipe'?ring(D/2-T):undefined);}
  else if(m.shape==='solid')faces=extrusion(L,rectangle(W,H));
  else if(m.shape==='angle'){if(T>=Math.min(W,H))throw Error('Chiều dày góc phải nhỏ hơn các cạnh tiết diện');faces=extrusion(L,[[0,0],[0,W],[T,W],[T,T],[H,T],[H,0]].map(([y,z])=>[y-H/2,z-W/2]));}
  else if(['u','c'].includes(m.shape))faces=extrusion(L,[[0,0],[0,W],[T,W],[T,T],[H-T,T],[H-T,W],[H,W],[H,0]].map(([y,z])=>[y-H/2,z-W/2]));
  else if(['h','i'].includes(m.shape))faces=extrusion(L,[[0,0],[0,W],[TF,W],[TF,(W+T)/2],[H-TF,(W+T)/2],[H-TF,W],[H,W],[H,0],[H-TF,0],[H-TF,(W-T)/2],[TF,(W-T)/2],[TF,0]].map(([y,z])=>[y-H/2,z-W/2]));
  else throw Error('Chưa có hình học cho dạng vật tư này');
  if(faces.flat(2).some(v=>!Number.isFinite(v)))throw Error('Kích thước hình học không hợp lệ');
  const box=bounds(faces),measurements=[{key:'L',value:L,a:[-L/2,box.min[1],box.max[2]],b:[L/2,box.min[1],box.max[2]]}];
  if(D)measurements.push({key:'Ø',value:D,a:[-L/2,-D/2,0],b:[-L/2,D/2,0]});
  else{const bent=!!formed&&!unfolded,width=m.shape==='sheet'?(bent?d.W:g.width):W,height=m.shape==='sheet'?(bent?(formed==='tray'?d.H:d.F):T):H;
    measurements.push({key:'W',value:width,a:[L/2,0,-width/2],b:[L/2,0,width/2]});
    if(height>0)measurements.push({key:m.shape==='sheet'&&!bent?'T':'H',value:height,a:[-L/2,bent&&formed==='tray'?0:bent&&formed==='cover'?-height:-height/2,-width/2],b:[-L/2,bent&&formed==='tray'?height:bent&&formed==='cover'?0:height/2,-width/2]});
  }
  return {faces,kind,note,dimensions,measurements,formed,unfolded:!!unfolded,bounds:box};
}
function collect(node){const rows=[];function walk(n,count){if(n.kind==='material')rows.push({node:n,count});else for(const c of n.children||[])walk(c,count*c.qty);}walk(node,1);return rows;}
function scene(node,{unfolded=false,exploded=false,limit=60}={}){
  const rows=collect(node),meshes=[],issues=[],units=[],geometric=[];
  for(const row of rows){if(row.node.spec.shape==='piece'){units.push(row);continue;}geometric.push(row);}
  const entries=geometric.slice(0,limit).flatMap(row=>{try{return [{...row,geometry:material(row.node,unfolded)}];}catch(e){issues.push(row.node.name+': '+e.message);return [];}});
  const add=(e,faces=e.geometry.faces,instance=0)=>meshes.push({id:e.node.id,instance,faces,name:e.node.name,code:e.node.materialId,count:e.count});
  let mode='parts',title='Sơ đồ cấu thành 3D',note='Mỗi dòng vật tư có hình học được biểu diễn bằng một mẫu. Vị trí tách rời để xem cấu thành, không phải vị trí lắp ghép.',measurements=[];
  const body=entries.find(e=>e.geometry.formed==='tray'),lid=entries.find(e=>e.geometry.formed==='cover'),bars=entries.filter(e=>e.node.spec.shape==='box');
  const trayTemplate=node.kind==='product'&&node.params&&node.model==='tray'&&entries.length===2&&body&&lid&&body.count===1&&lid.count===1&&!unfolded;
  const frameRoles=['H','L','W'].map(key=>bars.find(e=>e.node.paramLinks?.L===key));
  const frameTemplate=node.kind==='product'&&node.params&&node.model==='frame'&&entries.length===3&&bars.length===3&&bars.every(e=>e.count===4)&&frameRoles.every(Boolean)&&!unfolded;
  if(node.kind==='material'||entries.length===1){if(entries[0])add(entries[0]);if(node.kind==='material'||rows.length===1&&entries[0]?.count===1){mode='detail';title=entries[0]?.geometry.kind||'Chưa có hình học';note=entries[0]?.geometry.note||note;measurements=entries[0]?.geometry.measurements||[];}else{title='Chi tiết đại diện trong cấu thành';}}
  else if(!exploded&&trayTemplate){
    add(body);const gap=Math.max(10,body.node.dims.H*.2);add(lid,move(lid.geometry.faces,0,body.node.dims.H+lid.node.dims.F+gap,0));mode='template';title='Máng & nắp theo mẫu';note='Nắp được nâng lên để nhìn rõ thân. Vị trí theo mẫu minh họa; chưa thể hiện bulông, gioăng hay chi tiết lắp đặt.';measurements=body.geometry.measurements.map(m=>({...m,key:m.key+' thân'}));
  }else if(!exploded&&frameTemplate){
    const [vertical,longitudinal,depth]=frameRoles,H=vertical.geometry.bounds.size[0],L=longitudinal.geometry.bounds.size[0],W=depth.geometry.bounds.size[0];
    const orient=(faces,axis)=>faces.map(f=>f.map(([x,y,z])=>axis==='y'?[-y,x,z]:axis==='z'?[-z,y,x]:[x,y,z]));
    let i=0;for(const x of [-L/2,L/2])for(const z of [-W/2,W/2])add(vertical,move(orient(vertical.geometry.faces,'y'),x,0,z),i++);
    i=0;for(const y of [-H/2,H/2])for(const z of [-W/2,W/2])add(longitudinal,move(longitudinal.geometry.faces,0,y,z),i++);
    i=0;for(const y of [-H/2,H/2])for(const x of [-L/2,L/2])add(depth,move(orient(depth.geometry.faces,'z'),x,y,0),i++);
    mode='template';title='Khung theo mẫu lắp ghép';note='12 thanh theo cấu thành và chiều dài nhập. Đường đo là chiều dài thanh theo từng trục, không phải kích thước bao khung. Mối nối/vị trí theo mẫu minh họa.';
    measurements=[{key:'L thanh',value:L,a:[-L/2,-H/2,W/2],b:[L/2,-H/2,W/2]},{key:'H thanh',value:H,a:[-L/2,-H/2,W/2],b:[-L/2,H/2,W/2]},{key:'W thanh',value:W,a:[L/2,-H/2,-W/2],b:[L/2,-H/2,W/2]}];
  }else{
    const gap=Math.max(20,...entries.map(e=>Math.max(e.geometry.bounds.size[1],e.geometry.bounds.size[2])*.2));let z=0;
    for(const e of entries){const b=e.geometry.bounds;add(e,move(e.geometry.faces,-(b.min[0]+b.max[0])/2,-b.min[1],z-b.min[2]));z+=b.size[2]+gap;}
  }
  if(!meshes.length){mode='empty';title=units.length?'Vật tư chưa có dữ liệu hình học':'Chưa có chi tiết để dựng hình';note=units.length?'Các dòng đang tính theo đơn vị, không có kích thước/hình dạng để dựng 3D. Không tự gán mô hình từ tên vật tư.':'Thêm vật tư có hình dạng và kích thước để xem 3D.';}
  return {meshes,rows,units,issues,mode,title,note,measurements,canAssemble:!!(trayTemplate||frameTemplate),canUnfold:entries.length===1&&!!entries[0].geometry.formed,dimensions:mode==='detail'?entries[0]?.geometry.dimensions||[]:[],omitted:Math.max(0,geometric.length-limit),bounds:bounds(meshes.flatMap(m=>m.faces))};
}
const api={material,scene,bounds,extrusion,collect};if(typeof module!=='undefined')module.exports=api;else root.TP3D=api;
})(typeof window!=='undefined'?window:globalThis);
