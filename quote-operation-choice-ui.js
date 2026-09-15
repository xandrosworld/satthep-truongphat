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
function qocTable(rates){return `<div data-qoc-table class="table-scroll"><table class="qoc-table"><thead><tr><th>Nguyên công / hoàn thiện</th><th>Cách giá áp dụng</th><th>Đơn giá áp dụng</th><th>Tiền công</th><th>Chi tiết</th></tr></thead><tbody>${rates.map(rate=>{
  const jobs=qocJobs(rate),current=qocCurrent(rate,jobs),active=jobs.filter(j=>!j.calc?.skipped),invalid=active.some(j=>!j.calc||j.calc.error),total=active.reduce((sum,j)=>sum+(j.calc?.cost||0),0);
  return `<tr data-qoc-rate="${esc(rate.id)}"><td><strong>${esc(rate.name)}</strong><small class="subtext">${jobs.length} công việc</small></td><td><select data-qoc-choice="${esc(rate.id)}" aria-label="Cách giá ${esc(rate.name)}">${qocChoices(rate,current)}</select></td><td>${qocPrices(rate,current,jobs)}</td><td data-qoc-total>${invalid?'<span class="form-error">Chưa tính đủ</span>':money(total)+' đ'}</td><td><details><summary>Xem công việc</summary>${jobs.map(j=>`<div class="qoc-job"><strong>${esc(j.node.name)}</strong><small class="subtext">${j.calc?.skipped?esc(j.calc.reason):j.calc?.error?esc(j.calc.error):`${num(j.calc?.basis,4)} ${esc(j.calc?.unit)} × ${money(j.calc?.rate)} = ${money(j.calc?.cost)} đ`}</small><small class="subtext">${esc(reviewComplexityText(j.op,j.calc||{}))}</small>${paButton('Lượng / độ phức tạp','op-detail',`data-id="${esc(j.node.id)}" data-index="${j.index}"`,'small')}</div>`).join('')||'<p>Chưa dùng nguyên công này trong cấu thành.</p>'}${inButton('Lấy bảng mới từ danh mục','rate-reference',`data-id="${esc(rate.id)}"`,'small')}</details></td></tr>`;
}).join('')}</tbody></table></div>`;}
function qocRender(){return `<section class="panel intake-panel"><h3>Chọn giá nguyên công và hoàn thiện</h3><p>Chọn một cách giá đã khai cho mỗi nguyên công. Các cách mới ở Đơn giá đầu vào xuất hiện tại đây để chọn. Giá đang dùng giữ nguyên đến khi chọn áp dụng; lượng và độ phức tạp giữ riêng từng công việc.</p>${qocTable(db.quote.ratesSnapshot)}<p class="help-text">Đơn giá áp dụng đã tính các hệ số của từng công việc; nhiều mức giá hiển thị thấp nhất – cao nhất. Tiền công chưa gồm vật tư hoàn thiện. Mở chi tiết để xem từng phép tính hoặc lấy bảng giá mới.</p><p id="qoc-status" role="status" hidden></p></section>`;}
function installQuoteOperationChoiceUI(){
  inOperationPrices=qocRender;
  document.addEventListener('change',e=>{const input=e.target.closest('[data-qoc-choice]');if(!input)return;const id=input.dataset.qocChoice,value=input.value;
    try{inWritable();if(!db.quote.ratesSnapshot.some(r=>r.id===id))throw Error('Nguyên công không còn trong báo giá');if(!['catalog','factors'].includes(value)&&!value.startsWith('option:'))throw Error('Chọn cách giá đã khai');
      mutation(()=>qocApplyChoice(id,value));
      if($('#dialog').open){const table=$('#dialog [data-qoc-table]');if(table)table.outerHTML=qocTable(db.quote.ratesSnapshot);}
      const status=$('#qoc-status');if(status){status.hidden=false;status.textContent='Đã lưu cách giá và tính lại báo giá.';}
    }catch(error){render();toast(error.message);}
  });
}
