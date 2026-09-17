# Cấp quyền bổ sung và sắp xếp mục khai báo

Quản trị có thể tích quyền bổ sung cho vai trò Kỹ thuật, sau đó thu hồi từng phần. Không thay quyền nhân viên đang có khi triển khai: tài khoản kỹ thuật cũ vẫn dùng dữ liệu không giá cho đến khi quản trị chủ động cập nhật.

- Tài khoản và phân quyền → Phân quyền → Kỹ thuật — theo quyền được cấp.
- Mặc định chỉ có Khách hàng, Cấu thành và Nguyên công; không xem giá, không sửa hệ số, không duyệt.
- Để bổ sung phần giá hoặc danh mục có giá, tích **Xem chi phí / lợi nhuận nội bộ và bản nháp**, rồi chọn các phần được sửa. Quyền xem này cho xem dữ liệu nội bộ; danh sách các phần giới hạn quyền sửa, không giới hạn quyền xem theo cột.
- **Được sửa hệ số** và phần **Hệ số tác động** được cấp riêng. Bỏ chúng để chỉ quản trị can thiệp hệ số. Máy chủ kiểm tra cả hệ số trong báo giá và danh mục, gồm hệ số nguyên công/gói TMC.
- Bỏ tích phần được sửa để khóa lại phần đó. Bỏ quyền xem giá và giữ ba phần kỹ thuật để quay về chế độ không giá. Khi đổi quyền, phiên đăng nhập cũ bị kết thúc; nhân viên đăng nhập lại.
- Nếu chọn quyền giá/danh mục mà không cho xem giá, biểu mẫu báo rõ điều kiện cần cấp; không tự bật quyền xem giá.

**Bố trí:** bỏ nút và cột vật tư phụ ở bước 2; khai tỷ lệ ở bước 4, giữ nguyên cách tính và dữ liệu đã lưu. Bảng ký hiệu SP/CK/VT·CK/VT·SP chuyển sang tab Bảng ký hiệu trong Danh mục quy ước, hỗ trợ tìm kiếm. Ký hiệu kích thước vẫn ở Thông số cấu kiện.

Kiểm tra API: cấp quyền mới, giữ quyền cũ, sửa phần được giao, chặn sửa hệ số, chặn phần vừa bị thu hồi, vô hiệu phiên cũ, quay lại dữ liệu không giá. Kiểm tra trình duyệt: tạo và mở lại tài khoản được cấp quyền, lưu tỷ lệ ở bước 4 bằng tài khoản quản trị/kỹ thuật, bảng ký hiệu và tìm kiếm. Web thật kiểm tra biểu mẫu và chụp ảnh với dữ liệu QA trong trình duyệt; không thay quyền tài khoản khách hoặc ghi danh mục QA lên máy chủ.
