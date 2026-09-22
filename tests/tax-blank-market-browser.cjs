const {chromium,expect}=require('@playwright/test');
const {pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 try{
  const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(pathToFileURL(path.resolve(process.env.REVIEW_HTML||'dist/index.html')).href);
  const data=process.env.REVIEW_DOCUMENT?JSON.parse(fs.readFileSync(process.env.REVIEW_DOCUMENT,'utf8')).quote.document:null;
  await p.evaluate(d=>{db=d||TPPrice.demoSeed();db.quote.products.forEach(n=>{n.pricePerKg=40000;n.competitorPrice=130000;n.marketPrice=null;n.marketSource='';});page='quote';tab='prices';Intake.priceTab='kg';render();},data);
  await p.locator('[data-tax=edit]').first().click();
  for(const s of await p.locator('#dialog select[name^=tax-]:enabled').all())await s.selectOption('excluded');
  await expect(p.locator('[name=market-value-0]')).toHaveValue('');
  await expect(p.locator('[name=tax-market-0]')).toBeDisabled();
  await p.locator('[name=outputRate]').fill('10');
  await p.locator('[name=costConfirmed]').check();await p.locator('[name=outputConfirmed]').check();
  await p.locator('[name=taxReason]').fill('Rà giá chưa thuế theo báo giá thử');
  await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
  const before=await p.evaluate(()=>({cost:result.tax.costKnown,output:result.tax.outputKnown,market:db.quote.products[0].marketPrice,kg:db.quote.products[0].pricePerKg,competitor:db.quote.products[0].competitorPrice,errors:result.tax.releaseErrors}));
  expect(before.cost).toBe(true);expect(before.output).toBe(true);expect(before.market).toBeNull();expect(before.kg).toBe(40000);expect(before.competitor).toBe(130000);expect(before.errors).toEqual([]);
  await p.evaluate(()=>persist());await p.reload();
  expect(await p.evaluate(()=>({cost:result.tax.costKnown,output:result.tax.outputKnown,market:db.quote.products[0].marketPrice}))).toEqual({cost:true,output:true,market:null});
  await p.evaluate(()=>{page='quote';tab='prices';Intake.priceTab='kg';render();});await p.locator('[data-tax=edit]').first().click();
  await expect(p.locator('[name=tax-kg-0]')).toHaveValue('excluded');await expect(p.locator('[name=tax-competitor-0]')).toHaveValue('excluded');
  expect(errors).toEqual([]);console.log('PASS blank optional market price saves tax review without altering kg/competitor price; confirmations survive reload');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
