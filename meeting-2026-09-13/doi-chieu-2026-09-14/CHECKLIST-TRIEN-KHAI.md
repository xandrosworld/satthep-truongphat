# Checklist triển khai sau cuộc họp 13/09

**Ảnh Công thức tổng hợp sáng 15/09 — DM-02:** gom sửa/thử vào chính màn tổng hợp; bảng hiện công thức, số thay vào và kết quả. Bổ sung công cụ phép tính/hàm theo ảnh demo tham khảo, định mức kg/m và m²/m của thép hình, thử số lượng/khổ mua/mạch cắt, kết quả phôi và vật tư mua. [Hành vi, ca số và bằng chứng](../../docs/FORMULA-WORKBENCH-2026-09-15.md). Thay cách mở bảng tổng hợp chỉ đọc của v2.14; bảng danh mục bên ngoài vẫn chỉ xem. Đây là lượt riêng, không đóng phần đơn giá khách đang ghi chú.

**Ảnh tiếp theo sáng 15/09 — DM-02:** liên kết ký hiệu trong form hình dạng với Thông số cấu kiện; chọn lấy tên/đơn vị, khai thêm ngay trong form, chèn biến và cập nhật công thức khi đổi ký hiệu. Bảo toàn phiên bản cũ, kiểm tham chiếu trước khi xóa thông số. [Hành vi và kiểm chứng](../../docs/SHAPE-PARAMETERS-2026-09-15.md). Vẫn xử lý từng bảng, không gộp phần đơn giá vào lượt này.

**Cập nhật sáng 15/09 — làm từng bảng:** DM-01 bỏ hai tab Mác vật liệu/Đặc tính trên thanh chính, giữ quản lý từ từng dòng Vật liệu theo ảnh khách. [Phạm vi và kiểm chứng](../../docs/MATERIAL-TABS-2026-09-15.md). Phản hồi đơn giá nguyên công chưa kết nối, vận chuyển/lắp đặt khai tương tự, báo giá chỉ chọn phương thức là yêu cầu tiếp theo của TC-02/TC-03/TC-05/GD-01; đang chờ ghi chú cụ thể để xử lý lượt riêng. Các dấu kiểm và bằng chứng giá v2.14 bên dưới không có nghĩa đã đáp ứng phản hồi mới này. Không gom sửa giá vào lượt bảng vật liệu.

**Hiện hành v2.14 — phản hồi 22:59–23:06:** bổ sung DM-02 (bảng hình dạng chỉ xem; màn sửa đủ dữ liệu và tên thông số), TC-02/TC-03/TC-04 và GD-01/GD-02 (nhiều cách tính đơn giá để chọn tại báo giá; độ phức tạp theo công việc; kiểm tra tổng thể từng dòng). Tin 22:59 thay yêu cầu nhập trực tiếp trên bảng của đợt 21:59. [Hành vi, ca số và bằng chứng đợt này](../../docs/DECLARATION-REVIEW-2026-09-14.md). Giữ 25 mã và các mục BG-06/ERP-01/ERP-02 còn mở. Trạng thái [x] là kiểm chứng nội bộ; khách chưa nghiệm thu. Ảnh ghi chú khách hẹn gửi sau có thể bổ sung yêu cầu, không chặn năm nội dung đã nói rõ.

**Bổ sung cấu trúc DM-02 từ phản hồi 21:59 ngày 14/09:** ngay trong bảng Thông tin hình dạng phôi, một dòng gồm dạng cấu kiện | hình dạng phôi | khai báo tại mã vật tư | bổ sung báo giá | công thức dài/rộng khai triển | công thức khối lượng phôi sản phẩm | công thức diện tích phôi sản phẩm; cuối dòng mở công thức tổng hợp. Công thức phôi sản phẩm trả kết quả một chi tiết, tách với định mức vật tư mua. Đợt sửa cũng gom mác/đặc tính dưới từng vật liệu tại DM-01. [Bản sửa và kiểm chứng](../../docs/CATALOG-REVIEW-2026-09-14.md). Đây là bổ sung yêu cầu và bằng chứng triển khai, không phải nghiệm thu khách; giữ nguyên 25 mã.

Phiên bản tài liệu: 14/09/2026 — v2.14.

**Lịch sử v2.13:** đã đóng **DM-05, TC-06, BG-02, BG-03, BG-05** sau xử lý và kiểm chứng: Dày liên kết tường minh với quy cách mã; bổ sung cơ sở CP chung TMC đầy đủ và tính một lần; đối chiếu 7 ô số gốc và 4 nhánh TMC thuần/hỗn hợp theo công thức/bảng của workbook. **22/25 [x], 0 [~], 3 [ ]**. Còn **BG-06, ERP-01, ERP-02**. Local 12/12 tác vụ, 254 ca logic + 47 ca máy chủ; web thật 65/65 nhóm, 58 ảnh; ứng dụng `90f7639` khớp Netlify. [Báo cáo và giới hạn nguồn](../../docs/SCOPE-COMPLETION-2026-09-14.md). Đây là kiểm chứng nội bộ, không phải khách nghiệm thu hoặc chốt đầu vào kinh doanh của mọi đơn.

**Lịch sử v2.12:** Giữ đủ 25 mã; đã triển khai phần lựa chọn/cài đặt/so sánh theo nhóm của v2.11. Local đạt 248 ca logic + 46 ca máy chủ, 9/9 tác vụ; web thật đạt 42/42 nhóm (14 mới + 28 hồi quy), 33 ảnh. Ứng dụng c56b8a4 đã push và khớp Netlify; tệp Excel/PDF thực xuất đã đối chiếu số tiền. Các tiêu chí đạt được ghi riêng tại ca E và [báo cáo đợt nhóm](../../docs/GROUP-PRICING-2026-09-14.md). Không đóng trọn TC-06/BG-02/BG-03/BG-05 vì CĐ-01 về chuỗi/tổng XL còn mở. Tổng 17/25 [x], 5 [~], 3 [ ].

Phạm vi: luồng báo giá Trường Phát — dùng để bàn giao cho người hoặc bot tiếp tục sửa phần mềm.  
Trạng thái tài liệu: nội bộ, chưa phải biên bản nghiệm thu của khách.

> **Yêu cầu với người/bot thực hiện:** đọc phần 2, mục đang làm và các điểm còn cần đối chiếu ở phần 13 trước khi sửa mã. Không lấy giao diện đang có làm đặc tả. Giữ nguyên 25 mã đầu mục; chỉ đánh dấu hoàn thành khi đạt điều kiện phần 11. Riêng lượt rà v2 ban đầu chỉ sửa tài liệu; kết quả triển khai các lượt sau phải đọc đúng báo cáo/bằng chứng tại phần hiện hành.

Các ghi nhận “hiện trạng” và số dòng mã nguồn trong tài liệu được rà tại commit `e8c0cae6f56485f1a65dca88dbae8f0b2d8774ab`; phải kiểm lại khi mã thay đổi. Bản giải thích hiện hành là tài liệu này; các báo cáo phân tích cũ lưu để truy vết, không dùng diễn giải đã bị sửa để ghi đè v2. Ảnh/clip/phiên âm chủ yếu chỉ có trong gói nguồn nội bộ, không đi kèm clone GitHub; xem phần 12.

## Lịch sử v2.12 — so sánh theo nhóm, phạm vi TMC và ô Dày, ngày 14/09/2026

**Yêu cầu mới đã được đồng ý — v2.11:** khách yêu cầu đơn không có TMC thì không hiện so sánh TMC (16:30:04); các cách đối chiếu hiện theo lựa chọn khai báo (16:25:23). Người dùng xác nhận khách đã đồng ý tin gom phần cài đặt theo nhóm, chọn cách so sánh phù hợp với nhóm trong đơn, ngoài TMC vẫn tính chi tiết, mở rộng cửa gió/tủ điện khi cần. [Nguồn — nội dung 7–8](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt). Đây là xác nhận hướng tổ chức/hiển thị, không phải nghiệm thu phần mềm hay chốt công thức cho nhóm mới.

**Phạm vi cập nhật:** BG-03 về lựa chọn/hiển thị; TC-06 về cấu hình theo nhóm; BG-05 về tách so sánh và giá chào cuối; BG-02 về phạm vi tính/thiếu dữ liệu. Đợt nhóm đã triển khai và kiểm phần mới, có bộ kiểm riêng; giữ bốn mã `[~]` vì thiếu đối chiếu số CĐ-01, không thêm ID và không lấy bằng chứng bốn cột cũ thay cho đợt này. Hướng dẫn cũ “giữ bốn cột” không còn hiệu lực; các báo cáo đợt cũ bên dưới là lịch sử. Cửa gió/tủ điện chỉ là hướng mở rộng khi cần, không tự thêm công thức hay bảng giá.

**Mốc trước đợt TMC: 17/25 mã [x], 4 mã [~], 4 mã [ ].** DM-05 chuyển `[x] → [~]` vì có yêu cầu mới về ô **Dày** tại hàng kích thước chung, không phải kết luận phần liên kết công thức đã kiểm ở đợt 2 bị lỗi. Giữ 25 mã, không thêm mã đầu mục trùng. Phần ô nhập/lưu Dày đã triển khai tại `b4b8840`, kiểm **224 ca logic, 41 ca máy chủ**, **27 nhóm web thật/24 ảnh**, Netlify khớp build. **Chưa tự đổi mã vật tư theo T**, còn CĐ-04 nên giữ DM-05 `[~]`. [Báo cáo và giới hạn](../../docs/THICKNESS-2026-09-14.md).

**Phản hồi TMC mới — 15:46/15:49:** khách đã trả lời “Chính xác rồi em” cho đề nghị 15:33:49: TMC chỉ áp cho thang máng cáp; sản phẩm cơ khí khác trong cùng đơn dùng chi tiết. Ảnh chỉ nhóm thang máng cáp gồm thân, nắp và phụ kiện. Không hỏi lại hai nhánh đã chốt. [Nguyên văn — nội dung 6](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt). CĐ-01 chỉ còn đối chiếu chuỗi/tổng, không còn chờ câu trả lời này.

**Đợt TMC — cập nhật triển khai:** đã thêm phân loại tường minh, nhánh cơ khí giữ nguyên chi tiết, hệ số TMC riêng có căn cứ, nguồn/thuế bậc TMC, chỉ số bốn phương án và giá thị trường độc lập. Kiểm cục bộ 234 ca logic + 43 ca máy chủ; [báo cáo, đáp án và giới hạn](../../docs/TMC-2026-09-14.md). TC-06 đổi `[ ] → [~]`. Tổng **17/25 [x], 5 [~], 3 [ ]**, vẫn **8 mã chưa hoàn tất toàn bộ**. Không lấy ca số QA thay bảng đối chiếu số trung gian của workbook khách để tích xong bốn mã.

**8 mã chưa hoàn tất ở v2.12 (đã thay bằng 3 mã ở v2.13):** DM-05, BG-02, BG-03, BG-05, TC-06, BG-06, ERP-01, ERP-02. Tổng vẫn **17/25 [x], 5 [~], 3 [ ]**. Nguồn mới và xác nhận được lưu tại [nội dung 5–8](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt). DM-05 còn liên kết/chọn mã theo Dày tại CĐ-04; nhóm BG-02/03/05 và TC-06 đã có so sánh/cấu hình theo nhóm, còn đối chiếu chuỗi/tổng tại CĐ-01. Cập nhật checklist không đóng các điểm này.

## Lịch sử — đợt 6, ngày 14/09/2026

**BG-04, TC-05, TC-07, GD-01, GD-03 chuyển [~] → [x] về triển khai/kiểm chứng nội bộ. Tổng 18/25 mã [x], còn 3 mã [~] và 4 mã [ ].** Ứng dụng `f432bdc39bd045072feca297da17160d2c693af3` đã push và khớp Netlify lúc 15:12:52; local **20/20 nhóm, 216 ca logic, 39 ca máy chủ**; web thật **33/33 nhóm**, kết thúc **15:13:25**, lưu **37 ảnh web, 37 ảnh local và 6 ảnh máy chủ thử**. [Báo cáo năm mã, cách dùng, đáp án và giới hạn](../../docs/BATCH-06-2026-09-14.md).

Đã khép luồng nguồn giá/thuế từng đầu vào → công thiết bị/logistics → ba lớp giá → duyệt → PDF/Excel/CSV; có lịch sử đầy đủ giá danh mục (kể cả vật tư định mức), không kế thừa nhầm dữ liệu khi tạo đơn mới và không in badge hosting. Các khẳng định đợt 3–5 bên dưới là lịch sử, không thay trạng thái đợt 6.

**Không coi khách đã xác nhận CĐ-02/CĐ-03 hay mẫu ký.** Phần mềm yêu cầu khai rõ công việc/lớp giá/cơ sở tiền/thuế và quyền dùng mẫu theo từng báo giá; thiếu hoặc thay đổi thì chặn chính thức. Đây là cơ chế xử lý đầu vào chưa rõ, không tự đặt mặc định nghiệp vụ. **CĐ-01 vẫn thiếu quy tắc TMC/pha trộn và chưa đóng.** Netlify còn lưu trình duyệt; máy chủ kiểm localhost, chưa triển khai server sản xuất hay nghiệm thu khách.

**7 mã còn lại tại thời điểm đợt 6, trước ảnh ô Dày:** BG-02, BG-03, BG-05, TC-06, BG-06, ERP-01, ERP-02. Đếm theo 25 tiêu đề mã, không theo số ô của bộ kịch bản minh họa ở phần 10; trạng thái mới nằm ở phần hiện hành phía trên.

## Lịch sử — đợt 5, ngày 14/09/2026

**BG-03 chuyển [ ] → [~]; BG-02/BG-05/GD-01/GD-03 giữ [~]. Tổng 13/25 mã [x], 8 mã [~], 4 mã [ ].** Ứng dụng `ce92dfd` đã push và khớp Netlify. Local **19/19 nhóm, 202 ca logic, 37 ca máy chủ**; web thật **8 nhóm giá/thuế + 9 nhóm hồi quy thiết bị**, thêm kiểm vùng chỉ số lúc 14:22:11. Có **20 ảnh web và 19 ảnh local** trong manifest. [Báo cáo đợt 5, cách dùng và giới hạn](../../docs/BATCH-05-2026-09-14.md).

Đã khai thuế từng giá/kg/đối thủ, quy đổi về trước thuế, chỉ số chênh tiền/% và tập chi phí tham khảo không trùng; thiếu hoặc thay đổi căn cứ chặn bản chính thức. Bản làm việc có cảnh báo. Chi phí đầu vào tính toán vẫn cần rà/nhập số chưa thuế thủ công; chưa có metadata thuế tự động từng dòng. **CĐ-01/02/03 chưa đóng**; TMC chuẩn hóa/nhánh pha trộn, giá thị trường riêng, mẫu ký và AI còn mở. Netlify lưu trình duyệt; máy chủ kiểm localhost, không phải nghiệm thu khách.

## Lịch sử — đợt 4, ngày 14/09/2026

**TC-07 chuyển [ ] → [~]; TC-05, BG-04, GD-01, BG-02 giữ [~]. Tổng vẫn 13/25 mã [x].** Ứng dụng `10bc393` đã push và khớp Netlify; **18/18 nhóm local (192 ca logic, 36 ca máy chủ)**, **9/9 nhóm mới + 5/5 hồi quy web**, kết thúc 13:56:34 ngày 14/09. Có **21 ảnh web**, 21 ảnh local và 6 ảnh máy chủ thử trong manifest. [Báo cáo đợt 4 và giới hạn từng mã](../../docs/BATCH-04-2026-09-14.md).

Đã có công thiết bị theo % hoặc đơn giá, giá theo đúng hãng, chọn rõ lớp giá, dẫn nguồn đã gồm, cảnh báo nguồn/phạm vi thay đổi và mất cấu hình khi nhân bản. Không cộng khoản mới vào giá bán kg/TMC/đối thủ. Các nguồn chỉ liên kết theo phạm vi được người khai xác nhận, không tự nhận biết hai tên khác nhau là cùng công việc. **CĐ-01/02/03 và AI còn mở**, không phải nghiệm thu khách hay hoàn thành toàn GĐ1. Netlify vẫn lưu trình duyệt; server được kiểm tại localhost. Các trạng thái đợt trước bên dưới là lịch sử.

## Lịch sử — đợt 3, ngày 14/09/2026

**GD-02, GD-04 đổi sang [x]; TC-05, BG-04, GD-01 giữ [~].** Ứng dụng `59fc6e0` đã push và khớp Netlify. **17/17 nhóm local (177 ca logic, 33 ca máy chủ), 5/5 nhóm mới + 9/9 nhóm hồi quy trên web**, kết thúc 13:32:31 ngày 14/09/2026. Có 19 ảnh web thật, 9 ảnh local và 6 ảnh máy chủ thử. [Báo cáo đợt 3, bằng chứng và giới hạn từng mã](../../docs/BATCH-03-2026-09-14.md).

Tổng hiện **13/25 mã [x]**, không phải khách nghiệm thu. Giữ TC-05/BG-04 mở cho phần công việc thiết bị/CĐ-02; GD-01 còn thuế/CĐ-03, đổi hãng/liên kết lắp đặt và lịch sử giá danh mục đầy đủ. Không tự đóng CĐ-01/02/03. Phân quyền/đa người được kiểm trên máy chủ localhost; Netlify vẫn là chế độ trình duyệt. Các số 11/25 phía dưới là lịch sử đợt 2, không thay trạng thái này.

## Lịch sử — hoàn thành đợt 2, ngày 14/09/2026

**DM-05, TC-01, TC-02, TC-03, TC-04** đã đạt triển khai/kiểm chứng nội bộ theo phần 11, đổi sang `[x]` sau kiểm đúng bản Netlify. Mã ứng dụng `3fc452dc00e2346851551511c8e235c3eaab0fe3`: **15/15 nhóm local, 168 ca logic, 28 ca máy chủ**; web thật **9/9 nhóm đợt 2 + 7/7 nhóm hồi quy**, **22 ảnh**, kết thúc **12:25:02 ngày 14/09/2026** (giờ Việt Nam). [Báo cáo từng mã, cách dùng, giới hạn và đường dẫn bằng chứng](../../docs/BATCH-02-2026-09-14.md).

Tổng **11/25 mã `[x]`**. Yêu cầu/tiêu chí bên dưới giữ nguyên; “hiện trạng đã thấy” là mốc trước sửa. Netlify lưu trình duyệt; máy chủ và khóa bản duyệt được kiểm riêng tại localhost. Không phải nghiệm thu của khách hay hoàn thành toàn bộ GĐ1. AI và các mục giá chưa đánh dấu vẫn còn; CĐ-01/02/03 chưa được đóng. Bản nháp thiếu căn cứ diện tích hoàn thiện phải khai công thức/lượng thực hoặc xác nhận dùng lượng cấu thành trong chi tiết công việc, không gán ngầm từ tổng bề mặt con.

