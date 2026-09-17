# Vật tư phụ và khối lượng/diện tích xử lý ngoài

## Khai triển và hao hụt

Cột **Vật tư phụ (%)** dùng chung `auxiliaryPercent` với bảng cấu thành. Bấm tỷ lệ tại dòng phôi để sửa; tại cấp cha, **Khai theo dòng** mở tỷ lệ riêng của các dòng phôi bên dưới. Không cộng các tỷ lệ phần trăm thành tỷ lệ cấp cha.

Giá trị phụ được tính theo cơ sở phôi của phương án đang chọn và đơn giá tương ứng. Chỉ cộng giá trị vào chi phí; không cộng khối lượng quy đổi vào kg phôi, kg vật tư dự tính, diện tích hoặc khối lượng vận chuyển. Không khai lại vật tư đã có mã hoặc định mức riêng. Không thay đổi công thức giá hiện có.

## Khối lượng và diện tích

Thêm **KL xử lý ngoài (kg)** và **DT xử lý ngoài (m²)**. Số liệu lấy từ công thức lượng thực hiện (`workWeight`, `workArea`), đã nhân số lượng các cấp. Diện tích xử lý có thể khác diện tích phôi, chẳng hạn xử lý hai mặt tấm.

Quy tắc hiện áp dụng là mỗi đối tượng/phạm vi thuê ngoài tính một lần:

- Một đối tượng có nhiều nguyên công thuê ngoài không bị cộng lặp.
- Khi chỉ một số dòng con thuê ngoài, cấp cha cộng các phạm vi đó.
- Khi cấp cha cũng thuê ngoài, tổng lấy phạm vi cấp cha; các dòng con hiển thị phần tham chiếu. Nếu cấp cha khai công thức lượng riêng thì lấy công thức đó, không tự phân bổ lại xuống con.
- Bao gồm gói thuê trọn và vật tư do bên gia công cấp. Không cộng thêm vào vật tư mua hoặc tự đổi giá gói.
- Thiếu hình học/số lượng trong phạm vi thuê ngoài thì ghi **Cần kiểm tra**, không báo một tổng bằng 0 có vẻ đầy đủ. Không thuê ngoài hiển thị dấu gạch.

Đây là khối lượng/diện tích đối tượng qua xử lý ngoài, không phải cộng tất cả lượng tính công của nhiều nguyên công. Lượng công việc nhập riêng theo kg/m²/lần/gói vẫn giữ tại **Công đoạn & định mức**. Nút **Phạm vi xử lý ngoài** giải thích đối tượng và công đoạn nguồn, không hiển thị giá.

CSV bổ sung hai lượng xử lý ngoài, tỷ lệ vật tư phụ, phạm vi và nội dung cần kiểm tra.

## Kiểm tra

- 426 kiểm thử logic/API đạt.
- `tests/outside-measures.test.cjs`: không cộng lặp cha/con hoặc nhiều nguyên công; số lượng nhiều cấp; công thức diện tích riêng; gói thuê bên ngoài cấp vật tư; dữ liệu thiếu; cùng kết quả khi chiếu dữ liệu cho kỹ thuật; lượng công tính tiền không làm tăng khối lượng đối tượng.
- Kiểm tra % vật tư phụ chỉ tăng chi phí: hình học, vật tư dự tính, vận chuyển và lượng xử lý ngoài giữ nguyên.
- `tests/material-outside-browser.cjs`: sửa tỷ lệ tại bước 4, đồng bộ bước 2, thay phương án xưởng/thuê ngoài qua giao diện, lưu/tải lại, CSV, không lộ giá và màn hình hẹp.
- Các kịch bản `material-estimate-browser.cjs` và `technical-pricing-browser.cjs` đạt.
