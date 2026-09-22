const {test}=require('node:test'),A=require('node:assert/strict'),P=require('../polygon-core.js'),C=require('../core.js'),M=require('../model3d.js');
test('four-edge dimensions remain authoritative and explain impossible closure',()=>{
 const p={kind:'interior',sides:['C1','C2','C3','C4'],angles:['A1']};
 const valid=P.geometry(p,{C1:3746,C2:100,C3:3746,C4:100,A1:90});A.ok(Math.abs(valid.area-374600)<.01);
 A.throws(()=>P.geometry(p,{C1:3746,C2:100,C3:40,C4:2,A1:90}),e=>e.message.includes('C1 = 3746 mm')&&e.message.includes('A1 = 90°')&&e.message.includes('38 và 42 mm'));
 A.throws(()=>C.nest([],{shape:'sheet',stockL:0,stockW:0},0),e=>e.message.includes('chiều dài')&&e.message.includes('chiều rộng'));
});
