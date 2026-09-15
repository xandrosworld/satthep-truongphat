'use strict';
const {chromium,expect}=require('@playwright/test'),fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const dir=path.resolve(process.env.OPERATION_LINKAGE_ROOT||'artifacts/customer-review/operation-linkage-2026-09-15/local'),url=process.env.OPERATION_LINKAGE_URL||pathToFileURL(path.resolve('dist/index.html')).href;fs.mkdirSync(dir,{recursive:true});
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1600,height:1000}}),checks=[],errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(20000);
const pass=s=>{checks.push(s);console.log('PASS '+s);},submit=async()=>{await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).not.toBeVisible();},f=n=>p.locator('#dialog [name="'+n+'"]'),close=()=>p.locator('#dialog [data-action=close]').first().click();
try{
 await p.goto(url,{waitUntil:'domcontentloaded'});
 const ids=await p.evaluate(()=>{db=TPPrice.demoSeed();const c=db.quote.products[0].children[0],a=c.children[0],z=C.copy(a);z.id=C.uid();c.children.push(z);a.ops=[{id:'cut',mode:'inside',amount:1,inputs:{T:2}},{id:'weld',mode:'outside',amount:7}];z.ops=[];page='quote';tab='bom';render();persist();return {c:c.id,a:a.id,z:z.id};});
 await p.locator('[data-check-id="'+ids.a+'"]').check();await p.locator('[data-check-id="'+ids.z+'"]').check();await p.locator('[data-ux=bulk-op]').click();
 await p.locator('#dialog button[type=submit]').click();await expect(p.locator('#dialog')).toBeVisible();
 await p.locator('#dialog [name=operation][value=cut]').check();await p.locator('#dialog [name=operation][value=bend]').check();await f('amount-cut').fill('2');await f('mode-bend').selectOption('outside');await f('amount-bend').fill('3');
 await p.screenshot({path:path.join(dir,'01-multiple-operations.png')});await submit();
 const ops=await p.evaluate(ids=>[ids.a,ids.z].map(id=>C.findNode(db.quote.products,id).ops),ids);expect(ops[0].map(o=>o.id)).toEqual(['cut','weld','bend']);expect(ops[0][0].inputs.T).toBe(2);expect(ops[0][1].amount).toBe(7);expect(ops[1].map(o=>o.id)).toEqual(['cut','bend']);expect(ops[1][1].mode).toBe('outside');expect(ops[1][1].amount).toBe(3);
 pass('Gán nhiều nguyên công cho nhiều dòng, giữ nguyên công khác và đầu vào riêng; mỗi nguyên công có phương án/định mức riêng');
 await p.locator('[data-check-id="'+ids.c+'"]').check();await p.locator('[data-check-id="'+ids.a+'"]').check();await p.locator('[data-ux=bulk-op]').click();await p.locator('#dialog [name=operation][value=pack]').check();await submit();
 expect(await p.evaluate(ids=>[C.findNode(db.quote.products,ids.c).ops.some(o=>o.id==='pack'),C.findNode(db.quote.products,ids.a).ops.some(o=>o.id==='pack')],ids)).toEqual([true,false]);
 await p.reload({waitUntil:'domcontentloaded'});expect(await p.evaluate(id=>C.findNode(db.quote.products,id).ops.some(o=>o.id==='bend'),ids.z)).toBe(true);pass('Chọn cha và con chỉ gán cấp cha; F5 giữ nhiều nguyên công');
 await p.locator('[data-page=quote]').click();await p.locator('[data-tab=prices]').click();await p.locator('[data-intake=price-tab][data-id=operations]').click();
 await expect(p.locator('[data-qoc-rate=cut] [data-job-price="'+ids.a+'"]')).toContainText('nhập riêng');await expect(p.locator('[data-qoc-rate=cut] [data-job-price="'+ids.a+'"]')).toContainText('2 → 10%');await expect(p.locator('[data-qoc-rate=cut] [data-job-price="'+ids.z+'"]')).toContainText('liên kết dữ liệu');await p.locator('[data-qoc-table]').screenshot({path:path.join(dir,'02-prices-per-job.png')});pass('Bảng giá hiện mã/dòng, giá cơ sở, đơn giá thực tế, lượng và nguồn từng yếu tố');
 const before=await p.evaluate(()=>JSON.stringify(db.quote));
 await p.locator('[data-page=rates]').click();await p.locator('[data-rate-tab=tmc]').click();await p.locator('[data-gp=master-add]').click();await f('gp-group-name').fill('Tủ điện QA');await f('gp-formula').fill('Q * P_RATE');await f('gp-source').fill('Dữ liệu kiểm thử, không phải đơn giá khách hàng');await p.locator('[data-gp=add-param]').click();await f('gp-key').fill('P_RATE');await f('gp-name').fill('Đơn giá mỗi bộ');await f('gp-unit').fill('đ/bộ');await f('gp-value').fill('12345');await f('gp-net').check();await submit();
 expect(await p.evaluate(()=>JSON.stringify(db.quote))).toBe(before);await p.locator('[data-rate-tab=groups]').click();await expect(p.locator('[data-master-group]')).toContainText('Tủ điện QA');await p.screenshot({path:path.join(dir,'03-master-group.png')});
 const group=await p.evaluate(()=>db.pricingDefaults.productGroups[0].id);await p.reload({waitUntil:'domcontentloaded'});expect(await p.evaluate(()=>db.pricingDefaults.productGroups[0].parameters[0].value)).toBe(12345);pass('Thêm bảng giá nhóm với tham số riêng từ đơn giá đầu vào, lưu lại được và không đổi báo giá hiện tại');
 await p.locator('[data-page=quote]').click();await p.locator('[data-tab=prices]').click();await p.locator('[data-intake=price-tab][data-id=alternatives]').click();
 await p.locator('[data-gp=configure]').first().click();await p.locator('[data-gp=load-master][data-id="'+group+'"]').click();await submit();
 expect(await p.evaluate(()=>db.quote.pricing.productGroups[0].parameters[0].value)).toBe(12345);
 const productId=await p.evaluate(()=>db.quote.products[0].id);await p.locator('[data-pa=product-inputs]').first().click();await f('scope-'+productId).selectOption(group);await submit();expect(await p.evaluate(group=>result.alternatives['group:'+group].products[0].sell,group)).toBe(123450);
 await p.locator('[data-page=rates]').click();await p.locator('[data-rate-tab=groups]').click();await p.locator('[data-gp=master-edit]').click();await f('gp-value').fill('23456');await f('gp-net').check();await submit();
 expect(await p.evaluate(()=>db.quote.pricing.productGroups[0].parameters[0].value)).toBe(12345);pass('Lấy bảng nhóm chủ động vào báo giá; sửa tham số danh mục không đổi giá đã lấy');
 const caseIds=await p.evaluate(()=>{
  db=TPPrice.demoSeed();const a=C.copy(C.flatten(db.quote.products).find(n=>n.spec?.shape==='sheet')),z=C.copy(a);
  Object.assign(a,{id:'qa-thin',qty:4,dims:{L:1000,W:100},params:{T:99},ops:[{id:'cut',mode:'inside',amount:1}],rule:'flat',ruleSpec:C.copy(db.rules.find(r=>r.id==='flat'))});a.spec.props.T=1;delete a.paramLinks;
  Object.assign(z,C.copy(a),{id:'qa-thick'});z.spec.props.T=2;
  db.quote.remnantSelections={};db.quote.remnantMode='all';db.quote.products=[{id:'qa-product',kind:'product',name:'QA linkage',qty:2,params:{L:1000,W:100,H:50},ops:[],children:[{id:'qa-component',kind:'component',name:'QA component',qty:3,ops:[],children:[a,z]}]}];
  db.customers=[{id:'qa-A',name:'Customer A'},{id:'qa-B',name:'Customer B'}];db.quote.customer='Customer A';db.quote.customerInfo=C.copy(db.customers[0]);
  db.quote.ratesSnapshot.find(r=>r.id==='cut').factors=[
   {id:'t',name:'Thickness QA',param:'T',tiers:[{max:1,percent:10},{max:null,percent:20}]},
   {id:'q',name:'Quantity QA',param:'count',tiers:[{max:20,percent:0},{max:null,percent:-5}]},
   {id:'c',name:'Customer QA',param:'customerId',kind:'category',categories:[{key:'qa-A',percent:20},{key:'qa-B',percent:0}]},
   {id:'n',name:'Components QA',param:'totalComponentCount',tiers:[{max:3,percent:0},{max:null,percent:10}]}];
  page='quote';tab='prices';Intake.priceTab='operations';render();persist();return [a.id,z.id];
 });
 await p.locator('[data-intake=price-tab][data-id=operations]').click();
 let amounts=await p.evaluate(ids=>ids.map(id=>result.nodes[id].ownOps[0]),caseIds);
 expect(amounts[0].rate).toBeCloseTo(1379.4,7);expect(amounts[1].rate).toBeCloseTo(1504.8,7);expect(amounts[0].cost).toBeCloseTo(25987.896,7);expect(amounts[1].cost).toBeCloseTo(56700.864,7);
 expect(amounts[0].factors.map(f=>f.input)).toEqual([1,24,'qa-A',6]);
 await expect(p.locator('[data-job-price=qa-thin]')).toContainText('Components QA: 6');await p.locator('[data-qoc-table]').screenshot({path:path.join(dir,'04-linked-inputs.png')});
 await p.locator('[data-tab=preview]').click();await p.locator('[data-action=quote-info]').click();await f('customer').fill('Customer B');await submit();
 expect(await p.evaluate(()=>result.nodes['qa-thin'].ownOps[0].error)).toContain('Customer QA / customerId');
 await p.locator('[data-tab=intake]').click();await p.locator('[data-intake=choose-customer]').click();await f('customerId').selectOption('qa-B');await submit();
 expect(await p.evaluate(()=>result.nodes['qa-thin'].ownOps[0].rate)).toBeCloseTo(1149.5,7);
 await p.locator('[data-tab=bom]').click();const qty=p.locator('[data-qid=qa-product][data-qkey=qty]');await qty.fill('1');await qty.press('Tab');
 expect(await p.evaluate(()=>result.nodes['qa-thin'].ownOps[0].rate)).toBeCloseTo(1100,7);
 expect(await p.evaluate(()=>result.nodes['qa-thin'].ownOps[0].factors.map(f=>f.input))).toEqual([1,12,'qa-B',3]);
 await p.reload();expect(await p.evaluate(()=>result.nodes['qa-thin'].ownOps[0].rate)).toBeCloseTo(1100,7);pass('Giá từng dòng khớp số tính tay; đổi khách không dùng mã cũ, chọn hồ sơ và đổi lượng cập nhật đúng hệ số qua F5');
 expect(errors).toEqual([]);fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({passed:true,url,checks,errors},null,2));
}catch(e){console.error(e);await p.screenshot({path:path.join(dir,'FAILURE.png')}).catch(()=>{});fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({passed:false,url,checks,errors,error:e.stack},null,2));process.exitCode=1;}finally{await b.close();}})();
