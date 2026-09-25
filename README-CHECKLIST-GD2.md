# Checklist triển khai GĐ2 — Trường Phát

**Mốc chốt hướng triển khai: trao đổi ngày 24/09/2026, 23:31–23:34.**

Tài liệu làm việc cho các đợt tiếp theo: bám luồng demo, triển khai trên web hiện tại, giữ phần báo giá và dữ liệu đã có, hoàn thiện theo hợp đồng. Checklist không tự thay đổi phạm vi, phí, tiến độ hoặc điều kiện nghiệm thu đã ký.

Cập nhật đợt 2: [Sản xuất, kho và mua hàng](docs/dot-2-san-xuat-kho-mua-hang.md). Các mã 09–15 và BS08 được đối chiếu theo tài liệu này; dấu hoàn thành là tự kiểm chức năng, chưa phải nghiệm thu khách. Giờ định mức chỉ có khi nguồn khai theo giờ; khoản mua tự sinh chưa đồng nghĩa đã thanh toán.

## 1. Căn cứ và thứ tự áp dụng

Cập nhật 25/09/2026: hoàn thiện [luồng gửi báo giá và chăm sóc sau gửi](docs/GUI-BAO-GIA-VA-CHAM-SOC.md), gồm phân công/thông báo sau duyệt, xác nhận gửi theo phiên bản và theo dõi phản hồi/vướng mắc/ngày chăm sóc. Đã tự kiểm thử; chưa đồng nghĩa khách nghiệm thu toàn bộ GĐ2.

