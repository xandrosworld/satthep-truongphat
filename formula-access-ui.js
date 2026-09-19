/* Independent formula privileges; protected formulas are evaluated by the server. */
'use strict';
const FORMULA_RIGHTS={
 canFormulaUse:['can_formula_use','Dùng công thức để tính'],
 canFormulaView:['can_formula_view','Xem biểu thức công thức'],
 canFormulaEdit:['can_formula_edit','Sửa công thức chưa khóa'],
 canFormulaUnlock:['can_formula_unlock','Khóa / mở sửa công thức đã chốt'],
 canReopen:['can_reopen','Mở sửa báo giá đã trình / duyệt']
};
window.TPFormulaAccess=(()=>{
 const refs=new Map(),cache=new Map();let session='';
 const isRef=s=>typeof s==='string'&&/^__TPF_[a-f0-9]{32}$/.test(s);
 function unwrap(v){if(!v?.__formulaProtected)return v;for(const [k,x]of Object.entries(v.formulaRefs||{}))refs.set(k,x);return v.value;}
 function evaluate(token,variables,mode='value'){
  if(!Team.user||!Team.permissions?.formulaUse)throw Error('Chưa có quyền sử dụng công thức');
  if(session!==Team.csrf){cache.clear();session=Team.csrf;}
  const meta=refs.get(token);if(!meta)throw Error('Tải lại danh mục để sử dụng công thức');
  const vars=Object.fromEntries(meta.variables.filter(k=>Object.hasOwn(variables,k)).sort().map(k=>[k,variables[k]])),key=JSON.stringify([token,vars,mode]);
  if(cache.has(key))return cache.get(key);
  // The existing pricing engine is synchronous. Cache each unique calculation,
  // and only send the opaque reference plus required numeric inputs.
  const xhr=new XMLHttpRequest();xhr.open('POST','/api/formulas/evaluate',false);xhr.setRequestHeader('Content-Type','application/json');xhr.setRequestHeader('X-CSRF-Token',Team.csrf);
  xhr.send(JSON.stringify({token,variables:vars,mode}));const data=unwrap(JSON.parse(xhr.responseText));
  if(xhr.status!==200)throw Error(data.error||'Không tính được công thức trên máy chủ');
  if(cache.size>5000)cache.clear();cache.set(key,data.value);return data.value;
 }
 return {isRef,unwrap,evaluate,names:s=>refs.get(s)?.variables||[],metadata:()=>Object.fromEntries(refs),clear:()=>{refs.clear();cache.clear();}};
})();
function formulaRightFields(user){const sections=TPSectionAccess.sections(user),checked=key=>{const col=FORMULA_RIGHTS[key][0],fallback=['canFormulaUse','canFormulaView'].includes(key)||key==='canFormulaEdit'&&sections.some(k=>['bom','catalogRules'].includes(k));return user.role==='admin'||(user[col]??fallback);};
 const box=(key,label)=>`<input type="checkbox" name="${key}" aria-label="${label}" ${checked(key)?'checked':''}>`;
 return `<fieldset class="formula-rights"><legend>Công thức và dữ liệu đã hoàn thiện</legend><table class="permission-matrix"><thead><tr><th scope="col">Nội dung</th><th scope="col">Cho phép sửa</th><th scope="col">Chỉ xem</th></tr></thead><tbody><tr><th scope="row">Biểu thức công thức<small>Áp dụng khi có quyền vào phần tương ứng.</small></th><td>${box('canFormulaEdit','Sửa công thức chưa khóa')}</td><td><input type="checkbox" data-formula-view-only aria-label="Chỉ xem biểu thức công thức" ${checked('canFormulaView')&&!checked('canFormulaEdit')?'checked':''}><span hidden>${box('canFormulaView','Xem biểu thức công thức')}</span></td></tr></tbody></table><div class="permission-actions">${['canFormulaUse','canFormulaUnlock','canReopen'].map(key=>`<label class="pa-checkbox">${box(key,FORMULA_RIGHTS[key][1])} ${FORMULA_RIGHTS[key][1]}</label>`).join('')}</div><p class="help-text">Dùng công thức, khóa/mở công thức và mở sửa báo giá là quyền riêng. Bản đã duyệt giữ lịch sử; mở sửa tạo bản nháp để duyệt lại.</p></fieldset>`;
}
function formulaMatrixRefresh(){const form=$('#dialog-form'),only=form?.querySelector('[data-formula-view-only]');if(only)only.checked=!!form.elements.canFormulaView?.checked&&!form.elements.canFormulaEdit?.checked;}

