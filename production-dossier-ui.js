function productionDetailNotes(n){return [['Quy cách / yêu cầu',n.specification],['Ghi chú',n.notes],['Ghi chú chi tiết',n.lineNote]].filter(([,v])=>v).map(([label,v])=>'<div style="white-space:pre-wrap"><strong>'+pe(label)+':</strong> '+pe(v)+'</div>').join('');}
'use strict';
function installProductionDossier(){
 const before=productionDetail;
 productionDetail=()=>{before();const j=Production.job,generation=Team.sessionGeneration,host=document.createElement('section');host.id='production-dossier';document.querySelector('#production-preparation').prepend(host);host.textContent='Đang tải hồ sơ kỹ thuật…';
  teamApi('production/'+j.id+'/dossier').then(d=>{if(generation!==Team.sessionGeneration||Production.job?.id!==j.id||!host.isConnected)return;productionDossierRender(host,j,d);}).catch(e=>{if(host.isConnected)host.textContent=e.message;});};
}
function productionDossierRender(host,j,d){
 const e=pe,s=d.source,locked=!d.canEdit||j.progress.operations.some(o=>o.status!=='pending'),files=[...s.files,...d.files];
 host.innerHTML='<div class="production-review-flow"><strong>1. Rà soát kỹ thuật</strong><span>→</span><strong>2. Xác nhận hồ sơ</strong><span>→</span><strong>3. Phân tách triển khai</strong></div><h3>Rà soát kỹ thuật trước khi sản xuất</h3><p>Kiểm tra theo các mục khai báo báo giá. Xác nhận xong để chuyển sang chuẩn bị vật tư và triển khai sản xuất.</p><div data-review-input><p>'+e(s.customer)+' · '+e(s.project)+'</p><p>'+e([s.recipient,s.location].filter(Boolean).join(' · '))+' '+e(s.schedule||'')+'</p><p style="white-space:pre-wrap">'+e(s.requirements)+'\n'+e(s.specification)+(s.notes?'\nGhi chú đơn hàng: '+e(s.notes):'')+'</p>'+((s.items||[]).length?opsTable(['Hạng mục đầu vào','Quy cách','Số lượng'],s.items.map(x=>[e(x.name),e([x.specification,x.notes,x.note].filter(Boolean).join(' · ')),e(x.qty)+' '+e(x.unit)])):'')+'<h4>1. Bản vẽ & tài liệu kỹ thuật</h4>'+files.map(f=>'<p>'+e(f.name)+(f.revision?' · '+e(f.revision):'')+' '+e(f.note||'')+' '+(f.storage==='server'?'<button type="button" data-dossier-file="'+e(f.id)+'">Tải bản vẽ</button>':'<strong>Chưa có tệp trên máy chủ — cần bổ sung</strong>')+(files.some(x=>x.supersedes===f.id)?' · Đã có bản thay thế':'')+'</p>').join('')+(files.length?'':'<p>Chưa có bản vẽ. Bổ sung bản vẽ hoặc nêu căn cứ sản xuất ở dưới.</p>')+(s.links||[]).map(l=>'<p><a target="_blank" rel="noopener noreferrer" href="'+e(l.url)+'">'+e(l.name||l.title||l.url)+'</a></p>').join('')+
 '<details class="dossier-add"><summary>Bổ sung / thay thế bản vẽ</summary><form id="dossier-upload"><fieldset '+(locked?'disabled':'')+'><legend>Bổ sung bản vẽ sản xuất</legend><input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.dwg,.dxf,.step,.stp" required aria-label="Bản vẽ sản xuất">'+field('Phiên bản bản vẽ','revision','','text','maxlength="100"')+select('Thay thế bản vẽ','supersedes',[['','Bản vẽ mới'],...files.map(f=>[f.id,f.name+' '+(f.revision||'')])],'')+field('Ghi chú','note','','text','maxlength="2000"')+'<p>Tối đa 10 MB/tệp. Bản cũ được giữ lại để đối chiếu.</p><button type="submit">Lưu bản vẽ</button></fieldset></form></details>'+
 '</div><form id="dossier-prepare"><fieldset '+(locked?'disabled':'')+'><legend>Kỹ sư rà soát chuẩn bị</legend>'+b1Area('Yêu cầu sản xuất bổ sung','requirements',d.requirements||'',20000)+b1Area('Căn cứ sản xuất nếu không cần bản vẽ','noDrawingReason',d.noDrawingReason||'',2000)+productionReviewSections(j,d)+'<label><input type="checkbox" name="reviewed" '+(d.reviewed?'checked':'')+'> Đã rà soát bản vẽ, chi tiết sản phẩm, công đoạn, thiết bị và phương pháp sản xuất</label><button type="submit">Lưu rà soát / xác nhận hồ sơ</button></fieldset></form><p>'+(d.reviewed?'Đã rà soát: '+e(d.reviewed.actor)+' · '+e(d.reviewed.at):'Chưa xác nhận hồ sơ chuẩn bị')+'</p><button type="button" id="dossier-deploy">Mở phân tách triển khai →</button><details><summary>Lịch sử hồ sơ</summary>'+d.history.map(h=>'<p>'+e(h.at)+' · '+e(h.actor)+' · '+e(h.detail)+'</p>').join('')+'</details><p role="alert" id="dossier-error"></p>';
 const first=host.querySelector('.production-review-sections>details'),input=host.querySelector('[data-review-input]');
 first.querySelector(':scope>summary').after(input);
 const inputSection=document.createElement('div');inputSection.className='production-review-sections production-review-input';inputSection.append(first);host.querySelector('#dossier-prepare').before(inputSection);
 first.querySelector('[name=check-input]').setAttribute('form','dossier-prepare');first.querySelector('[name=check-input]').disabled=locked;
 const main=document.querySelector('#production-main');
 document.querySelector('[data-production-tab=preparation]').textContent='Rà soát kỹ thuật';
 for(const key of ['materials','cutting'])document.querySelector('[data-production-tab='+key+']')?.remove();
 for(const key of ['operations','qc']){const button=document.querySelector('[data-production-tab='+key+']');if(button)button.disabled=!d.reviewed&&j.state==='ready';}
 const deploy=document.createElement('section');deploy.id='production-deployment';deploy.className='production-panel';deploy.hidden=true;main.append(deploy);
 const tab=document.createElement('button');tab.type='button';tab.dataset.productionTab='deployment';tab.textContent='Phân tách triển khai';document.querySelector('.production-tabs').append(tab);
 host.querySelector('#dossier-deploy').onclick=()=>productionTab('deployment');
 productionDeploymentRender(deploy,j,d);
 const prepare=document.querySelector('#production-prepare');
 // Scheduling and stock readiness belong to deployment, after technical confirmation.
 if(prepare){const section=document.createElement('section');section.className='deployment-schedule';section.innerHTML='<h4>Chuẩn bị triển khai tại xưởng</h4>';section.append(prepare);deploy.append(section);if(!d.reviewed&&j.state==='ready')prepare.querySelector('fieldset').disabled=true;}
 const title=document.querySelector('#production-preparation>h3');if(title)title.hidden=true;
 const run=async(form,fn)=>{const button=form.querySelector('button[type=submit]');form.dataset.saving='true';button.disabled=true;try{await fn();await productionLoad(j.id);productionTab('preparation');}catch(err){host.querySelector('#dossier-error').textContent=err.message;button.disabled=false;}finally{delete form.dataset.saving;}};
 host.querySelectorAll('[data-dossier-file]').forEach(b=>b.onclick=async()=>{try{const f=await teamApi('production/'+j.id+'/files/'+b.dataset.dossierFile);download(f.name,Uint8Array.from(atob(f.data),c=>c.charCodeAt(0)),'application/octet-stream');}catch(err){host.querySelector('#dossier-error').textContent=err.message;}});
 host.querySelector('#dossier-upload').onsubmit=ev=>{ev.preventDefault();ev.stopPropagation();const form=ev.currentTarget;if(form.dataset.saving)return;run(form,async()=>{const f=new FormData(form),file=f.get('file');if(!file.size||file.size>10*1024*1024)throw Error('Chọn tệp từ 1 byte đến 10 MB');const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));await teamApi('production/'+j.id+'/files','POST',{expectedVersion:d.jobVersion,name:file.name,size:file.size,data:btoa(binary),revision:f.get('revision'),note:f.get('note'),supersedes:f.get('supersedes')||null});});};
 host.querySelector('#dossier-prepare').onsubmit=ev=>{ev.preventDefault();ev.stopPropagation();const form=ev.currentTarget;if(form.dataset.saving)return;run(form,async()=>{const f=new FormData(form);await teamApi('production/'+j.id+'/dossier','POST',{expectedVersion:d.jobVersion,requirements:f.get('requirements'),noDrawingReason:f.get('noDrawingReason'),reviewed:f.has('reviewed'),reviewChecks:Object.fromEntries(['input','structure','operations','quantities'].map(k=>[k,f.has('check-'+k)])),equipment:j.packet.operations.map((o,i)=>({operationId:o.id,machineId:f.get('machineId'+i),machine:f.get('machine'+i),method:f.get('method'+i)}))});});};
}

