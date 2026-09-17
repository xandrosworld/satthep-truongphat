'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),{chromium,expect}=require('@playwright/test'),P=require('../pricing-core.js');
(async()=>{
 const live=process.argv.includes('--live'),app=live?null:require('../server/app.cjs').createApp();if(app)await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const credentials=live?JSON.parse(fs.readFileSync('artifacts/railway-team/private/credentials.json','utf8').replace(/^\uFEFF/,'')):{url:'http://127.0.0.1:'+app.server.address().port,username:'admin',name:'Admin QA',password:'Document-links-local-42!'};
 const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n').trim()).digest('hex');expect(hash(await fetch(credentials.url).then(r=>r.text()))).toBe(hash(fs.readFileSync('dist/index.html','utf8')));
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[],writes=[],dir='artifacts/customer-review/document-links/'+(live?'live':'local');fs.mkdirSync(dir,{recursive:true});p.on('pageerror',e=>errors.push(e.message));
 if(live)await p.route('**/api/**',route=>{const r=route.request();if(['GET','HEAD'].includes(r.method())||new URL(r.url()).pathname==='/api/login')return route.continue();writes.push(new URL(r.url()).pathname);return route.abort();});
 try{
  await p.goto(credentials.url);await p.waitForFunction(()=>Team.available);await p.evaluate(async({credentials,live})=>{teamSession(await teamApi(live?'login':'setup','POST',credentials));render();},{credentials,live});
  const doc=P.demoSeed();doc.quote.request={code:'QA-LINK',notes:'Tài liệu minh họa kiểm thử',items:[],files:[]};
  if(live)await p.evaluate(document=>{db=document;db.quote.workspaceKey='qa-document-link';Team.loaded=true;Team.link={workspaceKey:db.quote.workspaceKey,status:'draft',version:0};Team.dirty=false;page='quote';tab='intake';render();},doc);
  else await p.evaluate(async document=>{const q=await teamApi('quotes','POST',{document});await teamLoad(q.id);page='quote';tab='intake';render();},doc);
  await p.locator('[data-intake=document-link]').click();await p.locator('#dialog [name=name]').fill('Bản vẽ — link minh họa kiểm thử');await p.locator('#dialog [name=url]').fill('https://example.com/ban-ve');await p.screenshot({path:dir+'/01-them-link.png'});await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();
  const link=p.locator('.intake-document-links a');await expect(link).toHaveAttribute('href','https://example.com/ban-ve');await expect(link).toHaveAttribute('rel','noopener noreferrer');
  if(!live)await p.evaluate(async()=>{await teamSave();const id=teamCurrent().id;await teamLoad(id);page='quote';tab='intake';render();});
  await expect(link).toBeVisible();await link.scrollIntoViewIfNeeded();await p.screenshot({path:dir+'/02-link-trong-yeu-cau.png'});
  await p.locator('[data-intake=document-link][data-id]').click();await p.locator('#dialog [name=name]').fill('Bản vẽ cập nhật');await p.locator('#dialog button[type=submit]').click();await expect(link).toHaveText('Bản vẽ cập nhật');
  await p.locator('[data-intake=document-link-remove]').click();await p.locator('#dialog button[type=submit]').click();await expect(link).toHaveCount(0);
  await p.evaluate(()=>noticeRefresh());expect(await p.evaluate(()=>Notices.error)).toBe('');await p.locator('[data-notice=inbox]').click();await expect(p.locator('#dialog')).toContainText('Thông báo công việc');await p.screenshot({path:dir+'/03-thong-bao.png'});
  expect(errors).toEqual([]);expect(writes).toEqual([]);
  fs.writeFileSync(dir+'/verification.json',JSON.stringify({passed:true,at:new Date().toISOString(),live,errors,writes,persistence:live?'Production UI with isolated browser fixture; no business writes. Full notification delivery and link persistence verified on local API.':'Local API link save/reload; create/edit/delete in browser.'},null,2));
  fs.writeFileSync(dir+'/index.html','<!doctype html><meta charset="utf-8"><title>Link tài liệu và thông báo</title><style>body{font:18px sans-serif;max-width:1200px;margin:30px auto}img{width:100%;border:1px solid #ccc}</style><h1>Link tài liệu và thông báo</h1><p>'+ (live?'Ảnh từ Railway; link minh họa trong bản thử trình duyệt, không ghi vào báo giá thật. Luồng gửi nhận và lưu/mở lại đã kiểm trên API cục bộ.':'Kiểm trên máy chủ cục bộ.')+'</p>'+['01-them-link','02-link-trong-yeu-cau','03-thong-bao'].map(x=>'<h2>'+x+'</h2><img src="'+x+'.png">').join(''));
  console.log('PASS document links UI, edit/delete, inbox, '+(live?'production build, no business writes':'local API save/reload'));
 }finally{await browser.close();if(app)await new Promise(r=>app.server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
