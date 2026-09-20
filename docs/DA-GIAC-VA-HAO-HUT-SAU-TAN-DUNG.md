# Đa giác và hao hụt sau tận dụng — 20/09/2026

## Khai hình dạng

Trong Công thức tổng hợp, mở **Khai tấm đa giác theo số cạnh**, chọn cách khai và số cạnh, bấm **Tạo các cạnh và công thức**, rồi nhập số thử trong bảng thông số.

- Tam giác: C1, C2, C3 là ba cạnh, C01, C02, C03 là cạnh khai triển. Mẫu 300–400–500 mm có diện tích 0,06 m²; thép 2 mm, 7.850 kg/m³ có khối lượng 0,942 kg/phôi. Tự kiểm bất đẳng thức tam giác, tính tọa độ/chiều cao và khổ bao.
- Đa giác đều: 3–10 cạnh, nhập chiều dài các cạnh bằng nhau. Ví dụ lục giác cạnh 300 mm có diện tích khoảng 0,233826859 m².
- Đa giác bất kỳ: 3–10 cạnh, khai C1…Cn và góc hướng G1…Gn theo thứ tự quanh biên. Góc hướng đo từ trục ngang, ngược chiều kim đồng hồ; 0° sang phải, 90° lên trên, 180° sang trái, 270° xuống dưới. Đây là góc hướng cạnh, không phải góc trong tại đỉnh. Hỗ trợ biên lõm đơn, không có lỗ. Biên phải khép kín, không tự giao/chạm cạnh khác hoặc gập cạnh ngược lên nhau.

Mẫu đa giác lõm 6 cạnh: C = [400, 200, 200, 200, 200, 400] mm; G = [0, 90, 180, 90, 180, 270] độ; diện tích 0,12 m².

Số cạnh được lưu theo quy ước; kích thước có thể khai cố định tại mã hoặc nhập tại báo giá. Công thức cạnh khai triển có thể đổi, ví dụ C01 = C1 + 10. Đổi ký hiệu cập nhật liên kết biên dạng. Dài/rộng bao và diện tích đa giác là kết quả hình học, có trong bộ công cụ công thức.

Sơ đồ thể hiện biên thật; xếp theo các khổ chữ nhật bao ngoài, được xoay theo lựa chọn của báo giá. Chưa ghép sát/tối ưu biên đa giác. Chỉ các phần chữ nhật trống ngoài khổ bao được chọn tận dụng; phần dư nằm trong khổ bao vẫn nằm trong khối lượng còn lại. Không có AI/API hay nhập STEP trong thay đổi này.

## Hao hụt

Khối lượng còn lại = khối lượng mua − khối lượng phôi thực − khối lượng dư đã chọn tận dụng.

Hao hụt gợi ý trên phôi = khối lượng còn lại / khối lượng phôi × 100%. Tỷ lệ trên lượng mua hiển thị riêng. Không suy ra mọi phần dư đều có thể tận dụng. Chọn/bỏ phần dư cập nhật gợi ý, chưa đổi tỷ lệ đã lưu. Bấm **Khai % hao hụt theo gợi ý**, **Dùng %**, rồi **Áp dụng và tính lại** để áp dụng cho các dòng tương thích trong nhóm; không nhân số lượng hoặc trừ tận dụng thêm lần nữa. Giới hạn tỷ lệ dự tính 0–100% hiện hành được giữ; nếu gợi ý cao hơn, hiển thị để đối chiếu và yêu cầu kiểm tra phương án trước khi áp dụng.

## Kiểm tra

- 579 kiểm thử hiện có và bổ sung hình học/hao hụt đã đạt trên bản dựng sạch; thêm một ca API đa giác đã đạt (580 tổng).
- API kiểm lưu/đọc danh mục, báo giá, sửa kích thước với quyền chỉ dùng công thức; không cho đổi liên kết biên đa giác khi thiếu quyền sửa.
- Trình duyệt kiểm khai/lưu/mở lại, tam giác ba cạnh, đa giác đều, biên chưa kín, sơ đồ đúng hình, chọn phần dư và áp dụng hao hụt, màn hình hẹp; kiểm hồi quy khai triển, sắp phôi và bộ công cụ công thức chung.
- Bằng chứng: artifacts/customer-review/polygon/.
