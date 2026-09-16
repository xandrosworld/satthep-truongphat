'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),C=require('../core.js'),P=require('../pricing-core.js'),W=require('../work-core.js'),F=require('../factor-matrix-core.js'),CV=require('../conventions-core.js'),R=require('../declaration-review-core.js');
const factor=(id,group,percent)=>({id,name:id,param:'T',kind:'number',productGroups:group?[group]:[],tiers:[{max:null,percent}]});
const rate={id:'scope-cut',name:'Cắt riêng',unit:'kg',inside:1000,outside:2000,factors:[factor('mechanic','Cơ khí',10),factor('tmc','Thang máng cáp',30)]};
test('same shared operation uses only factors of the declared group; missing group never yields a guessed price',()=>{
 for(const [group,expected]of [['Cơ khí',1100],['Thang máng cáp',1300],['Tủ điện',1000]]){const r=W.price(rate,{mode:'inside'},{T:2,productGroup:group},P.tier);A.equal(r.value,expected);A.equal(r.factors.length,expected===1000?0:1);}
 A.throws(()=>W.price(rate,{mode:'inside'},{T:2},P.tier),/Chưa chọn nhóm/);
 A.equal(W.price(rate,{mode:'inside',pricingMethod:'catalog'},{},P.tier).value,1000);
 A.equal(W.price({...rate,factors:[factor('legacy','',10)]},{mode:'inside'},{T:2},P.tier).value,1100);
});
test('restricted operation checks all methods; context inherits closest explicitly declared product/component group',()=>{
 const db=P.demoSeed(),product=db.quote.products[0],material=C.flatten([product]).find(n=>n.kind==='material');product.productGroup='Cơ khí';
 A.equal(W.nodeGroup(db.quote.products,material.id),'Cơ khí');const component={id:'component-test',kind:'component',qty:2,productGroup:'Tủ điện',children:[material]};product.children=[component];A.equal(W.context(material,{count:2,productId:product.id},db.quote.products).productGroup,'Tủ điện');
 const r={...rate,productGroups:['Cơ khí'],factors:[factor('mechanic','Cơ khí',10)]};for(const method of ['catalog','factors','direct','fixed'])A.throws(()=>W.price(r,{mode:'inside',pricingMethod:method,unitPrice:5},{T:2,productGroup:'Thang máng cáp'},P.tier),/chỉ áp dụng nhóm/);
 A.equal(R.rate(r,P.tier).ok,true);A.equal(R.rate(rate,P.tier).ok,true);
});
test('filtered matrix saves preserve hidden and disabled links; incompatible group bindings are atomic failures',()=>{
 const db=P.demoSeed();db.rates=[{...rate,factors:[]},{...rate,id:'only-mech',productGroups:['Cơ khí'],factors:[]}];db.pricingDefaults={...P.defaults(),factorDefinitions:[]};F.save(db,factor('mechanic','Cơ khí',10),'scope-cut');F.save(db,factor('tmc','Thang máng cáp',30),'scope-cut');
 db.rates[0].factors.push({...factor('disabled','Thang máng cáp',7),enabled:false});const before=C.copy(db.quote);F.applyMatrix(db,[],[{key:'mechanic',target:'scope-cut'}]);A.deepEqual(db.rates[0].factors.map(x=>x.id),['tmc','disabled']);A.deepEqual(db.quote,before);
 const old=JSON.stringify(db);A.throws(()=>F.applyMatrix(db,[{key:'tmc',target:'only-mech'}]),/không phù hợp nhóm/);A.equal(JSON.stringify(db),old);
 F.applyMatrix(db,[{key:'mechanic',target:'only-mech'}],[{key:'mechanic',target:'only-mech'}]);A.deepEqual(db.rates[0].factors.map(x=>x.id),['tmc','disabled']);
 A.throws(()=>CV.remove(db,'productGroups','Cơ khí'),/Đang dùng/);
});
test('custom group package methods work and malformed scopes cannot pass validation',()=>{
 const r={id:'door',name:'Gia công cửa gió',productGroups:['Cửa gió'],inside:100,outside:200,unit:'cái',priceOptions:[{id:'opt-package',name:'Trọn công đoạn',method:'fixed',inside:45000,outside:60000,insideUnit:'gói',outsideUnit:'gói',fixedScope:'unit'}]};
 A.equal(W.operation(r,{mode:'inside',priceOptionId:'opt-package'},{productGroup:'Cửa gió'},{count:3},P.tier).cost,135000);
 for(const bad of ['Cơ khí',[''],['Cơ khí','Cơ khí'],[42]])A.throws(()=>W.validatePriceOptions({...r,productGroups:bad}),/Nhóm sản phẩm/);
 A.throws(()=>W.validatePriceOptions({...r,factors:[factor('wrong','Cơ khí',10)]}),/không thuộc nhóm/);
});
test('mixed quotation prices each material by inherited group without changing saved snapshots',()=>{
 const db=P.demoSeed();db.quote.products[0].productGroup='Cơ khí';db.quote.products[1].productGroup='Thang máng cáp';const r=db.quote.ratesSnapshot.find(x=>x.id==='cut');r.factors=rate.factors;
 const before=JSON.stringify(db.quote),res=P.calculate(db);for(const product of db.quote.products){const node=C.flatten([product]).find(n=>n.ops?.some(o=>o.id==='cut'));const index=node.ops.findIndex(o=>o.id==='cut'),work=res.nodes[node.id].ownOps[index];A.equal(work.rate,r.inside*(product.productGroup==='Cơ khí'?1.1:1.3));}
 A.equal(JSON.stringify(db.quote),before);
});

test('server round trip preserves scoped catalog and quotation; restricted staff cannot rewrite scope',async t=>{
 const {createApp}=require('../server/app.cjs'),app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,auth){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(auth?{Cookie:auth.cookie,'X-CSRF-Token':auth.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin test',role:'admin',password:'Scope-test-only-42!'});A.equal(admin.status,201);
 let master=(await call('catalog','GET',undefined,admin)).data;master.catalog.rates[0].productGroups=['Cơ khí'];master.catalog.rates[0].factors=[factor('scope-test','Cơ khí',12)];
 let saved=await call('catalog','PUT',{expectedVersion:master.version,catalog:master.catalog},admin);A.equal(saved.status,200,JSON.stringify(saved.data));master=(await call('catalog','GET',undefined,admin)).data;A.deepEqual(master.catalog.rates[0].productGroups,['Cơ khí']);A.deepEqual(master.catalog.rates[0].factors[0].productGroups,['Cơ khí']);
 const d=P.demoSeed();d.rates=master.catalog.rates;d.quote.ratesSnapshot=C.copy(d.rates);d.quote.products.forEach(p=>p.productGroup='Cơ khí');const created=await call('quotes','POST',{document:d},admin);A.equal(created.status,201,JSON.stringify(created.data));const id=created.data.id;
 let record=(await call('quotes/'+id,'GET',undefined,admin)).data;A.deepEqual(record.document.quote.ratesSnapshot[0].productGroups,['Cơ khí']);
 const account={username:'operator',name:'Operator',role:'estimator',password:'Scope-test-only-43!',sections:['operations']};A.equal((await call('users','POST',account,admin)).status,201);const user=await call('login','POST',account);
 record.document.quote.ratesSnapshot[0].productGroups=[];A.equal((await call('quotes/'+id,'PUT',{document:record.document,expectedVersion:record.version},user)).status,403);
 master.catalog.rates[0].productGroups='bad';A.equal((await call('catalog','PUT',{expectedVersion:master.version,catalog:master.catalog},admin)).status,400);
});
