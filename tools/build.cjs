// Build artifact: one self-contained HTML file, usable offline or on a static host.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
let html=read('index.html');
for(const file of ['styles.css','pricing.css','intake.css','batch-one.css'])html=html.replace('<link rel="stylesheet" href="'+file+'">',()=>'<style>'+read(file)+'</style>');
for(const file of ['core.js','completion-core.js','source-core.js','conventions-core.js','work-core.js','manufacturing-core.js','pricing-core.js','entry-core.js','model3d.js','model3d-render.js','ux.js','remnant-ui.js','model3d-ui.js','pricing-ui.js','work-ui.js','manufacturing-ui.js','quotes-ui.js','xlsx.js','export-ui.js','team-ui.js','team-access-ui.js','quote-output-ui.js','rate-lab-ui.js','catalog-price-ui.js','completion-ui.js','source-ui.js','catalog-sync-ui.js','conventions-ui.js','app.js'])html=html.replace('<script src="'+file+'"></script>',()=>'<script>'+read(file).replace(/<\/script/gi,'<\\/script')+'</script>');
for(const file of ['dimension-links-core.js','batch-two-ui.js','definition-core.js','definition-ui.js','batch-one-core.js','intake-core.js','intake-ui.js','quote-prices-ui.js','batch-one-ui.js'])html=html.replace('<script src="'+file+'"></script>',()=>'<script>'+read(file).replace(/<\/script/gi,'<\\/script')+'</script>');
const out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),html,'utf8');
console.log('Built dist/index.html ('+Buffer.byteLength(html)+' bytes), no external runtime dependencies.');
