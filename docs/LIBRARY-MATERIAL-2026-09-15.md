# Thư viện mẫu và khai báo vật tư theo danh mục

Theo hai ảnh khách gửi ngày 15/09/2026.

- Thư viện đổi từ thẻ lớn sang bảng thu gọn theo danh mục nhóm sản phẩm. Có tìm tên/vật tư, lọc loại mẫu, lọc nhóm, thu/mở nhóm và số mẫu. Mẫu chưa khai nhóm nằm riêng; không suy đoán phân loại từ tên. Cấu kiện mẫu cũng có nút phân nhóm. Giữ thao tác xem cấu thành và sử dụng mẫu độc lập.
- Bổ sung Nhóm vật tư trong Danh mục quy ước. Form vật tư dùng ô chọn từ cùng danh mục với bộ lọc vật tư. Nhóm khai được kiểu phôi gia công hoặc theo đơn vị; bảo vệ nhóm đang dùng khi xóa, đổi tên hoặc đổi kiểu khai báo.
- Chỉ nhóm phôi hiện hình dạng, quy ước, vật liệu, mác, đặc tính, khổ mua và kích thước. Chọn quy ước thì chỉ hiện trường cố định tại mã; trường nhập trong báo giá giữ ở báo giá. Tên gợi ý dùng tên quy ước và đúng đơn vị thông số.
- Linh kiện/thiết bị và nhóm theo đơn vị không hiện thông tin phôi. Tên gợi ý lấy thương hiệu và thông số kỹ thuật; tên do người dùng nhập vẫn giữ nguyên đến khi bấm Dùng tên này.
- Không hiện ô nhập khối lượng riêng trong form vật tư; lấy giá trị từ vật liệu đã khai trong Danh mục quy ước. Giữ dữ liệu chụp trong báo giá cũ.
- Khi chuyển mã từ quy ước phôi sang linh kiện, bỏ công thức và định mức hình học cũ khỏi mã để không áp dụng nhầm.

Kiểm chứng: 314 kiểm thử logic; bộ API cục bộ; 17 nhóm kiểm tra trình duyệt về luồng mới, thư viện/phân nhóm, thương hiệu, sao chép mã, khổ mua và tính lượng. Chứng cứ build/live: `artifacts/customer-review/library-material-2026-09-15/`. Kiểm thử API cục bộ không có nghĩa bản Netlify đã chuyển sang lưu dữ liệu máy chủ. Chưa đánh dấu khách nghiệm thu.
