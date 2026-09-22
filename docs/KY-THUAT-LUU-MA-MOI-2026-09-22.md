# Lưu báo giá kỹ thuật dùng mã mới — 22/09/2026

Tái hiện được: mã vật tư mới chưa phát hành được thêm vào báo giá; khi lưu, máy chủ chỉ tìm trong danh mục chụp lúc tạo báo giá và từ chối. Dữ liệu báo giá khách đọc để kiểm tra chỉ lưu trong thư mục private, không ghi lên máy chủ thật. Không có câu lỗi cụ thể từ máy nhân viên để khẳng định đây là trường hợp duy nhất họ gặp.

- Khi thiếu mã mới trên máy chủ và có bản nháp danh mục, nút lưu cho xác nhận “Lưu danh mục và báo giá”. Nêu rõ sẽ phát hành các thay đổi danh mục đang làm; giữ nguyên phần báo giá chưa lưu khi lỗi.
- Máy chủ cho lấy mã mới đã phát hành từ danh mục chung vào báo giá cũ. Giá lấy phía máy chủ, không lấy giá do kỹ thuật gửi; quy cách và giá của các dòng cũ được giữ riêng.
- Mã chưa phát hành vẫn bị từ chối với thông báo cụ thể.
- Nhãn đã xác nhận dùng xanh dương nhạt và chữ xanh đậm thay nền tối.

Kiểm tra: 17 bài phân quyền/công thức/máy chủ đạt; Playwright bấm lưu mã mới, lưu báo giá, tải lại, xác nhận kỹ thuật và kiểm tra màu nhãn đạt (1366 × 768). Không chỉnh chat.
