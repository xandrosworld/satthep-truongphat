# Danh mục quy ước và công thức phôi — 14/09/2026

> Bản này ghi đợt 21:59. Phản hồi 22:59 sau đó đã thay cách nhập trực tiếp trên bảng bằng màn Sửa công thức. Xem [bản hiện hành](DECLARATION-REVIEW-2026-09-14.md).

Phản hồi bổ sung làm rõ rằng công thức phải nằm ngay trong bảng **Thông tin hình dạng phôi**, cùng thông số khai tại mã vật tư và báo giá. Chỉ có kết quả tại bước Khối lượng & diện tích hoặc một bộ quy ước riêng chưa đáp ứng cách tổ chức này.

## Thay đổi

- Danh mục có các tab riêng. Mác và đặc tính được gom dưới từng vật liệu; thêm ngay trong nhóm sẽ chọn sẵn vật liệu gốc. Đặc tính và mác là hai nhánh song song.
- Bảng hình dạng có bảy cột dữ liệu: dạng cấu kiện; hình dạng phôi; khai báo tại mã vật tư; bổ sung báo giá; kích thước khai triển; khối lượng phôi sản phẩm; diện tích phôi sản phẩm. Cột cuối có lưu/thử, công thức tổng hợp và sửa khai báo.
- Dài, rộng, khối lượng và diện tích có ô nhập công thức ngay trên dòng. **Công thức tổng hợp** thay các tên trung gian bằng biểu thức đầy đủ và hiển thị kết quả với số thử.
- Dạng cấu kiện được đặt tên độc lập với hình dạng phôi. Trường cố định/nhập tại đơn vẫn do người lập khai.
- Công thức khối lượng/diện tích **một chi tiết** được lưu và dùng trong phép tính báo giá. Kích thước bao để xếp phôi và định mức vật tư mua vẫn tính riêng. Số lượng các cấp được nhân đúng một lần.
- Có thể chuyển quy tắc khai triển đang có thành quy ước đầy đủ ngay từ dòng tương ứng. Không sửa đè quy cách, giá hoặc công thức đã lưu trong báo giá cũ.
- Tạo mã theo quy ước chọn được vật liệu, mác và đặc tính trong cùng form; đổi vật liệu xóa lựa chọn con không còn phù hợp. Bảng khối lượng có nút mở kích thước/công thức của dòng đó.
- Sửa/xóa danh mục giữ trạng thái báo giá đã duyệt. Xuất Excel bao gồm quy ước, công thức phôi và khổ chuẩn; mã theo quy ước không gây lỗi xuất do thiếu kích thước tại báo giá.

## Cách kiểm tra

Mở **Danh mục quy ước → Hình dạng & công thức → Thông tin hình dạng phôi**. Nhập công thức trên một dòng, chọn **Lưu & thử**, sau đó mở **Công thức tổng hợp**. Dùng **Tạo mã vật tư**, đưa mã vào báo giá và xem tại **Khối lượng & diện tích**.

Các biến trung gian: `PHOI_D`, `PHOI_R` là dài/rộng khai triển tính bằng mm; `KL_DV`, `DT_DV` là định mức khối lượng/diện tích theo đơn vị của vật tư. Có thể viết trực tiếp bằng thông số đã khai và `RHO`. Công thức phôi trả kg hoặc m² cho một chi tiết. Định mức theo mét/mét vuông dùng riêng khi tính vật tư mua.

## Kiểm chứng

Chạy `node tools/verify-rules-catalog.cjs`: toàn bộ kiểm logic/máy chủ và các luồng danh mục, công thức trên dòng, quy ước, cấu thành, xuất tệp, công đoạn và khóa bản duyệt. Kết quả lưu tại [verification.json](../artifacts/customer-review/catalog-review-2026-09-14/verification.json).

Ca chữ nhật: 1.000 × 200 × 2 mm, RHO thử 7.850 kg/m³ → 3,14 kg/chi tiết; ba chi tiết → 9,42 kg; tăng dài gấp đôi → 18,84 kg. Ca công thức tam giác giả lập tính riêng diện tích/khối lượng một nửa hình chữ nhật, trong khi khổ mua giữ nguyên. Không lấy số thử này làm công thức sản xuất khách đã chốt.

Kiểm deployment bằng `node tools/check-rules-catalog-live.cjs`: so sánh toàn bộ HTML với bản đã kiểm, chỉ cho phép toolbar Netlify đã nhận diện nối cuối. Chạy lại hai bộ UI qua `RULES_CATALOG_URL` và `SHAPE_ROW_URL` với các thư mục bằng chứng riêng. [Đối chiếu deployment](../artifacts/customer-review/catalog-review-2026-09-14/live/deployment-check.json).

Đây là kiểm chứng triển khai; không phải khách đã nghiệm thu. Netlify vẫn lưu dữ liệu trình duyệt; các ca máy chủ và phân quyền được kiểm trên máy chủ thử cục bộ. Không quay thêm clip trong đợt này theo yêu cầu hiện tại.
