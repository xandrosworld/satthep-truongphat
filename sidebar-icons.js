/* Trường Phát — precision line icons. Original SVG geometry, 24px grid. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TPSidebarIcons=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const paths={
 overview:'<rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="3" y="15" width="7" height="6" rx="1.5"/><path d="M14 20v-6m3.5 6v-9m3.5 9v-6"/>',
 chat:'<path d="M7 17H5l-3 3V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6"/><path d="M9 20h8l4 2v-5M7 8h8M7 11h5"/>',
 customers:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 4a3 3 0 0 1 0 6m1 4a5 5 0 0 1 3 4v2"/>',
 quote:'<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h4"/>',
 orders:'<rect x="4" y="5" width="16" height="16" rx="2"/><rect x="8" y="2" width="8" height="5" rx="1.5"/><path d="m8 14 2.5 2.5L16 11"/>',
 contracts:'<path d="M12 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9M8 8h4M8 12h3m3 5 6-6-3-3-6 6-1 4zM18 20h3"/>',
 production:'<path d="M3 21V10l6 3V8l6 3V3h4l2 18zM7 17v1m5-1v1m5-1v1M15 7h4"/>',
 materials:'<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5M12 13v8"/>',
 rates:'<rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 6h8v4H8zM8 14h1m6 0h1m-8 4h1m4-4v4m3-4v4"/>',
 library:'<path d="M3 8h18v12H3zM3 8V5h6l2 3M8 12h8v5H8zM5 3h14v5"/>',
 rules:'<path d="M4 3h16v18H4zM9 3v18M4 8h16M4 14h16m-2-9h-3m3 6h-3m3 6h-3"/>',
 inventory:'<path d="m2 9 10-6 10 6M4 8v13h16V8M8 21V11h8v10M8 15h8m-8 3h8"/>',
 finance:'<rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 7V5a2 2 0 0 1 2-2h13v3m3 6h-6v5h6"/><circle cx="17" cy="14.5" r=".6" fill="currentColor" stroke="none"/>',
 reports:'<path d="M4 3v18h17M8 17v-5m5 5V8m5 9V5"/><path d="m7 7 5-4 5 1 4-2"/>',
 personnel:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4m-3 6h5m-5 4h5M6 18a3 3 0 0 1 6 0"/><circle cx="9" cy="12" r="2"/>',
 organization:'<rect x="8" y="2" width="8" height="5" rx="1"/><path d="M12 7v5H5v4m7-4h7v4"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/>',
 permissions:'<path d="m12 2 8 3v6c0 5-4 9-8 11-4-2-8-6-8-11V5z"/><path d="m8 12 3 3 5-6"/>',
 profile:'<path d="M3 21V5h11v16M14 10h7v11M1 21h22M7 9h3m-3 4h3m-3 4h3m8-3h1m-1 3h1"/>',
 attendance:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v5m10-5v5M3 10h18m-14 5 3 3 6-5"/>',
 payroll:'<path d="M5 3h14v19l-3-2-4 2-4-2-3 2zM8 7h8m-8 4h8m-8 4h3"/><circle cx="16" cy="16" r="2"/>',
 work:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m6-18v18M5.5 7h1m5 0h1m5 0h1m-12 4h1m5 0h1m-7 4h1"/>',
 settings:'<path d="M4 3v5m0 4v9M12 3v10m0 4v4M20 3v3m0 4v11"/><rect x="2" y="8" width="4" height="4" rx="1"/><rect x="10" y="13" width="4" height="4" rx="1"/><rect x="18" y="6" width="4" height="4" rx="1"/>',
 guide:'<path d="M12 5C9 3 6 3 2 4v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1v15M6 8h2m-2 4h2m8-4h2m-2 4h2"/>'
 };
 const rasterSources=Object.fromEntries(Object.keys(paths).map(name=>[name,'assets/sidebar-icons/'+name+'.png']));
 function svg(name){return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(paths[name]||paths.overview)+'</svg>';}
 function key(b){const d=b.dataset;if('settingsOpen'in d)return 'settings';if(d.action==='guide')return 'guide';if('chatLaunch'in d)return 'chat';if('productionLaunch'in d)return 'production';if(d.orders)return 'orders';if(d.page)return {customers:'customers',quote:'quote',materials:'materials',rates:'rates',library:'library',rules:'rules'}[d.page];if(d.erp)return d.erp==='hr'?'personnel':d.erp;if(d.business)return d.business==='profile'?'profile':'contracts';if(d.org)return {employees:'personnel',departments:'organization',roles:'permissions'}[d.org];if(d.ent==='view')return d.id==='work'?'work':d.id;if('governanceOpen'in d)return 'permissions';return null;}
 function install(){const sidebar=document.querySelector('#sidebar');if(!sidebar||sidebar.dataset.svgIcons)return;sidebar.dataset.svgIcons='true';const paint=()=>{for(const b of sidebar.querySelectorAll('nav button,.side-help')){const name=key(b);if(!name||!paths[name])continue;let icon=b.querySelector(':scope > .nav-symbol');if(!icon){icon=document.createElement('span');icon.className='nav-symbol';b.prepend(icon);}if(icon.dataset.icon!==name||!icon.querySelector('img,svg')){icon.dataset.icon=name;const img=document.createElement('img');img.src=rasterSources[name];img.alt='';img.width=img.height=36;img.decoding='async';img.draggable=false;img.onerror=()=>{icon.innerHTML=svg(name);};icon.replaceChildren(img);icon.setAttribute('aria-hidden','true');}b.classList.add('has-nav-icon');for(const node of [...b.childNodes])if(node.nodeType===3&&node.textContent.trim()){const label=document.createElement('span');label.className='nav-label-text';label.textContent=node.textContent.trim();node.replaceWith(label);}}};paint();let pending=false;new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;paint();});}).observe(sidebar,{childList:true,subtree:true});}
 return {paths,svg,install};
});
