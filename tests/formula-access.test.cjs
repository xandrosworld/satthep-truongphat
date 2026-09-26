'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs'),P=require('../pricing-core.js'),C=require('../core.js'),E=require('../shape-expression-core.js');
const password='Formula-permissions-test-42!';
async function harness(t){const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 const call=async(route,method='GET',body,session)=>{const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),raw=await r.json(),data=raw.__formulaProtected?raw.value:raw;return {status:r.status,data,raw,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password});
 const create=async(name,rights={})=>{const body={username:name,name,password,role:'estimator',...rights};const u=await call('users','POST',body,admin);A.equal(u.status,201,JSON.stringify(u.data));return {id:u.data.id,body,session:await call('login','POST',{username:name,password})};};
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
 const added=await call('users','POST',{username:'templated',name:'Template',password,roleTemplateId:role.data.id},admin);A.equal(added.status,201);
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
 const made=await call('quotes','POST',{document:P.demoSeed()},admin),id=made.data.id;
 A.equal((await call('formulas/locks','POST',{key:'calculationFactors:all',locked:true,expectedVersion:0,reason:'Protect master'},admin)).status,200);
 const doc=(await call('quotes/'+id,'GET',undefined,u.session)).data.document;doc.quote.pricing.overhead=2;doc.quote.pricing.management=3;doc.quote.pricing.profit=10;doc.quote.pricing.processing=3;doc.quote.pricing.incoming=450000;
 const saved=await call('quotes/'+id,'PUT',{document:doc,expectedVersion:1},u.session);A.equal(saved.status,200,JSON.stringify(saved.data));
 const actual=(await call('quotes/'+id,'GET',undefined,admin)).data.document;A.equal(actual.quote.pricing.overhead,2);A.equal(actual.quote.pricing.incoming,450000);
 const forbidden=(await call('quotes/'+id,'GET',undefined,v.session)).data.document;forbidden.quote.pricing.overhead=9;A.equal((await call('quotes/'+id,'PUT',{document:forbidden,expectedVersion:2},v.session)).status,403);
 const master=(await call('catalog','GET',undefined,u.session)).data;master.catalog.pricingDefaults.overhead=9;A.equal((await call('catalog','PUT',{catalog:master.catalog,expectedVersion:master.version},u.session)).status,403);
});
