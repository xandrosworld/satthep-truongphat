# Chấm điểm và cảnh báo chăm sóc khách hàng

Theo phản hồi 25/09/2026: các mốc ngày trong ảnh chỉ là ví dụ; quản trị tự khai báo, điều chỉnh thang điểm. Không áp sẵn 7/14/30 ngày và không tự chấm khách hàng hiện có.

## Cấu hình

Vào **Khách hàng → Tiêu chí & hệ số** bằng tài khoản quản trị:

1. Khai các mức điểm của đủ 8 tiêu chí: doanh số, tần suất mua, biên lợi nhuận, thanh toán/công nợ, tiềm năng, quy mô/uy tín, hợp tác, chi phí phục vụ/rủi ro. Mỗi mức có tên/điều kiện và điểm. Cho phép thêm/xóa mức, đổi điểm tối đa và trọng số.
2. Trọng số đề xuất từ ảnh là 20/10/15/15/15/10/10/5%; chưa áp dụng chấm điểm cho đến khi cấu hình đầy đủ và bật áp dụng. Tổng trọng số khi bật phải bằng 100%.
3. Khai tên hạng tùy ý và ngưỡng từ tổng điểm. Hạng đầu bắt đầu ở 0; ngưỡng và tên không trùng. Khoảng áp dụng bao gồm ngưỡng dưới, không bao gồm ngưỡng kế tiếp.
4. Khai số ngày bắt đầu Sắp đến hạn / Quá hạn / Cảnh báo đỏ. Mức chưa dùng để trống. Mốc đã khai phải là số nguyên dương tăng dần.

Điểm cao luôn là đánh giá tốt hơn, kể cả tiêu chí chi phí/rủi ro. Tổng điểm = tổng (điểm mức đã chọn / điểm tối đa tiêu chí × trọng số), thang 0–100, làm tròn 4 chữ số thập phân trước khi xếp hạng. Ngưỡng VIP theo số đơn, mốc quá hạn cũ và hệ số báo giá được giữ để tương thích; khi chuyển sang các mốc mới, quản trị có thể xóa mốc cũ để tránh hai quy tắc đồng thời.

## Đánh giá

Trong **Hồ sơ khách → Chấm điểm / Đánh giá lại**, người có quyền sửa khách chọn mức cho đủ 8 tiêu chí, ghi căn cứ và lưu. Có thể nhập căn cứ/số liệu riêng từng tiêu chí. Chưa đủ 8 tiêu chí hoặc thiếu căn cứ tổng hợp không được lưu. Không suy đoán điểm từ dữ liệu tài chính thiếu hoặc tự đặt ngưỡng nghiệp vụ.

Máy chủ tính điểm, không tin tổng điểm/hạng gửi từ trình duyệt. Lưu người đánh giá, thời điểm, căn cứ, từng điểm thành phần và toàn bộ bộ tiêu chí tại thời điểm chấm. Đổi tiêu chí không ghi đè điểm cũ: hồ sơ báo cần đánh giá lại. Lịch sử giao dịch giữ các phiếu điểm cũ; lịch sử cấu hình lưu đầy đủ trước/sau (giao diện hiển thị 100 lần gần nhất). Sửa hồ sơ và nhập Excel không xóa phiếu điểm.

Hạng theo điểm và phân loại thủ công/hệ số là hai trường riêng. Không tự đổi giá hoặc hệ số của báo giá đã lưu. Danh sách khách có lọc hạng theo điểm và mức chăm sóc.

## Chăm sóc và quyền

- Ngày được tính theo lịch Việt Nam. Mốc bắt đầu là ngày trao đổi gần nhất trong hồ sơ hoặc ngày gửi báo giá / ghi nhận phản hồi / chăm sóc sau gửi gần nhất, dựa trên khách hàng của bản báo giá đã duyệt. Lập lịch, xử lý nội bộ và đổi người phụ trách không tự tính là đã chăm sóc. Chưa có trao đổi thì dùng ngày tạo hồ sơ; không rõ ngày thì báo chưa rõ, không coi bằng 0.
- Người chăm sóc nhận thông báo trong hộp Thông báo theo mức đang đạt; cảnh báo đỏ còn hiện cho quản trị và trưởng phòng kinh doanh có quyền khách hàng. Thông báo được cập nhật khi hệ thống kiểm tra hộp thư, không tạo lặp khi tải lại; trạng thái đã đọc được lưu. Khi có trao đổi mới hoặc ngừng giao dịch, cảnh báo cũ không còn hiện trong danh sách cảnh báo đang có hiệu lực.
- Chuyển người phụ trách cần thao tác của quản trị hoặc trưởng phòng kinh doanh có quyền sửa khách, kèm lý do và lịch sử. Không tự chuyển chỉ vì quá hạn. Quyền chăm sóc từng báo giá vẫn quản lý tại phần theo dõi báo giá.
- Quyền sửa khách hàng theo ma trận cho phép chấm điểm độc lập với quyền xem chi phí. Chỉ xem không được ghi điểm. Cấu hình tiêu chí và lịch sử cấu hình dành cho quản trị. Khóa phiên bản chống ghi đè hồ sơ/cấu hình vừa được người khác sửa.
- Chấm điểm không tự đổi ngưỡng, trọng số, ngày cảnh báo, người phụ trách hoặc dữ liệu nghiệp vụ hiện có trên máy chủ.

## Kiểm chứng

Kiểm thử gồm công thức trọng số và biên ngưỡng; mốc ngày Việt Nam; dữ liệu trống; lịch sử bất biến; chống giả tổng điểm/hạng; quyền chỉ xem/sửa/quản trị/trưởng phòng; cảnh báo chống trùng và đã đọc; liên kết chăm sóc sau gửi; bảo toàn dữ liệu khi sửa hồ sơ. Trình duyệt kiểm tra cấu hình 8 tiêu chí, chấm điểm, lưu/tải lại, cấu hình thay đổi, lịch sử, mở khách từ thông báo, tài khoản không xem giá và màn hình 390px.
