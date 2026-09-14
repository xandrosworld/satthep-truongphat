/* Explicit quote tax declarations. No tax rate or tax treatment is inferred. */
(function(root){
'use strict';
const Cost=typeof module!=='undefined'?require('./cost-input-core.js'):root.TPCostInput;
const valid=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const rate=v=>valid(v)&&Number(v)>=0&&Number(v)<=100;
function stable(value){if(Array.isArray(value))return value.map(stable);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,stable(value[k])]));return value;}
function identity(q){return JSON.stringify(stable({id:q.id,date:q.date,customer:q.customer,project:q.project}));}
function costSignature(q){
  const pricing={...q.pricing};delete pricing.taxReview;delete pricing.selected;delete pricing.overrides;
  const products=JSON.parse(JSON.stringify(q.products||[]));for(const n of products){delete n.pricePerKg;delete n.competitorPrice;delete n.marketPrice;delete n.marketSource;}
  return JSON.stringify(stable({products,rates:q.ratesSnapshot,expenses:q.expenses,devices:q.deviceInstallations,pricing,costSources:q.costPriceSources,kerf:q.kerf,remnantMode:q.remnantMode,remnantSelections:q.remnantSelections,remnantRules:q.remnantRules,operationMethods:q.operationMethods}));
}
function input(value,declaration){
  const d=declaration||{},matches=valid(value)&&valid(d.value)&&Number(value)===Number(d.value);
  const known=matches&&['excluded','included'].includes(d.status)&&(d.status!=='included'||rate(d.rate));
  return {known,status:known?d.status:'unknown',rate:known&&d.status==='included'?Number(d.rate):null,original:value,
    net:known?Number(value)/(d.status==='included'?1+Number(d.rate)/100:1):null};
}
function declaration(q,node,method){const d=q.pricing?.taxReview?.inputs?.[node.id]?.[method],value=node[method==='kg'?'pricePerKg':method==='market'?'marketPrice':'competitorPrice'];return input(value,method==='market'&&(!String(node.marketSource||'').trim()||d?.source!==node.marketSource)?null:d);}
function review(q,data,at=new Date().toISOString()){
  if(['approved','submitted'].includes(q.status))throw Error('Bản đã khóa; tạo bản sửa trước');
  if(!q.pricing)throw Error('Cần báo giá bốn phương án');
  if(!String(data.reason||'').trim())throw Error('Ghi căn cứ đối chiếu giá và thuế');
  if(data.outputConfirmed&&!rate(q.vat))throw Error('Thuế suất đầu ra chưa hợp lệ');
  const inputs={};for(const n of q.products){inputs[n.id]={};for(const m of ['kg','competitor','market']){
    const d=data.inputs?.[n.id]?.[m]||{status:'unknown'},value=n[m==='kg'?'pricePerKg':m==='market'?'marketPrice':'competitorPrice'];
    if(!['unknown','excluded','included'].includes(d.status))throw Error('Trạng thái thuế không hợp lệ');
    if(d.status!=='unknown'&&(!valid(value)||Number(value)<0))throw Error(n.name+': cần giá không âm');
    if(d.status==='included'&&!rate(d.rate))throw Error(n.name+': nhập thuế suất đã nằm trong giá');
    if(m==='market'&&d.status!=='unknown'&&!String(n.marketSource||'').trim())throw Error(n.name+': cần nguồn giá thị trường');
    inputs[n.id][m]={status:d.status,value:value??null,rate:d.status==='included'?Number(d.rate):null,...(m==='market'?{source:n.marketSource||''}: {})};
  }}
  if(data.costConfirmed)Cost.confirmNet(q,String(data.reason).trim(),at);
  q.pricing.taxReview={inputs,quoteIdentity:identity(q),outputRate:data.outputConfirmed?Number(q.vat):null,costSignature:data.costConfirmed?costSignature(q):null,reason:String(data.reason).trim(),at};
  return q.pricing.taxReview;
}
function assess(q,result){
  const d=q.pricing?.taxReview||{},costKnown=d.costSignature===costSignature(q)&&!!String(d.reason||'').trim()&&Cost.view(q).every(r=>r.tmcOnly||r.known),outputKnown=d.quoteIdentity===identity(q)&&rate(d.outputRate)&&Number(d.outputRate)===Number(q.vat),methods={};
  const detail=result.alternatives.detail;
  // A disjoint reference set: direct work excludes material/freight; management
  // is separate, never subtracted a second time through the production subtotal.
  const t=detail.total,referenceParts={material:t.material,work:t.parts.factory+t.parts.outside+t.parts.tmcCommon,
    productionExtras:t.overhead+t.special+t.productionExtras,management:t.management,
    incoming:t.parts.incoming,outgoing:t.parts.outgoing,delivery:t.parts.delivery,install:t.parts.install,processing:t.processing};
  const reference=Object.values(referenceParts).reduce((s,v)=>s+v,0);
  const pct=(delta,base)=>base>0?delta/base*100:null;
  for(const [id,a]of Object.entries(result.alternatives)){
    const inputs=id==='kg'||id==='competitor'?q.products.map(n=>({nodeId:n.id,name:n.name,...declaration(q,n,id)})):[];
    const reasons=[];
    if(id==='tmc'){
      reasons.push(...(result.tmcPolicyErrors||[]));
      const used=new Set(a.products.flatMap(p=>(p.tmc?.items||[]).flatMap(i=>['tmc:'+i.tableId+':'+i.bound.index,'tmc:'+i.tableId+':ancillary','tmc:'+i.tableId+':common'])));
      if(Cost.view(q).some(r=>used.has(r.key)&&!r.known))reasons.push('TMC: chưa khai nguồn giá/thuế của bậc nhân công hoặc khoản tiền đang dùng');
      if(!costKnown)reasons.push('TMC: đầu vào chi phí chưa xác nhận mặt bằng thuế hoặc đã đổi');
    }
    if(id==='detail'&&!costKnown)reasons.push('Chưa xác nhận các đầu vào tính toán cùng mặt bằng chưa thuế, hoặc đầu vào đã đổi');
    if(inputs.some(i=>!i.known))reasons.push('Chưa khai đủ điều kiện thuế từng giá, hoặc giá đã đổi');
    if(!a.ready)reasons.push('Còn dữ liệu tính giá chưa hợp lệ');
    const comparable=!reasons.length,net=comparable?a.total.beforeTax:null;
    methods[id]={inputs,reasons,comparable,net,perKg:net!==null&&a.total.weight>0?net/a.total.weight:null,
      residual:net!==null&&costKnown?net-reference:null,deltaDetail:net!==null&&costKnown&&detail.ready?net-detail.total.beforeTax:null};
    methods[id].deltaDetailPercent=methods[id].deltaDetail===null?null:pct(methods[id].deltaDetail,detail.total.beforeTax);
  }
  const marketInputs=q.products.map(n=>({nodeId:n.id,name:n.name,quantity:n.qty,source:n.marketSource,...declaration(q,n,'market')})),marketKnown=marketInputs.length>0&&marketInputs.every(i=>i.known&&valid(i.quantity)&&Number(i.quantity)>0),market=marketKnown?marketInputs.reduce((s,i)=>s+Math.round(i.net)*Number(i.quantity),0):null;
  for(const m of Object.values(methods)){m.deltaMarket=m.net!==null&&market!==null?m.net-market:null;m.deltaMarketPercent=m.deltaMarket===null?null:pct(m.deltaMarket,market);const competitor=methods.competitor.net;m.deltaCompetitor=m.net!==null&&competitor!==null?m.net-competitor:null;m.deltaCompetitorPercent=m.deltaCompetitor===null?null:pct(m.deltaCompetitor,competitor);}
  const releaseErrors=[...(methods[result.pricing.selected]?.reasons||[])];
  if(!costKnown)releaseErrors.push('Rà và xác nhận giá chi phí đầu vào chưa thuế trước khi phát hành');
  if(!outputKnown)releaseErrors.push('Chưa xác nhận thuế suất đầu ra của báo giá');
  return {costKnown,outputKnown,methods,market,marketInputs,referenceParts,reference:costKnown?reference:null,releaseErrors:[...new Set(releaseErrors)]};
}
const api={input,declaration,review,assess,costSignature};if(typeof module!=='undefined')module.exports=api;else root.TPTax=api;
})(typeof window!=='undefined'?window:globalThis);
