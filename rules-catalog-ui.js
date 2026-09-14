'use strict';

// One catalogue workspace; calculation and saved quotation snapshots stay in their existing engines.
const RulesCatalog = {kind:'shapes',query:'',drafts:{},notices:{}};
const rcKinds = {substances:'Vật liệu',grades:'Mác vật liệu',characteristics:'Đặc tính',shapes:'Hình dạng & công thức',parameters:'Thông số cấu kiện',stocks:'Khổ chuẩn',units:'Đơn vị tính',customers:'Nhóm khách hàng',complexity:'Độ phức tạp'};
const rcButton = (label,action,attrs='') => `<button type="button" class="button small" data-rc="${action}" ${attrs}>${label}</button>`;
const rcMatch = value => B1.fold(value).includes(B1.fold(RulesCatalog.query));
const rcEditButton = (label,kind,name='',parent='') => rcButton(label,'edit',`data-kind="${kind}" data-name="${esc(name)}" data-parent="${esc(parent)}"`);
function rcUses(kind,item){const refs=TPConventions.references(db,kind,item);return refs.length?rcButton(`${refs.length} nơi dùng`,'uses',`data-kind="${kind}" data-name="${esc(item.name)}"`):'<span class="rc-muted">Chưa sử dụng</span>';}
function rcActions(kind,item){return `<div class="actions">${rcEditButton('Sửa',kind,item.name,item.parent)}${cvButton('Xóa','remove',kind,item.name)}</div>`;}
function rcCatalog(kind){
  const rows=TPConventions.entries(db,kind),children=['grades','characteristics'].includes(kind);
  if(children){
    const materials=TPConventions.entries(db,'substances'),parents=[...materials];
    // Retain visibility of imported values whose parent was never declared.
    for(const row of rows)if(!parents.some(p=>p.name===(row.parent||'')))parents.push({name:row.parent||'',missing:true});
    const label=kind==='grades'?'mác':'đặc tính';
    if(!parents.length)return '<p class="notice">Chưa có vật liệu. Khai vật liệu trước khi thêm mác hoặc đặc tính.</p>';
    return `<p class="rc-description">${kind==='grades'?'Mỗi vật liệu có danh sách mác riêng.':'Đặc tính được khai theo vật liệu, song song với mác vật liệu.'}</p>`+parents.map(parent=>{
      const all=rows.filter(x=>(x.parent||'')===parent.name),items=all.filter(x=>rcMatch(parent.name)||rcMatch(x.name));
      if(RulesCatalog.query&&!items.length&&!rcMatch(parent.name))return '';
      return `<section class="panel rc-group" data-rc-parent="${esc(parent.name)}"><div class="panel-head"><div><h2>${esc(parent.name||'Chưa gắn vật liệu')}</h2><p>${all.length} ${label}${parent.density?' · Khối lượng riêng '+num(parent.density)+' kg/m³':''}${parent.missing?' · Cần kiểm tra vật liệu gốc':''}</p></div>${!parent.missing?rcEditButton('+ Thêm '+label+' '+parent.name,kind,'',parent.name):''}</div><div class="table-scroll"><table><thead><tr><th>Tên ${label}</th>${kind==='grades'?'<th>Giá tham chiếu (đ/kg)</th>':''}<th>Đang dùng</th><th>Thao tác</th></tr></thead><tbody>${items.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td>${kind==='grades'?`<td>${money(x.price||0)}</td>`:''}<td>${rcUses(kind,x)}</td><td>${rcActions(kind,x)}</td></tr>`).join('')||`<tr><td colspan="${kind==='grades'?4:3}">Chưa khai ${label}${RulesCatalog.query?' phù hợp tìm kiếm':''}.</td></tr>`}</tbody></table></div></section>`;
    }).join('');
  }
  const items=rows.filter(x=>rcMatch(x.name)),substance=kind==='substances';
  return `<div class="rc-toolbar"><p>${substance?'Khối lượng riêng được khai tại đây và dùng khi chọn vật liệu cho mã vật tư.':'Giá trị đã khai được dùng lại trong các màn nhập liệu.'}</p>${rcEditButton('+ Thêm '+rcKinds[kind].toLocaleLowerCase('vi'),kind)}</div><section class="panel"><div class="table-scroll"><table><thead><tr><th>${kind==='parameters'?'Ký hiệu':'Tên'}</th><th>${substance?'Khối lượng riêng (kg/m³)':'Thông số'}</th>${substance?'<th>Mác / đặc tính</th>':''}<th>Đang dùng</th><th>Thao tác</th></tr></thead><tbody>${items.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td>${substance?num(x.density):esc(x.unit||'')+(x.percent!==undefined?num(x.percent)+'%':'')}</td>${substance?`<td><div class="actions">${rcButton(TPConventions.entries(db,'grades').filter(c=>c.parent===x.name).length+' mác','related',`data-kind="grades" data-parent="${esc(x.name)}"`)}${rcButton(TPConventions.entries(db,'characteristics').filter(c=>c.parent===x.name).length+' đặc tính','related',`data-kind="characteristics" data-parent="${esc(x.name)}"`)}</div></td>`:''}<td>${rcUses(kind,x)}</td><td>${rcActions(kind,x)}</td></tr>`).join('')||'<tr><td colspan="5">Chưa có giá trị phù hợp.</td></tr>'}</tbody></table></div></section>${kind==='complexity'?cvButton('Dùng bảng cho công đoạn','apply-complexity'):''}`;
}
function rcFormulaRows(d){
  const factor=d.base==='sheet'?'Dài KT × Rộng KT / 1.000.000':'Dài KT / 1.000';
  const stock=d.base==='sheet'?'Số khổ × Dài khổ × Rộng khổ / 1.000.000':'Số khổ × Dài khổ / 1.000';
  return `<table class="rc-formula-summary"><thead><tr><th>Đại lượng</th><th>Công thức áp dụng</th></tr></thead><tbody><tr><td>Khối lượng phôi (kg)</td><td><code>${esc(DFC().expandedFormulas(d).blankMass)}</code></td></tr><tr><td>Khối lượng vật tư mua (kg)</td><td>${stock} × K</td></tr><tr><td>Diện tích phôi (m²)</td><td><code>${esc(DFC().expandedFormulas(d).blankSurface)}</code></td></tr><tr><td>Diện tích vật tư mua (m²)</td><td>${stock} × A</td></tr></tbody></table><p class="help-text">KT là khai triển. K là công thức khối lượng trên đơn vị; A là công thức diện tích trên đơn vị ở trên. Kích thước tính bằng mm. Số khổ được tính khi xếp phôi; lượng mua toàn đơn có thể được phân bổ cho nhiều dòng. Diện tích sơn/gia công được khai theo công việc.</p>`;
}
function rcLegacyDefinition(rule){
  const sheet=rule.shape==='sheet',sample={L:1000,W:200,H:50,F:15,T:2,D:60,KM:10,AM:.5};
  let id=('QD-NGUON-'+rule.id.replace(/[^A-Za-z0-9_-]/g,'-')).slice(0,76);
  while((db.shapeDefinitions||[]).some(d=>d.id===id&&!d.sourceRuleId))id+='x';
  const inputs=[...new Set((rule.length+' '+rule.width).match(/[A-Z][A-Z0-9_]*/g)||[])].filter(k=>k!=='T'&&k!=='RHO'&&k!=='PI');
  return {id,name:rule.name,sourceRuleId:rule.id,base:sheet?'sheet':'bar',blankShape:sheet?'sheet':'profile',fields:[...(sheet?[{key:'T',mode:'fixed',unit:'mm',sample:2}]:[{key:'KM',mode:'fixed',unit:'kg/m',sample:10},{key:'AM',mode:'fixed',unit:'m²/m',sample:.5}]),...inputs.map(key=>({key,mode:'input',unit:'mm',sample:sample[key]||1}))],length:rule.length,width:rule.width,mass:sheet?'T / 1000 * RHO':'KM',surface:sheet?'1':'AM',notes:sheet?'Diện tích phôi theo một mặt hình học. Diện tích xử lý bề mặt khai theo công việc.':'KM và AM cần nhập theo tiết diện hoặc bảng tra của mã vật tư.',condition:''};
}
function rcRowModel(key){return key.startsWith('source:')?rcLegacyDefinition(db.rules.find(r=>r.id===key.slice(7))):(db.shapeDefinitions||[]).find(d=>d.id===key);}
function rcWorking(key){const d=rcRowModel(key),draft=RulesCatalog.drafts[key];return {...d,...(draft?.version===(d.version||0)?draft.values:{})};}
function rcFormulaInput(key,fieldName,label,value,disabled=false){return `<label class="rc-inline-formula"><span>${label}</span><textarea data-rc-formula="${fieldName}" data-rc-key="${esc(key)}" aria-label="${label}" rows="2" spellcheck="false" ${disabled?'disabled':''}>${esc(value)}</textarea></label>`;}
function rcShapeRow(key){
  const original=rcRowModel(key),d=rcWorking(key),formulas=DFC().blankFormulas(d),source=key.startsWith('source:');
  return `<tr data-rc-definition="${esc(key)}"><td><strong>${esc(d.name)}</strong><small>${source?'Từ quy tắc đang có':esc(d.id)}</small></td><td>${esc(C.shapes[d.blankShape|| (d.base==='sheet'?'sheet':'profile')].name)}</td><td>${d.fields.filter(f=>f.mode==='fixed').map(f=>`<small>${esc(f.key)} (${esc(f.unit)})</small>`).join('')||'Không có'}</td><td>${d.fields.filter(f=>f.mode==='input').map(f=>`<small>${esc(f.key)} (${esc(f.unit)})</small>`).join('')||'Không có'}</td><td>${rcFormulaInput(key,'length','Dài (mm)',d.length)}${rcFormulaInput(key,'width','Rộng (mm)',d.width,d.base!=='sheet')}</td><td>${rcFormulaInput(key,'blankMass','Khối lượng (kg/chi tiết)',formulas.blankMass)}</td><td>${rcFormulaInput(key,'blankSurface','Diện tích (m²/chi tiết)',formulas.blankSurface)}</td><td><div class="rc-row-actions">${rcButton('Lưu & thử','save-formulas',`data-key="${esc(key)}"`)}${rcButton('Công thức tổng hợp','summary',`data-key="${esc(key)}"`)}${source?rcButton('Sửa khai báo','declare-rule',`data-key="${esc(key)}"`):dfButton('Sửa khai báo','shape-edit',d.id)}${!source?dfButton('Tạo mã vật tư','shape-material',d.id):''}</div><small data-rc-feedback="${esc(key)}" role="status">${esc(RulesCatalog.notices[key]||'')}</small></td></tr>`;
}
function rcSaveFormulas(key){
  const value=rcWorking(key),preview=DFC().testShape(value,Object.fromEntries(value.fields.map(f=>[f.key,f.sample])));
  dfCatalogWrite(()=>DFC().saveShape(db,value));delete RulesCatalog.drafts[key];
  RulesCatalog.notices[value.id]=`Đã lưu. Số thử: ${num(preview.weight,4)} kg; ${num(preview.blankArea,4)} m² / chi tiết.`;
  render();toast('Đã lưu công thức phôi; báo giá cũ giữ bản đã chọn');
}
function rcSummary(key){
  const d=rcWorking(key),full=DFC().expandedFormulas(d),input=Object.fromEntries(d.fields.map(f=>[f.key,f.sample]));
  let resultText;try{const g=DFC().testShape(d,input);resultText=`Số thử: ${num(g.length)}${g.width?' × '+num(g.width):''} mm; ${num(g.weight,4)} kg; ${num(g.blankArea,4)} m² / chi tiết. RHO thử = 7.850 kg/m³.`;}catch(e){resultText=e.message;}
  openDialog('Công thức tổng hợp · '+esc(d.name),`<p>${RulesCatalog.drafts[key]?'Đang xem nội dung nhập trên bảng; bấm Lưu & thử để lưu.':'Công thức theo khai báo hiện tại.'}</p><dl class="rc-summary"><dt>Dạng cấu kiện</dt><dd>${esc(d.name)}</dd><dt>Hình dạng phôi</dt><dd>${esc(C.shapes[d.blankShape||(d.base==='sheet'?'sheet':'profile')].name)}</dd><dt>Dài khai triển (mm)</dt><dd><code>${esc(d.length)}</code></dd><dt>Rộng khai triển (mm)</dt><dd><code>${d.base==='sheet'?esc(d.width):'Không áp dụng'}</code></dd><dt>Khối lượng phôi sản phẩm (kg/chi tiết)</dt><dd><code>${esc(full.blankMass)}</code></dd><dt>Diện tích phôi sản phẩm (m²/chi tiết)</dt><dd><code>${esc(full.blankSurface)}</code></dd></dl><p class="notice">${esc(resultText)}</p><p>Toàn dòng = kết quả một chi tiết × số lượng tại dòng × số lượng các cấp cha. Khổ mua được tính riêng từ kích thước khai triển và định mức vật tư.</p>${rcFormulaRows(d)}`);
  $('#dialog').classList.add('wide-dialog');
}
function rcShapes(){
  const all=db.shapeDefinitions||[],defs=all.filter(d=>rcMatch(d.name)||rcMatch(d.id));
  const sources=db.rules.filter(r=>!all.some(d=>d.sourceRuleId===r.id)&&(rcMatch(r.name)||rcMatch(r.id)));
  return `<div class="rc-toolbar"><p>Mỗi dòng khai trọn thông tin một dạng cấu kiện. Điền công thức ngay trên bảng, bấm Lưu & thử, rồi mở Công thức tổng hợp để xem cách tính đầy đủ.</p><div class="actions">${dfButton('+ Quy ước hình dạng','shape-new')}${rcButton('+ Quy ước tấm','sheet-new')}</div></div><section class="panel"><div class="panel-head"><h2>Thông tin hình dạng phôi</h2></div><div class="table-scroll"><table class="rc-shapes rc-complete-shapes"><thead><tr><th>Dạng cấu kiện</th><th>Hình dạng phôi</th><th>Khai báo tại mã vật tư</th><th>Bổ sung báo giá</th><th>Kích thước khai triển</th><th>Khối lượng phôi sản phẩm</th><th>Diện tích phôi sản phẩm</th><th>Công thức tổng hợp / thao tác</th></tr></thead><tbody>${defs.map(d=>rcShapeRow(d.id)).join('')+sources.map(r=>rcShapeRow('source:'+r.id)).join('')||'<tr><td colspan="8">Chưa có quy ước phù hợp.</td></tr>'}</tbody></table></div><p class="rc-description">PHOI_D và PHOI_R là dài, rộng khai triển (mm). KL_DV và DT_DV là định mức khối lượng, diện tích của vật tư; có thể thay bằng công thức dùng các thông số đã khai. Số lượng được nhân trong báo giá, không đưa lại vào công thức một chi tiết.</p></section><details class="rc-existing"><summary>Công thức khai triển cho các mã vật tư đã có</summary><p>Những quy tắc này vẫn phục vụ các mã và báo giá đã lưu. Khai quy ước đầy đủ trên bảng để tạo mã vật tư mới có công thức phôi riêng.</p><div class="actions">${btn('+ Công thức khai triển','new-rule','','small')}${db.rules.map(r=>btn('Sửa '+esc(r.name),'edit-rule',`data-id="${esc(r.id)}"`,'small')).join('')}</div></details>`;
}
function rcStocks(){return `<div class="rc-toolbar"><p>Khổ mua được khai riêng với quy cách mã vật tư.</p>${dfButton('+ Khổ chuẩn','stock-new')}</div><section class="panel"><div class="table-scroll"><table><thead><tr><th>Mã / tên</th><th>Khổ (mm)</th><th>Xưởng / máy</th><th>Trạng thái</th><th></th></tr></thead><tbody>${(db.stockSizes||[]).filter(s=>rcMatch(s.name)||rcMatch(s.id)).map(s=>`<tr><td><strong>${esc(s.name)}</strong><small>${esc(s.id)}</small></td><td>${num(s.length)}${s.base==='sheet'?' × '+num(s.width):''}</td><td>${esc(s.workshop||'Chưa khai')} / ${esc(s.machine||'Chưa khai')}</td><td>${s.active===false?'Ngừng chọn':'Đang dùng'}</td><td>${dfButton('Sửa','stock-edit',s.id)}</td></tr>`).join('')||'<tr><td colspan="5">Chưa khai khổ chuẩn.</td></tr>'}</tbody></table></div></section>`;}
function rcWorkspace(){
  const kind=RulesCatalog.kind;
  return `<div class="rc-workspace">${heading('Danh mục quy ước','Vật liệu, mác, đặc tính và công thức dùng khi lập báo giá.',clButton('Excel danh mục','catalog-export'))}<nav class="rc-tabs" aria-label="Các nhóm quy ước">${Object.entries(rcKinds).map(([k,label])=>`<button type="button" data-rc-tab="${k}" aria-current="${kind===k?'page':'false'}">${label}</button>`).join('')}</nav><label class="rc-search"><span>Tìm trong ${esc(rcKinds[kind].toLocaleLowerCase('vi'))}</span><input id="rc-search" type="search" value="${esc(RulesCatalog.query)}" placeholder="Nhập tên hoặc mã"></label><div id="rc-results">${kind==='shapes'?rcShapes():kind==='stocks'?rcStocks():rcCatalog(kind)}</div><div class="actions">${clButton('Quản lý / kiểm tra nơi dùng','catalog','data-kind="rules"')}</div></div>`;
}
function rcSelect(kind,query=''){RulesCatalog.kind=kind;RulesCatalog.query=query;closeDialog();page='rules';render();}
function installRulesCatalogUI(){
  renderRules=rcWorkspace;
  const sheets=cvSheets;
  cvSheets=()=>[...sheets(),{name:'Quy uoc hinh dang',widths:[22,32,14,14,45,35,35,40,40,45,45],rows:[['Mã','Dạng cấu kiện','Hình dạng phôi','Cách tính khổ mua','Phiên bản','Thông số / nơi nhập / đơn vị / số thử','Dài khai triển (mm)','Rộng khai triển (mm)','Khối lượng trên đơn vị (kg/m hoặc kg/m²)','Diện tích trên đơn vị (m²/m hoặc m²/m²)','Khối lượng phôi sản phẩm (kg/chi tiết)','Diện tích phôi sản phẩm (m²/chi tiết)','Điều kiện','Ghi chú'],...(db.shapeDefinitions||[]).map(d=>[d.id,d.name,C.shapes[d.blankShape||(d.base==='sheet'?'sheet':'profile')].name,d.base,d.version,JSON.stringify(d.fields),d.length,d.width,d.mass,d.surface,DFC().expandedFormulas(d).blankMass,DFC().expandedFormulas(d).blankSurface,d.condition||'',d.notes||''])]},{name:'Kho mua chuan',widths:[22,32,14,20,20,24,24,16],rows:[['Mã','Tên','Dạng phôi','Dài (mm)','Rộng (mm)','Xưởng','Máy','Đang dùng'],...(db.stockSizes||[]).map(s=>[s.id,s.name,s.base,s.length,s.width||0,s.workshop||'',s.machine||'',s.active!==false?'Có':'Không'])]}];
  const list=cvList;
  cvList=(kind='parameters')=>{
    if(page==='rules')return rcSelect(kind);
    if(!['substances','grades','characteristics'].includes(kind))return list(kind);
    RulesCatalog.query='';
    openDialog('Danh mục quy ước · '+rcKinds[kind],`<div class="actions">${['substances','grades','characteristics'].map(k=>cvButton(rcKinds[k],'list',k)).join('')}</div>${rcCatalog(kind)}`);
    $('#dialog').classList.add('wide-dialog');
  };
  const shapeEdit=dfShapeEdit;
  dfShapeEdit=(...args)=>{
    if(args[0]&&RulesCatalog.drafts[args[0]])args[1]=rcWorking(args[0]);shapeEdit(...args);
    const form=$('#dialog-form');
    form.elements.mass.closest('label').firstElementChild.textContent='K · Công thức khối lượng trên đơn vị';
    form.elements.surface.closest('label').firstElementChild.textContent='A · Công thức diện tích trên đơn vị';
    form.elements.surface.closest('.form-grid').insertAdjacentHTML('afterend','<div id="rc-formulas"></div>');
    const show=()=>{const data=Object.fromEntries(new FormData(form));$('#rc-formulas').innerHTML=rcFormulaRows(data);};
    form.addEventListener('input',show);form.addEventListener('change',show);show();
  };
  const editRule=mfgEditRule;
  mfgEditRule=(...args)=>{editRule(...args);const detail=$('#dialog details');if(detail)detail.open=true;};
  const stockList=dfStockList;dfStockList=()=>page==='rules'?rcSelect('stocks'):stockList();
  document.addEventListener('input',e=>{if(e.target.dataset.rcFormula){const key=e.target.dataset.rcKey,d=rcRowModel(key);if(RulesCatalog.drafts[key]?.version!==(d.version||0))RulesCatalog.drafts[key]={version:d.version||0,values:{}};RulesCatalog.drafts[key].values[e.target.dataset.rcFormula]=e.target.value;const feedback=e.target.closest('tr').querySelector('[data-rc-feedback]');feedback.textContent='Có thay đổi chưa lưu';return;}if(e.target.id!=='rc-search')return;RulesCatalog.query=e.target.value;const kind=RulesCatalog.kind;$('#rc-results').innerHTML=kind==='shapes'?rcShapes():kind==='stocks'?rcStocks():rcCatalog(kind);});
  document.addEventListener('click',e=>{
    const tabButton=e.target.closest('[data-rc-tab]');if(tabButton){rcSelect(tabButton.dataset.rcTab);return;}
    const b=e.target.closest('[data-rc]');if(!b)return;
    try{
      const {rc:action,kind,name,parent}=b.dataset;
      if(action==='save-formulas')rcSaveFormulas(b.dataset.key);
      else if(action==='summary')rcSummary(b.dataset.key);
      else if(action==='declare-rule')dfShapeEdit(undefined,rcWorking(b.dataset.key));
      else if(action==='edit'){cvEdit(kind,name);if(!name&&parent&&$('#dialog-form').elements.parent)$('#dialog-form').elements.parent.value=parent;}
      else if(action==='related')rcSelect(kind,parent);
      else if(action==='uses'){const item=TPConventions.entries(db,kind).find(x=>x.name===name);openDialog('Nơi dùng · '+esc(name),TPConventions.references(db,kind,item).map(x=>'<p>'+esc(x)+'</p>').join(''));}
      else if(action==='sheet-new')dfShapeEdit(undefined,{id:'QD-'+C.uid(),name:'Tấm phẳng',base:'sheet',fields:[{key:'T',mode:'fixed',unit:'mm',sample:2},{key:'L',mode:'input',unit:'mm',sample:1000},{key:'W',mode:'input',unit:'mm',sample:200}],length:'L',width:'W',mass:'T / 1000 * RHO',surface:'1',notes:'Diện tích phôi tính theo một mặt hình học. Diện tích sơn/gia công khai theo công việc.',condition:''});
    }catch(error){const feedback=b.closest('tr')?.querySelector('[data-rc-feedback]');if(feedback)feedback.textContent=error.message;else inError(error);}
  });
}
