# Checklist triển khai GĐ2 — Trường Phát

Rà soát cuối ngày 25/09: [Kiểm tra bốn đợt GĐ2, responsive và các mục còn mở](docs/RA-SOAT-GD2-2026-09-25.md).

Bổ sung bảng giao việc 25/09: [Giao việc phân cấp và liên thông](docs/GIAO-VIEC-PHAN-CAP-2026-09-25.md). Giới hạn theo cây phòng ban, nhận việc/chốt việc cha–con, cập nhật từ nguồn, vướng mắc và tổng hợp khối lượng–tiến độ.

Bổ sung điều hành xưởng 25/09: [Tiến trình công nghệ, đối soát vật tư và nhập kho công đoạn](docs/DIEU-HANH-CONG-DOAN-2026-09-25.md). Có kỹ thuật xác nhận/Admin duyệt, cân bằng vật tư và phiếu phôi–bán thành phẩm–thành phẩm. Chưa thay thế nghiệm thu vận hành với khách.

Cập nhật đợt 3: [Tài chính, chấm công, lương và điều hành](docs/dot-3-tai-chinh-luong-dieu-hanh.md). Nhóm 16, 17, 22, 25, 26 đã tự kiểm chức năng; cần cấu hình nguyên tắc lương, quyền và nhập chứng từ thực tế. Báo cáo tổng hợp cập nhật ở đợt 4 bên dưới; nghiệm thu toàn hệ thống vẫn cần khách kiểm tra.

**Mốc chốt hướng triển khai: trao đổi ngày 24/09/2026, 23:31–23:34.**

Tài liệu làm việc cho các đợt tiếp theo: bám luồng demo, triển khai trên web hiện tại, giữ phần báo giá và dữ liệu đã có, hoàn thiện theo hợp đồng. Checklist không tự thay đổi phạm vi, phí, tiến độ hoặc điều kiện nghiệm thu đã ký.

Cập nhật đợt 2: [Sản xuất, kho và mua hàng](docs/dot-2-san-xuat-kho-mua-hang.md). Các mã 09–15 và BS08 được đối chiếu theo tài liệu này; dấu hoàn thành là tự kiểm chức năng, chưa phải nghiệm thu khách. Giờ định mức chỉ có khi nguồn khai theo giờ; khoản mua tự sinh chưa đồng nghĩa đã thanh toán.

Cập nhật đợt 4: [Báo cáo và kiểm thử liên thông](docs/dot-4-bao-cao-kiem-thu.md). Nhóm 18–21 đã tự kiểm; gồm chọn kỳ, Excel, quyền nguồn và đối chiếu luồng đơn mẫu/SQLite phục hồi. Các bước chạy thử, đào tạo, diễn tập khôi phục toàn máy chủ và nghiệm thu cuối chưa tự đánh dấu hoàn thành.


## Quy tắc khách xác nhận — giao việc và chuyển tồn 26/09/2026

- Giao việc: người giao/admin duyệt hoàn thành; thông báo người nhận và cấp trên khi giao trực tiếp. Người được chọn trong danh sách trách nhiệm mới tự nhận việc bộ phận. Đổi người thực hiện cần lý do, lưu lịch sử.
- Việc kế tiếp được thông báo khi báo hoàn thành; duyệt hoàn thành vẫn là bước riêng. Tiến độ/chuyển việc liên bộ phận cần admin hoặc quyền `dailyWork.approveSchedule`; đổi lịch/người/phụ thuộc làm mất xác nhận cũ. Luồng này dùng phê duyệt từng trường hợp, chưa phải công cụ thiết kế quy trình tùy ý.
- Khoảng chờ vật tư/phê duyệt có thời điểm máy chủ, lý do, dẫn chiếu, người kết thúc và người duyệt. Áp dụng việc giao riêng và công đoạn trên bảng giao việc; chỉ khoảng đã xác nhận được trừ khỏi trễ cá nhân. Ngày duyệt hoàn thành chậm không quy thành trễ của người thực hiện.
- Chuyển phần giữ kho: đề xuất → người có quyền `inventory.approve` duyệt/từ chối; chỉ vật tư chưa cấp. Kiểm tra lại nhu cầu/kích thước/phiên bản trong giao dịch, không cấp trùng, không duyệt lặp. Bỏ giữ cũng cần quyền duyệt kho. Chưa phải chuyển bán thành phẩm/thành phẩm đã sản xuất.
- Báo cáo kỳ bổ sung sản lượng/giờ tăng thêm từ lịch sử công đoạn; giá trị quy đổi chỉ hiện theo quyền chi phí, khi khớp căn cứ định mức/đơn giá của lệnh. Dữ liệu lịch sử thiếu căn cứ không tự bù, không coi giá trị này là lương.
- Chưa triển khai bộ chấm điểm KPI, trọng số/xếp hạng hoặc module Cơ hội bán hàng riêng; các phần này để giai đoạn sau.
- Tự kiểm: 30 kiểm thử máy chủ đạt; giao diện thời gian chờ, chuyển tồn, bảng giao việc và luồng công đoạn được kiểm tra trên dữ liệu thử. Không thay thế nghiệm thu khách hàng.

## Kiểm tra hồi quy trong phạm vi — 26/09/2026

- 28 kiểm thử nghiệp vụ đạt: hệ số/phân quyền, đồng bộ đơn vị nguyên công, xác nhận từng mục kỹ thuật, chia lô và giữ ghi chú, mua hàng/giữ kho, sản xuất/QC/giao hàng, báo cáo và phục hồi SQLite; giao việc/phụ trách/thông báo.
- 8 kịch bản trình duyệt đạt: `production-parts-browser`, `customer-followup-browser`, `operation-unit-refresh-server-browser`, `policy-save-scope-browser`, `customer-email-import-browser`, `production-flow-browser`, `protected-history-browser`, `work-board-browser`.
- Kiểm tra hệ số bằng tài khoản estimator thực có quyền giới hạn, không chỉ giả lập quyền giao diện; mở đúng phần sửa rồi lưu/tải lại giữ giá trị. Người không có quyền không sửa được hệ số; lịch sử giả từ client không được lưu.
- File CRM_DANH BA (1).xlsx: nhập 17 khách trên cơ sở dữ liệu thử độc lập, tải lại/sửa/nhập lại không nhân đôi; chưa nhập file vào dữ liệu vận hành của khách.
- Web vận hành trả healthz OK. Các kiểm thử ghi dữ liệu chạy ở môi trường thử, không thay thế kiểm chứng từng hồ sơ thực tế hay nghiệm thu khách hàng.
- Đợt này cải thiện kiểm thử, không thay mã chạy của ứng dụng và không triển khai lại. Module Cơ hội bán hàng đầy đủ theo Excel để giai đoạn sau, chờ chốt phạm vi/phí.
- Còn mở: rà toàn bộ mã hợp đồng; các trường hợp sản xuất theo tài liệu khách chưa có bằng chứng kiểm thử; quy tắc chuyển tồn đã phân bổ giữa các lệnh và cách chấm KPI chờ khách xác nhận. Không đánh dấu toàn GĐ2 hoàn thành.

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
| Đợt 3 — `e5aecb4` | 16, 17, 22, 25, 26 | 722/722 hồi quy; 18/18 kiểm tra liên quan sau cập nhật; UI tài chính/công/lương/giao việc, nhân sự và kho; [chi tiết](docs/dot-3-tai-chinh-luong-dieu-hanh.md) | Đã triển khai 25/09; sao lưu trước deploy; health OK; live Admin 1440/390 px và tài khoản hạn chế; phiên kiểm tra đã thu hồi | Chưa ghi nhận nghiệm thu | Cấu hình quyền/nguyên tắc lương, nhập chứng từ thực tế; báo cáo tổng hợp và nghiệm thu toàn hệ thống theo đợt 4 |
| Đợt 4 — `acfe643` | 18–21 | 732/732 hồi quy; 5/5 báo cáo/liên thông/SQLite phục hồi; UI bốn loại, Excel số, kỳ báo cáo, quyền và mobile; [chi tiết](docs/dot-4-bao-cao-kiem-thu.md) | Đã triển khai 25/09; sao lưu trước deploy; HTTPS 1440/390 px, health OK; phiên kiểm tra đã thu hồi | Chưa ghi nhận nghiệm thu | Đối chiếu chứng từ thực tế, cấu hình quyền; D.01–D.06 chưa tự coi hoàn tất |

## 8. Danh mục kiểm tra 162 mã GĐ2

Danh sách giữ mã và mô tả từ bản checklist gốc đã đọc ngày 24/09/2026. Các ô được đánh dấu có bằng chứng tự kiểm; các ô còn trống chờ rà soát; ghi bằng chứng và phiên bản trước khi đánh dấu. Những hạng mục đã có không phải làm lại nếu kiểm tra đạt.

### GĐ2-A (36)

| Kiểm đạt | Mã | Nội dung | Bằng chứng / còn thiếu |
|---|---|---|---|
| [x] | 01.01 | 6 chỉ số điều hành Doanh thu, số đơn hàng, lệnh sản xuất, đang sản xuất, giá trị tồn kho, công nợ phải thu | Tự kiểm dashboard.test.cjs, dashboard-browser.cjs; xem báo cáo rà soát 25/09 |
| [x] | 01.02 | Biểu đồ doanh thu 12 tháng | Tự kiểm dashboard.test.cjs, dashboard-browser.cjs; xem báo cáo rà soát 25/09 |
| [x] | 01.03 | Biểu đồ cơ cấu đơn hàng Tỷ trọng theo trạng thái | Tự kiểm dashboard.test.cjs, dashboard-browser.cjs; xem báo cáo rà soát 25/09 |
| [x] | 01.04 | Tiến độ sản xuất tổng Số lệnh theo từng công đoạn | Tự kiểm dashboard.test.cjs, dashboard-browser.cjs; xem báo cáo rà soát 25/09 |
| [x] | 01.05 | Cảnh báo điều hành Lệnh trễ hạn, vật tư dưới định mức, hợp đồng sắp hết hạn, yêu cầu mua chờ duyệt | Tự kiểm dashboard.test.cjs, dashboard-browser.cjs; xem báo cáo rà soát 25/09 |
| [x] | 01.06 | Nhật ký hoạt động 10 thao tác gần nhất của toàn hệ thống | Tự kiểm dashboard.test.cjs, dashboard-browser.cjs; xem báo cáo rà soát 25/09 |
| [x] | 01.07 | Kịch bản hướng dẫn thao tác Danh sách các bước thao tác; chọn một bước để chuyển đến đúng màn hình tương ứng. | Tự kiểm dashboard.test.cjs, dashboard-browser.cjs; xem báo cáo rà soát 25/09 |
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
| [x] | 16.01 | Chi hằng ngày Ngày, nội dung, số tiền, người chi, chứng từ | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 16.02 | Phân loại khoản chi Mua vật tư, dụng cụ, máy móc, chi phí xưởng và các khoản khác | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 16.03 | Gắn khoản chi vào đối tượng Chi cho lệnh sản xuất nào, đơn hàng nào, hay chi phí xưởng chung | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 16.04 | Phân bổ chi phí vào đơn hàng Kê hết các khoản chi rồi phân bổ để tính được giá thành đơn hàng | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 16.05 | Đánh giá đơn hàng lỗ hay lãi Doanh thu trừ toàn bộ chi phí thực tế, kèm tỷ suất | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 16.06 | Thu theo hợp đồng từ báo giá Ghi thu theo tiến độ hợp đồng, đối chiếu ngược về báo giá gốc | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 16.07 | So sánh dự toán và thực tế Vật tư, vận chuyển, nhân công: báo giá bao nhiêu, thực tế bao nhiêu, chênh lệch | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 16.08 | Căn cứ điều chỉnh giá đầu vào Từ chênh lệch, biết phải sửa đơn giá nào cho lần báo giá sau | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 16.09 | Xuất Excel sổ thu chi | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 17.01 | Danh sách nhân sự Lọc theo phòng ban, chức vụ, trạng thái | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 17.02 | Thêm / sửa / xoá nhân sự Mã nhân viên, họ tên, phòng ban, chức vụ, ngày vào, liên hệ | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 17.03 | Hồ sơ nhân sự Thông tin và công đoạn đang phụ trách | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 17.04 | Thống kê theo phòng ban | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 17.05 | Xuất Excel | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 18.01 | Trung tâm báo cáo Danh mục toàn bộ báo cáo, bấm là mở | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 18.02 | Chỉ số tổng quan Kinh doanh, sản xuất, kho, tài chính trên một màn hình | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 18.03 | Chọn kỳ báo cáo Tháng, quý, năm, khoảng ngày tuỳ chọn | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 19.01 | Sản lượng theo kỳ | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 19.02 | Tiến độ và tỷ lệ hoàn thành | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 19.03 | Hiệu suất theo phân xưởng | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 19.04 | Tỷ lệ đạt QC | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 19.05 | Xuất Excel | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 20.01 | Doanh thu theo tháng | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 20.02 | Doanh thu theo khách hàng | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 20.03 | Doanh thu theo sản phẩm | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 20.04 | Công nợ phải thu | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 20.05 | Xuất Excel | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 21.01 | Nhập – xuất – tồn theo kỳ | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 21.02 | Giá trị tồn kho | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 21.03 | Vật tư sắp hết | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 21.04 | Xuất Excel | Đã tự kiểm đợt 4; xem tài liệu báo cáo và căn cứ số liệu |
| [x] | 22.01 | Công việc thực hiện trong ngày Xác định được khối lượng công việc thực hiện; thời gian thực hiện khối lượng đạt được. Mục tiêu đánh giá được khối lượng công việc của nhân sự cụ thể như thế nào Các bộ phận | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 22.02 | Tồn tại vướng mắc | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 22.03 | Kiến nghị đề xuất | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 22.04 | Công việc ngày tiếp theo | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 23.01 | Danh sách tài khoản | Tự kiểm access-review/action-access/server và trình duyệt tài khoản, bộ quyền; xem báo cáo rà soát 25/09 |
| [x] | 23.02 | Thêm / sửa / khoá tài khoản | Tự kiểm access-review/action-access/server và trình duyệt tài khoản, bộ quyền; xem báo cáo rà soát 25/09 |
| [x] | 23.03 | Vai trò người dùng | Tự kiểm access-review/action-access/server và trình duyệt tài khoản, bộ quyền; xem báo cáo rà soát 25/09 |
| [x] | 23.04 | Phân quyền theo phân hệ Vai trò nào vào được menu nào; dữ liệu nào (ví dụ thông tin giá thì kỹ thuật sản xuất không được tiếp cận; kinh doanh chỉ biết giá cuối…) | Tự kiểm access-review/action-access/server và trình duyệt tài khoản, bộ quyền; xem báo cáo rà soát 25/09 |
| [x] | 23.05 | Nhật ký thao tác Ai làm gì, lúc nào | Tự kiểm access-review/action-access/server và trình duyệt tài khoản, bộ quyền; xem báo cáo rà soát 25/09 |
| [x] | 24.01 | Thông tin doanh nghiệp Tên, mã số thuế, địa chỉ, logo dùng in chứng từ | Thông tin đơn vị phát hành và hồ sơ năng lực; kiểm tra business/offer-templates, xuất hồ sơ |
| [x] | 24.02 | Tham số vận hành Bật tắt các quy tắc nghiệp vụ | Trung tâm Thiết lập, định dạng hiển thị và sáng/tối; tự kiểm 26/09, xem docs/THIET-LAP-GD2-2026-09-26.md |
| [x] | 24.03 | Định dạng số, tiền tệ, ngày | Trung tâm Thiết lập, định dạng hiển thị và sáng/tối; tự kiểm 26/09, xem docs/THIET-LAP-GD2-2026-09-26.md |
| [x] | 24.04 | Giao diện sáng / tối | Trung tâm Thiết lập, định dạng hiển thị và sáng/tối; tự kiểm 26/09, xem docs/THIET-LAP-GD2-2026-09-26.md |
| [x] | 25.01 | Thông tin đầu vào nhân sự Có dữ liệu đầu vào các nhân sự  - Ngày vào làm: tính thâm niên  - Lương cơ bản để tính bảo hiểm - Lương thực tế | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 25.02 | Bảng nguyên tắc tính lương Thể hiện nguyên tắc tính lương cho từng đối tượng - Sản xuât - văn phòng  - Kinh doanh  - các loại hệ số: Hệ số tăng ca, làm ngày nghỉ, ngày lễ, làm công trường, khác  - Phụ cấp…. | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 25.03 | Thông tin ngày công Thể hiện được số ngày công, tăng ca, nghỉ, lễ, công trường | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 25.04 | Bảng lương Lương theo BHXH, lương thực nhận | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 26.01 | Bảng thông tin giao việc Có các nội dung nội dung công việc, các trường đã nhận đã làm đã hoàn thành  Thời gian tiến độ công việc thực hiện  Các cá nhân tự giao việc, phụ trách giao việc Lãnh đạo xác nhận Có thông báo về chuyển bước công việc, phê duyệt chuyển bước | Đã triển khai, tự kiểm đợt 3; xem tài liệu đối chiếu |
| [x] | 27.01 | Bảng thông tin chat, trao đổi công việc Chat với từng cá nhân; Tạo nhóm chat; chụp cắt ảnh gửi trong ô Chat | chat-browser và chat-interactions-browser: hai tài khoản, nhóm, ảnh/cắt ảnh, tải lại |
| [x] | BS07 | AI đọc ảnh/PDF cấu kiện đơn giản, đối chiếu danh mục và xác nhận trước khi điền báo giá | ai-pdf.test và ai-pdf-browser: xác nhận, đối chiếu, chống trùng; AI giả lập trong kiểm thử |
| [x] | BS09 | Bảo vệ dữ liệu giá theo vai trò; phiên bản, lịch sử và bảo toàn số liệu chứng từ đã duyệt | server/action-access/quote-corrections: quyền nguồn, phiên bản bất biến và lịch sử |
| [x] | BS10 | Liên thông toàn bộ: báo giá → đơn hàng/hợp đồng → sản xuất/kho/mua → QC/giao hàng → thu chi/công nợ/báo cáo; nhân sự/lương/giao việc/chat | reports-flow và các bài liên thông bốn đợt đạt trên dữ liệu mẫu; chưa thay chạy thử thực tế |

### GĐ2-D (6)

| Kiểm đạt | Mã | Nội dung | Bằng chứng / còn thiếu |
|---|---|---|---|
| [ ] | D.01 | Kiểm thử tích hợp toàn hệ thống và đối chiếu một đơn hàng mẫu từ đầu đến cuối | Đã tự kiểm một đơn liên thông đợt 4; còn đối chiếu vận hành thực tế với khách |
| [ ] | D.02 | Chạy thử với người dùng và sửa lỗi toàn bộ các phân hệ giai đoạn 2 | Chờ rà soát |
| [ ] | D.03 | Đào tạo, hướng dẫn sử dụng và quản trị các phân hệ giai đoạn 2 | Chờ rà soát |
| [ ] | D.04 | Triển khai môi trường vận hành, tài khoản và kế hoạch vận hành toàn hệ thống | Đã kiểm thử tải môi trường riêng; còn xác nhận tài khoản, cấu hình và kế hoạch vận hành thực tế với khách |
| [x] | D.05 | Kiểm thử sao lưu và khôi phục đầy đủ dữ liệu toàn hệ thống | Đã tự diễn tập snapshot thật trong container không mạng: 47 bảng/1.996 bản ghi, 15 tệp, ảnh ứng dụng và cấu hình; hash khớp, phiên cũ bị xóa. Xem docs/KIEM-TRA-DO-BEN-GD2-2026-09-25.md; chưa phải ký nghiệm thu hoặc diễn tập mất toàn VPS |
| [ ] | D.06 | Nghiệm thu cuối; bàn giao mã nguồn, cấu trúc dữ liệu/migration, cấu hình/build/deploy và tài liệu | Chờ rà soát |


