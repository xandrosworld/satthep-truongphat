# Tách hạn mức chi tiêu và định mức sản xuất

## Chi tiêu tài chính

Mục Định mức → Hạn mức chi tiêu: tiếp khách, ngoại giao hợp đồng, công tác/đi lại, động viên, khoản khác. Khai số tiền VND trên lần/hợp đồng/chuyến/người-ngày/tháng, phạm vi áp dụng, ngày hiệu lực và quy chế/quyết định làm căn cứ. Không đặt sẵn số tiền thay doanh nghiệp.

Quyền tài chính `view` được xem, `approve` được khai/sửa. Không cần cấp quyền sửa xưởng cho kế toán. Người chỉ có quyền tài chính không nhận danh sách lệnh, máy và định mức sản xuất từ API này. Lưu phiên bản và lịch sử; không tự phê duyệt khoản chi hay tự chặn thanh toán theo hạn mức.

## Sản xuất

- Hao hụt chuyển sang đối chiếu báo giá nguồn → phương án phôi trong hồ sơ lệnh → thực tế đã đối soát. Cùng mẫu số: phế / đầu vào × 100%, phần tận dụng được trừ riêng. Không tạo thêm tỷ lệ hao hụt chuẩn. Tỷ lệ cũ giữ để tra cứu, không dùng làm chuẩn trong bảng đối chiếu mới.
- Báo giá nguồn được quy về số lượng lệnh bởi luồng đối soát hiện có. Phương án phôi là bản trong hồ sơ kỹ thuật lệnh; không lấy phương án thử từ tồn kho làm số chốt. Thực tế chưa cân bằng/chưa đủ đối soát hiện thiếu căn cứ; lệnh chưa hoàn thành hiện số liệu tạm thời. Không thay số thiếu bằng 0.
- Nhân công, giờ máy, chi phí máy, điện, vật tư tiêu hao phải chọn nguyên công. Bổ sung nhóm điện (kWh) và chi phí máy (VND), tách khỏi hạn mức chi tiêu hành chính. Số tiền sản xuất vẫn theo quyền xem chi phí.
- Trong lệnh có nút **Định mức & đối chiếu hao hụt**. Bảng công đoạn cho khai định mức theo công đoạn, tự điền tên sản phẩm, nguyên công, đơn vị sản lượng và máy đã có trong hồ sơ lệnh.
- Các định mức này là tham chiếu có căn cứ; không tự ghi đè lệnh/báo giá đã chốt, không cộng chi phí lần nữa. Không tự suy giờ công thành giờ máy hoặc suy số tiêu hao chưa đo.

## Kiểm tra

- API: hạn mức, hiệu lực/ngày không hợp lệ, phân quyền tài chính/xưởng, lịch sử, chặn đổi nhóm chi tiêu thành sản xuất, bắt buộc nguyên công, không tạo tỷ lệ hao hụt mới, số liệu đối soát thiếu.
- Browser: khai/lưu các nhóm, lịch sử, đường đi từ lệnh, điền đúng công đoạn/đơn vị, bảng hao hụt không có nút khai chuẩn, hiển thị mobile.
- Tests: `norm-structure.test.cjs`, `reference-norms.test.cjs`, `reference-norm-controls.test.cjs`, `reference-norm-groups-browser.cjs`, `machine-consumption-browser.cjs`.
- Build và kiểm tra whitespace đạt.

## Kiểm tra web thật

Runtime `79a03d3` đã triển khai tại truongphat-group.xyz, có sao lưu trước triển khai; container healthy và healthz OK. Kiểm tra chỉ đọc đạt: form hạn mức để trống số tiền, hao hụt không có nút khai chuẩn mới, mở đối chiếu từ lệnh hiện có, khai theo công đoạn có sẵn mã và đơn vị, hiển thị mobile. Không tạo/sửa dữ liệu nghiệp vụ trên production; phiên kiểm thử đã thu hồi.
