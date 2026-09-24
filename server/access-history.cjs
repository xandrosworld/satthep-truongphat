'use strict';
const {FIELDS}=require('./formula-access.cjs');
const keys=['id','username','name','active','role','section_access','technical_delegated','can_view_costs','can_approve','can_factors','can_below_cost','role_template_id','role_template_ids','work_roles','follow_role_templates','deleted_at',...Object.values(FIELDS)];
function setup(sql){sql.exec('CREATE TABLE IF NOT EXISTS access_history(seq INTEGER PRIMARY KEY AUTOINCREMENT,at TEXT NOT NULL,actor TEXT NOT NULL,entity TEXT NOT NULL,action TEXT NOT NULL,before_value TEXT NOT NULL,after_value TEXT NOT NULL)');}
function userSnapshot(u){return u?Object.fromEntries(keys.map(k=>[k,u[k]??null])):null;}
function record(sql,actor,entity,action,before,after){if(JSON.stringify(before)===JSON.stringify(after))return;sql.prepare('INSERT INTO access_history(at,actor,entity,action,before_value,after_value) VALUES(?,?,?,?,?,?)').run(new Date().toISOString(),actor.id,entity,action,JSON.stringify(before),JSON.stringify(after));}
module.exports={setup,userSnapshot,record};
