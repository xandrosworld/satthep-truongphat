# Khung khai báo bảng giá nguyên công dùng chung

Yêu cầu: không thiết kế một form riêng cho TMC rồi thêm form riêng cho lan can, tủ điện. Mỗi nhóm dùng dữ liệu khai báo của nhóm đó.

## Đã thực hiện

- Một form **Bảng giá nguyên công**: nhóm áp dụng, tên, đại lượng tra, đơn vị tính, cách tra bậc và đơn giá.
- Các đại lượng: chiều dài/rộng/cao/dày, khối lượng, diện tích, số lượng. Đơn vị tính giá độc lập với đơn vị của đại lượng tra.
- Cùng màn Nguyên công & hệ số và cùng bảng hệ số cho mọi nhóm; bảng giá lọc theo nhóm riêng hoặc Dùng chung.
- Form gói lọc bảng giá và hệ số phù hợp nhóm. Không hiện bảng TMC như bảng dùng chung của lan can/tủ điện.
- Nút **Thử giá** kiểm tra lượng × đơn giá tra bảng × hệ số. Thiếu thông số, sai nhóm, sai mốc hoặc thiếu đơn giá được báo rõ.
- Bảng TMC cũ được đọc qua cùng cấu trúc hiển thị, vẫn giữ đơn vị, bậc giá, hao hụt và khoản phụ/chung. Các ô hao hụt/khoản phụ chỉ hiện khi khai nhóm TMC với đại lượng W.
- Xuất Excel thêm bảng giá nguyên công của tất cả nhóm. Dữ liệu được lưu/phát hành/lấy lại qua danh mục chung.
- Máy chủ kiểm tra gói cùng chính bảng giá gửi lên, nên gói dùng bảng mới thêm cũng phát hành được; khai báo không hợp lệ trả lỗi dữ liệu.

## Phạm vi tính toán

Đây là khung khai báo và thử giá công dùng chung. Phương án TMC tiếp tục dùng dữ liệu TMC đã chốt. Lan can/tủ điện có thể khai bảng và gói, thử đơn giá theo đại lượng; **chưa tự đưa gói mới vào giá bán tổng**, chưa sao chép hao hụt/phí của TMC sang nhóm khác. Công thức giá bán tổng, số liệu và điều kiện nghiệp vụ của nhóm mới chưa được khách cung cấp trong yêu cầu này; phần Nhóm giá khác giữ cơ chế khai công thức hiện có.

## Kiểm tra và bằng chứng

- `tests/operation-table.test.cjs`: đại lượng/đơn vị theo nhóm, bậc chính xác, hệ số một lần, từ chối thiếu giá/sai nhóm/trùng mã, giữ dữ liệu TMC và báo giá cũ.
- `tests/operation-table-browser.cjs`: cùng form TMC/lan can/tủ điện, tạo bảng và gói, thử giá, lưu qua API và mở lại, lọc đúng nhóm.
- Hồi quy luồng gói TMC, hệ số, đơn vị và phân bổ phí.
- `tools/verify-common-operation-form-live.cjs`: kiểm tra bản build Railway, chụp form/thử giá của ba nhóm trong phiên làm việc riêng. Không gọi API ghi nghiệp vụ. Đối chiếu danh mục và danh sách báo giá máy chủ trước/sau.
- Bằng chứng: `artifacts/customer-review/common-operation-form/live/`.
