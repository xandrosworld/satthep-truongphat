# Đọc bản vẽ PDF / ảnh

Admin mở báo giá nháp → Đầu vào báo giá → Đọc PDF / ảnh đầu vào.
Chọn PDF, PNG hoặc JPG tối đa 5 MB. Tệp được gửi tới OpenAI khi bấm Đọc tài liệu.
Kết quả và bản gốc được lưu trên máy chủ để mở lại, kể cả khi đóng cửa sổ chat/báo giá.

Kiểm tra từng dòng, bổ sung số lượng, kích thước phôi và chọn đúng mã vật tư.
AI không tự tạo giá, mác vật liệu hoặc khổ mua. Dòng chưa chọn mã được giữ thành yêu cầu chờ bóc tách; lưu nháp được nhưng chưa được duyệt khi chưa có vật tư.
Sau khi nhập, bấm Lưu báo giá lên máy chủ. Mỗi dòng được nhập một lần để tránh trùng.

## Cấu hình và chi phí

`OPENAI_API_KEY` chỉ đặt ở môi trường máy chủ. `OPENAI_MODEL=gpt-5.6-terra` là mặc định.
Chỉ chấp nhận Terra hoặc Luna; không tự chuyển sang model khác và không tự thử lại khi lỗi.
Giới hạn 8.000 token đầu ra, 2 lượt đồng thời, 10 lượt/tài khoản/giờ. Đây là giới hạn sử dụng, không phải trần tiền cố định.
Đầu ra chưa hoàn tất không được nhập vào báo giá. Có thể chia tài liệu nhỏ hơn nếu vượt giới hạn.

Đã có kết quả API Terra trên 4 PDF một trang: chi phí theo token khoảng 0,023–0,062 USD/file với đơn giá $2/triệu token đầu vào và $12/triệu token đầu ra (22/09/2026). Không dùng mức này làm báo giá cố định cho tài liệu khác.
Nguồn: https://developers.openai.com/api/docs/models/gpt-5.6-terra

## Giới hạn chất lượng

Bản vẽ phức tạp, ký hiệu nhỏ, kích thước lắp ráp và phôi triển khai có thể bị đọc nhầm. Mẫu grating đã có lỗi chọn chiều dài nên bắt buộc đối chiếu bản gốc. Không tự động phê duyệt hoặc thay thế kỹ thuật bóc tách.
Mã có công thức riêng được khai tiếp trong cấu thành thay vì ánh xạ tự động.

## Kiểm tra

`node --test tests/ai-pdf.test.cjs tests/server.test.cjs tests/technical-access.test.cjs tests/technical-payload.test.cjs`

Kiểm tra trình duyệt bằng `node tests/ai-pdf-browser.cjs` sau khi dựng bản build kiểm thử tại `artifacts/gd1-report-2026-09-20/release/dist`.
Các test tự động dùng provider giả lập, không gọi API tính phí. Bao gồm quyền truy cập, CSRF, số liệu chưa rõ, nhập trùng, ánh xạ vật tư, lưu/mở lại và chặn model đắt.
