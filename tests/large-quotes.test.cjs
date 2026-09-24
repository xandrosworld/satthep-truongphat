const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../core.js'),P=require('../pricing-core.js'),{createApp}=require('../server/app.cjs');
test('large bar nesting preserves first fit, quantities, lengths and remnants at 100000 cuts',()=>{
 const count=100000,l=C.nest([{id:'a',label:'A',count,geometry:{length:1940,width:0}}],{shape:'box',stockL:6000},0);
 A.equal(l.stocks.length,33334);A.equal(l.used,count*1940);A.equal(l.stocks.reduce((n,s)=>n+s.placements.length,0),count);A.equal(l.purchased-l.used,l.stocks.reduce((n,s)=>n+s.remaining,0));
 const exact=C.nest([{id:'a',count:6001,geometry:{length:6000,width:0}}],{shape:'box',stockL:6000},3);A.equal(exact.stocks.length,6001);
 const mix=C.nest([{id:'a',count:2,geometry:{length:4000,width:0}},{id:'b',count:2,geometry:{length:2000,width:0}}],{shape:'box',stockL:6000},0);A.equal(mix.stocks.length,2);A.deepEqual(mix.stocks.map(s=>s.placements.map(p=>p.rowId)),[['a','b'],['a','b']]);
});
test('large rectangular sheet nesting keeps every piece',()=>{const layout=C.nest([{id:'s',count:6001,geometry:{length:1000,width:1000}}],{shape:'sheet',stockL:1000,stockW:1000},0);A.equal(layout.stocks.length,6001);A.equal(layout.used,6001000000);});
test('large quotation saves, reloads and hands off without the demo count guard',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Large-quote-test-2026!'}),d=P.demoSeed();const material=C.flatten(C.seed().quote.products).find(n=>n.kind==='material'&&n.spec.shape==='box');material.qty=51;material.dims.L=1940;d.quote.products=[{id:'large',kind:'product',name:'Large order',qty:300,unit:'bộ',children:[material],ops:[]}];
 const saved=await call('quotes','POST',{document:d},admin);A.equal(saved.status,201,JSON.stringify(saved.data));const id=saved.data.id;
 let read=await call('quotes/'+id,'GET',undefined,admin);A.equal(read.data.document.quote.products[0].children[0].qty,51);
 // Removing a row must not leave the old total or nesting error in the save path.
 const second=C.copy(material);second.id+='-second';d.quote.products[0].children.push(second);
 let update=await call('quotes/'+id,'PUT',{document:d,expectedVersion:1},admin);A.equal(update.status,200,JSON.stringify(update.data));
 d.quote.products[0].children.pop();update=await call('quotes/'+id,'PUT',{document:d,expectedVersion:2},admin);A.equal(update.status,200,JSON.stringify(update.data));
 read=await call('quotes/'+id,'GET',undefined,admin);A.equal(read.data.document.quote.products[0].children.length,1);
 const handoff=await call('quotes/'+id+'/handoff/technical','POST',{expectedVersion:3},admin);A.equal(handoff.status,200,JSON.stringify(handoff.data));
 d.quote.products[0].qty=3000;const rejected=await call('quotes','POST',{document:d},admin);A.equal(rejected.status,400);A.match(rejected.data.error,/100\.000/);
});
