# Thống nhất phân quyền và mẫu theo vị trí — 29/09/2026

Runtime `12596c7`, production healthy tại truongphat-group.xyz.

## Giao diện

Thống nhất bảng hai cột: nội dung và các quyền/mức được cấp. Các nhóm gồm thao tác theo phân hệ/danh mục, phạm vi dữ liệu, quyền đặc biệt, quản trị dữ liệu. Dùng ô vuông có nhãn tại dòng, không trộn radio tròn và checkbox. Phạm vi dữ liệu chỉ chọn một mức; bỏ chọn chuyển về Không được xem. Sửa công thức yêu cầu Xem; bỏ Xem thu hồi Sửa. Áp dụng layout chung cho màn hình bộ quyền và tài khoản. Màn hình nhỏ chuyển lựa chọn thành một cột, không tràn ngang.

## Mẫu tham khảo

Có 9 mẫu: kinh doanh nhân viên/trưởng phòng, kỹ thuật nhân viên/trưởng phòng, vật tư–giá nhân viên/trưởng phòng, kế toán, HCNS, sản xuất nhân viên.

- Kinh doanh nhân viên: khách hàng xem/thêm/sửa, đầu vào báo giá, xem giá chào, xác nhận/bàn giao, công việc cá nhân và chat. Không giao việc cho người khác, không giao kỹ thuật/giá, không xem chi phí nội bộ hoặc duyệt giá cuối.
- Trưởng phòng kinh doanh: thêm dailyWork.assign để giao và theo dõi công việc trong phạm vi sơ đồ tổ chức. Không cấp quotes.assign để giao phần việc kỹ thuật/giá.
- Kỹ thuật/vật tư–giá trưởng phòng: thêm giao công việc và quotes.assign, phạm vi do vị trí quản lý và luồng phòng ban quyết định.
- HCNS: khai và gửi duyệt; không mặc định duyệt hồ sơ hoặc cấp quyền. Kế toán không tự có quyền duyệt/hủy. Sản xuất không tự có quyền phát hành/duyệt thay đổi.

Chọn mẫu chỉ điền form; không ghi máy chủ đến khi lưu. Mỗi mẫu có giải thích. Khi dùng theo sơ đồ tổ chức, gắn bộ quyền vào vị trí; trưởng phòng phải bật Quản lý ở vị trí và chọn đúng luồng. Một người kiêm nhiệm nhận hợp quyền từ các vị trí. Danh bạ khách hàng vẫn là danh bạ chung theo cơ chế hiện có; mẫu không bổ sung bộ lọc bảo mật riêng cho từng khách hàng.

## Kiểm tra

- tests/permissions-unified-browser.cjs: cả 9 mẫu lưu thành công qua API local; phân biệt nhân viên/trưởng phòng; không mặc định cấp quản trị hoặc duyệt giá; quyền/mức độc quyền và phụ thuộc công thức; desktop/mobile. Kiểm tra work-scope với dữ liệu role đã lưu: trưởng phòng giao/theo dõi nhân viên cùng phòng, không giao/xem công việc phòng khác; nhân viên không giao việc người khác.
- Build và 4 kiểm thử độc lập về schema/action/catalog/section đạt.
- Chạy rộng tests/action-access.test.cjs và tests/section-access.test.cjs có 12 kiểm thử dừng ở fixture tạo tài khoản cũ (POST users thiếu employeeId trả 409, thay đổi từ luồng nhân sự trước đó). Không coi hai suite cũ đã đạt đầy đủ. Kiểm thử mới tạo/lưu mẫu trên máy chủ local trực tiếp, không phụ thuộc fixture cũ.
- Production HTTPS 1440x1000 và 390x844: 9 nút mẫu, không còn radio, mẫu KD nhân viên/trưởng phòng đúng, chọn một mức, không tràn ngang; không có lỗi JavaScript. Chặn ghi nghiệp vụ và so sánh roles trước/sau: không thay bộ quyền đang áp dụng. Phiên tạm đã thu hồi.
