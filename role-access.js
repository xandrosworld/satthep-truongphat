(function(root){
'use strict';
const SA=typeof module!=='undefined'&&module.exports?require('./section-access.js'):root.TPSectionAccess;
const stages={sales:'Kinh doanh',technical:'Kỹ thuật',materials:'Cập nhật giá'};
const flags=['canViewCosts','canApprove','canEditFactors','canApproveBelowCost','canFormulaUse','canFormulaView','canFormulaEdit','canFormulaUnlock','canReopen'];
// Compatibility adapter: named permission sets do not require a job-type choice.
// Never derive administrator access from a matrix, even when every cell is enabled.
function matrixRole(value){
 const modes=SA.parseModes(value.sectionModes),visible=SA.keys.filter(k=>modes[k]!=='none');
 if(value.canViewCosts)return 'estimator';
 const technical=['bom','operations','catalogMaterials','catalogTechnicalOperations','catalogRules','catalogLibrary'];
 if(value.canApprove||value.canApproveBelowCost||value.canEditFactors||visible.some(k=>['materials','logistics','factors','catalogOperations','catalogLogistics','manage'].includes(k)))throw Error('Các quyền giá, hệ số, lập hoặc duyệt báo giá cần bật Xem chi phí / lợi nhuận nội bộ.');
 if(visible.some(k=>technical.includes(k))){if(visible.includes('commercial'))throw Error('Kết hợp dữ liệu kỹ thuật với giá chào cần bật Xem chi phí / lợi nhuận nội bộ.');return 'technical';}
 return 'sales';
}
function workRoles(value={}){if(!value||Array.isArray(value)||typeof value!=='object'||Object.entries(value).some(([k,v])=>!Object.hasOwn(stages,k)||!['','member','manager'].includes(v)))throw Error('Vai trò bộ phận không hợp lệ');return Object.fromEntries(Object.keys(stages).map(k=>[k,value[k]||'']));}
function combine(roles){
 if(!roles.length)return null;
 const out={sectionModes:Object.fromEntries(SA.keys.map(k=>[k,'none'])),workRoles:workRoles()},rank=['none','view','use','configure'];
 for(const k of flags)out[k]=false;
 for(const r of roles){const modes=r.sectionModes||SA.modes({role:r.role,section_access:r.sections||[],can_view_costs:r.canViewCosts,technical_delegated:1});for(const k of SA.keys)if(rank.indexOf(modes[k])>rank.indexOf(out.sectionModes[k]))out.sectionModes[k]=modes[k];for(const k of flags)out[k] ||= r[k]===true||(r[k]==null&&(['canFormulaUse','canFormulaView'].includes(k)||k==='canFormulaEdit'&&(r.sections||[]).some(s=>['bom','catalogRules'].includes(s))));for(const [k,v] of Object.entries(workRoles(r.workRoles)))if(v==='manager'||v==='member'&&!out.workRoles[k])out.workRoles[k]=v;}
 const types=roles.map(r=>r.role);
 out.role=types.includes('admin')?'admin':types.includes('technical')&&!out.canViewCosts?'technical':types.some(r=>['technical','estimator'].includes(r))?'estimator':types.includes('sales')?'sales':'approver';
 if(roles.length===1)out.role=roles[0].role;
 out.actionAccess=(typeof module!=='undefined'&&module.exports?require('./action-access.js'):root.TPActionAccess).combine(roles);out.sections=SA.parse(out.sectionModes);out.technicalDelegation=true;
 return out;
}
const api={combine,workRoles,stages,flags,matrixRole};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TPRoleAccess=api;
})(typeof globalThis!=='undefined'?globalThis:this);
