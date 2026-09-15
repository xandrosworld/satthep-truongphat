# Đơn giá đầu vào — phản hồi ngày 15/09/2026

Nguồn: ba ảnh khách gửi yêu cầu lịch sử ba lần đổi giá vật tư, thêm bảng vận chuyển/lắp đặt/TMC, hiển thị mã yếu tố tác động.

- Giá vật tư: ghi giá cũ → mới, thời điểm và đơn vị khi có thay đổi thực tế; bảng hiện ba lần gần nhất, Excel lưu toàn bộ lịch sử. Dữ liệu cũ không tạo lịch sử giả. Cả sửa trực tiếp và thay giá qua thao tác danh mục dùng chung đều đi qua bộ ghi thay đổi.
- Đơn giá đầu vào có năm mục: vật tư, nguyên công & hệ số, vận chuyển, lắp đặt, TMC.
- Vận chuyển: khai phương thức cho nhập vật tư, thuê ngoài, giao hàng đến nơi lắp đặt. Lắp đặt có bảng riêng. Mỗi loại khai được nhiều phương thức với mã, tên, cách tính, giá, phí tối thiểu và trạng thái cho chọn mới. Dùng các cơ sở hiện có: kg/tấn vận chuyển hoặc mua, tấn × km, m², m, số lượng, chuyến, km, trọn gói. Không tự đặt đơn giá thực tế cho khách.
- Hệ số vận chuyển/lắp đặt khai tập trung tại Danh mục quy ước → Hệ số tính toán. Chọn công việc tương ứng, khai cơ sở tra, bậc và thử hệ số. Bảng đơn giá tham chiếu cùng dữ liệu; không sao chép sang bảng hệ số thứ hai.
- Trong khoản chi báo giá, chọn phương thức giá đầu vào; bộ tính hiện có tiếp tục xử lý phạm vi, lượng, quãng đường, chuyến, hệ số, phí tối thiểu và phân bổ. Giá được chụp cùng khoản chi. Đổi bảng chung không sửa báo giá cũ; chọn lại giá chung hoặc chủ động cập nhật mới áp dụng giá mới. Vẫn có lựa chọn nhập riêng.
- TMC: thêm/sửa chủng loại, đơn vị m/cái và bậc giá theo khổ rộng; bảo toàn các thiết lập mở rộng hiện có. Báo giá mới lấy bảng chung. Báo giá cũ có nút lấy bảng TMC; chủng loại mới xuất hiện ở phần chọn giá sản phẩm. Giá TMC dùng bộ tính TMC hiện có.
- Bảng nguyên công hiện mã + tên + tham số của từng yếu tố đang bật; nêu phạm vi áp dụng tại xưởng/thuê ngoài.
- Lưu cục bộ, dữ liệu sao lưu, Excel, phát hành/lấy danh mục và hồ sơ API cục bộ giữ các bảng mới và lịch sử. API từ chối giá âm, mã trùng, phương thức sai và bậc TMC sai.

## Kiểm chứng

- 300 bài kiểm tra logic và 55 bài kiểm tra API cục bộ đạt.
- 29 nhóm thao tác trình duyệt đạt: 7 đơn giá mới, 9 kiểm tra khai báo, 6 hệ số, 7 danh mục quy ước.
- Kiểm thử vận chuyển: 3 chuyến × 100.000đ × 1,1 = 330.000đ; giá chung đổi 200.000đ không làm đổi bản chụp; chọn lại phương thức ra 660.000đ. Kiểm tra cả lắp đặt theo m², lưu lại trang, bảng TMC mới và màn hình hẹp.
- Bằng chứng tại artifacts/customer-review/input-prices-2026-09-15/. Bản Netlify được so khớp toàn bộ HTML với build đã kiểm tra, sau đó chạy lại bộ đơn giá trên URL công khai.
- Đây là kiểm chứng triển khai, chưa phải nghiệm thu của khách. Netlify vẫn là bản dùng bộ nhớ trình duyệt; API được kiểm thử cục bộ.
