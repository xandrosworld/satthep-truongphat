# Cách giá mới xuất hiện ngay trong báo giá cũ

Nguồn: hai ảnh khách ghi Cắt phôi có 4 cách ở Đơn giá đầu vào nhưng danh sách chọn trong Báo giá chỉ có 2 cách. Đây là lỗi thiếu kết nối danh sách, không phải giao diện cũ chưa tải lại.

## Nguyên nhân và sửa đổi

Ô chọn trước đây chỉ đọc ratesSnapshot của báo giá. Các cách mới trong db.rates chỉ có sau thao tác lấy bảng giá, nên kiểm thử cũ có bước lấy bảng đã không bao phủ trường hợp khách vừa khai rồi vào chọn ngay.

Danh sách giờ gồm các cách hợp lệ đã lưu trong báo giá và các cách mới đang bật ở đúng nguyên công trong danh mục; gộp theo mã để không trùng. Chỉ đọc danh sách không thay dữ liệu hoặc giá báo giá. Khi chọn một cách chưa có trong bản lưu, hệ thống kiểm dữ liệu rồi chụp đúng cách đó vào báo giá; nếu cách có yếu tố, lấy bảng yếu tố và quy tắc áp thuê ngoài tương ứng. Các công việc cùng nguyên công dùng lựa chọn qua bộ tính hiện có. Các bảng giá, định mức khác không bị thay toàn bộ.

Cách đã lưu vẫn giữ giá cũ kể cả khi danh mục sửa giá hoặc ngừng cho chọn mới; muốn lấy giá mới của cách đã lưu vẫn dùng thao tác lấy bảng. Cách mới ngừng dùng trước khi chọn không được nhập vào. Nhập cách sai giá/đơn vị bị từ chối và hoàn tác, giữ lựa chọn trước đó.

## Kiểm chứng

5 nhóm mới thao tác trực tiếp UI: thêm hai cách m dài và kg vào danh mục; báo giá cũ thấy đủ bốn cách mà không bấm lấy bảng; dữ liệu báo giá giữ nguyên trước lựa chọn; chọn m và kg tính đúng giá xưởng/thuê ngoài; tải lại không trùng mục; cách mới có yếu tố lấy đúng bảng; sửa danh mục không tự đổi giá đã chọn; dữ liệu sai không ghi dở; màn hình hẹp.

Ca thử theo giá trong ảnh: Cắt theo kg tại xưởng 94,2 kg × 4.500 = 423.900đ, thuê ngoài 70,65 kg × 6.000 = 423.900đ. Cắt theo mét tại xưởng 10 m × 1.500 = 15.000đ. Cách mới có hệ số: 94,2 × 2.000 × 1,045; thuê ngoài giữ 70,65 × 3.000 khi không áp hệ số thuê ngoài.

Cùng 19 nhóm hồi quy chọn giá, khai báo và ma trận: tổng 24 nhóm cục bộ đạt. Đối chiếu HTML triển khai và chạy lại 5 nhóm mới trên web. Bằng chứng: artifacts/customer-review/quote-method-sync-2026-09-15/. Không thay trạng thái nghiệm thu của khách.
