const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 const groups=await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Norm-groups-test-42!'}));await normsOpen();return RefNorms.data.groups.filter(g=>g.id!=='other');});expect(groups).toHaveLength(15);
 for(const g of groups.filter(g=>g.id!=='loss')){
  await p.locator('[data-norm-tab='+g.id+']').click();await expect(p.locator('[data-norm-purpose]')).toContainText(g.purpose);await p.locator('[data-norm-edit]').first().click();
  for(const [name,value]of Object.entries({name:'QA '+g.name,product:'Sản phẩm A',evidence:'Đợt khảo sát 01; hồ sơ định mức đã xác nhận'}))await p.locator('#dialog [name='+name+']').fill(value);
  if(g.material)await p.locator('#dialog [name=materialId]').selectOption({index:0});
  if(g.operation)await p.locator('#dialog [name=operationRateId]').selectOption({index:0});
  if(g.id==='routing'){const id=await p.evaluate(()=>RefNorms.data.operations[0].id);await p.locator('#dialog [name=sequence]').fill(id+'\n'+id);}
  else await p.locator('#dialog [name=quantity]').fill(g.percent?'0':'2');
  await p.locator('#dialog [type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();await expect(p.locator('#content')).toContainText('QA '+g.name);
 }
 await p.reload();await p.waitForFunction(()=>Team.user);await p.locator('[data-norms-open]').click();expect(await p.evaluate(()=>RefNorms.data.rows.length)).toBe(14);
 await p.locator('[data-norm-tab=routing]').click();await p.locator('[data-norm-history]').click();await expect(p.locator('#dialog')).toContainText('→');await p.evaluate(()=>closeDialog());
 await p.locator('[data-norm-tab=recovery]').click();await p.locator('[data-norm-edit]').last().click();await expect(p.locator('#dialog [name=quantity]')).toHaveValue('0');await expect(p.locator('#dialog [name=unit]')).toHaveAttribute('readonly','');await p.locator('#dialog [name=quantity]').fill('5');await p.locator('#dialog [type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();await p.locator('[data-norm-history]').click();await expect(p.locator('#dialog')).toContainText('v2');await p.evaluate(()=>closeDialog());
 await p.screenshot({path:'artifacts/reference-norm-groups-desktop.png'});
 await p.evaluate(async()=>{
  const d=TPPrice.demoSeed(),q=await teamApi('quotes','POST',{document:d});await teamApi('quotes/'+q.id+'/submit','POST',{expectedVersion:1});await teamApi('quotes/'+q.id+'/approve','POST',{expectedVersion:2});const o=await teamApi('quotes/'+q.id+'/order','POST',{expectedVersion:3,code:'QA-NORM-UI'});await teamApi('orders/'+o.id+'/confirm','POST',{quoteVersion:3});const j=await teamApi('production','POST',{orderId:o.id,productId:d.quote.products[0].id,quantity:1,code:'QA-NORM-UI'});
  const n=RefNorms.data.rows.find(n=>n.category==='routing');await teamApi('ops/norm','POST',{...n,expectedVersion:n.version,requestId:crypto.randomUUID(),product:j.packet.product.name,sequence:j.packet.operations.map(o=>o.rateId)});RefNorms.job=j.id;RefNorms.tab='comparison';await normsOpen();
 });
 await expect(p.locator('#content')).toContainText('Trong định mức');await expect(p.locator('#content')).toContainText('Thứ tự mã nguyên công');await p.screenshot({path:'artifacts/reference-norm-controls-desktop.png'});
 await p.evaluate(async()=>{productionShell().showModal();await productionLoad(RefNorms.job);});await p.getByRole('button',{name:'Định mức & đối chiếu hao hụt',exact:true}).click();await expect(p.locator('[data-norm-job-operation]').first()).toBeVisible();
 await p.locator('[data-norm-tab=loss]').click();await expect(p.locator('[data-norm-edit]')).toHaveCount(0);await expect(p.locator('#content')).toContainText('Báo giá nguồn (%)');
 await p.locator('[data-norm-tab=comparison]').click();const op=await p.evaluate(()=>({operation:RefNorms.data.jobOperations[0],product:RefNorms.data.product.name}));
 await p.locator('[data-norm-job-operation]').first().click();await p.locator('#dialog [name=category]').selectOption('electricity');await p.locator('#dialog [type=submit]').click();
 await expect(p.locator('#dialog [name=product]')).toHaveValue(op.product);await expect(p.locator('#dialog [name=operationRateId]')).toHaveValue(op.operation.rateId);await expect(p.locator('#dialog [name=outputUnit]')).toHaveValue(op.operation.outputUnit);
 await p.locator('#dialog [name=name]').fill('Electricity for operation');await p.locator('#dialog [name=quantity]').fill('1.5');await p.locator('#dialog [name=evidence]').fill('Workshop signed observation');await p.locator('#dialog [type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
 await p.setViewportSize({width:390,height:844});await p.locator('[data-norm-tab=time]').click();await p.locator('[data-norm-edit]').first().click();expect((await p.locator('#dialog').boundingBox()).width).toBeLessThanOrEqual(390);await p.screenshot({path:'artifacts/reference-norm-groups-mobile.png'});expect(errors).toEqual([]);
 console.log('PASS financial/production norms, three-stage loss and job-operation defaults: forms, required scopes, zero percent, ordered repeated operations, persistence, versions/history, mobile');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
