const {chromium,expect}=require('@playwright/test'),path=require('path'),fs=require('fs');
const release=path.resolve(process.env.TECH_INTAKE_RELEASE||'.');
const {createApp}=require(path.join(release,'server/app.cjs'));
(async()=>{
 const app=createApp({staticRoot:path.join(release,'dist')});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true}),url='http://127.0.0.1:'+app.server.address().port,errors=[];
 const admin=await browser.newPage();admin.on('pageerror',e=>errors.push(e.message));
 try{
  await admin.goto(url);await admin.waitForFunction(()=>Team.available);
  const id=await admin.evaluate(async()=>{
   teamSession(await teamApi('setup','POST',{username:'admin',name:'QA',password:'Technical-intake-test-42!'}));
   for(const username of ['reader','editor'])await teamApi('users','POST',{username,name:username,password:'Technical-intake-test-42!',role:'technical',sections:['bom','operations',...(username==='editor'?['customer']:[])]});
   await teamApi('users','POST',{username:'sales',name:'Sales',password:'Technical-intake-test-42!',role:'sales',sections:['customer','commercial']});
   teamSession(await teamApi('login','POST',{username:'sales',password:'Technical-intake-test-42!'}));
   const data=btoa('%PDF-1.4 QA source drawing');
   for(const id of ['source-linked','source-unlinked'])await teamApi('intake/files','POST',{id,name:id+'.pdf',data,size:atob(data).length});
   const document=TPPrice.demoSeed();document.quote.customer='Khách kỹ thuật';document.quote.project='Dự án bóc tách';document.quote.customerInfo={id:'customer-qa',name:'Khách kỹ thuật',contact:'Liên hệ QA',phone:'0123456789'};
   document.quote.products=[];document.quote.request={code:'YC-KT',notes:'Bóc tách theo bản vẽ đính kèm',items:[{id:'REQ-1',name:'Khung theo bản vẽ',specification:'600 x 800 mm',qty:3,unit:'bộ'}],files:[{id:'source-linked',name:'source-linked.pdf',size:atob(data).length,type:'application/pdf',storage:'server'}],links:[{id:'LINK-1',name:'Bản vẽ trên web',url:'https://example.com/drawing.pdf'}]};
   const created=await teamApi('quote-intakes','POST',{customerInfo:document.quote.customerInfo,project:document.quote.project,date:document.quote.date,request:document.quote.request});
   teamSession(await teamApi('login','POST',{username:'admin',password:'Technical-intake-test-42!'}));
   return created.id;
  });
  let before=await admin.evaluate(id=>teamApi('quotes/'+id),id);
  const context=await browser.newContext({acceptDownloads:true}),p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
  await p.goto(url);await p.waitForFunction(()=>Team.available);
  await p.evaluate(async id=>{teamSession(await teamApi('login','POST',{username:'reader',password:'Technical-intake-test-42!'}));await teamLoad(id);},id);
  expect(await p.evaluate(()=>Team.permissions.sectionModes.customer)).toBe('view');
  await p.locator('[data-tab=intake]').click();await expect(p.locator('[data-tab=intake]')).toHaveAttribute('aria-selected','true');
  await expect(p.locator('#content')).toContainText('Dự án bóc tách');await expect(p.locator('#content')).toContainText('Liên hệ QA');await expect(p.locator('#content')).toContainText('600 x 800 mm');
  await expect(p.locator('[data-intake=request],[data-intake=attach],[data-intake=choose-customer]')).toHaveCount(0);
  await expect(p.locator('[data-tab=prices],[data-tab=pricing]')).toHaveCount(0);
  await expect(p.locator('a[href="https://example.com/drawing.pdf"]')).toBeVisible();
  // A colleague updates the same quotation while the technician keeps it open.
  async function remoteInput(note){await admin.evaluate(async({id,note})=>{const q=await teamApi('quotes/'+id);q.document.quote.request.notes=note;q.document.quote.request.links=[{id:'fresh-link',name:'Updated drawing',url:'https://example.com/new-drawing.pdf'}];await teamApi('quotes/'+id,'PUT',{document:q.document,expectedVersion:q.version});},{id,note});}
  await remoteInput('New input from sales');await p.evaluate(()=>teamRefreshIntake(true));await expect(p.locator('.intake-notes')).toContainText('New input from sales');await expect(p.locator('a[href="https://example.com/new-drawing.pdf"]')).toBeVisible();
  await p.evaluate(()=>{Team.dirty=true;db.quote.request.notes='Local work stays';});await remoteInput('Second update from sales');await p.evaluate(()=>teamRefreshIntake(true));expect(await p.evaluate(()=>db.quote.request.notes)).toBe('Local work stays');await expect(p.locator('[data-intake-sync-status]')).toContainText('chưa lưu');
  await p.evaluate(()=>{Team.dirty=false;});await p.evaluate(()=>teamRefreshIntake(true));await expect(p.locator('.intake-notes')).toContainText('Second update from sales');before=await admin.evaluate(id=>teamApi('quotes/'+id),id);

  const downloadPromise=p.waitForEvent('download');await p.locator('[data-intake=file-download]').click();const download=await downloadPromise;expect(fs.readFileSync(await download.path(),'utf8')).toBe('%PDF-1.4 QA source drawing');
  const denied=await p.evaluate(async()=>{const out=[];for(const route of ['intake/files/source-unlinked','intake/customers']){const r=await fetch('/api/'+route);out.push(r.status);}const r=await fetch('/api/intake/files',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':Team.csrf},body:JSON.stringify({})});out.push(r.status);return out;});expect(denied).toEqual([403,403,403]);
  const forged=await p.evaluate(async id=>{const r=await teamApi('quotes/'+id);r.document.quote.request.notes='Not permitted';return (await fetch('/api/quotes/'+id,{method:'PUT',headers:{'Content-Type':'application/json','X-CSRF-Token':Team.csrf},body:JSON.stringify({document:r.document,expectedVersion:r.version})})).status;},id);expect(forged).toBe(403);
  await p.locator('[data-intake=request-products]').click();await p.locator('#dialog button[type=submit]').click();await expect(p.locator('[data-tab=bom]')).toHaveAttribute('aria-selected','true');
  await p.evaluate(()=>teamSave());await p.reload();await p.waitForFunction(()=>Team.available&&Team.user);await p.evaluate(id=>teamLoad(id),id);await p.locator('[data-tab=intake]').click();await expect(p.locator('#content')).toContainText('Đã đưa vào báo giá');
  const after=await admin.evaluate(id=>teamApi('quotes/'+id),id);expect(after.document.quote.products[0].qty).toBe(3);expect(after.document.quote.request).toEqual(before.document.quote.request);expect(after.document.quote.customerInfo).toEqual(before.document.quote.customerInfo);expect(after.document.quote.pricing).toEqual(before.document.quote.pricing);
  await p.evaluate(async()=>{await teamApi('logout','POST');teamSession(await teamApi('login','POST',{username:'editor',password:'Technical-intake-test-42!'}));});await p.evaluate(id=>teamLoad(id),id);await p.locator('[data-tab=intake]').click();
  await expect(p.locator('[data-intake=request]')).toBeVisible();await expect(p.locator('[data-intake=attach]')).toBeVisible();
  await p.locator('[data-intake=request]').click();await p.locator('#dialog [name=notes]').fill('Kỹ thuật đã kiểm tra bản vẽ');await p.locator('#dialog button[type=submit]').click();await p.evaluate(()=>teamSave());
  expect((await admin.evaluate(id=>teamApi('quotes/'+id),id)).document.quote.request.notes).toBe('Kỹ thuật đã kiểm tra bản vẽ');
  expect(errors).toEqual([]);console.log('PASS real technical login: step 1, request/contact/link, PDF download, BOM transfer and server reload; customer editing follows grants; prices/CRM/unlinked files remain restricted');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
