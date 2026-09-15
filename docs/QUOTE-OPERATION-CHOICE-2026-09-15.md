# Báo giá chọn một cách giá cho mỗi nguyên công

Nguồn: ảnh khách khoanh hai dòng “Theo đơn giá cơ sở / Giá cơ sở × hệ số” trong Giá áp dụng cho báo giá này → Nguyên công / bề mặt, ghi rằng chỉ chọn một trong các cách đã khai, không liệt kê bảng khai báo.

## Thay đổi

- Màn này có một dòng cho mỗi nguyên công, một ô chọn cách giá đã khai. Không dùng lại bảng liệt kê mọi cách tính và nút sửa khai báo của danh mục.
- Chọn ngay trên dòng áp dụng cho các công việc cùng nguyên công trong báo giá, qua bộ setMethod/setPriceOption hiện có. Lượng công việc, nơi làm, hệ số phức tạp riêng được giữ nguyên. Lựa chọn lưu và tính lại ngay; không sửa giá danh mục.
- Hiện đơn giá thực tế theo nơi làm và đơn vị, đã tính yếu tố/độ phức tạp của từng công việc. Nếu nhiều đơn giá cùng đơn vị thì hiện khoảng thấp nhất–cao nhất; mở chi tiết xem từng phép tính. Tiền công cộng đúng các công việc, không gồm vật tư hoàn thiện hay công đã nằm trong gói thuê.
- Công việc thiếu dữ liệu hiện “Chưa tính đủ”. Cách đã chọn bị xóa/ngừng dùng sau khi lấy bảng mới vẫn hiện lỗi yêu cầu chọn lại, không tự rơi về đơn giá khác. Dữ liệu cũ có đơn giá riêng/giá gói riêng vẫn được giữ đến khi người dùng chọn một cách đã khai.
- Chi tiết có lượng/độ phức tạp và thao tác lấy bảng mới từ danh mục. Danh mục đơn giá vẫn là nơi khai đầy đủ phương thức. Cửa sổ chỉnh giá riêng trước đây không bị xóa bởi sửa đổi màn chọn này.

## Kiểm chứng

5 nhóm mới: chọn một cách tại đúng màn; lấy các phương thức đã khai; đổi kg/m²/tấn/gói; giá xưởng và thuê ngoài; hệ số riêng; tải lại; đồng bộ với chi tiết công việc; nguồn bị ngừng dùng; ngăn ghi khi xung đột thẻ; màn hẹp. Ca số hai công việc Cắt phôi theo kg: 94,2 kg × 2.000 × 1,2 = 226.080đ tại xưởng, 70,65 kg × 3.000 = 211.950đ thuê ngoài, tổng 438.030đ.

Hồi quy 9 nhóm khai báo/cách giá, 5 ma trận và 5 bảng đơn giá đạt: tổng 24 nhóm trình duyệt cục bộ. Các kiểm tra lấy bảng từ danh mục mở phần chi tiết mới trước khi bấm. Không sửa bộ tính hoặc cấu trúc dữ liệu máy chủ trong đợt này.

Bằng chứng: artifacts/customer-review/quote-operation-choice-2026-09-15/. Bàn giao đối chiếu HTML Netlify với build đã kiểm và chạy 5 nhóm mới trên URL công khai. Chưa thay xác nhận của khách đối với hai bảng đang rà.
