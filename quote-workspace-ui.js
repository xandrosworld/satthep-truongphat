'use strict';
function quoteTechnicalOverview(){
 const s=B1.technicalSummary(db.quote.products,result),value=(number,unit)=>`${s.complete?'':'<small>Đã tính được</small>'}<strong>${num(number,3)} <small>${unit}</small></strong>`;
 return `<section class="quote-technical-overview" aria-label="Tổng thông số kỹ thuật"><div class="quote-technical-totals"><div><span>Khối lượng phôi toàn đơn</span>${value(s.weight,'kg')}</div><div><span>Diện tích phôi toàn đơn</span>${value(s.area,'m²')}</div><div><span>Số cấu kiện toàn đơn</span><strong>${num(s.components)} <small>cấu kiện</small></strong><small>${s.componentRows} dòng cấu kiện · đã nhân số lượng cấp cha</small></div></div><p class="help-text">Tổng từ các dòng vật tư, không cộng lặp cấp cha/con. Diện tích phôi theo quy ước; diện tích sơn và lượng công việc xem tại Công đoạn & định mức.</p>${s.issues.length?`<details class="quote-technical-missing"><summary>Cần bổ sung ${s.issues.length} nội dung · chưa đủ thông số tổng</summary><ul>${s.issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}</section>`;
}
function quoteAuxiliaryPercent(id){
 inWritable();const nodes=C.flatten(id?[C.findNode(db.quote.products,id)].filter(Boolean):db.quote.products).filter(n=>n.kind==='material'&&n.spec?.shape!=='piece'&&!n.draftMaterial);
 if(!nodes.length)return toast('Thêm vật tư phôi trước khi khai tỷ lệ vật tư phụ');
 openDialog('Vật tư phụ dự tính theo % phôi',`<p>Tính thêm trên giá phôi của từng dòng trong phương án đang chọn, không tính trên nhân công. Nhập 0 nếu không áp dụng; không nhập lại vật tư đã có mã hoặc định mức riêng.</p>${nodes.map(n=>`<div class="quote-auxiliary-row"><strong>${esc(C.nodePath(db.quote.products,n.id).map(x=>x.name).join(' / '))}</strong>${field('Vật tư phụ (%)','aux-'+n.id,n.auxiliaryPercent??0,'number','min="0" max="100" step="any" required')}</div>`).join('')}`,'Lưu tỷ lệ',f=>{
  inWritable();const values=nodes.map(n=>{const raw=f.get('aux-'+n.id),percent=Number(raw);if(raw===''||!Number.isFinite(percent)||percent<0||percent>100)throw Error('Nhập tỷ lệ từ 0 đến 100%');return {id:n.id,percent};});
  if(values.some(x=>!C.findNode(db.quote.products,x.id)))throw Error('Cấu thành đã thay đổi; mở lại bảng tỷ lệ');
  saveAndClose(()=>{for(const x of values)C.findNode(db.quote.products,x.id).auxiliaryPercent=x.percent;},'Đã lưu tỷ lệ vật tư phụ');
 });
}
function quoteAuxiliaryColumns(){
 if(page!=='quote'||tab!=='bom')return;
 for(const table of document.querySelectorAll('.quick-table')){
  const head=table.querySelector('thead tr');if(!head)continue;
  if(!head.querySelector('[data-auxiliary-heading]')){const cell=document.createElement('th');cell.dataset.auxiliaryHeading='';cell.textContent='Vật tư phụ (%)';cell.title='Dự tính thêm trên giá phôi của dòng';head.insertBefore(cell,head.lastElementChild);}
  for(const row of table.querySelectorAll('tbody tr[data-row-id]')){
   const n=C.findNode(db.quote.products,row.dataset.rowId);if(!n)continue;
   let cell=row.querySelector('[data-auxiliary-cell]');if(!cell){cell=document.createElement('td');cell.dataset.auxiliaryCell=n.id;row.insertBefore(cell,row.lastElementChild);}
   cell.innerHTML=n.kind==='material'&&n.spec?.shape!=='piece'&&!n.draftMaterial?btn(num(n.auxiliaryPercent??0)+' %','auxiliary-percent',`data-id="${esc(n.id)}"`,'small'):'—';
  }
 }
}
function installQuoteWorkspaceUI(){
 const intro=paIntro;paIntro=()=>technicalStage()?quoteTechnicalOverview():intro();
 b1Legend=()=>`<div class="quote-symbols-action">${btn('Bảng ký hiệu','quote-symbols','','small')}</div>`;
 actions['quote-symbols']=()=>openDialog('Bảng ký hiệu cấu thành',`<table><thead><tr><th>Ký hiệu</th><th>Ý nghĩa</th></tr></thead><tbody>${Object.values(b1Types).map(([code,label])=>`<tr><td><strong>${esc(code)}</strong></td><td>${esc(label)}</td></tr>`).join('')}</tbody></table><p>Định mức là số lượng trong một cấp cha. Tổng toàn đơn đã nhân số lượng sản phẩm và các cấp cấu kiện phía trên.</p>`);
 actions['auxiliary-percent']=el=>quoteAuxiliaryPercent(el.dataset.id);
 const bom=renderBOM;renderBOM=()=>`<div class="quote-auxiliary-action">${btn('Vật tư phụ (%)','auxiliary-percent','','small')}</div>`+bom();
 const oldRender=render;render=()=>{oldRender();quoteAuxiliaryColumns();};
 const quick=refreshQuickUI;refreshQuickUI=()=>{quick();const summary=document.querySelector('.quote-technical-overview');if(summary)summary.outerHTML=quoteTechnicalOverview();quoteAuxiliaryColumns();};
}
