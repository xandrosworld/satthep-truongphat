# Bổ sung Dày chung — 14/09/2026

Phạm vi: phần trường nhập/lưu dữ liệu của **DM-05**, không phải hoàn tất toàn mã hoặc toàn bộ nhánh TMC. Căn cứ: ảnh chữ “dày” sau Cao H, nguồn nội dung 5. Không tự chốt quy tắc tự đổi vật tư theo độ dày (CĐ-04).

## Đã triển khai và kiểm

Ứng dụng `b4b8840766ac746e979c318ed1baacc372ab1b27` đã push main và lên [Netlify](https://baogia-truongphat.netlify.app/). Toàn HTML khớp build chuẩn LF lúc **15:46:52 ngày 14/09/2026**; chỉ có đoạn toolbar Netlify nối thêm đã nhận diện chính xác.

- Local: **7/7 nhóm tác vụ**, **224 ca logic, 41 ca máy chủ**; bốn bộ giao diện gồm **34 nhóm tình huống**, **36 ảnh**.
- Web thật kết thúc **15:47:16**: **27/27 nhóm tình huống**, **24 ảnh** (7 nhóm Dày/6 ảnh, 9 nhóm hồi quy công thức/10 ảnh, 11 nhóm nguồn giá–logistics–xuất báo giá/8 ảnh). Không lỗi JavaScript trong các lượt kiểm.
- SHA-256 ứng dụng chuẩn LF: `0a60065ae032694b2607775a2c10ccefc4660761ce3f17c4c8c7a22dcf668b01`.
- Kiểm trực tiếp bằng trình duyệt riêng, dữ liệu mẫu kiểm thử; không sửa hồ sơ trên trình duyệt của khách. Máy chủ kiểm localhost, không phải đã triển khai server sản xuất.

## Cách dùng và giới hạn

Vào **Cấu thành sản phẩm → Bảng nhập nhanh**. Hàng kích thước chung có **Dài L → Rộng W → Cao H → Dày T**; đơn vị mm. Trường Dày cũng có trong cửa sổ cấu hình kích thước chung và tạo biến thể.

1. Báo giá cũ chưa có T hiển thị trống, không tự lấy 1,5 từ dòng vật tư. Nhận số thập phân dương; 0/âm/giá trị không hợp lệ bị từ chối. Để trống lưu là chưa khai, không phải 0.
2. Lưu/tải lại, hoàn tác, lưu/gọi mẫu, tạo biến thể giữ đúng T độc lập. Bản duyệt trên máy chủ giữ snapshot, không cho ghi đè; dữ liệu T lỗi hoặc công thức tham chiếu T còn thiếu bị chặn khi trình duyệt.
3. **Nhập T không tự đổi mã, thương hiệu, độ dày cố định của vật tư hay giá.** Giao diện ghi rõ giới hạn này và liệt kê độ dày vật tư hiện tại để đối chiếu khi T đã khai. Giá và khối lượng vẫn theo vật tư đang chọn. Thông số xuất ghi rõ đây là “Dày chung (tham số)”, không khẳng định mọi vật tư đã có độ dày đó.
4. Cơ chế công thức hiện có cho người lập tham chiếu rõ `PRODUCT_T` vào thông số được phép nhập. Không tự tạo liên kết. Thông số T cố định của mã vật tư không được sửa bằng công thức. Kiểm logic ca giả lập `L = PRODUCT_L - 2 * PRODUCT_T`: L chung 2000, T chung 2 → L chi tiết 1996; đổi T thành 3 → 1994; T mã vẫn 1,5. Đây là ca QA, không phải công thức khách yêu cầu.
5. **Chưa làm tự chọn/đổi mã vật tư khi sửa Dày chung.** Phạm vi dòng chịu ảnh hưởng và sản phẩm nhiều độ dày theo CĐ-04. Vì vậy DM-05 vẫn `[~]`, không đánh dấu trọn mã chỉ vì đã có ô nhập.

## TMC trong lúc chờ khách

Đã ghi nguyên văn phản hồi 15:26:36/15:27:29: công thức TMC chỉ áp cho sản phẩm thang máng cáp trong đơn nhiều loại. Câu 15:33:49 đề nghị tính hàng cơ khí khác theo phương án chi tiết chưa có trả lời. **Không thay đổi công thức/nhánh giá TMC trong commit này.** CĐ-01 và các mã liên quan giữ mở; chỉ yêu cầu ca một sản phẩm gộp hai phần nếu thực tế có, không biến câu hỏi của bên lập trình thành yêu cầu khách đã chốt.

## Bằng chứng và chạy lại

[Báo cáo kèm ảnh nội bộ](../artifacts/customer-review/thickness-2026-09-14/KET-QUA.md) · [Manifest SHA-256](../artifacts/customer-review/thickness-2026-09-14/evidence-manifest.json) · [Đối chiếu deployment](../artifacts/customer-review/thickness-2026-09-14/live/deployment-check.json).

Ảnh/tệp QA ở workspace, không tự đưa dữ liệu khách lên repo công khai. Ảnh QA này không thay ảnh gốc khách gửi, hiện chưa có bản ảnh gốc local.

Chạy `node tools/verify-thickness.cjs` để build, kiểm logic/máy chủ và giao diện local. Đặt `THICKNESS_URL`, `BATCH_TWO_URL`, `BATCH_SIX_URL` thành URL triển khai rồi chạy lần lượt các bài `tests/thickness-browser.cjs`, `tests/batch-two-browser.cjs`, `tests/batch-six-browser.cjs`; đặt các biến `*_ROOT` tương ứng để lưu riêng bằng chứng. Các bài web dùng bộ dữ liệu mẫu trong phiên trình duyệt riêng.
