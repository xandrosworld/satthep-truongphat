const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs'),path=require('node:path');
(async()=>{const app=createApp({pushInterval:0});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const b=await chromium.launch({channel:'msedge',headless:true});try{
 const context=await b.newContext({permissions:['notifications']}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Browser-push-test-2026'}));const reg=await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;await reg.showNotification('Trường Phát',{body:'Local notification test',tag:'test'});});
 expect(await p.evaluate(async()=>{const r=await navigator.serviceWorker.ready;const n=await r.getNotifications();n.forEach(x=>x.close());return n.length;})).toBe(1);
 await p.evaluate(()=>{db=TPPrice.demoSeed();db.quote.pricing.comparisonMethods=['detail'];db.quote.pricing.selected='detail';result=C.calculate(db);document.querySelector('main').innerHTML=sourceAnalysis();});
 await expect(p.locator('[data-overall-analysis] thead [colspan="2"]')).toHaveCount(1);await expect(p.locator('.analysis-section')).toHaveCount(3);await expect(p.locator('.analysis-profit')).toHaveCount(1);
 expect(await p.evaluate(()=>sourceSheets()[1].rows[0].length)).toBe(4);
 for(const width of [1440,390]){await p.setViewportSize({width,height:900});await p.screenshot({path:path.resolve('artifacts/analysis-'+width+'.png')});}
 expect(errors).toEqual([]);console.log('PASS actual service-worker notification, selected analysis columns, section grouping and matching Excel');
 }finally{await b.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
