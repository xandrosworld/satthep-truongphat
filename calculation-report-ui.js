'use strict';
function calculationReportAllowed(){return Team.user?!!(Team.permissions?.costs&&Team.permissions?.formulaView):!Team.loaded&&!Team.expired;}
function openCalculationReport(){
 if(!calculationReportAllowed())return toast('Cần quyền xem chi phí nội bộ và biểu thức công thức để xuất diễn giải');
 try{
  const owner=Team.user?.id,snapshot=C.copy(db),report=TPCalculationReport.build(snapshot,result,{version:Team.loaded?Team.link?.version:undefined});
  const labels=['Thông tin và cách đọc','Đầu vào thực tế','Khai triển và khối lượng','Vật tư và hao hụt','Lượng thực hiện','Công đoạn và định mức','Vận chuyển và lắp đặt','Nguồn giá và thuế','Giá phương án đang chọn','Tổng hợp đối chiếu','Nội dung cần kiểm tra'];
  openDialog('Bảng diễn giải tính giá',`<p><strong>${esc(snapshot.quote.id)}</strong> · ${esc(snapshot.quote.customer||'Chưa khai khách hàng')}</p><p class="notice">Bảng nội bộ có công thức và giá vốn, dùng để người phụ trách rà soát. Các giá trị là số liệu tại thời điểm mở bảng; sửa ô Excel không tính lại báo giá.</p>${report.issues.length?`<p class="notice warning">Có ${report.issues.length} nội dung cần kiểm tra. Bản xuất vẫn giữ các đầu vào để đối chiếu; xem bảng “Nội dung cần kiểm tra”.</p>`:'<p>Không có cảnh báo bộ tính. Việc duyệt báo giá vẫn theo quy trình.</p>'}<label class="field"><span>Bảng cần xem</span><select data-report-sheet>${report.sheets.map((s,i)=>`<option value="${i}">${esc(labels[i]||s.name)}</option>`).join('')}</select></label><div data-report-preview></div>`,'Tải Excel diễn giải',()=>{
   if(!calculationReportAllowed()||owner!==Team.user?.id)return toast('Quyền xem đã thay đổi; mở lại báo giá');
   download(snapshot.quote.id+'-DIEN-GIAI-NOI-BO.xlsx',TPXlsx.make(report.sheets),'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');closeDialog();
  });
  document.querySelector('#dialog').classList.add('wide-dialog');
  const draw=index=>{const sheet=report.sheets[index],rows=sheet.rows.slice(1,201),target=document.querySelector('[data-report-preview]');target.innerHTML=`<p class="help-text">${sheet.rows.length-1} dòng. ${sheet.rows.length>201?'Xem trước 200 dòng; Excel chứa toàn bộ dữ liệu.':''}</p><div class="table-scroll" style="max-height:45vh;overflow:auto"><table><thead><tr>${sheet.rows[0].map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${esc(typeof x==='number'?num(x,8):x??'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;};
  document.querySelector('[data-report-sheet]').addEventListener('change',e=>draw(Number(e.target.value)));draw(0);
 }catch(e){toast('Chưa xuất được bảng diễn giải: '+e.message);}
}
function installCalculationReportUI(){
 const old=renderCostAnalysis;renderCostAnalysis=()=>{const html=old();return db.quote.pricing&&calculationReportAllowed()?`<div class="actions"><button class="button" data-calculation-report>Bảng diễn giải tính giá</button></div>`+html:html;};
 document.addEventListener('click',e=>{if(e.target.closest('[data-calculation-report]'))openCalculationReport();});
}
