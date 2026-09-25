const {test}=require('node:test'),assert=require('node:assert/strict');
const {createApp}=require('../server/app.cjs'),P=require('../pricing-core.js');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
async function harness(t,databasePath=':memory:'){const app=createApp({databasePath});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+app.server.address().port;t.after(()=>new Promise(r=>app.server.close(r)));return {...app,base};}
async function call(base,route,{method='GET',body,session,headers={}}={}){const r=await fetch(base+'/api/'+route,{method,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],headers:r.headers};}
const account=(username,role='estimator')=>({username,name:username,role,password:'Only-for-local-tests-42!'});

test('server: HTTPS-proxy mode requires an explicit host, secure cookies and private bootstrap key',async t=>{
  assert.throws(()=>createApp({publicOrigin:'http://example.invalid',setupKey:'x'.repeat(30)}));assert.throws(()=>createApp({publicOrigin:'https://example.invalid'}));
  const app=createApp({publicOrigin:'https://example.invalid',setupKey:'Only-for-https-bootstrap-tests-42!'});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
  const request=async(route,body,host='example.invalid',origin='https://example.invalid')=>new Promise((resolve,reject)=>{const req=require('node:http').request(base+'/api/'+route,{method:body?'POST':'GET',headers:{Host:host,Origin:origin,'Content-Type':'application/json'}},res=>{let text='';res.on('data',c=>text+=c);res.on('end',()=>resolve({status:res.statusCode,data:JSON.parse(text),cookie:res.headers['set-cookie']}));});req.on('error',reject);req.end(body?JSON.stringify(body):undefined);});
  assert.equal((await request('status')).data.setupKeyRequired,true);assert.equal((await request('status',null,'attacker.invalid')).status,403);assert.equal((await request('status',null,'example.invalid','http://example.invalid')).status,403);
  assert.equal((await request('setup',account('admin'))).status,403);const created=await request('setup',{...account('admin'),setupKey:'Only-for-https-bootstrap-tests-42!'});assert.equal(created.status,201);assert.ok(created.cookie[0].includes('; Secure'));assert.ok(!JSON.stringify(created.data).includes('bootstrap-tests'));
});

test('server: invalid identifiers and incomplete official issuer cannot be accepted',async t=>{
  const {base}=await harness(t),session=await setup(base);
  for(const id of ['__proto__','constructor','x\" onclick=bad','<script>']){const d=P.demoSeed();d.quote.products[0].id=id;assert.equal((await call(base,'quotes',{method:'POST',session,body:{document:d}})).status,400);}
  const document=P.demoSeed();document.quote.documentMode='official';const q=await call(base,'quotes',{method:'POST',session,body:{document}});assert.equal(q.status,201);assert.equal((await call(base,'quotes/'+q.data.id+'/submit',{method:'POST',session,body:{expectedVersion:1}})).status,422);
});

