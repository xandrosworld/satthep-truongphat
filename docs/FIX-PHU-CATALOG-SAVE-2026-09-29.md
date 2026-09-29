# Lưu kỹ thuật bị chặn bởi danh mục đơn giá

Bản phát hành: e52cf4b, triển khai ngày 29/09/2026.

Ảnh khách: BG-20260923-003, phiên bản 3, tài khoản Phú; lỗi catalogOperations khi lưu cấu thành. Bản trước chỉ nhận diện danh mục cũ khớp lịch sử phát hành, không bao phủ danh mục trộn từ thẻ cũ.

Luồng lưu báo giá hiện giữ nguyên rates và từng phần pricingDefaults ngoài quyền từ bản lưu máy chủ. Dữ liệu kỹ thuật vẫn được kiểm tra và lưu; không cấp thêm quyền, không cập nhật giá qua dữ liệu danh mục gửi kèm. API danh mục vẫn kiểm tra quyền độc lập. Bảng lỗi nhập nhanh dùng kiểm tra kỹ thuật thay vì toàn bộ lỗi giá.

Kiểm tra: 15 bài core/API đạt; trình duyệt lưu, tải lại, bàn giao toàn phần/từng phần khi thiếu giá đạt; cấu thành thiếu vẫn lưu nháp nhưng bị chặn bàn giao đúng; kiểm tra hệ số ẩn đạt. Bản sao DB chứa báo giá và quyền Phú được thử với rates/defaults cũ trộn và thay đổi giá giả lập: lưu kỹ thuật và tải lại đạt, rates/defaults/ratesSnapshot giữ nguyên. Không sửa báo giá thật để thử.

Đã kiểm tra lại trình duyệt trên mã commit độc lập; máy chủ xác minh 99 SHA tệp runtime, health và nội dung trang công khai đạt. Sao lưu dữ liệu trước triển khai. Chưa có xác nhận từ chính thẻ trình duyệt của khách. Khách bấm Thử lưu lại trước khi tải lại trang để giữ dữ liệu chưa lưu.
