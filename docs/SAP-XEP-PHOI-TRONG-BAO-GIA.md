# Hình dạng và sắp xếp phôi — 20/09/2026

## Luồng sử dụng

1. Danh mục quy ước → Hình dạng & công thức: khai đầu vào, kích thước khai triển và công thức diện tích/khối lượng. Cột kích thước chỉ hiện các đầu ra đã khai. Tấm tròn hiện D0, không hiện thêm hai kích thước khổ bao L0/W0. Quy ước cũ có hai khổ bao cùng D và công thức diện tích tròn cũng được hiển thị là D0, không sửa dữ liệu cũ.
2. Báo giá → Khai triển & hao hụt → **Sắp xếp phôi**: chọn nhóm vật tư, cách xoay/giữ hướng/ghép tam giác vuông/xếp tròn. Cách xếp lưu riêng trong báo giá; không sửa công thức danh mục hoặc các báo giá khác.
3. **Lấy gợi ý làm bản chỉnh tay**: sửa số thứ tự tấm/thanh, tọa độ X/Y tính bằng mm, xoay 90°. Xem sơ đồ và tỷ lệ hao hụt trước khi Lưu cách xếp. Có thể bỏ lựa chọn riêng để quay lại cách xếp đã có.
4. Muốn dùng tỷ lệ gợi ý vào giá dự tính: mở **Chọn cách / %**, kiểm sơ đồ rồi chọn **Dùng %**, sau đó Áp dụng và tính lại. Sắp xếp tổ hợp mua và hao hụt dự tính vẫn là hai lựa chọn riêng.
5. Bấm **Lưu máy chủ** để chia sẻ thay đổi cho đồng nghiệp theo cơ chế báo giá hiện có.

## Kiểm tra và giới hạn

- Kiểm tra đủ phôi/không lặp, nằm trong khổ, không chồng nhau và giữ khoảng cách mạch cắt. Tọa độ hợp lệ mới cho lưu. Số khổ liên tục, không cho tấm rỗng giữa các số thứ tự.
- Thay số lượng, kích thước, diện tích, khổ hoặc mạch cắt làm phương án đã lưu hết hiệu lực; cần lập lại hoặc bỏ lựa chọn riêng. Không âm thầm áp vị trí cũ.
- Chỉnh tay tối đa 500 phôi mỗi nhóm; tự động theo giới hạn hiện có. Tấm tròn kiểm tra khoảng cách theo đường kính thực. Chỉnh tay tam giác/hình tự khai dùng khổ bao riêng, chưa điều chỉnh trực tiếp đa giác ghép cạnh.
- Phần dư chỉnh tay chỉ cho chọn những vùng chữ nhật chắc chắn không đè lên phôi/khe cắt. Không tự ghi phần dư cong vào kho hoặc trừ giá. Thay sơ đồ làm các lựa chọn phần dư cũ cần được đối chiếu lại.
- Gợi ý tự động hiện dùng thuật toán. **Chưa kết nối API AI**: người dùng đang hỏi lại khách về phạm vi này. STEP/CAD động vẫn chờ GĐ2.
- Quyền sửa thuộc Cấu thành, kích thước và hao hụt; tài khoản kỹ thuật được lưu phương án mà không thấy giá. Công thức và dữ liệu danh mục giữ nguyên.

## Kiểm chứng

- `tests/nesting-plan.test.cjs`: ký hiệu, phiên bản, vị trí, mạch cắt, hao hụt, phân quyền và dữ liệu kỹ thuật.
- `tests/server.test.cjs`: lưu/đọc phương án báo giá trên API và từ chối trùng dòng.
- `tests/nesting-flow-browser.cjs`: thao tác danh mục, thay cách xếp, chỉnh tọa độ, lỗi chồng phôi, lưu/mở lại, phát hiện phương án cũ, bỏ lựa chọn và màn hình hẹp.
- Hồi quy mẫu hình thang/thoi, tấm tròn và ghép tam giác qua các bài thử trình duyệt hiện có.
