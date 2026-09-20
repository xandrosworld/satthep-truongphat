const {test}=require('node:test'),A=require('node:assert/strict'),T=require('../technical-core.js'),P=require('../pricing-core.js');
const factor=()=>({id:'difficulty',param:'complexity',kind:'category',valueMode:'multiplier',categories:[{key:'Easy',percent:1},{key:'Hard',percent:1.5}]});
test('shared complexity labels survive technical catalogue edits without disclosing factors',()=>{
 const d=P.demoSeed();d.pricingDefaults={factorDefinitions:[factor()]};for(const r of d.rates)r.factors=[];
 const view=T.projectCatalog(d);A.ok(view.rates[0].complexityLevels.some(x=>x.label==='Hard'));A.equal(JSON.stringify(view).includes('multiplier'),false);
 view.rates[0].technicalNotes='Updated technical note';const saved=T.mergeCatalog(d,view);A.deepEqual(saved.pricingDefaults,d.pricingDefaults);A.deepEqual(saved.rates[0].factors,[]);A.equal(saved.rates[0].technicalNotes,'Updated technical note');
 const forged=structuredClone(view);forged.rates[0].complexityLevels[0].label='Injected';A.throws(()=>T.mergeCatalog(d,forged));
});
test('operation-specific tables take precedence and group restrictions are enforced',()=>{
 const catalog={pricingDefaults:{factorDefinitions:[factor()]},rates:[]},base={id:'cut',factors:[]};
 const shared=T.complexityRate(base,catalog);A.deepEqual(T.resolveComplexity(shared,{factorId:'difficulty',label:'Hard'},''),{label:'Hard',multiplier:1.5});
 const own={...factor(),id:'own',productGroups:['Metal'],categories:[{key:'Special',percent:2}]};base.factors=[own];base.productGroups=['Metal'];
 A.deepEqual(T.complexityLevels(T.complexityRate(base,catalog)).map(x=>x.label),['Special']);A.throws(()=>T.resolveComplexity(base,{factorId:'own',label:'Special'},'Other'));
 A.equal(T.resolveComplexity(base,{factorId:'own',label:'Special'},'Metal').multiplier,2);own.enabled=false;A.deepEqual(T.complexityLevels(T.complexityRate(base,catalog)),[]);
});
test('unchanged saved assessment preserves private factor; new selection resolves current catalogue',()=>{
 const d=P.demoSeed(),op=d.quote.products[0].ops[0];op.complexity={label:'Legacy',multiplier:1.37};
 const catalog={rates:d.rates.map(r=>({...r,factors:[]})),pricingDefaults:{factorDefinitions:[factor()]}};
 const view=T.project(d,catalog);A.deepEqual(view.quote.products[0].ops[0].complexityChoice,{factorId:'',label:'Legacy'});A.equal(view.quote.products[0].ops[0].complexity,undefined);
 let saved=T.merge(d,view,catalog);A.deepEqual(saved.quote.products[0].ops[0].complexity,op.complexity);
 view.quote.products[0].ops[0].complexityChoice={factorId:'difficulty',label:'Hard'};saved=T.merge(d,view,catalog);A.equal(saved.quote.products[0].ops[0].complexity.multiplier,1.5);
 const tampered=structuredClone(saved);tampered.quote.products[0].ops[0].complexity.multiplier=99;A.throws(()=>T.resolveDocumentChoices(tampered,saved,catalog,false));
 catalog.pricingDefaults.factorDefinitions[0].categories[1].percent=1.8;A.equal(T.merge(saved,T.project(saved,catalog),catalog).quote.products[0].ops[0].complexity.multiplier,1.5);
});
