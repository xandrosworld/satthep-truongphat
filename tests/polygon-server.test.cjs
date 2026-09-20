'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),D=require('../definition-core'),C=require('../core'),P=require('../pricing-core');
test('polygon sides survive catalogue and quotation storage; formula-only users can change dimensions but not the contour declaration',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 const call=async(route,method='GET',body,session)=>{const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),raw=await r.json(),data=raw.__formulaProtected?raw.value:raw;return {status:r.status,data,raw,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const password='QA-unfold-circle-2026!',admin=await call('setup','POST',{username:'admin',name:'Admin',password}),catalog=await call('catalog','GET',undefined,admin),d={id:'QA-CIRCLE',name:'Tấm tròn',...D.polygonPreset('triangle')};
 catalog.data.catalog.shapeDefinitions=[d];const pub=await call('catalog','PUT',{expectedVersion:catalog.data.version,catalog:catalog.data.catalog},admin);A.equal(pub.status,200,JSON.stringify(pub.data));
 const read=await call('catalog','GET',undefined,admin);A.deepEqual(read.data.catalog.shapeDefinitions[0].unfoldOutputs,d.unfoldOutputs);
 const db=P.demoSeed(),m=D.applyShape({id:'CIRCLE-M',name:'Phôi tròn',density:7850,unit:'m²',price:100,stockL:1000,stockW:1000},d,{T:2}),n=D.assign(D.draft('Phôi',2),m,db.rules);n.dims={C1:300,C2:400,C3:500};db.shapeDefinitions=[d];db.materials.push(m);db.quote.products=[{id:'P',kind:'product',name:'QA',qty:1,children:[n],ops:[]}];db.quote.kerf=0;db.quote.remnantSelections={};db.quote.remnantMode='all';
 const created=await call('quotes','POST',{document:db},admin);A.equal(created.status,201,JSON.stringify(created.data));const id=created.data.id;
 const fetched=await call('quotes/'+id,'GET',undefined,admin);A.equal(C.calculate(fetched.data.document).groups[0].layout.stocks.length,1);
 const user=await call('users','POST',{username:'qa-use',name:'QA use only',password,role:'estimator',canFormulaUse:true,canFormulaView:false,canFormulaEdit:false},admin);A.equal(user.status,201);
 const session=await call('login','POST',{username:'qa-use',password}),protectedQuote=await call('quotes/'+id,'GET',undefined,session),doc=protectedQuote.data.document,leaf=doc.quote.products[0].children[0],token=leaf.spec.shapeDefinition.unfoldOutputs[0].formula;
 A.match(token,/^__TPF_/);A.equal((await call('formulas/evaluate','POST',{token,variables:{C1:300}},session)).data.value,300);
 leaf.dims.C1=250;const saved=await call('quotes/'+id,'PUT',{document:doc,expectedVersion:1},session);A.equal(saved.status,200,JSON.stringify(saved.data));
 const restored=await call('quotes/'+id,'GET',undefined,admin);A.equal(restored.data.document.quote.products[0].children[0].spec.shapeDefinition.unfoldOutputs[0].formula,'C1');A.equal(C.calculate(restored.data.document).rows[0].geometry.unfolded.C01,250);
 const malicious=await call('quotes/'+id,'GET',undefined,session);malicious.data.document.quote.products[0].children[0].spec.shapeDefinition.polygon.sides.reverse();const denied=await call('quotes/'+id,'PUT',{document:malicious.data.document,expectedVersion:2},session);A.equal(denied.status,403);
});
