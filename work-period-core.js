/* Work actually reported during a period; never infer historical output from current totals. */
(function(root){
'use strict';
const day=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v:v&&Number.isFinite(Date.parse(v))?new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(v)):'';
function summarize(tasks,reports,{from='',to=''}={}){const inside=v=>{const d=day(v);return !!d&&(!from||d>=from)&&(!to||d<=to);},ids=new Set(tasks.map(t=>t.id)),groups=new Map();
 const row=id=>{if(!groups.has(id))groups.set(id,{id,reportedTasks:new Set(),hours:0,units:{},confirmed:0,late:0,unknownDeadline:0,openIssues:0});return groups.get(id);};
 for(const r of reports)if(ids.has(r.taskId)&&inside(r.date)){const x=row(r.actor||'');x.reportedTasks.add(r.taskId);x.hours+=Number(r.hours)||0;const u=r.unit||'việc';x.units[u]=(x.units[u]||0)+(Number(r.output)||0);if(r.issue&&!r.resolved)x.openIssues++;}
 for(const t of tasks){if(t.sourceManaged||t.state!=='confirmed')continue;const event=(t.events||[]).filter(e=>e.state==='confirmed').at(-1);if(!event||!inside(event.at))continue;const x=row(t.assignee||'');x.confirmed++;if(!t.dueDate)x.unknownDeadline++;else if(day(event.at)>t.dueDate)x.late++;}
 return [...groups.values()].map(x=>({...x,reportedTasks:x.reportedTasks.size,onTime:x.confirmed-x.late-x.unknownDeadline}));
}
const api={summarize};if(typeof module!=='undefined')module.exports=api;else root.TPWorkPeriod=api;
})(typeof window!=='undefined'?window:globalThis);
