const {chromium,expect}=require('@playwright/test'),{pathToFileURL}=require('url'),path=require('path');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));try{
await p.goto(pathToFileURL(path.resolve('dist/index.html')).href);
await p.evaluate(()=>{db=TPPrice.demoSeed();page='quote';tab='operations';Team.user={role:'admin'};Team.permissions={factors:true};paPolicy();});
await expect(p.locator('[data-admin-calculation-note]')).toHaveCount(2);await expect(p.locator('[data-admin-calculation-note][open]')).toHaveCount(0);await expect(p.locator('[data-b3=add-production-factor]')).toBeVisible();
await p.evaluate(()=>{closeDialog();Team.user={role:'estimator'};Team.permissions={factors:false};paPolicy();});
await expect(p.locator('[data-admin-calculation-note]')).toHaveCount(0);await expect(p.locator('[data-b3=add-production-factor]')).toHaveCount(0);await expect(p.locator('[data-pa=add-sales-factor]')).toHaveCount(0);
await p.evaluate(()=>{closeDialog();Team.permissions.factors=true;paPolicy();});await expect(p.locator('[data-pa=add-sales-factor]')).toBeVisible();await expect(p.locator('[data-admin-calculation-note]')).toHaveCount(0);
await p.evaluate(()=>{closeDialog();Team.user=null;Team.permissions=null;for(const n of C.flatten(db.quote.products))n.ops=[];render();technicalSelectOperation();});
await p.locator('[data-operation-pick-none]').click();const options=p.locator('[name=operationIds]'),ids=await options.evaluateAll(xs=>xs.slice(0,2).map(x=>x.value));expect(ids.length).toBe(2);await options.nth(0).check();await options.nth(1).check();await p.locator('#dialog button[type=submit]').click();
expect(await p.evaluate(()=>db.quote.operationColumns)).toEqual(ids);await expect(p.locator('.pa-operations thead th')).toHaveCount(4);
await p.evaluate(()=>persist());await p.reload();await p.evaluate(()=>{page='quote';tab='operations';render();technicalSelectOperation();});await expect(p.locator('[name=operationIds]:checked')).toHaveCount(2);
await p.evaluate(id=>{closeDialog();C.flatten(db.quote.products)[0].ops=[{id,mode:'inside',amount:1}];technicalSelectOperation();},ids[0]);await expect(p.locator('[name=operationIds][value="'+ids[0]+'"]')).toBeDisabled();
expect(errors).toEqual([]);console.log('PASS admin-only collapsed notes; delegated factor creation; multiple operation columns, reload and used-operation preservation');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
