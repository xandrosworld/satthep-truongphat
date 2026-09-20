'use strict';
const {chromium,expect}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const dir=path.resolve(process.env.FORMULA_BUTTONS_ROOT||'artifacts/customer-review/formula-buttons-2026-09-15/local/buttons'),url=process.env.FORMULA_BUTTONS_URL||pathToFileURL(path.resolve('dist/index.html')).href;
fs.mkdirSync(dir,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1680,height:1080}}),checks=[],errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 const helper=key=>p.locator('[data-df-for='+key+']'),input=key=>p.locator('[name='+key+']'),pass=s=>{checks.push(s);console.log('PASS '+s);};
 try{
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:30000});const quote=await p.evaluate(()=>JSON.stringify(db.quote));await p.locator('[data-page=rules]').click();await p.locator('[data-rc-definition="source:flat"] [data-rc=summary]').click();
  await expect(p.locator('[data-df-for]')).toHaveCount(1);
  await input('length').focus();await expect(helper('length')).toHaveAttribute('open','');await expect(helper('length').locator('[data-df-insert=L]')).toContainText('Chiều dài');await expect(helper('length').locator('[data-df-insert=L0]')).toHaveCount(0);
  await input('blankMass').focus();await expect(helper('blankMass').locator('[data-df-insert=L0]')).toContainText('Dài khai triển');await expect(helper('blankMass').locator('[data-df-insert=W0]')).toContainText('mm');await expect(helper('blankMass').locator('[data-df-function=ROUND]')).toHaveAttribute('title','Làm tròn');
  pass('One shared toolbox follows the selected formula; computed output symbols appear only where valid');
  await input('length').fill('L + 10');await input('length').evaluate(el=>el.setSelectionRange(4,6));
  await input('width').focus();await p.locator('[data-df-target]').selectOption('length');await helper('length').locator('[data-df-insert=W]').click();await expect(input('length')).toHaveValue('L + W');await expect(input('width')).toHaveValue('W');
  await input('length').fill('L');await input('mass').selectText();await helper('mass').locator('[data-df-function=ROUND]').click();await expect(input('mass')).toHaveValue('ROUND(T / 1000 * RHO, 2)');
  pass('Switching the shared target preserves each formula selection; insertion replaces the saved selection and ROUND wraps selected text');
  await input('blankSurface').fill('');for(const selector of ['[data-df-insert=L0]','[data-df-token="*"]','[data-df-insert=W0]','[data-df-token="/"]','[data-df-token="1000000"]'])await helper('blankSurface').locator(selector).click();await expect(input('blankSurface')).toHaveValue('L0*W0/1000000');
  expect(Number(await p.locator('[data-df-result=blankSurface]').getAttribute('data-value'))).toBeCloseTo(.2,8);
  await input('surface').fill('');await helper('surface').locator('[data-df-function=ABS]').click();await helper('surface').locator('[data-df-token="100"]').click();await helper('surface').locator('[data-df-token="."]').click();await p.keyboard.type('5');await expect(input('surface')).toHaveValue('ABS(100.5)');await input('surface').fill('1');
  await helper('surface').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(dir,'01-shared-formula-controls.png'),fullPage:true});
  await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();expect(await p.evaluate(()=>JSON.stringify(db.quote))).toBe(quote);
  await p.reload({waitUntil:'domcontentloaded'});await p.locator('[data-page=rules]').click();await p.locator('[data-rc-definition="QD-NGUON-flat"] [data-rc=summary]').click();await expect(input('blankSurface')).toHaveValue('L0*W0/1000000');await expect(input('mass')).toHaveValue('ROUND(T / 1000 * RHO, 2)');
  pass('Button-built formulas calculate correctly, function insertion places the cursor inside parentheses, and saved formulas survive reload without changing the existing quote');
  await p.setViewportSize({width:390,height:844});await input('blankSurface').focus();expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await p.screenshot({path:path.join(dir,'02-narrow-screen.png'),fullPage:true});expect(errors).toEqual([]);pass('Shared controls remain within the dialog on narrow screens with no JavaScript errors');
  fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({passed:true,url,checks,errors,at:new Date().toISOString()},null,2));
 }catch(e){console.error(e);await p.screenshot({path:path.join(dir,'FAILURE.png'),fullPage:true}).catch(()=>{});fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({passed:false,url,checks,errors,error:e.stack},null,2));process.exitCode=1;}finally{await browser.close();}
})();
