/* Closing quotation workflow and catalog gaps. Pure helpers shared with server/tests. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const STATES=[['draft','Nháp'],['sent','Đã gửi'],['negotiating','Đàm phán'],['accepted','Khách chấp nhận'],['rejected','Từ chối'],['expired','Hết hạn']];
const todayVN=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const NEXT={draft:['sent'],sent:['negotiating','accepted','rejected','expired'],negotiating:['sent','accepted','rejected','expired'],accepted:['negotiating'],rejected:['negotiating','sent'],expired:['sent','negotiating','rejected']};
const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
function expiry(q){if(q.validUntil)return q.validUntil;const d=new Date(q.date+'T00:00:00Z');if(!Number.isFinite(d.getTime()))return '';d.setUTCDate(d.getUTCDate()+Number(q.valid||0));return d.toISOString().slice(0,10);}
function workflow(q,state={},today=todayVN(),offerVersion=0){const changed=offerVersion&&state.offerVersion&&state.offerVersion!==offerVersion,saved=changed?'draft':state.status||'draft',due=changed?expiry(q):state.validUntil||expiry(q);return {...state,status:['sent','negotiating'].includes(saved)&&due&&today>due?'expired':saved,storedStatus:saved,version:state.version||0,validUntil:due,events:state.events||[]};}
function transition(q,state,input,actor,{today=todayVN(),at=new Date().toISOString(),offerVersion=0}={}){
  const current=workflow(q,state,today,offerVersion),next=String(input.status||'');if(!STATES.some(x=>x[0]===next))throw Error('Trạng thái giao dịch không hợp lệ');
  if(input.expectedVersion!==current.version)throw Error('Giao dịch đã được người khác cập nhật; tải lại trước khi sửa');
  const resend=next==='sent'&&current.status==='sent'&&input.resend===true;
  if(next===current.status&&!resend)throw Error('Trạng thái này đã được ghi nhận');
  if(next!=='draft'&&q.status!=='approved')throw Error('Cần bản giá đã duyệt trước khi ghi nhận giao dịch');
  const allowed=NEXT;
  if(!resend&&!allowed[current.status]?.includes(next))throw Error('Bước giao dịch không phù hợp với trạng thái hiện tại');
  const reason=String(input.reason||'').trim();if(!reason)throw Error('Ghi nội dung trao đổi / căn cứ thay đổi');
  const validUntil=input.validUntil||current.validUntil;if(!validDate(validUntil))throw Error('Ngày hiệu lực không hợp lệ');
  if(['sent','negotiating','accepted'].includes(next)&&validUntil<today)throw Error('Bản chào hết hiệu lực; xác nhận ngày gia hạn trước khi tiếp tục');
  if(next==='sent'&&!input.confirmedSent)throw Error('Chỉ ghi Đã gửi sau khi thực sự chuyển bản chào cho khách');
  return {status:next,validUntil,offerVersion,version:current.version+1,events:[...current.events,{from:current.status,to:next,reason:reason.slice(0,1500),actor:String(actor).slice(0,100),at,offerVersion,validUntil,recipient:String(input.recipient||'').trim().slice(0,300),channel:String(input.channel||'').trim().slice(0,100),...(resend?{resend:true}:{})}]};
}
function filterQuotes(rows,f={}){const query=fold(f.search),status=f.status||'',from=f.from||'',to=f.to||'';return rows.filter(r=>{const day=String(r.date||r.updated||'').slice(0,10);return (!query||fold([r.code||r.id,r.customer,r.project].join(' ')).includes(query))&&(!status||(r.commercialStatus||'draft')===status)&&(!from||day>=from)&&(!to||day<=to);});}
function priceFor(material,book=[]){if(material.group==='Linh kiện, thiết bị'||material.brand)return {value:material.price,source:'code'};const candidates=book.filter(r=>fold(r.substance)===fold(material.substance)&&(!r.grade||fold(r.grade)===fold(material.grade))&&(!r.unit||r.unit===material.unit)),specific=candidates.filter(r=>r.grade),selected=specific.length?specific:candidates.filter(r=>!r.grade);if(selected.length>1)throw Error('Bảng giá vật liệu/mác trùng phạm vi');if(!selected.length)return {value:material.price,source:'code'};const row=selected[0];if(row.price===null||row.price===''||!Number.isFinite(Number(row.price))||Number(row.price)<0)throw Error('Đơn giá vật liệu chưa hợp lệ');return {value:Number(row.price),source:row.grade?'grade':'substance'};}
function references(db,kind,id){const found=new Map(),documents=[db.quote,...(db.savedQuotes||[]).map(x=>x.quote),...(db.history||[]).map(x=>x.quote)];
  for(const q of documents){if(!q)continue;for(const n of C.flatten(q.products||[])){if(kind==='materials'&&n.materialId===id||kind==='rules'&&n.rule===id||kind==='rates'&&(n.ops||[]).some(o=>o.id===id)||kind==='library'&&n.templateId===id)found.set((q.workspaceKey||q.id)+':'+n.id,(q.id||'Báo giá')+' / '+n.name);}}
  for(const template of db.library||[])for(const n of C.flatten([template]))if(kind==='materials'&&n.materialId===id||kind==='rules'&&n.rule===id||kind==='rates'&&(n.ops||[]).some(o=>o.id===id)||kind==='library'&&n.templateId===id)found.set('template:'+template.id+':'+n.id,'Mẫu '+template.name);
  if(kind==='materials')for(const rate of [...db.rates,...(db.quote.ratesSnapshot||[])])for(const recipe of rate.consumptions||[rate.consumption].filter(Boolean))if(recipe.spec?.id===id)found.set('rate:'+rate.id,'Định mức '+rate.name);
  return [...found.values()];
}
function removeCatalog(db,kind,id){if(!['materials','rates','rules','library'].includes(kind))throw Error('Danh mục không hợp lệ');const uses=references(db,kind,id);if(uses.length)throw Error('Đang dùng tại '+uses.length+' vị trí: '+uses.slice(0,3).join('; '));const i=db[kind].findIndex(x=>x.id===id);if(i<0)throw Error('Không tìm thấy mã');db[kind].splice(i,1);}
function priceSnapshot(db){return {conventionPrices:Object.fromEntries(Object.entries(db.conventions||{}).map(([k,rows])=>[k,rows.filter(r=>r.price!==undefined).map(r=>({name:r.name,price:r.price}))])),materialPrices:C.copy(db.materialPrices||[]),materials:db.materials.map(m=>({id:m.id,price:m.price})),rates:db.rates.map(r=>({id:r.id,inside:r.inside,outside:r.outside,insideUnit:r.insideUnit, outsideUnit:r.outsideUnit,...(r.priceOptions?{priceOptions:r.priceOptions.map(x=>({id:x.id,inside:x.inside,outside:x.outside,insideUnit:x.insideUnit,outsideUnit:x.outsideUnit}))}:{})}))};}
function restorePrices(db,baseline){if(!baseline)throw Error('Chưa có mốc giá trước khi sửa');db.materialPrices=C.copy(baseline.materialPrices||[]);for(const [kind,rows]of Object.entries(baseline.conventionPrices||{}))for(const r of rows){const item=db.conventions?.[kind]?.find(x=>x.name===r.name);if(item)item.price=r.price;}for(const kind of ['materials','rates'])for(const saved of baseline[kind]||[]){const item=db[kind].find(i=>i.id===saved.id);if(item){const fields=C.copy(saved);delete fields.priceOptions;Object.assign(item,fields);for(const price of saved.priceOptions||[]){const option=item.priceOptions?.find(x=>x.id===price.id);if(option)Object.assign(option,C.copy(price));}}}}
const api={STATES,NEXT,todayVN,validDate,fold,expiry,workflow,transition,filterQuotes,priceFor,references,removeCatalog,priceSnapshot,restorePrices};
if(typeof module!=='undefined')module.exports=api;else root.TPComplete=api;
})(typeof window!=='undefined'?window:globalThis);