## Lịch sử triển khai đợt 1 — 14/09/2026

**Trạng thái hiện hành:** BG-01, DM-01/02/03/04 và UX-01 đã hoàn thành triển khai/kiểm chứng nội bộ, đánh dấu `[x]` theo phần 11. Ứng dụng `6a74c13` đã push và lên Netlify; 14 nhóm kiểm local (152 ca logic, 26 ca máy chủ), 15 nhóm tình huống web thật, 20 ảnh; kiểm web kết thúc 11:41:58 ngày 14/09/2026. [Báo cáo sáu mục và bằng chứng từng mã](../../docs/BATCH-01-COMPLETE-2026-09-14.md). Máy chủ được kiểm đúng môi trường máy chủ thử cục bộ; Netlify vẫn lưu trình duyệt. Không phải hoàn thành toàn bộ GĐ1 hay khách đã nghiệm thu. Các đoạn `3cf0b3c` phía dưới là lịch sử đợt đầu.

[Báo cáo đợt 1](../../docs/BATCH-01-2026-09-14.md) ghi phần đã sửa, phần còn lại, mã kiểm thử và vị trí ảnh thực tế. “Hiện trạng đã thấy” bên dưới vẫn là mốc trước sửa; không dùng nó để kết luận mã mới chưa có chức năng.

**Ghi nhận lịch sử đợt đầu:** Mã ứng dụng `3cf0b3c` đã push `main`; kiểm bản Netlify lúc **11:00 ngày 14/09/2026** đạt **7/7 nhóm tình huống**, có **12 ảnh thực tế**. Bộ kiểm cục bộ đạt **11/11 nhóm** (141 ca logic, 23 ca máy chủ và các nhóm giao diện). Mã web khớp build đã kiểm, ngoài thẻ thanh công cụ do Netlify nối cuối. Đây là kết quả phạm vi đợt 1, không phải nghiệm thu khách hoặc hoàn thành nguyên cả sáu mã; xem giới hạn từng mã trong báo cáo.

Tại mốc `3cf0b3c`, đợt đầu xử lý hồ sơ tạo báo giá, vật tư/thương hiệu, dữ liệu tra kg/m–m²/m, khổ/phần dư theo mã, cây chung năm bước và bốn nhóm dòng. Khi đó chưa hoàn thành cả DM-02/03/04: còn bộ cấu hình hình dạng tổng quát, khổ mua dùng chung theo máy/xưởng và dòng vật tư nháp chưa mã. Chưa làm DM-05/AI/các công thức giá bổ sung; giữ nguyên yêu cầu và CĐ. Lượt hoàn thiện `6a74c13` đã bổ sung các phần này và chạy lại bộ kiểm trước khi đổi sáu mục sang `[x]`; không dùng riêng test đợt đầu để kết luận.

## 1. Kết quả cần đạt

Người lập báo giá chỉ nhập dữ liệu một lần, sau đó cùng một hồ sơ đi xuyên suốt:

```text
Tạo báo giá
  → Khách hàng + công trình + tiến độ + tài liệu đầu vào
  → Bóc tách sản phẩm / cấu kiện / mã vật tư
  → Khai triển + hao hụt + khối lượng + diện tích
  → Công đoạn + hoàn thiện + thuê ngoài + vận chuyển + lắp đặt
  → Tính phương án chi tiết
  → Chọn các cách đối chiếu phù hợp với nhóm hàng trong đơn
  → So sánh các cách đã chọn trên cùng phạm vi và mặt bằng giá (không có TMC thì không hiện TMC)
  → Chọn 1 phương án cho toàn báo giá
  → Duyệt và xuất bản chào khách
  → Chuyển dữ liệu đã chốt sang sản xuất để đối chiếu thực tế
```

## 2. Quy tắc, căn cứ và giới hạn diễn giải

Nhãn nguồn dùng xuyên tài liệu:

- `KH`: tin nhắn/chú thích ảnh khách do người dùng cung cấp; phần nguyên văn khác với diễn giải bên dưới. Nếu người dùng thuật lại việc khách đồng ý (nội dung 8), ghi đúng nguồn thuật lại, không dựng nguyên văn hay mốc giờ trả lời.
- `PA`: phiên âm AI của cuộc họp; chưa nghe xác minh toàn bộ. `PA1/PA2` là file P1/P2, không phải mức ưu tiên P1/P2 của công việc. Số dòng là vị trí trong bản chép, không phải mốc video đã xác minh.
- `XL`: hành vi công thức Excel mẫu đã đọc trực tiếp; không mặc nhiên là công thức cuối cùng sau tin nhắn mới.
- `ĐX`: cách triển khai/kiểm soát do bên làm đề xuất. Là mục tiêu kỹ thuật trong checklist, không phải trích lời khách đã duyệt mọi chi tiết.
- `CĐ`: còn cần đối chiếu trường hợp cụ thể; xem phần 13. Không tự biến thành mặc định nghiệp vụ.

Các tiêu chí kiểm thử và số giả lập trong tài liệu là `ĐX`, trừ khi ghi nguồn khác. Bảng ở phần 12 chỉ rõ nguồn nghiệp vụ cho từng mã.

| Mã | Căn cứ | Nội dung và cách áp dụng |
| --- | --- | --- |
| D01 | KH + PA; định danh cây là ĐX | Mã vật tư là gốc của dòng vật tư. Sản phẩm/cấu kiện có định danh riêng; cho tạo dòng nháp chưa chọn mã. Dòng vật tư dùng dữ liệu vật liệu/mác/đặc tính của mã đã chọn, không ép mọi loại dòng phải có mã vật tư. |
| D02 | KH; lưu điều chỉnh là ĐX | Chọn **một phương án giá chung cho toàn báo giá**. Không chọn A theo kg, B theo đối thủ. Một phương án có thể có nhánh công thức theo loại sản phẩm nếu đã được định nghĩa; xem TMC tại TC-06/CĐ-01. Giá chốt điều chỉnh phải lưu căn cứ, không thay lựa chọn phương án riêng từng dòng. |
| D03 | KH + XL | Phương án tính toán dùng ba lớp giá ở BG-04. TMC cũng có công thức nội bộ riêng; không suy thành chỉ phương án tính toán mới được cấu thành từ chi phí. |
| D04 | KH | Giá theo kg, TMC, đối thủ **đã gồm toàn bộ chi phí**. Không cộng/nhân lại chi phí hoặc hệ số của phương án tính toán lên kết quả đầy đủ đó. TMC phải có đủ công thức hình thành kết quả, không lấy riêng bảng nhân công làm giá bán. |
| D05 | KH; phân loại dữ liệu là ĐX | Chi phí chuyển từ phương án tính toán **chỉ để đối chiếu** không làm đổi tổng ba phương án. Phân biệt với đầu vào thực sự được công thức TMC sử dụng: đổi đầu vào TMC thì TMC phải tính lại. |
| D06 | KH + ĐX | Khách nhắc phải có AI; câu “Chắc em chờ ổn định cấu trúc rồi mới bổ sung à” là câu hỏi, không phải lịch đã chốt. Nối AI sau khi mô hình đầu vào ổn định là kế hoạch kỹ thuật đề xuất; không tự hoãn AI ra ngoài giai đoạn báo giá. |
| D07 | KH; lưu nháp là ĐX | Ngay khi tạo báo giá phải có nơi nhập khách hàng, dự án/công trình, tiến độ/yêu cầu và tài liệu. Không bắt tạo hồ sơ rỗng rồi nhập lại nhiều nơi; không đồng nghĩa mọi ô/tệp đều bắt buộc để lưu nháp. |
| D08 | KH; snapshot là ĐX | Các hệ số thay đổi được, số mẫu chỉ minh họa. Lưu bản dữ liệu theo phiên bản báo giá; không hard-code số mẫu. |
| D09 | KH + PA | Công đoạn có thể ở vật tư/cấu kiện/sản phẩm. Lượng và yếu tố lấy đúng đối tượng/công việc. Thuê đã gồm vật tư không xóa cấu thành; công việc khác phạm vi vẫn được tính. |
| D10 | CĐ-03; xử lý là ĐX | Chưa xác nhận giá nhập đã/chưa gồm thuế. Phải ghi điều kiện thuế và quy đổi cùng mặt bằng; không tự mặc định cộng thêm hay coi đã gồm. Chưa rõ thì chưa phát hành báo giá chính thức. |
| D11 | KH; kiểm công thức là ĐX | Liên kết kích thước bằng công thức; ví dụ `L vật tư A = W sản phẩm - 20`. Cho tham chiếu rõ chính dòng và cấp cha/tổ tiên trong cây, không chỉ sao chép số. Không suy thành bắt buộc mọi kiểu phụ thuộc cha/con tùy ý. |
| D12 | KH; dấu hiệu bổ sung là ĐX | Tăng tương phản bốn loại dòng: sản phẩm, cấu kiện, vật tư trong cấu kiện, vật tư trực tiếp trong sản phẩm. Kèm nhãn/thụt cấp để không chỉ dựa vào màu. |
| D13 | KH + CĐ-02 | Thiết bị/linh kiện có lắp đặt riêng theo % giá trị hoặc đơn giá cụ thể. Chống cộng trùng **cùng công việc**; không tự loại mọi công việc lắp ráp/lắp đặt khác. Cơ sở tiền, số lượng và lớp giá phải rõ; 20–30% không phải tỷ lệ mặc định. |
| D14 | KH ảnh mới nội dung 5; triển khai là ĐX, liên kết là CĐ-04 | Bổ sung ô Dày sau L/W/H ở kích thước chung sản phẩm. Ảnh chỉ ghi “dày”, không chốt mặc định, phạm vi truyền xuống vật tư hay tự đổi mã/giá. Không ghi đè thông số cố định của mã vật tư bằng giá trị chung khi chưa có quy tắc rõ. |
| D15 | KH nội dung 7 lúc 16:25/16:30; nội dung 8 do người dùng xác nhận khách đồng ý | So sánh theo các cách đã chọn khai báo và phù hợp với nhóm hàng trong đơn, không bắt hiện bốn cột. Không có TMC thì không hiện so sánh TMC. Đơn hỗn hợp: phần TMC dùng TMC, phần cơ khí khác dùng chi tiết. D02 về giá chào chung vẫn giữ; chọn cách so sánh không phải tự đổi giá cuối. |
| D16 | KH nội dung 7–8; chi tiết thực hiện là ĐX | Gom cài đặt/tham số theo nhóm sản phẩm để dùng cách tính phù hợp và mở rộng khi cần. Khách đã đồng ý hướng này theo người dùng xác nhận; không còn là hướng đang chờ đồng ý. Cửa gió/tủ điện là ví dụ mở rộng có điều kiện, chưa có công thức/số giá được chốt và không mặc nhiên phải triển khai ngay. Không dùng công thức TMC cho mọi nhóm. |

Nguồn KH mới nhất: [phản hồi bổ sung sau họp](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt). Giữ nguyên lời khách khi sửa phần diễn giải. Không coi mọi quy tắc trong bảng là “khách đã chốt”.

## 3. Ký hiệu trạng thái

- `[ ]` Chưa hoàn thành hoặc chưa kiểm tra lại sau yêu cầu mới.
- `[~]` Đã có một phần trong bản hiện tại nhưng cần sửa/kiểm thử lại.
- `[x]` Chỉ dùng sau khi đủ điều kiện phần 11, gồm kiểm đúng bản đã deploy theo quy trình mới. Khách nghiệm thu là trạng thái riêng.
- `P0`: sai là có thể ra giá sai hoặc làm lệch luồng chính.
- `P1`: bắt buộc để hoàn chỉnh nghiệp vụ báo giá.
- `P2`: nối vận hành/ERP; không được tự nhận đã xong trong demo.

## 4. P0 — sửa ngay trước lần gửi khách tiếp theo

### [x] BG-01 — Gộp đầu vào vào bước “Tạo báo giá mới”

**Hiện trạng đã thấy:** bản hiện tại có trang khách hàng và phần yêu cầu/tệp ở bước riêng; form tạo báo giá máy chủ chỉ có mã, khách hàng và công trình.  
**Phải sửa:** trong một luồng tạo báo giá phải có:

- mã báo giá, ngày tạo;
- chọn khách hàng đã có hoặc thêm nhanh khách mới;
- người liên hệ và thông tin nhận báo giá;
- tên dự án/công trình, địa điểm nếu có;
- hạn phải hoàn thành báo giá;
- tiến độ/yêu cầu thực hiện của đơn;
- mô tả/yêu cầu kỹ thuật;
- đính kèm ảnh, PDF, Excel/CSV ngay tại đây.

Cho phép “Lưu nháp” khi thiếu dữ liệu chưa bắt buộc; nhưng trước tính/chọn giá phải báo rõ dữ liệu tính nào còn thiếu, không chặn vì thiếu ô không liên quan. Sau khi tạo, dữ liệu của **cùng bản nháp** dùng chung giữa các bước, không nhập lại. Danh bạ dùng lại và snapshot khách hàng/yêu cầu của bản đã duyệt phải tách: sửa danh bạ hoặc bản nháp mới không đổi bản đã duyệt.

**Kiểm tra đạt:** tạo một báo giá mới từ đầu, chọn khách, nhập dự án/hạn chào/yêu cầu, đính kèm một PDF; mở lại báo giá vẫn thấy đủ dữ liệu và tải đúng tệp gốc. Không phải nhập lại ở bước bóc tách.

**Đối chiếu:** PA1 dòng 200–206; [ảnh demo tại 00:46:00](frames/video_00-46-00.png); mã tại commit nền `team-access-ui.js:11`, `intake-ui.js:11`.

![Màn hình hồ sơ yêu cầu đang nằm sau bước tạo báo giá](checklist-images/06-ho-so-yeu-cau.png)

### [x] BG-02 — Sửa/khóa đúng bản chất ba phương án giá trọn gói

**Hoàn tất v2.13:** CĐ-01 đã có bảng đối chiếu nguồn và kiểm 4 nhánh, gồm đơn hỗn hợp. Giá TMC đầy đủ có chuỗi riêng, không cộng các khoản chỉ đối chiếu; nguồn thiếu/đổi vẫn chặn. [Bằng chứng](../../docs/SCOPE-COMPLETION-2026-09-14.md).

**Lịch sử v2.12 — phần phạm vi/hiển thị đã kiểm; CĐ-01 khi đó còn mở:** áp dụng D15/BG-03, không buộc mọi đơn có đủ cả ba cách trọn gói. Đơn đã phân loại không có TMC thì TMC không áp dụng, không hiện cột và không bắt nhập giá/tham số TMC để phát hành theo cách hợp lệ khác. Cách đã chọn, thuộc phạm vi nhưng thiếu đầu vào vẫn phải báo thiếu, không trả 0 hoặc âm thầm tính sang nhánh khác. Đợt TMC đã có nhánh cơ khí/chuỗi riêng/nguồn thuế ([báo cáo](../../docs/TMC-2026-09-14.md)); vẫn cần đối chiếu số XL, các ghi nhận đợt 4–5 dưới đây là lịch sử.

**Đợt 5:** giá/kg và đối thủ khai riêng đã/chưa gồm thuế và thuế suất nguồn; quy đổi trước tính thuế đầu ra, giữ giá nhập. Chưa đủ/stale căn cứ chặn bản chính thức. TMC chưa đối chiếu đủ CĐ-01 nên cột chuẩn hóa/chỉ số TMC là N/A và chưa được phát hành chính thức; không tự sửa chuỗi TMC thành đã chốt.

**Đợt 4:** kiểm riêng khoản công thiết bị mới của phương án tính toán không làm đổi giá bán kg/TMC/đối thủ. Không thay đầu vào thực sự của TMC, chưa hoàn tất chuỗi/nhánh TMC hoặc thuế.

**Phải sửa phép tính:**

- Chi tiết: tính từ các khoản chi phí và hệ số theo BG-04.
- Kg: `khối lượng phôi sản phẩm × đơn giá/kg`; kết quả này là giá đầy đủ của phương án.
- TMC: kết quả đầy đủ từ công thức riêng theo yêu cầu TC-06 cho phần TMC; phần cơ khí khác trong cùng đơn dùng chi tiết, đã chốt 15:46:38. CĐ-01 chỉ còn đối chiếu chuỗi/số trung gian/tổng, không hỏi lại nhánh ngoài TMC.
- Đối thủ: `số lượng × giá đối thủ từng sản phẩm`; kết quả này là giá đầy đủ của phương án.
- Không lấy các chi phí **chỉ dùng đối chiếu** rồi cộng/nhân tiếp lên kết quả đầy đủ của kg, TMC hoặc đối thủ.
- TMC có thể dùng vật tư, hoàn thiện và các khoản khác làm đầu vào thực sự của công thức riêng. Không loại chúng chỉ vì ba phương án là giá trọn gói; cũng không tự sao chép toàn bộ chuỗi hệ số của phương án tính toán.
- Nếu thiếu giá đầu vào, trạng thái là **Chưa đủ dữ liệu**, không biến thành 0 đồng.
- Kg tính từ tổng kg phôi hoặc kg phôi/đơn vị × số lượng, không nhân số lượng hai lần. Điều kiện thuế theo D10/CĐ-03.

**Kiểm tra đạt:** giữ nguyên đầu vào riêng của ba phương án, chỉ đổi khoản chi tiết được đánh dấu tham chiếu thì ba tổng không đổi. Sau đó đổi giá/bậc/hao hụt thuộc đầu vào thực sự của TMC thì TMC tính lại đúng công thức đã đối chiếu. Hai phép thử phải tách biệt để không khóa nhầm TMC thành giá bất biến. Thiếu công thức/nhánh áp dụng chưa được xác nhận thì chưa đạt TC-06, không tự điền công thức để cho test xanh.

**Hiện trạng cần chú ý:** `pricing-core.js:137–145` đã thay giá chào của kg/đối thủ bằng giá nhập trọn gói và chỉ giữ chi phí chi tiết làm mốc so sánh; hướng này phù hợp nhưng phải có test chống cộng trùng. Riêng TMC ở `pricing-core.js:122–124` vẫn đi qua `makeCost(...)` và các lớp hệ số của phương án tính toán, nên phải rà/sửa để kết quả TMC là giá đầy đủ theo chính phương án TMC. Dòng mô tả “Kg / đối thủ dùng gốc chi tiết” ở `pricing-ui.js` phải viết rõ đó chỉ là **gốc tham chiếu để đối chiếu**, không phải khoản cộng vào giá chào.

