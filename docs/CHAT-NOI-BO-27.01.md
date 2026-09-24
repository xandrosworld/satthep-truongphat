# Chat nội bộ — hạng mục 27.01

## Bổ sung ngày 24/09/2026 — trả lời và trạng thái kết nối

- Bấm **Trả lời** dưới tin nhắn để trích dẫn người gửi và nội dung gốc. Có thể hủy lựa chọn trước khi gửi; bản soạn giữ riêng theo hội thoại. Tin gốc là ảnh được ghi “Hình ảnh”. Trích dẫn được lưu trên máy chủ và giữ khi tải lại trang.
- Máy chủ chỉ nhận tin gốc thuộc cùng hội thoại; người ngoài hội thoại không được xem hoặc trả lời. Gửi lại sau lỗi mạng không tạo tin trùng.
- Danh sách và đầu hội thoại hiển thị Online/Offline; nhóm hiển thị số người khác online. Online nghĩa là phần mềm còn kết nối, không khẳng định người đó đang đọc chat hay làm việc.
- Máy chủ ghi nhịp kết nối tối đa một lần mỗi 15 giây cho mỗi phiên; quá 75 giây không nhận nhịp sẽ coi offline. Đăng xuất làm mất hiệu lực phiên ngay; nếu còn phiên khác hoạt động thì vẫn online. Trình duyệt ngủ/đóng hoặc mất mạng được xử lý theo thời hạn này.
- Không thu thêm phí riêng hai mục này trong lần hoàn thiện chat.

## Phạm vi hợp đồng

Phụ lục 01, mục 27.01: chat với từng cá nhân; tạo nhóm chat; chụp/cắt ảnh gửi trong ô chat. Triển khai trong hệ thống web đang dùng, ưu tiên máy tính/laptop. Không bổ sung gọi thoại/video, ứng dụng di động, đồng bộ Zalo hoặc gửi tài liệu ngoài ảnh.

## Sử dụng

1. Đăng nhập tài khoản máy chủ, chọn **Chat nội bộ** ở thanh bên.
2. **Nhắn riêng** → chọn đồng nghiệp → **Bắt đầu nhắn tin**. Chọn lại cùng người sẽ mở hội thoại cũ.
3. **Tạo nhóm** → đặt tên → chọn ít nhất hai đồng nghiệp. Người tạo nhóm vào **Thành viên** để đổi tên/thành viên; thành viên mới xem được lịch sử nhóm. Người bị bỏ khỏi nhóm không còn đọc tin/ảnh hoặc gửi tin vào nhóm.
4. Nhập tin và bấm **Gửi** hoặc Enter; Shift+Enter xuống dòng. Dấu số ở danh sách/thanh bên là tin chưa đọc. Tin được cập nhật tự động khi trang đang hoạt động.
5. Gửi ảnh bằng **Thêm ảnh**, hoặc Ctrl+V khi đang ở ô soạn. Chọn vùng ảnh bằng kéo chuột hoặc nhập Trái/Trên/Rộng/Cao; **Dùng ảnh này** đưa ảnh vào bản soạn, sau đó **Gửi** mới chuyển cho người nhận.
6. **Chụp / cắt màn hình**: trình duyệt yêu cầu chọn màn hình/cửa sổ cần chia sẻ. Chọn xong hệ thống lấy một ảnh và dừng chia sẻ, rồi mở công cụ cắt. Chỉ ảnh đã xác nhận gửi được tải lên máy chủ. Có thể dùng Win+Shift+S rồi Ctrl+V nếu trình duyệt không hỗ trợ chụp.
7. Mạng lỗi: giữ nguyên bản soạn và bấm **Thử gửi lại**. Cùng lần gửi được chống trùng ở máy chủ. Đóng hộp chat rồi mở lại vẫn giữ bản soạn trong phiên; tải lại/đóng trang sẽ có nhắc nếu còn nội dung chưa gửi. Bản soạn không lưu vào localStorage và được xóa khi đổi tài khoản.
8. Cuộn lên và bấm **Xem tin cũ hơn** để lấy lịch sử. Bấm ảnh để xem lớn.

## Vận hành

