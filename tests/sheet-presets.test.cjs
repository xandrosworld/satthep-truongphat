const {test}=require('node:test'),A=require('node:assert/strict'),D=require('../definition-core'),C=require('../core'),P=require('../pricing-core');
for(const [kind,area,bounds] of [['rectangle',.2,[1000,200]],['circle',Math.PI/4,[1000,1000]],['triangle',.1,[1000,200]]])test('sheet preset '+kind+': physical area, bounding stock, quotation and immutable version',()=>{
 const db=P.demoSeed(),def=D.saveShape(db,{id:'QA-SHEET',name:'QA sheet',...D.sheetPreset(kind)}),v=D.trial(def,{stockL:2000,stockW:1000,count:2});
 A.deepEqual([v.g.length,v.g.width],bounds);A.ok(Math.abs(v.g.blankArea-area)<1e-10);A.ok(Math.abs(v.g.weight-area*15.7)<1e-10);A.ok(v.buyArea>=v.totalArea);A.ok(v.buyKg>=v.totalKg);
 const m=D.applyShape({id:'QA-M',name:'QA material',density:7850,unit:'kg',price:100,stockL:2000,stockW:1000},def,{T:2}),n=D.assign(D.draft('QA',2),m,db.rules);
 // Match the declared samples rather than the generic draft's historical L/W defaults.
 n.dims=Object.fromEntries(def.fields.filter(x=>x.mode==='input').map(x=>[x.key,x.sample]));
 db.quote.products=[{id:'QA-P',kind:'product',name:'QA',qty:1,children:[n],ops:[]}];
 const before=JSON.stringify(db.quote),restored=JSON.parse(before),g=C.geometry(restored.products[0].children[0],2);A.ok(Math.abs(g.blankArea-2*area)<1e-10);A.ok(Math.abs(g.weight-2*area*15.7)<1e-10);
 D.saveShape(db,{...def,...D.sheetPreset('rectangle')});A.equal(JSON.stringify(db.quote),before);A.equal(n.spec.shapeDefinition.version,1);
});
