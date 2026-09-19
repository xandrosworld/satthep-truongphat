'use strict';
function sectionFields(user){const values=TPSectionAccess.sections(user);return `<fieldset class="section-permissions"><legend>Phần được phép sửa</legend><p class="help-text">Có quyền xem nội bộ thì xem được các phần của báo giá; chỉ sửa các phần được tích. Quản trị có toàn quyền. Tạo/trình báo giá là quyền riêng.</p>${Object.entries(TPSectionAccess.labels).map(([key,label])=>`<label class="pa-checkbox"><input type="checkbox" name="sections" value="${key}" ${values.includes(key)?'checked':''}> ${esc(label)}</label>`).join('')}</fieldset>`;}
function currentSection(){if(page==='rules'&&RulesCatalog.kind==='operations'&&Team.permissions?.sections?.includes('catalogTechnicalOperations'))return 'catalogTechnicalOperations';if(page==='rates')return ['transport','install'].includes(rateTab)?'catalogLogistics':rateTab==='materials'?'catalogMaterials':'catalogOperations';if(page!=='quote')return {customers:'customer',materials:'catalogMaterials',library:'catalogLibrary',rules:'catalogRules',rates:'catalogOperations'}[page];if(tab==='prices')return {materials:'materials',operations:'operations',devices:'logistics',logistics:'logistics',factors:'factors',alternatives:'commercial',competitor:'commercial',kg:'commercial'}[Intake.priceTab];return {intake:'customer',bom:'bom',operations:'operations',waste:'bom',mass:'bom',pricing:'commercial',preview:'commercial'}[tab];}
function installSectionAccessUI(){
 const fields=accessFields;accessFields=(user={role:'estimator'})=>fields(user)+sectionFields(user);
 const oldApi=teamApi;teamApi=async(route,method='GET',data)=>{if(method==='POST'&&(route==='users'||/^users\/[^/]+\/access$/.test(route))){const inputs=$('#dialog')?.querySelectorAll('input[name=sections]');if(inputs?.length&&data?.sections==null)data={...data,sections:[...inputs].filter(e=>e.checked).map(e=>e.value)};}return oldApi(route,method,data);};
 const oldRender=render;render=()=>{
  if(Team.requireLogin&&!Team.user){$('#content').innerHTML=heading('Đăng nhập làm việc','Báo giá, danh mục và lịch sử được lưu chung trên máy chủ.',teamButton('Đăng nhập','login','','primary'));$('#save-status').textContent='Chưa đăng nhập';return;}
  if(page==='customers'&&Team.user&&Team.permissions.costs){oldRender();$('#content').innerHTML=renderCustomers();$('#save-status').textContent='Danh bạ dùng chung trên máy chủ';return;}
  if(Team.requireLogin&&Team.user&&Team.permissions.costs&&(!Team.loaded||(!Team.link&&page==='quote'))){if(Team.loaded&&!Team.link&&page==='quote'){Team.loaded=false;Team.catalogVersion=null;}$('#content').innerHTML=workspaceHome();workspaceHomeMount();$('#save-status').textContent='Dữ liệu dùng chung trên máy chủ';return;}
  oldRender();if(!Team.user||!Team.permissions.costs)return;
  const rights=Team.permissions,scope=currentSection();
  if(Team.loaded&&scope&&!rights.sections.includes(scope)){
   $('#content').insertAdjacentHTML('afterbegin',`<div class="notice">Bạn đang xem phần <strong>${esc(TPSectionAccess.labels[scope])}</strong>. Tài khoản chưa được cấp quyền sửa phần này.</div>`);
   $('#content').querySelectorAll('input,select,textarea').forEach(el=>el.disabled=true);
  }
  if(!rights.reopen)document.querySelectorAll('[data-team="reopen"],[data-team="restore-version"]').forEach(el=>el.hidden=true);
  if(!rights.manage)document.querySelectorAll('[data-team="submit"],[data-team="order"],[data-access="new-document"]').forEach(el=>el.hidden=true);
  if(Team.loaded&&!Team.link&&Team.permissions.catalog)$('#content').insertAdjacentHTML('afterbegin',`<div class="notice">Danh mục đang làm việc · phiên bản ${Team.catalogVersion??'chưa lấy'}. ${accessButton('Lấy / phát hành danh mục','catalog')}</div>`);
  if(Team.requireLogin)document.querySelectorAll('[data-team="leave"]').forEach(el=>el.hidden=true);
 };
 const oldMutation=mutation;mutation=(action,options={})=>{
  if(Team.requireLogin&&!Team.user)return toast('Đăng nhập trước khi làm việc');
  if(!Team.user||!Team.loaded||Team.permissions.users)return oldMutation(action,options);
  const before=teamDocument(),wasDirty=Team.dirty;
  try{return oldMutation(()=>{action();const denied=TPSectionAccess.denied(before,teamDocument(),Team.permissions);if(denied.length)throw Error('Không được sửa: '+denied.map(k=>TPSectionAccess.labels[k]).join(', '));},options);}catch(e){Team.dirty=wasDirty;render();throw e;}
 };
 document.addEventListener('change',e=>{if(!e.target.hasAttribute('data-access-role'))return;const defaults=TPSectionAccess.sections({role:e.target.value});document.querySelectorAll('input[name=sections]').forEach(x=>{x.checked=defaults.includes(x.value);});});
 document.addEventListener('click',e=>{const btn=e.target.closest('[data-page]');if(!btn||!Team.requireLogin||!Team.user||!Team.permissions.catalog)return;const target=btn.dataset.page;if(!['materials','library','rates','rules'].includes(target))return;if(Team.loaded&&Team.link)return;if(Team.loaded&&!Team.link&&Team.dirty){page=target;render();return;}e.stopImmediatePropagation();toast('Đang tải danh mục…');teamApi('catalog').then(record=>{if(!Team.loaded)Team.local=C.copy(db);const seed=technicalOnly()?TPTechnical.project(TPPrice.demoSeed()):TPPrice.demoSeed();db={...seed,...C.copy(record.catalog),savedQuotes:[],history:[],quote:{...seed.quote,products:[],ratesSnapshot:C.copy(record.catalog.rates),pricing:C.copy(record.catalog.pricingDefaults),status:'draft'}};Team.loaded=true;Team.link=null;Team.dirty=false;Team.catalogVersion=record.version;page=target;render();}).catch(err=>toast(err.message));},true);
 document.addEventListener('click',e=>{const el=e.target.closest('[data-team]');if(!el)return;Promise.resolve().then(async()=>{
  if(el.dataset.team==='import-document')teamDialog('Nhập báo giá từ bản sao lưu',`<p>Đưa báo giá đang mở trong tệp JSON lên máy chủ thành bản nháp để rà lại. Không nhập lịch sử gửi hoặc các phiên bản cũ.</p><label class="field">Tệp sao lưu JSON<input type="file" name="document" accept=".json" required></label>`,'Nhập bản nháp',async f=>{const file=f.get('document');if(!file||file.size>2000000)throw Error('Chọn tệp JSON tối đa 2 MB');const document=JSON.parse(await file.text());const saved=await teamApi('quotes','POST',{document});await teamLoad(saved.id);});
  if(el.dataset.team==='catalog-workspace'){
   const record=await teamApi('catalog');if(!Team.loaded)Team.local=C.copy(db);const seed=technicalOnly()?TPTechnical.project(TPPrice.demoSeed()):TPPrice.demoSeed();db={...seed,...C.copy(record.catalog),savedQuotes:[],history:[],quote:{...seed.quote,products:[],ratesSnapshot:C.copy(record.catalog.rates),pricing:C.copy(record.catalog.pricingDefaults),status:'draft'}};Team.loaded=true;Team.link=null;Team.dirty=false;Team.catalogVersion=record.version;page=Team.permissions.sections.includes('catalogMaterials')?'materials':Team.permissions.sections.includes('catalogLibrary')?'library':Team.permissions.sections.some(k=>['catalogRules','catalogTechnicalOperations'].includes(k))?'rules':'rates';closeDialog();render();
  }
 }).catch(error=>toast(error.message));});
}
