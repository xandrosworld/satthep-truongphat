'use strict';
const technicalTabs=['intake','bom','operations','waste','mass'];
function technicalStage(){return page==='quote'&&technicalTabs.includes(tab);}
function technicalOnly(){return !!Team.user&&!!Team.permissions?.technical;}
function technicalCatalogPage(){return technicalOnly()&&['materials','library','rules'].includes(page)&&(Team.permissions.sections.includes({materials:'catalogMaterials',library:'catalogLibrary',rules:'catalogRules'}[page])||page==='rules'&&Team.permissions.sections.includes('catalogTechnicalOperations'));}
function technicalCatalogClean(root){
 if(!technicalOnly()||!root)return;
 if(!Team.permissions.sections.includes('catalogRules'))root.querySelectorAll('[data-rc-tab]:not([data-rc-tab=operations]),[data-pg-add],[data-close-gap]').forEach(x=>x.hidden=true);
 for(const table of root.querySelectorAll('table')){const headers=[...table.querySelectorAll('thead tr:first-child th')];headers.forEach((h,i)=>{if(/đơn giá|giá tham chiếu|thành tiền|chi phí/i.test(h.textContent))for(const row of table.rows)if(row.cells[i])row.cells[i].hidden=true;});}
 for(const input of root.querySelectorAll('[name=price]')){input.value='0';input.closest('label').hidden=true;}
 root.querySelectorAll('[data-rc-tab=factors],[data-rc-tab=transport],[data-rc-tab=customers],[data-rc-tab=complexity],[data-close-gap=catalog-candidates],[data-team=backup]').forEach(x=>x.hidden=true);
}
function technicalIntakeAccess(root){
 if(!technicalOnly()||tab!=='intake')return;
 const writable=Team.permissions.edit&&teamCurrent()?.status==='draft'&&!teamCurrent()?.readOnly,customer=writable&&Team.permissions.sections.includes('customer'),bom=writable&&Team.permissions.sections.includes('bom');
 root.querySelectorAll('[data-intake="choose-customer"],[data-intake="customer-choose"]').forEach(el=>el.remove());
 if(!customer){root.querySelectorAll('[data-intake="request"],[data-intake="request-item"],[data-intake="paste-request"],[data-intake="attach"],[data-intake="document-link"],[data-intake="document-link-remove"],[data-batch-one="request-details"]').forEach(el=>el.remove());root.insertAdjacentHTML('afterbegin','<div class="notice">Xem yêu cầu và tải tài liệu để bóc tách. Quyền sửa dữ liệu đầu vào được cấp riêng.</div>');}
 if(!bom)root.querySelectorAll('[data-intake="request-products"]').forEach(el=>el.remove());
}
function technicalPermissionFields(){const role=$('#dialog [data-access-role]');if(!role)return;for(const input of document.querySelectorAll('#dialog [name=sections],#dialog [name=canViewCosts],#dialog [name=canApprove],#dialog [name=canEditFactors],#dialog [name=canApproveBelowCost]'))input.disabled=false;}
function technicalOperation(id,index){
 inWritable();if(Team.loaded&&!Team.permissions?.sections?.includes('operations'))throw Error('Cần quyền Công đoạn & định mức');
 const n=C.findNode(db.quote.products,id),op=n?.ops?.[index],rate=db.quote.ratesSnapshot.find(r=>r.id===op?.id);if(!rate)return;
 const group=TPWork.nodeGroup(db.quote.products,id),source=technicalOnly()?rate:TPTechnical.complexityRate(rate,db),levels=TPTechnical.complexityLevels(source).filter(x=>(!x.groups.length||x.groups.includes(group))&&(!x.rateGroups.length||x.rateGroups.includes(group))),current=TPTechnical.choiceFor(op),selected=levels.findIndex(x=>x.factorId===current?.factorId&&x.label===current?.label),quantity=op.quantityDeclared||op.basisMode&&op.basisMode!=='auto'||(op.amount??1)!==1,unit=result.nodes[id]?.ownOps[index]?.unit||rate[op.mode+'Unit']||rate.unit,physical=['kg','tấn','m²','m³'].includes(unit);
 openDialog('Khai báo công đoạn · '+esc(rate.name),`<p>${esc(n.name)}. Chỉ bật những nội dung cần khai cho công việc này.</p>
 <section class="op-declaration"><label class="pa-checkbox"><input type="checkbox" name="declareQuantity" ${quantity?'checked':''}> ${physical?'Khai lượng thực hiện riêng':'Khai số lần / định mức'}</label><div data-op-section="declareQuantity">${select('Cách khai lượng','basisMode',[...(!physical?[['auto','Theo một đơn vị ở dòng này']]:[]),['manual_total','Tổng lượng thực hiện'],['manual_unit','Định mức cho một đơn vị']],physical&&(!op.basisMode||op.basisMode==='auto')?'manual_unit':op.basisMode||'auto')}${field(physical?'Lượng thực hiện ('+unit+')':'Số lần / lượng ('+unit+')','quantity',op.basisMode&&op.basisMode!=='auto'?op.workQuantity??'':op.amount??1,'number','min="0" step="any" required')}<p class="help-text">Đơn vị đang dùng: ${esc(unit)}.${physical?' Khối lượng / diện tích tự tính theo cấu thành; chọn tổng lượng hoặc định mức để nhập riêng.':''}</p></div></section>
 <section class="op-declaration"><label class="pa-checkbox"><input type="checkbox" name="declareComplexity" ${current?'checked':''}> Đánh giá mức độ phức tạp</label><div data-op-section="declareComplexity">${select('Mức độ đã khai trong danh mục','complexityLevel',[['','Chọn mức độ'],...(current&&selected<0?[['saved',current.label+' · đã lưu']]:[]),...levels.map((x,i)=>[String(i),x.label])],selected>=0?String(selected):current?'saved':'')}${!levels.length?'<p class="help-text">Chưa có mức độ phù hợp trong danh mục. Người quản lý cần kiểm tra bảng dùng chung hoặc bảng riêng của nguyên công.</p>':''}</div></section>
 <details class="op-declaration" ${op.mode==='outside'||op.afterPackage||op.measurementConfirmed||op.suppliesIncluded===false?'open':''}><summary>Nơi thực hiện & khai báo thêm</summary>${select('Nơi thực hiện','mode',[['inside','Tại xưởng'],['outside','Thuê ngoài']],op.mode)}${technicalMeasurementHelp(n,index)}${TPWork.recipes(rate).length?'<label class="pa-checkbox"><input name="measurementConfirmed" type="checkbox" '+(op.measurementConfirmed?'checked':'')+'> Xác nhận lượng hoàn thiện theo cấu thành</label>':''}<label class="pa-checkbox"><input name="afterPackage" type="checkbox" ${op.afterPackage?'checked':''}> Thực hiện sau khi nhận gói thuê</label><div data-op-outside><label class="pa-checkbox"><input name="suppliesIncluded" type="checkbox" ${op.suppliesIncluded!==false?'checked':''}> Bên gia công cấp vật tư hoàn thiện</label></div></details>`,'Lưu khai báo',f=>{
  const useQuantity=f.has('declareQuantity'),basisMode=useQuantity?f.get('basisMode'):'auto',value=Number(f.get('quantity'));if(useQuantity&&(f.get('quantity')===''||!Number.isFinite(value)||value<0))throw Error('Nhập lượng thực hiện không âm');if(useQuantity&&physical&&basisMode==='auto')throw Error('Chọn tổng lượng hoặc định mức để khai lượng thực hiện riêng');
  const key=f.get('complexityLevel'),keep=f.has('declareComplexity')&&key==='saved',choice=f.has('declareComplexity')&&!keep?levels[Number(key)]:null;if(f.has('declareComplexity')&&!keep&&(key===''||!choice))throw Error('Chọn mức độ có trong danh mục');
  saveAndClose(()=>{Object.assign(op,{mode:f.get('mode'),basisMode,afterPackage:f.has('afterPackage')});if(TPWork.recipes(rate).length)op.measurementConfirmed=f.has('measurementConfirmed');if(op.mode==='outside')op.suppliesIncluded=f.has('suppliesIncluded');if(useQuantity){op.quantityDeclared=true;if(basisMode==='auto'){op.amount=value;delete op.workQuantity;}else op.workQuantity=value;}else{delete op.quantityDeclared;op.amount=1;delete op.workQuantity;}
   if(!keep){if(choice){const ref={factorId:choice.factorId,label:choice.label};op.complexityChoice=ref;if(!technicalOnly()&&!TPSectionAccess.equal(current,ref))op.complexity=TPTechnical.resolveComplexity(source,ref,group);}else{delete op.complexityChoice;delete op.complexity;}}
  },'Đã lưu khai báo công đoạn');
 });
 const form=$('#dialog-form'),paint=()=>{for(const section of form.querySelectorAll('[data-op-section]')){const enabled=form.elements[section.dataset.opSection].checked;section.hidden=!enabled;section.querySelectorAll('input,select').forEach(x=>x.disabled=!enabled);}form.querySelector('[data-op-outside]').hidden=form.elements.mode.value!=='outside';};form.addEventListener('change',paint);paint();
}

