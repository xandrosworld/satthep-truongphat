/* Quote engine evolved from index (1).html. No browser or network dependency. */
(function(root){
'use strict';
const MAX_PHYSICAL_PIECES=100000;
const copy=x=>JSON.parse(JSON.stringify(x));
let serial=0;
const uid=()=> 'n'+Date.now().toString(36)+(++serial).toString(36);
const groups=['Phôi gia công','Linh kiện, thiết bị','Tiêu hao sản xuất','Vật tư phụ','Dầu mỡ, hóa chất','Hoàn thiện bề mặt'];
const shapes={sheet:{name:'Tấm',fixed:['T'],input:['L','W']},box:{name:'Hộp',fixed:['W','H','T'],input:['L']},pipe:{name:'Ống',fixed:['D','T'],input:['L']},round:{name:'Tròn đặc',fixed:['D'],input:['L']},solid:{name:'Vuông đặc',fixed:['W','H'],input:['L']},angle:{name:'Thép góc L / V',fixed:['W','H','T'],input:['L']},piece:{name:'Theo đơn vị',fixed:[],input:[]}};
Object.assign(shapes,{profile:{name:'Thép hình theo bảng tra',fixed:[],input:['L']},u:{name:'Thép U',fixed:['W','H','T'],input:['L']},c:{name:'Thép C (không mép gấp)',fixed:['W','H','T'],input:['L']},h:{name:'Thép H',fixed:['W','H','T','TF'],input:['L']},i:{name:'Thép I',fixed:['W','H','T','TF'],input:['L']}});
// Recursive-descent arithmetic only. Never execute user formulas as JavaScript.
function formulaNames(source){return root.TPFormulaAccess?.isRef(source)?root.TPFormulaAccess.names(source):(String(source||'').match(/[A-Za-z_][A-Za-z_0-9]*/g)||[]);}
function formula(source,vars){
  if(root.TPFormulaAccess?.isRef(source))return root.TPFormulaAccess.evaluate(source,vars);
  if(String(source).length>500)throw Error('Công thức tối đa 500 ký tự');
  let nesting=0;for(const ch of String(source)){if(ch==='('&&++nesting>20)throw Error('Công thức lồng ngoặc quá sâu');if(ch===')')nesting--;}
  const tokens=String(source).match(/(?:\d+(?:\.\d*)?|\.\d+)|[A-Za-z_][A-Za-z_0-9]*|[()+\-*/]/g)||[];
  if(tokens.join('')!==String(source).replace(/\s/g,''))throw Error('Công thức chứa ký tự không hỗ trợ');
  let pos=0;
  function atom(){const t=tokens[pos++];if(t==='+'||t==='-')return (t==='-'?-1:1)*atom();if(t==='('){const r=expr();if(tokens[pos++]!==')')throw Error('Thiếu dấu đóng ngoặc');return r;}if(t===undefined)throw Error('Công thức chưa hoàn chỉnh');if(/^\d|^\./.test(t))return Number(t);if(Object.hasOwn(vars,t))return Number(vars[t]);throw Error('Tham số không hợp lệ: '+t);}
  function term(){let r=atom();while(tokens[pos]==='*'||tokens[pos]==='/'){const op=tokens[pos++],v=atom();if(op==='/'&&v===0)throw Error('Không thể chia cho 0');r=op==='*'?r*v:r/v;}return r;}
  function expr(){let r=term();while(tokens[pos]==='+'||tokens[pos]==='-'){const op=tokens[pos++],v=term();r=op==='+'?r+v:r-v;}return r;}
  const result=expr();if(pos!==tokens.length||!Number.isFinite(result))throw Error('Công thức không hợp lệ');return result;
}
function seed(){
  const material=(id,name,group,shape,props,price,unit='kg',substance='Thép',grade='CT3',density=7850)=>({id,name,group,shape,props,price,unit,substance,grade,density,characteristic:'Cán nóng',stockL:shape==='sheet'?2440:6000,stockW:1220});
  const materials=[material('PH-T15','Thép CT3 tấm dày 1,5 mm',groups[0],'sheet',{T:1.5},19500),material('PH-T20','Thép CT3 tấm dày 2 mm',groups[0],'sheet',{T:2},19800),material('PH-H402','Thép hộp 40 × 40 × 2 mm',groups[0],'box',{W:40,H:40,T:2},20500),material('PH-O602','Ống thép Ø60 × 2 mm',groups[0],'pipe',{D:60,T:2},21500),material('PH-I15','Inox 304 tấm dày 1,5 mm',groups[0],'sheet',{T:1.5},72000,'kg','Inox','SUS304',7930),material('LK-M8','Bu lông M8 × 25, kèm đai ốc',groups[1],'piece',{},4200,'bộ'),material('LK-CHAN','Chân tăng chỉnh M16',groups[1],'piece',{},85000,'cái'),material('TH-DAY','Dây hàn MIG Ø1 mm',groups[2],'piece',{},38000,'kg'),material('VP-GIOANG','Gioăng cao su chống rung',groups[3],'piece',{},18000,'m'),material('DM-DAU','Dầu cắt gọt pha nước',groups[4],'piece',{},65000,'lít'),material('BM-SON','Bột sơn tĩnh điện RAL 7035',groups[5],'piece',{},92000,'kg')];
  Object.assign(materials.find(m=>m.id==='LK-M8'),{grade:'8.8',characteristic:'Mạ kẽm'});
  Object.assign(materials.find(m=>m.id==='LK-CHAN'),{grade:'C45',characteristic:'Chân ren điều chỉnh'});
  Object.assign(materials.find(m=>m.id==='TH-DAY'),{grade:'ER70S-6',characteristic:'Dây hàn'});
  Object.assign(materials.find(m=>m.id==='VP-GIOANG'),{substance:'Cao su',grade:'EPDM',characteristic:'Chống rung',density:1200});
  Object.assign(materials.find(m=>m.id==='DM-DAU'),{substance:'Dầu cắt gọt',grade:'Pha nước',characteristic:'Làm mát',density:850});
  Object.assign(materials.find(m=>m.id==='BM-SON'),{substance:'Sơn bột',grade:'RAL 7035',characteristic:'Sơn tĩnh điện',density:1500});
  const rules=[{id:'flat',name:'Tấm phẳng',shape:'sheet',length:'L',width:'W'},{id:'tray',name:'Thân máng chấn gấp mép',shape:'sheet',length:'L',width:'W + 2 * H + 2 * F'},{id:'cover',name:'Nắp máng gấp mép',shape:'sheet',length:'L',width:'W + 2 * F'},{id:'bar',name:'Thanh cắt theo chiều dài',shape:'bar',length:'L',width:'0'}];
  const rates=[{id:'cut',name:'Cắt phôi',unit:'kg',inside:4500,outside:6000},{id:'bend',name:'Chấn / uốn',unit:'lần',inside:7500,outside:10000},{id:'weld',name:'Hàn lắp',unit:'m',inside:35000,outside:48000},{id:'paint',name:'Sơn tĩnh điện',unit:'m²',inside:95000,outside:110000},{id:'pack',name:'Lắp ráp, đóng gói',unit:'bộ',inside:25000,outside:35000}];
  const op=(id,amount=1)=>({id,mode:'inside',amount});
  function line(id,qty,dims={},rule='flat'){const m=materials.find(m=>m.id===id);return {id:uid(),kind:'material',materialId:id,name:m.name,qty,dims:{L:2000,W:300,H:50,F:15,...dims},rule:m.shape==='sheet'?rule:'bar',spec:copy(m),ruleSpec:copy(rules.find(r=>r.id===(m.shape==='sheet'?rule:'bar'))),ops:[]};}
  const body={id:uid(),kind:'component',name:'Thân máng cáp',qty:1,children:[line('PH-T15',1,{},'tray')],ops:[op('cut'),op('bend',4),op('paint')]};
  const lid={id:uid(),kind:'component',name:'Nắp máng cáp',qty:1,children:[line('PH-T15',1,{H:0},'cover')],ops:[op('cut'),op('bend',2),op('paint')]};
  const support={id:uid(),kind:'product',name:'Bộ giá đỡ',qty:1,model:'frame',children:[line('PH-H402',2,{L:500}),line('LK-M8',4)],ops:[op('weld',0.3)]};
  const tray={id:uid(),kind:'product',name:'Máng cáp 300 × 50, dài 2.000 mm',qty:12,unit:'bộ',model:'tray',children:[body,lid,line('LK-M8',8),line('VP-GIOANG',0.6)],ops:[op('pack')],transport:30000,install:55000};
  const frame={id:uid(),kind:'product',name:'Khung máy 1.200 × 600 × 800 mm',qty:2,unit:'bộ',model:'frame',children:[{id:uid(),kind:'component',name:'Khung thép hộp',qty:1,children:[line('PH-H402',4,{L:800}),line('PH-H402',4,{L:1200}),line('PH-H402',4,{L:600})],ops:[op('weld',2),op('paint')]},line('LK-CHAN',4)],ops:[op('pack')],transport:150000,install:250000};
  configureProduct(tray);configureProduct(frame);
  return {version:2,materials,rules,rates,library:[{...copy(body),templateKind:'component'},{...copy(lid),templateKind:'component'},{...copy(tray),qty:1,templateKind:'product'},{...copy(frame),qty:1,templateKind:'product'},{...copy(support),templateKind:'product'}],quote:{id:'BG-2026-0909',customer:'CÔNG TY TNHH KỸ THUẬT MINH PHÁT',project:'Hệ thống máng cáp & khung máy',date:'2026-09-09',valid:15,status:'draft',margin:12,vat:10,overhead:5,kerf:3,notes:'Thời gian giao hàng: 15 ngày từ khi xác nhận. Thanh toán: 50% tạm ứng, 50% khi bàn giao.',products:[tray,frame],ratesSnapshot:copy(rates)},history:[]};
}
function cloneNode(node){const n=copy(node),ids=new Map();if(node.templateKind){n.templateId=node.id;delete n.uses;}function walk(x){const oldId=x.id;x.id=uid();ids.set(oldId,x.id);for(const op of x.ops||[])op.instanceId=uid();if(x.children)x.children.forEach(walk);}walk(n);for(const x of flatten([n]))for(const entry of x.tmcBreakdown||[]){if(ids.has(entry.nodeId))entry.nodeId=ids.get(entry.nodeId);if(entry.id)entry.id=uid();}return n;}
function findNode(products,id){for(const n of products){if(n.id===id)return n;const hit=n.children&&findNode(n.children,id);if(hit)return hit;}return null;}
function removeNode(nodes,id){const i=nodes.findIndex(n=>n.id===id);if(i>=0){nodes.splice(i,1);return true;}return nodes.some(n=>n.children&&removeNode(n.children,id));}
function section(m){const p=m.props,{W=0,H=0,T=0,D=0,TF=T}=p;switch(m.shape){case 'profile':return {cross:0,perimeter:0};case 'box':if(2*T>=Math.min(W,H))throw Error('Chiều dày hộp phải nhỏ hơn nửa tiết diện');return {cross:W*H-(W-2*T)*(H-2*T),perimeter:2*(W+H)};case 'pipe':if(2*T>=D)throw Error('Chiều dày ống phải nhỏ hơn nửa đường kính');return {cross:Math.PI*(D*D-(D-2*T)**2)/4,perimeter:Math.PI*D};case 'round':return {cross:Math.PI*D*D/4,perimeter:Math.PI*D};case 'solid':return {cross:W*H,perimeter:2*(W+H)};case 'angle':return {cross:T*(W+H-T),perimeter:2*(W+H)};case 'u':case 'c':if(T>=W||2*T>=H)throw Error('Chiều dày vượt tiết diện');return {cross:T*(2*W+H-2*T),perimeter:4*W+2*H-2*T};case 'h':case 'i':if(T>=W||2*TF>=H)throw Error('Chiều dày bụng/cánh vượt tiết diện');return {cross:2*W*TF+(H-2*TF)*T,perimeter:4*W+2*H-2*T};default:throw Error('Hình dạng chưa được hỗ trợ');}}
// Declared profile mass is kg/m for bars, kg/m² for sheets, applied to both phôi and purchased stock.
function materialMass(m){
  const x=m.massOverride;if(!x){if(m.shape==='profile'&&!m.shapeDefinition)throw Error('Thép hình cần khai kg/m theo bảng tra');return m.shapeDefinition?definitions().coefficients(m).mass:m.shape==='sheet'?m.props.T/1000*m.density:section(m).cross*1e-6*m.density;}
  if(!String(x.reason||'').trim())throw Error('Khối lượng phôi đặc thù cần ghi căn cứ');
  const vars={...m.props,RHO:m.density};for(const [key,value]of Object.entries(x.vars||{})){if(!/^[A-Za-z_][A-Za-z_0-9]*$/.test(key)||Object.hasOwn(vars,key)||['__proto__','constructor','prototype'].includes(key)||!Number.isFinite(Number(value)))throw Error('Biến khối lượng phôi không hợp lệ');vars[key]=Number(value);}
  const value=x.formula?formula(x.formula,vars):Number(x.value);if(x.value===null&&!x.formula||!Number.isFinite(value)||value<=0)throw Error('Khối lượng phôi đặc thù phải lớn hơn 0');return value;
}
function materialSurface(m){
  if(m.areaOverride){const x=m.areaOverride;if(!String(x.reason||'').trim()||!Number.isFinite(x.value)||x.value<=0)throw Error('Diện tích trên mét cần giá trị dương và căn cứ');return x.value;}
  if(m.shapeDefinition)return definitions().coefficients(m).surface;
  if(m.shape==='profile')throw Error('Thép hình cần khai m²/m theo bảng tra');
  return section(m).perimeter/1000;
}
function remnantRuleKey(m){return JSON.stringify([m.id,m.brand||'',m.shape]);}
function remnantEligibility(m,r,rule){
  if(!rule)return null;
  if(!Number.isFinite(rule.minL)||rule.minL<=0||(m.shape==='sheet'&&(!Number.isFinite(rule.minW)||rule.minW<=0)))throw Error('Ngưỡng phần dư phải là kích thước dương theo mm');
  return m.shape==='sheet'?Math.max(r.l,r.w)>=Math.max(rule.minL,rule.minW)&&Math.min(r.l,r.w)>=Math.min(rule.minL,rule.minW):r.l>=rule.minL;
}
function definitions(){return typeof module!=='undefined'?require('./definition-core.js'):root.TPDefinitions;}
function shapeInfo(m){return m.shapeDefinition?definitions().info(m):shapes[m.shape];}
function geometry(n,count){
  if(n.draftMaterial&&!n.materialId)throw Error('Vật tư chưa chọn mã; mở Chọn / hoàn tất vật tư để khai báo');
  if(n.draftMaterial)throw Error('Vật tư chưa được xác nhận trong danh mục chung; mở Chọn / hoàn tất vật tư để xác nhận khai báo vật tư');
  if(n.productionBlank){
    const b=n.productionBlank,g=geometry({...n,productionBlank:null},count),sheet=n.spec.shape==='sheet';
    if(!Number.isFinite(b.length)||b.length<=0||b.length>1e7||sheet&&(!Number.isFinite(b.width)||b.width<=0||b.width>1e7)||!g.length)throw Error('Kích thước khai triển nhập tay không hợp lệ');
    const sx=b.length/g.length,sy=sheet?b.width/g.width:1,ratio=sx*sy;
    return {...g,length:b.length,width:sheet?b.width:0,...Object.fromEntries(['weight','area','volume','blankArea','measure'].filter(k=>g[k]!==undefined).map(k=>[k,g[k]*ratio])),...(g.polygon?{polygon:g.polygon.map(([x,y])=>[x*sx,y*sy])}: {})};
  }
  if(n.spec?.shapeDefinition)return definitions().geometry(n,count);
  const m=n.spec,vars={...n.dims,...m.props},rule=n.ruleSpec;
  if(!(count>0)&&count!==0)throw Error('Số lượng không hợp lệ');
  if(m.shape==='piece'){const mass=n.pieceMass;if(mass&&(!['manual','skip'].includes(mass.mode)||typeof mass.reason!=='string'||!mass.reason.trim()||mass.reason.length>500))throw Error('Khối lượng vật tư cần cách khai và căn cứ hợp lệ');if(mass?.mode==='manual'&&(!Number.isFinite(mass.value)||mass.value<=0))throw Error('Khối lượng mỗi đơn vị phải là số dương');return {length:0,width:0,weight:mass?.mode==='manual'?mass.value*count:0,area:0,volume:0,blankArea:0,quantity:count,measure:count};}
  for(const k of shapes[m.shape].fixed)if(!(m.props[k]>0))throw Error('Thiếu kích thước vật tư '+k);
  const length=formula(rule.length,vars),width=m.shape==='sheet'?formula(rule.width,vars):0;
  if(!(length>0)||(m.shape==='sheet'&&!(width>0)))throw Error('Kích thước khai triển phải lớn hơn 0');
  if(m.shape==='sheet'){const blankArea=length*width/1e6*count;return {length,width,blankArea,area:blankArea*2,volume:blankArea*m.props.T/1000,weight:blankArea*materialMass(m),quantity:count,measure:blankArea};}
  const sec=section(m),meters=length/1000*count;return {length,width:0,blankArea:materialSurface(m)*meters,area:materialSurface(m)*meters,volume:m.shape==='profile'?materialMass(m)*meters/m.density:sec.cross*1e-6*meters,weight:materialMass(m)*meters,quantity:count,measure:meters};
}
// Deterministic first-fit decreasing, guillotine split for rectangles. Kerf reserved per cut.
function nest(items,spec,kerf,strategy='best'){
  if(spec.shape==='sheet'&&spec.shapeDefinition?.nesting==='circle')return nestCircles(items,spec,kerf);
  if(spec.shape==='sheet'&&spec.shapeDefinition?.nesting==='right-triangle')return nestTriangles(items,spec,kerf,strategy);
  if(strategy==='best'&&spec.shape==='sheet'&&items.length>1){const descending=nest(items,spec,kerf,'descending');if(items.reduce((s,r)=>s+r.count,0)>1000)return descending;const mixed=nest(items,spec,kerf,'mixed');return mixed.stocks.length<descending.stocks.length?mixed:descending;}
  const isSheet=spec.shape==='sheet',rotateAllowed=spec.shapeDefinition?.nesting!=='bounding-fixed',stockL=Number(spec.stockL),stockW=isSheet?Number(spec.stockW):0;
  if(!(stockL>0)||isSheet&&!(stockW>0))throw Error('Khổ vật tư mua chưa hợp lệ: '+(!(stockL>0)?'chưa nhập chiều dài khổ mua lớn hơn 0 mm':'')+(isSheet&&!(stockW>0)?(!(stockL>0)?'; ':'')+'chưa nhập chiều rộng khổ mua lớn hơn 0 mm':'')+'. Mở Khai triển & hao hụt → Chỉnh khổ mua.');
  if(!(kerf>=0))throw Error('Mạch cắt không hợp lệ');
  const pieces=[];
  for(const row of items){if(!Number.isInteger(row.count)||row.count<1)throw Error('Số phôi phải là số nguyên dương');if(pieces.length+row.count>MAX_PHYSICAL_PIECES)throw Error('Tối đa 100.000 phôi cho mỗi mã vật tư');for(let i=0;i<row.count;i++)pieces.push({rowId:row.id,label:row.label,l:row.geometry.length,w:row.geometry.width,color:row.color,...(row.geometry.polygon?{polygon:row.geometry.polygon}:{})});}
  if(strategy==='mixed'){const queues=items.map(r=>pieces.filter(p=>p.rowId===r.id)),mixed=[];for(let i=0;queues.some(q=>q.length>i);i++)for(const q of queues)if(q[i])mixed.push(q[i]);pieces.splice(0,pieces.length,...mixed);}else pieces.sort((a,b)=>(isSheet?b.l*b.w-a.l*a.w:b.l-a.l));
  const stocks=[];
  // First-fit lookup for bars stays logarithmic even when every cut needs a new stock.
  let treeSize=1;while(treeSize<pieces.length)treeSize*=2;
  const remainingTree=isSheet?null:new Float64Array(treeSize*2);
  function updateRemaining(index,value){let k=treeSize+index;remainingTree[k]=value;while(k>1){k>>=1;remainingTree[k]=Math.max(remainingTree[k*2],remainingTree[k*2+1]);}}
  function firstFit(length){if(remainingTree[1]<length)return -1;let k=1;while(k<treeSize)k=remainingTree[k*2]>=length?k*2:k*2+1;return k-treeSize;}
  const activeSheets=new Set(),minSide=isSheet?pieces.reduce((m,p)=>Math.min(m,p.l,p.w),Infinity):0;
  for(const p of pieces){if(isSheet?!((p.l<=stockL&&p.w<=stockW)||(rotateAllowed&&p.w<=stockL&&p.l<=stockW)):p.l>stockL)throw Error('Chi tiết '+p.label+' vượt khổ vật tư mua');
    if(!isSheet){let si=firstFit(p.l);if(si<0){si=stocks.length;stocks.push({placements:[],remaining:stockL});}const stock=stocks[si],x=stockL-stock.remaining;stock.placements.push({...p,x,y:0});stock.remaining=Math.max(0,stock.remaining-p.l-kerf);updateRemaining(si,stock.remaining);continue;}
    let chosen=null;
    for(const si of activeSheets){const s=stocks[si];for(let fi=0;fi<s.free.length;fi++){const f=s.free[fi];for(const rotate of (rotateAllowed?[false,true]:[false])){const l=rotate?p.w:p.l,w=rotate?p.l:p.w;if(l<=f.l&&w<=f.w){const score=f.l*f.w-l*w;if(!chosen||score<chosen.score)chosen={si,fi,l,w,score,rotate};}}}if(chosen)break;}
    if(!chosen){stocks.push({placements:[],free:[{x:0,y:0,l:stockL,w:stockW}]});activeSheets.add(stocks.length-1);const rotate=p.l>stockL||p.w>stockW;chosen={si:stocks.length-1,fi:0,rotate,l:rotate?p.w:p.l,w:rotate?p.l:p.w};}
    const s=stocks[chosen.si],f=s.free.splice(chosen.fi,1)[0],{l,w}=chosen;
    s.placements.push({...p,l,w,x:f.x,y:f.y,...(p.polygon?{polygon:p.polygon.map(([x,y])=>chosen.rotate?[f.x+p.w-y,f.y+x]:[f.x+x,f.y+y])}:{})});
    if(f.l-l-kerf>0)s.free.push({x:f.x+l+kerf,y:f.y,l:f.l-l-kerf,w});
    if(f.w-w-kerf>0)s.free.push({x:f.x,y:f.y+w+kerf,l:f.l,w:f.w-w-kerf});
    if(!s.free.some(r=>r.l>=minSide&&r.w>=minSide))activeSheets.delete(chosen.si);
  }
  const used=pieces.reduce((s,p)=>s+(isSheet?p.l*p.w:p.l),0),purchased=stocks.length*(isSheet?stockL*stockW:stockL);
  const netUsed=isSheet&&items.some(r=>r.geometry.polygon)?items.reduce((sum,r)=>sum+r.geometry.blankArea*1e6,0):undefined;
  return {stocks,stockL,stockW,used,purchased,...(netUsed!==undefined?{netUsed,contourOffcut:Math.max(0,used-netUsed)}:{}),util:purchased?(netUsed??used)/purchased:0};
}
// Compare a rectangular baseline with regular/staggered circle rows in both orientations.
// Different diameters can share the baseline; staggered alternatives keep diameter batches separate.
// No global optimum is claimed. Only the exterior rectangular strips are reusable remnants.
function nestCircles(items,spec,kerf){
 const stockL=Number(spec.stockL),stockW=Number(spec.stockW),buckets=new Map();let count=0;
 if(!Number.isFinite(stockL)||!Number.isFinite(stockW)||stockL<=0||stockW<=0||!Number.isFinite(kerf)||kerf<0)throw Error('Khổ tấm hoặc mạch cắt chưa hợp lệ');
 for(const row of items){const d=row.geometry.length;if(!Number.isFinite(d)||d<=0||Math.abs(d-row.geometry.width)>1e-8||!Number.isInteger(row.count)||row.count<1)throw Error('Đường kính hoặc số tấm tròn chưa hợp lệ');if(d>Math.min(stockL,stockW))throw Error('Tấm tròn vượt khổ vật tư mua');if((count+=row.count)>MAX_PHYSICAL_PIECES)throw Error('Tối đa 100.000 phôi cho mỗi mã vật tư');if(!buckets.has(d))buckets.set(d,[]);for(let i=0;i<row.count;i++)buckets.get(d).push({rowId:row.id,label:row.label,color:row.color,l:d,w:d,circle:true});}
 const plain={...spec,shapeDefinition:{...spec.shapeDefinition,nesting:'bounding'}},baseline=nest(items,plain,kerf);
 for(const stock of baseline.stocks)for(const p of stock.placements)p.circle=true;
 const stocks=[];let used=0;
 for(const [d,pieces] of buckets){
  const patterns=[];
  for(const rotated of [false,true])for(const staggered of [false,true])for(const phase of (staggered?[0,1]:[0])){
   const l=rotated?stockW:stockL,w=rotated?stockL:stockW,pitch=d+kerf,dy=staggered?pitch*Math.sqrt(3)/2:pitch,points=[];
   for(let row=0;row<5000&&row*dy+d<=w+1e-8&&points.length<pieces.length;row++){
    const offset=staggered?(row+phase)%2*pitch/2:0;
    for(let col=0;col<5000&&offset+col*pitch+d<=l+1e-8&&points.length<pieces.length;col++)points.push(rotated?{x:row*dy,y:offset+col*pitch}:{x:offset+col*pitch,y:row*dy});
   }
   if(points.length)patterns.push(points);
  }
  let best=null;
  for(const points of patterns){const option=[];let area=0;
   for(let start=0;start<pieces.length;start+=points.length){const placements=pieces.slice(start,start+points.length).map((piece,i)=>({...piece,...points[i]})),l=Math.max(...placements.map(p=>p.x+d)),w=Math.max(...placements.map(p=>p.y+d)),free=[];
    if(stockL-l-kerf>1e-8)free.push({x:l+kerf,y:0,l:stockL-l-kerf,w});
    if(stockW-w-kerf>1e-8)free.push({x:0,y:w+kerf,l:stockL,w:stockW-w-kerf});
    option.push({placements,free});area+=l*w;
   }
   if(!best||option.length<best.stocks.length||option.length===best.stocks.length&&area<best.used)best={stocks:option,used:area};
  }
  stocks.push(...best.stocks);used+=best.used;
 }
 const chosen=stocks.length<baseline.stocks.length||stocks.length===baseline.stocks.length&&used<baseline.used?{stocks,used,stockL,stockW,purchased:stocks.length*stockL*stockW}:baseline;
 const netUsed=items.reduce((sum,r)=>sum+Math.PI*r.geometry.length**2/4*r.count,0);
 return {...chosen,util:chosen.purchased?netUsed/chosen.purchased:0,netUsed,circleOffcut:Math.max(0,chosen.used-netUsed),mode:'circle',boundingStockCount:baseline.stocks.length,boundingPurchased:baseline.purchased};
}
// Explicitly declared right triangles only. Pair by 180-degree rotation, never mirror.
// The separating hypotenuses are kerf mm apart; rectangular packing handles outer cuts.
function nestTriangles(items,spec,kerf,strategy){
  if(!Number.isFinite(kerf)||kerf<0)throw Error('Mạch cắt không hợp lệ');
  const buckets=new Map();let count=0;
  for(const row of items){
    const {length:l,width:w}=row.geometry;
    if(!Number.isFinite(l)||!Number.isFinite(w)||l<=0||w<=0||!Number.isInteger(row.count)||row.count<1)throw Error('Kích thước và số tam giác chưa hợp lệ');
    if((count+=row.count)>MAX_PHYSICAL_PIECES)throw Error('Tối đa 100.000 phôi cho mỗi mã vật tư');
    const key=JSON.stringify([l,w,row.geometry.polygon]);if(!buckets.has(key))buckets.set(key,[]);
    for(let i=0;i<row.count;i++)buckets.get(key).push({rowId:row.id,label:row.label,color:row.color,l,w,...(row.geometry.polygon?{polygon:row.geometry.polygon}:{})});
  }
  const plain={...spec,shapeDefinition:{...spec.shapeDefinition,nesting:'bounding'}};
  function arrange(pair){
    const blocks=[];
    for(const pieces of buckets.values())for(let i=0;i<pieces.length;){
      const first=pieces[i++],{l,w}=first,h=Math.hypot(l,w),dx=kerf*w/h,dy=kerf*l/h;
      const fits=(l+dx<=spec.stockL&&w+dy<=spec.stockW)||(w+dy<=spec.stockL&&l+dx<=spec.stockW);
      const second=pair&&i<pieces.length&&fits?pieces[i++]:null;
      const base=first.polygon||[[0,0],[l,0],[0,w]],right=base.find(a=>base.some(b=>b!==a&&Math.abs(a[0]-b[0])<1e-7)&&base.some(b=>b!==a&&Math.abs(a[1]-b[1])<1e-7)),sx=right&&right[0]>l/2?-1:1,sy=right&&right[1]>w/2?-1:1;
      const points=[base.map(([x,y])=>[x+(second&&sx<0?dx:0),y+(second&&sy<0?dy:0)])];
      if(second)points.push(base.map(([x,y])=>[l-x+(sx>0?dx:0),w-y+(sy>0?dy:0)]));
      const members=second?[first,second]:[first];
      blocks.push({id:'triangle-block-'+blocks.length,label:first.label,count:1,color:first.color,geometry:{length:l+(second?dx:0),width:w+(second?dy:0)},members,points});
    }
    const layout=nest(blocks,plain,kerf,strategy),lookup=new Map(blocks.map(b=>[b.id,b]));
    for(const stock of layout.stocks)stock.placements=stock.placements.flatMap(p=>{
      const block=lookup.get(p.rowId),rotated=Math.abs(p.l-block.geometry.length)>1e-8||Math.abs(p.w-block.geometry.width)>1e-8;
      return block.members.map((piece,i)=>{
        const polygon=block.points[i].map(([x,y])=>rotated?[p.x+block.geometry.width-y,p.y+x]:[p.x+x,p.y+y]);
        const xs=polygon.map(v=>v[0]),ys=polygon.map(v=>v[1]);
        return {...piece,x:Math.min(...xs),y:Math.min(...ys),l:Math.max(...xs)-Math.min(...xs),w:Math.max(...ys)-Math.min(...ys),polygon,pairId:block.members.length===2?block.id:null};
      });
    });
    const netUsed=items.reduce((sum,r)=>sum+r.geometry.length*r.geometry.width/2*r.count,0),pairCount=blocks.filter(b=>b.members.length===2).length;
    const internalAllowance=blocks.filter(b=>b.members.length===2).reduce((sum,b)=>sum+b.geometry.length*b.geometry.width-b.members[0].l*b.members[0].w,0);
    return {...layout,netUsed,pairCount,singleCount:count-2*pairCount,internalAllowance,triangleOffcut:Math.max(0,layout.used-netUsed-internalAllowance),mode:'right-triangle'};
  }
  const baseline=arrange(false),paired=arrange(true),chosen=paired.stocks.length<baseline.stocks.length||paired.stocks.length===baseline.stocks.length&&paired.used<baseline.used?paired:baseline;
  return {...chosen,boundingStockCount:baseline.stocks.length,boundingPurchased:baseline.purchased};
}
function materialEstimate(n,g){
  if(!n.materialEstimate)return null;
  const {method,percent,basis:lossBasis}=n.materialEstimate;const consumed=lossBasis==='consumed';if(lossBasis!==undefined&&!consumed)throw Error('Cách tính hao hụt chưa hợp lệ');
  if(!['net','percent'].includes(method)||!Number.isFinite(percent)||percent<0||(consumed?percent>=100:percent>100)||method==='net'&&percent!==0)throw Error(consumed?'Hao hụt phải từ 0 đến dưới 100%; theo phôi dùng 0%':'Hao hụt dự tính phải từ 0 đến 100%; theo phôi dùng 0%');
  const multiplier=consumed?1/(1-percent/100):1+percent/100;
  if(n.spec.shape==='piece'){const basis=g.quantity*multiplier;return {method,percent,basis,quantity:basis,measure:basis,weight:g.weight*multiplier,area:0,unit:n.spec.unit,cost:basis*n.spec.price};}
  const weight=g.weight*multiplier,area=g.blankArea*multiplier,m=n.spec,measure=(m.shape==='sheet'?g.blankArea:g.measure)*multiplier;
  const basis=m.unit==='kg'?weight:m.unit==='m²'&&m.shape==='sheet'||m.unit==='m'&&m.shape!=='sheet'?measure:null;
  if(basis===null)throw Error('Dự tính theo phôi cần đơn giá kg, m² tấm hoặc m dài; khai đơn vị giá phù hợp trước');
  return {method,percent,weight,area,measure,basis,unit:m.unit,cost:basis*m.price};
}
function calculate(db){
  const linked=flatten(db.quote.products).some(n=>Object.keys(n.dimensionLinks||{}).length||n.thicknessRequirement);const q=linked?copy(db.quote):db.quote;const dependency=linked?(api.dimensionLinks||(typeof module!=='undefined'?require('./dimension-links-core.js'):null)).resolve(q.products):{errors:[],byNode:{}};
  const rows=[],nodes={},errors=[...dependency.errors],colors=['#3568aa','#518782','#ad8654','#8574a9','#6083a1','#9a6979'];
  for(const n of flatten(q.products))if(n.kind==='product'&&n.params?.T!=null&&(!Number.isFinite(n.params.T)||n.params.T<=0||n.params.T>100000))errors.push(n.name+': Dày chung T phải là số dương, không quá 100.000 mm');
  function visit(n,mult,product,path,covered=null){const count=mult*n.qty;if(!(n.qty>0))errors.push(n.name+': số lượng phải lớn hơn 0');if(q.pricing&&!covered&&n.outsource?.enabled)covered=n;const record={node:n,count,weight:0,area:0,volume:0,material:0,ops:0,transport:0,install:0,productId:product.id,...(covered?{coveredBy:covered.id,packageOwner:covered.id===n.id}: {})};nodes[n.id]=record;if(dependency.byNode[n.id])record.declarationErrors=[...dependency.byNode[n.id]];
    if(n.kind==='material'){try{if(dependency.byNode[n.id])throw Error('Công thức kích thước chưa hợp lệ');const g=geometry(n,count);rows.push({id:n.id,node:n,productId:product.id,productName:product.name,path,count,spec:n.spec.shapeDefinition?definitions().effective(n):n.spec,geometry:g,label:n.name,color:colors[rows.length%colors.length],cost:0,...(covered?{coveredBy:covered.id,externallySupplied:covered.outsource.materialSupply==='vendor'}:{})});record.weight=g.weight;record.area=g.area;record.volume=g.volume;}catch(e){errors.push(n.name+': '+e.message);(record.declarationErrors??=[]).push(e.message);}return;}
    for(const child of n.children||[])visit(child,count,product,[...path,n.name],covered);
  }
  for(const p of q.products)visit(p,1,p,[]);
  const grouped={};for(const row of rows){if(row.externallySupplied){row.cost=row.purchaseCost=row.purchasedWeight=row.purchasedArea=row.recoverableCredit=0;continue;}if(row.spec.shape==='piece'){row.cost=row.purchaseCost=row.count*row.spec.price;row.recoverableCredit=0;continue;}const key=JSON.stringify([row.spec.id,row.spec.shapeDefinition?definitions().stockProperties(row.spec):row.spec.props,row.spec.stockL,row.spec.stockW,row.spec.price,row.spec.unit,row.spec.density,...(row.spec.shapeDefinition?[row.spec.shapeDefinition]:[]),...(row.spec.brand?[row.spec.brand]:[]),...(row.spec.areaOverride?[materialSurface(row.spec)]:[]),...(row.spec.massOverride?[materialMass(row.spec)]:[]),...(row.node.supplier||row.spec.supplier?[row.node.supplier||row.spec.supplier]:[])]);(grouped[key]??={spec:row.spec,rows:[]}).rows.push(row);}
  const remnantMode=q.remnantMode==='exclude'?'exclude':'all',savedRemnants=q.remnantSelections||{};
  const groupsResult=[];
  for(const group of Object.values(grouped)){try{const plan=(q.nestingPlans||[]).find(p=>p.rowIds.some(id=>group.rows.some(r=>r.id===id))),planner=plan?(api.nestingPlans||(typeof module!=='undefined'?require('./nesting-plan-core.js'):null)):null;const layout=plan?planner.apply(group.rows,group.spec,Number(q.kerf),plan):nest(group.rows,group.spec,Number(q.kerf));const m=group.spec,totalWeight=group.rows.reduce((s,r)=>s+r.geometry.weight,0),unitMeasure=m.shape==='sheet'?m.stockL*m.stockW/1e6:m.stockL/1000;
      const purchasedMeasure=layout.stocks.length*unitMeasure,purchasedWeight=purchasedMeasure*materialMass(m);
      const purchaseCost=m.unit==='kg'?purchasedWeight*m.price:m.unit==='m²'||m.unit==='m'?purchasedMeasure*m.price:layout.stocks.length*m.price;
      // Bind choices to the deterministic physical cutting plan, not to today's price.
      const signature=JSON.stringify([1,m.id,m.shape,m.shapeDefinition?definitions().stockProperties(m):m.props,m.unit,m.density,...(m.shapeDefinition?[m.shapeDefinition]:[]),...(m.brand?[m.brand]:[]),...(m.areaOverride?[materialSurface(m)]:[]),...(m.massOverride?[materialMass(m)]:[]),layout.stockL,layout.stockW,Number(q.kerf),...(plan?[plan.mode,plan.placements||null]:[]),group.rows.map(r=>[r.id,r.count,r.geometry.length,r.geometry.width]),...(group.rows[0].node.supplier||m.supplier?[group.rows[0].node.supplier||m.supplier]:[])]);
      const chosen=new Set(Array.isArray(savedRemnants[signature])?savedRemnants[signature]:[]);
      const remnants=layout.stocks.flatMap((s,stockIndex)=>{
        const free=m.shape==='sheet'?s.free:(s.remaining>0?[{x:layout.stockL-s.remaining,y:0,l:s.remaining,w:0}]:[]);
        return free.map((f,i)=>{const measure=m.shape==='sheet'?f.l*f.w:f.l,id=stockIndex+':'+i,ratio=measure/layout.purchased;const eligible=remnantEligibility(m,f,q.remnantRules?.[remnantRuleKey(m)]);return {...f,id,stockIndex,measure,eligible,weight:purchasedWeight*ratio,value:purchaseCost*ratio,selected:eligible!==false&&chosen.has(id)};});
      });
      const reusableMeasure=remnants.filter(r=>r.selected).reduce((s,r)=>s+r.measure,0),recoverableCredit=purchaseCost*reusableMeasure/layout.purchased;
      const cost=purchaseCost-(remnantMode==='exclude'?recoverableCredit:0),kerfMeasure=Math.max(0,layout.purchased-layout.used-remnants.reduce((s,r)=>s+r.measure,0)+(layout.internalAllowance||0));
      const reusableWeight=purchasedWeight*reusableMeasure/layout.purchased;
      const totalMeasure=group.rows.reduce((s,r)=>s+r.geometry.measure,0);for(const r of group.rows){const share=r.geometry.measure/totalMeasure;r.cost=cost*share;r.purchaseCost=purchaseCost*share;r.recoverableCredit=recoverableCredit*share;r.purchasedWeight=purchasedWeight*share;r.reusableWeight=reusableWeight*share;r.allocatedWeight=Math.max(0,purchasedWeight-reusableWeight)*share;r.purchasedArea=(m.shape==='sheet'?purchasedMeasure:purchasedMeasure*materialSurface(m))*share;r.allocatedArea=r.purchasedArea*(1-reusableMeasure/layout.purchased);}
      groupsResult.push({...group,signature,remnants,layout,cost,purchaseCost,recoverableCredit,reusableMeasure,kerfMeasure,totalWeight,purchasedWeight,purchasedMeasure});
    }catch(e){if(q.nestingPlans?.some(p=>p.rowIds.some(id=>group.rows.some(r=>r.id===id)))||group.rows.some(r=>!r.node.materialEstimate))errors.push(group.spec.id+': '+e.message);groupsResult.push({...group,error:e.message});}}
  // Estimation is independent of the order-wide purchasing proposal. Old quotes opt in explicitly.
  for(const row of rows)if(row.node.materialEstimate)try{
    row.estimate=materialEstimate({...row.node,spec:row.spec},row.geometry);
    row.cost=row.purchaseCost=row.externallySupplied?0:row.estimate.cost;row.recoverableCredit=0;
  }catch(e){row.cost=row.purchaseCost=0;row.estimateError=e.message;errors.push(row.label+': '+e.message);(nodes[row.id].declarationErrors??=[]).push(e.message);}
  let staleCount=0;const activePlans=new Map(groupsResult.filter(g=>!g.error).map(g=>[g.signature,new Set(g.remnants.filter(r=>r.eligible!==false).map(r=>r.id))]));
  for(const [signature,ids]of Object.entries(savedRemnants))if(Array.isArray(ids))for(const id of new Set(ids))if(!activePlans.get(signature)?.has(id))staleCount++;
  if(staleCount&&remnantMode==='exclude'&&rows.some(r=>r.spec.shape!=='piece'&&!r.node.materialEstimate))errors.push('Phương án cắt đã thay đổi. Rà soát phần dư tận dụng tại Khai triển & hao hụt trước khi xuất báo giá.');
  const rowMap=Object.fromEntries(rows.map(r=>[r.id,r]));
  function sum(n){const r=nodes[n.id];r.materialPurchase=0;r.materialRecoverable=0;if(n.kind==='material'){r.material=rowMap[n.id]?.cost||0;r.materialPurchase=rowMap[n.id]?.purchaseCost||0;r.materialRecoverable=rowMap[n.id]?.recoverableCredit||0;}else{for(const c of n.children||[]){const cr=sum(c);r.material+=cr.material;r.materialPurchase+=cr.materialPurchase;r.materialRecoverable+=cr.materialRecoverable;r.ops+=cr.ops;r.weight+=cr.weight;r.area+=cr.area;r.volume+=cr.volume;r.transport+=cr.transport;r.install+=cr.install;}}r.ownTransport=(n.transport||0)*r.count;r.ownInstall=(n.install||0)*r.count;r.transport+=r.ownTransport;r.install+=r.ownInstall;
    if(q.pricing&&api.manufacturing){try{Object.assign(r,api.manufacturing.measure(n,r,nodes));const row=rowMap[n.id];if(row){row.geometry.processWeight=r.workWeight;row.geometry.processArea=r.workArea;}}catch(e){errors.push(n.name+': '+e.message);(r.declarationErrors??=[]).push(e.message);}}
    r.ownOps=[];if(!q.pricing)for(const op of n.ops||[]){const rate=q.ratesSnapshot.find(x=>x.id===op.id);if(!rate){errors.push('Không tìm thấy đơn giá nguyên công');continue;}const unit=rate[op.mode+'Unit']||rate.unit,basis=unit==='kg'?r.weight:unit==='tấn'?r.weight/1000:unit==='m²'?r.area:unit==='m³'?r.volume:r.count*op.amount;const amount=basis*rate[op.mode];r.ops+=amount;r.ownOps.push({name:rate.name,mode:op.mode,basis,unit,rate:rate[op.mode],cost:amount});}return r;}
  function priceProduct(r,material=r.material){const p=r.node,transport=r.transport,install=r.install,direct=material+r.ops+transport+install,cost=direct*(1+q.overhead/100),unitSell=q.margin<100&&p.qty>0?Math.round(cost/(1-q.margin/100)/p.qty):0,sell=Math.round(unitSell*p.qty);return {...r,material,transport,install,direct,cost,sell,unitSell};}
  function totalsOf(products){const t=products.reduce((a,p)=>{for(const k of ['material','ops','transport','install','cost','sell','weight','area'])a[k]+=p[k];return a;},{material:0,ops:0,transport:0,install:0,cost:0,sell:0,weight:0,area:0});t.vat=Math.round(t.sell*q.vat/100);t.grand=t.sell+t.vat;t.profit=t.sell-t.cost;return t;}
  const products=q.products.map(p=>priceProduct(sum(p))),total=totalsOf(products);
  const reuse={mode:remnantMode,staleCount,selectedCount:groupsResult.reduce((s,g)=>s+(g.remnants?.filter(r=>r.selected).length||0),0),credit:groupsResult.reduce((s,g)=>s+(g.recoverableCredit||0),0),chargeAll:totalsOf(products.map(p=>priceProduct(p,p.materialPurchase))),excludeSelected:totalsOf(products.map(p=>priceProduct(p,p.materialPurchase-p.materialRecoverable)))};
  if(!q.products.length)errors.push('Báo giá chưa có sản phẩm');
  for(const n of Object.values(nodes).map(r=>r.node))if(n.kind!=='material'&&!n.children?.length)errors.push(n.name+': chưa có thành phần');
  if(q.margin<0||q.margin>=100)errors.push('Biên lợi nhuận phải từ 0 đến dưới 100%');
  return {rows,nodes,groups:groupsResult,products,total,reuse,errors:[...new Set(errors)]};
}
function flatten(nodes){return nodes.flatMap(n=>[n,...flatten(n.children||[])]);}
function nodePath(nodes,id,path=[]){for(const n of nodes){if(n.id===id)return [...path,n];const hit=nodePath(n.children||[],id,[...path,n]);if(hit)return hit;}return null;}
function productOwner(db,id){const path=nodePath(db.quote.products,id)||[];return path.slice().reverse().find(n=>n.kind==='product'&&n.params);}
function scopedLeaves(p){return (p.children||[]).flatMap(n=>n.kind==='material'?[n]:n.kind==='product'&&n.params?[]:scopedLeaves(n));}
function productParamEntries(p){if(!p.params)return [];return [...new Set(['L','W','H','T',...Object.keys(p.params)])].filter(k=>k==='T'||Object.hasOwn(p.params,k)).map(k=>[k,p.params[k]??null]);}
function formatName(p){if(!p.namePattern||!p.params||p.manualName)return;const format=n=>n==null?'chưa khai':Number(n).toLocaleString('vi-VN',{maximumFractionDigits:2});p.name=p.namePattern.replace(/\{([A-Z]+)\}/g,(_,k)=>format(p.params[k]));if(scopedLeaves(p).some(n=>n.detached))p.name=p.name.replace(/\s+[\d{].*$/,'')+' (quy cách tùy chỉnh)';}
function configureProduct(p){
  if(p.params)return;const leaves=flatten(p.children||[]).filter(n=>n.kind==='material');
  if(p.model==='tray'&&p.name.startsWith('Máng cáp')){const body=leaves.find(n=>n.rule==='tray'),cover=leaves.find(n=>n.rule==='cover');if(!body)return;p.params={L:body.dims.L,W:body.dims.W,H:body.dims.H};p.namePattern='Máng cáp {W} × {H}, dài {L} mm';body.paramLinks={L:'L',W:'W',H:'H'};if(cover){cover.paramLinks={};for(const k of ['L','W'])if(cover.dims[k]===p.params[k])cover.paramLinks[k]=k;else cover.detached=true;}}
  else if(p.model==='frame'&&p.name.startsWith('Khung máy')){const bars=leaves.filter(n=>n.spec.shape==='box');if(bars.length<3)return;p.params={L:bars[1].dims.L,W:bars[2].dims.L,H:bars[0].dims.L};p.namePattern='Khung máy {L} × {W} × {H} mm';bars[0].paramLinks={L:'H'};bars[1].paramLinks={L:'L'};bars[2].paramLinks={L:'W'};}
  formatName(p);
}
function applyParam(p,key,value){if(p.dimensionLinks?.[key]&&p.dimensionLinks[key].mode!=='manual')return;const blankThickness=key==='T'&&value===null;if(!blankThickness&&(!Number.isFinite(value)||value<0||(['L','W','T'].includes(key)&&value===0)||key==='T'&&value>100000))throw Error('Kích thước không hợp lệ');p.params??={};p.params[key]=value;for(const n of scopedLeaves(p))for(const [dim,param]of Object.entries(n.paramLinks||{}))if(param===key&&!n.dimensionLinks?.[dim]&&!shapeInfo(n.spec).fixed.includes(dim))n.dims[dim]=value;formatName(p);}
function setDimension(db,id,key,value){const n=findNode(db.quote.products,id),p=productOwner(db,id);if(n.dimensionLinks?.[key]&&n.dimensionLinks[key].mode!=='manual')throw Error('Thông số theo công thức/cố định; chuyển sang nhập tay trước khi sửa');if(p&&n.paramLinks?.[key])applyParam(p,n.paramLinks[key],value);else n.dims[key]=value;}
function quoteSpecification(p){const leaves=flatten(p.children||[]).filter(n=>n.kind==='material'&&n.spec.shape!=='piece'),detail=n=>n.spec.shapeDefinition?n.spec.id+': '+n.spec.shapeDefinition.fields.filter(f=>f.mode==='input').map(f=>f.key+' '+n.dims[f.key]+' '+f.unit).join(' × '):n.spec.id+': '+Object.entries(n.dims||{}).filter(([k])=>shapeInfo(n.spec).input.includes(k)||['H','F'].includes(k)&&formulaNames(n.ruleSpec.width).includes(k)).map(([k,v])=>k+' '+v).join(' × ')+' mm';if(p.params){const base=Object.entries(p.params).filter(([k])=>k!=='T').map(([k,v])=>k+' '+v).join(' × ')+' mm'+(p.params.T==null?'':'; Dày chung (tham số): '+p.params.T+' mm; không tự đổi quy cách vật tư'),custom=leaves.filter(n=>n.detached);return custom.length?'Kích thước chung: '+base+'; chi tiết riêng: '+custom.map(detail).join('; '):base;}return [...new Set(leaves.map(detail))].join('; ');}
function catalogWithTemplate(master,source,template){
  if(!template||!['product','component'].includes(template.templateKind)||!String(template.name||'').trim())throw Error('Mẫu cần tên và loại sản phẩm/cấu kiện');
  const catalog=copy(master),added={materials:[],rates:[],rules:[],shapeDefinitions:[],productGroups:[]};
  for(const key of ['library','materials','rates','rules','shapeDefinitions'])catalog[key]??=[];
  if(catalog.library.some(x=>x.id===template.id))throw Error('Mã mẫu đã có trong thư viện dùng chung');
  const add=(key,id,item,label)=>{if(catalog[key].some(x=>x.id===id))return;if(!item||item.id!==id)throw Error('Mẫu thiếu '+label+' '+id+' trong danh mục nguồn');catalog[key].push(copy(item));added[key].push(id);};
  for(const n of flatten([template])){
    if(n.productGroup){catalog.conventions??={};catalog.conventions.productGroups??=[];if(!catalog.conventions.productGroups.some(x=>x.name===n.productGroup)){const item=source.conventions?.productGroups?.find(x=>x.name===n.productGroup)||{name:n.productGroup};catalog.conventions.productGroups.push(copy(item));added.productGroups.push(n.productGroup);}}
    if(n.kind==='material'){
      if(!n.materialId||!n.spec||n.spec.id!==n.materialId||n.draftMaterial)throw Error('Vật tư trong mẫu chưa được khai báo đầy đủ: '+(n.name||n.materialId||''));
      add('materials',n.materialId,source.materials?.find(x=>x.id===n.materialId)||n.spec,'vật tư');
      if(n.rule)add('rules',n.rule,source.rules?.find(x=>x.id===n.rule)||n.ruleSpec,'quy tắc');
      const shape=n.spec.shapeDefinition;if(shape?.id)add('shapeDefinitions',shape.id,source.shapeDefinitions?.find(x=>x.id===shape.id)||shape,'quy ước hình dạng');
    }
    for(const op of n.ops||[])add('rates',op.id,source.quote?.ratesSnapshot?.find(x=>x.id===op.id)||source.rates?.find(x=>x.id===op.id),'nguyên công');
  }
  attachTemplateRates({ratesSnapshot:catalog.rates},catalog.rates,template);
  catalog.library.push(copy(template));
  return {catalog,added};
}
function attachTemplateRates(quote,rates,node){
  const snapshot=[...(quote.ratesSnapshot||[])];
  for(const op of flatten([node]).flatMap(n=>n.ops||[])){
    let rate=snapshot.find(r=>r.id===op.id);
    if(!rate){const master=rates.find(r=>r.id===op.id);if(!master)throw Error('Mẫu cần nguyên công '+op.id+' chưa có trong danh mục; yêu cầu quản trị phát hành nguyên công trước');rate=copy(master);snapshot.push(rate);}
    if(op.priceOptionId&&!rate.priceOptions?.some(x=>x.id===op.priceOptionId&&x.enabled!==false))throw Error('Mẫu dùng phương án giá '+op.priceOptionId+' không có trong bảng nguyên công '+rate.name+' của báo giá này');
  }
  quote.ratesSnapshot=snapshot;
}
const api={MAX_PHYSICAL_PIECES,copy,uid,groups,shapes,shapeInfo,formula,formulaNames,seed,cloneNode,findNode,removeNode,materialMass,materialSurface,remnantRuleKey,remnantEligibility,geometry,materialEstimate,nest,calculate,flatten,nodePath,productOwner,scopedLeaves,formatName,productParamEntries,configureProduct,applyParam,setDimension,quoteSpecification,catalogWithTemplate,attachTemplateRates};
if(typeof module!=='undefined')module.exports=api;else root.TP=api;
})(typeof window!=='undefined'?window:globalThis);
