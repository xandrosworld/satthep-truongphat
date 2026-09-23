'use strict';
function quoteTechnicalOverview(){
 const quantities=new Map();for(const n of db.quote.products){const unit=n.unit||'chưa khai đơn vị';quantities.set(unit,(quantities.get(unit)||0)+n.qty);}const materialQuantities=new Map();for(const {node:n,count} of B1.treeRows(db.quote.products))if(n.kind==='material'){const unit=b1QuantityUnit(n);materialQuantities.set(unit,(materialQuantities.get(unit)||0)+count);}const quantityText=map=>[...map].map(([unit,count])=>num(count)+' '+esc(unit)).join(' · ')||'0';
 const s=B1.technicalSummary(db.quote.products,result),value=(number,unit)=>`${s.complete?'':'<small>Đã tính được</small>'}<strong>${num(number,3)} <small>${unit}</small></strong>`;
 return `<section class="quote-technical-overview" aria-label="Tổng thông số kỹ thuật"><div class="quote-technical-totals"><div><span>Khối lượng phôi toàn đơn</span>${value(s.weight,'kg')}</div><div><span>Diện tích phôi toàn đơn</span>${value(s.area,'m²')}</div><div><span>Số lượng sản phẩm toàn đơn</span><strong>${quantityText(quantities)}</strong><small>${db.quote.products.length} dòng sản phẩm</small><small>Vật tư toàn đơn: ${quantityText(materialQuantities)}</small></div><div><span>Số cấu kiện toàn đơn</span><strong>${num(s.components)} <small>cấu kiện</small></strong><small>${s.componentRows} dòng cấu kiện · đã nhân số lượng cấp cha</small></div></div><p class="help-text">Tổng từ các dòng vật tư, không cộng lặp cấp cha/con. Diện tích phôi theo quy ước; diện tích sơn và lượng công việc xem tại Công đoạn & định mức.</p>${s.issues.length?`<details class="quote-technical-missing"><summary>Cần bổ sung ${s.issues.length} nội dung · chưa đủ thông số tổng</summary><ul>${s.issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}</section>`;
}
function quoteAuxiliaryPercent(id){
 inWritable();const nodes=C.flatten(id?[C.findNode(db.quote.products,id)].filter(Boolean):db.quote.products).filter(n=>n.kind==='material'&&!n.draftMaterial);
 if(!nodes.length)return toast('Thêm vật tư trước khi khai tỷ lệ vật tư phụ');
 openDialog('Vật tư phụ dự tính theo %',`<p>Giá trị vật tư phụ = tiền vật tư theo cách tính của phương án × tỷ lệ %. Vật tư theo bộ/cái dùng lượng dự tính đã gồm hao hụt × đơn giá. Chỉ cộng giá trị này vào chi phí; không cộng khối lượng quy đổi vào khối lượng phôi, vật tư dự tính hoặc vận chuyển.</p><p>Không tính trên nhân công. Nhập 0 nếu không áp dụng; không nhập lại vật tư đã có mã hoặc định mức riêng.</p>${nodes.map(n=>`<div class="quote-auxiliary-row"><strong>${esc(C.nodePath(db.quote.products,n.id).map(x=>x.name).join(' / '))}</strong>${field('Vật tư phụ (%)','aux-'+n.id,n.auxiliaryPercent??0,'number','min="0" max="100" step="any" required')}</div>`).join('')}`,'Lưu tỷ lệ',f=>{
  inWritable();const values=nodes.map(n=>{const raw=f.get('aux-'+n.id),percent=Number(raw);if(raw===''||!Number.isFinite(percent)||percent<0||percent>100)throw Error('Nhập tỷ lệ từ 0 đến 100%');return {id:n.id,percent};});
  if(values.some(x=>!C.findNode(db.quote.products,x.id)))throw Error('Cấu thành đã thay đổi; mở lại bảng tỷ lệ');
  saveAndClose(()=>{for(const x of values)C.findNode(db.quote.products,x.id).auxiliaryPercent=x.percent;},'Đã lưu tỷ lệ vật tư phụ');
 });
}
function installQuoteWorkspaceUI(){
 const placeOverview=()=>{if(page!=='quote')return;const heading=document.querySelector('#content .page-heading');let summary=document.querySelector('#content .quote-technical-overview');if(heading&&!summary&&db.quote.pricing){heading.insertAdjacentHTML('beforeend',quoteTechnicalOverview());summary=heading.querySelector('.quote-technical-overview');}if(heading&&summary){heading.classList.add('quote-heading-with-totals');heading.insertBefore(summary,heading.querySelector(':scope > .actions'));}};
 const previousRender=render;render=()=>{previousRender();placeOverview();};

 const intro=paIntro;paIntro=()=>technicalStage()?quoteTechnicalOverview():intro();
 b1Legend=()=>'';
 actions['quote-symbols']=()=>rcSelect('symbols');
 actions['auxiliary-percent']=el=>quoteAuxiliaryPercent(el.dataset.id);
 const quick=refreshQuickUI;refreshQuickUI=()=>{quick();const summary=document.querySelector('.quote-technical-overview');if(summary)summary.outerHTML=quoteTechnicalOverview();};
}
