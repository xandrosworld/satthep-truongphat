# Một nguồn hồ sơ nhân sự

## Luồng sử dụng

1. HCNS vào Nhân sự, khai đủ hồ sơ và gửi duyệt.
2. Người có quyền duyệt xét hồ sơ; hồ sơ chờ duyệt chưa vào danh sách bố trí.
3. Người quản trị cơ cấu chọn hồ sơ đã có để bố trí vị trí trong sơ đồ.
4. Tạo/kích hoạt tài khoản từ nhân sự đã khai, quyền lấy theo vị trí.

Nhân sự và liên kết tài khoản đã tồn tại được giữ nguyên, không tạo lại hoặc
tự gộp theo họ tên. Lịch sử và các mã tham chiếu chấm công/lương giữ nguyên.

## Thay đổi

- Bỏ thêm/xóa hồ sơ và sửa thông tin cá nhân ở Cơ cấu tổ chức; form chỉ bố trí
  vị trí. API cũng từ chối thêm/xóa/sửa hồ sơ qua đường cơ cấu.
- Tạo tài khoản phải chọn `employeeId` có trong nguồn nhân sự, đang hoạt động,
  chưa có tài khoản và đã bố trí vị trí có bộ quyền. Không nhận họ tên mới
  hoặc quyền độc lập từ yêu cầu tạo tài khoản.
- Họ tên tài khoản lấy từ hồ sơ đã duyệt; màn hình tài khoản chỉ sửa tên đăng
  nhập, không sửa họ tên riêng. Hồ sơ HCNS không kiêm chức năng bố trí quyền.
- Duyệt hồ sơ mới giữ đúng ID của đề nghị; kiểm tra lại trùng mã lúc duyệt.
- Năng lực nhân sự công ty tổng hợp theo hồ sơ đang làm và vị trí hoạt động.
  Người kiêm nhiệm được tính tại từng vị trí; không nhập số người riêng.
  Dữ liệu tổng hợp cũ trong bản ghi công ty vẫn được giữ, không dùng làm nguồn.
- Chấm công/lương vốn dùng `organization.employees`; tiếp tục dùng cùng nguồn,
  không đổi ID hoặc tạo danh mục nhân sự mới.

## Kiểm thử

- `node --test tests/personnel-source.test.cjs tests/personnel.test.cjs`:
  hồ sơ/duyệt/bố trí/tài khoản, chặn đường thêm và sửa tắt, tên dùng chung,
  chấm công, tổng hợp năng lực, trùng mã khi duyệt, quyền HCNS và kích hoạt.
- `node tests/personnel-browser.cjs`: 101 trường, gửi/duyệt, xuất Excel, mobile,
  bố trí không có ô khai hồ sơ, tạo tài khoản mở danh sách nhân sự có sẵn.
- `npm run build`.

API tạo tài khoản trước đây nhận hồ sơ tự khai; nay cần `employeeId`.
Các fixture kiểm thử cần tạo hồ sơ được duyệt trước; helper
`tests/helpers/personnel-user.cjs` cung cấp luồng này. Không chạy toàn bộ bộ
kiểm thử cũ vì nhiều fixture còn giả định luồng tạo nhân sự trực tiếp.
