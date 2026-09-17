'use strict';
function quoteTechnicalOverview(){
 const s=B1.technicalSummary(db.quote.products,result),value=(number,unit)=>`${s.complete?'':'<small>Đã tính được</small>'}<strong>${num(number,3)} <small>${unit}</small></strong>`;
 return `<section class="quote-technical-overview" aria-label="Tổng thông số kỹ thuật"><div class="quote-technical-totals"><div><span>Khối lượng phôi toàn đơn</span>${value(s.weight,'kg')}</div><div><span>Diện tích phôi toàn đơn</span>${value(s.area,'m²')}</div><div><span>Số cấu kiện toàn đơn</span><strong>${num(s.components)} <small>cấu kiện</small></strong><small>${s.componentRows} dòng cấu kiện · đã nhân số lượng cấp cha</small></div></div><p class="help-text">Tổng từ các dòng vật tư, không cộng lặp cấp cha/con. Diện tích phôi theo quy ước; diện tích sơn và lượng công việc xem tại Công đoạn & định mức.</p>${s.issues.length?`<details class="quote-technical-missing"><summary>Cần bổ sung ${s.issues.length} nội dung · chưa đủ thông số tổng</summary><ul>${s.issues.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></details>`:''}</section>`;
}
function quoteAuxiliaryPercent(id){
 inWritable();const nodes=C.flatten(id?[C.findNode(db.quote.products,id)].filter(Boolean):db.quote.products).filter(n=>n.kind==='material'&&n.spec?.shape!=='piece'&&!n.draftMaterial);
 if(!nodes.length)return toast('Thêm vật tư phôi trước khi khai tỷ lệ vật tư phụ');
 openDialog('Vật tư phụ dự tính theo % phôi',`<p>Giá trị vật tư phụ = lượng phôi theo cách tính của phương án × đơn giá tương ứng × tỷ lệ %. Chỉ cộng giá trị này vào chi phí; không cộng khối lượng quy đổi vào khối lượng phôi, vật tư dự tính hoặc vận chuyển.</p><p>Không tính trên nhân công. Nhập 0 nếu không áp dụng; không nhập lại vật tư đã có mã hoặc định mức riêng.</p>${nodes.map(n=>`<div class="quote-auxiliary-row"><strong>${esc(C.nodePath(db.quote.products,n.id).map(x=>x.name).join(' / '))}</strong>${field('Vật tư phụ (%)','aux-'+n.id,n.auxiliaryPercent??0,'number','min="0" max="100" step="any" required')}</div>`).join('')}`,'Lưu tỷ lệ',f=>{
  inWritable();const values=nodes.map(n=>{const raw=f.get('aux-'+n.id),percent=Number(raw);if(raw===''||!Number.isFinite(percent)||percent<0||percent>100)throw Error('Nhập tỷ lệ từ 0 đến 100%');return {id:n.id,percent};});
  if(values.some(x=>!C.findNode(db.quote.products,x.id)))throw Error('Cấu thành đã thay đổi; mở lại bảng tỷ lệ');
  saveAndClose(()=>{for(const x of values)C.findNode(db.quote.products,x.id).auxiliaryPercent=x.percent;},'Đã lưu tỷ lệ vật tư phụ');
 });
}
function installQuoteWorkspaceUI(){
 const intro=paIntro;paIntro=()=>technicalStage()?quoteTechnicalOverview():intro();
 b1Legend=()=>'';
 actions['quote-symbols']=()=>rcSelect('symbols');
 actions['auxiliary-percent']=el=>quoteAuxiliaryPercent(el.dataset.id);
 const quick=refreshQuickUI;refreshQuickUI=()=>{quick();const summary=document.querySelector('.quote-technical-overview');if(summary)summary.outerHTML=quoteTechnicalOverview();};
}
