# Rà soát giao diện máy tính / laptop — 22/09/2026

Phạm vi: giao diện hiện có; không mở rộng chức năng, không kiểm tra điện thoại trong đợt này.

## Kiểm tra

- 16 màn × 3 độ rộng CSS (1920, 1366, 1093 px): 8 bước báo giá, 7 bảng danh mục và danh mục vật tư. 1093 px mô phỏng diện tích hiển thị của màn 1366 px ở mức phóng to 125%; không phải thử zoom trình duyệt thật.
- 4 hộp × 3 độ rộng: liên kết kích thước, định mức vật tư, vật liệu, quy tắc đặt mã.
- Kiểm tra tràn trang, số cột sau colspan, ô nhập vượt ô bảng, điều khiển vượt hộp thoại; xem ảnh hộp định mức ở 1093 px.
- Dữ liệu kiểm thử: bộ mẫu cục bộ. Không kết luận bao phủ mọi dữ liệu thực tế hoặc mọi hộp thoại.

## Phát hiện và sửa

- Ô tích áp dụng định mức bị tách khỏi nhãn: dùng bố cục checkbox chung.
- Ô tích cho phép dùng khổ chuẩn có cùng cấu trúc gây lỗi: sửa tương tự.
- Ô chọn vật tư hoàn thiện hẹp, cắt tên trong khi còn diện tích: mở rộng ô chọn; đặt định mức, số lớp và hao hụt cùng hàng trên máy tính.

## Kết quả

48 lượt màn hình và 12 lượt hộp không có tràn trang/điều khiển hoặc lệch số cột theo các phép kiểm tra trên. Các bài kiểm tra operation-recipes-browser, stock-catalog-browser và quick-table-spacing-browser đều đạt; gồm lưu/tải lại dữ liệu và tính lại lượng vật tư. Ảnh và kết quả đo cục bộ nằm trong artifacts/customer-review.
