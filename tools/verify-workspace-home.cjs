'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),{chromium,expect}=require('@playwright/test');
(async()=>{
 const live=process.argv.includes('--live'),app=live?null:require('../server/app.cjs').createApp();if(app)await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const c=live?JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')):{url:'http://127.0.0.1:'+app.server.address().port,username:'admin',name:'Quản trị Trường Phát',password:'Workspace-local-check-42!'},dir='artifacts/customer-review/workspace-home/'+(live?'live':'local');fs.mkdirSync(dir,{recursive:true});
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex');expect(hash(await fetch(c.url).then(r=>r.text()))).toBe(hash(fs.readFileSync('dist/index.html','utf8')));
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[],writes=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 if(live)await p.route('**/api/**',r=>{if(['GET','HEAD'].includes(r.request().method())||new URL(r.request().url()).pathname==='/api/login')return r.continue();writes.push(r.request().url());return r.abort();});
 const shot=async name=>p.screenshot({path:dir+'/'+name+'.png',fullPage:true});
 try{
 await p.goto(c.url);await p.waitForFunction(()=>Team.available);
 if(!live){await p.evaluate(async c=>{teamSession(await teamApi('setup','POST',c));Team.requireLogin=true;Team.configured=true;render();},c);await expect(p.locator('[data-home-results]')).toContainText('Chưa có báo giá trong danh sách');
 await p.evaluate(async()=>{for(let i=1;i<=3;i++){const document=TPPrice.demoSeed();document.quote.id='BG-20260918-00'+i;document.quote.customer=['Công ty An Phát','Cơ điện Minh Long','Nhà máy Bình An'][i-1];document.quote.project=['Thang máng cáp nhà xưởng','Tủ điện phân phối','Bộ giá đỡ đường ống'][i-1];await teamApi('quotes','POST',{document});}await teamApi('users','POST',{username:'technical',name:'Kỹ thuật',role:'technical',password:'Workspace-local-check-42!'});});
 // Exercise the actual login form; landing must not be hidden by the old modal.
 await p.evaluate(async()=>{await teamApi('logout','POST',{});teamSession({user:null,permissions:null,csrf:''});render();});
 }
 await p.locator('#content [data-team=login]').click();await p.locator('[name=username]').fill(c.username);await p.locator('[name=password]').fill(c.password);await p.locator('#dialog button[type=submit]').click();
 await expect(p.locator('.home-list-caption')).toBeVisible();await expect(p.locator('#dialog')).not.toBeVisible();const before=await p.evaluate(()=>teamApi('quotes'));expect(await p.locator('.home-table tbody tr').count()).toBe(Math.min(25,before.length));await shot('01-danh-sach-bao-gia');
 if(before.length){await p.locator('[data-home-search]').fill(before[0].code);await expect(p.locator('.home-table tbody tr').first()).toContainText(before[0].code);await p.locator('[data-home-search]').fill('KHONG-CO-BAO-GIA-NAY');await expect(p.locator('[data-home-results]')).toContainText('Không có báo giá phù hợp');await p.locator('[data-home-search]').fill('');}
 await p.locator('[data-home-status=approved]').click();expect(await p.locator('.home-table tbody tr').count()).toBe(Math.min(25,before.filter(q=>q.status==='approved').length));await p.locator('[data-home-status=all]').click();
 await p.setViewportSize({width:390,height:844});await shot('02-dien-thoai');expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await p.setViewportSize({width:1500,height:1000});
 if(before.length){await p.locator('.home-table [data-team=open]').first().click();await p.waitForFunction(()=>Team.loaded);expect(await p.evaluate(()=>Team.link.id)).toBe(before[0].id);await p.evaluate(()=>teamLeave());await expect(p.locator('.home-list-caption')).toBeVisible();}
 if(!live){
 await p.route('**/api/quotes',r=>r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Máy chủ tạm thời không kết nối'})}));await p.locator('[data-home-refresh]').click();await expect(p.locator('[data-home-results]')).toContainText('Không tải được danh sách');await expect(p.locator('.home-table')).toHaveCount(0);await p.unroute('**/api/quotes');await p.locator('[data-home-refresh]').click();await expect(p.locator('.home-table tbody tr')).toHaveCount(3);
 // More summaries exercise pagination without adding business records.
 const many=Array.from({length:27},(_,i)=>({...before[0],id:'test-'+i,code:'TEST-'+i}));await p.route('**/api/quotes',r=>r.fulfill({json:many}));await p.locator('[data-home-refresh]').click();await expect(p.locator('.home-table tbody tr')).toHaveCount(25);await p.locator('[data-home-page="1"]').click();await expect(p.locator('.home-table tbody tr')).toHaveCount(2);await p.unroute('**/api/quotes');
 await p.evaluate(async password=>{teamSession(await teamApi('login','POST',{username:'technical',password}));render();},c.password);await expect(p.locator('.home-table tbody tr')).toHaveCount(3);await expect(p.locator('.home-table')).not.toContainText('Tổng sau thuế');await expect(p.locator('.home-account')).not.toContainText('Tài khoản và phân quyền');await shot('03-ky-thuat-khong-gia');
 // A late response must not repopulate another user's screen.
 expect(await p.evaluate(async()=>{const old=teamApi;let release;teamApi=()=>new Promise(r=>release=r);WorkspaceHome.at=0;const pending=workspaceHomeFetch(true);teamApi=old;teamSession({user:null,permissions:null,csrf:''});render();release([{code:'STALE-SECRET'}]);await pending;return !document.body.textContent.includes('STALE-SECRET');})).toBe(true);
 }else expect(await p.evaluate(()=>teamApi('quotes'))).toEqual(before);
 expect(errors).toEqual([]);expect(writes).toEqual([]);fs.writeFileSync(dir+'/verification.json',JSON.stringify({passed:true,live,errors,writes,checks:['login landing without modal','authorized live summaries','search and status filters','mobile overflow','open quotation','no business writes on live',...live?[]:['empty list','failure and retry','pagination','technical role without prices','stale response after logout']]},null,2));console.log('PASS workspace home '+(live?'live':'local'));
 }catch(e){await shot('failure');throw e;}finally{await browser.close();if(app)await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

