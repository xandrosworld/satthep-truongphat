const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1500,height:960}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(20000);
 try{
 await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 const id=await p.evaluate(async()=>{
 teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Nesting-test-123!'}));
 await teamApi('users','POST',{username:'tech',name:'Technical',password:'Nesting-test-123!',role:'technical',sections:['bom','operations']});
 const d=TPPrice.demoSeed(),def={id:'QA-NEST',name:'Rectangle',...TPDefinitions.sheetPreset('rectangle')},m=TPDefinitions.applyShape({id:'VT-00021',name:'Phôi thử',density:7850,unit:'kg',price:100,stockL:3000,stockW:1250},def,{T:0.6});
 const a=TPDefinitions.assign(TPDefinitions.draft('1200 x 750',2400),m,d.rules),b=TPDefinitions.assign(TPDefinitions.draft('600 x 750',1200),m,d.rules);a.dims={L:1200,W:750};b.dims={L:600,W:750};d.quote.products=[{id:'QA-P',kind:'product',name:'Test',qty:1,ops:[],children:[a,b]}];d.quote.kerf=0;d.quote.nestingPlans=[];const q=await teamApi('quotes','POST',{document:d});await teamApi('logout','POST');teamSession(await teamApi('login','POST',{username:'tech',password:'Nesting-test-123!'}));await teamLoad(q.id);tab='waste';render();return q.id;
 });
 await p.locator('[data-me=proposal]').click();
 // Open through the same preset button as the reported screenshot.
 await p.locator('[data-me=nesting-preset][data-mode=bounding]').first().click();
 await expect(p.locator('[name=npEditing]')).toBeVisible();await expect(p.locator('#np-seed')).toBeVisible();expect(await p.locator('[name=npMode] option').count()).toBe(2);
 await p.locator('#np-seed').click();await expect(p.locator('#np-result')).toHaveAttribute('data-valid','true');expect(await p.locator('[data-np-stock]').count()).toBe(20);
 await p.locator('[data-np-page="1"]').click();await expect(p.locator('[data-np-stock="20"]')).toBeVisible();
 await p.locator('[name=npSelected]').selectOption('3599');expect(await p.locator('[data-np-stock]').count()).toBeLessThanOrEqual(20);
 await p.locator('[name=npSelected]').selectOption('0');await expect(p.locator('[data-np-stock="0"]')).toBeVisible();
 const count=await p.evaluate(()=>result.groups[0].layout.stocks.length);
 await p.locator('[name=npStock]').fill(String(count+1));await p.locator('[name=npStock]').dispatchEvent('change');
 for(const name of ['npX','npY']){await p.locator('[name='+name+']').fill('0');await p.locator('[name='+name+']').dispatchEvent('change');}
 await p.locator('[name=npAngle]').fill('0');await p.locator('[name=npAngle]').dispatchEvent('change');await p.locator('[data-np-turn="90"]').click();await expect(p.locator('#np-result')).toHaveAttribute('data-valid','true');
 await p.locator('[name=npX]').fill('3001');await p.locator('[name=npX]').dispatchEvent('change');await expect(p.locator('#dialog button[type=submit]')).toBeDisabled();
 await p.locator('[name=npX]').fill('0');await expect(p.locator('#dialog button[type=submit]')).toBeEnabled();
 await p.locator('[name=npSelected]').dispatchEvent('change');
 const piece=p.locator('[data-np-piece="0"]');await piece.scrollIntoViewIfNeeded();const box=await piece.boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+15,box.y+box.height/2,{steps:3});await p.mouse.up();expect(Number(await p.locator('[name=npX]').inputValue())).toBeGreaterThan(0);await expect(p.locator('#np-result')).toHaveAttribute('data-valid','true');
 await p.setViewportSize({width:390,height:844});expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
 await p.evaluate(()=>teamSave());await p.waitForFunction(()=>!Team.dirty&&!Team.savePending);await p.reload();await p.waitForFunction(()=>Team.user);await p.evaluate(id=>teamLoad(id),id);
 const plan=await p.evaluate(()=>db.quote.nestingPlans[0]);expect(plan.placements.length).toBe(3600);expect(plan.placements[0].angle).toBe(90);expect(plan.placements[0].x).toBeGreaterThan(0);expect(plan.placements[0].stock).toBe(count);
 await p.evaluate(()=>{tab='waste';render();meNesting(0);});await expect(p.locator('[name=npEditing]')).toHaveValue('manual');await expect(p.locator('#np-result')).toHaveAttribute('data-valid','true');
 expect(errors).toEqual([]);console.log('PASS 3600 blanks: preset access, manual paging, 90-degree rotation, bounds guard, server save/reload, mobile');
 }finally{await browser.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
