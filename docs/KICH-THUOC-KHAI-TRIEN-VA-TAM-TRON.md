# Kích thước khai triển và xếp tấm tròn

Hoàn thiện yêu cầu khách gửi tối 19/09/2026: khai được `D0 = D`, dùng kích thước khai triển để đối chiếu hao hụt trên tấm chuẩn.

## Cách khai

1. Vào **Danh mục quy ước → Thông số cấu kiện**. Có sẵn L0, W0, D0, H0 với đơn vị mm; có thể khai thêm ký hiệu.
2. Mở **Hình dạng & công thức → Công thức tổng hợp**. Phần thông số đầu vào vẫn chọn cố định theo mã hoặc nhập tại báo giá.
3. Tại **Kích thước khai triển — tính theo công thức**, chọn ký hiệu và nhập biểu thức. Ví dụ `D0 = D`; hoặc `L0 = L`, `W0 = W + 2 * H`. Không nhập lại các kết quả này khi lập báo giá.
4. Với tấm tròn, dùng **Điền thông số và công thức mẫu → Tròn**: D0 = D; dài/rộng khổ bao đều là D0; diện tích phôi `PI * D0 * D0 / 4000000`; khối lượng phôi bằng diện tích nhân kg/m². Cách sắp phôi chọn **Tấm tròn — so sánh hàng thẳng và so le**.
5. Nhập khổ tấm mua, số lượng và mạch cắt thực tế để xem số tấm, hao hụt và sơ đồ. Lưu phiên bản rồi tạo mã vật tư; khai khổ mua tại Thẻ kho của mã.
6. Trong báo giá, vào **Khai triển & hao hụt → Chọn cách / %**: xem sơ đồ, chọn **Dùng %** rồi **Áp dụng và tính lại**. Đây là thao tác chủ động; không tự ghi đè tỷ lệ đã khai.

## Mẫu đối chiếu

| Trường hợp | Khổ chuẩn (mm) | Số phôi | Mạch cắt | Kết quả |
|---|---|---:|---:|---|
| Tròn D0 = 100 mm | 300 × 275 | 8 | 0 mm | 1 tấm so le; khổ bao riêng cần 2 tấm |
| Tròn D0 = 100 mm | 306 × 282 | 8 | 3 mm | 1 tấm so le, các phôi cách nhau ít nhất 3 mm |
| Tam giác vuông | Có mẫu khai sẵn | Theo số thử | Theo xưởng | Giữ cách ghép cặp đã có |
| Thanh tròn / hộp / ống / góc / theo bảng kê | Theo chiều dài thanh | Theo số thử | Theo xưởng | Giữ mẫu công thức và bảng kê đã có |

Mẫu đầu: diện tích phôi 0,0628318531 m²; lượng mua 0,0825 m². Hao hụt trên phôi khoảng 31,3028%; phần chưa dùng trên lượng mua khoảng 23,8402%. Không cộng thêm tỷ lệ này nếu đã tính chi phí theo nguyên tấm mua.

## Giới hạn và bảo toàn dữ liệu

- So sánh hàng thẳng/so le ở hai hướng tấm. Với nhiều đường kính, so sánh phương án từng nhóm đường kính với phương án khổ bao ghép chung. Đây là phương án tham khảo, không cam kết tối ưu toàn cục.
- Chỉ dải dư chữ nhật bên ngoài được chọn tận dụng. Phần dư cong được thể hiện trong chênh lệch mua–phôi, không tự coi là phế liệu hay ghi nhận tồn kho.
- Tam giác hiện hỗ trợ ghép tam giác vuông; chưa triển khai xếp đa giác bất kỳ, đọc STEP/DWG hoặc tự khai triển chi tiết CAD có chấn/uốn.
- Sửa danh mục không tự thay phiên bản trong vật tư/báo giá cũ. Bản tròn cũ xếp theo khổ bao vẫn giữ cách tính đó cho đến khi chủ động cập nhật quy ước.
- Công thức đầu ra chịu cùng quyền dùng/xem/sửa và khóa công thức. Kiểm đơn vị, biến thiếu và tham chiếu vòng trước khi lưu.

## Kiểm chứng

- `tests/unfold-circle.test.cjs`: diện tích, khối lượng, số tấm, khoảng cách, mạch cắt, phần dư, nhiều đường kính, phiên bản cũ, công thức phụ thuộc.
- `tests/unfold-circle-server.test.cjs`: lưu/đọc danh mục và báo giá qua API; người chỉ được dùng không thấy hoặc sửa công thức D0.
- `tests/unfold-circle-browser.cjs`: thao tác form, lưu/mở lại, tạo mã, báo giá, áp dụng hao hụt và màn hình nhỏ. Chế độ `--live` kiểm bản triển khai bằng dữ liệu QA trong trình duyệt, chặn ghi nghiệp vụ lên máy chủ.
- Hồ sơ kết quả và ảnh: `artifacts/customer-review/unfold-circle/`.
