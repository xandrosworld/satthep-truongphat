# Ba nhóm hệ số theo ảnh khách ngày 29/09/2026

Cập nhật theo ảnh xác nhận lúc 16:57–16:58, tiếp nối bản `4ca3aa5`.

## Cách dùng và phạm vi

1. **Danh mục quy ước → Hệ số tính toán:** khóa Hệ số tác động. Bảo vệ bảng yếu tố (gồm phức tạp, chiều dày theo khai báo hiện có), giá trị, liên kết công việc, phạm vi và hao hụt chung.
2. **Đơn giá đầu vào → Nguyên công & hệ số:** khóa Hệ số đơn giá riêng. Bảo vệ giá cơ sở tại xưởng/thuê ngoài, đơn vị giá, các cách tính đơn giá, bảng giá TMC, bảng giá nguyên công và cấu hình công trọn gói. Không đưa thông tin máy/ghi chú kỹ thuật vào khóa giá.
3. **Báo giá → bước 6 → Hệ số:** người được cấp quyền vẫn sửa hệ số chi phí chung, quản lý, lợi nhuận, xử lý, đơn hàng, khách hàng, dự phòng và chi phí sản xuất/bổ sung. Hai khóa danh mục không khóa nhóm này. Quyền từng phần, lý do điều chỉnh sau bàn giao và khóa báo giá đã duyệt cuối vẫn có hiệu lực.

Hai khóa có trạng thái và phiên bản riêng; mở một khóa không mở khóa còn lại. Muốn sửa bảng giá đã khóa, kể cả quản trị, cần mở khóa. API chặn sửa trực tiếp ngoài giao diện. Vẫn được lấy nguyên công mới đã phát hành vào báo giá và dùng dữ liệu đã chốt để tính.

Khi nâng cấp, khóa đơn giá kế thừa trạng thái, người và thời điểm từ khóa hệ số cũ một lần. Khởi động lại không ghi đè lựa chọn khóa mới. Không thay giá, hệ số, quyền tài khoản hoặc lịch sử báo giá để triển khai.

## Kiểm chứng

- 16 bài trong `tests/formula-access.test.cjs` đạt: gồm quyền, tham chiếu ẩn, bản đã duyệt, hai khóa độc lập, cập nhật danh mục/báo giá, chống sửa bảng giá trọn gói, thêm nguyên công đã phát hành, xung đột phiên bản và nâng cấp trạng thái khóa.
- `tests/coefficient-locks-browser.cjs` đạt: khóa/mở trên hai màn hình, mở riêng giá và lưu giá khi yếu tố bị khóa, người lập giá lưu/tải lại chi phí quản lý và sản xuất khi cả hai khóa bật, không hiện nút mở khóa cho người không có quyền.
- Ba luồng hồi quy trình duyệt đạt: `cost-factor-lock-browser`, `technical-save-browser`, `bulk-operation-catalog-browser`.
- Lượt quét toàn bộ Node có 4 ca lỗi nghiệp vụ tái hiện nguyên trạng ở commit nền `661cc77`: 1 ca formula-sync, 2 ca notifications, 1 ca production-changes. Một tiến trình customer-import bị lỗi trong lượt chạy đồng thời; chạy riêng lại đủ 4 bài đạt. Không mô tả toàn bộ suite là xanh.
- Kiểm thử ghi dữ liệu dùng SQLite thử riêng; không sửa hệ số thực của khách để thử.

## Phát hành

- Runtime `7e678c2`, đã push `main` và triển khai Docker trên VPS phục vụ `https://truongphat-group.xyz` ngày 29/09/2026. Đã sao lưu SQLite và hai tệp runtime cũ trước triển khai.
- Container `truongphat-quotation:7e678c2` healthy; HTTPS trang chính trả 200, `/healthz` trả `ok: true`.
- SHA-256 của hai tệp thay đổi khớp giữa mã local, thư mục máy chủ và container. HTML công khai khớp build local sau chuẩn hóa xuống dòng Windows/Linux.
- Kiểm tra SQLite chỉ đọc: trước nâng cấp khóa tác động bật, phiên bản 9; sau nâng cấp cả khóa tác động và khóa đơn giá đều bật, phiên bản 9. Khóa cũ không bị thay đổi.
- Lượt này cập nhật qua quy trình VPS hiện có. Chưa xác minh được cơ chế tự động từ GitHub tới VPS; không thay cấu hình CI/CD.
