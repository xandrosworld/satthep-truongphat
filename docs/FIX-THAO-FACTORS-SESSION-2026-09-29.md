# Hệ số mục 6 và phiên yêu cầu của Thảo

Runtime f374279, triển khai ngày 29/09/2026. Đã sao lưu trước triển khai; xác minh 99 SHA runtime, health và HTML công khai đạt.

- API và phép tính có dữ liệu bảo vệ lấy lại CSRF và thử đúng một lần khi máy chủ báo phiên yêu cầu không hợp lệ. Chỉ phục hồi khi vẫn cùng tài khoản. Lỗi phân quyền không được tự thử lại hoặc cấp thêm quyền.
- Mục hệ số giải thích quyền bị thiếu và có Kiểm tra lại quyền. Phiên bị thu hồi có đăng nhập lại tại chỗ. Khi đổi quyền ẩn/hiện, lưu nháp trước khi lấy lại dữ liệu thật; không dùng số 0 bị che làm hệ số mới.
- Khóa bảng hệ số chung không chặn cửa vào sửa hệ số riêng báo giá tại mục 6 nếu tài khoản có quyền. Dùng hộp khai hệ số riêng đã được bảo vệ.
- complexityLevels là thông tin phục vụ giao diện; loại khỏi payload trước kiểm tra thay đổi. Tránh lỗi nguyên công khi lưu bản nháp từ phiên ẩn hệ số sau khi được cấp quyền.

Kiểm tra: 18 core/API đạt (quyền công thức, khóa, bàn giao và giới hạn trước/sau duyệt); trình duyệt phục hồi CSRF bất đồng bộ/đồng bộ, giới hạn một lần thử, khác tài khoản, thiếu quyền, cấp quyền và đăng nhập lại, giữ bản nháp, lưu/mở lại hệ số đạt cho cả quyền xem và quyền dùng hệ số ẩn. Giá đúng đơn vị, thử lại sau lỗi lưu, hệ số riêng dưới khóa chung, nguyên công với hệ số ẩn đều đạt. Kiểm tra lại bản commit riêng trước phát hành.

Bản sao DB mới nhất: nv-002 có factors=false, factorMode=use. Không thay quyền hay báo giá thật. Thử bản sao BG-20260922-002 với factors=configure và can_factors=1: nhập hệ số quản lý ở mục 6, lưu/mở lại đúng, rates và ratesSnapshot không đổi. Admin cần cấp mức Hệ số: Bổ sung / cài đặt và Được sửa hệ số nếu muốn Thảo chỉnh. Chưa có xác nhận từ trình duyệt khách.
