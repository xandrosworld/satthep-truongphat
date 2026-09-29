# Tách phần vận chuyển chỉ xem khỏi dữ liệu lưu kỹ thuật

Runtime: d890718. Báo lỗi: Nguyễn Khắc Phú, BG-20260925-004, phiên bản 8; Không được sửa: Vận chuyển và lắp đặt.

## Phạm vi xác minh
Bản sao DB thật cho thấy Phú được sửa BOM/nguyên công, chỉ xem vận chuyển. Thử thêm vật tư và lưu trên bản tải mới không tái hiện lỗi. Chưa có payload bản nháp lỗi từ trình duyệt khách để xác định thao tác ban đầu làm lệch phần vận chuyển. Vì vậy không kết luận thao tác thêm vật tư luôn gây lỗi.

## Bản sửa
- Khi tài khoản không có quyền sửa vận chuyển/lắp đặt, payload lưu giữ nguyên phần này từ phiên bản đã tải: chi phí chung, khoản chi, nguồn mua, lắp đặt thiết bị, chi phí ở dòng sản phẩm/vật tư và chứng cứ nguồn giá liên quan.
- Bản nháp cũ có phần logistics bị lệch không còn làm chặn lưu kỹ thuật. Dòng mới không mang theo chi phí logistics ngoài quyền. Không thay giá đã lưu trên máy chủ.
- Sau lưu thành công đồng bộ phần chỉ xem về giá trị đã gửi, tránh giao diện vẫn hiển thị chi phí cũ sai. Bản kỹ thuật và nội dung nhập trong khi đang lưu vẫn được bảo toàn theo cơ chế kiểm tra phiên bản hiện có.
- Không bỏ kiểm tra quyền phía máy chủ. Sửa logistics trực tiếp bằng giao diện vẫn bị chặn; gửi API ngoài quyền vẫn bị từ chối.

## Kiểm thử
- 8/8 core/API (logistics-technical-save + section-access): tách payload, giữ dữ liệu kỹ thuật, quyền từng phần, stale save, API bypass.
- Browser logistics-technical-save: giả lập bản nháp lệch logistics, thêm vật tư, lưu/mở lại, chi phí giữ nguyên; cả UI và API từ chối sửa trái quyền.
- Browser bom-add-submit: thêm vật tư/cấu kiện, form lỗi giữ dữ liệu, thử lại và lưu máy chủ.
- Trên bản sao dữ liệu thật với quyền Phú: giả lập bản nháp lệch logistics, thêm VT-00019, vào hao hụt, lưu 200 và mở lại; khoản vận chuyển giữ nguyên.
- Không ghi thử vào báo giá thật, không tăng quyền tài khoản.
- Triển khai production đã sao lưu trước; health/HTML public đạt và 97 file runtime khớp SHA256 manifest.
