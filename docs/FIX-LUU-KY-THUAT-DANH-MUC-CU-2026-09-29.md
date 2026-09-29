# Lưu kỹ thuật với danh mục cũ và hệ số ẩn — 29/09/2026

## Bằng chứng
Bản sao DB production mới nhất, BG-20260923-003, quyền nv-003: mở mới và sửa số lượng lưu được. Khi mô phỏng thẻ gửi kèm rates của danh mục đã phát hành trước đó, tái hiện đúng 403: Không được sửa: Đơn giá nguyên công và nhóm sản phẩm.
Chưa thu được payload từ thẻ đang lỗi của Phú; không khẳng định đây là toàn bộ thao tác đã gây lỗi trên máy khách.

## Sửa
- retainPublishedHistory đối chiếu thêm rates và pricingDefaults với các phiên bản danh mục đã phát hành. Chỉ dữ liệu khớp lịch sử máy chủ được thay bằng snapshot hiện tại. Dữ liệu tự sửa không khớp vẫn qua kiểm tra quyền.
- Giữ hệ số đã lưu khi lựa chọn mức phức tạp không đổi nhưng payload bỏ trường số riêng. Gửi số khác vẫn bị chặn; chọn mức mới vẫn tra danh mục và cho thiếu giá theo cơ chế pending hiện có.
- Không tự gán hệ số mẫu, không cấp thêm quyền giá, không sửa dữ liệu thật.
- Luồng sửa nguồn phân quyền đang làm dở được giữ tại workspace, không đưa vào bản phát hành này.

## Kiểm tra
14 kiểm thử core/API đạt (lịch sử danh mục, quyền từng phần, mức phức tạp, thiếu hệ số và chống sửa số ngoài quyền).
Browser technical-missing-operation-price: lưu/mở lại khi thiếu giá; bàn giao toàn bộ/từng phần; cấu kiện thiếu thành phần vẫn chặn bàn giao đúng.
Browser hidden-factor-complexity: khai độ phức tạp khi hệ số ẩn, lưu/mở lại.
Bản sao DB thật: gửi lịch sử danh mục cũ, sửa số lượng, lưu/mở lại thành công; rates, pricingDefaults và ratesSnapshot bằng dữ liệu gốc.
Runtime 2215c52, triển khai sau sao lưu; gói chỉ chứa file đã commit.
