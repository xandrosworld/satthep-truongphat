# Nhập danh bạ và cập nhật có điều kiện

- Đối chiếu mã hệ thống, mã khách, MST có chuẩn hóa khoảng trắng/dấu phân cách. Mã trỏ tới nhiều hồ sơ hoặc mã hệ thống không tồn tại bị chặn.
- Trùng tên, điện thoại hoặc email được đưa ra để người nhập chọn hồ sơ xác nhận; không tự gộp bằng tên. Kiểm tra cả khách lặp trong file, kể cả khác mã nhưng cùng tên.
- Chọn chỉ thêm, chỉ cập nhật hoặc cả hai; mặc định cập nhật chỉ bổ sung ô trống. Có thể chọn thay bằng giá trị không trống trong file. Ô trống không xóa dữ liệu cũ.
- Xem các trường trước/sau, sửa dữ liệu từng dòng ngay trong bản xem trước, bỏ qua từng dòng hoặc chọn chỉ ghi dòng hợp lệ. Không sửa tệp gốc.
- Khách mới vẫn tuân thủ trường bắt buộc. Với hồ sơ cũ đã thiếu thông tin, người dùng có thể chọn cập nhật mà không bắt bổ sung ngay các trường đã thiếu từ trước; không cho làm mất thông tin bắt buộc đã có. Kiểm tra kiểu dữ liệu, email và căn cứ VIP/rủi ro giữ nguyên.
- Máy chủ kiểm tra lại trùng, quyền thêm/sửa/import, phiên bản và điều kiện ghi; ghi toàn bộ tập dòng đã chọn trong một giao dịch. Không đổi người phụ trách hoặc hồ sơ khách đã chụp trong báo giá; giữ lịch sử CRM.
- Kiểm thử API: điều kiện fill/replace, hồ sơ cũ thiếu trường, khách mới thiếu trường bị chặn, phiên bản xung đột, rollback, phân quyền và trùng trong file. Trình duyệt: nhập CSV → xác nhận trùng → chọn điều kiện → sửa/bỏ dòng → ghi → đọc lại, cả giao diện điện thoại.
