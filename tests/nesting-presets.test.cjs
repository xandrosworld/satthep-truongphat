const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../core'),D=require('../definition-core'),N=require('../nesting-plan-core');
function fixture(kind){const db=C.seed(),def={id:'QA',name:'Phôi thử',...D.sheetPreset(kind)},m=D.applyShape({id:'QA',name:'Thép',density:7850,unit:'kg',price:100,stockL:300,stockW:275},def,{T:2}),n=D.assign(D.draft('Phôi',8),m,db.rules);n.dims=kind==='circle'?{D:100}:{L:100,W:50};db.quote.products=[{id:'P',kind:'product',qty:1,name:'Sản phẩm',ops:[],children:[n]}];db.quote.kerf=0;return {db,g:C.calculate(db).groups[0]};}
test('preset list excludes incompatible shapes without changing quotation data',()=>{for(const kind of ['rectangle','circle']){const {db,g}=fixture(kind),before=JSON.stringify(db);A.deepEqual(N.available(g.rows,g.spec),kind==='circle'?['bounding','bounding-fixed','length-desc','area-desc','circle']:['bounding','bounding-fixed','length-desc','area-desc']);A.equal(JSON.stringify(db),before);}});
test('circle straight and staggered choices preserve the real outline and area',()=>{const {g}=fixture('circle');for(const mode of ['bounding','bounding-fixed','circle']){const plan=N.make(g.rows,g.spec,0,mode),layout=N.apply(g.rows,g.spec,0,plan);A.equal(layout.stocks.length,mode==='circle'?1:2);A.equal(layout.stocks.flatMap(s=>s.placements).length,8);A.ok(layout.stocks.flatMap(s=>s.placements).every(p=>p.circle));A.ok(Math.abs(layout.netUsed-8*Math.PI*100**2/4)<1e-6);A.equal(JSON.stringify(N.apply(g.rows,g.spec,0,JSON.parse(JSON.stringify(plan)))),JSON.stringify(layout));}});

test('length-first keeps descending rows, kerf, identity and persisted layout; alternatives stay independent',()=>{
 const rows=[[1792.5,127],[2900,117],[2525,117],[3100,117],[2900,108]].map(([length,width],i)=>({id:'r'+i,label:'Piece '+i,count:2,geometry:{length,width,blankArea:length*width*2/1e6}}));
 const spec={id:'sheet',shape:'sheet',stockL:3100,stockW:1250},before=JSON.stringify(rows);
 for(const mode of ['length-desc','area-desc'])for(const kerf of [0,3]){
  const plan=N.make(rows,spec,kerf,mode);N.validatePlans([plan]);const layout=N.apply(rows,spec,kerf,JSON.parse(JSON.stringify(plan)));
  A.equal(layout.stocks.flatMap(s=>s.placements).length,10);
  if(mode==='length-desc')for(const stock of layout.stocks)for(let i=0;i<stock.placements.length;i++){const p=stock.placements[i];A.equal(p.x,0);if(i){const prev=stock.placements[i-1];A.ok(prev.l>=p.l);A.ok(p.y>=prev.y+prev.w+kerf-1e-7);}}
  const draft=N.draft(rows,spec,kerf,mode),manual=N.manual(rows,spec,kerf,mode,draft);A.equal(manual.stocks.length,layout.stocks.length);
  A.equal(manual.netUsed,rows.reduce((sum,r)=>sum+r.geometry.blankArea*1e6,0));
  A.throws(()=>N.apply(rows,{...spec,stockW:1200},kerf,plan),/đã cũ/);
 }
 A.equal(JSON.stringify(rows),before);
});