test('server: public specification describes delivered package, not suppressed finishing',()=>{
  const document=P.demoSeed(),n=document.quote.products[0];n.outsource={enabled:true,supplier:'Private vendor',output:'Giao hoàn chỉnh chưa sơn',materialSupply:'vendor',unit:'cái',price:150000};
  const {publicOffer}=require('../server/access.cjs'),offer=publicOffer(document,P.calculate(document));assert.ok(offer.products[0].specification.includes(n.outsource.output));const finishingName=document.quote.ratesSnapshot.find(r=>r.id===n.ops[0].id).name;assert.ok(!offer.products[0].specification.includes(finishingName));assert.ok(!JSON.stringify(offer).includes('Private vendor'));
  n.ops[0].afterPackage=true;assert.ok(publicOffer(document,P.calculate(document)).products[0].specification.includes(finishingName));
});
async function setup(base){const r=await call(base,'setup',{method:'POST',body:account('admin','admin')});assert.equal(r.status,201);return {cookie:r.cookie,csrf:r.data.csrf,user:r.data.user};}
async function login(base,username){const r=await call(base,'login',{method:'POST',body:account(username)});assert.equal(r.status,200);return {cookie:r.cookie,csrf:r.data.csrf,user:r.data.user};}
test('server: first-run setup, no password defaults, authenticated reads and no credential leakage',async t=>{
  const {base}=await harness(t);assert.equal((await call(base,'status')).data.configured,false);
  assert.equal((await call(base,'quotes')).status,401);
  assert.equal((await call(base,'setup',{method:'POST',body:{...account('admin'),password:'123456'}})).status,400);
  for(const body of [null,[],42,'invalid'])assert.equal((await call(base,'setup',{method:'POST',body})).status,400);
  const admin=await setup(base);assert.ok(admin.cookie.startsWith('tp_session='));
  assert.equal((await call(base,'setup',{method:'POST',body:account('second')})).status,409);
  const me=await call(base,'me',{session:admin});assert.equal(me.data.user.role,'admin');assert.equal(me.data.user.password,undefined);
  assert.equal((await call(base,'login',{method:'POST',body:{...account('admin'),password:'incorrect'}})).status,401);
});
test('server: CSRF, origin, host and static file boundary are enforced',async t=>{
  const {base}=await harness(t),admin=await setup(base);
  assert.equal((await call(base,'users',{method:'POST',session:{...admin,csrf:'wrong'},body:account('maker')})).status,403);
  assert.equal((await call(base,'users',{method:'POST',session:admin,headers:{Origin:'https://foreign.invalid'},body:account('maker')})).status,403);
  const hostile=await new Promise((resolve,reject)=>{const req=require('node:http').get(base+'/api/status',{headers:{Host:'attacker.invalid'}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);});assert.equal(hostile,403);
  for(const file of ['/README.md','/data/truongphat.sqlite','/../package.json','/server/app.cjs'])assert.equal((await fetch(base+file)).status,404);
});
test('server: maker submits, approver approves, approved data immutable, revisions survive changes',async t=>{
  const {base}=await harness(t),admin=await setup(base);
  assert.equal((await call(base,'users',{method:'POST',session:admin,body:{...account('maker'),canReopen:true}})).status,201);
  assert.equal((await call(base,'users',{method:'POST',session:admin,body:account('checker','approver')})).status,201);
  const maker=await login(base,'maker'),checker=await login(base,'checker'),document=P.demoSeed();
  let r=await call(base,'quotes',{method:'POST',session:maker,body:{document}});assert.equal(r.status,201);const id=r.data.id;assert.equal(r.data.total,7126053);
  assert.equal((await call(base,'quotes/'+id,{method:'PUT',session:checker,body:{document,expectedVersion:1}})).status,403);
  assert.equal((await call(base,'quotes/'+id+'/submit',{method:'POST',session:maker,body:{expectedVersion:1}})).status,200);
  assert.equal((await call(base,'quotes/'+id+'/approve',{method:'POST',session:maker,body:{expectedVersion:2}})).status,403);
  assert.equal((await call(base,'quotes/'+id+'/approve',{method:'POST',session:checker,body:{expectedVersion:2}})).status,200);
  assert.equal((await call(base,'quotes/'+id,{method:'PUT',session:maker,body:{document,expectedVersion:3}})).status,409);
  assert.equal((await call(base,'quotes/'+id+'/reopen',{method:'POST',session:maker,body:{expectedVersion:3,reason:'Khách thay số lượng'}})).status,200);
  document.quote.pricing.customer=3;
  assert.equal((await call(base,'quotes/'+id,{method:'PUT',session:maker,body:{document,expectedVersion:4}})).status,200);
  r=await call(base,'quotes/'+id+'/revision/3',{session:checker});assert.equal(r.data.status,'approved');assert.equal(r.data.document.quote.pricing.customer,0);assert.equal(r.data.readOnly,true);
  assert.equal((await call(base,'quotes/'+id+'/revisions',{session:checker})).data.length,5);
});
test('server: optimistic version prevents two editors overwriting one another',async t=>{
  const {base}=await harness(t),session=await setup(base),document=P.demoSeed();const created=await call(base,'quotes',{method:'POST',session,body:{document}}),id=created.data.id;
  const results=await Promise.all([1,2].map(i=>call(base,'quotes/'+id,{method:'PUT',session,body:{document:{...document,quote:{...document.quote,project:'Edit '+i}},expectedVersion:1}})));
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);assert.equal((await call(base,'quotes/'+id+'/revisions',{session})).data.length,2);
});
test('server: invalid calculation cannot submit; server recalculates instead of accepting client total',async t=>{
  const {base}=await harness(t),session=await setup(base),document=P.demoSeed();document.quote.pricing.selected='kg';document.quote.products[0].pricePerKg=null;document.total={grand:1};
  const created=await call(base,'quotes',{method:'POST',session,body:{document}});assert.equal(created.status,201);assert.notEqual(created.data.total,1);
  assert.equal((await call(base,'quotes/'+created.data.id+'/submit',{method:'POST',session,body:{expectedVersion:1}})).status,422);
});
test('server: below-cost approval requires explicit acknowledgement and reason',async t=>{
  const {base}=await harness(t),session=await setup(base),document=P.demoSeed();document.quote.pricing.selected='competitor';document.quote.products.forEach(p=>p.competitorPrice=1);
  const created=await call(base,'quotes',{method:'POST',session,body:{document}}),id=created.data.id;await call(base,'quotes/'+id+'/submit',{method:'POST',session,body:{expectedVersion:1}});
  assert.equal((await call(base,'quotes/'+id+'/approve',{method:'POST',session,body:{expectedVersion:2}})).status,422);
  assert.equal((await call(base,'quotes/'+id+'/approve',{method:'POST',session,body:{expectedVersion:2,acknowledgeBelowCost:true,reason:'Ca thử kiểm tra quyền duyệt'}})).status,200);
});
test('server: account disable invalidates sessions; backup is admin-only and contains no password/session secrets',async t=>{
  const {base}=await harness(t),admin=await setup(base);const user=await call(base,'users',{method:'POST',session:admin,body:account('maker')}),maker=await login(base,'maker');
  assert.equal((await call(base,'backup',{session:maker})).status,403);
  assert.equal((await call(base,'users/'+user.data.id+'/disable',{method:'POST',session:admin,body:{}})).status,200);
  assert.equal((await call(base,'quotes',{session:maker})).status,401);
  const backup=await call(base,'backup',{session:admin});assert.equal(backup.status,200);assert.equal(JSON.stringify(backup.data).includes('Only-for-local-tests'),false);assert.equal(backup.data.sessions,undefined);
  assert.equal((await call(base,'logout',{method:'POST',session:admin,body:{}})).status,200);assert.equal((await call(base,'me',{session:admin})).status,401);
});
test('server: durable quote and revisions remain after closing and reopening SQLite',async t=>{
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'tp-server-test-')),file=path.join(folder,'test.sqlite');
  const first=createApp({databasePath:file});await new Promise(r=>first.server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+first.server.address().port,session=await setup(base);
  const created=await call(base,'quotes',{method:'POST',session,body:{document:P.demoSeed()}});await new Promise(r=>first.server.close(r));
  const second=await harness(t,file),resumed=await login(second.base,'admin');assert.equal((await call(second.base,'quotes/'+created.data.id,{session:resumed})).data.version,1);
  // Test database remains in OS temp for diagnosis; no broad recursive cleanup.
});
test('server: approved order handoff is immutable and idempotent, never duplicates on retry',async t=>{
  const {base}=await harness(t),session=await setup(base),created=await call(base,'quotes',{method:'POST',session,body:{document:P.demoSeed()}}),id=created.data.id;
  assert.equal((await call(base,'quotes/'+id+'/order',{method:'POST',session,body:{expectedVersion:1,code:'DH-001'}})).status,409);
  await call(base,'quotes/'+id+'/submit',{method:'POST',session,body:{expectedVersion:1}});await call(base,'quotes/'+id+'/approve',{method:'POST',session,body:{expectedVersion:2}});
  const first=await call(base,'quotes/'+id+'/order',{method:'POST',session,body:{expectedVersion:3,code:'DH-001'}}),second=await call(base,'quotes/'+id+'/order',{method:'POST',session,body:{expectedVersion:3,code:'DH-001'}});
  assert.equal(first.status,201);assert.equal(second.status,200);assert.equal(first.data.id,second.data.id);assert.equal(second.data.package.baseline.grand,7126053);assert.equal((await call(base,'orders',{session})).data.length,1);
  assert.equal((await call(base,'backup',{session})).data.orders.length,1);
});
test('server: live full backup reopens with accounts, approved revisions and order baseline intact',async t=>{
  const folder=fs.mkdtempSync(path.join(os.tmpdir(),'tp-backup-test-')),file=path.join(folder,'original.sqlite');
  const {base}=await harness(t,file),session=await setup(base),created=await call(base,'quotes',{method:'POST',session,body:{document:P.demoSeed()}}),id=created.data.id;
  await call(base,'quotes/'+id+'/submit',{method:'POST',session,body:{expectedVersion:1}});await call(base,'quotes/'+id+'/approve',{method:'POST',session,body:{expectedVersion:2}});await call(base,'quotes/'+id+'/order',{method:'POST',session,body:{expectedVersion:3,code:'DH-BACKUP'}});
  const target=await require('../server/backup.cjs').backupDatabase(file,path.join(folder,'backups'));assert.notEqual(target,file);
  const restored=await harness(t,target),admin=await login(restored.base,'admin');
  assert.equal((await call(restored.base,'quotes/'+id,{session:admin})).data.status,'approved');
  assert.equal((await call(restored.base,'quotes/'+id+'/revisions',{session:admin})).data.length,3);
  assert.equal((await call(restored.base,'orders',{session:admin})).data.length,1);
  assert.equal((await call(restored.base,'backup',{session:admin})).data.quotes[0].total,7126053);
});
test('server: sales receives only approved offer whitelist, never costs through quote/history/order endpoints',async t=>{
  const {base}=await harness(t),admin=await setup(base);await call(base,'users',{method:'POST',session:admin,body:account('sales','sales')});const sales=await login(base,'sales'),document=P.demoSeed();document.quote.internalMemo='INTERNAL-ONLY-SECRET';document.quote.products[0].privateCostMemo='INTERNAL-ONLY-SECRET';
  const created=await call(base,'quotes',{method:'POST',session:admin,body:{document}}),id=created.data.id;assert.equal((await call(base,'quotes/'+id,{session:sales})).status,403);assert.equal((await call(base,'quotes',{session:sales})).data.length,0);
  await call(base,'quotes/'+id+'/submit',{method:'POST',session:admin,body:{expectedVersion:1}});await call(base,'quotes/'+id+'/approve',{method:'POST',session:admin,body:{expectedVersion:2,reason:'INTERNAL-ONLY-SECRET'}});
  const shown=await call(base,'quotes/'+id,{session:sales});assert.equal(shown.status,200);assert.equal(shown.data.offer.totals.grand,7126053);assert.equal(shown.data.document,undefined);assert.equal(shown.data.offer.products[0].spec,undefined);
  const history=await call(base,'quotes/'+id+'/revisions',{session:sales});assert.equal(history.data.length,1);assert.equal(history.data[0].reason,undefined);assert.equal((await call(base,'quotes/'+id+'/revision/1',{session:sales})).status,403);
  const order=await call(base,'quotes/'+id+'/order',{method:'POST',session:admin,body:{expectedVersion:3,code:'ORDER-SALES'}}),viewOrder=await call(base,'orders/'+order.data.id,{session:sales});assert.equal(viewOrder.data.baseline,undefined);assert.equal(viewOrder.data.materials,undefined);
  for(const data of [shown.data,history.data,viewOrder.data])assert.ok(!JSON.stringify(data).includes('INTERNAL-ONLY-SECRET'));
  for(const route of ['catalog','users','backup','audit'])assert.equal((await call(base,route,{session:sales})).status,403);
  assert.equal((await call(base,'quotes/'+id+'/approve',{method:'POST',session:sales,body:{expectedVersion:3}})).status,403);
  await call(base,'quotes/'+id+'/reopen',{method:'POST',session:admin,body:{expectedVersion:3,reason:'Change'}});document.quote.pricing.customer=90;await call(base,'quotes/'+id,{method:'PUT',session:admin,body:{expectedVersion:4,document}});
  const frozen=await call(base,'quotes/'+id,{session:sales});assert.equal(frozen.data.version,3);assert.equal(frozen.data.offer.totals.grand,7126053);assert.equal((await call(base,'quotes',{session:sales})).data[0].version,3);
});
test('server: factor editing is enforced on updates and new documents, not just hidden UI controls',async t=>{
  const {base}=await harness(t),admin=await setup(base);await call(base,'users',{method:'POST',session:admin,body:{...account('limited'),canEditFactors:false}});const limited=await login(base,'limited'),document=P.demoSeed();
  const created=await call(base,'quotes',{method:'POST',session:limited,body:{document}});assert.equal(created.status,201);document.quote.project='Editable project';assert.equal((await call(base,'quotes/'+created.data.id,{method:'PUT',session:limited,body:{expectedVersion:1,document}})).status,200);
  document.quote.pricing.customer=40;assert.equal((await call(base,'quotes/'+created.data.id,{method:'PUT',session:limited,body:{expectedVersion:2,document}})).status,403);document.quote.id='NEW-WITH-FACTORS';assert.equal((await call(base,'quotes',{method:'POST',session:limited,body:{document}})).status,403);
  document.quote.pricing.customer=0;document.quote.ratesSnapshot[0].factors[0].tiers[0].percent=50;assert.equal((await call(base,'quotes/'+created.data.id,{method:'PUT',session:limited,body:{expectedVersion:2,document}})).status,403);
});
test('server: separate below-cost permission and role changes invalidate previous sessions',async t=>{
  const {base}=await harness(t),admin=await setup(base),createdUser=await call(base,'users',{method:'POST',session:admin,body:account('checker','approver')});let checker=await login(base,'checker');const document=P.demoSeed();document.quote.pricing.selected='competitor';document.quote.products.forEach(p=>p.competitorPrice=1);
  const q=await call(base,'quotes',{method:'POST',session:admin,body:{document}}),id=q.data.id;await call(base,'quotes/'+id+'/submit',{method:'POST',session:admin,body:{expectedVersion:1}});
  assert.equal((await call(base,'quotes/'+id+'/approve',{method:'POST',session:checker,body:{expectedVersion:2,acknowledgeBelowCost:true,reason:'Test'}})).status,403);
  assert.equal((await call(base,'users/'+createdUser.data.id+'/access',{method:'POST',session:admin,body:{role:'approver',canApproveBelowCost:true,canEditFactors:false}})).status,200);assert.equal((await call(base,'me',{session:checker})).status,401);checker=await login(base,'checker');assert.equal((await call(base,'quotes/'+id+'/approve',{method:'POST',session:checker,body:{expectedVersion:2,acknowledgeBelowCost:true,reason:'Approved exception'}})).status,200);
});
test('server: shared catalog has authorization, revisions and CAS without rewriting saved quote prices',async t=>{
  const {base}=await harness(t),admin=await setup(base);await call(base,'users',{method:'POST',session:admin,body:account('maker')});const maker=await login(base,'maker'),initial=await call(base,'catalog',{session:admin});assert.equal(initial.data.version,0);
  const quote=await call(base,'quotes',{method:'POST',session:admin,body:{document:P.demoSeed()}}),catalog=initial.data.catalog;catalog.materials[0].price=77777;
  assert.equal((await call(base,'catalog',{method:'PUT',session:maker,body:{expectedVersion:0,catalog}})).status,403);
  assert.equal((await call(base,'catalog',{method:'PUT',session:admin,body:{expectedVersion:0,catalog}})).status,200);
  assert.equal((await call(base,'catalog',{method:'PUT',session:admin,body:{expectedVersion:0,catalog}})).status,409);
  assert.equal((await call(base,'catalog',{session:maker})).data.catalog.materials[0].price,77777);
  const retained=await call(base,'quotes/'+quote.data.id,{session:admin});assert.equal(retained.data.document.quote.products[0].children[0].children[0].spec.price,20000);
  const backup=await call(base,'backup',{session:admin});assert.equal(backup.data.catalogRevisions.length,1);assert.equal(backup.data.catalog.length,1);
  catalog.materials.push(catalog.materials[0]);assert.equal((await call(base,'catalog',{method:'PUT',session:admin,body:{expectedVersion:1,catalog}})).status,400);
});
test('server: 50 distinct sessions can read and save concurrently without document loss',async t=>{
  const {base}=await harness(t),admin=await setup(base),size=50;
  for(let i=0;i<size;i++)assert.equal((await call(base,'users',{method:'POST',session:admin,body:account('load'+i)})).status,201);
  const sessions=await Promise.all(Array.from({length:size},(_,i)=>login(base,'load'+i))),start=Date.now(),timings=[];
  const quotes=await Promise.all(sessions.map(async(session,i)=>{const document=P.demoSeed();document.quote.id='LOAD-'+i;const at=Date.now(),r=await call(base,'quotes',{method:'POST',session,body:{document}});timings.push(Date.now()-at);assert.equal(r.status,201);return r.data;}));
  const reads=await Promise.all(sessions.map((session,i)=>call(base,'quotes/'+quotes[i].id,{session})));assert.ok(reads.every(r=>r.status===200&&r.data.version===1));assert.equal((await call(base,'quotes',{session:admin})).data.length,size);
  const report={sessions:size,concurrentWrites:size,concurrentReads:size,totalMs:Date.now()-start,p95SaveMs:timings.sort((a,b)=>a-b)[47],environment:'Windows loopback; Node '+process.version,data:'two-product sample per quote',errors:0};
  const directory=path.resolve('artifacts/phase1-2026-09-12');fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'load-50-sessions.json'),JSON.stringify(report,null,2));
});
test('server: commercial tracking is independent, versioned and tied to immutable sent offer',async t=>{
  const {base}=await harness(t),admin=await setup(base);await call(base,'users',{method:'POST',session:admin,body:account('sales','sales')});const sales=await login(base,'sales');const document=P.demoSeed();document.quote.date=require('../completion-core.js').todayVN();document.materialPrices=[{substance:'Thép',grade:'CT3',unit:'kg',price:21000}];let q=await call(base,'quotes',{method:'POST',session:admin,body:{document}}),id=q.data.id;
  const A=assert;A.equal((await call(base,'quotes/'+id+'/workflow',{session:sales})).status,403);await call(base,'quotes/'+id+'/submit',{method:'POST',session:admin,body:{expectedVersion:1}});await call(base,'quotes/'+id+'/approve',{method:'POST',session:admin,body:{expectedVersion:2}});
  await assignOfferSender(base,admin,sales,id);let state=(await call(base,'quotes/'+id+'/workflow',{session:sales})).data;A.equal(state.offerVersion,3);let body={expectedVersion:state.version,careOwnerId:sales.user.id,recipient:'Customer',channel:'Email',offerVersion:3,status:'sent',reason:'Đã chuyển file thử nghiệm',validUntil:state.validUntil};A.equal((await call(base,'quotes/'+id+'/workflow',{method:'POST',session:sales,body})).status,400);body.confirmedSent=true;A.equal((await call(base,'quotes/'+id+'/workflow',{method:'POST',session:sales,body})).status,200);A.equal((await call(base,'quotes/'+id+'/workflow',{method:'POST',session:sales,body})).status,409);
  A.equal((await call(base,'quotes',{session:sales})).data[0].commercialStatus,'sent');A.equal((await call(base,'quotes/'+id,{session:admin})).data.version,3);A.equal((await call(base,'quotes/'+id,{session:sales})).data.document,undefined);
  const reopen=await call(base,'quotes/'+id+'/reopen',{method:'POST',session:admin,body:{expectedVersion:3,reason:'Điều chỉnh'}});A.equal(reopen.status,200);A.equal((await call(base,'quotes/'+id+'/workflow',{session:sales})).data.offerVersion,3);body={...body,status:'accepted',expectedVersion:3};A.equal((await call(base,'quotes/'+id+'/workflow',{method:'POST',session:sales,body})).status,200);
  await call(base,'quotes/'+id+'/submit',{method:'POST',session:admin,body:{expectedVersion:4}});await call(base,'quotes/'+id+'/approve',{method:'POST',session:admin,body:{expectedVersion:5}});state=(await call(base,'quotes/'+id+'/workflow',{session:sales})).data;A.equal(state.status,'draft');A.equal(state.offerVersion,6);A.equal(state.events.length,2);A.equal((await call(base,'quotes/'+id+'/workflow',{method:'POST',session:sales,body:{...body,expectedVersion:2}})).status,409);
  const previous=(await call(base,'quotes/'+id+'/workflow/3',{session:sales})).data;
  A.equal(previous.status,'accepted');A.equal(previous.latestOfferVersion,6);A.deepEqual(previous.approvedVersions,[{version:6},{version:3}]);
  A.equal((await call(base,'quotes/'+id+'/workflow/4',{session:sales})).status,409);
  A.equal((await call(base,'quotes/'+id+'/workflow',{method:'POST',session:sales,body:{...body,status:'negotiating',expectedVersion:5,expectedLatestVersion:3}})).status,409);
  const followup=await call(base,'quotes/'+id+'/workflow',{method:'POST',session:sales,body:{...body,status:'negotiating',expectedVersion:5,expectedLatestVersion:6}});
  A.equal(followup.status,200);A.equal(followup.data.events.at(-1).offerVersion,3);
  A.equal((await call(base,'quotes/'+id+'/workflow',{session:sales})).data.status,'draft');
  const stored=(await call(base,'backup',{session:admin})).data;A.equal(stored.commercial.length,1);A.ok(!JSON.stringify((await call(base,'quotes',{session:sales})).data).includes('materialPrices'));
});

