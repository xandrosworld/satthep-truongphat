# Liên kết ký hiệu trong quy ước hình dạng

Phạm vi DM-02: ảnh ghi chú tiếp theo sáng 15/09 chỉ các ô ký hiệu và công thức dài khai triển, yêu cầu liên kết ký hiệu kích thước. Lượt này nối form hình dạng với danh mục Thông số cấu kiện và các công thức trong bản đang sửa.

- Ký hiệu là danh sách chọn từ thông số đã khai; chọn một ký hiệu sẽ lấy tên và đơn vị tương ứng. Ký hiệu đã dùng ở dòng khác không xuất hiện trong lựa chọn mới.
- `+ Thông số` thêm dòng để chọn, không tự đặt tên biến `X3`. Có thể khai thông số mới vào danh mục ngay trong form, giữ bản nháp và số thử đang nhập.
- Khi đổi ký hiệu, thay đúng biến trong sáu công thức: dài, rộng, khối lượng/diện tích trên đơn vị và khối lượng/diện tích phôi. Không thay một phần tên biến khác hoặc sửa các báo giá cũ.
- Chọn ô công thức rồi bấm nút ký hiệu để chèn tại con trỏ. Các biến phôi chỉ hiện khi đang nhập công thức phôi.
- Tên và đơn vị của quy ước đã lưu giữ theo phiên bản; mở lại không tự ghi đè bằng danh mục mới. Các ký hiệu cũ vẫn có trong danh sách của quy ước đó.
- Thông số dùng trong quy ước, mã vật tư, mẫu hoặc báo giá lưu trước được tính vào nơi dùng, không cho xóa/đổi mã đang được tham chiếu.
- Hỗ trợ chữ hoa và chữ thường như danh mục thông số, phân biệt đúng tên biến. Đơn vị công thức hiện hỗ trợ mm, số không đơn vị, kg/m và m²/m; không quy đổi ngầm từ đơn vị khác.

Kiểm chứng cục bộ: 274 ca logic, 6 ca máy chủ thử về quy ước/danh mục, 5 nhóm mới trong `tests/shape-parameter-browser.cjs` và 7 nhóm hồi quy trong `tests/rules-catalog-browser.cjs` đều đạt. Ca mới: chọn `Len`, thêm `L1`, công thức `Len + L1` với 2000 + 200 mm cho 22 kg; ba chi tiết cho 66 kg và 3,3 m². Kiểm cả chèn/đổi biến, bỏ biến đang dùng, lưu/mở lại, hủy sửa, bảo toàn báo giá và màn hình hẹp.

Bằng chứng và bản triển khai được ghi tại `artifacts/customer-review/shape-parameters-2026-09-15/`, gồm `verification.json`, `live/deployment-check.json` và kết quả trình duyệt trên web thật. Các ca chạy với dữ liệu thử trong trình duyệt riêng; máy chủ chỉ kiểm cục bộ.

Phần đơn giá là lượt riêng theo ghi chú của khách.