function technicalMeasurementHelp(n,index){
 const r=result.nodes[n.id],op=n.ops[index],rate=db.quote.ratesSnapshot.find(x=>x.id===op.id),recipes=TPWork.recipes(rate),error=r?.ownOps?.[index]?.error;
 if(!recipes.length)return '';
 return `<section class="panel panel-body" data-measurement-help><h3>Lượng dùng cho vật tư hoàn thiện</h3><p>${error?esc(error):'Kiểm tra lượng thực hiện trước khi xác nhận.'}</p><p>Theo cấu thành / công thức hiện tại: <strong>${num(r?.workWeight??r?.weight,4)} kg · ${num(r?.workArea??r?.area,4)} m²</strong>, đã nhân số lượng.</p><p>Định mức ${esc(rate.name)} dùng: <strong>${esc([...new Set(recipes.map(x=>x.basis))].join(', '))}</strong>. Nếu chỉ sơn một phần hoặc một mặt, nhập lượng thực tế đúng đơn vị hoặc khai Công thức KL/DT. Chỉ tích xác nhận bên dưới khi lượng theo cấu thành đúng với phạm vi hoàn thiện.</p></section>`;
}
function technicalMeasurementWarnings(root){
 if(root.id!=='content')return;root.querySelector('[data-measurement-warnings]')?.remove();if(tab!=='operations')return;
 const rows=C.flatten(db.quote.products).flatMap(n=>(result.nodes[n.id]?.ownOps||[]).map((r,index)=>({n,r,index}))).filter(x=>x.r.error?.includes('Chưa xác nhận lượng hoàn thiện'));
 if(!rows.length)return;
 root.insertAdjacentHTML('afterbegin',`<section class="panel panel-body" data-measurement-warnings><h3>Cần xác nhận phạm vi hoàn thiện</h3><p>Đã có lượng cấu thành nhưng chưa xác nhận lượng dùng cho định mức hoàn thiện. Bổ sung tại từng công việc để tính đủ vật tư.</p>${rows.map(({n,r,index})=>`<p><strong>${esc(n.name)} · ${esc(db.quote.ratesSnapshot.find(x=>x.id===n.ops[index].id)?.name)}</strong> ${paButton('Kiểm tra lượng hoàn thiện','op-detail',`data-id="${esc(n.id)}" data-index="${index}"`,'small')}</p>`).join('')}</section>`);
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
 technicalMeasurementWarnings(root);
 root.querySelectorAll('.quote-metrics,.quick-summary,.quick-total,.product-price,.remnant-price-note,[data-pa="node-costs"],[data-pa="quote-rates"],[data-close-gap="source-table"],[data-mfg="breakdown"],[data-mfg="package"],[data-action="preview"],[data-action="quote-info"],[data-pa="edit-rate"]').forEach(x=>x.remove());
 root.querySelectorAll('[data-unit-sell],[data-quick-grand]').forEach(x=>x.parentElement.remove());
 root.querySelectorAll('.node-summary > div').forEach(x=>{if(/Giá|Chi phí/.test(x.textContent))x.remove();});
 root.querySelectorAll('.spec-strip > .mono,.review-op-method,[data-review="operation"]').forEach(x=>x.remove());
 for(const table of root.querySelectorAll('table')){
  const heads=[...table.querySelectorAll('thead tr:first-child > th')],remove=[];
  heads.forEach((h,i)=>{if(/^(Giá đã chọn|Tiền tính thêm|Thành tiền|Đơn giá|Tiền vật tư|Chi phí|Giá trị|Giá vật tư)/.test(h.textContent.trim()))remove.push(i);});
  for(const row of table.rows)for(const index of [...remove].reverse())row.children[index]?.remove();
 }
 for(const p of root.querySelectorAll('[data-b2-purchase]'))p.innerHTML=p.innerHTML.replace(/ · [^·<>]+ đ$/, '');
 for(const button of root.querySelectorAll('[data-pa="op-detail"]:not(.pa-op-quantity)')){const n=C.findNode(db.quote.products,button.dataset.id),r=result.nodes[n?.id]?.ownOps?.[Number(button.dataset.index)];button.innerHTML=`Lượng công việc<small>${num(r?.basis,4)} ${esc(r?.unit||'')} · xem / sửa</small>`;}
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
 document.addEventListener('click',e=>{const b=e.target.closest('[data-technical-operation]');if(b){e.preventDefault();try{technicalOperation(b.dataset.id,Number(b.dataset.index));}catch(error){toast(error.message);}}});
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
   if(page==='rules'&&!Team.permissions.sections.includes('catalogRules'))RulesCatalog.kind='operations';
   if(page==='rules'&&['factors','transport','customers','complexity'].includes(RulesCatalog.kind))RulesCatalog.kind='productGroups';
  }
  oldRender();if(technicalStage())technicalClean($('#content'));technicalIntakeAccess($('#content'));
  document.querySelectorAll('#sidebar [data-page]').forEach(el=>el.hidden=technicalOnly()&&el.dataset.page!=='quote'&&!(Team.permissions.sections.includes({materials:'catalogMaterials',library:'catalogLibrary',rules:'catalogRules'}[el.dataset.page])||el.dataset.page==='rules'&&Team.permissions.sections.includes('catalogTechnicalOperations')));
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
