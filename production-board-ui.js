'use strict';
// The board uses the same versioned APIs as the detailed forms.
productionStageBoard=function(j){
 const groups=[];for(const o of j.packet.operations){if(groups.at(-1)?.name!==o.name)groups.push({name:o.name,ops:[]});groups.at(-1).ops.push(o);}
 const edit=j.state!=='completed'&&actionCan('production','edit',Production.data?.canWork),qc=j.state!=='completed'&&actionCan('production','qc',false);
 return '<section class="production-board-workspace"><div class="production-board-tools" role="group" aria-label="Thao tác công đoạn">'+[['work','Nhân công / bắt đầu',edit],['quantity','Khai khối lượng',edit],['qc','QC công đoạn',qc]].map(([v,l,can],i)=>'<label><input type="radio" name="production-board-mode" value="'+v+'" '+(i===0?'checked ':'')+(!can?'disabled':'')+'> '+l+'</label>').join('')+(edit?'<button type="button" data-board-reorder>Sắp lại trình tự</button>':'')+'</div><p data-board-message role="status">Chọn thẻ công đoạn để khai trực tiếp. QC công đoạn và duyệt hoàn thành được ghi nhận riêng.</p><section class="production-stage-board" aria-label="Quy trình sản xuất theo công đoạn">'+groups.map((g,index)=>'<section class="production-stage-column" data-board-group="'+index+'"><h4>'+pe(g.name)+' <span>'+g.ops.length+'</span></h4><div data-board-order-controls hidden><button type="button" data-board-move="-1" aria-label="Chuyển công đoạn sang trái">←</button> <button type="button" data-board-move="1" aria-label="Chuyển công đoạn sang phải">→</button></div>'+g.ops.map(o=>{const p=j.progress.operations.find(x=>x.id===o.id)||{},pct=o.quantity?Math.min(100,Math.round((p.output||0)/o.quantity*100)):0,t=p.timing;
 return '<article data-board-operation="'+pe(o.id)+'"><button type="button" class="production-stage-card" data-board-open="'+pe(o.id)+'"><strong>'+pe(o.object)+'</strong><small>'+pe(Production.people.find(x=>x.id===p.assignee)?.name||'Chưa phân công')+'</small><small>'+pe(p.output||0)+' / '+pe(o.quantity)+' '+pe(o.outputUnit||'chi tiết')+'</small><progress max="100" value="'+pct+'"></progress><span>'+pct+'% · '+pe(productionStatus[p.status]||'Chưa bắt đầu')+'</span>'+(p.qc?'<small>QC: '+pe(p.qc.passed)+' đạt · '+pe(p.qc.rejected)+' lỗi</small>':'<small>Chưa QC công đoạn</small>')+productionBoardHours(o,p)+(p.issue?'<small class="warning">'+pe(p.issue)+'</small>':'')+'</button>'+productionBoardActions(j,o,p,edit)+'<div data-board-editor hidden></div></article>';}).join('')+'</section>').join('')+'<section class="production-stage-column"><h4>QC cuối lệnh</h4><button type="button" class="production-stage-card" data-production-tab="qc">'+pe(j.progress.qc.passed||0)+' / '+pe(j.quantity)+' đạt</button></section><section class="production-stage-column"><h4>Hoàn thành</h4><button type="button" class="production-stage-card" data-production-tab="qc">'+(j.state==='completed'?'Đã duyệt hoàn thành':'Chờ duyệt hoàn thành')+'</button></section></section><div data-board-order-save hidden><label>Lý do đổi trình tự<input data-board-reason maxlength="2000"></label><button type="button" data-board-propose>Gửi đề nghị duyệt trình tự</button> <button type="button" data-board-cancel-order>Hủy sắp lại</button><p>Trình tự này là bản đề nghị. Chỉ áp dụng sau khi được duyệt; các bước đã triển khai giữ nguyên.</p></div></section>';
};
function productionBoardActions(j,o,p,edit){
 if(!edit)return '';
 const index=j.packet.operations.findIndex(x=>x.id===o.id),previous=j.progress.operations.slice(0,index),ready=previous.every(x=>x.status==='done');
 if(p.status==='pending')return '<button type="button" class="primary" data-board-start="'+pe(o.id)+'" '+(!ready?'disabled title="Hoàn tất và đối soát công đoạn trước"':'')+'>'+ (index?'Nhận bàn giao / Bắt đầu':'Bắt đầu')+'</button>';
 if(p.status!=='done')return '<button type="button" class="primary" data-board-finish="'+pe(o.id)+'">Kết thúc &amp; bàn giao</button>';
 const next=j.packet.operations[index+1];
 return '<p class="help-text">'+(p.handedOverAt?'Đã bàn giao · '+pe(TPDisplay.date(p.handedOverAt,true)):'Đã đối soát · Chờ bàn giao; thời gian vẫn đang tính')+'</p>'+(!p.handedOverAt&&next?'<button type="button" data-board-next="'+pe(next.id)+'">Chuyển công đoạn tiếp →</button>':!p.handedOverAt?'<button type="button" data-production-tab="qc">QC / bàn giao thành phẩm →</button>':'');
}
function productionBoardBind(el,j){
 const host=el.querySelector('.production-board-workspace');if(!host)return;
 const board=host.querySelector('.production-stage-board'),message=host.querySelector('[data-board-message]'),original=[...board.children],editable=j.state!=='completed'&&actionCan('production','edit',Production.data?.canWork);let ordering=false,dragged=null,busy=false;
 if(Production.boardMode?.id===j.id){const radio=host.querySelector('[name=production-board-mode][value="'+Production.boardMode.mode+'"]');if(radio&&!radio.disabled)radio.checked=true;}
 const say=s=>message.textContent=s;
 function orderMode(on){ordering=on;host.querySelector('[data-board-order-save]').hidden=!on;for(const c of board.querySelectorAll('[data-board-group]')){c.draggable=on;c.querySelector('[data-board-order-controls]').hidden=!on;}host.querySelectorAll('[data-board-editor]').forEach(x=>x.hidden=true);}
 function orderIds(){return [...board.querySelectorAll('[data-board-operation]')].map(x=>x.dataset.boardOperation);}
 function move(column,target){if(!ordering||!column||!target||column===target||!target.hasAttribute('data-board-group'))return;const before=[...board.children],ids=orderIds();board.insertBefore(column,before.indexOf(column)<before.indexOf(target)?target.nextSibling:target);const next=orderIds(),frozen=j.progress.operations.filter(p=>p.status!=='pending'||p.output>0).map(p=>p.id);if(frozen.some(id=>ids.indexOf(id)!==next.indexOf(id))){for(const c of before)board.append(c);say('Giữ nguyên vị trí công đoạn đã bắt đầu hoặc đã ghi nhận sản lượng.');}else say('Đã sắp bản đề nghị; nhập lý do và gửi duyệt để áp dụng.');}
 board.addEventListener('dragstart',e=>{const c=e.target.closest('[data-board-group]');if(!ordering||!c||e.target.closest('[data-board-editor]')){e.preventDefault();return;}dragged=c;e.dataTransfer.setData('text/plain',c.dataset.boardGroup);});
 board.addEventListener('dragover',e=>{if(ordering&&e.target.closest('[data-board-group]'))e.preventDefault();});
 board.addEventListener('drop',e=>{e.preventDefault();move(dragged,e.target.closest('[data-board-group]'));dragged=null;});
 host.addEventListener('change',e=>{if(e.target.name==='production-board-mode'){Production.boardMode={id:j.id,mode:e.target.value};host.querySelectorAll('[data-board-editor]').forEach(x=>x.hidden=true);}});
 host.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b||busy)return;
  if(b.hasAttribute('data-board-next')){const next=host.querySelector('[data-board-start="'+CSS.escape(b.dataset.boardNext)+'"]');if(next){next.scrollIntoView({block:'nearest',inline:'center'});next.click();}return;}
  if(b.hasAttribute('data-board-start')){
   if(ordering)return;const radio=host.querySelector('[name=production-board-mode][value=work]');radio.checked=true;Production.boardMode={id:j.id,mode:'work'};
   const card=host.querySelector('[data-board-open="'+CSS.escape(b.dataset.boardStart)+'"]');card.click();const box=card.parentElement.querySelector('[data-board-editor]');
   const status=box.querySelector('[name=status]');if(status){status.value='running';box.querySelector('[data-board-save]').textContent='Xác nhận bắt đầu';box.querySelector('[name=assignee]').focus();}return;
  }
  if(b.hasAttribute('data-board-finish')){
   if(ordering)return;busy=true;b.disabled=true;
   try{await productionFlowOpen();const form=document.querySelector('#flow-settle');if(form&&ProductionFlow.data.active===b.dataset.boardFinish){form.dataset.boardFinish=b.dataset.boardFinish;form.scrollIntoView({block:'start'});form.querySelector('[name=output]')?.focus();}else document.querySelector('#production-message').textContent='Kiểm tra đề nghị đối soát đang chờ duyệt trước khi bàn giao.';}catch(err){say(err.message);}finally{busy=false;b.disabled=false;}return;
  }
  if(b.hasAttribute('data-board-reorder')){if(ordering)for(const c of original)board.append(c);orderMode(!ordering);return;}
  if(b.hasAttribute('data-board-cancel-order')){for(const c of original)board.append(c);orderMode(false);say('Đã hủy bản sắp lại.');return;}
  if(b.hasAttribute('data-board-move')){const c=b.closest('[data-board-group]');move(c,Number(b.dataset.boardMove)<0?c.previousElementSibling:c.nextElementSibling);return;}
  if(b.hasAttribute('data-board-propose')){
   const reason=host.querySelector('[data-board-reason]').value.trim(),ids=orderIds();if(!reason){say('Nhập lý do đổi trình tự.');return;}if(ids.every((id,i)=>id===j.packet.operations[i].id)){say('Trình tự chưa thay đổi.');return;}
   busy=true;b.disabled=true;try{await teamApi('production/'+j.id+'/flow/plan','POST',{expectedVersion:j.version,reason,operations:ids.map(id=>{const o=j.packet.operations.find(o=>o.id===id);return {...o,lossPercent:o.lossPercent??0};})});orderMode(false);say('Đã gửi đề nghị. Quy trình đang áp dụng giữ nguyên cho đến khi được duyệt.');for(const c of original)board.append(c);}catch(err){say(err.message);}finally{busy=false;b.disabled=false;}return;
  }
  if(b.hasAttribute('data-board-close')){b.closest('[data-board-editor]').hidden=true;return;}
  if(b.hasAttribute('data-board-open')){
   if(ordering)return;const o=j.packet.operations.find(o=>o.id===b.dataset.boardOpen),p=j.progress.operations.find(p=>p.id===o.id),box=b.parentElement.querySelector('[data-board-editor]'),mode=host.querySelector('[name=production-board-mode]:checked')?.value||'work';
   if(j.state==='completed'||(mode==='qc'?!actionCan('production','qc',false):!editable)){say('Bạn chưa có quyền khai báo mục này.');return;}
   if(p.status==='done'&&mode!=='qc'){say('Công đoạn đã hoàn thành; có thể xem hoặc khai QC riêng.');return;}
   host.querySelectorAll('[data-board-editor]').forEach(x=>x.hidden=true);box.hidden=false;box.dataset.mode=mode;
   const number=(name,label,value,max)=>'<label>'+label+'<input name="'+name+'" type="number" min="0" '+(max===undefined?'':'max="'+max+'"')+' step="any" value="'+pe(value||0)+'" required></label>';
   box.innerHTML=mode==='qc'?number('passed','QC đạt lũy kế',p.qc?.passed,p.output)+number('rejected','QC không đạt lũy kế',p.qc?.rejected,p.output)+'<label>Ghi chú QC<input name="note" maxlength="2000" value="'+pe(p.qc?.note||'')+'"></label>':mode==='quantity'?number('output','Sản lượng hoàn thành lũy kế',p.output,o.quantity)+productionBoardHours(o,p)+'<p>Ghi nhận sản lượng, chưa duyệt hoàn thành hoặc QC.</p>':'<label>Người chịu trách nhiệm<select name="assignee"><option value="">Chọn người</option>'+Production.people.map(u=>'<option value="'+pe(u.id)+'" '+(u.id===p.assignee?'selected':'')+'>'+pe(u.name)+'</option>').join('')+'</select></label>'+(o.mode==='outside'?'<p>Thuê ngoài</p>':'<label>Máy thực hiện / Thủ công<input name="machine" maxlength="120" value="'+pe(p.machine||o.machine||'')+'" required></label>')+productionBoardHours(o,p)+'<label>Trạng thái<select name="status"><option value="'+pe(p.status)+'">'+pe(productionStatus[p.status])+'</option>'+(p.status==='pending'?'<option value="running">Bắt đầu công đoạn</option>':'')+'</select></label><p>Hạn: '+pe(j.progress.deadline||'Chưa khai')+'</p>';
   box.innerHTML+='<p data-board-error role="status"></p><button type="button" class="primary" data-board-save>Lưu '+(mode==='qc'?'QC':mode==='quantity'?'khối lượng':'nhân công')+'</button> <button type="button" data-board-close>Đóng</button>';return;
  }
  if(b.hasAttribute('data-board-save')){
   const box=b.closest('[data-board-editor]'),id=box.closest('[data-board-operation]').dataset.boardOperation,p=j.progress.operations.find(p=>p.id===id),o=j.packet.operations.find(o=>o.id===id),mode=box.dataset.mode,read=n=>box.querySelector('[name="'+n+'"]').value,error=box.querySelector('[data-board-error]');
   for(const input of box.querySelectorAll('input'))if(!input.reportValidity())return;
   if(Production.saving)return;busy=true;b.disabled=true;const release=productionBusy();
   try{if(mode==='qc')await teamApi('production/'+j.id+'/flow/stage-qc','POST',{expectedVersion:j.version,operationId:id,passed:Number(read('passed')),rejected:Number(read('rejected')),note:read('note')});
    else await chatApi('production/'+j.id,'PUT',{expectedVersion:j.version,operationId:id,...(mode==='quantity'?{action:'quantity',output:Number(read('output')),note:p.note||''}:{action:'operation',assignee:read('assignee'),status:read('status'),machine:o.mode==='outside'?(p.machine||o.machine||''):read('machine'),output:p.output||0,note:p.note||'',issue:p.issue||'',proposal:p.proposal||''})});
    await productionLoad(j.id);productionTab('operations');const radio=document.querySelector('[name=production-board-mode][value="'+mode+'"]');if(radio)radio.checked=true;document.querySelector('#production-message').textContent='Đã lưu '+(mode==='qc'?'QC công đoạn':mode==='quantity'?'khối lượng':'nhân công')+' lên máy chủ.';
   }catch(err){error.textContent=err.message;}finally{release();busy=false;b.disabled=false;}
  }
 });
}

function productionBoardHours(o,p){
 const fmt=n=>Number(n).toLocaleString('vi-VN',{maximumFractionDigits:2}),w=p.workingTime;
 return '<small>Định mức: '+(Number.isFinite(o.standardHours)?fmt(o.standardHours*o.quantity)+' giờ':'Chưa khai tại rà soát điều kiện sản xuất')+'</small><small>Thực tế trong ca + tăng ca: '+(!p.startedAt?'Chưa bắt đầu':w?.assignmentReviewRequired?'Cần đối chiếu thời gian đổi người':Number.isFinite(w?.actualHours)?fmt(w.actualHours)+' giờ': 'Chưa đủ khoảng làm việc đã duyệt')+(Number.isFinite(w?.actualHours)&&Number.isFinite(o.standardHours)?' · Chênh định mức: '+fmt(w.actualHours-o.standardHours*o.quantity)+' giờ':'')+(p.startedAt?' · '+(p.handedOverAt?'Đã bàn giao':'Đang tính đến bàn giao'):'')+'</small>';
}
