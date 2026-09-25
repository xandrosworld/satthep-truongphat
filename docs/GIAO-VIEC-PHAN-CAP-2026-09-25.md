# Giao việc theo phân cấp và liên thông — 25/09/2026

Đối chiếu bốn yêu cầu khách gửi: giao/nhận việc theo phòng ban, cập nhật theo tiến trình, ghi vướng mắc/kiến nghị, đánh giá khối lượng và tiến độ. Thuộc nhóm 12, 22, 26 và BS10; tài liệu này ghi kết quả triển khai/tự kiểm, không phải nghiệm thu khách.

## Cách dùng

Mở **Giao việc & báo cáo ngày**. Có bảng trạng thái hoặc danh sách, bộ lọc phòng ban, người nhận, nguồn và trạng thái; có Excel theo bộ lọc.

1. **Giao việc / tự giao:** khai tên, mô tả, phòng ban/người nhận, việc cha, lệnh liên quan, ưu tiên, ngày bắt đầu/hạn, giờ dự kiến, khối lượng kế hoạch và đơn vị, người liên quan.
2. Có thể để người nhận trống và chọn phòng ban. Thành viên phòng ban nhận việc, hệ thống gắn người nhận; hai người không thể cùng nhận một việc.
3. Việc giao trực tiếp: chờ nhận → đã nhận → đang thực hiện → chờ xác nhận → hoàn thành. Người có quyền xác nhận có thể yêu cầu làm lại kèm lý do.
4. Người nhận báo cáo ngày: giờ, khối lượng tăng thêm, việc đã làm, vướng mắc, kiến nghị, kế hoạch ngày sau. Vướng mắc có kết quả xử lý, người và thời điểm. Có thông báo giao việc/chuyển bước và kiến nghị cho quản lý trong phạm vi.
5. Việc cha chờ các việc con được xác nhận. Không chốt khi còn vướng mắc chưa giải quyết hoặc khối lượng báo cáo chưa đủ kế hoạch đã khai.

## Phân cấp và quyền

- Quyền thao tác vẫn dùng `dailyWork`: xem, giao việc, cập nhật, xác nhận, xuất Excel.
- Khi đã khai cơ cấu, quyền giao/xác nhận được giới hạn theo vị trí quản lý: phòng của mình và đơn vị cấp dưới; không tự mở quyền với phòng ngang cấp. Người liên quan xem được việc được chỉ định, không tự có quyền giao/xác nhận.
- Cá nhân tự giao việc cho mình; quản lý phân công theo phạm vi. Người nhận phải là tài khoản còn hoạt động. Phòng ban không có người nhận cần thành viên nhận việc hoặc quản lý phân công.
- Nếu hệ thống chưa khai cơ cấu phòng ban, giữ phạm vi quyền giao/xác nhận hiện có để không làm hỏng dữ liệu cũ. Muốn phân cấp thực tế cần khai đúng phòng ban, vị trí quản lý và bố trí nhân sự.
- API giao việc cũ ở xưởng cũng dùng phạm vi này. Không chỉ ẩn nút ở giao diện. Lưu có kiểm tra phiên bản và mã thao tác chống ghi trùng.

## Công việc tự cập nhật

- Kỹ thuật/nhập giá theo phân công và xác nhận bàn giao báo giá.
- Gửi khách và chăm sóc theo từng phiên bản đã duyệt; chăm sóc bắt đầu sau xác nhận gửi, kết thúc theo trạng thái chăm sóc nguồn.
- Công đoạn sản xuất: người được phân công, số lượng kế hoạch/thực tế, giờ, trạng thái, hạn, vướng mắc và kiến nghị.
- Theo dõi mua vật tư: người tạo yêu cầu, bước duyệt/đặt/giao/nhận/nhập kho. Không đưa đơn giá, chi phí vào thẻ việc.

Các thẻ liên thông có mã ổn định và đọc trạng thái thực tế, không tạo thêm bản sao nghiệp vụ hoặc thông báo khi tải trang. **Mở nghiệp vụ nguồn** để cập nhật đúng quyền và quy trình. Không cho tự đánh dấu hoàn thành nguồn từ bảng việc. Công việc chưa có người phụ trách hiện cho Admin để phân công tại nguồn.

Bảng tự làm mới mỗi 20 giây khi đang mở và không nhập liệu/mở hộp thoại; giữ vị trí cuộn. Có nút Làm mới. Nguồn chỉ xuất hiện khi người xem có cả quyền xem phân hệ nguồn và phạm vi xem công việc.

## Tổng hợp và giới hạn số liệu

- Tổng hợp theo nhân sự và phòng ban: số việc, số hoàn thành, quá hạn, giờ, khối lượng theo từng đơn vị và vướng mắc mở.
- Việc giao trực tiếp cộng báo cáo tăng thêm. Việc liên thông lấy số lũy kế từ nguồn; báo cáo bổ sung không cộng lần hai vào sản lượng/giờ nguồn.
- Bộ lọc ngày áp dụng ngày tạo việc và ngày báo cáo tương ứng; tổng hợp việc là lũy kế hiện tại, không giả làm ảnh chụp tiến độ lịch sử. Khối lượng nhiều công đoạn không phải tổng thành phẩm; không cộng khác đơn vị thành một số.
- Nhân sự kiêm nhiệm không nhân đôi một công việc; nhóm phòng ban theo phòng đã giao hoặc nhãn các phòng hiện tại của người nhận.
- Đây là bảng nghiệp vụ đang có; không phải công cụ tự thiết kế mọi quy trình tùy ý hoặc hệ thống chấm điểm KPI tự động.

## Kiểm tra và phát hành

- Kiểm thử phân cấp, nhận việc đồng thời, quyền API cũ, việc cha–con/vòng lặp, khối lượng, xử lý vướng mắc, mã thao tác, đơn vị sau báo cáo.
- Kiểm thử công đoạn chạy thực → đối soát → bảng việc cập nhật; gửi/chăm sóc báo giá, mua hàng cập nhật theo nguồn; không lộ chi phí qua thẻ.
- Trình duyệt: tạo/giao/nhận/báo cáo/xác nhận, bộ lọc, lịch sử, Excel, tự đồng bộ, mở nguồn, reload; máy tính 1440px và điện thoại 390px.
- Hồi quy: 737/737 kiểm thử đạt; trình duyệt bảng việc và các phân hệ enterprise đạt.
- Đã phát hành HTTPS bản `0b06da9` ngày 25/09/2026, có sao lưu trước phát hành. Kiểm tra trực tiếp bảng/danh sách, bộ lọc, desktop 1440px và mobile 390px đạt, không lỗi JavaScript. Bảng nhận 50 việc liên thông từ dữ liệu hiện có; kiểm tra live chỉ đọc, không tạo/sửa công việc khách hàng. Phiên kiểm tra tạm đã thu hồi.
- Chưa xác nhận khách nghiệm thu. Phân quyền nhiều vai trò và thao tác ghi được kiểm thử ở môi trường kiểm thử, không giả lập nghiệp vụ trên dữ liệu thật.
