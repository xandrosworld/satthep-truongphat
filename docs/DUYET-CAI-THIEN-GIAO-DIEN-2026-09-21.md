# Các mục cải thiện giao diện đã thống nhất — 21/09/2026

Căn cứ: báo cáo Bao-cao-de-xuat-giao-dien-Truong-Phat.pdf và phản hồi khách ngày 21/09/2026 lúc 14:22–14:34.

- Khách đồng ý cập nhật các mục 1, 2, 3, 5, 6, 7, 8, 9.
- **Mục 4: tách ghi chú nội bộ / sản xuất và ghi chú gửi khách — để thảo luận ở giai đoạn 2. Không thực hiện trong đợt này.**
- Giữ cách lưu và xuất ghi chú hiện tại. Mục 5 chỉ thu gọn cách hiển thị ô ghi chú; không tách hay đổi dữ liệu.
- Cỡ chữ màn hình đã tăng 2 px trong bản cập nhật trước; tiếp tục dùng.

Các việc của đợt này: thu gọn đầu trang; phân biệt nút lưu danh mục và báo giá; đơn giản màn hình khai hình; nới cột nhập; rút gọn hướng dẫn; chỉ chỗ cần hoàn tất; dùng câu chữ đúng trạng thái; gom nút xuất báo giá.

Đã kiểm tra: nhập và lưu lại tam giác ba cạnh; mở công thức nâng cao; lưu báo giá và danh mục dùng chung; giữ ghi chú khi tải lại; bàn giao kỹ thuật → giá → duyệt; tài khoản kỹ thuật đọc đầu vào nhưng không xem giá; chuông thông báo; bố cục màn hình 1440, 1024 và 390 px.

Bổ sung theo ảnh phản hồi: đưa cách xếp cố định có sẵn ra ngay trên sơ đồ phôi; xem trước rồi áp dụng, chọn phần dư tận dụng để cập nhật hao hụt. Nút Tiếp nằm cuối bên phải các bước và theo quyền tài khoản. Không mở rộng ghép chung / tùy chỉnh cấu kiện trong đợt này.

### Bổ sung góc đối chiếu trong bảng công thức đa giác
- Với cách khai cạnh và góc giữa hai cạnh, bổ sung ô góc đối chiếu A(n−2): ngũ giác có A1, A2 và A3. Ô cuối có thể bỏ trống; nếu nhập phải khớp hình dựng từ các cạnh và n−3 góc trước.
- Góc đối chiếu lưu cùng mẫu hình, không tự sửa báo giá cũ. Có thể sửa riêng tại Khai đa giác trong báo giá. Tam giác vẫn chỉ cần ba cạnh.
- Tên ký hiệu ưu tiên tên thông số đang khai, tránh hiện “Chưa khai tên” khi đã có tên cạnh.
- Kiểm tra: trình duyệt 4–10 cạnh, lưu/mở lại, góc sai, xóa góc, màn hình hẹp; hồi quy tam giác và 7 bài kiểm tra hình/phôi/hao hụt.

### Sắp lại màn công thức hình dạng theo trình tự khai báo
- Bốn phần: Thông tin hình dạng → Chọn hình và cách khai kích thước → Nhập thông số → Xem hình và kết quả.
- Chọn vuông/chữ nhật, tròn, tam giác vuông, tam giác ba cạnh, đa giác, hình thang hoặc hình thoi; chỉ đa giác hiện cách khai góc và số cạnh.
- Nút Tạo bảng thông số dùng chung; đổi lựa chọn chưa tạo bảng thì chưa cho lưu nhầm công thức cũ. Tạo lại có hướng dẫn rõ việc thay thông số/công thức của bản đang sửa.
- Mã và thông tin phụ thu gọn; giữ phần công thức, khổ mua thử và cách khai riêng trong Mở rộng. Tên và nhóm đang nhập được giữ khi tạo bảng.
- Kiểm tra trình duyệt: thứ tự, từng hình, đổi hình, góc đối chiếu, lưu/mở lại, công thức riêng, màn hình 390/800/1440 px. Các kiểm tra tam giác và giao diện đã duyệt đạt; 26 kiểm tra hình dạng/tính toán đạt.

### Chọn dòng và thao tác nhanh ở bảng Công đoạn & định mức
- Thêm ô chọn từng dòng và Chọn tất cả dòng đang hiển thị, dùng đồng nhất trên máy tính/điện thoại. Chọn dòng mới hiện thanh Gán nguyên công / Đánh giá mức độ / Bỏ chọn.
- Thu gọn các nút Đánh giá nhanh lặp lại. Khi chọn nhiều dòng, đánh giá mở danh sách để vào từng dòng; các mức độ vẫn lấy theo bảng khai báo, kỹ thuật không thấy hệ số.
- Gán nguyên công dùng lại cách khai hiện có, bổ sung chọn tất cả nguyên công. Nếu chọn cả cha/con thì áp tại cấp cao nhất và ghi rõ các dòng thực sự áp dụng trong cửa sổ.
- Lựa chọn độc lập với bảng cấu thành, không ghi vào báo giá; tìm kiếm bỏ các dòng không còn hiển thị khỏi lựa chọn. Bản khóa/tài khoản không có quyền không được thao tác sửa.
- Kiểm tra: chọn/lọc/hủy không sửa dữ liệu, gán nhiều dòng, giữ lựa chọn cấu thành, máy tính/điện thoại, lưu/mở lại; tài khoản kỹ thuật thật lưu máy chủ và không thấy hệ số; 5 kiểm tra phân quyền/độ phức tạp đạt.

