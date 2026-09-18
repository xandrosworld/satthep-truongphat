(function(root){'use strict';
const computed=new Set(['Tong_hop_thong_tin_cau_kien','Klg_vat_tu-kg','Klg_phoi_san_pham_kg','Klg_xu_ly_ngoai_kg','Dien_tich_be_mat_m2','Kiem_tra_dieu_kien_khai_bao']);
const dimensions=['Dai_mm','Rong_W_mm','Cao_H_mm','Duong_kinh_D_mm','W1_mm','H1_mm','Buoc','Day_mm'];
const numeric=[...dimensions,'So_luong_cau_kien','So_luong_san_pham','Khoi_luong_phoi_dac_thu_kg/m','Dien_tich_be_mat_dac_thu_m2'];
const labels={identity:'Đủ thông tin nhận diện',missing:'Thiếu thông tin',number:'Số liệu cần kiểm tra',tmc:'TMC cần đối chiếu'};
const text=v=>String(v??'').normalize('NFC').trim().replace(/[\t\r\n ]+/g,' ');
const fold=v=>text(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
function headerIndex(sheet){return sheet.rows.findIndex(row=>['ID','Ma_BG','Thong_so_cau_kien','Vat_lieu','Kieu_dang'].every(k=>row.map(text).includes(k)));}
function inspect(sheet){
 const start=headerIndex(sheet);if(start<0)throw Error('Không thấy các cột ID, Ma_BG, Thong_so_cau_kien, Vat_lieu, Kieu_dang. Chọn sheet khai báo gốc.');
 const headers=sheet.rows[start].map(text),names=headers.filter(Boolean);if(new Set(names).size!==names.length)throw Error('Tiêu đề cột bị trùng; kiểm tra file nguồn.');if(names.some(k=>['__proto__','prototype','constructor'].includes(k)))throw Error('Tên cột không hợp lệ.');
 const rows=[],ids=new Map(),formulas={};
 for(let i=start+1;i<sheet.rows.length;i++){
  const cells=sheet.rows[i],meta=sheet.cellMetadata?.[i]||[];
  // Ignore formatting-only rows, but never drop declarations lacking an ID.
  if(!headers.some((k,j)=>k&&!computed.has(k)&&text(cells[j])!==''))continue;
  if(rows.length>=5000)throw Error('Mỗi lần rà soát tối đa 5.000 dòng khai báo.');
  const r={line:sheet.sourceRows?.[i]||i+1,sourceId:'',quoteCode:'',raw:{},normalized:{},issues:[],excluded:[],group:'',status:'identity'};
  const issue=(code,message)=>r.issues.push({code,message});
  headers.forEach((key,j)=>{if(!key)return;const value=cells[j]??'',m=meta[j]||{};r.raw[key]=value;
   if(computed.has(key)||m.formula!==undefined||m.type==='e'){
    const reason=m.formula?.includes('#REF!')?'Mất tham chiếu #REF!':m.formula&&/\[\d+\]/.test(m.formula)?'Tham chiếu ngoài':m.type==='e'?'Lỗi Excel':computed.has(key)?'Cột tính toán — không dùng kết quả lưu':'Công thức — không nhập như dữ liệu gõ tay';
    r.excluded.push({field:key,reason,...(m.formula!==undefined?{formula:m.formula}:{}),cached:value});
    formulas[key]??={cells:0,broken:0,external:0};formulas[key].cells++;if(reason.includes('#REF!'))formulas[key].broken++;if(reason==='Tham chiếu ngoài')formulas[key].external++;
    if(!computed.has(key))issue('formula','Ô '+key+' có công thức/lỗi, cần khai lại giá trị nguồn');return;
   }
   r.normalized[key]=text(value)||null;
  });
  r.sourceId=r.normalized.ID||'';r.quoteCode=r.normalized.Ma_BG||'';
  for(const [key,label]of [['ID','ID nguồn'],['Ma_BG','Mã báo giá nguồn'],['Thong_so_cau_kien','Loại cấu kiện'],['Vat_lieu','Vật liệu'],['Kieu_dang','Hình dạng']])if(!r.normalized[key])issue('missing','Thiếu '+label);
  if(!r.normalized.Ten_san_pham)issue('parent','Trống tên sản phẩm; chưa xác định dòng thuộc sản phẩm nào, không tự điền từ dòng trước');
  for(const key of [...numeric,'Hao_hut','Vat_tu_phu']){const v=r.normalized[key];if(v==null)continue;
   if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(v)||!Number.isFinite(Number(v))){issue('number',key+': số chưa rõ định dạng, giữ nguyên để đối chiếu');continue;}
   const n=Number(v);r.normalized[key]=n;
   if(n<0||(['So_luong_cau_kien','So_luong_san_pham'].includes(key)&&n===0))issue('number',key+': giá trị không hợp lệ');
  }
  r.percent={};for(const key of ['Hao_hut','Vat_tu_phu']){const v=r.normalized[key];r.percent[key]=typeof v==='number'&&v>=0&&v<=1?Number((v*100).toPrecision(12)):null;if(v!=null&&r.percent[key]==null)issue('number',key+': cần xác nhận đơn vị tỷ lệ trước khi đổi sang %');}
  r.tmc=/thang|mang/.test(fold(r.normalized.Thong_so_cau_kien));
  if(r.tmc)issue('tmc','Giữ dòng TMC gộp; chờ xác nhận cơ sở tính và vật tư thành phần');
  const namedLength=text(r.normalized.Ten_san_pham).match(/\bL\s*=\s*(\d+(?:\.\d+)?)\s*(?:mm)?\b/i);
  if(namedLength&&typeof r.normalized.Dai_mm==='number'&&Number(namedLength[1])!==r.normalized.Dai_mm)issue('basis','Chiều dài trong tên khác Dai_mm; cần xác nhận cơ sở theo mét / sản phẩm, chưa kết luận sai');
  if(r.sourceId){const previous=ids.get(r.sourceId);if(previous){issue('duplicate','Trùng ID nguồn với dòng '+previous.line);previous.issues.push({code:'duplicate',message:'Trùng ID nguồn với dòng '+r.line});}else ids.set(r.sourceId,r);}
  rows.push(r);
 }
 if(!rows.length)throw Error('Sheet chưa có dữ liệu khai báo.');
 const groups=new Map();for(const r of rows){r.status=r.issues.some(x=>['number','duplicate','formula'].includes(x.code))?'number':r.issues.some(x=>x.code==='missing')?'missing':r.tmc?'tmc':'identity';
  // Comparison only: preserve zero vs blank and do not collapse source records.
  const keys=['Thong_so_cau_kien','Vat_lieu','Kieu_dang','Dac_tinh','Be_mat',...dimensions,'Khoi_luong_phoi_dac_thu_kg/m','Dien_tich_be_mat_dac_thu_m2'];const signature=JSON.stringify(keys.map(k=>r.normalized[k]??null));if(!groups.has(signature))groups.set(signature,'DC-'+String(groups.size+1).padStart(4,'0'));r.group=groups.get(signature);
 }
 return {schema:'truongphat.legacy-declarations.review.v1',sheet:sheet.name,rows,formulas,summary:{rows:rows.length,quoteCodes:new Set(rows.map(r=>r.quoteCode).filter(Boolean)).size,groups:groups.size,tmc:rows.filter(r=>r.tmc).length,missingParent:rows.filter(r=>r.issues.some(x=>x.code==='parent')).length,statuses:Object.fromEntries(Object.keys(labels).map(k=>[k,rows.filter(r=>r.status===k).length]))},imported:false,needsMapping:true};
}
function exportSheets(report){const fields=[...new Set(report.rows.flatMap(r=>Object.keys(r.normalized)))];return [
 {name:'Huong dan',rows:[['Nội dung','Kết quả'],['Trạng thái','Rà soát trước nhập; chưa phải danh mục đã chốt, chưa ghi vào hệ thống'],['File',report.file||''],['Sheet',report.sheet],['Dòng nguồn',report.summary.rows],['Nhóm đối chiếu',report.summary.groups],['ID nguồn','Không coi ID hoặc nhóm đối chiếu là mã vật tư chuẩn'],['Đủ thông tin nhận diện','Chỉ đủ ID, mã báo giá, loại cấu kiện, vật liệu, hình dạng; chưa xác nhận kích thước, định mức, công thức hoặc khả năng nhập'],['TMC','Giữ dòng gộp; chưa bóc vật tư con'],['Tên sản phẩm trống','Giữ trống, chưa xác định quan hệ cha/con'],['Nguyên công','Giữ giá trị nguồn; chưa suy diễn số lần hoặc đơn vị tính'],['Phần trăm','Cột gốc giữ tỷ lệ; cột % mới nhân 100 một lần, không tự áp vào giá'],['Công thức','Tách riêng để đối chiếu; không thực thi, không dùng giá trị cache làm kết quả tính']]},
 {name:'Khai bao chuan hoa',rows:[['Dòng Excel','ID nguồn','Mã báo giá','Nhóm đối chiếu','Phân loại','Nội dung cần rà','Hao hụt (%)','Vật tư phụ (%)',...fields],...report.rows.map(r=>[r.line,r.sourceId,r.quoteCode,r.group,labels[r.status],r.issues.map(i=>i.message).join('; '),r.percent.Hao_hut,r.percent.Vat_tu_phu,...fields.map(k=>r.normalized[k]??'')])]},
 {name:'Can doi chieu',rows:[['Dòng Excel','ID nguồn','Mã báo giá','Nội dung'],...report.rows.flatMap(r=>r.issues.map(i=>[r.line,r.sourceId,r.quoteCode,i.message]))]},
 {name:'Cong thuc khong nhap',rows:[['Dòng Excel','ID nguồn','Cột','Lý do','Giá trị lưu (không dùng)'],...report.rows.flatMap(r=>r.excluded.map(x=>[r.line,r.sourceId,x.field,x.reason,x.cached]))]},
 {name:'Du lieu goc',rows:[['Dòng Excel',...Object.keys(report.rows[0].raw)],...report.rows.map(r=>[r.line,...Object.keys(report.rows[0].raw).map(k=>r.raw[k]??'')])]}
 ];}
const api={inspect,headerIndex,exportSheets,labels,fold};if(typeof module!=='undefined')module.exports=api;else root.TPLegacyDeclarations=api;
})(typeof window!=='undefined'?window:globalThis);
