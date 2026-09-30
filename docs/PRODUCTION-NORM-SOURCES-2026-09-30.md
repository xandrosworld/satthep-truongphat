# Nguồn định mức trong bảng rà soát lệnh sản xuất

- Bảng lấy máy/thiết bị từ hồ sơ rà soát, sau đó mới dùng thông tin công đoạn. Hiển thị lượng công việc tính trong báo giá nguồn; chi phí và giờ quy đổi từ chi phí vẫn theo quyền xem giá.
- Tra định mức theo đúng tên sản phẩm, mã nguyên công, máy và đơn vị sản lượng. Ưu tiên bản theo máy cụ thể hơn bản dùng chung. Nhiều bản cùng phạm vi phải rà soát, không tự lấy trung bình hoặc chọn một bản bất kỳ.
- Bổ sung bảng hao phí nhân công, giờ máy, điện, vật tư tiêu hao và chi phí máy đã khai; có lượng trên đơn vị sản lượng, tổng lượng cho công đoạn, căn cứ và phiên bản.
- Giờ máy chỉ gợi ý khi xác định máy, giờ công không tự đổi thành giờ máy. Khi thủ công, chỉ dùng nhóm thời gian công đoạn. Giờ quy đổi từ giá chào là thông tin tham khảo theo đơn giá hiện tại, không coi là thời gian thực đo.
- Trong đề nghị công nghệ có nút **Lấy định mức đã khai cho phần còn thiếu**. Chỉ điền ô còn trống, không ghi đè giá trị xưởng đang nhập; phải gửi đề nghị và qua các bước xác nhận/duyệt hiện có trước khi áp dụng.
- Phần xưởng tự nhập lưu trạng thái **Tạm tính tại xưởng** và căn cứ khảo sát/lý do đề nghị. Phần lấy danh mục lưu mã, phiên bản và căn cứ. Máy chủ kiểm tra lại phạm vi/phiên bản khi gửi; thay đổi danh mục không tự sửa định mức đã áp dụng trong lệnh.
- Giữ nguyên định mức và nguồn của công đoạn đã bắt đầu. Nút **Đối chiếu thực tế / hoàn thiện định mức** mở bảng định mức của đúng lệnh, phục vụ rà soát và cập nhật danh mục có lịch sử.
- Không tự thêm chi phí vào báo giá, không ghi đè báo giá nguồn, không tự thăng định mức tạm thành chuẩn chung.

## Kiểm tra

- `production-norm-source.test.cjs`: phạm vi, ưu tiên máy, xung đột, phiên bản, đề nghị chưa áp dụng, nguồn máy từ hồ sơ.
- `production-flow-browser.cjs`: lấy tham chiếu, bổ sung tạm tính, xác nhận/duyệt, giữ nguồn sau áp dụng và tải lại; luồng sản xuất/đối soát vẫn đạt.
- Test `review tables` trong `production-dossier-purchasing.test.cjs`: tính giờ/chi phí và giấu dữ liệu giá theo quyền đạt; fixture nhân sự chuyển sang luồng đã duyệt.
- Build, kiểm tra cú pháp và whitespace đạt.

- `production-norm-review-browser.cjs`: bảng rà soát hiển thị lượng báo giá, định mức điện/thời gian và phiên bản; điền phần thiếu và mobile đạt.
- Bài kiểm tra rộng `production-review-sections-browser.cjs` còn dùng ô số đề nghị mua/nút chọn vật tư của giao diện cũ; không tính bài này là đạt. Kịch bản định mức riêng và luồng xác nhận/duyệt nêu trên đã kiểm tra đạt.