### Chọn độ phức tạp chung cho các nguyên công trong một dòng
- Cửa sổ đánh giá có ô Độ phức tạp chung: chọn một lần để điền các nguyên công đã chọn trên dòng; vẫn chỉnh riêng từng nguyên công trước khi lưu.
- Bảng đặt nguyên công theo cột và độ phức tạp theo hàng; trên điện thoại chuyển thành từng mục dễ đọc.
- Chỉ đưa ra các mức có chung trong bảng khai báo của tất cả nguyên công. Khi lưu, mỗi nguyên công lấy đúng mục và hệ số của bảng riêng; kỹ thuật chỉ thấy tên mức độ.
- Kiểm tra: chọn chung, chỉnh riêng, hủy, bỏ đánh giá, lưu/mở lại, bảng không có mức chung, một nguyên công, màn hình máy tính/điện thoại và tài khoản kỹ thuật lưu máy chủ.

### Mức độ phức tạp ngay khi gán nguyên công
- Cửa sổ gán nguyên công có phương án, định mức và mức độ phức tạp theo danh mục; lọc đúng nhóm của các dòng đang chọn. Không chọn mức mới thì giữ đánh giá cũ; có lựa chọn bỏ đánh giá.
- Kiểm tra toàn bộ lựa chọn trước khi áp dụng; mỗi nguyên công lấy hệ số từ đúng bảng, kỹ thuật chỉ chọn tên mức độ.
- Thu gọn bảng cấu thành: ẩn mã/quy cách phụ và nút kích thước trên dòng vật tư; vẫn mở chi tiết hoặc menu thao tác để xem, sửa.
- Kiểm tra gán/lưu/mở lại, hủy, giữ đánh giá cũ, bỏ đánh giá, không đổi nguyên công ngoài lựa chọn, điện thoại và hồi quy phân quyền kỹ thuật.

### Đồng bộ diễn giải số lượng khi nhập nhanh
- Sửa dòng Lượng theo cây bị giữ số cũ sau khi sửa số lượng sản phẩm, cấu kiện hoặc vật tư. Cập nhật diễn giải theo kết quả đang tính trên bảng.
- Kiểm tra 13 × 1 × 1 → 12 × 1 × 1 → 12 × 1 × 5 → 12 × 2 × 5: diễn giải, tổng hiển thị và kết quả tính đồng nhất; mở lại giữ đúng.

### Khóa công thức và hệ số đã chốt
- Nút Khóa công thức và hệ số có thêm mục khóa chung bảng hệ số, phạm vi áp dụng, hệ số nguyên công/vận chuyển, hệ số giá và hao hụt chung. Khóa theo dữ liệu đã lưu trên máy chủ.
- Chỉ vai trò Admin có quyền khóa/mở khóa và sửa nội dung đã khóa. Bỏ lựa chọn cấp quyền mở khóa cho nhân viên; quyền đã cấp trước đây không còn vượt khóa.
- Máy chủ kiểm tra cả danh mục, bản sao trong báo giá và hệ số phức tạp nhập trực tiếp. Nhân viên vẫn sử dụng công thức, nhập số lượng/kích thước và chọn mức độ đã khai.
- Kiểm tra API với tài khoản thật: chặn sửa/xóa/thêm hệ số và đổi phạm vi, chặn mở khóa được ủy quyền, giữ quyền dùng công thức, khóa/mở có kiểm tra phiên bản. Kiểm tra cửa sổ khóa và chặn chỉnh hệ số trên trình duyệt.

### Xóa bản nháp từ danh sách máy chủ
- Admin có nút Xóa bản nháp bên cạnh Mở; nhập đúng mã để xác nhận. Chỉ áp dụng bản nháp chưa từng duyệt, chưa chuyển đơn hàng.
- Xóa khỏi danh sách làm việc, giữ dữ liệu và lịch sử trong bản sao lưu cùng dấu vết người xóa. Các tài khoản không thể mở/sửa hoặc phục hồi qua đường dẫn cũ.
- Kiểm tra quyền, mã xác nhận, phiên bản thay đổi, trạng thái đã trình/duyệt/mở sửa sau duyệt, danh sách kỹ thuật, giữ lịch sử, hủy thao tác và xóa bản đang mở.