## Rà soát yêu cầu điều chỉnh sản xuất — 27/09/2026

- Đã triển khai và kiểm thử local: gom nhiều dòng thành bảng kiến nghị; kỹ thuật, kinh doanh và giá xác nhận đúng cùng phạm vi; chỉ các dòng được duyệt cập nhật vào lệnh. Đổi giá yêu cầu kinh doanh xác nhận lại; giá và tác động chi phí chỉ trả về cho người có quyền.
- Có so sánh chi phí toàn đề nghị và tính tác động riêng các mục được chọn; lưu tác động của phần thực tế áp dụng. Đơn hàng/báo giá gốc giữ nguyên.
- Chặn sửa trực tiếp máy/phương pháp đã xác nhận, kể cả bỏ tích xác nhận rồi lưu. Form rà soát có nút gom máy/phương pháp/khai triển thành bảng kiến nghị. Đường đề nghị công nghệ cũ cũng phải qua kỹ thuật, kinh doanh, giá và quyền duyệt riêng; có thông báo nội bộ cho người liên quan.
- Danh mục nguyên công có máy mặc định; khai báo từng công đoạn báo giá cho chọn máy và phương pháp. Máy được giữ qua kỹ thuật, hồ sơ sản xuất và duyệt công nghệ.
- Tab vật tư sau xác nhận hiển thị phương án xếp chi tiết khai triển trên nhiều khổ tồn thực tế, ưu tiên phần đã giữ cho lệnh, loại phần đã giữ cho lệnh khác; phần thiếu tính lại theo khổ mua. Tính mạch cắt, chiều dày và hướng cố định; biên dạng dùng khung bao bảo thủ, không cam kết tối ưu cắt. Kế hoạch mua nhiều lệnh không sử dụng trùng phôi. Lưu phương án tại thời điểm xuất kho.
- Đã đọc PDF phân luồng của khách và mã demo. Tám bước ví dụ là Cắt, Tiện, Phay, Hàn, Sơn, Lắp ráp, QC, Hoàn thành; chưa dùng việc đổi tên tab để tuyên bố đạt đầy đủ quy trình.
- Đã bổ sung và kiểm thử local: bốn mục rà soát độc lập (đầu vào/bản vẽ, cấu thành, công đoạn/định mức, khai triển/hao hụt); xem phương án cắt ngay trong mục 4; lưu và tải lại từng xác nhận. Bảng kiến nghị sửa được số lượng chi tiết, ghi chú, chọn công thức hoặc khai công thức riêng, nơi thực hiện, tổng lượng/định mức nguyên công.
- Đường đề nghị công nghệ đã duyệt từng phần khi giữ nguyên danh sách và thứ tự công đoạn; ba bộ phận phải xác nhận cùng các mục được chọn. Thay danh sách/thứ tự yêu cầu duyệt toàn quy trình để tránh tạo chuỗi công việc không hợp lệ.
- Đã bổ sung các phần còn thiếu: mở riêng không gian rà soát dùng lại form đầu vào, cấu thành, nguyên công và khai triển của báo giá; giữ bản vẽ sản xuất riêng; lưu nháp kiến nghị theo người/lệnh; gửi toàn bộ thay đổi cấu thành, liên kết, thông số và khai triển vào bảng kiến nghị. Số lượng sản phẩm gốc giữ theo lệnh; thay đổi phạm vi dùng chia lô. Thêm/bỏ/di chuyển cấu thành cần duyệt cùng các mục liên quan.
- Bảng kiến nghị chung hiển thị và xử lý cả thay đổi kỹ thuật lẫn quy trình công nghệ; giữ lịch sử đề nghị cũ. Bộ phận giá cập nhật được đơn giá vật tư và nguyên công cho phần được chọn, thay giá phải xác nhận kinh doanh lại. Đồng bộ thay đổi kỹ thuật giữ máy, phương pháp, định mức, thứ tự và công đoạn bổ sung đã được duyệt; không tự khôi phục công đoạn đã bỏ.
- Quy trình hiển thị từng bước thực tế của lệnh, nhân sự, máy, sản lượng, tiến độ, vướng mắc; QC và hoàn thành riêng. Có chuỗi 8 bước tham khảo; không tự chèn công đoạn không dùng vào mọi sản phẩm.
- Kiểm thử: 30 ca API liên quan đã qua; browser bốn mục xác nhận độc lập và browser phát hành → kho → công đoạn → QC → hoàn thành → tải lại đã qua; browser bảng kiến nghị nhiều dòng / ba bộ phận / tải lại / gửi sửa trực tiếp từ rà soát và browser máy mặc định / giữ giá / tải lại đã qua. Các bài browser cũ được cập nhật bước ngày hoàn thành và chọn tab; chưa lấy fixture nhập kho cũ làm bằng chứng đạt toàn hệ thống.
- Kiểm thử bổ sung 27/09: 60 ca API/core liên quan đạt; 6 kịch bản browser đạt (form kỹ thuật đầy đủ + bản vẽ + khai triển tay + nháp/tải lại; bảng kiến nghị chung + ba bộ phận; 4 xác nhận độc lập; máy mặc định; phát hành đến hoàn thành; quy trình đến đối soát kho/QC/thành phẩm). Chưa thay thế nghiệm thu vận hành của khách.
- Đã triển khai máy chủ ngày 27/09/2026: bản `1998797` tại https://truongphat-group.xyz. Sao lưu mã nguồn và SQLite trước cập nhật. Container healthy; `/healthz` trả OK; đối chiếu SHA-256 của đủ 23 tệp runtime trong container khớp bản phát hành; HTML công khai có form rà soát, bảng kiến nghị chung và quy trình mới. Kiểm thử nghiệp vụ dùng dữ liệu riêng ở local; không tạo lệnh thử trong dữ liệu khách.

- Rà soát lại từng yêu cầu: xem `docs/RA-SOAT-YEU-CAU-SAN-XUAT-2026-09-27.md`. Đã sửa bảo vệ phạm vi ở bảng nhanh, khởi tạo viewer 3D và giữ đúng phiên bản giao dịch bổ sung bản vẽ. 18 ca API/core và browser editor mở rộng đạt. Bản `f026f39` đã lên máy chủ, healthy; kiểm tra HTTPS và 23 hash runtime khớp.

### Rà soát sản xuất một trang — yêu cầu ảnh 27/09/2026
- Gom cấu thành, khai triển và công đoạn vào bảng 6 nhóm cột: thông số/mã vật tư; ĐVT/số lượng; khai triển; nguyên công/máy/nơi làm; khối lượng/diện tích phôi; ghi chú.
- Thu gọn ô sửa; giữ bảng kiến nghị và duyệt trước khi áp dụng thay đổi. Các xác nhận độc lập cùng nằm trên một trang.
- Màn sửa kỹ thuật hiển thị cấu thành nối tiếp công đoạn; bản vẽ và khai triển đầy đủ vẫn truy cập được.
- Chỉ bắt buộc máy hoặc Thủ công; phương pháp/ghi chú tùy chọn. Giữ mã máy kế thừa khi xác nhận các mục khác.
- Diện tích phôi dùng blankArea; dữ liệu lệnh cũ dùng kích thước khai triển và số lượng để tính diện tích tấm, không dùng diện tích hai mặt.
- Kiểm thử: 14 ca API; browser bảng 6 cột, mở ô sửa, xác nhận chỉ chọn máy, tải lại; editor nháp/kiến nghị; luồng ba bộ phận duyệt và áp dụng.
- Trạng thái triển khai và kiểm tra HTTPS được ghi sau khi chạy trên máy chủ.
- Đã deploy bản **86fcc15** lên https://truongphat-group.xyz; sao lưu nguồn + SQLite trước triển khai. HTTPS health và SHA-256 của 24 tệp runtime khớp bản phát hành.
- Đã dùng trình duyệt trên web thật: mở lệnh LSX-20260926testdulieu; kiểm tra 6 cột, mở/đóng ô chọn máy, mở màn sửa hợp nhất, màn 1600 px và 390 px. Không ghi thay đổi nghiệp vụ vào lệnh khách; kiểm thử lưu/kiến nghị/duyệt chạy trên dữ liệu kiểm thử riêng.
- Ảnh kiểm chứng: artifacts/production-unified-review-live-desktop.png, artifacts/production-unified-review-live-mobile.png, artifacts/production-unified-editor-live.png. Phiên xác minh tạm đã thu hồi.

### Hai bảng rà soát và quy trình theo mẫu khách — 27/09/2026
- Bảng vật tư: nhu cầu theo chi tiết/khai triển, kho đáp ứng, thiếu, trạng thái, khổ mua, số lượng mua và nút đề nghị mua theo dòng. Chọn lại khổ để sắp và tính lượng mua; chặn khổ không đủ, phiên bản cũ và đổi khổ khi yêu cầu mua còn xử lý.
- Bảng định mức: phân xưởng, máy, đơn giá giờ máy, giờ quy đổi từ chi phí công đoạn báo giá nguồn, giờ định mức/đơn vị, tổng giờ và so sánh chi phí. Chưa có căn cứ thì hiển thị Chưa khai. Giá giờ máy theo danh mục hiện tại được ghi rõ trong giải thích.
- Tài khoản không được xem giá không nhận đơn giá, giờ suy từ giá, chi phí báo giá hay chi phí định mức qua API.
- Định mức giờ được gửi trong đề nghị tiến trình và chỉ áp dụng sau duyệt. Lịch sử cùng nguyên công/máy hiển thị sản lượng và giờ thực tế để người phụ trách tham khảo; không tự xác định sản phẩm tương tự hoặc tự áp định mức.
- Quy trình một lệnh trình bày các cột theo công đoạn thực tế, thẻ chi tiết, người phụ trách, sản lượng/tiến độ và vướng mắc; QC/hoàn thành vẫn độc lập.
- Kiểm thử: 18 ca API/core đạt; browser đổi khổ, tạo yêu cầu mua ngay tại bảng và tải lại; browser gửi/duyệt giờ định mức và luồng sản xuất–đối soát–QC–hoàn thành đạt.
- Đã triển khai bản **1cae69f** lên https://truongphat-group.xyz; sao lưu nguồn và SQLite trước cập nhật, container healthy. HTTPS health và 27 hash tệp runtime khớp bản phát hành.
- Kiểm tra trình duyệt trên lệnh thật LSX-20260926testdulieu: bảng vật tư 11 cột, mở hộp chọn khổ, bảng định mức và API, màn hình 390 px không tràn hộp thoại. Bảng quy trình được kiểm tra hiển thị ở chế độ chỉ đọc; lệnh vẫn giữ điều kiện xác nhận hồ sơ trước triển khai. Mọi yêu cầu ghi nghiệp vụ bị chặn trong phiên kiểm tra; không tạo giao dịch thử trên dữ liệu khách.
- Đã xem ảnh kiểm chứng sau triển khai: artifacts/production-material-review-live.png, artifacts/production-norm-review-live.png, artifacts/production-stage-board-live.png. Phiên xác minh tạm đã thu hồi và tệp xác thực cục bộ đã xóa.

### Sửa kẹt xác nhận mở sửa báo giá — 27/09/2026
- Đề nghị từ phiên bản cũ không còn buộc từ chối rồi lập lại. Khi người có quyền chọn Cho sửa lại, tải trạng thái mới, hiển thị phạm vi/lý do và phiên bản cũ–hiện tại; xác nhận mở đúng phạm vi trên bản hiện tại. Giữ nguồn đề nghị, lưu phiên bản được xét và giữ lịch sử báo giá đã duyệt.
- Vẫn chặn sai quyền, đề nghị đã xử lý, mở ngoài phạm vi và thay đổi đồng thời sau khi mở hộp xác nhận. Giữ dữ liệu đang nhập khi làm mới trạng thái mở sửa.
- 6 ca API và browser tái hiện đề nghị v2 → báo giá được duyệt v3 → xác nhận mở sửa đạt. Build thành công.
- Deploy **f1675ad**, sao lưu nguồn/SQLite; HTTPS healthy, 29 hash runtime khớp. Kiểm tra đọc trên web thật không tìm thấy đề nghị chờ cũ lệch phiên bản tại thời điểm kiểm tra nên không xác nhận được đúng hồ sơ khách trong ảnh; không tạo hoặc duyệt thử đề nghị trên dữ liệu thật. Phiên kiểm tra tạm đã thu hồi.
- Rà tiếp tình huống báo giá đổi ngay khi hộp xác nhận đang mở: bổ sung nút “Xem trạng thái mới và tiếp tục” khi xung đột, không F5, không tự duyệt lại. Giữ lý do và vùng đã chọn khi làm mới đề nghị; yêu cầu đã xử lý được đưa về danh sách trạng thái hiện tại.
- Kiểm thử hồi quy: 11 ca API (corrections/workspace/partial handoff) và 6 bài browser (corrections/switch-save/save-handoff/workspace/locked-factor-summary/cost-save-all) đạt. Browser tạo xung đột thật giữa lúc mở hộp và xác nhận, kiểm tra phục hồi và giữ thông tin form.
- Deploy tiếp **809a7ff** sau sao lưu. Kiểm tra HTTPS, nội dung công khai có nút phục hồi và 29 hash runtime khớp. Chưa coi đây là xác nhận không còn lỗi trên toàn hệ thống; các giao dịch thử chạy trên dữ liệu riêng.

### Thu gọn rà soát và chuẩn bị vật tư theo ảnh LSX-01 — 27/09/2026
- Rà soát có ba mục trên một hàng: Đầu vào/bản vẽ; Cấu thành/công đoạn; Vật tư. Chỉ hiện mục được chọn. Gộp công đoạn và bảng định mức vào cấu thành, vẫn lưu độc lập xác nhận cấu thành và công đoạn; trạng thái nhóm chỉ đủ khi cả hai đã xác nhận.
- Tab Vật tư đứng trước Quy trình sản xuất. Bỏ tab Sắp xếp tấm riêng, đưa phương án cắt vào Vật tư. Giữ các cổng xác nhận và quyền thao tác hiện có.
- Gọi vật tư toàn bộ/một phần: chọn các lô khả dụng và số lượng để giữ cho lệnh; ghi nhiều dòng trong một giao dịch, chống bấm trùng, kiểm tra phiên bản và loại phần đã giữ cho lệnh khác. Đây là chuẩn bị/giữ vật tư; cấp kho theo luồng bắt đầu sản xuất. Sản xuất trước một phần sản phẩm dùng chia phần/lô hiện có.
- 19 ca API đạt, gồm giữ vật tư theo lựa chọn, rollback khi một dòng lỗi, chống trùng, quyền và điều kiện rà soát. Browser kiểm tra ba mục/ẩn nội dung, giữ một phần, mua hàng/tải lại; luồng sản xuất–QC–hoàn thành; luồng công nghệ–đối soát; đọc điện thoại đạt.
- Deploy **bf76c66** sau sao lưu nguồn/SQLite. HTTPS healthy và 29 hash runtime khớp. Trình duyệt web thật kiểm tra đúng LSX-01: ba mục, thứ tự tab, bảng cấu thành, nút gọi vật tư, sắp phôi trong Vật tư và chiều rộng 390 px. Chặn mọi ghi nghiệp vụ trong phiên kiểm tra; không giữ/xuất kho thử của khách. Phiên xác minh đã thu hồi.
- Ảnh: artifacts/production-compact-input-live.png, artifacts/production-compact-structure-live.png, artifacts/production-compact-materials-live.png.

### Sửa trực tiếp tại dòng rà soát LSX-01 — 27/09/2026
- Sửa kích thước chi tiết và chọn mã vật tư cùng hình dạng ngay trong dòng, không mở cửa sổ hoặc chuyển sang bảng khác. Khi thay đổi thông số có liên kết, kiến nghị ghi nhận việc chuyển thông số đó sang nhập tay; chỉ áp dụng sau duyệt.
- Khai triển cập nhật tức thời khối lượng/diện tích phôi dự tính; các tổng cấu thành và lượng công việc được tính từ bản kỹ thuật riêng. Không thay đổi báo giá nguồn hoặc lệnh đang áp dụng khi mới nhập.
- Công đoạn có nơi thực hiện Tại xưởng/Thuê ngoài và khai lượng công việc. Thuê ngoài ẩn khai máy/phương pháp/lượng nội bộ; kiểm tra hồ sơ, bắt đầu và ghi sản lượng không bắt có máy cho công đoạn thuê ngoài. Điều kiện phân công, thời hạn, xác nhận, duyệt và QC vẫn giữ.
- Bản nháp tại dòng được giữ theo tài khoản/lệnh/phiên bản trong tab trình duyệt, phục hồi khi tải lại cùng tab. Phiên bản lệnh đã đổi không tự áp bản nháp cũ. Có Hủy bản sửa tại dòng; không xác nhận hồ sơ khi còn thay đổi thông số chưa gửi kiến nghị.
- Bảng kiến nghị hiển thị mã vật tư, kích thước, khai triển, nơi thực hiện, lượng công việc và máy thay đổi. Qua xác nhận kỹ thuật, kinh doanh, giá và phê duyệt trước khi cập nhật lệnh.
- Phát hiện khi kiểm tra live: danh mục hiện tại có mã trùng với vật tư chốt trước đây nhưng thông số khác. Đã sửa chọn mã khác rồi chọn lại mã gốc để khôi phục đúng snapshot của lệnh; không lấy chiều dày mới của danh mục làm sai dự tính.
- Kiểm thử: 18 ca API đạt; browser sửa/chọn vật tư/khai triển, khôi phục bản nháp sau reload, nhập thiếu, gửi và duyệt kiến nghị, xác nhận thuê ngoài không có máy đạt. Có ca danh mục thay đổi sau phát hành. Browser hồi quy ba nhóm rà soát, vật tư, công nghệ–QC và đọc ở 320/390/430 px đạt.
- Deploy cuối **ae1fdc4**, sao lưu nguồn/SQLite trước cập nhật; container healthy, HTTPS và 29 hash runtime khớp. Kiểm tra trực tiếp LSX-01: sửa tại dòng, đổi mã qua lại giữ đúng dày 2 mm, thay khai triển cập nhật dự tính, thuê ngoài ẩn máy, tải lại giữ bản nháp. Chặn mọi yêu cầu ghi nghiệp vụ khi kiểm tra live; gửi/duyệt thử thực hiện trên dữ liệu kiểm thử riêng. Phiên xác minh tạm đã thu hồi.
- Ảnh kiểm chứng: artifacts/production-inline-live.png; bài kiểm thử: tests/production-inline-review-browser.cjs.

