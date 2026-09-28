'use strict';
function reviewed(sql,j){const row=sql.prepare("SELECT document FROM ops_records WHERE kind='production-dossier' AND id=?").get(j.id);return !!(row&&JSON.parse(row.document).reviewed);}
function requireReview(sql,j,fail){
 // Historical jobs already in progress are not rolled back to preparation.
 if(j.state!=='ready')return;
 if(!reviewed(sql,j))fail(409,'Rà soát và xác nhận hồ sơ kỹ thuật trước khi triển khai sản xuất');
}
function flowConfirmation(sql,j){
 if(j.packet.flowApproved)return j.packet.flowApproved;
 const row=sql.prepare("SELECT document FROM ops_records WHERE kind='production-dossier' AND id=?").get(j.id);
 const d=row&&JSON.parse(row.document);
 if(!d||!(d.confirmations?.operations||d.reviewChecks?.operations===true||d.reviewed))return null;
 const c=d.confirmations?.operations||d.reviewed;
 return {source:'dossier',at:c?.at||'',technical:c?.actor||'',admin:'',label:'Công đoạn đã xác nhận trong hồ sơ sản xuất'};
}
module.exports={requireReview,reviewed,flowConfirmation};
