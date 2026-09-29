const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
test('unit mismatch saves as draft but blocks full and partial price confirmation',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let session;
 async function call(path,method='GET',body){const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:session?.cookie||'','X-CSRF-Token':session?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 session=await call('setup','POST',{username:'admin',name:'Admin',password:'Unit-confirm-2026!'});
 const d=P.demoSeed();d.quote.remnantMode='all';const n=d.quote.products[0].children[0],op=n.ops[0];Object.assign(op,{quantityUnit:'m',quantityDeclared:true,basisMode:'manual_unit',workQuantity:2});
 const created=await call('quotes','POST',{document:d});A.equal(created.status,201);const path='quotes/'+created.data.id;
 const saved=await call(path,'PUT',{expectedVersion:1,document:d});A.equal(saved.status,200,JSON.stringify(saved.data));
 A.equal((await call(path+'/handoff/technical','POST',{expectedVersion:2})).status,200);
 for(const [route,body]of [['handoff/materials',{}],['partial-handoff',{stage:'materials',action:'confirm',nodeId:n.id,note:'Check'}]]){const r=await call(path+'/'+route,'POST',{expectedVersion:2,...body});A.equal(r.status,422,JSON.stringify(r.data));A.match(r.data.error,/Chưa thể xác nhận giá nguyên công/);A.match(r.data.error,/khai m.*theo kg/);}
 const calculated=P.calculate(d);A.equal(calculated.nodes[n.id].ownOps[0].cost,0);A.match(calculated.nodes[n.id].ownOps[0].error,/khai m.*theo kg/);
});
