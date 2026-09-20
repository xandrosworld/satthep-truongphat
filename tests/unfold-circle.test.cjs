'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),D=require('../definition-core'),C=require('../core'),CV=require('../conventions-core'),ME=require('../material-estimate-core');
const near=(a,b)=>A.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const circle=()=>({id:'CIRCLE-QA',name:'Tròn thử',...D.sheetPreset('circle'),fields:[{key:'T',unit:'mm',mode:'fixed',sample:2},{key:'D',unit:'mm',mode:'input',sample:100}]});
function verify(v,kerf){let count=0,area=0;for(const s of v.layout.stocks){for(const [i,p]of s.placements.entries()){count++;area+=Math.PI*p.l*p.l/4;A.ok(p.x>=-1e-8&&p.y>=-1e-8&&p.x+p.l<=v.stockL+1e-8&&p.y+p.w<=v.stockW+1e-8);for(const q of s.placements.slice(i+1))A.ok(Math.hypot(p.x+p.l/2-q.x-q.l/2,p.y+p.w/2-q.y-q.w/2)+1e-7>=(p.l+q.l)/2+kerf);for(const f of s.free){const cx=p.x+p.l/2,cy=p.y+p.w/2,dx=cx-Math.max(f.x,Math.min(cx,f.x+f.l)),dy=cy-Math.max(f.y,Math.min(cy,f.y+f.w));A.ok(Math.hypot(dx,dy)+1e-7>=p.l/2);}}}A.equal(count,v.count);near(area/1e6,v.totalArea);near(v.allowance.netMeasure+v.allowance.shapeOffcut+v.allowance.stockOffcut,v.measure);}
test('D0 = D is computed, catalogued, expanded and versioned without changing old quotations',()=>{
 const db=C.seed(),d=D.saveShape(db,circle()),m=D.applyShape({id:'MAT',name:'Tròn',density:7850,unit:'m²',price:100,stockL:300,stockW:275},d,{T:2}),n=D.assign(D.draft('QA',8),m,db.rules);n.dims={D:100};db.quote.products=[{id:'P',kind:'product',name:'QA',qty:1,ops:[],children:[n]}];db.quote.kerf=0;
 A.deepEqual(D.info(m).input,['D']);A.equal(CV.entries({...db,shapeDefinitions:[d]},'parameters').find(x=>x.name==='D0').unit,'mm');
 const r=C.calculate(db),v=D.trial(d,{count:8,stockL:300,stockW:275});A.equal(r.groups[0].layout.stocks.length,1);near(r.rows[0].geometry.blankArea,8*Math.PI*.1*.1/4);near(r.rows[0].purchaseCost,8.25);
 const comparison=ME.comparisons(r,[n.id])[0];near(comparison.percent,v.allowance.percent);n.materialEstimate={method:'percent',percent:comparison.percent};near(C.calculate(db).rows[0].cost,8.25);
 const before=JSON.stringify(db.quote);D.saveShape(db,{...d,unfoldOutputs:[{...d.unfoldOutputs[0],formula:'D + 10'}]});A.equal(JSON.stringify(db.quote),before);near(C.calculate(JSON.parse(JSON.stringify(db))).rows[0].geometry.blankArea,r.rows[0].geometry.blankArea);
 A.ok(!D.expandedFormulas(d).blankSurface.includes('D0'));verify(v,0);
});
test('staggered circles reduce stock count vs bounding rectangles, respecting kerf and all stock edges',()=>{
 for(const [l,w,k]of [[300,275,0],[275,300,0],[306,282,3],[282,306,3]]){const v=D.trial(circle(),{stockL:l,stockW:w,count:8,kerf:k});A.equal(v.stocks,1);A.equal(v.layout.boundingStockCount,2);verify(v,k);}
 for(const count of [1,2,7,9,50])for(const kerf of [0,1,8])verify(D.trial(circle(),{stockL:340,stockW:320,count,kerf}),kerf);
});
test('mixed diameters preserve row identity and are never overlapped or grouped by diameter-only output',()=>{
 const d=circle(),m=D.applyShape({id:'M',density:7850,stockL:300,stockW:275},d,{T:2});A.deepEqual(D.stockProperties({...m,props:{T:2,D:100}}),{T:2});
 const rows=[100,60,40].map((diam,i)=>({id:'r'+i,label:'r'+i,count:5,geometry:D.geometry({spec:m,dims:{D:diam}},1)})),layout=C.nest(rows,m,2),totalArea=rows.reduce((s,r)=>s+r.geometry.blankArea*r.count,0);
 verify({layout,stockL:300,stockW:275,count:15,totalArea,measure:layout.purchased/1e6,allowance:{netMeasure:totalArea,shapeOffcut:layout.used/1e6-totalArea,stockOffcut:(layout.purchased-layout.used)/1e6}},2);
 for(const r of rows)A.equal(layout.stocks.flatMap(s=>s.placements).filter(p=>p.rowId===r.id).length,5);
});
test('dependent outputs support L0/W0/H0, regardless of declaration order, and reject cycles, aliases, invalid units',()=>{
 const d={id:'OUT',name:'Máng',...D.sheetPreset('rectangle'),unfoldOutputs:[{key:'W0',name:'Rộng khai triển',unit:'mm',formula:'W + 2 * H0'},{key:'H0',unit:'mm',formula:'W / 2'},{key:'L0',unit:'mm',formula:'L'}],length:'L0',width:'W0',blankSurface:'L0 * W0 / 1000000',blankMass:'L0 * W0 / 1000000 * KL_DV'};
 const v=D.trial(d);near(v.vars.W0,400);near(v.g.blankArea,.4);A.ok(!/\b[WLH]0\b/.test(D.expandedFormulas(d).blankSurface));
 for(const patch of [[{key:'D0',unit:'mm',formula:'D0'}],[{key:'A0',unit:'mm',formula:'B0'},{key:'B0',unit:'mm',formula:'A0'}],[{key:'D0',unit:'mm',formula:'T * T'}],[{key:'D',unit:'mm',formula:'D'}],[{key:'PHOI_D',unit:'mm',formula:'D'}],[{key:'D0',unit:'mm',formula:'MISSING'}]])A.throws(()=>D.validateShape({...circle(),unfoldOutputs:patch}));
 for(const patch of [{blankSurface:'D0 * D0 / 1000000'},{width:'D0 * 2'},{blankMass:'D0 * D0 / 1000000 * KL_DV'}])A.throws(()=>D.trial({...circle(),...patch}));
 A.throws(()=>D.trial(circle(),{stockL:50,stockW:100}));A.throws(()=>D.trial(circle(),{count:5001}));
});
test('legacy circle snapshots keep rectangle packing until explicitly updated',()=>{
 const d=circle();delete d.unfoldOutputs;Object.assign(d,{nesting:'bounding',length:'D',width:'D',blankSurface:'PI * D * D / 4000000',blankMass:'PI * D * D / 4000000 * KL_DV'});
 const v=D.trial(d,{count:8,stockL:300,stockW:275});A.equal(v.stocks,2);A.equal(v.layout.mode,undefined);A.equal(D.trial(circle(),{count:8,stockL:300,stockW:275}).stocks,1);
});
test('computed output formulas participate in server formula protection and locking records',()=>{
 const F=require('../server/formula-access.cjs'),d=circle(),record=F.records({shapeDefinitions:[d]})[0];A.ok(record.fields.some(x=>x.path==='unfoldOutputs.0.formula'&&x.value==='D'));
});

test('trapezoid and rhombus use physical area with conservative rectangular stock nesting',()=>{
 for(const [kind,area,kg,l,w] of [['trapezoid',.32,5.024,1000,400],['rhombus',.3,4.71,1000,600]]){
  const d={id:kind,...D.example(kind)},v=D.trial(d,{stockL:2000,stockW:1000,count:3,kerf:3});
  near(v.g.blankArea,area);near(v.g.weight,kg);near(v.g.length,l);near(v.g.width,w);near(v.totalArea,area*3);
  A.equal(d.nesting,'bounding');A.ok(v.measure>=v.totalArea);near(v.allowance.netMeasure+v.allowance.shapeOffcut+v.allowance.stockOffcut,v.measure);
  const saved=D.saveShape(C.seed(),d),m=D.applyShape({id:'MAT',density:7850},saved,{T:2});
  const n=D.assign(D.draft('shape',3),m,C.seed().rules);near(D.geometry(n,3).blankArea,area*3);
  A.ok(!/\b[LWH]0\b/.test(D.expandedFormulas(d).blankSurface));
 }
});
