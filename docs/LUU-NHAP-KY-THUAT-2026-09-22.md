# Lưu công việc kỹ thuật đang làm dở

- Sai cạnh/góc hoặc thiếu khổ tấm vẫn lưu bản nháp được; kiểm tra tích hợp xác nhận admin đọc lại nguyên thông số.
- Bỏ yêu cầu phát hành danh mục trước khi lưu báo giá kỹ thuật. Mã mới chưa có trong danh mục được giữ trong báo giá với trạng thái vật tư tạm, giá chưa khai (null). Không lấy giá từ dữ liệu do kỹ thuật gửi lên.
- Trả trạng thái các dòng tạm về giao diện ngay sau lưu, giữ cảnh báo. Thông báo lưu nháp nói rõ đồng nghiệp có thể mở xem để sửa tiếp.
- Sau khi lưu danh mục chung, lần lưu kỹ thuật tiếp theo lấy giá có thẩm quyền và bỏ trạng thái tạm; thông số đang nhập vẫn giữ nguyên. Cũng có thể chọn lại mã đã khai trong danh mục.
- Xác nhận hoàn tất kỹ thuật và gửi duyệt vẫn chặn dữ liệu chưa hợp lệ. Phân quyền, bản khóa, kiểm tra định dạng và xung đột phiên bản giữ nguyên.
- Thay thế cách xử lý ngày 22/09 trước đó yêu cầu “Lưu danh mục và báo giá” trong KY-THUAT-LUU-MA-MOI-2026-09-22.md.

Kiểm tra: 38 test API đạt (technical-access, server, notifications-server, section-access, polygon-server); browser technical-new-material-browser đạt chuỗi kỹ thuật lưu mã tạm → tải lại → admin xem → phát hành danh mục → kỹ thuật lưu lại và xác nhận. Không sửa dữ liệu sản xuất của khách trong quá trình kiểm tra.
