const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,r));const b=await chromium.launch({channel:'msedge',headless:true});try{
 const context=await b.newContext(),p=await context.newPage();await p.goto('http://localhost:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 const ids=await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Quote-tabs-2026!'}));const d=TPPrice.demoSeed();const first=(await teamApi('quotes','POST',{document:d})).id;d.quote.id='TAB-SECOND';const second=(await teamApi('quotes','POST',{document:d})).id;await teamLoad(first);mutation(()=>db.quote.pricing.profit=19);await teamLoad(second);return{first,second};});
 let writes=0;p.on('request',r=>{if(r.method()==='PUT'&&r.url().includes('/api/quotes/'))writes++;});
 const opened=context.waitForEvent('page');await p.locator('[data-open-quote-tab]').click();const other=await opened;await other.waitForFunction(id=>typeof teamCurrent!=='undefined'&&teamCurrent()?.id===id,ids.second);
 expect(await p.evaluate(()=>Team.dirty&&db.quote.pricing.profit===19)).toBe(true);expect(writes).toBe(0);
 await other.evaluate(()=>mutation(()=>db.quote.pricing.profit=23));await other.evaluate(()=>teamSave());
 expect(await p.evaluate(()=>Team.dirty&&db.quote.pricing.profit===19&&!Quotes.conflict)).toBe(true);
 await p.evaluate(()=>teamSave());expect(await other.evaluate(()=>db.quote.pricing.profit)).toBe(23);
 expect(await p.evaluate(async id=>(await teamApi('quotes/'+id)).document.quote.pricing.profit,ids.first)).toBe(19);
 expect(await p.evaluate(async id=>(await teamApi('quotes/'+id)).document.quote.pricing.profit,ids.second)).toBe(23);
 await p.evaluate(()=>{mutation(()=>db.quote.pricing.profit=27);return teamNewDocument();});const newOpened=context.waitForEvent('page');await p.locator('[data-open-quote-tab]').click();const fresh=await newOpened;await expect(fresh.locator('#dialog')).toContainText('Tạo báo giá mới');expect(await p.evaluate(()=>Team.dirty&&db.quote.pricing.profit===27)).toBe(true);
 console.log('PASS independent quote tabs, no forced save, isolated edits and saves, new quote tab');
 }finally{await b.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});

