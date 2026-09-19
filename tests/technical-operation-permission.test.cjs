const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs');
test('operation-only technician can publish technical fields without price or other catalogue access',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));const base='http://127.0.0.1:'+app.server.address().port;
 const call=async(route,method='GET',body,session)=>{const r=await fetch(base+'/api/'+route,{method,headers:{'Content-Type':'application/json',...(session?{Cookie:session.cookie,'X-CSRF-Token':session.csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 const password='Operation-permission-test-42!',admin=await call('setup','POST',{username:'admin',name:'Admin',password}),grant={role:'technical',technicalDelegation:true,canViewCosts:false,sections:['catalogTechnicalOperations']};
 const user=await call('users','POST',{...grant,username:'tech',name:'Tech',password},admin);A.equal(user.status,201,JSON.stringify(user.data));
 let tech=await call('login','POST',{username:'tech',password});A.equal(tech.data.permissions.costs,false);A.equal(tech.data.permissions.catalog,true);
 const original=(await call('catalog','GET',undefined,admin)).data.catalog;let record=(await call('catalog','GET',undefined,tech)).data;
 A.ok(record.catalog.rates.every(r=>r.inside===0&&r.outside===0&&r.factors.length===0));
 record.catalog.rates[0].name='QA cutting';record.catalog.rates[0].machine='QA laser';record.catalog.rates[0].technicalNotes='QA notes';
 record.catalog.rates.push({id:'QA-NEW',name:'QA drill',machine:'QA drill machine',unit:'kg',insideUnit:'kg',outsideUnit:'kg',inside:0,outside:0,factors:[],operationType:'detail'});
 let saved=await call('catalog','PUT',{expectedVersion:record.version,catalog:record.catalog},tech);A.equal(saved.status,200,JSON.stringify(saved.data));
 const actual=(await call('catalog','GET',undefined,admin)).data.catalog;A.deepEqual(actual.rates[0],{...original.rates[0],name:'QA cutting',machine:'QA laser',technicalNotes:'QA notes'});A.deepEqual(actual.materials,original.materials);A.deepEqual(actual.pricingDefaults,original.pricingDefaults);
 record=(await call('catalog','GET',undefined,tech)).data;
 for(const mutate of [x=>x.materials[0].name='Denied',x=>x.library[0].name='Denied',x=>x.conventions.parameters=[...(x.conventions.parameters||[]),{name:'QA_DENIED',unit:'mm',label:'Denied'}],x=>x.rates[0].inside=777,x=>x.rates[0].insideUnit='m',x=>x.rates[0].productGroups=['Denied'],x=>x.rates.pop()]){const forged=structuredClone(record.catalog);mutate(forged);const response=await call('catalog','PUT',{expectedVersion:record.version,catalog:forged},tech);A.equal(response.status,403,JSON.stringify(response.data));}
 A.equal((await call('users/'+user.data.id+'/access','POST',{...grant,sections:['bom']},admin)).status,200);tech=await call('login','POST',{username:'tech',password});A.equal((await call('catalog','GET',undefined,tech)).status,403);
});
