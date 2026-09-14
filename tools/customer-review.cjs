// Interactive browser review. No credentials, cookies or storage are written to disk.
const {chromium}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),repl=require('node:repl');
(async()=>{
  const fallback=path.join(process.env.LOCALAPPDATA||'','ms-playwright','chromium-1228','chrome-win64','chrome.exe');
  const browser=await chromium.launch({headless:true,...(fs.existsSync(fallback)?{executablePath:fallback}:{})});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const state={allowAuth:false,requests:[],blocked:[],errors:[]};
  // Deny business writes; auth may be temporarily allowed only at explicit login endpoints.
  await context.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url()),method=req.method();
    state.requests.push({method,host:url.host,path:url.pathname});
    if(['GET','HEAD','OPTIONS'].includes(method))return route.continue();
    if(state.allowAuth&&/auth|login|signin|sign-in/i.test(url.pathname))return route.continue();
    state.blocked.push({method,host:url.host,path:url.pathname});
    return route.abort('blockedbyclient');
  });
  page.on('pageerror',e=>state.errors.push(e.message));
  fs.mkdirSync(path.resolve('artifacts/customer-review'),{recursive:true});
  const shell=repl.start({prompt:'review> ',useGlobal:false});
  Object.assign(shell.context,{browser,context,p:page,state});
  shell.on('exit',()=>browser.close().then(()=>process.exit(0)));
})().catch(e=>{console.error(e.message);process.exit(1);});
