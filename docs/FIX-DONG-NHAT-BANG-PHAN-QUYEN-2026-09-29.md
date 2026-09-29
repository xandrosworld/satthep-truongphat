# Đồng nhất bảng phân quyền — 29/09/2026

## Phản ánh và nguyên nhân
Cùng nút Phân quyền nhưng tài khoản theo vị trí mở Sửa nhân sự, tài khoản trực tiếp mở bảng quyền. Nhánh organization-ui đã chuyển action của người managed sang governance-employee. Đây là khác biệt điểm vào giao diện; không có bằng chứng từ ảnh rằng dữ liệu quyền đã lưu bị sai.

## Thay đổi
- Mọi tài khoản được phép quản lý đều mở cùng bảng Phân quyền, gồm nguồn quyền, vị trí kiêm nhiệm và toàn bộ quyền hiện tại.
- Quyền hiện tại chỉ xem để đối chiếu; thao tác sửa ghi rõ Sửa quyền trực tiếp hoặc Sửa vị trí kiêm nhiệm.
- Admin có thể đổi nguồn ngay trong bảng, sau khi lưu quay lại bảng với dữ liệu mới từ máy chủ.
- Tái sử dụng trình sửa quyền và cơ chế áp dụng vị trí hiện có. Không tự chuyển nguồn hay cấp thêm quyền khi mở bảng.
- Phân quyền phía máy chủ và kiểm soát người quản trị được giữ nguyên.

## Kiểm tra
- Browser permission-overview: cùng điểm vào ở hai nguồn, quyền đối chiếu bị khóa sửa, đổi nguồn hai chiều, lưu quyền trực tiếp, mở sửa vị trí và tải lại.
- Browser permission-source: đổi nguồn từ danh sách hai chiều.
- 9/9 bài kiểm tra organization, permission-source, governance đạt.
- Build thành công.

## Triển khai
Runtime 248f6a8. Sao lưu trước triển khai; health và nội dung công khai đạt, SHA256 của 99 tập tin runtime trong container khớp bản phát hành.
Không sửa quyền tài khoản khách hàng để thử nghiệm.