**Đối chiếu hình:** [bảng giá đầu vào 01:18:00](frames/video_01-18-00.png), [TMC/giá kg/đối thủ 01:20:00](frames/video_01-20-00.png), [ảnh bản hiện tại](../../artifacts/customer-review/implemented-2026-09-13/07-so-sanh-4-phuong-an.png).

![Bảng giá đầu vào dùng làm cơ sở lựa chọn](checklist-images/11-don-gia-dau-vao.png)

![Khu vực giá kg, đối thủ và TMC trong demo](checklist-images/12-bon-phuong-an.png)

### [x] BG-03 — So sánh theo nhóm hàng và cách đã chọn, không cộng trùng chi phí

**Hoàn tất v2.13:** bổ sung đối chiếu số CĐ-01 và hồi quy bảng so sánh động/chỉ số/nguồn thuế/XLSX. Bật/tắt so sánh không đổi công thức hay giá cuối; phần ngoài TMC giữ đúng chi tiết. [Bằng chứng](../../docs/SCOPE-COMPLETION-2026-09-14.md).

**Lịch sử/căn cứ mới v2.11:** D15–D16, nguồn KH nội dung 7–8. Khách đã đồng ý cách tổ chức qua tin người dùng gửi; phần mới đã triển khai và kiểm trong đợt nhóm v2.12. Đợt TMC trước đã có chỉ số TMC/giá thị trường, nhưng bảng bốn cột cố định không chứng minh đạt yêu cầu này; còn đối chiếu số tại CĐ-01. Ghi nhận đợt 5 dưới đây là lịch sử.

**Phải sửa lựa chọn/hiển thị:**

- Không cố định bốn cột. Các cách tính đang có là lựa chọn có thể dùng; chỉ đưa vào phân tích những cách được chọn khai báo và phù hợp với nhóm hàng trong đơn.
- Đơn đã phân loại không có TMC: không hiện cột so sánh TMC. Đơn có TMC: cho chọn cách TMC để đối chiếu. Cơ sở chi tiết vẫn được dùng để tính chênh theo các tiêu chí bên dưới; không vì ẩn cột mà đổi công thức cơ sở.
- Đơn hỗn hợp: cột TMC so tổng toàn đơn = phần TMC tính theo TMC + phần cơ khí khác tính chi tiết. Ghi rõ phạm vi hai phần; không lấy giá riêng TMC đối chiếu với giá toàn đơn.
- Kiểm soát ĐX: tách ba trạng thái “Không áp dụng”, “Chưa chọn so sánh”, “Chưa đủ dữ liệu”. Nhóm chưa xác định không tự coi là ngoài TMC. Cách đã chọn và thuộc phạm vi mà thiếu giá/tham số/điều kiện thuế phải hiện lý do chưa so được, không tự biến thành cột giá 0 hoặc ẩn để che thiếu dữ liệu.
- Kiểm soát ĐX: lưu lựa chọn so sánh theo báo giá, không áp cấu hình của đơn A sang đơn B. Mở lại hoặc chuyển bước giữ đúng lựa chọn. Ẩn/hiện cách so sánh chỉ đổi cách trình bày, không tự đổi giá chào, đầu vào hay tập khoản dùng tính chỉ số. Quy tắc chọn giá cuối xem BG-05.

**Đợt 5 — mới [~]:** đã có nguồn giá/tình trạng thuế, đơn giá trước thuế/kg phôi, chênh tiền/% so tính toán và đối thủ, mẫu số 0 → N/A. Tập tham khảo cố định không trùng tương đương giá gốc chi tiết + xử lý; phần còn lại không gọi lợi nhuận ròng. Có sheet nội bộ và ảnh web chỉ số. Còn chỉ số TMC/CĐ-01, giá thị trường riêng và nếu cần cấu hình tập tham khảo; chưa đóng trọn mã.

Mỗi cột phương án được đưa vào so sánh phải có tối thiểu (chỉ số thiếu dữ liệu được ghi rõ, không suy số):

- giá nhập và điều kiện thuế; tổng quy đổi trước thuế để so sánh khi đã đủ điều kiện thuế, nếu chưa rõ thì đánh dấu chưa so được cùng mặt bằng;
- giá quy đổi/kg phôi;
- chênh lệch tiền và tỷ lệ so với phương án chi tiết;
- giá đối thủ và chênh lệch thị trường;
- các khoản vật tư, nguyên công, vận chuyển, lắp đặt, quản lý... lấy từ phương án chi tiết dưới nhãn **tham số đối chiếu**;
- phần chênh còn lại = giá phương án trên cùng mặt bằng thuế − tổng một tập khoản tham chiếu **được định nghĩa, không trùng nhau**, không gọi mặc định là “lãi ròng”.

Excel mẫu `BC Chao gia!AD22 = AD14-SUM(AD15:AD21)` dùng tập khoản cố định: vật tư, sản xuất, vận chuyển nội bộ, giao hàng, lắp đặt, quản lý, xử lý. Đây là căn cứ XL để đối chiếu, không tự cộng cả tổng chi phí sản xuất đã gồm quản lý với quản lý thêm lần nữa. Nếu cho đổi tập khoản tính chỉ số, đó là cấu hình công thức có lưu lại, không phải nút chọn/ẩn cột. Ghi mẫu số của tỷ lệ; kg phôi hoặc giá so sánh bằng 0 thì ghi không áp dụng, không ra Infinity/NaN.

Tách điều khiển chọn các cách đối chiếu khỏi lựa chọn một phương án giá cuối cho toàn báo giá (BG-05). Mọi điều chỉnh giá cuối phải lưu lý do, người sửa và phiên bản; không tự chọn phương án rẻ nhất khi bật/tắt cột.

**Kiểm tra đạt:** tổng giá và phần chênh còn lại không đổi khi chỉ ẩn/hiện cơ cấu; không trừ hai lần khoản cha/con; chọn phương án không sửa ngược đầu vào cột khác. Giá có/không gồm thuế được đưa về cùng mặt bằng sau khi khai đủ điều kiện.

**Kiểm thêm v2.12 (đã chạy bằng dữ liệu QA, xem ca E/báo cáo):** đơn chỉ cơ khí không hiện TMC; đơn TMC có/bỏ chọn cách TMC; đơn hỗn hợp so cùng tổng lượng/phạm vi; thiếu nhóm/giá báo đúng lý do; thay nhóm/thêm hoặc bỏ TMC cập nhật điều kiện hiển thị, không tự đổi giá chốt. Lưu/mở lại và bảng phân tích xuất nội bộ phản ánh lựa chọn. Kiểm bật/tắt cột không làm đổi các đáp án số của BG-02/TC-06 hay bản đã duyệt.

### [x] BG-04 — Giữ đúng ba lớp giá của phương án tính toán

**Đợt 6 — hiện hành:** Đã kiểm trọn ba lớp với giá đầu vào được quy đổi có nguồn: cùng công thiết bị 4 triệu, vào sản xuất hoặc giá gốc theo công việc được khai/xác nhận; không mặc định lớp. Ca thử xưởng cho 38.418.019 đồng, công trình 36.897.379 đồng, khớp đáp án độc lập và bản xuất. CĐ-02 được xử lý bằng khai tường minh và chặn khi thiếu, không coi ca thật đã được khách chốt. Đã kiểm bản Netlify `f432bdc`; [bằng chứng và giới hạn](../../docs/BATCH-06-2026-09-14.md). Các ghi nhận đợt trước bên dưới là lịch sử.

**Đợt 4:** công thiết bị vào đúng lớp do người khai xác nhận; thiếu lớp thì báo lỗi, không tự áp hệ số SX. Đã kiểm cả lớp sản xuất và lớp giá gốc. Không tự đóng CĐ-02.

**Đợt 3:** đã kiểm công thức ba lớp và yếu tố SX bổ sung có căn cứ; yếu tố mới không tự nhân sang TMC/kg/đối thủ. Phần công việc thiết bị mới chưa rõ lớp vẫn giữ CĐ-02, chưa đánh dấu trọn mã.

```text
Giá sản xuất =
  (tiền vật tư
   + vận chuyển nhập vật tư/thuê ngoài
   + tiền nguyên công
   + tiền hoàn thiện bề mặt)
  × (1 + HS sản xuất)
  × (1 + HS quản lý)
  × (1 + HS khác nếu có)

Giá gốc = Giá sản xuất + vận chuyển giao hàng + lắp đặt

Giá bán = Giá gốc
  × (1 + HS lợi nhuận)
  × (1 + HS xử lý)
  × (1 + HS đơn hàng)
  × (1 + HS khách hàng)
  × ... yếu tố thêm nếu có
```

**Kiểm tra đạt:** test độc lập từng lớp; khoản giao hàng/lắp đặt thuộc lớp giá gốc không bị nhân hệ số sản xuất; các hệ số bán nhân nối tiếp, không cộng gộp; `20%` được lưu/hiểu là `0,20` trong phép `(1 + hs)`. Vật tư hoàn thiện chỉ hạch toán một lần dù xuất hiện ở bảng nhu cầu vật tư và bảng hoàn thiện. Khoản lắp đặt thiết bị mới chưa rõ công việc/lớp giá xử lý theo CĐ-02, không suy từ cấp dòng vật tư.

**Nguồn:** [công thức khách gửi](../../docs/nguon/2026-09-12-cong-thuc-gia-khach-bo-sung.txt).

### [x] BG-05 — Chọn một phương án chung cho toàn báo giá

**Hoàn tất v2.13:** các ca TMC thuần/hỗn hợp đã khớp bảng số độc lập theo nguồn, UI và file thực xuất; một lựa chọn áp toàn đơn, ngoài TMC theo chi tiết. CĐ-01 đóng cho các nhánh đang yêu cầu; bản duyệt/giá riêng và việc ẩn so sánh đã kiểm hồi quy. [Bằng chứng](../../docs/SCOPE-COMPLETION-2026-09-14.md).

**Lịch sử v2.12 — đã kiểm tách lựa chọn và chặn phương án hết áp dụng:** nguồn mới chốt cách lựa chọn đối chiếu/hiển thị theo nhóm, không hủy quy tắc một phương án giá chào chung. Cách TMC trong đơn hỗn hợp vẫn có nhánh chi tiết cho phần ngoài TMC đã được khách xác nhận. Lựa chọn/điều kiện áp dụng đã kiểm mới; còn bảng đối chiếu số CĐ-01. Đợt 5 bên dưới là lịch sử.

**Đợt 5:** lựa chọn chung tiếp tục đi cùng đường quy đổi giá/thuế, giá chốt và đầu ra. Chọn phương án không làm đổi giá nguồn; giá chốt riêng vẫn cần lý do. Giữ mở nhánh TMC/pha trộn CĐ-01.

Hiện các cách so sánh theo BG-03, không bắt giữ bốn cột; chỉ có một lựa chọn **giá chào cuối** cấp báo giá, tách khỏi lựa chọn các cách đối chiếu. Không đặt nút chọn phương án giá cuối trên từng sản phẩm. Cho xem đơn giá từng sản phẩm do phương án đã chọn sinh ra; nếu sửa giá cuối từng sản phẩm thì phải có lý do và tổng vẫn ghi phương án gốc.

Kiểm soát ĐX: bật/tắt cách so sánh không tự đổi phương án/giá chào đang chọn. Khi sửa bản nháp khiến phương án đang chọn không còn áp dụng (ví dụ bỏ hết TMC trong khi giá chào đang chọn TMC), báo rõ cần chọn lại phương án hợp lệ trước phát hành, không tự đổi sang chi tiết hay ra giá 0. Không sửa ngược snapshot bản đã duyệt.

**Kiểm tra đạt:** một phương án cấp báo giá chi phối toàn bộ các dòng, không cho A tự chọn kg và B tự chọn đối thủ. Với TMC, chạy đơn TMC thuần và đơn hỗn hợp theo nhánh đã chốt tại TC-06; đối chiếu chuỗi/tổng tại CĐ-01. Đơn không có TMC không hiện/chọn TMC làm phương án áp dụng. Kiểm bật/tắt cách so sánh và trường hợp phương án giá cuối mất điều kiện mà không đổi giá âm thầm. Ca một sản phẩm có cấu thành pha trộn chỉ bắt buộc nếu thực tế có và đã xác định cách phân loại. Chọn chung không có nghĩa ép mọi sản phẩm dùng bảng nhân công TMC.

### [ ] BG-06 — AI bóc tách tạo bản nháp có kiểm soát

**Kế hoạch kỹ thuật đề xuất (ĐX):** ổn định nơi lưu hồ sơ và mô hình cấu thành để nối AI; có thể chuẩn bị bộ mẫu/giao tiếp AI ngay trong lúc làm nền dữ liệu. Khách đã nhắc tính năng AI, nhưng chưa chốt lịch hoãn; không tự đưa AI ra ngoài giai đoạn báo giá.

**Luồng triển khai có kiểm soát (ĐX):**

1. Người dùng đính kèm ảnh/PDF; Excel/CSV có cấu trúc thì ưu tiên nhập bảng trực tiếp.
2. Hệ thống lưu tệp gốc bất biến và tạo một “lần bóc tách”.
3. AI đề xuất sản phẩm, thông số, số lượng, đơn vị và ghi chú; mỗi giá trị giữ được nguồn tệp/trang/vùng và mức chắc chắn nếu nhà cung cấp hỗ trợ.
4. Dòng không chắc hoặc thiếu số liệu phải được đánh dấu; không tự điền số đo, mã vật tư hay công thức.
5. Người dùng duyệt/sửa trước khi đưa vào cấu thành và tính giá.
6. Lưu lịch sử dữ liệu AI đề xuất và dữ liệu người dùng đã duyệt.

AI không tự duyệt giá, không tự chọn phương án và không ghi đè dòng đã xác nhận. Phạm vi đã có căn cứ là ảnh/PDF cho cấu kiện đơn giản; không tự tuyên bố đọc chính xác mọi CAD/3D.

**Kiểm tra đạt:** PDF rõ sinh bản nháp có nguồn; ảnh mờ/thiếu số lượng/đơn vị không rõ phải cảnh báo để người dùng duyệt. Kiểm bảng nhiều trang, dòng trùng và dịch vụ lỗi: không nhập lặp, không tạo dữ liệu giả khi lỗi, không ghi đè dòng đã duyệt khi chạy lại. Đối chiếu trên bộ mẫu có đáp án, ghi lỗi thực tế; không lấy hai ca đơn giản làm bằng chứng AI chính xác 100%.

## 5. P1 — danh mục và đầu vào dùng lại

### [x] DM-01 — Danh mục vật tư theo nhóm, trường nhập phụ thuộc loại

- Nhóm mở rộng được: phôi gia công; linh kiện/thiết bị; vật tư tiêu hao; xăng dầu; vật tư phụ.
- Có chức năng tự sinh mã khi thêm vật tư (PA1 dòng 23–26); không chỉ cho nhập tay rồi coi đã đạt. Mã phải không trùng. Tên được gợi ý từ vật liệu + hình dạng + mác + đặc tính + quy cách nhưng người dùng được sửa.
- Vật liệu, mác, đặc tính là các lựa chọn liên kết; mác và đặc tính là hai nhánh song song thuộc vật liệu.
- Phôi mới có trường hình dạng/kích thước kỹ thuật phù hợp. Linh kiện không bị ép nhập dài–rộng–cao; dùng một ô thông số kỹ thuật.
- Khối lượng riêng lấy từ vật liệu; giá và khổ mua tách khỏi quy cách mã.
- **Thương hiệu vật tư thiết bị (KH, nội dung 4 trong nguồn sau họp):** có trường thương hiệu bên cạnh thông số kỹ thuật. Không chỉ ghi lẫn thương hiệu vào đoạn mô tả rồi bỏ qua khi chọn giá. Không tự mở rộng thành bắt buộc mọi nhóm phôi/tiêu hao đều có thương hiệu.
- **Cách tổ chức đề xuất (ĐX):** chọn thương hiệu đã khai hoặc khai bổ sung khi cần, không dùng danh sách hãng cố định. Thể hiện thương hiệu khi tìm/chọn và trên dòng thiết bị của báo giá; không nhầm thương hiệu với nhà cung cấp. Mã/biến thể thiết bị phải phân biệt thương hiệu khi cùng thông số, không gộp hai hãng thành một hồ sơ giá. Chưa biết hãng thì ghi chưa xác định, không tự điền hãng mẫu.
- Tìm theo mã/tên, lọc theo nhóm vật tư và vật liệu để chọn nhanh khi lập báo giá (PA1 phần 00:07:22–00:08:10 theo mốc bản chép chưa xác minh).

**Kiểm tra đạt:** thêm hai mã mới được tự sinh không trùng; lọc nhóm/vật liệu ra đúng danh sách; chọn Thép chỉ thấy mác/đặc tính phù hợp; đổi vật liệu làm sạch lựa chọn không hợp lệ; tên gợi ý cập nhật nhưng không ghi đè tên người dùng đã tự sửa.

**Kiểm thêm thương hiệu:** hai thiết bị có cùng thông số nhưng thương hiệu thử A/B phải phân biệt được trong danh mục, kết quả tìm/chọn và dòng báo giá; tải lại vẫn giữ đúng hãng. Chỉ đổi thương hiệu không tự sửa thông số kỹ thuật hoặc gộp giá hai hãng. Đồng bộ kiểm giá tại GD-01.

**Đối chiếu:** PA1 00:03:03–00:08:10 và 00:15:26–00:20:47 (mốc bản chép); [form vật tư demo tại 00:10:00 video](frames/video_00-10-00.png), [mác vật liệu hệ thống tham khảo](frames/video_00-20-00.png), [form bản hiện tại](../../artifacts/customer-review/implemented-2026-09-13/04-vat-tu-chon-va-goi-y-ten.png).

![Form vật tư demo-banggia.netlify.app tại thời điểm họp, không phải form của truongphat.dvqt.vn](checklist-images/01-vat-tu.png)

![Danh mục mác vật liệu trong hệ thống tham khảo](checklist-images/03-mac-vat-lieu.png)

### [x] DM-02 — Quy ước hình dạng và công thức do người dùng quản lý

Mỗi hình dạng khai được:

- thông số cố định của mã;
- thông số cần nhập tại báo giá;
- công thức dài/rộng khai triển;
- khối lượng phôi và khối lượng vật tư;
- diện tích phôi và diện tích vật tư;
- đơn vị, ghi chú và điều kiện áp dụng.

