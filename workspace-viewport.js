'use strict';
// Keep navigation positions within this session, separated by quotation and view.
function installWorkspaceViewport(){
 const positions=new Map();let currentKey=null;
 const key=()=>JSON.stringify([Team.sessionGeneration,page,db.quote.workspaceKey||db.quote.id,
  page==='quote'?[tab,tab==='bom'?UX.mode:'']:page==='rates'?rateTab:'']);
 const scrollers=()=>[...document.querySelectorAll('#content .table-scroll,#content [data-pa-scroll],#content .workspace-tabs')];
 const capture=()=>({x:scrollX,y:scrollY,inner:scrollers().map(el=>({id:el.id,classes:el.className,x:el.scrollLeft,y:el.scrollTop}))});
 const previous=render;
 render=function(...args){
  const before=capture(),nextKey=key(),nav=document.querySelector('#sidebar nav'),navTop=nav?.scrollTop;
  if(currentKey)positions.set(currentKey,before);
  const target=positions.get(nextKey)||before;
  const value=previous.apply(this,args);
  currentKey=key();
  if(nav)nav.scrollTop=navTop;
  // Restore only after all rendering extensions have finished inserting headers.
  if(currentKey===nextKey){
   const nodes=scrollers();
   if(positions.has(nextKey)){
    target.inner.forEach((saved,i)=>{const el=saved.id?document.getElementById(saved.id):nodes[i];if(el&&el.className===saved.classes){el.scrollLeft=saved.x;el.scrollTop=saved.y;}});
   }
   window.scrollTo({left:target.x,top:target.y,behavior:'instant'});
  }
  // Bound memory for long sessions with many open quotations.
  if(positions.size>100)positions.delete(positions.keys().next().value);
  return value;
 };
}
