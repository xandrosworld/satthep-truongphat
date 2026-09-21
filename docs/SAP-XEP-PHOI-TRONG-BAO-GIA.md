# Hình dạng và sắp xếp phôi — 21/09/2026

## Luồng sử dụng

1. Danh mục quy ước → Hình dạng & công thức: khai đầu vào, kích thước khai triển và công thức diện tích/khối lượng. Cột kích thước chỉ hiện các đầu ra đã khai. Tấm tròn hiện D0, không hiện thêm hai kích thước khổ bao L0/W0. Quy ước cũ có hai khổ bao cùng D và công thức diện tích tròn cũng được hiển thị là D0, không sửa dữ liệu cũ.
2. Báo giá → Khai triển & hao hụt → **Sắp xếp phôi**: chọn nhóm vật tư, cách xoay/giữ hướng/ghép tam giác vuông/xếp tròn. Cách xếp lưu riêng trong báo giá; không sửa công thức danh mục hoặc các báo giá khác.
3. **Xoay / sắp xếp phôi** hiện ngay trên từng nhóm ở sơ đồ. Bấm **Lấy gợi ý để chỉnh**, chọn phôi trên hình rồi kéo để di chuyển; có thể đổi tấm, nhập vị trí X/Y, xoay 90°/180° hoặc nhập góc xoay riêng. Xem sơ đồ và tỷ lệ hao hụt trước khi Lưu cách xếp. Có thể bỏ lựa chọn riêng để quay lại cách xếp đã có.
4. Muốn dùng tỷ lệ gợi ý vào giá dự tính: mở **Chọn cách / %**, kiểm sơ đồ rồi chọn **Dùng %**, sau đó Áp dụng và tính lại. Sắp xếp tổ hợp mua và hao hụt dự tính vẫn là hai lựa chọn riêng.
5. Bấm **Lưu máy chủ** để chia sẻ thay đổi cho đồng nghiệp theo cơ chế báo giá hiện có.

## Kiểm tra và giới hạn

- Kiểm tra đủ phôi/không lặp, nằm trong khổ, không chồng nhau và giữ khoảng cách mạch cắt. Tọa độ hợp lệ mới cho lưu. Số khổ liên tục, không cho tấm rỗng giữa các số thứ tự.
- Thay số lượng, kích thước, diện tích, khổ hoặc mạch cắt làm phương án đã lưu hết hiệu lực; cần lập lại hoặc bỏ lựa chọn riêng. Không âm thầm áp vị trí cũ.
- Chỉnh tay tối đa 500 phôi mỗi nhóm; tự động theo giới hạn hiện có. Tấm tròn kiểm tra khoảng cách theo đường kính thực. Chỉnh tay đa giác kiểm tra phần hình thực, cho phép các khổ bao giao nhau nếu phôi không chồng nhau. Tam giác vuông khai bằng ba cạnh được nhận dạng và ghép cặp, kể cả khi đổi thứ tự cạnh.
- Phần dư chỉnh tay chỉ cho chọn những vùng chữ nhật chắc chắn không đè lên phôi/khe cắt. Không tự ghi phần dư cong vào kho hoặc trừ giá. Thay sơ đồ làm các lựa chọn phần dư cũ cần được đối chiếu lại.
- Gợi ý tự động so sánh các cách xếp hiện có; không cam kết đạt tổ hợp ít vật tư nhất cho mọi hình. Chỉnh tay hỗ trợ tối đa 500 phôi mỗi nhóm.
- Quyền sửa thuộc Cấu thành, kích thước và hao hụt; tài khoản kỹ thuật được lưu phương án mà không thấy giá. Công thức và dữ liệu danh mục giữ nguyên.

## Kiểm chứng

- `tests/nesting-plan.test.cjs`: ký hiệu, phiên bản, vị trí, mạch cắt, hao hụt, phân quyền và dữ liệu kỹ thuật.
- `tests/server.test.cjs`: lưu/đọc phương án báo giá trên API và từ chối trùng dòng.
- `tests/nesting-flow-browser.cjs`: thao tác danh mục, thay cách xếp, chỉnh tọa độ, lỗi chồng phôi, lưu/mở lại, phát hiện phương án cũ, bỏ lựa chọn và màn hình hẹp.
- Hồi quy mẫu hình thang/thoi, tấm tròn và ghép tam giác qua các bài thử trình duyệt hiện có.

## Khai cạnh và góc giữa hai cạnh

- Tam giác: ba cạnh, không bắt khai góc.
- Tứ giác: bốn cạnh và một góc giữa hai cạnh liên tiếp. Có thể nhập góc thứ hai để kiểm tra; nếu không khớp thì báo rõ góc tính được. Không coi hai góc bất kỳ là hai thông số độc lập bắt buộc.
- Đa giác n cạnh: n−3 góc giữa các cạnh liên tiếp, các góc còn lại tính để khép hình. Nếu có hai hình hợp lệ, người dùng chọn hình phù hợp trong bản xem trước. Chấp nhận hình lõm hợp lệ, không chấp nhận hình tự giao.
- Cách khai mới có ở dòng báo giá và Danh mục quy ước. Bản cũ dùng góc hướng vẫn giữ nguyên; mở sửa dòng sẽ lấy chiều dài và góc từ hình thực, không dùng góc hướng làm góc trong.

## Hao hụt và số tiền

- Hao hụt = phần còn lại / (phôi + phần còn lại) × 100%. Phần còn lại gồm khe cắt và phần chưa chọn tận dụng.
- Phần được chọn tận dụng trừ khỏi cả phần dư và lượng mua để tính tỷ lệ. Phần dư chưa được chọn không tự coi là đã giữ lại.
- Vật tư dự tính = phôi / (1 − hao hụt / 100), nhận từ 0 đến dưới 100%.
- Dữ liệu cũ không có `materialEstimate.basis` tiếp tục tính theo tỷ lệ bổ sung cũ. Khi mở khai lại, tỷ lệ được đổi tương đương để giữ số tiền; chỉ sau khi bấm áp dụng mới lưu `basis: consumed`.
- Phần dư hình cong hoặc đa giác nằm trong khổ bao chưa tự tạo thành phần tận dụng có thể chọn; chỉ những vùng chữ nhật chắc chắn trống được cho chọn. Sau khi đổi sơ đồ cần kiểm tra lại phần tận dụng.
- Bài kiểm tra bổ sung: `tests/polygon-layout-feedback.test.cjs`, `tests/polygon-layout-feedback-browser.cjs`. Kiểm tra ba đến mười cạnh, hình lõm, ghép cặp, mạch cắt, kéo/xoay, lưu mở lại và tiền vật tư sau tận dụng.
