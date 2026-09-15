# Nhóm sản phẩm dùng chung

Nguồn: ảnh Danh mục quy ước, khách ghi thiếu nhóm sản phẩm và nêu Cơ khí, Cửa gió, Thang máng cáp, Lan can, Tủ điện, cùng khả năng thêm các nhóm khác.

- Thêm tab Nhóm sản phẩm tại Danh mục quy ước, có sẵn năm nhóm trên; thêm, sửa nhóm chưa dùng, xóa nhóm chưa dùng, tìm kiếm, nơi dùng, kiểm tra tổng thể và xuất Excel danh mục.
- Chọn nhóm khi thêm sản phẩm. Chọn mẫu sẽ điền nhóm của mẫu; chuyển sang sản phẩm trống bỏ nhóm kế thừa để người dùng chọn lại.
- Nút Nhóm trên sản phẩm ở bảng cấu thành và màn chi tiết cho phép phân loại sản phẩm đã có. Dữ liệu cũ chưa khai giữ trạng thái Chưa phân nhóm.
- Lưu mẫu, dùng mẫu và nhân bản giữ nhóm theo bản sao. Thư viện có lọc nhóm và sửa nhóm của mẫu; sửa mẫu không đổi sản phẩm đã gọi từ mẫu.
- Phân loại dùng conventions.productGroups và node.productGroup. Phần cách tính giá đang dùng quote.pricing.productGroups / priceGroupId giữ nguyên cơ chế. Nhãn tại đầu vào giá đổi thành Nhóm áp dụng cách tính giá để phân biệt. Chọn phân loại không gán công thức hoặc thay giá.
- Tên nhóm đang được tham chiếu không được xóa/đổi; có thể tạo nhóm mới để phân loại các dòng mới. Kiểm cả báo giá đang mở, đã lưu, lịch sử và thư viện. Máy chủ bảo vệ cả nhóm có sẵn chưa từng ghi riêng trong danh mục; chặn giá trị phân nhóm sai kiểu.

Kiểm: 289 ca logic, 1 ca tích hợp máy chủ cục bộ và 10 nhóm trình duyệt cục bộ (6 nhóm sản phẩm, 4 hồi quy công cụ công thức). Bằng chứng tại artifacts/customer-review/product-groups-2026-09-15/. Triển khai được đối chiếu toàn bộ HTML với bản đã kiểm trước khi chạy lại luồng nhóm sản phẩm trên web. Kiểm web dùng trình duyệt thử riêng; máy chủ chỉ kiểm cục bộ. Đây là xử lý ảnh phân nhóm sản phẩm, không xác nhận nghiệm thu thay khách hoặc hoàn tất các phản hồi đơn giá khác.
