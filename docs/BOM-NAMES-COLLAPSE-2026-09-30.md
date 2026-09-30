# Đổi tên và thu gọn cấu thành — 30/09/2026

Bản triển khai: `ead50e1` trên https://truongphat-group.xyz.

## Phạm vi đã thực hiện

- Nút Đổi tên ngay trên sản phẩm và cấu kiện; giữ tên riêng khi lưu báo giá, lưu mẫu và gọi lại mẫu.
- Vật tư: menu ⋯ → Đổi tên tại danh mục vật tư; sử dụng luồng lưu/phê duyệt danh mục hiện có, không đổi tên riêng cho cùng mã. Nhân bản vật tư giữ tên theo mã.
- Thu gọn/mở từng cấu kiện, không thay đổi khối lượng, giá hoặc dữ liệu báo giá; tìm kiếm vẫn mở phần kết quả cần xem.
- Sửa trạng thái bản nháp danh mục sau khi phát hành mẫu: không coi mẫu vừa phát hành là mục bị xóa; lượt sử dụng mẫu không tạo thay đổi danh mục giả.
- Nếu mẫu cần duyệt, thông báo chờ duyệt thay vì báo đã phát hành.

Kéo thả đổi thứ tự chưa triển khai theo nội dung đã thống nhất với khách.

## Kiểm tra

- Build và kiểm tra cú pháp đạt.
- 28 bài kiểm thử dữ liệu, tên danh mục, thư viện, quyền công thức và dữ liệu kỹ thuật đạt.
- `tests/bom-names-collapse-browser.cjs`: đổi tên/lưu/tải lại; lưu và gọi mẫu; nhân bản vật tư; đổi tên danh mục và phát hành; thu gọn không làm thay đổi dữ liệu; điện thoại; chặn đổi tên bản chỉ đọc — đạt.
- `tests/template-library-browser.cjs`: phát hành mẫu, xử lý xung đột phiên bản, gọi mẫu sản phẩm/cấu kiện, lưu/tải lại, bảo vệ bản khóa — đạt. Cập nhật điểm vào gọi mẫu theo giao diện hiện hành.
- Kiểm tra web thật trên báo giá BG-20260923-003: thu gọn/mở cấu kiện, mở hộp thoại đổi tên, giao diện 390px — đạt; không ghi dữ liệu nghiệp vụ.
- Container `truongphat-quotation:ead50e1` healthy, `/healthz` OK. Sao lưu trước triển khai; đã thu hồi phiên kiểm tra tạm.
