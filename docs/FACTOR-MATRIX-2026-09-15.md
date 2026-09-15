# Yếu tố dùng chung, ma trận áp dụng và lưu đơn giá

Nguồn: hai ảnh khách hỏi TMC là gì, phản ánh chưa lưu được Cắt phôi và yêu cầu khai yếu tố một lần rồi có ma trận xác định công đoạn chịu tác động.

- Nhãn lựa chọn ghi rõ dùng bảng giá thang máng cáp thay tiền công tại xưởng. Có giải thích chỉ thay khi chọn phương án thang máng cáp, không cộng tiền công hai lần. Tab đơn giá cũng ghi Thang máng cáp. Mã dữ liệu tmc giữ tương thích.
- Danh mục quy ước → Hệ số tính toán hiển thị yếu tố dùng chung: mã, tên, đại lượng tra, các bậc và công việc áp dụng. Có thể khai yếu tố chưa gắn công việc, thử hệ số trước khi lưu.
- Ma trận có hàng là yếu tố, cột là nguyên công hoặc phương thức vận chuyển/lắp đặt. Tích để áp dụng, bỏ tích để gỡ riêng liên kết. Lưu ma trận là thao tác riêng; Hủy không ghi các ô vừa đổi. Ô thiếu đại lượng tương ứng không cho gắn.
- Một yếu tố được gắn nhiều công việc thì sửa bảng một lần cập nhật tất cả công việc đã gắn. Mỗi công việc vẫn có lựa chọn áp cho giá thuê ngoài theo cơ chế hiện hành. Hệ số trên báo giá là bản chụp, chỉ lấy mới khi người dùng chọn cập nhật.
- Dữ liệu cũ được đọc mà không đổi giá: các định nghĩa hoàn toàn giống nhau có thể dùng chung; cùng mã nhưng bảng khác nhau giữ thành các định nghĩa riêng. Bảng được lưu trong pricingDefaults.factorDefinitions; các bảng nguyên công giữ bản dùng để tính với sharedFactorId tham chiếu. Các bậc không tự thay đổi khi chỉ mở màn hình.
- Nút lưu danh mục ghi Lưu đơn giá. Đã xác nhận chỉnh giá Cắt phôi, lưu, tải lại và mở ra giữ đúng giá mới. Ảnh không đủ dữ liệu để kết luận nguyên nhân riêng của lần lỗi khách gặp; trên bản kiểm tra hiện tại luồng này lưu thành công. Cải thiện lỗi nhập liệu: chỉ rõ tên ô thiếu/sai, mở vị trí ô và đưa tiêu điểm đến đó; lỗi hiện trong chân hộp thoại cạnh nút lưu, tránh tình trạng bấm mà không thấy lý do.
- Excel có bảng yếu tố dùng chung và ma trận. Bảng định nghĩa/liên kết lưu qua sao lưu, danh mục và hồ sơ API cục bộ; các báo giá đã lưu không bị sửa theo.

## Kiểm chứng

303 bài logic, 56 bài API cục bộ đạt. 34 nhóm trình duyệt đạt: 5 ma trận/lưu đơn giá, 6 hệ số, 7 đơn giá đầu vào, 9 khai báo và 7 danh mục. Kiểm tra trực tiếp phép tính hệ số cho hai công đoạn, sửa dùng chung, gỡ riêng một liên kết, Hủy, lấy giá mới vào báo giá, tải lại, Excel và màn hình hẹp.

Bằng chứng: artifacts/customer-review/factor-matrix-2026-09-15/. Trước bàn giao đối chiếu HTML Netlify với build đã kiểm tra và chạy lại bộ ma trận trên URL công khai. Các kiểm tra này không thay nghiệm thu của khách; Netlify vẫn dùng dữ liệu trình duyệt, API được kiểm thử cục bộ.