// Technical-only presentation: all quantities come from the frozen job packet.
function productionPreparationRows(j,source){
 const materials=new Map(j.packet.materials.map(m=>[m.id,m])),seen=new Set(),rows=[];
 const walk=(nodes,level=0,parent=1)=>{for(const n of nodes||[]){const material=materials.get(n.id),quantity=material?.count??parent*Number(n.qty||0);rows.push({node:n,level,quantity,material});seen.add(n.id);walk(n.children,level+1,quantity);}};
 walk(source.tree);
 for(const m of j.packet.materials)if(!seen.has(m.id)){seen.add(m.id);rows.push({node:{id:m.id,name:m.name,kind:'material'},level:1,quantity:m.count,material:m});}
 // A newly approved operation may target a node not present in an older dossier tree.
 for(const o of j.packet.operations)if(!seen.has(o.nodeId)){seen.add(o.nodeId);rows.push({node:{id:o.nodeId,name:o.object||o.name,kind:'operation'},level:1,quantity:o.quantity});}
 return rows;
}
function productionPreparationTable(j,d){
 const e=pe,units={L:'Dài',W:'Rộng',H:'Cao',T:'Dày',D:'Ø',F:'Mép',B:'B'};
 const dims=v=>Object.entries(v||{}).filter(([,n])=>Number.isFinite(n)&&n>0).map(([k,v])=>(units[k]||k)+' '+v).join(' · ');
 const operation=(o,i)=>{const v=d.equipment.find(x=>x.operationId===o.id)||j.progress.operations.find(x=>x.id===o.id)||{};return '<details class="dossier-operation"><summary><strong>'+e(o.name)+'</strong><p>'+e(o.mode==='outside'?'Thuê ngoài':'Tại xưởng')+' · '+e(o.workQuantity)+' '+e(o.unit)+' · Định mức kỹ thuật: '+e(o.norm)+'</p><p>'+e(v.machine||o.machine||'Chưa chọn thiết bị')+' · '+e(v.method||v.preparationMethod||o.instructions||'Chưa khai phương pháp')+'</p><span class="muted">Xem / chọn thiết bị và phương pháp</span></summary>'+select('Thiết bị','machineId'+i,[['','Thiết bị khác / thủ công'],...d.machines.map(m=>[m.id,m.name])],v.machineId||'')+field('Tên thiết bị khác / Thủ công','machine'+i,v.machine||o.machine||'','text','maxlength="200"')+b1Area('Phương pháp sản xuất','method'+i,v.method||v.preparationMethod||o.instructions||'',2000)+'</details>';};
 const rows=productionPreparationRows(j,d.source).map(r=>{const n=r.node,m=r.material,ops=j.packet.operations.flatMap((o,i)=>o.nodeId===n.id?[operation(o,i)]:[]);return ['<div class="dossier-detail-name" style="padding-left:'+Math.min(r.level,4)*12+'px"><strong>'+e(n.name)+'</strong><p>'+e(m?.material.id||n.materialId||({product:'Sản phẩm',component:'Cấu kiện'})[n.kind]||'Chi tiết')+'</p>'+e(m?dims(m.properties):dims({...n.dims,...n.params}))+productionDetailNotes(n)+'</div>',e(r.quantity)+' '+e(n.unit||(n.kind==='product'?j.packet.product.unit:'chi tiết')),ops.join('')||'Không có nguyên công trực tiếp'];});
 return '<h4>Chi tiết công đoạn và thiết bị theo cấu thành</h4><p>Số lượng đã nhân theo lô này. Công đoạn được đặt cùng dòng chi tiết thực hiện. Thay đổi công nghệ hoặc định mức qua đề nghị điều chỉnh để được xác nhận.</p><div class="dossier-detail-table">'+opsTable(['Sản phẩm / cấu kiện / vật tư · Kích thước (mm)','Số lượng lô','Công đoạn · Thiết bị · Phương pháp'],rows)+'</div>';
}
function productionMaterialGroups(materials){
 const groups=new Map();
 for(const m of materials){const spec=m.material||{},geometry=m.dimensions||{},properties=Object.entries(m.properties||{}).sort(([a],[b])=>a.localeCompare(b));
 const key=JSON.stringify([spec.id,spec.shape,spec.substance,spec.grade,spec.brand,properties,geometry.length||0,geometry.width||0,!!m.externallySupplied]);
 if(!groups.has(key))groups.set(key,{material:m,count:0,rows:[]});const g=groups.get(key);g.count+=m.count;g.rows.push(m.name);}
 return [...groups.values()];
}
function productionPreparationStock(host,j,stock){
 const e=pe,groups=productionMaterialGroups(j.packet.materials);
 host.innerHTML=opsTable(['Mã / quy cách vật tư','Khổ khai triển (mm)','Tổng chi tiết','Nguồn cấp'],groups.map(g=>{const m=g.material;return [e(m.material.id)+' · '+e(m.material.name||m.name)+'<p>'+e([m.material.substance,m.material.grade,...Object.entries(m.properties||{}).map(([k,v])=>k+' '+v)].filter(Boolean).join(' · '))+'</p>',e([m.dimensions.length,m.dimensions.width].filter(v=>v>0).join(' × ')||'Theo quy cách'),e(g.count),m.externallySupplied?'Nhà gia công cấp':'Đối chiếu kho bên dưới'];}))+
 '<h4>Chọn phôi tồn kho và xử lý phần thiếu</h4><p>Tồn khả dụng đã trừ phần được giữ cho các lệnh khác. Khổ phôi phải đáp ứng phương án cắt của lô; giữ kho trước khi bắt đầu sản xuất.</p>'+
 opsTable(['Vật tư / khổ cần dùng','Nhu cầu','Đã giữ / cấp','Phôi tồn phù hợp','Chưa được giữ','Thiếu so với kho'],stock.requirements.map(r=>[
 e(r.materialId)+' · '+e(r.name)+'<p>'+( [r.length,r.width,r.thickness].some(v=>v>0)?e([r.length,r.width,r.thickness].filter(v=>v>0).join(' × '))+' mm':'Không theo khổ')+'</p>',
 e(r.quantity)+' '+e(r.unit),e(r.assigned)+' '+e(r.unit),
 (r.lots||[]).map(l=>'<div><strong>'+e(l.id)+'</strong> · '+e(l.warehouse)+'<br>'+e([l.length,l.width,l.thickness].filter(v=>v>0).join(' × '))+' mm · '+e(l.available)+' '+e(r.unit)+'</div>').join('')||'Không có phôi khả dụng phù hợp',
 e(r.unassigned)+' '+e(r.unit),'<strong>'+e(r.missing)+' '+e(r.unit)+'</strong>'
 ]))+'<button type="button" data-dossier-inventory>Chọn phôi / giữ kho / đề xuất mua cho lệnh</button><p>Có thể chia nhiều đợt mua hoặc gom nhiều lệnh tại Kho / mua hàng. Hệ thống đối chiếu phần đã đặt để tránh đặt trùng.</p>';
 host.querySelector('[data-dossier-inventory]').onclick=()=>{document.querySelector('#production-console').close();opsOpen('jobs',j.id).catch(inError);};
}

