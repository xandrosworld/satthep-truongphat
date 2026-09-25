# Báo giá đã duyệt → đơn hàng → sản xuất → thay đổi kỹ thuật

Yêu cầu khách xác nhận ngày 25/09/2026.

- Nút Báo giá ở thanh bên mở danh sách kể cả khi đang xem báo giá. Không xóa bản nhập chưa lưu khi mở danh sách.
- Báo giá đã duyệt có khu vực Tạo / mở đơn hàng và Tạo lệnh sản xuất theo quyền đã cấp. Lệnh chỉ phát hành từ đơn hàng đã chốt, đúng phiên bản báo giá đang mở; giữ kiểm tra số lượng và chống tạo trùng hiện có.
- Lệnh giữ dữ liệu vật tư, thông số, công đoạn và phương án cắt của phiên bản được duyệt. Tách lô tính lại theo số lượng lô.
- Trong lệnh có Đề nghị thay đổi kỹ thuật: chọn dòng, chọn mã vật tư cùng hình dạng, thay thông số/kích thước và khổ tấm, nhập lý do.
- Luồng bắt buộc: đề nghị → xác nhận kỹ thuật → Admin duyệt áp dụng. Quyền `production.confirm` dành cho xác nhận kỹ thuật trong ma trận quyền; tài khoản kỹ thuật cũ dùng quyền công đoạn hiện có. Chỉ Admin được áp dụng, kiểm tra ở máy chủ.
- Trước và sau thay đổi được lưu cùng người đề nghị, người xác nhận, người duyệt, thời điểm và lý do. Dữ liệu tính toán đầy đủ chỉ lưu máy chủ; giao diện kỹ thuật không nhận giá nội bộ.
- Duyệt áp dụng tính lại vật tư/công đoạn/phương án cắt, tăng phiên bản lệnh, bỏ xác nhận chuẩn bị cũ và giải phóng giữ kho chưa cấp để đối chiếu lại. Công đoạn bổ sung thủ công được giữ. Không sửa báo giá hay đơn hàng gốc.
- Đề nghị dựa trên phiên bản cũ bị chặn áp dụng. Không thay đổi lệnh đã bắt đầu sản xuất, đã cấp vật tư, đã QC hoặc hoàn thành; cần xử lý lô đang thực hiện riêng.
- Dữ liệu lưu trong `ops_records`, đi cùng bản sao lưu hiện có. Lệnh cũ dựng nguồn từ phiên bản đơn hàng; lệnh mới lưu nguồn tính toán riêng ngay lúc phát hành.

Kiểm thử: `tests/production-changes.test.cjs`, `tests/production-changes-browser.cjs`, `tests/production-server.test.cjs`, `tests/production-browser.cjs`. Kiểm tra mã/khổ/chiều dày, tính lại, quyền, thứ tự duyệt, xung đột phiên bản, giữ kho, khóa lô chạy, giữ nguồn gốc, desktop/mobile và tải lại.

Lượt toàn bộ đầu tiên có một tiến trình `definition-server.test.cjs` kết thúc sớm không có assertion; chạy riêng đủ 8 ca đều đạt. Kết quả lượt toàn bộ cuối lưu tại `artifacts/production-changes-full-final.txt`.

Kết quả: toàn bộ 727/727 ca đạt; sau khi kiểm tra thêm quyền thao tác tách riêng xác nhận kỹ thuật, 11/11 ca quyền và sản xuất đạt. Hai bài kiểm tra trình duyệt đạt, gồm luồng cũ và luồng đề nghị mới, desktop/mobile và tải lại.

Đã triển khai release `1a24a55` lên HTTPS sau sao lưu. Kiểm tra trực tiếp báo giá đã duyệt: nút chuyển giao, mở danh sách từ thanh bên và hiển thị mobile đều đạt; API sản xuất hoạt động. Máy chủ hiện chưa có lệnh sản xuất nên luồng thay đổi đầy đủ được kiểm tra bằng dữ liệu thử cục bộ, không tạo dữ liệu thử vào hệ thống khách. Nhật ký tại `artifacts/vietnix/production-changes-live.txt`. Phiên kiểm tra tạm được thu hồi sau kiểm tra.