Có màn sửa/thử công thức, kiểm biến thiếu, chia 0 và đơn vị. Sửa quy ước mới không làm đổi báo giá đã duyệt; báo giá giữ snapshot phiên bản.

Thép hình đặc thù phải cho nhập dữ liệu tra **kg/m và m²/m ngay trong báo giá**, sau đó chủ động lưu về danh mục để dùng lại; không ép rời báo giá để tạo danh mục trước (PA2 dòng 173–193). Dài theo mm phải đổi về mét đúng một lần khi nhân dữ liệu trên mét. Không ép mọi tiết diện dùng công thức hình học đơn giản.

Tách lượng của một đơn vị với toàn đơn, kg phôi với kg mua sau hao hụt, diện tích vật tư với diện tích thực sự gia công/hoàn thiện. Có cơ sở đo theo đúng đối tượng; không mặc định mọi bề mặt xử lý bằng tổng bề mặt vật tư con hoặc hai lần diện tích phôi.

**Kiểm tra đạt:** cùng đầu vào cho cùng kết quả giữa màn thử và báo giá; công thức lỗi chỉ rõ biến; bản duyệt giữ số cũ khi quy ước đổi. Với dữ liệu thử 10 kg/m và 0,5 m²/m, chi tiết dài 2.000 mm cho 20 kg và 1 m²/chi tiết trước các xử lý hao hụt/hoàn thiện riêng; đổi số lượng 3 cho 60 kg và 3 m², không nhân lặp. Lưu dữ liệu tra từ báo giá rồi dùng lại ở đơn mới được, không sửa đè đơn đã duyệt.

**Đối chiếu:** PA1 00:08:12–00:14:14 (mốc bản chép); [màn sửa công thức 00:16:00 video](frames/video_00-16-00.png), [bảng quy ước bản demo 01:08:00 video](frames/video_01-08-00.png).

![Cách tham khảo để khai và thử công thức](checklist-images/02-cong-thuc.png)

![Bảng quy ước hình dạng trong bản demo](checklist-images/15-quy-uoc-hinh-dang.png)

### [x] DM-03 — Khổ mua chuẩn và phần dư

- Khổ tấm/thanh là dữ liệu kho/mua hàng, tách khỏi mã vật tư.
- Cho chọn nhiều khổ chuẩn theo năng lực máy/xưởng và nhập khổ đặc thù cho đơn.
- Phân biệt phần dư đủ điều kiện tái sử dụng với phế liệu.
- Cho khai ngưỡng kích thước phần dư theo mm để phân loại phế (PA2 dòng 149–153); tách khỏi độ rộng mạch cắt. Ghi rõ áp cho chiều nào theo loại phôi và cách xử lý đúng biên, không tự đặt ngưỡng số mẫu làm chuẩn của xưởng.
- Người lập chọn giữ phần dư hay tính vào hao hụt, có giải thích tác động giá.
- Kết quả phải có bảng theo từng mã: nhu cầu, phương án xếp/cắt, hao hụt, phần dư giữ lại và lượng mua.
- Bảng chính vẫn theo cây sản phẩm–cấu kiện–vật tư, có kích thước khai triển và hao hụt từng mã; sơ đồ cắt là chi tiết mở từ bảng, không thay bảng tổng thể (PA2 dòng 129–143).

**Kiểm tra đạt:** đổi khổ mua không đổi quy cách mã; phần dư giữ lại không đồng thời là hao hụt. Thử dưới/đúng/trên ngưỡng phần dư theo quy ước đã khai; phần đủ kích thước vẫn có thể tính hao hụt nếu đơn đặc thù không tận dụng được. Đổi ngưỡng không đổi mạch cắt. Chi tiết không vừa khổ được báo lỗi, không tạo lượng mua/giá hợp lệ giả.

**Đối chiếu:** PA1 00:20:50–00:22:48 (mốc bản chép); PA2 dòng 129–153; [khổ chuẩn 00:26:00 video](frames/video_00-26-00.png), [hao hụt/phần dư 01:04:00 video](frames/video_01-04-00.png).

![Danh mục khổ chuẩn tham khảo](checklist-images/04-kho-chuan.png)

![Bảng hao hụt và phần dư trong bản demo](checklist-images/09-hao-hut-phan-du.png)

### [x] DM-04 — Thư viện mẫu và tạo nhanh tại báo giá

- Thư viện gom sản phẩm/cấu kiện mẫu, không kéo mọi danh mục thành mục menu riêng.
- Trong báo giá thêm được dòng sản phẩm, cấu kiện hoặc vật tư trống.
- Có thể lấy mã/mẫu gần giống, sửa thành mã mới rồi chủ động lưu về danh mục.
- Không sửa đè mã/mẫu gốc; phải hiện rõ đang tạo bản sao.
- Cùng cây sản phẩm–cấu kiện–vật tư phải **hiển thị xuyên suốt** cấu thành → công đoạn → khai triển/hao hụt → khối lượng/diện tích → giá áp dụng. Giữ định danh, tên, cha–con, số lượng; từng bảng thay cột nghiệp vụ tương ứng. Không chỉ giữ cây trong dữ liệu phía sau rồi trình bày các bảng rời không đối chiếu được (PA2 dòng 129–143, 261–273).

**Kiểm tra đạt:** tạo dòng mới/biến thể không đổi mẫu gốc; tải lại giữ đúng cha–con. Với sản phẩm có một cấu kiện chứa vật tư và một vật tư trực tiếp, chuyển qua đủ năm bảng trên vẫn đối chiếu được cùng các dòng, số lượng và cấp; sửa bản nháp cập nhật thống nhất, không bắt nhập lại.

**Đối chiếu:** PA1 00:26:58–00:29:49 (mốc bản chép); [dòng sản phẩm/cấu kiện trống 00:32:00 video](frames/video_00-32-00.png).

![Dòng trống để thêm cấu thành trực tiếp](checklist-images/05-cau-thanh-dong-trong.png)

### [x] DM-05 — Liên kết kích thước bằng công thức; bổ sung Dày ở kích thước chung

**Hoàn tất v2.13:** người lập chọn dòng phải khớp `PRODUCT_T` hoặc dùng Dày riêng có lý do. Mã cố định không bị ghi đè; lệch/thiếu nguồn bị chặn tính hợp lệ và phát hành. Chọn lại mã qua form thực lấy đúng quy cách/giá/hãng, giữ liên kết; lưu/mẫu/biến thể/khóa bản duyệt và hồi quy công thức đã kiểm local/web. CĐ-04 được xử lý bằng phạm vi tường minh theo quy tắc cố định + liên kết đã có, không bổ sung yêu cầu tự chọn mã chưa được khách nêu. [Bằng chứng v2.13](../../docs/SCOPE-COMPLETION-2026-09-14.md).

**Lịch sử v2.8:** phần liên kết công thức trước đây đã kiểm ở [đợt 2](../../docs/BATCH-02-2026-09-14.md); giữ kết quả đó. Mở lại mã cho bổ sung ô Dày theo ảnh khách mới. **V2.9:** đã kiểm phần ô nhập/lưu dữ liệu, công thức tham chiếu rõ và giữ nguyên quy cách mã tại `b4b8840`; [bằng chứng mới](../../docs/THICKNESS-2026-09-14.md). Chưa làm tự chọn/đổi mã theo Dày chung, CĐ-04 còn mở; không dùng ảnh đợt 2 để thay chứng cứ phần mới.

- Mỗi kích thước của sản phẩm, cấu kiện hoặc vật tư có thể là giá trị cố định, giá trị nhập tay hoặc kết quả công thức.
- Công thức tham chiếu rõ tham số chính dòng và cấp cha/tổ tiên, ví dụ `vật_tư_A.L = sản_phẩm.W - 20` kể cả vật tư nằm trong cấu kiện. Đây là ví dụ khách nêu, không phải mặc định cho mọi vật tư. Việc cho phụ thuộc hai chiều hoặc tham chiếu dòng bất kỳ ngoài cây không phải yêu cầu khách đã chốt.
- Khi tham số nguồn đổi, toàn bộ giá trị phụ thuộc phải tính lại theo thứ tự và kéo theo khai triển, khối lượng, diện tích, giá.
- Trên giao diện phải thấy cả công thức đang dùng và kết quả đã tính; không dùng riêng ký hiệu `↔` khiến người dùng hiểu là hai số luôn bằng nhau.
- Cho phép chủ động chuyển về giá trị cố định hoặc thay công thức, đồng thời lưu người sửa, phiên bản và công thức trong snapshot báo giá.
- Chặn tham chiếu vòng, tham số không tồn tại, sai đơn vị, chia cho 0 và kết quả âm/không hợp lệ; thông báo phải chỉ đúng dòng và biến lỗi.

**Kiểm tra đạt:** `W sản phẩm = 600`, `L vật tư = W sản phẩm - 20` cho 580; đổi W thành 700 cho 680, kéo theo khai triển, kg, diện tích và giá theo các dữ liệu đầu vào tương ứng. Thử cả vật tư trực tiếp và vật tư qua một cấp cấu kiện. Tiết diện cố định của thép hộp không đổi theo W/H chung của sản phẩm. Công thức vòng/biến thiếu bị chặn, không giữ kết quả cũ như thể hợp lệ.

**Đối chiếu giao diện hiện tại:** [ảnh kích thước cha–con đang hiển thị liên kết trực tiếp](../../artifacts/customer-review/09-new-variant-pass.png). Ảnh này xác định vùng cần sửa; yêu cầu công thức lấy từ chú thích mới của khách, không suy ra chỉ từ ảnh hiện trạng.

![Vùng kích thước cha và vật tư con cần chuyển sang liên kết bằng công thức](../../artifacts/customer-review/09-new-variant-pass.png)

#### Bổ sung từ ảnh khách — ô Dày và đối chiếu mã theo phạm vi đã chọn (xong v2.13)

**Căn cứ KH:** khách ghi đúng chữ “dày” sau ô Cao H trên hàng Kích thước chung của “Máng cáp 300 × 50, dài 2.000 mm”. [Nguồn chép chữ và mô tả vị trí — nội dung 5](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt). Ảnh gốc hiện chỉ có trong hội thoại, chưa được lưu kèm local; mô tả này không thay bản ảnh gốc.

- [x] Thêm ô Dày ngay cùng hàng Dài/Rộng/Cao, không chỉ thêm vào chi tiết vật tư. **ĐX:** nhãn `Dày T (mm)`, nhận số thập phân; ô trống là chưa khai, không tự lấy 1,5 từ vật tư trong ảnh hoặc coi là 0.
- [x] **ĐX về lưu dữ liệu:** lưu độ dày chung theo đúng sản phẩm/bản nháp; tải lại, tạo biến thể, lưu/gọi mẫu và snapshot giữ đúng giá trị, không đổi mẫu gốc hay báo giá đã duyệt. Dữ liệu cũ chưa có trường này phải mở được, không bị gán độ dày đoán sẵn.
- [x] **CĐ-04 — đã kiểm phạm vi tường minh, không tự thay mã:** đối chiếu quy tắc thông số cố định tại DM-01/DM-02 và liên kết công thức ở trên; xác định đúng dòng nhận liên kết, kể cả qua cấu kiện. Không tự ép mọi vật tư cùng độ dày, sửa danh mục gốc hoặc chọn mã/giá/hãng thay thế. Nếu độ dày chung mâu thuẫn mã đang chọn, phải thể hiện mâu thuẫn và yêu cầu xử lý rõ, không tính giá như thể hai thông số đã khớp.
- [x] **ĐX về kiểm chứng — đã kiểm v2.13:** kiểm nhập thập phân, để trống, nhập không hợp lệ; lưu/tải lại và biến thể/snapshot; sản phẩm có nhiều độ dày; vật tư không liên kết và bu lông/đóng gói không bị sửa. Sau khi có quy tắc liên kết/chọn mã hợp lệ, kiểm cả vật tư trực tiếp và qua cấu kiện, tính lại khối lượng/giá theo đúng mã và dữ liệu áp dụng; không giữ kết quả cũ khi liên kết lỗi. Giữ hồi quy L/W/H đã đạt và lưu bằng chứng local/web thật theo phần 11.

**Đã kiểm tại v2.9:** nhập thập phân/để trống, chặn 0/âm, tải lại, hoàn tác, lưu/gọi mẫu thật, biến thể riêng và snapshot máy chủ. Kiểm logic sản phẩm nhiều độ dày/nested, giữ nguyên mã/quy cách/giá khi không có liên kết, tham chiếu `PRODUCT_T` rõ ràng vào kích thước được phép và chặn sửa T cố định. Web kiểm hồi quy L/W/H, nguyên công và giá/xuất. **Chưa kiểm ca tự đổi mã theo T vì quy tắc chưa chốt; ô kiểm tổng thể phía trên vẫn mở.**

**Điều kiện đóng lại DM-05 (đã đạt v2.13):** hoàn tất bổ sung và kiểm chứng trên; quy tắc ảnh hưởng vật tư được làm rõ bằng nguồn/quy tắc có căn cứ. Không coi thêm một ô nhập là đã giải quyết việc chọn mã vật tư và tính tiền. Các mã DM-01/DM-02/DM-04, TC-01–TC-04, GD-01 là phạm vi hồi quy liên quan, không tự chuyển trạng thái chỉ vì thêm ảnh này.

### [x] UX-01 — Phân biệt rõ bốn loại dòng trong cây cấu thành

Phải nhìn nhanh và phân biệt được:

1. sản phẩm;
2. cấu kiện;
3. vật tư nằm trong cấu kiện;
4. vật tư nằm trực tiếp trong sản phẩm.

Dùng nền/viền có độ tương phản đủ rõ, đồng thời kết hợp nhãn `SP`/`CK`/`VT`, biểu tượng, thụt cấp và đường nối cây. Không dùng màu làm dấu hiệu duy nhất. Trạng thái chọn, rê chuột, cảnh báo và khóa vẫn phải khác nhau rõ ràng trên cả bốn nhóm.

**Kiểm tra đạt:** người thử nhận đúng bốn loại dòng khi nhìn cây mà không cần mở chi tiết; vẫn phân biệt được khi xem ở thang xám hoặc không nhận biết màu; chữ và số trên từng nền đạt độ tương phản đọc được.

**Đối chiếu giao diện hiện tại:** [ảnh cây cấu thành](../../artifacts/customer-review/implemented-2026-09-13/03-cau-thanh-tu-yeu-cau.png). Khách yêu cầu tăng độ tương phản của chính bốn nhóm đang thể hiện tại khu vực này.

![Cây cấu thành cần tăng tương phản và dấu hiệu phân cấp](../../artifacts/customer-review/implemented-2026-09-13/03-cau-thanh-tu-yeu-cau.png)

## 6. P1 — tính lượng, công đoạn và chi phí

### [x] TC-01 — Số lượng xuyên các cấp, không phụ thuộc vị trí dòng

Số lượng thực hiện của một dòng = số lượng qua chuỗi cha × số lượng của dòng. Dùng khóa cha–con, không dùng “dòng gần nhất phía trên” như Excel. `XD Gia!BF4` là căn cứ XL về lượng theo đối tượng; chưa có quy tắc cộng gộp mọi dòng cùng mã ở nhiều sản phẩm thành một lô. Không tự bổ sung cơ chế tạo lô vào giai đoạn này.

Mỗi yếu tố ghi rõ lấy số sản phẩm, số cấu kiện hay số vật tư đang thực hiện. Lượng tính tiền theo đơn vị của công việc (kg/m²/m/cái/lần...), không mặc định mọi yếu tố đều lấy cùng một con số. Phân biệt lượng đơn vị và toàn đơn theo DM-02.

**Kiểm tra đạt:** sản phẩm 2 × cấu kiện 3 × vật tư 4 = 24; đổi thứ tự hiển thị không đổi kết quả; hai dòng cùng mã không tự cộng gộp nếu chưa có thao tác tạo lô.

### [x] TC-02 — Công đoạn đúng cấp và không tính hai lần

- Khai công đoạn tại vật tư/cấu kiện/sản phẩm.
- Cấp trên chỉ bổ sung việc thực sự làm sau khi ghép cấp con.
- Với từng nguyên công, chọn một phương pháp tính chung cho toàn báo giá; không hiểu thành tất cả nguyên công cùng một đơn vị hoặc cùng đơn giá.
- Mặc định tại xưởng; đánh dấu thuê ngoài đúng phần.
- Thuê trọn sản phẩm/cấu kiện/công đoạn phải ghi rõ bên cấp vật tư và công việc sau khi nhận về.
- Gói thuê đã gồm vật tư/công việc nào thì không cộng lại khoản đó. **Giữ nguyên dòng vật tư**, kích thước, lượng, diện tích và quan hệ cấu thành; chỉ đánh dấu bên cấp/phạm vi tiền đã nằm trong gói. Công việc bổ sung sau nhận hàng vẫn tính nếu khác phạm vi.

**Kiểm tra đạt:** phân biệt hàn ở vật tư với hàn bổ sung ở cấu kiện. Chọn “thuê đã gồm vật tư” không cộng tiền mua riêng của phần đã gồm, nhưng cây/khối lượng/diện tích và vật tư khác không mất. Bỏ lựa chọn khôi phục phép tính từ dữ liệu còn lưu; công việc sau nhận hàng vẫn tính đúng. Không phải tạo lại cấu thành.

**Đối chiếu:** PA2 dòng 43–65, 97–125; [ma trận công đoạn bản tham khảo 00:50:00 video](frames/video_00-50-00.png), [bảng công đoạn bản demo 00:56:00 video](frames/video_00-56-00.png).

![Ma trận chọn yếu tố/công đoạn dùng để hiểu cách thao tác tổng thể](checklist-images/07-ma-tran-cong-doan.png)

![Bảng công đoạn của bản demo](checklist-images/08-cong-doan.png)

### [x] TC-03 — Đơn giá nguyên công theo yếu tố tác động

`Đơn giá áp dụng = Giá gốc × (1 + hs1) × (1 + hs2) × ...`

- Yếu tố được gắn cho từng nguyên công; có loại khoảng số và danh sách giá trị.
- Tham số lấy đúng cấp đang gia công: số lượng, khối lượng, chiều dày, kích thước, độ phức tạp...
- Độ phức tạp gắn từng nguyên công trên từng đối tượng: sửa độ khó cắt không tự đổi độ khó hàn. Một phương pháp chung của nguyên công không đồng nghĩa cùng đơn giá/giá trị yếu tố cho mọi dòng (PA2 dòng 43–65, 77–95).
- Các bậc phải có biên rõ. Excel `Data!AB4`/`XD Gia!AS4` dùng bậc bằng hoặc lớn hơn gần nhất, trên mốc cuối lấy bậc cuối; đây là hành vi của bảng mẫu XL. Nếu bảng khác dùng danh sách giá trị hay cách tra khác thì phải khai rõ, không suy một quy tắc cho mọi bảng.
- Cho thêm bậc/yếu tố; không cố định số cột mẫu.
- Giá tại xưởng và thuê ngoài tách biệt.

