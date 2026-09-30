'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),C=require('../core.js'),E=require('../shape-expression-core.js');
const password='Formula-permissions-test-42!';
async function harness(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 const call=async(route,method='GET',body,session)=>{const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),raw=await r.json(),data=raw.__formulaProtected?raw.value:raw;return {status:r.status,data,raw,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password});
 const create=async(name,rights={})=>{const body={username:name,name,password,role:'estimator',...rights};const u={data:await require('./helpers/personnel-user.cjs')(call,admin,body,{direct:true})};return {id:u.data.id,body,session:await call('login','POST',{username:name,password})};};
 const grant=async(u,flags)=>{Object.assign(u.body,flags);const r=await call('users/'+u.id+'/access','POST',u.body,admin);A.equal(r.status,200,JSON.stringify(r.data));u.session=await call('login','POST',{username:u.body.username,password});};
 return {...app,call,admin,create,grant};
}
test('formula use without view: opaque transport, numeric evaluation, server save and grant/revoke',async t=>{
 const {call,admin,create,grant}=await harness(t),u=await create('useonly',{canFormulaUse:true,canFormulaView:false,canFormulaEdit:false});
 const document=P.demoSeed();const made=await call('quotes','POST',{document},admin);A.equal(made.status,201);
 const record=await call('quotes/'+made.data.id,'GET',undefined,u.session);A.equal(record.raw.__formulaProtected,true);const tray=record.data.document.rules.find(x=>x.id==='tray');A.match(tray.width,/^__TPF_/);A.ok(!JSON.stringify(record.raw).includes('W + 2 * H + 2 * F'));
 const vars={W:400,H:80,F:20};A.deepEqual((await call('formulas/evaluate','POST',{token:tray.width,variables:vars},u.session)).data,{value:600});
 A.deepEqual((await call('formulas/evaluate','POST',{token:tray.width,variables:{W:[0,1],H:[0,1],F:[0,1]},mode:'dimension'},u.session)).data.value,{d:[0,1],literal:false});
 const other=await create('other',{canFormulaView:false});A.equal((await call('formulas/evaluate','POST',{token:tray.width,variables:vars},other.session)).status,403);
 for(const variables of [42,[],{W:[]},{W:'1; process.exit()'},null])A.equal((await call('formulas/evaluate','POST',{token:tray.width,variables},u.session)).status,400);
 const d=record.data.document,leaf=C.flatten(d.quote.products).find(n=>n.rule==='tray');leaf.dims.W=400;
 const saved=await call('quotes/'+made.data.id,'PUT',{document:d,expectedVersion:1},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));
 const actual=(await call('quotes/'+made.data.id,'GET',undefined,admin)).data.document;A.equal(C.flatten(actual.quote.products).find(n=>n.id===leaf.id).ruleSpec.width,document.rules.find(r=>r.id==='tray').width);
 leaf.ruleSpec.width='W + 100';A.equal((await call('quotes/'+made.data.id,'PUT',{document:d,expectedVersion:2},u.session)).status,403);
 const old=u.session;await grant(u,{canFormulaUse:false});A.equal((await call('me','GET',undefined,old)).status,401);A.equal((await call('formulas/evaluate','POST',{token:tray.width,variables:vars},u.session)).status,403);
 await grant(u,{canFormulaView:true});A.equal((await call('quotes/'+made.data.id,'GET',undefined,u.session)).data.document.rules.find(r=>r.id==='tray').width,'W + 2 * H + 2 * F');
 await grant(u,{canFormulaUse:true,canFormulaEdit:true});A.equal((await call('quotes/'+made.data.id,'PUT',{document:d,expectedVersion:2},u.session)).status,200);
});
test('locked formula cannot change via catalog, quotation or library; lock CAS and admin-only unlock',async t=>{
 const {call,admin,create,grant}=await harness(t),u=await create('editor',{canFormulaEdit:true,canFormulaUnlock:false,sections:require('../section-access.js').keys});
 let r=await call('formulas/locks','POST',{key:'rules:tray',locked:true,expectedVersion:0,reason:'Chốt công thức'},admin);A.equal(r.status,200);
 A.equal((await call('formulas/locks','POST',{key:'rules:tray',locked:false,expectedVersion:0,reason:'Stale'},admin)).status,409);
 const record=(await call('catalog','GET',undefined,admin)).data,changed=structuredClone(record.catalog);changed.rules.find(r=>r.id==='tray').width='W + H';
 A.equal((await call('catalog','PUT',{catalog:changed,expectedVersion:record.version},u.session)).status,403);
 A.equal((await call('catalog','PUT',{catalog:changed,expectedVersion:record.version},admin)).status,403);
 const removed=structuredClone(record.catalog);removed.rules=removed.rules.filter(r=>r.id!=='tray');A.equal((await call('catalog','PUT',{catalog:removed,expectedVersion:record.version},admin)).status,403);
 const library=structuredClone(record.catalog);C.flatten(library.library).find(n=>n.rule==='tray').ruleSpec.width='W + H';A.equal((await call('catalog','PUT',{catalog:library,expectedVersion:record.version},u.session)).status,403);
 const doc=P.demoSeed(),q=await call('quotes','POST',{document:doc},admin);const leaf=C.flatten(doc.quote.products).find(n=>n.rule==='tray');leaf.ruleSpec.width='W + H';
 A.equal((await call('quotes/'+q.data.id,'PUT',{document:doc,expectedVersion:1},u.session)).status,403);
 A.equal((await call('formulas/locks','POST',{key:'rules:tray',locked:false,expectedVersion:1,reason:'Không được cấp'},u.session)).status,403);
 await grant(u,{canFormulaUnlock:true});A.equal(u.session.data.permissions.formulaUnlock,false);A.equal((await call('quotes/'+q.data.id,'PUT',{document:doc,expectedVersion:1},u.session)).status,403);
 A.equal((await call('formulas/locks','POST',{key:'rules:tray',locked:false,expectedVersion:1,reason:'Được ủy quyền'},u.session)).status,403);
 A.equal((await call('formulas/locks','POST',{key:'rules:tray',locked:false,expectedVersion:1,reason:'Admin mở'},admin)).status,200);
 await grant(u,{canFormulaUnlock:false});A.equal((await call('catalog','PUT',{catalog:changed,expectedVersion:record.version},u.session)).status,200);
});
test('approved quote requires approver authorization; draft restore grants and scopes remain enforced',async t=>{
 const {call,admin,create,grant}=await harness(t),u=await create('maker'),tech=await create('tech',{role:'technical',technicalDelegation:true,canViewCosts:false,canEditFactors:false,sections:['bom'],canReopen:true});
 const document=P.demoSeed(),made=await call('quotes','POST',{document},admin),id=made.data.id;
 A.equal((await call('quotes/'+id+'/submit','POST',{expectedVersion:1},admin)).status,200);A.equal((await call('quotes/'+id+'/approve','POST',{expectedVersion:2},admin)).status,200);
 A.equal((await call('quotes/'+id,'PUT',{document,expectedVersion:3},u.session)).status,409);
 for(const a of ['reopen','restore'])A.equal((await call('quotes/'+id+'/'+a,'POST',{expectedVersion:3,sourceVersion:1,reason:'Test'},u.session)).status,403);
 A.equal((await call('quotes/'+id+'/reopen','POST',{expectedVersion:3},tech.session)).status,403);
 A.equal((await call('quotes/'+id+'/reopen','POST',{expectedVersion:3,reason:'Kỹ thuật sửa theo yêu cầu'},tech.session)).status,403);const r=await call('quotes/'+id+'/reopen','POST',{expectedVersion:3,reason:'Cho kỹ thuật sửa theo yêu cầu'},admin);A.equal(r.status,200,JSON.stringify(r.data));A.equal(r.data.version,4);
 const original=(await call('quotes/'+id+'/revision/3','GET',undefined,admin)).data;A.equal(original.status,'approved');A.equal(original.readOnly,true);
 const d=(await call('quotes/'+id,'GET',undefined,tech.session)).data.document;d.quote.customer='Not allowed';A.equal((await call('quotes/'+id,'PUT',{document:d,expectedVersion:4},tech.session)).status,403);
 await grant(u,{canReopen:true});A.equal((await call('quotes/'+id+'/restore','POST',{expectedVersion:4,sourceVersion:3,reason:'Tạo bản sửa'},u.session)).status,200);
 await grant(u,{canReopen:false});A.equal((await call('quotes/'+id+'/restore','POST',{expectedVersion:5,sourceVersion:3,reason:'Đã thu hồi'},u.session)).status,403);
});
test('reopened quote accepts logistics edits with stale masked history and preserves approved revision',async t=>{
 const {call,admin,create}=await harness(t),u=await create('logistics',{sections:['logistics'],canEditFactors:false,canReopen:true});
 const id=(await call('quotes','POST',{document:P.demoSeed()},admin)).data.id;
 A.equal((await call('quotes/'+id+'/submit','POST',{expectedVersion:1},admin)).status,200);
 A.equal((await call('quotes/'+id+'/approve','POST',{expectedVersion:2},admin)).status,200);
 const original=(await call('quotes/'+id+'/revision/3','GET',undefined,admin)).data;
 A.equal((await call('formulas/locks','POST',{key:'calculationFactors:all',locked:true,reason:'Test protected factors',expectedVersion:0},admin)).status,200);
 A.equal((await call('quotes/'+id+'/reopen','POST',{expectedVersion:3,reason:'Update delivery'},u.session)).status,403);A.equal((await call('quotes/'+id+'/corrections','POST',{action:'request',sections:['logistics'],expectedVersion:3,reason:'Update delivery'},admin)).status,200);
 const view=(await call('quotes/'+id,'GET',undefined,u.session)).data;
 view.document.quote.pricing.delivery+=1234;
 view.document.quote.changeHistory.push({actor:'old browser',kind:'local pricing history',after:{delivery:1234}});
 const saved=await call('quotes/'+id,'PUT',{document:view.document,expectedVersion:view.version},u.session);
 A.equal(saved.status,200,JSON.stringify(saved.data));
 const full=(await call('quotes/'+id,'GET',undefined,admin)).data;
 A.equal(full.document.quote.pricing.delivery,view.document.quote.pricing.delivery);
 A.equal(full.document.quote.changeHistory.some(x=>x.actor==='old browser'),false);
 A.equal(full.document.quote.changeHistory.at(-1).actor,'logistics');
 A.deepEqual((await call('quotes/'+id+'/revision/3','GET',undefined,admin)).data.document,original.document);
});