### Rà soát vật tư và lựa chọn khổ kho theo ảnh khách — 28/09/2026
- Tab Vật tư tập trung vào bảng rà soát, ẩn thông tin phân công/các phần khác và bảng vật tư lặp. Các bảng sắp phôi, kho công đoạn để thu gọn. Cột khai triển chỉ ghi kích thước mm, không lặp tên vật tư.
- Bấm Kho · Chọn phôi tại từng mã: liệt kê các lô còn khả dụng, đúng mã/đơn vị/chiều dày và có kích thước đáp ứng. Cho chọn khổ, tính lại phương án, xem số chi tiết đáp ứng và phần thiếu; giữ đúng số tấm/thanh thực sự cần theo phương án đã chọn.
- Tự gộp các kích thước khác nhau cùng mã vật tư trong phương án sắp. Giữ mạch cắt/quy tắc xoay; biên dạng dùng khung bao an toàn, không khẳng định tối ưu hình học toàn cục. Phần giữ của lệnh khác không được lựa chọn, điều chuyển vẫn qua đề nghị và duyệt.
- Cột số lượng cần mua có Xem sắp phôi: hình bố trí và danh sách chi tiết trên từng tấm/thanh. Khổ mua hiện có cho chọn lại và tính lại số tấm; số đề nghị mua trên bảng trừ phần đang đặt.
- 26 ca API/core đạt: nhóm nhiều kích thước, khổ thay thế, thiếu/đủ, khổ không vừa, loại tồn giữ nơi khác, chống giữ trùng, giữ nhiều dòng atomic, mua/nhận hàng, chuyển phần giữ và luồng sản xuất. Cập nhật fixture phê duyệt công nghệ để khai giá thử cho công đoạn mới rồi xác nhận kinh doanh, đúng cổng duyệt hiện hành.
- 4 bài browser đạt: vật tư/chọn phôi/sắp lại/giữ/reload/mobile; rà soát các mục; công nghệ–đối soát–QC; sửa trực tiếp và phê duyệt kiến nghị.
- Deploy **8b4b796** sau sao lưu nguồn/SQLite. Container healthy; HTTPS và 29 hash runtime khớp. Kiểm tra trực tiếp LSX-01: bảng gọn, kích thước 1873 × 210 mm, mở Kho và sơ đồ mua gộp 2 chi tiết trên 1 tấm. Tại thời điểm kiểm tra không có lô kho khả dụng phù hợp, đã kiểm tra trạng thái trống; chọn/giữ lô có hàng thử trên dữ liệu riêng. Không tạo giao dịch thử trên web thật. Phiên xác minh đã thu hồi.
- Ảnh: artifacts/production-material-table-live.png, artifacts/production-stock-picker-live.png, artifacts/production-purchase-layout-live.png.
# Cập nhật 28/09/2026 — thao tác trực tiếp trên bảng quy trình

- Bảng công đoạn có chế độ nhân công/bắt đầu, khai khối lượng và QC công đoạn; lưu theo phiên bản lệnh, giữ nội dung khi lưu lỗi, phục hồi đúng chế độ sau tải lại.
- Kéo thả hoặc nút trái/phải để lập đề nghị đổi trình tự; các bước đã triển khai không đổi vị trí. Chỉ áp dụng qua luồng duyệt công nghệ hiện có. Các công đoạn trùng tên không bị gom vượt thứ tự.
- QC công đoạn có quyền riêng, số đạt/lỗi không vượt sản lượng, lịch sử và chống ghi đè phiên bản; không thay QC cuối lệnh hoặc duyệt hoàn thành.
- Ghi thời điểm bàn giao khi chuyển bán thành phẩm sang bước tiếp theo (bước cuối khi nhập thành phẩm). Hiển thị thời gian từ bắt đầu đến bàn giao, trừ các khoảng chờ vật tư/chờ duyệt đã khai, không cộng trùng khoảng chờ.
- Kiểm thử: 24 ca API/core; trình duyệt kiểm tra bảng trực tiếp, luồng công nghệ đến thành phẩm, rà soát kỹ thuật và bảng vật tư.
- Đã triển khai bản `7c35232` lên web thật; sao lưu nguồn và SQLite, đối chiếu đủ 31 tệp runtime, healthcheck đạt. LSX-01: mở các chế độ nhân công/khối lượng/QC, sắp lại và hủy, kiểm tra khung điện thoại; không ghi nghiệp vụ giả. Phiên kiểm tra tạm đã thu hồi. Ảnh đối chiếu: `artifacts/production-board-{labor,quantity,qc}-live.png`.
# Cập nhật 28/09/2026 — bảng tổng hợp điều chỉnh để phê duyệt

- Bảng kiến nghị kỹ thuật và công nghệ trình bày 5 cột: hiện trạng cũ, đề nghị điều chỉnh, lý do, xác nhận kỹ thuật/kinh doanh/giá, duyệt.
- Chọn toàn bộ hoặc từng mục ngay tại dòng. Trạng thái xác nhận có tên/thời điểm; nút duyệt chỉ sẵn sàng khi ba bộ phận xác nhận cùng phạm vi. Duyệt một phần ghi rõ mục áp dụng và mục giữ nguyên.
- Lưu lý do từng mục và thông số chi tiết trước/sau cho đề nghị mới. Bảng kiến nghị nháp cũng dùng 5 cột. Chi phí/đơn giá nằm trong phần mở rộng, theo quyền hiện hành.
- Kiểm thử API bảo toàn báo giá nguồn, lý do từng mục, phân quyền và duyệt một phần; trình duyệt kiểm tra bảng, giữ lựa chọn sau xác nhận, duyệt một mục, công nghệ, tải lại và khung điện thoại.
- Đã triển khai `4efc54b`, sao lưu nguồn/SQLite, đối chiếu 32 tệp runtime và healthcheck đạt. Web thật LSX-01 chưa có kiến nghị đã gửi: kiểm tra bảng 5 cột bằng bản nháp chưa gửi, kiểm tra khung điện thoại; không ghi nghiệp vụ. Phiên kiểm tra đã thu hồi. Ảnh: `artifacts/production-change-table-live.png`, `artifacts/production-change-table-live-mobile.png`.
# Cập nhật 28/09/2026 — Vật tư SX, chọn chi tiết và đề nghị xuất phôi

- Chọn loại/số lượng chi tiết toàn bộ hoặc một phần còn lại; gộp kích thước cùng mã để sắp trên phôi kho. Phần giữ cho lệnh khác không được sử dụng.
- Xem phương án và số tấm/thanh cần cấp trước khi gửi. Thiếu phôi thì báo thiếu, không tạo đề nghị xuất vượt kho.
- Đề nghị giữ phôi và báo kho; người có quyền kho xác nhận xuất hoặc trả lại. Chỉ xác nhận xuất mới giảm tồn và tạo phiếu xuất có dẫn chiếu lệnh/đề nghị.
- Theo dõi số chi tiết đã đề nghị/đã cấp và phần còn lại; chống yêu cầu trùng, xuất trùng, quá số lượng, sửa phôi đang thuộc đề nghị; thông số kỹ thuật đổi thì phải rà lại trước khi xuất.
- Bảo toàn các phần giữ kho có sẵn khi chia hoặc trả lại đề nghị. Vật tư đã xuất theo luồng cũ yêu cầu đối chiếu trước khi lập đợt mới để tránh cấp trùng.
- Kiểm thử 25 ca API/core và trình duyệt: chọn một phần, xem sơ đồ, gửi/duyệt xuất, phần còn lại, luồng vật tư cũ và khung điện thoại.
- Đã triển khai `a202f3f`, sao lưu nguồn/SQLite, đối chiếu 34 tệp runtime và healthcheck đạt. Web thật LSX-01: chọn 1/2 chi tiết, tính thử phương án; kho thiếu thì hiện số phôi/sơ đồ bổ sung và không cho gửi đề nghị xuất. Không ghi đề nghị/xuất kho thử; phiên kiểm tra đã thu hồi. Ảnh: `artifacts/production-material-release-live.png`.

# Cập nhật 28/09/2026 — đối chiếu vật tư, phần dư và chi phí công đoạn

- Bổ sung bảng trong Quy trình sản xuất: vật tư cấp theo lô/số lượng/kích thước/kg; chi tiết theo hồ sơ, sản lượng và khối lượng thực tế công đoạn; phần tận dụng và phế. Cấp đầu vào chỉ tính một lần, khối lượng chi tiết lấy ở bước gần nhất, phần dư/phế cộng qua các bước; không cộng trùng phiếu chuyển bán thành phẩm hay nhập thành phẩm.
- Hiển thị cân bằng từng mã và từng công đoạn, hao hụt thực tế trên khối lượng đầu vào, giải trình, đối chiếu khối lượng/hao hụt với phiên bản báo giá đã chốt theo đúng số lượng lệnh. Thiếu ghi nhận thì báo chưa đủ đối soát; số liệu đang làm dở không phải kết quả cuối lệnh.
- Chi tiết phần dư nhập lại lấy theo phiếu nhập gắn lệnh/lô/công đoạn, giữ số lượng và kích thước ban đầu kể cả khi phần dư đã được dùng tiếp. Xác nhận cân bằng yêu cầu cấp ra = chi tiết + phần tận dụng + phế trong sai số cho phép.
- Cho gửi đề nghị đối soát và nhập vật tư dư (tấm/thanh/cái) mà chưa làm thay đổi kho. Người có quyền kho và xác nhận sản xuất duyệt để nhập kho/kết thúc công đoạn; có thể trả lại/rút để khai lại. Giữ tùy chọn xác nhận trực tiếp cho người đủ quyền. Kiểm tra kích thước, khối lượng, đầu vào đã đổi, phiên bản và chống duyệt trùng; giữ nguyên bước QC/duyệt hoàn thành riêng.
- Gắn chứng từ chi phí thực tế với từng công đoạn, đối chiếu báo giá/định mức, tách ước tính giờ máy và chi phí chưa gắn công đoạn. Không cộng ước tính vào chứng từ; không coi số chưa khai là tiết kiệm. API loại bỏ toàn bộ phần chi phí với người không có quyền xem.
- Kiểm thử: 25 ca API/core liên quan đạt; bổ sung tình huống phế/phần dư ở hai công đoạn, đề nghị chưa duyệt không ghi kho, kích thước sai, đầu vào đổi, rút/gửi lại, duyệt đồng thời, chứng từ lặp, ẩn chi phí và không cộng trùng khi nhập thành phẩm. Trình duyệt kiểm tra gửi/duyệt đối soát, ghi chi phí, bảng cân bằng và khung điện thoại.
- Đã triển khai `7067e1d`, sao lưu nguồn/SQLite; đối chiếu 36 tệp runtime và healthcheck đạt. Web thật LSX-01: 1 mã vật tư, 4 công đoạn, chưa đủ đối soát thực tế; bảng và phần đề nghị hiển thị đúng. Kiểm tra chỉ đọc, không tạo chứng từ kho/chi phí thử. Phiên kiểm tra tạm đã thu hồi. Ảnh: `artifacts/production-reconciliation-live-desktop.png`, `artifacts/production-reconciliation-live-mobile.png`.

# Cập nhật 28/09/2026 — nhập kho theo khổ chuẩn và nguồn nhập

- Chọn khổ chuẩn theo danh mục tấm/thanh; chưa cấu hình thì có khổ thông dụng để chọn, vẫn cho nhập khổ riêng. Đổi kích thước bỏ lựa chọn khổ cũ và tính lại kg/tổng kg.
- Sửa tính khối lượng kho với mã dùng quy ước hình dạng: chỉ tính công thức khối lượng từ dữ liệu cần thiết, không đòi thông số gia công hay dùng số thử của quy ước. Máy chủ tính lại khi lưu; không tin kg do trình duyệt gửi ở chế độ tự tính. Giữ nguyên thông số tiết diện thanh, khối lượng khai đè có căn cứ và chế độ cân thực tế.
- Loại nhập: nhà cung cấp (chọn tên có sẵn hoặc nhập tên), phần tận dụng/tồn cũ (bắt buộc ghi nguồn), nhập khác. Lưu nguồn vào lô/phiếu và hiển thị ở danh sách kho. Phần dư từ lệnh hiện hành vẫn qua đối soát lệnh để tránh nhập trùng; nhập tự động theo mua hàng/hoàn dư giữ nguồn tương ứng.
- Kiểm thử 8 ca API/core đạt và trình duyệt thực: tấm/thanh/thiết bị, công thức có thông số gia công chưa khai, chọn khổ, tự tính/cân thực tế, lưu nguồn nhà cung cấp/phần tận dụng, chặn thiếu nguồn hoặc nhà cung cấp không tồn tại.
- Triển khai `a67efea`, sao lưu nguồn/SQLite, đối chiếu 37 tệp runtime và healthcheck đạt. Web thật VT-00001: khổ 3000 × 1250 mm tự tính 59,475 kg; chọn khổ thông dụng, chọn loại nhập và khung điện thoại đạt. Kiểm tra chỉ đọc, không ghi phiếu kho thử; phiên tạm đã thu hồi. Ảnh: `artifacts/stock-receipt-live.png`.

# Cập nhật 28/09/2026 — sửa trắng màn hình lệnh sau nhập kho

- Tái hiện đúng lỗi bằng trình duyệt: vào Vật tư SX, đóng lệnh, nhập kho rồi mở danh sách lệnh; dữ liệu đã có nhưng bị lớp `production-material-focus` cũ che mất.
- Đặt lại chế độ hiển thị khi mở danh sách, chi tiết lệnh, bảng kiến nghị, chia phần và phát hành lệnh. CSS chỉ giới hạn vật tư khi còn thanh tab của chi tiết; giới hạn thao tác ẩn panel trong đúng khung lệnh.
- Kiểm thử hồi quy trước sửa thất bại vì danh sách bị ẩn; sau sửa đạt luồng nhập kho thực trên dữ liệu thử, quay lại danh sách nhiều lần, bảng kiến nghị và đóng/mở lệnh không F5. Kiểm thử toàn luồng công nghệ, đối soát, QC và thành phẩm vẫn đạt.
- Triển khai `017a71d`, sao lưu nguồn/SQLite, đối chiếu 37 tệp runtime và healthcheck đạt. Web thật LSX-01: Vật tư → kho/form nhập → danh sách lệnh và Vật tư → danh sách đều hiển thị ngay, không tải lại trang. Không ghi kho thử trên dữ liệu thật; phiên kiểm tra đã thu hồi. Ảnh: `artifacts/production-navigation-live.png`.

# Cập nhật 28/09/2026 — đối chiếu mã vật tư lệnh sản xuất với kho

- Xác minh trên dữ liệu thật: VT-00002 trong danh mục là thép mạ kẽm 3 mm, nhưng hồ sơ LSX-01 đã chốt inox SUS304 2 mm bóng. Không đổi tên để che sai quy cách hoặc thay vật liệu đã duyệt.
- Bổ sung phát hiện xung đột vật liệu/mác/tiết diện cố định; chặn đối chiếu giữ, mua và xuất kho khi mã trùng khác quy cách. Lô nhập mới lưu thêm chất liệu/mác/nhãn hiệu; chọn phôi loại lô có thông số khác dù cùng mã.
- Admin có thao tác đối chiếu và tách mã ngay trên lệnh; kiểm phiên bản lệnh/danh mục, chặn lệnh đã làm hoặc có chứng từ vật tư liên quan. Ghi lịch sử catalog/lệnh, giữ nguyên báo giá/đơn hàng gốc, thông số kỹ thuật, khối lượng, công đoạn và tiến độ. Khổ mua đã chọn được chuyển theo mã mới.
- 27 kiểm thử API/core đạt; trình duyệt kiểm tra cảnh báo, tách mã và chọn cùng mã trong form nhập kho đạt.
- Triển khai 395925f, sao lưu nguồn/SQLite và đối chiếu 39 tệp runtime; healthcheck đạt. Đã xử lý dữ liệu LSX-01 qua giao diện thật: inox dùng VT-00002-SX-95613E5A; VT-00002 thép mạ kẽm giữ nguyên. Xác minh sau tải lại và form nhập kho cùng mã/tên, không đổi thông số/khối lượng/công đoạn, không tạo giao dịch nhập/xuất thử.
- Rà cả 2 lệnh hiện có: không còn xung đột quy cách với danh mục. Phiên kiểm tra tạm đã thu hồi. Ảnh: artifacts/material-identity-live-production.png và artifacts/material-identity-live-receipt.png.

# Cập nhật 28/09/2026 — xưởng đề nghị vật tư, kỹ thuật xác nhận rồi bộ phận giá chuyển mua

- Form trong lệnh chuyển thành Đề nghị vật tư: số DNVT-ngày-số thứ tự sinh trên máy chủ khi gửi, không nhập tay; xưởng chỉ chọn vật tư/số lượng và ghi chú, không cần nhà cung cấp hoặc giá.
- Lưu trạng thái chờ kỹ thuật, chờ giá/nhà cung cấp, rồi mới chờ duyệt mua. Kỹ thuật xác nhận quy cách; người có quyền giá bổ sung nhà cung cấp hoạt động và đơn giá dương cho đủ từng dòng. Không tự duyệt hoặc đặt hàng. Có lịch sử, thông báo theo quyền và trả lại/rút đề nghị kèm lý do.
- Theo dõi ngay trong Vật tư SX và danh sách Mua hàng. Phân quyền xưởng gửi, kỹ thuật xác nhận, giá xử lý; người không có quyền giá không nhận đơn giá/bảng giá nhà cung cấp.
- Phần đang đề nghị được tính vào nhu cầu đang xử lý để chống trùng. Kiểm phiên bản, quy cách/khổ mua đã đổi, số lượng nguyên, quá nhu cầu, nhu cầu giảm do giữ kho; gửi lại cùng mã thao tác không tạo thêm yêu cầu. Luồng mua/nhận/nhập kho hiện có tiếp tục sau bước chờ duyệt.
- 27 kiểm thử API/core đạt; trình duyệt đi đủ luồng gửi đề nghị → kỹ thuật → nhà cung cấp/giá → chờ duyệt mua đạt. Sửa việc bộ lọc màn kỹ thuật báo giá vô tình bỏ cột giá của hộp xử lý vật tư; hộp này dùng quyền/dữ liệu riêng từ máy chủ.
- Triển khai d7c88cc, sao lưu nguồn/SQLite, đối chiếu 40 tệp runtime, healthcheck đạt. Web thật LSX-01 mở bằng nút Đề nghị vật tư: không có trường mã/NCC, đúng số lượng 1 tấm, lịch sử đề nghị hiện trong lệnh. Không ghi đề nghị mua thử trên dữ liệu khách; phiên kiểm tra đã thu hồi. Ảnh: artifacts/material-requests-live.png.

# Cập nhật 28/09/2026 — căn đều thao tác bảng rà soát vật tư

- Kho · Chọn phôi, Chọn khổ, Xem sắp phôi và Đề nghị đặt vật tư có cùng kích thước 112 × 48 px, căn theo đáy từng dòng; thông tin kho/khổ/số lượng nằm phía trên, không đẩy các nút lệch hàng.
- Thống nhất tên nút, tiêu đề form và mục theo dõi thành Đề nghị đặt vật tư; giữ luồng xưởng → kỹ thuật → giá/NCC → duyệt mua đã triển khai.
- Đã build, kiểm tra tọa độ/kích thước bốn nút bằng trình duyệt cục bộ và web thật LSX-01. Mở form đề nghị vẫn đúng số lượng, không có ô nhập số hay NCC ở bước xưởng. Triển khai 45765e8, sao lưu nguồn/SQLite, đối chiếu 40 tệp runtime và healthcheck đạt. Kiểm tra chỉ đọc, phiên tạm đã thu hồi. Ảnh: artifacts/material-action-layout-live.png.

