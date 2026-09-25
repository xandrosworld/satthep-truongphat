# Đợt 2 — Sản xuất, kho và mua hàng

Ngày triển khai: 25/09/2026. Phạm vi nhóm 09–15 và BS08 trong `README-CHECKLIST-GD2.md`. Đây là kết quả tự kiểm của bên triển khai, chưa thay thế nghiệm thu của khách.

## Luồng vận hành

1. Chốt đơn hàng và phát hành lệnh theo sản phẩm/số lượng lô. Tổng số lượng các lệnh không vượt đơn hàng. Lệnh giữ phiên bản nguồn, bản vẽ khai triển và định mức.
2. Mở **Sản xuất · Kho · Mua hàng → Lệnh & vật tư → Vật tư & công việc**. Khai vật tư kho bằng đúng mã liên kết báo giá và đơn vị nhu cầu. Tấm/thanh theo số tấm/thanh; vật tư rời theo đơn vị danh mục; vật tư theo khối lượng dùng kg.
3. Nhập tồn thực tế bằng phiếu nhập, có kho, kích thước, khối lượng mỗi đơn vị, giá và chứng từ. Tồn ban đầu không được tự suy từ dự toán báo giá.
4. Đối chiếu nhu cầu, chọn lô đủ kích thước/chiều dày, giữ riêng cho lệnh. Tồn khả dụng trừ phần giữ của mọi lệnh; không xuất tay phần đã giữ.
5. Thiếu vật tư: khai nhà cung cấp/bảng giá rồi tạo đề nghị mua. Hệ thống trừ tồn khả dụng và lượng đã đề nghị chưa nhập, có dự phòng do người dùng khai. Quy trình: chờ duyệt → duyệt hoặc từ chối → đặt → đang giao → nhận → nhập kho. Nhập kho sinh lô, phiếu nhập và khoản chi liên kết lệnh/đơn, không nhân đôi khi gửi lại cùng thao tác.
6. Xác nhận bản vẽ và chuẩn bị. Khi bắt đầu công đoạn đầu tiên, máy chủ kiểm vật tư đã giữ và tự xuất đúng các lô. Không đủ vật tư thì chặn. Lệnh không có công đoạn cũng phải kiểm/cấp kho trước QC.
7. Ghi người, máy, giờ và sản lượng. Có mã đợt/lô để lưu phần sản lượng tăng thêm trong cùng lệnh. Thêm công đoạn chuẩn bị/bổ sung từ danh mục trước khi bắt đầu sản xuất. QC và khóa hoàn thành giữ cơ chế kiểm đủ số lượng.
8. Quyết toán từng lượt cấp: sản phẩm + các mảnh dư nhiều kích thước + phế phải cân bằng khối lượng đã cấp. Phần dư giữ tấm nguồn và tấm gốc; không được lớn hơn nguồn hoặc khai khối lượng không khớp tỷ lệ diện tích. Phế có tỷ lệ và lịch sử.
9. Giao đầu mục theo lệnh, người, công đoạn, máy và hạn. Nhân sự báo cáo ngày, giờ, sản lượng, vướng mắc; ghi kết quả xử lý. Xem tổng hợp tháng, công suất máy/xưởng và cảnh báo quá tải/trễ hạn. Giờ công suất lấy từ báo cáo ngày; giờ trên công đoạn là dữ liệu thực hiện tổng hợp của công đoạn.

## Ánh xạ kiểm tra

| Mã | Chức năng / bằng chứng |
|---|---|
| 09.01–09.02 | Danh sách lệnh, tìm/lọc xưởng và ngày, chi tiết nguồn; người phụ trách theo công đoạn/đầu mục |
| 09.03–09.05 | Chuẩn bị, công đoạn mở rộng, người/máy/giờ, lô sản lượng, bắt đầu/hoàn tất; test production và UI |
| 09.06–09.08 | Đối chiếu kho, chặn thiếu, giữ riêng, tự xuất khi bắt đầu; test thiếu kho, cấp trùng và bắt đầu công đoạn |
| 09.09 | Định mức/lượng công việc và chi phí từ bản nguồn theo số lượng lệnh; chỉ hiện giá theo quyền. Không quy đổi kg/lần thành giờ khi chưa có định mức giờ |
| 09.10–09.12 | QC, khóa hoàn thành, in lệnh; đối chiếu nhu cầu/kích thước, giữ kho, cấp và quyết toán |
| 09.13–09.14 | Chi phí thực tế theo lệnh, chứng từ mua và khoản chi bổ sung; giao đầu mục và báo cáo ngày |
| 10.01–10.04 | Bảng lệnh/công đoạn; máy và công suất theo xưởng; lọc ngày/xưởng; quá tải/trễ hạn |
| 11.01–11.07 | Danh mục công đoạn/máy/xưởng, sửa nhanh giá giờ, hệ số, liên kết ma trận báo giá, đếm sử dụng, chặn xóa có nguồn, Excel |
| 12.01–12.07 | Đầu mục theo lệnh/đơn/công đoạn, cá nhân và hạn, báo cáo ngày, vướng mắc/xử lý, lọc tháng/người và Excel |
| 13.01–13.06 | Vật tư kho, nhóm/vị trí/đơn vị/tối thiểu, trạng thái tồn, lịch sử và lệnh sử dụng, Excel |
| 13.07–13.14, BS08 | Lô tấm/thanh, kích thước, nhu cầu, giữ riêng, xuất đúng lô, nguồn phần dư, phế và cân đối khối lượng |
| 13.15–13.18 | Nhà cung cấp, liên hệ/MST, bảng giá/thời gian giao, sửa/xóa có kiểm tra lịch sử, lịch sử mua |
| 14.01–14.07 | Phiếu nhập/xuất, nhập/xuất thủ công, tồn và giá trị theo kho, tổng nhập/xuất/tồn, nguồn và Excel |
| 15.01–15.09 | Danh sách/lọc, các bước mua, tính thiếu/dự phòng, duyệt/từ chối có người, nhận/nhập thật, in/Excel, giá nhà cung cấp và khoản chi nguồn |

