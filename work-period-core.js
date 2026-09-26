/* Work actually reported during a period; never infer historical output from current totals. */
(function(root){
'use strict';
const day=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v:v&&Number.isFinite(Date.parse(v))?new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(v)):'';
function timing(t,at){
 const end=Date.parse(at||new Date().toISOString()),due=Date.parse((t.dueDate||'')+'T23:59:59.999+07:00'),start=Date.parse(t.startDate?t.startDate+'T00:00:00+07:00':t.created||'');
 const spans=(t.waits||[]).filter(w=>w.approvedAt&&w.end).map(w=>[Math.max(Number.isFinite(start)?start:0,Date.parse(w.start)),Math.min(end,Date.parse(w.end))]).filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&b>a).sort((a,b)=>a[0]-b[0]);
 let excluded=0,last=-Infinity;for(const [a,b] of spans){excluded+=Math.max(0,b-Math.max(a,last));last=Math.max(last,b);}
 const gross=Number.isFinite(due)?Math.max(0,end-due):0;
 return {waitingHours:excluded/3600000,grossLateHours:gross/3600000,lateHours:Math.max(0,gross-excluded)/3600000};
}
function summarize(tasks,reports,{from='',to=''}={}){const inside=v=>{const d=day(v);return !!d&&(!from||d>=from)&&(!to||d<=to);},ids=new Set(tasks.map(t=>t.id)),groups=new Map();
 const row=id=>{if(!groups.has(id))groups.set(id,{id,reportedTasks:new Set(),hours:0,units:{},confirmed:0,late:0,unknownDeadline:0,openIssues:0});return groups.get(id);};
 for(const r of reports)if(ids.has(r.taskId)&&inside(r.date)&&(!tasks.find(t=>t.id===r.taskId)?.sourceManaged||r.sourceSnapshot)){const x=row(r.actor||'');x.reportedTasks.add(r.taskId);x.hours+=Number(r.hours)||0;if(Object.hasOwn(r,'workValue')){x.workValue=(x.workValue||0)+(Number(r.workValue)||0);if(r.workValue===null)x.unpricedReports=(x.unpricedReports||0)+1;}const u=r.unit||'việc';x.units[u]=(x.units[u]||0)+(Number(r.output)||0);if(r.issue&&!r.resolved)x.openIssues++;}
 for(const t of tasks){if(t.sourceManaged||t.state!=='confirmed')continue;const event=(t.events||[]).filter(e=>e.state==='confirmed').at(-1);if(!event||!inside(event.at))continue;const x=row(t.assignee||'');x.confirmed++;if(!t.dueDate)x.unknownDeadline++;else {const completed=(t.events||[]).filter(e=>e.state==='done'&&e.at<=event.at).at(-1);if(timing(t,completed?.at||event.at).lateHours>0)x.late++;}}
 return [...groups.values()].map(x=>({...x,reportedTasks:x.reportedTasks.size,onTime:x.confirmed-x.late-x.unknownDeadline}));
}
const api={summarize,timing};if(typeof module!=='undefined')module.exports=api;else root.TPWorkPeriod=api;
})(typeof window!=='undefined'?window:globalThis);
