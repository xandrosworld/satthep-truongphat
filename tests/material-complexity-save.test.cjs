const {test}=require('node:test'),A=require('node:assert/strict'),{createApp}=require('../server/app.cjs');
test('material creation by delegated technical account preserves complexity catalogue after reload',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>app.server.close(r)));let admin;
 const call=async(path,method='GET',body,s=admin)=>{const r=await fetch('http://127.0.0.1:'+app.server.address().port+'/api/'+path,{method,headers:{'Content-Type':'application/json',Cookie:s?.cookie||'','X-CSRF-Token':s?.csrf||''},body:body===undefined?undefined:JSON.stringify(body)}),data=await r.json();return {status:r.status,data,cookie:r.headers.get('set-cookie')?.split(';')[0],csrf:data.csrf};};
 admin=await call('setup','POST',{username:'admin',name:'Admin',password:'Material-test-2026!'});
 const modes=Object.fromEntries(require('../section-access.js').keys.map(k=>[k,'view']));modes.catalogMaterials='configure';modes.bom='use';modes.operations='use';
 await require('./helpers/personnel-user.cjs')(call,admin,{username:'hanh',name:'Hanh',password:'Material-test-2026!',role:'technical',technicalDelegation:true,canViewCosts:false,sectionModes:modes,actionAccess:{catalogMaterials:['view','create'],catalogTechnicalOperations:['view'],quotes:['view']}});
 const original=JSON.parse(app.sql.prepare('SELECT document FROM catalog WHERE id=1').get().document);original.pricingDefaults.factorDefinitions=[{id:'difficulty',name:'Difficulty',param:'complexity',kind:'category',valueMode:'multiplier',categories:[{key:'Hard',percent:1.5}]}];for(const r of original.rates)r.factors=[];app.sql.prepare('UPDATE catalog SET document=? WHERE id=1').run(JSON.stringify(original));
 const hanh=await call('login','POST',{username:'hanh',password:'Material-test-2026!'});A.equal(hanh.data.permissions.technical,true);
 const master=(await call('catalog','GET',undefined,hanh)).data;master.catalog.materials.push({...master.catalog.materials[0],id:'VT-00040',name:'Cuộn dây hàn mig 1.0'});
 const saved=await call('catalog','PUT',{expectedVersion:master.version,catalog:master.catalog},hanh);A.equal(saved.status,200,JSON.stringify(saved.data));A.notEqual(saved.data.pending,true);
 const loaded=(await call('catalog','GET',undefined,hanh)).data;A.ok(loaded.catalog.materials.some(m=>m.id==='VT-00040'));A.deepEqual(JSON.parse(app.sql.prepare('SELECT document FROM catalog WHERE id=1').get().document).rates,original.rates);
});



test('masked rate response reads shared complexity catalogue once per response',()=>{
 const app=createApp();let reads=0;const sql={exec:s=>app.sql.exec(s),prepare:s=>{if(s==='SELECT document FROM catalog WHERE id=1')reads++;return app.sql.prepare(s);}};
 const access=require('../server/data-access.cjs').createDataAccess({sql,fail:(_,message)=>{throw Error(message);}}),modes=Object.fromEntries(require('../section-access.js').keys.map(k=>[k,'view']));modes.factors='use';
 const rates=Array.from({length:100},(_,i)=>({id:'rate-'+i,name:'Rate',factors:[]}));
 const projected=access.protect({rates},{id:'performance',role:'estimator',section_access:JSON.stringify(modes)},false);A.equal(projected.rates.length,100);A.equal(reads,1);app.sql.close();
});