test('invalid permission update is atomic; role templates carry separate grants',async t=>{
 const {call,admin,create}=await harness(t),u=await create('roles');
 A.equal((await call('users/'+u.id+'/access','POST',{...u.body,role:'invalid',canReopen:true},admin)).status,400);
 A.equal((await call('me','GET',undefined,u.session)).data.permissions.reopen,false);
 const role=await call('roles','POST',{name:'Dùng công thức kín',role:'technical',sections:['bom'],canFormulaUse:true,canFormulaView:false,canFormulaEdit:false,canFormulaUnlock:false,canReopen:true},admin);A.equal(role.status,201);
 await require('./helpers/personnel-user.cjs')(call,admin,{username:'templated',name:'Template',password,roleTemplateId:role.data.id},{direct:true});
 const login=await call('login','POST',{username:'templated',password});A.equal(login.data.permissions.formulaView,false);A.equal(login.data.permissions.reopen,true);
});
test('technical without prices or formula visibility can save dimensions; formula removal and revoked use are rejected',async t=>{
 const {call,admin,create,grant}=await harness(t),u=await create('technicaluse',{role:'technical',technicalDelegation:true,sections:['bom','catalogRules'],canViewCosts:false,canFormulaUse:true,canFormulaView:false,canFormulaEdit:false});
 A.equal((await call('formulas/locks','POST',{key:'calculationFactors:all',locked:true,expectedVersion:0,reason:'Technical can still work'},admin)).status,200);
 const document=P.demoSeed(),node=C.flatten(document.quote.products).find(n=>n.rule==='tray');node.dimensionLinks={L:{mode:'formula',expression:'PRODUCT_L'}};
 const made=await call('quotes','POST',{document},admin);A.equal(made.status,201,JSON.stringify(made.data));
 let record=(await call('quotes/'+made.data.id,'GET',undefined,u.session)).data,leaf=C.flatten(record.document.quote.products).find(n=>n.id===node.id);A.equal(leaf.spec.price,0);A.match(leaf.ruleSpec.width,/^__TPF_/);leaf.dims.W=410;
 let saved=await call('quotes/'+made.data.id,'PUT',{document:record.document,expectedVersion:1},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));A.equal(saved.data.total,undefined);
 record=(await call('quotes/'+made.data.id,'GET',undefined,u.session)).data;leaf=C.flatten(record.document.quote.products).find(n=>n.id===node.id);delete leaf.dimensionLinks;A.equal((await call('quotes/'+made.data.id,'PUT',{document:record.document,expectedVersion:2},u.session)).status,403);
 await grant(u,{canFormulaUse:false});record=(await call('quotes/'+made.data.id,'GET',undefined,u.session)).data;C.flatten(record.document.quote.products).find(n=>n.id===node.id).dims.W=420;A.equal((await call('quotes/'+made.data.id,'PUT',{document:record.document,expectedVersion:2},u.session)).status,403);
});

