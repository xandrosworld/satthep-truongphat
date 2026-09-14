// Customer-perspective acceptance checks, including previously reproduced UX failures.
// Interactions are through visible UI in isolated local browser storage, never the customer website.
const {chromium,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
(async()=>{
  const fallback=path.join(process.env.LOCALAPPDATA||'','ms-playwright','chromium-1228','chrome-win64','chrome.exe');
  const browser=await chromium.launch({headless:true,...(fs.existsSync(fallback)?{executablePath:fallback}:{})});
  const results=[],screens=path.resolve('artifacts/customer-review');fs.mkdirSync(screens,{recursive:true});
  async function scenario(name,run){const context=await browser.newContext({viewport:{width:1366,height:900}}),p=await context.newPage();try{await p.goto('http://127.0.0.1:4173');await run(p);results.push({name,status:'PASS'});}catch(e){results.push({name,status:'NEEDS_FIX',reason:e.message.split('Call log:')[0].slice(0,1600)});}finally{await context.close();}}
  const submit=p=>p.locator('#dialog button[type=submit]').click();
  await scenario('Create a quotation variant through visible controls',async p=>{
    await p.getByRole('button',{name:'Tạo biến thể',exact:true}).click();
    for(const [name,value]of Object.entries({L:1800,W:400,H:100,qty:5}))await p.locator('#dialog [name='+name+']').fill(String(value));
    await submit(p);const product=p.locator('.quick-product').last();
    await expect(product.locator('.quick-product-title')).toContainText('400 × 100, dài 1.800 mm');
    await expect(product.locator('input[data-qkey=W]')).toHaveCount(2);
    for(const input of await product.locator('input[data-qkey=W]').all())await expect(input).toHaveValue('400');
    await expect(product.locator('.product-quantity input')).toHaveValue('5');
    await expect(p.locator('#quick-errors')).toBeEmpty();
    await product.screenshot({path:path.join(screens,'09-new-variant-pass.png')});
  });
  await scenario('Searching a component must keep its materials editable in context',async p=>{
    await p.getByRole('textbox',{name:'Tìm trong cấu thành',exact:true}).fill('Thân máng cáp');
    await p.screenshot({path:path.join(screens,'15-search-context-fixed.png'),fullPage:true});
    expect(await p.locator('.quick-row input[data-qkind=dimension]').count(),'Component matches, but all its material dimension inputs are hidden').toBeGreaterThan(0);
  });
  await scenario('Pasted Vietnamese thousands notation must not silently become a decimal',async p=>{
    await p.locator('.quick-product').first().getByRole('button',{name:'Dán từ Excel',exact:true}).click();
    await p.getByRole('textbox',{name:'Dữ liệu từ Excel',exact:true}).fill('PH-T15\t2\t1.800\t400');
    await submit(p);
    if(await p.locator('#dialog').isVisible()){await expect(p.locator('#dialog-error')).toContainText('hai cách hiểu');await p.screenshot({path:path.join(screens,'16-excel-ambiguity-blocked.png')});return;}
    const row=p.locator('.quick-product').first().locator('tbody tr').last();
    await row.screenshot({path:path.join(screens,'16-excel-correct-dimensions.png')});
    expect(await row.locator('input[data-qkey=L]').inputValue(),'Input 1.800 was accepted without clarification; Vietnamese user intended 1800 mm').toBe('1800');
  });
  await scenario('Creating a component continues directly into its material picker',async p=>{
    const product=p.locator('.quick-product').first();
    await product.getByRole('button',{name:'+ Cấu kiện',exact:true}).click();
    await p.getByRole('textbox',{name:'Tên cấu kiện',exact:true}).fill('Giá đỡ kiểm thử');await submit(p);
    const title=await p.locator('#dialog-title').innerText();
    await p.screenshot({path:path.join(screens,'17-add-material-correct-context.png')});
    expect(title).toContain('Giá đỡ kiểm thử');
    await p.getByRole('textbox',{name:'Tìm mã vật tư',exact:true}).fill('PH-H402');
    await p.locator('[data-basket-id="PH-H402"]').check();await submit(p);
    await expect(product.locator('tr').filter({hasText:'Giá đỡ kiểm thử'})).toContainText('1 thành phần');
    await expect(p.locator('#quick-errors')).toBeEmpty();
  });
  await scenario('A component can be created empty and completed through its visible inline action',async p=>{
    const product=p.locator('.quick-product').first();
    await product.getByRole('button',{name:'+ Cấu kiện',exact:true}).click();
    await p.getByRole('textbox',{name:'Tên cấu kiện',exact:true}).fill('Giá đỡ làm sau');
    await p.locator('#dialog [name=addMaterials]').uncheck();await submit(p);
    await expect(p.locator('#dialog')).not.toBeVisible();
    await expect(p.locator('#quick-errors')).not.toBeEmpty();
    await product.getByRole('button',{name:'Thêm vật tư vào Giá đỡ làm sau',exact:true}).click();
    await p.locator('#pick-search').fill('PH-H402');await p.locator('[data-basket-id="PH-H402"]').check();await submit(p);
    await expect(p.locator('#quick-errors')).toBeEmpty();
    await expect(product.locator('tr').filter({hasText:'Giá đỡ làm sau'})).toContainText('1 thành phần');
  });
  await scenario('Changing product filters clears bulk selection instead of keeping hidden targets',async p=>{
    await p.locator('[data-check-product]').first().check();
    expect(await p.evaluate(()=>UX.checked.size)).toBeGreaterThan(0);
    await p.locator('#quick-product-filter').selectOption({index:2});
    expect(await p.evaluate(()=>UX.checked.size)).toBe(0);
    await expect(p.locator('.quick-product')).toHaveCount(1);
  });
  await browser.close();fs.writeFileSync(path.join(screens,'acceptance-results.json'),JSON.stringify(results,null,2));
  for(const result of results)console.log(result.status+': '+result.name);
  process.exitCode=results.some(r=>r.status!=='PASS')?1:0;
})().catch(e=>{console.error(e.message);process.exit(1);});
