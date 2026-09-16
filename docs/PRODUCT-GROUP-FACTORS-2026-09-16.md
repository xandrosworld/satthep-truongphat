# Phân nhóm hệ số và nguyên công — 16/09/2026

Yêu cầu: Quy ước / Hệ số tính toán và Đơn giá đầu vào / Nguyên công phải được phân theo Cơ khí, Thang máng cáp, Cửa gió, Tủ điện và nhóm có thể thêm.

## Đã thực hiện

- Cùng bộ chọn nhóm ở hai màn hình, chia bảng thành các nhóm rõ ràng; danh mục Công đoạn cũng lọc theo nhóm.
- Mỗi nguyên công và hệ số có phạm vi một/nhiều nhóm hoặc Dùng chung. Thêm nhóm từ danh mục hiện hành; không tạo một hệ nhóm tách rời.
- Tạo nguyên công mới theo nhóm đang chọn hoặc sao chép nguyên công dùng chung thành bản riêng; khai các phương pháp theo đơn vị hoặc giá gói bằng bộ khai cách tính hiện có.
- Hao hụt TMC dẫn đến đúng cấu hình TMC hiện hành, không tạo hệ số hao hụt thứ hai nhân chồng.
- Tính giá lấy nhóm khai trực tiếp gần nhất trong đường dẫn SP → CK → VT. Mỗi dòng vẫn tra hệ số theo tham số riêng. Không suy đoán nhóm từ tên.
- Nguyên công sai nhóm bị báo lỗi. Hệ số khác nhóm không được nhân. Công việc có hệ số phân nhóm mà chưa khai nhóm yêu cầu bổ sung nhóm.
- Ma trận chỉ ghi các ô hiện ra; liên kết ngoài nhóm đang xem (kể cả liên kết tắt) được giữ nguyên.
- Bảng giá đã lưu trong báo giá giữ phạm vi cũ; lấy lại toàn bảng mới cập nhật nhóm/hệ số. Chỉ lấy đơn giá cơ sở không thay phạm vi.
- Công cụ thử giá chọn được nhóm; kiểm tra tổng thể xét các nhóm đã khai. Xuất danh mục có thêm bảng phạm vi nhóm.
- Máy chủ kiểm tra định dạng/phạm vi, giữ dữ liệu qua lưu/đọc và chặn tài khoản thiếu quyền sửa hệ số.

## Tương thích dữ liệu

`productGroups` là mảng tên nhóm. Không có trường hoặc mảng rỗng giữ nghĩa Dùng chung của dữ liệu cũ. Không tự gán dữ liệu khách đã nhập sang Cơ khí hay TMC. Khi cần tách giá khác nhau, chọn nhóm rồi dùng “Tạo bản riêng cho nhóm”. Báo giá cũ không tự đổi.

Giá gói của một nguyên công thay cách giá của nguyên công đó; không mặc định bao gồm các nguyên công khác. Gói thuê bao trùm nhiều công đoạn tiếp tục dùng chức năng gói thuê hiện có, tránh cộng lại các công việc đã nằm trong gói.

## Kiểm chứng

- 405 kiểm tra toàn bộ logic đã qua, sau đó bổ sung kiểm tra API phạm vi nhóm (6 ca mới tổng cộng).
- tests/product-scope.test.cjs: giá khác nhóm, kế thừa cấp cha, lỗi thiếu/sai nhóm, giá gói, ma trận lọc, liên kết tắt, tính thuần, API lưu/đọc, quyền truy cập.
- tests/product-scope-browser.cjs: tạo nhóm/nguyên công/hệ số, sao chép, lọc, ma trận, thử giá và tải lại.
- tests/pricing-declarations-browser.cjs, tests/factor-matrix-browser.cjs, tests/quote-operation-choice-browser.cjs: các luồng hiện có tiếp tục qua.
- Ảnh và kết quả tại artifacts/product-scope/ (dữ liệu thử cục bộ).
