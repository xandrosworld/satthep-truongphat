'use strict';
const {chromium,expect}=require('@playwright/test'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),crypto=require('crypto');
(async()=>{
 const live=process.argv.includes('--live'),build=path.resolve(process.env.UNFOLD_BUILD||'artifacts/shared-formula-release/dist/index.html'),dir=path.resolve('artifacts/customer-review/shared-formula/'+(live?'live':'local'));fs.mkdirSync(dir,{recursive:true});
 const credentials=live?JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')):null,url=credentials?.url||pathToFileURL(build).href;
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex');if(live)expect(hash(await fetch(url).then(r=>r.text()))).toBe(hash(fs.readFileSync(build,'utf8')));
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1560,height:1050}}),errors=[],writes=[],checks=[];
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(12000);
 if(live)await p.route('**/api/**',r=>{const q=r.request();if(['GET','HEAD'].includes(q.method())||new URL(q.url()).pathname==='/api/login')return r.continue();writes.push(q.method()+' '+q.url());return r.abort();});
 const submit=async()=>{await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();},close=()=>p.locator('#dialog .dialog-head [data-action=close]').click(),value=async(key,n)=>expect(Number(await p.locator(`[data-df-result="${key}"]`).getAttribute('data-value'))).toBeCloseTo(n,7),shot=name=>p.screenshot({path:path.join(dir,name+'.png')});
 try{
  await p.goto(url);let before;
  if(live){await p.waitForFunction(()=>typeof Team!=='undefined'&&Team.available);await p.evaluate(async c=>{teamSession(await teamApi('login','POST',c));},credentials);before=await p.evaluate(async()=>({catalog:await teamApi('catalog'),quotes:await teamApi('quotes')}));await p.evaluate(()=>{db=TPPrice.demoSeed();Team.loaded=true;Team.link={workspaceKey:db.quote.workspaceKey,status:'draft',version:0};CatalogDraft.record=null;CatalogDraft.dirty=false;page='rules';render();});}
  const quote=await p.evaluate(()=>JSON.stringify(db.quote));
  await p.evaluate(()=>{db.shapeDefinitions??=[];db.shapeDefinitions.push({id:'QA-TOOLS',name:'Tấm tròn kiểm bộ công thức',...TPDefinitions.sheetPreset('circle')});page='rules';RulesCatalog.kind='shapes';render();});
  await p.locator('[data-rc-definition=QA-TOOLS] [data-rc=summary]').click();
  const input=name=>p.locator('[name='+name+']'),helper=p.locator('#definition-formula-tools'),target=p.locator('[data-df-target]');
  await expect(p.locator('[data-df-for]')).toHaveCount(1);
  await input('blankSurface').focus();await expect(helper).toHaveAttribute('data-df-for','blankSurface');
  await expect(helper.locator('[data-df-insert=D0]')).toHaveCount(1);await expect(helper.locator('[data-df-insert=L0],[data-df-insert=W0]')).toHaveCount(0);
  await input('blankSurface').fill('');
  for(const selector of ['[data-df-insert=PI]','[data-df-token="*"]','[data-df-insert=D0]','[data-df-token="*"]','[data-df-insert=D0]','[data-df-token="/"]'])await helper.locator(selector).click();
  await p.keyboard.type('4000000');await value('blankSurface',Math.PI/4);await expect(input('blankSurface')).toHaveValue('PI*D0*D0/4000000');
  await input('outputFormula0').focus();await expect(helper.locator('[data-df-insert=D0]')).toHaveCount(0);await expect(helper.locator('[data-df-insert=D]')).toHaveCount(1);
  await input('outputFormula0').selectText();await p.locator('[data-df-open=outputFormula0]').click();await expect(target).toHaveValue('outputFormula0');await helper.locator('[data-df-function=ROUND]').click();await expect(input('outputFormula0')).toHaveValue('ROUND(D, 2)');
  await input('outputFormula0').fill('D + 10');await input('outputFormula0').evaluate(el=>el.setSelectionRange(4,6));await input('blankMass').focus();await target.selectOption('outputFormula0');await helper.locator('[data-df-token="100"]').click();await expect(input('outputFormula0')).toHaveValue('D + 100');await input('outputFormula0').fill('D');
  checks.push('single shared toolbox; circle only D0; no self-reference shortcut; output formula insertion; preserved cursor and selection across target switching');
  await p.locator('[data-definition=add-output]').click();await input('outputKey1').selectOption('H0');await input('outputFormula1').fill('D0 / 2');await expect(p.locator('[data-df-output-result="1"]')).toHaveText('H0 = 500 mm');
  await input('blankSurface').focus();await expect(helper.locator('[data-df-insert=H0]')).toHaveCount(1);await input('outputName1').fill('Bán kính khai triển');await expect(helper.locator('[data-df-insert=H0]')).toContainText('Bán kính khai triển');
  await input('outputKey1').selectOption('W0');await input('blankSurface').focus();await expect(helper.locator('[data-df-insert=H0]')).toHaveCount(0);await expect(helper.locator('[data-df-insert=W0]')).toHaveCount(1);await expect(helper.locator('[data-df-insert=L0]')).toHaveCount(0);
  await helper.scrollIntoViewIfNeeded();await shot('01-bo-cong-thuc-chung');
  await input('blankMass').evaluate(el=>el.readOnly=true);await helper.locator('[data-df-insert=D0]').evaluate(el=>{el.closest('[data-df-for]').dataset.dfFor='blankMass';});const unchanged=await input('blankMass').inputValue();await helper.locator('[data-df-insert=D0]').click();await expect(input('blankMass')).toHaveValue(unchanged);await input('blankMass').evaluate(el=>el.readOnly=false);await input('blankSurface').focus();
  await submit();expect(await p.evaluate(()=>JSON.stringify(db.quote))).toBe(quote);
  if(!live)await p.reload();await p.locator('[data-page=rules]').click();await p.locator('[data-rc-tab=shapes]').click();await p.locator('[data-rc-definition=QA-TOOLS] [data-rc=summary]').click();await expect(p.locator('#dialog')).toBeVisible();await expect(input('blankSurface')).toHaveValue('PI*D0*D0/4000000');await input('blankSurface').focus();await expect(helper.locator('[data-df-insert=W0]')).toHaveCount(1);
  await p.setViewportSize({width:390,height:844});await helper.scrollIntoViewIfNeeded();expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await shot('02-bo-cong-thuc-mobile');await close();
  await p.evaluate(()=>dfShapeEdit(null,{id:'QA-BAR',name:'Thanh kiểm thử',...TPDefinitions.example('round')}));await input('mass').focus();await expect(target.locator('option[value=width]')).toHaveCount(0);await expect(p.locator('[data-df-for]')).toHaveCount(1);await close();
  checks.push('computed output add/rename; catalogue save/reload; existing quote unchanged; readonly insertion blocked; hidden bar width excluded; mobile without page overflow');
  if(live)expect(await p.evaluate(async()=>({catalog:await teamApi('catalog'),quotes:await teamApi('quotes')}))).toEqual(before);
  expect(errors).toEqual([]);expect(writes).toEqual([]);fs.writeFileSync(dir+'/results.json',JSON.stringify({passed:true,live,checks,errors,writes,at:new Date().toISOString()},null,2));console.log('PASS shared formula toolbox and declared unfolding symbols'+(live?' on production; no business writes':''));
 }catch(e){await shot('FAILURE').catch(()=>{});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
