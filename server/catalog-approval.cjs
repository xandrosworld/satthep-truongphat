'use strict';
const C=require('../core.js'),{isDeepStrictEqual:equal}=require('node:util'),{shapeMeaning}=require('./formula-sync.cjs');
const fold=value=>String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('vi');
function duplicates(before,after){const found=[];
 for(const kind of ['shapeDefinitions','rules','rates']){const rows=after[kind]||[],old=before[kind]||[];for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
  const a=rows[i],b=rows[j],key=x=>[fold(x.name),fold(x.productGroup),x.base||x.shape||'',kind==='rates'?x.unit||'':''].join('|');
  if(!fold(a.name)||a.id===b.id||key(a)!==key(b))continue;
  if(old.some(x=>x.id===a.id&&key(x)===key(a))&&old.some(x=>x.id===b.id&&key(x)===key(b)))continue;
  found.push({kind,name:a.name,ids:[a.id,b.id]});
 }}return found;
}
function approvedShape(definition,master){return [...master.shapeDefinitions||[],...(master.materials||[]).map(m=>m.shapeDefinition).filter(Boolean)].some(published=>published.id===definition?.id&&equal(shapeMeaning(definition),shapeMeaning(published)));}
function guardQuote(before,after,master){const previous=new Map(C.flatten(before?.quote?.products||[]).map(n=>[n.id,n]));
 for(const n of C.flatten(after.quote.products||[])){if(n.kind!=='material')continue;const old=previous.get(n.id),d=n.spec?.shapeDefinition;
  if(d){if(equal(d,old?.spec?.shapeDefinition)||approvedShape(d,master))continue;throw Error('Hình dạng / công thức '+(d.name||d.id)+' chưa được Admin duyệt. Gửi khai báo tại Danh mục quy ước và chờ duyệt trước khi áp dụng.');}
  const r=n.ruleSpec;if(!r||equal(r,old?.ruleSpec))continue;const published=master.rules?.find(x=>x.id===r.id),formula=x=>({length:x?.length,width:x?.width,formulas:x?.formulas});if(!published||!equal(formula(r),formula(published)))throw Error('Quy tắc '+(r.name||r.id)+' chưa được Admin duyệt.');
 }
}
function materialUsesUnapprovedShape(before,after,master){return (after.materials||[]).some(m=>m.shapeDefinition&&!equal(m.shapeDefinition,before.materials?.find(x=>x.id===m.id)?.shapeDefinition)&&!approvedShape(m.shapeDefinition,master));}
module.exports={duplicates,guardQuote,materialUsesUnapprovedShape};
