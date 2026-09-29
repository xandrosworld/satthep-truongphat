# Xóa đơn vị ngừng sử dụng — 29/09/2026

Runtime `3592f1a`, production healthy.

Tổ giá không xóa được vì còn vị trí Nhân viên gắn Nguyễn Thiện Xếp và Nguyễn Thị Hoàn. Đơn vị đã ngừng sử dụng nên những bố trí này không còn đóng góp quyền, nhưng thao tác xóa cũ chỉ bỏ đơn vị và bị kiểm tra tham chiếu chặn.

Luồng mới hiển thị vị trí và nhân sự liên quan trước khi xóa. API kiểm tra quyền sửa cơ cấu, phiên bản, đơn vị con, trạng thái sử dụng và bảo đảm quyền hiệu lực của mọi nhân sự không đổi. Gỡ vị trí của đơn vị và các liên kết bố trí tương ứng trong một transaction, giữ hồ sơ nhân sự và mọi vị trí khác. Lưu revision và audit. Đơn vị đang dùng có vị trí phải ngừng sử dụng trước; đơn vị có cấp dưới phải chuyển/xóa cấp dưới trước.

Đã kiểm thử `tests/organization-delete.test.cjs`: chặn thiếu quyền, stale version, đơn vị đang dùng/có cấp dưới; gỡ đúng liên kết; giữ tài khoản; có revision/audit. Build đạt.

Đã thực hiện trực tiếp qua giao diện production: xóa Tổ giá `76372d52-ceb2-43dc-abc7-c9f6a42b4da0`, gỡ vị trí `da046d0f-ce3b-46d6-851e-584e446034f6` và 2 bố trí tương ứng. So sánh trước/sau: nhân sự, tài khoản và cơ cấu khác giữ nguyên. Lịch sử cơ cấu trước xóa còn trong revisions; có backup trước triển khai. Phiên xác minh tạm đã thu hồi.
