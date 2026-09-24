(function(root){
'use strict';
const SA=typeof module!=='undefined'&&module.exports?require('./section-access.js'):root.TPSectionAccess;
const stages={sales:'Kinh doanh',technical:'Kỹ thuật',materials:'Cập nhật giá'};
const flags=['canViewCosts','canApprove','canEditFactors','canApproveBelowCost','canFormulaUse','canFormulaView','canFormulaEdit','canFormulaUnlock','canReopen'];
function workRoles(value={}){if(!value||Array.isArray(value)||typeof value!=='object'||Object.entries(value).some(([k,v])=>!Object.hasOwn(stages,k)||!['','member','manager'].includes(v)))throw Error('Vai trò bộ phận không hợp lệ');return Object.fromEntries(Object.keys(stages).map(k=>[k,value[k]||'']));}
function combine(roles){
 if(!roles.length)return null;
 const out={sectionModes:Object.fromEntries(SA.keys.map(k=>[k,'none'])),workRoles:workRoles()},rank=['none','view','use','configure'];
 for(const k of flags)out[k]=false;
 for(const r of roles){const modes=r.sectionModes||SA.modes({role:r.role,section_access:r.sections||[],can_view_costs:r.canViewCosts,technical_delegated:1});for(const k of SA.keys)if(rank.indexOf(modes[k])>rank.indexOf(out.sectionModes[k]))out.sectionModes[k]=modes[k];for(const k of flags)out[k] ||= r[k]===true||(r[k]==null&&(['canFormulaUse','canFormulaView'].includes(k)||k==='canFormulaEdit'&&(r.sections||[]).some(s=>['bom','catalogRules'].includes(s))));for(const [k,v] of Object.entries(workRoles(r.workRoles)))if(v==='manager'||v==='member'&&!out.workRoles[k])out.workRoles[k]=v;}
 const types=roles.map(r=>r.role);
 out.role=types.includes('admin')?'admin':types.includes('technical')&&!out.canViewCosts?'technical':types.some(r=>['technical','estimator'].includes(r))?'estimator':types.includes('sales')?'sales':'approver';
 if(roles.length===1)out.role=roles[0].role;
 out.sections=SA.parse(out.sectionModes);out.technicalDelegation=true;
 return out;
}
const api={combine,workRoles,stages,flags};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TPRoleAccess=api;
})(typeof globalThis!=='undefined'?globalThis:this);
