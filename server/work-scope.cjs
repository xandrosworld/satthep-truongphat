'use strict';
const AA=require('../action-access.js'),Org=require('./organization.cjs');
function context(sql,u){
 const d=Org.stored(sql)||{departments:[],positions:[],employees:[]};
 const chain=id=>{const result=[],seen=new Set();while(id&&!seen.has(id)){seen.add(id);const a=d.departments.find(x=>x.id===id);if(!a||a.active===false)return [];result.push(id);id=a.parentId;}return result;};
 const positions=id=>{const e=d.employees.find(e=>e.userId===id&&e.active!==false);return e?d.positions.filter(p=>p.active!==false&&e.positionIds.includes(p.id)&&chain(p.departmentId).length):[];};
 const own=positions(u.id),heads=own.filter(p=>p.manager).map(p=>p.departmentId),legacy=!d.departments.length;
 const departments=d.departments.filter(a=>u.role==='admin'||chain(a.id).some(id=>heads.includes(id)));
 const manages=id=>u.role==='admin'||id===u.id||legacy||positions(id).some(p=>chain(p.departmentId).some(k=>heads.includes(k))&&!heads.includes(p.departmentId)||heads.includes(p.departmentId)&&!p.manager);
 const managesDepartment=id=>u.role==='admin'||legacy||departments.some(d=>d.id===id);
 const member=id=>own.some(p=>p.departmentId===id);
 const personDepartments=id=>positions(id).map(p=>p.departmentId);
 return {d,legacy,departments,manages,managesDepartment,member,personDepartments};
}
function canManage(sql,u,t,action='assign'){const c=context(sql,u);if(action==='approve')return u.role==='admin'||t.creator===u.id&&AA.allows(u,'dailyWork','approve',false);return AA.allows(u,'dailyWork',action,false)&&(t.assignee?c.manages(t.assignee):!!t.departmentId&&c.managesDepartment(t.departmentId)||u.role==='admin');}
function visible(sql,u,t){const c=context(sql,u);return u.role==='admin'||t.assignee===u.id||t.creator===u.id||(t.relatedIds||[]).includes(u.id)||!t.assignee&&t.departmentId&&c.member(t.departmentId)||canManage(sql,u,t,'assign')||canManage(sql,u,t,'approve');}
module.exports={context,canManage,visible};
