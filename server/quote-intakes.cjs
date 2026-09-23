'use strict';
const C=require('../core.js'),P=require('../pricing-core.js'),I=require('../intake-core.js');
function createQuoteIntakes({all,one,getQuote,saveQuote,readBody,fail}){
 const view=row=>{const q=JSON.parse(row.document).quote;return {id:row.id,version:row.version,status:row.status,code:row.code,customer:q.customer,customerInfo:q.customerInfo,project:q.project,date:q.date,request:q.request||{items:[],files:[]},updated:row.updated};};
 return async({req,route,user,rights,send})=>{
  const match=route.match(/^\/api\/quote-intakes(?:\/([a-f0-9-]+))?$/);if(!match)return false;
  if(!rights.customers)fail(403,'Không có quyền khai báo đầu vào báo giá');
  const id=match[1];if(req.method==='GET'){send(200,id?view(getQuote(id)):all('SELECT * FROM quotes WHERE id NOT IN (SELECT id FROM quote_deletions) ORDER BY updated DESC').map(view));return true;}
  if(req.method!==(id?'PUT':'POST'))fail(405,'Phương thức không hỗ trợ');
  const b=await readBody(req),allowed=['expectedVersion','customerInfo','project','date','request'];if(Object.keys(b).some(k=>!allowed.includes(k)))fail(400,'Chỉ được khai thông tin đầu vào');
  const old=id?getQuote(id):null;if(old&&old.status!=='draft')fail(409,'Báo giá đã trình hoặc duyệt; không sửa đầu vào bản đã khóa');
  let info,request;try{info=I.customerSnapshot(I.customer(b.customerInfo||{}));const r=b.request||{},keys=['code','notes','items','files','links','recipient','location','quoteDeadline','schedule'];if(Object.keys(r).some(k=>!keys.includes(k)))throw Error('Thông tin yêu cầu không hợp lệ');request={...r,items:(r.items||[]).map(I.requestLine),files:r.files||[],links:(r.links||[]).map(I.documentLink)};I.validateRequest({customerInfo:info,request});}catch(e){fail(400,e.message);}
  if(typeof b.project!=='string'||b.project.length>500)fail(400,'Tên dự án tối đa 500 ký tự');
  for(const f of request.files){const file=one('SELECT id,actor FROM intake_files WHERE id=?',f.id);if(f.storage!=='server'||!file||file.actor!==user.id&&!JSON.parse(old?.document||'{}').quote?.request?.files?.some(x=>x.id===f.id))fail(403,'Tệp không thuộc yêu cầu đang khai');}
  let d;if(old)d=JSON.parse(old.document);else{const master=JSON.parse(one('SELECT document FROM catalog WHERE id=1').document);d=P.demoSeed();Object.assign(d,master);d.quote={id:'AUTO',date:b.date,customer:'',project:'',products:[],status:'draft',ratesSnapshot:C.copy(master.rates),pricing:C.copy(master.pricingDefaults),expenses:[],remnantMode:'all',remnantSelections:{},notes:'',vat:0,valid:30};}
  Object.assign(d.quote,{customer:info.name,customerInfo:info,project:b.project.trim(),request});if(!old)d.quote.date=b.date;
  const saved=saveQuote(id||null,d,user,b.expectedVersion,'draft',old?'Cập nhật đầu vào báo giá':'Khai báo yêu cầu đầu vào',!old);
  send(old?200:201,{id:saved.id,version:saved.version,status:saved.status});return true;
 };
}
module.exports={createQuoteIntakes};
