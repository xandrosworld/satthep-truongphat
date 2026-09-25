# Đợt 3 — Tài chính, chấm công, lương và điều hành

Ngày: 25/09/2026. Phạm vi chức năng: nhóm 16, 17, 22, 25 và 26 của `README-CHECKLIST-GD2.md`. Kết quả dưới đây là tự kiểm của bên triển khai; nghiệm thu khách và báo cáo tổng hợp đợt 4 được ghi riêng.

## Sử dụng

- **Thu chi · Công nợ · Giá thành**: khai ngày, chứng từ, người phụ trách, nội dung, loại chi, xưởng/lệnh/đơn hàng; phân bổ từng khoản vào các đơn. Tổng phân bổ không vượt chi phí. Chi phí mua đã nhận kho dùng chứng từ nguồn, không nhập thêm lần nữa. Ghi chi trả từng phần và đối chiếu số còn phải trả. Thu hợp đồng tiếp tục ghi tại hợp đồng, tự xuất hiện trong sổ tiền và công nợ.
- **Đối chiếu đơn hàng**: doanh thu, chi phí đã phân bổ, lãi/lỗ và tỷ suất; dự toán vật tư, vận chuyển, nhân công lấy từ đúng phiên bản báo giá nguồn. Xem chứng từ thực tế và mở đơn nguồn để rà danh mục/đơn giá cho lần báo giá sau. Không tự ghi đè giá trong bản đã duyệt. Người có quyền xác nhận chi phí phải kiểm tra đủ chứng từ và cùng phạm vi thuế với doanh thu. Thay nguồn hoặc doanh thu làm mất hiệu lực lần rà soát cũ.
- **Chấm công**: khai các nhóm giờ thường, công trường, tăng ca, ngày nghỉ, ngày lễ, nghỉ hưởng lương và nghỉ không lương. Tổng một nhân sự/ngày không vượt 24 giờ. Duyệt ngày công; mở sửa có lý do. Tổng ngày quy đổi theo giờ chuẩn của nguyên tắc lương tương ứng.
- **Nguyên tắc & bảng lương**: khai nhóm sản xuất/văn phòng/kinh doanh, ngày và giờ chuẩn, hệ số tăng ca/nghỉ/lễ/công trường/bổ sung, phụ cấp và tỷ lệ bảo hiểm. Hồ sơ lương có ngày vào làm/thâm niên từ hồ sơ nhân sự, lương thực tế, căn cứ bảo hiểm, phụ cấp, thuế và khấu trừ. Tính kỳ → rà soát → duyệt → chi lương. Kỳ đã duyệt giữ bản chụp đầu vào; thay đầu vào trước duyệt buộc tính lại. Ngày công của kỳ đã chốt bị khóa.
- **Giao việc & báo cáo ngày**: tự giao hoặc người phụ trách giao việc, có người nhận/hạn/giờ dự kiến và lệnh nếu có. Người nhận xác nhận → bắt đầu → báo hoàn thành; lãnh đạo xác nhận hoặc yêu cầu làm lại. Báo cáo ghi giờ, khối lượng, vướng mắc, kiến nghị, việc ngày sau và kết quả xử lý. Có thông báo chuyển bước, tổng hợp theo nhân sự và bộ lọc ngày; xuất Excel.
- **Nhân sự**: giữ quy trình khai/gửi duyệt/cập nhật hồ sơ và kích hoạt tài khoản đã triển khai; bổ sung lọc vị trí, thống kê phòng ban và đường dẫn công việc/công đoạn của nhân sự theo quyền. Xuất danh sách và hồ sơ riêng bằng Excel.

## Công thức và đối soát

- Lương giờ = lương tháng / ngày chuẩn / giờ chuẩn. Giờ thường, công trường và nghỉ hưởng lương nhận lương cơ sở. Tăng ca/nghỉ/lễ dùng hệ số riêng. Phần tăng thêm công trường = giờ công trường × lương giờ × (hệ số công trường − 1), cộng phụ cấp công trường theo ngày quy đổi. Hệ số bổ sung áp dụng trên lương thường + lương thêm + công trường; mức 1 không làm tăng/giảm.
- Phụ cấp cố định tính theo tháng đã khai. Thuế, khấu trừ và tỷ lệ bảo hiểm là dữ liệu do người phụ trách cấu hình; chưa tự áp biểu thuế hoặc tích hợp máy chấm công.
- Thực nhận = tổng hưởng − bảo hiểm người lao động − thuế − khấu trừ. Chi phí doanh nghiệp = tổng hưởng + bảo hiểm doanh nghiệp. Duyệt lương ghi nhận chi phí phải trả; trả lương chỉ ghi tiền thực nhận. Phần bảo hiểm/thuế/khấu trừ còn lại vẫn phải đối soát và chi trả theo chứng từ tương ứng, không tự coi đã nộp.
- Tiền hưởng kinh doanh dùng chi phí thực tế đã phân bổ, chính sách đã chọn và số thu hợp đồng; trừ phần đã chốt trong kỳ trước. Màn hình hợp đồng và lương dùng chung căn cứ. Khi căn cứ giảm dưới số đã chốt, phải đối soát, không âm thầm sửa kỳ cũ.
- Mở lại kỳ đã duyệt chỉ khi chưa chi trả; lưu bản cũ và phân bổ cũ vào lịch sử, hủy khoản trích trước, xóa phân bổ hiệu lực để tính/phân bổ lại. Kỳ đã chi trả không được mở sửa; điều chỉnh cần ghi nhận có căn cứ ở kỳ tiếp theo.
- Khoản chi cũ chỉ được coi đã thanh toán khi có chứng từ tiền đối ứng. Sổ tiền là phát sinh kỳ, không phải số dư ngân hàng/quỹ khi chưa khai số đầu kỳ. Giá thành đơn hàng là lũy kế, không bị cắt theo bộ lọc ngày của sổ tiền. Khối lượng khác công việc không cộng thành một đơn vị chung.

