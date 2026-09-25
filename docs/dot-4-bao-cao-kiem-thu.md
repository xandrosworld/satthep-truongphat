# Đợt 4 — Báo cáo và kiểm thử liên thông

Ngày cập nhật: 25/09/2026. Phạm vi: các mã 18.01–21.04 của checklist GĐ2 (17 đầu mục). Đánh dấu hoàn thành bên dưới là tự kiểm chức năng, chưa thay thế nghiệm thu của khách hàng.

## Cách sử dụng

1. Mở **Trung tâm báo cáo** ở menu trái.
2. Chọn Tổng quan, Sản xuất, Doanh thu & công nợ hoặc Vật tư & tồn kho.
3. Chọn tháng mốc và kỳ Tháng/Quý/Năm, hoặc nhập khoảng ngày. Có thể lọc khách hàng, phân xưởng và kho theo loại báo cáo.
4. Bấm **Xem báo cáo** để áp dụng. Các nút tên bảng đưa đến đúng bảng; **Mở nguồn** mở chứng từ/lệnh liên quan.
5. **Xuất Excel** lấy kỳ và bộ lọc đã áp dụng. Chỉnh ô ngày nhưng chưa bấm Xem báo cáo sẽ không làm thay đổi kỳ xuất. File có trang Căn cứ và từng bảng riêng; số tiền/số lượng là ô số.

Chưa có chứng từ phù hợp sẽ hiển thị chưa có dữ liệu, không sinh số liệu minh họa. Bộ lọc khách hàng chỉ áp dụng doanh thu/công nợ; xưởng áp dụng sản xuất; kho áp dụng vật tư. Thu chi tổng quan chỉ theo kỳ ngày.

## Đối chiếu chức năng

| Mã | Chức năng đã tự kiểm |
|---|---|
| 18.01 | Trung tâm báo cáo; mở loại báo cáo và bảng chi tiết |
| 18.02 | Chỉ số doanh thu, công nợ, lệnh QC, tồn kho, thực thu/chi theo quyền |
| 18.03 | Tháng, quý, năm, khoảng ngày; chọn kỳ quá khứ |
| 19.01 | Sản lượng QC theo sản phẩm và đơn vị |
| 19.02 | Tiến độ, số công đoạn hoàn thành, tỷ lệ, hạn và cảnh báo trễ |
| 19.03 | Hiệu suất phân xưởng từ giờ định mức và giờ thực tế |
| 19.04 | Tỷ lệ đạt QC theo lệnh và đơn vị |
| 19.05 | Excel sản xuất |
| 20.01–20.03 | Doanh thu theo tháng, khách hàng, sản phẩm và đơn hàng nguồn |
| 20.04 | Phải thu, đã thu, còn thu, hạn và quá hạn theo hợp đồng |
| 20.05 | Excel doanh thu/công nợ |
| 21.01 | Nhập – xuất – tồn đầu/cuối kỳ từ nhật ký kho |
| 21.02 | Giá trị tồn theo giá trị chứng từ, có kiểm soát quyền chi phí |
| 21.03 | Vật tư đến ngưỡng tối thiểu, kể cả chưa có nhập kho |
| 21.04 | Excel vật tư/tồn kho |

## Căn cứ tính số liệu

- Ngày theo giờ Việt Nam. Báo cáo dùng chứng từ còn hiệu lực hiện tại; việc sửa/hủy chứng từ sau kỳ có thể đổi kết quả kỳ cũ. Chưa phải sổ khóa kỳ kế toán.
- Doanh thu là giá chốt chưa thuế của đơn **đã xác nhận giao**, theo ngày giao. VAT/sau thuế tách cột. Không tính báo giá, đơn chưa giao, đơn hủy hoặc tiền ứng trước thành doanh thu. Tổng dòng sản phẩm được đối chiếu tổng đơn; chênh lệch cấp đơn hiển thị riêng.
- Công nợ cuối kỳ gồm hợp đồng có hiệu lực từ trước kỳ và các phiếu thu hợp lệ đến cuối kỳ. Giá trị/hạn hợp đồng dùng bản hiện hành. Tiền thu trong kỳ khác với doanh thu trong kỳ.
- Thực thu lấy phiếu thu hợp đồng và sổ tiền; thực chi lấy sổ tiền. Chi phí phát sinh chưa thanh toán không thành thực chi.
- Sản lượng lấy lần QC đang có hiệu lực của lệnh, theo ngày QC. Không cộng các đơn vị khác nhau và không đếm lại sản phẩm qua từng công đoạn.
- Tiến độ là **hiện tại** của các lệnh liên quan kỳ, không giả lập tiến độ lịch sử. Không có công đoạn thì tỷ lệ hiển thị `—`.
- Hiệu suất = giờ định mức / giờ thực tế × 100%, theo công đoạn hoàn tất trong kỳ và xưởng hiện hành của lệnh. Chỉ tính khi mọi công đoạn có định mức giờ và giờ thực tế > 0; không đổi kg/lần sang giờ.
- Kho: tồn đầu + nhập − xuất = tồn cuối. Hoàn dư là nhập lại; phế đã nằm trong lượng cấp sản xuất nên không trừ thêm lần nữa. Cộng theo vật tư/kho/đơn vị, giữ phần lẻ số lượng.
- Vật tư sắp hết so với ngưỡng danh mục hiện hành trong phạm vi kho đã chọn, chưa trừ lượng đang giữ cho lệnh.

