const {chromium,expect}=require('@playwright/test'),{pathToFileURL}=require('node:url'),path=require('node:path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1440,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));try{
 await p.goto(pathToFileURL(path.resolve('dist/index.html')).href);
 const before=await p.evaluate(()=>{db=TPPrice.demoSeed();db.quote.status='draft';const copy=C.copy(db.quote.products[0]);for(const n of C.flatten([copy]))n.id+='-copy';db.quote.products.push(copy);page='quote';tab='prices';Intake.priceTab='materials';render();const row=TPIntake.priceRows(db)[0];return {name:row.name,count:row.targets.length,catalog:JSON.stringify(db.materials)};});
 expect(before.count).toBeGreaterThan(1);await expect(p.locator('[data-b1-inline-price]').first()).toBeEnabled();await expect(p.locator('[data-price-row="0"] .material-price-name')).toHaveText(before.name);
 await p.locator('[name=price-0]').fill('78000');await expect(p.locator('[name=price-selected][value="0"]')).toBeChecked();await p.locator('#intake-material-prices button[type=submit]').click();await expect(p.locator('#dialog .material-price-name')).toHaveText(before.name);await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
 expect(await p.evaluate(()=>TPIntake.priceRows(db)[0].targets.every(n=>n.price===78000))).toBe(true);expect(await p.evaluate(()=>JSON.stringify(db.materials))).toBe(before.catalog);await expect(p.locator('[data-b1-inline-price]').first()).toHaveValue('78000');expect(errors).toEqual([]);console.log('PASS material names and grouped price update across repeated materials');
 const inline=p.locator('[data-b1-inline-price]').first();
 await p.locator('[name=price-1]').fill('12345');
 await inline.fill('81000');const scroll=await p.evaluate(()=>({x:scrollX,y:scrollY}));await inline.press('Enter');
 await expect(inline).toHaveValue('81000');await expect(inline).toBeFocused();expect(await p.evaluate(()=>({x:scrollX,y:scrollY}))).toEqual(scroll);
 expect(await p.evaluate(()=>TPIntake.priceRows(db)[0].targets.every(n=>n.price===81000))).toBe(true);await expect(p.locator('[name=price-0]')).toHaveValue('81000');
 await expect(p.locator('[name=price-1]')).toHaveValue('12345');await expect(p.locator('[name=price-selected][value="1"]')).toBeChecked();
 await inline.fill('-1');await inline.press('Enter');expect(await p.evaluate(()=>TPIntake.priceRows(db)[0].targets.every(n=>n.price===81000))).toBe(true);
 await inline.fill('0');await inline.press('Tab');await expect(p.locator('[name=price-0]')).toHaveValue('0');expect(await p.evaluate(()=>JSON.stringify(db.materials))).toBe(before.catalog);
 await p.evaluate(()=>{db.quote.status='approved';render();});await expect(inline).toBeDisabled();expect(errors).toEqual([]);console.log('PASS bidirectional grouped prices, Enter/blur, zero, invalid values, scroll/focus, approved lock and unchanged catalog');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
