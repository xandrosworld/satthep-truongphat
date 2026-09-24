# Nhân sự, phòng ban và vị trí

Admin mở **Nhân sự & phòng ban** trên thanh trên cùng hoặc từ quản lý tài khoản.

1. Khai **Phòng ban**, chọn luồng công việc: Kinh doanh, Kỹ thuật, Cập nhật giá hoặc Khác. Có thể có nhiều phòng cùng một luồng.
2. Khai **Bộ quyền** với các mức xem/sử dụng/cài đặt và quyền đặc biệt cần thiết.
3. Khai **Vị trí & quyền**: chọn phòng ban và các bộ quyền áp dụng. Đánh dấu quản lý nếu vị trí được giao việc cho nhân viên trong phòng. Quản lý phòng không mặc nhiên có quyền Admin hoặc xem giá.
4. Khai **Nhân sự**: mã nhân sự, họ tên, điện thoại, email, trạng thái làm việc; chọn một hoặc nhiều vị trí. Có thể kiêm nhiệm nhiều phòng.
5. Với nhân sự mới, sau khi bố trí vị trí, bấm **Tạo tài khoản**. Quyền lấy từ các vị trí hoạt động. Hồ sơ nhân sự có thể tồn tại trước khi có tài khoản.

Các tài khoản đang có được đưa vào danh sách hồ sơ với mã gợi ý `TK-<tài khoản>`. Admin có thể sửa mã này. Không suy đoán phòng ban/chức vụ của từng người. Tài khoản chưa bố trí vị trí giữ nguyên quyền cũ; sau khi bố trí, quyền theo vị trí trở thành nguồn chính, không sửa đè qua màn hình phân quyền cũ.

Khi kiêm nhiệm, hệ thống hợp các quyền được cấp: mức cao nhất của từng mục được áp dụng. Không chọn một bộ quyền “chỉ xem” để phủ định quyền sửa đã cấp từ vị trí khác; cần thu hồi quyền sửa ở vị trí nguồn.

Sửa bộ quyền cập nhật ngay các nhân sự dùng bộ quyền đó thông qua vị trí. Chuyển phòng/vị trí hoặc ngừng vị trí/phòng sẽ tính lại quyền. Các phiên đăng nhập chịu ảnh hưởng bị kết thúc để tránh dùng quyền cũ. Không được tự hạ quyền Admin hoặc ngừng tài khoản đang thao tác.

Quản lý giao việc cho mình hoặc nhân viên thuộc đúng phòng đang phụ trách, theo luồng công việc và quyền thực hiện. Hai phòng cùng luồng kỹ thuật vẫn độc lập. Quản lý phòng A không giao cho nhân viên phòng B; Admin có đầy đủ phạm vi. Việc chuyển nhân sự không sửa lịch sử giao việc hay tự chuyển người nhận các công việc đã giao.

Ngừng làm việc khóa tài khoản, giữ hồ sơ và lịch sử. Không mở khóa tài khoản của nhân sự đang ngừng làm việc qua màn hình tài khoản. Kích hoạt lại hồ sơ đã bố trí vị trí khôi phục quyền theo cơ cấu hiện tại. Khóa riêng một tài khoản đang làm việc vẫn được giữ khi sửa thông tin cơ cấu không liên quan.

Khai báo có kiểm tra phiên bản: người lưu từ bản cũ bị yêu cầu tải lại, không ghi đè người khác. Không xóa phòng còn vị trí, vị trí còn nhân sự, hoặc bộ quyền còn vị trí sử dụng. Lịch sử cơ cấu và các thay đổi quyền được lưu cùng bản sao lưu SQLite; hồ sơ có tài khoản dùng trạng thái ngừng thay cho xóa lịch sử.
