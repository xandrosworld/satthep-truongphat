# Rà soát kỹ thuật trước khi phân tách triển khai

## Luồng đã điều chỉnh
1. Rà soát theo cấu trúc khai báo: đầu vào/bản vẽ, cấu thành, công đoạn/định mức, khai triển/hao hụt, khối lượng/số lượng.
2. Kỹ sư xác nhận hồ sơ sau khi kiểm tra các phần. Máy chủ lưu người xác nhận, thời gian và các phần đã kiểm tra.
3. Mở riêng màn hình Phân tách triển khai: thông tin sản phẩm, vật tư và tồn kho theo khổ, công đoạn/thiết bị, tiến trình thực hiện, chuẩn bị xưởng.
4. Công nghệ vẫn qua xác nhận kỹ thuật và duyệt theo luồng hiện có trước khi bắt đầu sản xuất. Danh sách công đoạn chưa duyệt được ghi rõ là dự kiến.

## Điều kiện thực thi
- Lệnh ở trạng thái chờ sản xuất chưa xác nhận hồ sơ bị chặn giữ kho, đề nghị mua (riêng/gom lệnh), giao việc xưởng và bắt đầu sản xuất, kể cả gọi trực tiếp API.
- Bổ sung bản vẽ, duyệt thay đổi kỹ thuật hoặc duyệt lại công nghệ làm mất xác nhận cũ; phải rà soát lại trước khi triển khai tiếp.
- Nhập hàng từ yêu cầu đã đặt vẫn được ghi nhận; không tự giữ về lệnh chờ sản xuất khi hồ sơ đã mất xác nhận.
- Lệnh lịch sử đang sản xuất không bị đẩy ngược về bước rà soát.
- Không thay đổi dữ liệu báo giá, đơn hàng nguồn; các bảng kỹ thuật và triển khai không hiển thị giá.

## Kiểm thử
- 763 kiểm thử tự động đạt, có kiểm thử chặn trước xác nhận, thiếu mục rà soát, cho giữ kho sau xác nhận, vô hiệu xác nhận khi đổi bản vẽ và giữ nguyên đơn hàng nguồn.
- Trình duyệt: tải bản vẽ, xác nhận hồ sơ, mở phân tách triển khai, chia/gom mua hàng, điều hành công đoạn, QC và hoàn thành đạt.
- Kiểm tra bố cục điện thoại/máy tính; bảng rộng cuộn bên trong, thẻ công đoạn tự xuống hàng.
- Dữ liệu thử chỉ trên cơ sở dữ liệu kiểm thử.