### 2026-09-28 — Máy / năng lực (a0b4db5)
- Bổ sung thông số kỹ thuật và lịch sử sửa chữa theo máy (ngày, nội dung, đơn vị sửa, giờ dừng, người ghi nhận).
- Khai báo đơn giá ca máy riêng; số giờ/ca và giá/ca quy đổi thành giá giờ dùng cho định mức. Phân quyền giá độc lập, sửa thông tin kỹ thuật giữ nguyên giá.
- Kiểm tra: 23 tests API đạt; browser local lưu thông số/giá/lịch sử đạt; build đạt. Đã deploy a0b4db5, đối chiếu 40 runtime hashes và kiểm tra các form trên web thật ở chế độ chỉ đọc. Phiên kiểm tra đã thu hồi.


### 2026-09-28 — Phản hồi kỹ thuật anh Phú (bd0f4ee)
- Sửa lựa chọn mức độ phức tạp bị mất khi hệ số bị ẩn: trả nhãn/tham chiếu an toàn, giữ hệ số trên máy chủ; dữ liệu lựa chọn không làm thay đổi bảng giá khi lưu.
- Sửa quyền dùng công thức gắn trong mã vật tư đã phát hành khi quy ước chung có phiên bản mới; vẫn chặn công thức tự sửa. Tái hiện trên các mã VT-00019/VT-00018 và các mã tấm khác.
- Tab kỹ thuật chỉ hiện lỗi kỹ thuật. Bàn giao kỹ thuật khi đầu vào còn chờ xác nhận có hướng dẫn về mục đầu vào; không bỏ kiểm soát xác nhận. BG-20260923-004 đã có xác nhận đầu vào hợp lệ của khách tại thời điểm đối chiếu.
- Kiểm tra: 26 tests liên quan đạt; browser chọn độ phức tạp và lưu trước bàn giao đạt; build đạt. Đã deploy bd0f4ee, đối chiếu 43 runtime hashes; kiểm tra web thật với quyền Nguyễn Khắc Phú, BG-20260925-006 thấy danh sách mức độ và không còn cảnh báo giá trong tab kỹ thuật. Không ghi sửa báo giá khách khi kiểm tra production; phiên kiểm tra đã thu hồi.


### 2026-09-28 — Bỏ quy ước hình dạng khỏi mã vật tư (e7389d2)
- Form thêm/sửa mã vật tư không còn chọn Quy ước hình dạng; mã mới và tạo tương tự không gắn quy ước. Giữ loại phôi/cách đo, vật liệu và thông số cố định. Dữ liệu quy ước cũ được giữ khi sửa mã cũ.
- Bỏ lối tạo mã theo quy ước ở danh mục hình dạng; quy ước vẫn dùng khi khai chi tiết báo giá.
- Kiểm tra 3 luồng browser (mã mới, lựa chọn mác/đặc tính, quy tắc mã/form vật tư) đạt; build đạt. Đã deploy e7389d2, đối chiếu 45 runtime hashes và kiểm tra form thêm/sửa trên web thật chỉ đọc. Phiên kiểm tra đã thu hồi.

### 2026-09-28 — Định mức kỹ thuật / tài chính (0377e68)
- Thêm mục Định mức dưới Sản xuất, icon PNG mới được tạo riêng và nhúng vào bản build. Gồm giá ca máy, vật tư, vật tư phụ, định mức khác, tài chính và đối chiếu thực tế.
- Định mức có lượng/đơn vị, sản phẩm áp dụng, khổ vật tư, căn cứ nhà sản xuất hoặc thực tế sản xuất, tài liệu dẫn chiếu, phiên bản và lịch sử; cho ngừng dùng, không xóa lịch sử. Giá ca máy dùng dữ liệu máy hiện có, bổ sung căn cứ và lịch sử; thông tin giá chỉ trả về theo quyền.
- Mỗi đề nghị vật tư/mua mới, gồm đường mua cũ và mua gộp nhiều lệnh, lưu đối chiếu máy chủ tại thời điểm gửi: nhu cầu hồ sơ/phương án phôi, đã giữ/cấp, đang đặt, lượng đề nghị và tham chiếu phù hợp. Mở xem trước khi gửi và xem lại khi xử lý đề nghị. Hồ sơ cũ không tự được bổ sung căn cứ hồi tố.
- Đối chiếu theo lệnh lấy cấp, chi tiết, tận dụng, phế từ đối soát xưởng. Tham chiếu tự ghép khi cùng mã, tên sản phẩm, đơn vị và khổ; không so số tấm khác khổ như cùng tiêu chuẩn. Tham chiếu kg toàn vật tư đối chiếu tiêu hao gồm phế khi cân bằng; lệnh dở dang chưa phải tiêu hao cuối lệnh. Mã chỉ có trong báo giá gốc được ghi nhãn riêng.
- Các định mức khác/tài chính hiện là khung khai và lịch sử tham chiếu; chưa tự suy ra lượng điện, nhân công hay mọi chi phí ngoài nguồn sản xuất hiện có. Cần nhập căn cứ định mức thực tế của doanh nghiệp; không sinh số chuẩn giả hoặc tự áp vào báo giá đã chốt.
- Kiểm tra: 26 ca API/core liên quan đạt; 3 luồng trình duyệt định mức/lịch sử/mobile, đề nghị vật tư → kỹ thuật → giá/NCC, máy/giá ca/sửa chữa đạt. Build đạt.
- Đã triển khai 0377e68, sao lưu nguồn/SQLite; HTTPS health và 50 hash runtime khớp. Trình duyệt web thật kiểm tra menu/icon, form định mức, căn cứ giá ca, đối chiếu LSX-01 và 390 px; chặn ghi nghiệp vụ thử. LSX-01 chưa có định mức tham chiếu và số liệu đối soát, hiển thị đúng trạng thái thiếu dữ liệu. Ảnh: artifacts/reference-norms-live-desktop.png, artifacts/reference-norms-live-comparison.png, artifacts/reference-norms-live-mobile.png.


### 2026-09-28 — Sửa kẹt xác nhận lại sau cập nhật danh mục (637d001)
- Nguyên nhân trên BG-20260923-004 v29: công thức danh mục v75 làm xác nhận kỹ thuật hết hiệu lực, nhưng giao diện chỉ kiểm tra chưa mở khóa nên vẫn khóa và đưa người dùng vào yêu cầu mở sửa. Đồng bộ nút bàn giao, khóa sửa và giá theo trạng thái xác nhận còn hiệu lực; hiện Xác nhận bàn giao lại khi dữ liệu đã đổi.
- Bàn giao từng phần cũng phân biệt xác nhận hiện hành với xác nhận cũ; giá từng phần cần kỹ thuật hiện hành. Giữ kiểm tra quyền, phiên bản, đầu vào, phạm vi sửa và dữ liệu kỹ thuật; không tự xác nhận thay khách.
- 9 ca API/core và 3 browser đạt: hồi quy xác nhận cũ không có unlocked, xác nhận bằng estimator, khóa lại, chống thông báo trùng, tải lại; luồng yêu cầu mở sửa và bàn giao từng phần. Build đạt.
- Sao chép SQLite hiện tại sang môi trường thử: dùng đúng quyền Nguyễn Khắc Phú, xác nhận lại thành công BG-20260923-004, BG-20260925-006, BG-20260925-005. Không ghi xác nhận thử lên hồ sơ vận hành.
- Đã triển khai 637d001 sau sao lưu nguồn/SQLite; HTTPS health và 55 hash runtime đạt. Trên web thật, quyền anh Phú mở được nút và hộp xác nhận kỹ thuật của BG-20260923-004; chặn ghi nghiệp vụ trong phiên kiểm tra. Phiên tạm đã thu hồi. Ảnh: artifacts/stale-handoff-after.png.

### 2026-09-28 — Bắt đầu / kết thúc ngay trên thẻ công đoạn (f341716)
- Thẻ công đoạn hiện Bắt đầu; mở khai người phụ trách với trạng thái bắt đầu đã chọn. Sau lưu thành công chuyển sang Kết thúc & bàn giao, đi thẳng đến form đối soát sản lượng/phần dư/phế hiện có. Chưa hoàn tất bước trước thì nút bắt đầu bước sau bị khóa; máy chủ vẫn kiểm tra hồ sơ, công nghệ, kho, phân công và phiên bản.
- Đối soát trực tiếp từ thẻ thành công đưa về quy trình và mở nhận bàn giao của bước kế tiếp; trường hợp gửi đề nghị phải chờ duyệt. Công đoạn đã đối soát có nút Chuyển công đoạn tiếp; bước cuối dẫn tới QC / bàn giao thành phẩm. Không tự bắt đầu bước sau hoặc bỏ duyệt kho/QC.
- Thời gian tiếp tục tính trong lúc chờ bàn giao, dừng khi bước sau nhận bán thành phẩm; bước cuối khi nhập thành phẩm. Giữ trừ khoảng chờ đã xác nhận, không cộng trùng. Hiển thị rõ đã đối soát / chờ bàn giao và thời điểm đã bàn giao.
- Kiểm thử: 3 ca API/core (luồng công đoạn/kho, QC và thời gian); browser bảng có nút bắt đầu/kết thúc/chuyển bước và toàn luồng kết thúc qua đối soát chờ duyệt/trực tiếp, QC, thành phẩm đạt. Build đạt.
- Đã triển khai f341716, sao lưu nguồn/SQLite, HTTPS health và 55 hash runtime đạt. Web thật LSX-01 kiểm tra nút, form xác nhận bắt đầu và 390 px; không ghi nghiệp vụ thử. Phiên tạm đã thu hồi. Ảnh: artifacts/production-board-actions-live.png và artifacts/production-board-actions-live-mobile.png.

### 2026-09-28 — Bỏ duyệt tiến trình lặp sau xác nhận công đoạn (69a3e83)
- Công đoạn đã xác nhận trong hồ sơ sản xuất được dùng trực tiếp để bắt đầu, ghi sản lượng, đối soát, QC và nhập thành phẩm; không yêu cầu kỹ thuật/Admin lập và duyệt lại cùng tiến trình. Áp dụng cả hồ sơ cũ, không tạo bản ghi duyệt giả hoặc sửa dữ liệu lệnh để bỏ chặn.
- Xưởng khai người phụ trách và máy thực hiện / Thủ công ngay trên thẻ rồi bắt đầu. Vẫn kiểm tra đủ hồ sơ, vật tư, thứ tự công đoạn, quyền, phiên bản và đối soát. Thay đổi nội dung/thứ tự công đoạn tiếp tục qua đề nghị điều chỉnh; xác nhận hồ sơ bị xóa do thay đổi không được dùng làm căn cứ cũ.
- Kiểm thử: 3 ca API/core về căn cứ xác nhận, luồng công nghệ/kho và QC đạt; 2 browser đạt (toàn luồng chỉ xác nhận hồ sơ, không duyệt tiến trình riêng, đến nhập thành phẩm; bảng thao tác). Build đạt.
- Đã triển khai 69a3e83 sau sao lưu nguồn/SQLite; HTTPS health và 56 hash runtime đạt. Web thật LSX-01 nhận đúng xác nhận công đoạn sẵn có, không còn báo chưa duyệt tiến trình; form bắt đầu có người và máy, kiểm tra desktop/390 px. Không ghi bắt đầu/nhập kho thử lên lệnh khách; phiên tạm đã thu hồi. Ảnh: artifacts/production-confirmed-flow-live.png và artifacts/production-confirmed-flow-live-mobile.png.


### 2026-09-28 — Giờ công theo định mức và thời gian trong ca
- Bỏ ô nhập giờ ở bảng công đoạn và form thực hiện chi tiết. Hiện tổng giờ định mức (giờ/đơn vị × sản lượng lệnh), giờ thực tế và chênh lệch. Định mức tiếp tục khai/điều chỉnh từ phần rà soát điều kiện sản xuất theo luồng hiện có.
- Chấm công bổ sung khoảng ca/tăng ca theo ngày, giờ Việt Nam; tách giờ nghỉ, hỗ trợ ca đêm. Kiểm tra định dạng, không chồng khoảng, tổng giờ khớp các giờ làm đã khai; dùng quyền, duyệt, phiên bản và khóa kỳ hiện có.
- Giờ thực tế tính giao giữa thời gian bắt đầu–bàn giao và khoảng làm việc đã duyệt; trừ hợp các khoảng chờ vật tư/phê duyệt đã kết thúc và xác nhận. Không tính giờ nghỉ hoặc ngoài ca. Ngày thiếu/chưa duyệt không tự coi là 0; ngày nghỉ cần xác nhận khoảng trống.
- Chưa khai định mức hoặc thiếu lịch làm việc thì hiển thị thiếu căn cứ. Đổi người sau bắt đầu yêu cầu đối chiếu, không quy toàn bộ thời gian cho người mới. Giữ số giờ/lịch sử khai trước đây riêng; chưa chuyển hồi tố báo cáo/lương sang cách tính mới.
- Kiểm tra: 20 ca API/core và 3 browser (bảng công đoạn, chấm công/lương, sản xuất đến thành phẩm) đạt; build đạt. Kiểm tra ca đêm, tăng ca, giờ nghỉ, chờ trùng, thiếu ngày công và kết thúc tại bàn giao.
- Đã triển khai `1b6e609` sau sao lưu nguồn/SQLite; HTTPS health và 59 hash runtime đạt. Trình duyệt web thật LSX-01 xác minh bỏ ô giờ, định mức chưa khai, bắt đầu và khung 390 px; không ghi nghiệp vụ thử. Phiên tạm đã thu hồi. Ảnh: `artifacts/production-working-time-live.png`, `artifacts/production-working-time-live-mobile.png`.


### 2026-09-28 — Thứ tự báo giá, STT và ngày tạo theo phản hồi Thảo
- Danh sách báo giá xếp ngày tạo cũ đến mới, dùng thời điểm phiên bản đầu tiên trên máy chủ và mã định danh để giữ thứ tự khi trùng thời điểm. Cập nhật, trình hoặc duyệt không đưa dòng lên đầu; báo giá mới thêm cuối danh sách.
- Thêm STT nối tiếp qua trang và cột Ngày tạo riêng với Cập nhật. STT theo danh sách đang lọc, không phải mã chứng từ cố định. Không dùng ngày báo giá khai tay làm ngày tạo.
- Kiểm thử API tạo hai báo giá rồi sửa bản cũ: ngày tạo/thứ tự giữ nguyên; 2 browser danh sách desktop/mobile và tài khoản kỹ thuật đạt. Build đạt.
- Đã triển khai `3172d4a` sau sao lưu nguồn/SQLite; HTTPS health và 61 hash runtime đạt. Web thật kiểm tra STT, ngày tạo, thứ tự cũ đến mới giữ nguyên khi làm mới và khung 390 px. Không ghi sửa báo giá khách; phiên tạm đã thu hồi. Ảnh: `artifacts/quote-created-live.png`, `artifacts/quote-created-live-mobile.png`.


### 2026-09-28 — Nhập giá vật tư trong phạm vi mở sửa
- Đối chiếu chỉ đọc: BG-20260925-005/006 đang mở riêng cấu thành/hao hụt, chưa mở Giá vật tư; nhập giá bị chặn theo phạm vi đó. Không tự mở rộng phạm vi hoặc ghi giá vào hồ sơ khách.
- Bảng giá hiện rõ nguyên nhân và nút Mở thêm phạm vi nhập giá, chọn đúng Giá vật tư qua luồng mở sửa hiện có. Chưa được phép thì khóa ô ngay; các dòng nguồn giá ngoài phạm vi không được đưa vào Lưu toàn bộ.
- Căn cứ/thuế nguồn giá được kiểm theo đúng nhóm đầu vào (vật tư, nguyên công, vận chuyển, hệ số), không gom tất cả thành Giá chào. Thuế đầu ra, giá chào và các vùng chưa mở vẫn được kiểm độc lập ở UI/API.
- Kiểm thử: 13 ca API và 3 browser đạt, gồm bổ sung phạm vi, lưu nguồn/giá vật tư, tải lại, lưu toàn bộ và hồi quy mở sửa. Build đạt.
- Đã triển khai `dff192a` sau sao lưu nguồn/SQLite; HTTPS health và 63 hash runtime đạt. Web thật BG-20260925-005 hiển thị hướng dẫn, khóa ô ngoài phạm vi và mở đúng hộp bổ sung Giá vật tư; kiểm tra desktop/390 px, không ghi nghiệp vụ thử. Phiên tạm đã thu hồi. Ảnh: `artifacts/material-price-scope-live.png`, `artifacts/material-price-scope-live-mobile.png`.


### 2026-09-28 — Làm nổi bật tên được nhắc trong chat (84bfa68)
- Tên @nhắc khớp thành viên hội thoại có chữ xanh đậm, nền xanh nhạt; áp dụng tin gửi, tin nhận và phần trích trả lời. Tin cũ hiển thị lại theo cùng cách, không sửa nội dung lưu hoặc thay đổi quy tắc thông báo.
- Kiểm thử trình duyệt hai tài khoản đạt: màu tên, tải lại, ký tự HTML hiển thị an toàn và hồi quy cảm xúc/thu hồi/ảnh/điện thoại. Build đạt.
- Đã triển khai sau sao lưu nguồn/SQLite; HTTPS health và 65 hash runtime khớp. Kiểm tra tên được nhắc trên tin có sẵn trong TP Group, desktop/390 px; chặn yêu cầu ghi nên cập nhật trạng thái đã đọc không thực hiện trong phiên kiểm tra. Không gửi tin thử; phiên tạm đã thu hồi. Ảnh: `artifacts/chat-mentions-live.png`, `artifacts/chat-mentions-live-mobile.png`.


### 2026-09-28 — Đề nghị vật tư bộ phận và điều chỉnh trước mua (18b6826)
- Thêm tab Đề nghị vật tư và nút tạo đề nghị bộ phận ngoài lệnh sản xuất. Khai bộ phận/nơi sử dụng, căn cứ nhu cầu, mã vật tư, số lượng và khổ; số DNVT tự sinh. Dùng quyền tạo/xem mua hàng hiện có; bộ phận/nơi sử dụng là nội dung người đề nghị khai, chưa tự gán từ cơ cấu tổ chức.
- Bộ phận mua điều chỉnh số lượng, thêm/bỏ hoặc đổi chủng loại trước trình duyệt, bắt buộc lý do; giữ đề nghị gốc và lịch sử trước/sau. Đề nghị bộ phận chuyển bổ sung giá/NCC rồi duyệt → đặt → giao → nhận → nhập kho; sau nhập có nút cấp từ các lô của đề nghị, ghi người/bộ phận nhận và dẫn chiếu DNVT. Kiểm tồn khả dụng và chống gửi lặp qua giao dịch hiện có.
- Đề nghị theo lệnh chỉ điều chỉnh các vật tư thuộc hồ sơ và trong nhu cầu còn lại; kiểm phiên bản, thông số và phần đang giữ/mua. Điều chỉnh phải kỹ thuật xác nhận lại trước chuyển mua; giữ bảng đối chiếu gốc và cập nhật bảng cho phần điều chỉnh.
- Đề nghị bộ phận lưu căn cứ nhu cầu khai tay; không tự suy định mức theo sản lượng lệnh. Không mở sửa đề nghị đã trình duyệt hoặc tự duyệt mua.
- Kiểm tra: 4 ca API/core đạt, gồm hai luồng đề nghị/định mức, phân quyền, phiên bản, giữ bản gốc, thêm chủng loại, nhận/nhập/cấp và chống lặp; 2 browser tạo/sửa/lịch sử/tải lại/mobile và xưởng → kỹ thuật → giá/NCC đạt. Build đạt.
- Đã triển khai sau sao lưu nguồn/SQLite; HTTPS health và 65 hash runtime khớp. Web thật kiểm tra tab, form bộ phận, thêm dòng và 390 px, chặn ghi nghiệp vụ thử; phiên tạm đã thu hồi. Ảnh: `artifacts/department-material-request-live.png`, `artifacts/department-material-request-live-mobile.png`.


