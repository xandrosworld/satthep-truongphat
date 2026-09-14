const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../core.js'),M=require('../model3d.js'),R=require('../model3d-render.js');
const camera={yaw:-32,pitch:30,zoom:1};
const fixture=(shape,props)=>{const d=C.seed(),n=C.copy(d.quote.products[1].children[0].children[0]);n.spec.shape=shape;n.spec.props=props;return n;};
test('Studio: rendering is pure and topology is cached without changing quotation data',()=>{
  const d=C.seed(),snapshot=JSON.stringify(d),s=M.scene(d.quote.products[1]),before=JSON.stringify(s);
  assert.equal(R.topology(s),R.topology(s));const r=R.render(s,camera);assert.ok(r.faceCount>0);assert.match(r.html,/linearGradient/);assert.match(r.html,/model-ground/);
  assert.equal(JSON.stringify(s),before);assert.equal(JSON.stringify(d),snapshot);
});
test('Studio: all measurement endpoints encode the actual stated millimetres',()=>{
  for(const p of C.seed().quote.products)for(const n of C.flatten([p]))for(const unfolded of [false,true]){
    const s=M.scene(n,{unfolded});for(const m of s.measurements)assert.ok(Math.abs(Math.hypot(...m.a.map((v,i)=>v-m.b[i]))-m.value)<1e-7,m.key);
  }
  const n=C.seed().quote.products[0].children[0].children[0],s=M.scene(n,{unfolded:true});assert.equal(s.measurements.find(m=>m.key==='T').value,1.5);assert.equal(s.measurements.find(m=>m.key==='W').value,430);
});
test('Studio: hollow end normals point outwards, preserving visible openings',()=>{
  for(const [shape,props]of [['box',{W:40,H:60,T:2}],['pipe',{D:60,T:2}]]){
    const s=M.scene(fixture(shape,props));for(const f of R.topology(s).filter(f=>f.points.every(p=>p[0]===f.points[0][0])))assert.ok(f.normal[0]*f.points[0][0]>0);
  }
});
test('Studio: 128-segment round profiles have less than 0.1% nominal area error',()=>{
  const n=fixture('pipe',{D:60,T:2}),s=M.scene(n),caps=s.meshes[0].faces.filter(f=>f.every(p=>p[0]===s.bounds.max[0]));assert.equal(caps.length,128);
  const area=caps.reduce((sum,f)=>sum+Math.abs(f.reduce((a,p,i)=>{const q=f[(i+1)%f.length];return a+p[1]*q[2]-q[1]*p[2];},0))/2,0);assert.ok(Math.abs(area/(Math.PI*(30**2-28**2))-1)<.001);
});
test('Studio: dimension labels never overlap and disappear when disabled',()=>{
  const s=M.scene(C.seed().quote.products[1]),r=R.render(s,camera);assert.equal(r.dimensions.length,3);
  for(let i=0;i<r.dimensions.length;i++)for(let j=i+1;j<r.dimensions.length;j++){const a=r.dimensions[i].box,b=r.dimensions[j].box;assert.ok(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y);}
  assert.equal(R.render(s,camera,{dimensions:false}).dimensions.length,0);
});
test('Studio: orthographic presets and zoom produce finite paths; end-on pipe retains diameter',()=>{
  const s=M.scene(fixture('pipe',{D:60,T:2}));for(const [yaw,pitch]of [[-32,30],[0,0],[90,0],[0,90],[-32,-30]])for(const zoom of [.5,1,4]){const r=R.render(s,{yaw,pitch,zoom});assert.ok(r.faceCount>0);assert.doesNotMatch(r.html,/NaN|Infinity/);}
  assert.equal(R.render(s,{yaw:90,pitch:0,zoom:1}).dimensions.find(m=>m.key==='Ø').value,60);
});
test('Studio: internal ids are escaped and context selection has distinct material shading',()=>{
  const s=M.scene(fixture('box',{W:40,H:60,T:2}));s.meshes[0].id='a"<b';const normal=R.render(s,camera),context=R.render(s,camera,{context:true,selectedIds:[s.meshes[0].id]});assert.match(context.html,/a&quot;&lt;b/);assert.notEqual(context.html,normal.html);
});
