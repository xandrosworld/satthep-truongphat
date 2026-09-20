const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../core'),D=require('../definition-core'),N=require('../nesting-plan-core'),ME=require('../material-estimate-core');
function fixture(kind='circle',count=8){const db=C.seed(),d={id:'SHAPE',name:'QA',...D.sheetPreset(kind)},m=D.applyShape({id:'MAT',name:'QA',unit:'m²',price:100,density:7850,stockL:300,stockW:275},d,{T:2}),n=D.assign(D.draft('Phôi',count),m,db.rules);n.dims=kind==='circle'?{D:100}:{L:100,W:50};db.quote.products=[{id:'P',kind:'product',name:'QA',qty:1,ops:[],children:[n]}];db.quote.kerf=0;return db;}
test('display dimensions use D0 for circles and no duplicate envelope aliases',()=>{
 const circle=D.sheetPreset('circle');A.deepEqual(D.displayedUnfolding(circle).map(x=>x.symbol),['D0']);
 const old={...circle,nesting:'bounding',unfoldOutputs:[],length:'D',width:'D',blankSurface:'PI * D * D / 4000000'};A.deepEqual(D.displayedUnfolding(old).map(x=>x.symbol),['D0']);
 A.deepEqual(D.displayedUnfolding(D.sheetPreset('rectangle')).map(x=>x.symbol),['L0','W0']);
 A.deepEqual(D.displayedUnfolding(D.sheetPreset('trapezoid')).map(x=>x.symbol),['L0','W0','H0']);
});
test('quote nesting overrides alter purchasing only, remain versioned and invalidate on geometry changes',()=>{
 const db=fixture(),g=C.calculate(db).groups[0],before=JSON.stringify(db.quote.products);A.equal(g.layout.stocks.length,1);
 db.quote.nestingPlans=[N.make(g.rows,g.spec,0,'bounding')];const r=C.calculate(db);A.equal(r.groups[0].layout.stocks.length,2);A.equal(JSON.stringify(db.quote.products),before);A.equal(C.calculate(JSON.parse(JSON.stringify(db))).groups[0].layout.stocks.length,2);
 db.quote.kerf=1;const changed=C.calculate(db);A.match(changed.groups[0].error,/đã cũ/);A.ok(changed.errors.some(x=>x.includes('đã cũ')));
});
test('manual circular positions validate identity, boundaries, kerf and overlap; purchasing and loss use saved placement',()=>{
 const db=fixture(),g=C.calculate(db).groups[0],p=N.draft(g.rows,g.spec,0,'circle');const auto=N.manual(g.rows,g.spec,0,'circle',p);A.equal(auto.stocks.length,1);
 const bad=structuredClone(p);bad[1].x=bad[0].x;bad[1].y=bad[0].y;A.throws(()=>N.manual(g.rows,g.spec,0,'circle',bad),/chồng/);
 for(const patch of [{x:-1},{x:301},{stock:2},{index:0},{x:NaN}]){const b=structuredClone(p);Object.assign(b[1],patch);A.throws(()=>N.manual(g.rows,g.spec,0,'circle',b));}
 A.throws(()=>N.manual(g.rows,g.spec,3,'circle',p),/mạch cắt/);
 p.at(-1).stock=1;p.at(-1).x=0;p.at(-1).y=0;db.quote.nestingPlans=[N.make(g.rows,g.spec,0,'circle',p)];const r=C.calculate(db);A.equal(r.groups[0].layout.stocks.length,2);A.equal(r.groups[0].purchaseCost,16.5);A.ok(ME.comparisons(r,g.rows.map(x=>x.id))[0].percent>100);
 A.equal(JSON.stringify(C.calculate(JSON.parse(JSON.stringify(db))).groups[0].layout),JSON.stringify(r.groups[0].layout));
});
test('rectangular manual positions and shape-specific options reject unsafe layouts',()=>{
 const db=fixture('rectangle',4),g=C.calculate(db).groups[0],p=N.draft(g.rows,g.spec,0,'bounding');A.equal(N.manual(g.rows,g.spec,0,'bounding',p).stocks.length,1);
 const b=structuredClone(p);b[0].rotate=true;A.throws(()=>N.manual(g.rows,g.spec,0,'bounding-fixed',b),/xoay/);
 A.throws(()=>N.auto(g.rows,g.spec,0,'circle'),/khớp/);A.throws(()=>N.auto(g.rows,g.spec,0,'right-triangle'));
 const v=N.manual(g.rows,g.spec,0,'bounding',p);for(const s of v.stocks)for(const f of s.free)for(const q of s.placements)A.ok(f.x+f.l<=q.x||q.x+q.l<=f.x||f.y+f.w<=q.y||q.y+q.w<=f.y);
});
test('plans are technical BOM data, enforce unique rows and keep prices private',()=>{
 const db=fixture(),g=C.calculate(db).groups[0],plan=N.make(g.rows,g.spec,0,'circle');A.throws(()=>N.validatePlans([plan,plan]));A.throws(()=>N.validatePlans({}));
 const T=require('../technical-core'),SA=require('../section-access'),after=C.copy(db);after.quote.nestingPlans=[plan];A.deepEqual(SA.denied(db,after,{sections:['bom']}),[]);A.ok(SA.denied(db,after,{sections:[]}).includes('bom'));
 A.deepEqual(T.project(after).quote.nestingPlans,[plan]);A.deepEqual(T.merge(db,T.project(after)).quote.nestingPlans,[plan]);
});
