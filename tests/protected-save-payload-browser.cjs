const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
try{await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 const id=await p.evaluate(async()=>{
 const password='Protected-save-test-42!';teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password}));
 await teamApi('users','POST',{username:'technical-editor',name:'Technical editor',password,role:'estimator',canViewCosts:true,canEditFactors:false,sections:['bom','operations']});
 const d=TPPrice.demoSeed();d.quote.pricing.tmcLoss=2.75;const q=await teamApi('quotes','POST',{document:d});
 await teamApi('formulas/locks','POST',{key:'calculationFactors:all',locked:true,expectedVersion:0,reason:'Protect formulas'});
 await teamApi('logout','POST');teamSession(await teamApi('login','POST',{username:'technical-editor',password}));await teamLoad(q.id);return q.id;
 });
 const before=JSON.parse(app.sql.prepare('SELECT document FROM quotes WHERE id=?').get(id).document);
 await p.evaluate(()=>{
 const price=db.quote.pricing;if(!price.__accessFields?.includes('tmcLoss'))throw Error('Missing protected field metadata');
 price.tmcLoss=1.5;price.overhead=999;price.salesFactors=[{id:'local-default',percent:25}];price.tmcTables=TPPrice.defaults().tmcTables;
 C.flatten(db.quote.products).find(n=>n.ops?.length).ops[0].amount=3;
 Team.dirty=true;render(); // Synchronous protected calculation must also succeed.
 const payload=teamDocument();for(const key of price.__accessFields)if(Object.hasOwn(payload.quote.pricing,key))throw Error('Masked value sent: '+key);
 });
 await p.evaluate(()=>teamSave());await p.reload();await p.waitForFunction(()=>Team.user);await p.evaluate(id=>teamLoad(id),id);
 const after=JSON.parse(app.sql.prepare('SELECT document FROM quotes WHERE id=?').get(id).document);
 for(const key of ['tmcLoss','overhead','salesFactors','tmcTables'])expect(after.quote.pricing[key]).toEqual(before.quote.pricing[key]);
 expect(require('../core').flatten(after.quote.products).find(n=>n.ops?.length).ops[0].amount).toBe(3);
 expect(JSON.stringify(after)).not.toContain('__accessFields');
 const attack=await p.evaluate(async()=>{const d=teamDocument();d.quote.pricing.tmcLoss=99;d.quote.pricing.__accessFields=['tmcLoss'];try{await teamApi('quotes/'+teamCurrent().id,'PUT',{document:d,expectedVersion:teamCurrent().version});return 'accepted';}catch(e){return e.message;}});
 expect(attack).toContain('tmcLoss');
 expect(errors).toEqual([]);console.log('PASS protected fields: restored defaults do not block calculate/save/F5; server values preserved; technical edits kept; direct tampering rejected');
}finally{await browser.close();app.server.closeAllConnections();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