test('factor lock covers values, removal, bindings and quote snapshots; only admin bypasses',async t=>{
 const {call,admin,create}=await harness(t),u=await create('factor-editor',{canFormulaEdit:true,canFormulaUnlock:true,canEditFactors:true,sections:require('../section-access.js').keys});
 const catalog=(await call('catalog','GET',undefined,admin)).data;
 A.ok((await call('formulas/locks','GET',undefined,admin)).data.some(r=>r.key==='calculationFactors:all'));
 A.equal((await call('formulas/locks','POST',{key:'calculationFactors:all',locked:true,expectedVersion:0,reason:'Chốt hệ số'},admin)).status,200);
 for(const change of [d=>d.pricingDefaults.tmcLoss=9,d=>d.pricingDefaults.factorDefinitions=[{id:'forged',name:'Fake',param:'T',tiers:[]}],d=>d.rates[0].factors=[{id:'fake',tiers:[]}]] ){
  const changed=structuredClone(catalog.catalog);change(changed);A.equal((await call('catalog','PUT',{catalog:changed,expectedVersion:catalog.version},u.session)).status,403);
 }
 const doc=P.demoSeed(),made=await call('quotes','POST',{document:doc},admin);A.equal(made.status,201);
 const current=(await call('quotes/'+made.data.id,'GET',undefined,u.session)).data.document;current.quote.products[0].qty+=1;
 A.equal((await call('quotes/'+made.data.id,'PUT',{document:current,expectedVersion:1},u.session)).status,200);
 const forged=structuredClone(current),owner=C.flatten(forged.quote.products).find(n=>n.ops?.length);owner.ops[0].complexity={label:'Tự nhập',multiplier:9};delete owner.ops[0].complexityChoice;A.equal((await call('quotes/'+made.data.id,'PUT',{document:forged,expectedVersion:2},u.session)).status,403);
 current.quote.pricing.tmcLoss=9;A.equal((await call('quotes/'+made.data.id,'PUT',{document:current,expectedVersion:2},u.session)).status,403);
 A.equal((await call('formulas/locks','POST',{key:'calculationFactors:all',locked:false,expectedVersion:1,reason:'Forged delegated right'},u.session)).status,403);
 A.equal((await call('formulas/locks','POST',{key:'calculationFactors:all',locked:false,expectedVersion:1,reason:'Admin sửa'},admin)).status,200);
 const unlocked=(await call('quotes/'+made.data.id,'GET',undefined,u.session)).data;unlocked.document.quote.pricing.tmcLoss=9;A.equal((await call('quotes/'+made.data.id,'PUT',{document:unlocked.document,expectedVersion:unlocked.version},u.session)).status,200);
});
test('locked factor snapshots allow only authoritative rate additions, never combined edits',async t=>{
 const {sql}=await harness(t),F=require('../server/formula-access.cjs');
 const before=P.demoSeed(),master=JSON.parse(sql.prepare('SELECT document FROM catalog WHERE id=1').get().document);
 const source=master.rates.find(r=>r.factors?.length);A.ok(source);
 const added={...structuredClone(source),id:'published-extra'};master.rates.push(added);
 sql.prepare('UPDATE catalog SET document=? WHERE id=1').run(JSON.stringify(master));
 sql.prepare('INSERT INTO formula_locks VALUES(?,?,?,?,?)').run('calculationFactors:all',1,1,'admin',new Date().toISOString());
 const guard=F.createFormulaAccess({sql,fail:(status,message)=>{throw Object.assign(Error(message),{status});}}).guard;
 const rights={formulaUse:true,formulaEdit:true,formulaUnlock:false};
 const after=structuredClone(before);after.quote.ratesSnapshot.push(added);
 A.doesNotThrow(()=>guard(before,after,rights));
 for(const mutate of [d=>d.quote.ratesSnapshot.at(-1).factors[0].name='Forged',d=>d.quote.ratesSnapshot[0].factors=[],d=>d.quote.pricing.overhead=999,d=>d.quote.ratesSnapshot.splice(0,1)]){
  const bad=structuredClone(after);mutate(bad);A.throws(()=>guard(before,bad,rights),e=>e.status===403);
 }
});
test('authorized quote coefficients remain editable under shared formula lock; master and unauthorized values stay protected',async t=>{
 const {call,admin,create}=await harness(t),u=await create('quote-factors',{canEditFactors:true,sections:require('../section-access.js').keys}),v=await create('no-factors',{canEditFactors:false,sections:['materials']});
 const source=P.demoSeed();source.quote.pricing.productionFactors=[{id:'cost-prod',name:'Chi phí sản xuất',percent:1,enabled:true}];source.quote.pricing.salesFactors=[{id:'cost-other',name:'Điều chỉnh',percent:1,enabled:true}];const made=await call('quotes','POST',{document:source},admin),id=made.data.id;
 A.equal((await call('formulas/locks','POST',{key:'calculationFactors:all',locked:true,expectedVersion:0,reason:'Protect master'},admin)).status,200);
 const doc=(await call('quotes/'+id,'GET',undefined,u.session)).data.document;doc.quote.pricing.overhead=2;doc.quote.pricing.management=3;doc.quote.pricing.profit=10;doc.quote.pricing.processing=3;doc.quote.pricing.incoming=450000;doc.quote.pricing.productionFactors=[{id:'cost-prod',name:'Chi phí sản xuất',percent:3,enabled:true}];doc.quote.pricing.salesFactors=[{id:'cost-other',name:'Điều chỉnh',percent:2,enabled:true}];
 const saved=await call('quotes/'+id,'PUT',{document:doc,expectedVersion:1},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));
 const actual=(await call('quotes/'+id,'GET',undefined,admin)).data.document;A.equal(actual.quote.pricing.overhead,2);A.equal(actual.quote.pricing.incoming,450000);A.equal(actual.quote.pricing.productionFactors[0].percent,3);A.equal(actual.quote.pricing.salesFactors[0].percent,2);
 const forbidden=(await call('quotes/'+id,'GET',undefined,v.session)).data.document;forbidden.quote.pricing.overhead=9;A.equal((await call('quotes/'+id,'PUT',{document:forbidden,expectedVersion:2},v.session)).status,403);
 const master=(await call('catalog','GET',undefined,u.session)).data;master.catalog.pricingDefaults.overhead=9;A.equal((await call('catalog','PUT',{catalog:master.catalog,expectedVersion:master.version},u.session)).status,200);
});
test('legacy masked quote coefficients save with current authority while unchanged secrets and denied fields remain protected',async t=>{
 const {call,admin,create,sql}=await harness(t),u=await create('legacy-factors',{canEditFactors:true,sections:require('../section-access.js').keys});
 const source=P.demoSeed();source.quote.pricing.management=7;
 const made=await call('quotes','POST',{document:source},admin);await call('formulas/locks','POST',{key:'calculationFactors:all',locked:true,expectedVersion:0,reason:'Lock master'},admin);
 const doc=(await call('quotes/'+made.data.id,'GET',undefined,u.session)).data.document,pricing=doc.quote.pricing;
 const token=pricing.__accessRef,ref=JSON.parse(sql.prepare('SELECT value FROM access_refs WHERE token=?').get(token).value);
 for(const k of ['overhead','management']){ref.saved[k]=source.quote.pricing[k];ref.mask[k]=0;pricing[k]=0;}
 sql.prepare('UPDATE access_refs SET value=? WHERE token=?').run(JSON.stringify(ref),token);
 pricing.overhead=2;pricing.incoming=450000;
 const saved=await call('quotes/'+made.data.id,'PUT',{document:doc,expectedVersion:1},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));
 const loaded=(await call('quotes/'+made.data.id,'GET',undefined,admin)).data.document;A.equal(loaded.quote.pricing.overhead,2);A.equal(loaded.quote.pricing.management,7);A.equal(loaded.quote.pricing.incoming,450000);
 const forbidden=structuredClone(doc);forbidden.quote.pricing.tmcLoss=97;A.equal((await call('quotes/'+made.data.id,'PUT',{document:forbidden,expectedVersion:2},u.session)).status,403);
 sql.prepare('UPDATE users SET can_factors=0 WHERE id=?').run(u.id);doc.quote.pricing.overhead=9;A.equal((await call('quotes/'+made.data.id,'PUT',{document:doc,expectedVersion:2},u.session)).status,403);
});

