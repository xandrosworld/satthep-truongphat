# Quy trình và phân luồng dùng chung — 30/09/2026

## Yêu cầu và cách sử dụng

Mục **Quy trình & phân luồng** có bảng tổng hợp cho chào giá, đơn hàng, hợp đồng, sản xuất, mua hàng và từng loại đề nghị (kể cả loại đề nghị tự khai). Admin chọn đơn vị từ cơ cấu tổ chức, ghi nội dung cần xử lý và bật từng quy trình. Có thể thêm/bỏ bước rà soát bổ sung; các bước nghiệp vụ bắt buộc giữ đúng thứ tự.

Mẫu cấp vật tư: Kỹ thuật → Kho → Vật tư–giá → Duyệt → Mua/chuẩn bị phần còn thiếu → Cấp và bàn giao. Người duyệt có thể chỉ định đơn vị mua/chuẩn bị; xuất kho vẫn do đơn vị có quyền kho thực hiện. Đề nghị không thiếu vật tư vẫn xác nhận căn cứ không cần mua ở bước chuẩn bị, không sinh chi phí mua tự động.

Bộ phận nhận việc theo bảng quy trình; trưởng bộ phận hoặc Admin giao cá nhân đủ quyền trong đơn vị. Khi chưa giao cá nhân, chỉ quản lý đủ quyền hoặc Admin xác nhận được. Giao việc không cấp thêm quyền duyệt, giá, xuất kho hay tài chính. Phân công kỹ thuật/giá từ báo giá đồng bộ với quy trình và ngược lại.

Bước rà soát ghi kết quả tại công việc quy trình. Bước duyệt, gửi chào giá, chốt đơn/hợp đồng, phát hành lệnh, cấp kho và hoàn thành sử dụng thao tác tại hồ sơ gốc. Thành công mới chuyển bước; nếu sai trình tự hoặc sai người xử lý thì toàn bộ giao dịch được hoàn tác. Vẫn lưu nháp bình thường. Các bước thương thảo, trình đề nghị, rà soát, chuẩn bị vật tư cần xác nhận có căn cứ; không thay thế chứng từ mua hay kiểm tra kỹ thuật gốc.

## Phiên bản và triển khai

- Mẫu ban đầu **chưa bật**, chưa tự chọn đơn vị thay khách hàng.
- Bật mẫu chỉ áp dụng cho hồ sơ tạo mới. Hồ sơ cũ giữ cách xử lý hiện tại.
- Hồ sơ đang chạy lưu toàn bộ các bước và phiên bản tại thời điểm tạo; thay bảng chung không âm thầm chuyển người phụ trách.
- Admin có thể chuyển riêng hồ sơ đang chạy sang phiên bản đang áp dụng, kèm lý do. Chỉ cho chuyển khi danh sách bước tương thích; giữ kết quả bước đã hoàn tất, cập nhật từ bước hiện tại trở đi.
- Khi thay đổi số bước, các hồ sơ cũ tiếp tục phiên bản cũ; không tự chèn thêm bước vào giữa hồ sơ đang xử lý.
- Đơn vị ngừng hoạt động hoặc không còn nhân sự đủ quyền không được nhận hồ sơ mới qua cấu hình cũ; cần cập nhật quy trình.
- Cấu hình, lịch sử cấu hình, hồ sơ chạy và lịch sử giao việc nằm trong `enterprise_records`, đã thuộc sao lưu hiện tại.

## Kiểm tra

Đạt 17 ca API trong nhóm quy trình, đề nghị, mua vật tư, sản xuất và phân quyền. Bao gồm: sai phòng, nhân sự bị ngừng, CAS, phát lại thao tác, phiên bản cấu hình, chuyển riêng hồ sơ, chặn duyệt trước rà soát, chặn đơn hàng trước gửi chào giá, chốt hợp đồng bởi Admin, chặn phát hành lệnh trước duyệt đề nghị, hoàn tác cả chứng từ khi bị chặn, cấp kho từng phần và tránh xuất hai lần, mua đến nhập kho và ghi chi phí.

Hai ca trình duyệt đạt: cấu hình → giao cá nhân → rà soát → mở hồ sơ gốc → tải lại; và hồi quy tìm/chọn/khai báo vật tư. Đã kiểm tra bố cục desktop và điện thoại.

Đã cập nhật hai fixture kiểm thử sản xuất cũ để tạo tài khoản qua hồ sơ nhân sự được duyệt, phù hợp cơ chế hiện tại. Không thay đổi kiểm tra nghiệp vụ của hai bộ kiểm thử này.

Kiểm tra web thật được thực hiện chỉ đọc: giao diện, bảng tổng hợp, cấu hình, bố cục điện thoại và tình trạng dịch vụ; không tạo hồ sơ thử hoặc bật quy trình trên dữ liệu thật.
