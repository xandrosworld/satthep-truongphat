const {test}=require('node:test'),A=require('node:assert/strict'),{DatabaseSync}=require('node:sqlite'),{createFormulaAccess}=require('../server/formula-access.cjs');
test('locked historical snapshots follow node identity on reorder and reparent; edits still rejected',()=>{const sql=new DatabaseSync(':memory:');try{sql.exec('CREATE TABLE users(id TEXT,name TEXT);CREATE TABLE catalog(id INTEGER,document TEXT)');sql.prepare('INSERT INTO catalog VALUES(1,?)').run(JSON.stringify({rules:[{id:'flat',name:'Flat',shape:'sheet',length:'L',width:'W'}]}));const f=createFormulaAccess({sql,fail:(status,msg)=>{throw Error(msg)}});sql.prepare('INSERT INTO formula_locks VALUES(?,?,1,?,?)').run('rules:flat',1,'test','now');const m=(id,length)=>({id,kind:'material',ruleSpec:{id:'flat',shape:'sheet',length,width:'W'},children:[]});const before={quote:{products:[{id:'p1',kind:'product',children:[m('a','L+1'),m('b','L+2')]},{id:'p2',kind:'product',children:[]}]}};const rights={formulaUse:true,formulaEdit:true,formulaUnlock:false},after=structuredClone(before);after.quote.products[0].children.reverse();A.doesNotThrow(()=>f.guard(before,after,rights));after.quote.products[1].children.push(after.quote.products[0].children.pop());A.doesNotThrow(()=>f.guard(before,after,rights));after.quote.products[1].children[0].ruleSpec.length='L+99';A.throws(()=>f.guard(before,after,rights),/khóa/);}finally{sql.close();}});

test('formula users can duplicate complete saved historical bundles and reorder object keys, but cannot edit or splice formulas',()=>{
 const sql=new DatabaseSync(':memory:');try{
  sql.exec('CREATE TABLE users(id TEXT,name TEXT);CREATE TABLE catalog(id INTEGER,document TEXT)');
  const rule={id:'flat',shape:'sheet',length:'L',width:'W'};
  sql.prepare('INSERT INTO catalog VALUES(1,?)').run(JSON.stringify({rules:[rule]}));
  const f=createFormulaAccess({sql,fail:(status,msg)=>{throw Error(msg)}}),rights={formulaUse:true,formulaEdit:false,formulaUnlock:false};
  const before={rules:[rule],quote:{products:[{id:'p',kind:'product',children:[{id:'a',kind:'material',materialId:'M',rule:'flat',spec:{id:'M',shape:'sheet'},ruleSpec:{...rule,length:'L+1',width:'W+1'},dims:{L:100,W:50}},{id:'b',kind:'material',materialId:'M',rule:'flat',spec:{id:'M',shape:'sheet'},ruleSpec:{...rule,length:'L+2',width:'W+2'}}]}]}};
  const after=structuredClone(before),clone=structuredClone(before.quote.products[0]);clone.id='copy';clone.children.forEach(n=>n.id+='copy');clone.children[0].dims.L=200;after.quote.products.push(clone);
  A.doesNotThrow(()=>f.guard(before,after,rights));
  const reordered=structuredClone(before),r=reordered.quote.products[0].children[0].ruleSpec;reordered.quote.products[0].children[0].ruleSpec={width:r.width,length:r.length,shape:r.shape,id:r.id};
  A.doesNotThrow(()=>f.guard(before,reordered,rights));
  sql.prepare('INSERT INTO formula_locks VALUES(?,?,1,?,?)').run('rules:flat',1,'test','now');
  A.doesNotThrow(()=>f.guard(before,after,rights));A.doesNotThrow(()=>f.guard(before,reordered,rights));
  const edited=structuredClone(after);edited.quote.products[1].children[0].ruleSpec.length='L+99';A.throws(()=>f.guard(before,edited,rights),/khóa|quyền/);
  const spliced=structuredClone(after);spliced.quote.products[1].children[0].ruleSpec.width='W+2';A.throws(()=>f.guard(before,spliced,rights),/khóa|quyền/);
  const existing=structuredClone(before);existing.quote.products[0].children[0].ruleSpec=structuredClone(before.quote.products[0].children[1].ruleSpec);A.throws(()=>f.guard(before,existing,rights),/khóa|quyền/);
  A.throws(()=>f.guard(before,after,{...rights,formulaUse:false}),/sử dụng/);
 }finally{sql.close();}
});
