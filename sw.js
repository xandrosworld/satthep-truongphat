'use strict';
// No offline caching of authenticated pages or customer data.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>event.waitUntil((async()=>{
 let data;try{data=event.data.json();}catch{return;}
 if(!data||typeof data.body!=='string')return;
 await self.registration.showNotification('Trường Phát',{body:data.body,tag:data.tag,icon:'/push-icon.png',badge:'/push-icon.png',data:{kind:data.tag?.startsWith('tp-chat-')?'chat':'work'}});
})()));
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const kind=event.notification.data?.kind==='chat'?'chat':'work',windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const page=windows.find(w=>new URL(w.url).origin===self.location.origin);if(page){await page.focus();page.postMessage({type:'tp-open-notifications',kind});}else await self.clients.openWindow('/?notifications='+kind);})());});
self.addEventListener('message',event=>{if(event.data?.type==='tp-clear-notifications')event.waitUntil(self.registration.getNotifications().then(items=>items.forEach(n=>n.close())));});
