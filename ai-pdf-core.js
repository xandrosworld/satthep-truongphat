(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
function plan(db,job,rows){
 if(!job||job.status!=='ready'||!job.result?.items||!rows.length)throw Error('Chọn ít nhất một chi tiết đã kiểm tra');
 if(rows.length>80||db.quote.products.length+rows.length>500)throw Error('Quá nhiều chi tiết');
 const seen=new Set(),existing=new Set(C.flatten(db.quote.products).map(n=>n.aiSourceKey).filter(Boolean));
 return rows.map(r=>{const source=job.result.items[r.index],key=job.digest+':'+r.index;if(!source||seen.has(key)||existing.has(key))throw Error('Chi tiết đã được nhập hoặc chọn trùng');seen.add(key);
 const qty=Number(r.qty);if(!Number.isFinite(qty)||qty<=0||qty>5000)throw Error('Nhập số lượng cho '+source.name);
 if(!String(r.name||'').trim()||r.name.length>200)throw Error('Nhập tên chi tiết (tối đa 200 ký tự)');
 const notes=String(r.specification||'');if(notes.length>2000)throw Error('Thông số tối đa 2.000 ký tự');
 const p={id:C.uid(),kind:'product',name:r.name.trim(),manualName:true,qty,unit:String(r.unit||'cái').slice(0,30),model:'assembly',children:[],ops:[],transport:0,install:0,aiSourceKey:key,requestSpecification:[source.group,source.material,notes,...['L','W','T','D'].filter(k=>Number(r[k])>0).map(k=>k+' '+Number(r[k])+' mm')].filter(Boolean).join(' · ')+'\nNguồn: '+job.filename+' · trang '+source.page+' · '+source.evidence+((source.warnings||[]).length?'\nC?n ki?m tra: '+source.warnings.join(' ? '):'')};
 if(r.materialId){const m=db.materials.find(x=>x.id===r.materialId);if(!m)throw Error('Mã vật tư không còn trong danh mục');if(m.shape!=='piece'&&!['cái','bộ','chi tiết','tấm','thanh','ống','pcs'].includes(p.unit.toLowerCase()))throw Error('Số lượng vật tư phải là số chi tiết, không phải tổng mét hoặc kg');for(const [k,label]of [['T','chiều dày'],['D','đường kính']]){const v=Number(r[k]);if(v>0&&Number(m.props?.[k])>0&&Math.abs(v-Number(m.props[k]))>0.001)throw Error('Mã vật tư khác '+label+' đã kiểm tra của '+r.name);}if(m.shapeDefinition)throw Error('Mã vật tư dùng công thức riêng: nhập thành yêu cầu rồi khai thông số trong cấu thành');
 const dims={};if(m.shape!=='piece'){for(const k of m.shape==='sheet'?['L','W']:['L']){const v=Number(r[k]);if(!Number.isFinite(v)||v<=0||v>1000000)throw Error('Cần kích thước phôi '+k+' cho '+r.name);dims[k]=v;}}
 const rule=m.shape==='sheet'?'flat':'bar',ruleSpec=C.copy(db.rules.find(x=>x.id===rule));if(m.shape!=='piece'&&!ruleSpec)throw Error('Chưa có quy tắc khai triển '+rule);
 p.children.push({id:C.uid(),kind:'material',name:m.name,materialId:m.id,qty:1,spec:C.copy(m),dims,rule,ruleSpec,ops:[],notes:notes});
 }
 if(p.requestSpecification.length>4000)throw Error('Nội dung nguồn quá dài');return p;});
}
function arrange(db,job,rows,target='groups'){
 const planned=plan(db,job,rows);
 if(target==='rows')return {products:planned,target:null};
 const product=target==='groups'?null:db.quote.products.find(p=>p.id===target);
 if(target!=='groups'&&!product)throw Error('Sản phẩm đích không còn trong báo giá');
 const groups=new Map();
 planned.forEach((p,i)=>{p.kind='component';delete p.transport;delete p.install;
 const group=String(rows[i].group??job.result.items[rows[i].index].group??'').trim();
 if(!product&&!group)throw Error('Nhập tên cụm cho từng chi tiết được chọn');
 if(!groups.has(group))groups.set(group,[]);groups.get(group).push(p);
 });
 if(product)return {target:product.id,products:planned};
 const products=[...groups].map(([name,children])=>({id:C.uid(),kind:'product',name,manualName:true,qty:1,unit:'bộ',model:'assembly',children,ops:[]}));
 if(db.quote.products.length+products.length>500)throw Error('Quá nhiều sản phẩm');
 return {target:null,products};
}
function pendingErrors(db){return C.flatten(db.quote.products).filter(n=>n.aiSourceKey&&!C.flatten(n.children||[]).some(c=>c.kind==='material')).map(n=>n.name+': yêu cầu từ AI chưa được bóc tách vật tư');}
function installValidation(){if(C.calculate.aiPdfValidation)return;const original=C.calculate;C.calculate=function(db){const r=original(db),errors=pendingErrors(db);if(errors.length){r.errors=[...new Set([...r.errors,...errors])];for(const a of Object.values(r.alternatives||{})){a.ready=false;a.errors=[...new Set([...(a.errors||[]),...errors])];}}return r;};C.calculate.aiPdfValidation=true;}
const api={plan,arrange,pendingErrors,installValidation};if(typeof module!=='undefined')module.exports=api;else root.TPAiPdf=api;
})(typeof window!=='undefined'?window:globalThis);
