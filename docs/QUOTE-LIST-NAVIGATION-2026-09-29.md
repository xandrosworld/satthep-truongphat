# Danh sách và trang chủ báo giá — 29/09/2026

Runtime `86fa4ef`, production healthy. Danh sách báo giá máy chủ mở gần hết màn hình, điện thoại toàn màn hình; bảng giữ cuộn ngang khi cần. CSS chỉ áp dụng hộp thoại có bảng quotes-list.

Thêm Về trang Báo giá cho danh sách thường và kỹ thuật. Trang chính hiển thị danh sách dùng chung, giữ tài liệu đang mở và trạng thái chưa lưu; có Tiếp tục báo giá đang mở. Mở báo giá từ trang chủ trở lại màn hình biên tập, giữ các kiểm tra sẵn có của teamLoad. Đổi phiên đăng nhập xóa trạng thái điều hướng tạm.

Build và tests/quote-list-navigation-browser.cjs đạt: độ rộng desktop/mobile, chuyển từ Khách hàng về trang Báo giá, giữ nguyên db và dirty flag, tiếp tục bản đang sửa, mở bản từ trang chủ. HTTPS production kiểm tra ở 1440x1000 và 390x844, 27 báo giá hiện đủ, nút điều hướng hoạt động, không lỗi JavaScript. Chặn mọi ghi nghiệp vụ khi kiểm tra live; phiên tạm đã thu hồi.
