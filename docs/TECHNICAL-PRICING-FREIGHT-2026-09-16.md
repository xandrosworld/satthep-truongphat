# Vận chuyển phôi TMC và không gian kỹ thuật

Theo phản hồi khách: TMC đã gồm vận chuyển phôi nhưng khó tìm khoản phí; các bước kỹ thuật 1–5 không được khai hoặc hiển thị giá.

- Đổi nhãn thành **Vận chuyển nhập phôi / vật tư**, đồng bộ bảng khoản chi, phân tích và Excel nội bộ.
- Đầu phần Phân tích giá hiển thị số tiền vận chuyển nhập của toàn phương án TMC, trạng thái đã tính/chưa khai/cần kiểm tra và nút mở đúng bảng khai vận chuyển. Khoản 0 có bản ghi chi phí được phân biệt với chưa khai; khoản nhập tay cũ bằng 0 không có bản ghi xác nhận được coi chưa khai. Không đổi công thức hoặc cộng phí lần nữa.
- Bước 1–5 bỏ tổng tiền, đơn giá và tiền công, cả bảng nhu cầu hoàn thiện, chọn vật tư và hộp sửa công việc. Bước 3 giữ nơi thực hiện, lượng và định mức vật tư; sửa lượng không đổi phương pháp/giá đã chọn. Giá gói thuê và khoản riêng theo cấu thành được đưa về Giá & hệ số → Nguyên công / bề mặt.
- Bổ sung vai trò **Kỹ thuật — không xem giá**. Quản trị chọn vai trò này tại Tài khoản và phân quyền, cấp phần Khách hàng / Cấu thành / Nguyên công cần phụ trách. Các quyền xem giá, duyệt và hệ số bị tắt cho vai trò này, kể cả yêu cầu API giả mạo. Vai trò Lập giá vẫn có giao diện từ bước 6.
- API chỉ trả cấu thành kỹ thuật được chọn lọc; các giá 0 trong dữ liệu dùng để tính hình học tại trình duyệt là giá trị thay thế, không phải đơn giá kinh doanh. Danh sách và phản hồi lưu không có tổng tiền. Chặn truy cập danh mục giá, bản chào, phiên bản giá cũ, đơn hàng, lịch sử thương mại và sao lưu.
- Khi kỹ thuật lưu, máy chủ ghép các trường kỹ thuật được phép vào bản đầy đủ, giữ giá/hệ số và kiểm quyền phần, phiên bản, trạng thái khóa. Giá của mã vật tư mới lấy từ dữ liệu máy chủ. Không tự đổi vai trò của tài khoản cũ; tài khoản trước đây tên “Kỹ thuật — lập và trình báo giá” nay được gọi đúng là “Lập giá”.

Kiểm tra: `node --test tests/technical-access.test.cjs`, `node tests/technical-pricing-browser.cjs`. Bộ logic/API toàn dự án và các luồng hồi quy lựa chọn giá nguyên công, vận chuyển, phân quyền được chạy trước phát hành. Bằng chứng cục bộ/live ở `artifacts/customer-review/technical-pricing-2026-09-16/` (không commit dữ liệu và ảnh nội bộ).

Kiểm Railway dùng HTTPS thật, đăng nhập, tài khoản kỹ thuật tạm và dữ liệu thử trong phiên trình duyệt. Tài khoản thử được khóa sau kiểm tra; không lưu thay đổi vào báo giá khách.

Lượt kiểm HTTPS phát hiện phản hồi kiểm tra phiên cũ có thể về sau khi đăng nhập mới. Đã gắn việc nhận/xóa phiên với đúng phiên yêu cầu, tránh phản hồi cũ ghi đè phiên mới; kiểm thử trình duyệt chủ động trì hoãn phản hồi 401 để tái hiện và xác minh.
