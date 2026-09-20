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
   const q=await teamApi('quotes','POST',{document:d});return {id:q.id,node:n.id,other:other.id};
  });
  const before=await admin.evaluate(id=>teamApi('quotes/'+id),ids.id);
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.waitForFunction(()=>Team.available);
  await p.evaluate(async ids=>{teamSession(await teamApi('login','POST',{username:'technical',password:'Complexity-test-only-42!'}));await teamLoad(ids.id);},ids);
  await p.locator('[data-tab=operations]').click();
  const quick=p.locator(`[data-review=complexity-row][data-review-id="${ids.node}"]`);
  await expect(quick).toBeVisible();await quick.click();
  await expect(p.locator('[data-complexity-job]')).toHaveCount(2);await expect(p.locator('#dialog [name=method],#dialog [name=unitPrice]')).toHaveCount(0);
  await p.locator('[name=label-0]').fill('Phức tạp');await p.locator('[name=multiplier-0]').fill('1.2');await p.locator('[name=label-1]').fill('Rất phức tạp');await p.locator('[name=multiplier-1]').fill('1.5');
  fs.mkdirSync('artifacts/customer-review/operation-complexity',{recursive:true});await p.screenshot({path:'artifacts/customer-review/operation-complexity/quick-row.png'});
  await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();await p.evaluate(()=>teamSave());
  const after=await admin.evaluate(id=>teamApi('quotes/'+id),ids.id),calc=await admin.evaluate(d=>{const r=TPPrice.calculate(d);return Object.fromEntries(Object.entries(r.nodes).map(([k,v])=>[k,v.ownOps]));},after.document);
  const find=(d,id)=>{const walk=ns=>ns.flatMap(n=>[n,...walk(n.children||[])]);return walk(d.quote.products).find(n=>n.id===id);};
  const saved=find(after.document,ids.node),old=find(before.document,ids.node);
  expect(saved.ops[0].complexity).toEqual({label:'Phức tạp',multiplier:1.2});expect(saved.ops[1].complexity.multiplier).toBe(1.5);
  expect(saved.ops.map(({complexity,...op})=>op)).toEqual(old.ops);expect(after.document.quote.ratesSnapshot).toEqual(before.document.quote.ratesSnapshot);expect(after.document.quote.pricing).toEqual(before.document.quote.pricing);expect(find(after.document,ids.other)).toEqual(find(before.document,ids.other));
  expect(calc[ids.node][0].rate).toBe(1200);expect(calc[ids.node][1].rate).toBe(3000);expect(calc[ids.node][0].factors.filter(x=>x.param==='complexity')).toHaveLength(1);
  await p.reload();await p.waitForFunction(()=>Team.available&&Team.user);await p.evaluate(id=>teamLoad(id),ids.id);await p.locator('[data-tab=operations]').click();await quick.click();await expect(p.locator('[name=multiplier-0]')).toHaveValue('1.2');
  await p.locator('[name=multiplier-0]').fill('2');await p.locator('[name=multiplier-1]').fill('0');await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).toBeVisible();expect(await p.evaluate(id=>C.findNode(db.quote.products,id).ops[0].complexity.multiplier,ids.node)).toBe(1.2);
  await p.locator('#dialog .dialog-head [data-action=close]').click();await p.locator(`[data-review=complexity][data-review-id="${ids.node}"][data-index="0"]`).click();await expect(p.locator('[data-complexity-job]')).toHaveCount(1);await p.locator('[name=multiplier-0]').fill('1.3');await p.locator('#dialog button[type=submit]').click();await p.evaluate(()=>teamSave());
  await p.screenshot({path:'artifacts/customer-review/operation-complexity/matrix.png',fullPage:true});
  await p.setViewportSize({width:390,height:844});await quick.click();expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await p.locator('#dialog .dialog-head [data-action=close]').click();
  const forbidden=await p.evaluate(async ids=>{await teamApi('logout','POST');teamSession(await teamApi('login','POST',{username:'reader',password:'Complexity-test-only-42!'}));const r=await teamApi('quotes/'+ids.id);C.findNode(r.document.quote.products,ids.node).ops[0].complexity={label:'Unauthorized',multiplier:2};return (await fetch('/api/quotes/'+ids.id,{method:'PUT',headers:{'Content-Type':'application/json','X-CSRF-Token':Team.csrf},body:JSON.stringify({document:r.document,expectedVersion:r.version})})).status;},ids);expect(forbidden).toBe(403);
  expect(errors).toEqual([]);console.log('PASS technical quick-row and single-job complexity, server save/reload, inside/outside cost applied once, quantity/pricing/siblings preserved, invalid input atomic, operations grant enforced, mobile layout');
 }catch(e){if(p)await p.screenshot({path:'artifacts/customer-review/operation-complexity/failure.png',fullPage:true}).catch(()=>{});throw e;}finally{await browser.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
