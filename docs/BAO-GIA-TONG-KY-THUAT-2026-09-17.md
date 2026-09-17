# Mã báo giá và tổng thông số kỹ thuật

## Mã báo giá

- Tạo mới hoặc nhân bản tự gợi ý mã `BG-YYYYMMDD-001`, theo ngày tạo; lấy số lớn nhất đang có trong ngày cộng 1. Qua ngày mới bắt đầu từ 001; sau 999 tiếp tục 1000.
- Trên máy chủ, số được cấp trong giao dịch lưu báo giá. Hai người mở cùng một số gợi ý vẫn nhận hai số khác nhau khi lưu.
- Đổi ngày tạo sẽ cập nhật mã đang được tự gợi ý. Nếu người dùng đã nhập mã riêng, giữ mã đó và kiểm tra trùng như trước.
- Không đổi mã của báo giá đã lưu.

## Cấu thành và thông số tổng

- Các bước kỹ thuật hiển thị khối lượng phôi, diện tích phôi và số cấu kiện toàn đơn ở đầu báo giá, thay cho lời giới thiệu minh họa.
- Khối lượng và diện tích cộng từ từng dòng vật tư sau khi nhân số lượng các cấp, không cộng lại các tổng cấp cha.
- Diện tích là diện tích phôi theo quy ước đã khai. Đây không phải tổng diện tích sơn hoặc tổng lượng các nguyên công.
- Số cấu kiện là tổng lượng cấu kiện sau khi nhân số lượng cấp cha; hiển thị thêm số dòng cấu kiện để đối chiếu.
- Nếu chưa có sản phẩm/thành phần, thiếu mã, sai số lượng hoặc chưa tính được hình học, hiển thị phần đã tính cùng cảnh báo tổng chưa đủ. Mở cảnh báo để xem các nội dung cần bổ sung.
- Các ký hiệu SP, CK, VT·CK, VT·SP chuyển vào nút **Bảng ký hiệu**.

## Vật tư phụ

- Cột **Vật tư phụ (%)** tại bảng cấu thành mở ô nhập tỷ lệ cho từng dòng phôi. Nút cùng tên phía trên cho phép rà nhiều dòng, kể cả khi dùng cây chi tiết.
- Giữ cơ sở tính sẵn có: tỷ lệ trên giá phôi của dòng trong phương án đang chọn, không tính trên nhân công. Không nhập lại vật tư đã có mã hoặc định mức riêng. Nhập 0 nếu không áp dụng; khoảng nhập 0–100%.
- Tài khoản kỹ thuật được xem/sửa tỷ lệ theo quyền cấu thành, không nhận giá vốn. Máy chủ giữ các đơn giá và dữ liệu thương mại khi kỹ thuật lưu.
- Tỷ lệ lưu trên dòng vật tư, đi cùng bản sao và mẫu sản phẩm; vật tư theo cái/bộ không áp dụng tỷ lệ phôi.

## Kiểm tra

- 420 kiểm thử trong `tests/*.test.cjs` đạt.
- `tests/quote-workspace.test.cjs`: mã theo ngày, ngày không hợp lệ, số vượt 999, tạo đồng thời; tổng hình học không cộng lặp; dữ liệu thiếu; tỷ lệ vật tư phụ tính một lần, giữ giá và kiểm tra quyền kỹ thuật.
- `tests/quote-workspace-browser.cjs`: tạo báo giá qua giao diện khi người khác vừa lấy số; đổi ngày; mở bảng ký hiệu; sửa số lượng và cập nhật tổng; quản trị/kỹ thuật lưu, tải lại tỷ lệ; cảnh báo thiếu dữ liệu và màn hình hẹp.
- `tests/technical-pricing-browser.cjs`: các bước kỹ thuật không hiện tiền.
- Kiểm thử ghi báo giá dùng máy chủ thử nghiệm riêng, không tạo đơn thử trong dữ liệu khách trên Railway.
