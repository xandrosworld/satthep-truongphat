# Sửa luồng chuyển nguồn quyền theo vị trí

Runtime triển khai: 77c3cab, ngày 29/09/2026.

Ảnh khách gửi: tài khoản chưa bố trí vị trí, chọn Theo vị trí rồi lưu chỉ nhận thông báo lỗi.

Đã bổ sung:
- Nút Bố trí vị trí mở đúng hồ sơ, lưu xong quay lại nguồn quyền.
- Nút sửa vị trí/bộ quyền và phòng ban cấp trên đang ngừng hoạt động.
- Khi chưa có cơ cấu, dẫn tới tạo phòng ban rồi tạo vị trí/bộ quyền.
- Không cho áp dụng nguồn theo vị trí khi chưa có vị trí hiệu lực; có đường sửa ngay.
- Giữ quyền trực tiếp trong bước bố trí, chỉ thay bằng bộ quyền vị trí khi quản trị lưu nguồn theo vị trí.
- Có nút quay lại khi đang sửa; nguồn đã chọn được giữ.
- Giữ kiểm tra phiên bản cơ cấu và quyền quản trị phía máy chủ.

Kiểm thử:
- Build thành công.
- tests/permission-source-browser.cjs: chuyển hai chiều, chưa bố trí, giữ quyền trực tiếp, áp dụng nguồn, sửa phòng ban cấp trên bị ngừng, quay lại.
- tests/organization-browser.cjs: phòng ban, vị trí, nhân sự, tạo tài khoản và bố cục di động.
- tests/permission-source.test.cjs, tests/organization.test.cjs: API quyền, phiên bản, vòng đời tài khoản.
- Production: healthz và HTML công khai thành công, 101 mã băm runtime đúng bản phát hành. Đã sao lưu trước triển khai.

Không tự chọn vị trí hay đổi nguồn quyền tài khoản khách trên dữ liệu thật. Quản trị cần chọn vị trí phù hợp rồi lưu nguồn. Chưa thao tác trên trình duyệt của khách.
