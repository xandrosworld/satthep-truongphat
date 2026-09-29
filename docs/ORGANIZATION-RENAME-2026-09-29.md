# Sửa tên phòng ban khi cơ cấu thay đổi — 29/09/2026

Runtime `1a2af1e`, production healthy.

Ảnh báo lỗi stale version: cơ cấu nhân sự đã thay đổi. Form trước đây gửi lại toàn bộ cơ cấu với version lúc mở, nên thay đổi ở phần khác cũng chặn đổi tên.

Form sửa phòng ban hiện gửi PATCH các trường thay đổi và giá trị gốc của chúng. Máy chủ đọc cơ cấu mới nhất trong transaction, kiểm tra từng trường sửa rồi dùng lại validation, phân quyền và lưu revision của luồng hiện có. Giữ các thay đổi không liên quan; nếu cùng trường đã bị sửa khác thì trả 409 và giữ bản nhập. Không phục hồi phòng đã bị xóa. Luồng thêm phòng, bố trí nhân sự, sửa vị trí vẫn giữ kiểm tra version toàn bộ như trước.

Kiểm thử `tests/organization-rename-browser.cjs` qua trình duyệt + API local: đổi tên thành công sau khi phòng khác đổi tên và trạng thái cùng phòng thay đổi; giữ hai thay đổi đó. Khi cùng tên được người khác sửa thì báo xung đột và giữ nội dung đang nhập. Regression xóa đơn vị và build đạt.

Đã triển khai và đổi Ban dự án thành Phòng dự án trực tiếp qua UI production. Tải lại trang vẫn giữ tên mới; so sánh trước/sau xác nhận phòng khác, vị trí, nhân sự và tài khoản giữ nguyên. Phiên xác minh tạm đã thu hồi; có backup trước triển khai.