**Kiểm tra đạt:** dưới/đúng/trên biên và trên mốc cuối đúng cấu hình; thử danh sách dễ/trung bình/khó. Giá gốc thử 10.000, phần tăng 20% cho 12.000. Nếu nhập dữ liệu dạng hệ số nhân 1,2 thì chuyển đổi có nhãn rõ thành phần tăng 0,2, không dùng `(1 + 1,2)`. Đổi độ khó cắt trên dòng A không đổi hàn hoặc dòng B.

**Đối chiếu:** [cửa sổ cấu hình yếu tố 01:26:00](frames/video_01-26-00.png); cách tra bậc dựa vào Excel `Data!AB4`, `XD Gia!AS4`, lượng tại `XD Gia!BF4`. Ảnh này không hiển thị các giá trị bậc, không dùng làm bằng chứng đúng biên.

![Cửa sổ sửa yếu tố và chọn kiểu bảng, chưa hiển thị các giá trị bậc](checklist-images/14-bang-yeu-to.png)

### [x] TC-04 — Hoàn thiện bề mặt sinh vật tư theo định mức

- Sơn/mạ/làm sạch là công đoạn nhưng được nhóm riêng để thấy phần thuê ngoài và vật tư phát sinh.
- Tiền công/máy tách khỏi vật tư hoàn thiện.
- Chọn phương pháp hoàn thiện phải sinh nhu cầu mã vật tư tương ứng theo diện tích/khối lượng, định mức, số lớp và hao hụt.
- Dùng lại mã sơn/mạ có sẵn; không tạo mã danh mục mới mỗi lần tính.
- Tổng hợp được lượng vật tư hoàn thiện cần mua.
- Diện tích/khối lượng xử lý lấy đúng công việc và đối tượng; không mặc định tổng mọi bề mặt vật tư con là diện tích hoàn thiện sản phẩm. Vật tư phát sinh được dùng ở các bảng qua cùng định danh; không tính tiền hai lần trong vật tư và hoàn thiện.

**Kiểm tra đạt:** thay diện tích xử lý/số lớp làm lượng sơn thay đúng định mức; giá sơn đổi cập nhật đúng phần tiền của bản nháp được chọn. Tính lại không tạo mã danh mục hoặc dòng nhu cầu trùng. Thuê ngoài đã gồm sơn không cộng tiền sơn lần hai nhưng vẫn truy vết được nhu cầu/công việc.

### [x] TC-05 — Tách vận chuyển và lắp đặt theo bản chất

**Đợt 6 — hiện hành:** Đã kiểm tuyến/lượt, phạm vi cấu kiện/sản phẩm, lượng/đơn vị/yếu tố, phân bổ và đúng lớp giá; gói không lặp, “đã gồm” chỉ nối đúng công việc nguồn. Giá logistics có khai thuế/nguồn riêng. Hồi quy cả nguồn bị xóa/đổi và công việc khác phạm vi. Công việc thực tế chưa rõ vẫn phải khai/đối chiếu trước phát hành. Đã kiểm bản Netlify `f432bdc`; [bằng chứng và giới hạn](../../docs/BATCH-06-2026-09-14.md). Các ghi nhận đợt trước bên dưới là lịch sử.

**Đợt 4:** có liên kết công thiết bị với khoản lắp đặt đã tính theo đối tượng; phần công thiết bị bằng 0 khi đã gồm, khoản gốc và các công khác vẫn giữ. Nguồn bị xóa/đổi phạm vi phải chọn lại. CĐ-02 giữ mở.

**Đợt 3:** đã kiểm tuyến/lượt, chọn cấu kiện/chi tiết, lượng/đơn vị, yếu tố riêng, giá gói và phân bổ làm tròn. Còn chống trùng công việc thiết bị theo TC-07/CĐ-02 nên chưa đánh dấu trọn mã. Xem báo cáo đợt 3; yêu cầu dưới đây giữ nguyên.

Tách ít nhất:

- vận chuyển nhập vật tư;
- vận chuyển đi/nhận lại hàng thuê ngoài;
- vận chuyển giao khách;
- lắp đặt.

Mỗi khoản có đối tượng, nguồn–đích/tuyến, số lượt, lượng vận chuyển thực sự, đơn vị/cách tính, cự ly nếu công thức dùng cự ly, giá và cơ sở phân bổ. Không coi mọi lượt đi/về đều chở toàn bộ khối lượng đơn.

Lắp đặt có bảng kê theo sản phẩm/đối tượng và phương pháp tương ứng: cái, mét, **kg và yếu tố tác động**; có thể theo cấu kiện/chi tiết dù thường khai theo sản phẩm (PA2 dòng 245–257). Sản phẩm A theo cái, B theo mét được; đây không phải lựa chọn hai phương án chào giá khác nhau. Bộ/trọn gói là lựa chọn triển khai khi đơn vị/cơ sở được khai rõ. Giá gói không nhân thêm lượng; giá theo yếu tố vẫn cần cơ sở đo, không phải một đơn vị tính riêng.

Tổng phân bổ phải bằng tổng khoản chi, kể cả làm tròn; không chia sang sản phẩm không thuộc chuyến. Chống cộng trùng công việc theo TC-07, không cấm những việc lắp đặt khác nhau cùng tồn tại.

**Kiểm tra đạt:** hai lượt đi/về và hai tuyến lấy đúng lượng/cự ly, không phân bổ chéo; tổng tiền phân bổ khớp. Lắp đặt A theo cái, B theo mét, C theo kg tính đúng; đổi yếu tố của C không đổi lượng/method của A/B. Gói không nhân lượng lần nữa.

**Đối chiếu:** [màn vận chuyển/lắp đặt 01:12:00](frames/video_01-12-00.png).

![Các nhóm vận chuyển và lắp đặt trong demo](checklist-images/10-van-chuyen-lap-dat.png)

### [x] TC-06 — Cấu hình theo nhóm, TMC có công thức riêng và tổng phương án trọn gói

**Hoàn tất v2.13:** đọc lại workbook gốc và khớp 7 phép đối chiếu CB/CE/CM/CO/đầu ra; lập 4 ca nhánh có đầu vào QA công khai, dùng công thức/bảng bậc gốc. Sửa cơ sở CP chung đầy đủ, tổng một lần qua nhiều phần; kiểm đơn vị CA, hệ số nhân CI, nhánh ngoài TMC, làm tròn/thuế và file xuất. Đây là kiểm công thức có nguồn, không phải gán ca QA thành đơn thật của khách hay chạy lại toàn workbook bằng Excel. [Bảng số/bằng chứng/giới hạn](../../docs/SCOPE-COMPLETION-2026-09-14.md).

**Lịch sử/căn cứ:** KH về giá đầy đủ, PA2 dòng 305–329 về nhân công/hao hụt đặc thù, XL về các nhánh công thức. KH mới nội dung 6 lúc 15:46:38 đã chốt sản phẩm thang máng cáp dùng TMC, sản phẩm cơ khí khác trong cùng đơn dùng chi tiết; ảnh 15:49 chỉ nhóm TMC. Còn đối chiếu đầy đủ chuỗi/tổng tại CĐ-01. [Đợt triển khai mới và giới hạn](../../docs/TMC-2026-09-14.md); các ghi nhận đợt 5 phía trên là lịch sử.

**Cập nhật v2.12 — KH đã đồng ý hướng tổ chức; cơ chế nhóm đã triển khai/kiểm:** nguồn nội dung 7–8 xác nhận gom phần cài đặt theo nhóm sản phẩm, chọn cách so sánh phù hợp với nhóm có trong đơn. Không hỏi lại việc gom theo nhóm/ẩn TMC khi không có. Việc cấu hình theo nhóm không xác nhận công thức số chưa đối chiếu tại CĐ-01.

**Phải tổ chức lại:**

- Gom cài đặt và tham số/yếu tố tác động của TMC theo nhóm phù hợp, dùng lại khi khai báo giá thay vì cấu hình rời rạc. Liên kết phạm vi nhóm với các cách so sánh ở BG-03.
- ĐX mô hình: mỗi cách tính thuộc nhóm có định danh, điều kiện áp dụng, tham số kèm đơn vị, công thức/bảng giá có nguồn và phạm vi chi phí đã gồm. Tách đầu vào tính thật khỏi khoản chỉ dùng đối chiếu; tái sử dụng cơ chế danh mục/quy ước hiện có khi phù hợp. Chi tiết trường/giao diện là ĐX, không ghi thành khách đã duyệt từng trường.
- Cho phép bổ sung cách tính riêng cho nhóm khác khi cần. Cửa gió/tủ điện chỉ là ví dụ mở rộng có điều kiện: chưa triển khai ngay công thức của hai nhóm, chưa có bộ giá/đáp án được cung cấp. Không nhân bản công thức/hệ số TMC sang mọi nhóm để coi là đã hỗ trợ.
- ĐX kiểm soát: nhóm dựa trên khai báo/định danh có căn cứ, không suy từ tên hoặc từ việc thiếu giá TMC. Phân biệt TMC gồm thân/nắp/phụ kiện như nguồn ảnh; ảnh không cung cấp đủ 27 định nghĩa. Sửa cấu hình nhóm không tự ghi đè giá/bản duyệt cũ; báo giá nháp cần kiểm lại căn cứ tính chịu tác động.

**Kiểm thêm v2.12 (đã chạy bằng dữ liệu QA):** cấu hình TMC được lưu/mở lại đúng nhóm; đổi tham số chỉ tác động phạm vi được khai, phần cơ khí ngoài TMC giữ nhánh chi tiết; đơn không TMC không bị buộc khai tham số TMC. Dùng nhóm/công thức giả lập có nhãn QA để kiểm khả năng mở rộng riêng, không phát hành nó như công thức cửa gió/tủ điện của khách. Kiểm hồi quy dữ liệu cũ, cảnh báo thiếu nhóm/giá và khóa bản duyệt. Giữ `[~]` cho đến khi đạt cả phần mới lẫn đối chiếu chuỗi/tổng dưới đây.

- Chỉ áp công thức TMC cho sản phẩm thang máng cáp; bảng nhân công/hao hụt theo nhóm thang/máng/phụ kiện phù hợp. Sản phẩm cơ khí khác dùng chi tiết theo KH 15:46:38. Không ép khung máy thành TMC; phân loại chưa rõ hoặc giá TMC thiếu phải báo rõ, không âm thầm trả 0/đổi nhánh.
- Hao hụt riêng, nhân công theo chủng loại/khổ/kích thước. Đơn vị thân/nắp/phụ kiện phải tách. Số minh họa 1,5%, 2.000 đồng... không phải số bất biến.
- Nhân công TMC đã gồm công việc nào thì không cộng lại nguyên công chi tiết cùng công việc đó.
- Phương án cần đủ giá vật tư, công, hoàn thiện và các khoản/hệ số thuộc **công thức riêng** đã đối chiếu. Tổng tạo ra là giá đầy đủ; không cộng thêm khoản tham chiếu từ phương án tính toán.
- Lưu riêng định nghĩa đầu vào tính TMC và định nghĩa các dòng chỉ hiển thị để đối chiếu, dù chúng có thể cùng lấy giá tham chiếu từ một danh mục. Không dùng thao tác ẩn/hiện để quyết định khoản nào vào công thức.
- Thiếu dữ liệu của dòng đáng lẽ áp TMC phải báo thiếu. Phần không thuộc TMC cần nhánh có định nghĩa, không lặng lẽ trả 0 hoặc đổi phương án theo từng sản phẩm.

**Bằng chứng công thức mẫu để người/bot không phải đoán khi chưa có file XL:**

| Ô trong `260514 XD phần mềm.xlsx` | Hành vi đã đọc được | Giới hạn sử dụng |
| --- | --- | --- |
| `Output!J1` | Nhãn “PA2: Kết hợp với CT TMC”. | Có căn cứ xem xét phương án kết hợp, chưa đủ xác định mọi trường hợp pha trộn. |
| `XD Gia!AT4` | Bốn nhóm `Quy uoc!B6:B9` là máng, nắp máng, thang, nắp thang: `AS4 × I4 / 1000`; nhóm khác lấy `AS4`. | Không đồng loạt nhân chiều dài cho phụ kiện. Đối chiếu đơn vị và số lượng đầy đủ trước tính tổng. |
| `XD Gia!BU4` | `IF(BT4>0,BT4,BS4)`; BT4/BS4 là tổng nhân công theo điều kiện sản phẩm. | Không suy thành tự thay nhân công từng vật tư con; BT=0 do thiếu dữ liệu khác với không thuộc TMC. |
| `XD Gia!CE4` | `BP4+BQ4+BU4+BV4+BW4+BY4+BR4+IF(CA4>0,CA4,CB4)`; BV4 là phần hoàn thiện trong phép tính mẫu. | Chứng minh TMC không chỉ có bảng công; không tự coi CE4 là đầy đủ đặc tả đầu ra/thuế sau phản hồi mới. |

**Trước khi đóng mục:** lập bảng số trung gian từ file mẫu cho (a) sản phẩm TMC thuần, (b) đơn có TMC và sản phẩm khác; (c) một sản phẩm có cả phần TMC lẫn không TMC nếu thực tế có, cần xác định cách phân loại. Ca (c) trong câu hỏi của bên lập trình chưa tự trở thành yêu cầu khách đã chốt. Ghi nguồn đầu vào, khoản thay thế, khoản giữ lại, hệ số và tổng. Nếu không xác định được nhánh bằng nguồn hiện có, giữ trạng thái CĐ-01 và hỏi đúng bước còn thiếu; không chế công thức, không bỏ ca đơn có hai loại sản phẩm.

**Kiểm tra đạt:** đúng đơn vị mét/cái và số lượng; không trùng công/hao hụt; dòng TMC thiếu bậc/giá bị báo thiếu; các ca áp dụng nêu trên khớp nhánh có căn cứ. Giữ nguyên đầu vào TMC, đổi riêng khoản tham khảo thì tổng không đổi; đổi đầu vào TMC thật thì tổng tính lại. Chỉ đóng TC-06/BG-05 sau khi đã xử lý các nhánh liên quan của CĐ-01.

### [x] TC-07 — Chi phí lắp đặt riêng của thiết bị/linh kiện

**Đợt 6 — hiện hành:** Đã kiểm %/đơn giá, cơ sở tổng không nhân lượng lần hai, đúng hãng, hai lớp giá có xác nhận và các ca đã gồm/khác công việc/thay đổi nguồn. Bổ sung giá nguồn/thuế cho đơn giá công và tiền thiết bị, không chia thuế hệ số %. Không dùng 20–30% làm mặc định. CĐ-02 là đầu vào thực tế phải khai rõ; chưa khai/đổi căn cứ thì chặn, không xác nhận hộ khách. Đã kiểm bản Netlify `f432bdc`; [bằng chứng và giới hạn](../../docs/BATCH-06-2026-09-14.md). Các ghi nhận đợt trước bên dưới là lịch sử.

**Đợt 4:** đã kiểm công %/đơn giá, cơ sở tổng không nhân lượng lần hai, đúng hãng, lớp giá có xác nhận, dẫn công/gói/chi phí đã gồm, không xóa việc khác. Có cảnh báo nguồn đổi/xóa, đổi lượng/hãng với cơ sở tổng, nhân bản thiếu cấu hình; xử lý được công còn sót sau xóa thiết bị. CĐ-02 vẫn cần đối chiếu công việc thực tế nên chưa đánh dấu trọn mã; xem báo cáo đợt 4. Yêu cầu dưới đây giữ nguyên.

- Với mã thuộc nhóm thiết bị/linh kiện, ngoài giá mua phải cho khai chi phí lắp đặt của chính chi tiết đó.
- Mỗi mã/dòng chọn một trong các cách: không có chi phí; đã gồm trong giá nhà cung cấp; phần trăm trên giá trị thiết bị; hoặc đơn giá lắp đặt cụ thể.
- Nếu theo phần trăm: ghi rõ **giá trị thiết bị tương ứng công việc** làm cơ sở. Ví dụ dùng giá mua/chiếc × số chiếc thực hiện × tỷ lệ, hoặc tổng giá trị số thiết bị đó × tỷ lệ; không nhân số lượng lần hai, không tự lấy giá bán cả sản phẩm. Nếu theo đơn giá: ghi đơn vị và lượng thực hiện.
- Khoảng 20–30% khách nêu chỉ là ví dụ để mô tả cách tính, không được đặt thành mặc định cứng.
- Hiển thị tách giá mua thiết bị và chi phí lắp đặt chi tiết trước khi cộng vào phương án tính toán.
- Ghi đối tượng, phạm vi/công việc và nơi thực hiện. Chỉ ngăn cộng hai lần **cùng công việc** đã nằm trong giá nhà cung cấp/gói/công đoạn. Lắp ráp ở xưởng và lắp đặt sản phẩm tại công trình là hai việc khác thì được tồn tại cả hai.
- Xác định khoản thuộc lớp giá sản xuất hay giá gốc dựa trên công việc thực tế; không suy từ việc gắn vào dòng thiết bị. Chưa rõ thì giữ CĐ-02, không áp ngầm hệ số.
- Khoản chỉ chuyển từ phương án tính toán sang đối chiếu không được cộng thêm vào tổng kg/TMC/đối thủ. Đầu vào thực sự của công thức TMC phải theo TC-06, không lẫn với dòng tham khảo.

**Kiểm tra đạt:** hai thiết bị, giá mua thử 10.000.000 đồng/chiếc, tỷ lệ thử 20% cho 4.000.000 đồng tổng lắp đặt; đổi sang 1.500.000 đồng/chiếc cho 3.000.000 đồng. Chọn “đã gồm” không cộng lại chính công việc ấy, nhưng việc lắp đặt công trình khác phạm vi vẫn giữ. Kiểm khoản ở đúng lớp giá khi CĐ-02 đã được làm rõ; mẫu số/giá trị trên đây là số thử, không phải giá khách chốt.

**Kiểm liên quan thương hiệu (ĐX từ KH mới):** khi đổi thiết bị/giá áp dụng theo hãng và xác nhận lại cơ sở tiền theo GD-01, chi phí lắp đặt theo % tính lại từ giá trị thiết bị tương ứng. Không tự đổi tỷ lệ hoặc đơn giá lắp đặt cố định chỉ vì đổi hãng; khoản “đã gồm” vẫn giữ đúng phạm vi. Yêu cầu thương hiệu không tự giải quyết CĐ-02.

