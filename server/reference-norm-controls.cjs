'use strict';
// Keep legacy category IDs so existing references and purchase snapshots remain valid.
const groups=[
 {id:'material',name:'01 · Vật tư',purpose:'Lượng vật tư dùng cho một đơn vị sản phẩm.',material:true,unit:'kg',outputUnit:'bộ'},
 {id:'nesting',name:'02 · Phôi & nesting',purpose:'Số phôi theo đúng mã và khổ cần cho một đơn vị sản phẩm; đối chiếu phương án sắp phôi.',material:true,unit:'tấm',outputUnit:'bộ'},
 {id:'loss',name:'03 · Hao hụt',purpose:'Tỷ lệ phế tối đa trên khối lượng đầu vào đã đối soát.',material:true,unit:'%',outputUnit:'kg đầu vào',percent:true},
 {id:'recovery',name:'04 · Tàn / phế',purpose:'Tỷ lệ phần tận dụng thu hồi tối thiểu trên khối lượng đầu vào đã đối soát.',material:true,unit:'%',outputUnit:'kg đầu vào',percent:true,minimum:true},
 {id:'routing',name:'05 · Công đoạn',purpose:'Danh sách mã nguyên công theo đúng thứ tự sản phẩm phải đi qua.',unit:'quy trình',outputUnit:'sản phẩm'},
 {id:'time',name:'06 · Thời gian',purpose:'Giờ trong ca từ bắt đầu đến bàn giao của từng công đoạn, trừ khoảng chờ đã duyệt.',operation:true,unit:'giờ',outputUnit:'bộ'},
 {id:'productivity',name:'07 · Năng suất',purpose:'Sản lượng công đoạn trên một giờ trong ca; không tự quy thành năng suất máy hoặc từng người.',operation:true,unit:'bộ',outputUnit:'giờ',minimum:true},
 {id:'labor',name:'08 · Nhân công',purpose:'Tổng giờ công cần cho một đơn vị sản phẩm. Cần ghi nhận giờ từng người để đối chiếu thực tế.',operation:true,unit:'giờ công',outputUnit:'bộ'},
 {id:'machineHours',name:'09 · Máy',purpose:'Giờ máy cần cho một đơn vị sản phẩm. Giờ trong ca của người phụ trách không phải số đo giờ máy.',operation:true,unit:'giờ máy',outputUnit:'bộ'},
 {id:'consumable',name:'10 · Tiêu hao',purpose:'Điện, khí, dây hàn, đá mài, sơn… theo đơn vị đo và căn cứ cụ thể.',unit:'kWh',outputUnit:'bộ'},
 {id:'quality',name:'11 · Chất lượng',purpose:'Tỷ lệ không đạt tối đa ở lần QC cuối lệnh đang ghi nhận; không phải tỷ lệ lỗi lũy kế hoặc làm lại.',unit:'%',outputUnit:'sản phẩm kiểm tra',percent:true},
 {id:'finance',name:'12 · Giá thành',purpose:'Chi phí chuẩn trên một đơn vị sản phẩm; so với chứng từ chi phí đã gắn lệnh, chưa khẳng định đủ giá thành.',unit:'đ',outputUnit:'bộ'},
 {id:'other',name:'Định mức khác / dữ liệu cũ',purpose:'Tham chiếu bổ sung có căn cứ; không tự suy số đo thực tế.',unit:'kg',outputUnit:'bộ'}
];
function validate(b,{text,number,fail}){
 const g=groups.find(g=>g.id===b.category);if(!g)fail(400,'Nhóm định mức không hợp lệ');
 const control={operationRateId:text(b.operationRateId||'',100),machineId:text(b.machineId||'',100),sequence:[]};
 if(g.operation&&!control.operationRateId)fail(400,'Chọn nguyên công áp dụng');
 if(g.id==='routing'){
  if(!Array.isArray(b.sequence)||!b.sequence.length||b.sequence.length>100)fail(400,'Khai thứ tự nguyên công');
  control.sequence=b.sequence.map(id=>text(id,100,true));
 }else number(b.quantity,g.percent?100:1e12,!g.percent);
 if(g.percent&&(b.unit!==g.unit||b.outputUnit!==g.outputUnit))fail(400,'Tỷ lệ phải đúng đơn vị và mẫu số của nhóm');
 if(['time','labor','machineHours','finance','routing'].includes(g.id)&&b.unit!==g.unit&&!(g.id==='finance'&&b.unit==='VND'))fail(400,'Đơn vị không phù hợp nhóm định mức');
 if(g.id==='productivity'&&b.outputUnit!=='giờ')fail(400,'Năng suất tính trên một giờ');
 return control;
}
function compare({norms,j,actual,review}){
 const rows=[],product=j.packet.product,ops=j.packet.operations||[],progress=j.progress.operations||[];
 for(const n of norms.filter(n=>n.active&&n.product===product.name)){
  const g=groups.find(g=>g.id===n.category);if(!g)continue;
  let value=null,basis='Chưa có số đo thực tế phù hợp',target=n.quantity,unit=n.unit,scope='',provisional=j.state!=='completed';
  const add=()=>{const delta=Number.isFinite(value)?value-target:null;rows.push({id:n.id,version:n.version,name:n.name,category:n.category,scope,target,unit,actualValue:value,delta,direction:g.minimum?'minimum':'maximum',status:delta===null?'missing':provisional?'provisional':(g.minimum?delta>=-1e-9:delta<=1e-9)?'within':'outside',basis,provisional});};
  if(['loss','recovery','material','nesting'].includes(n.category)){
   const m=actual?.materials.find(m=>m.materialId===n.materialId);
   const dims=['length','width','thickness'];
   const sameStock=!dims.some(k=>n[k])||(m?.issued?.length&&m.issued.every(l=>dims.every(k=>Number(l[k]||0)===Number(n[k]||0))));
   if(g.percent){if(m?.balance==='balanced'&&sameStock&&m.inputWeight>0){value=(n.category==='loss'?m.scrapWeight:m.remnantWeight)/m.inputWeight*100;basis='Đối soát khối lượng cấp / phần tận dụng / phế; '+(m.latestOperation||'');}}
   else if(n.outputUnit===(product.unit||'bộ')){
    target*=j.quantity;
    if(n.category==='material'&&n.unit==='kg'&&!dims.some(k=>n[k])&&m?.balance==='balanced'){value=m.inputWeight-m.remnantWeight;basis='Tiêu hao gồm phế = đầu vào − phần tận dụng đã đối soát';}
    else if(m?.issued?.length&&sameStock&&(!['tấm','thanh'].includes(n.unit)||n.length>0&&(n.unit!=='tấm'||n.width>0))&&m.issued.every(l=>l.unit===n.unit)&&!m.externalWeight){value=m.issued.reduce((s,l)=>s+l.quantity,0);basis='Phôi đã cấp đúng đơn vị và khổ; chưa trừ hoàn dư';provisional=true;}
   }else basis='Đơn vị sản phẩm không khớp định mức';
  }else if(n.category==='routing'){
   const expected=n.sequence||[],got=ops.map(o=>o.rateId);target=expected.join(' → ');value=got.join(' → ');unit='';provisional=false;
   rows.push({id:n.id,version:n.version,name:n.name,category:n.category,target,unit,actualValue:value,delta:null,status:expected.length&&JSON.stringify(expected)===JSON.stringify(got)?'within':'outside',basis:'Thứ tự mã nguyên công trong hồ sơ lệnh; so đầy đủ cả bước lặp',provisional});continue;
  }else if(['time','productivity','labor','machineHours'].includes(n.category)){
   const matches=ops.filter(o=>o.rateId===n.operationRateId&&(!n.machineId||(progress.find(p=>p.id===o.id)?.machineId||o.machineId)===n.machineId));
   if(!matches.length)basis='Lệnh không có nguyên công / máy khớp phạm vi';
   for(const o of matches){
    value=null;target=n.quantity;scope=o.name+' · '+(o.object||o.id);const p=progress.find(p=>p.id===o.id),r=review?.rows.find(r=>r.id===o.id);provisional=!p?.handedOverAt;
    basis=n.category==='labor'?'Chưa có tổng giờ thực tế của từng người':n.category==='machineHours'?'Chưa có số đo giờ máy thực tế':'Cần bàn giao, đủ lịch làm việc đã duyệt và đúng đơn vị sản lượng';
    if(['time','productivity'].includes(n.category)&&p?.handedOverAt&&r?.actualHours>0&&p.output>0){
     if(n.category==='time'&&n.outputUnit===o.outputUnit){target=n.quantity*p.output;value=r.actualHours;basis='Giờ trong ca đã duyệt, trừ chờ hợp lệ; mức chuẩn × sản lượng công đoạn';}
     if(n.category==='productivity'&&n.unit===o.outputUnit){value=p.output/r.actualHours;basis='Sản lượng công đoạn / giờ trong ca đã duyệt đến bàn giao';}
    }add();
   }
   if(matches.length)continue;
  }else if(n.category==='quality'){
   const qc=j.progress.qc,total=(qc?.passed||0)+(qc?.rejected||0);if(qc?.at&&total>0){value=qc.rejected/total*100;basis='QC cuối lệnh hiện tại: không đạt / tổng đã kiểm; không bao gồm lịch sử làm lại';provisional=total!==j.quantity;}
  }else if(n.category==='finance'){
   if(n.outputUnit===(product.unit||'bộ')){target*=j.quantity;if(actual?.costs?.some(c=>c.entries.length)||actual?.unassignedCosts?.length){value=actual.recordedTotal;basis='Tổng chứng từ chi phí đã gắn lệnh; chưa xác nhận đủ giá thành';provisional=true;}}
   else basis='Đơn vị sản phẩm không khớp định mức';
  }
  add();
 }
 return rows;
}
module.exports={groups,validate,compare};