### 2026-09-28 — Tiến độ trong danh sách báo giá máy chủ
- Thêm cột Tiến độ: Chưa làm, Đang làm, Đã xong, Đã hủy theo trạng thái công việc hiện có; giữ tình trạng chào giá/gửi khách riêng.
- Hiện hạn báo giá từ hồ sơ đầu vào. Máy chủ tính Quá hạn theo ngày Việt Nam cho việc chưa xong/chưa hủy; chưa khai hạn thì ghi rõ, không tự suy hạn từ ngày tạo. Mở sửa sau duyệt tiếp tục tính tiến độ và quá hạn.
- Thanh tổng hợp thêm số chưa làm/đang làm/đã xong/quá hạn. Quá hạn là cảnh báo bổ sung, có thể cùng thuộc nhóm chưa làm hoặc đang làm.
- Kiểm thử API trạng thái/hạn/duyệt/mở sửa và browser danh sách desktop/mobile đạt; build đạt. Bộ notifications-server có 3 ca đạt, 1 ca cũ thất bại do vẫn yêu cầu mở khóa xác nhận cũ; đã đối chiếu cùng lỗi trên mã trước thay đổi này.
- Đã triển khai `6ad2049` sau sao lưu nguồn/SQLite; HTTPS health và 66 hash runtime đạt. Kiểm tra web thật cột tiến độ, tổng hợp và khung 390 px chỉ đọc; không sửa báo giá khách. Phiên tạm đã thu hồi. Ảnh: `artifacts/quote-progress-live.png`, `artifacts/quote-progress-live-mobile.png`.


### 2026-09-28 — Cấp quyền thêm mã vật tư cho Nguyễn Khắc Phú
- Tài khoản nv-003 được bổ sung catalogMaterials.create và mức cấu hình danh mục vật tư qua bộ quyền bổ sung gắn vị trí Quản đốc xưởng hiện chỉ anh Phú đảm nhiệm. Tài khoản quản lý theo cơ cấu nên không sửa trực tiếp quyền tài khoản; giữ nguyên bộ quyền kỹ thuật dùng chung.
- Đối chiếu trước/sau: các tài khoản khác và quyền không liên quan giữ nguyên; không cấp sửa/xóa vật tư hoặc thêm quyền duyệt/giá. API lưu lịch sử phân quyền và thu hồi phiên cũ của tài khoản.
- Xác minh bằng phiên tạm đúng tài khoản anh Phú trên web thật: mở được nút thêm mới và form vật tư; không lưu vật tư thử. Phiên tạm đã thu hồi. Ảnh: artifacts/phu-material-create-live.png. Đây là cập nhật cấu hình quyền, không thay mã chạy hoặc triển khai lại.


### 2026-09-28 — Sửa lỗi categories khi lưu khai báo công đoạn
- Tài khoản lập giá có hệ số bị ẩn vẫn được chọn nhãn độ phức tạp, nhưng giao diện cố tra bảng hệ số đã bị loại khỏi dữ liệu nên lỗi đọc categories. Chuyển lựa chọn về máy chủ để giải hệ số theo danh mục, áp dụng form công đoạn, đánh giá nhanh và gán nguyên công nhiều dòng.
- Giữ kiểm tra nhãn/phạm vi nhóm và hệ số trên máy chủ; không mở quyền xem/sửa hệ số.
- Browser tài khoản estimator bị khóa hệ số: đánh giá nhanh, khai báo công đoạn, lưu máy chủ và tải lại đạt; xác minh hệ số thực bằng tài khoản Admin. 6 ca core liên quan đạt; build đạt.
- Đã triển khai abfb6de sau sao lưu nguồn/SQLite; HTTPS health và 68 hash runtime khớp. Không lưu thay đổi công đoạn thử lên hồ sơ khách; xác minh lưu/tải lại dùng dữ liệu kiểm thử riêng.


### 2026-09-28 — Đối chiếu lại chặn nhập giá của Nguyễn Công Thảo
- Tài khoản nv-002 có quyền Giá vật tư. BG-20260925-005 v8 và BG-20260925-006 v9 vẫn chỉ mở Cấu thành/hao hụt; chưa được mở Giá vật tư.
- BG-20260925-005 có đề nghị bổ sung của anh Thảo đang chờ cho phép, chọn cả 8 vùng dù lý do là bổ sung nhập giá vật tư. Chưa tự duyệt yêu cầu hoặc mở rộng phạm vi trên hồ sơ khách. Cần người duyệt rà phạm vi trước khi cho sửa.
- Kiểm tra bản đang chạy: bảng giá hiện hướng dẫn bổ sung phạm vi, khóa ô ngoài phạm vi và mở được lịch sử yêu cầu chờ duyệt. Browser hồi quy trên dữ liệu thử đạt: bổ sung riêng Giá vật tư, lưu nguồn/giá và tải lại giữ giá trị. Ảnh chỉ đọc: artifacts/material-price-pending-live.png.
- Không thay mã chạy hoặc triển khai lại; phiên xác minh đã thu hồi. Chưa coi việc nhập giá trên hai hồ sơ khách đã được gỡ chặn khi yêu cầu mở sửa còn chưa duyệt.


### 2026-09-28 — Sửa trực tiếp các mục 1, 6, 7, 8 trước gửi duyệt (5c98bae)
- Theo yêu cầu mới: khi báo giá là bản nháp, đầu vào, giá/hệ số, phân tích giá và nội dung bản chào được sửa theo quyền tài khoản, không cần xin mở sửa hoặc lý do thay đổi. Các yêu cầu/phạm vi mở sửa cũ không chặn các nội dung này; giữ lịch sử, không tự duyệt yêu cầu cũ.
- Đồng bộ khóa bàn giao và phạm vi sửa tại UI/API; đơn giá nguyên công và căn cứ nguồn giá được sửa khi không đổi nội dung kỹ thuật. Quyền tài khoản, quyền hệ số và căn cứ nguồn/thuế vẫn kiểm tra riêng. Các mục kỹ thuật 2–5 đã bàn giao tiếp tục theo luồng mở sửa. Bản đã gửi duyệt/đã duyệt vẫn khóa; phải mở bản sửa trước.
- Dấu xác nhận kỹ thuật loại thông tin khách hàng, dự án, yêu cầu đầu vào và ngày báo giá khỏi đối chiếu bóc tách. Xác nhận cũ chỉ được giữ khi đối chiếu được phiên bản gốc và kỹ thuật không đổi; không sinh xác nhận giả. Bỏ qua mã nội bộ tự bổ sung vào công đoạn/định mức cũ để không chặn nhầm Lưu toàn bộ.
- Kiểm tra: 22 ca API/core liên quan đạt; 4 bài browser giá/phạm vi cũ, hệ số theo quyền, Lưu toàn bộ và hồi quy khai báo công đoạn đạt. Có kiểm tra giữ xác nhận kỹ thuật, từ chối đổi kỹ thuật đã khóa, tài khoản thiếu quyền, bản đã gửi duyệt và tải lại. Build đạt.
- Đã triển khai bản cuối 5c98bae sau sao lưu nguồn/SQLite; HTTPS health và 70 hash runtime khớp. Trên web thật dùng đúng nv-002 Nguyễn Công Thảo: BG-20260925-005/006 mở ô giá vật tư và form hệ số, desktop/390 px. Chặn ghi nghiệp vụ thử; phiên tạm đã thu hồi. Ảnh: artifacts/draft-commercial-0977dd59-live.png, artifacts/draft-commercial-0264c762-live.png, artifacts/draft-commercial-policy-live.png, artifacts/draft-commercial-mobile-live.png.
- Ghi nhận này thay trạng thái còn kẹt ở mục đối chiếu trước: hai báo giá không còn cần duyệt bổ sung Giá vật tư để nhập giá khi vẫn là bản nháp. Chưa thay thế khách kiểm tra hoặc nghiệm thu toàn hệ thống.

### 2026-09-28 — Kiểm tra video lỗi nhập giá VT-00019
- Đối chiếu video 14-06-07 và BG-20260925-005 v8: 18.500 trong video là giá tham khảo; giá áp dụng của 4 dòng VT-00019 chưa khai. Thông báo cũ “cần nhập số không âm” dùng chung cho giá trống, không phải bằng chứng phần mềm tính ra số âm. Dữ liệu đọc hiện tại vẫn thiếu giá; không tự ghi giá thay khách.
- Quy tắc sửa trước trình duyệt đã mở ô nhập theo quyền (32ad808/5c98bae). Bổ sung phân biệt giá chưa khai, không hợp lệ và âm; bảng giá/hộp xác nhận hiện Chưa khai thay vì 0 khi thiếu giá, giải thích giá tham khảo chưa được áp dụng.
- 17 ca core/API đạt; 2 kịch bản browser đạt. Browser nhập 18.500, lưu máy chủ và tải lại với estimator trên dữ liệu mẫu và bản sao đúng báo giá/danh mục khách: 4 dòng VT-00019 giữ giá, chi phí đều dương, hết lỗi đơn giá. Hồi quy sửa giá/hệ số trong phạm vi mở cấu thành đạt; build đạt.
- Triển khai c0c247d sau sao lưu nguồn/SQLite; HTTPS health và 71 hash runtime khớp. Web thật bằng tài khoản Thảo: ô VT-00019 nhập được, hiện Chưa khai và thông báo thiếu giá chính xác. Chặn ghi nghiệp vụ thử; phiên tạm đã thu hồi. Ảnh: artifacts/price-video/fixed-live.png.

### 2026-09-28 — Sửa lỗi companyLogo khi lưu hệ số
- Tái hiện bằng browser: companyLogo không tồn tại ở phạm vi dùng chung vì nằm trong nhánh khởi tạo dưới strict mode. Khi dữ liệu đủ để dựng bản chào, các hàm render ngoài nhánh gọi logo gây ReferenceError, làm gián đoạn thao tác lưu/tính lại.
- Chuyển hàm logo ra phạm vi dùng chung, áp dụng bản chào thường, nâng cao và bản chào kinh doanh. Không đổi giá hoặc quyền tài khoản.
- Browser hồi quy thất bại trước sửa và đạt sau sửa; lưu hệ số quản lý bằng 0 rồi lưu máy chủ/tải lại đạt; cả ba hàm dựng bản chào có logo. Browser hồi quy hệ số/giá theo quyền và phạm vi sửa cũ đạt. Build đạt.
- Triển khai f01f068 sau sao lưu nguồn/SQLite; HTTPS health và 71 hash runtime khớp. Web thật với tài khoản Thảo, BG-20260925-005 v14: dựng bản chào thành công, không lỗi tính toán, mở được form hệ số. Giá VT-00019 lúc kiểm tra đã là 18.700 do hồ sơ được cập nhật; phiên kiểm tra không ghi nghiệp vụ và đã thu hồi. Ảnh: artifacts/company-logo-policy-live.png.

### 2026-09-28 — Luồng xác nhận theo chốt anh Hợp lúc 15:06–15:10
- Giá/hệ số/nội dung chào được sửa theo quyền cả khi đang chờ Admin duyệt; lưu giữ trạng thái chờ duyệt, tăng phiên bản. Giá đã xác nhận khi điều chỉnh phải ghi lý do và xác nhận lại; không làm mất xác nhận kỹ thuật nếu bóc tách không đổi. Admin không duyệt được phiên bản cũ hoặc xác nhận đã hết hiệu lực.
- Đầu vào và kỹ thuật đã xác nhận cần mở sửa: Kỹ thuật xét đề nghị Đầu vào, Giá xét đề nghị Kỹ thuật, theo người phụ trách đã phân công nếu có. Người đề nghị không tự xét bằng quyền bước sau. Bộ phận sau được cho phép hoặc từ chối; Admin/người có quyền xét có thể cho sửa sau từ chối, bắt buộc lý do, giữ lịch sử quyết định và thông báo.
- Mở sửa đầu vào yêu cầu xác nhận lại đầu vào–kỹ thuật–giá; mở sửa kỹ thuật yêu cầu xác nhận lại kỹ thuật–giá. Các bộ phận tiếp tục lưu phần đang làm trong quyền/phạm vi của mình. Mở sửa kỹ thuật từ bản chờ duyệt đưa về bản nháp để hoàn thiện và trình lại.
- Bản đã Admin duyệt vẫn khóa; bước sau không tự mở bản đã duyệt. Giữ bản duyệt trong lịch sử và luồng đề nghị người có quyền cho sửa.
- Quy tắc này thay phần đầu vào được sửa tự do sau xác nhận ở ghi nhận 5c98bae và thay khóa giá ngay khi gửi duyệt. Chưa phải xác nhận nghiệm thu toàn hệ thống.
- Kiểm thử: 25 ca API/core đạt; kiểm tra quyền/phạm vi, phân công người xét, từ chối–Admin can thiệp, xác nhận lại, lưu chờ duyệt, phiên bản cũ và khóa sau duyệt. Kết quả trình duyệt và triển khai ghi bổ sung sau xác minh.
- Ba bài browser đạt: `quote-downstream-review-browser`, `draft-commercial-edit-browser`, `company-logo-browser`; có lưu/tải lại hệ số khi đang chờ duyệt, Giá xét đề nghị, từ chối–Admin cho sửa, xác nhận hết hiệu lực và màn 390 px.
- Đã triển khai `389c2bd` sau sao lưu nguồn/SQLite; HTTPS health và 76 hash runtime khớp. Web thật tài khoản Nguyễn Công Thảo, BG-20260925-005 v14 còn là bản nháp: ô giá/hệ số sửa được, có ô lý do và hướng dẫn luồng mới. Không tạo yêu cầu/duyệt/sửa giá thử trên hồ sơ khách; luồng chờ duyệt và xét yêu cầu chạy trên dữ liệu thử riêng. Phiên xác minh đã thu hồi. Ảnh: `artifacts/quote-downstream-price-live.png`, `artifacts/quote-downstream-policy-live.png`, `artifacts/quote-downstream-review-live-mobile.png`.


### 2026-09-28 — Cấp vật tư / sửa chữa theo ảnh khách
- Thêm mục ngay dưới Định mức, hai tab đề nghị cấp vật tư/thiết bị và đề nghị sửa chữa; icon PNG nền trong suốt được tạo riêng và nhúng bản build.
- Cấp vật tư qua duyệt kho, xuất theo lô/người nhận, cấp từng phần hoặc đủ; chống vượt tồn khả dụng/phần còn lại, không lấy tồn giữ cho lệnh khác. Phiếu xuất dẫn chiếu đề nghị, chỉ xác nhận cấp mới giảm kho.
- Sửa chữa có duyệt, bắt đầu, đơn vị thực hiện, kết quả/ngày hoàn tất/giờ dừng; nối lịch sử máy một lần. Có thiết bị ngoài danh mục. Không tự sinh chi hoặc thanh toán.
- Lịch sử, thông báo nội bộ, rút/từ chối có lý do, quyền tại máy chủ, phiên bản và giao dịch chống trùng. Bộ phận/nơi sử dụng khai tay; chi tiết quyền và giới hạn: [Cấp vật tư / sửa chữa](docs/CAP-VAT-TU-SUA-CHUA-2026-09-28.md).
- 11 ca API/core và browser luồng mới, lịch sử máy, đề nghị mua bộ phận đạt; build đạt. Browser mua bộ phận có một lần timeout, chẩn đoán và chạy lại bản gốc đạt. Triển khai và kiểm tra web thật ghi bổ sung sau xác minh.
- Đã triển khai `8b09147` sau sao lưu nguồn/SQLite; container healthy, HTTPS health và 79 hash runtime khớp. Web thật Admin kiểm tra vị trí ngay dưới Định mức, icon alpha, hai tab/form, thêm dòng và màn 390 px; hiện chưa có đề nghị thực tế. Chặn ghi nghiệp vụ thử, phiên xác minh đã thu hồi. Ảnh: `artifacts/service-requests-live-desktop.png`, `artifacts/service-supply-live.png`, `artifacts/service-repair-live.png`, `artifacts/service-requests-live-mobile.png`.


### 2026-09-28 — Giữ vị trí đọc chat và toàn màn hình
- Sửa ảnh tải chậm kéo người đọc về cuối theo trạng thái cũ; cập nhật tin/cảm xúc giữ các phần tử không đổi và neo theo tin đang đọc. Tải thêm tin cũ, thay trạng thái đã xem giữ vị trí; khi đang ở cuối vẫn tự theo tin mới.
- Thêm Toàn màn hình / Thu gọn ngay trên đầu khung chat, phủ vùng trình duyệt, giữ hội thoại và bản nháp; kiểm tra desktop và điện thoại. Không cần cấp quyền fullscreen trình duyệt.
- Sửa mở hội thoại ngay sau tải lại khi danh sách phòng chưa tải xong khiến thiếu ô nhập.
- Hồi quy ảnh tải chậm thất bại trên mã cũ (đọc tin 36 bị kéo về 65), đạt sau sửa. Năm bài browser đạt: chat-scroll, chat-size, chat, chat-interactions, chat-work; gồm tin mới, ảnh, cảm xúc, tải lịch sử, soạn nháp, chuyển tài khoản, thu hồi, công việc và mobile. Build đạt. Triển khai ghi bổ sung sau xác minh.
- Kiểm tra web thật phát hiện thêm ảnh bị dựng lại khi trạng thái đã xem đổi; đã giữ nguyên phần tử ảnh, bổ sung hồi quy kiểm tra ảnh không bị thay thế. Browser vị trí đọc và tương tác chat đạt sau sửa.
- Triển khai cuối `b57cff8` sau sao lưu nguồn/SQLite; container healthy, HTTPS health và 80 hash runtime khớp. Nhóm TP Group trên web thật: vị trí tin/độ lệch giữ nguyên qua polling, toàn màn hình/thu gọn desktop và 390 px đạt. Chặn mọi ghi chat, không gửi tin/thả cảm xúc/ghi đã đọc thử; phiên tạm đã thu hồi. Ảnh: `artifacts/chat-scroll-live.png`, `artifacts/chat-fullscreen-live.png`, `artifacts/chat-fullscreen-live-mobile.png`.


