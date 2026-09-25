# Sửa lại và mở khóa theo phạm vi

Luồng báo giá có hai thao tác cạnh nhau: **Sửa lại / Duyệt**. Sửa lại cần lý do và danh sách vùng thông tin. Hệ thống giữ nguyên mã và định danh báo giá; khi mở bản đã trình hoặc duyệt, tạo revision mới, giữ nguyên bản lịch sử và bản đã gửi khách.

- Trước khi bước sau thực hiện, người đã xác nhận phần việc được tự mở lại phần của mình. Xác định người bằng ID, không dựa trên tên hiển thị. Bản ghi cũ không đủ bằng chứng sở hữu phải gửi đề nghị.
- Khi bước sau đã nhận làm, bàn giao hoặc thay đổi dữ liệu, nhân viên phải gửi đề nghị. Người có quyền mở sửa hoặc phê duyệt xét đề nghị trên bản nháp.
- Khi đã trình/duyệt, chỉ người có quyền phê duyệt được cho sửa lại; quyền mở sửa đơn thuần không đủ. Quy định được kiểm tra cả ở các API mở sửa/khôi phục cũ.
- Khi mở phạm vi, các bàn giao liên quan mất hiệu lực và phải xác nhận lại. Máy chủ kiểm tra từng trường; kể cả Admin cũng không ghi được ngoài phạm vi đang mở. Quyền sửa thường lệ của từng tài khoản vẫn áp dụng.
- Người phụ trách, người đã bàn giao và người nhận ở bước sau nhận thông báo. Thông báo mở thẳng danh sách yêu cầu; có liên kết đến vùng cần sửa.
- Không trình duyệt hoặc đóng phạm vi khi các bàn giao bị ảnh hưởng chưa được xác nhận lại. Người có quyền đóng phạm vi sau khi hoàn tất, hoặc phạm vi đóng khi trình duyệt thành công.
- Yêu cầu cũ không được duyệt nếu báo giá đã đổi phiên bản; người duyệt có thể từ chối yêu cầu cũ để lập lại. Thao tác lặp hoặc xung đột không tạo lần mở khóa mới.

Các yêu cầu được lưu trong dữ liệu bàn giao, nằm trong sao lưu hiện có. Mở khóa, tạo revision và thông báo cùng một giao dịch; lỗi sẽ rollback. Không thay đổi gói đơn hàng/lệnh sản xuất đã phát hành.

Kiểm thử API bao gồm quyền người lập/người duyệt, vùng sửa, bàn giao lại, lịch sử bất biến, bước sau đã nhập giá, yêu cầu lỗi thời. Kiểm thử trình duyệt bao gồm nút cạnh nhau, chọn vùng/lý do, liên kết điều hướng, chặn sửa ngoài phạm vi, lưu và màn hình điện thoại; luồng công tắc bàn giao cũ tiếp tục hoạt động.

Đã triển khai `f8e522f` ngày 25/09/2026 sau sao lưu. Toàn bộ 751 kiểm thử đạt; hai bài kiểm thử trình duyệt sửa lại và công tắc bàn giao đạt. Kiểm tra HTTPS thực tế thấy đủ tám vùng chọn, lý do bắt buộc và giao diện điện thoại; chỉ đọc dữ liệu nghiệp vụ. Phiên kiểm tra đã thu hồi, healthcheck đạt.
