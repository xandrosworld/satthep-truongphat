'use strict';
const {randomUUID}=require('node:crypto'),E=require('../shape-expression-core.js'),SA=require('../section-access.js');
const FIELDS={canFormulaUse:'can_formula_use',canFormulaView:'can_formula_view',canFormulaEdit:'can_formula_edit',canFormulaUnlock:'can_formula_unlock',canReopen:'can_reopen'};
function rights(user,sections){const admin=user.role==='admin',enabled=(key,fallback=false)=>admin||(user[key]==null?fallback:!!user[key]);return {formulaUse:enabled('can_formula_use',true),formulaView:enabled('can_formula_view',true),formulaEdit:enabled('can_formula_edit',sections.some(k=>['catalogRules','bom'].includes(k)))&&(admin||['catalogRules','bom'].some(k=>SA.modes(user)[k]==='configure')),formulaUnlock:require('./governance.cjs').can(user,'formulaLocks','edit'),reopen:enabled('can_reopen')};}
const isRef=s=>typeof s==='string'&&/^__TPF_[a-f0-9]{32}$/.test(s);
const isExpression=(o,k,parent)=>(['formula','expression'].includes(k)||k.endsWith('Formula'))||(['length','width'].includes(k)&&(o.shape||o.base||parent==='ruleSpec'))||(['mass','surface','blankMass','blankSurface'].includes(k)&&Array.isArray(o.fields))||parent==='formulas'||parent==='measurementRules'||(parent==='measurement'&&['weight','area'].includes(k));
function visit(value,fn,path=[],parent=''){if(!value||typeof value!=='object')return;for(const [k,v] of Object.entries(value)){if(typeof v==='string'&&isExpression(value,k,parent)&&v.trim())value[k]=fn(v,path.concat(k));else if(v&&typeof v==='object')visit(v,fn,path.concat(k),k);}}
function expressions(value){const result=[];visit(JSON.parse(JSON.stringify(value||{})),(v,path)=>{result.push({path:path.join('.'),value:v});return v;});return result;}
function declaration(value){const out=expressions(value);if(Array.isArray(value?.fields))out.push({path:'$definition',value:JSON.stringify({base:value.base,...(value.polygon?{polygon:value.polygon}:{}),fields:value.fields.map(({key,mode,unit})=>({key,mode,unit}))})});function nested(v,path=[]){if(!v||typeof v!=='object')return;if(path.length&&v.polygon&&Array.isArray(v.fields))out.push({path:path.concat('$polygon').join('.'),value:JSON.stringify(v.polygon)});for(const [k,x]of Object.entries(v))if(x&&typeof x==='object')nested(x,path.concat(k));}nested(value);return out.sort((a,b)=>a.path.localeCompare(b.path));}
function snapshotBaselines(before,after){
  const flattened=value=>require('../core.js').flatten(value.quote?.products||[]);
  const oldNodes=flattened(before||{}),priorSnapshotNodes=new Map(oldNodes.map(n=>[n.id,n]));
  // Duplicating a row reuses its saved formula bundle; new node IDs do not mean
  // the user authored a formula. Match the entire bundle, never individual strings.
  const bundle=n=>({kind:n.kind,materialId:n.materialId,rule:n.rule,specId:n.spec?.id,ruleId:n.ruleSpec?.id,shapeId:n.spec?.shapeDefinition?.id,fields:declaration({...n,children:undefined}),spec:declaration(n.spec),ruleSpec:declaration(n.ruleSpec),shape:declaration(n.spec?.shapeDefinition)});
  const savedBundles=new Map(oldNodes.map(n=>[JSON.stringify(bundle(n)),n]));
  for(const n of flattened(after))if(!priorSnapshotNodes.has(n.id)){
   const source=savedBundles.get(JSON.stringify(bundle(n)));
   if(source)priorSnapshotNodes.set(n.id,source);
  }
  return priorSnapshotNodes;
}
function factorDeclaration(catalog){
 const p=catalog.pricingDefaults||{},pick=rate=>({id:rate.id,factors:rate.factors||[],factorsEnabled:rate.factorsEnabled!==false,outsideFactors:!!rate.outsideFactors,productGroups:rate.productGroups||[]});
 return {policyTypes:p.policyTypes||{},coefficients:Object.fromEntries(["overhead","management","special","profit","processing","order","reserve","customer"].filter(k=>p[k]!==undefined).map(k=>[k,p[k]])),definitions:p.factorDefinitions||[],rates:(catalog.rates||[]).filter(r=>r.factors?.length).map(pick),expenses:(p.expenseRates||[]).filter(r=>r.factors?.length).map(pick),salesFactors:p.salesFactors||[],productionFactors:p.productionFactors||[],tmcLoss:p.tmcLoss,groups:(p.productGroups||[]).map(g=>({id:g.id,tmcLoss:g.tmcLoss}))};
}
// A quote may adopt an additional published operation without editing locked
// coefficients. Keep every existing snapshot and all other declarations intact.
function publishedRateAddition(before,after,master){
 if(!before||!after||!master||!SA.equal({...before,rates:[]},{...after,rates:[]}))return false;
 const old=before.rates||[],next=after.rates||[],published=master.rates||[];
 if(next.length<=old.length||new Set(next.map(r=>r.id)).size!==next.length)return false;
 if(old.some(r=>!SA.equal(r,next.find(n=>n.id===r.id))))return false;
 return next.filter(r=>!old.some(o=>o.id===r.id)).every(r=>SA.equal(r,published.find(m=>m.id===r.id)));
}
// A unit repair adopts only published price/unit pairs. Historical prices for
// other modes and operations need not equal today's entire catalogue.
function publishedUnitRepair(before,after,master){
 if(!before||!after||!master)return false;
 const expected=JSON.parse(JSON.stringify(before));let changed=false;
 for(const rate of expected.rates||[]){
  const next=after.rates?.find(r=>r.id===rate.id),ref=master.rates?.find(r=>r.id===rate.id);
  if(!next||!ref)continue;
  for(const mode of ['inside','outside']){
   const unit=mode+'Unit';
   if(rate[unit]===next[unit])continue;
   if(next[unit]!==ref[unit]||next[mode]!==ref[mode]||!Number.isFinite(next[mode])||next[mode]<0)return false;
   rate[unit]=next[unit];rate[mode]=next[mode];changed=true;
  }
 }
 return changed&&SA.equal(expected,after);
}
// Shared impact factors have one owner even when shown beside operation prices.
// Technical instructions/machines and quote cost coefficients are outside this lock.
function operationPricing(catalog){
 const p=catalog.pricingDefaults||{},pick=r=>({id:r.id,inside:r.inside,outside:r.outside,unit:r.unit,insideUnit:r.insideUnit||r.unit,outsideUnit:r.outsideUnit||r.unit,priceOptions:r.priceOptions||[],operationType:r.operationType||'detail',tmcReplace:!!r.tmcReplace,tmcPackage:r.tmcPackage||null});
 const labor=p.tmcLaborOperation?JSON.parse(JSON.stringify(p.tmcLaborOperation)):null;
 if(labor){if(labor.default?.rate)labor.default.rate=pick(labor.default.rate);for(const binding of Object.values(labor.tables||{}))if(binding?.rate)binding.rate=pick(binding.rate);}
 return {rates:(catalog.rates||[]).map(pick),tmcTables:p.tmcTables||[],operationPriceTables:p.operationPriceTables||[],tmcLaborOperation:labor};
}
function records(catalog){const out=[];if(catalog.rates||catalog.pricingDefaults){out.push({key:"calculationFactors:all",name:"Hệ số tác động và phạm vi áp dụng",kind:"calculationFactors",fields:factorDeclaration(catalog)});out.push({key:'operationPricing:all',name:'Hệ số đơn giá và bảng giá nguyên công',kind:'operationPricing',fields:operationPricing(catalog)});}for(const kind of ['shapeDefinitions','rules','materials','rates','library'])for(const item of catalog[kind]||[]){const fields=declaration(item);if(fields.length)out.push({key:kind+':'+item.id,name:item.name||item.id,kind,fields});}for(const [id,flow] of Object.entries(catalog.pricingDefaults?.costFlows||{})){const item={id,...flow},fields=expressions(item);if(fields.length)out.push({key:'costFlows:'+item.id,name:item.name||item.id,kind:'costFlows',fields});}for(const item of catalog.pricingDefaults?.productGroups||[]){const fields=declaration(item);if(fields.length)out.push({key:'productGroups:'+item.id,name:item.name||item.id,kind:'productGroups',fields});}return out;}
function createFormulaAccess({sql,fail,readBody,audit,transaction}){
 const columns=new Set(sql.prepare('PRAGMA table_info(users)').all().map(c=>c.name));for(const c of Object.values(FIELDS))if(!columns.has(c))sql.exec('ALTER TABLE users ADD COLUMN '+c+' INTEGER');
 sql.exec('CREATE TABLE IF NOT EXISTS formula_refs(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expression TEXT NOT NULL,UNIQUE(user_id,expression)); CREATE TABLE IF NOT EXISTS formula_locks(key TEXT PRIMARY KEY,locked INTEGER NOT NULL,version INTEGER NOT NULL,actor TEXT NOT NULL,at TEXT NOT NULL);');
 // One-time, idempotent split: preserve the existing lock and its provenance.
 // Later changes to either lock must never reset the other, including on restart.
 sql.exec("INSERT OR IGNORE INTO formula_locks(key,locked,version,actor,at) SELECT 'operationPricing:all',locked,version,actor,at FROM formula_locks WHERE key='calculationFactors:all'");
 sql.prepare("INSERT OR IGNORE INTO formula_locks(key,locked,version,actor,at) VALUES('operationPricing:all',0,0,'system',?)").run(new Date().toISOString());
 const locks=()=>sql.prepare('SELECT l.*,u.name AS actorName FROM formula_locks l LEFT JOIN users u ON u.id=l.actor').all();
 function validateRights(b){for(const key of Object.keys(FIELDS))if(Object.hasOwn(b,key)&&typeof b[key]!=='boolean')fail(400,'Quyền phải là bật/tắt');}
 function saveRights(id,b){validateRights(b);for(const [key,col]of Object.entries(FIELDS))if(Object.hasOwn(b,key)){if(typeof b[key]!=='boolean')fail(400,'Quyền phải là bật/tắt');sql.prepare('UPDATE users SET '+col+'=? WHERE id=?').run(Number(b[key]),id);}}
 function hydrate(value,user){const out=JSON.parse(JSON.stringify(value));visit(out,s=>{if(!isRef(s))return s;const r=sql.prepare('SELECT expression FROM formula_refs WHERE token=? AND user_id=?').get(s,user.id);if(!r)fail(403,'Tham chiếu công thức không thuộc tài khoản');return r.expression;});return out;}
 function project(value,user,permissions){if(permissions.formulaView)return value;const out=JSON.parse(JSON.stringify(value)),meta={};visit(out,s=>{let r=sql.prepare('SELECT token FROM formula_refs WHERE user_id=? AND expression=?').get(user.id,s);if(!r){r={token:'__TPF_'+randomUUID().replaceAll('-','')};sql.prepare('INSERT INTO formula_refs VALUES(?,?,?)').run(r.token,user.id,s);}meta[r.token]={variables:[...new Set(s.replace(/\b[A-Za-z_][A-Za-z_0-9]*\s*\(/g,'(').match(/[A-Za-z_][A-Za-z_0-9]*/g)||[])]};return r.token;});return Object.keys(meta).length?{__formulaProtected:true,value:out,formulaRefs:meta}:out;}
 function guard(before,after,p,catalog=false){
  before=before||{};after=after||{};
  const scopedRecords=value=>records(value).map(record=>{if(record.kind!=='calculationFactors'||!p.factors)return record;const {coefficients,policyTypes,salesFactors,productionFactors,...fields}=record.fields;return {...record,fields};});
  const masterCatalog=JSON.parse(sql.prepare('SELECT document FROM catalog WHERE id=1').get().document),old=scopedRecords(before),next=scopedRecords(after),masterRecords=scopedRecords(masterCatalog),blocked=new Set(locks().filter(x=>x.locked).map(x=>x.key));
  function lockedChange(record,next,scope){
   const changes=[];function compare(a,b,path=''){if(SA.equal(a,b)||changes.length>=20)return;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const key of new Set([...Object.keys(a),...Object.keys(b)]))compare(a[key],b[key],path?path+'.'+key:key);}else changes.push(path);}
   compare(record.fields,next?.fields);
   const diagnosticId=randomUUID().slice(0,8);console.warn('[quote-formula-lock]',JSON.stringify({diagnosticId,quote:before.quote?.id||null,scope,key:record.key,paths:changes}));
   fail(403,'Công thức đã khóa: '+record.name+' (Mã đối chiếu: '+diagnosticId+')');
  }
  if(catalog)for(const kind of ['shapeDefinitions','rules'])for(const item of before[kind]||[])if(blocked.has(kind+':'+item.id)&&!SA.equal(item,(after[kind]||[]).find(x=>x.id===item.id)))fail(403,'Công thức đã khóa; mở khóa trước khi sửa hoặc xóa: '+item.name);
  if(catalog)for(const r of old)if(blocked.has(r.key)&&!SA.equal(r.fields,next.find(x=>x.key===r.key)?.fields))fail(403,'Công thức đã khóa; người có quyền cần mở khóa trước khi sửa hoặc xóa: '+r.name);
  for(const r of old){const n=next.find(x=>x.key===r.key);if(!SA.equal(r.fields,n?.fields)&&blocked.has(r.key)&&(r.kind==='operationPricing'||!p.formulaUnlock)&&!(n&&SA.equal(n.fields,masterRecords.find(x=>x.key===r.key)?.fields))&&!(!catalog&&['calculationFactors:all','operationPricing:all'].includes(r.key)&&publishedRateAddition(r.fields,n?.fields,masterRecords.find(x=>x.key===r.key)?.fields)))lockedChange(r,n,'danh mục');}
  const canonical=rows=>rows.filter(r=>!['calculationFactors','operationPricing'].includes(r.kind)).map(r=>[r.key,r.fields]).sort((a,b)=>a[0].localeCompare(b[0]));
  if(!p.formulaEdit&&!SA.equal(canonical(old),canonical(next))){const changed=next.filter(n=>!SA.equal(n.fields,old.find(r=>r.key===n.key)?.fields));if(catalog||!p.formulaUse||changed.some(n=>!SA.equal(n.fields,masterRecords.find(r=>r.key===n.key)?.fields))||old.some(r=>!next.some(n=>n.key===r.key)&&masterRecords.some(n=>n.key===r.key)))fail(403,'Chưa có quyền sửa công thức danh mục');}
  const priorSnapshotNodes=snapshotBaselines(before,after);
  function snapshotLocks(prev,next){if(!next||typeof next!=='object')return;if(Array.isArray(next)){for(const [i,item]of next.entries()){const previous=item?.id?(item.kind?priorSnapshotNodes.get(item.id):undefined)||(Array.isArray(prev)?prev.find(x=>x?.id===item.id):undefined):prev?.[i];snapshotLocks(previous,item);}return;}for(const [k,v]of Object.entries(next)){if(!v||typeof v!=='object')continue;const kind=k==='ruleSpec'?'rules':k==='shapeDefinition'?'shapeDefinitions':null,key=kind+':'+v.id;if(kind&&blocked.has(key)&&!p.formulaUnlock&&!SA.equal(declaration(prev?.[k]),declaration(v))){const master=masterRecords.find(r=>r.key===key);const embedded=kind==='shapeDefinitions'&&masterCatalog.materials?.some(m=>m.id===next.id&&m.shapeDefinition?.id===v.id&&SA.equal(declaration(m.shapeDefinition),declaration(v)));if(!embedded&&(!master||!SA.equal(master.fields,declaration(v))))fail(403,'Công thức đã khóa; cần quyền mở sửa');}snapshotLocks(prev?.[k],v);}}
  snapshotLocks(before,after);
  if(catalog)return;
  const priorPricing=scopedRecords({rates:before.quote?.ratesSnapshot,pricingDefaults:before.quote?.pricing}),nextPricing=scopedRecords({rates:after.quote?.ratesSnapshot,pricingDefaults:after.quote?.pricing});for(const r of priorPricing){const n=nextPricing.find(x=>x.key===r.key);if(blocked.has(r.key)&&(r.kind==='operationPricing'||!p.formulaUnlock)&&!(r.key==='calculationFactors:all'&&p.factors&&SA.equal({...r.fields,coefficients:{}},{...n?.fields,coefficients:{}}))&&!SA.equal(r.fields,n?.fields)&&!SA.equal(n?.fields,masterRecords.find(x=>x.key===r.key)?.fields)&&!(r.key==='operationPricing:all'&&publishedUnitRepair(r.fields,n?.fields,masterRecords.find(x=>x.key===r.key)?.fields))&&!(['calculationFactors:all','operationPricing:all'].includes(r.key)&&publishedRateAddition(r.fields,n?.fields,masterRecords.find(x=>x.key===r.key)?.fields)))lockedChange(r,n,'báo giá');}
  const nodes=d=>require('../core.js').flatten(d.quote?.products||[]),priorNodes=priorSnapshotNodes;
  const allowed=new Set([...expressions(before),...expressions(after)].filter(x=>!x.path.startsWith('quote.')).map(x=>x.value));
  const previous=new Set(expressions(before.quote).map(x=>x.value));
  for(const n of nodes(after)){
   const prev=priorNodes.get(n.id),fields=expressions({...n,children:undefined});
   if(blocked.has('calculationFactors:all')&&!p.formulaUnlock)for(const op of n.ops||[]){const previousOp=(prev?.ops||[]).find(x=>op.instanceId?x.instanceId===op.instanceId:x.id===op.id);if(op.complexity&&!op.complexityChoice?.factorId&&!SA.equal(op.complexity,previousOp?.complexity))fail(403,'Hệ số đã khóa; chọn mức độ từ danh mục, chỉ Admin được sửa hệ số trực tiếp');}
   if(!p.formulaUse&&fields.length&&!SA.equal(prev,n))fail(403,'Chưa có quyền sử dụng công thức');
   if(prev&&!p.formulaEdit)for(const key of ['dimensionLinks','measurementRules','formulas'])if(!SA.equal(expressions({[key]:prev[key]}),expressions({[key]:n[key]})))fail(403,'Chưa có quyền sửa công thức tại dòng');
   for(const f of fields)if(!previous.has(f.value)&&!allowed.has(f.value)&&!p.formulaEdit)fail(403,'Chưa có quyền sửa công thức');
   // A locked declaration stays locked in quotation snapshots as well.
   for(const [key,obj,was]of [['rules:'+n.ruleSpec?.id,n.ruleSpec,prev?.ruleSpec],['shapeDefinitions:'+n.spec?.shapeDefinition?.id,n.spec?.shapeDefinition,prev?.spec?.shapeDefinition],['materials:'+n.spec?.id,n.spec,prev?.spec]]){
    const publishedMaterialShape=masterCatalog.materials?.find(m=>m.id===n.materialId)?.shapeDefinition,trustedShape=!!obj&&!!publishedMaterialShape&&publishedMaterialShape.id===obj.id&&((key.startsWith('shapeDefinitions:')&&SA.equal(declaration(obj),declaration(publishedMaterialShape)))||(key.startsWith('rules:')&&SA.equal(declaration(obj),declaration({shape:publishedMaterialShape.base,length:publishedMaterialShape.length,width:publishedMaterialShape.width}))));
    if(obj&&!trustedShape&&!p.formulaEdit&&!SA.equal(declaration(obj),declaration(was))){let published=next.find(x=>x.key===key)||masterRecords.find(x=>x.key===key);if(!published&&key.startsWith('rules:')&&n.spec?.shapeDefinition?.id===obj.id){const shape=next.find(x=>x.key==='shapeDefinitions:'+obj.id)||masterRecords.find(x=>x.key==='shapeDefinitions:'+obj.id);if(shape)published={fields:shape.fields.filter(f=>['length','width'].includes(f.path))};}const fields=key.startsWith('materials:')?declaration({...obj,shapeDefinition:undefined}):declaration(obj),expected=key.startsWith('materials:')?published?.fields.filter(f=>!f.path.startsWith('shapeDefinition.')):published?.fields;if(fields.length&&(!published||!SA.equal(fields,expected)))fail(403,'Chưa có quyền sửa công thức trong quy cách');}
    if(!obj||trustedShape||!blocked.has(key)||p.formulaUnlock||SA.equal(declaration(obj),declaration(was)))continue;
    const master=next.find(x=>x.key===key)||old.find(x=>x.key===key);
    if(!master||!SA.equal(declaration(obj),master.fields))fail(403,'Công thức đã khóa; cần quyền mở sửa');
   }
  }
  // Pricing formulas and dimension histories are also protected, independently of BOM permissions.
  for(const f of expressions(after.quote))if(!previous.has(f.value)&&!allowed.has(f.value)&&!p.formulaEdit)fail(403,'Chưa có quyền sửa công thức');
 }

 return {validateRights,saveRights,hydrate,project,guard,locks,async handle({req,route,user,rights:r,send}){
  if(route==='/api/formulas/evaluate'&&req.method==='POST'){if(!r.formulaUse)fail(403,'Chưa có quyền sử dụng công thức');const b=await readBody(req,20000),ref=sql.prepare('SELECT expression FROM formula_refs WHERE token=? AND user_id=?').get(b.token,user.id);if(!ref)fail(403,'Không có quyền dùng công thức này');if(!b.variables||typeof b.variables!=='object'||Array.isArray(b.variables)||Object.keys(b.variables).length>100||Object.values(b.variables).some(v=>b.mode==='dimension'?(!Array.isArray(v)||v.length!==2||v.some(x=>typeof x!=='number'||!Number.isFinite(x))):(typeof v!=='number'||!Number.isFinite(v))))fail(400,'Thông số không hợp lệ');try{const value=b.mode==='dimension'?E.dimension(E.parse(ref.expression),b.variables):E.formula(ref.expression,b.variables);send(200,{value});}catch(e){fail(400,'Không tính được công thức: kiểm tra thông số và đơn vị');}return true;}
  if(route==='/api/formulas/locks'&&req.method==='GET'){if(!(r.costs||r.technical||require('./governance.cjs').can(user,'formulaLocks')))fail(403,'Không có quyền danh mục');const master=JSON.parse(sql.prepare('SELECT document FROM catalog WHERE id=1').get().document);send(200,records(master).map(x=>({key:x.key,name:x.name,kind:x.kind,...(locks().find(l=>l.key===x.key)||{locked:0,version:0})})));return true;}
  if(route==='/api/formulas/locks'&&req.method==='POST'){require('./governance.cjs').need(user,'formulaLocks','edit',fail);const b=await readBody(req);if(typeof b.locked!=='boolean'||!String(b.reason||'').trim())fail(400,'Chọn trạng thái và ghi lý do');transaction(()=>{const catalogRow=sql.prepare('SELECT version,document FROM catalog WHERE id=1').get();if(b.expectedCatalogVersion!==undefined&&b.expectedCatalogVersion!==catalogRow.version)fail(409,'Catalog version changed; reload before locking');const master=JSON.parse(catalogRow.document);if(!records(master).some(x=>x.key===b.key))fail(404,'Lưu công thức vào danh mục máy chủ trước khi khóa');const old=locks().find(x=>x.key===b.key);if((old?.version||0)!==b.expectedVersion)fail(409,'Trạng thái khóa đã đổi; tải lại');sql.prepare('INSERT INTO formula_locks VALUES(?,?,?,?,?) ON CONFLICT(key) DO UPDATE SET locked=excluded.locked,version=excluded.version,actor=excluded.actor,at=excluded.at').run(b.key,Number(b.locked),(old?.version||0)+1,user.id,new Date().toISOString());audit(user,b.locked?'formula-lock':'formula-unlock',b.key,b.reason);});send(200,{ok:true});return true;}return false;
 }};
}
module.exports={FIELDS,rights,createFormulaAccess,expressions,records,isRef,snapshotBaselines};
