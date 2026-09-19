# Mã vật tư và diện tích thuê ngoài — 19/09/2026

- Form thêm / tạo mã tương tự tự điền mã theo quy tắc hiện có VT-00001, VT-00002… và bỏ qua mã đã tồn tại. Có thể nhập mã riêng hoặc bấm Sinh lại mã. Kiểm tra trùng không phân biệt hoa/thường; sửa mã đã có giữ mã khóa. Lưu danh mục máy chủ vẫn kiểm phiên bản để tránh ghi đè khi nhiều người cùng khai.
- Cột DT xử lý ngoài là diện tích đối tượng thuê ngoài, mặc định theo diện tích phôi đã khai, không tự nhân hai mặt. Tấm 1.000 × 640 mm × 20 × 8 = 102,4 m²; diện tích bề mặt hai mặt vẫn là 204,8 m² để đối chiếu công sơn.
- Công thức diện tích thực hiện đã khai được ưu tiên; các cấp cha cộng thành phần đúng một lần. Nhiều công đoạn thuê ở cùng một dòng không nhân thêm diện tích. Phạm vi cha đã thuê không cộng lại con.
- Thay đổi cột đối chiếu không sửa định mức sơn, đơn giá, lượng tính công đã khai hay dữ liệu báo giá lưu máy chủ.

Kiểm tra: tests/outside-measures.test.cjs, tests/batch-one.test.cjs và tools/verify-material-code-outside.cjs. Bao gồm tạo/lưu/tải lại mã, chống trùng, sao chép, diện tích 102,4 m² theo ảnh và ưu tiên công thức riêng 153,6 m².
