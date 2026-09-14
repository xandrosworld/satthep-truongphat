const {test}=require('node:test'),assert=require('node:assert/strict'),E=require('../entry-core.js'),C=require('../core.js');
test('numbers: integers, decimals, spaces and unambiguous grouped conventions',()=>{
  for(const [raw,want]of [['1800',1800],['1.5',1.5],['1,5',1.5],['0.125',.125],['0,125',.125],['.5',.5],['1 800',1800],['1\u00a0800,5',1800.5],['1.800,5',1800.5],['1,800.5',1800.5],['1.000.000',1e6]])assert.equal(E.parseNumber(raw),want,raw);
});
test('numbers: ambiguous separators require an explicit convention',()=>{
  for(const raw of ['1.800','1,800','12.345','123,456'])assert.throws(()=>E.parseNumber(raw),/hai cách hiểu/);
  assert.equal(E.parseNumber('1.800','vi'),1800);assert.equal(E.parseNumber('1.800','en'),1.8);
  assert.equal(E.parseNumber('1,800','vi'),1.8);assert.equal(E.parseNumber('1,800','en'),1800);
});
test('numbers: invalid syntax never gets partially parsed',()=>{
  for(const raw of ['', '1.800 mm','1e3','Infinity','NaN','-2','1 80','1.2.3','1,,2','12,','2+3','9007199254740992'])assert.throws(()=>E.parseNumber(raw),raw);
  assert.throws(()=>E.parseNumber('1.80','vi'),/3 chữ số/);
});
test('paste: line numbers, optional header, default dimensions and decimal quantities',()=>{
  const d=C.seed(),r=E.readPaste('Mã vật tư\tSL\tL\tW\nPH-T15\t2\t1.800\t400\nVP-GIOANG\t0,6',d.materials,d.rules,{format:'vi',parentCount:5});
  assert.equal(r[0].dims.L,1800);assert.equal(r[0].line,2);assert.equal(r[1].qty,.6);
});
test('paste: wrong code, extra columns and ambiguous values reject the whole batch',()=>{
  const d=C.seed(),before=JSON.stringify(d),read=t=>E.readPaste(t,d.materials,d.rules);
  assert.throws(()=>read('PH-T15\t1\t1000\t400\nUNKNOWN\t1'),/Dòng 2/);
  assert.throws(()=>read('PH-T15\t1\t1.800\t400'),/hai cách hiểu/);
  assert.throws(()=>read('PH-T15\t1\t1000\t400\t0\t0\tEXTRA'),/6 cột/);
  assert.throws(()=>read('\t2\t1800\t400'),/trống/);
  assert.equal(JSON.stringify(d),before);
});
test('paste: a real material named CODE is not discarded as a header',()=>{
  const d=C.seed();d.materials[0].id='CODE';
  const rows=E.readPaste('CODE\t2\t1800\t400',d.materials,d.rules);
  assert.equal(rows.length,1);assert.equal(rows[0].material.id,'CODE');
});
test('paste: fixed dimensions cannot be silently overridden and stock totals remain integral',()=>{
  const d=C.seed(),read=(t,count=1)=>E.readPaste(t,d.materials,d.rules,{parentCount:count});
  assert.throws(()=>read('PH-H402\t1\t500\t99'),/cố định/);
  assert.equal(read('PH-H402\t1\t500\t40')[0].dims.W,40);
  assert.throws(()=>read('LK-M8\t1\t500'),/để trống/);
  assert.throws(()=>read('PH-T15\t0.5\t500\t400'),/số nguyên/);
  assert.equal(read('PH-T15\t0.5\t500\t400',2)[0].qty,.5);
  assert.throws(()=>read('PH-T15\t1\t0\t400'),/lớn hơn 0/);
});
test('search: component match retains all descendants and its product',()=>{
  const d=C.seed(),p=d.quote.products[0],c=p.children[0],v=c.children[0],r=E.searchTree(d.quote.products,'than mang cap');
  assert.ok(r.visible.has(p.id));assert.ok(r.visible.has(c.id));assert.ok(r.visible.has(v.id));
  assert.ok(r.context.has(p.id));assert.ok(!r.context.has(c.id));assert.ok(!r.context.has(v.id));
  assert.ok(!r.visible.has(p.children[1].id));
});
test('search: material match preserves ancestry but does not expose unrelated siblings',()=>{
  const d=C.seed(),p=d.quote.products[0],c=p.children[0],r=E.searchTree(d.quote.products,'PH-T15');
  assert.ok(r.visible.has(p.id));assert.ok(r.context.has(c.id));assert.ok(!r.context.has(c.children[0].id));
  assert.ok(!r.visible.has(p.children[2].id));assert.ok(!r.visible.has(d.quote.products[1].id));
});
test('search: product name includes descendants; case/accent/order normalization and empty result',()=>{
  const d=C.seed(),p=d.quote.products[1],r=E.searchTree(d.quote.products,'MÁY khung');
  for(const n of C.flatten([p]))assert.ok(r.visible.has(n.id));
  assert.equal(E.searchTree(d.quote.products,'impossible-marker').visible.size,0);
  assert.equal(E.searchTree(d.quote.products,'').visible.size,C.flatten(d.quote.products).length);
});
