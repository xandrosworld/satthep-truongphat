# Giá vật tư, điều kiện thuế và phân tích giá

## Phạm vi

- Bước 6 có khối lượng vật tư tính tiền, lượng vật tư phụ quy đổi và tiền vật tư phụ ở từng cấp cấu thành. Cấp cha tổng hợp các dòng con, không cộng lại hai lần.
- Dòng chọn dự tính dùng phôi × (1 + hao hụt). Dòng cũ giữ cách tính theo khổ mua, có trừ phần dư nếu đã chọn tận dụng. Đơn giá m/m²/cái vẫn dùng đúng đơn vị, kể cả khi giá bằng 0.
- Vật tư phụ = tiền vật tư chính × tỷ lệ phụ; lượng phụ chỉ để đối chiếu giá trị, không thêm vào vật tư thực, diện tích thực hiện hoặc vận chuyển. Vật tư do bên gia công cấp không mua lại.
- Các cột này theo phương án tính toán chi tiết. TMC giữ bảng phân rã riêng theo phôi/hao hụt và đơn giá TMC.
- Hộp thuế đọc giá kg/đối thủ đã nhập, không nhập lại hoặc ghi đè. Thuế đầu ra chọn chung toàn báo giá hoặc riêng từng sản phẩm; người lập khai đủ tỷ lệ. Không tự suy thuế suất từ nhóm.
- Cộng tiền hàng theo từng thuế suất, làm tròn tiền thuế của mỗi nhóm đến đồng, cộng vào tổng. Báo giá cũ một thuế suất giữ phép tính cũ. Bản in, CSV, Excel, bản chào máy chủ và giao diện bán hàng hiển thị từng mức thuế.
- Thay thuế suất/phạm vi hoặc thêm sản phẩm chưa khai thuế làm mất xác nhận thuế đầu ra. Bản đã duyệt giữ dữ liệu thuế của phiên bản đó.
- Bước 7 theo thứ tự: hệ số → vật tư → nguyên công → chi phí khác → giá chào và phần còn lại. Chi tiết nguyên công có lượng, đơn vị, đơn giá và tiền; chi phí kg/đối thủ/công thức nhóm được ghi là tham khảo.
- Một phương án dùng bảng gọn; cột nội dung nền đậm, cột số nền nhạt. Đối chiếu nguồn/thuế có thể mở riêng. Phần còn lại là dự tính sau chi phí, không phải lãi ròng thực tế.
- Excel nội bộ có bảng lượng tính tiền và vật tư phụ; bảng phân tích giữ cùng thứ tự nghiệp vụ. File gửi khách không chứa các bảng nội bộ.

## Kiểm tra

- Tests tính toán: vật tư kg/m², đơn giá 0, hao hụt, phần dư, vật tư bên ngoài cấp, thuế riêng/chung, làm tròn, giá chốt tay, dữ liệu cũ và phân quyền.
- API: lưu → trình → duyệt với hai mức thuế; đổi thuế phải xác nhận lại; phiên bản đã duyệt giữ nguyên.
- Trình duyệt: bước 6, hộp thuế, phân tích một/nhiều phương án, bản in, CSV, Excel, tải lại và màn hình hẹp.
- Kiểm tra Railway bằng `node tools/verify-pricing-review-live.cjs`: đối chiếu build, health, đăng nhập và đọc tám bước. Chặn các yêu cầu ghi dữ liệu báo giá trong phiên kiểm tra.

## Kết quả ngày 17/09/2026

- 433/433 tests tính toán và API đạt.
- `pricing-review-browser.cjs`, `tax-browser.cjs`, `technical-pricing-browser.cjs` đạt.
- Railway triển khai mã ứng dụng `66eba1d` thành công; build thực tế khớp build cục bộ, health và đăng nhập đạt. Kiểm tra tám bước không phát sinh yêu cầu ghi báo giá.
- Log và ảnh kiểm tra nằm trong `artifacts/customer-review/pricing-review-2026-09-17/` (không đưa dữ liệu riêng vào Git).
