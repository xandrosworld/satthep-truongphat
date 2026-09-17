/* Batch 01: explicit input records, catalogue variants and shared BOM projection. */
(function(root){
'use strict';
const C=typeof module!=='undefined'?require('./core.js'):root.TP;
const clean=(v,max=200)=>String(v??'').trim().slice(0,max);
const fold=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function nextMaterialId(materials){const used=new Set(materials.map(m=>m.id.toUpperCase()));let i=1;while(used.has('VT-'+String(i).padStart(5,'0')))i++;return 'VT-'+String(i).padStart(5,'0');}
function nextQuoteCode(date,codes=[]){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('Ngày tạo báo giá không hợp lệ');
 const prefix='BG-'+date.replaceAll('-','')+'-',numbers=codes.filter(code=>typeof code==='string'&&code.startsWith(prefix)&&/^\d+$/.test(code.slice(prefix.length))).map(code=>Number(code.slice(prefix.length))),next=Math.max(0,...numbers)+1;
 if(!Number.isSafeInteger(next))throw Error('Số thứ tự báo giá vượt giới hạn');return prefix+String(next).padStart(3,'0');
}
function technicalSummary(products,result){
 const tree=treeRows(products),issues=[],rows=new Map(result.rows.map(r=>[r.id,r]));let weight=0,area=0,components=0;
 if(!products.length)issues.push('Chưa có sản phẩm');
 for(const {node:n,count} of tree){
  if(!Number.isFinite(count)||count<=0)issues.push(n.name+': bổ sung số lượng hợp lệ');
  if(n.kind==='component'&&Number.isFinite(count))components+=count;
  if(n.kind!=='material'){if(!n.children?.length)issues.push(n.name+': chưa có thành phần');continue;}
  const row=rows.get(n.id),errors=result.nodes[n.id]?.declarationErrors||[];
  if(n.draftMaterial||!row||errors.length){issues.push(n.name+': '+(errors.join('; ')||'bổ sung mã vật tư, kích thước và quy ước'));continue;}
  if(!Number.isFinite(row.geometry.weight)||!Number.isFinite(row.geometry.blankArea)){issues.push(n.name+': chưa tính được khối lượng / diện tích');continue;}
  weight+=row.geometry.weight;area+=row.geometry.blankArea;
 }
 return {weight,area,components,componentRows:tree.filter(x=>x.node.kind==='component').length,issues:[...new Set(issues)],complete:issues.length===0};
}
function variantKey(m){return JSON.stringify([m.id,m.unit,fold(m.brand),clean(m.specification,2000)]);}
function stockOptions(m){const values=m.stockOptions||[];return values.filter(s=>Number(s.length)>0&&(m.shape!=='sheet'||Number(s.width)>0));}
function parseStocks(input,shape){if(shape==='piece')return [];const seen=new Set();return String(input||'').split(/\r?\n/).filter(s=>s.trim()).map((s,i)=>{const values=s.trim().split(/\s*[x×]\s*/i).map(Number);if(values.length!==(shape==='sheet'?2:1)||values.some(v=>!Number.isFinite(v)||v<=0||v>100000))throw Error('Khổ mua dòng '+(i+1)+': nhập '+(shape==='sheet'?'dài × rộng':'chiều dài')+' theo mm, tối đa 100.000');const value={length:values[0],width:shape==='sheet'?values[1]:0},key=JSON.stringify(value);if(seen.has(key))throw Error('Khổ mua dòng '+(i+1)+' bị trùng');seen.add(key);return value;});}
function requestDetails(input){const value={recipient:clean(input.recipient),location:clean(input.location,500),quoteDeadline:clean(input.quoteDeadline,10),schedule:clean(input.schedule,2000)};if(value.quoteDeadline&&(!/^\d{4}-\d{2}-\d{2}$/.test(value.quoteDeadline)||!Number.isFinite(Date.parse(value.quoteDeadline+'T00:00:00Z'))||new Date(value.quoteDeadline+'T00:00:00Z').toISOString().slice(0,10)!==value.quoteDeadline))throw Error('Hạn hoàn thành báo giá không hợp lệ');return value;}
function validateDetails(request){for(const [key,max]of [['recipient',200],['location',500],['quoteDeadline',10],['schedule',2000]])if(request[key]!==undefined&&(typeof request[key]!=='string'||request[key].length>max))throw Error('Thông tin '+key+' không hợp lệ');requestDetails(request);}
function validateFiles(files,existing=0){if(files.length+existing>30)throw Error('Tối đa 30 tệp cho mỗi báo giá');for(const f of files){if(!/\.(png|jpe?g|webp|pdf|xlsx|xls|csv)$/i.test(f.name)||f.name.length>250)throw Error('Chỉ nhận ảnh, PDF và Excel/CSV; tên tệp tối đa 250 ký tự');if(!Number.isFinite(f.size)||f.size<0||f.size>10*1024*1024)throw Error('Mỗi tệp tối đa 10 MB');}}
function treeRows(products){const rows=[];function visit(n,parent,depth,count){const type=n.kind==='material'?(parent?.kind==='component'?'component-material':'product-material'):n.kind;rows.push({node:n,id:n.id,parentId:parent?.id||null,type,depth,count:count*n.qty});for(const child of n.children||[])visit(child,n,depth+1,count*n.qty);}for(const p of products)visit(p,null,0,1);return rows;}
function profileSpec(original,{mass,area,reason}){if(['piece','sheet'].includes(original.shape))throw Error('Dữ liệu trên mét chỉ áp dụng cho thanh/thép hình');for(const [label,v]of [['kg/m',mass],['m²/m',area]])if(v===''||v===null||!Number.isFinite(Number(v))||Number(v)<=0)throw Error(label+' phải lớn hơn 0');if(!clean(reason))throw Error('Ghi căn cứ / bảng tra');const m=C.copy(original);m.massOverride={value:Number(mass),reason:clean(reason,500)};m.areaOverride={value:Number(area),reason:clean(reason,500)};C.materialMass(m);C.materialSurface(m);return m;}
const api={clean,fold,nextMaterialId,nextQuoteCode,technicalSummary,variantKey,stockOptions,parseStocks,requestDetails,validateDetails,validateFiles,treeRows,profileSpec};
if(typeof module!=='undefined')module.exports=api;else root.TPBatchOne=api;
})(typeof window!=='undefined'?window:globalThis);
