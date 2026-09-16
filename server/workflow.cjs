'use strict';
const F=require('../completion-core.js');
function createWorkflow({sql,fail,transaction,audit,readBody,getQuote,currentOffer}){
  sql.exec('CREATE TABLE IF NOT EXISTS commercial(id TEXT PRIMARY KEY REFERENCES quotes(id),version INTEGER NOT NULL,document TEXT NOT NULL)');
  const get=id=>{const row=sql.prepare('SELECT document FROM commercial WHERE id=?').get(id);return row?JSON.parse(row.document):{};};
  function describe(id,q,offerVersion){if(offerVersion===undefined)offerVersion=sql.prepare("SELECT MAX(version) AS version FROM revisions WHERE id=? AND status='approved'").get(id)?.version||0;return F.workflow(q,get(id),undefined,offerVersion);}
  async function handle({req,route,user,rights,send}){
    const match=route.match(/^\/api\/quotes\/([a-f0-9-]+)\/workflow(?:\/(\d+))?$/);if(!match)return false;
    if(!['GET','POST'].includes(req.method)||req.method==='POST'&&match[2])fail(405,'Phương thức không hỗ trợ');
    if(req.method==='POST'&&!rights.commercial)fail(403,'Không có quyền cập nhật giao dịch');
    const body=req.method==='POST'?await readBody(req):null,id=match[1],quote=getQuote(id);let document=JSON.parse(quote.document),version=quote.version;
    // Commercial events refer to an immutable approved offer even if a newer internal draft exists.
    const versions=sql.prepare("SELECT version FROM revisions WHERE id=? AND status='approved' ORDER BY version DESC").all(id),latestVersion=versions[0]?.version||0;
    const selectedVersion=req.method==='GET'&&match[2]?Number(match[2]):body?.offerVersion||latestVersion;
    const approved=sql.prepare("SELECT version,document FROM revisions WHERE id=? AND status='approved' AND version=?").get(id,selectedVersion);
    if(selectedVersion&&!approved)fail(409,'Phiên bản đã chọn không có bản chào được duyệt');
    if(approved){document=JSON.parse(approved.document);version=approved.version;}else if(!rights.costs)fail(403,'Chưa có bản duyệt để xem giao dịch');
    if(req.method==='GET'){send(200,{...describe(id,document.quote,approved?version:0),offerVersion:approved?version:null,latestOfferVersion:latestVersion,approvedVersions:versions});return true;}
    if(!approved||body.offerVersion!==version||(body.expectedLatestVersion!==undefined&&body.expectedLatestVersion!==latestVersion)||(version!==latestVersion&&body.expectedLatestVersion!==latestVersion))fail(409,'Bản chào đã thay đổi hoặc chưa duyệt; tải lại trước khi ghi giao dịch');
    const result=transaction(()=>{const old=get(id);if((old.version||0)!==body.expectedVersion)fail(409,'Giao dịch vừa được cập nhật; tải lại');let next;try{next=F.transition(document.quote,old,body,user.name,{offerVersion:version});}catch(e){fail(422,e.message);}sql.prepare('INSERT INTO commercial(id,version,document) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,document=excluded.document').run(id,next.version,JSON.stringify(next));audit(user,'commercial:'+next.status,id,String(body.reason||''));return {...next,offerVersion:version};});send(200,result);return true;
  }
  return {describe,handle};
}
module.exports={createWorkflow};
