# Nhân sự, phòng ban và vị trí

Admin mở ba mục riêng ở menu trái: **Nhân sự**, **Cơ cấu tổ chức**, **Vai trò & phân quyền**.

## Bổ sung ngày 24/09/2026

- **Nhân sự**: khai ngày vào làm, ngày kết thúc và công đoạn/nội dung phụ trách. Ngày kết thúc không được trước ngày vào làm. Ngày là thông tin hồ sơ; muốn khóa ngay phải chọn Ngừng làm việc hoặc khóa tài khoản, không có tự động hẹn ngày khóa.
- Tìm theo mã/tên/liên hệ/nội dung phụ trách; lọc phòng ban gồm cấp dưới, vị trí và trạng thái. Xuất Excel danh sách đang lọc và thống kê toàn bộ phòng ban. Thống kê tính mỗi người một lần tại từng đơn vị trực tiếp; kiêm nhiệm có thể xuất hiện ở nhiều đơn vị nên không cộng các phòng thành tổng công ty.
- Hồ sơ chưa liên kết tài khoản có thể xóa. Hồ sơ có tài khoản cần chuyển Ngừng làm việc để giữ lịch sử.
- **Vai trò & phân quyền → Rà soát quyền**: xem nguồn quyền, vị trí, cấp quyền từng phần và quyền đặc biệt của từng tài khoản; xuất ma trận Excel. Đây là các quyền đang khai, tài khoản khóa không sử dụng được chúng. Trạng thái chứng từ và khóa công thức vẫn được kiểm tra khi thao tác.
- **Nhật ký hệ thống**: tìm nội dung/đối tượng/người, lọc thao tác và khoảng ngày UTC, tải tiếp lịch sử cũ, xuất các dòng đã tải. Chỉ Admin truy cập được.
- **Lịch sử quyền**: lưu giá trị trước/sau thay đổi bộ quyền, cập nhật quyền từ vị trí/bộ quyền và thao tác tài khoản từ bản triển khai này; không chứa mật khẩu. Nhật ký cũ không tự có đầy đủ giá trị trước/sau.
- Tài khoản chưa bố trí vị trí có lựa chọn **Tự cập nhật theo bộ quyền đã chọn**. Bật thì quyền lấy nguyên từ tổng các bộ quyền và tự cập nhật khi sửa bộ quyền; phiên đăng nhập bị ảnh hưởng được thu hồi. Tắt thì giữ quyền riêng đã khai. Tài khoản cũ không tự chuyển sang chế độ này; Admin chọn rõ để tránh thay đổi quyền cũ ngoài ý muốn.
- Nhân sự đã bố trí vị trí tiếp tục lấy quyền từ vị trí; không sửa đè bằng màn hình quyền tài khoản.

Phạm vi đợt này là hồ sơ và quản trị quyền cho các chức năng hiện có. Không phải xác nhận toàn bộ các phân hệ GĐ2 đã hoàn thành. Chưa triển khai hạn mức duyệt nhiều cấp, ủy quyền theo thời gian hoặc quyền riêng từng dự án.

1. Khai **Phòng ban**, chọn luồng công việc: Kinh doanh, Kỹ thuật, Cập nhật giá hoặc Khác. Có thể có nhiều phòng cùng một luồng.
2. Khai **Bộ quyền** với các mức xem/sử dụng/cài đặt và quyền đặc biệt cần thiết.
3. Khai **Vị trí & quyền**: chọn phòng ban và các bộ quyền áp dụng. Đánh dấu quản lý nếu vị trí được giao việc cho nhân viên trong phòng. Quản lý phòng không mặc nhiên có quyền Admin hoặc xem giá.
4. Khai **Nhân sự**: mã nhân sự, họ tên, điện thoại, email, trạng thái làm việc; chọn một hoặc nhiều vị trí. Có thể kiêm nhiệm nhiều phòng.
5. Với nhân sự mới, sau khi bố trí vị trí, bấm **Tạo tài khoản**. Quyền lấy từ các vị trí hoạt động. Hồ sơ nhân sự có thể tồn tại trước khi có tài khoản.

Các tài khoản đang có được đưa vào danh sách hồ sơ với mã gợi ý `TK-<tài khoản>`. Admin có thể sửa mã này. Không suy đoán phòng ban/chức vụ của từng người. Tài khoản chưa bố trí vị trí giữ nguyên quyền cũ; sau khi bố trí, quyền theo vị trí trở thành nguồn chính, không sửa đè qua màn hình phân quyền cũ.

Khi kiêm nhiệm, hệ thống hợp các quyền được cấp: mức cao nhất của từng mục được áp dụng. Không chọn một bộ quyền “chỉ xem” để phủ định quyền sửa đã cấp từ vị trí khác; cần thu hồi quyền sửa ở vị trí nguồn.

Sửa bộ quyền cập nhật ngay các nhân sự dùng bộ quyền đó thông qua vị trí. Chuyển phòng/vị trí hoặc ngừng vị trí/phòng sẽ tính lại quyền. Các phiên đăng nhập chịu ảnh hưởng bị kết thúc để tránh dùng quyền cũ. Không được tự hạ quyền Admin hoặc ngừng tài khoản đang thao tác.

Admin mở **Nhân sự & cơ cấu** ở menu bên trái. Trong mục Phòng ban, tự khai tên, loại đơn vị (ban, phòng ban, nhà máy, bộ phận, tổ), đơn vị cấp trên và luồng công việc. Danh sách hiển thị theo cây; vị trí và nhân sự hiển thị đường dẫn đầy đủ của đơn vị. Các đơn vị cũ mặc định ở cấp cao nhất; không tự suy đoán cơ cấu của công ty.

Quản lý giao việc cho mình, nhân viên cùng đơn vị và nhân sự tại các đơn vị trực thuộc, theo luồng công việc và quyền thực hiện. Quản lý cấp dưới không giao ngược cho cấp trên hoặc sang đơn vị ngang cấp. Quản lý ngang cấp trong cùng đơn vị không giao cho nhau; quản lý cấp trên có thể giao cho quản lý đơn vị con. Admin có đầy đủ phạm vi. Quyền chức năng vẫn lấy từ các vị trí được gán, không tự cấp quyền Admin vì đứng đầu sơ đồ. Việc chuyển nhân sự không sửa lịch sử giao việc hay tự chuyển người nhận các công việc đã giao.

Ngừng đơn vị cấp trên ngừng quyền phát sinh từ các vị trí ở toàn bộ nhánh bên dưới; quyền kiêm nhiệm tại nhánh khác vẫn áp dụng. Không cho tạo vòng lặp, chọn chính mình làm cấp trên, hoặc xóa đơn vị còn đơn vị con. Được dùng tên tổ giống nhau nếu thuộc các đơn vị cấp trên khác nhau.

Ngừng làm việc khóa tài khoản, giữ hồ sơ và lịch sử. Không mở khóa tài khoản của nhân sự đang ngừng làm việc qua màn hình tài khoản. Kích hoạt lại hồ sơ đã bố trí vị trí khôi phục quyền theo cơ cấu hiện tại. Khóa riêng một tài khoản đang làm việc vẫn được giữ khi sửa thông tin cơ cấu không liên quan.

Khai báo có kiểm tra phiên bản: người lưu từ bản cũ bị yêu cầu tải lại, không ghi đè người khác. Không xóa phòng còn vị trí, vị trí còn nhân sự, hoặc bộ quyền còn vị trí sử dụng. Lịch sử cơ cấu và các thay đổi quyền được lưu cùng bản sao lưu SQLite; hồ sơ có tài khoản dùng trạng thái ngừng thay cho xóa lịch sử.
