# Cập nhật quyền thực tế của Thảo theo phản ánh khách

Ngày 29/09/2026. Runtime a5ca04f. Ảnh khách cho thấy hệ số bị ẩn và đơn giá vận chuyển không có nút khai báo.

Đối chiếu DB mới nhất: nv-002 được cấp trực tiếp, chưa bố trí vị trí; can_factors=0, factors=use; catalogLogistics=view, actionAccess.catalogLogistics=[view]. Vì vậy các bản sửa UI trước chưa giải quyết quyền thực tế. Sau yêu cầu tiếp tục xử lý của người dùng, cập nhật riêng tài khoản Nguyễn Công Thảo: can_factors=1, factors=configure, catalogLogistics=configure, thêm hành động create/edit của catalogLogistics. Các quyền khác giữ nguyên; không thêm delete hoặc approve. Không thay bộ quyền dùng chung, báo giá, đơn giá hay khóa calculationFactors:all.

Đã sao lưu trước cập nhật, transaction kiểm tra giá trị cũ trước khi ghi; ghi access_history và audit với actor maintenance:user-request. Không thu hồi phiên cho thay đổi chỉ bổ sung quyền. Đọc lại server xác nhận factors=true, catalogLogistics=configure, actions=view/create/edit, approve=false và khóa hệ số chung còn nguyên.

Thử trên bản sao DB: sửa hệ số báo giá BG-20260922-002 tại mục 6, lưu/mở lại đúng, rates/ratesSnapshot nguyên vẹn. Nút sửa vận chuyển và lắp đặt hiển thị. Sửa đơn giá vận chuyển và gửi danh mục lên server: bản đề nghị pending giữ giá mới, không tự phát hành giá chính thức. Không dùng báo giá thật để thử.

Bổ sung UI: đổi quyền sửa hệ số phải tải lại dữ liệu kể cả factorsHidden vẫn true vì bảng chung bị khóa; không lấy các số 0 đang bị che làm giá trị nhập. Trong lúc cập nhật quyền, tạm khóa tương tác vùng nội dung đến khi lấy xong dữ liệu. Test trình duyệt quyền xem và quyền ẩn dưới khóa chung: cấp quyền, đăng nhập lại, giữ bản nháp, lấy đúng hệ số cũ, sửa/lưu/mở lại đạt. Bản phát hành xác minh 101 SHA runtime, health và HTML công khai.

Khách bấm Kiểm tra lại quyền để nhận quyền mới. Bản UI mới cần tải trang sau khi lưu xong. Hệ số của bảng chung vẫn theo khóa Admin; hệ số riêng báo giá sửa tại mục 6. Chưa có xác nhận trực tiếp từ Thảo.