### 2026-09-28 — Đề nghị công việc theo nhóm tài chính và phục vụ sản xuất
- Đổi mục Cấp vật tư / sửa chữa thành Đề nghị công việc, giữ vị trí dưới Định mức. Có đủ 14 loại theo ảnh: mua, tạm ứng, duyệt chi; cấp vật tư/thiết bị, bảo dưỡng, sửa chữa, bổ sung vật tư, thu hồi, gia công ngoài, xử lý lỗi, nhân lực, tăng ca, sản xuất, khác.
- Mua mở luồng đề nghị mua hiện có; cấp/bổ sung vật tư dùng duyệt kho và xuất từng phần; bảo dưỡng/sửa chữa nối lịch sử máy. Các loại mới có trường căn cứ riêng, người duyệt giao người thực hiện có quyền, bắt đầu, báo kết quả/dẫn chiếu, xác nhận hoàn tất hoặc trả lại bổ sung. Đổi người cần lý do và lưu lịch sử; có thông báo nội bộ, phiên bản và chống lặp.
- Admin thêm/đổi tên/ngừng dùng loại khác, giữ hồ sơ và tên loại lúc gửi. Quyền duyệt/thực hiện theo phân hệ tương ứng; loại mở rộng dùng quyền Công việc và báo cáo ngày. Chi tiết: [Đề nghị công việc](docs/DE-NGHI-CONG-VIEC-2026-09-28.md).
- Tạm ứng/duyệt chi chưa tự giải ngân, hoàn ứng hoặc ghi sổ; thu hồi, gia công, nhân lực, tăng ca và sản xuất chưa tự tạo chứng từ kho/lương/lệnh. Dẫn chiếu kết quả khai nội dung để người duyệt đối chiếu, chưa kiểm liên kết ID chứng từ. Bộ phận/nơi sử dụng khai tay. Đây là luồng hồ sơ đề nghị, không tự coi giao dịch nghiệp vụ đã thực hiện.
- Kiểm tra 9 ca API/core và 2 browser đạt: vòng đời từng loại, phân quyền/giao lại, trả lại/kết quả, loại mở rộng và ngừng dùng, bảo dưỡng, cấp bổ sung, hồi quy cấp kho/sửa chữa/mua, tải lại và 390 px. Build đạt.
- Triển khai `bb332cf` sau sao lưu nguồn/SQLite; container healthy, HTTPS health và 81 hash runtime khớp. Web thật kiểm tra 14 loại, các biểu mẫu và 390 px; hiện chưa có đề nghị thực tế. Chặn ghi nghiệp vụ thử; phiên xác minh đã thu hồi. Ảnh: `artifacts/work-requests-live-desktop.png`, `artifacts/work-requests-advance-live.png`, `artifacts/work-requests-live-mobile.png`.

### 2026-09-28 — Gỡ kẹt hàng chờ yêu cầu mở sửa báo giá (81cf667)
- Mỗi người có thể gửi yêu cầu trong phạm vi quyền của mình khi yêu cầu của người khác còn chờ; mỗi người chỉ có một yêu cầu chờ trên báo giá. Người gửi được rút yêu cầu kèm lý do rồi gửi lại; người khác không được rút thay. Giữ lịch sử và kiểm tra trạng thái/phiên bản.
- Hiển thị riêng Người đề nghị, Người có quyền xét hiện tại và Người đã cho sửa. Thông báo yêu cầu mới ghi rõ người gửi/người có quyền xét; kiểm thử mở thông báo đi đúng hồ sơ và thao tác xét. Không cho người đề nghị tự xét bằng quyền bộ phận bước sau.
- Yêu cầu cũ có phạm vi nguồn đã kết thúc hoặc được thay thế được xét trên trạng thái hiện tại sau xác nhận rõ; giữ các vùng đã được cho phép nếu còn đang sửa. Chặn thay đổi đồng thời và duyệt lặp, giữ xác nhận lại và lịch sử bản đã duyệt. Khôi phục lối mở phần giá chào đã được cho sửa.
- Đối chiếu chỉ đọc BG-20260925-005 v16: yêu cầu cũ của Nguyễn Công Thảo đang chờ cả 8 vùng, dẫn tới phạm vi trước đã hoàn tất. Thông báo lúc 13:55 có bản ghi gửi cho anh Thảo, chưa đủ căn cứ kết luận đã hiển thị trên trình duyệt của anh. Không tự duyệt/rút yêu cầu hoặc ghi thay đổi báo giá khách.
- Kiểm thử: 11 ca API/core đạt; 3 bài browser đạt (quote-correction-queue, quote-downstream-review, quote-corrections), gồm hai người gửi độc lập, thông báo và quyền xét, rút/gửi lại, phạm vi cũ, xung đột phiên bản, giữ lý do/lựa chọn, tải lại và điện thoại. Cập nhật fixture browser cũ theo quy tắc sửa giá trước Admin duyệt; build đạt.
- Đã triển khai 81cf667 sau sao lưu nguồn/SQLite; container healthy, HTTPS health và 81 hash runtime khớp. Web thật bằng quyền anh Phú mở được form lý do/chọn vùng dù yêu cầu Thảo còn chờ; quyền Thảo mở được form rút yêu cầu. Người có quyền xét yêu cầu cũ hiển thị Nguyễn Ngọc Hợp, Nguyễn Thị Hoàn. Kiểm tra desktop/390 px, chặn ghi nghiệp vụ; các phiên tạm đã thu hồi. Ảnh: artifacts/quote-correction-phu-form-live.png, artifacts/quote-correction-phu-history-live.png, artifacts/quote-correction-thao-form-live.png và các ảnh mobile tương ứng.
### 2026-09-28 — Tách màn xét yêu cầu khỏi form gửi mới (af9153e)
- Đối chiếu đúng ảnh mới BG-20260925-006 v16: chỉ có phạm vi sửa của Phú lập lúc 08:42, đã mở cùng thời điểm và hoàn tất lúc 16:36 khi trình duyệt; không có yêu cầu đang chờ Thảo xét. Hồ sơ này khác BG-20260925-005 kiểm tra ở đợt trước.
- Sửa việc mở lịch sử/thông báo cũ tự hiện form gửi yêu cầu mới. Mặc định hiển thị danh sách và thao tác xét theo quyền; không có yêu cầu chờ thì ghi rõ, hiển thị thời điểm hoàn tất. Form mới chỉ mở khi chủ động chọn Tạo yêu cầu mới / bổ sung; không tự chọn mọi vùng khi chưa có phạm vi đang sửa.
- Giữ luồng kỹ thuật gửi → bộ phận giá cho phép/từ chối trước Admin duyệt. Không chuyển lịch sử đã hoàn tất thành yêu cầu chờ hoặc tạo yêu cầu thay khách.
- Build và 3 bài browser đạt: corrections, correction-queue, downstream-review. Bổ sung hồi quy mở thông báo của phạm vi đã hoàn tất: không có ô lý do/nút gửi hay nút duyệt; tạo mới là thao tác riêng. Luồng yêu cầu đang chờ, xét bởi Giá, xung đột phiên bản và mobile vẫn đạt.
- Đã triển khai af9153e sau sao lưu nguồn/SQLite; container healthy, HTTPS health và 81 hash runtime khớp. Web thật quyền Nguyễn Công Thảo trên đúng BG-20260925-006 xác nhận danh sách lịch sử, thời điểm hoàn tất, không tự mở form gửi; desktop/390 px đạt. Chặn ghi nghiệp vụ và thu hồi phiên tạm. Ảnh: artifacts/correction-history-live.png, artifacts/correction-history-live-mobile.png.

### 2026-09-28 — Kiểm chứng kỹ thuật bàn giao khi chưa có giá nguyên công
- Theo ảnh BG-20260923-003: yêu cầu thiếu đơn giá nguyên công không chặn kỹ thuật lưu và bàn giao. Đối chiếu mã hiện tại: lưu nháp không bắt đủ giá; bàn giao kỹ thuật kiểm dữ liệu kỹ thuật đã loại giá.
- Bổ sung `tests/technical-missing-operation-price-browser.cjs`: tài khoản kỹ thuật không xem giá sửa lượng công việc, bấm lưu máy chủ, tải lại và xác nhận bàn giao toàn bộ qua hộp thoại; API bàn giao từng phần đạt khi đơn giá nguyên công còn trống. Đọc lại bằng Admin xác nhận giá vẫn trống, không tự điền 0.
- Kiểm tra đối chứng: cấu kiện thiếu thành phần vẫn lưu nháp được nhưng bàn giao toàn bộ bị từ chối. Cảnh báo được khoanh trong ảnh là thiếu lượng kg, không phải thiếu đơn giá; ảnh đồng thời có hai cấu kiện chưa có thành phần. Không bỏ kiểm tra cấu thành để xử lý yêu cầu về giá.
- Kiểm thử trình duyệt đạt trên dữ liệu riêng. Đợt này chỉ bổ sung bằng chứng kiểm thử, không thay mã chạy hoặc triển khai lại; chưa xác nhận bàn giao thực tế BG-20260923-003 và không sửa hồ sơ khách.

### 2026-09-28 — Đề nghị công việc và 12 nhóm định mức theo ảnh khách
- Rà lại 14 loại đề nghị đã triển khai: hai nhóm Tài chính/Phục vụ sản xuất, tạo loại khác, duyệt, phân công, thực hiện, trả lại và xác nhận kết quả; browser hồi quy đạt.
- Bổ sung đủ 12 nhóm định mức theo ảnh; giữ giá ca máy, dữ liệu cũ và lịch sử. Khai phạm vi, đơn vị, tỷ lệ, thứ tự mã nguyên công, nguyên công/máy và căn cứ phù hợp từng nhóm. Không tạo số chuẩn giả.
- Bảng đối chiếu theo lệnh có mức chuẩn, số ghi nhận, chênh lệch và nguồn: vật tư/phôi, hao hụt/thu hồi, chuỗi công đoạn, thời gian/năng suất sau bàn giao, QC và chi phí chứng từ. Đúng sản phẩm/đơn vị/khổ/phạm vi; dữ liệu thiếu hoặc dở dang ghi rõ, không coi là 0 hay tiết kiệm.
- Giờ công tổng từng người, số đo giờ máy/điện/khí chưa có nguồn đầy đủ nên mới khai căn cứ, chưa tự kết luận thực tế. QC là lần cuối đang ghi nhận, chưa lũy kế lỗi/làm lại; giá thành là chứng từ đã gắn lệnh, chưa xác nhận đủ chi phí. Chi tiết: [12 nhóm định mức](docs/DINH-MUC-12-NHOM-2026-09-28.md).
- 12 ca API/core liên quan và 3 browser đạt; build đạt. Kiểm tra 12 form/lưu/tải lại/lịch sử, chuỗi bước lặp, tỷ lệ 0%, đơn vị/khổ, quyền chi phí, đối chiếu lệnh và 390 px. Triển khai ghi bổ sung sau xác minh.
- Đã triển khai `afff4d4` sau sao lưu nguồn/SQLite; container healthy, HTTPS health và 82 hash runtime khớp. Web thật kiểm tra đủ 12 nhóm/form, Đối chiếu LSX-01, 14 loại đề nghị và 390 px. LSX-01 hiện chưa có định mức tham chiếu, báo đúng thiếu căn cứ; chặn ghi nghiệp vụ thử. Phiên tạm đã thu hồi. Ảnh: `artifacts/norm-groups-live-desktop.png`, `artifacts/norm-groups-live-comparison.png`, `artifacts/norm-work-requests-live.png`, `artifacts/norm-groups-live-mobile.png`.


### 2026-09-28 — Sửa chặn lưu nguyên công do bảng giá vận chuyển
- Tái hiện đúng BG-20260925-005 v17 trên bản sao SQLite với quyền Nguyễn Khắc Phú: chỉ sửa nguyên công trong phạm vi đã mở cũng bị chặn Bảng giá vận chuyển, lắp đặt. Khi mở báo giá, danh mục làm việc lấy bảng giá chung mới hơn rồi gửi kèm lúc lưu.
- Giữ cấu hình giá mặc định của đúng báo giá khi lưu; không lấy nhầm bảng giá/lịch sử từ danh mục đang làm. Giữ tham chiếu bảo vệ gắn với dữ liệu gốc. Máy chủ hỗ trợ tab cũ gửi đúng cấu hình danh mục hiện hành bằng cách giữ snapshot báo giá; dữ liệu tự sửa khác vẫn qua kiểm tra quyền.
- Kiểm thử 15 ca API/core và 4 browser đạt: mở sửa nguyên công → lưu → tải lại → bàn giao; tab cũ; lịch sử giá bị ẩn; giả mạo giá, ngoài phạm vi và phiên bản cũ bị từ chối; hồi quy kỹ thuật thiếu giá và xét yêu cầu. Bản sao đúng hồ sơ v17 lưu/bàn giao thành công, bảng giá/lịch sử giữ nguyên. Build đạt. Không ghi lưu/bàn giao thử lên hồ sơ khách.
- Đã triển khai `b95cbf1` sau sao lưu nguồn/SQLite; container healthy, HTTPS health và 82 hash runtime khớp. Web thật quyền anh Phú, BG-20260925-005 v17: dữ liệu chuẩn bị lưu giữ đúng bảng giá báo giá dù danh mục làm việc khác; desktop/390 px. Chặn ghi nghiệp vụ, không tự lưu hoặc bàn giao hồ sơ khách; phiên tạm đã thu hồi. Ảnh: `artifacts/quote-defaults-live.png`, `artifacts/quote-defaults-live-mobile.png`.


### 2026-09-28 — Báo giá mới nhất hiển thị trên cùng
- Theo phản hồi mới, đổi thứ tự ngày tạo sang mới → cũ cho danh sách báo giá, gồm tài khoản kỹ thuật và tài khoản chỉ xem bản duyệt. Thay quy tắc cũ → mới ghi trước đó; STT theo danh sách đang lọc, nối tiếp qua trang.
- Ngày tạo vẫn lấy phiên bản đầu tiên trên máy chủ; sửa/lưu/duyệt báo giá cũ không đổi vị trí theo ngày cập nhật. Khi trùng thời điểm, dùng ID giảm dần để thứ tự ổn định.
- Kiểm thử API tạo hai báo giá, kiểm tra thứ tự mới nhất và sửa bản cũ giữ vị trí đạt; hai browser danh sách desktop/mobile và kỹ thuật đạt. Build đạt.
- Đã triển khai `03b7ec6` sau sao lưu nguồn/SQLite; HTTPS health và 82 hash runtime đạt. Web thật kiểm tra 25 báo giá theo ngày tạo giảm dần, BG-20260928-001 ở đầu; desktop/390 px. Không ghi nghiệp vụ; phiên tạm đã thu hồi. Ảnh: `artifacts/quote-newest-live.png`, `artifacts/quote-newest-live-mobile.png`.


### 2026-09-28 — Bảng công đoạn rõ trạng thái và mở rộng vùng rà soát
- Cố định cột công đoạn 156 px, cột tên 240 px (160 px trên điện thoại); bỏ giãn cột theo toàn chiều ngang. Ô đã chọn có nền xanh, viền và chữ Đã chọn; nội dung/điều khiển bị khóa vẫn đọc rõ, giữ khóa sửa.
- Tăng chiều cao vùng bảng, thêm Mở rộng bảng / Thu gọn màn hình và phím Escape; chế độ xem không làm thay đổi báo giá hoặc trạng thái bàn giao. Nhãn đã xác nhận của các bộ phận dùng màu xanh đậm, vẫn có chữ/ký hiệu.
- Build và browser kiểm tra độ rộng cột, tương phản trạng thái khóa, mở rộng/thu gọn/Escape, không đánh dấu dữ liệu thay đổi và 390 px đạt; hồi quy lưu/bàn giao kỹ thuật thiếu giá đạt.
- Đã triển khai `c31b260` sau sao lưu nguồn/SQLite; HTTPS health và 82 hash runtime đạt. Web thật BG-20260925-005 kiểm tra độ rộng cột, mở rộng/thu gọn/Escape và 390 px; không ghi nghiệp vụ, phiên tạm đã thu hồi. Ảnh: `artifacts/operation-review-live.png`, `artifacts/operation-review-live-mobile.png`.


### 2026-09-28 — Kiểm chứng lỗi khóa hệ số khi lưu trước bàn giao kỹ thuật
- Đối chiếu ảnh “Công thức đã khóa: Hệ số tính toán và phạm vi áp dụng” trên BG-20260923-004. Hồ sơ hiện tại đã là v41; không khẳng định tái hiện được trạng thái cũ trong ảnh. Khóa calculationFactors:all vẫn bật.
- Trên bản sao SQLite mới nhất, dùng đúng quyền Nguyễn Khắc Phú: sửa ghi chú nguyên công trong phạm vi được mở, bấm Xác nhận bàn giao → Lưu và tiếp tục, lưu thành công, tải lại giữ nội dung và xác nhận bàn giao đạt. Giữ nguyên pricingDefaults của hồ sơ; không ghi thử lên báo giá khách.
- Bổ sung hồi quy quote-catalog-defaults-browser với hệ số mặc định khác danh mục, khóa công thức đang bật và đúng hộp Lưu và tiếp tục. Luồng tab cũ gửi danh mục mới vẫn lưu được; giá ngoài quyền, sửa hệ số trái quyền, ngoài phạm vi và phiên bản cũ bị chặn. Browser đạt; 10 ca formula-access đạt.
- Bản sửa b95cbf1 đã có trên web đang chạy: giữ căn cứ mặc định của báo giá khi danh mục làm việc mới hơn, xử lý tab cũ gửi đúng mặc định đã phát hành. Đợt này bổ sung kiểm chứng, không đổi mã chạy hoặc triển khai lại, không mở khóa hay cấp thêm quyền.
- Kiểm tra web thật chỉ đọc bằng quyền anh Phú trên BG-20260923-004 v41: dữ liệu gửi lưu giữ đúng mặc định hồ sơ dù danh mục hiện hành khác, không tự phát sinh thay đổi. Desktop/390 px; phiên tạm đã thu hồi. Ảnh: artifacts/formula-defaults-live.png và artifacts/formula-defaults-live-mobile.png.


### 2026-09-28 — Bỏ cột chưa sử dụng sau bàn giao và gom bảng phân tích giá
- Tái hiện lỗi trên mã cũ: chọn bỏ công đoạn chưa dùng rồi Áp dụng bị luồng khóa kỹ thuật ngăn vì lựa chọn cột được ghi như thay đổi hồ sơ. Tách lựa chọn hiển thị trên báo giá máy chủ thành tùy chọn trình duyệt theo tài khoản/báo giá; giữ sau tải lại, không đổi dữ liệu, giá, trạng thái xác nhận hay phát sinh chưa lưu. Công đoạn đang dùng luôn được giữ. Thêm nguyên công mới vào hồ sơ vẫn qua quyền và kiểm tra sửa kỹ thuật hiện có.
- Bảng phân tích cơ cấu giá có cột nhãn/mức/thành tiền/nơi khai báo với chiều rộng giới hạn, chữ 14 px và khoảng dòng rõ hơn; nhiều phương án cuộn ngang. Đây là chỉnh bố cục, không thay công thức hay kết luận rằng số liệu trong ảnh sai; chưa có giá trị đối chiếu cụ thể cho chú thích “vẫn chưa thay đổi”.
- Browser hồi quy mới thất bại trên mã cũ, đạt sau sửa: bỏ chọn/áp dụng/tải lại, giữ dữ liệu và khóa, toàn màn hình và 390 px. Browser bố cục phân tích giá và hồi quy lưu/bàn giao có khóa hệ số đạt; build đạt. Bài policy-operation-feedback-browser cũ thất bại tại nút add-sales-factor không tồn tại, đã đối chứng cùng lỗi trên HEAD trước đợt này.
- Triển khai f60b446 sau sao lưu nguồn/SQLite; HTTPS health và 82 hash runtime khớp. Web thật quyền Nguyễn Khắc Phú, BG-20260925-006: bỏ cột chưa dùng, mở lại/tải lại giữ lựa chọn, không làm thay đổi nội dung báo giá; bảng phân tích giá chữ 14 px, desktop/390 px. Chặn ghi nghiệp vụ; phiên tạm đã thu hồi. Ảnh: artifacts/operation-column-live.png, artifacts/source-analysis-compact-live.png, artifacts/source-analysis-compact-live-mobile.png.