**Đối chiếu giao diện hiện tại:** [ảnh khu vực giá riêng của báo giá](../../artifacts/customer-review/implemented-2026-09-13/05-gia-rieng-cua-bao-gia.png). Cần bổ sung cấu hình chi phí lắp đặt thiết bị tại dữ liệu giá/dòng thiết bị tương ứng.

![Khu vực giá cần bổ sung chi phí lắp đặt thiết bị và linh kiện](../../artifacts/customer-review/implemented-2026-09-13/05-gia-rieng-cua-bao-gia.png)

## 7. P1 — giá đầu vào, duyệt và đầu ra

### [x] GD-01 — Giá tham chiếu và giá áp dụng của từng báo giá

**Đợt 6 — hiện hành:** Đã có metadata/quy đổi thuế từng đầu vào vật tư, vật tư định mức, đơn giá nguyên công, gói thuê, logistics và công thiết bị; giữ nguồn, căn cứ và lịch sử. Lịch sử danh mục phủ cả giá vật tư định mức, bảng giá và quy ước; máy chủ giữ actor/revision. Giá đổi/hãng/đơn vị đổi mất xác nhận cũ; snapshot, nhân bản và đơn trống được kiểm riêng. CĐ-03 phải khai theo từng hồ sơ, không suy điều kiện thuế. Đã kiểm bản Netlify `f432bdc`; [bằng chứng và giới hạn](../../docs/BATCH-06-2026-09-14.md). Các ghi nhận đợt trước bên dưới là lịch sử.

**Đợt 5:** lưu điều kiện thuế từng giá/kg/đối thủ và căn cứ/giờ khai trong snapshot; giá đổi làm hết hiệu lực điều kiện của giá đó. Chi phí có xác nhận mặt bằng chưa thuế, gắn đầu vào hiện tại; thay đầu vào phải rà lại. Chưa có metadata/quy đổi thuế tự động từng dòng vật tư, nguyên công, gói thuê, logistics; người lập phải quy đổi nguồn có thuế và cập nhật đúng trường trước. Lịch sử các đường danh mục vẫn chưa phủ đủ.

**Đợt 4:** đổi thiết bị/hãng qua bảng công lắp phải xác nhận giá mới, giữ tỷ lệ và đơn giá công; % liên kết tính lại theo giá đúng hãng. Đổi ĐVT khi còn công không được quy đổi ngầm; đổi hãng làm hết xác nhận tổng tiền nhập riêng. Còn thuế/CĐ-03 và phủ đủ lịch sử các đường cập nhật danh mục.

**Đợt 3:** đã kiểm xác nhận trước–sau khi chọn giá và lưu dấu vết riêng của đơn. Còn điều kiện thuế, quy trình đổi hãng/liên kết lắp đặt theo %, phủ lịch sử các đường sửa giá danh mục; chưa đánh dấu trọn mã.

- Danh mục giữ lịch sử giá theo mã/đơn vị/ngày.
- Báo giá chọn hoặc nhập giá áp dụng rồi lưu snapshot.
- Sửa danh mục không tự đổi báo giá đã lưu/đã duyệt.
- Có thao tác cập nhật giá có xác nhận và báo rõ dòng thay đổi.
- Giá kg nhập theo sản phẩm hoặc quy tắc của đơn; giá đối thủ nhập riêng từng sản phẩm.
- Khi cập nhật giá áp dụng phải đối chiếu được theo cùng cây cấu thành tại DM-04: giá vật tư, công việc/hoàn thiện, vận chuyển/lắp đặt và các đầu vào riêng. Đơn giá danh mục không thay cho bảng giá thực sự dùng trong đơn.
- Giá nhập có tình trạng đã/chưa gồm thuế; chưa xác nhận không tự đổi thành đã/chưa gồm theo một mặc định ngầm (D10).
- **Giá theo thương hiệu thiết bị (KH + ĐX):** chọn giá tham chiếu/giá áp dụng theo đúng mã hoặc biến thể thiết bị, thương hiệu và đơn vị; cùng thông số không đồng nghĩa cùng giá. Giữ thương hiệu cùng snapshot thiết bị/giá của báo giá. Không tự tạo hệ số chênh giá giữa các hãng khi khách chưa cung cấp.
- Khi đổi thương hiệu trong bản nháp, phải chọn lại/xác nhận giá tương ứng. Không âm thầm giữ giá hãng cũ như thể còn hợp lệ; nếu chưa có giá cho hãng mới thì báo thiếu hoặc cho nhập giá riêng có căn cứ. Cập nhật giá hãng A không thay giá hãng B hoặc giá bản đã duyệt.

**Kiểm tra đạt:** tạo hai báo giá cùng mã vật tư, cập nhật danh mục; báo giá cũ giữ giá, báo giá mới lấy giá mới. Cập nhật không xóa đơn giá đã chỉnh riêng nếu chưa xác nhận.

**Kiểm thêm thương hiệu:** dữ liệu thử cùng thông số, A = 1.000.000 đồng/chiếc và B = 1.500.000 đồng/chiếc. Chọn hai chiếc lần lượt cho tiền thiết bị 2.000.000 và 3.000.000 đồng, chưa xét khoản/hệ số khác; thiếu giá B không được dùng giá A hoặc 0. Giữ nguyên số lượng/thông số; nếu lắp đặt theo 20% giá trị thiết bị thì lần lượt 400.000 và 600.000 đồng sau xác nhận cơ sở. Sửa giá A không đổi B hay bản duyệt. Các hãng/giá/tỷ lệ trên chỉ là số thử.

### [x] GD-02 — Hệ số mở, chia đúng lớp và có quyền sửa

**Đợt 3:** đã đạt cơ chế triển khai/kiểm chứng nội bộ: yếu tố mở, căn cứ, audit máy chủ, quyền tách biệt và chặn API. Đã kiểm UI Netlify, riêng quyền/phiên/tệp kiểm trên máy chủ localhost. Chính sách người thật chưa phải khách đã duyệt; không coi demo tĩnh là bảo mật đa người.

- Nhóm hệ số chia theo lớp giá đã định nghĩa ở BG-04, có cơ sở tính rõ; không tự thêm một lớp nhân hệ số vào giá gốc chỉ vì có ba nhóm giao diện.
- Cho thêm yếu tố có tên/căn cứ; không dùng một ô “khác” để che mọi khoản.
- Lưu người sửa, thời điểm và phiên bản.
- Quyền xem giá vốn/lợi nhuận, sửa hệ số và duyệt giá cuối tách biệt.
- Chính sách gán quyền cho người/chức danh thật còn cần thiết lập với khách; không mặc định mọi tài khoản “kinh doanh” chỉ được xem bản đã duyệt. Kiểm bằng các tài khoản thử có tập quyền cụ thể.

**Kiểm tra đạt:** tài khoản thử không có quyền xem nội bộ không nhận giá vốn qua giao diện/API/tệp; tài khoản không có quyền sửa hệ số hoặc duyệt không thực hiện được hành động đó. Đổi hệ số bản nháp không đổi phiên bản đã duyệt. Quy tắc duyệt dưới giá gốc nếu sử dụng phải được cấu hình/chấp thuận, không tự gán cho một chức danh. Demo trình duyệt không thay kiểm quyền trên máy chủ.

**Đối chiếu:** [nhóm hệ số 01:24:00](frames/video_01-24-00.png).

![Khu vực hệ số trong demo cần tổ chức theo đúng lớp giá](checklist-images/13-he-so.png)

### [x] GD-03 — Bản chào giá chuyên nghiệp và nhất quán

**Đợt 6 — hiện hành:** Đã có form chọn/xác nhận mẫu ký và các điều kiện riêng của báo giá; thiếu hoặc nội dung đổi chặn bản chính thức. Duyệt và tải PDF A4/Excel/CSV thực tế trên web cho cùng tổng; không lộ giá nguồn/căn cứ nội bộ, không in huy hiệu hosting. Máy chủ bán hàng nhận đúng phần được phép. Mẫu thử là QA, không phải mẫu Trường Phát đã chấp thuận; hồ sơ thực phải có căn cứ được dùng trước phát hành. Đã kiểm bản Netlify `f432bdc`; [bằng chứng và giới hạn](../../docs/BATCH-06-2026-09-14.md). Các ghi nhận đợt trước bên dưới là lịch sử.

**Đợt 5:** kiểm bản chính thức 4.000.000 trước thuế + 320.000 thuế = 4.320.000 trên web; bản PDF/Excel giữ tổng chuẩn hóa, không cộng lại thuế trong giá nguồn. CSV/PDF/Excel làm việc có nhãn; bản chính thức thiếu/stale căn cứ bị chặn cả bộ tính/máy chủ. Mẫu ký và điều kiện thực tế/CĐ-03 vẫn chưa được khách chấp thuận; không đánh dấu xong trọn mã.

- Thông tin khách/người nhận/công trình lấy từ hồ sơ, không nhập lại.
- Một ô “Thông số kỹ thuật” cho từng sản phẩm như khách góp ý.
- Có số lượng, đơn vị, đơn giá, thành tiền, thuế, vận chuyển/lắp đặt nếu thể hiện riêng, tổng thanh toán.
- Điều kiện hiệu lực, giao hàng, thanh toán, bảo hành và ghi chú phải theo báo giá đang chốt.
- Phần ký theo mẫu Trường Phát chấp thuận; mẫu một bên ký là lựa chọn đề xuất, không phải yêu cầu đã chốt. Không lấy yêu cầu “chỉ phần ký của tao” trong báo giá dịch vụ Xandro trước đây áp sang mọi báo giá Trường Phát xuất cho khách của họ.
- Kiểm tra câu chữ “đã/chưa VAT”, “đã/chưa vận chuyển/lắp đặt” không mâu thuẫn.
- Khoản vận chuyển/lắp đặt hiển thị riêng nhưng đã gồm trong giá phương án chỉ là phần phân rã, không cộng tổng lần nữa. Không tự thêm VAT nếu giá nhập đã gồm, không tự coi đã gồm khi chưa rõ (D10).

**Kiểm tra đạt:** bản phát hành chính thức chỉ chứa giá bán đã duyệt, không lộ giá vốn/hệ số; nếu cho xem/in nháp thì ghi rõ “Nháp” và không coi đã duyệt. Tổng dòng, khoản đã bao gồm, thuế và tổng thanh toán nhất quán; thông tin khách đúng snapshot.

### [x] GD-04 — Trạng thái, lịch sử và không ghi đè

**Đợt 3:** kiểm máy chủ tạo phiên bản nháp từ nội dung cũ, giữ bản đã duyệt, lý do/người thực hiện và chống ghi đè phiên cũ. Kiểm riêng trạng thái giao dịch trong hồi quy; không đồng nhất giao dịch với duyệt nội bộ. Bằng chứng máy chủ localhost, không phải server sản xuất trên Netlify.

Giữ trạng thái giao dịch riêng với duyệt nội bộ. Bản đã duyệt là bất biến; chỉnh tiếp tạo phiên bản mới. Lưu lịch sử ai sửa, ai trình, ai duyệt, phương án được chọn, giá chốt và lý do điều chỉnh.

**Kiểm tra đạt:** hai người cùng mở một báo giá không ghi đè im lặng; người không có quyền không duyệt được; khôi phục phiên bản cũ chỉ tạo bản sao làm việc.

## 8. P2 — nối sang vận hành thực tế

### [ ] ERP-01 — Hồ sơ chuyển sản xuất

Sau khi báo giá/đơn hàng được chốt, chuyển nguyên cấu trúc đã duyệt: sản phẩm–cấu kiện–vật tư, công đoạn, tự làm/thuê ngoài, định mức, lượng, giá kế hoạch và phiên bản. Giữ tiến độ/yêu cầu thực hiện và thông tin việc thuê ngoài cần chuẩn bị sớm để nối sản xuất. Không tạo lại mã bằng tay ở sản xuất. Đây là bước nối ERP, không tự mở toàn bộ thực hiện ERP trong đợt sửa báo giá.

### [ ] ERP-02 — Đối chiếu kế hoạch và thực tế

Chi phí thực tế phải ghi về đúng đầu mục: vật tư, công đoạn tại xưởng, thuê ngoài, hoàn thiện, vận chuyển từng loại, lắp đặt và chi phí chung. Báo cáo so kế hoạch–thực tế theo đơn/sản phẩm/chỉ số để điều chỉnh tham số về sau. Đây là yêu cầu nối ERP, không được đánh dấu hoàn thành chỉ vì bảng báo giá có cột chi phí.

## 9. Thứ tự kỹ thuật và chia đợt triển khai

Thứ tự dưới đây là **ĐX**, không phải lịch khách chốt. Mỗi đợt gom khoảng 5–6 mã có liên quan và kiểm được cùng nhau; công bố mã, phụ thuộc, tiêu chí và điểm CĐ bị ảnh hưởng trước khi làm. Không chọn đủ số lượng bằng cách kéo ERP vào giai đoạn báo giá. Mục CĐ chưa rõ chỉ ngăn đóng phần tính liên quan, không ngăn làm những phần độc lập đã đủ căn cứ.

1. BG-01: ổn định hồ sơ tạo báo giá và nơi lưu tệp.
2. DM-01 → DM-05 và UX-01: ổn định danh mục, quy ước, liên kết công thức và cách đọc cây cấu thành.
3. TC-01 → TC-07: ổn định lượng, công đoạn, hao hụt, logistics và lắp đặt thiết bị.
4. BG-04, BG-02, BG-03, BG-05: sửa bộ tính và bảng so sánh theo quyết định mới.
5. GD-01 → GD-04: snapshot, duyệt và đầu ra.
6. BG-06: nối AI vào cấu trúc đã ổn định; chuẩn bị bộ mẫu/kiểm nguồn sớm, không tự hoãn AI ra ngoài giai đoạn báo giá.
7. Chạy một báo giá thật cùng khách, ghi sai lệch thành ca kiểm thử.
8. Sau nghiệm thu phần báo giá mới nối ERP-01/ERP-02 theo kế hoạch dự án.

Ứng dụng dùng một luồng nghiệp vụ đã thống nhất. Bảo toàn lịch sử/bản báo giá cũ không có nghĩa đưa lại hai luồng cho khách lựa chọn. Không xóa dữ liệu cũ để đơn giản hóa việc chuyển đổi; kiểm mở lại và không đổi âm thầm giá bản đã duyệt.

## 10. Bộ kiểm thử nghiệm thu tối thiểu

Đây là tiêu chí kiểm kỹ thuật đề xuất trước khi xin khách nghiệm thu, không phải kết quả đã chạy. Dữ liệu số dưới đây là dữ liệu thử. Các ca liên quan CĐ phải ghi công thức/điều kiện có căn cứ trước khi kết luận đạt, không chọn đáp án theo kết quả phần mềm đang cho.

### Ca A — tạo hồ sơ và tài liệu

- [ ] Tạo khách mới ngay trong form báo giá.
- [ ] Nhập công trình, hạn chào, tiến độ, yêu cầu kỹ thuật.
- [ ] Đính kèm PDF và Excel; tải lại đúng tệp sau khi đăng nhập lại.
- [ ] Đưa dòng yêu cầu sang cấu thành mà không nhập lại.
- [ ] Lưu nháp khi thiếu trường không bắt buộc; lỗi thiếu dữ liệu tính chỉ rõ vị trí, không tự điền số mẫu.
- [ ] Sửa danh bạ hoặc bản nháp mới không đổi thông tin khách của bản đã duyệt.

### Ca B — cấu thành và số lượng

- [ ] Sản phẩm 2 × cấu kiện 3 × vật tư 4 = 24.
- [ ] Đảo/sắp xếp dòng không đổi kết quả.
- [ ] Tạo biến thể không sửa mẫu gốc.
- [ ] Tự sinh mã vật tư không trùng; tìm/lọc nhóm và vật liệu đúng.
- [ ] Thiết bị cùng thông số khác thương hiệu phân biệt được khi tìm/chọn; tên hãng lưu riêng, hiển thị và giữ đúng sau tải lại, không nhầm với nhà cung cấp.
- [ ] `W sản phẩm = 600`, `L vật tư = W sản phẩm - 20` cho 580; đổi `W = 700` cho 680.
- [ ] Công thức vòng hoặc tham chiếu biến thiếu bị chặn, không giữ giá cũ như thể hợp lệ.
- [ ] Nhận ra đúng bốn loại dòng bằng màu kết hợp nhãn/biểu tượng/thụt cấp; không phụ thuộc riêng vào màu.
- [ ] Cùng cây/định danh/số lượng hiển thị qua cấu thành, công đoạn, khai triển/hao hụt, khối lượng/diện tích và giá áp dụng; không nhập lại.
- [ ] Thử liên kết công thức tới sản phẩm qua cấp cấu kiện; đổi chiều dài kéo theo lượng và giá, không đổi tiết diện cố định của mã thép hộp.

### Ca C — công thức và hao hụt

- [ ] Kiểm tấm 1.000 × 200 × 2 mm với khối lượng riêng thử 7.850 kg/m³ cho 3,14 kg/chi tiết.
- [ ] Đổi khổ mua làm thay hao hụt nhưng không đổi mã vật tư.
- [ ] Phần dư giữ lại không đồng thời tính vào hao hụt.
- [ ] Ngưỡng phần dư tính theo mm khác mạch cắt; dưới/đúng/trên biên theo quy ước, phần đủ ngưỡng vẫn có thể không tận dụng theo quyết định của đơn.
- [ ] Không vừa khổ được báo lỗi; không hiển thị lượng mua/giá tính sai như hợp lệ.
- [ ] Nhập kg/m và m²/m ngay trong đơn, lưu dùng lại; mm đổi sang mét và lượng đơn vị × số lượng đúng một lần.
- [ ] Diện tích gia công/hoàn thiện được xác định theo đối tượng/công việc, không ngầm lấy mọi mặt của vật tư con.

### Ca D — công đoạn và thuê ngoài

