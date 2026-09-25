# Rà soát chuẩn bị sản xuất — 25/09/2026

## Thay đổi
- Màn hình phát hành lệnh có bảng theo sản phẩm: số lượng đơn hàng, đã lập lệnh, còn lại, mã lệnh và trạng thái liên quan.
- Mỗi lệnh hiện theo một sản phẩm và số lượng lô; một đơn hàng được chia nhiều lệnh. Chỉ chọn sản phẩm còn số lượng, giới hạn số lượng nhập theo phần còn lại. Máy chủ tiếp tục kiểm tra trong giao dịch để chống tạo vượt khi nhiều người thao tác.
- Hồ sơ chuẩn bị hiển thị bảng chi tiết sản phẩm/cấu kiện/vật tư, kích thước, số lượng của lô và khổ khai triển. Các công đoạn đặt tại đúng đối tượng thực hiện; chọn thiết bị và phương pháp ngay tại dòng.
- Định mức kỹ thuật và lượng công việc hiển thị theo hồ sơ lệnh; thay đổi công nghệ qua luồng đề nghị và phê duyệt hiện có.
- Bảng tổng hợp nhóm các dòng cùng mã, quy cách, khổ khai triển và nguồn cấp. Không gộp khác độ dày, mác hay khổ.
- Đối chiếu kho hiển thị nhu cầu tấm/thanh/vật tư, phần đã giữ/cấp, phôi khả dụng phù hợp và phần thiếu. Nút mở đúng lệnh ở Kho/mua hàng để giữ phôi hoặc đề xuất mua chia đợt/gom lệnh.
- Dữ liệu giá không đưa vào các bảng chuẩn bị. Nguồn báo giá/đơn hàng không bị thay đổi khi lập lệnh hoặc chuẩn bị sản xuất.
- Form hồ sơ chặn gửi lặp trong lúc lưu; tách sự kiện khỏi form điều hành chung.

## Kiểm chứng
- Toàn bộ 760 kiểm thử hiện có qua; thêm 2 kiểm thử nhóm khổ và nhân số lượng cây chi tiết qua.
- Bổ sung kiểm thử API liên kết lệnh và tổng đã lập, so sánh nguồn trước/sau khi chia lệnh.
- production-browser: phát hành, chuẩn bị, xung đột phiên bản, giữ kho, công đoạn, QC, hoàn thành, tải lại qua.
- production-dossier-browser: bản vẽ, rà soát thiết bị, liên kết các lệnh, chặn số lượng vượt, mua gom lệnh qua; kiểm tra không tràn khung ở 390/768/1440 px.
- Quan sát ảnh hai bảng mới; công đoạn mặc định thu gọn, biểu mẫu mở tại từng dòng. Bảng rộng cuộn ngang trên điện thoại.
- Không tạo dữ liệu thử trên hệ thống thật.

## Điểm cần người dùng rà nghiệp vụ
Chọn một đơn hàng thực tế, lập từng lô và đối chiếu số lượng còn lại; kỹ sư rà chi tiết/công đoạn và chọn phôi theo kho thực tế. Nhu cầu giữ kho tuân theo phương án cắt của lô, không lấy số chi tiết làm số tấm cần cấp.
