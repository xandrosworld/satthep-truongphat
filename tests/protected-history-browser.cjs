'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage();try{
 await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 const result=await p.evaluate(async()=>{
  const password='Protected-history-2026!';teamSession(await teamApi('setup','POST',{username:'admin',name:'Admin',password}));
  const doc=TPPrice.demoSeed();doc.quote.pricing.overhead=12.34567;
  const quote=await teamApi('quotes','POST',{document:doc});
  const sectionModes=Object.fromEntries(TPSectionAccess.keys.map(k=>[k,'use']));
  await teamApi('users','POST',{username:'editor',name:'Editor',password,role:'estimator',canViewCosts:true,canEditFactors:false,sectionModes});
  await teamApi('logout','POST',{});teamSession(await teamApi('login','POST',{username:'editor',password}));await teamLoad(quote.id);
  const before=JSON.stringify(db.quote.changeHistory),selected=db.quote.pricing.selected;
  mutation(()=>{db.quote.pricing.selected=selected==='kg'?'factor':'kg';});
  const after=JSON.stringify(db.quote.changeHistory),document=teamDocument();
  const calculated=await teamApi('access/calculate','POST',{document});
  const saved=await teamApi('quotes/'+quote.id,'PUT',{document,expectedVersion:quote.version});
  const latest=await teamApi('quotes/'+quote.id);const forged=C.copy(latest.document);forged.quote.changeHistory=[{actor:'forged'}];
  await teamApi('access/calculate','POST',{document:forged});
  await teamApi('quotes/'+quote.id,'PUT',{document:forged,expectedVersion:latest.version});
  const altered=C.copy(forged);altered.quote.pricing.overhead=99;let forbidden;
  try{await teamApi('access/calculate','POST',{document:altered});}catch(e){forbidden=e.status;}
  const history=await teamApi('quotes/'+quote.id);
  try{await teamApi('quotes/'+quote.id,'PUT',{document:altered,expectedVersion:history.version});throw new Error('Unauthorized coefficient save succeeded');}catch(e){if(e.status!==403)throw e;}
  await teamApi('logout','POST',{});teamSession(await teamApi('login','POST',{username:'admin',password}));
  const full=await teamApi('quotes/'+quote.id);
  return {before,after,forbidden,saved:!!saved,calculated:!!calculated,overhead:full.document.quote.pricing.overhead,forgedPersisted:full.document.quote.changeHistory.some(x=>x.actor==='forged'),lastActor:full.document.quote.changeHistory.at(-1)?.actor};
 });
 expect(result.after).toBe(result.before);expect(result.saved).toBe(true);expect(result.calculated).toBe(true);expect(result.forbidden).toBe(403);expect(result.overhead).toBe(12.34567);expect(result.lastActor).toBe('Editor');expect(result.forgedPersisted).toBe(false);console.log('PASS protected history unchanged by authorized pricing edit; calculate/save succeed; server audit recorded; forged history discarded; unauthorized coefficient edit denied');
 }finally{await b.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
