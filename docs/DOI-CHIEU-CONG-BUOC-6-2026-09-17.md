# Đối chiếu nguyên công theo phương án tại bước 6

Trước đây Giá & hệ số → Nguyên công / bề mặt chỉ hiện ma trận công chi tiết. Người lập giá phải chuyển sang Phân tích giá để xem tiền công TMC.

Bổ sung ngay tại bước 6:

- Phương án đang chọn được ghi rõ; mở bảng đối chiếu không đổi phương án chào.
- TMC: phần cấu thành, bảng giá/gói đang lưu, khổ rộng và bậc tra, chiều dài, số lượng, lượng tính công, giá gốc, từng hệ số, giá áp dụng, thành tiền.
- Đối chiếu từng sản phẩm: công xưởng trước thay thế − công đã gồm trong gói + công TMC = công xưởng của phương án TMC. Thuê ngoài giữ riêng. Giá trị lấy trực tiếp từ kết quả tính, không chạy công thức giá thứ hai trong giao diện.
- Giữ bảng công chi tiết để đối chiếu, có nhãn phân biệt rõ với TMC. Công kỹ thuật, giá chốt, danh mục và báo giá khác không bị thay đổi khi xem.
- Giá kg/đối thủ: hiển thị đầu vào và giải thích tiền công đã nằm trong giá trọn gói, không tự suy diễn phần công riêng.
- Phương án công thức nhóm đã khai: hiện công thức, tham số, căn cứ và kết quả tổng trước thuế; không gán nhầm tổng giá bán thành tiền công.
- Thiếu khổ rộng hoặc chưa có sản phẩm: hiện nội dung cần bổ sung, không hiển thị bảng cộng trừ thành công giả. Kỹ thuật không được xem bảng giá.

Không thêm công thức bán hàng mới cho lan can/tủ điện. Các bảng dùng bản giá lưu trong báo giá; lấy bảng mới vẫn là thao tác chủ động.

Kiểm tra: toàn bộ 463 unit/server tests, browser đối chiếu bước 6, browser quyền kỹ thuật và browser công trọn gói. `node tools/verify-quote-labor-methods.cjs --live` kiểm tra bản Railway đúng build, chụp 6 ảnh bằng bộ số liệu QA trong bộ nhớ trình duyệt; chặn ghi API và so sánh danh mục/danh sách báo giá trước sau. Không đưa bộ giá QA vào dữ liệu khách hàng.
