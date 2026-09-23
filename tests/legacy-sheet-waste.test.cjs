const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../core.js'),D=require('../definition-core.js'),ME=require('../material-estimate-core.js');
function fixture(multiplier=2){const d=C.seed(),m=C.copy(d.materials.find(m=>m.shape==='sheet'));m.shapeDefinition={id:'legacy',name:'Sheet',base:'sheet',fields:[{key:'T',name:'Thickness',mode:'fixed',unit:'mm',sample:2},{key:'L',name:'Length',mode:'input',unit:'mm',sample:500},{key:'W',name:'Width',mode:'input',unit:'mm',sample:200}],length:'L',width:'W',mass:'RHO*T/1000',surface:'1',blankSurface:multiplier+'*L*W/1000000*DT_DV'};m.props={T:2};m.stockL=1000;m.stockW=1000;m.unit='kg';const n={id:'m',kind:'material',name:'Sheet',materialId:m.id,spec:m,qty:2,dims:{L:500,W:200},ops:[]};d.quote.products=[{id:'p',kind:'product',name:'Product',qty:3,ops:[],children:[n]}];d.quote.kerf=0;return {d,n};}
test('legacy two-face sheet formula uses one-layer area for nesting and waste at all quantities',()=>{const {d,n}=fixture(),before=JSON.stringify(d),r=C.calculate(d),g=r.groups[0];A.equal(r.rows[0].count,6);A.ok(Math.abs(r.rows[0].geometry.blankArea-.6)<1e-9);A.ok(Math.abs(r.rows[0].geometry.area-1.2)<1e-9);A.equal(ME.comparisons(r,[n.id])[0].error,undefined);A.equal(JSON.stringify(d),before);d.quote.remnantSelections={[g.signature]:g.remnants.map(x=>x.id)};const x=ME.comparisons(C.calculate(d),[n.id])[0];A.equal(x.error,undefined);A.ok(x.lossPercent<1e-8);A.ok(Math.abs(x.blankWeight+x.reusableWeight+x.remainingWeight-x.purchasedWeight)<1e-8);});
test('oversized arbitrary area and inconsistent mass still fail comparison',()=>{const {d,n}=fixture(3);A.match(ME.comparisons(C.calculate(d),[n.id])[0].error,/diện tích/);n.spec.shapeDefinition.blankSurface='2*L*W/1000000*DT_DV';n.spec.shapeDefinition.blankMass='L*W/1000000*KL_DV*2';A.match(ME.comparisons(C.calculate(d),[n.id])[0].error,/diện tích/);});

const N=require('../nesting-plan-core.js');
test('old two-face fingerprints recover without accepting changed physical inputs',()=>{
 const {d}=fixture(),g=C.calculate(d).groups[0];
 const plan=N.make(g.rows,g.spec,0,'bounding-fixed');
 const saved=JSON.parse(plan.fingerprint);saved[5].forEach(r=>r[4]*=2);plan.fingerprint=JSON.stringify(saved);
 d.quote.nestingPlans=[plan];A.equal(C.calculate(d).groups[0].error,undefined);
 A.throws(()=>N.apply(g.rows,{...g.spec,stockL:1200},0,plan),/đã cũ/);
 A.throws(()=>N.apply(g.rows,g.spec,1,plan),/đã cũ/);
 const changed=C.copy(g.rows);changed[0].count++;A.throws(()=>N.apply(changed,g.spec,0,plan),/đã cũ/);
 const bad=C.copy(plan),fp=JSON.parse(bad.fingerprint);fp[5][0][4]*=1.5;bad.fingerprint=JSON.stringify(fp);A.throws(()=>N.apply(g.rows,g.spec,0,bad),/đã cũ/);
 const manual=N.make(g.rows,g.spec,0,'bounding',N.draft(g.rows,g.spec,0,'bounding'));const mf=JSON.parse(manual.fingerprint);mf[5].forEach(r=>r[4]*=2);manual.fingerprint=JSON.stringify(mf);A.ok(N.apply(g.rows,g.spec,0,manual).manual);
 manual.placements[1]={...manual.placements[0],piece:manual.placements[1].piece};A.throws(()=>N.apply(g.rows,g.spec,0,manual));
});
