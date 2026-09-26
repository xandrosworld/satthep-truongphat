'use strict';
const {randomUUID}=require('node:crypto'),AA=require('../action-access.js'),Scope=require('./work-scope.cjs');
function notify(sql,ids,title,taskId){for(const userId of new Set(ids.filter(Boolean)))sql.prepare('INSERT INTO enterprise_records(kind,id,version,document) VALUES(?,?,?,?)').run('notice',randomUUID(),1,JSON.stringify({userId,title,taskId,at:new Date().toISOString(),read:false}));}
function supervisors(sql,id){return sql.prepare('SELECT * FROM users WHERE active=1 AND deleted_at IS NULL').all().filter(u=>u.id!==id&&Scope.context(sql,u).manages(id)&&AA.allows(u,'dailyWork','assign',false)).map(u=>u.id);}
module.exports={notify,supervisors};
