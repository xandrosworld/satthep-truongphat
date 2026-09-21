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
function reviewPaint(){
 reviewHeader();reviewNotes();reviewTasks();reviewHelp($('#content'));reviewExports();
 if(Team.loaded)document.querySelectorAll('[data-action=approve]').forEach(b=>b.textContent=teamCurrent()?.status==='submitted'&&Team.permissions?.approve?'Duyệt báo giá':'Gửi duyệt');
 document.querySelectorAll('[data-team=submit]').forEach(b=>b.textContent='Gửi duyệt');
 document.querySelectorAll('[data-team=save]').forEach(b=>b.textContent='Lưu báo giá lên máy chủ');
 document.querySelectorAll('[data-catalog-draft=save]').forEach(b=>b.textContent='Lưu danh mục chung');
}
function reviewShape(){
 const form=$('#dialog-form'),table=form?.querySelector('#definition-fields');if(!table||form.dataset.reviewShape)return;form.dataset.reviewShape='';form.classList.add('review-shape-simple');
 const body=form.querySelector('.dialog-body'),preview=form.querySelector('#definition-preview'),allowance=form.querySelector('[data-df-allowance]'),metadata=body.querySelector(':scope > .form-grid');
 const meta=reviewFold([metadata],'Thông tin quy ước','shape-metadata');if(meta&&!form.elements.name.value)meta.open=true;
 const first=body.querySelector(':scope > p');if(first)reviewFold([first],'Đơn vị và cách khai','shape-units');
 const sheet=form.querySelector('[data-df-sheet-presets]');if(sheet){const legend=sheet.querySelector('legend');if(legend)legend.textContent='1. Chọn hình';}
 const polygon=form.querySelector('[data-df-polygon]');
 if(polygon){const paragraphs=[...polygon.querySelectorAll(':scope > p')];reviewFold(paragraphs,'Cách khai cạnh và góc','shape-polygon-help');}
 if(sheet){reviewFold([...sheet.querySelectorAll(':scope > p')],'Cách dùng mẫu hình','shape-preset-help');}
 const metadataHint=meta?.nextElementSibling;if(metadataHint?.matches('p.help-text'))meta.append(metadataHint);
 const title=document.createElement('h3');title.textContent='2. Nhập kích thước để xem thử';table.parentElement.before(title);
 const advanced=reviewDetails('Mở rộng: thông số, công thức và khổ mua thử','shape-advanced');
 const start=table.parentElement.nextSibling;let node=start;
 while(node&&node!==preview){const next=node.nextSibling;advanced.append(node);node=next;}
 const results=document.createElement('section');results.className='review-shape-results';results.innerHTML='<h3>3. Xem hình và kết quả</h3>';table.parentElement.after(results);if(preview)results.append(preview);if(allowance)results.append(allowance);results.after(advanced);
 const examples=form.querySelector('[data-df-example-apply]')?.closest('details');if(examples)advanced.prepend(examples);
 const endHint=advanced.nextElementSibling;if(endHint?.tagName==='P')advanced.append(endHint);
 advanced.addEventListener('toggle',()=>form.classList.toggle('review-shape-simple',!advanced.open));form.classList.toggle('review-shape-simple',!advanced.open);
 for(const row of table.querySelectorAll('tbody tr:not([data-df-output-row])')){const field=row.querySelector('[name^=fieldName]'),cell=row.cells[4];if(field&&cell){const label=document.createElement('strong');label.className='review-dimension-name';label.textContent=field.value+' ('+(form.elements['unit'+field.name.replace('fieldName','')]?.value||'')+')';cell.prepend(label);field.addEventListener('input',()=>label.textContent=field.value);}}
 form.addEventListener('invalid',e=>{for(let el=e.target.parentElement;el&&el!==form;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;advanced.open=true;form.classList.remove('review-shape-simple');},true);
 reviewHelp(body);
}
function installReviewImprovementsUI(){
 const draw=render;render=()=>{draw();reviewPaint();};const paint=noticePaint;noticePaint=()=>{paint();reviewPaint();};
 const shape=dfShapeEdit;dfShapeEdit=(...args)=>{const value=shape(...args);reviewShape();return value;};
 document.addEventListener('click',e=>{const b=e.target.closest('[data-review-jump]');if(!b)return;const destination=b.dataset.reviewJump;if(destination==='cost'){document.querySelector('[data-cost-sources]')?.scrollIntoView({behavior:'smooth',block:'start'});document.querySelector('[data-b6=cost]')?.focus({preventScroll:true});return;}tab=destination==='materials'?'prices':destination;if(destination==='materials')Intake.priceTab='materials';render();window.scrollTo(0,0);});
}
