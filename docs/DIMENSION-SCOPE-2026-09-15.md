# Phân biệt cấp kích thước và tăng tương phản ô nhập

Ngày 15/09/2026.

Ô kích thước sản phẩm hiển thị Dài/Rộng/Cao/Dày SP và đúng biến PRODUCT_L/W/H/T. Hộp liên kết, biến thể và chọn nguồn dùng cùng nhãn. Dữ liệu params và công thức cũ được giữ nguyên.

Hộp công thức ghi rõ cấp đang cấu hình. Bảng biến hiển thị loại đối tượng, tên, giá trị và đơn vị nguồn; có nút chèn PARENT/SELF/tổ tiên bên cạnh các nút PRODUCT. Quy cách cố định lấy giá trị từ mã vật tư. PRODUCT là sản phẩm chứa dòng; PARENT là cha trực tiếp, có thể là cấu kiện hoặc sản phẩm; SELF là dòng hiện tại. Không tạo ký hiệu mới không được bộ tính hỗ trợ.

Ô nhập nền trắng, chữ tối, viền rõ trên nền xanh xám; ô chỉ đọc hoặc không áp dụng có nền xám và viền nét đứt. Giữ phân cấp nền sản phẩm đậm hơn cấu kiện và vật tư.

Kiểm chứng: 28 kiểm tra công thức/Dày; 4 nhóm luồng mới và 4 nhóm hồi quy kích thước sản phẩm. Ví dụ sản phẩm L=2000, cấu kiện L=700: vật tư dùng PRODUCT_L - PARENT_L = 1300; đổi cấu kiện L=800 cho 1200 và giữ sau F5. Kiểm tra chặn vòng lặp, nhập tay, màn hình hẹp, tương phản viền ô sản phẩm trên 3:1 và chữ trên 4.5:1. Chứng cứ: artifacts/customer-review/dimension-scope-2026-09-15. Chưa thay thế nghiệm thu khách hàng.
