# Định mức kiểm soát sản xuất — 12 nhóm

Bổ sung theo ảnh khách ngày 28/09/2026. Mục Định mức giữ dữ liệu cũ, giá ca máy và các bảng đối chiếu mua hàng. Đề nghị công việc đã có 14 loại trong hai nhóm theo ảnh; kiểm tra lại bằng `work-requests-browser` đạt, không tạo thêm module trùng.

## Phạm vi và nguồn đối chiếu

| Nhóm | Khai chuẩn | Nguồn đối chiếu hiện có |
|---|---|---|
| 01 Vật tư | Mã, lượng/đơn vị sản phẩm, khổ nếu có | Nhu cầu lệnh, phôi đã cấp; kg tiêu hao gồm phế khi cân bằng đối soát |
| 02 Phôi & nesting | Mã, khổ, số phôi/đơn vị sản phẩm | Phương án phôi trong nhu cầu/mua và phôi đã cấp cùng khổ; không tuyên bố tối ưu cắt |
| 03 Hao hụt | % phế tối đa / kg đầu vào | Khối lượng phế / đầu vào đã cân bằng |
| 04 Tàn/phế | % tận dụng thu hồi tối thiểu / kg đầu vào | Khối lượng phần tận dụng / đầu vào đã cân bằng; phế theo nhóm 03 |
| 05 Công đoạn | Chuỗi mã nguyên công theo thứ tự, cho lặp bước | Toàn chuỗi nguyên công của hồ sơ lệnh; không tự sửa tiến trình |
| 06 Thời gian | Giờ/đơn vị sản lượng, nguyên công, máy tùy chọn | Giờ trong ca đã duyệt đến bàn giao, trừ chờ hợp lệ, so chuẩn × sản lượng công đoạn |
| 07 Năng suất | Đơn vị sản lượng/giờ, nguyên công, máy tùy chọn | Sản lượng công đoạn / giờ trong ca đã duyệt đến bàn giao |
| 08 Nhân công | Giờ công/đơn vị, nguyên công, máy tùy chọn | Lưu căn cứ; chưa có nguồn tổng giờ từng người nên chưa kết luận thực tế |
| 09 Máy | Giờ máy/đơn vị, nguyên công, máy tùy chọn | Lưu căn cứ; chưa có số đo giờ máy thực tế |
| 10 Tiêu hao | Lượng/đơn vị: điện, khí, vật tư phụ…; mã vật tư nếu có | Vật tư có mã tiếp tục nối đối chiếu nhu cầu/mua; số đo điện/khí và tiêu hao riêng chưa tự suy |
| 11 Chất lượng | % không đạt tối đa / sản phẩm kiểm tra | QC cuối lệnh đang ghi nhận; không phải tỷ lệ lỗi/làm lại lũy kế |
| 12 Giá thành | đ hoặc VND/đơn vị sản phẩm | Chứng từ chi phí đã gắn lệnh; luôn ghi chưa xác nhận đủ giá thành |

Định mức cần tên sản phẩm áp dụng, nguồn nhà sản xuất hoặc thực tế sản xuất và tài liệu/cách xác định. Tỷ lệ nhận 0–100%; lượng khác phải dương. Mã nguyên công/máy kiểm tra tại máy chủ. Có phiên bản, người cập nhật, lịch sử, ngừng dùng. Không tự tạo số chuẩn hoặc áp hồi tố vào báo giá/lệnh đã chốt.

Bảng Đối chiếu thực tế lấy định mức hiện hành khớp đúng tên sản phẩm; kiểm đơn vị và phạm vi nguyên công/máy/khổ. Tham chiếu tấm/thanh thiếu khổ không được so như cùng phôi. Có mức chuẩn, số đã ghi nhận, chênh lệch, nguồn và trạng thái trong/ngoài định mức, đang ghi nhận hoặc thiếu căn cứ. Lệnh chưa hoàn tất không kết luận tiêu hao cuối; thời gian/năng suất chỉ kết luận công đoạn khi bàn giao và đủ ngày công. Phôi đã cấp chưa trừ hoàn dư và tổng chi phí đã ghi nhận luôn là số đang ghi nhận. Chưa có căn cứ không tự điền 0 hoặc ghi tiết kiệm.

Năng suất hiện là năng suất công đoạn trong khoảng làm việc của người phụ trách, chưa đánh giá KPI, năng suất từng người hoặc thời gian máy chạy. Nhiều công đoạn cùng mã được đối chiếu riêng, không gom sai phạm vi. Trình tự nhóm 05 kiểm cả chuỗi nguyên công trong lệnh, gồm bước lặp; đây là so hồ sơ, không xác nhận các bước đã thực hiện.

Quyền dùng nền tảng cũ: sửa theo workshop.edit; xem theo quyền sản xuất/xưởng/mua. Giá thành chỉ trả cho người có quyền chi phí; lịch sử tài chính cũng được lọc. Đề nghị mua giữ ảnh chụp căn cứ tại lúc gửi, độc lập với sửa tham chiếu sau đó.

## Kiểm tra

- 10 ca API/core định mức và operations-erp đạt; thêm 2 ca hồi quy đề nghị bộ phận/cấp kho/sửa chữa đạt.
- 3 browser đạt: reference-norms, reference-norm-groups, work-requests. Có đủ 12 form, lưu/tải lại, 0%, chuỗi bước lặp, lịch sử, bảng đối chiếu một lệnh qua luồng phát hành thật trên dữ liệu thử, điện thoại; hồi quy 14 loại đề nghị.
- Kiểm tra quyền giới hạn: giá thành và lịch sử tài chính không lộ; số đối chiếu kỹ thuật vẫn trả đúng. Sai đơn vị/khổ, thiếu ngày công/đối soát/QC không được coi là đạt.
- Trạng thái triển khai ghi tại README-CHECKLIST-GD2.md sau xác minh web thật. Kiểm thử ghi dùng dữ liệu riêng, không thay nghiệm thu khách.
