'use strict';
// Read credentials only from the ignored local file. Never log customer data.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{chromium,expect}=require('@playwright/test'),F=require('../tests/tmc-fixture.cjs'),Technical=require('../technical-core.js');
(async()=>{
 const credentials=JSON.parse(fs.readFileSync(process.env.TP_QA_CREDENTIALS||'artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')),url=credentials.url,dir=path.resolve('artifacts/customer-review/technical-pricing-2026-09-16/live');fs.mkdirSync(dir,{recursive:true});
 const normalize=s=>s.replace(/\r\n/g,'\n').trim(),hash=s=>crypto.createHash('sha256').update(normalize(s)).digest('hex'),expected=hash(fs.readFileSync('dist/index.html','utf8')),html=await fetch(url).then(r=>r.text());expect(hash(html)).toBe(expected);
 const browser=await chromium.launch({channel:'msedge',headless:true}),admin=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],checks=[];admin.on('pageerror',e=>errors.push(e.message));let temporaryUser;
 const pass=x=>{checks.push(x);console.log('PASS '+x);};
 try{
  await admin.goto(url);await expect(admin.locator('#content [data-team=login]')).toBeVisible();
  await admin.evaluate(async c=>{teamSession(await teamApi('login','POST',{username:c.username,password:c.password}));render();},credentials);pass('HTTPS login and deployed build match');
  const quotes=await admin.evaluate(()=>teamApi('quotes'));expect(quotes.length).toBeGreaterThan(0);const id=(quotes.find(q=>q.code==='BG-MAU-RAILWAY')||quotes[0]).id;
  const original=await admin.evaluate(id=>teamApi('quotes/'+id),id);
  const user={username:'qa_tech_'+Date.now().toString(36),name:'QA kỹ thuật — khóa sau kiểm tra',role:'technical',password:crypto.randomBytes(24).toString('base64url')};
  temporaryUser=await admin.evaluate(u=>teamApi('users','POST',u),user);
  const tech=await browser.newPage({viewport:{width:1600,height:1000}});tech.on('pageerror',e=>errors.push(e.message));await tech.goto(url);
  await tech.evaluate(async u=>{teamSession(await teamApi('login','POST',u));render();},user);
  const restricted=await tech.evaluate(id=>teamApi('quotes/'+id),id);if(JSON.stringify(restricted.document)!==JSON.stringify(Technical.project(original.document)))throw Error('Technical API projection mismatch (customer data omitted from log)');
  const list=await tech.evaluate(()=>teamApi('quotes'));expect(list.every(q=>!Object.hasOwn(q,'total'))).toBe(true);
  const denied=await tech.evaluate(async id=>{const codes=[];for(const route of ['catalog','backup','quotes/'+id+'/revisions','quotes/'+id+'/revision/1','orders'])try{await teamApi(route);codes.push(200);}catch(e){codes.push(e.status);}return codes;},id);expect(denied).toEqual([403,403,403,403,403]);pass('Actual technical account receives only technical projection; price APIs return 403');
  await tech.evaluate(id=>teamLoad(id),id);await expect(tech.locator('[data-tab=prices]')).toHaveCount(0);await expect(tech.locator('[data-team=save]')).toBeVisible();
  // Screenshots use QA in browser memory; no customer quote is changed or exported.
  const qa=F.seed();F.confirm(qa.quote);
  await admin.evaluate(data=>{Team.loaded=true;Team.link={id:'qa-browser-only',version:1,status:'draft',workspaceKey:'qa-browser-only'};db=data;db.quote.workspaceKey='qa-browser-only';page='quote';tab='pricing';render();},qa);
  await expect(admin.locator('[data-tmc-freight]')).toContainText('60 đ');await expect(admin.locator('[data-tmc-freight]')).toContainText('Đã tính trong giá TMC');await admin.screenshot({path:path.join(dir,'01-tmc-freight.png'),fullPage:true});
  await admin.evaluate(()=>{db.quote.pricing.incoming=0;render();});await expect(admin.locator('[data-tmc-freight]')).toContainText('Chưa khai phí');
  await admin.evaluate(()=>{db.quote.expenses=[{id:'qa-zero',name:'QA zero',category:'incoming',scope:'all',method:'fixed',rate:0,allocation:'equal'}];render();});await expect(admin.locator('[data-tmc-freight]')).toContainText('Đã tính trong giá TMC');
  for(const stage of ['intake','bom','operations','waste','mass']){await admin.evaluate(value=>{tab=value;render();},stage);const text=await admin.locator('#content').innerText();expect(text.split('\n').filter(x=>/[\d][\d.,\s]*\s(?:₫|đ|VNĐ)(?:\s|\/|$)/.test(x))).toEqual([]);}
  await admin.evaluate(()=>{tab='operations';render();});await admin.screenshot({path:path.join(dir,'02-technical-steps.png'),fullPage:true});
  await admin.locator('[data-pa=op-detail]').first().click();await expect(admin.locator('#dialog [name=unitPrice]')).toHaveCount(0);await expect(admin.locator('#dialog [name=amount]')).toBeVisible();await admin.evaluate(()=>closeDialog());
  await admin.evaluate(()=>{tab='prices';Intake.priceTab='operations';render();});await expect(admin.locator('[data-qoc-table]')).toBeVisible();pass('Live UI: freight states, all five price-free steps and price editor at step 6');
  const unchanged=await admin.evaluate(id=>teamApi('quotes/'+id),id);expect(unchanged.version).toBe(original.version);if(JSON.stringify(unchanged.document)!==JSON.stringify(original.document))throw Error('Quote changed during read-only verification (customer data omitted from log)');
  await admin.evaluate(id=>teamApi('users/'+id+'/disable','POST',{}),temporaryUser.id);temporaryUser=null;
  const revoked=await tech.evaluate(async()=>{try{await teamApi('me');return 200;}catch(e){return e.status;}});expect(revoked).toBe(401);pass('Customer quote unchanged; temporary technical account disabled and session revoked');
  expect(errors).toEqual([]);fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({passed:true,url,buildHash:expected,checks,errors,at:new Date().toISOString()},null,2));
 }finally{if(temporaryUser)await admin.evaluate(id=>teamApi('users/'+id+'/disable','POST',{}),temporaryUser.id);await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
