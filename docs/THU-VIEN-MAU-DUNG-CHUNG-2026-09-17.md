# Thư viện mẫu dùng chung

## Cách sử dụng

1. Trong báo giá, khai sản phẩm/cấu kiện, vật tư, công đoạn và định mức tại từng cấp.
2. Chọn sản phẩm hoặc cấu kiện → **Lưu mẫu**. Với quản trị trên máy chủ, nhập tên và bấm **Lưu và phát hành**.
3. Mẫu được đưa vào danh mục dùng chung. Các mã vật tư, quy tắc, hình dạng và nguyên công còn thiếu được bổ sung; mã đang có không bị ghi đè.
4. Tạo báo giá mới → **Thư viện mẫu** → **Xem cấu thành** để kiểm tra vật tư, công đoạn, cách thực hiện và định mức → **Sử dụng**. Cấu kiện cũng có thể gọi từ **Thêm cấu kiện → Tạo từ**.
5. Lưu máy chủ. Khi tải lại, bản sao giữ cấu thành và công đoạn. Sửa bản sao không đổi mẫu gốc.

Mẫu giữ thông số, liên kết kích thước, công thức khai triển, phương án công đoạn, định mức, thiết lập thuê ngoài và phân rã TMC trong cây sản phẩm. Khi sao chép, mã dòng/công đoạn được tạo mới; tham chiếu phân rã TMC trỏ vào đúng dòng mới.

Mẫu chuẩn hóa số lượng cấp gốc về 1; định mức bên trong giữ nguyên. Các lượng khai theo toàn dòng vẫn là lượng toàn dòng đã lưu, cần rà lại khi đổi quy mô đơn. Những công đoạn chưa từng khai trong mẫu phải được bổ sung; hệ thống không tự suy đoán nghiệp vụ.

Đơn giá nguyên công đã có trong báo giá được giữ; mã nguyên công thiếu được lấy từ danh mục. Phương án giá không tồn tại hoặc đã tắt sẽ báo lỗi khi dùng mẫu. Rà bảng giá và các khai báo cần xác nhận của báo giá trước khi chào khách.

Nhân viên không có quyền phát hành danh mục chỉ lưu mẫu trong báo giá; giao diện ghi rõ phạm vi này. Quản trị mở báo giá đó và lưu/phát hành mẫu để dùng chung. Báo giá cũ không tự nhận mẫu vừa phát hành; cần lấy danh mục chung qua luồng cập nhật danh mục sẵn có, hoặc tạo báo giá mới.

Nếu danh mục vừa được người khác cập nhật, hộp thoại báo lỗi và giữ dữ liệu nhập. Bấm lại **Lưu và phát hành** để lấy phiên bản mới rồi bổ sung mẫu. Nếu lần trước máy chủ đã lưu nhưng phản hồi bị mất, thử lại không tạo thêm bản trùng.

## Kiểm tra thực hiện

- Toàn bộ `tests/*.test.cjs`: 416/416 đạt.
- `node tests/template-library-browser.cjs`: máy chủ thử nghiệm riêng, phát hành mẫu qua giao diện; xử lý xung đột; mở chi tiết; tạo báo giá thứ hai; gọi sản phẩm/cấu kiện; lưu/tải lại; thêm cấu kiện từ biểu mẫu; sửa bản sao độc lập; chặn thêm vào bản chỉ xem.
- `node tests/library-material-browser.cjs`: 4 kiểm tra đạt.
- `node tests/technical-pricing-browser.cjs`: các bước kỹ thuật không lộ giá.
- `npm run build`: tạo thành công bản HTML triển khai.

Hai kịch bản hồi quy cũ chưa chạy hết và đã tái hiện cùng lỗi trên bản HEAD trước thay đổi thư viện:

- `tests/intake-browser.cjs`: selector `data-pa=product-inputs` khớp hai nút; các bước trước đó đã đạt, gồm chuyển yêu cầu thành cấu thành từ mẫu.
- `tests/stock-card-component-browser.cjs`: selector chọn khổ mua cũ không còn trong giao diện hao hụt dự tính. Phần gọi mẫu cấu kiện được kiểm tra riêng bằng kịch bản thư viện mới.

Không dùng hai kịch bản chưa chạy hết làm bằng chứng nghiệm thu toàn hệ thống. Kiểm thử máy chủ sử dụng dữ liệu riêng, không ghi báo giá thử vào dữ liệu khách hàng trên Railway. Việc khách chạy một đơn thực tế để xác nhận nghiệp vụ vẫn là bước riêng.
