# Đối chiếu hao hụt và lượng hoàn thiện

## Công đoạn & định mức
Cảnh báo “Chưa xác nhận lượng hoàn thiện” là dữ liệu chưa được xác nhận, không phải lỗi mất khối lượng phôi. Ví dụ diện tích phôi 100,8 m² có thể khác diện tích hai mặt 201,6 m² và diện tích thực tế cần sơn.

Khung **Cần xác nhận phạm vi hoàn thiện** nêu sản phẩm/công đoạn và mở thẳng **Lượng công việc**. Form hiện khối lượng/diện tích cấu thành đã nhân số lượng và đơn vị định mức. Người dùng nhập tổng lượng thực tế, định mức một đơn vị, khai công thức KL/DT hoặc xác nhận lượng cấu thành đúng. Chỉ xác nhận khi đúng phạm vi hoàn thiện; không tự bật xác nhận.

## Khai triển & hao hụt
Mở **Chọn cách / %** ở dòng vật tư hoặc áp dụng cho các dòng con. Cả “Theo phôi” và “Phôi + hao hụt” đều có bảng đối chiếu trải phôi:
- Gom các dòng tương thích trong toàn báo giá theo cùng nhóm tổ hợp mua hiện có.
- Hiện khổ mua, mạch cắt, số phôi, số tấm/thanh, lượng cần/mua/chênh và sơ đồ.
- % gợi ý = (lượng khổ mua / lượng phôi − 1) × 100. Đây là tỷ lệ trên phôi, khác tỷ lệ phần dư trên khổ mua.
- Gợi ý gồm mạch cắt và phần dư chưa sử dụng; chưa trừ phần dư tận dụng. Sơ đồ tham khảo, không cam kết tối ưu.
- **Dùng %** chọn riêng cho các dòng đang sửa thuộc nhóm đó; **Áp dụng và tính lại** mới ghi vào báo giá. Dòng khác trong nhóm tổ hợp không tự thay đổi. Có thể nhập % riêng; chọn “Theo phôi” vẫn giữ 0% và hiện đối chiếu.
- Thiếu khổ/vượt khổ báo rõ; không gợi ý 0% giả. Gợi ý quá 100% vẫn hiển thị nhưng không áp dụng vì giới hạn % dự tính hiện tại.

## Tên vật tư
Gợi ý theo cách viết hiện tại: **Thép CT3 tấm dày 1,5 mm**, **Thép hộp 40 × 40 × 2 mm**, **Inox 304 tấm dày 1,5 mm**. Tên đã khai không bị đổi; bấm **Dùng tên này** mới điền tên gợi ý. Quy ước riêng giữ tên và thông số riêng.

## Kiểm tra
`tests/material-estimate.test.cjs`, `tests/intake.test.cjs`, `tests/batch-two.test.cjs`: gom nhiều sản phẩm, khổ sai, thanh có mạch cắt, % trên phôi, tên tự nhiên và lượng hoàn thiện.
`tools/verify-estimate-feedback.cjs`: cảnh báo → xác nhận / nhập 5 m² → định mức sinh đúng; sơ đồ → chọn % → lưu/tải lại; hủy không đổi; nhập % riêng; theo phôi; tên gợi ý; điện thoại.
