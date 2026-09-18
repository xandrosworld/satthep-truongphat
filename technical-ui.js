'use strict';
const technicalTabs=['bom','operations','waste','mass'];
function technicalStage(){return page==='quote'&&technicalTabs.includes(tab);}
function technicalOnly(){return !!Team.user&&!!Team.permissions?.technical;}
function technicalCatalogPage(){return technicalOnly()&&['materials','library','rules'].includes(page)&&Team.permissions.sections.includes({materials:'catalogMaterials',library:'catalogLibrary',rules:'catalogRules'}[page]);}
function technicalCatalogClean(root){
 if(!technicalOnly()||!root)return;
 for(const table of root.querySelectorAll('table')){const headers=[...table.querySelectorAll('thead tr:first-child th')];headers.forEach((h,i)=>{if(/đơn giá|giá tham chiếu|thành tiền|chi phí/i.test(h.textContent))for(const row of table.rows)if(row.cells[i])row.cells[i].hidden=true;});}
 for(const input of root.querySelectorAll('[name=price]')){input.value='0';input.closest('label').hidden=true;}
 root.querySelectorAll('[data-rc-tab=factors],[data-rc-tab=operations],[data-rc-tab=customers],[data-rc-tab=complexity],[data-close-gap=catalog-candidates],[data-team=backup]').forEach(x=>x.hidden=true);
}
function technicalPermissionFields(){const role=$('#dialog [data-access-role]');if(!role)return;for(const input of document.querySelectorAll('#dialog [name=sections],#dialog [name=canViewCosts],#dialog [name=canApprove],#dialog [name=canEditFactors],#dialog [name=canApproveBelowCost]'))input.disabled=false;}
function technicalOperation(id,index){
 const n=C.findNode(db.quote.products,id),op=n?.ops?.[index],rate=db.quote.ratesSnapshot.find(r=>r.id===op?.id);if(!rate)return;
 openDialog('Lượng công việc · '+esc(rate.name),`<p>${esc(n.name)}. Đơn vị công việc: ${esc(result.nodes[id]?.ownOps[index]?.unit||rate[op.mode+'Unit']||rate.unit)}.</p><div class="form-grid">${select('Nơi thực hiện','mode',[['inside','Tại xưởng'],['outside','Thuê ngoài']],op.mode)}${select('Lấy lượng công việc','basisMode',[['auto','Tự lấy theo dòng'],['manual_total','Nhập tổng lượng'],['manual_unit','Định mức cho một đơn vị']],op.basisMode||'auto')}${field('Lượng thực hiện riêng','workQuantity',op.workQuantity??'','number','min="0" step="any"')}${field('Định mức lần / mét / bộ trên một đơn vị','amount',op.amount??1,'number','min="0" step="any" required')}</div><label class="pa-checkbox"><input name="measurementConfirmed" type="checkbox" ${op.measurementConfirmed?'checked':''}> Xác nhận lượng hoàn thiện theo cấu thành</label><label class="pa-checkbox"><input name="afterPackage" type="checkbox" ${op.afterPackage?'checked':''}> Thực hiện sau khi nhận gói thuê</label><label class="pa-checkbox"><input name="suppliesIncluded" type="checkbox" ${op.suppliesIncluded!==false?'checked':''}> Bên gia công cấp vật tư hoàn thiện</label>`,'Lưu lượng công việc',f=>{
  const basisMode=f.get('basisMode'),quantity=f.get('workQuantity');if(basisMode!=='auto'&&(quantity===''||!Number.isFinite(Number(quantity))||Number(quantity)<0))throw Error('Nhập lượng thực hiện không âm');
  saveAndClose(()=>{Object.assign(op,{mode:f.get('mode'),basisMode,amount:Number(f.get('amount')),measurementConfirmed:f.has('measurementConfirmed'),afterPackage:f.has('afterPackage'),suppliesIncluded:f.has('suppliesIncluded')});if(quantity!=='')op.workQuantity=Number(quantity);});
 });
}
function technicalRecipes(id,index){const n=C.findNode(db.quote.products,id),rate=db.quote.ratesSnapshot.find(r=>r.id===n?.ops?.[index]?.id);if(!rate)return;
 const recipes=TPWork.recipes(rate);
 openDialog('Vật tư định mức · '+esc(rate.name),`<p>Lượng vật tư = lượng thực hiện × định mức × số lớp × (1 + hao hụt / 100). Áp dụng cho mọi dòng dùng công đoạn này trong báo giá.</p>${recipes.map((r,i)=>`<section class="panel panel-body"><strong>${esc(r.spec?.id)} · ${esc(r.spec?.name)}</strong><div class="form-grid">${field('Định mức ('+r.spec?.unit+'/'+r.basis+')','norm-'+i,r.norm,'number','min="0" step="any" required')}${field('Số lớp','layers-'+i,r.layers??1,'number','min="0.001" step="any" required')}${field('Hao hụt (%)','loss-'+i,r.loss??0,'number','min="0" step="any" required')}</div></section>`).join('')}`,'Lưu định mức',f=>saveAndClose(()=>{const targets=rate.consumptions?.length?rate.consumptions:[rate.consumption];targets.forEach((r,i)=>{for(const key of ['norm','layers','loss'])r[key]=Number(f.get(key+'-'+i));});}));
}
function technicalSelectOperation(){
 const rates=(technicalOnly()?db.quote.ratesSnapshot:db.rates).filter(r=>r.enabled!==false&&r.operationType!=='package');
 openDialog('Chọn công đoạn',`${select('Công đoạn','operationId',rates.map(r=>[r.id,r.name]),rates[0]?.id)}<p>Chọn công đoạn rồi tích vào dòng thực hiện. Đơn giá được quản lý tại bước 6 — Giá & hệ số.</p>`,'Thêm công đoạn',f=>{const rate=rates.find(r=>r.id===f.get('operationId'));if(!rate)throw Error('Chọn công đoạn');saveAndClose(()=>{if(!db.quote.ratesSnapshot.some(r=>r.id===rate.id))db.quote.ratesSnapshot.push(C.copy(rate));});});
}
function technicalClean(root){
 root.querySelectorAll('.quote-metrics,.quick-summary,.quick-total,.product-price,.remnant-price-note,[data-pa="node-costs"],[data-pa="quote-rates"],[data-close-gap="source-table"],[data-mfg="breakdown"],[data-mfg="package"],[data-action="preview"],[data-action="quote-info"],[data-pa="edit-rate"]').forEach(x=>x.remove());
 root.querySelectorAll('[data-unit-sell],[data-quick-grand]').forEach(x=>x.parentElement.remove());
 root.querySelectorAll('.node-summary > div').forEach(x=>{if(/Giá|Chi phí/.test(x.textContent))x.remove();});
 root.querySelectorAll('.spec-strip > .mono,.review-op-method,.review-complexity,[data-review="operation"]').forEach(x=>x.remove());
 for(const table of root.querySelectorAll('table')){
  const heads=[...table.querySelectorAll('thead tr:first-child > th')],remove=[];
  heads.forEach((h,i)=>{if(/^(Giá đã chọn|Tiền tính thêm|Thành tiền|Đơn giá|Tiền vật tư|Chi phí|Giá trị|Giá vật tư)/.test(h.textContent.trim()))remove.push(i);});
  for(const row of table.rows)for(const index of [...remove].reverse())row.children[index]?.remove();
 }
 for(const p of root.querySelectorAll('[data-b2-purchase]'))p.innerHTML=p.innerHTML.replace(/ · [^·<>]+ đ$/, '');
 for(const button of root.querySelectorAll('[data-pa="op-detail"]')){const n=C.findNode(db.quote.products,button.dataset.id),r=result.nodes[n?.id]?.ownOps?.[Number(button.dataset.index)];button.innerHTML=`Lượng công việc<small>${num(r?.basis,4)} ${esc(r?.unit||'')} · xem / sửa</small>`;}
 root.querySelectorAll('.mfg-summary .subtext').forEach(x=>x.remove());
}
function tmcFreightNotice(){
 if(!result.comparisonIds?.includes('tmc'))return '';
 const alternative=result.alternatives.tmc,expenses=(db.quote.expenses||[]).filter(e=>e.category==='incoming'),legacy=Number(db.quote.pricing.incoming)||C.flatten(db.quote.products).some(n=>Number(n.freightIn));
 const configured=!!(expenses.length||legacy),invalid=result.logistics?.items.some(e=>e.category==='incoming'&&e.error),amount=alternative.total.parts.incoming;
 const status=invalid?'Khoản vận chuyển nhập cần kiểm tra':!configured?'Chưa khai phí vận chuyển phôi':!alternative.ready?'Đã khai phí; phương án TMC chưa đủ dữ liệu':'Đã tính trong giá TMC';
 return `<section class="notice ${!configured||invalid?'warning':''}" data-tmc-freight><strong>${esc(paNames.incoming)}: ${invalid?'Chưa tính đủ':money(amount)+' đ'}</strong><span>${status}. ${configured?'Khoản này nằm trong chi phí sản xuất; không cộng thêm lần nữa vào giá chào.':'Chọn TMC không tự sinh phí vận chuyển. Khai khoản phí thực tế tại Giá & hệ số → Vận chuyển / lắp đặt.'}</span>${btn('Mở vận chuyển / lắp đặt','tmc-freight')}</section>`;
}
function installTechnicalUI(){
 const oldDetail=paOperationDetail;paOperationDetail=(id,index)=>technicalStage()?technicalOperation(id,index):oldDetail(id,index);
 const oldOperation=workOperationDetail;workOperationDetail=(id,index)=>technicalStage()?technicalOperation(id,index):oldOperation(id,index);
 const oldRecipes=qocRecipeDetails;qocRecipeDetails=(id,index)=>technicalStage()?technicalRecipes(id,index):oldRecipes(id,index);
 const oldSelect=qocSelectOperation;qocSelectOperation=()=>technicalStage()?technicalSelectOperation():oldSelect();
 const oldOperationPrices=inOperationPrices;inOperationPrices=()=>oldOperationPrices()+mfgSummary()+`<section class="panel panel-body"><h3>Khoản chi riêng theo cấu thành</h3><p>Khai giá gói thuê ở bảng trên; vận chuyển và lắp đặt riêng của từng dòng ở đây.</p>${C.flatten(db.quote.products).map(n=>paButton(esc(n.name),'node-costs',`data-id="${esc(n.id)}"`,'small')).join(' ')}</section>`;
 const oldPricing=renderCostAnalysis;renderCostAnalysis=()=>tmcFreightNotice()+oldPricing();
 actions['tmc-freight']=()=>{tab='prices';Intake.priceTab='logistics';render();};
 const oldDocument=teamDocument;teamDocument=()=>technicalOnly()?(technicalCatalogPage()?{...TPTechnical.projectCatalog(oldDocument()),quote:TPTechnical.project(oldDocument()).quote}:TPTechnical.project(oldDocument())):oldDocument();
 const oldList=teamList;teamList=async()=>{if(!technicalOnly())return oldList();const list=await teamApi('quotes');openDialog('Báo giá · dữ liệu kỹ thuật',`<div class="actions">${teamButton('Đổi mật khẩu','own-password')}${teamButton('Đăng xuất','logout')}</div><table><thead><tr><th>Mã báo giá</th><th>Trạng thái</th><th>Phiên bản</th><th></th></tr></thead><tbody>${list.map(q=>`<tr><td>${esc(q.code)}</td><td>${esc(q.status)}</td><td>${q.version}</td><td>${teamButton('Mở','open',`data-id="${q.id}"`)}</td></tr>`).join('')}</tbody></table>`);};
 const oldSession=teamSession;teamSession=value=>{if(value.permissions?.technical){db=TPTechnical.project(TPPrice.demoSeed());result=C.calculate(db);Team.local=null;Team.loaded=false;Team.link=null;Team.dirty=false;UX.undo=[];UX.redo=[];}oldSession(value);};
 const oldRender=render;render=()=>{
  if(technicalOnly()){
   $('#save-status').textContent='Máy chủ · dữ liệu kỹ thuật';
   if(!Team.loaded){$('#content').innerHTML=workspaceHome();workspaceHomeMount();return;}
   if(!technicalCatalogPage())page='quote';if(!technicalTabs.includes(tab))tab='operations';
   if(page==='rules'&&['factors','operations','customers','complexity'].includes(RulesCatalog.kind))RulesCatalog.kind='productGroups';
  }
  oldRender();if(technicalStage())technicalClean($('#content'));
  document.querySelectorAll('#sidebar [data-page]').forEach(el=>el.hidden=technicalOnly()&&el.dataset.page!=='quote'&&!Team.permissions.sections.includes({materials:'catalogMaterials',library:'catalogLibrary',rules:'catalogRules'}[el.dataset.page]));
  if(technicalCatalogPage()){technicalCatalogClean($('#content'));$('#save-status').textContent='Danh mục kỹ thuật trên máy chủ';if(!Team.link)$('#content').querySelectorAll('[data-team=reopen]').forEach(x=>x.remove());$('#content').insertAdjacentHTML('afterbegin',`<div class="notice" data-technical-catalog>Danh mục kỹ thuật · không xem hoặc sửa giá, hệ số. ${teamButton('Lấy danh mục máy chủ','catalog-workspace')}${accessButton('Lưu / phát hành danh mục','catalog')}</div>`);}
  if(technicalOnly()){$('#content').querySelectorAll('[data-tab="prices"],[data-tab="pricing"],[data-tab="preview"],[data-action="history"],[data-pa="sample"],[data-team="submit"],[data-team="leave"],[data-batch-one="new-shared"]').forEach(x=>x.remove());const ribbon=$('.quote-ribbon > span');if(ribbon)ribbon.textContent='Ngày '+db.quote.date;}
 };
 const oldQuick=refreshQuickUI;refreshQuickUI=()=>{oldQuick();if(technicalStage())technicalClean($('#content'));};
 const oldDialog=openDialog;openDialog=(...args)=>{const value=oldDialog(...args);if(technicalStage())technicalClean($('#dialog'));if(technicalCatalogPage())technicalCatalogClean($('#dialog'));technicalPermissionFields();return value;};
 document.addEventListener('change',e=>{if(e.target.hasAttribute('data-access-role')){technicalPermissionFields();if(e.target.value==='technical')document.querySelectorAll('#dialog [name=sections]').forEach(x=>x.checked=['customer','bom','operations'].includes(x.value));}});
 // Capture before legacy handlers: cost editors are reached only from step 6.
 document.addEventListener('click',e=>{const el=e.target.closest('[data-pa],[data-mfg],[data-close-gap],[data-ux],[data-action]');if(!el||!technicalStage())return;
  const priceAction=['node-costs','quote-rates','edit-rate','policy','tmc','product-inputs'].includes(el.dataset.pa)||['package','breakdown','policy'].includes(el.dataset.mfg)||['source-table','source-export'].includes(el.dataset.closeGap)||['price-ops'].includes(el.dataset.ux);
  if(priceAction){e.preventDefault();e.stopImmediatePropagation();if(technicalOnly())toast('Tài khoản kỹ thuật không được xem giá');else{closeDialog();tab='prices';Intake.priceTab='operations';render();}}
 },true);
}
