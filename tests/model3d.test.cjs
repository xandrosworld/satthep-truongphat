const {test}=require('node:test'),assert=require('node:assert/strict'),C=require('../core.js'),M=require('../model3d.js');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function node(shape,props){const d=C.seed(),n=C.copy(d.quote.products[1].children[0].children[0]);Object.assign(n.spec,{shape,props});n.dims.L=1000;if(shape==='sheet'){n.rule='flat';n.ruleSpec=C.copy(d.rules[0]);n.dims.W=300;}return n;}
function capArea(g){return g.faces.filter(f=>f.every(p=>Math.abs(p[0]-500)<1e-9)).reduce((s,f)=>s+Math.abs(f.reduce((a,p,i)=>{const q=f[(i+1)%f.length];return a+p[1]*q[2]-q[1]*p[2];},0))/2,0);}
test('3D: sheet dimensions follow actual geometry, no default 260px substitute',()=>{
  const n=node('sheet',{T:1.5}),g=M.material(n);assert.deepEqual(g.bounds.size,[1000,1.5,300]);n.dims.L=1800;n.dims.W=450;assert.deepEqual(M.material(n).bounds.size,[1800,1.5,450]);
});
test('3D: box/solid/angle/U/C/H/I cap areas match nominal section used by costing',()=>{
  for(const [shape,props]of [['box',{W:40,H:60,T:2}],['solid',{W:40,H:60}],['angle',{W:40,H:60,T:4}],['u',{W:50,H:100,T:5}],['c',{W:50,H:100,T:5}],['h',{W:100,H:150,T:5,TF:8}],['i',{W:100,H:150,T:5,TF:8}]]){const n=node(shape,props),g=M.material(n);assert.deepEqual(g.bounds.size,[1000,props.H,props.W]);near(capArea(g),C.geometry(n,1).weight/n.spec.density*1e6);}
});
test('3D: round and hollow pipe have cylindrical segments and correct outer bounds',()=>{
  for(const shape of ['round','pipe']){const n=node(shape,{D:60,T:2}),g=M.material(n);assert.deepEqual(g.bounds.size,[1000,60,60]);assert.ok(g.faces.length>=32);const trueArea=C.geometry(n,1).weight/n.spec.density*1e6;assert.ok(Math.abs(capArea(g)/trueArea-1)<.01);}
});
test('3D: tube end caps are rings, not filled solid rectangles',()=>{
  const g=M.material(node('box',{W:40,H:40,T:2})),caps=g.faces.filter(f=>f.every(p=>p[0]===500));assert.equal(caps.length,4);near(capArea(g),304);for(const face of caps)assert.ok(face.every(p=>Math.abs(p[1])>=18||Math.abs(p[2])>=18));
});
test('3D: formed tray and unfolded blank share real parameters and include folded flanges',()=>{
  const d=C.seed(),n=d.quote.products[0].children[0].children[0],formed=M.material(n),flat=M.material(n,true);assert.equal(formed.formed,'tray');assert.ok(formed.faces.length>flat.faces.length);assert.deepEqual(flat.bounds.size,[2000,1.5,430]);assert.ok(formed.dimensions.some(([k,v])=>k==='Mép'&&v===15));C.applyParam(d.quote.products[0],'W',400);assert.deepEqual(M.material(n,true).bounds.size,[2000,1.5,530]);
});
test('3D: custom unfolding formula does not invent a fabricated folded shape',()=>{
  const d=C.seed(),n=d.quote.products[0].children[0].children[0];n.ruleSpec.width='W+200';const g=M.material(n);assert.equal(g.formed,'');assert.deepEqual(g.bounds.size,[2000,1.5,500]);assert.match(g.note,/chưa có cấu hình/);
});
test('3D: known frame shows exactly 12 bars from three BOM rows; quantity is not multiplied by quote quantity',()=>{
  const d=C.seed(),p=d.quote.products[1],s=M.scene(p);assert.equal(s.mode,'template');assert.equal(s.meshes.length,12);for(const row of s.rows.filter(r=>r.node.spec.shape==='box'))assert.equal(s.meshes.filter(m=>m.id===row.node.id).length,4);p.qty=50;assert.equal(M.scene(p).meshes.length,12);assert.equal(M.scene(p,{exploded:true}).meshes.length,3);
});
test('3D: tray/lid assembly includes both pieces; changing parameters updates geometry',()=>{
  const p=C.seed().quote.products[0],s=M.scene(p);assert.equal(s.mode,'template');assert.equal(s.meshes.length,2);const old=s.bounds.size;C.applyParam(p,'W',500);assert.notDeepEqual(M.scene(p).bounds.size,old);
});
test('3D: arbitrary product includes every geometric row, never substitutes its first material for the whole product',()=>{
  const d=C.seed(),p=d.library.at(-1),s=M.scene(p);assert.equal(s.mode,'parts');assert.equal(s.meshes.length,1);assert.equal(s.units.length,1);assert.notEqual(s.mode,'template');const second=C.cloneNode(p.children[0]);second.spec.shape='pipe';second.spec.props={D:60,T:2};p.children.push(second);const r=M.scene(p);assert.equal(r.mode,'parts');assert.equal(r.meshes.length,2);assert.match(r.note,/không phải vị trí lắp ghép/);
});
test('3D: empty/consumable products show explicit missing geometry, not a default tray',()=>{
  const p={id:'empty',kind:'product',model:'tray',children:[]};assert.equal(M.scene(p).mode,'empty');assert.equal(M.scene(p).meshes.length,0);p.children=[C.seed().quote.products[0].children[2]];assert.equal(M.scene(p).mode,'empty');assert.equal(M.scene(p).units.length,1);
});
test('3D: invalid geometry has actionable errors, not infinite or fictitious meshes',()=>{
  const n=node('box',{W:40,H:40,T:25}),s=M.scene(n);assert.equal(s.meshes.length,0);assert.ok(s.issues.length>0);assert.throws(()=>M.material(node('angle',{W:40,H:60,T:50})),/Chiều dày/);
});
test('3D: model generation is pure and never changes prices or remnant choices',()=>{
  const d=C.seed(),snapshot=JSON.stringify(d),before=C.calculate(d);for(const n of C.flatten(d.quote.products))M.scene(n);assert.equal(JSON.stringify(d),snapshot);assert.deepEqual(C.calculate(d).total,before.total);
});
