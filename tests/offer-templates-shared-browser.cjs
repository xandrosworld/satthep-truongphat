const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const b=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const url='http://127.0.0.1:'+app.server.address().port;
 await p.goto(url);await p.waitForFunction(()=>Team.available);
 await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Templates-browser-2026!'}));db.quote.offerTerms={};page='quote';render();b6TermsEdit();});
 expect(await p.evaluate(()=>Team.loaded)).toBe(false);
 await p.locator('[name=signature]').selectOption('none');await p.locator('[name=payment]').fill('30/70');await p.locator('[name=customerSigner]').fill('Private customer');
 await p.locator('[data-terms-template-save]').click();await expect(p.locator('[data-terms-template] option')).toHaveCount(2);
 expect(app.sql.prepare('SELECT COUNT(*) AS n FROM offer_term_templates').get().n).toBe(1);
 // A second browser/device sees the shared template, even before saving a quote.
 const p2=await b.newPage({viewport:{width:390,height:844}});await p2.goto(url);await p2.waitForFunction(()=>Team.available);
 await p2.evaluate(async()=>{teamSession(await teamApi('login','POST',{username:'admin',password:'Templates-browser-2026!'}));db.quote.offerTerms={};db.quote.issuer={};page='quote';render();b6TermsEdit();});
 await expect(p2.locator('[name=payment]')).toHaveValue('30/70');await expect(p2.locator('[name=customerSigner]')).toHaveValue('');await expect(p2.locator('[name=confirmTerms]')).not.toBeChecked();
 await p2.locator('[name=payment]').fill('50/50');await p2.locator('#dialog button[type=submit]').click();
 await p2.evaluate(()=>b6TermsEdit());await expect(p2.locator('[data-terms-template] option')).toHaveCount(2);await expect(p2.locator('[name=payment]')).toHaveValue('50/50');
 await p2.locator('[data-terms-template]').selectOption('0');await expect(p2.locator('[name=payment]')).toHaveValue('30/70');
 expect(JSON.parse(app.sql.prepare('SELECT document FROM offer_term_templates').get().document).payment).toBe('30/70');
 // A slow template response must not overwrite typing or a different dialog/quote.
 let release;await p2.route('**/api/intake/offer-templates',async route=>{await new Promise(r=>release=r);await route.continue();});
 await p2.evaluate(()=>{closeDialog();db.quote.offerTerms={};b6TermsEdit();});await expect.poll(()=>!!release).toBe(true);await p2.locator('[name=payment]').fill('Typing');release();await expect(p2.locator('[data-terms-template] option')).toHaveCount(2);await expect(p2.locator('[name=payment]')).toHaveValue('Typing');
 await p2.unroute('**/api/intake/offer-templates');await p2.screenshot({path:'artifacts/offer-templates-mobile.png'});
 expect(errors).toEqual([]);console.log('PASS shared templates across devices, unsaved quotes, automatic suggestions, editable terms, no confirmation/customer copying, slow-response protection');
 }finally{await b.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
