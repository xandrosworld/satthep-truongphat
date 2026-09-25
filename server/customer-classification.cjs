'use strict';
const C=require('../core.js');
function allowed(p){return !!(p.edit&&p.costs&&(p.sections.includes('customer')||p.sections.includes('factors')||p.sectionModes?.factors==='use'));}
// This baseline is only supplied by the server-owned choice route, never by a document payload.
function baseline(document,choice){if(!choice)return document;const d=C.copy(document);d.quote.pricing.customer=Number(((choice.multiplier-1)*100).toFixed(6));d.quote.pricing.policySelections??={};d.quote.pricing.policySelections.customer=C.copy(choice);return d;}
function create({getQuote,one,readBody,saveQuote,fail}){return async({req,route,user,rights,send})=>{
 const m=route.match(/^\/api\/quotes\/([a-f0-9-]+)\/customer-classification$/);if(!m)return false;
 if(!rights.costs||rights.sectionModes?.commercial==='none')fail(403,'Không có quyền xem phân loại khách hàng trong báo giá');
 const q=getQuote(m[1]),document=JSON.parse(q.document),master=JSON.parse(one('SELECT document FROM catalog WHERE id=1').document);
 const rows=(master.pricingDefaults?.policyTypes?.customer||[]).filter(x=>x.enabled!==false&&typeof x.name==='string'&&Number.isFinite(x.multiplier)&&x.multiplier>0&&x.multiplier<=100);
 if(req.method==='GET'){send(200,{version:q.version,selection:document.quote.pricing?.policySelections?.customer?.name||'',choices:rows.map(x=>({name:x.name,description:x.description||''})),canDeclare:allowed(rights)&&q.status==='draft'});return true;}
 if(req.method!=='POST')fail(405,'Phương thức không hỗ trợ');
 if(!allowed(rights))fail(403,'Cần quyền khai báo đầu vào hoặc sử dụng hệ số');
 if(q.status!=='draft')fail(409,'Bản đã trình/duyệt đang khóa; cần mở bản sửa trước');
 const b=await readBody(req);if(Object.keys(b).some(k=>!['name','expectedVersion'].includes(k)))fail(400,'Chỉ nhận lựa chọn loại khách hàng');
 const matches=rows.filter(x=>x.name===b.name);if(matches.length!==1)fail(400,'Chọn một loại khách hàng có trong danh mục đã phát hành');
 const choice=matches[0],saved=saveQuote(q.id,baseline(document,choice),user,b.expectedVersion,'draft','Chọn phân loại khách hàng: '+choice.name,false,choice);
 send(200,saved);return true;
};}
module.exports={allowed,baseline,create};