## Phân quyền

- Thêm phân hệ **Trung tâm báo cáo** với Xem và Xuất/in trong ma trận quyền. Admin có sẵn; người khác cần được cấp cụ thể.
- Mỗi loại cần quyền Xem nguồn tương ứng: đơn hàng, lệnh sản xuất, kho. Công nợ thêm quyền hợp đồng và thu tiền. Thực thu/chi cần quyền tài chính và xem chi phí nội bộ; giá trị kho cần quyền chi phí và xem nội bộ.
- Xuất cần cả quyền xuất báo cáo và xuất phân hệ nguồn. Bảng công nợ cần quyền xuất hợp đồng. Tổng quan kiểm tra tất cả phân hệ đang hiển thị.
- Máy chủ kiểm tra quyền; không chỉ ẩn nút. Xuất báo cáo ghi nhật ký. Đăng xuất/đổi phiên xóa dữ liệu báo cáo khỏi trạng thái trình duyệt; phản hồi đến muộn không được hiển thị vào phiên khác.
- Báo cáo trả tập cột được phép, không trả chứng từ thô hoặc chi phí cho tài khoản chỉ xem số lượng. Quyền báo cáo độc lập với quyền sửa cấu thành/công thức báo giá.

## Bằng chứng kiểm thử

- `tests/reports.test.cjs`: doanh thu/VAT/ứng trước; công nợ đầu kỳ; đối chiếu sản phẩm; biên ngày Việt Nam; hoàn dư/phế; số lượng lẻ; QC khác đơn vị; thiếu định mức giờ; quyền nguồn/xuất/chi phí; bộ quyền tùy chỉnh không có quyền cấu thành báo giá; ngày không hợp lệ; nhật ký xuất.
- `tests/reports-flow.test.cjs`: tạo báo giá → trình/duyệt → đơn hàng → lệnh → mua phần thiếu → nhập/cấp kho → công đoạn/QC → hoàn thành → giao → hợp đồng/thu tiền → thanh toán mua hàng → báo cáo. Gửi lặp phiếu thu/chi không nhân đôi tiền.
- Cùng kiểm thử mở một bản SQLite sao lưu độc lập bằng ứng dụng mới: bảng/chỉ số báo cáo và số giao dịch kho khớp nguồn.
- `tests/reports-browser.cjs`: bốn loại, tháng/quý/năm, Excel có ô số, bộ lọc đã áp dụng, desktop 1440 px/mobile 390 px, quyền hạn chế, đăng xuất/tải lại; không lỗi JavaScript.
- Bộ hồi quy: 732/732 đạt; kiểm tra báo cáo cuối sau sửa quyền: 5/5 đạt. Build một file HTML không phụ thuộc runtime ngoài thành công.

## Phần còn cần nghiệm thu/bàn giao

- D.01: đã tự kiểm một đơn liên thông, còn đối chiếu chứng từ và quy tắc số liệu thực tế cùng khách.
- D.02–D.03: chưa ghi nhận chạy thử/nghiệm thu và đào tạo người dùng thực tế.
- D.04: cần chốt tài khoản, bộ quyền từng vị trí và quy trình vận hành thực tế.
- D.05: đã kiểm SQLite phục hồi cho luồng mẫu; chưa coi là hoàn tất diễn tập khôi phục toàn bộ máy chủ, tệp đính kèm và cấu hình bí mật.
- D.06: chưa coi là nghiệm thu cuối hoặc ký bàn giao. Các tài liệu build/deploy và mã nguồn hiện có được duy trì; biên bản khách cần xác nhận riêng.

Không đánh dấu toàn bộ GĐ2 hoàn thành dựa trên số lượng test. Các mục ngoài nhóm 18–21 giữ trạng thái và bằng chứng riêng.

## Triển khai và kiểm tra web thật

- Runtime `acfe643` đã triển khai ngày 25/09/2026; có sao lưu SQLite trước khi thay ứng dụng. Mã nguồn đã đẩy lên Git.
- Bộ hồi quy cuối sau sửa quyền: 732/732 đạt, không bỏ qua test. Build thành công.
- Kiểm tra HTTPS trực tiếp: cả bốn loại báo cáo, 1440 px và 390 px, nút Excel hiện theo quyền Admin, không lỗi JavaScript, không tràn trang. Không tạo/sửa chứng từ kinh doanh khi kiểm tra live.
- Dữ liệu thật thời điểm kiểm tra: một dòng tiến độ sản xuất; chưa có doanh thu giao hàng, QC hoặc giao dịch kho phù hợp trong kỳ. Hiển thị trống đúng thực tế, không dùng dữ liệu mẫu để làm đầy báo cáo.
- Phiên kiểm tra tạm đã thu hồi và xóa tệp token; `/healthz` trả OK.
