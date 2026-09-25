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
 return `<fieldset class="formula-rights"><legend>Công thức và dữ liệu đã hoàn thiện</legend><table class="permission-matrix"><thead><tr><th scope="col">Nội dung</th><th scope="col">Cho phép sửa</th><th scope="col">Chỉ xem</th></tr></thead><tbody><tr><th scope="row">Biểu thức công thức<small>Áp dụng khi có quyền vào phần tương ứng.</small></th><td>${box('canFormulaEdit','Sửa công thức chưa khóa')}</td><td><input type="checkbox" data-formula-view-only aria-label="Chỉ xem biểu thức công thức" ${checked('canFormulaView')&&!checked('canFormulaEdit')?'checked':''}><span hidden>${box('canFormulaView','Xem biểu thức công thức')}</span></td></tr></tbody></table><div class="permission-actions">${['canFormulaUse','canReopen'].map(key=>`<label class="pa-checkbox">${box(key,FORMULA_RIGHTS[key][1])} ${FORMULA_RIGHTS[key][1]}</label>`).join('')}</div><p class="help-text">Khóa/mở công thức và hệ số đã chốt cần quyền riêng tại mục Quản trị dữ liệu. Dùng công thức và mở sửa báo giá là quyền riêng. Bản đã duyệt giữ lịch sử; mở sửa tạo bản nháp để duyệt lại.</p></fieldset>`;
}
function formulaMatrixRefresh(){const form=$('#dialog-form'),only=form?.querySelector('[data-formula-view-only]');if(only)only.checked=!!form.elements.canFormulaView?.checked&&!form.elements.canFormulaEdit?.checked;}

