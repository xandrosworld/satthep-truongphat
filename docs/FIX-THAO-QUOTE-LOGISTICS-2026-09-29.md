# Lưu vận chuyển bước 6 cho Thảo

## Nguyên nhân

Tài khoản `nv-002` có `catalogLogistics=configure` nhưng `logistics=view`.
Quyền cập nhật danh mục không cấp quyền sửa khoản vận chuyển trong báo giá.
Giao diện vẫn cho mở form; `saveAndClose` đóng form trước khi kiểm tra quyền
trong mutation, khiến lỗi lưu trông như mất dữ liệu vừa nhập.

## Sửa

- Kiểm tra quyền báo giá trước khi mở trình chọn, form khoản chi và tạo lô.
- Vô hiệu hóa nút sửa vận chuyển khi phần báo giá chỉ có quyền xem.
- Chỉ đóng form sau khi mutation thành công; lỗi giữ nội dung để thử lại.
- Khi thử lại sau rollback, tìm khoản chi theo ID trong bản báo giá hiện tại,
  tránh sửa tham chiếu cũ hoặc tạo khoản trùng.
- Cấp riêng `logistics=use` cho Thảo, giữ nguyên quyền khác và ghi lịch sử.

## Kiểm chứng

- `node tests/logistics-permissions-save-browser.cjs`: quyền danh mục không
  thay quyền báo giá; API vẫn chặn sửa trái quyền; lưu khoản nhập phôi và tải
  lại máy chủ; lỗi quyền/mutation giữ form và thử lại không trùng khoản.
- `node tests/logistics-method-picker-browser.cjs`.
- `node tests/logistics-technical-save-browser.cjs`.
- `node --test tests/logistics-lots.test.cjs`.
- Bản sao riêng của dữ liệu sản xuất: đăng nhập bằng quyền Thảo, tái hiện
  việc bị chặn trước khi cấp quyền; sau khi cấp lưu và tải lại được báo giá
  `BG-20260925-002`, gồm `VT-00019` với giá danh mục `VC-NHAP-01`, kg × km.
  Mật khẩu thử và khoản chi thử chỉ tồn tại trong bản sao, không ghi lên web.

Thảo cần tải lại trang để nhận quyền mới; sau khi lưu khoản chi vẫn bấm
**Lưu báo giá lên máy chủ** như luồng hiện hành.
