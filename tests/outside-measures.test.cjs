'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../core.js'),P=require('../pricing-core.js'),M=require('../manufacturing-core.js'),T=require('../technical-core.js');
function fixture(){const d=P.demoSeed(),source=C.flatten(d.quote.products).find(n=>n.kind==='material'&&n.spec.shape==='sheet'),leaf=id=>({...C.copy(source),id,name:id,qty:2,paramLinks:{},dimensionLinks:{},dims:{L:1000,W:200,H:0,F:0},rule:'flat',ruleSpec:{id:'flat',name:'Flat',shape:'sheet',length:'L',width:'W'},materialEstimate:{method:'percent',percent:3},ops:[]});d.quote.products=[{id:'product',kind:'product',name:'Product',qty:3,children:[{id:'component',kind:'component',name:'Component',qty:2,children:[leaf('a'),leaf('b')],ops:[]},leaf('direct')],ops:[]}];return d;}
const run=d=>{const result=P.calculate(d);return {result,values:M.outsideMeasures(d.quote.products,result)};};
test('outside measures count selected physical scope once across multiple operations and hierarchy quantities',()=>{
 const d=fixture(),a=C.findNode(d.quote.products,'a');a.ops=[{id:'cut',mode:'outside',amount:1},{id:'paint',mode:'outside',amount:1,measurementConfirmed:true}];let {result,values}=run(d);
 A.equal(values.a.weight,result.nodes.a.workWeight);A.equal(values.a.area,result.rows.find(x=>x.id==='a').geometry.blankArea);A.equal(result.nodes.a.workArea,values.a.area*2);A.equal(values.product.weight,values.a.weight);A.equal(values.component.area,values.a.area);A.equal(values.b.weight,0);A.equal(values.a.sources.length,1);
 d.quote.products[0].qty=6;const doubled=run(d).values;A.equal(doubled.product.weight,values.product.weight*2);A.equal(doubled.product.area,values.product.area*2);
});
test('parent outside work covers descendants without adding their work twice, and uses declared processing area',()=>{
 const d=fixture(),component=C.findNode(d.quote.products,'component');component.ops=[{id:'paint',mode:'outside',measurementConfirmed:true}];component.measurementRules={area:'CA/2'};C.findNode(d.quote.products,'a').ops=[{id:'cut',mode:'outside'}];
 const {result,values}=run(d);A.equal(values.component.area,result.nodes.component.workArea);A.equal(values.component.area,result.nodes.component.area/2);A.equal(values.product.area,values.component.area);A.deepEqual(values.product.sources,['component']);A.equal(values.b.mode,'inherited');A.equal(values.direct.weight,0);
});
test('outside packages remain visible for vendor supplied stock and technical projection preserves measures',()=>{
 const d=fixture(),component=C.findNode(d.quote.products,'component');component.outsource={enabled:true,supplier:'QA',output:'Finished',materialSupply:'vendor',unit:'kg',price:100};const before=JSON.stringify(d),{result,values}=run(d);A.equal(result.rows.find(r=>r.id==='a').cost,0);A.ok(values.component.weight>0);A.equal(values.product.weight,values.component.weight);A.deepEqual(run(T.project(d)).values,values);A.equal(JSON.stringify(d),before);
});
test('invalid outsourced geometry is reported rather than silently counted as a complete zero; unrelated invalid rows do not alter outside quantities',()=>{
 const d=fixture(),a=C.findNode(d.quote.products,'a');a.ops=[{id:'cut',mode:'outside'}];C.findNode(d.quote.products,'direct').dims.L=0;let values=run(d).values;A.ok(values.product.weight>0);A.deepEqual(values.product.errors,[]);a.dims.L=0;values=run(d).values;A.equal(values.a.weight,null);A.equal(values.product.area,null);A.ok(values.product.errors.length);A.equal(values.direct.weight,0);
});
test('manual billable operation quantities do not inflate physical outside measures',()=>{
 const d=fixture(),a=C.findNode(d.quote.products,'a');a.ops=[{id:'cut',mode:'outside',basisMode:'manual_total',workQuantity:999},{id:'paint',mode:'outside',basisMode:'manual_total',workQuantity:888,measurementConfirmed:true}];const {result,values}=run(d);A.equal(result.nodes.a.ownOps[0].basis,999);A.equal(values.a.weight,result.nodes.a.workWeight);A.notEqual(values.a.weight,999);A.notEqual(values.a.area,888);
});
test('auxiliary percent changes only allowance cost, never blank, estimated or transported quantities and outside measures',()=>{
 const d=fixture(),a=C.findNode(d.quote.products,'a');a.ops=[{id:'cut',mode:'outside'}];d.quote.expenses=[{id:'freight',name:'Freight',category:'incoming',scope:'all',method:'kg_purchase',rate:10,allocation:'weight'}];
 const before=run(d);a.auxiliaryPercent=5;const after=run(d);A.deepEqual(after.result.rows.map(r=>r.geometry),before.result.rows.map(r=>r.geometry));A.deepEqual(after.result.rows.map(r=>r.estimate),before.result.rows.map(r=>r.estimate));A.deepEqual(after.values,before.values);A.deepEqual(after.result.logistics.rows,before.result.logistics.rows);A.equal(after.result.logistics.totals.incoming,before.result.logistics.totals.incoming);
 const cost=after.result.rows.find(r=>r.id==='a').cost;A.ok(Math.abs(after.result.products[0].parts.allowance-before.result.products[0].parts.allowance-cost*0.05)<1e-8);
});

test('customer case: 160 blanks of 1000 x 640 mm give 102.4 m2 outside, not 204.8',()=>{
 const d=fixture(),a=C.findNode(d.quote.products,'a');a.qty=20;a.dims={L:1000,W:640};d.quote.products[0].qty=1;const component=d.quote.products[0].children[0];component.qty=8;component.children=[a];d.quote.products[0].children=[component];a.ops=[{id:'cut',mode:'outside'}];
 const {result,values}=run(d);for(const id of ['a','component','product'])A.ok(Math.abs(values[id].area-102.4)<1e-9);A.ok(Math.abs(result.nodes.a.workArea-204.8)<1e-9);
});
test('explicit child area flows to parent while unrelated and multiple outside operations never duplicate it',()=>{
 const d=fixture(),a=C.findNode(d.quote.products,'a');a.measurementRules={area:'SA*0.75'};d.quote.products[0].ops=[{id:'cut',mode:'outside'}];const {result,values}=run(d);const expected=result.nodes.a.workArea+result.rows.filter(r=>r.id!=='a').reduce((s,r)=>s+r.geometry.blankArea,0);A.equal(values.product.area,expected);A.equal(values.a.area,result.nodes.a.workArea);
});