### 2026-09-28 — Sửa lưu kỹ thuật với tham chiếu hệ số cũ, đúng BG-20260922-002 v43
- Đính chính: ảnh rõ mới xác định BG-20260922-002, không phải BG-20260923-004 đã đối chiếu ở ghi nhận trước. Phép thử ghi chú trên hồ sơ khác không đủ để kết luận lỗi khách đã hết.
- Lấy bản sao hiện tại của đúng hồ sơ v43, dùng quyền Nguyễn Khắc Phú. Tái hiện bằng tham chiếu hệ số ẩn máy chủ cấp từ dữ liệu v39: hệ số quản lý cũ được khôi phục khi gửi lại, dẫn tới 403 “Công thức đã khóa: Hệ số tính toán và phạm vi áp dụng”. Đây là kịch bản tái hiện từ lịch sử thật, chưa lấy được payload chưa lưu trực tiếp từ tab của khách.
- Máy chủ giữ hệ số hiện tại khi người không có quyền sửa hệ số gửi giá trị ẩn qua tham chiếu hợp lệ đã cấp trước đó. Chỉ áp dụng trường được khôi phục từ tham chiếu xác thực; không nhận giá trị hệ số tự gửi, không mở khóa, không nới phạm vi kỹ thuật. Chặn tham chiếu tài khoản khác và sai phiên bản. Người được sửa hệ số tiếp tục qua kiểm tra hiện hành.
- Cùng payload trước sửa thất bại 403, sau sửa lưu → tải lại → bàn giao đạt trên bản sao đúng v43; toàn bộ quote.pricing và pricingDefaults giữ nguyên. Thay đổi kỹ thuật được giữ. Tab đang mở có thể thử lưu lại mà không cần tải lại để nhận mã giao diện mới.
- 11 ca formula-access đạt; browser quote-catalog-defaults bổ sung tham chiếu cũ, Lưu và tiếp tục, tải lại, bàn giao và các trường hợp trái quyền đạt; build đạt. Một lần chạy bản sao gặp thiếu dung lượng máy thử, dọn bản sao thử cũ và chạy lại đạt.
- Triển khai 9a24158 sau sao lưu nguồn/SQLite; HTTPS health và 82 hash runtime khớp. Web thật kiểm tra chỉ đọc đúng BG-20260922-002 v43 bằng quyền anh Phú ở desktop/390 px, không ghi thử vào hồ sơ khách; phiên tạm đã thu hồi. Ảnh: artifacts/stale-factor-live.png, artifacts/stale-factor-live-mobile.png.


### 2026-09-28 — Lỗi khóa hệ số vẫn được phản ánh sau F5: chưa đóng
- Khách báo vẫn lỗi trên BG-20260922-002 v43 sau F5. Bản sửa 9a24158 mới xử lý kịch bản tham chiếu hệ số cũ đã tái hiện, chưa đủ kết luận hết lỗi của tab khách.
- Kiểm tra thêm trên bản sao v43 với quyền anh Phú: tải lại trang, mở form công đoạn, sửa lượng, Lưu và tiếp tục, tải lại và bàn giao đạt. Chưa thu được payload gây lỗi của khách. Thử bản nháp danh mục cũ giữ trong localStorage có thể gây lỗi công thức khác; chưa coi đó là nguyên nhân thực tế.
- Bổ sung mã đối chiếu ngẫu nhiên ở lỗi khóa công thức; nhật ký máy chủ chỉ ghi mã, mã báo giá, vùng và đường dẫn trường khác nhau, không ghi giá trị hệ số/công thức hay toàn bộ payload. Giữ nguyên kiểm tra quyền và khóa. 11 kiểm thử formula-access đạt.
- Triển khai 91a4773 sau sao lưu nguồn/SQLite; HTTPS health và 82 hash runtime khớp. Đã nhờ thử lưu trên tab đang lỗi để lấy mã đối chiếu; tại lúc kiểm tra nhật ký chưa có lần lỗi mới. Trạng thái còn mở, không ghi đã sửa dứt điểm.
- Yêu cầu liên kết bộ phận/mục đích của đề nghị vật tư với cơ cấu tổ chức và chứng từ nguồn vẫn đang chờ triển khai; ưu tiên xử lý lỗi lưu theo phản hồi mới nhất.


### 2026-09-28 — Đối chiếu mã 9f8a5271 và sửa danh mục hệ số ẩn khi lưu
- Nhật ký đúng mã 9f8a5271 của BG-20260922-002 chỉ ra 15 dòng rates.0–rates.14 ở danh mục, không phải hệ số quản lý của báo giá. Các lần thử tiếp theo cùng dấu lỗi. Kết quả này thay giả thuyết tham chiếu hệ số báo giá cũ ở đợt trước.
- Tái hiện cùng 15 đường dẫn lỗi trên bản sao SQLite mới nhất, đúng hồ sơ v43 và quyền Nguyễn Khắc Phú: bản nháp danh mục lưu trong trình duyệt có hệ số bị ẩn nhưng mất tham chiếu khôi phục; F5 phục hồi lại bản nháp đó. Lưu kỹ thuật bị hiểu thành xóa hệ số danh mục. Chưa thu toàn bộ payload chưa lưu trực tiếp từ tab khách.
- Tách danh mục nguyên công gửi cùng báo giá khỏi bản nháp danh mục dùng chung. Máy chủ nhận diện toàn bộ danh mục khớp dạng đã che hệ số của dữ liệu đã biết và giữ nguyên danh mục đang lưu; hỗ trợ cả tab cũ mất tham chiếu. Không bỏ khóa công thức, không cấp quyền hoặc nhận hệ số tự sửa.
- Trước sửa tái hiện 403; sau sửa lưu → tải lại → bàn giao đạt trên bản sao v43, cả giao diện cũ và mới. pricingDefaults, rates, quote.pricing và quote.ratesSnapshot giữ nguyên; ghi chú kỹ thuật được lưu. Thử thêm nguyên công đã phát hành cũng đạt.
- 12 ca formula-access đạt; browser quote-catalog-defaults và technical-missing-operation-price đạt; build đạt. Có hồi quy F5 phục hồi bản nháp mất tham chiếu, giá/hệ số tự sửa, danh mục bị cắt bớt và phiên bản cũ bị chặn.
- Triển khai 40d4413 sau sao lưu nguồn/SQLite; HTTPS health và 82 hash runtime khớp. Không ghi lưu/bàn giao thử lên hồ sơ khách. Tab đang lỗi có thể thử lưu lại mà không cần F5 để nhận xử lý máy chủ; chưa ghi nhận khách lưu thành công sau bản này. Dừng phần đề nghị vật tư theo yêu cầu, chưa triển khai phần đang làm dở.


### 2026-09-28 — Lỗi tiếp theo f48a4157: danh mục công thức cũ lẫn vào lưu báo giá
- Khách thử lại vẫn bị chặn Tấm hình tròn. Nhật ký f48a4157 trỏ shapeDefinitions:QD-nmu7pk3td2a; tám đường dẫn lệch khớp danh mục v39–46. Bản 40d4413 chỉ xử lý hệ số, chưa xử lý hết bản nháp danh mục cũ đi kèm. Không coi kiểm thử trước là bằng chứng khách đã lưu được.
- Tách toàn bộ danh mục nền gửi lưu khỏi danh mục đang làm việc, giữ snapshot đã tải của báo giá; đồng bộ cả đường làm mới đầu vào. Nội dung kỹ thuật, vật tư/công đoạn được chọn trong báo giá vẫn lưu theo quyền. Bản nháp danh mục được giữ riêng.
- Với tab cũ, chỉ nhận diện các mục khớp chính xác lịch sử danh mục đã phát hành để giữ snapshot hiện hành; không đưa công thức cũ trở lại hồ sơ. Không thay thông số/công thức nhúng trong dòng báo giá, không bỏ kiểm tra khóa, quyền hoặc phiên bản; danh mục tự sửa khác lịch sử tiếp tục qua kiểm tra hiện có.
- Tái hiện trước sửa trên đúng bản sao BG-20260922-002 v43 và quyền Phú: toàn bộ danh mục v46, mất tham chiếu hệ số, cùng lỗi Tấm hình tròn và tám đường dẫn như f48a4157. Sau sửa cùng dữ liệu qua lưu → tải lại → bàn giao; hệ số, công thức và danh mục của hồ sơ giữ nguyên. Cả giao diện mới sau F5 và giả lập payload tab cũ đạt; thêm nguyên công đã phát hành vẫn đạt.
- 13 ca formula-access đạt, gồm lịch sử danh mục, công thức tự sửa/nhúng trái quyền, lưu danh mục và phiên bản cũ. Browser quote-catalog-defaults, technical-missing-operation-price và các kịch bản bản sao thực tế đạt; build đạt.
- Triển khai c098c23 sau sao lưu nguồn/SQLite; HTTPS health và 83 hash runtime khớp. Trình duyệt web thật quyền Phú, đúng v43: các nhóm danh mục gửi lưu khớp snapshot và tách khỏi dữ liệu làm việc, desktop/390 px. Chặn ghi nghiệp vụ, không lưu/bàn giao thay khách; phiên tạm đã thu hồi. Ảnh artifacts/catalog-isolation-live.png và artifacts/catalog-isolation-live-mobile.png. Chưa có xác nhận khách lưu thành công sau bản này.


### 2026-09-28 — Khai báo nguyên công và lưu nháp khi chưa đủ dữ liệu
- Theo chốt khách 22:28: sai/thiếu vẫn lưu hiện trạng, chưa được xác nhận. Form công đoạn không còn tự tra bảng hệ số trên trình duyệt khi đang làm báo giá máy chủ; chỉ gửi lựa chọn để máy chủ giải hệ số. Áp dụng cả khai riêng và đánh giá nhanh, không phụ thuộc cờ factorsHidden của phiên cũ. Bổ sung kiểm tra thiếu bảng để không phát sinh TypeError categories.
- Form cho lưu lượng trống/âm và đánh giá chưa chọn mức dưới dạng nháp; giữ nguyên sau lưu máy chủ/tải lại, không tự đổi trống thành 0. Cổng bàn giao toàn bộ/từng phần kiểm tra lượng khai và mức độ còn thiếu; sửa đủ mới xác nhận. Không bỏ quyền, khóa công thức hay kiểm tra phiên bản. Các lỗi cấu thành/giá đã có vẫn lưu nháp theo luồng hiện hành; không khẳng định mọi dữ liệu tùy ý đều được chấp nhận.
- Browser hồi quy phiên thiếu cờ factorsHidden thất bại trước sửa, đạt sau sửa; kiểm giá trị hệ số thực đã chọn trên máy chủ. Bản sao BG-20260922-002 v43, quyền Phú: mở Chấn, chọn Trung bình, lượng 2, lưu → tải lại → bàn giao đạt, bảng hệ số và giá được giữ.
- 17 ca core/API về công thức/quyền và độ phức tạp đạt. Browser hidden-factor-complexity, quote-catalog-defaults, operation-incomplete-draft đạt; bài cuối kiểm lượng trống/âm, chưa chọn mức, lưu và tải lại, chặn bàn giao, sửa rồi bàn giao, thiếu giá không bị điền 0. Build đạt.
- Triển khai cuối 93a51ea sau sao lưu nguồn/SQLite; HTTPS health và 85 hash runtime khớp. Không lưu/bàn giao thử lên hồ sơ khách. Thay đổi form cần giao diện mới; không hướng dẫn F5 khi người dùng còn nội dung chưa lưu trong tab cũ. Chưa xác nhận khách đã lưu thành công sau đợt này.


### 2026-09-28 — Bộ phận và căn cứ nguồn của đề nghị vật tư
- Đề nghị vật tư bộ phận chọn đơn vị từ cây tổ chức đang hoạt động, loại cả nhánh có cấp cha ngừng dùng. Không tự giới hạn chỉ bộ phận của người gửi; dùng quyền tạo đề nghị hiện có.
- Bắt buộc chọn một trong bảy mục đích và mã nguồn: báo giá, đơn hàng, lệnh, dự án, hợp đồng, phục vụ sản xuất, văn phòng. Báo giá/đơn/lệnh/hợp đồng lấy ID thật theo quyền nguồn; dự án/mã sản xuất/chi phí chung dùng danh mục mã quản trị do Admin tạo, đổi tên hoặc ngừng dùng. Chưa phải phân hệ quản lý dự án đầy đủ.
- Máy chủ kiểm lại bộ phận/mã/loại/quyền khi gửi; giữ ID và tên/mã tại thời điểm gửi, không nhận tên/căn cứ tự thay từ client. Danh mục đổi tên/ngừng dùng không đổi lịch sử. Giữ luồng mua, điều chỉnh có lý do, duyệt/nhập/cấp và chống lặp. Liên kết mục đích không tự sinh lệnh hay chứng từ kế toán hoặc tự tính định mức theo nguồn.
- Form quản lý mã giữ bộ phận, ghi chú và các dòng vật tư đang nhập khi tạo mã rồi quay lại. Đề nghị cũ khai tay vẫn xem/điều chỉnh theo hồ sơ gốc, không tự gán lại nguồn.
- Hai bài API liên thông đạt: đủ bảy loại nguồn, mã sai/ngoài quyền, bộ phận ngừng hoạt động, mã trùng/ngừng dùng, lịch sử và vòng đời mua–nhập–cấp. Hai browser bộ phận và đề nghị theo lệnh đạt; gồm quản lý mã, giữ form, lưu/tải lại, điều chỉnh và 390 px. Build đạt.
- Triển khai c4b8c50 sau sao lưu nguồn/SQLite; HTTPS health và 86 hash runtime khớp. Trình duyệt web thật Admin kiểm tra 8 bộ phận, 25 báo giá, 2 đơn hàng, 2 lệnh; các nhóm nguồn còn lại trống tại lúc kiểm tra. Không tạo mã/đề nghị thử, chặn ghi nghiệp vụ; phiên tạm đã thu hồi. Ảnh artifacts/material-context-live.png và artifacts/material-context-live-mobile.png.


### 2026-09-28 — Xoay và sắp phôi số lượng lớn (899835d)
- Sửa đường mở từ Cách xếp có sẵn đang ẩn lựa chọn chỉnh tay và nút lấy gợi ý. Cả đường mở trực tiếp và chọn cách xếp đều cho chọn phôi, kéo vị trí, nhập tọa độ/đổi tấm và xoay; chỉ hiện cách xếp phù hợp hình dạng.
- Nâng giới hạn chỉnh tay từ 500 lên 10.000 phôi tại giao diện và kiểm tra máy chủ. Sơ đồ chia trang 20 khổ, chọn phôi tự chuyển tới trang chứa phôi; không dựng hàng trăm tấm cùng lúc. Giữ kiểm tra đủ định danh/số lượng, khổ, va chạm, mạch cắt, hướng cố định và phương án cũ khi thông số thay đổi. Không cam kết tối ưu cắt toàn cục.
- 22 ca core liên quan đạt. Browser với tài khoản kỹ thuật và 3.600 phôi: mở từ preset, chuyển trang/chọn phôi cuối, xoay 90°, kéo, đổi tấm, chặn vượt khổ, lưu máy chủ/tải lại giữ vị trí và góc; kiểm tra 390 px đạt. Build đạt.
- Triển khai 899835d sau sao lưu nguồn/SQLite; HTTPS health và 88 hash runtime khớp. Web thật BG-20260923-004, VT-00021 có đúng 3.600 phôi: mở chỉnh tay từ preset, xoay thử trong hộp, sơ đồ chia trang, desktop/390 px đạt. Không bấm Áp dụng hoặc lưu thay đổi vào báo giá khách; lưu/tải lại đã thử trên dữ liệu riêng. Phiên xác minh đã thu hồi. Ảnh: artifacts/nesting-large-live.png, artifacts/nesting-large-live-mobile.png.


### 2026-09-28 — Chọn cấp độ sản xuất bị chặn Hệ số tác động (ec6f632)
- Tái hiện lỗi khi tài khoản được xem chi phí và sửa công đoạn nhưng không được sửa hệ số: chọn cấp độ tự ghi cả phần trăm/hồ sơ hệ số tại trình duyệt, bị kiểm tra phạm vi chặn và trả lựa chọn về trống.
- Báo giá máy chủ chỉ gửi tên cấp độ; máy chủ kiểm danh mục và lấy hệ số tương ứng theo luồng đã có. Chế độ offline vẫn tính từ danh mục cục bộ. Không cấp thêm quyền sửa hệ số hoặc bỏ kiểm tra phạm vi kỹ thuật.
- Browser hồi quy thất bại trước sửa, đạt sau sửa với ba kiểu quyền (cũ theo danh sách, ma trận chỉ xem hệ số, kỹ thuật ẩn giá): chọn/lưu/tải lại giữ cấp độ; Admin đọc lại hệ số đúng; cấp độ không tồn tại và ghi trực tiếp phần trăm bị từ chối; tài khoản thiếu quyền công đoạn bị khóa lựa chọn. 6 ca core và browser offline/khai báo phức tạp đạt; build đạt.
- Bản sao SQLite dùng quyền nv-003 trên BG-20260923-003 có sản phẩm STEEL MESH FENCE: chọn cấp độ, lưu và tải lại đạt. Triển khai ec6f632 sau sao lưu nguồn/SQLite, HTTPS health và 88 hash runtime khớp. Web thật cùng tài khoản/hồ sơ chọn C1 không còn lỗi Hệ số tác động; chỉ thử trong bộ nhớ, chặn mọi ghi nghiệp vụ, không lưu thay cấp độ khách. Phiên tạm đã thu hồi. Ảnh: artifacts/production-level-live.png, artifacts/production-level-live-mobile.png.


