const {chromium,expect}=require('@playwright/test'),path=require('path'),{pathToFileURL}=require('url');
const T=require('../artifacts/gd1-report-2026-09-20/release/technical-core.js');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true});try{const p=await b.newPage();await p.goto(pathToFileURL(path.resolve('artifacts/gd1-report-2026-09-20/release/dist/index.html')).href);
const pair=await p.evaluate(()=>{const original=TPPrice.demoSeed(),baseline=TPTechnical.project(original);db=C.copy(baseline);Team.user={id:'qa'};Team.loaded=true;Team.permissions={technical:true,edit:true,sections:['bom'],formulaView:true,formulaEdit:true};Team.link={id:'qa',status:'draft',workspaceKey:'qa'};db.quote.workspaceKey='qa';Team.quoteTechnicalBaseline={id:'qa',document:C.copy(baseline)};db.materials[0].name='New shared catalogue';db.stockSizes.push({id:'new',length:2440,width:1220});db.quote.products[0].qty=7;return {original,payload:teamDocument()};});
const merged=T.merge(pair.original,pair.payload);expect(merged.quote.products[0].qty).toBe(7);expect(merged.materials).toEqual(pair.original.materials);
const tampered=JSON.parse(JSON.stringify(pair.payload));tampered.materials[0].name='tamper';expect(()=>T.merge(pair.original,tampered)).toThrow();
console.log('PASS technical quote save retains original catalogue after shared catalogue reload; quantity saved; server still rejects catalogue tampering');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
