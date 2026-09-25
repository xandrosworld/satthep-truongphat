'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(require.resolve('../production-dossier-ui.js'),'utf8'),context);
const plain=x=>JSON.parse(JSON.stringify(x));
test('preparation groups only interchangeable blanks, preserves dimensions and supplier ownership',()=>{
 const row={id:'a',name:'Detail',count:2,material:{id:'STEEL',shape:'sheet',grade:'CT3'},properties:{T:2},dimensions:{length:1000,width:400}};
 const rows=[row,{...row,id:'b',count:3},{...row,id:'c',dimensions:{length:1000,width:500}},{...row,id:'d',properties:{T:3}},{...row,id:'e',externallySupplied:true},{...row,id:'f',material:{...row.material,grade:'SUS304'}}];
 const before=JSON.stringify(rows),groups=plain(context.productionMaterialGroups(rows));
 A.equal(groups.length,5);A.equal(groups[0].count,5);A.equal(groups[1].count,2);
 A.equal(JSON.stringify(rows),before);
});
test('preparation displays batch quantities, nested details and newly added route nodes once',()=>{
 const source={tree:[{id:'p',kind:'product',qty:3,children:[{id:'c',qty:2,children:[{id:'m',qty:4}]}]}]};
 const j={packet:{materials:[{id:'m',count:24,name:'Material'}],operations:[{id:'op1',nodeId:'new',object:'New detail',quantity:6},{id:'op2',nodeId:'new',object:'New detail',quantity:6}]}};
 const before=JSON.stringify({j,source}),rows=plain(context.productionPreparationRows(j,source));
 A.deepEqual(rows.map(r=>[r.node.id,r.quantity]),[['p',3],['c',6],['m',24],['new',6]]);
 A.equal(JSON.stringify({j,source}),before);
});
