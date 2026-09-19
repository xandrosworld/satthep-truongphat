# Kích thước khai triển và quyền công đoạn

## Khai kích thước theo hình

Vào **Danh mục quy ước → Hình dạng & công thức → Công thức tổng hợp**. Tại **Kích thước theo hình khai triển**, chọn mẫu rồi bấm **Điền thông số và công thức mẫu**:

- Chữ nhật: dài L, rộng W; diện tích L × W.
- Tròn: đường kính D; diện tích π × D² / 4.
- Tam giác vuông: cạnh đáy L, chiều cao vuông góc H; diện tích L × H / 2.

Thông số nhập bằng mm, kết quả diện tích quy về m². Chiều dày T mặc định cố định theo mã; các kích thước còn lại nhập ở báo giá. Khối lượng = diện tích × chiều dày quy về mét × khối lượng riêng. Số thử chỉ là ví dụ để kiểm công thức, cần điều chỉnh theo vật tư thực tế.

Nút điền mẫu thay các thông số và công thức trong bản đang sửa. Kiểm kết quả rồi **Lưu phiên bản**, sau đó **Lưu danh mục máy chủ** để dùng chung. Bản báo giá đã lưu giữ phiên bản công thức đã chọn. “Nơi nhập” là nguồn dữ liệu: cố định theo mã hoặc nhập tại báo giá.

Xếp phôi hiện dùng hình chữ nhật bao ngoài: D × D cho tròn, L × H cho tam giác vuông. Chưa tối ưu ghép hình tròn/tam giác. Hình khác, kể cả tam giác không vuông, cần tự khai kích thước bao và công thức phù hợp. Diện tích phôi không tự thay diện tích sơn/gia công thực tế.

## Giao công đoạn cho kỹ thuật

Quản trị vào **Tài khoản và phân quyền**, chọn nhân viên kỹ thuật, tích **Danh mục công đoạn kỹ thuật (không gồm giá)** rồi cập nhật quyền. Không cần bật xem chi phí. Nhân viên đăng nhập lại sau khi quyền đổi.

Nhân viên vào **Danh mục quy ước → Công đoạn** để thêm/sửa tên công đoạn, máy sử dụng và ghi chú; bấm **Lưu danh mục máy chủ** khi hoàn tất. Quyền này không cho sửa giá, hệ số, đơn vị tính giá hoặc xóa công đoạn. Các danh mục khác được cấp riêng.

Chưa tự cấp quyền cho bất kỳ tài khoản khách hàng nào. Quyền Danh mục quy ước đã cấp trước đây vẫn giữ khả năng sửa thông tin kỹ thuật công đoạn.

## Kiểm chứng

- Đối chiếu công thức ba hình, diện tích/khối lượng trong báo giá, khổ mua và giữ phiên bản cũ.
- API: tài khoản chỉ có quyền công đoạn lưu được thông tin kỹ thuật; giá/hệ số giữ nguyên; thay danh mục khác, chèn giá hoặc xóa công đoạn bị từ chối; thu hồi quyền có hiệu lực.
- Trình duyệt trên máy chủ thử: lưu/tải lại mẫu tròn, thử tam giác, đăng nhập kỹ thuật, sửa máy, lưu/tải lại và kiểm giá gốc bằng tài khoản quản trị.
- Script: `node tools/verify-sheet-operation-ui.cjs` sau khi build. Script dùng cơ sở dữ liệu tạm độc lập.
