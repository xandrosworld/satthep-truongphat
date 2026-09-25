'use strict';
function qocJobs(rate){return C.flatten(db.quote.products).flatMap(n=>(n.ops||[]).flatMap((op,index)=>op.id===rate.id?[{node:n,op,index,calc:result.nodes[n.id]?.ownOps[index]}]:[]));}
function qocCurrent(rate,jobs){
  const choice=op=>TPWork.optionFor(op,db.quote)?'option:'+TPWork.optionFor(op,db.quote):TPWork.methodFor(op,db.quote);
  const values=[...new Set(jobs.map(j=>choice(j.op)))];return values.length>1?'mixed':values[0]||choice({id:rate.id});
}
function qocAvailableOptions(rate){
  const options=(rate.priceOptions||[]).filter(o=>o.enabled!==false).map(o=>({...o})),ids=new Set(options.map(o=>o.id));
  for(const option of db.rates.find(r=>r.id===rate.id)?.priceOptions||[])if(option.enabled!==false&&!ids.has(option.id)){options.push(option);ids.add(option.id);}
  return options;
}
function qocChoices(rate,current){
  const available=qocAvailableOptions(rate),choices=[['catalog','Theo đơn giá cơ sở'],['factors','Giá cơ sở × hệ số'],...available.map(o=>['option:'+o.id,o.name])];
  if(!choices.some(c=>c[0]===current))choices.unshift([current,current==='mixed'?'Đang có nhiều cách — chọn lại':current==='direct'?'Đang dùng đơn giá riêng từng công việc':current==='fixed'?'Đang dùng giá gói riêng từng công việc':'Cách đã chọn không còn khả dụng — chọn lại']);
  return choices.map(([value,label])=>`<option value="${esc(value)}" ${value===current?'selected':''} ${['mixed','direct','fixed'].includes(value)||value.startsWith('option:')&&!available.some(o=>'option:'+o.id===value)?'disabled':''}>${esc(label)}</option>`).join('');
}
function qocApplyChoice(id,value){
  if(value.startsWith('option:')){
    const rate=db.quote.ratesSnapshot.find(r=>r.id===id),optionId=value.slice(7);
    if(!rate.priceOptions?.some(o=>o.id===optionId&&o.enabled!==false)){
      const master=db.rates.find(r=>r.id===id),option=master?.priceOptions?.find(o=>o.id===optionId&&o.enabled!==false);
      if(!option)throw Error('Cách tính không còn trong danh mục. Chọn lại cách giá.');
      TPWork.validatePriceOptions({priceOptions:[option]});
      rate.priceOptions=(rate.priceOptions||[]).filter(o=>o.id!==optionId).concat({...C.copy(option),outsideFactors:option.outsideFactors??master.outsideFactors??false});
      if(option.method==='factors')rate.factors=C.copy(master.factors||[]);
    }
    TPWork.setPriceOption(db.quote,id,optionId);
  }else TPWork.setMethod(db.quote,id,value);
}
function qocPrices(rate,current,jobs){
  const active=jobs.filter(j=>!j.calc?.skipped),good=active.filter(j=>j.calc&&!j.calc.error);
  if(active.some(j=>!j.calc||j.calc.error))return '<span class="form-error">Có công việc thiếu dữ liệu. Mở chi tiết để kiểm tra.</span>';
  if(good.length){return ['inside','outside'].map(mode=>{const list=good.filter(j=>j.op.mode===mode),units=[...new Set(list.map(j=>j.calc.unit))];return units.map(unit=>{const prices=list.filter(j=>j.calc.unit===unit).map(j=>j.calc.rate),min=Math.min(...prices),max=Math.max(...prices);return `<small class="subtext">${mode==='inside'?'Tại xưởng':'Thuê ngoài'}: <strong>${num(min,6)}${max!==min?' – '+num(max,6):''} đ/${esc(unit)}</strong></small>`;}).join('');}).join('');}
  const selected=current.startsWith('option:')?rate.priceOptions?.find(o=>'option:'+o.id===current&&o.enabled!==false):null;
  if(!['catalog','factors'].includes(current)&&!selected)return '<span class="muted">Chọn lại cách giá để tính.</span>';
  const source=selected||rate,method=selected?.method||current;
  return ['inside','outside'].map(mode=>`<small class="subtext">${mode==='inside'?'Tại xưởng':'Thuê ngoài'}: ${money(source[mode])} đ/${esc(method==='fixed'?'gói':source[mode+'Unit']||rate.unit)}</small>`).join('')+`<small class="subtext">${method==='factors'?'Giá cơ sở; sẽ tra hệ số khi có công việc.':'Chưa có công việc tính phí.'}</small>`;
}
function qocJobCell(j){
 const c=j.calc;return `<div class="qoc-job" data-job-price="${esc(j.node.id)}"><small class="subtext">${j.op.mode==='outside'?'Thuê ngoài':'Tại xưởng'}</small>${!c||c.error?`<span class="form-error">${esc(c?.error||'Chưa tính được')}</span>`:c.skipped?`<span class="muted">${esc(c.reason)}</span>`:`<strong class="qoc-unit-price">${num(c.rate,6)} đ/${esc(c.unit)}</strong><small class="subtext">${num(c.basis,6)} ${esc(c.unit)} × ${num(c.rate,6)} ≈ ${money(c.cost)} đ</small>`}${c&&!c.error&&!c.skipped&&c.unit==='lần'?`<small class="subtext">${j.op.basisMode==='manual_total'?'Tổng số lần đã khai':num(j.op.basisMode==='manual_unit'?j.op.workQuantity:(j.op.amount??1))+' lần / đơn vị × '+num(result.nodes[j.node.id].count)+' đơn vị'}</small>`:''}${paButton(c?.unit==='lần'?'Sửa số lần / đơn vị':'Sửa lượng công việc','op-detail',`data-id="${esc(j.node.id)}" data-index="${j.index}"`,'small')}<details><summary>Chi tiết tính giá</summary>${c&&!c.error&&!c.skipped?`<small class="subtext">Giá cơ sở: ${num(c.base,6)} đ/${esc(c.unit)}</small>${(c.factors||[]).map(f=>`<small class="subtext">${esc(f.id||f.param)} · ${esc(f.name)}: ${esc(f.input)} → ${num(f.value,4)}% (${f.source==='override'?'nhập riêng':f.source==='declared'?'đã khai':'liên kết dữ liệu'})</small>`).join('')}`:''}<small class="subtext">${esc(reviewComplexityText(j.op,c||{}))}</small>${paButton('Lượng / độ phức tạp','op-detail',`data-id="${esc(j.node.id)}" data-index="${j.index}"`,'small')}${TPWork.recipes(db.quote.ratesSnapshot.find(r=>r.id===j.op.id)||{}).length?`<button type="button" class="button small" data-qoc-recipes="${esc(j.node.id)}" data-index="${j.index}">Vật tư định mức</button>`:''}</details></div>`;
}
function qocTable(rates){
 const used=new Set(C.flatten(db.quote.products).flatMap(n=>(n.ops||[]).map(o=>o.id))),master=operationMasterRates();rates=rates.filter(r=>used.has(r.id)||(r.operationType!=='package'&&(!master||master.some(x=>x.id===r.id&&x.enabled!==false))&&(!Array.isArray(db.quote.operationColumns)||db.quote.operationColumns.includes(r.id))));
 const columns=rates.map(rate=>{const jobs=qocJobs(rate),byNode=new Map();for(const j of jobs){if(!byNode.has(j.node.id))byNode.set(j.node.id,[]);byNode.get(j.node.id).push(j);}return {rate,jobs,byNode,current:qocCurrent(rate,jobs)};});
 const rows=[];function visit(nodes,depth=0){for(const node of nodes){rows.push({node,depth});visit(node.children||[],depth+1);}}visit(db.quote.products);
 return `<div data-qoc-table class="table-scroll qoc-scroll" tabindex="0" role="region" aria-label="Giá nguyên công theo từng sản phẩm, cấu kiện, vật tư"><table class="qoc-table"><thead><tr><th scope="col">Tên, mã SP / CK / vật tư</th>${columns.map(({rate,jobs,current})=>`<th scope="col" data-qoc-rate="${esc(rate.id)}"><strong>${esc(operationDisplayName(rate))}</strong>${pgBadge(rate)}<label class="qoc-method"><span>Cách tính</span><select data-qoc-choice="${esc(rate.id)}" aria-label="Cách giá ${esc(operationDisplayName(rate))}">${qocChoices(rate,current)}</select></label><details><summary>Bảng giá · ${jobs.length} công việc</summary>${inButton('Lấy bảng mới từ danh mục','rate-reference',`data-id="${esc(rate.id)}"`,'small')}</details></th>`).join('')}</tr></thead><tbody>${rows.map(({node:n,depth})=>`<tr data-qoc-node="${esc(n.id)}" class="qoc-${esc(n.kind)}"><th scope="row"><div style="padding-left:${Math.min(depth,5)*12}px"><span class="pa-node-kind">${n.kind==='product'?'SP':n.kind==='component'?'CK':'VT'}</span><strong>${esc(n.name)}</strong>${n.materialId||n.code?`<small class="subtext">${esc(n.materialId||n.code)}</small>`:''}<small class="subtext">${esc(TPWork.nodeGroup(db.quote.products,n.id)||'Chưa phân nhóm')}</small><small class="subtext">SL toàn báo giá: ${num(result.nodes[n.id]?.count,6)}</small></div></th>${columns.map(({rate,byNode})=>`<td data-qoc-operation="${esc(rate.id)}">${(byNode.get(n.id)||[]).map(qocJobCell).join('')||'<span class="qoc-empty" aria-label="Không có công việc tại dòng này">—</span>'}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${rates.length+1}">Chưa có sản phẩm. Thêm cấu thành và gán nguyên công để tính giá.</td></tr>`}</tbody><tfoot><tr><th scope="row">Tổng tiền công<small class="subtext">Cộng các công việc thực hiện</small></th>${columns.map(({rate,jobs})=>{const active=jobs.filter(j=>!j.calc?.skipped),invalid=active.some(j=>!j.calc||j.calc.error);return `<td data-qoc-total="${esc(rate.id)}">${invalid?'<span class="form-error">Chưa tính đủ</span>':money(active.reduce((sum,j)=>sum+(j.calc?.cost||0),0))+' đ'}</td>`;}).join('')}</tr></tfoot></table></div>`;
}
function qocRender(){return `<section class="panel intake-panel"><h3>Giá nguyên công theo sản phẩm, cấu kiện và vật tư</h3><p>Chọn phương pháp tính ở đầu mỗi cột nguyên công. Mỗi ô tính giá riêng theo kích thước, chiều dày, số lượng và các yếu tố của dòng thực hiện.</p>${qocTable(db.quote.ratesSnapshot)}<p class="help-text">Dấu —: không có công việc tại dòng này. Dòng cha chỉ hiện công việc được gán trực tiếp; công việc cấp con tính ở dòng con. Mở chi tiết từng ô để kiểm tra yếu tố và lượng thực hiện. Giá đã lưu giữ nguyên đến khi chủ động lấy bảng mới từ danh mục.</p><p class="help-text">Đơn giá hiển thị tối đa 6 số lẻ; tiền hiển thị làm tròn đồng (≈), tính toán dùng giá trị đầy đủ. Tiền công chưa gồm vật tư hoàn thiện.</p><p id="qoc-status" role="status" hidden></p></section>`;}
function qocTechnicalEdit(id,draft){
 const old=db.rates.find(r=>r.id===id),r=old||draft||{id:C.uid(),name:'',unit:'kg',insideUnit:'kg',outsideUnit:'kg',inside:0,outside:0,factors:[],operationType:'detail'};
 if(r.operationType==='package')return toast('Khai gói giá tại Đơn giá đầu vào → Nguyên công & hệ số');
 openDialog(old?'Công đoạn: '+esc(r.name):'Thêm công đoạn',`<p>Khai công việc và máy/thiết bị thực hiện. Đơn giá, cách tính và hệ số được quản lý tại Đơn giá đầu vào.</p>${field('Tên công đoạn','name',r.name,'text','required maxlength="200"')}${field('Máy sử dụng','machine',r.machine||'','text','maxlength="200" placeholder="Tên máy/thiết bị thực hiện"')}${b1Area('Thông tin kỹ thuật / ghi chú','technicalNotes',r.technicalNotes||'')}`,'Lưu công đoạn',f=>{
  const name=String(f.get('name')||'').trim(),machine=String(f.get('machine')||'').trim(),technicalNotes=String(f.get('technicalNotes')||'').trim();
  if(!name||name.length>200||machine.length>200||technicalNotes.length>2000)throw Error('Nhập tên công đoạn; tên và máy tối đa 200 ký tự, ghi chú tối đa 2.000 ký tự');
  dfCatalogWrite(()=>{if(old)Object.assign(old,{name,machine,technicalNotes});else db.rates.push({...r,name,machine,technicalNotes});});closeDialog();toast('Đã lưu thông tin công đoạn');
 });
}
function qocOperationCatalog(){return `<div class="rc-toolbar"><p>Khai công đoạn kỹ thuật và máy sử dụng. Đơn giá, gói công và hệ số khai tại Đơn giá đầu vào.</p>${btn('+ Công đoạn','new-rate')}</div><section class="panel table-scroll"><table><thead><tr><th>Tên công đoạn</th><th>Máy sử dụng</th><th>Thông tin kỹ thuật</th><th>Định mức vật tư</th><th></th></tr></thead><tbody>${db.rates.filter(r=>r.operationType!=='package'&&pgVisible(r)&&rcMatch(r.id+' '+r.name+' '+(r.machine||''))).map(r=>`<tr><td>${esc(r.name)}${pgBadge(r)}</td><td>${esc(r.machine||'Chưa khai')}</td><td>${esc(r.technicalNotes||'—')}</td><td>${TPWork.declaredRecipes(r).map(x=>esc((x.spec?.name||'Chưa chọn vật tư')+' · '+num(x.norm)+' '+(x.spec?.unit||'')+'/'+x.basis+' × '+(x.layers??1)+' lớp')).join('<br>')||'Chưa khai'}<br><button type="button" class="button small" data-recipe-editor="${esc(r.id)}" data-catalog="true">Khai định mức vật tư</button></td><td><button type="button" class="button small" data-technical-rate="${esc(r.id)}">Sửa công đoạn</button></td></tr>`).join('')}</tbody></table></section>`;}
function qocSelectOperation(){
 inWritable();const rates=(operationMasterRates()||[]).filter(r=>r.enabled!==false&&r.operationType!=='package');if(!rates.length)return toast('Khai công đoạn tại Danh mục quy ước trước');
 openDialog('Chọn công đoạn đã khai',`${select('Công đoạn từ Danh mục quy ước','operationId',rates.map(r=>[r.id,pgLabel(r)+' · '+r.id+' · '+r.name]),rates[0].id)}<div id="qoc-operation-options"></div><p>Chọn cách giá cho nguyên công này, sau đó tích vào các dòng thực hiện. Giá và định mức đã lưu trong báo giá giữ nguyên đến khi chủ động lấy bảng mới.</p>`,'Áp dụng công đoạn',f=>{
   inWritable();const master=rates.find(r=>r.id===f.get('operationId'));if(!master)throw Error('Chọn công đoạn');const choice=String(f.get('operationChoice'));
   const snapshot=db.quote.ratesSnapshot.find(r=>r.id===master.id)||master;TPWork.validatePriceOptions({...snapshot,priceOptions:qocAvailableOptions(snapshot)});const allowed=['catalog','factors',...qocAvailableOptions(snapshot).map(x=>'option:'+x.id)];if(!allowed.includes(choice))throw Error('Chọn cách giá đã khai');
   saveAndClose(()=>{if(!db.quote.ratesSnapshot.some(r=>r.id===master.id))db.quote.ratesSnapshot.push(C.copy(master));qocApplyChoice(master.id,choice);},'Đã chọn công đoạn và cách giá');
 });
 const draw=()=>{const master=rates.find(r=>r.id===$('[name=operationId]').value),r=db.quote.ratesSnapshot.find(r=>r.id===master.id)||master;$('#qoc-operation-options').innerHTML=`<label class="field"><span>Cách tính thuộc cơ sở tính giá</span><select name="operationChoice">${qocChoices(r,'catalog')}</select></label><div id="qoc-operation-preview"></div>`;const preview=()=>{$('#qoc-operation-preview').innerHTML=qocPrices({...r,priceOptions:qocAvailableOptions(r)},$('[name=operationChoice]').value,[]);};$('[name=operationChoice]').onchange=preview;preview();};$('[name=operationId]').onchange=draw;draw();
}
function qocRecipeDetails(id,index){const n=C.findNode(db.quote.products,id),op=n?.ops?.[index],rate=db.quote.ratesSnapshot.find(r=>r.id===op?.id);if(!rate)return;const calc=result.nodes[id]?.ownOps[index],rows=[...(result.generated||[]),...(result.includedGenerated||[])].filter(g=>g.ownerId===id&&g.opIndex===index);
 openDialog('Vật tư định mức · '+esc(operationDisplayName(rate)),`<p>${esc(n.name)} · ${op.mode==='outside'?'Thuê ngoài':'Tại xưởng'}</p>${calc?.error?paErrors([calc.error]):''}<p>Lượng vật tư = lượng thực hiện × định mức × số lớp × (1 + hao hụt / 100).</p>${TPWork.recipes(rate).map((recipe,i)=>{const g=rows.find(g=>g.recipeIndex===i),factor=Number(recipe.norm)*Number(recipe.layers??1)*(1+Number(recipe.loss??0)/100),base=g&&factor>0?g.quantity/factor:null;return `<section class="panel panel-body"><strong>${esc(recipe.spec?.id||'Chưa chọn mã')} · ${esc(recipe.spec?.name||'')}</strong><p>Định mức: ${num(recipe.norm,4)} ${esc(recipe.spec?.unit)}/${esc(recipe.basis)} · ${num(recipe.layers??1)} lớp · hao hụt ${num(recipe.loss??0)}%</p><p>${g?.error?esc(g.error):g?`${base===null?'Lượng thực hiện':num(base,4)+' '+esc(recipe.basis)} × ${num(recipe.norm,4)} × ${num(recipe.layers??1)} × (1 + ${num(recipe.loss??0)}/100) = <strong>${num(g.quantity,4)} ${esc(g.unit)}</strong>`:'Chưa sinh lượng. Mở lượng công việc để khai hoặc xác nhận diện tích/khối lượng thực hiện.'}</p>${g?`<p>${g.included?esc(g.reason||'Đã gồm trong giá thuê; không cộng vật tư lần nữa'):'Tiền vật tư: '+money(g.cost)+' đ'}</p>`:''}</section>`;}).join('')}${paButton('Lượng công việc / xác nhận diện tích','op-detail',`data-id="${esc(id)}" data-index="${index}"`)}${paButton('Xem định mức đang áp dụng','edit-rate',`data-id="${esc(rate.id)}"`)}`);$('#dialog').classList.add('wide-dialog');
}
function installQuoteOperationChoiceUI(){
  document.addEventListener('click',e=>{const b=e.target.closest('[data-technical-rate]');if(b){try{qocTechnicalEdit(b.dataset.technicalRate);}catch(err){inError(err);}}});
  const create=actions['new-rate'];actions['new-rate']=()=>page==='quote'?qocSelectOperation():create();
  document.addEventListener('click',e=>{const button=e.target.closest('[data-qoc-recipes],[data-operation-density]');if(!button)return;try{if(button.hasAttribute('data-operation-density')){PA.expandedMatrix=!PA.expandedMatrix;render();}else qocRecipeDetails(button.dataset.qocRecipes,Number(button.dataset.index));}catch(error){toast(error.message);}});

  inOperationPrices=qocRender;
  document.addEventListener('change',e=>{const input=e.target.closest('[data-qoc-choice]');if(!input)return;const id=input.dataset.qocChoice,value=input.value,scroll=input.closest('[data-qoc-table]'),position={left:scroll?.scrollLeft||0,top:scroll?.scrollTop||0};
    try{inWritable();if(!db.quote.ratesSnapshot.some(r=>r.id===id))throw Error('Nguyên công không còn trong báo giá');if(!['catalog','factors'].includes(value)&&!value.startsWith('option:'))throw Error('Chọn cách giá đã khai');
      mutation(()=>qocApplyChoice(id,value));
      if($('#dialog').open){const table=$('#dialog [data-qoc-table]');if(table)table.outerHTML=qocTable(db.quote.ratesSnapshot);}
      const updated=$('#dialog[open] [data-qoc-table]')||$('[data-qoc-table]');if(updated){updated.scrollLeft=position.left;updated.scrollTop=position.top;}
      const status=$('#qoc-status');if(status){status.hidden=false;status.textContent='Đã lưu cách giá và tính lại báo giá.';}
    }catch(error){render();toast(error.message);}
  });
}

function qocEditRecipes(id,catalog=false){
 const rate=(catalog?db.rates:db.quote.ratesSnapshot).find(r=>r.id===id);if(!rate)return;
 if(!catalog)inWritable();
 const prior=TPWork.declaredRecipes(rate).map(r=>({...C.copy(r),_id:r.id||C.uid()}));
 openDialog('Định mức vật tư · '+rate.name,`<p>${catalog?'Lưu trong danh mục cho báo giá mới. Báo giá đã lập giữ định mức riêng.':'Áp dụng cho mọi dòng dùng công đoạn này trong báo giá hiện tại.'}</p><p>Lượng cần dùng = lượng thực hiện × định mức × số lớp × (1 + hao hụt / 100). Có thể chọn nhiều mã sơn lót, sơn phủ, dung môi.</p><label class="pa-checkbox"><input type="checkbox" name="recipe-enabled" ${rate.consumptionsEnabled!==false?'checked':''}> Áp dụng định mức vật tư</label><div id="work-recipes">${prior.map(workRecipeRow).join('')}</div>${workButton('+ Thêm vật tư','add-recipe')}`,'Lưu định mức',f=>{
 const consumptions=[...document.querySelectorAll('#work-recipes .work-recipe')].map(el=>{
 const key=el.dataset.recipeId,old=prior.find(r=>r._id===key),material=db.materials.find(m=>m.id===f.get('recipe-material-'+key));
 if(!material)throw Error('Chọn mã vật tư cho từng dòng');
 const value=k=>{const raw=f.get('recipe-'+k+'-'+key),v=Number(raw);if(raw===''||!Number.isFinite(v)||v<0||k==='layers'&&v<=0)throw Error('Định mức, số lớp và hao hụt phải hợp lệ');return v;};
 return {id:old?.id||key,spec:C.copy(old?.spec?.id===material.id?old.spec:material),basis:f.get('recipe-basis-'+key),norm:value('norm'),layers:value('layers'),loss:value('loss')};});
 const apply=()=>{rate.consumptions=consumptions;rate.consumptionsEnabled=f.has('recipe-enabled');delete rate.consumption;};
 if(catalog){dfCatalogWrite(apply);closeDialog();toast('Đã ghi định mức. Lưu danh mục chung để dùng trên máy khác.');}else{inWritable();saveAndClose(apply,'Đã lưu định mức và tính lại nhu cầu vật tư');}
 });$('#dialog').classList.add('wide-dialog');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-recipe-editor]');if(b)try{qocEditRecipes(b.dataset.recipeEditor,b.dataset.catalog==='true');}catch(err){inError(err);}});
