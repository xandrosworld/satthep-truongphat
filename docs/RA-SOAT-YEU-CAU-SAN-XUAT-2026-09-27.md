# Đối chiếu lại yêu cầu sản xuất — 27/09/2026

Đối chiếu mã nguồn, kiểm thử nghiệp vụ và bản đã triển khai; không dùng số lượng test để thay thế nghiệm thu.

| Yêu cầu khách | Kết quả và phạm vi thực tế |
|---|---|
| Dùng thông số và chức năng mục 1–4 báo giá | Dùng lại renderIntake, renderBOM, renderOperationMatrix, renderWaste trong không gian riêng. Thêm cấu kiện/vật tư, thông số/liên kết/công thức, nguyên công, khai triển và phương án cắt được gửi qua projection/merge kỹ thuật. Sản phẩm và số lượng lệnh gốc không đổi; thay phạm vi qua chia lô. Không sửa danh mục dùng chung hoặc khách hàng từ hồ sơ lệnh. |
| Bổ sung bản vẽ đầu vào | Bản vẽ gốc và bản vẽ sản xuất riêng; phiên bản, người bổ sung, nhóm tài liệu và tải tệp. Bản vẽ mới làm mất hiệu lực xác nhận đầu vào. |
| Sửa rồi gom kiến nghị, chưa cập nhật ngay | Nháp riêng theo người/lệnh; gửi vào bảng kiến nghị. Lệnh/đơn hàng/báo giá nguồn không đổi trước duyệt. Ba bộ phận phải xác nhận cùng phạm vi. |
| Duyệt toàn bộ hoặc một phần | Mục độc lập có chọn/bỏ chọn; phần không duyệt giữ nguyên. Thêm/bỏ/di chuyển cấu thành hoặc đổi danh sách/thứ tự công đoạn phải duyệt đồng bộ nhóm liên quan, không duyệt tổ hợp sai cấu trúc. |
| Chọn máy ở báo giá và sản xuất | Danh mục nguyên công có máy mặc định; từng nguyên công chọn máy/phương pháp; xưởng điều chỉnh qua kiến nghị, kiểm tra máy còn hoạt động. |
| Vật tư sau xác nhận, phôi đáp ứng, thiếu và mua | Chặn triển khai khi chưa đủ rà soát. Đối chiếu mã vật tư, kích thước khai triển, chiều dày, mạch cắt và tồn khả dụng; giữ phôi/đề nghị mua. Hàng giữ cho lệnh khác không tính khả dụng. |
| Sắp phôi | Xếp trên các khổ thực tế; phần thiếu tính theo khổ mua. Biên dạng không chữ nhật dùng khung bao bảo thủ; không phải tối ưu nesting biên dạng tự do toàn cục. |
| Quy trình sản xuất theo mẫu tham khảo | Bảng bước thực tế của lệnh, người, máy, sản lượng, hạn, vướng mắc; 8 bước là chuỗi tham khảo. QC và hoàn thành là kiểm soát riêng, không tự tạo 8 công đoạn bắt buộc cho mọi sản phẩm. |
| Kỹ thuật, kinh doanh/khách hàng, giá rồi duyệt | Quyền và dấu xác nhận riêng. Giá vật tư/nguyên công có cập nhật, so sánh chi phí; công đoạn mới/đổi đơn vị cần khai giá. Thay giá làm mất xác nhận kinh doanh. Không có quyền không nhận dữ liệu chi phí. |

## Phát hiện và sửa trong lần rà lại

- Bảng nhanh còn cho nhập số lượng sản phẩm gốc trong khi API từ chối: khóa ngay ô nhập và bảo vệ các thao tác thay sản phẩm/phạm vi trước khi ghi nháp.
- Form kỹ thuật riêng chưa chạy khởi tạo viewer giống render chính: bổ sung setup3d khi mở cấu thành và cập nhật tên tấm.
- Sau tải bản vẽ, đọc lại phiên bản bằng một GET riêng có thể vô tình nhận phiên bản do người khác vừa cập nhật: dùng đúng jobVersion của giao dịch tải bản vẽ; thay đổi đồng thời tiếp tục bị chặn xung đột.

## Bằng chứng kiểm tra lại

- 18 ca API/core: kiến nghị, giá, duyệt từng phần, quy trình, hồ sơ/bản vẽ, vật tư và nesting đạt.
- Browser editor: bốn tab, tải bản vẽ, sửa ô kích thước, nhập khai triển tay, lưu/khôi phục nháp, gửi kiến nghị; số lượng gốc bị khóa; thay đổi từ nhân sự khác khiến gửi bản cũ bị từ chối và không sinh thêm đề nghị. Báo giá đang mở không bị ghi đè.
- Các giới hạn ở bảng là hành vi hiện có; chưa có căn cứ gọi đó là nghiệm thu 100% hoặc nesting tối ưu cho mọi biên dạng.

## Triển khai

Bản `f026f39` đã lên máy chủ sau sao lưu mã nguồn và SQLite. Container healthy, health HTTPS OK; 23 hash runtime khớp gói phát hành và HTML công khai có sửa đổi. Không tạo dữ liệu thử trong cơ sở dữ liệu khách.