## Quyền và bảo toàn dữ liệu

Ma trận chung có thêm **Thu chi, công nợ và giá thành**, **Chấm công**, **Hồ sơ và bảng lương**, cùng quyền **Duyệt** của công việc ngày. Không tự cấp các quyền mới cho bộ quyền cũ. Tài chính còn cần quyền chi phí nội bộ; xem chấm công không mở dữ liệu lương. Người giao/lãnh đạo thấy các công việc cần quản lý, người thực hiện chỉ thấy việc được giao hoặc tự tạo. API kiểm quyền, phiên bản và trạng thái; API sản xuất cũ không được bỏ qua khóa của luồng công việc mới.

Chứng từ tiền chống gửi lặp; CAS chống ghi đè phiên bản cũ; hủy ghi nhận có lý do. Lưu bản cũ khi đổi cấu hình, lương, công và chứng từ. Bảng đã duyệt và dữ liệu trước triển khai không được sửa bởi việc cài đặt chức năng mới. Sao lưu SQLite chứa các bảng mới; JSON backup quản trị bổ sung `enterpriseRecords` và `enterpriseRequests`.

## Ánh xạ kiểm tra

| Mã | Bằng chứng |
|---|---|
| 16.01–16.04 | Chi phí/chứng từ/người chi/đối tượng, chi chung, phân bổ không vượt, chi trả từng phần |
| 16.05–16.08 | Lãi/lỗ, công nợ hợp đồng, dự toán phiên bản nguồn, nhóm vật tư/vận chuyển/nhân công, chứng từ thực tế và đơn nguồn để rà giá |
| 16.09 | Sổ tiền và chi phí xuất Excel theo bộ lọc; công nợ và giá thành kèm theo |
| 17.01–17.05 | Luồng nhân sự hiện có; thêm lọc vị trí, thống kê phòng, liên kết công việc; test personnel/organization và browser hồ sơ 101 trường |
| 22.01–22.04 | Báo cáo khối lượng/giờ/người, vấn đề, đề xuất, ngày sau; tổng hợp và xuất theo kỳ |
| 25.01–25.04 | Hồ sơ, thâm niên, nguyên tắc cấu hình, duyệt công, tính/duyệt/trả lương, khóa và chống trả trùng |
| 26.01 | Tự giao/giao người khác, nhận/bắt đầu/xong/xác nhận/làm lại; thông báo và chặn API cũ |

## Kiểm chứng

- Hồi quy: 722/722 bài qua; sau bổ sung kiểm tra SQLite đóng/mở và lưu lịch sử, bộ kiểm tra liên quan 18/18 qua, trong đó 10 bài chuyên biệt đợt 3.
- `tests/enterprise.test.cjs`: số học lương, khoản phải trả, phân bổ, chứng từ lặp, hủy, stale inputs, khóa công, quyền và phạm vi, commission giữa hai kỳ, mở lại phân bổ và SQLite bền vững.
- `tests/enterprise-browser.cjs`: luồng UI tài chính → công → lương → trả → giao việc/báo cáo/xác nhận, Excel, reload và bốn trang ở 390 px.
- `tests/personnel-browser.cjs`, `tests/operations-erp-browser.cjs`: hồi quy nhân sự, mua/nhập kho/cấp lệnh và báo cáo xưởng.
- Đã triển khai bản `e5aecb4` lên `https://truongphat-group.xyz` sau sao lưu SQLite. Container xác nhận đúng image; `/healthz` trả `{"ok":true}`.
- Kiểm tra trực tiếp sau triển khai: Admin mở cả bốn màn hình ở 1440/390 px, tải lại trang; tài khoản không có quyền lương bị chặn API 403 và ẩn menu. Kiểm tra live chỉ đọc dữ liệu, không tạo giao dịch/công/lương thử trên hệ thống khách. Hai phiên xác minh tạm đã thu hồi.

Các báo cáo tổng hợp nhóm 18–21 và kiểm thử/nghiệm thu toàn hệ thống nhóm D vẫn thuộc đợt tiếp theo. Không dùng các dấu tự kiểm trên để kết luận toàn GĐ2 đã nghiệm thu.
