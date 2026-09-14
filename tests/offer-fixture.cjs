'use strict';
// Synthetic QA authorization, never a statement of customer approval.
module.exports=q=>{q.issuer??={name:'QA issuer'};require('../offer-terms-core.js').save(q,{signature:'none',delivery:'Giao theo phạm vi QA',installation:'Lắp theo phạm vi QA',payment:'Điều kiện QA',warranty:'Không áp dụng cho dữ liệu thử',scope:'Giá QA trọn phạm vi đã khai',reason:'Synthetic QA authorization only'},true);};
