# Rà soát các thay đổi gần đây — 29/09/2026

Phạm vi: khóa ba nhóm hệ số; quyền và lưu vận chuyển bước 6; giao việc theo cơ cấu; nhân sự một nguồn; sửa/xóa cơ cấu; phân quyền thống nhất; chặn khách hàng trùng; cửa sổ làm việc/chat; danh sách báo giá; người đề nghị và căn cứ công việc.

## Lỗi phát hiện và sửa

Chi tiết yêu cầu mua phân bổ theo lệnh gọi biến `pricing` ngoài phạm vi khai báo, gây `ReferenceError: pricing is not defined` sau khi hồ sơ đã chuyển sang hàng đợi duyệt mua. Đã tái hiện bằng luồng thật cục bộ: lập đề nghị → kỹ thuật xác nhận → bổ sung giá/nhà cung cấp → mở chi tiết mua.

Đã bỏ nút điều chỉnh đặt nhầm trong bảng phân bổ. Điều chỉnh trước mua vẫn ở màn rà soát giá và theo kiểm tra trạng thái máy chủ. Bảng chi tiết mở được, hiển thị phân bổ theo lệnh và người/phòng đề nghị; không lặp lịch sử căn cứ.

## Kiểm thử

- **46/46 bài API/nghiệp vụ** thuộc 16 tệp kiểm thử liên quan: quyền theo hành động/phần việc; công thức và hai khóa hệ số độc lập; nhân sự; quản lý/phạm vi giao việc; xóa và đổi cơ cấu; khách hàng trùng; vận chuyển; toàn bộ loại đề nghị, cấp kho, mua và liên kết chi phí.
- **134/134 bài nền tảng** của `npm test`: tính toán, giá, sản xuất, vật tư tận dụng, công việc, đầu vào.
- **16/16 luồng trình duyệt**: hệ số, vận chuyển, bộ quyền mẫu, đổi tên phòng, lưu khách hàng, cửa sổ/tab/chat, danh sách báo giá, mua theo lệnh, đề nghị theo căn cứ và vòng đời cấp/sửa chữa; có kiểm tra kích thước di động.
- Build và kiểm tra whitespace đạt.
- Có thể chạy lại toàn bộ nhóm trên bằng `node tools/verify-recent-fixes.cjs`.

Một số fixture cũ tạo tài khoản trực tiếp nên dừng ngay trước khi kiểm tra nghiệp vụ. Đã chuyển chúng qua nhân sự được duyệt, bố trí vị trí rồi tạo tài khoản. Các ca chuyên kiểm tra quyền trực tiếp chuyển nguồn quyền qua API quản trị; các ca kiểm tra cơ cấu chuyển rõ sang nguồn vị trí. Không nới kiểm tra trên máy chủ để phục vụ test. Các kỳ vọng chỉnh hồ sơ nhân sự và chống tăng quyền cũng đã chuyển sang quy trình hiện hành.

`factor-lock-browser.cjs` cũ chạy bản phát hành lưu trữ ngày 20/09, không phải runtime hiện tại. Nhóm rà soát dùng `coefficient-locks-browser.cjs` và 16 bài `formula-access.test.cjs` để kiểm tra hai khóa hiện hành. Số liệu trên là nhóm kiểm thử xác định, không phải tuyên bố mọi tệp kiểm thử lịch sử trong repository đều đạt.

## Đối chiếu trên máy chủ thật

Bản runtime `808755f` đã triển khai lên https://truongphat-group.xyz; HTML khớp build cục bộ và `/healthz` trả thành công.

- **6/6 luồng trình duyệt thật đạt**: bộ quyền thống nhất; nguồn nhân sự; thứ tự vị trí; cửa sổ làm việc/chat; danh sách báo giá và về trang chủ; người đề nghị/căn cứ/điểm tạo từ đơn hàng và lệnh sản xuất. Có kiểm tra màn hình di động.
- Kiểm tra thật chỉ đọc dữ liệu và thao tác biểu mẫu chưa lưu, chặn API ghi nghiệp vụ. Máy chủ chưa có hợp đồng để thử điểm tạo từ hợp đồng; luồng này đã kiểm tra cục bộ.
- Phú có vị trí quản lý và quyền giao việc; Thảo có quyền sử dụng vận chuyển. Hai khóa `calculationFactors:all` và `operationPricing:all` đang khóa.
- Tổ giá và vị trí đã bỏ không còn; Phòng dự án đã đổi tên; không có vị trí tham chiếu phòng ban mất. VIVIAN còn một hồ sơ.
- Phiên quản trị tạm dùng kiểm tra đã thu hồi.

## Dữ liệu cũ cần xử lý riêng

Còn ba hồ sơ AMME cùng tên, người liên hệ và số điện thoại; chưa khai mã số thuế. Mã sinh theo thời gian cho thấy cả ba được tạo ngày 17/09/2026, trước bản sửa chống trùng. Đây là dữ liệu tồn tại sẵn, không phải kết quả lưu mới trong đợt kiểm tra. Chưa gộp/xóa vì chưa đối chiếu toàn bộ tham chiếu của các hồ sơ này. Cơ chế hiện tại chặn tạo thêm hồ sơ trùng nhưng không tự gộp dữ liệu cũ.

Các kiểm thử trên xác nhận phạm vi vừa sửa; không thay thế nghiệm thu mọi luồng nghiệp vụ với dữ liệu thực tế.