test('old masked coefficient references preserve current quote factors during technical save',async t=>{
 const {call,admin,create}=await harness(t),u=await create('stale-hidden',{canEditFactors:false,sections:require('../section-access.js').keys});
 const source=P.demoSeed();source.quote.pricing.management=7;
 const made=await call('quotes','POST',{document:source},admin),id=made.data.id;
 await call('formulas/locks','POST',{key:'calculationFactors:all',locked:true,expectedVersion:0,reason:'Protect coefficients'},admin);
 const old=(await call('quotes/'+id,'GET',undefined,u.session)).data.document;
 const updated=(await call('quotes/'+id,'GET',undefined,admin)).data.document;updated.quote.pricing.management=3;
 A.equal((await call('quotes/'+id,'PUT',{document:updated,expectedVersion:1},admin)).status,200);
 old.quote.products[0].ops[0].notes='Technical edit from an existing tab';
 A.equal((await call('quotes/'+id,'PUT',{document:old,expectedVersion:1},u.session)).status,409);
 const saved=await call('quotes/'+id,'PUT',{document:old,expectedVersion:2},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));
 const actual=(await call('quotes/'+id,'GET',undefined,admin)).data.document;
 A.equal(actual.quote.pricing.management,3);A.equal(actual.quote.products[0].ops[0].notes,'Technical edit from an existing tab');
 const forged=structuredClone(old);forged.quote.pricing.management=99;
 A.equal((await call('quotes/'+id,'PUT',{document:forged,expectedVersion:3},u.session)).status,403);
 delete forged.quote.pricing.__accessRef;
 A.equal((await call('quotes/'+id,'PUT',{document:forged,expectedVersion:3},u.session)).status,403);
 const stranger=await create('stranger-hidden',{canEditFactors:false,sections:require('../section-access.js').keys});
 A.equal((await call('quotes/'+id,'PUT',{document:old,expectedVersion:3},stranger.session)).status,403);
});

