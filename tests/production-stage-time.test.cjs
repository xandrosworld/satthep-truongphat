const {test}=require('node:test'),A=require('node:assert/strict'),time=require('../server/production-stage-time.cjs');
test('stage duration ends at handover and excludes only the union of material and approval waits',()=>{
 const start='2026-09-28T00:00:00Z',end='2026-09-28T06:00:00Z';
 const result=time({startedAt:start,finishedAt:'2026-09-28T04:00:00Z',handedOverAt:end},[
 {kind:'materials',start:'2026-09-27T23:00:00Z',end:'2026-09-28T02:00:00Z'},
 {kind:'approval',start:'2026-09-28T01:00:00Z',end:'2026-09-28T03:00:00Z'},
 {kind:'other',start,end},{kind:'approval',start:'2026-09-28T05:00:00Z'}]);
 A.equal(result.elapsedHours,6);A.equal(result.waitHours,4);A.equal(result.activeHours,2);
 A.equal(time({}),null);A.equal(time({startedAt:start},[],Date.parse(end)).elapsedHours,6);
});