async function formulaLocks(){const rows=await teamApi('formulas/locks');openDialog('Khóa công thức đã chốt','<p>Áp dụng cho công thức đã lưu trên danh mục máy chủ và khi chỉnh công thức đó trong báo giá. Khóa không cản việc sử dụng để tính.</p><div class="table-scroll"><table><thead><tr><th>Công thức</th><th>Trạng thái</th><th></th></tr></thead><tbody>'+rows.map(r=>`<tr><td>${esc(r.name)}<small class="subtext">${esc(r.key)}</small></td><td>${r.locked?'Đã khóa':'Chưa khóa'}</td><td>${Team.permissions.formulaUnlock?`<button type="button" class="button small" data-formula-lock="${esc(r.key)}" data-version="${r.version}" data-locked="${r.locked?0:1}">${r.locked?'Mở khóa':'Khóa công thức'}</button>`:''}</td></tr>`).join('')+'</tbody></table></div>');$('#dialog').classList.add('wide-dialog');}
function formulaPaint(){if(!Team.user)return;if(!Team.permissions.formulaView){const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);for(let n; n=walk.nextNode();)if(!['SCRIPT','STYLE'].includes(n.parentElement?.tagName)&&/__TPF_[a-f0-9]{32}/.test(n.data))n.data=n.data.replace(/__TPF_[a-f0-9]{32}/g,'[Công thức được bảo vệ]');document.querySelectorAll('[title]').forEach(el=>{if(el.title.includes('__TPF_'))el.title='Công thức được bảo vệ';});}}
function installFormulaAccessUI(){
 document.addEventListener('change',e=>{const form=e.target.closest('#dialog-form');if(!form)return;if(e.target.matches('[data-formula-view-only]')){form.elements.canFormulaView.checked=e.target.checked;if(e.target.checked)form.elements.canFormulaEdit.checked=false;}if(e.target.name==='canFormulaEdit'&&e.target.checked)form.elements.canFormulaView.checked=true;queueMicrotask(formulaMatrixRefresh);});
 const fields=accessFields;accessFields=(u={role:'estimator'})=>fields(u).replace('<fieldset class="section-permissions">',formulaRightFields(u)+'<fieldset class="section-permissions">');
 const api=teamApi;teamApi=(route,method='GET',data)=>{if(data&&['POST','PUT'].includes(method)&&(/^(users(?:\/[^/]+\/access)?|roles(?:\/[^/]+)?)$/.test(route))){const box=$('#dialog .formula-rights');if(box)data={...data,...Object.fromEntries(Object.keys(FORMULA_RIGHTS).map(k=>[k,!!box.querySelector('[name='+k+']')?.checked]))};}return api(route,method,data);};
 const session=teamSession;teamSession=value=>{if(!value.user||Team.user?.id!==value.user.id||Team.permissions?.formulaView!==value.permissions?.formulaView)TPFormulaAccess.clear();if(value.permissions?.formulaView===false&&Team.permissions?.formulaView!==false){CatalogDraft.record=null;CatalogDraft.dirty=false;CatalogDraft.user=null;}session(value);};
 document.addEventListener('change',e=>{if(e.target.hasAttribute('data-access-role')){const user={role:e.target.value};for(const [key,[col]]of Object.entries(FORMULA_RIGHTS)){const el=$('#dialog [name='+key+']');if(el)el.checked=user.role==='admin'||['canFormulaUse','canFormulaView'].includes(key)||key==='canFormulaEdit'&&['estimator','technical'].includes(user.role);}}});
 const renderBefore=render;render=()=>{renderBefore();if(Team.user&&page==='rules'&&(Team.permissions.catalog||Team.permissions.formulaUnlock))$('#content .page-heading,.rc-workspace > header,.rc-workspace')?.insertAdjacentHTML('afterbegin','<div class="actions"><button type="button" class="button" data-formula-locks>Khóa công thức</button></div>');formulaPaint();};
 const readonly=()=>{document.querySelectorAll('#dialog input,#dialog textarea,#dialog select,#dialog button[type=submit]').forEach(el=>el.disabled=true);$('#dialog-form').insertAdjacentHTML('afterbegin','<p class="notice">Chỉ xem công thức. Muốn sửa cần quyền Sửa công thức; công thức đã khóa cần quyền mở sửa.</p>');};
 const shape=dfShapeEdit;dfShapeEdit=async(id,working)=>{if(Team.user&&!Team.permissions.formulaView)return toast('Chưa có quyền xem biểu thức công thức');let locked=false;if(Team.user&&id){const locks=await teamApi('formulas/locks');locked=locks.some(r=>r.locked&&r.key==='shapeDefinitions:'+id);}shape(id,working);if(Team.user&&(!Team.permissions.formulaEdit||locked&&!Team.permissions.formulaUnlock))readonly();};
 const rule=editRule;editRule=async id=>{if(Team.user&&!Team.permissions.formulaView)return toast('Chưa có quyền xem biểu thức công thức');const locks=Team.user?await teamApi('formulas/locks'):[];rule(id);if(Team.user&&(!Team.permissions.formulaEdit||locks.some(r=>r.key==='rules:'+id&&r.locked)&&!Team.permissions.formulaUnlock))readonly();};
 const dims=b2Dimensions;b2Dimensions=(...args)=>{if(Team.user&&!Team.permissions.formulaView)return toast('Chưa có quyền xem biểu thức; nhập thông số trực tiếp trên bảng cấu thành');dims(...args);if(Team.user&&!Team.permissions.formulaEdit)readonly();};
 const measurement=mfgEditRule;mfgEditRule=(...args)=>{if(Team.user&&!Team.permissions.formulaView)return toast('Chưa có quyền xem biểu thức công thức');measurement(...args);if(Team.user&&!Team.permissions.formulaEdit)readonly();};
 const mutate=mutation;mutation=(action,options={})=>{if(!Team.user||Team.permissions.formulaUse)return mutate(action,options);const before=C.copy(db.quote.products);return mutate(()=>{action();if(!TPSectionAccess.equal(before,db.quote.products))throw Error('Chưa có quyền sử dụng công thức để thay đổi cấu thành');},options);};
 const rows=rcFormulaRows;rcFormulaRows=d=>Team.user&&!Team.permissions.formulaView?'<p class="notice">Công thức được bảo vệ. Bạn có thể chọn dạng cấu kiện và nhập thông số để tính khi được cấp quyền sử dụng.</p>':rows(d);
 document.addEventListener('click',e=>{const list=e.target.closest('[data-formula-locks]'),b=e.target.closest('[data-formula-lock]');if(list){formulaLocks().catch(inError);return;}if(!b)return;teamDialog(b.dataset.locked==='1'?'Khóa công thức':'Mở khóa công thức',field('Lý do','reason','','text','required maxlength="500"'),'Xác nhận',async f=>{await teamApi('formulas/locks','POST',{key:b.dataset.formulaLock,locked:b.dataset.locked==='1',expectedVersion:Number(b.dataset.version),reason:f.get('reason')});await formulaLocks();});});
 const observer=new MutationObserver(()=>formulaPaint());observer.observe($('#dialog'),{childList:true,subtree:true});
}