- Tin nhắn tối đa 5.000 ký tự; một ảnh/tin; ảnh gửi tối đa 3 MB. PNG/JPEG/WebP; ảnh nguồn để cắt tối đa 15 MB, ảnh đầu ra được thu gọn tối đa 1400 × 1000 px.
- Nhóm tối đa 100 thành viên. Không tính phí bản quyền theo tài khoản; đây là giới hạn kỹ thuật của một nhóm.
- Dữ liệu nằm trong SQLite trên volume hiện có. Sao lưu SQLite và bản xuất quản trị bao gồm hội thoại, thành viên, tin nhắn, ảnh. Quản trị có quyền sao lưu toàn hệ thống; giao diện chat/API tin nhắn chỉ cho thành viên hội thoại truy cập.
- Không dùng dịch vụ chat bên thứ ba. Dung lượng ảnh nằm trong lưu trữ máy chủ hiện hữu.
- Khi cửa sổ đang hoạt động: kiểm tra tin mới khoảng 2 giây lúc mở chat, khoảng 6 giây khi đóng chat. Không phải thông báo đẩy khi đã đóng trình duyệt.

## Kiểm tra

- `node --test tests/chat-server.test.cjs tests/server.test.cjs`: quyền thành viên, tài khoản kỹ thuật, CSRF, tài khoản khóa, ảnh, chống trùng, mốc đọc, phân trang lịch sử, khởi động lại, sao lưu và các kiểm tra máy chủ hiện hữu.
- `node tests/chat-browser.cjs`: hai tài khoản độc lập gửi/nhận tự động; nhóm; tải lại; mất phản hồi sau khi máy chủ nhận tin; ảnh chọn tệp/dán/cắt; hiển thị văn bản an toàn; xóa phiên khi đăng xuất; bố cục 1920/1366/1093 px.
- Luồng chụp màn hình tự động được kiểm bằng luồng video canvas mô phỏng và xác nhận dừng track. Hộp cấp quyền chia sẻ của hệ điều hành cần người dùng chọn thực tế; kiểm thử này không giả định đã xác nhận hộp quyền trên mọi máy khách.
- Kiểm tra bản triển khai chỉ đọc; không gửi tin thử tới nhân viên và không tạo hội thoại trong dữ liệu khách.


## Bổ sung ngày 22/09/2026 — ảnh và sticker trên laptop

- Thanh công cụ có icon Lucide và nhãn rõ ràng: Sticker, Thêm ảnh, Chụp / cắt màn hình.
- 12 sticker tĩnh Twemoji có xem trước; chọn sticker giữ nội dung đang soạn, chỉ gửi khi bấm Gửi. Sticker thay ảnh đang đính kèm (một ảnh mỗi tin).
- Ảnh từ máy, ảnh dán và ảnh chụp đều mở trình cắt. “Dùng ảnh này” quay lại soạn; “Cắt và gửi” gửi ngay cùng nội dung đang soạn. Có thể “Cắt lại” trước khi gửi.
- Sticker được chuyển thành PNG và đi qua cơ chế ảnh hiện có: quyền thành viên hội thoại, lưu máy chủ, giới hạn dung lượng và chống gửi trùng. Không thêm API hoặc mở rộng quyền.
- Đổi hội thoại trong khi cửa sổ chọn màn hình đang mở sẽ hủy kết quả chụp đó; các track được dừng. Không gửi ảnh sang hội thoại mới.
- Bộ hình và icon được đóng gói trong ứng dụng, không tải CDN lúc dùng. Nguồn/commit và giấy phép: assets/chat/SOURCES.md; ghi công Twemoji trong bộ chọn sticker.

Kiểm tra: `node --test tests/chat-server.test.cjs` và `node tests/chat-browser.cjs` đều đạt. Browser kiểm tra hai tài khoản, nhóm/riêng, sticker, cắt lại + gửi ngay, phản hồi bị mất + thử lại không trùng, không đổi ảnh khi tin còn chờ, Escape, đổi phòng lúc chụp, tải lại, quyền xem ảnh và các cỡ 1093/1366/1920. Ảnh kiểm tra lưu trong artifacts/customer-review/chat-*.png. Hộp chọn màn hình của hệ điều hành được mô phỏng bằng video stream trong test; không khẳng định đã tự động kiểm tra hộp chọn thật.
