const {test}=require('node:test'),A=require('node:assert/strict'),W=require('../work-period-core.js');
test('period counts actual reports for old tasks, separates identities and units, uses Vietnam completion date',()=>{
 const tasks=[{id:'a',assignee:'1',created:'2026-08-01',state:'confirmed',dueDate:'2026-09-25',events:[{state:'confirmed',at:'2026-09-25T18:00:00Z'}]},{id:'b',assignee:'2',state:'confirmed',sourceManaged:true,output:999,hours:999}];
 const reports=[{taskId:'a',actor:'1',date:'2026-09-26',hours:2,output:3,unit:'kg',issue:'Wait',resolved:false},{taskId:'a',actor:'1',date:'2026-09-26',hours:1,output:4,unit:'cái'},{taskId:'a',actor:'1',date:'2026-08-01',hours:10,output:100,unit:'kg'},{taskId:'hidden',actor:'3',date:'2026-09-26',hours:99}];
 const rows=W.summarize(tasks,reports,{from:'2026-09-26',to:'2026-09-26'});A.deepEqual(rows,[{id:'1',reportedTasks:1,hours:3,units:{kg:3,cái:4},confirmed:1,late:1,unknownDeadline:0,openIssues:1,onTime:0}]);
});
