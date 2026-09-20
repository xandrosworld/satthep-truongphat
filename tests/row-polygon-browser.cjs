const {chromium,expect}=require('@playwright/test');
const {pathToFileURL}=require('url'),path=require('path'),fs=require('fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 try{
  const p=await b.newPage(),errs=[];
  p.on('pageerror',e=>errs.push(e.message));
  await p.goto(pathToFileURL(path.resolve(process.env.REVIEW_HTML||'dist/index.html')).href);
  const data=process.env.REVIEW_DOCUMENT?JSON.parse(fs.readFileSync(process.env.REVIEW_DOCUMENT,'utf8')).quote.document:null;
  const id=await p.evaluate(d=>{db=d||TPPrice.demoSeed();page='quote';tab='bom';UX.mode='quick';render();return C.flatten(db.quote.products).find(n=>n.spec?.shape==='sheet').id;},data);
  const field=k=>p.locator('[name='+k+']'),submit=()=>p.locator('#dialog button[type=submit]');
  const open=()=>p.locator('[data-row-polygon="'+id+'"]').first().click();
  const geometry=()=>p.evaluate(id=>{const r=result.rows.find(r=>r.id===id),g=result.groups.find(g=>g.rows.some(r=>r.id===id));return {area:r.geometry.blankArea/r.count,sides:r.geometry.sideLengths,points:r.geometry.polygon.length,placements:g.layout.stocks.flatMap(s=>s.placements).filter(p=>p.rowId===id).map(p=>p.polygon?.length)};},id);
  await open();
  for(const [key,value]of [['C1','300'],['C2','400'],['C3','900']])await field(key).fill(value);
  await expect(submit()).toBeDisabled();
  await field('C3').fill('500');
  await expect(p.locator('[data-polygon-preview] polygon')).toHaveCount(1);
  await submit().click();await expect(p.locator('#dialog')).not.toBeVisible();
  let g=await geometry();expect(g.area).toBeCloseTo(.06,8);expect(g.placements.length).toBeGreaterThan(0);expect(g.placements.every(n=>n===3)).toBe(true);
  await p.evaluate(()=>{tab='waste';render();});await open();
  await field('edgeCount').fill('4');await expect(field('C4')).toBeVisible();
  const setEdges=async(sides,angles)=>{for(let i=0;i<sides.length;i++){await field('C'+(i+1)).fill(String(sides[i]));await field('G'+(i+1)).fill(String(angles[i]));}};
  await setEdges([300,400,300,400],[0,90,180,250]);await expect(submit()).toBeDisabled();
  await expect(p.locator('[data-edge-preview]')).toContainText('chưa khép kín');
  await field('G4').fill('270');await submit().click();await expect(p.locator('#dialog')).not.toBeVisible();
  g=await geometry();expect(g.area).toBeCloseTo(.12,8);expect(g.points).toBe(4);
  await open();await field('edgeCount').fill('6');
  await setEdges([300,100,200,200,100,300],[0,90,180,90,180,270]);
  await submit().click();await expect(p.locator('#dialog')).not.toBeVisible();
  g=await geometry();expect(g.area).toBeCloseTo(.05,8);expect(g.points).toBe(6);
  await p.evaluate(()=>persist());await p.reload();
  g=await geometry();expect(g.area).toBeCloseTo(.05,8);expect(g.placements.every(n=>n===6)).toBe(true);
  await p.evaluate(()=>{page='quote';tab='waste';render();});await open();
  await expect(field('edgeCount')).toHaveValue('6');await expect(field('C5')).toHaveValue('100');await expect(field('G6')).toHaveValue('270');
  expect(errs).toEqual([]);
  console.log('PASS BOM/waste polygon entry; triangle, four sides, concave six sides; closure validation; actual area/contour and values survive reload');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
