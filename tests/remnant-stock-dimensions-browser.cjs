const {chromium,expect}=require('@playwright/test'),path=require('path'),{pathToFileURL}=require('url');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(pathToFileURL(path.resolve('artifacts/gd1-report-2026-09-20/release/dist/index.html')).href);
await p.evaluate(()=>{db=TPPrice.demoSeed();db.quote.remnantSelections={};db.quote.remnantMode="all";for(const n of C.flatten(db.quote.products))if(n.spec?.shape==="sheet")n.materialEstimate={method:"percent",basis:"consumed",percent:5};page='quote';tab='waste';MaterialEstimateUI.proposal=true;BatchOneUI.cutOpen=true;render();});
const original=await p.evaluate(()=>JSON.stringify(db));
const preview=await p.evaluate(()=>remnantStockPricing());expect(preview.estimated).toBe(true);expect(await p.evaluate(()=>JSON.stringify(db))).toBe(original);
await p.locator('[data-remnant-batch]').first().check();
const comparison=await p.evaluate(()=>({all:remnantStockPricing().reuse.chargeAll.grand,exclude:remnantStockPricing().reuse.excludeSelected.grand}));expect(comparison.exclude).toBeLessThan(comparison.all);
await p.locator('[name=remnant-mode][value=exclude]').check();expect(await p.evaluate(()=>result.total.grand)).toBe(comparison.exclude);
const count=await p.evaluate(()=>result.groups.map(g=>g.layout?.stocks.length));
await p.locator('[data-remnant-batch]').nth(1).check();const lower=await p.evaluate(()=>result.total.grand);expect(lower).toBeLessThan(comparison.exclude);expect(await p.evaluate(()=>result.groups.map(g=>g.layout?.stocks.length))).toEqual(count);
await p.reload();expect(await p.evaluate(()=>result.total.grand)).toBe(lower);
await p.evaluate(()=>{tab='waste';MaterialEstimateUI.proposal=true;BatchOneUI.cutOpen=true;render();});await p.locator('[name=remnant-mode][value=all]').check();expect(await p.evaluate(()=>result.total.grand)).toBe(comparison.all);
// Linked rows are calculation copies: switching mode must update actual saved nodes.
await p.evaluate(()=>{const n=C.scopedLeaves(db.quote.products[0]).find(n=>n.spec.shape==='sheet');n.materialEstimate={method:'percent',basis:'consumed',percent:10};n.dimensionLinks={L:{mode:'formula',expression:String(n.dims.L)}};render();});
await expect(p.locator('.remnant-comparison')).toContainText('Đang tính vật tư theo hao hụt');await p.locator('[name=remnant-mode][value=all]').check();expect(await p.evaluate(()=>C.flatten(db.quote.products).some(n=>n.materialEstimate))).toBe(false);
// Actual polygon input fields appear and edits recalculate geometry and survive reload.
const id=await p.evaluate(()=>{const n=C.scopedLeaves(db.quote.products[0]).find(n=>n.spec.shape==='sheet');n.spec=DFC().applyShape(n.spec,{id:'TEST-TRIANGLE',name:'Tam giác',...DFC().polygonPreset('triangle',3)},{T:2});n.dims={C1:300,C2:400,C3:500};n.dimensionLinks={};n.paramLinks={};page='quote';tab='bom';UX.mode='quick';render();return n.id;});
for(const [k,v] of Object.entries({C1:'300',C2:'400',C3:'500'}))await expect(p.locator('[data-qid="'+id+'"][data-qkey='+k+']')).toHaveValue(v);
const weight=await p.evaluate(id=>result.nodes[id].weight,id);await p.locator('[data-qid="'+id+'"][data-qkey=C1]').fill('350');await p.locator('[data-qid="'+id+'"][data-qkey=C1]').press('Tab');expect(await p.evaluate(id=>result.nodes[id].weight,id)).not.toBe(weight);
await p.reload();expect(await p.evaluate(id=>C.findNode(db.quote.products,id).dims.C1,id)).toBe(350);expect(errors).toEqual([]);console.log('PASS remnant stock previews, explicit estimate transition, live selections, reload, linked nodes and editable triangle dimensions');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
