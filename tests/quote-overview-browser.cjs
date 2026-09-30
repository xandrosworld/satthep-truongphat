const {chromium,expect}=require('@playwright/test');
const {createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));try{
 await page.goto('http://127.0.0.1:'+app.server.address().port);
 await page.locator('#team-entry').click();await page.locator('#dialog [name=username]').fill('admin');await page.locator('#dialog [name=name]').fill('QA');await page.locator('#dialog [name=password]').fill('Only-local-overview-42!');await page.locator('#dialog button[type=submit]').click();await expect.poll(()=>page.evaluate(()=>!!Team.user)).toBe(true);await page.locator('#dialog [data-action=close]').first().click();
 await page.evaluate(()=>{
  Team.permissions.costs=true;workspaceHomeReset();
  WorkspaceHome.rows=Array.from({length:30},(_,i)=>({id:'q'+i,code:'BG-'+i,customer:'Alpha',status:'approved',total:i===29?null:100,version:1,details:{salesOwner:{name:'Sales QA'},deadline:'2026-10-03',approvedAt:'2026-09-30T02:00:00Z',offerVersion:1,careCount:4,stages:{technical:{person:'Engineer QA',departments:['Phòng kỹ thuật QA']}}},commercialStatus:i<2?'accepted':'draft',progress:{sentCount:i<3?1:0,technical:{current:i<28},materials:{current:i<27}}}));
  WorkspaceHome.rows.push({id:'draft',code:'BG-D',customer:'Beta',status:'draft',total:500,progress:{}});WorkspaceHome.at=Date.now();WorkspaceHome.status='approved';document.querySelector('#content').innerHTML=workspaceHome();workspaceHomeDraw();
 });
 await expect(page.locator('.home-sales-owner').first()).toContainText('Sales QA');await expect(page.locator('.home-deadline').first()).toContainText('03/10/2026');await expect(page.locator('.home-status-cell').first()).toContainText('Ngày duyệt:');await expect(page.locator('.home-progress').first()).toContainText('Phòng kỹ thuật QA');await expect(page.locator('.home-table tbody tr').first()).toContainText('Chăm sóc: 4 lần');await expect(page.locator('.home-stage-status').first()).toHaveAttribute('aria-label',/Đầu vào/);
 // Docking either console must release page scrolling; restoring it must lock the background again.
 for(const shell of ['ordersShell','productionShell']){
  await page.evaluate(shell=>{window[shell]().showModal();},shell);
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.body).overflow)).toBe('hidden');
  await page.locator('dialog.console-window:not([hidden]) [data-console-minimize]').click();
  await expect.poll(()=>page.evaluate(()=>getComputedStyle(document.body).overflow)).not.toBe('hidden');
 }
 await page.evaluate(()=>window.scrollTo(0,0));await page.mouse.move(1000,650);await page.mouse.wheel(0,600);await expect.poll(()=>page.evaluate(()=>window.scrollY)).toBeGreaterThan(0);
 const value=key=>page.locator(`[data-home-metric=${key}] strong`);
 await expect(value('count')).toHaveText('30');await expect(value('total')).toHaveText('2.900 ₫');await expect(page.locator('[data-home-metric=total] small')).toContainText('1 báo giá chưa có');
 await expect(value('sent')).toHaveText('3');await expect(value('accepted')).toHaveText('2');await expect(value('technical')).toHaveText('2');await expect(value('materials')).toHaveText('3');
 await page.locator('[data-home-page="1"]').click();await expect(value('total')).toHaveText('2.900 ₫');
 await page.locator('[data-home-status=draft]').click();await expect(value('total')).toHaveText('500 ₫');await expect(value('count')).toHaveText('1');
 await page.locator('[data-home-search]').fill('Alpha');await expect(value('count')).toHaveText('0');await expect(value('total')).toHaveText('0 ₫');await expect(page.locator('[data-home-status=draft] strong')).toHaveText('0');
 await page.locator('[data-home-status=approved]').click();await page.locator('[data-home-stage]').selectOption('sent');await expect(value('count')).toHaveText('3');await expect(value('total')).toHaveText('300 ₫');
 await page.evaluate(()=>{Team.permissions.costs=false;workspaceHomeDraw();});await expect(page.locator('[data-home-metric=total]')).toHaveCount(0);
 await page.setViewportSize({width:390,height:844});await expect(value('count')).toBeVisible();expect(await page.locator('.home-summary').evaluate(e=>e.getBoundingClientRect().width)).toBeLessThanOrEqual(390);expect(errors).toEqual([]);
 console.log('PASS overview groups, totals across pages, missing values, search/stage filters, price permission and mobile');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
