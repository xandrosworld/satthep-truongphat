# Thu nhỏ và chuyển tab bảng quản lý

Áp dụng cho cửa sổ Đơn hàng và Lệnh sản xuất:

- Bấm vùng ngoài cửa sổ hoặc Thu nhỏ/Escape để thu xuống thanh tab.
- Bấm tab để mở toàn màn hình, chừa thanh tab bên dưới để đổi bảng.
- Chuyển tab giữ nguyên DOM, bộ lọc, vị trí cuộn và dữ liệu đang nhập.
- Thu nhỏ không phát sự kiện đóng, không hủy yêu cầu tải đang chạy.
- Nút Đóng vẫn đóng bảng và bỏ tab. Đổi tài khoản/đăng xuất dọn các tab.
- Form xác nhận/chỉnh sửa con vẫn là dialog riêng, nằm trên bảng đang mở.
- Bảng đã thu nhỏ không cản làm mới bảng công việc hoặc nơi hiện báo chat.

Không lưu nội dung form vào localStorage/sessionStorage. Kiểm thử:

- `npm run build`
- `node tests/console-workspace-browser.cjs`: thu nhỏ, mở rộng, đổi tab,
  giữ input/scroll, form con, Escape, điện thoại, đóng và đổi phiên.
- `node tests/console-workspace-server-browser.cjs`: API đơn hàng/sản xuất,
  bộ lọc và form tạo đơn chưa lưu giữ nguyên qua chuyển tab; không tạo đơn thử.