- [ ] Kiểm tra bậc dưới biên/đúng biên/trên biên.
- [ ] Công đoạn tại xưởng và thuê ngoài lấy đúng đơn giá/cơ sở.
- [ ] Gói thuê gồm vật tư không cộng vật tư lần hai.
- [ ] Bật/tắt gói thuê giữ nguyên cây, kích thước, lượng, diện tích; công việc bổ sung sau nhận hàng vẫn tính, không phải tạo lại dòng.
- [ ] Đổi độ phức tạp cắt dòng A không đổi hàn hoặc dòng B; phương pháp chung của nguyên công không đồng nhất giá trị yếu tố mọi dòng.
- [ ] Giá 10.000 với phần tăng 20% cho 12.000; nhập hệ số nhân 1,2 phải chuyển đúng ý nghĩa, không thành `(1 + 1,2)`.
- [ ] Sơn theo diện tích × định mức × số lớp sinh đúng lượng vật tư.
- [ ] Tính lại không tạo dòng sơn trùng; vật tư hoàn thiện chỉ tính tiền một lần dù xuất hiện ở nhiều bảng.
- [ ] Lắp đặt thiết bị tính đúng theo phần trăm hoặc đơn giá cụ thể và nhân đúng số lượng.
- [ ] Hai thiết bị × 10 triệu/chiếc × 20% cho 4 triệu; đơn giá 1,5 triệu/chiếc cho 3 triệu.
- [ ] “Đã gồm” ngăn trùng cùng công việc, không loại lắp đặt công trình khác phạm vi; lớp giá đúng CĐ-02 sau khi đối chiếu.
- [ ] Lắp đặt theo cái/mét/kg và yếu tố lấy đúng lượng từng đối tượng; giá gói không nhân thêm lượng.
- [ ] Vận chuyển đi/về theo đúng lượng, tuyến/cự ly; tổng phân bổ bằng tiền chuyến, không phân bổ sang sản phẩm ngoài phạm vi.

### Ca E — cách tính giá và so sánh theo nhóm/lựa chọn

Các ô mới tích dưới đây là kết quả kiểm cơ chế bằng dữ liệu QA của đợt nhóm v2.12, không thay đối chiếu workbook khách tại CĐ-01 và không thay trạng thái 25 mã.

- [ ] Phương án chi tiết khớp công thức ba lớp.
- [ ] Kg = kg phôi × giá/kg; không cộng thêm chi phí chi tiết.
- [ ] TMC có công thức riêng tạo đủ giá, không chỉ bảng nhân công; không cộng lại quản lý/vận chuyển chỉ dùng tham khảo.
- [ ] Đối thủ = số lượng × giá đối thủ; không nhân thêm lợi nhuận/hệ số bán.
- [ ] Thay chi phí tham khảo của chi tiết không làm đổi ba tổng trọn gói.
- [ ] Thay đầu vào thực sự của TMC làm tính lại TMC theo công thức riêng; không đánh đồng với ca giữ nguyên giá phía trên.
- [ ] Đúng đơn vị thân/nắp/phụ kiện; không nhân mét/số lượng hai lần.
- [x] Đối chiếu TMC thuần và đơn có sản phẩm TMC cùng sản phẩm khác theo CĐ-01 — 4 ca theo nguồn v2.13, gồm mét và cái; phần ngoài TMC giữ chi tiết theo xác nhận 15:46:38. Ca một sản phẩm pha trộn chỉ cần nếu thực tế có. Không tự gán TMC cho hàng không thuộc nhóm.
- [ ] Thiếu giá đầu vào hiển thị “Chưa đủ dữ liệu”, không phải 0 đồng.
- [ ] Chỉ chọn được một phương án cho toàn báo giá.
- [x] Đơn đã phân loại chỉ có cơ khí khác: không hiện cột TMC, không bắt nhập bảng/giá TMC để phát hành theo phương án hợp lệ khác.
- [x] Đơn có TMC: chỉ hiện đối chiếu TMC khi chọn cách này; các cách khác theo khai báo/phạm vi, không bắt hiện đủ bốn cột.
- [x] Đơn hỗn hợp: tổng phương án TMC = phần TMC theo TMC + phần cơ khí khác theo chi tiết; cùng lượng/phạm vi toàn đơn khi so sánh.
- [x] Nhóm chưa xác định không bị coi là không có TMC. Cách đã chọn/thuộc phạm vi nhưng thiếu giá/tham số/thuế phải báo thiếu; không tự ẩn hoặc trả 0 để cho qua.
- [x] Lưu/mở lại/chuyển bước giữ lựa chọn so sánh của từng báo giá. Bảng phân tích xuất nội bộ phản ánh đúng lựa chọn, không áp cài đặt của đơn khác.
- [x] Bật/tắt cách so sánh không tự đổi giá cuối. Nếu bản nháp bỏ hết TMC mà giá chào đang chọn TMC, phải báo chọn lại phương án hợp lệ trước phát hành, không âm thầm thay giá. Snapshot bản đã duyệt không đổi.
- [x] Cấu hình TMC/đơn vị/yếu tố lưu theo nhóm; đổi tham số chỉ tác động đúng phạm vi. Nhóm thử mở rộng dùng công thức QA có nhãn, không biến thành công thức cửa gió/tủ điện đã được khách chốt.
- [ ] Ẩn/hiện khoản tham chiếu không đổi phần chênh còn lại; không trừ cả tổng cha và khoản con.
- [ ] Kg phôi/giá so sánh bằng 0 không ra Infinity/NaN; điều kiện thuế chưa rõ không được coi đã so cùng mặt bằng.

### Ca F — duyệt và xuất

- [ ] Tài khoản thử không có quyền sửa hệ số/duyệt bị chặn; chính sách dưới giá gốc nếu có được kiểm theo cấu hình được chấp thuận, không theo chức danh tự đoán.
- [ ] Bản duyệt giữ nguyên khi danh mục giá đổi.
- [ ] Giá thiết bị theo đúng thương hiệu: đổi hãng phải xác nhận lại giá; hãng chưa có giá không lấy giá hãng cũ/0; cập nhật hãng A không đổi hãng B hoặc snapshot bản duyệt.
- [ ] Đổi giá thiết bị theo thương hiệu làm tính lại lắp đặt theo % từ đúng cơ sở; không tự đổi tỷ lệ hay đơn giá lắp đặt cố định.
- [ ] PDF/Excel khớp tổng và không lộ giá vốn.
- [ ] Điều kiện VAT/vận chuyển/lắp đặt hiển thị nhất quán.
- [ ] Thử giá nhập đã gồm thuế và chưa gồm thuế sau khi khai đủ điều kiện; không cộng hai lần; chưa xác nhận thì không phát hành chính thức.
- [ ] Khoản phân rã vận chuyển/lắp đặt đã nằm trong giá không cộng lại ở bản xuất; bản nháp phân biệt rõ với bản được duyệt.
- [ ] Hai phiên máy chủ không ghi đè im lặng; quyền bảo vệ dữ liệu ở API/tệp, không chỉ ẩn trên giao diện. Ghi riêng nếu môi trường demo không hỗ trợ kiểm ca này.

### Ca G — AI

- [ ] PDF rõ sinh bản nháp có nguồn đối chiếu.
- [ ] Ảnh mờ bị cảnh báo, không bịa số.
- [ ] Người dùng phải xác nhận trước khi nhập vào cấu thành.
- [ ] Chạy lại không ghi đè dữ liệu đã duyệt.
- [ ] Kiểm bảng nhiều trang, dòng trùng, số lượng/đơn vị thiếu và dịch vụ lỗi; có trạng thái rõ, không tạo dữ liệu giả hoặc nhập lặp.
- [ ] Có bộ mẫu/đáp án và ghi sai lệch thực tế; không tự đặt mức “100% chính xác” từ vài mẫu.

### Ca H — hồi quy và đúng bản triển khai

- [ ] Mở lại dữ liệu cũ và bản đã duyệt không bị mất/đổi tiền âm thầm; không đưa lại hai luồng nghiệp vụ cho khách phải chọn.
- [ ] Sau commit/push, xác định Netlify đã phục vụ đúng bản thay đổi; ghi URL, commit/bản deploy và thời điểm.
- [ ] Thao tác lại trên web thật bằng dữ liệu thử riêng, kiểm kết quả và lỗi trình duyệt; không sửa đơn/tài khoản thật của khách chỉ để thử.
- [ ] Ảnh/clip bằng chứng gắn từng mã đầu mục và đúng phiên bản; localhost, demo trình duyệt và môi trường máy chủ được ghi riêng.

## 11. Điều kiện được đánh dấu hoàn thành

Quy trình người dùng yêu cầu: gom khoảng 5–6 đầu mục → triển khai → kiểm local → commit/push Git → chờ Netlify deploy → kiểm trực tiếp web thật → lưu bằng chứng.

- Repo làm việc: `https://github.com/xandrosworld/satthep-truongphat`.
- URL kiểm bản deploy: `https://baogia-truongphat.netlify.app/` (người dùng cung cấp; lượt sửa tài liệu này chưa kiểm web).
- Không tự push trong lượt chỉ được yêu cầu sửa checklist. Quy trình này dùng khi bắt đầu đợt triển khai được yêu cầu.

Phân biệt khi áp dụng từ đợt 6: **thiếu quy tắc tính** (CĐ-01) vẫn chặn đóng mã liên quan. **Thiếu dữ liệu/xác nhận của một hồ sơ thực** (công việc/cơ sở/lớp giá CĐ-02, thuế CĐ-03, mẫu ký) không được tự điền; cơ chế phần mềm chỉ được hoàn tất nếu có trường khai, căn cứ, kiểm ca thiếu/đổi, và chặn phát hành khi chưa xác nhận. Đánh dấu cơ chế đã kiểm không có nghĩa dữ liệu thật đã được khách chốt. Không dùng một ô xác nhận để thay cho công thức chưa biết, không hạ điều kiện nghiệm thu của khách.

Một mã chỉ đổi sang `[x]` khi có đủ:

1. Mã nguồn đã sửa và đối chiếu yêu cầu/nguồn; không còn điểm CĐ chưa giải quyết ảnh hưởng tới kết quả của mã đó.
2. Test/kịch bản tái hiện được, có đầu vào, kết quả mong đợi độc lập, thực tế và hồi quy liên quan. Test cũ không thay tiêu chí mới.
3. Commit/bản build cụ thể đã kiểm local, đã push đúng repo/nhánh và xác định bản Netlify tương ứng đang được phục vụ; không lấy việc push thành công làm bằng chứng deploy thành công.
4. Chạy lại kịch bản chính **trực tiếp trên URL thật**, ghi ngày giờ, môi trường, dữ liệu thử, kết quả và lỗi. Deploy cũ/chưa xong/lỗi không được coi đạt; lỗi cần sửa, triển khai và kiểm lại.
5. Ảnh/video gắn mã đầu mục, đường dẫn nguồn bằng chứng, commit/build/deploy và SHA-256 khi có. Ảnh chỉ minh họa giao diện không thay test số; ảnh localhost không thay ảnh web thật.
6. Các ca cần máy chủ/đa người/quyền/tệp đã kiểm đúng môi trường. Nếu mới kiểm được demo trình duyệt thì ghi phần đã đạt, phần chưa kiểm và chưa đánh dấu xong cả mã.

Mẫu ghi cho mỗi đợt, không điền sẵn “đạt”:

| Mã | Đã làm | Kiểm local | Commit/build | Deploy/URL/thời điểm | Kiểm web thật + bằng chứng | CĐ/ca chưa đạt | Khách nghiệm thu |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mã trong đợt | Chưa ghi | Chưa kiểm | Chưa có | Chưa có | Chưa kiểm | Liệt kê cụ thể | Chưa |

Giữ bằng chứng có dữ liệu khách trong gói nội bộ; nếu cần đưa ảnh lên repo công khai phải xử lý thông tin nhạy cảm và có quyền phù hợp. Ghi kết quả/bằng chứng sau kiểm có thể là cập nhật tài liệu riêng; không tạo vòng deploy chỉ để nhận thêm ảnh là “một bản app mới”. Nếu có thay mã ứng dụng sau bản đã kiểm, phải kiểm bản ứng dụng mới.

“Có giao diện”, “test cũ vẫn xanh” hoặc “khách nói gần ổn” không đủ để đánh dấu hoàn thành. Nghiệm thu của khách là trạng thái riêng. Hạ tầng chưa có không được che bằng kết quả demo.

## 12. Nguồn đối chiếu

### Đọc khi chỉ có bản clone GitHub

Checklist giữ trong Git; ảnh, clip, bản chép và phần lớn hồ sơ nội bộ không theo dõi trong repo công khai. Ở bản trước sửa đã kiểm 93 lượt liên kết/58 đích local, tất cả tồn tại trên máy làm việc nhưng 55 đích không có trong Git. Không coi link thiếu trên clone là yêu cầu không tồn tại, cũng không nói đã xem ảnh/clip khi chưa nhận được gói nguồn.

Quy tắc/tiêu chí cần làm đã ghi trực tiếp trong tài liệu, kể cả các công thức XL quan trọng tại TC-06. Muốn kiểm lại lời/hình phải có gói nguồn nội bộ gồm `transcripts`, `frames`, `clips`, `checklist-images`, hai manifest và tài liệu Excel liên quan; bàn giao qua nơi được phép, không ép push dữ liệu khách lên Git/Netlify. Nếu thiếu gói, ghi giới hạn kiểm chứng và tiếp tục phần đã rõ, không tự dựng ảnh hoặc lời xác nhận.

Các SHA-256 nền đã kiểm khi rà v1: video gốc `d35385d659f58134f7a0d53f1723e014829dc5394f568d38449b293813b93ee7`; Excel 260514 `0471d8036da78b19b635eb71e2e6ad2b30c82e0700765c72735271e1d2335e7e`. 47 khung hình và 16 clip khớp manifest lúc rà; đây là kiểm toàn vẹn, không phải kiểm nội dung phiên âm. Chưa có bản sao lưu ngoài máy được xác nhận ở lượt này.

`tools/verify-phase1.cjs` còn phụ thuộc script Python/tài liệu kiểm hồ sơ bị ignore. Khi chạy từ clone, phải báo phần phụ thuộc còn thiếu hoặc tách kiểm mã nguồn và kiểm hồ sơ thành nhóm có tên rõ; không âm thầm bỏ nhóm rồi báo toàn bộ đạt. Việc sửa quy trình test là bước chuẩn bị triển khai, chưa được thực hiện trong lượt sửa checklist.

### Căn cứ theo từng đầu mục

Các cách lưu phiên bản, chặn lỗi, chống ghi đè và toàn bộ ca test là ĐX kiểm soát thực hiện. Bảng dưới chỉ nguồn nghiệp vụ và điểm chưa rõ; ảnh là hình hiện trạng/tham khảo, không là bằng chứng khách nghiệm thu.

| Mã | Căn cứ nghiệp vụ | Điểm cần giữ rõ |
| --- | --- | --- |
| BG-01 | KH chú thích form mới; PA1 dòng 200–206, PA2 dòng 4–15 | Lưu nháp/snapshot là ĐX. |
| BG-02 | KH ba giá đầy đủ, kg phôi, đối thủ theo sản phẩm; XL tại TC-06 | CĐ-01/CĐ-03; phân biệt tham khảo và đầu vào TMC. |
| BG-03 | KH nội dung 7–8 cập nhật bảng so sánh theo nhóm/lựa chọn, thay luôn hiện bốn cột; XL `BC Chao gia!AD22` | Không có TMC không hiện TMC; có nhưng thiếu giá phải báo thiếu. Công thức chỉ số không đổi theo ẩn/hiện; CĐ-01/CĐ-03. |
| BG-04 | KH công thức ba lớp ngày 12/09 | Không tự phân lớp khoản mới CĐ-02. |
| BG-05 | KH chọn chung cả báo giá; nội dung 7–8 về chọn cách đối chiếu không hủy quy tắc này | Tách so sánh khỏi giá cuối. Nhánh ngoài TMC dùng chi tiết đã chốt; CĐ-01 còn số/chuỗi. Chặn lựa chọn hết áp dụng và lưu điều chỉnh là ĐX. |
| BG-06 | KH nhắc AI sau họp; phạm vi ảnh/PDF trong hồ sơ dự án | Thứ tự làm/kiểm soát bản nháp là ĐX, không phải lịch hoãn khách đã duyệt. |
| DM-01 | KH chọn vật liệu/mác/đặc tính, tên gợi ý; KH mới nội dung 4 yêu cầu thương hiệu thiết bị; PA1 dòng 23–26 và phần danh mục | Sinh mã/lọc có nguồn PA; cách tổ chức trường thương hiệu/chọn hãng là ĐX. |
| DM-02 | PA1 phần quy ước; PA2 dòng 173–193 | Nhập dữ liệu tra ngay trong đơn, không ép hình học. |
| DM-03 | PA1 phần khổ mua; PA2 dòng 129–153 | Ngưỡng mm phải được khai, không tự đặt số cố định. |
| DM-04 | PA1 phần tạo trống/thư viện; PA2 dòng 129–143, 261–273 | Cây phải đọc được xuyên các bảng. |
| DM-05 | KH chú thích liên kết kích thước; KH mới nội dung 5 ghi “dày” sau Cao H ở kích thước chung | Cơ chế kiểm tham chiếu/khóa snapshot và nhãn T/mm là ĐX; phạm vi truyền độ dày/chọn mã theo CĐ-04. |
| UX-01 | KH bốn nhóm màu tương phản | Nhãn/thụt cấp/thử thang xám là ĐX. |
| TC-01 | KH lượng bám bản chất; XL `XD Gia!BF4` | Định danh cây là ĐX; không tự thêm gom lô. |
| TC-02 | KH công việc theo ba cấp; PA2 dòng 43–65, 97–125 | Phương pháp chung từng nguyên công; không xóa dòng khi thuê đã gồm. |
| TC-03 | KH công thức yếu tố; PA2 dòng 77–95, 355–363; XL `Data!AB4` | Không biến hệ số nhân thành phần tăng, không chung độ khó mọi việc. |
| TC-04 | KH hoàn thiện sinh vật tư; PA1 phần định mức, PA2 dòng 53–65 | Theo diện tích xử lý thực, không đếm vật tư phát sinh hai lần. |
| TC-05 | KH tách vận chuyển; PA2 dòng 201–257 | Nhiều cách đo và công thức yếu tố, không chỉ giá gói. |
| TC-06 | KH trọn gói; PA2 dòng 305–329; XL công thức tại mục; KH nội dung 6 xác nhận hai nhánh; nội dung 7–8 xác nhận gom theo nhóm/mở rộng khi cần | Ngoài TMC dùng chi tiết đã chốt. Cấu hình nhóm/so sánh mới đã kiểm; còn đối chiếu số CĐ-01. Cửa gió/tủ điện chưa có công thức chốt. |
| TC-07 | KH chú thích thiết bị 20–30%/đơn giá; KH mới thương hiệu ảnh hưởng giá thiết bị | Kiểm cơ sở phần trăm theo giá đúng hãng là ĐX; CĐ-02 vẫn cần đối chiếu. |
| GD-01 | KH giá danh mục để chọn giá trong đơn; KH mới nội dung 4 giá khác theo thương hiệu; PA2 dòng 261–301 | Snapshot/cập nhật có xác nhận và tách giá theo đúng thiết bị/hãng là ĐX; CĐ-03. |
| GD-02 | KH hệ số mở; PA2 dòng 335–363 | Phân quyền là ĐX cần thiết lập người thật, không gán theo chức danh tự suy. |
| GD-03 | KH mẫu chuyên nghiệp/thông số một ô | Mẫu ký là ĐX chờ chọn; CĐ-03, không cộng lại khoản phân rã. |
| GD-04 | ĐX lưu phiên bản/truy vết để dùng chung | Kiểm riêng máy chủ và trình duyệt; chưa là chính sách khách đã duyệt từng chi tiết. |
| ERP-01 | KH bám thực tế sản xuất; PA2 phần thuê ngoài/tiến độ | Nối ERP, không phải mở thêm thực hiện ERP trong đợt báo giá. |
| ERP-02 | KH phân bổ thực tế để so với dự toán | Nối ERP, không hoàn thành bằng cột chi phí kế hoạch. |

