'use strict';
const {test}=require('node:test'),A=require('node:assert/strict'),P=require('../pricing-core.js'),F=require('../factor-matrix-core.js'),W=require('../work-core.js');
const factor=(rate=10)=>({id:'HS-COMMON',name:'Khối lượng chung',param:'weight',kind:'number',tiers:[{max:null,percent:rate}]});
test('shared factor catalog is a pure migration view and retains conflicting legacy tables',()=>{const db=P.demoSeed();db.rates[0].factors=[factor(10)];db.rates[1].factors=[factor(20)];db.rates[2].factors=[{...factor(10),id:'OTHER'}];const before=JSON.stringify(db),c=F.catalog(db);A.equal(JSON.stringify(db),before);const a=c.bindings.find(b=>b.target===db.rates[0].id),b=c.bindings.find(b=>b.target===db.rates[1].id),same=c.bindings.find(b=>b.target===db.rates[2].id);A.notEqual(a.key,b.key);A.equal(a.key,same.key);});
test('one shared factor drives two master operations once, edits propagate, saved quotes remain independent',()=>{const db=P.demoSeed(),before=JSON.stringify(db.quote);F.save(db,factor());const links=F.catalog(db).bindings.filter(b=>b.enabled).map(({key,target})=>({key,target}));F.applyMatrix(db,[...links,{key:'HS-COMMON',target:'weld'},{key:'HS-COMMON',target:'pack'}]);for(const id of ['weld','pack']){const r=db.rates.find(r=>r.id===id);A.equal(r.factors.filter(f=>f.sharedFactorId==='HS-COMMON').length,1);A.equal(W.price(r,{mode:'inside',pricingMethod:'factors'},{weight:1},P.tier).value,r.inside*1.1);}F.save(db,factor(20));A.equal(db.rates.find(r=>r.id==='pack').factors[0].tiers[0].percent,20);A.equal(JSON.stringify(db.quote),before);const again=F.catalog(db).bindings.filter(b=>b.enabled&&!(b.key==='HS-COMMON'&&b.target==='weld')).map(({key,target})=>({key,target}));F.applyMatrix(db,again);A.equal(db.rates.find(r=>r.id==='weld').factors.length,0);A.equal(db.rates.find(r=>r.id==='pack').factors.length,1);F.remove(db,'HS-COMMON');A.equal(db.rates.find(r=>r.id==='pack').factors.length,0);A.equal(JSON.stringify(db.quote),before);});
test('matrix rejects unsupported parameters, unknown targets and duplicate links without partial writes',()=>{const db=P.demoSeed();db.pricingDefaults={...P.defaults(),expenseRates:[{id:'trip',name:'Xe',category:'delivery',method:'trip',rate:1,minimum:0}]};F.save(db,{...factor(),param:'T'});const before=JSON.stringify(db);for(const links of [[{key:'HS-COMMON',target:'expense:trip'}],[{key:'HS-COMMON',target:'missing'}],[{key:'HS-COMMON',target:'pack'},{key:'HS-COMMON',target:'pack'}]]){A.throws(()=>F.applyMatrix(db,links));A.equal(JSON.stringify(db),before);}F.save(db,{...factor(),id:'HS-KM',param:'distance'});F.applyMatrix(db,[{key:'HS-KM',target:'expense:trip'}]);A.equal(db.pricingDefaults.expenseRates[0].factors[0].sharedFactorId,'HS-KM');});

test('editing one factor and its targets retains every other factor and quote snapshot',()=>{
 const db=P.demoSeed(),before=JSON.stringify(db.quote),legacy=F.catalog(db).definitions;
 F.save(db,factor(),'', ['weld','pack']);F.save(db,factor(25),'',['pack']);
 for(const f of legacy)A.ok(F.catalog(db).definitions.some(x=>x.id===f.id));
 A.equal(db.rates.find(r=>r.id==='weld').factors.some(f=>f.sharedFactorId==='HS-COMMON'),false);
 A.equal(db.rates.find(r=>r.id==='pack').factors.find(f=>f.sharedFactorId==='HS-COMMON').tiers[0].percent,25);
 A.equal(JSON.stringify(db.quote),before);
 const saved=JSON.stringify(db);A.throws(()=>F.save(db,factor(30),'',['missing']));A.equal(JSON.stringify(db),saved);
});
test('complexity choices use linked compatible tables and convert multiplier once without changing snapshots',()=>{
 const db=P.demoSeed(),f={id:'complex-new',name:'Mức phức tạp mới',param:'complexity',kind:'category',valueMode:'multiplier',categories:[{key:'Trung bình',percent:1.2}],productGroups:['Cơ khí']};
 const before=JSON.stringify(db.quote);F.save(db,f);
 A.equal(F.complexityChoices(db,'weld','Cơ khí').filter(x=>x.name===f.name).length,0);
 F.save(db,f,'',['weld']);const rows=F.complexityChoices(db,'weld','Cơ khí').filter(x=>x.name===f.name);
 A.equal(rows.length,1);A.equal(rows[0].multiplier,1.2);
 A.equal(F.complexityChoices(db,'weld','Thang máng cáp').filter(x=>x.name===f.name).length,0);
 const rate=db.rates.find(r=>r.id==='weld'),price=W.price(rate,{mode:'inside',pricingMethod:'factors',complexity:{label:rows[0].label,multiplier:rows[0].multiplier}},{productGroup:'Cơ khí'},P.tier);
 A.equal(price.value,rate.inside*1.2);A.equal(price.factors.filter(f=>f.param==='complexity').length,1);
 A.equal(JSON.stringify(db.quote),before);
});
