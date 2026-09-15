# Khai triển, hao hụt và khối lượng dự tính

- Bước Khai triển & hao hụt hiện L0/W0, phương pháp dự tính, tỷ lệ hao hụt trên phôi, khối lượng phôi và vật tư dự tính. Chọn theo phôi (0%) hoặc phôi cộng tỷ lệ 0–100%; áp dụng riêng dòng hoặc các dòng con của sản phẩm/cấu kiện.
- KL/DT vật tư dự tính = KL/DT phôi × (1 + hao hụt/100). Số lượng được nhân theo cây một lần; tỷ lệ tổng dùng khối lượng để tính bình quân. Có dòng con thiếu dữ liệu thì tổng báo cần kiểm tra.
- Báo giá cũ giữ cách chi phí đã lưu đến khi người dùng chọn áp dụng. Dòng chưa chọn hiện Chưa khai, không gọi khối lượng phân bổ từ khổ mua là dự tính. Chi phí đã chọn theo phôi không phụ thuộc khổ mua. Đơn giá cần theo kg, m² tấm hoặc m dài; đơn giá theo nguyên tấm/thanh cần đổi cơ sở giá trước.
- Khối lượng & diện tích hiện bốn đại lượng, công thức, hệ số và dữ liệu thay số của bản đã lưu; chỉ xem. Nút dẫn về Danh mục quy ước để điều chỉnh công thức. CSV đối chiếu xuất đúng các đại lượng dự tính.
- Đề xuất tổ hợp mua vật tư toàn đơn mở riêng, dùng bộ tổ hợp đã có để gom các dòng tương thích. Không xác định số khổ mua riêng tại dòng cấu kiện. Lỗi thiếu khổ trong phương án mua không chặn dòng đã đủ dữ liệu dự tính chi phí.
- Vận chuyển nhập theo khối lượng dùng lượng vật tư dự tính khi đã chọn; vật tư do nhà thầu cung cấp không cộng chi phí vật tư lần nữa. Phương án giá TMC vẫn có hao hụt riêng theo bảng giá TMC đã khai.

Kiểm chứng: 324 kiểm thử logic, 58 kiểm thử máy chủ; 7 nhóm trình duyệt cho luồng mới và 5 nhóm hồi quy công đoạn/định mức. Chứng cứ tại artifacts/customer-review/material-estimate-2026-09-15/. Chưa đánh dấu khách nghiệm thu.