test('masked catalogue rows without references cannot erase locked factors or block technical quote saves',async t=>{
 const {call,admin,create}=await harness(t),u=await create('masked-catalogue',{canEditFactors:false,sections:require('../section-access.js').keys});
 const made=await call('quotes','POST',{document:P.demoSeed()},admin),id=made.data.id;
 await call('formulas/locks','POST',{key:'calculationFactors:all',locked:true,expectedVersion:0,reason:'Lock'},admin);
 const original=(await call('quotes/'+id,'GET',undefined,admin)).data.document;
 const doc=(await call('quotes/'+id,'GET',undefined,u.session)).data.document;
 for(const rate of doc.rates)delete rate.__accessRef;
 doc.quote.products[0].ops[0].notes='Keep this technical edit';
 const saved=await call('quotes/'+id,'PUT',{document:doc,expectedVersion:1},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));
 const actual=(await call('quotes/'+id,'GET',undefined,admin)).data.document;
 A.deepEqual(actual.rates,original.rates);A.deepEqual(actual.quote.pricing,original.quote.pricing);A.deepEqual(actual.quote.ratesSnapshot,original.quote.ratesSnapshot);
 A.equal(actual.quote.products[0].ops[0].notes,'Keep this technical edit');
 for(const edit of [d=>d.rates[0].factors=[{id:'forged',param:'complexity',value:999}],d=>d.rates.pop(),d=>d.rates[0].inside=987654]){
  const bad=structuredClone(doc);edit(bad);A.equal((await call('quotes/'+id,'PUT',{document:bad,expectedVersion:2},u.session)).status,403);
 }
 A.equal((await call('quotes/'+id,'PUT',{document:doc,expectedVersion:1},u.session)).status,409);
});


