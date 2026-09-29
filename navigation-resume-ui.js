/* Navigation only: no form values, business documents or credentials persisted. */
'use strict';
const NavigationResume={ready:false};
function installNavigationResume(){
 const key=id=>'tp-navigation-v1:'+id;
 const read=()=>{try{return JSON.parse(sessionStorage.getItem(key(Team.user.id))||'null');}catch{return null;}};
 const save=()=>{if(!Team.user||!NavigationResume.ready)return;const q=teamCurrent(),s={page,scroll:scrollY};
  if(page==='quote'&&q)Object.assign(s,{quote:q.id,revision:q.readOnly?q.version:null,tab,selected,priceTab:Intake.priceTab,mode:UX.mode});
  else if(page==='operationsERP')Object.assign(s,{tab:OpsERP.tab,id:OpsERP.job?.jobId});
  else if(page==='enterprise')Object.assign(s,{view:Enterprise.view,tab:Enterprise.tab});
  else if(page==='business')Object.assign(s,{view:Business.view,id:Business.current?.id});
  else if(page==='referenceNorms')Object.assign(s,{tab:RefNorms.tab,id:RefNorms.job});
  else if(page==='serviceRequests')s.tab=ServiceRequests.tab;
  else if(page==='reports')s.kind=Reports.kind;
  else if(page==='erp')s.view=ErpShell.view;
  else if(page==='rates')s.tab=rateTab;
  try{sessionStorage.setItem(key(Team.user.id),JSON.stringify(s));}catch{}
 };
 addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
 const session=teamSession;teamSession=function(v){const old=Team.user?.id;if(old&&v.user?.id!==old){try{sessionStorage.removeItem(key(old));}catch{}}return session(v);};
 const open=teamOpenRequestedQuote;teamOpenRequestedQuote=async function(){
  if(NavigationResume.ready)return open();
  if(!Team.user)return false;
  const state=read(),generation=Team.sessionGeneration,params=new URLSearchParams(location.search),explicit=params.get('quote');
  let handled=false;
  try{
   if(explicit){handled=await open();if(!state||state.page!=='quote'||state.quote!==explicit)return handled;}
   if(!state||typeof state!=='object')return handled;
   const s=state;
   if(s.page==='quote'&&s.quote){if(!explicit)await teamLoad(s.quote,s.revision||undefined);
    if(generation!==Team.sessionGeneration)return true;
    if(['intake','bom','operations','waste','mass','prices','pricing','preview'].includes(s.tab))tab=s.tab;
    if(['materials','operations','devices','logistics','installation','factors','alternatives','competitor','kg'].includes(s.priceTab))Intake.priceTab=s.priceTab;
    if(C.findNode(db.quote.products,s.selected))selected=s.selected;
    if(['quick','detail'].includes(s.mode))UX.mode=s.mode;
    render();handled=true;
   }else if(s.page==='operationsERP'&&Object.hasOwn(opsLabels,s.tab)){await opsOpen(s.tab,s.id);handled=true;}
   else if(s.page==='enterprise'&&['finance','attendance','payroll','work'].includes(s.view)){await enterpriseOpen(s.view);if(typeof s.tab==='string')Enterprise.tab=s.tab;render();handled=true;}
   else if(s.page==='business'&&['contracts','profile'].includes(s.view)){await businessOpen(s.view,s.id);handled=true;}
   else if(s.page==='referenceNorms'){RefNorms.job=s.id||'';if(typeof s.tab==='string')RefNorms.tab=s.tab;await normsOpen();handled=true;}
   else if(s.page==='serviceRequests'){if(typeof s.tab==='string')ServiceRequests.tab=s.tab;await serviceOpen();handled=true;}
   else if(s.page==='reports'&&['overview','production','revenue','inventory'].includes(s.kind)){await reportsOpen(s.kind);handled=true;}
   else if(s.page==='erp'&&s.view==='overview'){await dashboardOpen();handled=true;}
   if(handled&&generation===Team.sessionGeneration&&Number.isFinite(s.scroll))requestAnimationFrame(()=>scrollTo(0,Math.max(0,s.scroll)));
   return handled;
  }catch(e){toast('Không mở lại được mục đang xem: '+e.message);try{sessionStorage.removeItem(key(Team.user?.id));}catch{}return false;}
  finally{NavigationResume.ready=true;}
 };
}
