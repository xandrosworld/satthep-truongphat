// Legacy permission regression cases need direct grants, but still create accounts
// through approved personnel. This hook is installed only by those test fixtures.
module.exports=async function(page){
 await page.exposeFunction('createApprovedFixtureUser',async body=>{
  const call=async(path,method='GET',data)=>{const response=await page.request.fetch(new URL('/api/'+path,page.url()).href,{method,data,headers:{'X-CSRF-Token':await page.evaluate(()=>Team.csrf)}});return {status:response.status(),data:await response.json()};};
  return require('./personnel-user.cjs')(call,null,body,{direct:true});
 });
 await page.evaluate(()=>{const original=teamApi;teamApi=(path,method,body)=>path==='users'&&method==='POST'&&!body?.employeeId?window.createApprovedFixtureUser(body):original(path,method,body);});
};
