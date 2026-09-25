# Vận chuyển theo lô và tách lắp đặt

Phát hành ngày 25/09/2026: `0e08850`. Đã sao lưu và triển khai lên máy chủ. 741/741 kiểm thử tự động đạt; hai bộ kiểm thử trình duyệt logistics đạt. Kiểm tra HTTPS thực tế xác nhận giao diện tạo lô/tuyến, tab lắp đặt riêng và phương thức mét dài sản phẩm, không ghi dữ liệu nghiệp vụ. Phiên kiểm tra tạm đã thu hồi; healthcheck đạt.

- Giá & hệ số có hai tab Vận chuyển và Lắp đặt, cùng quyền logistics; chuyển tab không đổi số liệu. Khoản chi và phân bổ lọc theo tab, các khoản tổng nhập trước vẫn được ghi chú để đối chiếu.
- Vận chuyển nhập phôi hiển thị từng mã: chọn nhiều mã → Tạo lô từ vật tư đã chọn → chọn đơn giá, đặt tên lô, cự ly/số chuyến và cách phân bổ → lưu một khoản chi chung. Không tạo một phí tối thiểu cho mỗi mã. Có thể sửa lại phạm vi trong khoản chi.
- Bảng thuê ngoài hiển thị đối tượng, mã vật tư và công đoạn: chọn các công đoạn đi chung nơi gia công → Tạo tuyến → khai điểm đến. Cùng phôi tính một lần trong tuyến, khác phôi cộng khối lượng, tuyến khác được tính riêng.
- Giao hàng hỗ trợ kg, mét dài sản phẩm và đơn vị sản phẩm (bộ/cái…); đơn vị phải khớp các sản phẩm được chọn. Mét dài sản phẩm = L (mm) × số lượng / 1.000, không phải tổng chiều dài vật tư con. Thiếu L thì báo lỗi hoặc nhập lượng thay thế có căn cứ.
- Cách tính mét dài cũ giữ nguyên để không thay kết quả báo giá đã lưu; cách mới có mã riêng `product_m`. Đơn giá chọn trong báo giá vẫn là bản chụp, không tự đổi khi sửa danh mục.
- Phân bổ một khoản cước chung sử dụng lựa chọn hiện có: khối lượng, kg phôi, số lượng, diện tích, giá vật tư hoặc chia đều. Không âm thầm chọn cách khác khi thiếu cơ sở. Tổng phân bổ khớp chi phí; lưu/lấy lại không nhân đôi khoản.
- Đã kiểm thử tính mét dài/đơn vị, phí tối thiểu một lô, phân bổ; luồng trình duyệt chọn vật tư/công đoạn, chuyển tab, F5 và mobile. Tiêu chí đánh giá khách hàng tiếp tục chờ khách phản hồi, không triển khai trong đợt này.
