'use strict';
const A=require('node:assert/strict');
async function review(call,user,id){
 const j=(await call('production/'+id,'GET',undefined,user)).data,d=(await call('production/'+id+'/dossier','GET',undefined,user)).data;
 if(!d.reviewed){const r=await call('production/'+id+'/dossier','POST',{expectedVersion:j.version,requirements:d.requirements||'',noDrawingReason:'Test manufacturing specification verified',reviewed:true,reviewChecks:{input:true,structure:true,operations:true,cutting:true,quantities:true},equipment:j.packet.operations.map(o=>({operationId:o.id,machine:o.machine||'Manual',method:'Verified manufacturing specification'}))},user);A.equal(r.status,200,JSON.stringify(r.data));}
 return (await call('production/'+id,'GET',undefined,user)).data;
}
module.exports={review};