test('server: new catalog codes are reviewable, used codes protected and material reference book persists',async t=>{
  const {base}=await harness(t),admin=await setup(base),d=P.demoSeed();d.materials.push({...d.materials[0],id:'NEW-MATERIAL',name:'Mã mới thử'});const saved=await call(base,'quotes',{method:'POST',session:admin,body:{document:d}});assert.equal(saved.status,201);const candidates=(await call(base,'catalog/candidates',{session:admin})).data;assert.ok(candidates.candidates.some(x=>x.kind==='materials'&&x.item.id==='NEW-MATERIAL'));
  const catalog=candidates.catalog;catalog.materials.push(d.materials.at(-1));catalog.materialPrices=[{substance:'Thép',grade:'CT3',unit:'kg',price:21111}];assert.equal((await call(base,'catalog',{method:'PUT',session:admin,body:{expectedVersion:0,catalog}})).status,200);assert.equal((await call(base,'catalog',{session:admin})).data.catalog.materialPrices[0].price,21111);
  const used=d.quote.products[0].children[0].children[0].materialId;catalog.materials=catalog.materials.filter(x=>x.id!==used);const invalid=await call(base,'catalog',{method:'PUT',session:admin,body:{expectedVersion:1,catalog}});assert.equal(invalid.status,400);assert.match(invalid.data.error,/Không xóa/);
});

