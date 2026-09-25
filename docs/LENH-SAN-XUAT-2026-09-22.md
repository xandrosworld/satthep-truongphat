# Lệnh sản xuất — bàn giao ưu tiên cho xưởng

**Cập nhật 25/09:** luồng kho, xác nhận công nghệ và kết thúc công đoạn đã được bổ sung; xem [hướng dẫn mới](DIEU-HANH-CONG-DOAN-2026-09-25.md). Các giới hạn mô tả bên dưới là thời điểm bàn giao 22/09.

Phạm vi triển khai đợt này: chuyển dữ liệu sản xuất từ đơn hàng đã tạo theo báo giá đã duyệt sang lệnh theo sản phẩm/lô; thông số, vật tư, công đoạn, sơ đồ cắt; chuẩn bị, phân công, sản lượng, QC, lịch sử và in lệnh. Không tuyên bố hoàn thành toàn bộ các phân hệ GĐ2-B.

## Sử dụng
1. Quản trị/người lập có quyền quản lý chuyển báo giá đã duyệt thành đơn hàng. Màn hình phát hành lệnh mở ngay sau khi tạo đơn.
2. Hoặc mở **Lệnh sản xuất** ở thanh bên → **Phát hành lệnh** → chọn đơn hàng, sản phẩm, mã lệnh và số lượng lô.
3. Tài khoản kỹ thuật mở lệnh, kiểm tra thông số/vật tư/sắp xếp tấm, xác nhận bản vẽ và đủ vật tư; khai xưởng, hạn hoàn thành.
4. Trong **Công đoạn**, phân công, bắt đầu, cập nhật sản lượng và hoàn thành. Quyền sửa dựa trên quyền công đoạn hiện có.
5. Ghi QC. Chỉ hoàn thành lệnh khi công đoạn và QC đạt đủ số lượng. Lệnh hoàn thành được khóa.
6. **In lệnh** chứa toàn bộ phần kỹ thuật và sơ đồ cắt, không có giá. **Tải lại** để nhận cập nhật của đồng nghiệp.

## Dữ liệu và phân quyền
- Mọi API `/api/production` dùng danh sách trường cho phép; không trả bảng giá, đơn giá, chi phí, lợi nhuận, VAT hay giá chào, kể cả cho quản trị trong màn hình này.
- Vai trò sales bị chặn ở API sản xuất; quản trị/estimator/approver/technical được xem. Phát hành: admin hoặc estimator có quyền manage; cập nhật: người phát hành hoặc technical có quyền operations.
- Snapshot lệnh lấy từ đúng revision được đơn hàng tham chiếu, không từ báo giá đang sửa hay danh mục mới. Không nhận snapshot hoặc giá từ trình duyệt.
- Khi tách lô/sản phẩm, tính lại xếp phôi theo lượng của lệnh; giao diện ghi rõ cần kiểm tra phương án này. Không dùng lại nguyên sơ đồ toàn đơn cho một lô nhỏ.
- Tổng lượng phát hành không vượt lượng đơn hàng; mã lệnh duy nhất, gửi lại cùng mã/đơn/sản phẩm/số lượng trả lệnh đã tạo.
- Kiểm tra phiên bản chống ghi đè đồng thời; nhật ký người/thời điểm/thao tác; lưu SQLite và xuất kèm bản sao lưu quản trị.

## Ranh giới hiện tại
- Xác nhận đủ vật tư là kiểm tra thủ công tại xưởng. Chưa đọc tồn khả dụng/giữ chỗ hay tự sinh chứng từ xuất kho. Luồng kho–mua hàng đầy đủ thuộc triển khai liên thông GĐ2-B tiếp theo.
- Chưa có điều độ công suất máy, chứng từ giao hàng, tích hợp máy CNC; không tuyên bố đã hoàn tất các mục này.
- Hồ sơ đã phát hành cố định; chỉnh nguồn không tự thay lệnh. Chưa có quy trình hủy/thay thế lệnh hoặc sửa công đoạn đã hoàn thành.
- Sơ đồ tấm/thanh có chi tiết, vị trí và kích thước; không cam kết tối ưu toán học.

## Kiểm thử
- `tests/production-server.test.cjs`: phiên bản duyệt, phân quyền, không lộ giá, CSRF, lô/vượt lượng/trùng mã, chuẩn bị, công đoạn/QC/khóa, xung đột, nguồn bất biến, sao lưu, khởi động lại.
- `tests/production-browser.cjs`: hai trình duyệt admin/kỹ thuật, phát hành đến hoàn thành, từ chối lưu bản cũ, sơ đồ cắt, reload/logout, desktop 1920/1366/1093 CSS px.
- Bộ server + chat + production: 24 kiểm thử đạt trước triển khai; kiểm tra giao diện bằng Edge headless.
