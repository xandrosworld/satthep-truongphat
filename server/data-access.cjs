'use strict';
const {randomUUID,createHash}=require('node:crypto'),SA=require('../section-access.js');
const copy=x=>JSON.parse(JSON.stringify(x));
const blank=x=>Array.isArray(x)?[]:x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,blank(v)])):typeof x==='number'?0:typeof x==='boolean'?false:'';
// Opaque, user-bound references keep hidden values server-side across edits.
// Restoring a reference never grants write access: normal section/lock guards still run.
function createDataAccess({sql,fail}){
 sql.exec('CREATE TABLE IF NOT EXISTS access_refs(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,digest TEXT NOT NULL,value TEXT NOT NULL,UNIQUE(user_id,digest))');
 const locked=()=>!!sql.prepare("SELECT locked FROM formula_locks WHERE key='calculationFactors:all'").get()?.locked;
 function explicit(user){const x=typeof user.section_access==='string'?JSON.parse(user.section_access):user.section_access;return x&&!Array.isArray(x);}
 function hideFactors(user){return user.role!=='admin'&&(locked()||explicit(user)&&['use','none'].includes(SA.modes(user).factors));}
 function protect(value,user,preserve=true){if(user.role==='admin'||!value||typeof value!=='object')return value;const out=copy(value),modes=SA.modes(user),hiddenFactors=hideFactors(user),scoped=explicit(user);
  const sensitive=new Set(['changeHistory','history','approvedBaseline','factorsApplied','factorSteps','factorDefinitions','factors','outsideFactors','salesFactors','productionFactors','policyRates','productionSteps','saleSteps','productionExtras','saleExtras','complexity','policySelections','policyTypes','factorSuggestions','tmcPolicy','tmcTables','tmcLaborOperation','costFlows','operationPriceTables','priceSignature']);
  const coefficients=new Set(['overhead','management','special','profit','processing','order','reserve','customer','productionSpecialPercent','tmcLoss']);
  function walk(o,parent='') {if(!o||typeof o!=='object')return;if(Array.isArray(o)){for(const x of o)walk(x,parent);return;}const saved={},mask={};
   if(parent==='pricing'&&modes.commercial!=='none'&&o.policySelections?.customer?.name)o.classificationLabel=o.policySelections.customer.name;
   const hide=k=>{if(o[k]===undefined)return;saved[k]=copy(o[k]);mask[k]=blank(o[k]);o[k]=copy(mask[k]);};
   for(const k of Object.keys(o)){
    if(scoped&&modes.materials==='none'&&['price','priceHistory','priceSource','priceSelection','materialPriceHistory','materialPriceSelections','materialPrices'].includes(k)){hide(k);continue;}
    if(scoped&&modes.logistics==='none'&&(['incoming','outgoing','delivery','install','expenseRates','expenses','logistics','devices','deviceInstallations','transport','freightIn','freightOut'].includes(k))){hide(k);continue;}
    if(scoped&&modes.operations==='none'&&['ops','ownOps','ratesSnapshot','rates','operationColumns','operationMethods','operationPriceOptions','operationPriceChoices','operationChoices'].includes(k)){hide(k);continue;}
    if(scoped&&modes.bom==='none'&&['products','rows','nodes','node','library','nestingPlans','errors','warnings'].includes(k)&&!(k==='products'&&parent==='offer'&&modes.commercial!=='none')){hide(k);continue;}
    if(scoped&&modes.customer==='none'&&['customer','project','customerInfo','request','requestSpecification','attachments','sourceFiles'].includes(k)){hide(k);continue;}
    if(scoped&&modes.commercial==='none'&&k==='total'&&typeof o[k]==='number'){hide(k);continue;}
    if(scoped&&modes.commercial==='none'&&['sell','unitSell','suggestedUnit','profitMarkup','beforeTax','vat','grand','totals','offer','offerTerms','notes','competitorPrice','marketPrice','pricePerKg','approvedOffer','approvedBaseline'].includes(k)){hide(k);continue;}

    if(hiddenFactors&&!(parent==='pricing'&&['overhead','management','special','profit','processing','order','reserve','customer'].includes(k)&&require('./access.cjs').permissions(user).factors)&&(sensitive.has(k)||(k==='multiplier'&&(o.name||o.label)||k==='factorMultiplier')||(coefficients.has(k)&&typeof o[k]==='number')||k==='productionSpecialPercent')){hide(k);continue;}
    if(scoped&&parent==='quote'){
     const section=['customer','customerInfo','request','project','attachments','sourceFiles'].includes(k)?'customer':k==='products'?'bom':['ratesSnapshot','operationColumns','operationMethods','operationPriceOptions'].includes(k)?'operations':['expenses','deviceInstallations'].includes(k)?'logistics':null;
     if(section&&modes[section]==='none'){hide(k);continue;}
    }
    const actions=require('../action-access.js');const catalogs={materials:'catalogMaterials',materialPrices:'catalogMaterials',rules:'catalogRules',shapeDefinitions:'catalogRules',stockSizes:'catalogMaterials',library:'catalogLibrary',rates:'catalogOperations',pricingDefaults:'catalogOperations'};
    if(scoped&&(o.version===2||o.materials&&o.rates)&&catalogs[k]&&(modes[catalogs[k]]==='none'||!actions.allows(user,catalogs[k],'view')&&!(k==='rates'&&actions.allows(user,'catalogTechnicalOperations','view')))){hide(k);continue;}
    if(scoped&&o.kind&&['product','material','component'].includes(o.kind)){const section=k==='ops'?'operations':['transport','install','outsource','freightIn','freightOut'].includes(k)?'logistics':null;if(section&&modes[section]==='none'){hide(k);continue;}}
    if(!['permissions','user','sectionModes'].includes(k))walk(o[k],k);
   }
   if(preserve&&Object.keys(saved).length){const raw=JSON.stringify({saved,mask}),digest=createHash('sha256').update(raw).digest('hex');let row=sql.prepare('SELECT token FROM access_refs WHERE user_id=? AND digest=?').get(user.id,digest);if(!row){row={token:randomUUID()};sql.prepare('INSERT INTO access_refs VALUES(?,?,?,?)').run(row.token,user.id,digest,raw);}o.__accessRef=row.token;}
  }walk(out);return out;
 }
 // Quote history is server-owned: discard stale client appends and restore the
 // protected value. saveQuote then records actual changes from the stored revision.
 // All other protected fields still reject client modifications.
 function hydrate(value,user){const out=copy(value);function walk(o,parent=''){if(!o||typeof o!=='object')return;if(parent==='pricing')delete o.classificationLabel;if(o.__accessRef){const row=sql.prepare('SELECT value FROM access_refs WHERE token=? AND user_id=?').get(o.__accessRef,user.id);if(!row)fail(403,'Dữ liệu bảo vệ không thuộc tài khoản. Tải lại dữ liệu.');const {saved,mask}=JSON.parse(row.value);for(const k of Object.keys(saved)){const changed=o[k]!==undefined&&!SA.equal(o[k],mask[k]);if(changed&&parent==='pricing'&&['overhead','management','special','profit','processing','order','reserve','customer'].includes(k)&&require('./access.cjs').permissions(user).factors&&!(k==='customer'&&explicit(user)&&SA.modes(user).customer==='none'))continue;if(!(parent==='quote'&&k==='changeHistory')&&o[k]!==undefined&&!SA.equal(o[k],mask[k]))fail(403,'Không được sửa dữ liệu đang ẩn: '+k);o[k]=saved[k];}delete o.__accessRef;}for(const [k,v] of Object.entries(o))walk(v,k);}walk(out);return out;}
 function guardRoute(route,method,user){if(user.role==='admin'||!explicit(user))return;if(require('../action-access.js').explicit(user)&&/^\/api\/(production|orders)(?:\/|$)/.test(route))return;const m=SA.modes(user);const scopes=[[/^\/api\/(orders|production)(?:\/|$)/,'commercial'],[/^\/api\/quotes\/[^/]+\/(commercial|revisions|revision)/,'commercial'],[/^\/api\/intake\//,'customer'],[/^\/api\/operation-catalog$/,'operations'],[/^\/api\/commercial/,'commercial']];for(const [re,k]of scopes)if(re.test(route)&&m[k]==='none')fail(403,'Không được xem phần '+SA.labels[k]);}
 return {protect,hydrate,hideFactors,guardRoute};
}
module.exports={createDataAccess};
