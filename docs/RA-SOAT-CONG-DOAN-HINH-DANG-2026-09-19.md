# Công đoạn kỹ thuật và hình dạng phôi — 19/09/2026

Đối chiếu hai ảnh phản hồi của khách với bản mã nguồn trước khi sửa:

- Form công đoạn mới ẩn hai giá cơ sở, vẫn còn cách giá, hệ số và cấu hình gói. Cờ `catalog` dùng chung cho cả Đơn giá đầu vào nên cũng làm mất ô giá tại màn này.
- Máy sử dụng chưa nằm trong dữ liệu cho tài khoản kỹ thuật; máy chủ chưa cho lưu thông tin công đoạn bằng quyền Danh mục quy ước.
- Cột hình dạng phôi chỉ nhận các tên cố định. Chưa có chỗ khai tên phôi riêng trong quy ước.

## Cách dùng sau sửa

1. **Danh mục quy ước → Công đoạn**: thêm/sửa tên công đoạn, máy sử dụng và ghi chú kỹ thuật. Không hiện bảng giá, hệ số hay gói công tại đây. Danh mục hiển thị máy ngay trên từng dòng.
2. **Đơn giá đầu vào → Nguyên công & hệ số**: khai giá tại xưởng, thuê ngoài, cách tính, hệ số và gói như trước. Sửa công đoạn kỹ thuật giữ nguyên các dữ liệu giá đã khai.
3. **Hình dạng & công thức → + Hình dạng phôi / quy ước**: khai nhóm chi tiết, chọn dạng cơ sở, nhập tên hình dạng phôi mới hoặc chọn tên gợi ý; khai thông số và công thức. Tên riêng không tự sinh công thức hay mô hình 3D. Khổ mua vẫn theo thanh/tấm; khối lượng và diện tích theo công thức đã kiểm.
4. Lưu phiên bản rồi **Lưu danh mục máy chủ** để dùng chung. Tạo mã vật tư từ quy ước để sử dụng trong báo giá; báo giá đã lưu giữ bản quy ước cũ.

Quyền `catalogRules` cho sửa thông tin kỹ thuật của công đoạn; không cho sửa đơn giá, đơn vị giá, hệ số hoặc xóa công đoạn. Quyền công thức vẫn kiểm riêng. Công đoạn mới do kỹ thuật tạo cần bộ phận giá khai giá thực tế tại Đơn giá đầu vào.

## Kiểm tra

- `tests/technical-catalog.test.cjs`: lưu tên/máy/ghi chú, tạo công đoạn, tải lại, giữ giá và từ chối giả mạo giá/đơn vị, vượt giới hạn hoặc sửa sau thu hồi quyền.
- `tests/catalog-technical-browser.cjs`: thao tác quản trị và kỹ thuật; form kỹ thuật tách biệt giá; hình dạng riêng → mã vật tư → báo giá lưu máy chủ → tính 60 kg; lưu/tải lại danh mục.
- Toàn bộ kiểm thử `*.test.cjs` chạy trên cây mã đã chọn phát hành. Kiểm thử CRM được cập nhật theo thay đổi ẩn thông tin khách hàng khỏi kỹ thuật đã có từ commit 6625555.
- `tools/verify-catalog-technical.cjs`: đối chiếu hash bản dựng Railway, mở các form; chỉ đăng nhập/đọc, không lưu dữ liệu nghiệp vụ.

Các sửa dở về giá vận chuyển mẫu và tab vận chuyển trong Danh mục quy ước từ phiên trước được giữ tại workspace, không đưa vào bản sửa này. Phạm vi rà soát này là hai ảnh mới; không xác nhận thay cho nghiệm thu toàn bộ checklist. Excel cũ vẫn cần bảng Quy uoc/công thức nguồn và ánh xạ dữ liệu trước khi nhập thật.

Kết quả xác minh: 507/507 kiểm thử dữ liệu/máy chủ đạt; luồng trình duyệt mới đạt. Railway đã phục vụ bản sửa 39d7304, hash HTML khớp cây mã đã kiểm; các form đạt, không lỗi JavaScript, không ghi dữ liệu nghiệp vụ. Hồ sơ tại artifacts/customer-review/catalog-finish-20260919/live/results.json. Kiểm thử trình duyệt cũ shape-row-browser dừng ở selector tạo báo giá đã thay đổi; không tính là đã đạt.
