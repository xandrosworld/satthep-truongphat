# Bộ quyền theo ma trận

1. Mở **Vai trò & phân quyền → Thêm bộ quyền**, đặt tên tùy ý (ví dụ Kế toán trưởng).
2. Chọn từng thao tác trong **Phân quyền theo phân hệ** và **Phân quyền theo danh mục**. Bộ quyền mới không cấp sẵn thao tác. Có thể điền gợi ý Kỹ thuật, Kinh doanh, Kế toán hoặc Nhân sự rồi điều chỉnh.
3. Bật riêng quyền xem chi phí, duyệt giá, sửa hệ số hoặc công thức khi cần. Những chức năng liên quan đến giá yêu cầu quyền xem chi phí; phần mềm báo rõ nếu khai không tương thích.
4. Lưu, mở **Cơ cấu tổ chức → Vị trí làm việc** và chọn bộ quyền cho vị trí.
5. Bố trí nhân sự vào một hoặc nhiều vị trí. Quyền thực tế là mức cao nhất được cấp bởi các vị trí đang hoạt động. Không được xem là không cấp quyền, không phải phủ định quyền từ vị trí khác.

Sửa bộ quyền hoặc bỏ vị trí sẽ cập nhật quyền tài khoản liên quan và kết thúc phiên cần đăng nhập lại. Bộ quyền cũ giữ nguyên mô hình nền để không tự đổi quyền đang vận hành. Bộ quyền mới không tự cấp quyền quản trị dù chọn toàn bộ ô trên ma trận.

## Bốn nhóm quyền

- **Theo phân hệ:** báo giá, khách hàng, đơn hàng, hợp đồng, thu tiền, chi phí thực tế, hồ sơ năng lực, lệnh sản xuất, nhân sự và chat. Chỉ hiển thị thao tác mà phân hệ hiện có thực hiện: không tạo thêm nghiệp vụ của phần mềm tham khảo.
- **Theo danh mục:** xem / thêm / sửa / xóa vật tư, công đoạn kỹ thuật, đơn giá công đoạn, vận chuyển, quy ước và thư viện mẫu. Khi gửi cả danh mục, máy chủ đối chiếu từng dòng với bản đang lưu. Thêm dòng không cho phép sửa/xóa dòng cũ. Thêm/xóa nguyên công cần quyền tương ứng ở cả phần kỹ thuật và đơn giá; sửa tên/máy/hướng dẫn có thể cấp riêng phần kỹ thuật.
- **Tùy chỉnh:** xem chi phí, duyệt giá, sửa hệ số, duyệt dưới giá vốn, sử dụng/xem/sửa công thức và mở sửa báo giá. Quyền duyệt và mở sửa báo giá còn phải được cấp ở bảng thao tác phân hệ.
- **Quản trị dữ liệu:** phạm vi dữ liệu báo giá/danh mục và các mức cấu hình, sử dụng, chỉ xem, không xem. Quyền thao tác không vượt phạm vi này hoặc vượt khóa công thức. Quản lý bộ quyền, cấp tài khoản, khóa/mở công thức, sao lưu toàn bộ và nhật ký quản trị vẫn thuộc Admin.

Nhân sự đã có thể cấp quyền xem, khai báo, sửa hồ sơ, duyệt hồ sơ, yêu cầu tài khoản và xuất hồ sơ qua bộ quyền. Người được duyệt hồ sơ không được dùng luồng này để tự cấp vị trí/quyền, thay trạng thái tài khoản hoặc kích hoạt tài khoản: các thay đổi đó cần Admin duyệt. Cách phân công người khai báo trước đây còn hiệu lực với tài khoản cũ chưa bật ma trận thao tác.

Thu tiền/chi phí làm việc trong hồ sơ hợp đồng nên cần cấp thêm **Hợp đồng → Xem**. Chi phí thực tế cần quyền xem chi phí nội bộ. Tạo đơn hàng từ báo giá cần quyền xem báo giá nguồn. Tạo/sửa đầu vào báo giá cần phạm vi Đầu vào; lập báo giá nội bộ cần phạm vi Tạo và trình báo giá. Không cấp mặc định quyền xem giá cho người quản lý nhân sự hoặc xưởng.

Các quyền xuất/in kiểm soát chức năng xuất/in do phần mềm cung cấp, không ngăn chụp màn hình hoặc sao chép dữ liệu đã được cấp quyền xem.

## Tương thích và kiểm chứng

Tài khoản/bộ quyền cũ chưa bật **Phân quyền từng thao tác** tiếp tục dùng quyền cũ. Không tự chuyển toàn bộ người dùng đang vận hành. Khi phối hợp bộ quyền mới và cũ, quyền cũ được quy đổi theo khả năng tương ứng, không tự nâng thành Admin. Sửa quyền theo bộ quyền/vị trí sẽ thu hồi phiên cũ; lịch sử và bản sao lưu chứa ma trận thao tác. Mục Rà soát quyền và Excel quyền hiển thị các thao tác đã cấp.

Hạn mức duyệt nhiều cấp, ủy quyền có thời hạn và quyền riêng theo dự án không thuộc thay đổi này. Các nghiệp vụ kho, kế toán tổng hợp, chấm công/lương chưa triển khai không được coi là hoàn thành vì đã có nền tảng phân quyền.

Kiểm tra: `tests/action-access.test.cjs`, `tests/action-access-browser.cjs`, các bài kiểm tra ma trận cũ, nhiều vai trò, cơ cấu/vị trí, nhân sự, khách hàng và kinh doanh. Kiểm tra API trực tiếp gồm: chỉ xem không sửa/duyệt, thêm không sửa/xóa, nhập Excel không vượt quyền sửa, hồ sơ không nâng quyền tài khoản, cộng quyền nhiều vị trí và thu hồi phiên.
