# Nút chèn biến và hàm theo từng ô công thức

Nguồn: ảnh demo “Sửa công thức nhóm”, khách khoanh các bộ nút biến, phép tính và hàm dưới ô khối lượng/diện tích; yêu cầu tham khảo cách đưa cấu trúc vào công thức tính toán.

- Sáu ô công thức có bộ công cụ riêng ngay bên dưới, mở khi chọn ô và có thể thu gọn.
- Nút biến ghi ký hiệu, tên và đơn vị; lấy theo các thông số đã khai. Kết quả L0/W0 và định mức KL_DV/DT_DV tách khỏi đầu vào, chỉ hiện ở công thức phôi nơi có thể sử dụng.
- Nút luôn chèn vào ô sở hữu nó, giữ vị trí con trỏ/vùng chọn của ô đó ngay cả khi vừa tập trung vào ô khác. Hàm bọc phần đang chọn, hoặc đặt con trỏ vào trong ngoặc để nhập đối số.
- Có phép toán, so sánh, dấu thập phân, các hệ số 100/1000/1000000 và toàn bộ 21 hàm hiện được bộ tính hỗ trợ. Tên giải thích hàm hiện khi trỏ chuột lên nút.
- Dùng nguyên bộ tính và kiểm đơn vị hiện hành; số lượng vẫn nhân ngoài công thức một chi tiết đúng một lần. Đây là tham khảo bộ công cụ nhập, không chuyển công thức sang mô hình nhóm của demo.

Kiểm 18 nhóm trình duyệt cục bộ: chèn sai mục tiêu, con trỏ/vùng chọn, dựng công thức bằng nút, liên kết thông số, thay số/kết quả, thép hình và tấm, mã vật tư vào báo giá, lưu/mở lại và giữ phiên bản báo giá. Bằng chứng: artifacts/customer-review/formula-buttons-2026-09-15/. Kiểm bản triển khai bằng đối chiếu toàn bộ HTML rồi chạy lại trên web trong trình duyệt thử riêng.
