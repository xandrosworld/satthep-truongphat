# Giá công việc và bảng giá nhóm — 15/09/2026

Phạm vi: tính giá theo dữ liệu từng dòng, gán nhiều nguyên công, khai bảng giá nhóm dùng chung. Mobile và thay đổi lịch sử phiên bản không thuộc đợt này.

## Thay đổi
- Yếu tố khách hàng lấy tên/mã từ hồ sơ lưu trong báo giá, không lấy danh bạ mới để làm đổi bản cũ.
- Thêm tổng số cấu kiện toàn báo giá: cộng số cấu kiện ở các dòng cấu kiện sau khi nhân số lượng các cấp. Giữ riêng số lượng cấp hiện tại, cấp cha và cấu kiện gần nhất; khi làm ngay tại cấu kiện thì lấy chính cấu kiện đó.
- Chiều dày/quy cách vật tư lấy từ mã vật tư; tham số tổng quát cùng tên không ghi đè quy cách cố định. Cấp tổng chỉ suy ra một kích thước từ vật tư con khi tất cả đều có cùng giá trị. Thiếu hoặc khác giá trị báo rõ yếu tố cần khai.
- Bộ tính vẫn tính từng công việc. Màn Giá & hệ số hiện từng mã/dòng, đường dẫn cấu thành, giá cơ sở, đơn giá thực tế, lượng, thành tiền và giá trị/hệ số từng yếu tố; phân biệt liên kết và nhập riêng.
- Gán nhiều nguyên công cùng lúc, chọn nơi thực hiện và định mức riêng. Không xóa các nguyên công không được tích, không mất đầu vào yếu tố riêng. Chọn cả cha/con chỉ gán cấp được chọn cao nhất.
- Đơn giá đầu vào có Nhóm giá khác và nút thêm nhóm cạnh TMC. Khai tên, công thức tổng trước thuế, tham số có đơn vị và căn cứ. Dùng cho tủ điện/cửa gió/nhóm khác theo khai báo, không tự đặt công thức hay đơn giá.
- Trong báo giá: Giá & hệ số → Cách tính theo nhóm → Cài đặt theo nhóm → Lấy bảng này; sau đó phân nhóm sản phẩm và chọn phương án. Sửa danh mục không tự đổi bảng đã lấy.

## Đối chiếu số
Ca tổng hợp kiểm thử: 2 sản phẩm × 3 cấu kiện × 4 vật tư = 24 chi tiết mỗi dòng; phôi 1.000 × 100 mm, mật độ 7.850 kg/m³.
- T=1 mm: 18,84 kg; giá 1.000 × 1,10 × 0,95 × 1,20 = 1.254 đ/kg; tiền 23.625,36 đ.
- T=2 mm: 37,68 kg; giá 1.000 × 1,20 × 0,95 × 1,20 = 1.368 đ/kg; tiền 51.546,24 đ.
- Nhóm QA: Q × P_RATE; 10 × 12.345 = 123.450 đ. Đổi giá danh mục thành 23.456 không đổi tham số 12.345 đã lấy trong báo giá.
Các số này chỉ là dữ liệu kiểm thử, không phải bảng giá khách hàng.

## Kiểm tra
- 330 kiểm thử logic đạt, gồm 6 ca liên kết mới.
- API danh mục/nhóm/yếu tố: kiểm tra lưu tải lại, chặn bảng sai, không sửa bản đã lưu.
- Trình duyệt: 5 nhóm ca mới; 5 nhóm chọn cách giá; 14 nhóm công thức nhóm và xuất báo giá.
- Có kiểm tra giá kg, m², tấn, gói, thuê ngoài, hệ số riêng, nhập thay thế, thiếu dữ liệu, giữ bản giá cũ.
- Kết quả và ảnh: artifacts/customer-review/operation-linkage-2026-09-15.
- API kiểm tra ở môi trường cục bộ; không xác nhận backend đang triển khai trên Netlify. Không coi kết quả tự kiểm tra là nghiệm thu khách hàng.