1. [Hợp đồng và PL01–03](hop-dong-truong-phat-2026-09-10/BAN_KY_CHINH_THUC/HOP_DONG_XANDRO_TRUONG_PHAT_65TR_BAN_KY.docx): 203 chức năng, BS01–BS10 và điều kiện bàn giao.
2. Các URD/thay đổi đã được hai bên xác nhận; phần không sửa giữ theo hợp đồng.
3. [Demo khách gửi](https://6a8149e7dcc8070ad3049087--sunny-sherbet-713baf.netlify.app/): tham khảo bố cục, điều hướng và luồng nghiệp vụ; không sao chép dữ liệu mẫu hay lấy chức năng demo làm giới hạn hợp đồng.
4. [Checklist GĐ2 gốc](https://docs.google.com/spreadsheets/d/1HKKAJ2miLH1PZucjiw_JWAfnU2Occ5XcugX8YC04Exg/edit?gid=284004810#gid=284004810): 162 đầu mục. Danh mục cuối file được lấy từ bản đọc ngày 24/09/2026, chưa cập nhật trạng thái trên Google Sheet.

**Khách đã chốt:** cập nhật trên web của mình; ưu tiên luồng việc, không cần sao chép nguyên giao diện; tăng độ tương phản để dễ phân biệt. “21” là số mục menu demo, không phải số luồng độc lập.

## 2. Nguyên tắc theo dõi

- Tách ba mức: **lên khung → chức năng chạy thật và tự kiểm đạt → khách kiểm tra/xác nhận**. Có màn hình chưa đồng nghĩa hoàn thành nghiệp vụ.
- Ô `[x]` ở checklist thực hiện nghĩa là đã có bằng chứng tương ứng; không tự đồng nghĩa khách nghiệm thu. Xác nhận khách ghi riêng ngày và nội dung.
- Ở danh mục 162 mã, ô trống là **chưa xác nhận hoàn tất trong đợt đối chiếu mới**, không khẳng định chức năng chưa tồn tại. Kiểm tra lại phần có sẵn trước khi sửa hoặc viết mới.
- Không lấy số menu, số test hoặc mức bao phủ demo để tính % hoàn thành. Nếu báo tỷ lệ, phải ghi mẫu số, cách tính, bằng chứng và phân biệt với nghiệm thu/thanh toán.
- Giữ các mục thiếu trong hợp đồng dù demo không hiển thị. Không đưa các mục mở rộng chưa thống nhất vào tiêu chí nghiệm thu gói hiện tại.
- Không tự chốt hạn giao mới trong checklist. Mốc công việc thực hiện theo hợp đồng và các điều chỉnh đã xác nhận.

## 3. Điểm xuất phát

### Đã triển khai, có kiểm chứng

- [x] Tách menu Nhân sự / Cơ cấu tổ chức / Vai trò & phân quyền.
- [x] Bổ sung ma trận thao tác theo phân hệ/danh mục, quyền tùy chỉnh và phạm vi dữ liệu; cộng quyền theo nhiều vị trí, thu hồi phiên khi thay quyền. Kiểm chứng các phân hệ đang có, không tính các nghiệp vụ tương lai là đã hoàn thành. Chi tiết và giới hạn: [hướng dẫn bộ quyền](docs/bo-quyen-theo-ma-tran.md), `tests/action-access.test.cjs`, `tests/action-access-browser.cjs`. Chưa thay cho xác nhận nghiệm thu của khách.
- [x] Cơ cấu nhiều cấp, vị trí kiêm nhiệm, bộ quyền dùng chung; quản lý giao việc trong phạm vi cơ cấu.
- [x] Thêm luồng công việc và sắp xếp đơn vị cùng cấp. Danh mục luồng này **không phải** bộ máy tự thiết kế quy trình phê duyệt bất kỳ.
- [x] Ngày vào/kết thúc làm việc, nội dung phụ trách; bộ lọc, thống kê, Excel nhân sự; giữ lịch sử hồ sơ có tài khoản.
- [x] Rà soát quyền từng tài khoản, Excel ma trận; chế độ tự cập nhật theo bộ quyền; giữ quyền riêng cũ khi chưa chọn chuyển chế độ.
- [x] Tìm/lọc nhật ký, lịch sử quyền trước/sau từ khi triển khai tính năng.
- [x] Bản `2ffe6e8`: 675 kiểm thử đạt; kiểm tra giao diện nhân sự/tài khoản; kiểm tra web 1440 và 390 px; máy chủ healthy, lịch sử báo giá được bảo toàn.

Hướng dẫn: [Nhân sự, cơ cấu và quyền](docs/nhan-su-phong-ban.md). Các kết quả trên chỉ xác nhận đợt chức năng vừa làm, không xác nhận toàn GĐ2. Hồ sơ phụ trách hiện có nội dung khai tay; còn rà liên kết công đoạn/công việc thực tế khi hoàn thiện sản xuất.

### Theo dõi đợt triển khai mới

- [x] Tổ chức khung ERP; menu phân hệ còn lại ghi rõ trạng thái triển khai tiếp.
- [ ] Kiểm tra đủ 162 mã trên bản hiện tại và ghi bằng chứng từng mã.
- [ ] Hoàn thiện luồng xuyên các phân hệ còn thiếu.
- [ ] Kiểm thử, chạy thử, đào tạo và nghiệm thu toàn GĐ2.

## 4. Trình tự triển khai

### A. Khung tổng thể và khả năng nhìn rõ

- [ ] Lập bản đồ từng menu → mã hợp đồng → màn hình có sẵn/chưa có; tái sử dụng phần đã làm.
- [ ] Điều hướng chia nhóm Tổng quan, Kinh doanh, Sản xuất, Kho & vật tư, Tài chính, Nhân sự, Báo cáo, Quản trị; giao việc/chat truy cập thuận tiện.
- [ ] Giữ module báo giá hiện tại, đường mở báo giá và toàn bộ dữ liệu/phiên bản đã lưu.
- [ ] Mỗi phân hệ có trang danh sách, chi tiết, bộ lọc, trạng thái và thao tác theo quyền; phần chưa dùng được ghi rõ, không tạo số liệu giả trên web thật.
- [ ] Liên kết qua mã nguồn: từ đơn hàng mở được báo giá, từ lệnh mở được đơn hàng, từ vật tư/chi phí truy được nguồn phát sinh.
- [ ] Phân biệt màu 3 cấp sản phẩm/cấu kiện/vật tư, màu trạng thái, nút chính/phụ và vùng bị khóa; có chữ/ký hiệu, không chỉ dựa vào màu.
- [ ] Kiểm tra chữ/nền, focus bàn phím, bảng dài và thao tác trên màn hình 390 px lẫn máy tính; màu rõ nhưng vẫn đọc được.
- [ ] Bảo đảm menu và API cùng kiểm tra quyền, không chỉ ẩn nút.
- [ ] Kiểm thử, sao lưu, triển khai từng đợt lên web hiện tại; ghi phiên bản và kiểm tra sau triển khai.
- [ ] Gửi bố cục và luồng để khách rà; ghi kết quả phản hồi riêng, không tự đánh dấu nghiệm thu toàn GĐ2.

### B. Kinh doanh → đơn hàng → sản xuất

- [ ] Dashboard và khách hàng: chủ sở hữu, lịch sử tương tác, người phụ trách/công nợ, chuyển giao khi nghỉ việc.
- [ ] Báo giá → đơn hàng/hợp đồng giữ nguyên giá, thuế, thông tin kỹ thuật và phiên bản nguồn; không nhân bản chứng từ khi thao tác lặp.
- [ ] Đơn hàng đủ trạng thái, tiến trình 7 bước, phát hành lệnh và xác nhận giao hàng; trạng thái suy từ dữ liệu thực.
- [ ] Hợp đồng: hiệu lực, thanh toán, công nợ, chi phí thực tế, xuất/in theo mẫu chốt.
- [ ] Lệnh sản xuất: chuẩn bị, chia đợt/lô, định mức, người/máy/giờ, sản lượng, QC và khóa khi hoàn tất.
- [ ] Điều hành xưởng, công đoạn mở rộng, năng lực máy, cảnh báo trễ và báo cáo ngày gắn người/lệnh.

### C. Kho → mua sắm → cấp phát → hoàn dư

- [ ] Danh mục vật tư, nhà cung cấp, giá và lịch sử mua; tìm/lọc và xuất Excel.
- [ ] Tồn kho thật, nhập/xuất/điều chỉnh theo chứng từ, lịch sử có người và thời điểm.
- [ ] Kho tấm/phần dư/phế: truy tấm nguồn, giữ cho lệnh, chống cấp trùng, cân đối khối lượng.
- [ ] Thiếu vật tư → đề nghị mua → duyệt/từ chối → đặt → giao → nhận → nhập kho.
- [ ] Cấp phát theo định mức, chặn thiếu và hoàn dư/phế nối với lệnh; không coi lựa chọn tận dụng khi báo giá là nhập kho thật.
- [ ] Chi mua nối sổ chi/đơn hàng/lệnh, không sinh trùng khi gửi lại thao tác.

### D. Tài chính, nhân sự và điều hành

- [ ] Thu chi, thanh toán hợp đồng, công nợ, phân bổ chi phí, giá thành thực tế và so sánh dự toán.
- [ ] Hoàn thiện hồ sơ năng lực theo nhóm 08, dù demo chưa có menu riêng.
- [ ] Liên kết hồ sơ nhân sự với công đoạn/công việc thực tế; kiểm tra chuyển phòng/ngừng làm giữ lịch sử.
- [ ] Ngày công, tăng ca/nghỉ/lễ/công trường, nguyên tắc và bảng lương theo dữ liệu kiểm thử đã chốt.
- [ ] Giao việc, nhận/làm/hoàn thành/xác nhận, tiến độ và thông báo; báo cáo ngày theo người/công việc/lệnh.
- [ ] Giữ chat đang hoạt động; rà quyền nhóm, thông báo và liên kết công việc khi ghép vào khung mới.
- [ ] Báo cáo tổng hợp/sản xuất/doanh thu/vật tư/ngày tính từ dữ liệu thực; chọn kỳ và xuất Excel đúng nội dung.
- [ ] Quyền các phân hệ mới tích hợp nền tảng chung; rà xem/sửa/duyệt, dữ liệu nhạy cảm, khóa tài khoản, nhật ký cả UI và API.

### E. Kiểm tra xuyên suốt và bàn giao

- [ ] Chạy đơn mẫu: khách → báo giá → đơn/hợp đồng → lệnh → kho/mua → sản xuất/QC → giao → thu chi/công nợ/báo cáo.
- [ ] Đối chiếu số lượng, khối lượng, tiền, thuế và trạng thái theo bộ mẫu có đáp án.
- [ ] Thử nhiều tài khoản, đổi vai trò/khóa tài khoản, truy cập ID/URL trực tiếp và dữ liệu ngoài quyền.
- [ ] Thử đồng thời, lưu từ phiên bản cũ, gửi lặp; không mất dữ liệu hoặc nhân đôi chứng từ.
- [ ] Thử lưu/tải lại, sao lưu và phục hồi đầy đủ dữ liệu, file liên quan trong phạm vi chốt.
- [ ] Chạy thử với khách, sửa lỗi trọng yếu; lỗi nhỏ còn lại phải có danh sách/hạn và xác nhận.
- [ ] Đào tạo; bàn giao mã nguồn, schema/migration, cấu hình mẫu, build/deploy, tài liệu và bằng chứng kiểm thử.
- [ ] Lập biên bản nghiệm thu cuối GĐ2; không dùng xác nhận khung giao diện thay cho nghiệm thu chức năng.

## 5. Ánh xạ 21 mục demo

| Menu demo | Mã hợp đồng | Ghi chú |
|---|---|---|
| Dashboard | 01 | 7 đầu mục |
| Khách hàng | 02 | 7 đầu mục |
| Báo giá | 03, BS01–07, BS09 | Giữ phần đã làm; không cộng menu này thành tiến độ GĐ2 |
| Đơn giá đầu vào | 04 | Giữ và nối nền tảng hiện có |
| Danh mục quy ước | 05 | Giữ và nối nền tảng hiện có |
| Đơn hàng | 06 | 8 đầu mục |
| Hợp đồng | 07 | 7 đầu mục |
| Lệnh sản xuất | 09 | 14 đầu mục |
| Tiến độ sản xuất | 10 | 4 đầu mục |
| Công đoạn sản xuất | 11 | 7 đầu mục |
| Vật tư | 13, BS08 | Gồm kho tấm và nhà cung cấp theo hợp đồng |
| Tồn kho | 14 | 7 đầu mục |
| Mua sắm | 15 | 9 đầu mục |
| Nhân sự | 17 | 5 đầu mục |
| Chấm công | 25.03 | Nối nguyên tắc/bảng lương, không mặc nhiên tích hợp thiết bị |
| Báo cáo tổng hợp | 18 | 3 đầu mục |
| Báo cáo sản xuất | 19 | 5 đầu mục |
| Báo cáo doanh thu | 20 | 5 đầu mục |
| Báo cáo vật tư | 21 | 4 đầu mục |
| Người dùng & phân quyền | 23, BS09 | Quyền thật ở máy chủ |
| Cài đặt | 24 | 4 đầu mục |

**Bổ sung đủ theo hợp đồng dù demo thiếu menu:** 08 hồ sơ năng lực; 12 báo cáo ngày triển khai; 16 thu chi; 22 báo cáo ngày; phần còn lại của 25 tính lương; 26 giao việc; 27 chat; BS07–BS10 và các việc bàn giao GĐ2-D. Không sao chép giới hạn dữ liệu phiên trình duyệt hoặc xuất CSV của demo để thay cho dữ liệu máy chủ/Excel.

## 6. Tách riêng — chưa thống nhất mở rộng

Các mục sau không triển khai chỉ vì xuất hiện trong file phân quyền mới; phải đối chiếu URD/thỏa thuận cũ và chốt phạm vi/chi phí/thời gian nếu là bổ sung:

- Hạn mức duyệt nhiều cấp, tự chuyển cấp theo tiền và biên lợi nhuận.
- Ủy quyền đặc biệt theo thời gian, tự hết hiệu lực.
- Quyền riêng theo từng dự án; phạm vi đa chi nhánh/công ty thành viên.
- Bộ máy cấu hình workflow tổng quát, quy tắc phân tách nhiệm vụ xuyên phân hệ vượt các luồng đã ký.

Quyền nền tảng, bảo vệ dữ liệu/giá, trạng thái và duyệt theo hợp đồng vẫn phải hoàn thiện; không gom chúng vào phát sinh.

## 7. Ghi nhận từng đợt

| Đợt / commit | Mã đã xử lý | Bằng chứng tự kiểm | Triển khai web | Khách kiểm tra/xác nhận | Còn thiếu |
|---|---|---|---|---|---|
| `2ffe6e8` — trước đợt lên khung | Bổ sung nhân sự, rà soát quyền và lịch sử | 675 test; browser nhân sự/tài khoản; HTTPS desktop/mobile | Đã triển khai | Chưa ghi nhận xác nhận riêng cho đợt này | Rà từng mã; liên kết các phân hệ còn lại |
| Đợt 1 — `341acaa` + `420a5b7` | 02, 06, 07, 08; khung điều hướng | 679 test; 5 browser suites; bản sao dữ liệu thật; [chi tiết](docs/dot-1-kinh-doanh.md) | Đã triển khai 25/09; healthy; live 1440/390 px; hash dữ liệu cũ giữ nguyên | Chưa ghi nhận | Nối dữ liệu các đợt sau, kiểm tra mẫu in với khách |

## 8. Danh mục kiểm tra 162 mã GĐ2

Danh sách giữ mã và mô tả từ bản checklist gốc đã đọc ngày 24/09/2026. Các ô được đánh dấu có bằng chứng tự kiểm; các ô còn trống chờ rà soát; ghi bằng chứng và phiên bản trước khi đánh dấu. Những hạng mục đã có không phải làm lại nếu kiểm tra đạt.

### GĐ2-A (36)

| Kiểm đạt | Mã | Nội dung | Bằng chứng / còn thiếu |
|---|---|---|---|
| [ ] | 01.01 | 6 chỉ số điều hành Doanh thu, số đơn hàng, lệnh sản xuất, đang sản xuất, giá trị tồn kho, công nợ phải thu | Chờ rà soát |
| [ ] | 01.02 | Biểu đồ doanh thu 12 tháng | Chờ rà soát |
| [ ] | 01.03 | Biểu đồ cơ cấu đơn hàng Tỷ trọng theo trạng thái | Chờ rà soát |
| [ ] | 01.04 | Tiến độ sản xuất tổng Số lệnh theo từng công đoạn | Chờ rà soát |
| [ ] | 01.05 | Cảnh báo điều hành Lệnh trễ hạn, vật tư dưới định mức, hợp đồng sắp hết hạn, yêu cầu mua chờ duyệt | Chờ rà soát |
| [ ] | 01.06 | Nhật ký hoạt động 10 thao tác gần nhất của toàn hệ thống | Chờ rà soát |
| [ ] | 01.07 | Kịch bản hướng dẫn thao tác Danh sách các bước thao tác; chọn một bước để chuyển đến đúng màn hình tương ứng. | Chờ rà soát |
| [x] | 02.01 | Danh sách khách hàng Tìm kiếm, lọc theo nhóm, phân trang. Bao gồm thời gian nhập, người nhập, người sở hữu Loại khách: có khách lẻ, khách công ty Theo dõi và kiểm soát thời gian tương tác với khách đã bao lâu. Khống chế thời gian để thông báo khách chưa được tương tác  Lịch sử tương tác với khách, nội dung tương tác Có tổng quan để phân loại mức độ khách hàng VIP, mới, thường xuyên…… để áp dụng hệ số khách hàng Có chức năng chuyển đổi sở hữu khách hàng khi  nhân viên kinh doanh nghỉ, không chăm sóc khách trong 1 thời gian quy định | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 02.02 | Thêm / sửa / xoá khách hàng Tên, mã số thuế, địa chỉ, người liên hệ, điện thoại, email | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 02.03 | Phân loại khách hàng Ảnh hưởng dự phòng giảm giá khi báo giá | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 02.04 | Hồ sơ khách hàng 6 tab Thông tin, báo giá, đơn hàng, hợp đồng, công nợ, lịch sử giao dịch | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 02.05 | Doanh số theo khách Tổng doanh thu, số đơn, đơn gần nhất. Có phân chia doanh số và % được hưởng của từng nhân viên kinh doanh đối với từng đơn hàng. Để có cơ sở phân bổ sau này. Có bảng quy định mức được hưởng đối với từng đơn hàng dựa trên các yếu tố: Lợi nhuận mang về của đơn hàng đó, và giá trị của đơn hàng. Tiền mang được về Công ty thì nhân viên được hưởng % theo quy định tương ứng với giá trị mang về | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 02.06 | Công nợ theo khách Đã thu / còn phải thu / quá hạn. Có lịch sử cập nhật thanh toán. Công nợ gắn với nhân viên kinh doanh cụ thể và hiển thị cho nhân viên, phụ trách để xử lý | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 02.07 | Xuất Excel | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 06.01 | Danh sách đơn hàng Lọc theo trạng thái, khách hàng, thời gian | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 06.02 | 6 trạng thái đơn hàng Chờ xử lý → chờ sản xuất → đang sản xuất → hoàn thành → đã giao / đã huỷ | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 06.03 | Chi tiết đơn hàng Thông tin, dòng hàng, giá trị, liên kết ngược về báo giá gốc | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 06.04 | Tiến trình 7 bước Báo giá → đơn hàng → lệnh sản xuất → đang sản xuất → QC → hoàn thành → giao hàng | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 06.05 | Trạng thái tự suy từ lệnh sản xuất Không gắn cứng bằng tay | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 06.06 | Phát hành lệnh sản xuất Từ đơn hàng sinh lệnh cho từng dòng hàng | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 06.07 | Xác nhận giao hàng | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 06.08 | Xuất Excel, in phiếu | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 07.01 | Danh sách hợp đồng Lọc theo trạng thái, khách hàng, hiệu lực | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 07.02 | Thông tin hợp đồng Số hợp đồng, khách hàng, giá trị, ngày ký, hiệu lực, loại hợp đồng | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 07.03 | Liên kết báo giá → hợp đồng | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 07.04 | Cảnh báo hợp đồng sắp hết hạn | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 07.05 | Ghi nhận thanh toán Giảm công nợ khách hàng tương ứng | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 07.06 | Xuất Excel, in hợp đồng | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 07.07 | Thực tế chi phí trong hợp đồng Thực tế chi phí vận chuyển, thực tế vật tư hết bao nhiêu | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 08.01 | Hồ sơ doanh nghiệp Thông tin pháp lý, ngành nghề, giới thiệu, sơ đồ tổ chức | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 08.02 | Năng lực thiết bị Danh sách máy móc: tên, thông số, công suất, năm đầu tư | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 08.03 | Năng lực nhân sự Số lượng theo bộ phận, kỹ sư và thợ bậc cao | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 08.04 | Chứng chỉ, tiêu chuẩn Đính kèm file scan | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 08.05 | Dự án tiêu biểu Chủ đầu tư, giá trị, hạng mục, thời gian, hình ảnh | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 08.06 | Thêm / sửa / xoá từng mục | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |
| [x] | 08.07 | Kết xuất bộ hồ sơ năng lực Chọn các mục cần thiết rồi xuất file | Đợt 1: xem docs/dot-1-kinh-doanh.md; tự kiểm, chưa nghiệm thu |

### GĐ2-B (67)

| Kiểm đạt | Mã | Nội dung | Bằng chứng / còn thiếu |
|---|---|---|---|
| [x] | 09.01 | Danh sách lệnh sản xuất Lọc theo trạng thái, phân xưởng, thời gian | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.02 | Chi tiết lệnh Sản phẩm, quy cách, số lượng, deadline, người phụ trách | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.03 | Quy trình theo công đoạn Mỗi công đoạn có người, máy, giờ máy, sản lượng, ngày bắt đầu và kết thúc. Tính toán theo từng lô hàng, từng đợt (1 lệnh sản xuất có thể chia nhiều lần, đợt sản xuất). Bao gồm tình trạng công tác chuẩn bị của hồ sơ bản vẽ phục vụ sản xuất, vật tư, …. (Bổ sung công đoạn chuẩn bị sản xuất) | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.04 | Bắt đầu / hoàn tất công đoạn | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.05 | Ghi nhận sản lượng thực tế Tiến độ tổng tính lại ngay | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.06 | Kiểm tra vật tư theo định mức Đối chiếu nhu cầu với tồn kho, báo thiếu | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.07 | Chặn sản xuất khi thiếu vật tư Hỏi tạo yêu cầu mua hàng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.08 | Tự xuất kho theo định mức Khi bắt đầu sản xuất, sinh phiếu xuất | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.09 | Định mức công đoạn từ báo giá Giờ máy và chi phí gia công cho cả lệnh | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.10 | Nghiệm thu QC Số lượng đạt và số lượng lỗi | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.11 | In phiếu sản xuất | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.12 | Đối chiếu vật tư theo kích thước Khối 4 bước ngay trên lệnh sản xuất | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.13 | Chi phí thực tế của lệnh Tổng hợp khoản chi đã gắn vào lệnh này | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 09.14 | Đầu mục công việc của lệnh Việc giao cho từng cá nhân, gắn với báo cáo ngày | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 10.01 | Bảng điều hành xưởng Toàn bộ lệnh đang chạy, xếp theo công đoạn | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 10.02 | Năng lực từng phân xưởng Giờ máy đã dùng trên tối đa, cảnh báo quá tải | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 10.03 | Lọc theo phân xưởng, thời gian | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 10.04 | Cảnh báo lệnh trễ deadline | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 11.01 | Bảng công đoạn sản xuất Mã, tên, phân xưởng, máy / thiết bị, đơn giá giờ máy . Mở rộng được các công đoạn sản xuất, công đoạn chuẩn bị sản xuất. Các công đoạn sản xuất có hiển thị  - thông tin tại công đoạn đó  - Vướng mắc cần tháo gỡ giải quyết  - Các thông tin chính | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 11.02 | Thêm / sửa / xoá công đoạn Không giới hạn số lượng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 11.03 | Sửa nhanh đơn giá giờ ngay trên bảng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 11.04 | Lối tắt sang ma trận hệ số Từ công đoạn mở thẳng bảng hệ số của nó | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 11.05 | Đếm số lệnh đang dùng, chặn xoá khi đang dùng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 11.06 | Xuất Excel | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 11.07 | Bảng hệ số điều chỉnh Bảng hệ số dùng chung, thêm / sửa / xoá từng dòng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 12.01 | Danh sách đầu mục công việc Gắn với lệnh sản xuất, đơn hàng, công đoạn | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 12.02 | Giao đầu mục cho cá nhân Người phụ trách, ngày bắt đầu, hạn hoàn thành | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 12.03 | Báo cáo từng ngày của từng cá nhân Hôm nay làm đầu mục nào, khối lượng đạt, số giờ | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 12.04 | Ghi nhận vướng mắc Vướng cái gì, mô tả, đã xử lý hay chưa | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 12.05 | Xem theo ngày và theo cá nhân | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 12.06 | Xem cả tháng của một cá nhân Một tháng cá nhân nào vướng mắc cái gì, bao nhiêu lần | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 12.07 | Xuất Excel báo cáo tháng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.01 | TAB 1 — Danh mục vật tư Mã, tên, nhóm, đơn vị, tồn, tồn tối thiểu, vị trí kho, đơn giá | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.02 | Thêm / sửa / xoá vật tư | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.03 | Lọc theo nhóm, kho, trạng thái tồn | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.04 | 3 trạng thái tồn Đủ tồn, sắp hết, hết hàng — cảnh báo ngay trên menu | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.05 | Chi tiết vật tư Lịch sử nhập xuất, lệnh sản xuất đang dùng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.06 | Xuất Excel | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.07 | TAB 2 — Kho tấm theo kích thước Quản lý tấm theo dài × rộng × dày, số tấm, khối lượng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.08 | Đối chiếu kích thước và khối lượng Từ kích thước sản phẩm ra phôi cần cắt, tìm tấm đủ kích thước gia công | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.09 | Đối trừ tấm đã đáp ứng Phần còn lại làm đề nghị nhập vật tư | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.10 | Tấm dành riêng cho lệnh sản xuất Lệnh khác không lấy được | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.11 | Xuất vật tư ra sản xuất Trừ đúng số tấm, sinh phiếu xuất theo khối lượng cấp ra | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.12 | Tấm cắt xong còn thừa Ghi rõ kích thước mảnh còn lại, nhập lại kho để tận dụng. Theo dõi được lịch sử tấm thừa này được cắt từ tấm nguyên ban đầu là tấm nào để kiểm soát 1 tấm ban đầu làm được bao nhiêu chi tiết, tấm tàn, phế | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.13 | Phần còn thừa làm phế Ghi nhận phế và tỷ lệ phế | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.14 | Cân đối khối lượng cấp ra Cấp ra = khối lượng sản phẩm + tấm tàn dùng tiếp + phế | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.15 | TAB 3 — Khai báo nhà cung cấp Mã, tên, mã số thuế, địa chỉ, người liên hệ, điện thoại | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.16 | Bảng của nhà cung cấp Danh sách vật tư kèm đơn giá mua, thời gian giao | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.17 | Thêm / sửa / xoá nhà cung cấp | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 13.18 | Lịch sử mua theo nhà cung cấp Đã mua gì, bao nhiêu, giá nào | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 14.01 | Danh sách phiếu nhập / xuất Lọc theo loại phiếu, kho, thời gian | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 14.02 | Lập phiếu nhập thủ công | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 14.03 | Lập phiếu xuất thủ công | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 14.04 | Tổng hợp tồn theo kho Số mã vật tư, giá trị tồn, số mã dưới định mức | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 14.05 | Giá trị nhập – xuất – tồn | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 14.06 | Truy vết chứng từ Phiếu gắn với lệnh sản xuất hay yêu cầu mua nào | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 14.07 | Xuất Excel | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 15.01 | Danh sách yêu cầu mua Lọc theo trạng thái, nhà cung cấp, thời gian | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 15.02 | Quy trình 6 bước Tạo → duyệt → đặt nhà cung cấp → đang giao → nhận hàng → nhập kho | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 15.03 | Tạo yêu cầu mua từ lệnh sản xuất Tự tính đúng số lượng thiếu cộng dự phòng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 15.04 | Phê duyệt / từ chối Ghi nhận người duyệt | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 15.05 | Nhận hàng và cộng tồn kho thật Sinh phiếu nhập tương ứng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 15.06 | In yêu cầu mua và đơn đặt hàng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 15.07 | Xuất Excel | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 15.08 | Lấy giá từ bảng nhà cung cấp Tạo yêu cầu mua tự đề xuất nhà cung cấp và đơn giá | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | 15.09 | Sinh phiếu chi tương ứng Khoản mua đẩy sang sổ chi, gắn vào lệnh sản xuất hoặc đơn hàng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |
| [x] | BS08 | Phần dư nối kho: tấm nguyên, mảnh dư, giữ riêng cho lệnh, phế; truy nguồn và cân đối khối lượng | Đã triển khai, tự kiểm đợt 2; xem tài liệu đối chiếu |

### GĐ2-C (53)

| Kiểm đạt | Mã | Nội dung | Bằng chứng / còn thiếu |
|---|---|---|---|
| [ ] | 16.01 | Chi hằng ngày Ngày, nội dung, số tiền, người chi, chứng từ | Chờ rà soát |
| [ ] | 16.02 | Phân loại khoản chi Mua vật tư, dụng cụ, máy móc, chi phí xưởng và các khoản khác | Chờ rà soát |
| [ ] | 16.03 | Gắn khoản chi vào đối tượng Chi cho lệnh sản xuất nào, đơn hàng nào, hay chi phí xưởng chung | Chờ rà soát |
| [ ] | 16.04 | Phân bổ chi phí vào đơn hàng Kê hết các khoản chi rồi phân bổ để tính được giá thành đơn hàng | Chờ rà soát |
| [ ] | 16.05 | Đánh giá đơn hàng lỗ hay lãi Doanh thu trừ toàn bộ chi phí thực tế, kèm tỷ suất | Chờ rà soát |
| [ ] | 16.06 | Thu theo hợp đồng từ báo giá Ghi thu theo tiến độ hợp đồng, đối chiếu ngược về báo giá gốc | Chờ rà soát |
| [ ] | 16.07 | So sánh dự toán và thực tế Vật tư, vận chuyển, nhân công: báo giá bao nhiêu, thực tế bao nhiêu, chênh lệch | Chờ rà soát |
| [ ] | 16.08 | Căn cứ điều chỉnh giá đầu vào Từ chênh lệch, biết phải sửa đơn giá nào cho lần báo giá sau | Chờ rà soát |
| [ ] | 16.09 | Xuất Excel sổ thu chi | Chờ rà soát |
| [ ] | 17.01 | Danh sách nhân sự Lọc theo phòng ban, chức vụ, trạng thái | Chờ rà soát |
| [ ] | 17.02 | Thêm / sửa / xoá nhân sự Mã nhân viên, họ tên, phòng ban, chức vụ, ngày vào, liên hệ | Chờ rà soát |
| [ ] | 17.03 | Hồ sơ nhân sự Thông tin và công đoạn đang phụ trách | Chờ rà soát |
| [ ] | 17.04 | Thống kê theo phòng ban | Chờ rà soát |
| [ ] | 17.05 | Xuất Excel | Chờ rà soát |
| [ ] | 18.01 | Trung tâm báo cáo Danh mục toàn bộ báo cáo, bấm là mở | Chờ rà soát |
| [ ] | 18.02 | Chỉ số tổng quan Kinh doanh, sản xuất, kho, tài chính trên một màn hình | Chờ rà soát |
| [ ] | 18.03 | Chọn kỳ báo cáo Tháng, quý, năm, khoảng ngày tuỳ chọn | Chờ rà soát |
| [ ] | 19.01 | Sản lượng theo kỳ | Chờ rà soát |
| [ ] | 19.02 | Tiến độ và tỷ lệ hoàn thành | Chờ rà soát |
| [ ] | 19.03 | Hiệu suất theo phân xưởng | Chờ rà soát |
| [ ] | 19.04 | Tỷ lệ đạt QC | Chờ rà soát |
| [ ] | 19.05 | Xuất Excel | Chờ rà soát |
| [ ] | 20.01 | Doanh thu theo tháng | Chờ rà soát |
| [ ] | 20.02 | Doanh thu theo khách hàng | Chờ rà soát |
| [ ] | 20.03 | Doanh thu theo sản phẩm | Chờ rà soát |
| [ ] | 20.04 | Công nợ phải thu | Chờ rà soát |
| [ ] | 20.05 | Xuất Excel | Chờ rà soát |
| [ ] | 21.01 | Nhập – xuất – tồn theo kỳ | Chờ rà soát |
| [ ] | 21.02 | Giá trị tồn kho | Chờ rà soát |
| [ ] | 21.03 | Vật tư sắp hết | Chờ rà soát |
| [ ] | 21.04 | Xuất Excel | Chờ rà soát |
| [ ] | 22.01 | Công việc thực hiện trong ngày Xác định được khối lượng công việc thực hiện; thời gian thực hiện khối lượng đạt được. Mục tiêu đánh giá được khối lượng công việc của nhân sự cụ thể như thế nào Các bộ phận | Chờ rà soát |
| [ ] | 22.02 | Tồn tại vướng mắc | Chờ rà soát |
| [ ] | 22.03 | Kiến nghị đề xuất | Chờ rà soát |
| [ ] | 22.04 | Công việc ngày tiếp theo | Chờ rà soát |
| [ ] | 23.01 | Danh sách tài khoản | Chờ rà soát |
| [ ] | 23.02 | Thêm / sửa / khoá tài khoản | Chờ rà soát |
| [ ] | 23.03 | Vai trò người dùng | Chờ rà soát |
| [ ] | 23.04 | Phân quyền theo phân hệ Vai trò nào vào được menu nào; dữ liệu nào (ví dụ thông tin giá thì kỹ thuật sản xuất không được tiếp cận; kinh doanh chỉ biết giá cuối…) | Chờ rà soát |
| [ ] | 23.05 | Nhật ký thao tác Ai làm gì, lúc nào | Chờ rà soát |
| [ ] | 24.01 | Thông tin doanh nghiệp Tên, mã số thuế, địa chỉ, logo dùng in chứng từ | Chờ rà soát |
| [ ] | 24.02 | Tham số vận hành Bật tắt các quy tắc nghiệp vụ | Chờ rà soát |
| [ ] | 24.03 | Định dạng số, tiền tệ, ngày | Chờ rà soát |
| [ ] | 24.04 | Giao diện sáng / tối | Chờ rà soát |
| [ ] | 25.01 | Thông tin đầu vào nhân sự Có dữ liệu đầu vào các nhân sự  - Ngày vào làm: tính thâm niên  - Lương cơ bản để tính bảo hiểm - Lương thực tế | Chờ rà soát |
| [ ] | 25.02 | Bảng nguyên tắc tính lương Thể hiện nguyên tắc tính lương cho từng đối tượng - Sản xuât - văn phòng  - Kinh doanh  - các loại hệ số: Hệ số tăng ca, làm ngày nghỉ, ngày lễ, làm công trường, khác  - Phụ cấp…. | Chờ rà soát |
| [ ] | 25.03 | Thông tin ngày công Thể hiện được số ngày công, tăng ca, nghỉ, lễ, công trường | Chờ rà soát |
| [ ] | 25.04 | Bảng lương Lương theo BHXH, lương thực nhận | Chờ rà soát |
| [ ] | 26.01 | Bảng thông tin giao việc Có các nội dung nội dung công việc, các trường đã nhận đã làm đã hoàn thành  Thời gian tiến độ công việc thực hiện  Các cá nhân tự giao việc, phụ trách giao việc Lãnh đạo xác nhận Có thông báo về chuyển bước công việc, phê duyệt chuyển bước | Chờ rà soát |
| [ ] | 27.01 | Bảng thông tin chat, trao đổi công việc Chat với từng cá nhân; Tạo nhóm chat; chụp cắt ảnh gửi trong ô Chat | Chờ rà soát |
| [ ] | BS07 | AI đọc ảnh/PDF cấu kiện đơn giản, đối chiếu danh mục và xác nhận trước khi điền báo giá | Chờ rà soát |
| [ ] | BS09 | Bảo vệ dữ liệu giá theo vai trò; phiên bản, lịch sử và bảo toàn số liệu chứng từ đã duyệt | Chờ rà soát |
| [ ] | BS10 | Liên thông toàn bộ: báo giá → đơn hàng/hợp đồng → sản xuất/kho/mua → QC/giao hàng → thu chi/công nợ/báo cáo; nhân sự/lương/giao việc/chat | Chờ rà soát |

### GĐ2-D (6)

| Kiểm đạt | Mã | Nội dung | Bằng chứng / còn thiếu |
|---|---|---|---|
| [ ] | D.01 | Kiểm thử tích hợp toàn hệ thống và đối chiếu một đơn hàng mẫu từ đầu đến cuối | Chờ rà soát |
| [ ] | D.02 | Chạy thử với người dùng và sửa lỗi toàn bộ các phân hệ giai đoạn 2 | Chờ rà soát |
| [ ] | D.03 | Đào tạo, hướng dẫn sử dụng và quản trị các phân hệ giai đoạn 2 | Chờ rà soát |
| [ ] | D.04 | Triển khai môi trường vận hành, tài khoản và kế hoạch vận hành toàn hệ thống | Chờ rà soát |
| [ ] | D.05 | Kiểm thử sao lưu và khôi phục đầy đủ dữ liệu toàn hệ thống | Chờ rà soát |
| [ ] | D.06 | Nghiệm thu cuối; bàn giao mã nguồn, cấu trúc dữ liệu/migration, cấu hình/build/deploy và tài liệu | Chờ rà soát |
