"use strict";
const union=spans=>{const out=[];for(const [a,b] of spans.filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&b>a).sort((a,b)=>a[0]-b[0])){if(out.length&&a<=out.at(-1)[1])out.at(-1)[1]=Math.max(b,out.at(-1)[1]);else out.push([a,b]);}return out;};
function intervals(date,value){
 if(typeof value!=="string"||value.length>500)throw Error("Khoảng làm việc không hợp lệ");
 if(!value.trim())return [];
 return value.split(',').map(s=>{const m=s.trim().match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);if(!m)throw Error("Khai giờ dạng 08:00-12:00,13:00-17:00; ca đêm kết thúc ngày sau");const a=+m[1]*60+(+m[2]),b=+m[3]*60+(+m[4]);if(+m[1]>23||+m[3]>23||+m[2]>59||+m[4]>59||a===b)throw Error("Giờ làm việc không hợp lệ");const start=Date.parse(date+'T00:00:00+07:00');return [start+a*60000,start+(b<a?b+1440:b)*60000];});
}
function calculate(p,days,waits=[],now=Date.now()){
 const start=Date.parse(p.startedAt),end=p.handedOverAt?Date.parse(p.handedOverAt):now;
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)return null;
 const missing=[];const day=t=>new Date(t+7*36e5).toISOString().slice(0,10);
 for(let t=Date.parse(day(start)+'T00:00:00+07:00');t<end;t+=864e5){const d=day(t);if(!days.some(x=>x.date===d&&x.state==='approved'&&typeof x.workIntervals==='string'))missing.push(d);}
 const spans=union(days.filter(d=>d.state==='approved'&&typeof d.workIntervals==='string').flatMap(d=>intervals(d.date,d.workIntervals)).map(([a,b])=>[Math.max(start,a),Math.min(end,b)]));
 const breaks=union(waits.filter(w=>w.approvedAt&&w.end&&['materials','approval'].includes(w.kind)).map(w=>[Date.parse(w.start),Date.parse(w.end)]));
 let ms=0;for(const [a,b] of spans){ms+=b-a;for(const [c,d] of breaks)ms-=Math.max(0,Math.min(b,d)-Math.max(a,c));}
 return {actualHours:missing.length?null:ms/36e5,recordedHours:ms/36e5,missingDays:missing,handedOverAt:p.handedOverAt||null};
}
function fromSql(sql,p,waits=[]){
 const org=require('./organization.cjs').stored(sql);const ids=new Set((org?.employees||[]).filter(e=>e.userId===p.assignee).map(e=>e.id));
 const days=sql.prepare("SELECT document FROM enterprise_records WHERE kind='attendance'").all().map(r=>JSON.parse(r.document)).filter(r=>r.userId?r.userId===p.assignee:ids.has(r.employeeId));
 const result=calculate(p,days,waits);if(result&&p.timeAssigneeChanged){result.actualHours=null;result.assignmentReviewRequired=true;}return result;
}
module.exports={intervals,calculate,fromSql};
