const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Remnant-scope-2026!'}));const d=TPPrice.demoSeed();d.quote.remnantMode='all';const q=await teamApi('quotes','POST',{document:d});await teamApi('quotes/'+q.id+'/submit','POST',{expectedVersion:q.version});await teamApi('quotes/'+q.id+'/corrections','POST',{action:'request',expectedVersion:2,sections:['operations'],reason:'Chỉ sửa nguyên công'});await teamLoad(q.id);tab='waste';MaterialEstimateUI.proposal=true;render();});
 await expect(p.locator('[data-remnant-scope]')).toBeVisible();
 const before=await p.evaluate(()=>JSON.stringify(db.quote.remnantSelections));
 await p.locator('[data-remnant-batch]').first().click();await expect(p.locator('[data-remnant-feedback]')).toContainText('Cần được cho phép');
 expect(await p.evaluate(()=>JSON.stringify(db.quote.remnantSelections))).toBe(before);expect(await p.evaluate(()=>Team.dirty)).toBe(false);
 await p.locator('[data-remnant=piece]').first().click();expect(await p.evaluate(()=>JSON.stringify(db.quote.remnantSelections))).toBe(before);
 await p.locator('[data-remnant=request-scope]').click();await expect(p.locator('[name=sections][value=bom]')).toBeChecked();await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).toContainText('Đang sửa');
 await p.evaluate(()=>{closeDialog();tab='waste';MaterialEstimateUI.proposal=true;render();});await expect(p.locator('[data-remnant-scope]')).toHaveCount(0);
 await p.locator('[data-remnant-batch]').first().check();expect(await p.evaluate(()=>result.reuse.selectedCount)).toBeGreaterThan(0);
 const selected=await p.evaluate(()=>JSON.stringify(db.quote.remnantSelections));await p.evaluate(()=>teamSave());expect(await p.evaluate(()=>Team.dirty)).toBe(false);
 const id=await p.evaluate(()=>teamCurrent().id);await p.reload();await p.waitForFunction(()=>Team.available);await p.evaluate(async id=>{if(!Team.user)teamSession(await teamApi('login','POST',{username:'admin',password:'Remnant-scope-2026!'}));await teamLoad(id);},id);expect(await p.evaluate(()=>JSON.stringify(db.quote.remnantSelections))).toBe(selected);
 expect(errors).toEqual([]);console.log('PASS remnant scope: visible denial, rollback, scope request, approved selection, save/reload');
 }finally{await browser.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
