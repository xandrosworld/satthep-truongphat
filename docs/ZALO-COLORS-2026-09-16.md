# Màu giao diện theo phản hồi khách — 16/09/2026

Khách yêu cầu nền, chữ và khung dễ đọc như Zalo, màu trầm và cấp sản phẩm đậm hơn cấu kiện, vật tư. Bản này dùng nền xám nhạt, khung trắng, chữ xanh đen; ô nhập trắng có viền rõ và trạng thái chọn màu xanh.

## Căn cứ

- [Bảng màu ZaUI chính thức, v1.11](https://docs.zaloplatforms.com/docs/MA/zaui/foundation/Colors): blue-55 `#0068FF`, blue-70 `#0045AD`, gray-15 `#EBEDEF`, steelblue-90 `#17283B`, steelblue-70 `#32547B`.
- [Giới thiệu ZaUI](https://docs.zaloplatforms.com/docs/MA/zaui): ZaUI được rút gọn từ hệ thiết kế ZDS của Zalo.
- Ảnh chat khách gửi: nền xám sáng, bong bóng trắng, chữ tối, điểm nhấn xanh. Đây là thiết kế ứng dụng dựa trên bảng màu công bố và ảnh tham chiếu, không phải tuyên bố sao chép chính xác bảng màu chat Zalo trên mọi điện thoại.

## Áp dụng

| Thành phần | Màu |
| --- | --- |
| Nền trang / khung | `#EBEDEF` / `#FFFFFF` |
| Chữ chính / phụ | `#17283B` / `#32547B` |
| Nút chính / chữ liên kết | `#0068FF` / `#0045AD` |
| Sản phẩm | `#D9E2ED` |
| Cấu kiện | `#F1F4F8` |
| Vật tư trong cấu kiện / trực tiếp | `#F7F7F8` / `#FFFFFF` |
| Viền ô nhập / chữ gợi ý | `#6F7071` / `#575757` |

Giữ nhãn cấp, thụt dòng và đường nối để phân biệt cấu thành; màu không phải dấu hiệu duy nhất. Ô chỉ đọc dùng viền nét đứt. Lỗi và cảnh báo giữ màu riêng. CSS giao diện được nạp cuối trong cả bản nguồn và bản build.

## Đối chiếu

- Rà 12 màn hình/trạng thái: cấu thành, dòng chọn, công đoạn, hao hụt, khối lượng, giá, vật tư, thư viện, đơn giá, quy ước, hộp thoại kích thước và màn hình hẹp.
- 2.863 mẫu chữ: tỷ lệ tương phản thấp nhất 4,59:1; không còn mẫu dưới 4,5:1 trong các trạng thái đã đo. Không tính nội dung ẩn, ô vô hiệu hóa và dấu trang trí. Đây là kết quả đo phạm vi trên, không phải chứng nhận toàn bộ WCAG.
- `tests/quote-benchmark-browser.cjs`: 6 nhóm đạt, gồm phân cấp màu, giá đối thủ/giá kg và lưu qua F5.
- `tests/dimension-scope-browser.cjs`: 4 nhóm đạt; viền ô nhập trên 3:1, chữ trên 4,5:1; nguồn PRODUCT/PARENT và F5 đúng.
- Mở trang/chọn dòng không đổi dữ liệu giá; ở chiều rộng 390px khung trang không tràn, thông số giữ qua F5. Bảng rộng vẫn vuốt ngang theo giao diện sẵn có. Phần lập/sửa toàn bộ trên điện thoại vẫn để xét sau theo khách.
- Ảnh và kết quả nằm ở `artifacts/customer-review/zalo-colors-2026-09-16/`; đã xem ảnh desktop, mobile và hộp thoại. Chưa đánh dấu khách nghiệm thu.
