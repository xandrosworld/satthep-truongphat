# Công suất và hao phí máy — 30/09/2026

- Khai riêng công suất điện đầu vào (kW) trong hồ sơ máy; máy cũ để trống nếu chưa có số liệu, không suy diễn từ công suất laser.
- Máy / năng lực → Hao phí / theo dõi; hoặc Định mức → Hao phí máy / theo dõi thực tế.
- Hai chế độ: bảng trung bình dùng chung cho mọi máy/vật liệu; bảng riêng theo máy và mã vật liệu gia công. Mỗi vật tư tiêu hao lấy mã, tên, đơn vị từ danh mục. Lượng định mức quy về một giờ máy chạy; hệ số tải điện > 0 và ≤ 1.
- Điện dự kiến = kW × giờ chạy × hệ số tải. Điện đo = công tơ cuối − công tơ đầu. Chưa khai công suất hoặc khảo sát chưa có định mức thì không tự tính điện dự kiến.
- Phiếu thực tế lưu giờ chạy, vật liệu gia công, lượng tiêu hao và người theo dõi/kiểm tra từ tài khoản nhân sự đang hoạt động. Có chế độ khảo sát ban đầu trước khi xây dựng định mức.
- In phiếu có chỗ ký người theo dõi, người kiểm tra, đại diện xưởng. Đính kèm PDF/PNG/JPEG (5 MB/file, tối đa 10 file), sau đó người có quyền xác nhận kỹ thuật sản xuất kiểm tra bản ký và xác nhận. Hệ thống kiểm tra tệp đính kèm, không tự xác minh chữ ký.
- Phiếu xác nhận giữ nguyên số liệu và chứng từ. Có thể chọn phiếu đã xác nhận làm căn cứ định mức mới; định mức lưu lịch sử phiên bản. Mỗi phiếu giữ bản chụp định mức/công suất tại thời điểm lập.
- Giá ca máy dẫn sang Định mức → Giá ca máy. Hao phí kỹ thuật không tự cộng lần nữa vào giá ca máy, không tự ghi chi phí hoặc xuất kho.
- API kiểm soát quyền ở máy chủ, phiên bản chống ghi đè và khóa thao tác chống gửi trùng. Tệp nằm trong cơ sở dữ liệu, đi cùng bản sao lưu hiện có.

## Kiểm tra

- `node --test tests/machine-consumption.test.cjs tests/machine-records.test.cjs tests/service-requests.test.cjs`: đạt.
- `node --test tests/reference-norms.test.cjs tests/reference-norm-controls.test.cjs`: đạt. Cập nhật fixture tài khoản qua hồ sơ nhân sự đã duyệt.
- `node tests/machine-consumption-browser.cjs`: đạt luồng khai định mức → ghi thực tế → in → tải biên bản → xác nhận, kiểm tra khung mobile.
- `node tests/machine-records-browser.cjs`: đạt sửa máy, điều hướng giá ca và lịch sử sửa chữa.
- `npm run build`, kiểm tra cú pháp và `git diff --check`: đạt.

Phân luồng đề nghị bốn cấp vẫn chờ khách xác nhận, không thuộc thay đổi này.

## Triển khai và kiểm tra web thật

- Runtime `25c04fc` tại truongphat-group.xyz; đã sao lưu trước triển khai, container healthy, healthz OK.
- Kiểm tra chỉ đọc: trường công suất máy, bảng hao phí, form phiếu thực tế, danh sách nhân sự, hiển thị mobile và điều hướng về giá ca máy. Không tạo dữ liệu nghiệp vụ thử trên máy chủ.
- API hao phí không trả đơn giá máy. Không có lỗi JavaScript trong luồng kiểm tra. Phiên xác thực kiểm thử đã thu hồi.
- Hai máy hiện có chưa khai công suất/định mức trong bảng mới; cần nhập số liệu điện đầu vào và hao phí đã được xưởng xác nhận.
