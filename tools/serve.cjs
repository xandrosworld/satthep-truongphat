const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
// Only public entrypoints and declared root assets. Never customer documents or databases.
const entry=fs.readFileSync(path.join(root,'index.html'),'utf8');
const allowed=new Set(['index.html','dist/index.html',...Array.from(entry.matchAll(/(?:src|href)="([a-zA-Z0-9_-]+\.(?:js|css))"/g),m=>m[1])]);
http.createServer((req,res)=>{
  try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),name=pathname==='/'?'index.html':pathname.slice(1);
    if(req.method!=='GET'||!allowed.has(name)){res.writeHead(404,{'Content-Type':'application/json'});return res.end('{"error":"Not found"}');}
    fs.readFile(path.join(root,name),(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'}[path.extname(name)],'X-Content-Type-Options':'nosniff'});res.end(data);});
  }catch{res.writeHead(400);res.end('Bad request');}
}).listen(4173,'127.0.0.1',()=>console.log('Truong Phat demo: http://127.0.0.1:4173'));
