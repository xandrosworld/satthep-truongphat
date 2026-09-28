const {test}=require('node:test'),A=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{createApp}=require('../server/app.cjs');
test('department request retains original, purchaser amends, approval then receipt and stock; duplicate protection',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,r));t.after(()=>new Promise(r=>app.server.close(r)));let session;
 const call=async(path,body,auth=session)=>{const r=await fetch('http://localhost:'+app.server.address().port+'/api/'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',Cookie:auth?.cookie||'','X-CSRF-Token':auth?.csrf||''},body:body?JSON.stringify(body):undefined});const data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 session=await call('setup',{username:'admin',name:'Admin',password:'Department-test-2026!'});
 await call('users',{username:'requester',name:'Requester',role:'technical',password:'Department-test-2026!',actionAccess:{purchasing:['view','create']}});const requester=await call('login',{username:'requester',password:'Department-test-2026!'});
 const mat=await call('ops/master',{requestId:randomUUID(),kind:'material',expectedVersion:0,document:{code:'GENERAL-01',name:'Office material',unit:'cÃ¡i',form:'bulk',active:true}});A.equal(mat.status,200,JSON.stringify(mat.data));
 const mat2=await call('ops/master',{requestId:randomUUID(),kind:'material',expectedVersion:0,document:{code:'GENERAL-02',name:'Extra type',unit:'cái',form:'bulk',active:true}});A.equal(mat2.status,200);
 const supplier=await call('ops/master',{requestId:randomUUID(),kind:'supplier',expectedVersion:0,document:{code:'SUP-G',name:'Supplier',active:true,prices:[]}});
 const body={requestId:randomUUID(),scope:'department',department:'Office',basis:'10 staff x 1 item',lines:[{materialId:mat.data.id,quantity:10}]};
 A.equal((await call('ops/material-request',{...body,basis:''},requester)).status,400);
 let r=await call('ops/material-request',body,requester);A.equal(r.status,200,JSON.stringify(r.data));let p=r.data;A.equal(p.state,'pricing-review');A.equal((await call('ops/material-request',body,requester)).data.id,p.id);
 const amend={requestId:randomUUID(),id:p.id,expectedVersion:p.version,action:'amend',note:'Additional two staff',lines:[{materialId:mat.data.id,quantity:12},{materialId:mat2.data.id,quantity:2}]};
 A.equal((await call('ops/material-request-review',amend,requester)).status,403);
 A.equal((await call('ops/material-request-review',{...amend,note:''})).status,400);
 r=await call('ops/material-request-review',amend);A.equal(r.status,200,JSON.stringify(r.data));p=r.data;A.equal(p.originalLines[0].quantity,10);A.equal(p.lines[0].quantity,12);A.equal(p.adjustments.length,1);A.equal(p.normComparison[0].requested,12);A.equal((await call('ops/material-request-review',{...amend,requestId:randomUUID()})).status,409);
 r=await call('ops/material-request-review',{requestId:randomUUID(),id:p.id,expectedVersion:p.version,action:'pricing',supplierId:supplier.data.id,prices:p.lines.map(l=>({lineId:l.id,unitCost:1000}))});A.equal(r.status,200,JSON.stringify(r.data));p=r.data;
 A.equal((await call('ops/material-request-review',{...amend,requestId:randomUUID(),expectedVersion:p.version})).status,409);
 const visible=await call('ops/material-requests',undefined,requester);A.equal(visible.data.rows[0].lines[0].unitCost,undefined);
 for(const state of ['approved','ordered','shipping','received','stocked']){const b={requestId:randomUUID(),id:p.id,expectedVersion:p.version,state,receipts:p.lines.map(l=>({lineId:l.id,materialId:l.materialId,quantity:l.quantity,warehouse:'Office store',unitWeight:1,length:0,width:0,thickness:0}))};r=await call('ops/transition',b);A.equal(r.status,200,JSON.stringify(r.data));p=r.data;if(state==='stocked')A.equal((await call('ops/transition',b)).data.id,p.id);}
 const stock=(await call('ops/state')).data;A.equal(stock.lots.length,2);const lot=stock.lots.find(l=>l.materialId===mat.data.id);A.equal(lot.quantity,12);
 const issue={requestId:randomUUID(),lotId:lot.id,quantity:12,reference:p.code,note:'Issue to Office'};A.equal((await call('ops/issue',issue)).status,200);A.equal((await call('ops/issue',issue)).status,200);A.equal((await call('ops/state')).data.lots.find(l=>l.id===lot.id).quantity,0);
});

