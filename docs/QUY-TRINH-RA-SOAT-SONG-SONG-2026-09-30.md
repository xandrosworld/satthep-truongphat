# Rà soát quy trình và trách nhiệm trưởng phòng

- Chưa giao cá nhân: trưởng phòng của đơn vị nhận việc chịu trách nhiệm xử lý.
- Đã giao nhân viên: nhân viên gửi kết quả, trưởng phòng rà soát trước khi xác nhận chuyển bước. Trưởng phòng có thể trả lại nhân viên để bổ sung.
- Nhóm quyền **Xử lý quy trình** nằm trong bộ quyền gắn với vị trí: xem, gửi trưởng phòng, xác nhận, trả lại, đề xuất điều chỉnh, giao việc. Mô tả bước không cấp quyền. Quyền nghiệp vụ gốc và phạm vi phòng ban vẫn phải đáp ứng.
- Cấu hình phiên bản mới yêu cầu quyền quy trình. Hồ sơ đang chạy giữ phiên bản và quyền xử lý cũ; các thao tác mới trả lại/đề xuất luôn yêu cầu quyền riêng. Không tự cấp thêm quyền cho tài khoản thật.
- Các bước rà soát liền nhau có thể chọn **Rà soát song song với bước trước**. Bước duyệt, thao tác chứng từ gốc giữ riêng; không được ghép vào nhóm rà soát. Chỉ chuyển tiếp sau khi tất cả bước bắt buộc xác nhận.
- Khi trưởng phòng trả lại hồ sơ hoặc chấp nhận đề xuất thay đổi, các xác nhận trong nhóm bị hủy hiệu lực; người đề nghị xử lý và gửi lại. Lịch sử vẫn giữ đầy đủ.
- Đề nghị công việc còn chờ duyệt, bị trả lại trong quy trình có nút **Sửa hồ sơ bị trả lại**. Sửa đúng phiếu cũ, giữ mã và người đề nghị, lưu lịch sử, kiểm tra lại mã vật tư/số lượng/căn cứ. Không sửa chứng từ đã phát sinh xuất kho.
- Đề xuất điều chỉnh lưu nội dung và kết quả rà soát; không tự sửa dữ liệu nghiệp vụ hay tự duyệt chứng từ.
- Cập nhật đồng thời dùng kiểm tra phiên bản; thao tác trên phiên bản cũ bị từ chối, không ghi đè kết quả phòng khác.
- **Chờ khách chốt**: Kỹ thuật, Kho, Vật tư–giá cùng song song hay Kỹ thuật trước rồi hai phòng còn lại song song. Chưa thay cấu hình đang dùng của khách.

## Kiểm tra

- 12 bài kiểm thử API: quyền thao tác, phân công, trưởng phòng xác nhận, rà soát song song khác thứ tự, chặn duyệt sớm, trả lại/sửa/gửi lại, đề xuất được chấp nhận, chống cập nhật trùng và quy trình chứng từ gốc.
- Trình duyệt Edge: cấu hình, phân công, nhân viên gửi trưởng phòng, xác nhận song song, sửa phiếu bị trả lại, tải lại, màn hình di động; vòng đời cấp vật tư/sửa chữa.
- Bộ governance.test.cjs cũ có 7 lỗi ngay khâu tạo tài khoản do fixture chưa khai báo nhân sự được duyệt. Đã đối chiếu lại với governance.cjs tại HEAD trước thay đổi, kết quả giống nhau; không phải lỗi từ thay đổi này.