async function formulaLocks(){if(CatalogDraft.dirty)await cdSave();const rows=await teamApi('formulas/locks');openDialog('Khóa công thức và hệ số đã chốt','<p>Khóa công thức hoặc toàn bộ bảng hệ số đã lưu trên máy chủ, gồm giá trị và phạm vi áp dụng. Người được cấp quyền khóa/mở cần mở khóa trước khi chỉnh sửa hoặc xóa. Nhân viên vẫn dùng để tính và chọn mức độ công việc.</p><div class="table-scroll"><table><thead><tr><th>Công thức / hệ số</th><th>Trạng thái</th><th></th></tr></thead><tbody>'+rows.map(r=>`<tr><td>${esc(r.name)}</td><td>${r.locked?'Đã khóa':'Chưa khóa'}</td><td>${Team.permissions.formulaUnlock?`<button type="button" class="button small" data-formula-lock="${esc(r.key)}" data-version="${r.version}" data-locked="${r.locked?0:1}">${r.locked?'Mở khóa':r.kind==='calculationFactors'?'Khóa hệ số':'Khóa công thức'}</button>`:''}</td></tr>`).join('')+'</tbody></table></div>');$('#dialog').classList.add('wide-dialog');}
function formulaPaint(){if(!Team.user)return;if(!Team.permissions.formulaView){const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);for(let n; n=walk.nextNode();)if(!['SCRIPT','STYLE'].includes(n.parentElement?.tagName)&&/__TPF_[a-f0-9]{32}/.test(n.data))n.data=n.data.replace(/__TPF_[a-f0-9]{32}/g,'[Công thức được bảo vệ]');document.querySelectorAll('[title]').forEach(el=>{if(el.title.includes('__TPF_'))el.title='Công thức được bảo vệ';});}}
function installFormulaAccessUI(){
 document.addEventListener('change',e=>{const form=e.target.closest('#dialog-form');if(!form)return;if(e.target.matches('[data-formula-view-only]')){form.elements.canFormulaView.checked=e.target.checked;if(e.target.checked)form.elements.canFormulaEdit.checked=false;}if(e.target.name==='canFormulaEdit'&&e.target.checked)form.elements.canFormulaView.checked=true;queueMicrotask(formulaMatrixRefresh);});
 const fields=accessFields;accessFields=(u={role:'estimator'})=>fields(u).replace('<fieldset class="section-permissions">',formulaRightFields(u)+'<fieldset class="section-permissions">');
 const api=teamApi;teamApi=(route,method='GET',data)=>{if(data&&['POST','PUT'].includes(method)&&(/^(users(?:\/[^/]+\/access)?|roles(?:\/[^/]+)?)$/.test(route))){const box=$('#dialog .formula-rights');if(box)data={...data,...Object.fromEntries(Object.keys(FORMULA_RIGHTS).map(k=>[k,!!box.querySelector('[name='+k+']')?.checked]))};}return api(route,method,data);};
 const session=teamSession;teamSession=value=>{if(!value.user||Team.user?.id!==value.user.id||Team.permissions?.formulaView!==value.permissions?.formulaView)TPFormulaAccess.clear();if(value.permissions?.formulaView===false&&Team.permissions?.formulaView!==false){CatalogDraft.record=null;CatalogDraft.dirty=false;CatalogDraft.user=null;}FormulaCatalogLocks.rows=null;FormulaCatalogLocks.at=0;session(value);};
 document.addEventListener('change',e=>{if(e.target.hasAttribute('data-access-role')){const user={role:e.target.value};for(const [key,[col]]of Object.entries(FORMULA_RIGHTS)){const el=$('#dialog [name='+key+']');if(el)el.checked=user.role==='admin'||['canFormulaUse','canFormulaView'].includes(key)||key==='canFormulaEdit'&&['estimator','technical'].includes(user.role);}}});
 const renderBefore=render;render=()=>{renderBefore();if(Team.user&&page==='rules'&&(Team.permissions.catalog||Team.permissions.formulaUnlock))$('#content .page-heading,.rc-workspace > header,.rc-workspace')?.insertAdjacentHTML('afterbegin','<div class="actions"><button type="button" class="button" data-formula-locks>Khóa công thức và hệ số</button></div>');formulaPaint();formulaCatalogPaint();if(Team.user&&page==='rules'&&Date.now()-FormulaCatalogLocks.at>5000)formulaRefreshLocks().then(formulaCatalogPaint).catch(inError);};
 const readonly=()=>{document.querySelectorAll('#dialog input,#dialog textarea,#dialog select').forEach(el=>el.disabled=true);document.querySelectorAll('#dialog button[type=submit]').forEach(el=>el.hidden=true);$('#dialog-form').insertAdjacentHTML('afterbegin','<p class="notice">Chỉ xem công thức. Muốn sửa cần quyền Sửa công thức; công thức đã khóa cần Admin mở khóa trước.</p>');};
 const factorGuard=fn=>async(...args)=>{try{if(Team.user){const locks=await teamApi('formulas/locks');if(locks.some(r=>r.key==='calculationFactors:all'&&r.locked))return toast('Hệ số đã khóa. Chỉ Admin được mở khóa và chỉnh sửa.');}return fn(...args);}catch(e){inError(e);}};
 rcFactorEdit=factorGuard(rcFactorEdit);rcFactorRemove=factorGuard(rcFactorRemove);fmMatrix=factorGuard(fmMatrix);
 const shape=dfShapeEdit;dfShapeEdit=async(id,working)=>{if(Team.user&&!Team.permissions.formulaView)return toast('Chưa có quyền xem biểu thức công thức');let locked=false;if(Team.user&&(id||working?.sourceRuleId)){const locks=await teamApi('formulas/locks');locked=locks.some(r=>r.locked&&r.key===(working?.sourceRuleId?'rules:'+working.sourceRuleId:'shapeDefinitions:'+id));}shape(id,working);if(Team.user&&(!Team.permissions.formulaEdit||locked))readonly();};
 const rule=editRule;editRule=async id=>{if(Team.user&&!Team.permissions.formulaView)return toast('Chưa có quyền xem biểu thức công thức');const locks=Team.user?await teamApi('formulas/locks'):[];rule(id);if(Team.user&&(!Team.permissions.formulaEdit||locks.some(r=>r.key==='rules:'+id&&r.locked)))readonly();};
 const dims=b2Dimensions;b2Dimensions=(...args)=>{if(Team.user&&!Team.permissions.formulaView)return toast('Chưa có quyền xem biểu thức; nhập thông số trực tiếp trên bảng cấu thành');dims(...args);if(Team.user&&!Team.permissions.formulaEdit)readonly();};
 const measurement=mfgEditRule;mfgEditRule=(...args)=>{if(Team.user&&!Team.permissions.formulaView)return toast('Chưa có quyền xem biểu thức công thức');measurement(...args);if(Team.user&&!Team.permissions.formulaEdit)readonly();};
 const mutate=mutation;mutation=(action,options={})=>{if(!Team.user||Team.permissions.formulaUse)return mutate(action,options);const before=C.copy(db.quote.products);return mutate(()=>{action();if(!TPSectionAccess.equal(before,db.quote.products))throw Error('Chưa có quyền sử dụng công thức để thay đổi cấu thành');},options);};
 const rows=rcFormulaRows;rcFormulaRows=d=>Team.user&&!Team.permissions.formulaView?'<p class="notice">Công thức được bảo vệ. Bạn có thể chọn dạng cấu kiện và nhập thông số để tính khi được cấp quyền sử dụng.</p>':rows(d);
 document.addEventListener('click',e=>{const list=e.target.closest('[data-formula-locks]'),b=e.target.closest('[data-formula-lock]');if(list){formulaLocks().catch(inError);return;}if(!b)return;teamDialog(b.dataset.locked==='1'?'Khóa công thức':'Mở khóa công thức',field('Lý do','reason','','text','required maxlength="500"'),'Xác nhận',async f=>{if(CatalogDraft.dirty)await cdSave();await teamApi('formulas/locks','POST',{expectedCatalogVersion:Team.catalogVersion,key:b.dataset.formulaLock,locked:b.dataset.locked==='1',expectedVersion:Number(b.dataset.version),reason:f.get('reason')});await formulaRefreshLocks();render();await formulaLocks();});});
 installFormulaEditLeases();
 const observer=new MutationObserver(()=>formulaPaint());observer.observe($('#dialog'),{childList:true,subtree:true});
}

