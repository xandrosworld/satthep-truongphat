# Rà soát Excel khai báo cũ

Vào **Danh mục quy ước** hoặc **Danh mục vật tư → Rà soát Excel cũ**, chọn file `.xlsx`, rồi bấm **Đọc và xem trước**. Tài khoản cần quyền danh mục vật tư/quy ước hoặc quyền quản trị. Nếu chưa mở danh mục, chọn **Danh mục dùng chung** từ trang báo giá trước.

Sheet nguồn cần các cột `ID`, `Ma_BG`, `Thong_so_cau_kien`, `Vat_lieu`, `Kieu_dang`. Giới hạn 10 MB, 5.000 dòng khai báo và 30 MB dữ liệu giải nén. Không nhận bảng giá Excel tùy ý hoặc macro.

- Tìm theo ID, mã báo giá, tên hay vật liệu; lọc thông tin thiếu, dòng TMC và tên sản phẩm trống.
- Bấm **Đối chiếu** để xem giá trị gốc, giá trị chuẩn hóa và lý do cần kiểm tra.
- Tải Excel hoặc JSON để tiếp tục rà soát. Cả hai gồm mọi dòng, không chỉ các dòng đang lọc. Excel không chứa công thức thực thi; JSON giữ thêm biểu thức nguồn để truy vết. Công thức dùng chung được ghi kèm ô định nghĩa, không tự dịch tham chiếu hoặc tính lại.

“Đủ thông tin nhận diện” chỉ có nghĩa là đã có ID, mã báo giá, loại cấu kiện, vật liệu và hình dạng. Đây chưa phải dữ liệu đã được duyệt nhập hoặc xác nhận tính đúng.

ID nguồn và nhóm đối chiếu không được dùng làm mã vật tư mới. Dòng TMC giữ nguyên dạng gộp; không tự bóc vật tư con. Ô trống giữ trống; tên sản phẩm không được tự điền theo dòng trước. Nguyên công và mức độ phức tạp giữ khai báo nguồn, chưa tự ánh xạ sang định mức/hệ số mới.

Tỷ lệ hao hụt/vật tư phụ gốc được giữ nguyên; cột phần trăm riêng nhân 100 một lần với giá trị trong khoảng 0–1. Dữ liệu khác khoảng này cần xác nhận đơn vị. Cột công thức, lỗi Excel và kết quả tính lưu sẵn không được dùng làm đầu vào tính giá.

**Bước này chỉ rà soát trong trình duyệt, chưa ghi dữ liệu lên máy chủ.** Để nhập danh mục/báo giá cần chốt mã và ánh xạ, cơ sở tính TMC, đơn vị và quan hệ sản phẩm–cấu kiện. Phần tính toán mất liên kết cần workbook công thức gốc đầy đủ.
