const {test}=require('node:test'),A=require('node:assert/strict'),CF=require('../customer-fields-core.js'),I=require('../intake-core.js'),CRM=require('../crm-core.js'),template=require('../customer-fields-data.json');
test('Account template maps all 52 columns plus existing care fields, without importing example customers',()=>{
 A.equal(template.length,52);A.equal(CF.FIELDS.length,57);A.equal(new Set(CF.FIELDS.map(f=>f.key)).size,57);A.deepEqual(CF.FIELDS.slice(0,52).map(f=>f.key),template.map(f=>f.key));
 const c=I.customer({name:'QA',account:{bankAccount:'00123',identityNumber:'000456',birthDate:'2000-02-29',creditLimit:0,shared:'no',untrusted:'drop'}});
 A.equal(c.account.bankAccount,'00123');A.equal(c.account.identityNumber,'000456');A.equal(c.account.creditLimit,0);A.equal(c.account.untrusted,undefined);A.equal(I.customerSnapshot(c).account,undefined);
 A.throws(()=>I.customer({name:'QA',account:{birthDate:'2025-02-29'}}),/ngày/);A.throws(()=>I.customer({name:'QA',account:{creditLimit:-1}}),/không âm/);
});
test('Required rules support false/zero answers, preserve hidden data, and cannot hide required fields',()=>{
 const fields={'account.shared':{required:true},'account.creditLimit':{required:true},phone:{required:true}};
 A.throws(()=>CF.validate({name:'QA',account:{shared:'no',creditLimit:0}},fields),/Điện thoại/);
 CF.validate({name:'QA',phone:'123',account:{shared:'no',creditLimit:0}},fields);
 A.throws(()=>CF.settings({phone:{visible:false,required:true}}),/phải hiển thị/);
 A.deepEqual(CF.settings({name:{visible:false,required:false}}).name,{visible:true,required:true});
 const c={name:'Old',account:{bankAccount:'0001',passport:'P123'}};const next=CF.formValue(c,[['name','New'],['account.code','KH-01']]);A.equal(next.account.passport,'P123');A.equal(next.account.code,'KH-01');A.equal(c.name,'Old');
 A.equal(CRM.policy({fields}).fields.phone.required,true);
});
