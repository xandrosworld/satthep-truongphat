const {test}=require('node:test'),A=require('node:assert/strict'),S=require('../cost-input-core.js'),{createApp}=require('../server/app.cjs');
const doc=price=>({rates:[{id:'cut',name:'Cut',unit:'kg',inside:price,outside:price*2,priceOptions:[{id:'fixed',method:'fixed',inside:price*3,outside:price*4}]}],materials:[]});
test('catalog history keeps three price changes, units and operation modes separate without mutating declarations',()=>{
 const snapshots=[500,500,400,300,200].map((n,i)=>({document:doc(n),version:5-i,at:String(5-i)})),before=JSON.stringify(snapshots),rows=S.referenceHistory(snapshots),inside=rows.find(r=>r.identity===JSON.stringify(['cut','inside','kg']));
 A.deepEqual(inside.prices.map(p=>p.value),[500,400,300]);A.equal(inside.prices[0].version,4);A.equal(JSON.stringify(snapshots),before);A.equal(rows.length,4);A.equal(rows.find(r=>r.identity===JSON.stringify(['cut','outside','kg'])).prices[0].value,1000);
 const changed=doc(600);changed.rates[0].unit='m';const mixed=S.referenceHistory([{document:changed,version:6},...snapshots]);A.equal(mixed.filter(r=>r.identity===JSON.stringify(['cut','inside','m'])).length,1);
});
test('shared price references use only published catalog, require pricing permission and never write quotes',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,s){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(s?{Cookie:s.cookie,'X-CSRF-Token':s.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const password='Reference-test-2026!',admin=await call('setup','POST',{username:'admin',name:'Admin',password});await call('users','POST',{username:'tech',name:'Tech',role:'technical',password},admin);const tech=await call('login','POST',{username:'tech',password});
 for(let v=1;v<=4;v++)app.sql.prepare('INSERT OR REPLACE INTO catalog_revisions VALUES(?,?,?,?)').run(v,JSON.stringify(doc(v*100)),'2026-09-24T00:00:0'+v+'Z',admin.data.user.id);
 app.sql.prepare('UPDATE catalog SET version=?,document=? WHERE id=1').run(4,JSON.stringify(doc(400)));
 const route='intake/cost-price-references';A.equal((await call(route)).status,401);A.equal((await call(route,'GET',undefined,tech)).status,403);const result=await call(route,'GET',undefined,admin);A.equal(result.status,200);A.deepEqual(result.data.find(r=>r.identity===JSON.stringify(['cut','inside','kg'])).prices.map(p=>p.value),[400,300,200]);A.equal(app.sql.prepare('SELECT COUNT(*) n FROM quotes').get().n,0);
});
