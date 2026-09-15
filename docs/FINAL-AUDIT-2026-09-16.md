# Rà yêu cầu khách tối 15/09 — hoàn tất 16/09/2026

Đối chiếu chuỗi phản hồi 22:25–23:33 mà người dùng cung cấp. Phần lập/sửa đầy đủ trên điện thoại đã được khách để xét sau; không nằm trong xác nhận hoàn thành này.

## Kết quả theo yêu cầu

| Yêu cầu | Kết quả kiểm tra |
| --- | --- |
| Giá nguyên công theo từng dòng vật tư | Mỗi công việc dùng lượng, quy cách và yếu tố của dòng đó; cùng nguyên công có thể ra đơn giá khác nhau. Bảng Giá & hệ số hiện riêng từng dòng và nguồn hệ số. |
| Chiều dày, khách hàng, tổng cấu kiện có liên kết | Chiều dày theo quy cách dòng/cấp thực hiện; tổng cấu kiện nhân số lượng các cấp rồi cộng toàn báo giá; khách hàng lấy hồ sơ lưu trong báo giá. Đầu vào riêng được ghi rõ là nhập riêng. Thiếu dữ liệu không tự lấy hệ số 0. |
| Gán nhiều nguyên công | Chọn nhiều ô, phương án và định mức riêng, mặc định tại xưởng; giữ nguyên công không chọn và giá trị yếu tố riêng. Chọn cả cha/con chỉ gán cấp cao nhất. F5 giữ dữ liệu. |
| Thêm bảng giá tủ điện, cửa gió… | Đơn giá đầu vào → Nhóm giá khác → Thêm nhóm giá. Khai công thức, tham số, đơn vị và căn cứ; chủ động lấy vào báo giá, phân nhóm và chọn áp dụng. Sửa danh mục không tự đổi giá đã lấy. |
| Nhiều phiên bản, lưu từng lần gửi | Bản duyệt giữ snapshot, bản chào và Excel. Gửi/gửi lại gắn phiên bản, thời điểm, người thao tác, người nhận/kênh. Chọn được bản cũ để ghi phản hồi sau khi có bản mới. |
| Nền/chữ/khung theo Zalo | Đã dùng bảng màu ZaUI công bố và ảnh tham chiếu, chữ tối trên nền sáng; phân cấp sản phẩm > cấu kiện > vật tư. Rà lại 12 màn hình/trạng thái, không còn mẫu chữ dưới 4,5:1 trong phạm vi đo. |

## Những điểm sửa thêm trong lượt rà này

1. **Đổi tên khách còn dùng mã khách cũ để tính hệ số.** Đã tái hiện giá cơ sở 1.000 thành 1.500 do mã cũ vẫn nhận +50%. Nay tên không khớp hồ sơ thì không dùng mã cũ; yếu tố theo mã báo thiếu, chọn hồ sơ mới sẽ tính lại đúng. Kiểm tra qua nút Chỉnh thông tin và Chọn khách hàng.
2. **Suy ra mác/vật liệu tại cấp tổng khi một dòng con thiếu dữ liệu.** Chỉ suy ra khi tất cả các phôi con đều đủ và giống nhau; khác hoặc thiếu phải khai rõ.
3. **Chỉ ghi giao dịch cho bản duyệt mới nhất.** Bổ sung chọn phiên bản cũ, giữ riêng trạng thái/hiệu lực và nhật ký; có kiểm tra xung đột và quyền máy chủ. Ví dụ đã có V2 vẫn ghi khách chốt V1 đúng vào V1.
4. Thanh sáu tab Đơn giá đầu vào gây tràn khung ở 390px: giữ cuộn trong thanh tab. Đây là sửa lỗi hiển thị hiện có, không triển khai toàn bộ luồng mobile.

## Số đối chiếu độc lập

Dữ liệu QA: 2 sản phẩm × 3 cấu kiện × 4 vật tư = 24 chi tiết mỗi dòng; tổng cấu kiện là 6. Phôi dài 1.000 × rộng 100 mm, mật độ 7.850 kg/m³. Giá cơ sở 1.000 đ/kg; hệ số số lượng −5%, khách A +20%, tổng cấu kiện +10%.

| Dòng | Kg | Hệ số chiều dày | Đơn giá tính tay | Tiền công |
| --- | ---: | ---: | ---: | ---: |
| T = 1 mm | 18,84 | +10% | 1.000 × 1,10 × 0,95 × 1,20 × 1,10 = 1.379,4 | 25.987,896 |
| T = 2 mm | 37,68 | +20% | 1.000 × 1,20 × 0,95 × 1,20 × 1,10 = 1.504,8 | 56.700,864 |

Đổi sang hồ sơ khách B có hệ số 0%: dòng mỏng còn 1.149,5 đ/kg. Giảm còn 1 sản phẩm: lượng dòng là 12, tổng cấu kiện là 3, đơn giá còn 1.100 đ/kg. Các số và đầu vào khớp trên trình duyệt, giữ qua F5. Không dùng các số QA làm đơn giá khách hàng.

## Kiểm chứng và giới hạn

- Toàn bộ 394 kiểm thử logic/API đạt; chạy lại riêng 21 bài máy chủ sau sửa kiểm tra phiên bản cũng đạt.
- 60 nhóm kiểm tra trình duyệt đạt: liên kết/gán nguyên công 6; phiên bản 6; phiên bản máy chủ 3; ma trận 5; chọn cách giá 5; đồng bộ cách giá 5; nhóm giá 14; vật tư hoàn thiện 5; toàn luồng 9; màu/lưu dữ liệu 2.
- Bài toàn luồng cũ đã được cập nhật mở mục Đề xuất tổ hợp mua vật tư trước khi rà phần dư. Đã đi hết tạo đơn trống → cấu thành → công đoạn → duyệt → ghi gửi/chốt → xuất hồ sơ. Không bỏ kiểm tra lỗi phần dư để làm bài kiểm thử đạt.
- Bằng chứng: `artifacts/customer-review/final-audit-2026-09-16/`. Tệp `verification.json` gắn SHA-256 bản build; `live/` lưu đối chiếu bản triển khai và chạy lại những luồng trọng tâm. Tất cả dùng dữ liệu QA riêng, không gửi thông điệp thật cho khách.
- Netlify hiện vẫn là demo lưu dữ liệu trong trình duyệt. Kiểm thử máy chủ là môi trường cục bộ; không xác nhận đã có backend/lịch sử dùng chung trên hosting.
- Bản duyệt rất cũ thiếu snapshot được báo rõ, không thể khôi phục giả dữ liệu chưa từng lưu. Đây là kết quả tự kiểm tra có phạm vi; khách vẫn cần nạp bộ tham số thực để nghiệm thu.
