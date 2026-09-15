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
  if(good.length){return ['inside','outside'].map(mode=>{const list=good.filter(j=>j.op.mode===mode),units=[...new Set(list.map(j=>j.calc.unit))];return units.map(unit=>{const prices=list.filter(j=>j.calc.unit===unit).map(j=>j.calc.rate),min=Math.min(...prices),max=Math.max(...prices);return `<small class="subtext">${mode==='inside'?'Tại xưởng':'Thuê ngoài'}: <strong>${money(min)}${max!==min?' – '+money(max):''} đ/${esc(unit)}</strong></small>`;}).join('');}).join('');}
  const selected=current.startsWith('option:')?rate.priceOptions?.find(o=>'option:'+o.id===current&&o.enabled!==false):null;
  if(!['catalog','factors'].includes(current)&&!selected)return '<span class="muted">Chọn lại cách giá để tính.</span>';
  const source=selected||rate,method=selected?.method||current;
  return ['inside','outside'].map(mode=>`<small class="subtext">${mode==='inside'?'Tại xưởng':'Thuê ngoài'}: ${money(source[mode])} đ/${esc(method==='fixed'?'gói':source[mode+'Unit']||rate.unit)}</small>`).join('')+`<small class="subtext">${method==='factors'?'Giá cơ sở; sẽ tra hệ số khi có công việc.':'Chưa có công việc tính phí.'}</small>`;
}
function qocPriceLines(rate,current,jobs){
 if(!jobs.length)return qocPrices(rate,current,jobs);
 return jobs.map(j=>{const c=j.calc,path=C.nodePath(db.quote.products,j.node.id)||[];return `<div class="qoc-job" data-job-price="${esc(j.node.id)}"><strong>${esc(j.node.materialId||j.node.name)}</strong><small class="subtext">${path.map(n=>esc(n.name)).join(' / ')} · ${j.op.mode==='outside'?'Thuê ngoài':'Tại xưởng'}</small>${!c||c.error?`<span class="form-error">${esc(c?.error||'Chưa tính được')}</span>`:c.skipped?esc(c.reason):`<strong>${money(c.rate)} đ/${esc(c.unit)}</strong><small class="subtext">Giá cơ sở: ${money(c.base)} · ${num(c.basis,4)} ${esc(c.unit)} × ${money(c.rate)} = ${money(c.cost)} đ</small>${(c.factors||[]).map(f=>`<small class="subtext">${esc(f.id||f.param)} · ${esc(f.name)}: ${esc(f.input)} → ${num(f.value,4)}% (${f.source==='override'?'nhập riêng':f.source==='declared'?'đã khai':'liên kết dữ liệu'})</small>`).join('')}`}</div>`;}).join('');
}
function qocTable(rates){return `<div data-qoc-table class="table-scroll"><table class="qoc-table"><thead><tr><th>Nguyên công / hoàn thiện</th><th>Cách giá áp dụng</th><th>Giá từng dòng công việc</th><th>Tiền công</th><th>Chi tiết</th></tr></thead><tbody>${rates.map(rate=>{
  const jobs=qocJobs(rate),current=qocCurrent(rate,jobs),active=jobs.filter(j=>!j.calc?.skipped),invalid=active.some(j=>!j.calc||j.calc.error),total=active.reduce((sum,j)=>sum+(j.calc?.cost||0),0);
  return `<tr data-qoc-rate="${esc(rate.id)}"><td><strong>${esc(rate.name)}</strong><small class="subtext">${jobs.length} công việc</small></td><td><select data-qoc-choice="${esc(rate.id)}" aria-label="Cách giá ${esc(rate.name)}">${qocChoices(rate,current)}</select></td><td>${qocPriceLines(rate,current,jobs)}</td><td data-qoc-total>${invalid?'<span class="form-error">Chưa tính đủ</span>':money(total)+' đ'}</td><td><details><summary>Xem công việc</summary>${jobs.map(j=>`<div class="qoc-job"><strong>${esc(j.node.name)}</strong><small class="subtext">${j.calc?.skipped?esc(j.calc.reason):j.calc?.error?esc(j.calc.error):`${num(j.calc?.basis,4)} ${esc(j.calc?.unit)} × ${money(j.calc?.rate)} = ${money(j.calc?.cost)} đ`}</small><small class="subtext">${esc(reviewComplexityText(j.op,j.calc||{}))}</small>${paButton('Lượng / độ phức tạp','op-detail',`data-id="${esc(j.node.id)}" data-index="${j.index}"`,'small')}</div>`).join('')||'<p>Chưa dùng nguyên công này trong cấu thành.</p>'}${inButton('Lấy bảng mới từ danh mục','rate-reference',`data-id="${esc(rate.id)}"`,'small')}</details></td></tr>`;
}).join('')}</tbody></table></div>`;}
function qocRender(){return `<section class="panel intake-panel"><h3>Chọn giá nguyên công và hoàn thiện</h3><p>Chọn một cách giá đã khai cho mỗi nguyên công. Các cách mới ở Đơn giá đầu vào xuất hiện tại đây để chọn. Giá đang dùng giữ nguyên đến khi chọn áp dụng; lượng và độ phức tạp giữ riêng từng công việc.</p>${qocTable(db.quote.ratesSnapshot)}<p class="help-text">Đơn giá và các yếu tố được hiển thị riêng theo từng dòng công việc. Tiền công chưa gồm vật tư hoàn thiện. Mở chi tiết để xem từng phép tính hoặc lấy bảng giá mới.</p><p id="qoc-status" role="status" hidden></p></section>`;}
function qocOperationCatalog(){return `<div class="rc-toolbar"><p>Công đoạn dùng chung cho đơn giá đầu vào và báo giá. Chọn cách tính và giá tại Đơn giá đầu vào.</p>${btn('+ Công đoạn','new-rate')}</div><section class="panel table-scroll"><table><thead><tr><th>Mã công đoạn</th><th>Tên công đoạn</th><th>Cách giá đã khai</th><th>Vật tư định mức</th><th></th></tr></thead><tbody>${db.rates.filter(r=>rcMatch(r.id+' '+r.name)).map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.name)}</td><td>${2+(r.priceOptions||[]).filter(x=>x.enabled!==false).length} cách</td><td>${TPWork.recipes(r).map(x=>esc(x.spec?.id||'Chưa chọn mã')).join(', ')||'—'}</td><td>${paButton('Đơn giá / định mức','edit-rate',`data-id="${esc(r.id)}" data-catalog="1"`,'small')}</td></tr>`).join('')}</tbody></table></section>`;}
function qocSelectOperation(){
 inWritable();const rates=db.rates.filter(r=>r.enabled!==false);if(!rates.length)return toast('Khai công đoạn tại Danh mục quy ước trước');
 openDialog('Chọn công đoạn đã khai',`${select('Công đoạn từ Danh mục quy ước','operationId',rates.map(r=>[r.id,r.id+' · '+r.name]),rates[0].id)}<div id="qoc-operation-options"></div><p>Chọn cách giá cho nguyên công này, sau đó tích vào các dòng thực hiện. Giá và định mức đã lưu trong báo giá giữ nguyên đến khi chủ động lấy bảng mới.</p>`,'Áp dụng công đoạn',f=>{
   inWritable();const master=rates.find(r=>r.id===f.get('operationId'));if(!master)throw Error('Chọn công đoạn');const choice=String(f.get('operationChoice'));
   const snapshot=db.quote.ratesSnapshot.find(r=>r.id===master.id)||master;TPWork.validatePriceOptions({...snapshot,priceOptions:qocAvailableOptions(snapshot)});const allowed=['catalog','factors',...qocAvailableOptions(snapshot).map(x=>'option:'+x.id)];if(!allowed.includes(choice))throw Error('Chọn cách giá đã khai');
   saveAndClose(()=>{if(!db.quote.ratesSnapshot.some(r=>r.id===master.id))db.quote.ratesSnapshot.push(C.copy(master));qocApplyChoice(master.id,choice);},'Đã chọn công đoạn và cách giá');
 });
 const draw=()=>{const master=rates.find(r=>r.id===$('[name=operationId]').value),r=db.quote.ratesSnapshot.find(r=>r.id===master.id)||master;$('#qoc-operation-options').innerHTML=`<label class="field"><span>Cách tính thuộc cơ sở tính giá</span><select name="operationChoice">${qocChoices(r,'catalog')}</select></label><div id="qoc-operation-preview"></div>`;const preview=()=>{$('#qoc-operation-preview').innerHTML=qocPrices({...r,priceOptions:qocAvailableOptions(r)},$('[name=operationChoice]').value,[]);};$('[name=operationChoice]').onchange=preview;preview();};$('[name=operationId]').onchange=draw;draw();
}
function qocRecipeDetails(id,index){const n=C.findNode(db.quote.products,id),op=n?.ops?.[index],rate=db.quote.ratesSnapshot.find(r=>r.id===op?.id);if(!rate)return;const calc=result.nodes[id]?.ownOps[index],rows=[...(result.generated||[]),...(result.includedGenerated||[])].filter(g=>g.ownerId===id&&g.opIndex===index);
 openDialog('Vật tư định mức · '+esc(rate.name),`<p>${esc(n.name)} · ${op.mode==='outside'?'Thuê ngoài':'Tại xưởng'}</p>${calc?.error?paErrors([calc.error]):''}<p>Lượng vật tư = lượng thực hiện × định mức × số lớp × (1 + hao hụt / 100).</p>${TPWork.recipes(rate).map((recipe,i)=>{const g=rows.find(g=>g.recipeIndex===i),factor=Number(recipe.norm)*Number(recipe.layers??1)*(1+Number(recipe.loss??0)/100),base=g&&factor>0?g.quantity/factor:null;return `<section class="panel panel-body"><strong>${esc(recipe.spec?.id||'Chưa chọn mã')} · ${esc(recipe.spec?.name||'')}</strong><p>Định mức: ${num(recipe.norm,4)} ${esc(recipe.spec?.unit)}/${esc(recipe.basis)} · ${num(recipe.layers??1)} lớp · hao hụt ${num(recipe.loss??0)}%</p><p>${g?.error?esc(g.error):g?`${base===null?'Lượng thực hiện':num(base,4)+' '+esc(recipe.basis)} × ${num(recipe.norm,4)} × ${num(recipe.layers??1)} × (1 + ${num(recipe.loss??0)}/100) = <strong>${num(g.quantity,4)} ${esc(g.unit)}</strong>`:'Chưa sinh lượng. Mở lượng công việc để khai hoặc xác nhận diện tích/khối lượng thực hiện.'}</p>${g?`<p>${g.included?esc(g.reason||'Đã gồm trong giá thuê; không cộng vật tư lần nữa'):'Tiền vật tư: '+money(g.cost)+' đ'}</p>`:''}</section>`;}).join('')}${paButton('Lượng công việc / xác nhận diện tích','op-detail',`data-id="${esc(id)}" data-index="${index}"`)}${paButton('Xem định mức đang áp dụng','edit-rate',`data-id="${esc(rate.id)}"`)}`);$('#dialog').classList.add('wide-dialog');
}
function installQuoteOperationChoiceUI(){
  const create=actions['new-rate'];actions['new-rate']=()=>page==='quote'?qocSelectOperation():create();
  document.addEventListener('click',e=>{const button=e.target.closest('[data-qoc-recipes],[data-operation-density]');if(!button)return;try{if(button.hasAttribute('data-operation-density')){PA.expandedMatrix=!PA.expandedMatrix;render();}else qocRecipeDetails(button.dataset.qocRecipes,Number(button.dataset.index));}catch(error){toast(error.message);}});

  inOperationPrices=qocRender;
  document.addEventListener('change',e=>{const input=e.target.closest('[data-qoc-choice]');if(!input)return;const id=input.dataset.qocChoice,value=input.value;
    try{inWritable();if(!db.quote.ratesSnapshot.some(r=>r.id===id))throw Error('Nguyên công không còn trong báo giá');if(!['catalog','factors'].includes(value)&&!value.startsWith('option:'))throw Error('Chọn cách giá đã khai');
      mutation(()=>qocApplyChoice(id,value));
      if($('#dialog').open){const table=$('#dialog [data-qoc-table]');if(table)table.outerHTML=qocTable(db.quote.ratesSnapshot);}
      const status=$('#qoc-status');if(status){status.hidden=false;status.textContent='Đã lưu cách giá và tính lại báo giá.';}
    }catch(error){render();toast(error.message);}
  });
}
