# Đợt 1 — khung ERP và kinh doanh

**Đã triển khai ngày 25/09/2026:** bản chức năng `341acaa`, bản vá quyền xem dòng hàng thương mại `420a5b7`. Web: https://truongphat-group.xyz.

Kết quả cuối: **679/679 kiểm thử đạt**; 5 bộ kiểm tra trình duyệt (business, business-flow, CRM, production, organization) và bản sao dữ liệu thật đạt. Kiểm tra có đăng nhập sau triển khai trên màn hình 1440 và 390 px đạt; máy chủ healthy. Hash của 17 báo giá, 135 phiên bản, 10 khách hàng, 17 tài khoản, cơ cấu, đơn và lệnh không thay đổi. Không tạo dữ liệu nghiệp vụ mẫu trên web thật. Phiên kiểm tra tạm đã thu hồi.

## Luồng sử dụng

1. **Khách hàng:** khai hồ sơ, phân loại, người phụ trách; theo dõi chăm sóc và cơ hội. Danh sách tìm/lọc và phân trang 25 dòng. Hồ sơ có 6 tab: thông tin, báo giá, đơn hàng, hợp đồng, công nợ, lịch sử giao dịch.
2. **Báo giá:** tiếp tục quy trình hiện có. Báo giá đã duyệt mới chuyển được thành đơn hàng; thao tác lặp không tạo thêm đơn cùng báo giá.
3. **Đơn hàng:** kiểm tra dòng hàng, số lượng, giá trị và phiên bản nguồn. Admin chốt để phát hành lệnh. Có hạn giao, ghi chú và phân bổ người phụ trách (tổng 100%). Danh sách lọc mã/khách/công trình, trạng thái, khoảng ngày; xuất Excel và in.
4. **Sản xuất:** dùng lệnh hiện có cho từng sản phẩm/lô. Trạng thái đơn suy từ toàn bộ số lượng đặt: lệnh mới chuẩn bị vẫn Chờ sản xuất, bắt đầu thực hiện chuyển Đang sản xuất; phải hoàn thành đủ lượng của mọi sản phẩm mới Hoàn thành. Xác nhận người nhận và ngày giao mới chuyển Đã giao. Hủy đơn chỉ bởi Admin, khi chưa có lệnh hay hợp đồng còn hiệu lực.
5. **Hợp đồng:** lập từ đơn đã chốt hoặc khai độc lập với hồ sơ khách hàng. Liên kết đơn giữ ID và phiên bản báo giá gốc. Khai số, loại, giá trị, ngày ký, hiệu lực, hạn thanh toán, nội dung và ghi chú. Số hợp đồng không trùng; một đơn chỉ có một hợp đồng chưa hủy. In nội dung đã khai, xuất Excel danh sách đã lọc.
6. **Thu tiền / chi phí thực tế:** Admin ghi chứng từ tại hợp đồng đang thực hiện. Thu tiền giảm công nợ; không thu quá số còn phải thu. Chứng từ có mã thao tác chống gửi lặp và số chứng từ chống nhập trùng. Hủy ghi nhận phải có lý do, lưu dấu vết. Hợp đồng đã có thu/chi không đổi khách hoặc đơn nguồn; tất toán phải thu đủ. Muốn hủy chứng từ của hợp đồng đã tất toán phải mở lại hợp đồng trước.
7. **Doanh số và mức hưởng:** Admin khai danh mục chính sách theo khoảng giá trị hợp đồng và biên lợi nhuận, chọn căn cứ giá trị hợp đồng hoặc lợi nhuận, khai tỷ lệ đã thống nhất. Chọn chính sách tại đơn hàng; bản chọn giữ phiên bản riêng, sửa danh mục không tự đổi đơn cũ. Rà soát/chốt chi phí tại hợp đồng. Tiền hưởng = căn cứ × mức hưởng × tỷ lệ tiền thực thu × tỷ lệ phân bổ nhân viên. Giá trị hợp đồng và chi phí phải cùng phạm vi thuế; người rà soát xác nhận căn cứ. Chi phí thay đổi làm mất xác nhận và dừng tính đến khi rà lại. Chưa khai chính sách/đủ dữ liệu thì hiện lý do, không coi là tiền lương đã trả. Ghép bảng lương là đợt nhân sự.
8. **Hồ sơ năng lực:** Admin khai pháp lý/ngành nghề/giới thiệu; sơ đồ phòng ban lấy từ cơ cấu đã khai. Khai thiết bị, năng lực nhân sự, chứng chỉ và dự án. Tài liệu PDF/PNG/JPEG tối đa 5 MB mỗi tệp, 20 tệp/mục. Chọn phần cần xuất: in/lưu PDF hoặc ZIP gồm HTML, Excel và bản scan/hình ảnh. Gói ZIP tối đa 100 MB mỗi lần.

