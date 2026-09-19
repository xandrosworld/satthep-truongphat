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

Ví dụ **8 tam giác vuông 1.000 × 500 mm**, khổ 2.000 × 1.000 mm, mạch cắt thử 0:

| Cách sắp | Tấm mua | Phôi thực | Lượng mua | Hao hụt trên phôi |
| --- | ---: | ---: | ---: | ---: |
| Xếp riêng từng chữ nhật bao | 2 | 2 m² | 4 m² | 100% |
| Quay 180°, ghép thành 4 cặp | 1 | 2 m² | 2 m² | 0% |

Đây là ví dụ lý tưởng để thấy khác biệt, không dùng 0 làm mạch cắt mặc định của xưởng. Nhập mạch cắt thực để tính lại. Ví dụ 7 tam giác cùng kích thước, mạch cắt 0: 3 cặp và 1 chiếc lẻ; phôi 1,75 m², một tấm mua 2 m², hao hụt trên phôi khoảng 14,2857%.

Trong **Cách sắp phôi trên tấm chuẩn**, chọn **Tam giác vuông — cho phép quay, ghép cặp**. Chỉ chọn khi biên dạng đúng là tam giác vuông theo dài/rộng khai triển và công nghệ cho phép quay. Hai tam giác cùng kích thước được ghép bằng quay 180°, không lật mặt; cả khổ ghép có thể xoay 90°. Khe giữa hai cạnh chéo bằng mạch cắt đã khai; phần đệm của khổ ghép cũng tính vào phần chênh. Chiếc lẻ hoặc cặp không vừa tấm được xếp riêng. Có so sánh số tấm với xếp riêng khổ bao và chọn phương án trong hai cách không tăng số tấm.

Tam giác bất kỳ cần thêm thông tin biên dạng. Nếu không được quay do hướng vân/hướng gia công, chọn **Xếp từng khổ bao — giữ nguyên hướng**; khai dài/rộng phôi theo đúng hướng dài/rộng tấm. Phần dư tam giác lẻ chưa được đưa vào danh sách dư chữ nhật có thể chọn tận dụng. Quy ước cũ chưa khai cách ghép giữ nguyên; thay danh mục không tự đổi báo giá đã lập.

Ví dụ thanh dài 6.000 mm, cắt 3 đoạn 2.000 mm với mạch cắt 3 mm: không đủ trên một thanh; mẫu dùng hai thanh để thấy tác động của mạch cắt.

**Giới hạn:** tam giác vuông có cách ghép cặp nêu trên; hình tròn và biên dạng khác vẫn dùng khổ bao chữ nhật. Chưa tối ưu nesting đa giác tự do hoặc bảo đảm tối ưu toàn cục. Phần dư có thể tận dụng, không đồng nghĩa toàn bộ là phế liệu. Không cộng thêm tỷ lệ hao hụt khi đã tính tiền nguyên khổ mua. Gợi ý vượt 100% phải xem lại khổ/phương án mua; hệ thống chưa cho áp dụng mức đó vào ô dự toán phần trăm.

Trong báo giá, đối chiếu hao hụt và dự toán theo m² dùng diện tích phôi thực, thống nhất với công thức hình dạng.
