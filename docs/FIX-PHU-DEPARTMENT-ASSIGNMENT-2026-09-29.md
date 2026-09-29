# Giao việc kỹ thuật theo sơ đồ tổ chức

Anh Hợp xác nhận trưởng phòng được phân công nhân viên trong phòng và sẽ tự
bố trí nhân viên vào vị trí. Không tự thêm Huấn, Hanh, Trung vào phòng.

## Nguyên nhân và sửa

- Vị trí Trưởng phòng kỹ thuật đang `manager=false` nên Phú không được nhận
  diện là trưởng bộ phận giao việc.
- Bộ quyền của vị trí và tài khoản Phú thiếu `quotes.assign`. Chỉ bật quản lý
  làm nút hiện nhưng API vẫn từ chối lưu. Bổ sung đúng thao tác giao việc vào
  bộ quyền Trưởng phòng kỹ thuật để giữ hiệu lực khi cập nhật cơ cấu sau này.
- Đồng bộ thông tin `canEdit` của giao việc/handoff với quyền thao tác API;
  không hiển thị nút lưu giao việc cho người thiếu `quotes.assign`.
- Giữ giới hạn người nhận theo vị trí, phòng và cấp dưới trong sơ đồ tổ chức,
  còn hoạt động và có quyền làm kỹ thuật. Không cấp quyền sửa giá, duyệt,
  quản trị hoặc thay đổi trạng thái toàn báo giá cho Phú.

## Kiểm thử

- `node --test tests/department-assignment.test.cjs tests/organization.test.cjs tests/work-assignment-server.test.cjs`.
- `node tests/work-assignment-browser.cjs`.
- Bản sao dữ liệu thật: Phú thấy nút trên BG-20260923-003, chọn người trong
  phòng, lưu/tải lại trên báo giá thử; chặn người ngoài phòng, phần giá và
  trạng thái toàn báo giá; kiểm tra giao diện điện thoại.
- Kiểm thử API gồm nhân viên không được giao việc, thiếu thao tác assign bị
  chặn, phiên giao việc cũ bị từ chối, thông báo đúng người nhận, thay đổi vị
  trí/ngừng hoạt động được phản ánh ngay trong danh sách người nhận.

Việc ghi cấu hình có lịch sử cơ cấu, lịch sử quyền và audit. Nhân viên do
anh Hợp bố trí vào vị trí; người không thuộc cơ cấu không tự xuất hiện chỉ
vì có quyền kỹ thuật.
