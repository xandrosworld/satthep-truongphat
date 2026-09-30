const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs');
test('norms require evidence, version and permissions; finance history stays private; retirement retains history',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;
 const call=async(path,method='GET',body,s=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Norm-test-2026!'});
 for(const [username,actions]of [['tech',['view','edit']],['read',['view']]])await require('./helpers/personnel-user.cjs')(call,admin,{username,name:username,role:'technical',password:'Norm-test-2026!',actionAccess:{workshop:actions}},{direct:true});
 const tech=await call('login','POST',{username:'tech',password:'Norm-test-2026!'}),read=await call('login','POST',{username:'read',password:'Norm-test-2026!'});
 const body={requestId:randomUUID(),expectedVersion:0,category:'other',name:'Electricity',product:'Product A',unit:'kWh',outputUnit:'bộ',quantity:2,source:'manufacturer',evidence:'Manual page 12',active:true};
 A.equal((await call('ops/norm','POST',body,read)).status,403);A.equal((await call('ops/norm','POST',{...body,evidence:''},tech)).status,400);A.equal((await call('ops/norm','POST',{...body,quantity:-1},tech)).status,400);
 let r=await call('ops/norm','POST',body,tech);A.equal(r.status,200,JSON.stringify(r.data));const n=r.data;A.equal((await call('ops/norm','POST',body,tech)).data.id,n.id);
 r=await call('ops/norm','POST',{...body,requestId:randomUUID(),id:n.id,expectedVersion:1,quantity:3,source:'production',evidence:'Job A, 10 units, 30 kWh'},tech);A.equal(r.status,200);A.equal(r.data.history[0].quantity,2);
 A.equal((await call('ops/norm','POST',{...body,requestId:randomUUID(),id:n.id,expectedVersion:1},tech)).status,409);
 A.equal((await call('ops/delete','POST',{requestId:randomUUID(),kind:'reference-norm',id:n.id,expectedVersion:2})).status,400);
 const f=await call('ops/norm','POST',{...body,requestId:randomUUID(),category:'finance',unit:'đ'});A.equal(f.status,200);
 A.equal((await call('ops/norm','POST',{...body,requestId:randomUUID(),category:'finance'},tech)).status,403);
 A.equal((await call('ops/norm','POST',{...body,requestId:randomUUID(),id:f.data.id,expectedVersion:1},tech)).status,403);
 A.equal((await call('ops/norms','GET',undefined,tech)).data.rows.length,1);
 r=await call('ops/norm','POST',{...body,requestId:randomUUID(),id:n.id,expectedVersion:2,active:false},tech);A.equal(r.status,200);A.equal(r.data.history.length,2);A.equal((await call('ops/norms','GET',undefined,read)).data.rows[0].active,false);
});

test('reference matching keeps product, output unit and stock dimensions separate; snapshots are independent',()=>{
 const records=[{id:'N',version:2,active:true,category:'material',materialId:'M',unit:'tấm',outputUnit:'bộ',product:'A',quantity:0.5,length:3000,width:1500,thickness:2,source:'production',evidence:'Batch 01'}];
 const j={id:'J',code:'J1',version:3,quantity:4,packet:{product:{name:'A',unit:'bộ'}}},d={materialId:'M',unit:'tấm',quantity:3,length:3000,width:1500,thickness:2,assigned:1,onOrder:0,remaining:2};
 const norms=require('../server/reference-norms.cjs')({list:k=>k==='reference-norm'?records:[],get:()=>null,job:()=>j,now:()=> 'now',fail:()=>{throw Error('invalid');}});
 A.equal(norms.comparison(j,d).references[0].quantity,2);A.equal(norms.comparison(j,{...d,thickness:3}).references.length,0);A.equal(norms.comparison({...j,packet:{product:{name:'B',unit:'bộ'}}},d).references.length,0);
 const p=norms.attach({jobId:'J',lines:[{materialId:'M',quantity:2}]},[{jobId:'J',rows:[d]}]);records[0].quantity=10;A.equal(p.normComparison[0].references[0].quantity,2);A.equal(p.normComparison[0].requested,2);A.equal(p.normComparison[0].jobVersion,3);
});
