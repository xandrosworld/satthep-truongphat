'use strict';
const A=require('../action-access.js'),SA=require('../section-access.js');
function requireAction(user,key,action,fail){if(!A.allows(user,key,action))fail(403,'Chưa được cấp quyền '+(A.labels[action]||action)+' — '+(A.schema[key]?.[0]||key));}
function guardRoute(route,method,user,fail){
 if(user.role==='admin'||!A.explicit(user))return;
 const read=['GET','HEAD'].includes(method),need=(k,a)=>requireAction(user,k,a,fail);
 if(/^\/api\/(quotes|quote-intakes)(\/|$)/.test(route)){
  need('quotes','view');if(read)return;
  if(/\/followup\/assign$/.test(route))return need('quotes','assign');
  if(/\/order$/.test(route))return need('orders','create');
  const action=/\/approve$/.test(route)?'approve':/\/submit$/.test(route)?'submit':/\/(reopen|restore)$/.test(route)?'reopen':/\/handoff\//.test(route)?'confirm':/\/work$/.test(route)?'assign':method==='DELETE'?'delete':/^\/api\/(quotes|quote-intakes)$/.test(route)?'create':'edit';return need('quotes',action);
 }
 if(/^\/api\/orders(\/|$)/.test(route))return need('orders',read?'view':/\/confirm$/.test(route)?'confirm':'edit');
 if(/^\/api\/production(\/|$)/.test(route))return need('production',read?'view':method==='POST'?'issue':'view');
 if(/^\/api\/personnel(\/|$)/.test(route)&&route!=='/api/personnel/access'){need('personnel','view');if(route.endsWith('/activation'))need('personnel','activate');if(route.endsWith('/review'))need('personnel','review');return;}
 if(/^\/api\/chat(\/|$)/.test(route))return need('chat',read||/\/read$/.test(route)?'view':'send');
 if(route==='/api/my-quote-work'||route==='/api/access/calculate'||route==='/api/operation-catalog')return need('quotes','view');
 if(/^\/api\/intake\/(customers|owners|policy)(\/|$)/.test(route)){need('customers','view');if(!read&&route.endsWith('/import'))need('customers','import');else if(!read&&route!=='/api/intake/customers')need('customers','edit');return;}
 if(/^\/api\/intake\/(offer-templates|files|cost-price-references)/.test(route))return need('quotes',read?'view':'edit');
 if(route.startsWith('/api/business/')){
  const p=route.slice(14),part=p.split('/')[0];
  if(['orders','contracts','payments','costs','profile','files','customers'].includes(part)){
   const key=part==='files'?'profile':part;need(key,'view');if(read)return;
   const action=/\/(cancel|delete|void)$/.test(p)?'delete':p.endsWith('/deliver')?'confirm':p.endsWith('/review-costs')?'approve':part==='payments'||part==='costs'||part==='files'?'create':part==='contracts'?(p.includes('/')?'edit':'create'):part==='profile'?'view':'edit';
   return need(p.endsWith('/review-costs')?'costs':key,action);
  }
  if(part==='commission-policies'||p.endsWith('/commission')){if(user.role!=='admin')fail(403,'Chỉ quản trị khai chính sách hưởng');}
 }
}
function guardBody(req,body,user,sql,fail){
 if(user.role==='admin'||!A.explicit(user))return;
 const route=new URL(req.url,'http://localhost').pathname,need=(k,a)=>requireAction(user,k,a,fail);
 if(route==='/api/intake/customers')need('customers',sql.prepare('SELECT 1 FROM intake_customers WHERE id=?').get(body.customer?.id||'')?'edit':'create');
 if(route==='/api/intake/customers/import')for(const row of body.rows||[])need('customers',sql.prepare('SELECT 1 FROM intake_customers WHERE id=?').get(row.customer?.id||'')?'edit':'create');
 if(route==='/api/personnel/submit')need('personnel',body.employeeId?'edit':'create');
 if(route==='/api/business/contracts'||/^\/api\/business\/contracts\/[^/]+$/.test(route)){if(body.document?.status==='cancelled')need('contracts','edit');}
 if(/^\/api\/production\/[^/]+$/.test(route)&&req.method==='PUT')need('production',body.action==='qc'?'qc':body.action==='complete'?'complete':'edit');
 if(route==='/api/business/profile'&&req.method==='POST'){
  const row=sql.prepare("SELECT document FROM business_records WHERE kind='profile' AND id='company'").get(),old=row?JSON.parse(row.document):{},next=body.document||{};
  if(!SA.equal(old.company||{},next.company||{}))need('profile','edit');
  for(const key of ['machines','staff','certificates','projects'])listChanges(old[key]||[],next[key]||[],a=>need('profile',a));
 }
}
function listChanges(before,after,need){const indexed=rows=>rows.map((x,i)=>[x?.id||'index:'+i,x]);const old=new Map(indexed(before)),next=new Map(indexed(after));if(old.size!==before.length||next.size!==after.length)throw Object.assign(Error('Mã dòng danh mục bị trùng'),{status:400});for(const [id,x]of next){if(!old.has(id))need('create');else if(!SA.equal(old.get(id),x))need('edit');}for(const id of old.keys())if(!next.has(id))need('delete');if(!SA.equal([...old.keys()].filter(k=>next.has(k)),[...next.keys()].filter(k=>old.has(k))))need('edit');}
function guardCatalog(before,after,user,fail){
 if(user.role==='admin'||!A.explicit(user))return;
 const need=(key,a)=>requireAction(user,key,a,fail),mapping={materials:'catalogMaterials',materialPrices:'catalogMaterials',stockSizes:'catalogMaterials',library:'catalogLibrary',rules:'catalogRules',shapeDefinitions:'catalogRules'};
 for(const [field,key]of Object.entries(mapping))if(!SA.equal(before[field],after[field]))listChanges(before[field]||[],after[field]||[],a=>need(key,a));
 const technical=['id','name','machine','technicalNotes'];
 for(const [key,fields]of [['catalogTechnicalOperations',true],['catalogOperations',false]]){const pick=r=>Object.fromEntries(Object.entries(r).filter(([k])=>k==='id'||technical.includes(k)===fields));listChanges((before.rates||[]).map(pick),(after.rates||[]).map(pick),a=>need(key,a));}
 if(!SA.equal(before.conventions,after.conventions))need('catalogRules','edit');
 for(const key of new Set([...Object.keys(before.pricingDefaults||{}),...Object.keys(after.pricingDefaults||{})]))if(!SA.equal(before.pricingDefaults?.[key],after.pricingDefaults?.[key]))need(['expenseRates','incoming','outgoing','delivery','install'].includes(key)?'catalogLogistics':'catalogOperations','edit');
}
module.exports={requireAction,guardRoute,guardBody,guardCatalog};
