/* Input rules and contextual search. No DOM, network or data mutation. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
function parseNumber(raw,format='auto'){
  const original=String(raw).trim();
  if(!original)throw Error('Ô số đang trống');
  if(!['auto','vi','en'].includes(format))throw Error('Chọn cách viết số hợp lệ');
  let s=original.replace(/[\u00a0\u202f]/g,' ');
  if(/\s/.test(s)){
    if(!/^\d{1,3}(?: \d{3})+(?:[.,]\d+)?$/.test(s))throw Error('Khoảng trắng trong số không hợp lệ: '+original);
    s=s.replace(/ /g,'');
  }
  if(!/^[0-9.,]+$/.test(s))throw Error('Chỉ nhập số không âm, không kèm đơn vị: '+original);
  function localized(decimal,group){
    const parts=s.split(decimal);if(parts.length>2)throw Error('Dấu thập phân bị lặp: '+original);
    let integer=parts[0],fraction=parts[1];
    if(fraction!==undefined&&!/^\d+$/.test(fraction))throw Error('Phần thập phân không hợp lệ: '+original);
    if(integer.includes(group)){
      const groups=integer.split(group);
      if(!/^[1-9]\d{0,2}$/.test(groups[0])||groups.slice(1).some(g=>!/^\d{3}$/.test(g)))throw Error('Nhóm hàng nghìn phải đủ 3 chữ số: '+original);
      integer=groups.join('');
    }
    if(integer&&!/^\d+$/.test(integer))throw Error('Số không hợp lệ: '+original);
    if(!integer&&fraction===undefined)throw Error('Số không hợp lệ: '+original);
    return Number((integer||'0')+(fraction===undefined?'':'.'+fraction));
  }
  let value;
  if(format==='vi')value=localized(',','.');
  else if(format==='en')value=localized('.',',');
  else if(s.includes('.')&&s.includes(','))value=s.lastIndexOf(',')>s.lastIndexOf('.')?localized(',','.'):localized('.',',');
  else if(/[.,]/.test(s)){
    const separator=s.includes('.')?'.':',',parts=s.split(separator);
    if(parts.length>2)value=localized(separator==='.'?',':'.',separator);
    else{
      if(/^[1-9]\d{0,2}$/.test(parts[0])&&/^\d{3}$/.test(parts[1]))throw Error('Số “'+original+'” có hai cách hiểu. Chọn cách viết số Việt Nam hoặc Quốc tế bên trên rồi xem lại kích thước.');
      value=localized(separator,separator==='.'?',':'.');
    }
  }else value=Number(s);
  if(!Number.isFinite(value)||value<0||value>Number.MAX_SAFE_INTEGER)throw Error('Số vượt giới hạn: '+original);
  return value;
}
function readPaste(text,materials,rules,{format='auto',parentCount=1}={}){
  // Preserve leading/trailing tab cells. Trimming the whole payload can change columns.
  const lines=String(text).split(/\r?\n/).map((line,i)=>({cells:line.split('\t').map(s=>s.trim()),line:i+1})).filter(r=>r.cells.some(Boolean));
  if(lines.length>1000)throw Error('Mỗi lần dán tối đa 1.000 dòng để kiểm tra và thao tác ổn định');
  if(lines.length&&!materials.some(m=>normalize(m.id)===normalize(lines[0].cells[0]))&&['ma vat tu','ma vt','code','material code'].includes(normalize(lines[0].cells[0])))lines.shift();
  return lines.map(({cells,line})=>{
    while(cells.length>6&&cells.at(-1)==='')cells.pop();
    if(cells.length>6)throw Error('Dòng '+line+': có hơn 6 cột. Thứ tự là Mã vật tư, Số lượng, L, W, H, F');
    const [id,q,...sizes]=cells,m=materials.find(m=>normalize(m.id)===normalize(id));
    if(!m)throw Error('Dòng '+line+': chưa có mã '+(id||'(trống)')+' trong danh mục');
    const number=(value,key,fallback)=>{if(value===undefined||value==='')return fallback;try{return parseNumber(value,format);}catch(e){throw Error('Dòng '+line+', '+key+': '+e.message);}};
    const qty=number(q,'Số lượng',1);
    if(!(qty>0)||qty>5000)throw Error('Dòng '+line+': số lượng phải lớn hơn 0 và không quá 5.000');
    const dims={L:1000,W:300,H:50,F:15},provided=[];
    ['L','W','H','F'].forEach((key,i)=>{if(sizes[i]!==undefined&&sizes[i]!==''){
      const value=number(sizes[i],key,0);
      if(m.shape==='piece')throw Error('Dòng '+line+': '+m.id+' tính theo '+m.unit+', hãy để trống các cột kích thước');
      if(C.shapes[m.shape].fixed.includes(key)&&value!==m.props[key])throw Error('Dòng '+line+': '+key+' của '+m.id+' cố định là '+m.props[key]+' mm. Để trống ô này hoặc chọn mã vật tư khác');
      if(value>100000)throw Error('Dòng '+line+': '+key+' vượt giới hạn 100.000 mm');
      dims[key]=value;provided.push(key);
    }});
    const rule=m.shape==='sheet'?'flat':'bar',ruleSpec=rules.find(r=>r.id===rule);
    const node={kind:'material',qty,spec:m,dims,rule,ruleSpec};
    try{
      C.geometry(node,qty*parentCount);
      if(m.shape!=='piece'&&!Number.isInteger(Number((qty*parentCount).toFixed(9))))throw Error('Tổng số phôi trong báo giá phải là số nguyên');
    }catch(e){throw Error('Dòng '+line+': '+e.message);}
    return {material:m,qty,dims,line,rule,provided};
  });
}
function searchTree(nodes,query){
  const tokens=normalize(query).split(/\s+/).filter(Boolean),visible=new Set(),matched=new Set(),context=new Set();
  function walk(n,inherited=false){
    const text=normalize([n.name,n.materialId,n.spec?.grade,n.spec?.substance].filter(Boolean).join(' '));
    const own=tokens.length>0&&tokens.every(t=>text.includes(t)),include=inherited||own||!tokens.length;
    if(own)matched.add(n.id);
    let descendant=false;
    for(const child of n.children||[])if(walk(child,include))descendant=true;
    if(include||descendant){visible.add(n.id);if(!include)context.add(n.id);return true;}
    return false;
  }
  nodes.forEach(n=>walk(n));
  return {visible,matched,context};
}
const api={parseNumber,readPaste,searchTree,normalize};
if(typeof module!=='undefined')module.exports=api;else root.TPEntry=api;
})(typeof window!=='undefined'?window:globalThis);
