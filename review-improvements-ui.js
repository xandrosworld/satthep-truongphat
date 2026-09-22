/* Approved report 2026-09-21: items 1–3 and 5–9. Item 4 stays in phase 2. */
'use strict';
const ReviewUI={open:new Map()};
function reviewDetails(label,key){const el=document.createElement('details');el.className='review-details';el.dataset.reviewKey=key;el.open=ReviewUI.open.get(key)===true;const summary=document.createElement('summary');summary.textContent=label;el.append(summary);el.addEventListener('toggle',()=>ReviewUI.open.set(key,el.open));return el;}
function reviewFold(nodes,label,key){nodes=nodes.filter(Boolean);if(!nodes.length)return null;const existing=nodes[0].closest('[data-review-key]');if(existing){existing.querySelector(':scope > summary').textContent=label;return existing;}const details=reviewDetails(label,key);nodes[0].before(details);nodes.forEach(n=>details.append(n));return details;}
function reviewHeader(){
 const host=$('#content');if(page!=='quote'||!host.querySelector('.workspace-tabs'))return;
 host.classList.add('review-quote');
 const key=teamCurrent()?.id||db.quote.workspaceKey||db.quote.id;
 const handoff=host.querySelector('[data-notice-panel]'),s=Notices.quoteId===teamCurrent()?.id?Notices.state:null;
 const done=['intake','technical','materials'].filter(k=>s?.[k]?.current).length;
 reviewFold([handoff],Team.dirty?'Xác nhận & bàn giao · Có thay đổi chưa lưu':`Xác nhận & bàn giao · ${done}/3 phần đã xác nhận`,key+':handoff');
 const metrics=host.querySelector('.quote-metrics'),ribbon=host.querySelector('.quote-ribbon'),intro=host.querySelector('.pa-intro');
 const figures=[ribbon,metrics,host.querySelector('.quote-technical-overview'),intro].filter(Boolean);
 if(figures.length)reviewFold(figures,'Thông tin chi tiết · '+(db.quote.customer||'Chưa khai khách hàng'),key+':info');
 const banner=host.querySelector('.team-banner');if(banner){banner.classList.add('review-team-banner');let status=banner.querySelector('[data-review-save-state]');if(!status){status=document.createElement('p');status.dataset.reviewSaveState='';banner.append(status);}const link=teamCurrent();status.textContent=(Team.dirty?'Chưa lưu thay đổi':link?'Đã lưu báo giá · v'+link.version:'Chưa lưu báo giá')+' · '+(link?.status==='approved'?'Đã duyệt báo giá':link?.status==='submitted'?'Đang chờ duyệt':'Chưa gửi duyệt');}
}
function reviewNotes(){
 for(const input of document.querySelectorAll('#content [data-line-note]')){
  if(input.closest('[data-review-note]'))continue;
  const label=input.closest('label');if(!label)continue;
  const details=document.createElement('details');details.dataset.reviewNote=input.dataset.lineNote;details.className='review-note';
  const summary=document.createElement('summary');summary.textContent=input.value.trim()?'Ghi chú: '+input.value.trim().slice(0,60):'+ Ghi chú';details.append(summary);label.before(details);details.append(label);
  const cell=details.closest('td');if(cell){cell.classList.add('review-note-cell');cell.style.minWidth='130px';}
 }
}
function reviewHelp(root){
 for(const p of root.querySelectorAll('p.help-text,.pa-flow')){
  if(p.closest('.review-details,.review-help,.notice.error,.notice.warning,[role=alert],.paper,#print-area')||p.querySelector('input,button,a,select')||p.textContent.trim().length<190)continue;
  const text=p.textContent.trim(),sentence=text.indexOf('. '),brief=sentence>20&&sentence<160?text.slice(0,sentence+1):'Xem hướng dẫn khi cần đối chiếu cách khai.';
  const box=document.createElement('div');box.className='review-help';const lead=document.createElement('p');lead.textContent=brief;const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='Xem giải thích';details.append(summary);p.before(box);box.append(lead,details);details.append(p);
 }
}
function reviewTasks(){
 const panel=document.querySelector('[data-tax-panel]');if(!panel)return;
 const tasks=panel.querySelector('[data-review-tasks]')||document.createElement('div');tasks.dataset.reviewTasks='';tasks.className='review-tasks';
 const row=(label,button)=>`<div><span>${label}</span>${button}</div>`;
 const t=result.tax,link=teamCurrent(),state=Notices.quoteId===link?.id?Notices.state:null;
 let html='<h3>Việc cần hoàn tất</h3>';
 if(link&&Team.dirty)html+=row('Lưu những thay đổi đang làm',teamButton('Lưu báo giá lên máy chủ','save'));
 if(t?.releaseErrors.length)html+=row('Bổ sung hoặc xác nhận điều kiện giá và thuế','<button class="button small" data-tax="edit">Mở điều kiện thuế</button>');
 if(t&&!t.costKnown)html+=row('Rà nguồn giá đầu vào','<button class="button small" data-review-jump="cost">Mở nguồn giá</button>');
 if(link&&state&&!state.intake?.current)html+=row('Rà và xác nhận đầu vào báo giá','<button class="button small" data-review-jump="intake">Mở đầu vào</button>');
 if(link&&state&&!state.technical?.current)html+=row('Rà và xác nhận phần kỹ thuật','<button class="button small" data-review-jump="operations">Mở công đoạn</button>');
 if(link&&state&&!state.materials?.current)html+=row('Rà và xác nhận giá vật tư','<button class="button small" data-review-jump="materials">Mở giá vật tư</button>');
 if(html==='<h3>Việc cần hoàn tất</h3>')html+='<p>Đã hoàn tất các phần kiểm tra ở đây. Xem Bản chào giá trước khi gửi duyệt.</p>';
 if(tasks._reviewHtml!==html){tasks.innerHTML=html;tasks._reviewHtml=html;}if(!tasks.isConnected)panel.append(tasks);
 const errors=panel.querySelector(':scope > p.help-text');if(errors&&t?.releaseErrors.length)reviewFold([errors],'Xem các nội dung cần kiểm tra','tax-reasons');
}
function reviewExports(){
 if(page!=='quote'||tab!=='preview')return;const host=$('#content');if(host.querySelector('[data-review-exports]'))return;
 const nodes=Array.from(host.querySelectorAll('[data-work=export-customer-xlsx],[data-action=export-quote],[data-action=print]'));if(!nodes.length)return;
 const section=document.createElement('section');section.className='panel review-exports';section.dataset.reviewExports='';section.innerHTML='<h3>Xuất báo giá</h3><p>Chọn loại file cần dùng. Kiểm tra nội dung bản chào trước khi xuất.</p><div class="actions"></div>';
 const toolbar=host.querySelector('[data-offer-content]')?.closest('.section-toolbar')||nodes[0].parentElement;toolbar.before(section);
 for(const node of nodes){node.textContent=node.dataset.work?'Excel (.xlsx) — gửi khách':node.dataset.action==='export-quote'?'Bảng dữ liệu (.csv)':'In / lưu PDF';section.querySelector('.actions').append(node);}
 host.querySelectorAll('.export-customer-action').forEach(el=>{if(!el.children.length)el.remove();});
}
function reviewStepNavigation(){
 if(page!=='quote')return;
 const host=$('#content'),tabs=[...host.querySelectorAll('.workspace-tabs [data-tab]')].filter(b=>!b.disabled&&getComputedStyle(b).display!=='none'),index=tabs.findIndex(b=>b.dataset.tab===tab),next=tabs[index+1];
 if(index<0||!next)return;
 const destination=next.dataset.tab,labels={bom:'Cấu thành sản phẩm',operations:'Công đoạn & định mức',waste:'Khai triển & hao hụt',mass:'Khối lượng & diện tích',prices:'Giá & hệ số',pricing:'Phân tích giá',preview:'Bản chào giá'};
 if(host.querySelector('[data-review-next]'))return;
 const existing=host.querySelector('[data-intake="goto"][data-id="bom"],[data-action="quick-waste"],[data-remnant="open-mass"]');
 const button=existing||document.createElement('button');button.type='button';button.className='button primary';button.textContent='Tiếp: '+(labels[destination]||next.textContent.trim())+' →';button.dataset.reviewNext=destination;
 // Keep the original intake row: transfer on the left, next step on the right.
 if(tab==='intake'&&existing){existing.parentElement.classList.add('review-intake-next');return;}
 const footer=document.createElement('div');footer.className='review-step-footer';footer.dataset.reviewStepFooter='';footer.append(button);host.append(footer);
}
const ReviewOperationSelection={checked:new Set(),document:null};
function reviewOperationWritable(){return !Team.loaded||!!(Team.permissions?.edit&&Team.permissions?.sections?.includes('operations')&&teamCurrent()?.status==='draft'&&!teamCurrent()?.readOnly);}
function reviewOperationSelection(){
 const matrix=document.querySelector('#content .pa-operations');if(page!=='quote'||tab!=='operations'||!matrix){ReviewOperationSelection.checked.clear();return;}
 const state=ReviewOperationSelection,key=teamCurrent()?.id||db.quote;if(state.document!==key){state.checked.clear();state.document=key;}
 if(!matrix.hasAttribute('data-review-selection')){matrix.dataset.reviewSelection='';
  for(const cell of matrix.querySelectorAll('tbody th[scope=row]')){const button=cell.querySelector('[data-ux=row-actions]'),n=button&&C.findNode(db.quote.products,button.dataset.id);if(!n)continue;
   const label=document.createElement('label');label.className='review-op-select';const input=document.createElement('input');input.type='checkbox';input.dataset.reviewOpRow=n.id;input.setAttribute('aria-label','Chọn dòng '+(n.materialId||n.name));label.append(input,document.createTextNode('Chọn dòng'));cell.prepend(label);
  }
  const header=matrix.querySelector('thead th');if(header)header.insertAdjacentHTML('afterbegin','<label class="review-op-select"><input type="checkbox" data-review-op-all aria-label="Chọn tất cả dòng đang hiển thị"> Chọn tất cả</label>');
  const bar=document.createElement('div');bar.className='review-op-toolbar';bar.dataset.reviewOpToolbar='';bar.hidden=true;
  bar.innerHTML='<span data-review-op-count role="status"></span><button type="button" class="button small" data-review-op-action="assign">Gán nguyên công</button><button type="button" class="button small" data-review-op-action="complexity">Đánh giá mức độ</button><button type="button" class="button small" data-review-op-action="clear">Bỏ chọn</button>';
  matrix.before(bar);matrix.classList.add('review-selectable-operations');
 }
 reviewOperationSelectionSync();
}
function reviewOperationSelectionSync(){
 const state=ReviewOperationSelection,boxes=[...document.querySelectorAll('.pa-operations [data-review-op-row]')],visible=new Set(boxes.map(b=>b.dataset.reviewOpRow));
 state.checked=new Set([...state.checked].filter(id=>visible.has(id)));
 for(const box of boxes){box.checked=state.checked.has(box.dataset.reviewOpRow);box.closest('tr').classList.toggle('review-op-selected',box.checked);}
 const count=state.checked.size,all=document.querySelector('[data-review-op-all]');if(all){all.checked=!!boxes.length&&count===boxes.length;all.indeterminate=count>0&&count<boxes.length;all.disabled=!boxes.length;}
 const bar=document.querySelector('[data-review-op-toolbar]');if(bar){bar.hidden=!count;bar.querySelector('[data-review-op-count]').textContent='Đã chọn '+count+' dòng';for(const b of bar.querySelectorAll('button'))b.disabled=b.dataset.reviewOpAction!=='clear'&&!reviewOperationWritable();}
}
function reviewOperationAction(action){
 const ids=[...ReviewOperationSelection.checked];if(action==='clear'){ReviewOperationSelection.checked.clear();reviewOperationSelectionSync();return;}
 inWritable();if(!reviewOperationWritable())throw Error('Cần quyền Công đoạn & định mức để sửa.');if(!ids.length)return;
 if(action==='assign')return bulkOperation(ids);
 const nodes=ids.map(id=>C.findNode(db.quote.products,id)).filter(n=>n?.ops?.length);
 if(!nodes.length)return toast('Chọn nguyên công trên dòng trước khi đánh giá mức độ.');
 if(nodes.length===1)return reviewComplexityEdit(nodes[0].id);
 openDialog('Đánh giá mức độ · '+nodes.length+' dòng',`<p>Chọn dòng cần đánh giá. Mức độ lấy từ bảng đã khai cho từng nguyên công.</p><div class="review-op-review-list">${nodes.map(n=>`<button type="button" class="button" data-review="complexity-row" data-review-id="${esc(n.id)}">${esc(n.materialId||n.name)} · ${esc(n.name)}</button>`).join('')}</div>`,'Đóng',()=>closeDialog());
}
function reviewPaint(){
 reviewHeader();reviewNotes();reviewTasks();reviewOperationSelection();reviewHelp($('#content'));reviewExports();reviewStepNavigation();
 if(Team.loaded)document.querySelectorAll('[data-action=approve]').forEach(b=>b.textContent=teamCurrent()?.status==='submitted'&&Team.permissions?.approve?'Duyệt báo giá':'Gửi duyệt');
 document.querySelectorAll('[data-team=submit]').forEach(b=>b.textContent='Gửi duyệt');
 document.querySelectorAll('[data-team=save]').forEach(b=>b.textContent='Lưu báo giá lên máy chủ');
 document.querySelectorAll('[data-catalog-draft=save]').forEach(b=>b.textContent='Lưu danh mục chung');
}
function reviewShape(){
 const form=$('#dialog-form'),table=form?.querySelector('#definition-fields');if(!table||form.dataset.reviewShape)return;form.dataset.reviewShape='yes';form.classList.add('review-shape-simple','review-shape-flow');
 const body=form.querySelector('.dialog-body'),preview=form.querySelector('#definition-preview'),allowance=form.querySelector('[data-df-allowance]'),metadata=body.querySelector(':scope > .form-grid'),sheet=form.querySelector('[data-df-sheet-presets]'),polygon=form.querySelector('[data-df-polygon]');
 const section=(title,key)=>{const el=document.createElement('section');el.className='review-shape-step';el.dataset.shapeStep=key;const h=document.createElement('h3');h.textContent=title;el.append(h);return el;};
 const info=section('1. Thông tin hình dạng','info');metadata.before(info);info.append(metadata);
 const extra=reviewDetails('Thông tin bổ sung','shape-metadata'),extraGrid=document.createElement('div');extraGrid.className='form-grid';extra.append(extraGrid);info.append(extra);
 for(const name of ['blankShape','blankShapeName'])extraGrid.append(form.elements[name].closest('label'));
 metadata.prepend(form.elements.name.closest('label'));form.elements.name.closest('label').querySelector('span').textContent='Tên hình / nhóm chi tiết';
 const metadataHint=info.nextElementSibling;if(metadataHint?.matches('p.help-text'))extra.append(metadataHint);
 const methods=section('2. Chọn hình và cách khai kích thước','method');sheet.before(methods);methods.append(sheet,polygon);
 const legend=sheet.querySelector('legend');if(legend)legend.hidden=true;
 const choose=form.elements.sheetPreset;choose.closest('label').querySelector('span').textContent='Hình cần khai';
 for(const key of ['rectangle','circle','triangle','triangle-sides','polygon','trapezoid','rhombus','custom'])choose.append(choose.querySelector('option[value="'+key+'"]'));
 const methodChoices=document.createElement('fieldset');methodChoices.className='shape-method-choices';methodChoices.innerHTML='<legend>Phương pháp khai báo</legend>'+[...choose.options].map(o=>'<label class="pa-checkbox"><input type="radio" name="shapeMethodChoice" value="'+esc(o.value)+'" '+(choose.value===o.value?'checked':'')+(choose.disabled?' disabled':'')+'>'+esc(o.textContent)+'</label>').join('');choose.closest('label').after(methodChoices);choose.closest('label').hidden=true;
 methodChoices.addEventListener('change',e=>{if(e.target.name==='shapeMethodChoice'){choose.value=e.target.value;choose.dispatchEvent(new Event('change',{bubbles:true}));}});
 const apply=sheet.querySelector('[data-df-preset-apply]');apply.textContent='Tạo bảng thông số';apply.classList.add('primary');const applyBox=apply.parentElement;methods.append(apply);applyBox.remove();const resetHint=document.createElement('small');resetHint.className='review-shape-reset-hint';resetHint.textContent='Tạo lại bảng sẽ thay các thông số và công thức đang sửa bằng mẫu của hình đã chọn.';methods.append(resetHint);
 const methodHint=document.createElement('p');methodHint.className='review-method-hint';methodHint.dataset.shapeMethodHint='';apply.before(methodHint);
 const pending=document.createElement('p');pending.className='notice';pending.dataset.shapePending='';pending.textContent='Đã đổi cách khai. Bấm “Tạo bảng thông số” để hiện các ô tương ứng. Bảng mới sẽ thay thông số và công thức đang sửa.';methods.append(pending);
 const tableWrap=table.parentElement,entry=section('3. Nhập thông số','inputs');tableWrap.before(entry);entry.append(tableWrap);
 const entryHint=document.createElement('p');entryHint.className='help-text';entryHint.textContent='Nhập kích thước để xem thử hình và kết quả. Kích thước dùng tại từng báo giá được nhập riêng ở báo giá đó.';tableWrap.before(entryHint);
 const advanced=reviewDetails('Mở rộng: thông số, công thức và khổ mua thử','shape-advanced');
 let node=entry.nextSibling;while(node&&node!==preview){const next=node.nextSibling;advanced.append(node);node=next;}
 const results=section('4. Xem hình và kết quả','results');results.classList.add('review-shape-results');entry.after(results);if(preview)results.append(preview);if(allowance)results.append(allowance);results.after(advanced);
 const endHint=advanced.nextElementSibling;if(endHint?.tagName==='P')advanced.append(endHint);
 const first=body.querySelector(':scope > p');if(first)advanced.append(first);
 for(const p of [...sheet.querySelectorAll(':scope > p')])advanced.append(p);
 const polygonHelp=reviewFold([...polygon.querySelectorAll(':scope > p')],'Hướng dẫn khai cạnh và góc','shape-polygon-help');if(polygonHelp)advanced.append(polygonHelp);
 const examples=form.querySelector('[data-df-example-apply]')?.closest('details');if(examples)advanced.append(examples);
 for(const p of [...body.querySelectorAll(':scope > p.help-text')])advanced.append(p);
 polygon.querySelector(':scope > summary').textContent='Số cạnh và cách khai góc';polygon.open=true;
 const update=()=>{if(!form.isConnected)return;const kind=choose.value,isSheet=form.elements.base.value==='sheet';
  sheet.hidden=!isSheet;polygon.hidden=kind!=='polygon'||!isSheet;polygon.open=true;apply.hidden=!isSheet;resetHint.hidden=!isSheet;
  const hints={rectangle:'Nhập chiều dài và chiều rộng. Hình vuông có hai kích thước bằng nhau.',circle:'Nhập đường kính hình tròn.',triangle:'Nhập cạnh đáy và chiều cao vuông góc (hai cạnh góc vuông).','triangle-sides':'Nhập chiều dài ba cạnh; không cần khai góc.',polygon:'Chọn số cạnh và cách khai góc bên dưới, sau đó tạo bảng thông số.',trapezoid:'Nhập hai đáy và chiều cao vuông góc. Mẫu dùng khi đáy nhỏ nằm trong bề rộng đáy lớn.',rhombus:'Nhập chiều dài hai đường chéo của hình thoi.',custom:'Giữ các thông số và công thức riêng; mở mục Mở rộng để chỉnh cách tính.'};
  methodHint.textContent=isSheet?hints[kind]:'Nhập chiều dài cắt và thông số tiết diện. Các công thức riêng nằm trong mục Mở rộng.';
  const changed=kind!==form.dataset.definitionSheetPreset||(kind==='polygon'&&(form.elements.polygonKind.value!==form.dataset.definitionPolygonKind||form.elements.polygonCount.value!==form.dataset.definitionPolygonCount));
  pending.hidden=!changed;entry.hidden=changed;results.hidden=changed;
  apply.textContent=changed?'Tạo bảng thông số':'Tạo lại bảng thông số';
 };
 choose.addEventListener('change',()=>{if(choose.value==='polygon'&&!form.dataset.definitionPolygonKind){form.elements.polygonKind.value='interior';form.elements.polygonCount.value='4';}update();});
 form.addEventListener('change',update);form.addEventListener('input',update);update();
 advanced.addEventListener('toggle',()=>form.classList.toggle('review-shape-simple',!advanced.open));form.classList.toggle('review-shape-simple',!advanced.open);
 for(const row of table.querySelectorAll('tbody tr:not([data-df-output-row])')){const field=row.querySelector('[name^=fieldName]'),cell=row.cells[4];if(field&&cell){const label=document.createElement('strong');label.className='review-dimension-name';const unit=form.elements['unit'+field.name.replace('fieldName','')]?.value;label.textContent=field.value+(unit&&unit!=='number'?' ('+unit+')':'');cell.prepend(label);field.addEventListener('input',()=>label.textContent=field.value);}}
 form.addEventListener('invalid',e=>{for(let el=e.target.parentElement;el&&el!==form;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;advanced.open=true;form.classList.remove('review-shape-simple');},true);
 reviewHelp(body);
}
function installReviewImprovementsUI(){
 document.addEventListener('change',e=>{const el=e.target;if(el.hasAttribute('data-review-op-row')){el.checked?ReviewOperationSelection.checked.add(el.dataset.reviewOpRow):ReviewOperationSelection.checked.delete(el.dataset.reviewOpRow);reviewOperationSelectionSync();}else if(el.hasAttribute('data-review-op-all')){ReviewOperationSelection.checked=new Set(el.checked?[...document.querySelectorAll('.pa-operations [data-review-op-row]')].map(b=>b.dataset.reviewOpRow):[]);reviewOperationSelectionSync();}});
 document.addEventListener('click',e=>{const b=e.target.closest('[data-review-op-action]');if(!b)return;try{reviewOperationAction(b.dataset.reviewOpAction);}catch(err){toast(err.message);}});

 const draw=render;render=()=>{draw();reviewPaint();};const paint=noticePaint;noticePaint=()=>{paint();reviewPaint();};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-review-next]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();document.querySelector('.workspace-tabs [data-tab="'+b.dataset.reviewNext+'"]')?.click();window.scrollTo(0,0);},true);
 const shape=dfShapeEdit;dfShapeEdit=(...args)=>{const value=shape(...args);if(value?.then)return value.then(result=>{reviewShape();return result;});reviewShape();return value;};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-review-jump]');if(!b)return;const destination=b.dataset.reviewJump;if(destination==='cost'){document.querySelector('[data-cost-sources]')?.scrollIntoView({behavior:'smooth',block:'start'});document.querySelector('[data-b6=cost]')?.focus({preventScroll:true});return;}tab=destination==='materials'?'prices':destination;if(destination==='materials')Intake.priceTab='materials';render();window.scrollTo(0,0);});
}