test('server: resending pins the immutable offer, audits recipient, rejects stale retries and hides costing',async t=>{
 const {base}=await harness(t),admin=await setup(base);await call(base,'users',{method:'POST',session:admin,body:account('sales','sales')});const sales=await login(base,'sales'),document=P.demoSeed();document.quote.date=require('../completion-core.js').todayVN();
 const created=await call(base,'quotes',{method:'POST',session:admin,body:{document}}),id=created.data.id,route='quotes/'+id;
 assert.equal((await call(base,route+'/submit',{method:'POST',session:admin,body:{expectedVersion:1}})).status,200);assert.equal((await call(base,route+'/approve',{method:'POST',session:admin,body:{expectedVersion:2}})).status,200);
 const original=(await call(base,route+'/revision/3',{session:admin})).data.document;
 await assignOfferSender(base,admin,sales,id);let body={careOwnerId:sales.user.id,status:'sent',offerVersion:3,expectedVersion:2,reason:'Gửi QA',confirmedSent:true,recipient:'Khách QA',channel:'Zalo'};
 assert.equal((await call(base,route+'/workflow',{method:'POST',session:sales,body})).status,200);
 body={...body,expectedVersion:3,resend:true,reason:'Gửi lại QA',channel:'Email'};const resent=await call(base,route+'/workflow',{method:'POST',session:sales,body});assert.equal(resent.status,200);assert.equal(resent.data.events[1].recipient,'Khách QA');assert.equal(resent.data.events[1].channel,'Email');assert.equal(resent.data.events[1].resend,true);
 assert.equal((await call(base,route+'/workflow',{method:'POST',session:sales,body})).status,409);
 assert.deepEqual((await call(base,route+'/revision/3',{session:admin})).data.document,original);
 const visible=(await call(base,route+'/revision/3',{session:sales})).data;assert.equal(visible.document,undefined);assert.ok(visible.offer);assert.ok(!JSON.stringify(visible).includes('ratesSnapshot'));
 const stored=(await call(base,'backup',{session:admin})).data;assert.equal(JSON.parse(stored.commercial[0].document).events.length,2);
});

