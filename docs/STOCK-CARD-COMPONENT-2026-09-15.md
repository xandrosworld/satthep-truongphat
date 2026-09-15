# Khổ mua tại thẻ kho và thêm cấu kiện

- Danh mục vật tư có nút Thẻ kho tại mỗi mã phôi. Khai khổ mặc định và các khổ khác tại đây; bỏ phần này khỏi hai form tạo/sửa mã vật tư.
- Giữ dữ liệu khổ cũ để không mất khai báo. Sửa mã không xóa khổ; mã mới chưa khai thẻ kho không tự gán khổ mẫu. Chuyển loại hình dạng thì cần khai lại khổ phù hợp.
- Dòng báo giá cũ giữ snapshot. Chọn khổ trong báo giá lấy được các khổ từ thẻ kho; mã mới dùng khổ mặc định đã khai.
- Thêm cấu kiện có lựa chọn Cấu kiện trống hoặc mẫu cấu kiện. Tên trống dùng Cấu kiện mới; chọn vật tư sau là tùy chọn. Mẫu sao chép thành phần và công đoạn, tạo ID riêng, thêm đúng sản phẩm cha.
- Thẻ kho trong đợt này quản lý quy cách khổ mua; chưa mở rộng sang sổ nhập/xuất/tồn. Dữ liệu lưu cùng hồ sơ danh mục hiện hành để tương thích sao lưu/API.

Kiểm chứng: 314 kiểm thử logic, 58 kiểm thử API cục bộ, 21 nhóm trình duyệt. Chứng cứ: artifacts/customer-review/stock-card-component-2026-09-15/. Chưa đánh dấu khách nghiệm thu.
