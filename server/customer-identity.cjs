'use strict';
const identity=x=>String(x??'').normalize('NFKC').trim().toLowerCase().replace(/[\s.-]/g,'');
const name=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z0-9]/g,'');
function conflict(a,b){
 if(a.id===b.id)return '';
 const taxA=identity(a.taxId),taxB=identity(b.taxId),code=identity(a.account?.code);
 if(taxA&&taxA===taxB)return 'mã số thuế';
 if(code&&code===identity(b.account?.code))return 'mã khách hàng';
 if(name(a.name)&&name(a.name)===name(b.name)&&!(taxA&&taxB&&taxA!==taxB))return 'tên khách hàng';
 return '';
}
module.exports={conflict};
