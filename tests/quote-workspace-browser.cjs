'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve('artifacts/customer-review/quote-workspace-2026-09-17');fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:'+app.server.address().port);
  await page.locator('#team-entry').click();await page.locator('#dialog [name=username]').fill('admin');await page.locator('#dialog [name=name]').fill('QA báo giá');await page.locator('#dialog [name=password]').fill('Only-for-workspace-tests-42!');await page.locator('#dialog button[type=submit]').click();await expect.poll(()=>page.evaluate(()=>!!Team.user)).toBe(true);
  const existing=await page.evaluate(async()=>{closeDialog();const document=TPPrice.demoSeed(),day=TPComplete.todayVN();document.quote.id='BG-'+day.replaceAll('-','')+'-007';document.quote.date=day;const saved=await teamApi('quotes','POST',{document});await teamLoad(saved.id);return {id:saved.id,day,product:db.quote.products[0].id};});
  await page.locator('[data-team=list]').first().click();await page.locator('#dialog [data-access=new-document]').click();
  const prefix='BG-'+existing.day.replaceAll('-','')+'-';await expect(page.locator('#dialog [name=code]')).toHaveValue(prefix+'008');
  await page.locator('#dialog [name=date]').fill('2026-09-21');await page.locator('#dialog [name=date]').blur();await expect(page.locator('#dialog [name=code]')).toHaveValue('BG-20260921-001');
  await page.locator('#dialog [name=date]').fill(existing.day);await page.locator('#dialog [name=date]').blur();await expect(page.locator('#dialog [name=code]')).toHaveValue(prefix+'008');
  await page.locator('#dialog [name=customer]').fill('Khách kiểm thử');
  await page.evaluate(async day=>{const document=TPPrice.demoSeed();document.quote.date=day;await teamApi('quotes','POST',{document,autoCode:true});},existing.day);
  await page.locator('#dialog button[type=submit]').click();await expect.poll(()=>page.evaluate(()=>db.quote.id)).toBe(prefix+'009');
  await expect(page.locator('.quote-technical-missing')).toContainText('Chưa có sản phẩm');
  await page.evaluate(async id=>{await teamLoad(id);tab='bom';render();},existing.id);
  const summary=page.locator('.quote-technical-overview');await expect(summary).toContainText('Khối lượng phôi toàn đơn');await expect(page.locator('.b1-legend')).toHaveCount(0);await expect(page.locator('.pa-intro')).toHaveCount(0);
  await expect(page.locator('[data-action=quote-symbols], [data-action=auxiliary-percent], [data-auxiliary-cell]')).toHaveCount(0);await page.evaluate(()=>rcSelect('symbols'));await expect(page.locator('[data-rule-symbols]')).toContainText('VT\u00b7CK');await expect(page.locator('[data-rule-symbols]')).toContainText('VT\u00b7SP');await page.evaluate(()=>{page='quote';tab='bom';render();});
  const before=await page.evaluate(()=>B1.technicalSummary(db.quote.products,result));const qty=page.locator(`[data-qid="${existing.product}"][data-qkind=qty]`).first();const next=Number(await qty.inputValue())+1;await qty.fill(String(next));await qty.blur();await expect.poll(()=>page.evaluate(()=>B1.technicalSummary(db.quote.products,result).weight)).toBeGreaterThan(before.weight);const mass=await page.evaluate(()=>num(B1.technicalSummary(db.quote.products,result).weight,3));await expect(summary).toContainText(mass);
  const leaf=await page.evaluate(()=>C.flatten(db.quote.products).find(n=>n.kind==='material'&&n.spec.shape!=='piece').id);
  await page.evaluate(()=>{tab='waste';render();});await page.locator('[data-action=auxiliary-percent]').first().click();await page.locator(`#dialog [name="aux-${leaf}"]`).fill('5');await page.locator('#dialog button[type=submit]').click();await expect(page.locator(`[data-action=auxiliary-percent][data-id="${leaf}"]`)).toHaveText('5 %');
  expect(await page.evaluate(()=>result.products.reduce((s,p)=>s+p.parts.allowance,0))).toBeGreaterThan(0);
  await page.locator('[data-team=save]').first().click();await expect.poll(()=>page.evaluate(()=>Team.dirty)).toBe(false);await page.reload();await expect.poll(()=>page.evaluate(()=>!!Team.user)).toBe(true);await page.evaluate(async id=>{await teamLoad(id);tab='waste';render();},existing.id);await expect(page.locator(`[data-action=auxiliary-percent][data-id="${leaf}"]`)).toHaveText('5 %');
  await page.screenshot({path:path.join(dir,'overview.png'),fullPage:true});
  await page.evaluate(id=>{C.findNode(db.quote.products,id).dims.L=0;render();},leaf);await expect(page.locator('.quote-technical-missing')).toBeVisible();await expect(summary).toContainText('chưa đủ thông số tổng');
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  // A technical account must persist the percentage through the server allowlist.
  await page.evaluate(async()=>teamApi('users','POST',{username:'techqa',name:'Kỹ thuật kiểm thử',password:'Only-for-workspace-tests-42!',role:'technical',sections:['bom','operations']}));
  const context=await browser.newContext(),tech=await context.newPage();tech.on('pageerror',e=>errors.push(e.message));await tech.goto('http://127.0.0.1:'+app.server.address().port);await tech.locator('#team-entry').click();await tech.locator('#dialog [name=username]').fill('techqa');await tech.locator('#dialog [name=password]').fill('Only-for-workspace-tests-42!');await tech.locator('#dialog button[type=submit]').click();await expect.poll(()=>tech.evaluate(()=>!!Team.user)).toBe(true);await tech.evaluate(async id=>{await teamLoad(id);tab='waste';render();},existing.id);
  await expect(tech.locator(`[data-action=auxiliary-percent][data-id="${leaf}"]`)).toHaveText('5 %');await tech.locator(`[data-action=auxiliary-percent][data-id="${leaf}"]`).click();await tech.locator(`#dialog [name="aux-${leaf}"]`).fill('7');await tech.locator('#dialog button[type=submit]').click();await tech.locator('[data-team=save]').first().click();await expect.poll(()=>tech.evaluate(()=>Team.dirty)).toBe(false);await tech.evaluate(async id=>{await teamLoad(id);tab='waste';render();},existing.id);await expect(tech.locator(`[data-action=auxiliary-percent][data-id="${leaf}"]`)).toHaveText('7 %');
  expect((await tech.locator('#content').innerText()).split('\n').filter(x=>/[\d][\d.,\s]*\s(?:₫|đ|VNĐ)(?:\s|\/|$)/.test(x))).toEqual([]);
  await context.close();expect(errors).toEqual([]);console.log('PASS quote workspace: daily server code with concurrent create, overview, symbol table, live totals, auxiliary percentage save/reload for admin and technical user, incomplete data and narrow viewport');
 }catch(e){await page.screenshot({path:path.join(dir,'failure.png'),fullPage:true}).catch(()=>{});throw e;}finally{await browser.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