// Locked declarations remain viewable and usable; editing requires explicit unlock.
const FormulaCatalogLocks={rows:null,at:0,pending:null};
async function formulaRefreshLocks(){
 if(!Team.user)return [];if(FormulaCatalogLocks.pending)return FormulaCatalogLocks.pending;
 const user=Team.user.id;
 FormulaCatalogLocks.pending=teamApi('formulas/locks').then(rows=>{if(Team.user?.id===user){FormulaCatalogLocks.rows=rows;FormulaCatalogLocks.at=Date.now();}return rows;}).finally(()=>FormulaCatalogLocks.pending=null);
 return FormulaCatalogLocks.pending;
}
function formulaCatalogPaint(){
 if(!Team.user||page!=='rules')return;
 let panel=document.querySelector('[data-factor-lock-panel]');
 if(RulesCatalog.tab==='factors'||document.querySelector('[data-shared-factor]')){
 const lock=FormulaCatalogLocks.rows?.find(r=>r.key==='calculationFactors:all');
 const state=lock?.locked?'Đã khóa':'Chưa khóa',dirty=CatalogDraft.dirty;
 if(!panel){panel=document.createElement('section');panel.className='notice';panel.dataset.factorLockPanel='';document.querySelector('[data-shared-factor]')?.closest('section')?.before(panel);}
 panel.innerHTML=`<strong>Bảng hệ số: ${FormulaCatalogLocks.rows?state:'Đang kiểm tra…'}</strong><p>${dirty?'Có thay đổi chưa lưu: lưu danh mục chung trước khi khóa.':'Khóa áp dụng toàn bộ bảng hệ số và phạm vi công việc.'}${lock?.at?' · Cập nhật khóa: '+esc(lock.actorName||'')+' ? '+esc(TPDisplay.date(lock.at,true)):''}</p><div class="actions">${Team.permissions.formulaUnlock&&lock?`<button class="button" type="button" data-formula-lock="calculationFactors:all" data-version="${lock.version}" data-locked="${lock.locked?0:1}" ${dirty?'disabled':''}>${lock.locked?'Mở khóa hệ số':'Khóa hệ số'}</button>`:''}${!lock?.locked?'<button class="button" type="button" data-policy-edit="customer">Khai loại khách hàng</button><button class="button" type="button" data-policy-edit="production">Khai cấp độ sản xuất C1–C8</button>':''}</div>`;
 }
 for(const row of document.querySelectorAll('[data-rc-definition]')){
  const key=row.dataset.rcDefinition,source=key.startsWith('source:'),lockKey=source?'rules:'+key.slice(7):'shapeDefinitions:'+key;
  const locked=FormulaCatalogLocks.rows===null||FormulaCatalogLocks.rows.some(r=>r.key===lockKey&&r.locked),editable=Team.permissions.formulaEdit&&Team.permissions.sections?.includes('catalogRules')&&!locked;
  const small=row.querySelector('.rc-detail-title strong+small');if(small&&!source)small.hidden=true;
  const actions=row.querySelector('.rc-row-actions');if(!actions)continue;
  for(const b of actions.querySelectorAll('[data-definition="shape-edit"],[data-rc="declare-rule"]'))b.hidden=!editable;
  const summary=actions.querySelector('[data-rc=summary]');if(summary)summary.textContent=locked?'Xem công thức':'Công thức tổng hợp';
  let remove=actions.querySelector('[data-formula-remove]');if(!remove){remove=document.createElement('button');remove.type='button';remove.className='button small';remove.textContent='Xóa';remove.dataset.formulaRemove=key;actions.append(remove);}remove.hidden=!editable;
  let badge=actions.querySelector('[data-formula-state]');if(!badge){badge=document.createElement('span');badge.dataset.formulaState='';badge.className='help-text';actions.prepend(badge);}badge.textContent=locked?(FormulaCatalogLocks.rows?'Đã khóa':'Đang kiểm tra khóa…'):'';
 }
 const factorsLocked=FormulaCatalogLocks.rows===null||FormulaCatalogLocks.rows.some(r=>r.key==='calculationFactors:all'&&r.locked);for(const b of document.querySelectorAll('[data-rc="factor-edit"],[data-rc="factor-remove"]'))b.hidden=factorsLocked;
 for(const b of document.querySelectorAll('[data-action="edit-rule"]'))b.hidden=FormulaCatalogLocks.rows===null||FormulaCatalogLocks.rows.some(r=>r.key==='rules:'+b.dataset.id&&r.locked);
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('[data-formula-remove]');if(!b)return;
 try{
 const key=b.dataset.formulaRemove,source=key.startsWith('source:'),id=source?key.slice(7):key,kind=source?'rules':'shapeDefinitions';
 const check=async()=>{const rows=await formulaRefreshLocks();if(rows.some(r=>r.key===kind+':'+id&&r.locked))throw Error('Công thức đã khóa. Admin cần mở khóa trước khi xóa.');if(!Team.permissions.formulaEdit||!Team.permissions.sections?.includes('catalogRules'))throw Error('Chưa có quyền sửa danh mục công thức');
 const used=(source&&(db.shapeDefinitions||[]).some(d=>d.sourceRuleId===id))||(db.materials||[]).some(m=>source?m.rule===id||m.shapeDefinition?.sourceRuleId===id:m.shapeDefinition?.id===id)||(C.flatten([...(db.quote.products||[]),...(db.library||[])])).some(n=>source?n.rule===id||n.ruleSpec?.id===id||n.spec?.shapeDefinition?.sourceRuleId===id:n.spec?.shapeDefinition?.id===id);
 if(used)throw Error('Công thức đang được sử dụng. Kiểm tra nơi dùng trước khi xóa.');};
 await check();const item=db[kind]?.find(d=>d.id===id);if(!item)return;
 teamDialog('Xóa công thức',`<p>Xóa <strong>${esc(item.name)}</strong> khỏi danh mục đang làm?</p><p>Lưu danh mục chung để cập nhật lên máy chủ.</p>`,'Xóa',async()=>{await check();mutation(()=>{db[kind]=db[kind].filter(d=>d.id!==id);},{preserveQuote:true});closeDialog();render();});
 }catch(err){inError(err);}
});
// Server leases are per editor, including separate tabs of the same account.
function installFormulaEditLeases(){
 const held=new Map();let active=null;const snapshot=()=>JSON.stringify(cdSnapshot());
 const release=async key=>{const lease=held.get(key);if(!lease)return;held.delete(key);try{await teamApi('formulas/edit','POST',{action:'release',key,token:lease.token});}catch{}};
 const api=teamApi;teamApi=async(route,method='GET',data)=>{const saving=route==='catalog'&&method==='PUT';if(saving){for(const lease of held.values())if(lease.expires<=Date.now()||lease.lost)throw Error('Khóa sửa đã hết hạn. Giữ bản nháp, mở lại công thức và đối chiếu trước khi lưu.');data={...data,editTokens:Object.fromEntries([...held].map(([key,value])=>[key,value.token]))};}const result=await api(route,method,data);if(saving){await Promise.all([...held.keys()].map(release));active=null;}return result;};
 const protect=(fn,keyOf)=>async(...args)=>{if(!Team.user||!Team.permissions?.catalog||!(Team.permissions?.formulaEdit||Team.permissions?.factors))return fn(...args);const key=keyOf(...args);if(!key)return fn(...args);try{let lease=held.get(key);if(!lease||lease.lost||lease.expires<=Date.now()){lease=await teamApi('formulas/edit','POST',{action:'acquire',key,token:lease?.token});held.set(key,lease);}active={key,before:snapshot()};await fn(...args);if($('#dialog').open)$('#dialog-form').insertAdjacentHTML('afterbegin','<p class="notice" data-edit-lease>Đang giữ quyền sửa mục này. Lưu danh mục lên máy chủ để hoàn tất và nhả khóa.</p>');}catch(error){await fn(...args);if($('#dialog').open){$('#dialog-form').querySelectorAll('input,select,textarea,button[type=submit]').forEach(el=>el.disabled=true);$('#dialog-form').insertAdjacentHTML('afterbegin','<p class="notice warning">'+esc(error.message)+'</p>');}else toast(error.message);}};
 dfShapeEdit=protect(dfShapeEdit,(id,working)=>working?.sourceRuleId?'rules:'+working.sourceRuleId:id?'shapeDefinitions:'+id:null);
 editRule=protect(editRule,id=>id?'rules:'+id:null);
 rcFactorEdit=protect(rcFactorEdit,(rate,id)=>{const f=fmResolve(rate,id);return f?'factor:'+f.id:'factors:all';});
 rcFactorRemove=protect(rcFactorRemove,(rate,id)=>{const f=fmResolve(rate,id);return f?'factor:'+f.id:'factors:all';});
 fmMatrix=protect(fmMatrix,()=> 'factors:all');
 const close=closeDialog;closeDialog=()=>{const current=active;active=null;close();if(current&&snapshot()===current.before)release(current.key);};
 actions.close=closeDialog;$('#dialog').addEventListener('cancel',e=>{if(active){e.preventDefault();closeDialog();}});
 const session=teamSession;teamSession=value=>{if(!value.user||value.user.id!==Team.user?.id){held.clear();active=null;}return session(value);};
 const mutate=mutation;mutation=(action,options={})=>mutate(()=>{const before=snapshot();action();if(before!==snapshot()&&[...held.values()].some(l=>l.lost||l.expires<=Date.now()))throw Error('Đã mất khóa sửa. Giữ nội dung đang nhập và mở lại để đối chiếu.');},options);
 setInterval(()=>{for(const [key,lease]of held){if(lease.lost)continue;teamApi('formulas/edit','POST',{action:'renew',key,token:lease.token}).then(next=>{if(held.get(key)===lease)held.set(key,next);}).catch(()=>{lease.lost=true;const note=$('[data-edit-lease]');if(note)note.textContent='Đã mất kết nối hoặc khóa sửa. Nội dung đang nhập vẫn giữ; chưa thể lưu. Mở lại để đối chiếu.';});}},30000);
}
