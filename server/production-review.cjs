'use strict';
function reviewed(sql,j){const row=sql.prepare("SELECT document FROM ops_records WHERE kind='production-dossier' AND id=?").get(j.id);return !!(row&&JSON.parse(row.document).reviewed);}
function requireReview(sql,j,fail){
 // Historical jobs already in progress are not rolled back to preparation.
 if(j.state!=='ready')return;
 if(!reviewed(sql,j))fail(409,'Rà soát và xác nhận hồ sơ kỹ thuật trước khi triển khai sản xuất');
}
module.exports={requireReview,reviewed};