### 2026-09-28 — Tên gợi ý vật tư đủ đặc tính, đúng thứ tự (c621f17)
- Bỏ quy tắc ẩn đặc tính Cán nóng. Tên gợi ý theo Vật liệu → Mác → Hình dạng → Đặc tính → Kích thước; ví dụ Thép CT3 tấm cán nóng dày 1,5 mm. Áp dụng cả tấm/thanh và quy ước cũ; thương hiệu/thông số bổ sung giữ phía sau, thiết bị giữ cách đặt tên riêng.
- Đổi đặc tính/kích thước cập nhật gợi ý ngay; chỉ bấm Dùng tên này mới thay ô tên, không tự đổi tên mã hoặc hồ sơ đã lưu.
- 14 ca core và browser chọn đặc tính/cập nhật gợi ý/dùng tên/giữ tên đã nhập/lưu vật tư đạt; build đạt. Triển khai c621f17 sau sao lưu nguồn/SQLite, HTTPS health và 89 hash runtime khớp. Web thật kiểm tra đúng Thép–CT3–Tấm–Cán nóng–1,5 mm và dùng tên trong form; không lưu mã thử. Phiên tạm đã thu hồi. Ảnh: artifacts/material-name-order-live.png, artifacts/material-name-order-live-mobile.png.


### 2026-09-29 — Lưu công đoạn Phú và đầu vào Tú (47ea260)
- Đối chiếu snapshot máy chủ mới: nv-003 có quyền sửa nguyên công, không sửa hệ số; nv-007 có quyền dùng đầu vào và thêm/sửa khách hàng, không tạo/sửa toàn bộ báo giá. Không thay cấu hình quyền tài khoản.
- Đầu vào báo giá kiểm quyền xem báo giá + dùng đầu vào + thêm/sửa khách hàng, không đòi quyền tạo toàn bộ báo giá. Payload vẫn chỉ nhận đầu vào; API tạo/sửa báo giá đầy đủ vẫn bị chặn. Sửa thêm lỗi đọc __accessRef khi danh mục nguyên công bị ẩn toàn bộ, khiến sửa đầu vào trả lỗi máy chủ.
- Lưu báo giá theo quyền hạn chế lấy các hệ số chỉ đọc từ dữ liệu đã tải trên máy chủ, giữ các thay đổi kỹ thuật đang nhập. Tham chiếu ẩn từ tab cũ chấp nhận mặt nạ hoặc đúng giá trị gốc của tham chiếu đó rồi khôi phục tại máy chủ; giá trị tùy ý và tham chiếu khác tài khoản vẫn bị chặn, giá trị hệ số hiện hành không bị ghi đè bằng bản cũ.
- Bản mới tải của BG-20260925-005 trên snapshot lưu được trước sửa; chưa thu được payload cụ thể từ tab lỗi khách. Đã tái hiện dữ liệu hệ số cũ lẫn vào bản nhập và kiểm tra sửa lượng nguyên công → lưu → tải lại giữ lượng, hệ số thật giữ nguyên. Không kết luận đã xác nhận thành công trên chính tab đang lỗi của khách.
- Trên bản sao SQLite với đúng nv-007: tạo đầu vào có link, tải lại và sửa đạt. 16 ca API/core đạt, gồm kiểm quyền hẹp, ngăn gọi API báo giá đầy đủ, tham chiếu đúng/sai, phiên bản cũ và bảo toàn giá. Browser cấp độ/phân quyền và khai báo nguyên công/hệ số ẩn đạt; build đạt.
- Đã triển khai 47ea260 sau sao lưu nguồn/SQLite. HTTPS health và 89 hash runtime khớp. Web thật kiểm tra payload chỉ đọc của Phú trên BG-20260925-005 và form đầu vào của Tú; không lưu thử hồ sơ khách. Hai phiên tạm đã thu hồi. Ảnh: artifacts/save-sep29-phu-live.png, artifacts/save-sep29-tu-live.png.


### 2026-09-29 — Nguồn giá theo phạm vi báo giá và kiểm chứng lưu của Thảo (e83a2fc)
- Bảng nguồn giá mục 6 chỉ đưa các bảng/bậc TMC và công trọn gói thực sự gắn với sản phẩm/phân rã TMC trong báo giá. Báo giá cơ khí không còn liệt kê toàn bộ đơn giá thang, máng, nắp và phụ kiện không liên quan. Giữ các nguồn vật tư/nguyên công/chi phí đang dùng và lịch sử đã khai; không xóa danh mục chung hoặc tự xác nhận giá.
- Đối chiếu bản sao dữ liệu hiện tại: BG-20260923-004 v42 đã thay tỷ lệ hao hụt thành 5% sau xác nhận giá v38; bàn giao giá đang mở lại. BG-20260925-006 v18 cũng thay hao hụt/tận dụng sau xác nhận giá v14. Đây là căn cứ cần xác nhận giá lại, không tự khôi phục xác nhận cũ để bỏ qua thay đổi kỹ thuật.
- Dùng đúng quyền nv-002 Nguyễn Công Thảo trên bản sao SQLite mới: hai báo giá đều sửa hệ số bằng form, lưu máy chủ, F5 giữ giá trị; xác nhận nguồn giá đang dùng, Lưu toàn bộ và F5 đạt; xác nhận kỹ thuật còn hiệu lực. Chưa tái hiện được lỗi overhead từ chính tab cũ của khách. Không nhận việc kiểm thử trên lần mở mới là bằng chứng đã gỡ mọi trường hợp đang nhập dở. Bổ sung mã đối chiếu/log đường dẫn trường bị chặn, không ghi giá trị hoặc nội dung khách vào log, để truy đúng lỗi nếu tái phát; không nới quyền dữ liệu ẩn.
- 43 ca API/core đạt (nguồn giá, thuế, khóa công thức, tham chiếu cũ và quyền); browser hồi quy sửa giá/hệ số dưới khóa danh mục, lưu nguồn giá và tải lại đạt. Fixture thu hồi quyền được đổi sang thử hệ số thực sự khác; giá trị nguyên bản từ tham chiếu máy chủ được phép giữ theo quy tắc 47ea260. Build đạt.
- Đã triển khai e83a2fc sau sao lưu nguồn/SQLite; HTTPS health và 90 hash runtime khớp, container healthy. Web thật quyền Thảo xác minh hai báo giá không có dòng TMC ngoài phạm vi, form hệ số mở sửa được; kiểm tra 390 px. Mọi ghi nghiệp vụ bị chặn trong phiên xác minh; phiên tạm đã thu hồi. Ảnh: artifacts/price-scope-BG-20260923-004-live.png, artifacts/price-scope-BG-20260925-006-live.png, artifacts/price-scope-mobile-live.png. Không sửa hoặc xác nhận giá thay khách.


### 2026-09-29 — Sửa gửi trường ẩn khi tính lại/lưu báo giá (558ed37)
- Tái hiện lỗi tmcLoss bằng quyền nv-003 trên bản sao BG-20260925-005: bật khóa hệ số trong môi trường thử, đặt lại giá trị mặc định tmcLoss tại trình duyệt rồi sửa lượng nguyên công. Mã trước sửa từ chối trường $.document.quote.pricing.tmcLoss. Đây là ca tái hiện có điều kiện kiểm soát, chưa phải bản chụp nguyên payload của tab khách.
- Máy chủ trả tên các trường bị ẩn kèm tham chiếu bảo vệ, không trả giá trị thật. Khi tính lại và lưu, trình duyệt bỏ giá trị thay thế của các trường này, giữ tham chiếu để máy chủ khôi phục. Áp dụng cả số, đối tượng và mảng bị ẩn, không chỉ danh sách overhead/tmcLoss. Trường kỹ thuật được nhập và trường giá được cấp quyền tiếp tục gửi bình thường.
- Máy chủ không tin danh sách trường do client gửi để cấp quyền; chỉ phục hồi từ tham chiếu đúng tài khoản. API sửa trực tiếp tmcLoss vẫn bị từ chối. Metadata không lưu vào hồ sơ. Không mở khóa công thức hoặc thay quyền để chữa lỗi lưu.
- Ca bản sao thất bại trước sửa, đạt sau sửa: lượng nguyên công lưu và tải lại đúng, giá trị hệ số máy chủ giữ nguyên. 15 ca API/quyền và 4 browser đạt: protected-save-payload, production-level-server, hidden-factor-complexity, draft-commercial-edit. Kiểm tra tính lại, lưu, F5, các trường ẩn dạng số/mảng, cấp độ sản xuất, khai công đoạn và lưu giá theo quyền; build đạt.
- Triển khai 558ed37 sau sao lưu nguồn/SQLite; HTTPS health và 91 hash runtime khớp, container healthy. Web thật quyền Phú mở BG-20260925-005, kiểm tra serializer mới và desktop/390 px; chặn ghi nghiệp vụ, phiên tạm đã thu hồi. Ảnh: artifacts/protected-save-live.png, artifacts/protected-save-mobile-live.png. Không ghi hoặc bàn giao thử hồ sơ khách; chưa xác minh chính tab khách đang có dữ liệu chưa lưu.


### 2026-09-29 — Đối chiếu lỗi 9d6f56fe: danh mục mặc định đi kèm báo giá (e3da88d)
- Log vận hành xác nhận mã 9d6f56fe của nv-003 bị chặn tại $.document.pricingDefaults.tmcLoss, khác $.document.quote.pricing.tmcLoss của ca kiểm tra trước. Bản 558ed37 còn bỏ sót phần danh mục trong đường gửi lưu; không coi lần kiểm tra trước là đã xử lý đủ lỗi khách.
- Giao diện mới loại giá trị trường ẩn khỏi cả phần danh mục đi kèm. Máy chủ bổ sung tương thích cho PUT báo giá hiện có và tính lại: trường bị ẩn trong pricingDefaults được khôi phục từ tham chiếu đúng tài khoản, bỏ giá trị client thay thế. Không áp dụng ngoại lệ này cho sửa danh mục, tạo báo giá mới hoặc sửa hệ số trong quote.pricing; các kiểm tra quyền/phiên bản/phạm vi vẫn giữ.
- Bản sao BG-20260925-005 và quyền Phú, có khóa hệ số trong môi trường thử: gửi payload kiểu tab cũ với pricingDefaults.tmcLoss sai và không có __accessFields. Đối chứng máy chủ trước sửa thất bại đúng đường log; sau sửa tính lại/lưu/F5 đạt, lượng nguyên công mới giữ đúng, toàn bộ pricingDefaults giữ nguyên. Đây là tái hiện theo đường lỗi thực tế, không có nguyên payload của tab khách.
- 16 ca API/quyền, browser protected-save-payload có bổ sung gửi kiểu tab cũ, browser draft-commercial-edit và luồng bản sao dữ liệu thật đạt. API sửa trái phép quote.pricing.tmcLoss và dùng tham chiếu tài khoản khác vẫn bị từ chối. Build đạt.
- Đã triển khai e3da88d sau sao lưu nguồn/SQLite; HTTPS health và 91 hash runtime khớp, container healthy. Không ghi thử hồ sơ vận hành. Bản tương thích phía máy chủ cho phép tab đang mở thử lưu lại mà không cần F5 để nhận logic mới; kết quả chính tab khách cần đối chiếu sau thao tác.


### 2026-09-29 — Lỗi lưu hệ số của Thảo, mã 30842fa6 (befdaa2)
- Truy đúng log vận hành: nv-002 bị chặn tại $.document.rates[0].factors khi lưu BG-20260923-004. Phần danh mục nguyên công đi kèm bị gửi giá trị thay thế của trường ẩn; bản tương thích e3da88d mới bao quát pricingDefaults nên vẫn bỏ sót đường này.
- Mở rộng khôi phục từ tham chiếu đúng tài khoản cho các gốc danh mục đi kèm báo giá đã xác định: pricingDefaults, rates, materials, rules, library, shapeDefinitions, stockSizes, conventions, materialPrices, catalogPriceBaseline. Giá trị ẩn client gửi không được áp dụng; máy chủ phục hồi giá trị đã bảo vệ. Chỉ áp dụng đường cập nhật báo giá hiện có/tính lại, không áp dụng ghi danh mục hoặc phần quote. Không nới quyền sửa hệ số/nguyên công thực trong báo giá.
- Bản sao BG-20260923-004, đúng quyền nv-002 và khóa hệ số trong môi trường thử: gửi rates[0].factors bị thay thế theo kiểu tab cũ, đồng thời sửa overhead của báo giá. Đối chứng máy chủ trước sửa thất bại đúng đường log; sau sửa tính lại, lưu, tải lại đạt; hệ số báo giá giữ giá trị mới, toàn bộ rates và pricingDefaults giữ nguyên. Không có nguyên payload của tab khách; ca thử dựa trên đường lỗi đã xác thực.
- 16 ca API/quyền và hai browser protected-save-payload/draft-commercial-edit đạt; ca bản sao thực tế đạt. Build đạt. Triển khai befdaa2 sau sao lưu nguồn/SQLite, HTTPS health và 91 hash runtime khớp; container healthy. Không ghi thử hồ sơ khách. Thay đổi phía máy chủ hỗ trợ thử lưu lại ngay trên tab đang mở.


### 2026-09-29 — Giữ hồ sơ và mục đang xem sau F5 (3341203)
- Lưu vị trí điều hướng riêng trong phiên từng tab/tài khoản: báo giá, phiên bản lịch sử nếu đang xem, tab trong 8 bước, mục giá con, dòng đang chọn và vị trí cuộn. Sau F5 xác thực lại phiên, tải hồ sơ từ máy chủ rồi mở lại mục tương ứng; không trả mặc định về màn hình chính.
- Có khôi phục màn công việc/thu chi/chấm công/lương, kho–sản xuất theo tab/lệnh, hợp đồng, định mức, đề nghị công việc và báo cáo qua đường mở hiện có. Chỉ lưu mã/vị trí điều hướng; không lưu hồ sơ nghiệp vụ hoặc nội dung form chưa gửi. Các hộp thoại nhập liệu chưa có cơ chế phục hồi bản nháp trong thay đổi này.
- Ưu tiên liên kết báo giá được mở trực tiếp. Xóa vị trí khi đăng xuất/đổi tài khoản; hồ sơ không còn truy cập được báo lỗi và trở về màn hiện có, không bỏ kiểm tra quyền máy chủ. Đây là khôi phục vị trí, không thay thao tác lưu dữ liệu trước F5.
- Browser navigation-resume đạt: đủ 8 tab báo giá, tab giá con, dòng được chọn, bảng giao việc, kho, tab trình duyệt độc lập, liên kết trực tiếp và đăng xuất. Browser hồi quy lưu giá/hệ số đạt; build đạt.
- Triển khai 3341203 sau sao lưu nguồn/SQLite; HTTPS health và 92 hash runtime khớp, container healthy. Web thật quyền Phú trên BG-20260925-005: F5 giữ đúng báo giá và tab Công đoạn/Khai triển & hao hụt, kiểm tra desktop/390 px, không ghi nghiệp vụ thử. Phiên tạm đã thu hồi. Ảnh: artifacts/navigation-resume-live.png, artifacts/navigation-resume-mobile-live.png.


### 2026-09-29 — Phản hồi khi chọn phần dư ngoài phạm vi mở sửa (4cd6979)
- Tái hiện đúng BG-20260925-005 bằng quyền Nguyễn Khắc Phú trên bản sao SQLite mới nhất: phạm vi đang mở chỉ có Nguyên công và định mức. Chọn lô phần dư 3.200 × 80 hoặc bấm sơ đồ bị chặn bởi phạm vi Cấu thành, kích thước và hao hụt; lỗi trước đây thoát khỏi bộ xử lý sự kiện nên không hiện thông báo.
- Hiện lý do ngay tại bảng phần dư và nút Đề nghị bổ sung phạm vi hao hụt, mở đúng lựa chọn/lý do để người dùng xem và gửi. Bắt lỗi chọn phần dư, phục hồi ô chọn và trạng thái chưa lưu, hiện thông báo tại màn hình. Không tự mở quyền, duyệt yêu cầu hoặc thay phần dư trên hồ sơ thật.
- 19 ca core/API phần dư và yêu cầu mở sửa đạt; browser hồi quy mới đạt. Trên bản sao đúng hồ sơ: chặn thao tác ngoài phạm vi, gửi và duyệt bổ sung, chọn 19 phần dư, chọn sơ đồ/bàn phím, lưu máy chủ/F5 và điện thoại đạt; không có lỗi JavaScript không được xử lý.
- Đã triển khai 4cd6979 sau sao lưu nguồn/SQLite; HTTPS health và 93 hash runtime khớp. Web thật quyền Phú kiểm tra thông báo, thao tác bị chặn giữ nguyên dữ liệu, form bổ sung phạm vi và desktop/390 px đạt. Chặn ghi nghiệp vụ, phiên tạm đã thu hồi. Ảnh: artifacts/remnant-scope-live.png, artifacts/remnant-scope-request-live.png, artifacts/remnant-scope-mobile-live.png.
- Hồ sơ thật vẫn cần người có quyền cho phép bổ sung hao hụt trước khi sửa phần dư. Không coi sửa thông báo giao diện là đã mở phạm vi hoặc khách đã lưu lựa chọn mới.


### 2026-09-29 — Thêm vật tư/cấu kiện và giữ kết quả nhập (2514063)
- Đối chiếu đúng BG-20260925-004, STT 24 - TTC-3345x2, quyền Nguyễn Khắc Phú và mã PH-H402 trong ảnh. Phiên mới trên bản sao hồ sơ thêm/lưu được; chưa thu được trạng thái lỗi của tab khách đang mở. Không quy lỗi này thành thiếu phạm vi hao hụt của BG-20260925-005.
- Sửa cửa sổ chọn vật tư giữ tham chiếu dòng cha cũ: lúc Thêm tìm lại đúng dòng trong dữ liệu hiện tại. Kiểm thử mô phỏng thay thế bản làm việc khi cửa sổ đang mở thất bại với cách cũ (0 dòng), đạt sau sửa; không còn báo thêm thành công vào đối tượng đã tách khỏi bảng.
- Thêm vật tư/cấu kiện chỉ đóng cửa sổ khi cập nhật thành công. Nếu bị chặn, giữ lựa chọn/tên đang khai, hiện lỗi ngay trong cửa sổ và giữ trạng thái chưa lưu trước thao tác; bấm lại sau xử lý không nhân đôi. Sửa kiểm tra dữ liệu gốc đối chiếu chưa tồn tại khi phiên làm việc chưa gắn báo giá, tránh lỗi đọc generation.
- Browser bom-add-submit, protected-save-payload và remnant-scope đạt; 15 ca core/API nhập liệu, khối lượng vật tư và danh mục đạt. Bản sao đúng Phú/BG004: thêm PH-H402 vào sản phẩm, tạo cấu kiện/thêm vật tư con, lưu/F5; xóa hết dòng, sửa kích thước rồi thêm lại/lưu/F5 đạt. Kiểm tra thử 31 mã vật tư đều thêm được. Browser customer-feedback-team còn dừng ở kỳ vọng nhãn cũ “chờ Admin duyệt”, trong khi giao diện hiện “Chờ người phụ trách duyệt”; không báo bộ đó đạt toàn bộ.
- Triển khai 2514063 sau sao lưu nguồn/SQLite; HTTPS health và 93 hash runtime khớp. Web thật đúng Phú/BG004 mở form, chọn PH-H402, nút hiện Thêm 1 mã vật tư và form cấu kiện đạt; không bấm thêm/lưu thử vào hồ sơ khách. Phiên tạm đã thu hồi. Ảnh: artifacts/bom-add-material-live.png, artifacts/bom-add-component-live.png. Cần khách xác nhận lại thao tác trên phiên đang gặp lỗi, chưa tự coi ảnh báo lỗi đã được tái hiện hoàn toàn.
