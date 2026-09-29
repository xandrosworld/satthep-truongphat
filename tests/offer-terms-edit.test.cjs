const {test}=require('node:test'),A=require('node:assert/strict'),T=require('../offer-terms-core.js'),S=require('../section-access.js');
const data={signature:'none',delivery:'Tại xưởng',installation:'Không áp dụng',payment:'50/50',warranty:'12 tháng',scope:'Vật tư và công',reason:''};
test('missing reason is explicit, draft remains savable, submitted terms can be corrected',()=>{
 for(const status of ['draft','submitted']){const q={id:'QA',status};A.throws(()=>T.save(q,data,true),/Nhập căn cứ/);T.save(q,data,false);A.equal(q.offerTerms.payment,'50/50');A.ok(T.errors(q).length);T.save(q,{...data,reason:'Theo thỏa thuận'},true);A.deepEqual(T.errors(q),[]);q.offerTerms.payment='30/70';A.ok(T.errors(q).some(x=>x.includes('nội dung đã đổi')));}
 A.throws(()=>T.save({status:'approved'},data,false),/khóa/);
});
test('offer terms history follows commercial permission without requiring management',()=>{
 const before={quote:{id:'QA',status:'draft'}},after=structuredClone(before);T.save(after.quote,data,false);
 A.deepEqual(S.denied(before,after,{sections:['commercial'],factors:false}),[]);
 A.ok(S.denied(before,after,{sections:[],factors:false}).includes('commercial'));
});
test('delivery terms remain visible to commercial staff without revealing delivery costs',()=>{
 const app=require('../server/app.cjs').createApp();
 try{const access=require('../server/data-access.cjs').createDataAccess({sql:app.sql,fail:(_status,message)=>{throw Error(message);}}),user={id:'QA-terms',role:'estimator',section_access:JSON.stringify({commercial:'use',factors:'configure',logistics:'none'})};
 const protectedDoc=access.protect({quote:{offerTerms:{delivery:'Giao tại xưởng'},pricing:{delivery:450000}}},user);
 A.equal(protectedDoc.quote.offerTerms.delivery,'Giao tại xưởng');A.equal(protectedDoc.quote.pricing.delivery,0);
 }finally{app.sql.close();}
});
