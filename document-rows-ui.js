'use strict';
// Keep existing navigation handlers and permissions; make the document code the entry point.
(function(){
 const selector='button[data-production-job],button[data-order-open],button[data-team="open"],button[data-work="open-quote"]';
 function enhance(){for(const button of document.querySelectorAll(selector)){
  const row=button.closest('tbody tr');if(!row||row.dataset.documentRow||button.disabled)continue;
  const cell=row.cells[0];if(!cell)continue;const title=cell.querySelector('strong')||[...cell.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());if(!title)continue;
  const link=document.createElement('span');for(const a of button.attributes)if(a.name.startsWith('data-'))link.setAttribute(a.name,a.value);
  link.className='document-row-link';link.tabIndex=0;link.setAttribute('role','link');link.setAttribute('aria-label','Mở '+title.textContent.trim());link.textContent=title.textContent;title.replaceWith(link);button.remove();row.dataset.documentRow='';row.title='Bấm vào dòng để mở chi tiết';
 }}
 document.addEventListener('click',e=>{const row=e.target.closest('[data-document-row]');if(!row||e.target.closest('button,a,input,select,textarea,label,summary,[role="link"],[role="button"],[contenteditable]')||window.getSelection()?.toString())return;row.querySelector('.document-row-link')?.click();});
 document.addEventListener('keydown',e=>{if(!e.target.matches('.document-row-link')||!['Enter',' '].includes(e.key))return;e.preventDefault();e.target.click();});
 const observer=new MutationObserver(enhance);observer.observe(document.body,{childList:true,subtree:true});enhance();
})();