test('historical catalogue drafts cannot roll back locked declarations during quote saves',async t=>{
 const {call,admin,create,sql}=await harness(t),u=await create('historical-catalog',{canFormulaEdit:false,sections:require('../section-access.js').keys});
 const made=await call('quotes','POST',{document:P.demoSeed()},admin),id=made.data.id;
 const historical=(await call('quotes/'+id,'GET',undefined,admin)).data.document;
 const current=structuredClone(historical);current.rules.find(r=>r.id==='tray').width='W + 222';
 A.equal((await call('quotes/'+id,'PUT',{document:current,expectedVersion:1},admin)).status,200);
 sql.prepare('INSERT INTO catalog_revisions(version,document,updated,actor) VALUES(?,?,?,?)').run(999,JSON.stringify(historical),new Date().toISOString(),'admin');
 await call('formulas/locks','POST',{key:'rules:tray',locked:true,expectedVersion:0,reason:'Protect rule'},admin);
 const doc=(await call('quotes/'+id,'GET',undefined,u.session)).data.document;
 doc.rules=structuredClone(historical.rules);doc.quote.products[0].ops[0].notes='Keep technical change';
 const saved=await call('quotes/'+id,'PUT',{document:doc,expectedVersion:2},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));
 const actual=(await call('quotes/'+id,'GET',undefined,admin)).data.document;
 A.equal(actual.rules.find(r=>r.id==='tray').width,'W + 222');A.equal(actual.quote.products[0].ops[0].notes,'Keep technical change');
 for(const change of [d=>d.rules.find(r=>r.id==='tray').width='W + 987',d=>C.flatten(d.quote.products).find(n=>n.rule==='tray').ruleSpec.width='W + 987']){
  const bad=structuredClone(doc);change(bad);A.equal((await call('quotes/'+id,'PUT',{document:bad,expectedVersion:3},u.session)).status,403);
 }
 A.equal((await call('quotes/'+id,'PUT',{document:doc,expectedVersion:2},u.session)).status,409);
 const catalog=(await call('catalog','GET',undefined,u.session)).data;catalog.catalog.rules.find(r=>r.id==='tray').width='W + 987';
 A.equal((await call('catalog','PUT',{catalog:catalog.catalog,expectedVersion:catalog.version},u.session)).status,403);
});


test('two independent coefficient locks protect catalogues and quote prices while authorized commercial factors stay editable',async t=>{
 const {call,admin,create}=await harness(t),u=await create('split-editor',{canEditFactors:true,canFormulaEdit:true,sections:require('../section-access.js').keys});
 const id=(await call('quotes','POST',{document:P.demoSeed()},admin)).data.id;
 const lock=async(key,locked)=>{const rows=(await call('formulas/locks','GET',undefined,admin)).data,l=rows.find(r=>r.key===key);const r=await call('formulas/locks','POST',{key,locked,expectedVersion:l.version,reason:'Independent lock test'},admin);A.equal(r.status,200,JSON.stringify(r.data));};
 await lock('calculationFactors:all',true);await lock('operationPricing:all',true);
 const master=(await call('catalog','GET',undefined,admin)).data;
 for(const change of [d=>d.rates[0].inside++,d=>d.rates[0].outside++,d=>d.rates[0].priceOptions=[{id:'new',name:'New',method:'unit',inside:1,outside:1,insideUnit:'kg',outsideUnit:'kg'}],d=>d.pricingDefaults.tmcTables[0].tiers[0].price++,d=>d.rates.pop()]){
  const d=structuredClone(master.catalog);change(d);const r=await call('catalog','PUT',{catalog:d,expectedVersion:master.version},admin);A.equal(r.status,403,JSON.stringify(r.data));
 }
 const view=(await call('quotes/'+id,'GET',undefined,u.session)).data;
 const price=structuredClone(view.document);price.quote.ratesSnapshot[0].inside++;
 A.equal((await call('quotes/'+id,'PUT',{document:price,expectedVersion:view.version},u.session)).status,403);
 const adminPrice=(await call('quotes/'+id,'GET',undefined,admin)).data.document;adminPrice.quote.ratesSnapshot[0].inside++;A.equal((await call('quotes/'+id,'PUT',{document:adminPrice,expectedVersion:view.version},admin)).status,403);
 view.document.quote.pricing.management=7;view.document.quote.pricing.profit=12;
 const saved=await call('quotes/'+id,'PUT',{document:view.document,expectedVersion:view.version},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));
 A.equal((await call('quotes/'+id,'GET',undefined,admin)).data.document.quote.pricing.management,7);
 await lock('calculationFactors:all',false);
 let m=(await call('catalog','GET',undefined,admin)).data;m.catalog.rates[0].factors[0].tiers[0].percent++;
 let r=await call('catalog','PUT',{catalog:m.catalog,expectedVersion:m.version},admin);A.equal(r.status,200,JSON.stringify(r.data));
 A.equal((await call('formulas/locks','GET',undefined,admin)).data.find(x=>x.key==='operationPricing:all').locked,1);
 await lock('calculationFactors:all',true);await lock('operationPricing:all',false);
 m=(await call('catalog','GET',undefined,admin)).data;m.catalog.rates[0].inside++;
 r=await call('catalog','PUT',{catalog:m.catalog,expectedVersion:m.version},admin);A.equal(r.status,200,JSON.stringify(r.data));
 A.equal((await call('formulas/locks','GET',undefined,admin)).data.find(x=>x.key==='calculationFactors:all').locked,1);
 A.equal((await call('formulas/locks','POST',{key:'operationPricing:all',locked:true,expectedVersion:0,reason:'stale'},admin)).status,409);
 A.equal((await call('formulas/locks','POST',{key:'operationPricing:all',locked:false,expectedVersion:2,reason:'not authorized'},u.session)).status,403);
});