test('server: quotation nesting plan round-trips and rejects duplicate plan rows',async t=>{
 const {base}=await harness(t),session=await setup(base),document=P.demoSeed(),C=require('../core'),N=require('../nesting-plan-core'),g=C.calculate(document).groups.find(g=>!g.error);
 document.quote.nestingPlans=[N.make(g.rows,g.spec,Number(document.quote.kerf),g.spec.shapeDefinition?.nesting||'bounding')];
 const created=await call(base,'quotes',{method:'POST',session,body:{document}});assert.equal(created.status,201,JSON.stringify(created.data));
 const loaded=await call(base,'quotes/'+created.data.id,{session});assert.deepEqual(loaded.data.document.quote.nestingPlans,document.quote.nestingPlans);
 document.quote.nestingPlans.push(document.quote.nestingPlans[0]);assert.equal((await call(base,'quotes/'+created.data.id,{method:'PUT',session,body:{document,expectedVersion:1}})).status,400);
});

async function assignOfferSender(base,admin,sales,id){const state=(await call(base,'quotes/'+id+'/followup',{session:admin})).data;const response=await call(base,'quotes/'+id+'/followup/assign',{method:'POST',session:admin,body:{expectedVersion:state.revision,offerVersion:state.offerVersion,senderId:sales.user.id,careOwnerId:sales.user.id}});assert.equal(response.status,200,JSON.stringify(response.data));}
