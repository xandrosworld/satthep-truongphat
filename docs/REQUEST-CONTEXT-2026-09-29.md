# Người đề nghị và căn cứ công việc — 29/09/2026

Các đề nghị mới dùng chung danh mục căn cứ: báo giá, đơn hàng, hợp đồng, lệnh sản xuất và các mã dự án/sản xuất/văn phòng đã khai báo. Không nhận một tên căn cứ tự nhập thay cho liên kết hồ sơ.

- Người đề nghị, mã và ID nhân sự lấy từ hồ sơ gắn với tài khoản; máy chủ bỏ qua thông tin người đề nghị giả mạo từ trình duyệt.
- Nhân viên chọn trong các phòng ban thuộc vị trí đang hoạt động của mình. Một phòng ban được điền sẵn; kiêm nhiệm nhiều phòng thì chọn phòng phù hợp. Admin được chọn phòng đang hoạt động. Tài khoản Admin cũ chưa bố trí vị trí vẫn được nhận diện bằng tài khoản, không tự tạo hoặc bố trí hồ sơ nhân sự.
- Lưu bản chụp người/phòng ban, mã căn cứ và đích phân bổ tại thời điểm gửi. Đổi cơ cấu sau đó không sửa lịch sử đề nghị.
- Nút **Đề nghị từ hồ sơ này** tại báo giá đã lưu, đơn hàng, hợp đồng và lệnh sản xuất mở chọn loại đề nghị và điền sẵn căn cứ. Đề nghị mua chuyển vào quy trình mua vật tư hiện có. Chi tiết đề nghị có nút mở lại hồ sơ căn cứ; việc mở vẫn kiểm tra quyền máy chủ.
- Đề nghị cấp/bổ sung vật tư và lịch sử sửa máy giữ căn cứ trên chứng từ kết quả. Nhập kho từ đề nghị mua giữ căn cứ trên lô và phiếu nhập; cấp từ lô mua giữ đích trên phiếu xuất.
- Chi phí mua vật tư theo đơn hàng/hợp đồng/lệnh được gắn đúng `orderId`, `contractId`, `jobId` khi nhập kho. Vật tư bổ sung không được coi là nhu cầu BOM đã duyệt. Cấp kho không tạo thêm lần chi phí mua thứ hai.
- Đề nghị nhân lực/tăng ca/duyệt chi lưu đích công việc để đối chiếu. Duyệt đề nghị không tự tạo bảng công, trả lương hoặc chi tiền; các chứng từ thực tế vẫn theo quy trình tương ứng. Phiếu cấp từ tồn kho mang đích truy vết, không tự tạo thêm bút toán chi phí.
- Hồ sơ cũ thiếu căn cứ được ghi rõ, giữ nguyên dữ liệu; không suy đoán căn cứ lịch sử.

## Kiểm thử cục bộ

- `node --test tests/request-context.test.cjs tests/service-requests.test.cjs tests/material-requests.test.cjs`: đạt. Bao gồm toàn bộ loại đề nghị mặc định, giả mạo người/phòng, mã nguồn không hợp lệ/ngoài quyền, phòng ngừng hoạt động, bản chụp lịch sử, cấp kho, mua–giá–duyệt–nhận–nhập kho–cấp, gửi lặp, phân bổ chi phí và quy trình vật tư theo lệnh.
- `node tests/request-context-browser.cjs`: đạt. Nút ở báo giá/đơn hàng/hợp đồng/lệnh; điền sẵn nguồn; nhân viên chỉ có phòng được bố trí; gửi, tải lại và mở nguồn; mua vật tư bổ sung; màn hình di động.
- `node tests/service-requests-browser.cjs`: đạt. Cấp từng phần/toàn bộ, sửa chữa, lịch sử, tải lại, tài khoản nhân viên và di động.
- `node tests/department-material-requests-browser.cjs`: đạt. Lập/điều chỉnh, quản lý mã mục đích, giữ nháp và lịch sử.
- `npm run build`, `git diff --check`: đạt.

Các fixture tài khoản trong kiểm thử service/material đã chuyển sang quy trình khai báo–duyệt nhân sự–bố trí vị trí–tạo tài khoản hiện hành.

## Triển khai và kiểm tra web thật

- Runtime `ccf346f` đã đẩy lên GitHub và triển khai tại `https://truongphat-group.xyz`; sao lưu trước triển khai, container `healthy`, `/healthz` trả `ok`.
- HTML trên web khớp hoàn toàn bản build đã kiểm thử (sau chuẩn hóa xuống dòng).
- Playwright trên web thật: mở biểu mẫu cấp vật tư; đối chiếu người đề nghị với tài khoản; chọn phòng và mã đơn hàng; từ đơn hàng mở đề nghị mua với căn cứ điền sẵn; từ lệnh sản xuất mở đề nghị nhân lực; kiểm tra màn hình 390px. Không gửi đề nghị, không ghi dữ liệu nghiệp vụ.
- Chưa có hợp đồng trong danh sách nguồn của web thật để kiểm tra trực tiếp. Nhánh hợp đồng đã kiểm tra bằng hồ sơ cục bộ, gồm nút trên hồ sơ, điền sẵn và phân bổ chi phí mua về hợp đồng/đơn hàng.
- Phiên kiểm tra tạm đã thu hồi và tệp xác thực đã xóa.
