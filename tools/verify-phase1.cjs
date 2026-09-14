// Repeatable local verification, with evidence bound to the exact files tested.
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'artifacts/phase1-2026-09-12');fs.mkdirSync(out,{recursive:true});
const tasks=[
  ['build',['tools/build.cjs']],
  ['unit',['--test','tests/core.test.cjs','tests/entry.test.cjs','tests/remnants.test.cjs','tests/model3d.test.cjs','tests/model3d-render.test.cjs','tests/pricing.test.cjs','tests/work.test.cjs','tests/manufacturing.test.cjs','tests/completion.test.cjs','tests/intake.test.cjs']],
  ['server',['--test','tests/server.test.cjs','tests/intake-server.test.cjs']],
  ['pricing-browser',['tests/pricing-browser.cjs']],
  ['phase1-browser',['tests/work-browser.cjs']],
  ['manufacturing-browser',['tests/manufacturing-browser.cjs']],
  ['completion-browser',['tests/completion-browser.cjs']],
  ['intake-browser',['tests/intake-browser.cjs']],
  ...['scroll-browser','model3d-browser','remnants-browser','site-review'].map(name=>[name,['tools/run-legacy-browser.cjs',name]]),
  ['documents',['-X','utf8','tools/check-phase1-pack.py'],'python']
];
const report={started:new Date().toISOString(),node:process.version,platform:process.platform,results:[]};
for(const [name,args,command=process.execPath] of tasks){
  const started=Date.now(),r=spawnSync(command,args,{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:10*1024*1024});
  const log=(r.stdout||'')+'\n'+(r.stderr||'')+(r.error?'\n'+r.error.message:'');fs.writeFileSync(path.join(out,'verify-'+name+'.log'),log,'utf8');
  report.results.push({name,command:path.basename(command),args,exitCode:r.status,durationMs:Date.now()-started,passed:r.status===0});
  console.log((r.status===0?'PASS ':'FAIL ')+name);
  if(r.status!==0){console.error(log);process.exitCode=1;break;}
}
const names=[...fs.readdirSync(root).filter(n=>/\.(js|css|html)$/.test(n)),...['server','tests','tools'].flatMap(dir=>fs.readdirSync(path.join(root,dir)).filter(n=>/\.(cjs|py|ps1)$/.test(n)).map(n=>dir+'/'+n)),'dist/index.html','package.json','giai-doan-1-2026-09-12/01_LUONG_TONG_THE_VA_BAO_GIA_1_3.pdf','giai-doan-1-2026-09-12/04_TRUY_VET_PHAM_VI_VA_KIEM_THU_1_3.xlsx'];
report.files=Object.fromEntries(names.map(name=>[name,createHash('sha256').update(fs.readFileSync(path.join(root,name))).digest('hex')]));
report.finished=new Date().toISOString();report.passed=report.results.length===tasks.length&&report.results.every(r=>r.passed);
fs.writeFileSync(path.join(out,'verification-latest.json'),JSON.stringify(report,null,2),'utf8');
console.log('Evidence: artifacts/phase1-2026-09-12/verification-latest.json');
