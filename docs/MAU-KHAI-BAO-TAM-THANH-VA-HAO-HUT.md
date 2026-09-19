# Mẫu khai báo tấm, thanh và đối chiếu hao hụt

Vào **Danh mục quy ước → Hình dạng & công thức → Mở các mẫu khai báo → Mở mẫu**. Có tám mẫu đã điền thông số, công thức và số thử: tấm chữ nhật, tròn, tam giác vuông; thanh tròn đặc, hộp chữ nhật, ống tròn, góc L và thanh định hình theo bảng kê.

Mở mẫu chỉ tạo bản nháp để kiểm tra. Bấm **Lưu phiên bản** mới ghi vào danh mục; sau đó tạo mã vật tư theo quy ước và khai khổ mua trong Thẻ kho. Số thử không phải thông số sản xuất đã xác nhận. Các báo giá cũ giữ phiên bản đang dùng.

## Cách khai thanh

- **Theo công thức:** đường kính, kích thước tiết diện và chiều dày khai cố định theo mã vật tư; chiều dài cắt L nhập tại báo giá. Công thức K trả kg/m, A trả m²/m. Khối lượng một chi tiết = L / 1.000 × K; diện tích = L / 1.000 × A.
- **Theo bảng kê:** nhập KM (kg/m), AM (m²/m) theo bảng nhà cung cấp cho từng mã. K = KM, A = AM; vẫn nhân chiều dài như trên. Mẫu KM = 10 và AM = 0,5 chỉ để thử, không phải bảng tra tiêu chuẩn.
- Thanh chỉ cần chiều dài khổ mua. Rộng khổ tấm được ẩn và không bắt buộc; công thức rộng khai triển của thanh bằng 0.

Công thức mẫu dùng tiết diện lý tưởng, chưa tính bo góc/dung sai. Diện tích thanh không gồm hai mặt đầu; hộp và ống chỉ tính mặt ngoài. Đối chiếu yêu cầu thực tế trước khi dùng cho hoàn thiện bề mặt.

## Tính trên khổ chuẩn

Kích thước khai triển xác định khổ bao để xếp: chữ nhật L/W, hình tròn D/D, tam giác vuông L/H. Diện tích phôi thực lần lượt là L×W, π×D²/4 và L×H/2, đổi từ mm² sang m². Số lượng và mạch cắt tham gia tính số khổ mua.

Bảng đối chiếu hiển thị phôi thực, lượng mua nguyên khổ, phần ngoài biên dạng trong khổ bao, phần dư ngoài khổ bao và mạch cắt. Có sơ đồ xếp để kiểm tra.

- Hao hụt trên phôi = (lượng mua / phôi thực − 1) × 100%.
- Phần chưa sử dụng trên lượng mua = (lượng mua − phôi thực) / lượng mua × 100%.

Ví dụ 8 tấm tròn D500, dày 2 mm, khổ 2.000 × 1.000 mm, mạch cắt thử 0: một tấm chuẩn 2 m², phôi thực khoảng 1,570796 m²; chênh mua/phôi 27,323954%, phần chưa sử dụng trên lượng mua 21,460184%. Thay mạch cắt thực tế để kiểm lại.

Ví dụ 4 tam giác vuông 1.000 × 500 mm, cùng khổ và mạch cắt 0: phôi thực 1 m², một khổ 2 m²; chênh trên phôi 100%, phần chưa dùng trên lượng mua 50%.

Ví dụ thanh dài 6.000 mm, cắt 3 đoạn 2.000 mm với mạch cắt 3 mm: không đủ trên một thanh; mẫu dùng hai thanh để thấy tác động của mạch cắt.

**Giới hạn:** sơ đồ dùng khổ bao chữ nhật và thuật toán xếp hiện có, chưa tối ưu ghép sát biên dạng tròn/tam giác. Phần dư có thể tận dụng, không đồng nghĩa toàn bộ là phế liệu. Không cộng thêm tỷ lệ hao hụt khi đã tính tiền nguyên khổ mua. Gợi ý vượt 100% phải xem lại khổ/phương án mua; hệ thống chưa cho áp dụng mức đó vào ô dự toán phần trăm.

Trong báo giá, đối chiếu hao hụt và dự toán theo m² dùng diện tích phôi thực, thống nhất với công thức hình dạng.
