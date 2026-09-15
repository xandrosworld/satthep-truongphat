# Hai bảng khai báo — chốt cách giá và ma trận yếu tố

Nguồn: lời khách và ảnh ngày 15/09: tham khảo riêng cách tính theo yếu tố tác động; giữ cấu trúc phương thức theo kg, mét dài, m² và các đơn vị đã xây dựng; khai xong tại bảng giá, báo giá chọn cách giá. Phạm vi đợt này là Danh mục quy ước và Đơn giá đầu vào, cùng liên kết chọn bảng vào báo giá.

## Thay đổi

- Bảng nguyên công hiển thị số yếu tố, mã và tên, công thức áp dụng ngay tại dòng giá có hệ số. Giá tại xưởng/thuê ngoài, đơn vị và các phương thức đã khai vẫn hiển thị riêng. Các bảng hệ số nằm trong Danh mục quy ước → Hệ số tính toán, khai một lần và dùng chung.
- Ma trận được đổi sang **hàng công đoạn/công việc, cột yếu tố** theo ảnh. Đặt ngay dưới bảng giá nguyên công, vận chuyển và lắp đặt. Tích/bỏ tích cập nhật số yếu tố và công thức xem trước; Lưu ma trận mới ghi, Bỏ thay đổi khôi phục. Lưu tại một bảng giữ các liên kết đang dùng ở bảng khác. Nút Chọn yếu tố đưa đến đúng dòng ma trận. Công thức phân biệt phần trăm chia 100 với hệ số nhân trực tiếp.
- Vận chuyển/lắp đặt khai cách xác định đơn giá cơ sở hoặc giá có yếu tố, độc lập với đơn vị khối lượng, chiều dài, diện tích, chuyến... Khi chọn phương thức trong báo giá, lấy đúng đơn giá và hệ số tương ứng. Phương thức cơ sở không nhân các yếu tố đang khai; phương thức có yếu tố chỉ nhân một lần. Các phương thức cũ chưa có lựa chọn này giữ cách tính cũ. Bảng đã chọn trong báo giá giữ bản chụp, thay danh mục không tự đổi báo giá.
- Đơn giá thang máng cáp khai được nhân công theo m/cái/kg/m², cách tra khổ rộng theo khoảng hoặc đúng mốc, hao hụt riêng nhóm, vật tư phụ và chi phí chung cố định hoặc phần trăm với cơ sở tính rõ ràng. Chọn bảng trong báo giá dùng lượng thực tế và bộ tính hiện có. Khổ không được khai trong chế độ đúng mốc báo thiếu giá; dòng vượt mốc vẫn áp theo quy ước đã chọn. Các đơn giá ví dụ trong kiểm thử không được đưa vào dữ liệu mặc định.
- Excel có ma trận cùng chiều màn hình, cách xác định đơn giá vận chuyển/lắp đặt và đầy đủ phần khai bổ sung của bảng thang máng cáp.

## Kiểm chứng

305 bài logic và 56 bài API cục bộ đạt. 39 nhóm kiểm thử trình duyệt đạt: 5 luồng mới, 9 khai báo/cách giá, 6 hệ số, 7 danh mục, 7 đơn giá đầu vào, 5 ma trận/lưu giá.

Luồng mới kiểm tra cả thao tác thật: tạo hai phương thức vận chuyển và một yếu tố 20%; chọn trong báo giá cho cùng 3 chuyến cho 300.000đ theo cơ sở và 360.000đ theo hệ số. Khai bảng thang máng cáp m², lưu/tải lại, lấy vào báo giá, chọn và tính cả khoản phụ/chung. Kiểm tra cả lỗi khổ chưa khai, Excel, bỏ thay đổi ma trận, lưu theo từng bảng, giữ bản chụp báo giá và màn hình hẹp.

Lần chạy API đồng thời đầu tiên có một tiến trình test kết thúc không có chi tiết assertion; chạy lại toàn bộ API tuần tự đạt 56/56, không sửa mã để vượt lỗi. Kiểm tra trình duyệt ban đầu dùng khổ vượt mốc cuối đã khai, nên không thể kỳ vọng báo lỗi; sửa ca thử thành khổ chưa khai dưới mốc và kiểm đúng lỗi.

Bằng chứng: artifacts/customer-review/pricing-declarations-2026-09-15/. Quy trình bàn giao đối chiếu toàn bộ HTML công khai với build đã kiểm tra, sau đó chạy lại 5 luồng mới trên URL Netlify. Dữ liệu trên Netlify vẫn lưu trong trình duyệt; API được kiểm thử cục bộ. Đây là kết quả kỹ thuật của hai bảng, chưa thay nghiệm thu khách hàng hay đóng các hạng mục khác.
