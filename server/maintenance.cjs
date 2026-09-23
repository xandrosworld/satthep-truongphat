'use strict';
const fs=require('node:fs'),path=require('node:path');
function maintenance(action,file){
 if(!file)throw Error('Specify maintenance marker path');
 file=path.resolve(file);
 if(action==='enable'){fs.mkdirSync(path.dirname(file),{recursive:true});try{fs.writeFileSync(file,new Date().toISOString()+'\n',{flag:'wx',mode:0o600});}catch(e){if(e.code!=='EEXIST')throw e;}}
 else if(action==='disable'){if(fs.existsSync(file))fs.unlinkSync(file);}
 else if(action!=='status')throw Error('Use enable, disable or status');
 return {maintenance:fs.existsSync(file)};
}
module.exports={maintenance};
if(require.main===module){try{console.log(JSON.stringify(maintenance(process.argv[2],process.argv[3]||process.env.TP_MAINTENANCE_FILE||path.join(path.dirname(process.env.TP_DATABASE_PATH||path.resolve(__dirname,'../data/truongphat.sqlite')),'maintenance'))));}catch(e){console.error(e.message);process.exitCode=1;}}
