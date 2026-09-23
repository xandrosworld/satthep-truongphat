const {test}=require('node:test'),A=require('node:assert/strict'),S=require('../section-access.js');
test('legacy technical grants include read-only quotation intake without customer editing',()=>{
 for(const section_access of [undefined,['bom','operations'],['bom','operations','catalogMaterials','catalogRules','catalogLibrary']]){
  const user={role:'technical',section_access};A.equal(S.modes(user).customer,'view');A.ok(!S.sections(user).includes('customer'));
  A.deepEqual(S.denied({quote:{project:'Before'}},{quote:{project:'After'}},{sections:S.sections(user)}),['customer']);
 }
});
test('explicit four-level intake restrictions remain authoritative',()=>{
 for(const customer of ['none','view','use','configure'])A.equal(S.modes({role:'technical',section_access:{bom:'use',customer}}).customer,customer);
 A.equal(S.modes({role:'sales',section_access:['commercial']}).customer,'none');
});
