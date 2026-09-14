'use strict';
const {test}=require('node:test'),A=require('node:assert/strict');
const C=require('../core.js'),D=require('../dimension-links-core.js'),P=require('../pricing-core.js');
test('common thickness: legacy display adds an empty T without mutating saved dimensions',()=>{
 const d=C.seed(),p=d.quote.products[0],before=JSON.stringify(d);A.deepEqual(C.productParamEntries(p).map(([k])=>k),['L','W','H','T']);A.equal(C.productParamEntries(p).at(-1)[1],null);A.equal(JSON.stringify(d),before);A.deepEqual(C.calculate(d).errors,[]);A.doesNotMatch(C.quoteSpecification(p),/T null|T undefined|NaN|Dày chung/);
});
test('common thickness: decimal is independent of SKU thickness, brands, catalogue and totals',()=>{
 const d=C.seed(),p=d.quote.products[0],before=C.calculate(d),children=C.copy(p.children),catalogue=C.copy(d.materials);C.applyParam(p,'T',2.25);A.equal(p.params.T,2.25);A.deepEqual(p.children,children);A.deepEqual(d.materials,catalogue);A.deepEqual(C.calculate(d).total,before.total);A.match(C.quoteSpecification(p),/Dày chung \(tham số\): 2.25 mm; không tự đổi quy cách vật tư/);
});
test('common thickness: clear is null, rejects zero, negative, nonnumeric and overlimit atomically',()=>{
 const p=C.seed().quote.products[0];C.applyParam(p,'T',1.5);for(const value of [0,-1,NaN,Infinity,100001,'2','']){A.throws(()=>C.applyParam(p,'T',value));A.equal(p.params.T,1.5);}C.applyParam(p,'T',null);A.equal(p.params.T,null);A.doesNotMatch(C.quoteSpecification(p),/Dày chung|T null|NaN/);
});
test('common thickness: cloning, templates, snapshot and JSON preserve null/decimal independently',()=>{
 const d=C.seed(),p=d.quote.products[0];C.applyParam(p,'T',1.5);const frozen=C.copy(p),template=C.cloneNode(p),variant=C.cloneNode(template);C.applyParam(variant,'T',2);A.equal(p.params.T,1.5);A.equal(frozen.params.T,1.5);A.equal(template.params.T,1.5);A.equal(JSON.parse(JSON.stringify(variant)).params.T,2);C.applyParam(variant,'T',null);A.equal(JSON.parse(JSON.stringify(variant)).params.T,null);A.equal(template.params.T,1.5);
});
test('common thickness: nested products, mixed thickness and piece materials remain unchanged',()=>{
 const d=C.seed(),p=d.quote.products[0],nested=C.cloneNode(d.quote.products[1]);nested.params.T=3;p.children.push(nested);p.children[1].children[0].spec.props.T=1;const old=C.copy(p.children);C.applyParam(p,'T',2);A.deepEqual(p.children,old);A.equal(nested.params.T,3);A.equal(p.children[0].children[0].spec.props.T,1.5);A.equal(p.children[1].children[0].spec.props.T,1);
});
test('common thickness: explicit PRODUCT_T formulas resolve through ancestors, never overwrite fixed SKU T',()=>{
 const d=C.seed(),p=d.quote.products[0],m=p.children[0].children[0];C.applyParam(p,'T',2);D.set(d.quote.products,m.id,'L',{mode:'formula',expression:'PRODUCT_L - 2 * PRODUCT_T'});A.equal(m.dims.L,1996);C.applyParam(p,'T',3);D.resolve(d.quote.products);A.equal(m.dims.L,1994);A.equal(m.spec.props.T,1.5);A.throws(()=>D.set(d.quote.products,m.id,'T',{mode:'formula',expression:'PRODUCT_T'}),/cố định/);C.applyParam(p,'T',null);A.ok(C.calculate(d).errors.length);A.equal(C.calculate(d).rows.some(r=>r.id===m.id),false);
});
test('common thickness: field formulas reject missing T, zero and nonfinite values',()=>{
 const d=C.seed(),p=d.quote.products[0],m=p.children[0].children[0];A.throws(()=>D.set(d.quote.products,m.id,'L',{mode:'formula',expression:'PRODUCT_L - PRODUCT_T'}),/Thông số T/);for(const value of [0,-2,null,100001])A.throws(()=>D.set(d.quote.products,p.id,'T',{mode:'fixed',value}));D.set(d.quote.products,p.id,'T',{mode:'fixed',value:1.5});A.equal(p.params.T,1.5);C.applyParam(p,'T',2);A.equal(p.params.T,1.5);
});
test('common thickness: injected invalid values are errors even without formula bindings',()=>{
 for(const value of [0,-2,'2',100001,Infinity]){const d=P.demoSeed();d.quote.products[0].params.T=value;A.ok(P.calculate(d).errors.some(e=>e.includes('Dày chung T')));}
});
