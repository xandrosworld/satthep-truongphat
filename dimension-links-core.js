/* Dimension dependencies use relative tree scopes; no eval and no cross-quote IDs. */
(function(root){'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const D=()=>typeof module!=='undefined'?require('./definition-core.js'):root.TPDefinitions;
const vectors={mm:[0,1],number:[0,0],'kg/m':[1,-1],'m²/m':[0,1]};
function fields(n){
  if(n.kind!=='material')return [...new Set(['L','W','H',...(n.kind==='product'?['T']:[]),...Object.keys(n.params||{})])].map(key=>({key,unit:'mm',fixed:false}));
  if(n.spec?.shapeDefinition)return n.spec.shapeDefinition.fields.map(f=>({key:f.key,unit:f.unit,fixed:f.mode==='fixed'}));
  const info=C.shapeInfo(n.spec),keys=[...info.fixed,...info.input];
  if(n.spec.shape==='sheet')for(const key of ['H','F'])if(new RegExp('\\b'+key+'\\b').test((n.ruleSpec?.width||'')+' '+(n.ruleSpec?.length||'')))keys.push(key);
  return [...new Set(keys)].map(key=>({key,unit:'mm',fixed:info.fixed.includes(key)}));
}
function data(n){return n.kind==='material'?(n.dims??={}):(n.params??={});}
function refs(path){const out={SELF:path.at(-1)};if(path.length>1)out.PARENT=path.at(-2);const product=path.slice(0,-1).reverse().find(n=>n.kind==='product');if(product)out.PRODUCT=product;for(let i=1;i<path.length;i++)out['A'+i]=path.at(-1-i);return out;}
function variables(path){return Object.entries(refs(path)).flatMap(([scope,n])=>fields(n).map(f=>({name:scope+'_'+f.key,node:n,key:f.key,unit:f.unit,label:scope+' · '+n.name+' / '+f.key})));}
function resolve(products){
  const all=C.flatten(products),paths=new Map(all.map(n=>[n.id,C.nodePath(products,n.id)])),state=new Map(),values=new Map(),errors=[],byNode={};
  function get(n,key){const token=n.id+':'+key;if(state.get(token)===1)throw Error('Vòng lặp phụ thuộc tại '+n.name+' / '+key);if(state.get(token)===2)return values.get(token);
    const f=fields(n).find(f=>f.key===key);if(!f)throw Error('Không có thông số '+key+' tại '+n.name);
    state.set(token,1);let value;const link=n.dimensionLinks?.[key];
    try{if(f.fixed){if(link)throw Error('Không được liên kết quy cách cố định '+key);value=n.spec.props[key];}
      else if(link){if(!['formula','fixed','manual'].includes(link.mode))throw Error('Chế độ kích thước không hợp lệ');
        if(link.mode==='formula'){const defs=variables(paths.get(n.id)),names=String(link.expression).match(/[A-Za-z_][A-Za-z_0-9]*/g)||[],vs={},ds={};for(const name of new Set(names)){const ref=defs.find(v=>v.name===name);if(!ref)throw Error('Không có biến '+name+' tại dòng này');vs[name]=get(ref.node,ref.key);ds[name]=vectors[ref.unit];}const dim=D().dimension(link.expression,ds),unit=vectors[f.unit];if(!dim.literal&&dim.d.some((v,i)=>v!==unit[i]))throw Error('Công thức '+key+' sai đơn vị '+f.unit);value=C.formula(link.expression,vs);}
        else value=link.mode==='fixed'?link.value:data(n)[key];
      }else if(n.paramLinks?.[key]){const p=paths.get(n.id).slice(0,-1).reverse().find(p=>p.kind==='product'&&p.params);if(!p)throw Error('Không còn sản phẩm nguồn của liên kết');value=get(p,n.paramLinks[key]);}
      else value=data(n)[key];
      if(value==null||value===''||!Number.isFinite(Number(value))||Number(value)<0||(['L','W','T'].includes(key)&&Number(value)===0)||key==='T'&&Number(value)>100000)throw Error('Thông số '+key+' cần số '+(['L','W','T'].includes(key)?'dương'+(key==='T'?', không quá 100.000 mm':''):'không âm'));
      value=Number(value);state.set(token,2);values.set(token,value);return value;
    }catch(e){state.delete(token);throw e;}
  }
  for(const n of all)for(const key of Object.keys(n.dimensionLinks||{}))try{const value=get(n,key);data(n)[key]=value;}catch(e){data(n)[key]=null;const message=n.name+' / '+key+': '+e.message;errors.push(message);(byNode[n.id]??=[]).push(message);}
  // Resolve old equality bindings after formula parents; never replace an explicit formula/fixed value.
  for(const n of all)for(const key of Object.keys(n.paramLinks||{}))if(!n.dimensionLinks?.[key])try{data(n)[key]=get(n,key);}catch(e){data(n)[key]=null;const message=n.name+' / '+key+': '+e.message;errors.push(message);(byNode[n.id]??=[]).push(message);}
  // A catalogue thickness is immutable. An explicit requirement checks the chosen
  // SKU against its product; it never writes T into the SKU or chooses a price.
  const thickness=[];
  for(const n of all)if(n.thicknessRequirement){const entry={nodeId:n.id,materialId:n.materialId,actual:n.spec?.props?.T,mode:n.thicknessRequirement.mode};
    try{const x=n.thicknessRequirement,f=fields(n).find(f=>f.key==='T');
      if(n.kind!=='material'||!f?.fixed||f.unit!=='mm')throw Error('Chỉ đối chiếu Dày cố định (mm) của mã vật tư');
      if(!['product','independent'].includes(x.mode)||!String(x.reason||'').trim())throw Error('Cần khai phạm vi Dày và lý do');
      if(x.mode==='product'){const product=refs(paths.get(n.id)).PRODUCT;if(!product)throw Error('Không còn sản phẩm nguồn của Dày');entry.productId=product.id;entry.expected=get(product,'T');entry.actual=get(n,'T');
        if(Math.abs(entry.actual-entry.expected)>1e-9)throw Error('Dày yêu cầu PRODUCT_T = '+entry.expected+' mm; mã '+n.materialId+' đang '+entry.actual+' mm. Chọn mã phù hợp hoặc khai dùng độ dày riêng có lý do');
      }else entry.actual=get(n,'T');
      entry.valid=true;
    }catch(e){entry.valid=false;entry.error=n.name+' / Dày: '+e.message;errors.push(entry.error);(byNode[n.id]??=[]).push(entry.error);}
    thickness.push(entry);
  }
  for(const n of all)if(n.kind==='product'&&!byNode[n.id])C.formatName(n);
  return {errors:[...new Set(errors)],byNode,thickness};
}
function setThicknessRequirement(q,id,entry,actor){
  if(['submitted','approved'].includes(q.status))throw Error('Bản đã khóa; tạo bản sửa trước');
  const n=C.findNode(q.products,id),f=n&&fields(n).find(f=>f.key==='T');
  if(n?.kind!=='material'||!f?.fixed||f.unit!=='mm')throw Error('Dòng này không có Dày cố định (mm)');
  const next={mode:entry.mode,reason:String(entry.reason||'').trim()};
  if(!['product','independent'].includes(next.mode)||!next.reason)throw Error('Chọn phạm vi Dày và ghi lý do');
  n.thicknessHistory??=[];n.thicknessHistory.push({before:C.copy(n.thicknessRequirement||null),after:C.copy(next),actor:actor||'Phiên trình duyệt (chưa xác thực)',at:new Date().toISOString(),revision:n.thicknessHistory.length+1});n.thicknessRequirement=next;
  return resolve(C.copy(q.products)).thickness.find(x=>x.nodeId===id);
}
function set(products,id,key,entry,actor){const n=C.findNode(products,id),f=n&&fields(n).find(f=>f.key===key);if(!f||f.fixed)throw Error('Chỉ sửa thông số nhập của dòng, không sửa quy cách cố định');
  const trial=C.copy(products),target=C.findNode(trial,id),next=C.copy(entry);target.dimensionLinks??={};target.dimensionLinks[key]=next;if(next.mode==='manual')data(target)[key]=next.value;delete target.paramLinks?.[key];const check=resolve(trial),previousErrors=new Set(resolve(C.copy(products)).errors);const blocking=check.errors.filter(e=>check.byNode[id]?.includes(e)||!previousErrors.has(e));if(blocking.length)throw Error(blocking.join('; '));
  const before=n.dimensionLinks?.[key]||{mode:n.paramLinks?.[key]?'legacy':'manual',value:data(n)[key],parameter:n.paramLinks?.[key]};n.dimensionHistory??=[];n.dimensionHistory.push({key,before:C.copy(before),after:next,at:new Date().toISOString(),actor:actor||'Phiên trình duyệt (chưa xác thực)',revision:n.dimensionHistory.length+1});n.dimensionLinks??={};n.dimensionLinks[key]=next;if(next.mode==='manual')data(n)[key]=next.value;delete n.paramLinks?.[key];n.detached=true;resolve(products);
}
const api={fields,data,variables,resolve,set,setThicknessRequirement};C.dimensionLinks=api;
if(typeof module!=='undefined')module.exports=api;else root.TPDimensions=api;
})(typeof window!=='undefined'?window:globalThis);
