'use strict';
const C=require('../core.js'),I=require('./material-identity.cjs'),{createHash}=require('node:crypto');
module.exports=function({sql,fail,transaction,audit}){
 const one=(q,...v)=>sql.prepare(q).get(...v);
 function resolve(id,b,user){
  if(user.role!=='admin')fail(403,'Chỉ Admin được đối chiếu và tách mã vật tư');
  return transaction(()=>{
   const j=one('SELECT * FROM production_jobs WHERE id=?',id);if(!j)fail(404,'Không tìm thấy lệnh');
   const p=JSON.parse(j.packet),progress=JSON.parse(j.progress),cat=one('SELECT * FROM catalog WHERE id=1');
   if(j.version!==b.expectedVersion||cat?.version!==b.catalogVersion)fail(409,'Lệnh hoặc danh mục đã thay đổi. Tải lại để đối chiếu.');
   if(j.state!=='ready'||progress.operations.some(o=>o.status!=='pending'||o.output>0)||progress.qc?.passed||progress.qc?.rejected)fail(409,'Lệnh đã thực hiện; cần đối chiếu vật tư đã cấp trước khi đổi mã');
   for(const r of sql.prepare("SELECT kind,document FROM ops_records WHERE kind IN ('hold','purchase','material-release','hold-transfer')").all()){
    const v=JSON.parse(r.document);if(!['rejected','cancelled','released'].includes(v.state)&&JSON.stringify(v).includes(id))fail(409,'Lệnh đã có giữ kho hoặc đề nghị vật tư. Xử lý chứng từ liên quan trước khi tách mã.');
   }
   const conflicts=I.conflicts(sql,p);if(!conflicts.length)return {ok:true,mappings:[]};
   const source=one("SELECT document FROM ops_records WHERE kind='production-source' AND id=?",id);
   let d;if(source)d=JSON.parse(source.document);else{const order=one('SELECT * FROM orders WHERE id=?',j.order_id),rev=one('SELECT document FROM revisions WHERE id=? AND version=?',order.quote_id,order.quote_version);if(!rev)fail(409,'Thiếu hồ sơ vật tư nguồn');d=JSON.parse(rev.document);d.quote.products=d.quote.products.filter(x=>x.id===j.product_id);d.quote.products[0].qty=j.quantity;}
   const catalog=JSON.parse(cat.document),nodes=C.flatten(d.quote.products),mappings=[],at=new Date().toISOString();
   for(const oldId of [...new Set(conflicts.map(c=>c.materialId))]){
    const rows=p.materials.filter(m=>m.material.id===oldId),ns=nodes.filter(n=>n.kind==='material'&&n.materialId===oldId),spec=ns[0]?.spec;
    if(!spec||ns.length!==rows.length||ns.some(n=>JSON.stringify(n.spec)!==JSON.stringify(spec))||rows.some(m=>I.different({...m.material,props:m.properties},spec)))fail(409,'Các dòng cùng mã có quy cách khác nhau. Cần đối chiếu riêng từng dòng.');
    const signature=JSON.stringify({name:spec.name,shape:spec.shape,substance:spec.substance,grade:spec.grade,brand:spec.brand,props:spec.props}),newId=oldId.slice(0,60)+'-SX-'+createHash('sha256').update(signature).digest('hex').slice(0,8).toUpperCase();
    const existing=catalog.materials.find(m=>m.id===newId);
    if(existing&&(existing.name!==spec.name||I.different(existing,spec)))fail(409,'Mã đối chiếu đã được dùng cho vật tư khác');
    const newSpec={...C.copy(spec),id:newId,active:true};if(!existing)catalog.materials.push(newSpec);
    for(const n of ns){n.materialId=newId;n.spec.id=newId;}
    d.materials=d.materials||[];if(!d.materials.some(m=>m.id===newId))d.materials.push(newSpec);
    const remap=x=>{if(!x||typeof x!=='object')return;if(x.materialId===oldId)x.materialId=newId;for(const v of Object.values(x))if(v&&typeof v==='object')remap(v);};
    for(const m of rows)m.material.id=newId;
    remap(p);remap(d.quote.nestingPlans);remap(d.quote.remnantSelections);
    mappings.push({oldId,newId,name:spec.name,rowIds:rows.map(m=>m.id)});
   }
   const document=JSON.stringify(catalog),version=cat.version+1;
   const sizes=one("SELECT document FROM ops_records WHERE kind='production-purchase-sizes' AND id=?",id);
   if(sizes){const values=JSON.parse(sizes.document);for(const m of mappings)if(values[m.oldId]){values[m.newId]=values[m.oldId];delete values[m.oldId];}sql.prepare("UPDATE ops_records SET document=?,version=version+1 WHERE kind='production-purchase-sizes' AND id=?").run(JSON.stringify(values),id);}
   sql.prepare('UPDATE catalog SET version=?,document=?,updated=?,actor=? WHERE id=1').run(version,document,at,user.id);
   sql.prepare('INSERT INTO catalog_revisions(version,document,updated,actor) VALUES(?,?,?,?)').run(version,document,at,user.id);
   sql.prepare("INSERT INTO ops_records VALUES('production-source',?,1,?) ON CONFLICT(kind,id) DO UPDATE SET version=version+1,document=excluded.document").run(id,JSON.stringify(d));
   p.materialIdentityHistory=[...(p.materialIdentityHistory||[]),{at,actor:user.name,mappings}];
   sql.prepare('UPDATE production_jobs SET packet=?,version=version+1,updated=?,actor=? WHERE id=?').run(JSON.stringify(p),at,user.id,id);
   const detail='Đối chiếu mã vật tư, giữ nguyên quy cách đã duyệt: '+mappings.map(m=>m.oldId+' → '+m.newId).join('; ');
   sql.prepare('INSERT INTO production_events(job_id,at,actor,detail) VALUES(?,?,?,?)').run(id,at,user.name,detail);audit(user,'production-material-identity',id,detail);
   return {ok:true,mappings};
  });
 }
 return {resolve};
};
