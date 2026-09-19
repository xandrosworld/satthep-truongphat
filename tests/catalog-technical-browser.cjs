'use strict';
const {chromium,expect}=require('@playwright/test'),fs=require('node:fs'),path=require('node:path');
const {createApp}=require('../server/app.cjs');
(async()=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:1500,height:1050}}),errors=[];
 const dir=path.resolve('artifacts/customer-review/catalog-finish-20260919/local');fs.mkdirSync(dir,{recursive:true});
 p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(10000);
 const submit=async()=>{await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();};
 const open=async()=>{await p.waitForFunction(()=>Team.available&&Team.user);await p.evaluate(()=>Team.requireLogin=true);await p.locator('[data-page=rules]').click();await p.waitForFunction(()=>Team.loaded&&page==='rules');};
 try{
  await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
  await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'QA',password:'Catalog-technical-test-42!'}));Team.requireLogin=true;render();});
  await open();await p.locator('[data-rc-tab=operations]').click();
  const before=await p.evaluate(()=>JSON.stringify(db.rates.find(x=>x.id==='cut')));
  await expect(p.locator('#content')).not.toContainText('Cách giá đã khai');
  await expect(p.locator('[data-tl-new]')).toHaveCount(0);
  await p.locator('[data-technical-rate=cut]').click();
  await expect(p.locator('#dialog [name=inside],#dialog [name=outside],#review-price-options,[data-operation-package]')).toHaveCount(0);
  await p.locator('[name=machine]').fill('Máy laser QA');await p.locator('[name=technicalNotes]').fill('Kiểm tra bản vẽ trước khi cắt');await submit();
  expect(await p.evaluate(()=>db.rates.find(x=>x.id==='cut'))).toEqual({...JSON.parse(before),machine:'Máy laser QA',technicalNotes:'Kiểm tra bản vẽ trước khi cắt'});
  await p.evaluate(()=>cdSave());await p.screenshot({path:dir+'/01-cong-doan-ky-thuat.png',fullPage:true});
  await p.locator('[data-page=rates]').click();await p.waitForFunction(()=>page==='rates');await p.evaluate(()=>{rateTab='operations';render();workRateEdit('cut',true);});
  await expect(p.locator('[name=inside]')).toBeVisible();await expect(p.locator('[name=outside]')).toBeVisible();
  await p.evaluate(()=>closeDialog());await open();await p.locator('[data-rc-tab=shapes]').click();await p.locator('[data-definition=shape-new]').click();
  await p.locator('[name=id]').fill('SHAPE-Z-QA');await p.locator('[name=name]').fill('Thanh Z theo bảng tra');await p.locator('[name=blankShapeName]').fill('Phôi chữ Z riêng');
  await submit();await expect(p.locator('[data-rc-definition=SHAPE-Z-QA]')).toContainText('Phôi chữ Z riêng');
  await p.evaluate(()=>cdSave());await p.reload();await open();await p.locator('[data-rc-tab=shapes]').click();
  await expect(p.locator('[data-rc-definition=SHAPE-Z-QA]')).toContainText('Phôi chữ Z riêng');
  await p.locator('[data-definition=shape-edit][data-id=SHAPE-Z-QA]').click();await expect(p.locator('[name=blankShapeName]')).toHaveValue('Phôi chữ Z riêng');
  await p.screenshot({path:dir+'/02-hinh-dang-phoi.png',fullPage:true});await p.evaluate(()=>closeDialog());
  // Apply the saved definition to a material and calculate a real BOM snapshot.
  await p.locator('[data-definition=shape-material][data-id=SHAPE-Z-QA]').click();await p.locator('[name=id]').fill('VT-Z-QA');await p.locator('[name=price]').fill('20000');await submit();
  expect(await p.evaluate(()=>{const m=db.materials.find(x=>x.id==='VT-Z-QA');return {label:m.shapeDefinition.blankShapeName,kg:TPDefinitions.geometry({spec:m,dims:{L:2000}},3).weight};})).toEqual({label:'Phôi chữ Z riêng',kg:60});
  await p.evaluate(()=>cdSave());
  const snapshot=await p.evaluate(async()=>{
   const document=C.copy(db),m=document.materials.find(x=>x.id==='VT-Z-QA');
   document.quote.id='QA-CUSTOM-SHAPE';document.quote.products=[{id:'prod',name:'Phôi Z',kind:'product',qty:1,unit:'bộ',ops:[],children:[{id:'row',name:m.name,kind:'material',qty:3,materialId:m.id,spec:C.copy(m),dims:{L:2000},ops:[],children:[]}]}];
   const saved=await teamApi('quotes','POST',{document}),loaded=await teamApi('quotes/'+saved.id);
   return {label:loaded.document.quote.products[0].children[0].spec.shapeDefinition.blankShapeName,kg:C.calculate(loaded.document).rows[0].geometry.weight};
  });
  expect(snapshot).toEqual({label:'Phôi chữ Z riêng',kg:60});
  await p.evaluate(async()=>{await teamApi('users','POST',{username:'tech',name:'QA tech',password:'Catalog-technical-test-42!',role:'technical',technicalDelegation:true,canViewCosts:false,canFormulaView:true,canFormulaEdit:true,sections:['bom','operations','catalogRules']});teamSession(await teamApi('login','POST',{username:'tech',password:'Catalog-technical-test-42!'}));render();});
  await open();await p.locator('[data-rc-tab=operations]').click();await p.locator('[data-technical-rate=cut]').click();
  await expect(p.locator('[name=machine]')).toHaveValue('Máy laser QA');await p.locator('[name=machine]').fill('Máy laser do kỹ thuật cập nhật');await submit();
  await p.locator('[data-action=new-rate]').click();await p.locator('[name=name]').fill('Khoan QA');await p.locator('[name=machine]').fill('Máy khoan QA');await submit();
  await p.evaluate(()=>cdSave());await p.reload();await open();await p.locator('[data-rc-tab=operations]').click();
  await expect(p.locator('#content')).toContainText('Máy laser do kỹ thuật cập nhật');await expect(p.locator('#content')).toContainText('Máy khoan QA');
  expect(await p.evaluate(()=>db.rates.every(r=>r.inside===0&&r.outside===0))).toBe(true);
  await p.screenshot({path:dir+'/03-ky-thuat-luu-tai-lai.png',fullPage:true});
  expect(errors).toEqual([]);console.log('PASS: technical-only operation editor, input prices, custom blank label/formula/material, server reload and delegated technical creation');
 }catch(e){await p.screenshot({path:dir+'/failure.png',fullPage:true});console.error(e);console.error(errors);process.exitCode=1;}
 finally{await browser.close();await new Promise(r=>app.server.close(r));}
})();
