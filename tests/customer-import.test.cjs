const {test}=require('node:test'),A=require('node:assert/strict'),I=require('../customer-import-core.js'),{createApp}=require('../server/app.cjs');
test('Customer import recognizes template headers, preserves identifiers and rejects ambiguous matches',()=>{
 const parsed=I.records([['Thông tin khách hàng'],['Mã khách hàng','Tên khách hàng','Điện thoại','Ngày cấp'],['KH01','ABC','001234','18/09/2026']]);A.equal(parsed.rows[0].data.phone,'001234');A.equal(parsed.rows[0].data.account.identityDate,'2026-09-18');
 const old=[{id:'one',name:'ABC',account:{code:'KH01'},version:2},{id:'two',name:'Other',taxId:'123',version:1}];A.equal(I.plan(parsed.rows,old)[0].expectedVersion,2);A.match(I.plan([{line:1,data:{name:'ABC',account:{code:'KH01'},taxId:'123'}}],old)[0].error,/khác nhau/);A.match(I.plan([{line:1,data:{name:'ABC'}}],old)[0].error,/Tên đã tồn tại/);
 A.match(I.plan([{line:1,data:{name:'A',account:{code:'A'},taxId:'123'}},{line:2,data:{name:'B',account:{code:'B'},taxId:'123'}}],[])[1].error,/lặp/);
});
test('Customer import detects name/contact candidates, normalized tax collisions and repeated names with different codes',()=>{
 const old=[{id:'one',name:'Công ty ABC',phone:'0901234567',email:'abc@test.vn',taxId:'0123-456',account:{code:'C01'},version:3}];
 let r=I.plan([{line:2,data:{name:' Công ty ABC ',account:{code:'NEW'}}}],old)[0];A.match(r.error,/chọn hồ sơ/);A.equal(r.candidates[0].id,'one');
 A.equal(I.plan([{line:2,data:{name:'Other',taxId:'0123456'}}],old)[0].customer.id,'one');
 A.match(I.plan([{line:2,data:{name:'Different',phone:'+84 901234567'}}],old)[0].error,/trùng liên hệ/);
 A.match(I.plan([{line:2,data:{id:'missing',taxId:'0123456'}}],old)[0].error,/không tồn tại/);
 A.match(I.plan([{line:2,data:{name:'A',account:{code:'1'}}},{line:3,data:{name:'A',account:{code:'2'}}}],[])[1].error,/lặp/);
 A.equal(I.merge({name:'Old',phone:'09',account:{code:'C',bankName:'Bank'}},{name:'New',phone:'',email:'e@x.vn',account:{bankName:'Other'}},'fill').account.bankName,'Bank');
 A.equal(I.merge({name:'Old',phone:'09'},{name:'New',phone:''},'replace').phone,'09');
});
test('Customer import conditions are enforced on server and preserve required-field policy for new records',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;let session;
 async function call(route,method='GET',body){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();if(route==='setup')session={cookie:r.headers.get('set-cookie').split(';')[0],csrf:data.csrf};return {status:r.status,data};}
 await call('setup','POST',{username:'admin',name:'Admin',password:'Import-conditions-test-42!'});await call('intake/customers','POST',{customer:{id:'legacy',name:'Legacy',phone:'0901234567',account:{code:'LEG'}},expectedVersion:0});
 const policy=(await call('intake/policy')).data;policy.fields={...policy.fields,source:{visible:true,required:true}};A.equal((await call('intake/policy','POST',{policy,expectedVersion:policy.version})).status,200);
 const rows=[{line:2,customer:{id:'legacy',name:'Changed',email:'legacy@test.vn'},expectedVersion:1}];A.equal((await call('intake/customers/import','POST',{rows})).status,400);
 A.equal((await call('intake/customers/import','POST',{rows,mergeMode:'fill',allowExistingMissing:true})).status,200);let c=(await call('intake/customers')).data.find(c=>c.id==='legacy');A.equal(c.name,'Legacy');A.equal(c.email,'legacy@test.vn');A.equal(c.phone,'0901234567');
 A.equal((await call('intake/customers/import','POST',{rows,mergeMode:'fill',allowExistingMissing:true})).status,409);
 A.equal((await call('intake/customers/import','POST',{rows:[{customer:{name:'Incomplete new'},expectedVersion:0}],allowExistingMissing:true})).status,400);
 A.equal((await call('intake/customers/import','POST',{rows:[{customer:{id:'legacy',source:'Imported',name:'Changed'},expectedVersion:2}],mergeMode:'replace'})).status,200);
 c=(await call('intake/customers')).data.find(c=>c.id==='legacy');A.equal(c.name,'Changed');A.equal(c.source,'Imported');A.equal(c.account.code,'LEG');
});
test('Customer import is atomic, version checked, preserves history, ownership and absent fields',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 async function call(route,method='GET',body,session){const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};}
 const admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Import-test-password-42!'}),old=(await call('intake/customers','POST',{customer:{id:'old',name:'Old',phone:'00123',account:{code:'C01',bankAccount:'00077'}},expectedVersion:0},admin)).data;
 const rows=[{customer:{id:'old',name:'Updated'},expectedVersion:1},{customer:{name:'New',account:{code:'C02'}},expectedVersion:0}];let r=await call('intake/customers/import','POST',{rows},admin);A.equal(r.status,200,JSON.stringify(r.data));let list=(await call('intake/customers','GET',undefined,admin)).data;A.equal(list.length,2);let updated=list.find(c=>c.id==='old');A.equal(updated.phone,'00123');A.equal(updated.account.bankAccount,'00077');A.equal(updated.ownerId,old.ownerId);A.ok(updated.events.length>old.events.length);
 A.equal((await call('intake/customers/import','POST',{rows},admin)).status,409);
 const before=JSON.stringify((await call('intake/customers','GET',undefined,admin)).data);r=await call('intake/customers/import','POST',{rows:[{customer:{id:'old',name:'Must rollback'},expectedVersion:2},{customer:{name:'Bad',email:'invalid'},expectedVersion:0}]},admin);A.equal(r.status,400);A.equal(JSON.stringify((await call('intake/customers','GET',undefined,admin)).data),before);
 await call('users','POST',{username:'reader',name:'Reader',password:'Import-test-password-42!',role:'approver',sections:[]},admin);const reader=await call('login','POST',{username:'reader',password:'Import-test-password-42!'});A.equal((await call('intake/customers/import','POST',{rows},reader)).status,403);
});
