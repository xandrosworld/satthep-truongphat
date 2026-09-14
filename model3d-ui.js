const ModelView={yaw:-32,pitch:30,zoom:1,dimensions:true,serial:0,scope:'selected',unfolded:new Set(),exploded:new Set()};
function modelOwner(n){return (C.nodePath(db.quote.products,n.id)||[]).slice().reverse().find(x=>x.kind==='product');}
function modelSceneFor(n){const owner=modelOwner(n),target=ModelView.scope==='product'&&owner?owner:n;return {target,owner,scene:TP3D.scene(target,{unfolded:ModelView.unfolded.has(target.id),exploded:ModelView.exploded.has(target.id)})};}
function renderModelViewer(n){
  const {target,owner,scene}=modelSceneFor(n),context=target.id!==n.id;
  return `<section class="viewer3d" data-viewer-node="${n.id}" aria-label="Xem 3D ${esc(n.name)}"><div class="model-heading"><div><span class="overline">${context?'SẢN PHẨM CHỨA CHI TIẾT ĐANG CHỌN':'3D / '+({product:'SẢN PHẨM',component:'CẤU KIỆN',material:'VẬT TƯ'})[n.kind]}</span><strong>${esc(target.name)}</strong></div><button class="button small" data-model-action="expand" data-id="${n.id}">Mở rộng</button></div>
    ${owner&&owner.id!==n.id?`<div class="model-scope" role="group" aria-label="Phạm vi xem 3D"><button data-model-action="scope" data-value="selected" aria-pressed="${!context}">Chi tiết đang chọn</button><button data-model-action="scope" data-value="product" aria-pressed="${context}">Sản phẩm chứa</button></div>`:''}
    <div class="model-mode"><span>${esc(scene.title)}</span><div>${scene.canUnfold?`<button class="text-button" data-model-action="unfold" data-id="${target.id}" aria-pressed="${ModelView.unfolded.has(target.id)}">${ModelView.unfolded.has(target.id)?'Xem thành hình':'Xem phôi khai triển'}</button>`:''}${scene.canAssemble?`<button class="text-button" data-model-action="explode" data-id="${target.id}" aria-pressed="${ModelView.exploded.has(target.id)}">${ModelView.exploded.has(target.id)?'Xem theo mẫu lắp ghép':'Tách chi tiết'}</button>`:''}</div></div>
    ${scene.meshes.length?`<div class="model-view-ribbon"><span data-model-view-name>3D · mm</span><button data-model-action="dimensions" aria-pressed="${ModelView.dimensions}" aria-label="${ModelView.dimensions?'Ẩn':'Hiện'} đường kích thước">${ModelView.dimensions?'✓ ':''}Kích thước</button></div><div class="model-stage geometry-stage" tabindex="0" role="img" aria-label="Mô hình 3D: kéo để xoay, phím mũi tên để điều khiển, phím cộng trừ để thu phóng"><svg class="model-scene" viewBox="0 0 600 400" aria-hidden="true"></svg><span class="model-drag-hint">Kéo để xoay</span></div><div class="model-camera" role="group" aria-label="Góc nhìn 3D">${[['iso','3D'],['front','Mặt đứng'],['side','Mặt cắt'],['top','Mặt bằng']].map(([value,label])=>`<button data-model-action="camera" data-value="${value}">${label}</button>`).join('')}<span class="model-camera-separator"></span><button data-model-action="zoom-out" aria-label="Thu nhỏ mô hình">−</button><button data-model-action="zoom-in" aria-label="Phóng to mô hình">+</button><button data-action="reset-3d" aria-label="Đặt lại góc nhìn">↺</button><span data-model-zoom>100%</span></div>`:`<div class="model-empty"><span class="model-empty-symbol">3D</span><strong>${esc(scene.title)}</strong><p>${esc(scene.note)}</p>${target.kind!=='material'&&!scene.rows.length?`<button class="button" data-model-action="add-material" data-parent="${target.id}">+ Thêm vật tư</button>`:''}</div>`}
    ${scene.dimensions.length?`<div class="model-dimensions">${scene.dimensions.map(([key,value])=>`<span>${esc(key)} <strong>${num(value)} <small>mm</small></strong></span>`).join('')}</div>`:''}
    ${scene.rows.length>1?`<label class="model-part-select"><span>Chọn chi tiết để xem / sửa kích thước</span><select data-model-part aria-label="Chi tiết trong mô hình"><option value="">${context?'Đang chọn: '+esc(n.name):scene.rows.length+' dòng vật tư trong cấu thành'}</option>${scene.rows.map(r=>`<option value="${r.node.id}">${esc(r.node.materialId+' · '+r.node.name)} · × ${num(r.count)}</option>`).join('')}</select></label>`:''}
    ${context?`<div class="model-context-note">Đang xem <strong>${esc(n.name)}</strong> trong sản phẩm. ${scene.meshes.some(m=>C.flatten([n]).some(x=>x.id===m.id))?'Phần đang chọn được tô cam.':'Dòng này chưa có hình học để tô sáng.'}</div>`:''}
    ${scene.meshes.length?`<p class="model-short-note">${scene.mode==='template'?'Bố trí theo mẫu · Chưa phải bản vẽ chế tạo.':scene.mode==='parts'?'Chi tiết tách rời · Chưa có bố trí lắp ghép.':'Hình học danh nghĩa · Chưa xét dung sai.'}</p><details class="model-assumptions"><summary>Phạm vi & giả định mô hình</summary><p class="model-note">${esc(scene.note)}</p></details>`:''}
    ${scene.units.length?`<details class="model-nongeometric"><summary>${scene.units.length} dòng theo đơn vị chưa có hình học</summary>${scene.units.map(r=>`<div><span>${esc(r.node.materialId+' · '+r.node.name)}</span><strong>${num(r.count)} ${esc(r.node.spec.unit)}</strong></div>`).join('')}</details>`:''}
    ${scene.omitted?`<p class="model-warning">Hiển thị ${scene.meshes.length} mẫu hình học; còn ${scene.omitted} dòng. Chọn từng dòng trong cây để xem đầy đủ.</p>`:''}
    ${scene.issues.length?`<div class="model-warning" role="alert">${scene.issues.map(esc).join('<br>')}</div>`:''}
    <div class="model-footer">Hình cho 1 ${target.kind==='product'?'sản phẩm':target.kind==='component'?'cấu kiện':'chi tiết'} · Số lượng báo giá xem tại dòng đang chọn</div></section>`;
}
function drawModel(container){
  const n=C.findNode(db.quote.products,container.dataset.viewerNode);if(!n)return;
  const {target,scene}=container._modelData||(container._modelData=modelSceneFor(n)),svg=container.querySelector('.model-scene');if(!svg||!scene.meshes.length)return;
  svg.dataset.renderId||='model'+(++ModelView.serial);
  const rendered=TP3DRender.render(scene,ModelView,{prefix:svg.dataset.renderId,selectedIds:C.flatten([n]).map(x=>x.id),context:target.id!==n.id,dimensions:ModelView.dimensions});
  svg.innerHTML=rendered.html;svg.setAttribute('style',`--camera-yaw:${ModelView.yaw};--camera-pitch:${ModelView.pitch};--camera-zoom:${ModelView.zoom}`);
  svg.dataset.geometry=scene.meshes.map(m=>m.id+':'+TP3D.bounds(m.faces).size.join(',')).join('|');
  let viewName='Góc tự do';for(const button of container.querySelectorAll('[data-model-action=camera]')){const [yaw,pitch]=({iso:[-32,30],front:[0,0],side:[90,0],top:[0,90]})[button.dataset.value],active=ModelView.yaw===yaw&&ModelView.pitch===pitch;button.setAttribute('aria-pressed',String(active));if(active)viewName=button.textContent;}
  const caption=container.querySelector('[data-model-view-name]');if(caption)caption.textContent=viewName+' · mm';
  const zoom=container.querySelector('[data-model-zoom]');if(zoom)zoom.textContent=Math.round(ModelView.zoom*100)+'%';
}
function setupModelViewers(){
  for(const container of document.querySelectorAll('.viewer3d')){
    drawModel(container);const stage=container.querySelector('.model-stage');if(!stage)continue;let pointer=null,lastX=0,lastY=0;
    stage.onpointerdown=e=>{if(e.button!==0)return;pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;stage.setPointerCapture(pointer);stage.focus({preventScroll:true});};
    stage.onpointermove=e=>{if(pointer!==e.pointerId)return;ModelView.yaw+=(e.clientX-lastX)*.45;ModelView.pitch=Math.max(-90,Math.min(90,ModelView.pitch+(e.clientY-lastY)*.45));lastX=e.clientX;lastY=e.clientY;drawModel(container);};
    stage.onpointerup=stage.onpointercancel=e=>{if(pointer===e.pointerId){if(stage.hasPointerCapture(pointer))stage.releasePointerCapture(pointer);pointer=null;}};
    stage.ondblclick=resetModelCamera;
    stage.onkeydown=e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','+','=','-'].includes(e.key))return;e.preventDefault();if(e.key==='Home')return resetModelCamera();if(['+','=','-'].includes(e.key))ModelView.zoom=Math.max(.5,Math.min(4,ModelView.zoom+(e.key==='-'?-.2:.2)));else{ModelView.yaw+=e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0;ModelView.pitch=Math.max(-90,Math.min(90,ModelView.pitch+(e.key==='ArrowDown'?10:e.key==='ArrowUp'?-10:0)));}drawModel(container);};
  }
}
function resetModelCamera(){Object.assign(ModelView,{yaw:-32,pitch:30,zoom:1});document.querySelectorAll('.viewer3d').forEach(drawModel);}
function refreshModelViewers(){for(const el of [...document.querySelectorAll('.viewer3d')]){const n=C.findNode(db.quote.products,el.dataset.viewerNode);if(n)el.outerHTML=renderModelViewer(n);}setupModelViewers();}
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-model-action]');if(!el)return;e.preventDefault();const action=el.dataset.modelAction;
  if(action==='expand'){const n=C.findNode(db.quote.products,el.dataset.id);openDialog(esc(n.name),`<div class="visual-panel modal-3d">${renderModelViewer(n)}</div>`);$('#dialog').classList.add('wide-dialog');setupModelViewers();return;}
  if(action==='add-material'){actions['add-material'](el);return;}
  if(action==='scope')ModelView.scope=el.dataset.value;
  else if(action==='unfold'||action==='explode'){const set=action==='unfold'?ModelView.unfolded:ModelView.exploded;set.has(el.dataset.id)?set.delete(el.dataset.id):set.add(el.dataset.id);}
  else if(action==='dimensions')ModelView.dimensions=!ModelView.dimensions;
  else if(action==='camera'){const [yaw,pitch]=({iso:[-32,30],front:[0,0],side:[90,0],top:[0,90]})[el.dataset.value];Object.assign(ModelView,{yaw,pitch,zoom:1});}
  else if(action==='zoom-in'||action==='zoom-out')ModelView.zoom=Math.max(.5,Math.min(4,ModelView.zoom+(action==='zoom-in'?.2:-.2)));
  const y=scrollY,scope=el.closest('#dialog')?'#dialog':'#content',focus=scope+' [data-model-action="'+action+'"]'+(el.dataset.value?'[data-value="'+el.dataset.value+'"]':'');refreshModelViewers();window.scrollTo(0,y);$(focus)?.focus({preventScroll:true});
});
document.addEventListener('change',e=>{if(!e.target.hasAttribute('data-model-part')||!e.target.value)return;selected=e.target.value;ModelView.scope='selected';if($('#dialog').open)closeDialog();page='quote';tab='bom';UX.mode='detail';render();});
document.getElementById('dialog').addEventListener('close',e=>{if(!e.target.open)e.target.querySelectorAll('.viewer3d').forEach(el=>el.remove());});