## Quyền và bảo toàn dữ liệu

- Module kinh doanh mới cần quyền xem cả khách hàng và thương mại, áp dụng cho Admin, Kinh doanh, Lập giá và Người duyệt. Quyền sửa cần quyền thương mại và không phải vai trò Người duyệt. Không tự mở quyền cho tài khoản cũ.
- Admin khai hồ sơ năng lực, chính sách hưởng, chốt chi phí, ghi/hủy thu chi, hủy đơn và xóa khách chưa giao dịch. Quyền tạo/chốt/phát hành lệnh hiện có được giữ nguyên.
- Người không có quyền chi phí không nhận chi phí thực tế hoặc căn cứ chốt chi phí từ API; nếu có khoản hưởng thì chỉ nhận dòng của chính mình.
- Khách đã có báo giá/đơn/hợp đồng không xóa: chuyển Ngừng giao dịch để giữ liên kết. Khách chưa giao dịch có thể xóa có lý do; bản hồ sơ trước xóa được lưu trong dữ liệu sao lưu.
- Lưu theo phiên bản, từ chối bản cũ khi có người khác sửa. Không sửa giá hoặc nội dung lịch sử báo giá, không đưa dữ liệu mẫu vào máy chủ thật.
- Dữ liệu mới nằm trong `business_records`, tệp trong `business_files`; đã đưa vào bản sao lưu API. Sao lưu SQLite trên máy chủ bao gồm toàn bộ các bảng.

## Phạm vi các đợt tiếp theo

Khung Tổng quan/Kho/Tài chính/Báo cáo ghi rõ phần đã dùng được và phần triển khai tiếp. Không có số liệu tồn kho, doanh thu hoặc chỉ số điều hành giả. Sản xuất/kho/mua hàng hoàn thiện ở đợt 2; tài chính tổng hợp, lương và điều hành ở đợt 3; dashboard/báo cáo liên phân hệ và đối soát toàn hệ thống ở đợt 4. Các mục mở rộng phân quyền chưa thống nhất không triển khai trong đợt này.

## Bằng chứng kiểm tra

- `tests/business.test.cjs`: hợp đồng, công nợ, thu/chi, gửi lặp, phiên bản cũ, quyền API, tệp, sao lưu, bảo vệ xóa, trạng thái đơn theo đủ số lượng, ZIP nhị phân.
- `tests/business-commission.test.cjs`: thực thu, lợi nhuận thực tế, phân bổ, điều kiện chưa đủ và làm tròn không âm.
- `tests/business-browser.cjs`: nhập hợp đồng, thu tiền, hồ sơ năng lực, tải lại, Excel, lọc, desktop/mobile.
- `tests/business-flow-browser.cjs`: báo giá duyệt → đơn chốt → chọn chính sách → hợp đồng nguồn → chốt chi phí → 6 tab khách hàng → lịch sử → ZIP.
- `tests/crm-browser.cjs`, `tests/production-browser.cjs`: hồi quy chăm sóc/cơ hội, giữ thông tin nguồn; lệnh sản xuất, xung đột, công đoạn, QC.
- Bản sao dữ liệu thật trước triển khai: mở đủ 17 báo giá; hash các bảng báo giá, 135 phiên bản, đơn hàng, khách hàng, cơ cấu, lệnh sản xuất không đổi sau kiểm tra.

Tự kiểm đạt không thay thế xác nhận nghiệm thu của khách hàng.
