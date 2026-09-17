# Cài đặt thông tin khách hàng

Nguồn: `Account_Template.xlsx` do khách cung cấp, sheet “Nhập khẩu Khách hàng”, 52 cột A–AZ. Không nhập hai khách hàng ví dụ trong file. Danh sách đối chiếu cột nằm trong `customer-fields-data.json`.

Trong **Khách hàng → Cài đặt thông tin**, quản trị tích **Hiển thị** và **Bắt buộc** cho từng trường. Có đầy đủ 52 trường từ mẫu, cùng 5 trường chăm sóc hiện có: người liên hệ, đánh giá chăm sóc, căn cứ đánh giá, nhân viên chăm sóc và ngày chăm sóc tiếp.

- Tên khách luôn hiển thị và bắt buộc. Các trường khác mặc định hiển thị, chưa bắt buộc để giữ hoạt động với hồ sơ cũ. Mẫu Excel đánh dấu mã khách là bắt buộc; quản trị có thể bật yêu cầu này ngay trong cài đặt, không tự phát sinh mã mới cho khách cũ.
- Chọn bắt buộc sẽ bật hiển thị; bỏ hiển thị sẽ bỏ bắt buộc. Cấu hình lưu chung trên máy chủ, chỉ quản trị thay đổi được. Nhân viên dùng cùng cấu hình khi thêm/sửa khách.
- Form chia theo thông tin chung, địa chỉ hóa đơn, địa chỉ giao hàng, ngân hàng/thanh toán, cá nhân, bổ sung và chăm sóc. Nhóm có trường bắt buộc tự mở.
- Máy chủ kiểm tra cấu hình mới nhất khi lưu hồ sơ. Hồ sơ cũ thiếu trường vừa được yêu cầu phải bổ sung khi lưu sửa; không tự xóa hay thay dữ liệu cũ. Các lần ghi trao đổi/cơ hội không bị buộc nhập lại toàn bộ hồ sơ.
- Ẩn trường trên form không xóa giá trị đã lưu, cũng không phải quyền bảo mật riêng cho trường. Bản sao lưu chứa cả thông tin bổ sung và cấu hình.
- “Ngừng theo dõi” dùng trạng thái theo dõi hiện có; “Là KH cá nhân” dùng phân loại cá nhân/công ty hiện có. “Xếp hạng khách hàng” theo mẫu (cao/vừa/thấp…) tách với đánh giá chăm sóc VIP/mới/rủi ro.
- Các trường như Dùng chung, Là nhà phân phối, Là đối tác/CTV là thông tin hồ sơ, không tự thay quyền truy cập hoặc hệ số báo giá. Hệ số khách hàng vẫn ở Tiêu chí & hệ số và được áp dụng theo luồng hiện có.
- Gợi ý nguồn gốc, loại hình, doanh thu, hạn mức, xếp hạng, giới tính, điều khoản và quy mô lấy từ danh sách trong file; vẫn cho nhập giá trị phù hợp thực tế. Địa danh là ô nhập, không coi danh sách địa giới trong mẫu là danh mục hiện hành bắt buộc.
- Mã khách, tài khoản ngân hàng, giấy tờ và mã số thuế giữ dạng chữ để không mất số 0 đầu. Các ngày dùng lịch, hạn mức nợ dùng số không âm.
- Thông tin ngân hàng, giấy tờ và chăm sóc không tự đưa vào bản chào giá. Bản chào tiếp tục dùng bản sao thông tin liên hệ kinh doanh đã chọn.

Kiểm tra: `tests/customer-fields.test.cjs`, `tests/customer-fields-server.test.cjs`, `tests/customer-fields-browser.cjs`; hồi quy `tests/crm-browser.cjs`. Bằng chứng web thật: `tools/verify-customer-fields-live.cjs` (không ghi dữ liệu nghiệp vụ).
