'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),{createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'artifacts/customer-review/catalog-review-2026-09-14');
fs.mkdirSync(dir,{recursive:true});
const files=fs.readdirSync(path.join(root,'tests')).filter(n=>n.endsWith('.test.cjs'));
const tasks=[
  ['build',['tools/build.cjs']],
  ['unit',['--test',...files.filter(n=>!n.includes('server')).map(n=>'tests/'+n)]],
  ['server',['--test',...files.filter(n=>n.includes('server')).map(n=>'tests/'+n)]],
  ['rules-catalog',['tests/rules-catalog-browser.cjs'],{RULES_CATALOG_URL:'',RULES_CATALOG_ARTIFACT_ROOT:path.join(dir,'local')}],
  ['shape-row',['tests/shape-row-browser.cjs'],{SHAPE_ROW_URL:'',SHAPE_ROW_ROOT:path.join(dir,'shape-row-local')}],
  ['definition',['tests/definition-browser.cjs'],{BATCH_ONE_URL:'',DEFINITION_ARTIFACT_ROOT:path.join(dir,'regression-definition')}],
  ['batch-one',['tests/batch-one-browser.cjs'],{BATCH_ONE_URL:'',BATCH_ONE_ARTIFACT_ROOT:path.join(dir,'regression-batch-one')}],
  ['completion',['tests/completion-browser.cjs'],{COMPLETION_ARTIFACT_ROOT:path.join(dir,'regression-completion')}],
  ['manufacturing',['tests/manufacturing-browser.cjs'],{MFG_ARTIFACT_ROOT:path.join(dir,'regression-manufacturing')}],
  ['definition-team',['tests/definition-team-browser.cjs'],{DEFINITION_ARTIFACT_ROOT:path.join(dir,'regression-team')}]
];
const report={started:new Date().toISOString(),scope:'Grouped conventions, visible shape formulas, linked custom material creation, catalogue export and quotation snapshots. Local UI and local server verification.',results:[]};
for(const [name,args,env]of tasks){
  const r=spawnSync(process.execPath,args,{cwd:root,env:{...process.env,...env},encoding:'utf8',timeout:180000,maxBuffer:12*1024*1024});
  const output=(r.stdout||'')+'\n'+(r.stderr||'')+(r.error?'\n'+r.error.message:'');
  fs.writeFileSync(path.join(dir,name+'.log'),output);
  report.results.push({name,args,exitCode:r.status,passed:r.status===0});console.log((r.status===0?'PASS ':'FAIL ')+name);
  if(r.status!==0){console.error(output);process.exitCode=1;break;}
}
report.finished=new Date().toISOString();report.passed=report.results.length===tasks.length&&report.results.every(r=>r.passed);
report.buildHashLF=createHash('sha256').update(fs.readFileSync(path.join(root,'dist/index.html'),'utf8').replace(/\r\n/g,'\n')).digest('hex');
fs.writeFileSync(path.join(dir,'verification.json'),JSON.stringify(report,null,2));
