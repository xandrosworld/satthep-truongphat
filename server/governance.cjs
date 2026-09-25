'use strict';
const A=require('../action-access.js'),SA=require('../section-access.js');
const flags={canViewCosts:'can_view_costs',canApprove:'can_approve',canEditFactors:'can_factors',canApproveBelowCost:'can_below_cost',canFormulaUse:'can_formula_use',canFormulaView:'can_formula_view',canFormulaEdit:'can_formula_edit',canReopen:'can_reopen'};
const can=(u,key,action='view')=>u?.role==='admin'||A.explicit(u)&&A.allows(u,key,action,false);
function need(u,key,action,fail){if(!can(u,key,'view')||!can(u,key,action))fail(403,'Chưa được cấp quyền quản trị: '+A.schema[key][0]);}
function candidate(b){return {role:b.role,section_access:b.sectionModes??b.sections,technical_delegated:Number(b.technicalDelegation===true),actionAccess:b.actionAccess,...Object.fromEntries(Object.entries(flags).map(([field,col])=>[col,b[field]==null?null:Number(b[field])]))};}
function grant(actor,b,fail){
 if(actor.role==='admin')return;
 if(b.role==='admin')fail(403,'Không được cấp quyền Admin');
 // Legacy matrices allow broad role fallbacks. Delegates must assign explicit grants.
 if(b.actionAccess==null)fail(403,'Người được giao quản trị phải cấp ma trận thao tác cụ thể');
 let actions,m;try{actions=A.parse(b.actionAccess);m=SA.modes(candidate(b));}catch(e){fail(400,e.message);}
 const permissions=require('./access.cjs').permissions,p=permissions(actor),next=permissions(candidate(b)),levels={none:0,view:1,use:2,configure:3};
 for(const [key,values]of Object.entries(actions))for(const a of values)if(!can(actor,key,a))fail(403,'Không được cấp quyền vượt quyền của mình: '+A.schema[key][0]);
 for(const [key,value]of Object.entries(m))if(levels[value]>levels[p.sectionModes[key]])fail(403,'Không được cấp phạm vi dữ liệu vượt quyền của mình');
 for(const key of ['costs','approve','factors','belowCost','formulaUse','formulaView','formulaEdit','reopen'])if(next[key]&&!p[key])fail(403,'Không được cấp quyền tùy chỉnh vượt quyền của mình');
 for(const [field,key]of Object.entries({canViewCosts:'costs',canApprove:'approve',canEditFactors:'factors',canApproveBelowCost:'belowCost',canFormulaUse:'formulaUse',canFormulaView:'formulaView',canFormulaEdit:'formulaEdit',canReopen:'reopen'}))if(b[field]&&!p[key])fail(403,'Không được cấp quyền tùy chỉnh vượt quyền của mình');
 const work=JSON.parse(actor.work_roles||'{}'),rank={'':0,member:1,manager:2};for(const [key,value]of Object.entries(b.workRoles||{}))if((rank[value]||0)>(rank[work[key]]||0))fail(403,'Không được cấp cấp bậc giao việc vượt quyền của mình');
}
function target(actor,u,fail){
 if(actor.role==='admin')return;
 if(!u)fail(404,'Không tìm thấy tài khoản');
 if(u.id===actor.id||u.role==='admin')fail(403,'Không được thay đổi chính mình hoặc tài khoản Admin');
 const b={role:u.role,technicalDelegation:!!u.technical_delegated,sectionModes:SA.modes(u),actionAccess:u.action_access==null?null:A.parse(u.action_access),workRoles:JSON.parse(u.work_roles||'{}')};
 for(const [field,col]of Object.entries(flags))if(u[col]!=null)b[field]=!!u[col];
 grant(actor,b,fail);
}
function rawResponse(url,u){const route=url.split('?')[0];return route==='/api/backup'?can(u,'backup','export'):/^\/api\/users(?:\/|$)/.test(route)?can(u,'accounts'):/^\/api\/roles(?:\/|$)/.test(route)?can(u,'roles'):route==='/api/organization'?can(u,'organization'):['/api/access-review','/api/access-history','/api/audit-search'].includes(route)?can(u,'audit'):false;}
module.exports={can,need,grant,target,rawResponse};
