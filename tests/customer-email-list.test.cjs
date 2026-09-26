const {test}=require('node:test'),A=require('node:assert/strict'),CF=require('../customer-fields-core.js'),I=require('../customer-import-core.js'),{customer}=require('../intake-core.js');
test('Customer email lists preserve addresses, validate every address and detect overlaps',()=>{
 const c=customer({name:'Example',email:'accounts@example.com; sales@example.com'});
 A.equal(c.email,'accounts@example.com, sales@example.com');
 A.equal(CF.emails('accounts@example.com, ACCOUNTS@example.com').length,1);
 A.throws(()=>customer({name:'Example',email:'accounts@example.com, invalid'}),/Email/);
 A.throws(()=>customer({name:'Example',email:'a'.repeat(201)+'@example.com'}),/quá dài/);
 A.match(I.plan([{line:2,data:{name:'Other',email:'sales@example.com'}}],[{id:'old',...c}])[0].error,/trùng liên hệ/);
 A.match(I.plan([{line:2,data:{name:'Other',email:'other@example.com, SALES@example.com'}}],[{id:'old',...c}])[0].error,/trùng liên hệ/);
});
