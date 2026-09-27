'use strict';
// Merge overlapping waits, clipped to the actual start/handover interval.
module.exports=function stageTime(p,waits=[],now=Date.now()){
 const start=Date.parse(p.startedAt),end=p.handedOverAt?Date.parse(p.handedOverAt):now;
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<start)return null;
 const ranges=waits.filter(w=>['materials','approval'].includes(w.kind)).map(w=>[Math.max(start,Date.parse(w.start)),Math.min(end,w.end?Date.parse(w.end):end)]).filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&b>a).sort((a,b)=>a[0]-b[0]);
 let waited=0,right=start;for(const [a,b]of ranges){waited+=Math.max(0,b-Math.max(a,right));right=Math.max(right,b);}
 return {elapsedHours:(end-start)/36e5,waitHours:waited/36e5,activeHours:(end-start-waited)/36e5,handedOverAt:p.handedOverAt||null};
};
