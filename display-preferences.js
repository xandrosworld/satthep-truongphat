(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TPDisplay=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const key='tp-display-preferences-v1',defaults={locale:'vi-VN',date:'dd/MM/yyyy',decimals:3,grouping:true,theme:'light'};
 function normalize(value={}){return {locale:['vi-VN','en-US'].includes(value?.locale)?value.locale:defaults.locale,date:['dd/MM/yyyy','MM/dd/yyyy','yyyy-MM-dd'].includes(value?.date)?value.date:defaults.date,decimals:Number.isInteger(value?.decimals)&&value.decimals>=0&&value.decimals<=6?value.decimals:defaults.decimals,grouping:typeof value?.grouping==='boolean'?value.grouping:true,theme:['light','dark','system'].includes(value?.theme)?value.theme:'light'};}
 let current={...defaults};try{current=normalize(JSON.parse(localStorage.getItem(key)||'{}'));}catch{}
 const get=()=>({...current});
 function applyTheme(){if(typeof document==='undefined')return;const dark=current.theme==='dark'||current.theme==='system'&&typeof matchMedia==='function'&&matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.dataset.theme=dark?'dark':'light';}
 function save(value){const next=normalize(value);localStorage.setItem(key,JSON.stringify(next));current=next;applyTheme();return get();}
 function number(value,digits=current.decimals,prefs=current){const n=Number(value??0);return Number.isFinite(n)?n.toLocaleString(prefs.locale,{useGrouping:prefs.grouping,maximumFractionDigits:Math.max(0,Math.min(6,digits))}):'—';}
 // VND remains the accounting currency. Formatting never converts the amount.
 function money(value,prefs=current){return number(Math.round(Number(value)||0),0,prefs);}
 function date(value,withTime=false,prefs=current){if(!value)return '—';let year,month,day,date;
  if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)){[year,month,day]=value.split('-');date=new Date(Number(year),Number(month)-1,Number(day));if(date.getFullYear()!==+year||date.getMonth()+1!==+month||date.getDate()!==+day)return '—';}
  else {date=value instanceof Date?value:new Date(value);if(!Number.isFinite(date.getTime()))return '—';year=String(date.getFullYear());month=String(date.getMonth()+1).padStart(2,'0');day=String(date.getDate()).padStart(2,'0');}
  const text=prefs.date.replace('yyyy',year).replace('MM',month).replace('dd',day);return text+(withTime?' '+date.toLocaleTimeString('vi-VN',{hour12:false}):'');
 }
 applyTheme();if(typeof matchMedia==='function')matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
 if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key===key){try{current=normalize(JSON.parse(e.newValue||'{}'));applyTheme();window.dispatchEvent(new Event('tp-display-change'));}catch{}}});
 function cell(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)?$/.test(value)?date(value,value.includes('T')):value;}
 return {defaults,normalize,get,save,number,money,date,cell,applyTheme};
});
