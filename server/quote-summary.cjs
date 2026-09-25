'use strict';
const SA=require('../section-access.js');
// Only section names leave the server; no prices, formulas or free-text history.
function updateSummary(before,after){
 if(!before)return 'Tạo báo giá';
 const a=before.quote,b=after.quote;
 if(a.status!==b.status)return b.status==='approved'?'Duyệt báo giá':b.status==='submitted'?'Gửi duyệt':'Mở bản sửa';
 const changed=SA.denied(before,after,{sections:[],factors:false}).filter(k=>!k.startsWith('catalog'));
 return changed.length?'Cập nhật: '+changed.map(k=>SA.labels[k]||k).join(', '):'Lưu bản nháp';
}
module.exports={updateSummary};
