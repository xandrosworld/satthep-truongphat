 'use strict';
const f=(key,label,type='text')=>({key,label,type});
const types=[
 {id:'purchase',name:'Đề nghị mua',group:'finance',external:true,module:'purchasing',approve:'approve',work:'edit'},
 {id:'advance',name:'Đề nghị tạm ứng',group:'finance',module:'finance',approve:'approve',work:'create',fields:[f('amount','Số tiền đề nghị (VND)','number'),f('purpose','Mục đích sử dụng'),f('settlementDate','Ngày dự kiến hoàn ứng','date')]},
 {id:'expense',name:'Đề nghị duyệt chi',group:'finance',module:'finance',approve:'approve',work:'create',fields:[f('amount','Số tiền đề nghị (VND)','number'),f('payee','Đơn vị / người thụ hưởng'),f('basis','Căn cứ / chứng từ đề nghị chi')]},
 {id:'supply',name:'Đề nghị cấp vật tư, thiết bị',group:'production',module:'inventory',approve:'approve',work:'edit',mode:'supply'},
 {id:'maintenance',name:'Đề nghị bảo dưỡng',group:'production',module:'purchasing',approve:'approve',workModule:'workshop',work:'edit',mode:'repair'},
 {id:'repair',name:'Đề nghị sửa chữa',group:'production',module:'purchasing',approve:'approve',workModule:'workshop',work:'edit',mode:'repair'},
 {id:'supplement',name:'Đề nghị bổ sung vật tư',group:'production',module:'inventory',approve:'approve',work:'edit',mode:'supply'},
 {id:'return',name:'Đề nghị thu hồi vật tư',group:'production',module:'inventory',approve:'approve',work:'edit',fields:[f('items','Vật tư / số lượng / quy cách thu hồi'),f('source','Nguồn cấp / phiếu xuất / nơi thu hồi'),f('condition','Tình trạng và kho dự kiến nhận')]},
 {id:'outsource',name:'Đề nghị gia công ngoài',group:'production',module:'production',approve:'approveChange',workModule:'workshop',work:'edit',fields:[f('source','Lệnh / công đoạn liên quan'),f('items','Chi tiết / số lượng / yêu cầu gia công'),f('acceptance','Yêu cầu nghiệm thu / bàn giao')]},
 {id:'defect',name:'Đề nghị xử lý lỗi',group:'production',module:'production',approve:'qc',workModule:'workshop',work:'edit',fields:[f('source','Lệnh / công đoạn / biên bản lỗi'),f('defect','Lỗi / số lượng ảnh hưởng'),f('solution','Phương án xử lý đề xuất')]},
 {id:'staffing',name:'Đề nghị nhân lực',group:'production',module:'personnel',approve:'review',work:'edit',fields:[f('quantity','Số người','number'),f('skills','Vị trí / năng lực yêu cầu'),f('period','Thời gian / nơi bố trí')]},
 {id:'overtime',name:'Đề nghị tăng ca',group:'production',module:'attendance',approve:'approve',work:'edit',fields:[f('people','Nhân sự / bộ phận tăng ca'),f('period','Ngày / giờ bắt đầu, kết thúc, nghỉ'),f('workload','Công việc / khối lượng cần hoàn thành')]},
 {id:'production',name:'Đề nghị sản xuất',group:'production',module:'production',approve:'issue',work:'edit',fields:[f('source','Đơn hàng / căn cứ sản xuất'),f('items','Sản phẩm / số lượng / quy cách'),f('period','Kế hoạch thời gian / nơi thực hiện')]},
 {id:'other',name:'Đề nghị khác',group:'production',module:'dailyWork',approve:'approve',work:'edit',fields:[f('content','Nội dung cần xử lý'),f('expected','Kết quả cần đạt')]}
];
module.exports={types};
