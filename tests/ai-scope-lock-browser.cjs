const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs'),path=require('path');
(async()=>{
 const item={group:'Group A',name:'Part A',material:'Steel',specification:'',quantity:2,unit:'pcs',lengthMm:70,widthMm:70,thicknessMm:2,diameterMm:null,page:1,evidence:'70 x 70',warnings:[]};
 const app=createApp({staticRoot:path.resolve('dist'),aiProvider:async()=>({result:{title:'Hai cá»¥m',warnings:[],items:[item,{...item,group:'Cá»¥m B',name:'Chi tiáº¿t B'}]},model:'test',usage:{}})});
 await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});
 try{const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 const id=await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password:'Scope-test-password!'}));const q=await teamApi('quotes','POST',{document:TPPrice.demoSeed()});await teamApi('users','POST',{username:'tech',name:'Tech',password:'Scope-test-password!',role:'technical',sections:['bom','operations']});await teamLoad(q.id);tab='intake';render();return q.id;});
 await expect(p.locator('[data-ai-home]')).toHaveCount(0);
 await p.evaluate(async id=>{teamSession(await teamApi('login','POST',{username:'tech',password:'Scope-test-password!'}));await teamLoad(id);tab='bom';render();},id);
 await p.locator('[data-ai-home]').click();await p.locator('[name=pdf]').setInputFiles({name:'scope.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4\n%%EOF')});await p.locator('#dialog button[type=submit]').click();await expect(p.locator('.ai-review-row')).toHaveCount(2);
 const target=await p.evaluate(()=>db.quote.products[0].id);await p.locator('[name=ai-target]').selectOption(target);await p.locator('[name=pick]').first().check();await p.locator('[name=mat-0]').selectOption('PH-T20');await p.locator('[name=confirmed]').check();await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
 await p.evaluate(async()=>{await teamSave();await teamLoad(Team.link.id);});expect(await p.evaluate(target=>db.quote.products.find(n=>n.id===target).children.some(n=>n.aiSourceKey),target)).toBe(true);
 await p.evaluate(async()=>{teamSession(await teamApi('login','POST',{username:'admin',password:'Scope-test-password!'}));page='rules';await cdLoad();});
 await p.evaluate(async()=>{mutation(()=>{db.rules.push({...C.copy(db.rules[0]),id:'unused-ai-lock-test',name:'Unused test rule'});},{preserveQuote:true});await cdSave();});
 const removed=await p.evaluate(()=>{mutation(()=>{db.rules=db.rules.filter(x=>x.id!=='unused-ai-lock-test');},{preserveQuote:true});return 'rules:unused-ai-lock-test';});
 await p.evaluate(()=>formulaLocks());await expect(p.locator('[data-formula-lock="'+removed+'"]')).toHaveCount(0);
 const button=p.locator('[data-formula-lock][data-locked="1"]').first();const key=await button.getAttribute('data-formula-lock');await button.click();await p.locator('[name=reason]').fill('Chá»‘t kiá»ƒm tra');await p.locator('#dialog button[type=submit]').click();await expect(p.locator('[data-formula-lock="'+key+'"][data-locked="0"]')).toBeVisible();
 expect(errors).toEqual([]);console.log('PASS technical AI imports/save/reload, intake hidden, deleted formula publication, lock success');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

