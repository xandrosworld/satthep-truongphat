# Danh sách đóng phần báo giá — 13/09/2026

Danh sách cố định để xử lý phần còn thiếu, không đổi định nghĩa “xong” theo mỗi lần người dùng hỏi. Nghiệm thu/triển khai thực tế là bước riêng, không che việc mã nguồn chưa hoàn tất.

## Phần triển khai phải đóng trong lượt rà này

1. Theo dõi sáu trạng thái giao dịch, độc lập với duyệt giá nội bộ; lưu lịch sử và chống ghi đè.
2. Tìm/lọc báo giá theo khách, trạng thái, ngày; dùng được tại trình duyệt và máy chủ.
3. Khối lượng phôi đặc thù, giữ cân đối mua/phôi/phần dư; không nhầm công thức lượng thực hiện.
4. Cơ sở m³ của công đoạn và định mức hoàn thiện.
5. Đếm lượt dùng mẫu, ưu tiên mẫu thường dùng, đổi tên và xóa an toàn.
6. Tra giá vật liệu/mác có thứ tự rõ; khôi phục giá trước khi sửa, không nạp đè ca mẫu.
7. Quản lý/xuất đầy đủ danh mục; bảo vệ giá trị đang được dùng, giữ chứng từ cũ.
8. Các trường đầu vào của mẫu khách, bảng tổng hợp quy đổi đ/kg và đầu mục chi phí: ánh xạ nguồn thực, không tự dựng 38 cột rồi khẳng định giống mẫu khách.
9. Chuẩn bị gửi báo giá qua email/Zalo; không báo “đã gửi” khi mới mở hộp soạn, không tự gửi tới khách thật.
10. Tự chạy cả luồng từ tạo báo giá trống tới duyệt, theo dõi giao dịch, xuất và chuyển hồ sơ; kiểm tra quyền, lịch sử, dữ liệu lỗi và hồi quy bản cũ.

## Không được tự suy diễn thành đã hoàn thành

- Ánh xạ biểu mẫu cuối cùng chưa được khách duyệt không có nghĩa phần mềm phải chờ mới làm.
- Tài khoản gửi mail/Zalo, tên miền/HTTPS thật hoặc dữ liệu thực cần người có thẩm quyền cung cấp/cấu hình; không tự dùng tài khoản hay website cũ của khách để gửi hoặc triển khai.
- Khách chưa nghiệm thu thì không tự ghi nghiệm thu. Mỗi mục mã nguồn có kiểm tra và trạng thái riêng, không chỉ báo tổng số bài test.

## Kết quả triển khai và cách kiểm tra

| Mục | Mã nguồn và bằng chứng | Trạng thái |
| --- | --- | --- |
| 1–2 | `completion-core/ui`, `server/workflow`, `server.test`, `completion-browser` | Có sáu trạng thái, hiệu lực/lịch sử/phiên bản, lọc kết hợp; chọn lại giá mới không thừa kế khách chấp nhận bản cũ |
| 3–4 | `core`, `work-core`, `completion.test/browser` | Khối lượng phôi đặc thù áp đồng nhất mua/phôi/phần dư; m³ cho công đoạn và định mức, đơn vị riêng yêu cầu lượng rõ |
| 5–6 | `completion`, `catalog-price-ui`, `conventions`, các test completion | Lượt dùng mẫu/ưu tiên; giá mác > vật liệu > mã cùng đơn vị, mốc khôi phục không nạp ca mẫu |
| 7 | `conventions`, `completion`, `server/catalog-guard`, `catalog-sync-ui` | Danh mục giá trị, nơi dùng, chặn xóa, giữ bản duyệt, xuất 13 sheet; mã mới được quản trị chọn phát hành |
| 8 | `source-core/ui`, `completion-browser`, `check-phase1-pack` | Đối chiếu nguồn 38 cột B:AM, chỉnh biến bổ sung, kg/m và m²/chi tiết rõ; bảng đ/kg chia theo kg phôi, tách đầu mục |
| 9 | `completion-ui`, kiểm MIME/XLSX trong `check-phase1-pack` | Có email nháp `.eml` đính kèm Excel giá bán và chia sẻ tệp qua ứng dụng; chưa là gửi trực tiếp qua API nhà cung cấp |
| 10 | `completion-browser` và toàn bộ `verify:phase1` | Thử báo giá trống → gọi mẫu → rà hao hụt → giá/đơn vị chào → lưu/trình/duyệt → giao dịch → xuất/chuyển đơn; báo cáo lần cuối gắn mã nguồn |

Bằng chứng cuối: `artifacts/phase1-2026-09-12/verification-latest.json`. Chỉ tin kết quả khi `passed=true` và SHA-256 khớp bản đang dùng. Các log cũ/failure cũ được giữ làm lịch sử, không thay kết quả mới.

Danh sách này cố định phạm vi lượt sửa, không thay hợp đồng hoặc chứng nhận hoàn thành GĐ1. Gửi trực tiếp bằng tài khoản thật, hạ tầng thật và nghiệm thu còn là các bước riêng. Riêng 05.11, mã nguồn giữ bản đã duyệt thay vì cập nhật tên mất lịch sử; bảng truy vết ghi rõ khác biệt cần thống nhất.