function productionReviewSections(j,d){
 const e=pe,rows=productionPreparationRows(j,d.source),check=(key,label)=>'<label class="production-check"><input type="checkbox" name="check-'+key+'" '+(d.reviewed&&d.reviewChecks?.[key]?'checked':'')+'> '+label+'</label>';
 const structure=opsTable(['Sản phẩm / cấu kiện / vật tư','Số lượng lô','Kích thước khai báo (mm)','Quy cách / yêu cầu'],rows.map(r=>{const n=r.node,m=r.material;return ['<span style="padding-left:'+Math.min(r.level,4)*12+'px">'+e(n.name)+'<br>'+e(m?.material.id||n.materialId||'')+'</span>',e(r.quantity)+' '+e(n.unit||(n.kind==='product'?j.packet.product.unit:'chi tiết')),e(Object.entries({...n.dims,...n.params,...m?.properties}).map(([k,v])=>k+' '+v).join(' · ')),productionDetailNotes(n)||e(m?.material.name||'')];}));
 return '<div class="production-review-sections"><details open><summary>1. Đầu vào, yêu cầu và bản vẽ</summary><p>Đối chiếu thông tin đầu vào và bản vẽ ở trên với đơn hàng đã duyệt.</p>'+check('input','Đã kiểm tra đầu vào và bản vẽ')+'</details>'+
 '<details open><summary>2. Cấu thành sản phẩm</summary>'+structure+check('structure','Đã kiểm tra cấu kiện, vật tư, kích thước và số lượng')+'</details>'+
 '<details><summary>3. Công đoạn và định mức</summary>'+productionPreparationTable(j,d)+check('operations','Đã kiểm tra công đoạn, định mức, thiết bị và phương pháp')+'</details>'+
 '<details><summary>4. Khối lượng và số lượng</summary>'+opsTable(['Vật tư','Số lượng','Khối lượng chi tiết (kg)','Diện tích chi tiết (m²)'],j.packet.materials.map(m=>[e(m.name),e(m.count),e(m.dimensions.weight??'—'),e(m.dimensions.area??'—')]))+check('quantities','Đã kiểm tra khối lượng và số lượng cho lô')+'</details></div>';
}
function productionDeploymentRender(host,j,d){
 const e=pe;
 if(!d.reviewed&&j.state==='ready'){host.innerHTML='<h3>Chưa xác nhận hồ sơ kỹ thuật</h3><p>Rà soát đủ các phần theo cấu trúc khai báo và xác nhận trước khi phân tách triển khai vật tư, thiết bị và sản xuất.</p><button type="button" data-production-tab="preparation">← Về rà soát kỹ thuật</button>';return;}
 host.innerHTML='<h3>Phân tách triển khai sản xuất</h3><p>'+e(d.reviewed?'Hồ sơ đã xác nhận bởi '+d.reviewed.actor:'Lệnh đang thực hiện')+'</p>'+
 '<div class="deployment-product"><strong>'+e(j.packet.product.name)+'</strong><p>'+e(j.packet.product.specification||'')+'</p><p>Đơn hàng '+e(j.packet.orderCode)+' · '+e(j.quantity)+' '+e(j.packet.product.unit)+'</p></div>'+
 '<section class="deployment-cutting"><h4>Khai triển và hao hụt</h4><p>Đối chiếu phương án cắt và phần dư của lô này trước khi chọn phôi. Thay đổi kỹ thuật cần được xác nhận trước khi áp dụng.</p>'+j.packet.cutting.map(productionCut).join('')+(j.packet.cutting.length?'':'<p>Lô này không có phương án cắt theo khổ.</p>')+'</section>'+
 '<h4>Vật tư · Lựa chọn phôi theo khổ</h4><div id="dossier-stock" aria-live="polite">Đang đối chiếu tồn kho…</div>'+
 '<h4>Công đoạn và thiết bị sử dụng</h4>'+opsTable(['Đối tượng','Công đoạn','Thiết bị','Định mức kỹ thuật','Lượng công việc','Phương pháp'],j.packet.operations.map(o=>{const v=d.equipment.find(x=>x.operationId===o.id)||j.progress.operations.find(x=>x.id===o.id)||{};return [e(o.object),e(o.name),e(v.machine||o.machine||'Chưa khai'),e(o.norm),e(o.workQuantity)+' '+e(o.unit),e(v.method||v.preparationMethod||o.instructions||'')];}))+
 '<h4>Tiến trình thực hiện các công đoạn</h4>'+(!j.packet.flowApproved?'<p class="notice">Thứ tự dự kiến từ khai báo kỹ thuật. Cần xác nhận kỹ thuật và duyệt tiến trình công nghệ trước khi bắt đầu. <button type="button" data-flow-open>Rà soát tiến trình công nghệ</button></p>':'')+'<div class="deployment-stages">'+j.packet.operations.map((o,i)=>{const v=j.progress.operations.find(x=>x.id===o.id)||{};return '<article><strong>'+(i+1)+'. '+e(o.name)+'</strong><p>'+e(productionStatus[v.status]||'Chưa bắt đầu')+'</p><p>'+e(Production.people.find(x=>x.id===v.assignee)?.name||'Chưa phân công')+'</p><p>'+e(v.output||0)+' / '+e(o.quantity)+' '+e(o.outputUnit||'chi tiết')+'</p><button type="button" data-production-tab="operations">Mở công đoạn</button></article>';}).join('')+'</div>';
 const stockHost=host.querySelector('#dossier-stock'),generation=Team.sessionGeneration;
 const load=()=>{stockHost.textContent='Đang đối chiếu tồn kho…';teamApi('ops/job/'+j.id).then(stock=>{if(generation===Team.sessionGeneration&&Production.job?.id===j.id&&stockHost.isConnected)productionPreparationStock(stockHost,j,stock);}).catch(err=>{if(!stockHost.isConnected)return;stockHost.textContent=err.message;const retry=document.createElement('button');retry.type='button';retry.textContent='Thử lại';retry.onclick=load;stockHost.append(retry);});};load();
}
