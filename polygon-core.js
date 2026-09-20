/* Explicit sheet contours. Side lengths alone determine a triangle, not a general polygon. */
(function(root){'use strict';
const symbols={PHOI_POLY_L:[0,1],PHOI_POLY_W:[0,1],PHOI_POLY_S:[0,2]};
function validate(p,dimensions){
 if(!p||!['triangle','regular','edges'].includes(p.kind)||!Array.isArray(p.sides)||p.sides.length<3||p.sides.length>10||new Set(p.sides).size!==p.sides.length||p.kind==='triangle'&&p.sides.length!==3)throw Error('Đa giác cần từ 3 đến 10 cạnh; tam giác cần đúng 3 cạnh');
 for(const key of p.sides)if(!dimensions[key]||dimensions[key][0]!==0||dimensions[key][1]!==1)throw Error('Cạnh đa giác cần ký hiệu kích thước mm: '+key);
 if(p.kind==='edges'){if(!Array.isArray(p.angles)||p.angles.length!==p.sides.length)throw Error('Khai góc hướng cho từng cạnh đa giác');for(const key of p.angles)if(!dimensions[key]||dimensions[key].some(v=>v!==0))throw Error('Góc hướng dùng tham số không đơn vị (độ): '+key);}
}
function geometry(p,vars){
 const sides=p.sides.map(k=>vars[k]);if(sides.some(x=>!Number.isFinite(x)||x<=0))throw Error('Kích thước các cạnh phải lớn hơn 0');
 const scale=Math.max(...sides),eps=Math.max(1e-7,scale*1e-7);let points;
 if(p.kind==='triangle'){
  const [a,b,c]=sides;if(a+b<=c+eps||a+c<=b+eps||b+c<=a+eps)throw Error('Ba cạnh không tạo thành tam giác: tổng hai cạnh phải lớn hơn cạnh còn lại');
  const x=(a*a+c*c-b*b)/(2*a),y=Math.sqrt(Math.max(0,c*c-x*x));points=[[0,0],[a,0],[x,y]];
 }else{
  if(p.kind==='regular'&&sides.some(v=>Math.abs(v-sides[0])>eps))throw Error('Đa giác đều cần các cạnh bằng nhau; chọn cạnh và góc hướng cho đa giác khác');
  const angles=p.kind==='regular'?sides.map((_,i)=>i*360/sides.length):p.angles.map(k=>vars[k]);
  if(angles.some(v=>!Number.isFinite(v)||v<0||v>360))throw Error('Góc hướng cạnh phải từ 0 đến 360 độ');
  points=[];let x=0,y=0;for(let i=0;i<sides.length;i++){points.push([x,y]);const a=angles[i]*Math.PI/180;x+=sides[i]*Math.cos(a);y+=sides[i]*Math.sin(a);}
  if(Math.hypot(x,y)>eps)throw Error('Các cạnh chưa khép kín; kiểm tra chiều dài và góc hướng (lệch '+Math.hypot(x,y).toFixed(4)+' mm)');
 }
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const on=(a,b,c)=>Math.abs(cross(a,b,c))<=eps*scale&&c[0]>=Math.min(a[0],b[0])-eps&&c[0]<=Math.max(a[0],b[0])+eps&&c[1]>=Math.min(a[1],b[1])-eps&&c[1]<=Math.max(a[1],b[1])+eps;
 for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++){if(j===i+1||i===0&&j===points.length-1)continue;const a=points[i],b=points[(i+1)%points.length],c=points[j],d=points[(j+1)%points.length];if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b))throw Error('Biên đa giác tự giao hoặc các cạnh chạm nhau');}
 for(let i=0;i<points.length;i++){const a=points[(i+points.length-1)%points.length],b=points[i],c=points[(i+1)%points.length];if(Math.abs(cross(a,b,c))<=eps*scale&&(b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1])<0)throw Error('Hai cạnh kề chồng ngược lên nhau');}
 const area=Math.abs(points.reduce((sum,a,i)=>{const b=points[(i+1)%points.length];return sum+a[0]*b[1]-b[0]*a[1];},0))/2;
 if(!(area>eps*scale))throw Error('Đa giác bị suy biến, không có diện tích hợp lệ');
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),length=Math.max(...xs)-x0,width=Math.max(...ys)-y0;
 const snap=v=>Math.round(v*1e8)/1e8;return {points:points.map(([x,y])=>[snap(x-x0),snap(width-(y-y0))]),length:snap(length),width:snap(width),area,sides};
}
function values(p,vars){const g=geometry(p,vars);return {PHOI_POLY_L:g.length,PHOI_POLY_W:g.width,PHOI_POLY_S:g.area};}
function preset(kind='triangle',count=3){
 count=kind==='triangle'?3:Number(count);if(!Number.isInteger(count)||count<3||count>10)throw Error('Số cạnh từ 3 đến 10');
 const fields=[{key:'T',name:'Chiều dày',mode:'fixed',unit:'mm',sample:2}],sides=[],angles=[],unfoldOutputs=[];
 for(let i=1;i<=count;i++){const key='C'+i,out='C0'+i;sides.push(out);fields.push({key,name:'Cạnh '+i,mode:'input',unit:'mm',sample:kind==='triangle'?[300,400,500][i-1]:300});unfoldOutputs.push({key:out,name:'Cạnh '+i+' khai triển',unit:'mm',formula:key});if(kind==='edges'){angles.push('G'+i);fields.push({key:'G'+i,name:'Góc hướng cạnh '+i+' (độ)',mode:'input',unit:'number',sample:(i-1)*360/count});}}
 const polygon={kind,sides,...(kind==='edges'?{angles}:{})};
 return {base:'sheet',blankShape:'sheet',blankShapeName:kind==='triangle'?'Tấm tam giác theo ba cạnh':kind==='regular'?'Tấm đa giác đều '+count+' cạnh':'Tấm đa giác '+count+' cạnh',nesting:'bounding',polygon,fields,unfoldOutputs,length:'PHOI_POLY_L',width:'PHOI_POLY_W',mass:'RHO * T / 1000',surface:'1',blankSurface:'PHOI_POLY_S / 1000000',blankMass:'PHOI_POLY_S / 1000000 * KL_DV',condition:'Khai cạnh theo thứ tự quanh biên. Diện tích theo biên thực; xếp các khổ bao có chừa mạch cắt, chưa ghép sát biên đa giác.'};
}
const api={symbols,validate,geometry,values,preset};if(typeof module!=='undefined')module.exports=api;else root.TPPolygon=api;
})(typeof window!=='undefined'?window:globalThis);
