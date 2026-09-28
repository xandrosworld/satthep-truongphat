# Cấp vật tư / sửa chữa — 28/09/2026

Theo ảnh khách gửi: mục riêng dưới Định mức trong nhóm Sản xuất, gồm hai tab đề nghị cấp vật tư/thiết bị và đề nghị sửa chữa.

## Luồng và quyền

- Người có quyền tạo mua hàng, tạo kho, sửa sản xuất hoặc sửa điều hành xưởng được gửi đề nghị; khai bộ phận/nơi sử dụng, người nhận/liên hệ, ngày cần và lý do. Bộ phận được khai tay, chưa tự gán theo cơ cấu. Người đề nghị chỉ xem đề nghị của mình; người xử lý xem loại thuộc quyền.
- Cấp vật tư: nhiều dòng mã vật tư/thiết bị, số lượng và yêu cầu quy cách → quyền `inventory.approve` duyệt/từ chối → quyền `inventory.edit` xác nhận cấp theo lô và người thực nhận. Có cấp một phần, theo dõi lượng còn lại. Chọn đúng quy cách lô theo yêu cầu trước khi xác nhận. Đề nghị chưa giữ riêng kho; chỉ xác nhận cấp mới giảm tồn và sinh phiếu xuất dẫn chiếu số đề nghị. Không lấy phần giữ cho lệnh khác. Thiếu tồn phải bổ sung qua mua/nhập kho hiện có trước khi cấp; không tự tạo mua hàng.
- Sửa chữa: chọn máy trong danh mục hoặc khai thiết bị khác, mô tả hỏng → quyền `purchasing.approve` duyệt/từ chối → quyền `workshop.edit` bắt đầu, ghi đơn vị/người sửa → hoàn tất với ngày, kết quả và giờ dừng máy. Nếu gắn máy, tự tạo một bản ghi lịch sử sửa máy. Đây là ghi kết quả sửa chữa, không tự sinh chứng từ chi hoặc thanh toán.
- Người đề nghị được rút khi còn chờ duyệt. Từ chối/rút/hoàn tất phải có lý do hoặc kết quả. Các quyết định lưu người, thời điểm, lịch sử và thông báo nội bộ cho người xử lý/người đề nghị.
- Kiểm phiên bản, chống gửi/cấp/hoàn tất trùng; nhiều dòng cấp trong một giao dịch, lỗi một dòng không ghi các dòng còn lại. Không cho xóa máy/vật tư đang có đề nghị. Không trả giá vốn qua API đề nghị.

## Kiểm chứng

- 11 ca API/core trong service-requests, operations-erp, reference-norms, machine-records, department-material-requests đạt. Ca mới kiểm tra phân quyền, phạm vi xem, số lượng, tồn giữ, cấp từng phần, rollback, thao tác đồng thời, phiên bản cũ và lịch sử máy không trùng.
- Browser service-requests đạt: hai tab, thêm/bỏ dòng, gửi/duyệt/cấp từng phần và đủ, sửa chữa đến hoàn tất, lịch sử, tải lại, icon và form 390 px.
- Browser machine-records đạt. Browser department-material-requests lần đầu timeout khi đóng form; chạy chẩn đoán và chạy lại bản gốc đều đạt. Không sửa luồng mua hàng để bỏ kiểm tra.
- Build đạt. Triển khai và kiểm tra web thật ghi trong checklist sau xác minh. Kiểm thử ghi nghiệp vụ dùng cơ sở dữ liệu riêng.

## Icon

Tệp dùng trong ứng dụng: `assets/sidebar-icons/supply-repair.png`, PNG 128 × 128, có alpha; nhúng vào build. Tạo bằng công cụ imagegen tích hợp, sau đó giảm kích thước bằng canvas để tối ưu menu. Giữ nguyên ảnh gốc ở thư mục generated_images.

Prompt đã dùng:

> Create one polished 3D desktop application sidebar icon for 'Material issuance and repair requests' in an industrial Vietnamese ERP. A compact dark navy-blue open supply toolbox with two brushed steel spare parts and a clearly readable silver wrench leaning diagonally in front, small muted gold accent. Isometric three-quarter view, realistic yet simplified classic enterprise icon style, crisp silhouette readable at 32 pixels. Centered single object group, occupies 85% of square canvas. Transparent background with real alpha, no background tile, no ground plane, no text, no letters, no border, no watermark. Save as PNG with transparency.
