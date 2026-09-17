'use strict';
const {test}=require('node:test');
const A=require('node:assert/strict');
const C=require('../core.js');
const P=require('../pricing-core.js');
const {createApp}=require('../server/app.cjs');

const extraRate={id:'qa-template-work',name:'Gia công thử từ mẫu',unit:'kg',inside:1200,outside:2400};
function source(){const db=P.demoSeed();db.quote.ratesSnapshot.push(C.copy(extraRate));db.quote.products[1].ops.push({id:extraRate.id,mode:'inside',amount:1});return db;}
function template(db){const item=C.cloneNode(db.quote.products[1]);item.name='Mẫu khung đủ công đoạn';item.qty=1;item.templateKind='product';return item;}

test('template rate attachment is atomic and preserves existing quote prices',()=>{
 const quote={ratesSnapshot:[{id:'kept',inside:7}]},before=C.copy(quote),node={ops:[{id:'new'},{id:'missing'}]};
 A.throws(()=>C.attachTemplateRates(quote,[{id:'new',inside:8}],node),/chưa có/);A.deepEqual(quote,before);
 C.attachTemplateRates(quote,[{id:'kept',inside:99},{id:'new',inside:8}],{ops:[{id:'kept'},{id:'new'}]});
 A.equal(quote.ratesSnapshot[0].inside,7);A.equal(quote.ratesSnapshot[1].inside,8);
 A.throws(()=>C.attachTemplateRates(quote,[],{ops:[{id:'new',priceOptionId:'opt-deleted'}]}),/phương án giá/);
});

test('saving and reusing TMC templates remaps constituent references without changing the source',()=>{
 const db=P.demoSeed(),node=db.quote.products[0],target=node.children[0];node.tmcBreakdown=[{id:'part',nodeId:target.id,tableId:'tray',width:300,length:2000}];
 const saved=C.cloneNode(node);saved.templateKind='product';const used=C.cloneNode(saved);
 A.equal(node.tmcBreakdown[0].nodeId,target.id);
 A.equal(saved.tmcBreakdown[0].nodeId,saved.children[0].id);
 A.equal(used.tmcBreakdown[0].nodeId,used.children[0].id);
 A.notEqual(used.tmcBreakdown[0].nodeId,saved.tmcBreakdown[0].nodeId);
});

test('shared template publication includes missing work and a new quote receives all operations',()=>{
 const db=source(),master=P.demoSeed(),item=template(db),before=JSON.stringify(master);
 const prepared=C.catalogWithTemplate(master,db,item);
 A.equal(JSON.stringify(master),before);
 A.deepEqual(prepared.added.rates,[extraRate.id]);
 A.ok(prepared.catalog.library.some(t=>t.id===item.id));
 A.ok(prepared.catalog.rates.some(r=>r.id===extraRate.id));
 const fresh=P.demoSeed();fresh.rates=C.copy(prepared.catalog.rates);fresh.quote.products=[];fresh.quote.ratesSnapshot=[];
 const used=C.cloneNode(prepared.catalog.library.at(-1));C.attachTemplateRates(fresh.quote,fresh.rates,used);fresh.quote.products.push(used);
 A.equal(C.flatten([used]).flatMap(n=>n.ops||[]).filter(op=>op.id===extraRate.id).length,1);
 A.ok(fresh.quote.ratesSnapshot.some(r=>r.id===extraRate.id));
 A.notEqual(used.id,item.id);
 A.throws(()=>C.attachTemplateRates({ratesSnapshot:[]},[],used),/chưa có trong danh mục/);
});

test('server publishes a complete template to the master catalogue and the next quote, preserving the first quote',async t=>{
 const app=createApp();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>app.server.close(resolve)));
 const base='http://127.0.0.1:'+app.server.address().port;let session;
 const call=async(route,method='GET',body)=>{const response=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});return {status:response.status,data:await response.json(),cookie:response.headers.get('set-cookie')?.split(';')[0]};};
 const setup=await call('setup','POST',{username:'admin',name:'Template QA',password:'Only-for-template-tests-42!'});A.equal(setup.status,201);session={cookie:setup.cookie,csrf:setup.data.csrf};
 const db=source(),first=await call('quotes','POST',{document:db});A.equal(first.status,201,JSON.stringify(first));
 const firstBefore=(await call('quotes/'+first.data.id)).data.document,master=(await call('catalog')).data,item=template(db),prepared=C.catalogWithTemplate(master.catalog,db,item);
 const invalid=C.copy(prepared.catalog);invalid.rates=invalid.rates.filter(r=>r.id!==extraRate.id);
 A.equal((await call('catalog','PUT',{expectedVersion:master.version,catalog:invalid})).status,400);
 const published=await call('catalog','PUT',{expectedVersion:master.version,catalog:prepared.catalog});A.equal(published.status,200,JSON.stringify(published));
 const common=(await call('catalog')).data;A.ok(common.catalog.library.some(x=>x.id===item.id));A.ok(common.catalog.rates.some(x=>x.id===extraRate.id));
 A.deepEqual((await call('quotes/'+first.data.id)).data.document,firstBefore);
 const next=P.demoSeed();Object.assign(next,C.copy(common.catalog));next.quote={...next.quote,id:'QA-LIBRARY-SECOND',products:[],pricing:C.copy(common.catalog.pricingDefaults),ratesSnapshot:C.copy(common.catalog.rates),expenses:[],status:'draft'};
 const second=await call('quotes','POST',{document:next});A.equal(second.status,201,JSON.stringify(second));
 const loaded=(await call('quotes/'+second.data.id)).data.document,stored=loaded.library.find(x=>x.id===item.id);A.ok(stored);
 const used=C.cloneNode(stored);C.attachTemplateRates(loaded.quote,loaded.rates,used);loaded.quote.products.push(used);
 A.ok(C.flatten([used]).some(n=>(n.ops||[]).some(op=>op.id===extraRate.id)));
 A.ok(P.calculate(loaded).products[0].parts.factory>0);
});