### Danh sách nguồn (một số chỉ có trong gói nội bộ)

- [Phản hồi mới nhất sau cuộc họp](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt)
- [Bản chép phần 1](transcripts/HAI-PHAN-01.txt)
- [Bản chép phần 2](transcripts/HAI-PHAN-02.txt)
- [Công thức khách gửi](../../docs/nguon/2026-09-12-cong-thuc-gia-khach-bo-sung.txt)
- [Rà công thức Excel và câu hỏi](RA-SOAT-LAI-CAU-HOI.md)
- [Bảng công thức Excel](DOI-CHIEU-EXCEL.md)
- [Trang xem toàn bộ 47 ảnh và 16 clip](index.html)
- [README trạng thái dự án](../../README.md)
- [Báo cáo rà soát v1 — lưu để truy vết F01–F14](RA-SOAT-CHECKLIST-2026-09-14.md)

### Bản đồ ảnh và clip

Các ảnh trong `checklist-images` là bản cắt vùng chia sẻ màn hình từ khung hình gốc 1280 × 720; không chỉnh nội dung. Mở clip tương ứng để xem khoảng 10 giây trước và 30 giây sau mốc ảnh.

| Chủ đề | Ảnh cắt | Khung gốc | Clip có tiếng và hình |
| --- | --- | --- | --- |
| Form vật tư demo của bên làm | [01](checklist-images/01-vat-tu.png) | [00:10:00](frames/video_00-10-00.png) | [00:09:50–00:10:30](clips/video_00-09-50_den_00-10-30.mp4) |
| Sửa công thức | [02](checklist-images/02-cong-thuc.png) | [00:16:00](frames/video_00-16-00.png) | [00:15:50–00:16:30](clips/video_00-15-50_den_00-16-30.mp4) |
| Mác vật liệu | [03](checklist-images/03-mac-vat-lieu.png) | [00:20:00](frames/video_00-20-00.png) | [00:19:50–00:20:30](clips/video_00-19-50_den_00-20-30.mp4) |
| Khổ chuẩn | [04](checklist-images/04-kho-chuan.png) | [00:26:00](frames/video_00-26-00.png) | [00:25:50–00:26:30](clips/video_00-25-50_den_00-26-30.mp4) |
| Cấu thành/dòng trống | [05](checklist-images/05-cau-thanh-dong-trong.png) | [00:32:00](frames/video_00-32-00.png) | [00:31:50–00:32:30](clips/video_00-31-50_den_00-32-30.mp4) |
| Hồ sơ yêu cầu | [06](checklist-images/06-ho-so-yeu-cau.png) | [00:46:00](frames/video_00-46-00.png) | [00:45:50–00:46:30](clips/video_00-45-50_den_00-46-30.mp4) |
| Ma trận yếu tố/công đoạn | [07](checklist-images/07-ma-tran-cong-doan.png) | [00:50:00](frames/video_00-50-00.png) | [00:49:50–00:50:30](clips/video_00-49-50_den_00-50-30.mp4) |
| Bảng công đoạn demo | [08](checklist-images/08-cong-doan.png) | [00:56:00](frames/video_00-56-00.png) | [00:55:50–00:56:30](clips/video_00-55-50_den_00-56-30.mp4) |
| Hao hụt/phần dư | [09](checklist-images/09-hao-hut-phan-du.png) | [01:04:00](frames/video_01-04-00.png) | [01:03:50–01:04:30](clips/video_01-03-50_den_01-04-30.mp4) |
| Quy ước hình dạng | [15](checklist-images/15-quy-uoc-hinh-dang.png) | [01:08:00](frames/video_01-08-00.png) | [01:07:50–01:08:30](clips/video_01-07-50_den_01-08-30.mp4) |
| Vận chuyển/lắp đặt | [10](checklist-images/10-van-chuyen-lap-dat.png) | [01:12:00](frames/video_01-12-00.png) | [01:11:50–01:12:30](clips/video_01-11-50_den_01-12-30.mp4) |
| Đơn giá đầu vào | [11](checklist-images/11-don-gia-dau-vao.png) | [01:18:00](frames/video_01-18-00.png) | [01:17:50–01:18:30](clips/video_01-17-50_den_01-18-30.mp4) |
| Kg/đối thủ/TMC | [12](checklist-images/12-bon-phuong-an.png) | [01:20:00](frames/video_01-20-00.png) | [01:19:50–01:20:30](clips/video_01-19-50_den_01-20-30.mp4) |
| Nhóm hệ số | [13](checklist-images/13-he-so.png) | [01:24:00](frames/video_01-24-00.png) | [01:23:50–01:24:30](clips/video_01-23-50_den_01-24-30.mp4) |
| Cửa sổ cấu hình yếu tố, chưa thấy giá trị bậc | [14](checklist-images/14-bang-yeu-to.png) | [01:26:00](frames/video_01-26-00.png) | [01:25:50–01:26:30](clips/video_01-25-50_den_01-26-30.mp4) |

### Cảnh báo nguồn

Bản chép P1/P2 do AI tạo, chưa nghe xác minh toàn bộ 90 phút. P1 có dấu hiệu lệch mốc hình; P2 không có mốc từng lượt nói. Ảnh khung hình chứng minh màn hình xuất hiện ở mốc video, không tự chứng minh câu nói cụ thể đồng bộ với ảnh. Không gán tên/vai trò thật chỉ từ nhãn Người nói 1/2. Khi số liệu/công thức mâu thuẫn, ưu tiên tin nhắn khách mới hơn và kiểm lại trên một báo giá thực tế.

Ảnh gốc có chú thích mới về form tạo, kích thước, màu phân cấp và thiết bị được khách gửi qua hội thoại. Ảnh hiện trạng local dùng tại các mục tương ứng chỉ xác định vùng giao diện, không thay ảnh chú thích gốc; muốn chuyển toàn bộ bằng chứng sang máy khác phải bổ sung các ảnh gốc được phép chia sẻ vào gói nội bộ. Không dựng lại ảnh rồi gọi là ảnh khách.

**Ảnh ô Dày bổ sung tại v2.8:** đã xem trực tiếp trong hội thoại, chưa có file gốc trong gói local. Đã lưu chữ “dày” và mô tả đúng vị trí ở nguồn nội dung 5 để bot đọc văn bản vẫn hiểu yêu cầu. Chưa tạo đường dẫn ảnh giả hoặc lấy ảnh khác thay thế; cần bổ sung bản gốc vào gói bằng chứng nội bộ khi có file.

## 13. Các điểm còn cần đối chiếu — không tự quyết thay khách

**Trạng thái v2.13:** **CĐ-01 và CĐ-04 đã đóng về cơ chế và kiểm chứng**, xem báo cáo đợt hoàn tất 5 mã. CĐ-01 có số gốc và ca nhánh từ công thức trong file đang có; CĐ-04 có liên kết yêu cầu theo dòng, cảnh báo lệch mã và xử lý rõ, không tự chọn mã. Giá/thuế/công việc cụ thể của hồ sơ thật vẫn phải khai, không coi việc đóng mã là xác nhận thay khách.

**Lịch sử v2.12:** CĐ-01 còn đối chiếu chuỗi/số trung gian/tổng XL, giữ các mã phụ thuộc mở; không còn chờ khách xác nhận nhánh ngoài TMC hoặc hướng gom cài đặt/so sánh theo nhóm. Yêu cầu mới D15–D16 đã triển khai/kiểm bằng bộ đợt nhóm riêng; không lấy kết quả đợt cũ thay thế. Với CĐ-02/CĐ-03 và mẫu ký, đã triển khai/kiểm cơ chế khai và xác nhận trên từng báo giá; chưa có xác nhận cho dữ liệu kinh doanh thực. Bảng dưới tiếp tục là việc phải đối chiếu khi nhập hồ sơ. Nếu công việc/lớp giá, thuế hay quyền dùng mẫu còn chưa rõ thì hồ sơ đó chưa được phát hành chính thức; dấu [x] của cơ chế không thay người lập xác nhận.

Các điểm dưới đây không làm dừng toàn bộ dự án. Làm phần đã đủ căn cứ; chưa đóng mục tính tiền liên quan khi chưa giải quyết điểm CĐ. Khi có câu trả lời, lưu nguyên văn, ngày/nguồn và cập nhật đúng ID, không ghi đè lời cũ.

**Bổ sung v2.8:** CĐ-04 chỉ theo dõi cách độ dày chung tác động đến vật tư/chọn mã; không hỏi lại việc có cần ô Dày hay không. Đây là yêu cầu mới sau đợt 6, chưa được giải quyết bằng các kết quả kiểm trước đó.

| Mã | Còn thiếu điều gì | Cách xử lý và điều kiện đóng | Ảnh hưởng |
| --- | --- | --- | --- |
| CĐ-01 — đóng v2.13 | Đã đọc và khớp 7 ô/đường nối của file gốc. Bốn ca TMC thuần/hỗn hợp dùng công thức và bảng bậc gốc, đầu vào QA được ghi riêng; CM/CO trước làm tròn giữ trong báo cáo. Dữ liệu điền sẵn D4:D7 vẫn là cơ khí, không gọi thành mẫu TMC thật. | Đã bổ sung cơ sở CP chung đầy đủ, tính một lần qua nhiều phần; đối chiếu CA/CB/CE/CM, nhánh ngoài TMC theo chi tiết, UI và file thực xuất. Không cộng CP3 giao hàng lần nữa; nguồn mới về ba lớp/giá đầy đủ có hồi quy riêng. Không cần đợi file mới để kiểm các nhánh này. Giá/thuế/công việc đơn thật vẫn phải khai đủ. | TC-06, BG-02, BG-03, BG-05 đã đóng về triển khai/kiểm chứng. |
| CĐ-02 | Lắp đặt thiết bị là công việc nào, tiền thiết bị làm cơ sở là gì, thuộc lớp giá nào khi có cả việc tại xưởng/công trình. | Ghi rõ đối tượng, phạm vi, giá trị và lượng trong ví dụ; đối chiếu lớp giá với công thức KH, hỏi đúng công việc chưa rõ. Không xin lại tỷ lệ cố định; khách đã nói tỷ lệ thay đổi. | TC-07, phần lắp đặt tương ứng tại TC-05/BG-04. |
| CĐ-03 | Giá nhập thực tế đã/chưa gồm thuế và điều kiện thuế của ca báo giá. | Cho khai rõ tại đầu vào, đưa về cùng mặt bằng, kiểm bản xuất. Chưa xác nhận thì để trạng thái chưa xác nhận trước phát hành, không cộng thêm hoặc coi đã gồm ngầm. | BG-02/BG-03, GD-01/GD-03. |
| CĐ-04 — đóng v2.13 | Phạm vi do người lập chọn theo từng dòng: phải khớp Dày chung hoặc dùng Dày riêng có lý do. Căn cứ là quy cách mã cố định và cơ chế liên kết được chọn đã nêu DM-01/DM-02/DM-05, không suy ra mọi dòng cùng T từ ảnh. | Không ghi đè quy cách/hãng/giá. Lệch hoặc thiếu nguồn thì chặn kết quả hợp lệ và phát hành; chọn lại mã thật hoặc xử lý phạm vi rõ ràng. Đã kiểm qua cấu kiện, sản phẩm con, nhiều độ dày, đổi mã, lượng/giá, mẫu/biến thể/lưu lại/khóa snapshot. Không tự mở thêm cơ chế tự chọn mã. | DM-05 đã đóng; giữ hồi quy L/W/H và các mã liên quan. |

Không hỏi lại khách: chọn chung toàn báo giá; kg theo phôi; đối thủ nhập theo sản phẩm; ba giá đã đầy đủ và khoản chuyển sang chỉ để đối chiếu; hệ số sửa được; cần AI, form đầu vào, công thức kích thước, bốn nhóm màu, lắp đặt thiết bị theo %/đơn giá; cần bổ sung ô Dày ở kích thước chung theo ảnh mới; trong đơn nhiều loại sản phẩm, TMC chỉ áp cho thang máng cáp và phần cơ khí khác dùng chi tiết; gom cài đặt theo nhóm để mở rộng khi cần; so sánh theo lựa chọn phù hợp với nhóm trong đơn và không có TMC thì không hiện TMC. Xác nhận hướng tổ chức không đồng nghĩa có sẵn công thức cửa gió/tủ điện hay đã nghiệm thu số tiền.

Danh sách người/quyền thực, mẫu xuất cuối cùng, bộ mẫu/đáp án và tiêu chí nghiệm thu AI cần ghi nhận khi thiết lập/kiểm cùng khách. Không tự coi chính sách đề xuất là đã được duyệt, nhưng cũng không dùng việc chưa có tên tài khoản thật để dừng xây cơ chế phân quyền.

## 14. Dấu vết sửa v2

Đã giữ nguyên 25 ID và trạng thái công việc; không mục nào được đánh dấu xong chỉ vì sửa tài liệu. F01–F14 là mã phát hiện của bản rà v1, không phải 14 yêu cầu mới của khách.

| Phát hiện v1 | Nơi đã sửa diễn đạt/tiêu chí trong v2 |
| --- | --- |
| F01 | Nhãn nguồn phần 2 và bảng căn cứ từng mã phần 12. |
| F02 | D06, BG-06, thứ tự kỹ thuật phần 9. |
| F03 | D03–D05, BG-02/BG-05, TC-06, CĐ-01 và ca E. |
| F04 | TC-02 và ca D: giữ dòng vật tư, chỉ loại khoản tiền trùng. |
| F05 | D13, TC-07, CĐ-02 và ca D: đúng công việc, số lượng, lớp giá. |
| F06 | D10, BG-03, GD-01/GD-03, CĐ-03 và ca E/F. |
| F07 | BG-03 và ca E: tập khoản không trùng, chỉ số không theo ẩn/hiện. |
| F08 | DM-03/DM-04, GD-01 và ca B: cùng cây qua năm bảng. |
| F09 | DM-01/DM-02/DM-03, TC-03/TC-05 và ca B/C/D. |
| F10 | DM-02/DM-05, TC-01/TC-04, BG-04 và ca B/C/D. |
| F11 | GD-02/GD-03, phần 13 và ca F: không tự gán quyền/mẫu ký. |
| F12 | Nhãn ảnh 01/14, DM-01/TC-03 và cảnh báo phần 12. |
| F13 | Hướng dẫn clone/gói nguồn và giới hạn nhóm test phần 12. |
| F14 | Quy trình chia đợt/kiểm bản deploy phần 9/11, ca H; README đầu mối hiện hành. |

Việc sửa câu chữ không tự giải quyết CĐ-01/CĐ-02/CĐ-03 và không bổ sung ảnh gốc còn thiếu vào gói bàn giao. Những trạng thái đó vẫn được ghi rõ, không tuyên bố đã hoàn tất thay khách.

### Bổ sung v2.1 — thương hiệu vật tư thiết bị

Nguồn: tin nhắn mới của khách, lưu nguyên văn tại **nội dung 4** trong [nguồn sau họp](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt). Không có ảnh mới hoặc mốc giờ riêng được cung cấp.

- DM-01: thêm thương hiệu bên cạnh thông số kỹ thuật, phân biệt thiết bị cùng thông số khác hãng.
- GD-01: giá áp dụng/giá tham chiếu gắn đúng mã hoặc biến thể và thương hiệu; đổi hãng phải kiểm lại giá, không dùng nhầm hãng cũ.
- TC-07: thêm kiểm phần trăm lắp đặt tính từ giá trị thiết bị đúng hãng; không tự đổi tỷ lệ/giá công cố định.
- Ca B/F và bảng căn cứ được cập nhật tương ứng. Giữ đủ 25 mã và trạng thái cũ; đây là cập nhật yêu cầu, chưa phải tính năng đã thực hiện. Danh sách hãng/số giá/tỷ lệ chênh giá không được tự coi đã có; các điểm CĐ cũ không bị đóng bởi tin nhắn này.

### Bổ sung v2.11 — khách đồng ý cài đặt/so sánh theo nhóm

Nguồn: **nội dung 7** giữ nguyên lời khách 16:18–16:33; **nội dung 8** giữ tin người dùng đã gửi và xác nhận “Ta gửi tin nhắn này thì khách ok rồi” trong [nguồn sau họp](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt). Không có nguyên văn/giờ trả lời khách cho nội dung 8; không dựng thêm hoặc coi đó là nghiệm thu.

- D15–D16 và luồng phần 1: thay hiển thị cố định bốn phương án bằng lựa chọn/phạm vi từng đơn, gom cài đặt theo nhóm đã được khách đồng ý.
- BG-03: quy tắc không có TMC thì không hiện; có/đã chọn nhưng thiếu dữ liệu phải báo rõ; đơn hỗn hợp so cùng phạm vi toàn đơn.
- TC-06: tổ chức tham số/yếu tố/cách tính theo nhóm để mở rộng khi cần; các trường dữ liệu và ca QA là ĐX. Cửa gió/tủ điện chưa có công thức để triển khai ngay.
- BG-05: tách chọn cách đối chiếu và giá chào cuối; không đổi giá âm thầm khi bật/tắt cột hoặc khi phương án mất điều kiện.
- BG-02, ca E, bảng nguồn và phần 13: cập nhật nhất quán, bỏ diễn giải còn chờ nhánh cơ khí dùng chi tiết. Giữ CĐ-01 về chuỗi/số/tổng và CĐ-04 về Dày.
- Giữ đủ 25 ID, **17 [x], 5 [~], 3 [ ]**, còn 8 mã chưa hoàn tất. Lượt này chỉ sửa checklist và nguồn văn bản, không sửa ứng dụng, không chạy/nhận đã đạt yêu cầu mới trên web, không đánh dấu xong vì khách đồng ý hướng làm.
