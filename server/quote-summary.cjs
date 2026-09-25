'use strict';
const SA=require('../section-access.js');
const {createHash}=require('node:crypto'),summaries=new Map();
// Only section names leave the server; no prices, formulas or free-text history.
function updateSummary(before,after){
 if(!before)return 'Tạo báo giá';
 const a=before.quote,b=after.quote;
 if(a.status!==b.status)return b.status==='approved'?'Duyệt báo giá':b.status==='submitted'?'Gửi duyệt':'Mở bản sửa';
 const key=createHash('sha256').update(JSON.stringify(before)).update('\n').update(JSON.stringify(after)).digest('hex');
 if(summaries.has(key))return summaries.get(key);
 const changed=SA.denied(before,after,{sections:[],factors:false}).filter(k=>!k.startsWith('catalog'));
 const label=changed.length?'Cập nhật: '+changed.map(k=>SA.labels[k]||k).join(', '):'Lưu bản nháp';
 if(summaries.size>=512)summaries.delete(summaries.keys().next().value);summaries.set(key,label);return label;
}
module.exports={updateSummary};
