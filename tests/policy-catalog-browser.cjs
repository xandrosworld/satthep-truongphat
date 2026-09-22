const {chromium,expect}=require('@playwright/test');
const {createApp}=require('../artifacts/gd1-report-2026-09-20/release/server/app.cjs');
const path=require('path');
(async()=>{
 const app=createApp({staticRoot:path.resolve('artifacts/gd1-report-2026-09-20/release/dist')});
 await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const p=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
  await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Policy-catalog-test-2026!'}));const saved=await teamApi('quotes','POST',{document:TPPrice.demoSeed()});await teamLoad(saved.id);});
  for(const kind of ['customer','production']){
   await p.evaluate(kind=>policyTypesEdit(kind),kind);await p.locator('[data-policy-samples]').click();await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
  }
  await p.evaluate(()=>{document.querySelector('#content').innerHTML=inPolicyForm();});
  await p.locator('[name=policy-type-customer]').selectOption('VIP');await expect(p.locator('#intake-policy [name=customer]')).toHaveValue('-5');
  await p.locator('[name=policy-type-production-special-0]').selectOption('C4');await expect(p.locator('[name=production-special-0]')).toHaveValue('30');
  await p.locator('#intake-policy button[type=submit]').click();
  await p.evaluate(async()=>{await teamSave();await cdSave();await teamLoad(Team.link.id);});
  expect(await p.evaluate(()=>db.quote.pricing.customer)).toBe(-5);expect(await p.evaluate(()=>db.quote.products[0].productionSpecialPercent)).toBe(30);
  // A second editor's publish must cause a version conflict, retaining local edits.
  expect(await p.evaluate(async()=>{const base=await teamApi('catalog');await teamApi('catalog','PUT',{expectedVersion:base.version,catalog:base.catalog});try{await teamApi('catalog','PUT',{expectedVersion:base.version,catalog:base.catalog});return false;}catch(e){return e.status===409;}})).toBe(true);
  await p.evaluate(async()=>{Team.requireLogin=true;Team.dirty=false;Team.loaded=false;Team.link=null;});
  await p.locator('[data-page=rules]').first().click();await p.waitForFunction(()=>Team.loaded&&!Team.link&&CatalogDraft.record);
  await p.evaluate(()=>dfCatalogWrite(()=>{db.pricingDefaults.policyTypes.customer[0].multiplier=0.94;}));
  await p.locator('[data-page=materials]').first().click();expect(await p.evaluate(()=>db.pricingDefaults.policyTypes.customer[0].multiplier)).toBe(0.94);
  await p.reload();await p.waitForFunction(()=>Team.user);await p.evaluate(()=>Team.requireLogin=true);await p.locator('[data-page=rules]').first().click();await p.waitForFunction(()=>CatalogDraft.dirty);
  expect(await p.evaluate(()=>db.pricingDefaults.policyTypes.customer[0].multiplier)).toBe(0.94);
  await p.evaluate(async()=>{await cdSave();await formulaRefreshLocks();RulesCatalog.tab='factors';rcSelect('factors');});
  await expect(p.locator('[data-factor-lock-panel]')).toBeVisible();
  await p.evaluate(async()=>{const l=(await teamApi('formulas/locks')).find(r=>r.key==='calculationFactors:all');await teamApi('formulas/locks','POST',{key:l.key,locked:true,expectedVersion:l.version,expectedCatalogVersion:Team.catalogVersion,reason:'Browser test'});await formulaRefreshLocks();render();});
  await expect(p.locator('[data-factor-lock-panel]')).toContainText('Đã khóa');
  expect(await p.locator('[data-rc=factor-edit]:visible').count()).toBe(0);
  expect(await p.evaluate(async()=>{const m=await teamApi('catalog');m.catalog.pricingDefaults.policyTypes.customer[0].multiplier=0.9;try{await teamApi('catalog','PUT',{expectedVersion:m.version,catalog:m.catalog});return false;}catch(e){return e.status===403;}})).toBe(true);
  expect(errors).toEqual([]);console.log('PASS policy selection, saved snapshot, conflict, navigation/reload recovery and locked catalog');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
