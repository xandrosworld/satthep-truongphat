'use strict';
// Quantity acknowledgement is separate from completion, stage inventory and QC.
module.exports=function acknowledge(job,body,user,at){
 const ops=job.packet.operations,index=ops.findIndex(o=>o.id===body.operationId),target=ops[index],progress=job.progress.operations.find(o=>o.id===body.operationId);
 if(!target||!progress)throw Error('Không tìm thấy công đoạn');
 if(progress.status==='done')throw Error('Công đoạn đã hoàn thành');
 const output=body.output;if(!Number.isFinite(output)||output<progress.output||output<0||output>target.quantity)throw Error('Sản lượng lũy kế không hợp lệ');
 const updates=[];
 // Only infer predecessors on the same physical detail. Never infer from adjacent unrelated rows.
 if(target.nodeId&&target.quantity>0)for(const op of ops.slice(0,index)){
  if(op.nodeId!==target.nodeId)continue;const p=job.progress.operations.find(x=>x.id===op.id);if(!p||p.status==='done')continue;
  const quantity=Math.min(op.quantity,output/target.quantity*op.quantity);if(quantity<=(p.output||0))continue;
  p.output=quantity;p.quantityEvidence={sourceOperationId:target.id,sourceOutput:output,actor:user.name,at};updates.push({operationId:op.id,quantity});
 }
 progress.output=output;progress.quantityEvidence={sourceOperationId:target.id,sourceOutput:output,actor:user.name,at};
 return updates;
};
