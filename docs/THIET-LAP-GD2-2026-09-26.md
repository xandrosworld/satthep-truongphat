# Thiết lập vận hành và hiển thị — GĐ2

Phạm vi 24.02–24.04. Đây là kết quả tự kiểm kỹ thuật, không phải biên bản nghiệm thu của khách hàng.

## Truy cập

Nút **Thiết lập** ở cuối thanh bên. Hai phần: Hiển thị trên trình duyệt đang dùng và Tham số vận hành dùng chung trên máy chủ.

## 24.02 — Tham số vận hành

Trung tâm thiết lập mở đúng các biểu mẫu đang được sử dụng, không tạo bản cấu hình song song. Phân quyền, kiểm tra đầu vào, phiên bản và lịch sử tiếp tục do các API hiện có kiểm soát.

| Nhóm | Tham số / bật tắt | Phạm vi |
|---|---|---|
| Khách hàng | Bật/tắt chấm điểm; 8 tiêu chí, trọng số, mức điểm và ngưỡng hạng | Cấu hình chung, Admin |
| Chăm sóc | Ngày bắt đầu cảnh báo, quá hạn, mức nghiêm trọng; để trống mức không dùng | Cấu hình chung; không cố định các mốc ví dụ 7/14/30 |
| Trường khách hàng | Sử dụng, trường bắt buộc và danh sách lựa chọn | Cấu hình chung, Admin |
| Phân cấp bộ phận | Người phụ trách, thành viên và phạm vi giao việc | Giữ cấu hình tổ chức hiện có, Admin |
| Lương | Ngày/giờ chuẩn, tăng ca/ngày nghỉ, hệ số công trường, phụ cấp, bảo hiểm | Bộ nguyên tắc; quyền xem và sửa lương hiện có |
| Đơn giá đầu vào | Phương thức tính vận chuyển/lắp đặt, nhóm áp dụng, cho phép chọn trong báo giá mới | Danh mục có kiểm soát quyền và phát hành |
| Thông báo | Bật/tắt chuông, đăng ký thông báo thiết bị | Theo tài khoản/thiết bị |

Không cung cấp công tắc tắt phân quyền, vượt tồn, bỏ phê duyệt hoặc xóa lịch sử. Thay cấu hình không âm thầm tính lại bản báo giá đã duyệt. Không bổ sung bộ thiết kế quy trình tùy ý ngoài các tham số nghiệp vụ đang có.

## 24.03 — Định dạng

- Dấu phân cách Việt Nam hoặc Hoa Kỳ, bật/tắt nhóm hàng nghìn.
- Số lẻ mặc định 0–6 cho bộ định dạng dùng chung; nơi yêu cầu độ chính xác riêng giữ số lẻ của nghiệp vụ đó.
- Tiền tệ vẫn là VND, làm tròn đồng qua bộ định dạng tiền hiện có; không có chuyển đổi tỷ giá.
- Ngày: ngày/tháng/năm, tháng/ngày/năm, năm-tháng-ngày. Áp dụng các thời gian lịch sử đã dùng bộ định dạng ngày và các ô ngày thuần trong bảng nghiệp vụ.
- Ngày nhập vẫn dùng ô chọn ngày bản địa của trình duyệt, có dòng xem trước khi chọn/focus. Giá trị lưu ISO, bộ lọc ngày kho sử dụng ngày gốc riêng.
- Thiết lập lưu tại trình duyệt; có xem trước và khôi phục mặc định. Không ghi lại số liệu, công thức hoặc chứng từ máy chủ. File Excel vẫn giữ kiểu số từ trình xuất; bản in dùng bố cục in hiện có.

## 24.04 — Sáng/tối

Sáng, Tối hoặc Theo máy tính. Áp dụng từ khi tải trang để tránh chớp nền sáng; thay đổi chế độ máy tính được nhận tự động. Lưu và đồng bộ tùy chọn giữa các tab cùng trình duyệt. Màu tối chỉ áp dụng cho màn hình, không đảo màu ảnh/logo hay bản vẽ và không áp dụng sang chế độ in.

Đã rà Thiết lập, popup tiêu chí, bảng vật tư, cấu thành báo giá, lương, popup rà soát/phân tách sản xuất và phiếu mua. Kích thước kiểm tra PC/laptop: 1366×768, 1440×900, 1920×1080.

## Bằng chứng kiểm thử

- `tests/display-preferences.test.cjs`: chuẩn hóa tùy chọn, dấu số/VND, độ chính xác, ngày nhuận/sai ngày, giữ nguyên HTML/mã.
- `tests/settings-browser.cjs`: lưu và tải lại, xem trước, liên kết cấu hình, lưu mốc chăm sóc và đọc lại API, chặn nút quản trị khi chưa đăng nhập, Sáng/Tối/Theo máy tính, ba chiều rộng PC.
- `tests/production-dossier-browser.cjs` với `TP_TEST_THEME=dark`: rà soát → xác nhận → triển khai; mua gộp; popup và bảng trên ba kích thước PC/laptop.
- `tests/operations-erp-browser.cjs`: mua → nhận → giữ vật tư → cấp sản xuất → báo cáo; cập nhật fixture để thực hiện bước rà soát kỹ thuật bắt buộc.
- `tests/enterprise-browser.cjs`, `tests/reports-browser.cjs`: luồng lương/công việc và báo cáo/xuất Excel.
- Toàn bộ kiểm thử Node và build chạy sau thay đổi. Ảnh kiểm tra lưu tại `artifacts/settings-*.png`, `artifacts/dark-production-*.png` (dữ liệu thử nghiệm).

Các mục thử thực tế, đào tạo, vận hành và nghiệm thu D.* vẫn để mở.
