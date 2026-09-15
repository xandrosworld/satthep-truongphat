# Công thức tổng hợp và kiểm thử trong cùng màn

Phản hồi tiếp theo sáng 15/09 yêu cầu nhập công thức, có công cụ tính, định mức thép hình và dữ liệu/kết quả kiểm thử ngay trong Công thức tổng hợp. Đã xem lại ảnh màn sửa công thức của hệ thống tham khảo trong nguồn cuộc họp: `meeting-2026-09-13/doi-chieu-2026-09-14/checklist-images/02-cong-thuc.png`. Ảnh đó là căn cứ cho cách tổ chức công cụ chèn biến/phép tính/hàm; công thức nghiệp vụ vẫn do người khai nhập.

## Hành vi

- Cả Sửa công thức và Công thức tổng hợp mở cùng form nhập và thử, có dữ liệu quy ước hiện tại, danh sách thông số liên kết, tên/đơn vị/nơi nhập và giá trị thử.
- Bảng có bốn cột: đại lượng, công thức tính, thay số kiểm thử, kết quả. Sáu công thức sửa trực tiếp trong form: dài/rộng khai triển, khối lượng/diện tích trên đơn vị, khối lượng/diện tích phôi. Bảng tổng danh mục vẫn chỉ xem.
- Các dòng bổ sung hiển thị số khổ mua, tổng khối lượng/diện tích phôi theo số lượng thử và khối lượng/diện tích vật tư mua. Số khổ lấy từ thuật toán xếp phôi đang dùng, có xét mạch cắt và khổ mua.
- Thép định hình có KM (kg/m) và AM (m²/m dài) trong thông số cố định; nhập số thử tại đó, dùng trong K/A. Khi tạo mã vật tư, hai giá trị được nhập theo từng mã. Công thức phôi mặc định là dài khai triển / 1000 × định mức trên mét. Tấm dùng định mức trên m².
- Khối lượng riêng, khổ mua, số lượng và mạch cắt là dữ liệu thử cùng màn. Giá trị thử của các thông số và công thức lưu theo phiên bản; bộ khổ/số lượng/mạch cắt thử tạm thời không ghi vào báo giá hoặc quy ước đã lưu.
- Đổi công thức/dữ liệu cập nhật kết quả. Sai đơn vị, thiếu biến, chia cho 0, vượt khổ hoặc sai số lượng sẽ báo lỗi và xóa số kết quả cũ. Nút Kiểm tra tổng thể dùng đúng số lượng và mạch cắt đang thử.
- Hủy không lưu quy ước; Lưu phiên bản cập nhật danh mục. Mã vật tư và báo giá trước vẫn giữ phiên bản đã chọn.

## Công cụ công thức

Chọn ô công thức rồi chèn ký hiệu hoặc phép tính tại con trỏ. Bộ công cụ gồm số, dấu ngoặc, cộng/trừ/nhân/chia, lũy thừa, so sánh và các hàm MIN, MAX, SUM, AVG, ROUND, ROUNDUP, ROUNDDOWN, CEIL, FLOOR, SQRT, ABS, POW, MOD, CLAMP, IF, SIGN, SIN, COS, TAN, DIV, PI.

Hàm dùng dấu phẩy ngăn cách đối số, dấu chấm thập phân; SIN/COS/TAN dùng radian. ROUND làm tròn nửa ra xa 0, ROUNDUP ra xa 0, ROUNDDOWN về 0; DIV chia lấy phần nguyên về 0. IF chỉ tính nhánh được chọn, nhưng kiểm tên biến/đơn vị cả hai nhánh. Số lượng nhân ngoài công thức một phôi để không tính trùng.

`shape-expression-core.js` phân tích biểu thức số học và kiểm đơn vị, không thực thi mã người nhập. Giới hạn 500 ký tự, lồng tối đa 20 cấp, số thử tối đa 5.000 chi tiết. Bộ tính riêng này dùng cho quy ước hình dạng; không thay trình nhập công thức của mọi phân hệ khác.

## Kiểm chứng

- Tấm 1000 × 200 × 2 mm, RHO 7850, ba phôi: 9,42 kg / 0,6 m²; một khổ 1000 × 1000: 15,7 kg / 1 m². Chuyển công thức phôi sang tam giác: 4,71 kg / 0,3 m², khổ mua giữ nguyên.
- Thép hình dài 2000 mm, KM = 12, AM = 0,6, bốn phôi: 96 kg / 4,8 m². Hai thanh mua 6000 mm: 144 kg / 7,2 m². Với ba phôi và mạch cắt từ 0 lên 5 mm, số thanh mua tăng từ một lên hai.
- Kiểm từ nút Công thức tổng hợp qua sửa/thử/lưu/mở lại, tạo mã vật tư, chọn mã trong báo giá và đối chiếu kết quả. Kiểm hủy, bảo toàn phiên bản, lỗi không giữ số cũ, màn hình hẹp và hồi quy các lượt trước.

Bằng chứng tại `artifacts/customer-review/formula-workbench-2026-09-15/`: `verification.json`, log logic/máy chủ, các thư mục trình duyệt và `live/deployment-check.json`. Máy chủ được kiểm cục bộ; web thật chạy trong trình duyệt thử riêng. Kết quả triển khai không thay nghiệm thu của khách. Phần đơn giá vẫn xử lý riêng.