test('legacy coefficient lock migrates once preserving state and audit provenance across restarts',()=>{
 const {DatabaseSync}=require('node:sqlite'),sql=new DatabaseSync(':memory:'),F=require('../server/formula-access.cjs');
 try{sql.exec('CREATE TABLE users(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE formula_locks(key TEXT PRIMARY KEY,locked INTEGER,version INTEGER,actor TEXT,at TEXT);');
 sql.prepare('INSERT INTO formula_locks VALUES(?,?,?,?,?)').run('calculationFactors:all',1,7,'original-admin','2026-09-29T09:00:00Z');
 F.createFormulaAccess({sql});let row=sql.prepare("SELECT * FROM formula_locks WHERE key='operationPricing:all'").get();A.equal(row.locked,1);A.equal(row.version,7);A.equal(row.actor,'original-admin');A.equal(row.at,'2026-09-29T09:00:00Z');
 sql.exec("UPDATE formula_locks SET locked=0,version=8 WHERE key='operationPricing:all'");F.createFormulaAccess({sql});row=sql.prepare("SELECT * FROM formula_locks WHERE key='operationPricing:all'").get();A.equal(row.locked,0);A.equal(row.version,8);A.equal(sql.prepare("SELECT locked FROM formula_locks WHERE key='calculationFactors:all'").get().locked,1);
 }finally{sql.close();}
});


test('locked operation pricing permits published additions and technical edits but rejects forged options and package prices',async t=>{
 const {sql}=await harness(t),F=require('../server/formula-access.cjs'),master=JSON.parse(sql.prepare('SELECT document FROM catalog WHERE id=1').get().document),before=P.demoSeed();
 const added={...structuredClone(master.rates[0]),id:'published-extra'};master.rates.push(added);sql.prepare('UPDATE catalog SET document=? WHERE id=1').run(JSON.stringify(master));
 sql.exec("UPDATE formula_locks SET locked=1 WHERE key='operationPricing:all'");
 const guard=F.createFormulaAccess({sql,fail:(status,message)=>{throw Object.assign(Error(message),{status});}}).guard,p={formulaUse:true,formulaEdit:true,formulaUnlock:false,factors:true};
 const after=structuredClone(before);after.quote.ratesSnapshot.push(added);after.quote.products[0].ops[0].notes='Technical edit';A.doesNotThrow(()=>guard(before,after,p));
 for(const change of [d=>d.quote.ratesSnapshot.at(-1).inside++,d=>d.quote.ratesSnapshot[0].outside++,d=>d.quote.pricing.tmcTables[0].tiers[0].price++,d=>d.quote.pricing.operationPriceTables=[{id:'forged',tiers:[{price:999}]}],d=>d.quote.pricing.tmcLaborOperation={default:{rate:{id:'fake',inside:999}}}]){const bad=structuredClone(after);change(bad);A.throws(()=>guard(before,bad,p),e=>e.status===403);}
});

