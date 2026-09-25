'use strict';
const {chromium,expect}=require('@playwright/test'),{createApp}=require('../server/app.cjs');
(async()=>{const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'msedge',headless:true});try{
 const p=await browser.newPage();await p.goto('http://127.0.0.1:'+app.server.address().port);await p.waitForFunction(()=>Team.available);
 const id=await p.evaluate(async()=>{teamSession(await teamApi('setup','POST',{username:'admin',name:'QA',password:'Resilience-only-2026!'}));const q=await teamApi('quotes','POST',{document:TPPrice.demoSeed()});await teamLoad(q.id);return q.id;});
 let release,arrived;const seen=new Promise(r=>arrived=r),gate=new Promise(r=>release=r);let puts=0;
 const delay=async route=>{if(route.request().method()!=='PUT')return route.continue();puts++;const response=await route.fetch();arrived();await gate;await route.fulfill({response});};
 await p.route('**/api/quotes/'+id,delay);
 await p.evaluate(()=>{db.quote.project='Saved snapshot';Team.dirty=true;window.pendingSave=Promise.all([teamSave(),teamSave()]);});await seen;
 await p.evaluate(()=>{db.quote.project='New edit while saving';Team.editGeneration=(Team.editGeneration||0)+1;Team.dirty=true;});release();await p.evaluate(()=>window.pendingSave);
 expect(puts).toBe(1);expect(await p.evaluate(()=>Team.dirty)).toBe(true);expect(await p.evaluate(()=>db.quote.project)).toBe('New edit while saving');expect(JSON.parse(app.sql.prepare('SELECT document FROM quotes WHERE id=?').get(id).document).quote.project).toBe('Saved snapshot');
 await p.unroute('**/api/quotes/'+id,delay);await p.evaluate(()=>teamSave());expect(await p.evaluate(()=>Team.dirty)).toBe(false);
 // Offline failure keeps unsaved content and does not advance the server revision.
 const version=app.sql.prepare('SELECT version FROM quotes WHERE id=?').get(id).version;await p.context().setOffline(true);
 expect(await p.evaluate(async()=>{db.quote.project='Offline draft';Team.dirty=true;try{await teamSave();return false;}catch{return Team.dirty&&db.quote.project==='Offline draft';}})).toBe(true);
 expect(app.sql.prepare('SELECT version FROM quotes WHERE id=?').get(id).version).toBe(version);await p.context().setOffline(false);await p.evaluate(()=>teamSave());
 // Server commits but response is lost. Retry must conflict rather than create a new revision.
 const lost=async route=>{if(route.request().method()!=='PUT')return route.continue();await route.fetch();await route.abort('failed');};await p.route('**/api/quotes/'+id,lost);
 expect(await p.evaluate(async()=>{db.quote.project='Committed without response';Team.dirty=true;try{await teamSave();return false;}catch{return Team.dirty;}})).toBe(true);
 await p.unroute('**/api/quotes/'+id,lost);const committed=app.sql.prepare('SELECT version FROM quotes WHERE id=?').get(id).version;
 expect(await p.evaluate(async()=>{try{await teamSave();return 0;}catch(e){return e.status;}})).toBe(409);expect(app.sql.prepare('SELECT version FROM quotes WHERE id=?').get(id).version).toBe(committed);
 await p.reload();await p.waitForFunction(()=>Team.user);await p.evaluate(async id=>{Team.dirty=false;await teamLoad(id);},id);expect(await p.evaluate(()=>db.quote.project)).toBe('Committed without response');
 console.log('PASS resilience browser: double save, edits during response delay, offline retry, committed response loss, conflict and reload');
 }finally{await browser.close();await new Promise(r=>app.server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
