# Sửa quyền cập nhật đơn giá nguyên công — 29/09/2026

## Xác minh trên dữ liệu hiện tại
Bản sao chỉ đọc của production: BG-20260922-002 phiên bản 48 vẫn giữ weld/Hàn lắp 35.000 đ/m; danh mục hiện tại Chấn 2.000 đ/kg; lượng kỹ thuật khai kg.
Thảo có materials=configure, operations=view. Bản sửa trước yêu cầu operations cho cập nhật đơn giá, vì thế người phụ trách giá vẫn không thực hiện được.

## Sửa
- Tách inside/outside/unit/insideUnit/outsideUnit của ratesSnapshot khỏi cấu trúc nguyên công khi kiểm tra quyền.
- Cho phép quyền khai báo giá (materials) cập nhật cặp giá cơ sở và đơn vị. Giữ tương thích người đã có quyền operations. Không cấp quyền sửa định mức, công việc, tên hay hệ số kỹ thuật.
- Nút Cập nhật giá đúng đơn vị nhận đúng quyền. Nút Lấy bảng mới từ danh mục tại cột có lệch đơn vị mở cùng bảng đối chiếu, chỉ cập nhật nguyên công đó.
- Thông báo giao diện phân biệt quyền cập nhật giá và quyền sửa kỹ thuật.
- Không sửa trực tiếp đơn giá production, không tự đổi đơn vị hay cấp thêm quyền tài khoản.

## Kiểm tra
13/13 bài core/API về đơn vị, lưu nháp, chặn xác nhận giá sai đơn vị và bảo vệ phần dữ liệu ngoài quyền đạt.
Browser bằng tài khoản chỉ có quyền giá: xem trước cặp đơn giá, mô phỏng mất kết nối, giữ nội dung, thử lưu lại, mở lại thành công.
Bản sao DB thật với đúng quyền Thảo: cả nút cập nhật và đường Lấy bảng mới từ danh mục đều lưu/mở lại được, cảnh báo lệch đơn vị hết, nguyên công và dấu xác nhận kỹ thuật giữ nguyên.

## Triển khai
Runtime ca26694. Sau cập nhật trang, Thảo mở mục 6 → Nguyên công → Cập nhật giá đúng đơn vị; đối chiếu giá, nhập lý do nếu được yêu cầu rồi Áp dụng, lưu và tính lại.
Cảnh báo trên bản thật chỉ hết sau khi người phụ trách áp dụng cặp giá mới; không coi việc triển khai mã là đã sửa dữ liệu báo giá.