test('technical user can save duplicated historical formula snapshots with hidden formulas and retain edit restrictions',async t=>{
 const {call,admin,create}=await harness(t),u=await create('clone-tech',{role:'technical',technicalDelegation:true,canFormulaUse:true,canFormulaView:false,canFormulaEdit:false,canViewCosts:false,sections:['bom','operations']});
 const document=P.demoSeed(),leaf=C.flatten(document.quote.products).find(n=>n.rule==='tray');leaf.ruleSpec.width='W + 2 * H + 2 * F + 7';leaf.rule='historical-tray';leaf.ruleSpec.id='historical-tray';
 const made=await call('quotes','POST',{document},admin);A.equal(made.status,201,JSON.stringify(made.data));
 A.equal((await call('formulas/locks','POST',{key:'rules:tray',locked:true,expectedVersion:0,reason:'Published rule locked'},admin)).status,200);
 const record=await call('quotes/'+made.data.id,'GET',undefined,u.session);A.equal(record.status,200);const d=record.data.document,clone=C.cloneNode(d.quote.products[0]);d.quote.products.push(clone);
 const clonedLeaf=C.flatten([clone]).find(n=>n.rule==='historical-tray');clonedLeaf.dims.L+=10;
 const saved=await call('quotes/'+made.data.id,'PUT',{document:d,expectedVersion:record.data.version},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));
 const full=(await call('quotes/'+made.data.id,'GET',undefined,admin)).data.document;A.equal(full.quote.products.length,document.quote.products.length+1);A.equal(C.flatten(full.quote.products).find(n=>n.id===clonedLeaf.id).ruleSpec.width,leaf.ruleSpec.width);
 clonedLeaf.ruleSpec.width='W + 999';A.equal((await call('quotes/'+made.data.id,'PUT',{document:d,expectedVersion:saved.data.version},u.session)).status,403);
 A.equal((await call('quotes/'+made.data.id,'GET',undefined,admin)).data.version,saved.data.version);
});

test('price staff can persist selected published unit-price pairs under operation lock',async t=>{
 const {call,admin,create,sql}=await harness(t),I=require('../intake-core.js');
 const u=await create('price-unit-sync',{sections:['materials'],canFormulaEdit:false,canFormulaView:true});
 const d=P.demoSeed();for(const n of C.flatten(d.quote.products))n.ops=[];
 const rate=d.quote.ratesSnapshot.find(r=>r.id==='weld');A.ok(rate);
 rate.insideUnit='m';rate.inside=35000;
 d.quote.ratesSnapshot.find(r=>r.id!==rate.id).outside=123456;
 d.quote.products[0].ops=[{id:rate.id,mode:'inside',quantityUnit:'kg',amount:1,basisMode:'auto'}];
 const made=await call('quotes','POST',{document:d},admin);A.equal(made.status,201,JSON.stringify(made.data));
 const master=JSON.parse(sql.prepare('SELECT document FROM catalog WHERE id=1').get().document);
 Object.assign(master.rates.find(r=>r.id===rate.id),{insideUnit:'kg',inside:2000});
 sql.prepare('UPDATE catalog SET document=? WHERE id=1').run(JSON.stringify(master));
 sql.exec("UPDATE formula_locks SET locked=1 WHERE key='operationPricing:all'");
 const read=(await call('quotes/'+made.data.id,'GET',undefined,u.session)).data;
 A.equal(read.operationUnitPrices.find(r=>r.id===rate.id).insideUnit,'kg');
 A.ok(read.operationUnitPrices.every(r=>read.document.quote.ratesSnapshot.some(s=>s.id===r.id)));
 const viewer=await create('unit-viewer',{sections:['customer'],canFormulaView:true});
 A.equal((await call('quotes/'+made.data.id,'GET',undefined,viewer.session)).data.operationUnitPrices,undefined);
 const edited=C.copy(read.document);edited.rates=master.rates;
 I.applyOperationUnitUpdates(edited,I.operationUnitUpdates(edited));
 // Quote transport keeps its old catalogue; only the selected snapshot pair changes.
 edited.rates=read.document.rates;
 for(const alter of [
  q=>q.ratesSnapshot.find(r=>r.id===rate.id).inside=2001,
  q=>q.ratesSnapshot.find(r=>r.id!==rate.id).outside=98765,
  q=>q.ratesSnapshot.find(r=>r.id===rate.id).priceOptions=[{id:'forged',method:'catalog',inside:1}],
  q=>q.ratesSnapshot.find(r=>r.id===rate.id).factors=[]
 ]){
  const bad=C.copy(edited);alter(bad.quote);
  A.ok([400,403].includes((await call('quotes/'+made.data.id,'PUT',{document:bad,expectedVersion:read.version},u.session)).status));
 }
 const saved=await call('quotes/'+made.data.id,'PUT',{document:edited,expectedVersion:read.version},u.session);
 A.equal(saved.status,200,JSON.stringify(saved.data));
 const after=(await call('quotes/'+made.data.id,'GET',undefined,u.session)).data.document;
 const stored=after.quote.ratesSnapshot.find(r=>r.id===rate.id);A.equal(stored.insideUnit,'kg');A.equal(stored.inside,2000);
 A.deepEqual(after.quote.products,read.document.quote.products);
 A.equal(after.quote.ratesSnapshot.find(r=>r.id!==rate.id).outside,123456);
 A.equal(sql.prepare("SELECT locked FROM formula_locks WHERE key='operationPricing:all'").get().locked,1);
});
