# Nguyên công chi tiết và trọn gói TMC

Khách xác nhận: gom về một màn Nguyên công & hệ số, bỏ hai tab con; phân loại nguyên công ngay trong form. Nguyên công trọn gói chỉ ảnh hưởng phương án TMC, giữ nguyên khai báo công đoạn kỹ thuật.

## Cách sử dụng

1. Đơn giá đầu vào → Nguyên công & hệ số → + Nguyên công.
2. Chọn **Chi tiết** để khai giá công việc như trước, hoặc **Trọn gói** để chọn bảng giá theo khổ rộng, hệ số tác động và công tại xưởng đã bao gồm. Nhóm sản phẩm áp dụng khai riêng.
3. Bảng giá theo khổ rộng nằm trên cùng màn, mở rộng để thêm/sửa. Không còn hai tab con.
4. Gói xuất hiện trong danh sách và trong ma trận Hệ số tính toán của Danh mục quy ước. Mỗi hệ số khai một lần, gắn vào các công việc cần áp dụng.
5. Phát hành danh mục để chia sẻ. Báo giá cũ giữ cấu hình riêng; chủ động lấy lại bảng TMC để áp dụng thay đổi.
6. Bảng phân tích có phần Đối chiếu công trọn gói TMC: tên gói, công đã gồm, lượng, đơn giá và tiền công.

## Quy tắc tính

- Đơn giá tra bảng khổ rộng × hệ số được chọn × lượng theo đơn vị bảng. Thang/máng theo m, phụ kiện theo cái.
- Chỉ thay tiền công tại xưởng được chọn trong gói tương ứng; thuê ngoài, vật tư định mức và công chưa gồm vẫn tính riêng.
- Không cộng tiền công bảng khổ rộng và tiền gói hai lần. Mỗi bảng chỉ gắn một gói mặc định để tránh cấu hình mâu thuẫn.
- Hệ số khổ rộng bổ sung là điều chỉnh thêm sau giá tra bảng; không tự chọn hệ số này.
- Không thay công đoạn kỹ thuật, không tự chèn gói thành công đoạn sản xuất, không đổi số tiền phương án chi tiết.
- Cấu hình gói theo cơ chế trước vẫn đọc được. Các báo giá đã lưu không bị chuyển tự động.

## Kiểm tra

- `tests/package-operation.test.cjs`: m/cái, từng gói thay đúng công, hệ số dùng chung, cấu hình lỗi không ghi dở, cấu hình cũ giữ theo báo giá, thuế nguồn giá bảng, dữ liệu dành cho kỹ thuật.
- `tests/package-operation-browser.cjs`: tạo/sửa, đóng/mở lại, phát hành và lấy lại danh mục qua API máy chủ thử nghiệm, ma trận hệ số, áp dụng vào báo giá và đối chiếu kết quả.
- `tests/tmc-labor-browser.cjs`: hồi quy cấu hình gói cũ.
- `tests/tmc-customer-scope-browser.cjs`: màn thống nhất, đơn vị và phạm vi phí theo nhóm.
- `tools/verify-package-operations-live.cjs`: xác minh mã đang chạy giống bản build; chụp giao diện Railway và chạy gói mẫu trong bộ nhớ trình duyệt riêng. Chặn mọi API ghi nghiệp vụ, đối chiếu danh mục/danh sách báo giá trước và sau. Phần lưu lâu dài qua API được kiểm tra ở máy chủ thử nghiệm, không đưa mẫu QA vào danh mục khách.

Ảnh và kết quả kiểm tra thật nằm tại `artifacts/customer-review/package-operations/live/`; kết quả kiểm tra máy chủ thử nghiệm tại `artifacts/customer-review/package-operations/local/`.

Kết quả ngày 17/09/2026: 456/456 kiểm tra tự động đạt; ba luồng trình duyệt nêu trên đạt. Bản ứng dụng `ef6d0df` đã triển khai thành công trên Railway và khớp mã băm bản build. Sáu ảnh đã chụp; kiểm tra trên bản triển khai xác nhận gói được áp dụng, dữ liệu kỹ thuật và giá phương án chi tiết giữ nguyên, không có lỗi tính toán/trình duyệt. Danh mục và danh sách báo giá máy chủ trước/sau giống nhau.
