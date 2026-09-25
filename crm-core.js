(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const SC=typeof module!=='undefined'?require('./customer-scoring-core.js'):root.TPCustomerScoring;
const CF=typeof module!=='undefined'?require('./customer-fields-core.js'):root.TPCustomerFields;
const STATUS={active:'Đang hoạt động',paused:'Tạm dừng',inactive:'Ngừng giao dịch'},TYPES={unknown:'Chưa phân loại',company:'Công ty',individual:'Khách lẻ'},RATINGS={unrated:'Chưa đánh giá',new:'Mới',regular:'Thông thường',vip:'VIP',risk:'Rủi ro'},STAGES={new:'Mới',qualifying:'Đang làm rõ',quoted:'Đã chào giá',won:'Thành công',lost:'Không thành công'};
const text=(v,max=2000)=>String(v??'').trim().slice(0,max),one=(value,choices,fallback)=>{const v=value||fallback;if(!Object.hasOwn(choices,v))throw Error('Giá trị phân loại không hợp lệ');return v;};
const day=at=>new Date(Date.parse(at)+7*3600000).toISOString().slice(0,10);
function date(v){if(!v)return '';if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error('Ngày chưa hợp lệ');return v;}
function profile(v){return {account:CF.account(v.account),status:one(v.status,STATUS,'active'),type:one(v.type,TYPES,'unknown'),rating:one(v.rating,RATINGS,'unrated'),ratingReason:text(v.ratingReason),ownerId:text(v.ownerId,100),industry:text(v.industry,200),source:text(v.source,200),notes:text(v.notes,10000),nextCareDate:date(v.nextCareDate)};}
function policy(v={}){const integer=(x,label)=>{if(x===''||x==null)return null;const n=Number(x);if(!Number.isInteger(n)||n<1||n>100000)throw Error(label+' phải là số nguyên dương');return n;};const factors={};for(const key of Object.keys(RATINGS)){const x=v.factors?.[key];if(x===''||x==null)factors[key]=null;else {if(!Number.isFinite(Number(x))||Number(x)<=-100||Number(x)>1000)throw Error('Hệ số phải lớn hơn -100% và không quá 1000%');factors[key]=Number(x);}}return {scoring:SC.config(v.scoring),careLevels:SC.careConfig(v.careLevels),fields:CF.settings(v.fields),vipOrders:integer(v.vipOrders,'Ngưỡng đơn hàng VIP'),careDays:integer(v.careDays,'Số ngày chăm sóc'),riskCriteria:text(v.riskCriteria,4000),factors};}
function update(value,action,data,actor,at=new Date().toISOString()){
 const c=C.copy(value),event={id:C.uid(),at,actorId:actor.id||'',actor:actor.name||'Trên máy',kind:action};c.events??=[];c.opportunities??=[];
 if(action==='interaction'){event.channel=one(data.channel,{call:1,meeting:1,email:1,message:1,other:1},'other');event.content=text(data.content,10000);if(!event.content)throw Error('Nhập nội dung trao đổi');event.occurredOn=date(data.occurredOn)||day(at);if(event.occurredOn>day(at))throw Error('Trao đổi đã thực hiện không được nằm trong tương lai');c.nextCareDate=date(data.nextCareDate);}
 else if(action==='score'){const evaluated=SC.evaluate(data.policy.scoring,data.answers);const reason=text(data.reason,4000);if(!reason)throw Error('Ghi căn cứ đánh giá');event.content='Chấm điểm khách hàng: '+evaluated.total+'/100 · '+evaluated.rank;event.reason=reason;event.result={...evaluated,policyVersion:data.policy.version||0};c.scorecard={...event.result,at,actor:event.actor,reason};}
 else if(action==='opportunity'){const previous=c.opportunities.find(o=>o.id===data.id),o={id:previous?.id||C.uid(),title:text(data.title,200),description:text(data.description,5000),stage:one(data.stage,STAGES,'new'),dueDate:date(data.dueDate),value:data.value==null||data.value===''?null:Number(data.value),createdAt:previous?.createdAt||at,updatedAt:at};if(!o.title)throw Error('Nhập tên cơ hội');if(o.value!==null&&(!Number.isFinite(o.value)||o.value<0))throw Error('Giá trị cơ hội phải không âm');if(data.id&&!previous)throw Error('Không tìm thấy cơ hội');c.opportunities=c.opportunities.filter(x=>x.id!==o.id).concat(o);event.content=(previous?'Cập nhật':'Tạo')+' cơ hội: '+o.title;event.opportunityId=o.id;event.before=previous||null;event.after=o;}
 else if(action==='assign'){event.reason=text(data.reason);if(!event.reason)throw Error('Ghi lý do điều chuyển');event.from=c.ownerId||'';event.to=text(data.ownerId,100);if(event.from===event.to)throw Error('Người phụ trách chưa thay đổi');c.ownerId=event.to;event.content='Điều chuyển người phụ trách';}
 else throw Error('Thao tác khách hàng không hợp lệ');
 c.events.push(event);c.updatedAt=at;return c;
}
function assessment(c,p={},stats={},now=new Date().toISOString()){
 const care=SC.care(c,p,now),last=care.last,days=care.days,today=day(now);return {care,lastCare:last||'',days,overdue:c.status!=='inactive'&&((['overdue','critical'].includes(care.level))||(!!c.nextCareDate&&c.nextCareDate<today)||(p.careDays!=null&&days!==null&&days>=p.careDays)),suggested:stats.orderCount!=null?(p.vipOrders!=null&&stats.orderCount>=p.vipOrders?'vip':stats.orderCount===0?'new':'regular'):null,factor:p.factors?.[c.rating]??null};
}
function saveProfile(old,value,actor,at=new Date().toISOString()){
 if(['vip','risk'].includes(value.rating)&&!value.ratingReason)throw Error('Ghi căn cứ đánh giá VIP hoặc rủi ro');
 const event={id:C.uid(),kind:'profile',at,actorId:actor.id||'',actor:actor.name||'Trên máy',content:old?'Cập nhật hồ sơ khách hàng':'Tạo hồ sơ khách hàng',before:old?Object.fromEntries(Object.keys(value).map(k=>[k,old[k]])):null,after:C.copy(value)};
 return {...value,...(old?.scorecard?{scorecard:C.copy(old.scorecard)}:{}),createdAt:old?.createdAt||at,updatedAt:at,events:[...(old?.events||[]),event],opportunities:C.copy(old?.opportunities||[])};
}
const api={STATUS,TYPES,RATINGS,STAGES,profile,policy,update,assessment,saveProfile};if(typeof module!=='undefined')module.exports=api;else root.TPCrm=api;
})(typeof window!=='undefined'?window:globalThis);
