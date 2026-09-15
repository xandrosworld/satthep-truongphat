# Phiên bản và lịch sử gửi báo giá — 16/09/2026

Phạm vi: khách yêu cầu một báo giá có nhiều lần gửi, lưu dữ liệu từng lần và nhận biết bản khách chấp nhận. Không triển khai phần lập/sửa đầy đủ trên điện thoại trong đợt này.

## Hành vi

- Thanh công cụ báo giá có **Phiên bản / lần gửi**; mỗi bản duyệt trên trình duyệt được đánh V1, V2… trong cùng hồ sơ. Đây là số bản duyệt, không phải bộ đếm tự lưu nháp.
- Duyệt mới lưu riêng báo giá, danh mục dùng tính, bản chào và dữ liệu Excel tại thời điểm duyệt. Xem/tải lại dùng bản đã lưu, không lấy giá hiện tại. Excel bản chào và dữ liệu tính giá nội bộ là hai thao tác riêng.
- **Tạo bản sửa** yêu cầu lý do, giữ cùng mã/hồ sơ và chuyển về nháp. Duyệt lại tạo phiên bản kế tiếp. Nhân bản thành báo giá độc lập không mang theo trạng thái duyệt, giao dịch hay ghi chú sửa của hồ sơ nguồn.
- Ghi nhận gửi cần người dùng xác nhận đã thực sự gửi. Lưu thời điểm ghi nhận, người thao tác, căn cứ, người nhận và kênh nếu khai. Cho phép gửi lại cùng phiên bản có xác nhận; xuất Excel/email nháp không tự đánh dấu gửi.
- Mỗi giao dịch liên kết với bản duyệt tương ứng. Có bản nháp mới vẫn có thể ghi nhận phản hồi cho bản đã duyệt gần nhất; không lấy nội dung nháp làm bản gửi. Bản duyệt mới khởi đầu giao dịch ở trạng thái nháp và lấy hiệu lực của bản mới, giữ lịch sử cũ.
- Trạng thái khách chấp nhận ghi rõ phiên bản trong lịch sử. Ghi nhận thao tác mới dùng **bản duyệt gần nhất**; chưa có thao tác chọn một bản duyệt cũ hơn để ghi nhận chốt sau khi đã duyệt bản mới.
- Hoàn tác chỉnh sửa không xóa bản vừa duyệt hoặc nhật ký giao dịch đã ghi. Có kiểm tra xung đột thẻ trình duyệt và phiên bản giao dịch.
- Máy chủ tiếp tục dùng số revision hiện có (bao gồm lưu/trình/duyệt). Liên kết trong lịch sử gửi mở bản chào chỉ xem, không chuyển/rời bản nháp đang sửa. Quyền bán hàng chỉ nhận bản giá bán đã duyệt; không được lấy tài liệu tính giá nội bộ.

## Dữ liệu cũ và lưu trữ

Không dựng giả snapshot đầy đủ cho những bản đã duyệt trước thay đổi này. Nếu thiếu danh mục/bản chào tại thời điểm duyệt, màn xem có thông báo rõ và dùng dữ liệu cũ còn lưu. Không có tệp Excel đóng băng thì không hiện nút tải snapshot.

Netlify vẫn là chế độ dữ liệu lưu trên trình duyệt; cần sao lưu, không phải lịch sử dùng chung trên máy chủ. Sao lưu JSON giữ các bản duyệt và giao dịch, tệp đính kèm gốc vẫn theo cơ chế lưu trữ hiện có. Việc kiểm tra API dùng máy chủ SQLite cục bộ, không phải xác nhận đã triển khai backend lên Netlify.

## Kiểm chứng

- `node --test tests/completion.test.cjs tests/server.test.cjs`: 34 bài đạt, gồm gửi lại, chống ghi trùng khi gửi lại request cũ, hiệu lực từng phiên bản, lưu trữ bất biến và phân quyền.
- `node tests/quote-versions-browser.cjs`: 5 nhóm đạt — duyệt V1, gửi/gửi lại, sửa/chốt khi đang có nháp, duyệt/gửi/chốt V2, F5, thay danh mục vẫn giữ V1 và tệp xuất, cảnh báo bản cũ.
- `node tests/quote-versions-team-browser.cjs`: 2 nhóm đạt — mở bản gửi khi đang có nháp chưa lưu và quyền xem giá bán.
- `node tests/group-pricing-browser.cjs`: 14 nhóm hồi quy đạt, gồm bản chào chính thức, XLSX/PDF và bản sao độc lập.
- `tests/completion-browser.cjs` dừng trước phần giao dịch tại kiểm tra phần dư sau đổi phôi. Chạy lại với HTML dựng từ HEAD trước thay đổi (`3b286d4`) cho cùng lỗi, cùng vị trí. Không tính bài này là đạt; không sửa nghiệp vụ phần dư trong đợt phiên bản.

Bằng chứng tại `artifacts/customer-review/quote-versions-2026-09-16/`. Dữ liệu QA giả lập, không ghi gửi thật cho khách.
