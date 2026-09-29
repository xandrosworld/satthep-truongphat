# Các phương án sắp phôi — 29/09/2026

Yêu cầu: Phú muốn dài trước, ngắn sau; anh Hợp muốn nhiều phương án và thao tác chỉnh tay thuận tiện.

Bản triển khai: 5bfe49a.

- Giữ hai cách xếp có sẵn: cho phép xoay và giữ hướng.
- Thêm Dài trước – ngắn sau: giữ hướng, mỗi phôi một hàng từ trên xuống, thứ tự chiều dài giảm dần trong từng tấm. Phần trống vẫn hiển thị để chọn tận dụng; cách này có thể cần nhiều tấm hơn.
- Thêm Diện tích lớn trước: dùng khổ bao, cho phép xoay.
- So sánh số khổ và hao hụt trước tận dụng; xem phương án trước khi áp dụng. Không cam kết tối ưu toàn cục.
- Nút Kéo / chỉnh vị trí phôi mở trình chỉnh hiện có; chọn Lấy gợi ý để chỉnh để kéo, xoay, nhập tọa độ hoặc đổi tấm.
- Đổi cách xếp trong hộp sẽ tạo lại gợi ý. Chỉ Áp dụng mới thay phương án báo giá; Lưu máy chủ để chia sẻ. Phương án cũ không bị tự chuyển đổi.
- Sau thay phương án phải rà phần dư tận dụng và áp dụng lại tỷ lệ dự tính nếu muốn thay giá.

Kiểm chứng:
- 27 ca core: thứ tự, mạch cắt, số lượng/định danh, diện tích, JSON lưu lại, phương án hết hiệu lực, hình tròn/tam giác/đa giác, phần dư và hao hụt.
- nesting-flow-browser: luồng chỉnh tay và hình dạng đạt.
- nesting-large-browser: tài khoản kỹ thuật, 3.600 phôi, chọn phương án dài trước, lưu API và tải lại, chuyển sang chỉnh tay, kéo/xoay, chặn vượt khổ, mở lại vị trí đã lưu, màn hình 390px đạt.
- Không chỉnh phương án hoặc dữ liệu báo giá thật của khách để thử.
- Đã sao lưu và triển khai máy chủ; health, HTML công khai và 102 mã băm runtime đúng bản phát hành. Chưa có xác nhận nghiệm thu từ khách.
