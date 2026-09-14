/* Per-quote publication choices, not a company-wide policy or digital signature. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const text=v=>String(v??'').trim();
function fingerprint(q){const s=q.offerTerms||{};return JSON.stringify([q.id,q.customer,q.project,q.date,q.valid,q.notes,q.issuer?.name,q.issuer?.taxId,q.issuer?.address,q.issuer?.phone,q.issuer?.email,q.issuer?.signer,s.delivery,s.installation,s.payment,s.warranty,s.scope,s.signature,s.signerTitle,s.customerTitle,s.customerSigner]);}
function errors(q){const s=q.offerTerms||{},out=[];if(!['issuer','both','none'].includes(s.signature))out.push('Chọn mẫu phần ký cho báo giá');for(const [key,label]of [['delivery','giao hàng'],['installation','lắp đặt'],['payment','thanh toán'],['warranty','bảo hành'],['scope','phạm vi chào giá']])if(!text(s[key]))out.push('Khai điều kiện '+label+' (không áp dụng cũng cần ghi rõ)');if(['issuer','both'].includes(s.signature)&&(!text(q.issuer?.signer)||!text(s.signerTitle)))out.push('Khai tên và chức danh người ký bên chào');if(s.signature==='both'&&!text(s.customerTitle))out.push('Khai nhãn phần ký bên nhận');if(!text(s.reason)||s.confirmation!==fingerprint(q))out.push('Chưa xác nhận mẫu ký/điều kiện, hoặc nội dung đã đổi');return out;}
function save(q,data,confirmed,at=new Date().toISOString()){
 if(['approved','submitted'].includes(q.status))throw Error('Bản đã khóa; tạo bản sửa trước');
 const before=C.copy(q.offerTerms||null),next={};for(const key of ['delivery','installation','payment','warranty','scope','signature','signerTitle','customerTitle','customerSigner','reason'])next[key]=text(data[key]);
 const trial=C.copy(q);trial.offerTerms=next;if(confirmed){next.at=at;next.confirmation=fingerprint(trial);const issues=errors(trial);if(issues.length)throw Error(issues.join('; '));}
 q.offerTerms=next;q.offerTermsHistory??=[];q.offerTermsHistory.push({at,before,after:C.copy(next)});return next;
}
function publicTerms(q){const s=q.offerTerms||{};return Object.fromEntries(['delivery','installation','payment','warranty','scope','signature','signerTitle','customerTitle','customerSigner'].map(k=>[k,text(s[k])]));}
function lines(s){return [['Giao hàng',s?.delivery||'Chưa khai'],['Lắp đặt',s?.installation||'Chưa khai'],['Thanh toán',s?.payment||'Chưa khai'],['Bảo hành',s?.warranty||'Chưa khai'],['Phạm vi đã gồm trong giá',s?.scope||'Chưa xác nhận'],['Lưu ý','Các khoản đã gồm chỉ phân rã để đọc, không cộng thêm ngoài tổng. Đơn giá hàng là trước thuế; thuế đầu ra thể hiện riêng.']];}
const api={fingerprint,errors,save,publicTerms,lines};if(typeof module!=='undefined')module.exports=api;else root.TPOfferTerms=api;
})(typeof window!=='undefined'?window:globalThis);
