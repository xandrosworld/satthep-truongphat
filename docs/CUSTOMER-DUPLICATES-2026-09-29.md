# Chặn khách hàng trùng — 29/09/2026

Runtime `7272cda`, production healthy tại truongphat-group.xyz.

Nguyên nhân: lưu trực tiếp CRM thiếu kiểm tra định danh; teamDialog không trả Promise nên khóa gửi của openDialog được gỡ trước khi request hoàn tất.

Sửa: trả Promise để giữ khóa đến khi lưu xong; kiểm tra phía máy chủ trên đường ghi chung (bao gồm import). Chặn trùng mã số thuế, mã khách, tên chuẩn hóa; cho phép cùng tên khi hai mã số thuế khác nhau. Sửa chính hồ sơ vẫn được; các hồ sơ trùng cũ vẫn có thể được chăm sóc nếu không tạo thêm xung đột.

Dữ liệu VIVIAN (MST 0311790858): 10 hồ sơ → 1. Giữ `nmul2vk5wr` đang liên kết 1 báo giá; không sửa bản chụp báo giá/revision. Bổ sung địa chỉ; giữ 10 sự kiện lịch sử, người phụ trách và các trường đã khai. Lưu nguyên 10 bản trước gộp trong `customer_duplicate_archive`, có audit `customer-deduplicate` và backup trước triển khai. Script `tools/repair-vivian-duplicates.cjs` kiểm tra số lượng, version, xung đột trường và mọi tham chiếu trước khi gộp; mặc định chỉ xem trước, ghi cần --apply. Chỉ xử lý nhóm VIVIAN được báo, không tự gộp khách khác.

Đã kiểm thử:
- tests/customer-duplicates.test.cjs: tạo/sửa, chuẩn hóa, sửa chính hồ sơ, khác MST, 8 yêu cầu đồng thời chỉ 1 thành công, import trùng rollback.
- tests/customer-save-browser.cjs: khóa gửi trùng trong lúc chờ, lỗi giữ nội dung và cho sửa lại.
- Build thành công.
- HTTPS production: gửi thử khách trùng bị 409, số hồ sơ vẫn 1, địa chỉ và 10 sự kiện còn nguyên, báo giá vẫn liên kết đúng. Phiên xác minh tạm đã thu hồi.
