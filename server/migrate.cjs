'use strict';
// Full SQLite transfer, including accounts, uploaded documents and chat images.
const fs=require('node:fs'),path=require('node:path'),{createHash,randomUUID}=require('node:crypto');
const {DatabaseSync,backup}=require('node:sqlite');
const quote=value=>'"'+value.replaceAll('"','""')+'"';
async function digest(file){const hash=createHash('sha256');for await(const chunk of fs.createReadStream(file))hash.update(chunk);return hash.digest('hex');}
function inventory(file){
 const db=new DatabaseSync(file,{readOnly:true});
 try{
  const checks=db.prepare('PRAGMA quick_check').all();if(checks.some(row=>Object.values(row)[0]!=='ok'))throw Error('SQLite integrity check failed');
  const names=db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(x=>x.name);
  for(const table of ['users','quotes','revisions','catalog','sessions'])if(!names.includes(table))throw Error('Not a complete quotation database: missing '+table);
  return {tables:Object.fromEntries(names.map(name=>[name,db.prepare('SELECT COUNT(*) AS n FROM '+quote(name)).get().n])),processingAiJobs:names.includes('ai_pdf_jobs')?db.prepare("SELECT COUNT(*) AS n FROM ai_pdf_jobs WHERE status='processing'").get().n:0};
 }finally{db.close();}
}
function assertFrozen(marker){if(!marker||!fs.existsSync(marker))throw Error('Maintenance marker is required for final migration');const age=Date.now()-fs.statSync(marker).mtimeMs;if(age<60000)throw Error('Wait at least 60 seconds after enabling maintenance before final export');}
async function exportDatabase(source,target,{frozenMarker}={}){
 source=path.resolve(source);target=path.resolve(target);
 if(!fs.existsSync(source))throw Error('Source database does not exist');
 if(fs.existsSync(target)||fs.existsSync(target+'.manifest.json'))throw Error('Export destination already exists');
 if(frozenMarker)assertFrozen(frozenMarker);
 fs.mkdirSync(path.dirname(target),{recursive:true});const temporary=path.join(path.dirname(target),'.export-'+randomUUID()+'.sqlite'),db=new DatabaseSync(source,{readOnly:true});
 try{
  await backup(db,temporary);const snapshot=new DatabaseSync(temporary);try{snapshot.exec('PRAGMA journal_mode=DELETE;');}finally{snapshot.close();}fs.chmodSync(temporary,0o600);const summary=inventory(temporary);
  if(frozenMarker){assertFrozen(frozenMarker);if(summary.processingAiJobs)throw Error('Wait for running AI jobs before final export');}
  const manifest={format:'truongphat-sqlite-transfer-1',created:new Date().toISOString(),sha256:await digest(temporary),bytes:fs.statSync(temporary).size,...summary};
  // Atomic no-overwrite publication on the same filesystem.
  fs.linkSync(temporary,target);
  fs.writeFileSync(target+'.manifest.json',JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});return manifest;
 }finally{db.close();if(fs.existsSync(temporary))fs.unlinkSync(temporary);}
}
async function verifyDatabase(source){
 const manifest=JSON.parse(fs.readFileSync(source+'.manifest.json','utf8'));
 if(manifest.format!=='truongphat-sqlite-transfer-1')throw Error('Unknown transfer manifest');
 if(manifest.bytes!==fs.statSync(source).size||manifest.sha256!==await digest(source))throw Error('Transfer checksum mismatch');
 const summary=inventory(source);if(JSON.stringify(summary.tables)!==JSON.stringify(manifest.tables))throw Error('Table counts differ from transfer manifest');return manifest;
}
async function restoreDatabase(source,target){
 source=path.resolve(source);target=path.resolve(target);await verifyDatabase(source);
 for(const file of [target,target+'-wal',target+'-shm'])if(fs.existsSync(file))throw Error('Restore destination is not empty; stop the app and preserve existing data first');
 fs.mkdirSync(path.dirname(target),{recursive:true});const temporary=path.join(path.dirname(target),'.restore-'+randomUUID()+'.sqlite');
 try{
  fs.copyFileSync(source,temporary,fs.constants.COPYFILE_EXCL);fs.chmodSync(temporary,0o600);const db=new DatabaseSync(temporary);
  try{db.exec('PRAGMA journal_mode=DELETE; DELETE FROM sessions;');}finally{db.close();}
  const summary=inventory(temporary);fs.linkSync(temporary,target);return {...summary,sessionsCleared:true};
 }finally{for(const suffix of ['','-wal','-shm'])if(fs.existsSync(temporary+suffix))fs.unlinkSync(temporary+suffix);}
}
module.exports={inventory,digest,exportDatabase,verifyDatabase,restoreDatabase};
if(require.main===module){const [action,source,target,flag,marker]=process.argv.slice(2);(async()=>{
 if(!source)throw Error('Usage: migrate.cjs export SOURCE TARGET [--frozen MARKER] | verify SOURCE | restore SOURCE TARGET');
 if(action==='verify')return verifyDatabase(source);
 if(!target)throw Error('Specify destination');
 if(action==='export'){if(flag&&flag!=='--frozen'||flag==='--frozen'&&!marker)throw Error('Use --frozen MARKER');return exportDatabase(source,target,{frozenMarker:marker});}
 if(action==='restore')return restoreDatabase(source,target);
 throw Error('Unknown action');
 })().then(report=>console.log(JSON.stringify(report,null,2))).catch(e=>{console.error(e.message);process.exitCode=1;});}
