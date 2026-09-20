const {chromium,expect}=require('@playwright/test'),path=require('path'),fs=require('fs');
const release=path.resolve(process.env.COMPLEXITY_RELEASE||'.'),{createApp}=require(path.join(release,'server/app.cjs'));
(async()=>{
 const app=createApp({staticRoot:path.join(release,'dist')});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true}),url='http://127.0.0.1:'+app.server.address().port,errors=[];
 const admin=await browser.newPage({viewport:{width:1440,height:1000}});admin.on('pageerror',e=>errors.push(e.message));let p;
 try{
  await admin.goto(url);await admin.waitForFunction(()=>Team.available);
  const ids=await admin.evaluate(async()=>{
   teamSession(await teamApi('setup','POST',{username:'admin',name:'QA',password:'Complexity-test-only-42!'}));
   for(const [username,sections] of [['technical',['bom','operations']],['reader',['bom']]])await teamApi('users','POST',{username,name:username,password:'Complexity-test-only-42!',role:'technical',sections});
   const d=TPPrice.demoSeed(),n=d.quote.products[0].children[0],other=d.quote.products[1].children[0];
   n.ops=[{id:'cut',mode:'inside',amount:1,pricingMethod:'catalog'},{id:'weld',mode:'outside',amount:2,pricingMethod:'catalog'}];
   for(const rate of d.quote.ratesSnapshot){rate.factors=[];rate.insideUnit=rate.outsideUnit=rate.unit='lần';rate.inside=1000;rate.outside=2000;}
   for(const row of C.flatten(d.quote.products)){row.children??=[];for(const op of row.ops||[])op.instanceId=C.uid();}
   const master=await teamApi('catalog');
   const table={id:'difficulty-shared',name:'Độ phức tạp',param:'complexity',kind:'category',valueMode:'multiplier',categories:[{key:'Dễ',percent:1},{key:'Trung bình',percent:1.2},{key:'Khó',percent:1.5},{key:'Rất khó',percent:1.8}]};master.catalog.pricingDefaults.factorDefinitions=[table];
   master.catalog.rates.find(x=>x.id==='weld').factors=[{...table,id:'difficulty-weld'}];
   await teamApi('catalog','PUT',{catalog:master.catalog,expectedVersion:master.version});
   const q=await teamApi('quotes','POST',{document:d});return {id:q.id,node:n.id,other:other.id};
  });
  const before=await admin.evaluate(id=>teamApi('quotes/'+id),ids.id);
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>Team.available);
  await p.evaluate(async ids=>{teamSession(await teamApi('login','POST',{username:'technical',password:'Complexity-test-only-42!'}));await teamLoad(ids.id);},ids);
  await p.locator('[data-tab=operations]').click();
  const quick=p.locator(`[data-review=complexity-row][data-review-id="${ids.node}"]`);
  await expect(quick).toBeVisible();await quick.click();
  await expect(p.locator('[data-complexity-job]')).toHaveCount(2);await expect(p.locator('#dialog input')).toHaveCount(0);await expect(p.locator('#dialog')).not.toContainText('Hệ số nhân');
  const technicalView=await p.evaluate(id=>teamApi('quotes/'+id),ids.id);
  expect(JSON.stringify(technicalView)).not.toContain('multiplier');expect(JSON.stringify(technicalView)).not.toContain('percent');
  expect(technicalView.document.quote.ratesSnapshot.find(x=>x.id==='cut').complexityLevels.map(x=>x.label)).toEqual(['Dễ','Trung bình','Khó','Rất khó']);
  await p.locator('[name=level-0]').selectOption({label:'Trung bình'});await p.locator('[name=level-1]').selectOption({label:'Khó'});
  fs.mkdirSync('artifacts/customer-review/operation-complexity',{recursive:true});await p.screenshot({path:'artifacts/customer-review/operation-complexity/quick-row.png'});
  await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();await p.evaluate(()=>teamSave());
  const after=await admin.evaluate(id=>teamApi('quotes/'+id),ids.id),calc=await admin.evaluate(d=>{const r=TPPrice.calculate(d);return Object.fromEntries(Object.entries(r.nodes).map(([k,v])=>[k,v.ownOps]));},after.document);
  const find=(d,id)=>{const walk=ns=>ns.flatMap(n=>[n,...walk(n.children||[])]);return walk(d.quote.products).find(n=>n.id===id);};
  const saved=find(after.document,ids.node),old=find(before.document,ids.node);
  expect(saved.ops[0].complexity).toEqual({label:'Trung bình',multiplier:1.2});expect(saved.ops[1].complexity.multiplier).toBe(1.5);
  expect(saved.ops.map(({complexity,complexityChoice,...op})=>op)).toEqual(old.ops);expect(after.document.quote.ratesSnapshot).toEqual(before.document.quote.ratesSnapshot);expect(after.document.quote.pricing).toEqual(before.document.quote.pricing);expect(find(after.document,ids.other)).toEqual(find(before.document,ids.other));
  expect(calc[ids.node][0].rate).toBe(1200);expect(calc[ids.node][1].rate).toBe(3000);expect(calc[ids.node][0].factors.filter(x=>x.param==='complexity')).toHaveLength(1);
  await p.reload();await p.waitForFunction(()=>Team.available&&Team.user);await p.evaluate(id=>teamLoad(id),ids.id);await p.locator('[data-tab=operations]').click();await quick.click();await expect(p.locator('[name=level-0]')).toHaveValue('1');
  await p.locator('#dialog .dialog-head [data-action=close]').click();await p.locator(`[data-review=complexity][data-review-id="${ids.node}"][data-index="0"]`).click();await expect(p.locator('[data-complexity-job]')).toHaveCount(1);await p.locator('[name=level-0]').selectOption({label:'Rất khó'});await p.locator('#dialog button[type=submit]').click();await p.evaluate(()=>teamSave());
  const noLeak=await p.evaluate(id=>teamApi('quotes/'+id),ids.id);expect(JSON.stringify(noLeak)).not.toContain('multiplier');expect(JSON.stringify(noLeak)).not.toContain('percent');
  const denied=await p.evaluate(async ids=>{const out=[];for(const kind of ['number','label','options']){const r=await teamApi('quotes/'+ids.id),op=C.findNode(r.document.quote.products,ids.node).ops[0];if(kind==='number')op.complexity={label:'Rất khó',multiplier:99};if(kind==='label')op.complexityChoice={factorId:'difficulty-shared',label:'Không có'};if(kind==='options')r.document.quote.ratesSnapshot.find(x=>x.id==='cut').complexityLevels.push({factorId:'fake',label:'Giả',groups:[],rateGroups:[]});out.push((await fetch('/api/quotes/'+ids.id,{method:'PUT',headers:{'Content-Type':'application/json','X-CSRF-Token':Team.csrf},body:JSON.stringify({document:r.document,expectedVersion:r.version})})).status);}return out;},ids);expect(denied).toEqual([403,403,403]);
  await p.screenshot({path:'artifacts/customer-review/operation-complexity/matrix.png',fullPage:true});
  await p.setViewportSize({width:390,height:844});await quick.click();expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await p.locator('#dialog .dialog-head [data-action=close]').click();
  const forbidden=await p.evaluate(async ids=>{await teamApi('logout','POST');teamSession(await teamApi('login','POST',{username:'reader',password:'Complexity-test-only-42!'}));const r=await teamApi('quotes/'+ids.id);C.findNode(r.document.quote.products,ids.node).ops[0].complexityChoice={factorId:'difficulty-shared',label:'Dễ'};return (await fetch('/api/quotes/'+ids.id,{method:'PUT',headers:{'Content-Type':'application/json','X-CSRF-Token':Team.csrf},body:JSON.stringify({document:r.document,expectedVersion:r.version})})).status;},ids);expect(forbidden).toBe(403);
  expect(errors).toEqual([]);console.log('PASS technical quick-row and single-job complexity, server save/reload, inside/outside cost applied once, quantity/pricing/siblings preserved, no coefficient in API or dialog; forged coefficient/label/table rejected, operations grant enforced, mobile layout');
 }catch(e){if(p)await p.screenshot({path:'artifacts/customer-review/operation-complexity/failure.png',fullPage:true}).catch(()=>{});throw e;}finally{await browser.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
