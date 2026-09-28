const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs');
test('machine specifications, append-only repairs and separate shift pricing preserve data and enforce access',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;
 const call=async(path,method='GET',body,s=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Machine-test-2026!'});
 await call('users','POST',{username:'tech',name:'Technical',role:'technical',password:'Machine-test-2026!',actionAccess:{workshop:['view','create','edit']}});const tech=await call('login','POST',{username:'tech',password:'Machine-test-2026!'});
 let r=await call('ops/master','POST',{requestId:randomUUID(),kind:'machine',expectedVersion:0,document:{code:'M1',name:'Laser',workshop:'A',hoursPerDay:8,technicalSpecs:'Power: 3 kW\nSheet: 3000 × 1500 mm'}});A.equal(r.status,200);let m=r.data;
 const pricing={requestId:randomUUID(),id:m.id,expectedVersion:m.version,hoursPerShift:8,shiftRate:1600000};A.equal((await call('ops/machine-rate','POST',pricing,tech)).status,403);A.equal((await call('ops/machine-rate','POST',{...pricing,hoursPerShift:0})).status,400);
 r=await call('ops/machine-rate','POST',pricing);A.equal(r.status,200);m=r.data;A.equal(m.hourRate,200000);A.equal((await call('ops/machine-rate','POST',pricing)).data.version,m.version);
 A.equal((await call('ops/machine-rate','POST',{...pricing,requestId:randomUUID()})).status,409);
 const hidden=(await call('ops/state','GET',undefined,tech)).data.machines[0];A.equal(hidden.shiftRate,undefined);A.equal(hidden.hourRate,undefined);A.match(hidden.technicalSpecs,/3 kW/);
 r=await call('ops/master','POST',{requestId:randomUUID(),kind:'machine',expectedVersion:hidden.version,document:{...hidden,technicalSpecs:'Updated specification'}},tech);A.equal(r.status,200);m=(await call('ops/state')).data.machines[0];A.equal(m.shiftRate,1600000);A.equal(m.hourRate,200000);
 const repair={requestId:randomUUID(),machineId:m.id,date:'2026-09-28',content:'Replace lens',provider:'Service team',downtimeHours:2,note:'Checked'};
 A.equal((await call('ops/machine-repair','POST',{...repair,content:''},tech)).status,400);A.equal((await call('ops/machine-repair','POST',repair,tech)).status,200);A.equal((await call('ops/machine-repair','POST',repair,tech)).status,200);
 const state=(await call('ops/state')).data;A.equal(state.machineRepairs.length,1);A.equal(state.machineRepairs[0].content,'Replace lens');A.equal(state.machines[0].technicalSpecs,'Updated specification');
 A.equal((await call('ops/delete','POST',{requestId:randomUUID(),kind:'machine',id:m.id,expectedVersion:m.version})).status,409);
});
