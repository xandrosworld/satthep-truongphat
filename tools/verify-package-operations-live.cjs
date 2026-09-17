'use strict';
// Read-only production check. Saves only an isolated browser working copy.
const fs=require('fs'),crypto=require('crypto'),{chromium,expect}=require('@playwright/test');
(async()=>{
 const c=JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')),dir='artifacts/customer-review/package-operations/live';fs.mkdirSync(dir,{recursive:true});
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex'),expected=hash(fs.readFileSync('dist/index.html','utf8'));let actual;
 for(let i=0;i<40;i++){actual=hash(await fetch(c.url).then(r=>r.text()));if(actual===expected)break;await new Promise(r=>setTimeout(r,5000));}expect(actual).toBe(expected);
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1700,height:1150}}),errors=[],blocked=[];
 p.on('pageerror',e=>errors.push(e.message));await p.route('**/api/**',route=>{const req=route.request();if(['GET','HEAD'].includes(req.method())||new URL(req.url()).pathname==='/api/login')return route.continue();blocked.push(new URL(req.url()).pathname);return route.abort();});
 const shot=async(name)=>{await p.screenshot({path:dir+'/'+name+'.png'});},field=name=>p.locator('#dialog [name="'+name+'"]');
 try{
  await p.goto(c.url);await p.waitForFunction(()=>typeof Team!=='undefined'&&Team.available);await p.evaluate(async c=>{teamSession(await teamApi('login','POST',{username:c.username,password:c.password}));page='quote';render();},c);
  const before=await p.evaluate(async()=>({catalog:await teamApi('catalog'),quotes:await teamApi('quotes')}));
  await p.locator('[data-team=catalog-workspace]').click();await p.waitForFunction(()=>Team.loaded);await p.evaluate(()=>{page='rates';rateTab='operations';ProductScope.group='';render();persist();});
  await expect(p.locator('[data-rate-subtab]')).toHaveCount(0);await expect(p.locator('[data-rate-tab=tmc]')).toHaveCount(0);await expect(p.locator('[data-review-rate]').first()).toBeVisible();await shot('01-mot-man-nguyen-cong');
  await p.locator('[data-action=new-rate]').click();await expect(field('operationType')).toHaveValue('detail');await expect(p.locator('[data-operation-detail]')).toBeVisible();await shot('02-loai-chi-tiet');
  await field('operationType').selectOption('package');await expect(p.locator('[data-operation-detail]')).not.toBeVisible();await field('name').fill('QA · Gói TMC kiểm thử — chưa phát hành');
  const table=await p.locator('[name=packageTables]').first().getAttribute('value'),op=await p.locator('[name=packageReplaces]').first().getAttribute('value'),factor=await p.locator('[name=packageFactors]').first().getAttribute('value');
  await p.locator('[name=packageTables]').first().check();await p.locator('[name=packageReplaces]').first().check();await p.locator('[name=packageFactors]').first().check();await shot('03-tron-goi-bang-gia-he-so');await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
  const id=await p.evaluate(()=>db.rates.find(r=>r.name==='QA · Gói TMC kiểm thử — chưa phát hành').id);const row=p.locator('[data-review-rate="'+id+'"]');await row.scrollIntoViewIfNeeded();await expect(row).toContainText('Trọn gói');await shot('04-goi-trong-danh-sach');
  await row.locator('[data-pa=edit-rate]').click();await expect(field('operationType')).toHaveValue('package');await expect(p.locator('[name=packageTables][value="'+table+'"]')).toBeChecked();await expect(p.locator('[name=packageReplaces][value="'+op+'"]')).toBeChecked();await p.evaluate(()=>closeDialog());
  await p.evaluate(()=>{page='rules';rcSelect('factors');fmMatrix();});await expect(p.locator('[data-pd-matrix-row="'+id+'"] [data-key="'+factor+'"]')).toBeChecked();await p.locator('[data-pd-matrix-row="'+id+'"]').scrollIntoViewIfNeeded();await shot('05-he-so-quy-uoc-co-goi');await p.evaluate(()=>closeDialog());
  // Disposable quotation fixture in browser memory, never POSTed to production.
  const proof=await p.evaluate(()=>{const seed=TPPrice.demoSeed();db.quote=C.copy(seed.quote);db.quote.remnantMode='all';const technical=JSON.stringify(db.quote.products),detail=TPPrice.calculate(db).alternatives.detail.total.grand;TPInputPrices.refresh(db);page='quote';tab='pricing';render();return {technicalUnchanged:technical===JSON.stringify(db.quote.products),detailUnchanged:detail===result.alternatives.detail.total.grand,errors:result.alternatives.tmc.errors,packageApplied:result.alternatives.tmc.products.some(p=>p.tmc?.items.some(i=>i.laborPricing?.name.startsWith('QA · Gói TMC')))};});
  expect(proof.technicalUnchanged).toBe(true);expect(proof.detailUnchanged).toBe(true);expect(proof.errors).toEqual([]);expect(proof.packageApplied).toBe(true);await p.locator('[data-tmc-labor-proof]').scrollIntoViewIfNeeded();await shot('06-doi-chieu-cong-da-gom');
  const after=await p.evaluate(async()=>({catalog:await teamApi('catalog'),quotes:await teamApi('quotes')}));expect(after).toEqual(before);expect(errors).toEqual([]);expect(blocked).toEqual([]);
  fs.writeFileSync(dir+'/verification.json',JSON.stringify({url:c.url,at:new Date().toISOString(),hash:actual,passed:true,businessWrites:0,scope:'Actual deployed UI; package and sample quote saved only in disposable browser working copy. Master API persistence tested on local server.',proof,errors},null,2));console.log('PASS production package workflow; screenshots captured; master catalog and quote list unchanged');
 }catch(e){await shot('failure');console.error('Browser errors:',errors);throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
