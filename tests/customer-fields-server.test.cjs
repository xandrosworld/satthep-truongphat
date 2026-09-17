const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs');
test('Customer field policy is admin-only and enforced on direct writes; hidden values and backup survive',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,session){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Customer-field-test-42!'});
 const staffBody={username:'staff',name:'Staff',role:'estimator',sections:['customer'],password:'Customer-field-test-42!'};await call('users','POST',staffBody,admin);const staff=await call('login','POST',staffBody);
 let c=(await call('intake/customers','POST',{customer:{id:'old-customer',name:'Legacy',account:{bankAccount:'000123',passport:'P1'}},expectedVersion:0},admin)).data;
 const policy={fields:{phone:{required:true},'account.code':{required:true},'account.passport':{visible:false}}};
 A.equal((await call('intake/policy','POST',{policy,expectedVersion:0},staff)).status,403);
 A.equal((await call('intake/policy','POST',{policy,expectedVersion:0},admin)).status,200);
 let rejected=await call('intake/customers','POST',{customer:{id:'new-customer',name:'QA'},expectedVersion:0},staff);A.equal(rejected.status,400);A.match(JSON.stringify(rejected.data),/Điện thoại/);
 rejected=await call('intake/customers','POST',{customer:{id:c.id,name:'Edited'},expectedVersion:c.version},staff);A.equal(rejected.status,400);
 let saved=await call('intake/customers','POST',{customer:{id:c.id,name:'Edited',phone:'0123',account:{code:'KH-42'}},expectedVersion:c.version},staff);A.equal(saved.status,200,JSON.stringify(saved.data));c=saved.data;A.equal(c.account.passport,'P1');A.equal(c.account.bankAccount,'000123');
 A.equal((await call('intake/policy','POST',{policy:{careDays:7},expectedVersion:1},admin)).status,200);A.equal((await call('intake/policy','GET',undefined,staff)).data.fields.phone.required,true);
 const backup=(await call('backup','GET',undefined,admin)).data;A.equal(JSON.parse(backup.customers[0].document).account.code,'KH-42');A.equal(JSON.parse(backup.customerPolicy[0].document).fields.phone.required,true);
 A.equal((await call('intake/policy','POST',{policy,expectedVersion:1},admin)).status,409);
});