## Quyền và dữ liệu cũ

- Bốn nhóm quyền mới trong ma trận: **Kho và vật tư**, **Mua hàng**, **Điều hành xưởng**, **Công việc và báo cáo ngày**. Không tự mở quyền cho toàn bộ tài khoản cũ. Quản trị cấp theo vị trí; người mở đối chiếu lệnh cần quyền xem Sản xuất.
- Quyền thao tác kiểm ở máy chủ. Giá/chi phí còn cần quyền xem chi phí nội bộ. Người chỉ xem kho không được nhập/xuất hoặc xem giá trị tiền.
- Lệnh mới bắt buộc nối kho. Lệnh cũ chưa bắt đầu được nối kho khi giữ vật tư lần đầu. Lệnh cũ đã chạy giữ cách xử lý lịch sử, không phát sinh phiếu xuất hồi tố; cần đối soát tồn đầu kỳ trước khi tiếp tục vận hành kho mới.
- Nhận hàng hiện đối chiếu đủ số lượng yêu cầu trước khi nhập; hàng giao thiếu hoặc sai quy cách phải xử lý với nhà cung cấp trước khi xác nhận. Không tự ghi đủ khi thực nhận thiếu.
- Khoản mua tự sinh được ghi **chưa thanh toán**; không tự khẳng định đã chi tiền. Sổ tiền, thanh toán và phân bổ tổng hợp tiếp tục ở đợt tài chính.
- Đối chiếu phần dư dùng kích thước bao của phương án cắt hiện có, theo hướng đặt hiện có; không tự thay đổi phương án sản xuất đã duyệt bằng một phương án tối ưu khác.
- SQLite backup/restore giữ các bảng mới. JSON backup quản trị bổ sung `opsRecords`, `stockMovements`, `opsRequests`. Lưu trùng do mất phản hồi mạng được chống bằng mã thao tác giữ nguyên trên form.

## Kiểm chứng

- `tests/operations-erp.test.cjs`: thiếu kho, giữ đồng thời, chống cấp trùng, xuất tự động, hoàn dư đúng nguồn/cân bằng, quy trình mua, chi phí không trùng, công việc/ngày/giờ/vướng mắc, quyền và ẩn giá.
- `tests/operations-erp-browser.cjs`: mua → nhận → nhập → giữ → bắt đầu công đoạn; máy/giao việc/báo cáo/xử lý vướng mắc; cảnh báo quá tải; Excel; 1440/390 px; giả lập mất phản hồi sau khi máy chủ đã nhập kho rồi gửi lại, chỉ tạo một lô.
- `tests/production-server.test.cjs`, `tests/production-browser.cjs`: hồi quy phát hành, quyền kỹ thuật, xung đột phiên bản, đủ vật tư, công đoạn, bản vẽ, QC, hoàn thành, khóa, tải lại và lưu bền.
- Toàn bộ bộ kiểm thử máy chủ: 710 bài đạt trước triển khai. Ảnh và log tự kiểm lưu tại `artifacts/ops-*` trong workspace.

## Triển khai và kiểm tra web thật

- Bản chạy `dc28942`, đã đẩy mã nguồn và triển khai ngày 25/09/2026 sau khi sao lưu máy chủ.
- `/healthz` trả `ok: true`. Kiểm tra đủ 11 tab ở 1440 px và 390 px: không lỗi JavaScript, không tràn ngang trang.
- Máy chủ tại thời điểm kiểm tra có 0 lệnh sản xuất. Kiểm tra live chỉ đọc, chặn các yêu cầu ghi từ trình duyệt; luồng tạo chứng từ đến QC được kiểm thử trong môi trường riêng, không tạo tồn kho hoặc giao dịch giả trên web khách.
- Phiên quản trị tạm phục vụ kiểm tra đã thu hồi. Log: `artifacts/vietnix/ops-live-check.txt`; ảnh: `artifacts/vietnix/ops-live-1440.png`, `artifacts/vietnix/ops-live-390.png`.
- Trước vận hành thực tế cần quản trị cấp bốn nhóm quyền mới theo vị trí và bộ phận kho khai tồn thực tế/chứng từ đầu kỳ.
