# Giá nguyên công theo từng dòng cấu thành — 16/09/2026

Yêu cầu: tên/mã SP, CK, vật tư nằm ở dòng; nguyên công ở cột, chọn phương pháp tính trên đầu mỗi cột.

- Mỗi ô lấy ownOps của đúng node và đúng chỉ số công việc. Cùng nguyên công vẫn có giá khác nhau do yếu tố, lượng và độ phức tạp riêng.
- Dòng cha giữ ngữ cảnh, chỉ hiện công việc gán trực tiếp. Không đưa tổng cấp con vào ô cấp cha. Tổng cuối cột bỏ các công việc đã gồm trong gói thuê; báo thiếu nếu có công việc chưa tính được.
- Chi tiết ô hiển thị giá cơ sở, đầu vào/hệ số/nguồn, lượng thực hiện, tiền công và liên kết chỉnh công việc hoặc xem vật tư định mức.
- Giữ nguyên cơ chế chọn phương pháp, lấy bảng giá chủ động, snapshot và khóa ghi. Không sửa động cơ tính giá.
- Đầu bảng và cột tên cố định khi cuộn. Giữ vị trí cuộn khi đổi cách tính. Bảng cuộn riêng ở màn hẹp.

## Kiểm chứng

Năm kịch bản trình duyệt: quote-operation-choice, quote-method-sync, operation-linkage, factor-matrix và declaration-review đã đạt. Bài declaration-review được cập nhật để mở chế độ đầy đủ trước khi thao tác các nút bị ẩn trong chế độ gọn.

Ca tính tay: hai dòng cùng nguyên công cắt, dày 1 và 2 mm; số lượng toàn báo giá 24, khách QA-A, tổng cấu kiện 6. Đơn giá 1.379,4 và 1.504,8 đ/kg; lượng 18,84 và 37,68 kg; tiền 25.987,896 và 56.700,864 đ. Tổng hiển thị 82.689 đ. Các ô cấp SP/CK không có công việc hiện dấu —, không cộng lặp.

Ảnh và kết quả: artifacts/customer-review/quote-operation-choice-2026-09-15/local/choice/ và artifacts/customer-review/operation-linkage-2026-09-15/local/ (không đưa dữ liệu kiểm thử lên Git).
