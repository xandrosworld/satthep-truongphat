# Quay lại báo giá đang làm — 29/09/2026

Nút Báo giá trên thanh bên bị handler trong production-ui.js chặn và luôn mở teamList, kể cả có báo giá đang làm. Không phải mất dữ liệu, nhưng người dùng phải tìm lại báo giá.

Đã sửa: khi có báo giá được nạp và có liên kết, chuyển về page quote và render bản trong bộ nhớ; không gọi teamLoad, không tải đè nội dung. Giữ tab, lựa chọn và thay đổi chưa lưu. Khi chưa mở báo giá, vẫn mở danh sách. Nút Danh sách riêng không đổi.

Kiểm tra trình duyệt:
- Tài khoản kỹ thuật từ danh mục về báo giá bằng nút sidebar: đúng id, đúng mục hao hụt, số lượng chưa lưu và trạng thái dirty giữ nguyên.
- Danh mục chưa lưu vẫn giữ sau khi chuyển trang; lỗi lưu danh mục vẫn có thông báo.
- Nút Danh sách và nhánh chưa có báo giá vẫn mở danh sách.
- Bộ kiểm tra khôi phục sau tải lại trang, mục giá, dòng chọn, kho, bảng công việc, liên kết trực tiếp và đăng xuất đạt.

Runtime: 2dd6f74. Triển khai sau sao lưu. Không thay đổi dữ liệu nghiệp vụ.
