const {test}=require('node:test'),A=require('node:assert/strict'),M=require('../inventory-mass-core.js'),D=require('../definition-core.js');
test('stock mass uses blank dimensions and only required mass variables, never sample geometry',()=>{
 const m={shape:'sheet',density:7930,props:{T:2},shapeDefinition:{...D.sheetPreset('trapezoid'),id:'test-shape',name:'Test'}};
 A.ok(Math.abs(M.weight(m,3000,1250)-59.475)<1e-9);A.equal(M.weight(m,2000,1000),31.72);
 A.throws(()=>M.weight({...m,density:undefined},3000,1250));
 A.throws(()=>M.weight({...m,shapeDefinition:{...m.shapeDefinition,mass:'RHO * H / 1000'}},3000,1250));
 A.equal(M.weight({...m,massOverride:{value:20,reason:'Certified'}},3000,1250),75);
 A.throws(()=>M.weight(m,3000,0));
});
