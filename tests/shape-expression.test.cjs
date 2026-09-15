'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),E=require('../shape-expression-core.js'),D=require('../definition-core.js');
const near=(a,b)=>A.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('shape expressions: function palette computes independently checked arithmetic and rounding',()=>{
  for(const [source,result]of [['MIN(4, 2, 8)',2],['MAX(4, 2, 8)',8],['SUM(4, 2, 8)',14],['AVG(2, 4, 9)',5],['ROUND(-1.25, 1)',-1.3],['ROUNDUP(-1.21, 1)',-1.3],['ROUNDDOWN(-1.29, 1)',-1.2],['CEIL(-1.2)',-1],['FLOOR(-1.2)',-2],['SQRT(81)',9],['ABS(-3)',3],['POW(3, 2)',9],['2^3^2',512],['-2^2',-4],['MOD(17, 5)',2],['DIV(17, 5)',3],['CLAMP(20, 0, 10)',10],['SIGN(-9)',-1],['SIN(PI()/2)',1],['COS(0)',1],['TAN(0)',0],['1000 / 2 + (20 * 3)',560]])near(E.formula(source,{}),result);
});
test('shape expressions: IF uses comparisons and evaluates only the selected branch',()=>{near(E.formula('IF(L >= 1000, MAX(L, 1200), 1 / 0)',{L:2000}),2000);near(E.formula('IF(L != 0, 10 / L, 0)',{L:0}),0);near(E.formula('IF(L == 1, 7, 9)',{L:1}),7);});
test('shape expressions: functions preserve dimensions and reject mismatched quantities',()=>{
  const dims={L:[0,1],W:[0,1],KM:[1,-1],N:[0,0]};
  for(const source of ['MAX(L, W)','ROUND(L, 2)','SQRT(POW(L, 2))','IF(L > 10, L, W)','CLAMP(L, 1, W)'])A.deepEqual(E.dimension(E.parse(source),dims).d,[0,1]);
  for(const source of ['L + KM','MIN(L, KM)','IF(N, L, KM)','SIN(L)','ROUND(L, W)','POW(L, N)'])A.throws(()=>E.dimension(E.parse(source),dims),/đơn vị|Số mũ/);
});
test('shape expressions: malformed input, unsafe access, unknown variables and invalid numeric domains fail',()=>{
  for(const source of ['globalThis.process.exit()','L.constructor','alert(1)','MIN()','ROUND(1,2,3)','IF(1,2)','L +','1;2','1 / 0','MOD(2, 0)','SQRT(-1)','POW(10, 400)','ROUND(1, 99)','CLAMP(2, 5, 1)'])A.throws(()=>E.formula(source,{L:1}));
  A.throws(()=>E.formula('MISSING',{}),/MISSING/);A.throws(()=>E.parse('('.repeat(21)+'1'+')'.repeat(21)),/sâu/);A.throws(()=>E.parse('1'.repeat(501)),/500/);
});
const bar=()=>({id:'BAR',name:'Thanh thử',base:'bar',fields:[{key:'L',name:'Dài',mode:'input',unit:'mm',sample:2000},{key:'KM',name:'Khối lượng trên mét',mode:'fixed',unit:'kg/m',sample:12},{key:'AM',name:'Diện tích trên mét',mode:'fixed',unit:'m²/m',sample:.6}],length:'ROUND(L, 0)',width:'0',mass:'KM',surface:'AM'});
test('shape trial: profile coefficients, count and actual cutting layout produce separate blank and purchased quantities',()=>{
  const v=D.trial(bar(),{count:4,stockL:6000});A.equal(v.g.weight,24);A.equal(v.totalKg,96);A.equal(v.stocks,2);A.equal(v.buyKg,144);near(v.totalArea,4.8);near(v.buyArea,7.2);
  A.equal(D.trial(bar(),{count:3,stockL:6000,kerf:0}).stocks,1);A.equal(D.trial(bar(),{count:3,stockL:6000,kerf:5}).stocks,2);
});
test('shape trial: sheet formulas with functions preserve physical stock calculations',()=>{
  const d={id:'SHEET',name:'Tấm thử',base:'sheet',fields:[{key:'L',mode:'input',unit:'mm',sample:1000},{key:'W',mode:'input',unit:'mm',sample:200},{key:'T',mode:'fixed',unit:'mm',sample:2}],length:'MAX(L, W)',width:'MIN(L, W)',mass:'ROUND(T / 1000 * RHO, 3)',surface:'1',blankMass:'PHOI_D * PHOI_R / 2000000 * KL_DV',blankSurface:'PHOI_D * PHOI_R / 2000000'};
  const v=D.trial(d,{count:3,stockL:1000,stockW:1000});near(v.totalKg,4.71);near(v.totalArea,.3);near(v.buyKg,15.7);near(v.buyArea,1);
});
test('shape trial: oversized parts, missing values and invalid count/kerf never yield a valid trial',()=>{
  for(const options of [{stockL:1000},{count:0},{count:1.5},{count:5001},{kerf:-1},{density:0},{inputs:{L:2000,KM:12}}])A.throws(()=>D.trial(bar(),options));
});
