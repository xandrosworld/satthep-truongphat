const {chromium,expect}=require('@playwright/test'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage();await p.goto(pathToFileURL(path.resolve('artifacts/gd1-report-2026-09-20/release/dist/index.html')).href);
const name=await p.evaluate(()=>{db=TPPrice.demoSeed();page='rules';RulesCatalog.kind='substances';render();return TPConventions.entries(db,'substances')[0].name;});
await p.locator('[data-rc=edit][data-name="'+name+'"]').first().click();await p.locator('[name=materialShapes][value=sheet]').check();const choices=await p.locator('[name=materialShapes]').evaluateAll(xs=>xs.map(x=>x.value));const second=choices.find(x=>x!=='sheet');await p.locator('[name=materialShapes][value="'+second+'"]').check();await p.locator('#dialog button[type=submit]').click();
expect(await p.evaluate(name=>TPConventions.entries(db,'substances').find(x=>x.name===name).materialShapes,name)).toContain('sheet');
await p.reload();expect(await p.evaluate(name=>TPConventions.entries(db,'substances').find(x=>x.name===name).materialShapes,name)).toEqual(['sheet',second]);console.log('PASS substance shapes multi-selection, save and reload');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
