'use strict';
// Consistent SQLite backup including accounts and revisions, even while the server runs.
const fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto');
const {DatabaseSync,backup}=require('node:sqlite');
async function backupDatabase(source,directory){
  if(!fs.existsSync(source))throw Error('Chưa có dữ liệu máy chủ. Chạy npm run start:team và khởi tạo trước.');
  fs.mkdirSync(directory,{recursive:true});const target=path.join(directory,'truongphat-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+randomUUID().slice(0,8)+'.sqlite');const db=new DatabaseSync(source,{readOnly:true});try{await backup(db,target);return target;}finally{db.close();}
}
module.exports={backupDatabase};
if(require.main===module)backupDatabase(path.resolve(process.env.TP_DATABASE_PATH||path.join(__dirname,'../data/truongphat.sqlite')),path.resolve(process.env.TP_BACKUP_DIR||path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH||path.join(__dirname,'../data'),'backups'))).then(target=>{console.log('Đã sao lưu đầy đủ:',target);console.log('Tệp có dữ liệu và tài khoản: chỉ lưu tại nơi quản trị kiểm soát.');}).catch(e=>{console.error(e.message);process.exitCode=1;});
