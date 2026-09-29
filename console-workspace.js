'use strict';
function installConsoleWorkspace(){
 const windows=new Map(),labels={'orders-console':'Đơn hàng','production-console':'Lệnh sản xuất'};
 const shade=document.createElement('div'),bar=document.createElement('nav');shade.className='console-shade';shade.hidden=true;bar.className='console-tabs';bar.setAttribute('aria-label','Các bảng đang mở');bar.hidden=true;document.body.append(shade,bar);let active=null;
 function paint(){bar.replaceChildren();for(const [id,d]of windows){const b=document.createElement('button');b.type='button';b.dataset.consoleTab=id;b.textContent=labels[id];b.setAttribute('aria-pressed',String(active===d));b.onclick=()=>activate(d,true);bar.append(b);}bar.hidden=!windows.size;shade.hidden=!active;}
 function minimize(){if(!active)return;const d=active;d._consoleFocus=document.activeElement;d.hidden=true;active=null;paint();bar.querySelector('[data-console-tab="'+d.id+'"]')?.focus({preventScroll:true});}
 function activate(d,expanded=false){if(active&&active!==d){active._consoleFocus=document.activeElement;active.hidden=true;}windows.set(d.id,d);active=d;d.hidden=false;d.classList.toggle('console-expanded',expanded);if(!d.open)HTMLDialogElement.prototype.show.call(d);paint();(d._consoleFocus?.isConnected?d._consoleFocus:d.querySelector('button,input,select'))?.focus({preventScroll:true});}
 function attach(d){if(d.dataset.consoleWorkspace)return d;d.dataset.consoleWorkspace='true';d.classList.add('console-window');d.showModal=()=>activate(d);const close=d.close.bind(d);d.close=(...args)=>{windows.delete(d.id);if(active===d)active=null;d.hidden=false;d.classList.remove('console-expanded');close(...args);paint();};
  const button=document.createElement('button');button.type='button';button.dataset.consoleMinimize='';button.textContent='Thu nhỏ';button.onclick=minimize;d.querySelector('header')?.append(button);return d;}
 const order=ordersShell,production=productionShell;ordersShell=()=>{const d=attach(order());if(d.open&&d.hidden)activate(d);return d;};productionShell=()=>attach(production());
 shade.addEventListener('click',minimize);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active&&!document.querySelector('dialog:modal')){e.preventDefault();e.stopImmediatePropagation();minimize();}},true);
 document.addEventListener('click',e=>{const b=e.target.closest('#sidebar button');if(!b)return;const id=b.hasAttribute('data-production-launch')?'production-console':b.hasAttribute('data-orders')?'orders-console':null;const d=windows.get(id);if(d){e.preventDefault();e.stopImmediatePropagation();activate(d,true);}else if(active)minimize();},true);
 const session=teamSession;teamSession=function(value){const old=Team.user?.id;const next=value?.user?.id;if(old!==next){for(const d of [...windows.values()]){d.close();d.querySelector('main')?.replaceChildren();}}return session(value);};
}
