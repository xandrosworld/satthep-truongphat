# Đề nghị công việc — 28/09/2026

Mở rộng mục Cấp vật tư / sửa chữa theo ảnh khách, giữ vị trí dưới Định mức và dữ liệu cũ.

## Các nhóm

- Tài chính: mua, tạm ứng, duyệt chi.
- Phục vụ sản xuất: cấp vật tư/thiết bị, bảo dưỡng, sửa chữa, bổ sung vật tư, thu hồi vật tư, gia công ngoài, xử lý lỗi, nhân lực, tăng ca, sản xuất, khác.
- Admin thêm/đổi tên/ngừng dùng loại khác. Loại bổ sung thuộc nhóm sản xuất, dùng quyền Công việc và báo cáo ngày; giữ tên loại lúc gửi và toàn bộ hồ sơ cũ. Đây không phải cấu hình quy trình duyệt tùy ý.

## Luồng và liên kết

Mua mở quy trình đề nghị mua hiện có, không tạo thêm chứng từ trùng. Cấp/bổ sung vật tư dùng duyệt kho và xuất theo lô từng phần; bảo dưỡng/sửa chữa ghi lịch sử máy một lần khi hoàn tất. Các quyền và kiểm tra tồn khả dụng của luồng cũ giữ nguyên.

Các loại còn lại: gửi → người có quyền duyệt và chọn người thực hiện đủ quyền → bắt đầu → báo kết quả kèm dẫn chiếu → người duyệt xác nhận hoàn tất hoặc trả về bổ sung. Có rút/từ chối; đổi người cần lý do và lưu lịch sử. Người được giao mất quyền không tiếp tục xử lý được; người duyệt có thể giao lại. Thông báo nội bộ theo bước, kiểm phiên bản và mã thao tác chống gửi lặp.

Tạm ứng/duyệt chi khai số tiền VND, mục đích/người thụ hưởng/căn cứ và ngày hoàn ứng dự kiến. Nhân lực khai số người nguyên dương; các loại khác có trường căn cứ, phạm vi, khối lượng hoặc thời gian phù hợp từng loại.

## Quyền

| Loại | Duyệt và xác nhận kết quả | Thực hiện |
|---|---|---|
| Tạm ứng, duyệt chi | finance.approve | finance.create |
| Cấp/bổ sung/thu hồi vật tư | inventory.approve | inventory.edit |
| Bảo dưỡng, sửa chữa | purchasing.approve | workshop.edit |
| Gia công ngoài | production.approveChange | workshop.edit |
| Xử lý lỗi | production.qc | workshop.edit |
| Nhân lực | personnel.review | personnel.edit |
| Tăng ca | attendance.approve | attendance.edit |
| Sản xuất | production.issue | production.edit |
| Khác, loại bổ sung | dailyWork.approve | dailyWork.edit |

Quyền gửi: một trong production.edit, workshop.edit, dailyWork.edit, attendance.edit, personnel.edit, finance.create, purchasing.create, inventory.create. Người gửi xem đề nghị của mình; người duyệt xem đúng loại theo quyền; người thực hiện xem đề nghị chưa phân công hoặc đã giao cho mình. Sau phân công, thao tác thực hiện thuộc người được giao và còn quyền phù hợp. Máy chủ kiểm tra độc lập với giao diện.

## Giới hạn nghiệp vụ

Các đề nghị mới là căn cứ phê duyệt và theo dõi xử lý. Chưa tự lập phiếu chi, giải ngân/hoàn ứng, nhập thu hồi, đơn thuê gia công, bố trí nhân sự, ngày công/lương hoặc lệnh sản xuất. Người xử lý thực hiện chứng từ tại phân hệ tương ứng, ghi dẫn chiếu kết quả để người duyệt đối chiếu; dẫn chiếu hiện là nội dung khai, chưa kiểm liên kết ID chứng từ. Duyệt đề nghị không đồng nghĩa đã thanh toán, đã nhập kho hoặc đã chấm công. Bộ phận/nơi sử dụng, các danh sách chi tiết của loại mới khai bằng nội dung; không tự suy số liệu hoặc phân cấp phòng ban.

## Kiểm tra

- 9 ca API/core trong bốn bộ service-requests, operations-erp, machine-records, department-material-requests đạt. Bài service-requests kiểm tra vòng đời từng loại mới, bắt buộc căn cứ, giao người, sai quyền, đổi người, trả lại/xác nhận kết quả, ngừng loại vẫn giữ hồ sơ, chống lặp/phiên bản, bảo dưỡng và cấp bổ sung.
- Hai browser service-requests và work-requests kiểm tra luồng cũ, tạm ứng, giao người, kết quả/trả lại/xác nhận, loại mở rộng, tải lại, mở mua hàng và khung 390 px.
- Build đạt. Kiểm thử ghi dùng dữ liệu riêng; tình trạng triển khai ghi ở checklist sau xác minh.

Triển khai `bb332cf`: đã sao lưu nguồn/SQLite, container healthy, HTTPS và 81 hash runtime khớp. Web thật đủ 14 loại và biểu mẫu desktop/390 px; chưa có hồ sơ thực tế. Phiên kiểm tra chặn ghi nghiệp vụ và đã thu hồi. Không thay thế nghiệm thu vận hành của khách.
