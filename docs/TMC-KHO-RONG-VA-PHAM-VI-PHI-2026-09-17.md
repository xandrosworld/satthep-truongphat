# TMC: khổ rộng, đơn vị nhân công và phạm vi khoản phí

Phản hồi khách ngày 17/09/2026: nhân công thang máng cáp tra giá theo khổ rộng; thang/máng tính theo mét dài, phụ kiện theo cái. Bảng TMC thuộc “Bảng hệ số giá”, mục con của “Nguyên công & hệ số”, không là tab cấp cao của “Đơn giá đầu vào”. Ảnh phản hồi cũng yêu cầu chọn nhóm sản phẩm chịu phí vận chuyển/lắp đặt để tránh cộng lại khoản đã có trong giá TMC.

- Bộ tính TMC tiếp tục tra bậc bằng khổ rộng mm. Lượng nhân công là chiều dài mm / 1000 × số lượng cho bảng đơn vị m, hoặc số lượng cho bảng đơn vị cái. Bảng mặc định chỉ để thang và máng theo m; nắp và phụ kiện theo cái. Đơn giá nhân công TMC thay tiền công tại xưởng đã đánh dấu; vật tư, thuê ngoài và hoàn thiện giữ cách tính riêng.
- Bảng chung TMC chuyển vào mục con của Nguyên công & hệ số. Form khai mới chỉ đưa ra m và cái; các đơn vị mở rộng trong dữ liệu cũ không bị tự sửa. Bản giá của báo giá đã lưu chỉ đổi khi người dùng chủ động lấy bảng chung.
- Khoản vận chuyển/lắp đặt trong báo giá có phạm vi “Chọn nhóm sản phẩm”. Chỉ những sản phẩm thuộc nhóm đã chọn nhận chi phí; nhóm không có sản phẩm thì báo lỗi. Mục chọn sản phẩm/mã vật tư/tuyến có từ trước vẫn hoạt động.
- Các ô chi phí tổng trong Giá & hệ số vẫn áp toàn đơn. Màn hình khai phí nhắc không nhập trùng khoản đã nằm trong giá TMC; để chỉ tính cho Cơ khí khác, tạo khoản chi theo nhóm Cơ khí khác.

Không thay đơn giá số từ ảnh thành giá kinh doanh mặc định. Bậc giá cụ thể và khoản nào thực sự đã gồm trong giá TMC cần khách xác nhận trên một đơn thật trước nghiệm thu.

Danh mục đã lưu trên máy chủ và bản giá lưu trong báo giá không tự đổi đơn vị. Nếu bảng Nắp thang / máng cũ đang là đ/m, người quản trị cần kiểm tra và sửa thành đ/cái trong danh mục, rồi chủ động lấy bảng chung vào báo giá nháp phù hợp; không sửa ngầm các đơn đã lập.
