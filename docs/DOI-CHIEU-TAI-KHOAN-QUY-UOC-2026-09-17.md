# Đối chiếu ảnh khách: tài khoản, quy ước và TMC

## Đã kiểm tra và xử lý

| Yêu cầu | Kết quả |
| --- | --- |
| Bổ sung vai trò | Thêm/sửa/xóa vai trò riêng có bộ quyền mặc định. Chọn vai trò khi tạo tài khoản hoặc phân quyền lại. |
| Sửa, xóa tài khoản | Sửa tên đăng nhập/họ tên; phân quyền vẫn có riêng. Xóa khỏi danh sách đồng thời khóa đăng nhập, giữ lịch sử công việc và người thực hiện. Không tự xóa tài khoản đang đăng nhập. |
| Quyền kỹ thuật | Sửa nhãn hiển thị sai “Xem nội bộ”; quyền thực tế vẫn chặn giá trên máy chủ. Loại bỏ danh sách checkbox quyền bị lặp. |
| Bỏ mã công đoạn | Bảng công đoạn hiện tên, không hiện cột mã. Mã nội bộ giữ để liên kết dữ liệu. |
| Bỏ dãy lọc hệ số thừa | Đã có. Giữ phân nhóm sản phẩm và bảng tổng hợp hệ số. “Dùng chung” là phạm vi áp dụng cho mọi nhóm, không phải nhóm sản phẩm mới. |
| Thông số cấu kiện | Sửa kiểm tra chỉ xét tồn tại ký hiệu nhưng bỏ sót tên/đơn vị. Liệt kê thông số còn thiếu từ công thức, vật tư và cấu thành; nút khai bổ sung ngay. |
| Khổ chuẩn | Đã có thêm/sửa và chọn dùng trong báo giá. Bổ sung đối chiếu các khổ đang dùng nhưng chưa có khổ chuẩn hoạt động tương ứng; khai nhanh từ kích thước đang dùng. Không tự sửa khổ trong báo giá cũ. |
| TMC theo khổ rộng, m/cái | Bảng TMC đã nằm trong Nguyên công & hệ số → Bảng hệ số giá. Kiểm tra các bậc rộng và đơn vị m/cái. |
| Nhóm áp dụng phí vận chuyển/lắp đặt | Phạm vi nhóm tại báo giá đã có. Bổ sung nhóm áp dụng ngay tại đơn giá đầu vào; khi chọn đơn giá, chỉ tính phí trong giao của nhóm cho phép và phạm vi khoản chi. Chọn Cơ khí khác nếu khoản phí đã nằm trong TMC. Không tự gán quy tắc miễn phí cho mọi bảng TMC. |

## Chờ khách xác nhận

**Nguyên công tổng làm mặc định cho cách tính TMC/nhóm khác**: người dùng trả lời “hỏi khách sau” ngày 17/09/2026. Chưa thay luồng tính giá theo suy đoán. Bảng TMC theo khổ rộng hiện tại tiếp tục hoạt động; không kết luận mục mặc định nguyên công tổng đã hoàn tất.

## Quy tắc vai trò và tài khoản

Vai trò riêng là bộ quyền mẫu dựa trên một loại quyền nền. Khi cấp tài khoản, quản trị có thể điều chỉnh từng quyền. Sửa mẫu sau này không tự đổi quyền nhân viên đã cấp; chọn lại mẫu trong Phân quyền để áp dụng. Không xóa mẫu còn tài khoản chưa xóa sử dụng.

Sửa thông tin/quyền hoặc xóa tài khoản kết thúc các phiên đăng nhập của tài khoản đó. Tên đăng nhập đã xóa không tái sử dụng, để lịch sử không bị nhầm người. Tài khoản đã xóa không được mở khóa qua API cũ. Sao lưu bao gồm trạng thái xóa và vai trò riêng.

## Phạm vi bằng chứng

Ảnh và báo cáo web thật nằm tại `artifacts/customer-review/accounts-catalog/live/index.html` sau kiểm tra triển khai. Ảnh chụp dùng đúng URL Railway và đúng bản build đã triển khai.

- Tạo vai trò/tài khoản, sửa thông tin, phân quyền và xóa: thực hiện bằng dữ liệu kiểm thử riêng trên máy chủ, dọn tài khoản/mẫu vai trò sau kiểm tra.
- Danh mục: đọc dữ liệu thật, mở các form và chụp vị trí tính năng; không phát hành thay đổi vào danh mục kinh doanh để chụp ảnh.
- Lưu quy ước/khổ chuẩn và tính phí theo nhóm được kiểm tra tự động trên máy chủ thử cùng mã nguồn. Không dùng ảnh form mở để khẳng định đã sửa dữ liệu kinh doanh của khách.

Kiểm tra liên quan: `tests/accounts-review.test.cjs`, `tests/catalog-audit.test.cjs`, `tests/account-catalog-review-browser.cjs`, các kiểm thử TMC/phạm vi phí, phân quyền và thông báo hiện có.
