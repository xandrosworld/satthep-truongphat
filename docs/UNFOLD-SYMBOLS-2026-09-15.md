# Ký hiệu khai triển và bảng trạng thái công thức

Hai ảnh tiếp theo sáng 15/09 yêu cầu tách L/W đầu vào khỏi kích thước khai triển, dùng ví dụ L0 = L, W0 = W + 2H + 2F; đồng thời bỏ biểu thức khỏi bảng tổng, chỉ đánh dấu đã khai công thức.

- Bảng Hình dạng & công thức chỉ hiện dấu tick và ký hiệu L0/W0 ở cột khai triển; khối lượng/diện tích hiện trạng thái đã khai. Không đưa biểu thức vào ô hoặc tooltip. Thanh không hiện ký hiệu rộng.
- Tick nghĩa là có công thức, không thay kết quả kiểm tra tính đúng. Công thức chi tiết, thay số và kết quả thử nằm trong Công thức tổng hợp như lượt trước.
- Form hiển thị rõ vế trái `L0 =`, `W0 =`, vế phải là biểu thức dùng đầu vào. Ví dụ L/W/H/F vẫn là thông số nhập, L0/W0 là kết quả tính. L0/W0 có trong bộ chọn biến khi tính khối lượng/diện tích phôi.
- Không dùng L0/W0 làm đầu vào mới trong form hình dạng. Công thức khai triển tự tham chiếu kết quả của nó bị báo lỗi. Kết quả dài/rộng được tính trước, rồi mới đưa vào công thức phôi; số lượng nhân đúng một lần.
- Công thức cũ dùng PHOI_D/PHOI_R vẫn chạy. Khi mở form, biểu thức tương đương được trình bày bằng L0/W0; chỉ lưu thành phiên bản mới khi người dùng bấm Lưu. Không tự cập nhật mã vật tư hoặc báo giá cũ.
- Tương thích dữ liệu cũ: nếu một quy ước trước đây đã dùng L0 hoặc W0 làm đầu vào, giữ nguyên ý nghĩa đó và dùng PHOI_D/PHOI_R làm ký hiệu đầu ra tương ứng trong riêng quy ước ấy. Không ghi đè giá trị cũ bằng kết quả khai triển.

Ca số: L=1000, W=200, H=50, F=15, T=2, RHO=7850 cho L0=1000, W0=330, một phôi 5,181 kg / 0,33 m². Đổi H=100 thì W vẫn 200, W0=430; ba phôi cho 20,253 kg / 1,29 m². Đã kiểm luồng khai → mã vật tư → chọn vào báo giá, lưu/mở lại, đổi phiên bản và hủy sửa. Các ca cũ kiểm riêng cả bí danh PHOI_D/PHOI_R và đầu vào lịch sử L0/W0.

Bằng chứng tại `artifacts/customer-review/unfold-symbols-2026-09-15/`: log logic/máy chủ, kết quả trình duyệt, `verification.json`, `live/deployment-check.json`. Máy chủ chỉ kiểm cục bộ; kiểm web dùng trình duyệt thử riêng. Phần đơn giá tiếp tục là lượt riêng theo ghi chú khách.
