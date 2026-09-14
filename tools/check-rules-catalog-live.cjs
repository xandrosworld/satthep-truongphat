'use strict';
const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'artifacts/customer-review/catalog-review-2026-09-14/live');
fs.mkdirSync(dir,{recursive:true});
const url='https://baogia-truongphat.netlify.app/',lf=s=>s.replace(/\r\n/g,'\n'),sha=s=>createHash('sha256').update(s).digest('hex');
const local=lf(fs.readFileSync(path.join(root,'dist/index.html'),'utf8')),verification=JSON.parse(fs.readFileSync(path.join(dir,'../verification.json'),'utf8'));
const toolbar='<script async src="/.netlify/scripts/hud?variant=public" data-nf-variant="public" data-netlify-site-id="90401cf6-e7b8-469b-9421-e4c4be2fc3ae" data-app-host="app.netlify.com"></script>\n';
if(!verification.passed||verification.buildHashLF!==sha(local))throw Error('Local build does not match the successful verification');
(async()=>{
 const deadline=Date.now()+(process.argv.includes('--wait')?300000:0);
 let result;
 do{
  const response=await fetch(url+'?catalog-check='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(30000)}),remote=lf(await response.text());
  result={at:new Date().toISOString(),url,httpStatus:response.status,checkoutCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),applicationHashLF:sha(local),deployedHashLF:sha(remote),normalization:'CRLF to LF; full HTML equality, permitting only the exact known appended Netlify toolbar',deployedEqualsLocal:remote===local,deployedEqualsLocalPlusKnownToolbar:remote===local+toolbar};
  result.passed=response.ok&&(result.deployedEqualsLocal||result.deployedEqualsLocalPlusKnownToolbar);
  fs.writeFileSync(path.join(dir,'deployment-check.json'),JSON.stringify(result,null,2));
  if(result.passed){console.log('PASS production HTML matches verified build '+result.applicationHashLF);return;}
  if(Date.now()>=deadline)break;
  console.log('Waiting for the verified build on Netlify...');await new Promise(r=>setTimeout(r,15000));
 }while(true);
 console.error('Production still differs from the verified local build');process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1;});
