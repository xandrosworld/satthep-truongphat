## Đợt 1 ERP — đã triển khai 25/09/2026

Bản `420a5b7`: khách hàng, đơn hàng, hợp đồng, công nợ, chính sách doanh số và hồ sơ năng lực. [Hướng dẫn và kết quả kiểm tra](docs/dot-1-kinh-doanh.md). 679 test đạt; đã kiểm tra live desktop/mobile và bảo toàn dữ liệu cũ.

# Trường Phát — hồ sơ bàn giao dự án và demo báo giá

## Checklist triển khai hiện hành — chốt ngày 24/09/2026

Dùng [README-CHECKLIST-GD2.md](README-CHECKLIST-GD2.md) cho các đợt tiếp theo: lên khung theo luồng demo trên web hiện tại, giữ báo giá và dữ liệu đã có, tăng tương phản, hoàn thiện đủ 162 mã GĐ2 theo hợp đồng. Tài liệu tách khung giao diện, chức năng chạy thật và xác nhận nghiệm thu; có ghi phần đã triển khai và phần mở rộng chưa thống nhất.

Các báo cáo bên dưới là lịch sử từng đợt, không phải trạng thái tổng thể hiện tại.

## Hiện hành — phản hồi 22:59–23:06 ngày 14/09/2026

Bảng hình dạng chỉ để xem; **Sửa công thức** mở đầy đủ dữ liệu và kiểm tra trước khi lưu. Thông số có tên/diễn giải riêng. Bảng giá nguyên công khai được nhiều cách tính để chọn trong báo giá; từng công việc có độ phức tạp và hệ số nhập trực tiếp. Các dòng khai báo có **Kiểm tra tổng thể**. [Cách dùng, phạm vi và kiểm chứng](docs/DECLARATION-REVIEW-2026-09-14.md).

Kiểm bản hiện tại: `npm run verify:declaration-review`. Bằng chứng ở `artifacts/customer-review/review-2026-09-14-late`; thông tin commit/deploy ở `DELIVERY.json` trong gói nội bộ. [Checklist hiện hành](meeting-2026-09-13/doi-chieu-2026-09-14/CHECKLIST-TRIEN-KHAI.md) vẫn giữ 25 mã; các bản bên dưới là lịch sử.

## Lịch sử — danh mục và công thức phôi, 14/09/2026

Bảng **Thông tin hình dạng phôi** có đủ dạng cấu kiện, hình dạng phôi, thông số tại mã/báo giá, ô công thức dài–rộng, khối lượng và diện tích phôi trên từng dòng, cùng nút xem công thức tổng hợp. Mác/đặc tính được gom theo vật liệu. [Thay đổi, cách dùng và kiểm chứng](docs/CATALOG-REVIEW-2026-09-14.md).

Kiểm bản này: `node tools/verify-rules-catalog.cjs`; đối chiếu web: `node tools/check-rules-catalog-live.cjs`. Trạng thái 25 mục và các giới hạn khác xem [checklist hiện hành](meeting-2026-09-13/doi-chieu-2026-09-14/CHECKLIST-TRIEN-KHAI.md). Các đợt bên dưới là lịch sử.

## Hiện hành — đợt 5, ngày 14/09/2026

Đã push **`ce92dfd`** và kiểm đúng build Netlify. Local **19/19 nhóm, 202 ca logic, 37 ca máy chủ**; web thật **8 nhóm giá/thuế + 9 nhóm hồi quy thiết bị**, có **20 ảnh web**. [Báo cáo, cách dùng và giới hạn đợt 5](docs/BATCH-05-2026-09-14.md). Chạy lại: `npm run verify:batch-five`.

Mở **Giá & hệ số / Phân tích giá → Khai giá và điều kiện thuế**. Giá/kg và đối thủ có trạng thái đã/chưa gồm thuế, được quy đổi trước so sánh; thay giá phải rà lại. Bảng có chênh tiền/%, N/A khi thiếu căn cứ hoặc mẫu số 0, tập chi phí tham khảo không trùng. Bản chính thức chặn thiếu căn cứ; bản làm việc được ghi nhãn rõ.

**BG-03 đã làm một phần; tổng vẫn 13/25 mã [x].** Chi phí đầu vào chi tiết vẫn cần rà số chưa thuế thủ công; chưa hoàn tất TMC, CĐ-03 thực tế, mẫu ký hay AI. Netlify lưu trình duyệt, máy chủ kiểm localhost.

## Lịch sử — đợt 4, ngày 14/09/2026

Đã push **`10bc393`**, kiểm đúng build Netlify và chạy **9 nhóm mới + 5 nhóm hồi quy trên web thật**. Có **21 ảnh web**; local đạt **18/18 nhóm, 192 ca logic, 36 ca máy chủ**. [Báo cáo đợt 4, cách dùng và giới hạn](docs/BATCH-04-2026-09-14.md). Chạy lại: `npm run verify:batch-four`.

Mở **Giá & hệ số → Thiết bị & công lắp**: công theo %/đơn giá, giá theo đúng hãng, lớp giá có xác nhận, dẫn nguồn công đã gồm và cảnh báo mất cấu hình khi nhân bản. Khoản mới không cộng vào ba tổng giá trọn gói. **TC-07 đã bổ sung một phần; tổng vẫn 13/25 mã [x]**. Các phần TMC, thuế, đối chiếu công việc thực tế và AI chưa được tự đánh dấu hoàn thành. Netlify lưu trình duyệt; kiểm phân quyền/máy chủ chỉ ở localhost.

## Lịch sử — đợt 3, ngày 14/09/2026

Đã push ứng dụng `59fc6e0` và kiểm đúng bản trên `https://baogia-truongphat.netlify.app/`: **17/17 nhóm local (177 ca logic, 33 ca máy chủ)**; **5 nhóm mới + 9 nhóm hồi quy trên web thật**, kết thúc 13:32:31. Đã lưu 19 ảnh web thật, 9 ảnh local và 6 ảnh máy chủ thử. [Kết quả, cách dùng và giới hạn đợt 3](docs/BATCH-03-2026-09-14.md). Chạy lại: `npm run verify:batch-three`.

**GD-02, GD-04 hoàn thành nội bộ; TC-05, BG-04, GD-01 đã bổ sung nhưng còn [~].** Tổng checklist **13/25 mã [x]**. Mới có tuyến/lượt và đối tượng lắp đặt, yếu tố SX bổ sung đúng lớp, xác nhận giá trước–sau, quyền nội bộ/sửa/duyệt tách biệt, dùng lại phiên bản cũ mà không ghi đè bản duyệt. Yếu tố SX mới không tự nhân vào giá bán TMC/kg/đối thủ. Còn phần thiết bị/CĐ-02, thuế/CĐ-03 và các tiêu chí chi tiết của GD-01; không coi xanh test là đã xong mọi mã.

Netlify vẫn lưu trình duyệt. Phân quyền/đa người/khóa phiên bản được kiểm ở máy chủ thử cục bộ, không phải đã triển khai server sản xuất. AI và CĐ-01/TMC vẫn cần làm; không phải khách nghiệm thu GĐ1. Các phần hiện hành cũ bên dưới là lịch sử.

## Lịch sử — hoàn thành năm mục đợt 2, ngày 14/09/2026

**DM-05, TC-01, TC-02, TC-03, TC-04 đã hoàn thành triển khai/kiểm chứng nội bộ.** Ứng dụng `3fc452d` đã commit/push `main` và xác minh đúng bản trên `https://baogia-truongphat.netlify.app/`. Đã qua **15 nhóm local (168 ca logic, 28 ca máy chủ)**; trên web thật **9 nhóm đợt 2 + 7 nhóm hồi quy**, lưu **22 ảnh**, kết thúc 12:25:02 ngày 14/09. [Báo cáo đợt 2, cách dùng và bằng chứng](docs/BATCH-02-2026-09-14.md). Chạy lại: `npm run verify:batch-two`.

Đã có công thức kích thước theo cấp cha/tổ tiên, lượng theo cây, cách tính chung theo từng nguyên công, bậc/hệ số có nhãn rõ, vật tư hoàn thiện theo lượng thực và chống cộng trùng khi thuê. **Đơn cũ chưa xác nhận diện tích hoàn thiện có thể bị yêu cầu khai công thức/lượng thực hoặc xác nhận ngay trong chi tiết công việc**; không tự coi toàn bộ diện tích vật tư con là diện tích sơn.

Checklist hiện **11/25 mã `[x]`**; không phải xong toàn bộ GĐ1 hay khách nghiệm thu. AI, các mục giá còn lại và CĐ-01/02/03 vẫn theo checklist. Netlify lưu trên trình duyệt, còn máy chủ/khóa bản duyệt được kiểm trên môi trường thử cục bộ. Các mục lịch sử dưới đây không ghi đè trạng thái hiện hành này.

## Đã hoàn thiện sáu mục đợt 1 — 14/09/2026

**BG-01, DM-01, DM-02, DM-03, DM-04, UX-01 đã được đánh dấu `[x]`** sau khi hoàn thiện, kiểm local, commit/push và kiểm bản Netlify mới. Ứng dụng `6a74c13`: **14 nhóm kiểm local (152 ca logic, 26 ca máy chủ)**; web thật đạt **15 nhóm tình huống, 20 ảnh**, kết thúc 11:41:58 ngày 14/09/2026. Xem [báo cáo hoàn thiện và bằng chứng từng mã](docs/BATCH-01-COMPLETE-2026-09-14.md), chạy lại bằng `npm run verify:batch-one:complete`.

Phần mới ở đợt 1: quy ước hình dạng có trường cố định/biến, công thức và phiên bản; khổ mua chung theo xưởng/máy; dòng vật tư nháp chưa mã; trạng thái/tương phản bốn nhóm dòng. Netlify vẫn là bản lưu trình duyệt; máy chủ dùng chung được kiểm trên máy chủ thử cục bộ. **Không có nghĩa hoàn thành toàn bộ GĐ1 hoặc khách đã nghiệm thu.** DM-05 sau đó đã hoàn thành ở đợt 2 nêu trên; AI và các mục giá còn lại vẫn theo checklist.

## Lịch sử đợt 1 ban đầu — bản 3cf0b3c

Đã sửa gói đầu vào/cấu thành cho BG-01, DM-01/02/03/04 và UX-01. Xem [báo cáo đợt 1](docs/BATCH-01-2026-09-14.md) để biết chính xác phần đã làm, phần còn lại, cách chạy kiểm và trạng thái phát hành. Các câu “chỉ sửa tài liệu” bên dưới mô tả lượt rà checklist trước khi bắt đầu đợt này, không phải trạng thái mã hiện tại.

Tại mốc `3cf0b3c`, chưa xong cả sáu đầu mục: DM-02 còn cấu hình hình dạng tổng quát; DM-03 còn khổ chung theo máy/xưởng; DM-04 còn dòng vật tư nháp. Các phần thiếu đó đã được xử lý trong `6a74c13` nêu ở đầu README. Công thức liên kết DM-05, AI và các phần giá khác không nằm trong nhóm sáu mục này. Giữ checklist làm đặc tả, không giảm tiêu chí để khớp giao diện đã có.

Mã ứng dụng `3cf0b3c` đã push và kiểm trên `https://baogia-truongphat.netlify.app/` lúc 11:00 ngày 14/09: đạt 11 nhóm kiểm cục bộ và 7 nhóm tình huống trên web, lưu 12 ảnh. Xem báo cáo để biết phạm vi và giới hạn, không dùng số test làm xác nhận hoàn tất GĐ1. Máy chủ dùng chung mới được kiểm cục bộ; Netlify vẫn là chế độ trình duyệt.

Chạy `npm run verify:batch-one` để kiểm mã/giao diện/máy chủ mà không cần tài liệu khách bị ignore. Chạy `node tools/check-batch-one-live.cjs` để đối chiếu nội dung Netlify với build đã kiểm trước khi chạy kịch bản web. Ảnh/log nằm trong `artifacts/customer-review/batch-01-2026-09-14/`, giữ cục bộ theo chính sách repo công khai.

## Nền yêu cầu: checklist v2.1 ngày 14/09/2026

**Bắt đầu từ [checklist triển khai v2.1](meeting-2026-09-13/doi-chieu-2026-09-14/CHECKLIST-TRIEN-KHAI.md).** Giữ các sửa đổi theo 14 phát hiện rà soát và bổ sung thương hiệu thiết bị; giữ nguyên 25 mã công việc, không đánh dấu hoàn thành phần mềm. Đọc nhãn nguồn ở phần 2, điểm còn cần đối chiếu ở phần 13 và quy trình bằng chứng ở phần 11. Các phân tích cũ chỉ lưu truy vết; diễn giải đã được sửa không được dùng để ghi đè bản hiện hành.

**Góp ý mới về thương hiệu:** thiết bị cần có thương hiệu bên cạnh thông số kỹ thuật vì giá có thể khác theo hãng. DM-01/GD-01 đã ghi yêu cầu phân biệt hãng và chọn đúng giá; không gộp giá chỉ vì cùng thông số, không dùng giá hãng cũ khi đổi hãng. TC-07 thêm ca kiểm lắp đặt theo % giá trị thiết bị tương ứng. Lượt v2.1 chỉ cập nhật tài liệu, chưa sửa app/commit/push. Nguyên văn ở nội dung 4 trong [nguồn sau họp](docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt); cách tổ chức dữ liệu/kiểm giá là đề xuất triển khai, không phải khách đã cung cấp bảng giá hay hệ số chênh hãng.

Trọng tâm: cùng cây sản phẩm–cấu kiện–vật tư hiển thị xuyên các bảng; quy ước tách giá/khổ mua; yếu tố/độ phức tạp/giá theo đúng nguyên công và đối tượng; vật tư hoàn thiện sinh theo định mức; công thức liên kết kích thước, bốn loại dòng dễ nhận biết, dữ liệu và tệp ngay khi tạo báo giá. Thuê đã gồm vật tư chỉ loại khoản tiền trùng, không xóa cấu thành. Lắp đặt thiết bị theo %/đơn giá phải rõ công việc và lượng, không tự loại lắp đặt công trình khác phạm vi.

**Kg/TMC/đối thủ là giá đầy đủ:** khoản chỉ chuyển từ phương án tính toán sang đối chiếu không cộng lại. TMC vẫn có công thức và đầu vào thực sự riêng; phải đối chiếu nhánh không TMC, không đóng băng giá hoặc xóa mọi chi phí thành phần. Chưa tự xác nhận giá nhập đã/chưa có thuế, chưa tự phân lớp chi phí lắp đặt thiết bị. Ba điểm cụ thể được theo dõi bằng CĐ-01/02/03 trong checklist, không ngăn làm các mục độc lập đã rõ. Khách nhắc phải có AI; câu hỏi “chờ ổn định cấu trúc...” không phải lịch hoãn đã chốt. Nối AI vào mô hình ổn định là đề xuất kỹ thuật, không đưa ra ngoài giai đoạn báo giá. Xem [nguyên văn và diễn giải đã chỉnh](docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt).

Repo làm việc: `https://github.com/xandrosworld/satthep-truongphat`. URL triển khai người dùng cung cấp: `https://baogia-truongphat.netlify.app/`. Quy trình tiếp theo khi được yêu cầu triển khai: khoảng 5–6 mã liên quan → làm và kiểm local → commit/push → xác định bản Netlify mới → kiểm trực tiếp web thật, chụp bằng chứng theo từng mã. Chỉ sửa tài liệu không tự cấp phép push. Các ca máy chủ/đa người/phân quyền không được coi đạt chỉ từ demo lưu trên trình duyệt.

Hai bản phiên âm mới và bộ bốn đoạn cũ giữ tại [readme-ghiam-13.9.md](readme-ghiam-13.9.md); [trang tra ảnh/clip](meeting-2026-09-13/doi-chieu-2026-09-14/index.html) và [bản rà v1](meeting-2026-09-13/doi-chieu-2026-09-14/RA-SOAT-CHECKLIST-2026-09-14.md) chủ yếu chỉ có trên máy/gói nguồn nội bộ. Clone GitHub không có toàn bộ nguồn: không tự push dữ liệu khách lên repo công khai để sửa link thiếu; không nói đã xem khi chưa có file. Xem phần 12 checklist về gói nguồn và phụ thuộc test hồ sơ bị ignore.

**Lượt cập nhật checklist v2 chỉ sửa tài liệu, chưa sửa/chạy kiểm thử lại ứng dụng, chưa cập nhật URD DOCX/PDF, chưa commit/push và chưa kiểm lại web đang chạy.** Khung hình không thay kiểm chứng tiếng; P1 có dấu hiệu lệch mốc, P2 không có mốc. Chưa nghe xác minh toàn bộ 90 phút; 16 clip không phủ kín cuộc họp. Không tự coi phiên âm, công thức mẫu hay việc sửa checklist là khách đã nghiệm thu. Ứng dụng hướng tới một luồng thống nhất; bảo toàn bản lưu cũ không đồng nghĩa đưa lại hai luồng cho khách lựa chọn.

## Lịch sử trước cập nhật v2 — không phải trạng thái đáp ứng yêu cầu mới

> Ghi nhận lịch sử: **13/09/2026, bản 1.4: xử lý phản hồi khách sau khi xem demo**. Các mốc dưới đây nói về bản/URL được kiểm khi đó, không xác nhận URL triển khai mới ngày 14/09. **Người dùng đã deploy; đã kiểm tra trực tiếp Netlify lúc 16:06 ngày 13/09**, nội dung ứng dụng khớp `dist/index.html` (host chèn thêm thanh công cụ Netlify). **Chưa khách nghiệm thu GĐ1**. Không lấy test cũ làm bằng chứng đã xử lý cuộc họp/góp ý mới.

Kiểm tra bản công khai: [kết quả và cách thử bằng đơn thật](artifacts/customer-review/deployed-2026-09-13/KET-QUA-VA-CACH-THU.md). Đạt 10 tình huống giao diện, không ghi nhận lỗi JavaScript; Excel tải từ web đã kiểm tra người nhận/thông số/tổng. Chỉ thao tác trong phiên trình duyệt riêng; không thử tài khoản hoặc ghi dữ liệu lên API khách. Báo giá mới dùng công thức hiện hành; nhánh giữ dữ liệu cũ vẫn còn, chưa sửa/xóa trong lượt kiểm tra này. Những câu “chưa deploy” bên dưới là ghi nhận trước 16:06. Không coi test dữ liệu minh họa là đối chiếu đơn thật của khách.

## Bản đang chạy 1.4: khách hàng, yêu cầu, chọn giá và dữ liệu cũ

Lượt kiểm tra cuối kết thúc **15:08 ngày 13/09/2026 (giờ Việt Nam)**: `verify:phase1` đạt **13/13 nhóm**; luồng đầu vào mới đạt **11 tình huống**, không ghi nhận lỗi JavaScript trong lượt thử. Đã đối chiếu lại SHA-256 của 92 tệp: không có thay đổi sau kiểm tra; 13 ảnh bằng chứng đều tồn tại. [Cách tự thử bản 1.4](artifacts/customer-review/implemented-2026-09-13/CACH-THU.md). Máy chủ thử cục bộ đã được sao lưu và khởi động lại; Netlify chưa cập nhật.

Nguồn phản hồi và kiểm tra trước sửa: [đối chiếu ngày 13/09](artifacts/customer-review/2026-09-13-feedback-audit.md). Không tiếp tục kết luận “đã đủ luồng” từ ghi nhận cũ: khách đã chỉ ra thiếu đầu vào và giá riêng trong báo giá; một số màn hình còn bị giữ ở cách tính đời cũ khi mở dữ liệu đã lưu.

- **Luồng chính:** Đầu vào khách hàng → Lập báo giá → Khách hàng & yêu cầu → đưa sản phẩm vào cấu thành → công đoạn, khai triển, khối lượng → Giá & hệ số → Phân tích giá → Bản chào. Các bước đều hiện trên thanh điều hướng; không cần dùng ca mẫu để bắt đầu.
- **Khai vật tư:** vật liệu, mác, đặc tính chọn từ danh mục; mác/đặc tính lọc theo vật liệu. Đổi vật liệu bỏ lựa chọn con không còn phù hợp. Có danh mục Đặc tính riêng, quản lý nơi dùng, gợi ý tên theo quy cách và nút “Dùng tên này”; không ghi đè tên đã nhập khi đổi thông số.
- **Khách hàng:** danh bạ có công ty, mã số thuế, liên hệ, điện thoại, email, địa chỉ. Chọn khách đưa bản thông tin riêng vào báo giá. Sửa danh bạ không tự thay bản chào cũ. Tên khách từ dữ liệu cũ vẫn được giữ; cần chủ động chọn hồ sơ để bổ sung liên hệ.
- **Yêu cầu nguồn:** mã/nội dung yêu cầu, sản phẩm và thông số trong một ô, số lượng/ĐVT; nhập từng dòng hoặc dán 4 cột từ Excel. Chọn sản phẩm trống hoặc mẫu để đưa vào cấu thành; chặn đưa lại trùng dòng. Không tự suy diễn kích thước kỹ thuật từ đoạn mô tả; dùng mẫu vẫn phải rà kích thước thực tế. Sửa dòng yêu cầu đã bóc tách không tự sửa cấu thành, giao diện nhắc rà lại.
- **Tệp ảnh/PDF/Excel:** lưu và tải lại tệp gốc, tối đa 10 MB/tệp, 30 tệp/yêu cầu. Chưa OCR/AI/import tự động mọi workbook. Chế độ cục bộ dùng IndexedDB: **sao lưu JSON chỉ có thông tin tệp, phải tải tệp gốc riêng khi chuyển máy**. Chế độ dùng chung lưu tệp tại SQLite qua API có đăng nhập/quyền, không đưa nội dung tệp vào lịch sử hoàn tác hay localStorage. Tệp chưa được quét mã độc; không tự mở/thực thi tệp tải xuống.
- **Giá & hệ số:** một bước riêng trong báo giá, chia Vật tư / Nguyên công và bề mặt / Vận chuyển và lắp đặt / Kg, đối thủ, TMC / Hệ số. Xem giá đang dùng và giá danh mục, chủ động chọn từng mã hoặc lấy giá tham khảo cho tất cả rồi lưu. Giữ quy cách, khổ phôi và các dòng không chọn; không cập nhật giá vào báo giá khác. Cập nhật giá công đoạn từ danh mục chỉ lấy giá/ĐVT, giữ yếu tố, định mức và lựa chọn công việc. Giá riêng/trọn gói tại công việc không bị ghi đè bởi cập nhật bảng.
- **Dữ liệu cũ:** không tự đổi công thức hoặc xóa localStorage. Hiển thị cách tính cũ và kết quả hao hụt cũ cùng lời mời chuyển. Trước khi chuyển có tổng cũ/tổng thử mới; xác nhận sẽ lưu nguyên báo giá cũ và tổng vào `legacyArchives`. Nếu bản cũ đã duyệt, tạo mã mới đuôi `-MOI`. Bản cũ tải lại được từ “Bản lưu trước khi đổi công thức”. Đầu vào thiếu của các phương án vẫn phải được khai, không giả giá bằng 0.
- **Bằng chứng mới:** [trang ảnh kiểm thử](artifacts/customer-review/implemented-2026-09-13/index.html), [kết quả thao tác đầu vào](artifacts/customer-review/implemented-2026-09-13/browser-results.json). Kết quả toàn bộ lần chạy gần nhất: [verification-latest.json](artifacts/phase1-2026-09-12/verification-latest.json); đọc `passed` và từng nhóm, không dựa vào câu cũ trong README.
- **Mã nguồn:** `intake-core.js` (kiểm tra dữ liệu, giá theo mã, chuyển bản cũ), `intake-ui.js` (khách/yêu cầu/vật tư/tệp), `quote-prices-ui.js`, `intake.css`; `server/intake.cjs` (danh bạ có phiên bản và tệp riêng). `conventions-core.js` thêm `characteristics`. `quote.customerInfo` và `quote.request` được giữ trong bản lưu máy chủ; `db.customers` là danh bạ cục bộ. Không nhầm `conventions.customers` (nhóm hệ số) với danh bạ.
- **Chạy lại:** `npm run build`, `npm run test:intake`, `npm run test:intake:ui`, `npm run verify:phase1`. Sửa nguồn, không sửa trực tiếp `dist`. Nếu đang chạy máy chủ bằng mã cũ, khởi động lại để nhận API mới. Các bài kiểm thử dùng SQLite riêng trong bộ nhớ, không tạo tài khoản thử vào dữ liệu thật.
- **Giới hạn còn giữ:** thông số/hệ số mẫu, cần đối chiếu ca thực tế và khách xác nhận; triển khai Internet/HTTPS, quy trình phân quyền thực tế, AI và sản xuất/kho/công nợ không được tự suy ra đã hoàn thành. Tài liệu DOCX/PDF 1.3 bên dưới chưa phải tài liệu cập nhật phản hồi 1.4 này.

## Ghi nhận bản 1.3 trước phản hồi, giữ để đối chiếu

Lượt chốt 13/09: `verify:phase1` đạt 12/12 nhóm; 118 bài bộ tính và 20 bài máy chủ, có ca thao tác từ báo giá trống tới hồ sơ chuyển đơn. Đã sao lưu và khởi động lại máy chủ cục bộ với bản 1.3; chưa khởi tạo tài khoản thật. Không đồng nghĩa khách nghiệm thu hoặc các tích hợp gửi trực tiếp đã hoạt động.

- **Thử nhanh:** mở `dist/index.html`, bấm “Mở ca mẫu để thử”. Bản tự chứa, không cần mạng. Sửa nguồn rồi `npm run build`, không sửa trực tiếp tệp trong `dist`.
- **Thử tài khoản và dữ liệu dùng chung:** Node **24.15.0 đã kiểm tra**, chạy `npm run start:team`, mở `http://127.0.0.1:4174`. Tạo quản trị lần đầu, tự đặt mật khẩu từ 12 ký tự. Chỉ chạy trên máy này; chưa phải môi trường Internet/LAN cho 30–50 người.
- Hướng dẫn ngắn và giới hạn: [02_CACH_THU_VA_VAN_HANH.md](giai-doan-1-2026-09-12/02_CACH_THU_VA_VAN_HANH.md). Trạng thái từng nhóm: [03_TRANG_THAI_VA_VIEC_CON_LAI.md](giai-doan-1-2026-09-12/03_TRANG_THAI_VA_VIEC_CON_LAI.md).
- **Hồ sơ mới:** [Luồng tổng thể và báo giá 1.3 — PDF](giai-doan-1-2026-09-12/01_LUONG_TONG_THE_VA_BAO_GIA_1_3.pdf), DOCX cùng tên; [truy vết đủ 203 mã và 10 nhóm bổ sung](giai-doan-1-2026-09-12/04_TRUY_VET_PHAM_VI_VA_KIEM_THU_1_3.xlsx). Cột H–J sheet 203 mã là trạng thái mới, không tự đánh dấu đạt toàn mã từ một chức năng tương tự. Bản trao đổi, chưa khách duyệt.
- **Đã bổ sung:** bốn cách lấy giá công đoạn (hệ số / danh mục / đơn giá riêng / trọn gói công việc); cơ sở tự tính hoặc lượng riêng; yếu tố số và phân nhóm; nhiều vật tư hoàn thiện, định mức, lớp, hao hụt; vận chuyển theo kg/tấn/m²/m/số lượng/chuyến/km/tấn×km/trọn gói, mức tối thiểu, phạm vi và phân bổ; nguồn mua tách phương án cắt.
- **Bổ sung 1.3:** sáu trạng thái giao dịch độc lập với duyệt nội bộ, gắn phiên bản giá, gia hạn và lịch sử; lọc khách/trạng thái/ngày; phôi đặc thù kg/m hoặc kg/m²; công đoạn và định mức m³; tham số bổ sung; lượt dùng mẫu; giá vật liệu/mác ưu tiên, mốc khôi phục; danh mục giá trị, nơi dùng, chặn xóa, gợi ý mã mới cho quản trị phát hành. Quản trị có thể sửa danh mục khi bản chào đang khóa mà không làm đổi bản đã duyệt.
- **Bảng theo nguồn:** Input Info B:AM đúng 38 cột. `source-core.js` ghi ánh xạ và đơn vị; bảng đầy đủ là chế độ đối chiếu, nhập nhanh vẫn giữ. AK thanh là **kg/m**, tấm ghi rõ kg/m²; AL m²/chi tiết. BC Chao gia AC4:AC22 có 19 dòng kể cả hàng đơn vị, khác ảnh màn hình 21 dòng; bảng mới tách thêm đầu mục theo công thức khách mới nhất, không bịa số dòng nguồn. Vật tư phụ % mặc định 0, chỉ dự tính thêm trên giá phôi, không khai trùng mã/định mức đã có.
- **Bổ sung 1.2 giữ lại:** gói thuê cả cấu kiện/sản phẩm, bên cấp vật tư và công việc sau nhận; công thức lượng thực hiện riêng hoặc quy tắc dùng lại; TMC nhóm tùy khai (9 nhóm mẫu), hao hụt/chi phí riêng, phân rã sản phẩm, chặn phạm vi chồng. Bảng thử đơn giá/ma trận hai yếu tố và XLSX. Bản chào có thông tin đơn vị/người ký, chế độ gửi khách cần duyệt.
- **Lưu và trao đổi:** danh sách nhiều báo giá, bản sao độc lập, lịch sử; Excel `.xlsx` thật tách bản gửi khách và bản nội bộ 7 sheet; bản in có thông số kỹ thuật một ô. Workbook xuất là số liệu tại thời điểm xuất, không phải bộ Excel tự tính khi sửa ô.
- **Máy chủ:** SQLite, phiên đăng nhập, 4 vai trò; kinh doanh chỉ nhận bản giá bán đã duyệt, không nhận giá vốn qua API. Quyền hệ số/duyệt dưới gốc riêng; đổi quyền thu hồi phiên. Danh mục chung có phiên bản; tạo báo giá trống, giữ snapshot giá cũ. Lưu/trình/duyệt/mở lại/chống ghi đè; hồ sơ chuyển đơn bất biến. **Chưa là thực thi sản xuất/kho/công nợ.**
- **Kiểm tra:** bộ tính, máy chủ, thao tác thật trên Edge, hồi quy cuộn/3D/phần dư/toàn trang, PDF và Excel. Thử 50 phiên/50 ghi/50 đọc đồng thời trên Windows localhost, không tính tải đăng nhập và không đại diện Internet thực tế. [Kết quả và giới hạn](artifacts/phase1-2026-09-12/KIEM-THU.md); bằng chứng gắn SHA-256: `verification-latest.json`. Chạy lại `npm run verify:phase1`. Không lấy số test làm bằng chứng đủ phạm vi hoặc nghiệm thu.
- **Phân biệt trạng thái:** [danh sách rà cố định](docs/CHOT_PHAM_VI_BAO_GIA_2026-09-13.md) ghi từng phần mã nguồn và kiểm tra. Chưa triển khai máy chủ/HTTPS thật, chưa cấu hình dịch vụ gửi email/Zalo trực tiếp, chưa khách nghiệm thu. Email hiện là `.eml` nháp có Excel đính kèm; chia sẻ tệp dùng ứng dụng thiết bị, không phải tích hợp API gửi tin. Không dùng các thiếu sót vận hành này để nói phần mềm đã hoàn tất hợp đồng.
- **Nguyên tắc giữ lịch sử:** yêu cầu 05.11 gốc nói đổi tên cả báo giá cũ; bản đang làm đổi theo mã nhưng **bản đã duyệt giữ nguyên**. Đây là điểm cần thống nhất khi đối chiếu, không tự đánh dấu khớp nguyên văn. ERP sản xuất/kho/công nợ/AI vẫn thuộc phạm vi về sau, không suy ra đã làm từ hồ sơ chuyển đơn.
- **Điểm cần kiểm chứng sau:** chạy một ca báo giá thật cùng khách; kiểm đơn vị/mốc TMC; chốt người được xem/sửa/duyệt và điều kiện bản chào thực tế. Không hỏi lại phạm vi giá/kg/TMC/đối thủ, công thức ba lớp, cách nhân hệ số hay lựa chọn chung toàn báo giá đã được khách trả lời.

### Vị trí mã nguồn và dữ liệu

`completion-core.js` và `completion-ui.js`: giao dịch, giá và danh mục; `source-core.js`/`source-ui.js`: 38 cột và đ/kg; `conventions-core.js`/`conventions-ui.js`: danh mục giá trị; `catalog-sync-ui.js`: xem mã mới, phát hành theo quyền. `server/workflow.cjs`: lịch sử giao dịch độc lập; `server/catalog-guard.cjs`: bảo vệ nơi dùng giữa nhiều báo giá. `core.js`: hình học/xếp phôi/cũ. `pricing-core.js`: ba lớp giá, bốn phương án, gọi `work-core.js` và `manufacturing-core.js`. Manufacturing: gói thuê, lượng thực hiện, phân rã TMC. `rate-lab-ui.js`: thử đơn giá/ma trận. Các `*-ui.js`: giao diện; `quote-output-ui.js`: bản chào, `team-access-ui.js`: quyền/danh mục. `server/app.cjs`, `server/access.cjs`, `server/backup.cjs`: máy chủ/lọc dữ liệu/sao lưu. `tools/build.cjs` tạo dist; không sửa dist trực tiếp.

Máy chủ thực dùng `data/truongphat.sqlite`; sao lưu đầy đủ bằng `npm run backup:team` vào `data/backups`. Không đưa thư mục `data` lên Git/Netlify hoặc gửi khách khác. Bản JSON tải từ giao diện quản trị không chứa mật khẩu/phiên, **không thay bản SQLite để khôi phục đầy đủ tài khoản**. Dữ liệu máy chủ đang mở không tự ghi vào localStorage; phải bấm “Lưu máy chủ”. Bản lưu trình duyệt chỉ thuộc trình duyệt/máy đó và có thể mất nếu xóa dữ liệu website.

Mốc ca mẫu trước phản hồi 14/09: tổng sau thuế thử 10% là chi tiết **7.126.053**, TMC **6.765.858**, kg **7.616.070**, đối thủ **7.865.000** đồng. Chỉ giữ để truy vết lịch sử; phải chạy lại sau khi chốt cách TMC là phương án đã gồm toàn bộ chi phí và bổ sung test chứng minh các cấu phần tham chiếu không bị cộng vào kg/TMC/đối thủ.

## Ghi nhận trước bản mở rộng — lưu để truy vết

Các mục dưới giữ nguyên lịch sử, có câu đã lỗi thời như “chưa có backend” hoặc “chưa sửa ứng dụng”. Đọc mục “Bản đang chạy” ở trên trước. Giữ bộ 1.0 và 1.1 làm nguồn; không ghi đè bộ cũ. Đã có bảng truy vết 1.3 giữ nguyên 203 mã/10 nhóm và thêm trạng thái/bằng chứng, chưa nghiệm thu.

## Bổ sung ngày 12/09 — công thức khách xác nhận

Nguồn nguyên văn: [Tin nhắn bổ sung công thức](docs/nguon/2026-09-12-cong-thuc-gia-khach-bo-sung.txt). Nguồn này thay các giả định trước đó về thứ tự và cơ sở hệ số.

1. **Giá sản xuất** = (tiền vật tư + vận chuyển nhập vật tư/thuê ngoài + tiền nguyên công + tiền hoàn thiện bề mặt) × (1 + HS sản xuất) × (1 + HS quản lý) × (1 + HS khác nếu có).
2. **Giá gốc** = giá sản xuất + vận chuyển giao hàng + lắp đặt. Không nhân giao hàng/lắp đặt với hệ số sản xuất. Phân biệt vận chuyển này với vận chuyển nhập/thuê ngoài trong ngoặc ở bước 1.
3. **Giá bán** = giá gốc × (1 + HS lợi nhuận) × (1 + HS xử lý) × (1 + HS đơn hàng) × (1 + HS khách hàng) × các yếu tố thêm nếu có. Hệ số đơn hàng và khách hàng là hai thừa số độc lập; không tự gộp khách hàng vào dự phòng giảm giá.
4. Giá vật tư theo mã và ĐVT, giữ giá tham chiếu hoặc chủ động cập nhật mới. Nguyên công/hoàn thiện có cách tính và giá tương ứng, phân biệt tự sản xuất và thuê ngoài.
5. Khai công đoạn được ở mã vật tư, cấu kiện, sản phẩm. Cấp trên chỉ thêm công việc thực sự phát sinh; khối lượng/số lượng tra hệ số phải đúng đối tượng công việc, không lấy máy móc số lượng cấp cha cho mọi trường hợp. Không cộng lại cùng một việc ở hai cấp.
6. Nguyên tắc chọn một trong bốn phương án **cho toàn báo giá** vẫn giữ. Phản hồi ngày 14/09 bổ sung: kg, TMC và đối thủ là giá đã gồm toàn bộ chi phí; cấu phần từ phương án tính toán chỉ dùng đối chiếu, không cộng lại.

**Trạng thái phần mềm trong lượt này:** đã bổ sung `pricing-core.js`, `pricing-ui.js`, `pricing.css` vào nguồn và build `dist/index.html`. Có bảng nguyên công, định mức vật tư hoàn thiện, so sánh bốn phương án, hệ số bán độc lập và ba lớp giá theo tin mới. Mở mới dùng ca mẫu hai máng cáp; bản lưu cũ giữ cách tính cũ đến khi người dùng chủ động chuyển. **78 kiểm tra tính toán và 14 nhóm giao diện mới đạt**; bốn bộ hồi quy cũ chạy lại với bộ mẫu gốc cũng đạt. Xem [cách thử, kết quả và giới hạn](artifacts/pricing-2026-09-12/KIEM-THU.md). Chưa triển khai lên Netlify. Bộ tính giá cũ trong `core.js` chỉ giữ cho báo giá chưa chuyển; nguồn mới nhất cho chế độ bốn phương án là `pricing-core.js`.

**Cảnh báo hồ sơ cũ:** bộ `urd-truong-phat-2026-09-12/BAN_GUI_KHACH` đã tạo trước tin nhắn này. Thứ tự hệ số, cơ sở vận chuyển/lắp đặt, tác động khách hàng và số kết quả minh họa phải đồng bộ lại trước khi gửi; tên thư mục không có nghĩa là bản sẵn gửi. Các đoạn bên dưới mô tả công việc/lần kiểm tra trước, không tự động mô tả bản demo mới.

**Quy ước demo cần thay:** số hệ số minh họa; các bậc kích thước dùng khoảng liên tiếp đến hết mốc; chi phí chung phân bổ theo kg phôi (không có kg thì theo số lượng). Cách demo cũ dùng giá gốc/cấu phần chi tiết cho kg, TMC và đối thủ không còn đúng với phản hồi 14/09; phải sửa phép tính, không chỉ đổi nhãn. Thuế vẫn là điều kiện thương mại riêng vì khách chưa nói VAT nằm trong “toàn bộ chi phí”. Vận chuyển hiện nhập thành tiền, chưa là bộ tính đầy đủ theo loại khối lượng/đơn vị/chuyến đã trao đổi.

## Đọc trước khi tiếp tục công việc

- Chủ dự án phía triển khai là **Xandro Systems / Mai Tấn Thành**. Khách là **Trường Phát Group**, cần phần mềm báo giá sản xuất cơ khí, sau đó liên thông ERP. Số người sử dụng trao đổi ban đầu: khoảng 30–50.
- Khách đã chuyển tiền theo xác nhận của người dùng trong hội thoại. Chưa có chứng từ ngân hàng được đối chiếu trong lần cập nhật này; không tự suy ra đã nghiệm thu, đã ký bản nào, hoặc ngày bắt đầu dự án chính thức.
- Giai đoạn 1 gồm **chốt nội dung và luồng tổng thể phần mềm + hoàn chỉnh phần báo giá**. Không được hiểu chỉ là làm đẹp demo.
- Yêu cầu trọng tâm: lấy **mã vật tư làm gốc**, tự khai báo công thức/định mức/hệ số, thao tác nhanh trên bảng tổng thể, so sánh bốn phương án giá, rồi xuất báo giá chuyên nghiệp.
- Khách nhấn mạnh Excel để **nắm cấu trúc**; phản hồi mới xác nhận cách tính tương tự `(1+hs1)*(1+hs2)*...`. Các số hệ số là minh họa, khách sẽ tự cân đối sau. Không sao chép số mẫu/lỗi ô Excel thành quy tắc sản xuất.
- Đã nhận phản hồi khách qua người dùng: chọn **một phương án chung cho cả báo giá**; khách đang dựng tính toán trong AppSheet và không tách ra gửi được. Không tiếp tục treo ba câu đã trả lời hoặc đòi bảng tính tách riêng như điều kiện để bắt đầu.
- Đã tạo [URD bản trao đổi 1.0](urd-truong-phat-2026-09-12/BAN_GUI_KHACH/01_URD_LUONG_TONG_THE_VA_BAO_GIA.pdf), có bản Word cùng tên. Đây là luồng tổng thể và mô tả cụ thể phần báo giá; **chưa phê duyệt, chưa phải đặc tả chi tiết đầy đủ từng chức năng ERP**. Các hồ sơ khởi động trước đó không thay URD này.
- Demo hiện có vẫn là ứng dụng chạy tại trình duyệt. Các yêu cầu buổi gặp và Excel **không tự động trở thành chức năng đã triển khai**. Lần cập nhật README này không sửa ứng dụng, không triển khai website, không chạy lại bộ test.

## Nguồn thông tin và cách sử dụng

| Nguồn | Nội dung / giới hạn |
| --- | --- |
| [Bản chép lời buổi gặp 11/09](docs/nguon/2026-09-11-ban-chep-loi-khach-hang.txt) | Bản sao văn bản người dùng cung cấp. Gồm tóm tắt trước, hội thoại sau và ba phần tiếp theo. Chưa nghe audio gốc; lời gỡ băng có thể sai từ hoặc thiếu ngữ cảnh chỉ tay/viết giấy. Ưu tiên phần lời thoại khi phần tóm tắt mâu thuẫn. |
| [Excel xây dựng giá](<12.9/260514 XD phần mềm.xlsx>) | 8 sheet mô tả cấu trúc tính toán. Có công thức, dữ liệu minh họa, lỗi và điểm không nhất quán; không phải bộ kết quả nghiệm thu. |
| [Báo giá bản mã 6 mm](<12.9/260910 TruongPhat BG-BẢN MÃ 6MM MẠ NHÚNG NÓNG -V1.0.xlsx>) | Báo giá đầu ra thực tế, một sheet. Không chứa toàn bộ bóc tách để kiểm chứng giá thành. Khách yêu cầu đề xuất lại hình thức. |
| Tin nhắn khách 12/09, được người dùng dán trong hội thoại | “Hệ số là thay đổi”; “Anh gửi em để em nắm cấu trúc nhé”; “Mẫu bg thì em đề xuất cho a chuyên nghiệp chút”; “Thông số kỹ thuật mình để 1 ô thôi”. |
| Phản hồi mới cho câu hỏi làm rõ, người dùng cung cấp ngày 12/09 | Nguyên văn nghiệp vụ được lưu trong mục “Phản hồi mới” bên dưới. Là nguồn mới nhất cho nguyên tắc hệ số và phạm vi chọn phương án. Không có timestamp riêng kèm đoạn phản hồi này. |
| [Hợp đồng bản ký DOCX](hop-dong-truong-phat-2026-09-10/BAN_KY_CHINH_THUC/HOP_DONG_XANDRO_TRUONG_PHAT_65TR_BAN_KY.docx) / [PDF](hop-dong-truong-phat-2026-09-10/BAN_KY_CHINH_THUC/HOP_DONG_XANDRO_TRUONG_PHAT_65TR_BAN_KY.pdf) | Tài liệu hợp đồng đã soạn trong dự án; cần bản ký thực tế nếu phải xác minh hiệu lực hay điều khoản cuối cùng. Không suy ra có chữ ký chỉ từ tên thư mục. |
| [Ghi nhận yêu cầu 001](khoi-dong-du-an-truong-phat-2026-09-10/GHI_NHAN_YEU_CAU_001_PHAN_TICH_GIA.md) | Ghi nhận trước lần cập nhật này; trạng thái “chờ bảng nhân công” đã cũ vì đã nhận Excel 12/09. Một số tiêu chí là đề xuất, chưa có khách duyệt. |
| [Phiếu làm việc](chuan-bi-gap-khach-2026-09-11/MANG_DI_GAP_KHACH/PHIEU_LAM_VIEC_GIAI_DOAN_1_TRUONG_PHAT.docx), [sổ theo dõi](chuan-bi-gap-khach-2026-09-11/MANG_DI_GAP_KHACH/SO_THEO_DOI_YEU_CAU_TRUONG_PHAT.xlsx) | Bộ chuẩn bị cuộc gặp; chưa đồng bộ toàn bộ nội dung cuộc gặp 11/09 và Excel 12/09. |

Nguồn bản chép lời ban đầu: `C:\Users\DELL\.codex\attachments\4c793da9-5e8d-4d48-80e4-49e2a81632fd\pasted-text.txt`. Bản trong `docs/nguon` giữ nguyên nội dung, chỉ chuẩn hóa xuống dòng khi lưu.

Tài liệu người dùng đã nêu trước đó: `C:\Users\DELL\Downloads\260821 Danh mục chức năng phần mềm (1).docx`; mẫu hợp đồng Xandro–Phước An Kite Coffee trong Downloads. Không dùng thông tin khách ở hợp đồng mẫu làm thông tin Trường Phát. Chưa đọc lại hai file ngoài workspace này trong lần cập nhật 12/09.

Website tham chiếu từng trao đổi: `https://baogia-xandro-truongphat.netlify.app/` (báo giá dịch vụ), `https://demo-banggia.netlify.app/` (demo đã gửi trước), `truongphat.dvqt.vn` (hệ thống cũ của khách). **Đã đăng nhập khảo sát trực tiếp `truongphat.dvqt.vn` ngày 12/09**, phạm vi ở mục khảo sát bên dưới. Hai website Netlify chưa kiểm tra lại ở lần này; không mặc định giống `dist/index.html`. Khách chê hệ thống cũ và chỉ cho xem để hiểu ý tưởng. Không lưu lại mật khẩu truy cập trong README.

Trong phản hồi mới, khách nói đang dựng tính toán trong AppSheet và gửi lại `https://truongphat.dvqt.vn` cùng thông tin đăng nhập trong hội thoại. Đã dùng để khảo sát ở phạm vi chỉ xem; chưa truy cập trình biên tập/công thức nội bộ AppSheet, không kết luận website đang chạy trên AppSheet chỉ từ lời nhắn. Không sửa/lưu/xóa dữ liệu khách khi khảo sát.

## Phạm vi thương mại cần nhớ

Các số dưới đây được đối chiếu với DOCX trong `BAN_KY_CHINH_THUC`, không phải đánh giá pháp lý:

- Bên triển khai: Xandro Systems. Thông tin pháp lý, người đại diện và tài khoản ngân hàng chỉ lưu trong hồ sơ hợp đồng nội bộ, không đưa lên repository công khai.
- Khách: Trường Phát Group. Thông tin pháp lý và người ký chỉ lưu trong hồ sơ hợp đồng nội bộ. Người trực tiếp trao đổi nghiệp vụ không mặc nhiên là người ký.
- Số hợp đồng trong bản đã soạn: **1009/2026-HĐDV.XANDRO-TP**. Giá trọn gói **65.000.000 đồng**; lịch thanh toán **10 + 10 + 22,5 + 22,5 triệu**. Khoản đợt 1 là khoảng **15,38% tổng dự án**. Các mức 48,5 triệu, 25 triệu riêng báo giá, 20 triệu trong ERP và bù 5 triệu thuộc lịch sử thương lượng; không dùng chúng làm tổng giá hiện hành.
- GĐ1 dự kiến **07–10 ngày làm việc**. Toàn ERP dự kiến **04–05 tuần**, **đã bao gồm GĐ1**, tính từ cùng ngày bắt đầu. Điều 3.2 yêu cầu xác nhận ngày bắt đầu bằng văn bản; không tự gán ngày bằng ngày trên file hoặc lời hứa “trong tuần này”.
- Điều 3.2 cũng ghi không coi mọi thiếu sót nhỏ về dữ liệu là lý do trì hoãn toàn bộ dự án. Có thể tiếp tục phần đã rõ khi chờ khách.
- Bản hợp đồng có 203 đầu mục thuộc 27 phân hệ và 10 nhóm bổ sung. Chi tiết phải đọc phụ lục; README không thay thế toàn bộ phạm vi đó.
- Công phát triển AI ảnh/PDF cho cấu kiện đơn giản nằm trong gói; người dùng phải kiểm tra trước khi đưa dữ liệu vào báo giá. Không cam kết tự đọc mọi CAD/3D, DWG/DXF. AI/API và hạ tầng bên thứ ba trả riêng theo điều kiện trong hợp đồng; công bảo hành, bảo trì, hỗ trợ 12 tháng đã nằm trong gói.
- GĐ1 chưa được coi là hoàn tất nếu mới xong demo mà chưa chốt nội dung tổng thể và chưa nghiệm thu báo giá. Chưa có bằng chứng nghiệm thu GĐ1 trong ngữ cảnh hiện tại.

## Nghiệp vụ khách đã xác nhận qua trao đổi

### Mã vật tư, cấu thành và kích thước

- Nhóm vật tư khách nêu: phôi gia công; linh kiện/thiết bị; vật tư tiêu hao; xăng dầu; vật tư phụ.
- Báo giá gồm sản phẩm. Sản phẩm có thể chứa sản phẩm mẫu/con, cấu kiện và mã vật tư trực tiếp. Sản phẩm mẫu cũng có cấu kiện/vật tư; một cấu kiện chứa nhiều mã vật tư. Không ép mọi dòng phải đi qua đủ các cấp.
- Mã vật tư là gốc của bóc tách và giá. Chọn mã phải kế thừa thông tin có sẵn: vật liệu, mác, hình dáng, tiết diện… Ví dụ hộp 40 × 40 × 1,5 thì chỉ cần bổ sung chiều dài sử dụng.
- Hiển thị rõ thông tin từ danh mục và kích thước cần nhập. Không bắt người dùng nhập lại quy cách cố định hoặc hiện các ô không liên quan.
- Khách cần công cụ tự khai báo công thức khai triển, khối lượng, diện tích dựa trên thông số. Câu “không phải đưa toàn bộ” trong bản chép lời là phản hồi việc yêu cầu khách cung cấp hết công thức cố định trước khi làm.
- Ví dụ U khai triển bằng bụng + hai cánh là ví dụ giải thích; chưa đủ để chốt bù chấn, bán kính và mọi trường hợp chế tạo.
- Số lượng phải tính xuyên các cấp. Tách rõ khối lượng phôi sản phẩm, vật tư mua/có hao hụt, phần xử lý ngoài và diện tích hoàn thiện.

### Hao hụt và phần dư

- Phương án chi tiết phải bám từng mã vật tư và kích thước khai triển. Không gán chung hao hụt của toàn sản phẩm làm quy tắc duy nhất.
- Khách muốn chọn phần tàn tấm/thanh có thể tận dụng và chọn có/không đưa giá trị phần đó vào hao hụt để tính giá chào.
- TMC có hệ số hao hụt riêng, được chỉnh. Không đồng nhất TMC với kết quả xếp tấm/thanh của phương án chi tiết.
- Khách đánh giá phần hao hụt và 3D demo cơ bản ổn; vẫn yêu cầu gợi ý để họ lựa chọn. Đây không phải xác nhận mọi công thức hoặc 3D đã nghiệm thu.

### Công đoạn, thuê ngoài và hoàn thiện

- Danh mục công đoạn khai báo sẵn để gọi/chọn: cắt tấm, cắt ống, chấn, uốn, hàn, mài, làm sạch… Danh mục mở, không cố định đúng số cột của Excel.
- Nhóm chính: gia công và hoàn thiện bề mặt. Công đoạn có thể thuộc mã vật tư, cấu kiện, sản phẩm; ví dụ đóng gói/sơn hoàn chỉnh chỉ làm khi đã thành sản phẩm.
- Khách nói công đoạn cấp cấu kiện “nếu phức tạp quá mình có thể bỏ”, rồi “sau này mình bàn tiếp”. Đây là điểm có thể bàn ưu tiên, **chưa phải quyết định loại bỏ**.
- Màn hình tổng thể phải thấy các dòng và các cột công đoạn để rà soát thiếu sót, tích nhanh. Mặc định làm tại xưởng, chọn thuê ngoài ở đúng phần cần thuê. Việc mở từng dòng để khai báo riêng là điểm khách chê.
- Thuê toàn sản phẩm: quan tâm đầu ra cuối. Thuê cấu kiện: quan tâm mức hoàn thiện và ai cấp vật tư. Thuê công đoạn: có thể cắt/chấn trong xưởng, mạ ngoài rồi về hoàn thiện. Phần tính giá phải tránh cộng trùng khoản đã bao gồm trong báo giá thuê ngoài.
- Cách tính công đoạn: theo kg, m², giá nhập trực tiếp/trọn gói hoặc giá gốc nhân các hệ số tác động; kích thước, số lượng, độ phức tạp có thể ảnh hưởng giá. Bảng ngưỡng và hệ số cụ thể còn cấu hình/kiểm chứng.
- Chọn hoàn thiện sơn/mạ phải phát sinh dòng vật tư tiêu hao tương ứng theo định mức, khối lượng/diện tích. Tách vật tư sơn với công thực hiện. “Sinh mã vật tư sơn” cần hiểu là xuất hiện vật tư tương ứng trong bóc tách; chưa có yêu cầu tạo mã danh mục mới mỗi lần tính.
- Giá vật tư từ lần trước được gợi ý; nếu chưa có thì nhập mới. Gợi ý không có nghĩa tự ghi đè các báo giá cũ.

### Cấu trúc giá và bốn phương án

- Khách phân biệt giá sản xuất với giá bán. Giá sản xuất gồm vật tư, công đoạn, vận chuyển phôi/đi gia công, quản lý và chi phí chung. Giá chào bổ sung lợi nhuận, xử lý, hệ số khách hàng, vận chuyển giao hàng, dự phòng và các khoản được khai báo thêm.
- Khách yêu cầu tự chỉnh công thức, cơ sở tính, hệ số và thêm khoản chi phí trong các tầng đã trao đổi. Điều này không phải cam kết một trình lập trình tùy ý hoặc hỗ trợ mọi hàm Excel.
- Phản hồi mới xác nhận nguyên tắc tác động hệ số nối tiếp: giá trị cơ sở × `(1+hs1)*(1+hs2)*...`. Số liệu cụ thể khách tự cân đối sau. Nếu giao diện nhập phần trăm thì phải quy đổi nhất quán (ví dụ 5% thành 0,05 khi đưa vào biểu thức); ví dụ này là quy ước triển khai cần thể hiện rõ, không phải mức hệ số khách chốt. Không suy ra mọi khoản tiền cố định/thuế/vận chuyển đều nhân cùng một chuỗi hoặc mọi tham chiếu ô Excel đều đúng.
- Vận chuyển tách nhập vật tư, phục vụ thuê ngoài, giao hàng. Cần nhóm vật tư theo nhà cung cấp/nguồn mua để tính; có cách tính theo khối lượng, khoảng cách hoặc cơ sở khác được khai báo.
- Bốn phương án: (1) bóc tách/tính chi tiết; (2) TMC, khác chủ yếu ở nhân công và hao hụt theo bảng; (3) kg phôi sản phẩm × đơn giá/kg nhập; (4) giá đối thủ nhập riêng từng sản phẩm.
- Bảng so sánh phải nhìn đồng thời tỷ lệ, giá trị, chi phí và phần còn lại để lựa chọn giá chào. Không nhập lại toàn bộ cấu thành cho từng phương án.
- Khách đã mô tả nhập mức 35.000, 40.000 hoặc 50.000 đồng/kg tùy tình huống; không cần hỏi lại liệu phương án kg có được nhập giá trực tiếp hay không. Cơ chế bảng giá gợi ý là chi tiết bổ sung, chưa chốt.
- Đã chốt chọn **chung một phương án cho cả báo giá**. Đơn giá/kg và giá đối thủ vẫn có thể là dữ liệu của từng sản phẩm; điều này không đồng nghĩa được chọn trộn phương án giữa các dòng. Khả năng điều chỉnh giá theo tình huống đã được nêu; cách thao tác/duyệt cụ thể vẫn cần thống nhất.

### Đầu ra và liên thông ERP

- Mẫu báo giá gửi khách do Xandro đề xuất lại cho gọn, chuyên nghiệp. Yêu cầu mới 12/09: **thông số kỹ thuật trong một ô**. Cách hiểu để thiết kế là một ô mô tả trên mỗi dòng sản phẩm; dữ liệu kích thước bên trong vẫn tách để tính.
- Chi tiết VAT, vận chuyển, lắp đặt, hiệu lực và thanh toán phải khớp giữa bảng số và ghi chú. Không dùng thuế suất mẫu như kết luận pháp luật hoặc mặc định cho mọi báo giá.
- Chi phí thực tế sau triển khai gắn mã đơn hàng, lệnh sản xuất và đầu mục chi phí để phân bổ/đối chiếu với dự kiến. Chênh lệch phục vụ báo giá sau, không sửa lại giá đã chào cho đơn cũ.
- Cách lấy chi phí thực tế từ từng chứng từ và tiêu thức phân bổ cuối cùng chưa chốt. Cần nằm trong luồng ERP tổng thể; không tự mở rộng phần phải hoàn tất của GĐ1 thành toàn bộ kế toán giá thành.

## Excel 12/09: bằng chứng và các điểm cần kiểm chứng

### Bản đồ workbook xây dựng giá

| Sheet | Vai trò quan sát được |
| --- | --- |
| `Input Info` | Nhập sản phẩm/dòng cấu thành, vật liệu, hình dáng, kích thước, hao hụt, công đoạn, số lượng; kiểm tra dữ liệu. |
| `Input VL` | Giá vật tư/hoàn thiện, vận chuyển ba loại, lắp đặt và giá đối thủ. |
| `Data` | Dữ liệu tra cứu, giá công đoạn, hệ số tác động, phân loại khách, bảng TMC. |
| `XD Gia` | Tính khối lượng, diện tích, chi phí và giá bán. |
| `Quy uoc` | Danh mục và quy ước thông số theo kiểu dáng. |
| `BC Chao gia` | Tổng hợp cấu thành và bảng phân tích chi phí. |
| `Output` | Bốn phương án theo từng sản phẩm; đây là nơi có đủ 4 PA, không phải mọi sheet đều có đủ. |
| `BÁO GIÁ (2)` | Mẫu trình bày báo giá cũ trong workbook, độc lập với báo giá bản mã 6 mm. |

### Công thức quan sát được — nguyên tắc đã chốt, từng ô vẫn cần kiểm chứng

- `XD Gia!AD4 = AE4*(1+R4)`: vật tư có hao hụt từ khối lượng phôi và tỷ lệ của dòng. Đây là công thức Excel, không thay thế yêu cầu chọn phần dư.
- `XD Gia!BZ3`: chi phí chung = `(BP3+BQ3+BR3+BS3+BV3+BW3+BY3)*BZ2`. Các khoản lần lượt là vật tư, vật tư phụ, chi tiết khác, nhân công, hoàn thiện, vận chuyển nội bộ, lắp đặt.
- `XD Gia!CC3`: quản lý = `(BP3+BQ3+BS3+BV3+BW3+BY3+BZ3)*CC2`. Không có `BR3` trong cơ sở này; không tự sửa hoặc mặc định đúng trước khi thống nhất.
- `XD Gia!CJ4`: đơn giá bán = `CD4*(1+CF2)*(1+CG2)*(1+CH2)*CI2/AW4`; tức nhân nối tiếp lợi nhuận, xử lý, dự phòng rồi hệ số khách hàng. Đây khác công thức biên lợi nhuận của demo hiện có.
- `Data!AH17:AI17` ánh xạ khách “Ổn định” sang **3**, được đưa vào `CI2` và nhân trực tiếp trong công thức bán. **Khách đã xác nhận hệ số chỉ để minh họa, số cụ thể cân đối sau**. Câu hỏi về ý nghĩa các số mẫu đã đóng; không tự đổi thành 3% hoặc chốt nhân ba trong cấu hình thật. Biểu thức Excel nhân thẳng `CI2` cần được phân biệt với hệ số tăng thêm `hs` trong công thức mới `(1+hs)` khi thiết kế trường nhập.
- `Output!M4` là ô nhập đơn giá/kg; `N4 = D4*F4*M4` với số lượng × khối lượng phôi một sản phẩm × đơn giá/kg. Ô trống hiện cho tổng 0 qua công thức, không có nghĩa miễn phí.
- `XD Gia!AS4` tra ngưỡng kích thước bằng `XLOOKUP(...,1)` với nhánh vượt mốc lớn nhất lấy dòng cuối; `AT4` nhân chiều dài/1000 cho nhóm thang/máng/nắp, các nhóm khác giữ giá/cái. Đây là chứng cứ cách tra hiện có, không phải khách đã duyệt mọi bảng/ngưỡng.
- Bảng Excel hiện có các mốc thử **10, 20, 30, >30** và nhóm **1–6**; ảnh chat trước có **100, 500, 1.000, >1.000**. Không tự coi hai bộ là một hoặc thay thế nhau. Khách đã nói các mốc/hệ số thay đổi.

### Những chỗ không được sao chép máy móc

- Kết quả lưu sẵn trong workbook có **12 ô `#VALUE!` ở `Data`** (AL20–AL29, AL40, AL42) và **4 ô `#N/A` ở `XD Gia`** (E104, M104, N104, O104). Đây là kết quả cache đã đọc, không phải tuyên bố đã tính lại/kiểm chứng mọi công thức trong Excel.
- `XD Gia!BV4` đang nhân khối lượng `BB` với đơn giá hoàn thiện `AU`, trong khi tiêu đề đơn giá ghi VND/m². Cần kiểm chứng cơ sở khối lượng/diện tích.
- `XD Gia!BC4` nhân số lượng với `AH4`, mà tiêu đề `AH` là tỷ lệ vật tư phụ, rồi tổng hợp như kg. Cần xác định cơ sở của định mức, không coi số đó là khối lượng chuẩn.
- `XD Gia!CK4` chia đơn giá sản phẩm cho `AE4` (phôi của dòng), trong khi `Output!H4` chia cho khối lượng phôi cả sản phẩm `F4`; kết quả có thể khác. Phương án kg phải bám phôi sản phẩm đã xác nhận.
- `XD Gia!CE4` (giá gốc TMC) không có dòng quản lý `CC4` như `CD4`. Công thức TMC, hao hụt riêng và cơ sở chi phí cần rà soát, không mặc định tương đương phương án chi tiết.
- Chi phí xử lý xuất hiện cả trong hệ số tăng giá và dòng trừ khi phân tích “Còn lại”. Điều này **chưa đủ kết luận bị tính hai lần**: có thể là tính thu vào và phản ánh chi ra. Cần làm rõ ý nghĩa và cơ sở tính. Kết luận trước trong hội thoại chỉ là nghi vấn.
- Vận chuyển giao hàng có đường tính riêng (`CP3`) và tham gia bảng phân tích; cần xác nhận có cộng vào tổng chào hay trình bày riêng, tránh cộng lặp/thiếu.
- Thiếu giá được một số công thức chuyển thành 0. Phần mềm cần phân biệt chưa nhập giá và giá 0 chủ động; dữ liệu mẫu không phải bộ kiểm thử đã duyệt.
- Tên mô tả trong Excel được ghép để tra cứu. Phần mềm vẫn phải có mã vật tư ổn định; không lấy chuỗi mô tả có thể sửa làm định danh duy nhất.

### Báo giá bản mã 6 mm

- Sheet `báo giá`: dòng 21 có 2.000 × 40.000 = 80.000.000; dòng 22 có 118 × 28.000 = 3.304.000. Tiền hàng 83.304.000, VAT mẫu 8.330.400, vận chuyển 1.800.000 ghi “Không VAT”; tổng 93.434.400 đồng.
- Đây là số trên chứng từ mẫu của Trường Phát bán hàng cho khách của họ, **không phải tiền hợp đồng Xandro–Trường Phát**. Tài khoản TPBank trên mẫu cũng không phải tài khoản nhận thanh toán Xandro.
- Cột thông số trong mẫu này đang tách dài/rộng/dày/vật liệu; yêu cầu mới là gộp ô khi trình bày. Mẫu ghi chú “giá đã bao gồm VAT” trong khi bảng còn cộng VAT, và điều kiện giao kho trong khi có phí giao hàng. Cần viết lại nhất quán.
- Lần xuất PDF kiểm tra trên máy này bị chia ngang thành 2 trang, cột thành tiền sang trang sau. Đây là kết quả xuất với môi trường/thiết lập lúc kiểm tra, không phải bằng chứng mọi máy đều in như vậy. Bản render ở `artifacts/analysis-12.9` nếu còn; không phải mẫu mới để gửi khách.

## Phản hồi mới — ba câu đã có câu trả lời

Nguyên văn phần nghiệp vụ khách trả lời, được người dùng cung cấp trong hội thoại ngày 12/09 (không lưu mật khẩu):

> 1. Cách tính chi phí em tham khảo file demo anh gửi cũng rõ ràng em ạ. Cách tính tương tự như công thức tính hệ số đơn giá theo các yếu tố
>    =(1+hs1)*(1+hs2)*.....
> 2. Hệ số là để minh họa. Còn số liệu cụ thể sau này a cân đối
> 3. So sánh thì chọn chung cho cả báo giá
> 4. Anh đang dựng tính toán trong AppSheet nên ko tách ra gửi em được

| Nội dung đã hỏi | Kết luận được dùng tiếp |
| --- | --- |
| Cách áp các hệ số | Nhân nối tiếp theo `(1+hs1)*(1+hs2)*...`, tham khảo cấu trúc demo/file khách. Không dùng cộng tỷ lệ hoặc biên lợi nhuận theo giá bán của demo Xandro như mặc định đã được duyệt. |
| Ý nghĩa số 2, 3, 4… trong mẫu | Minh họa; khách cân đối số cụ thể sau. Cho phép cấu hình, không hỏi lại cùng câu. |
| Phạm vi chọn phương án | Chọn chung toàn báo giá, không chọn trộn từng sản phẩm. |
| Bảng tính tách riêng | Khách không tách được từ AppSheet; đã gửi lại website tham chiếu. Không coi đây là điều kiện ngăn tiếp tục phần đã rõ. |

Bước kiểm chứng tiếp theo: Xandro dựng một ví dụ tính từ dữ liệu đã nhận, thể hiện cơ sở, từng khoản và kết quả để khách kiểm tra. Nếu cần đối chiếu thêm, xem ứng dụng tham chiếu hoặc nhờ khách thao tác một ca cụ thể; không tiếp tục yêu cầu họ xuất toàn bộ công thức. Ví dụ do Xandro dựng chưa được coi là kết quả chuẩn cho đến khi khách xác nhận.

Các chi tiết vẫn phải chốt khi thiết kế/kiểm thử: giới hạn công cụ công thức và các biến/hàm cần dùng; đơn vị/định mức sơn mạ; xử lý vật tư cấp cho thuê ngoài; giá thuê đã gồm gì; làm tròn; thông tin và điều khoản xuất báo giá; quyền sửa giá/xem lợi nhuận/duyệt; bộ dữ liệu và người xác nhận nghiệm thu. Các ngưỡng lợi nhuận tối thiểu, cấm bán dưới giá vốn, phiên bản cấu hình là điểm cần đề xuất/thống nhất, chưa phải khách đã chốt.

Không nên hỏi lại cấu trúc mã vật tư, quyền tự chỉnh công thức/hệ số, phép nhân nối tiếp, ý nghĩa số mẫu, chọn chung phương án, phương án kg có nhập giá không, giá đối thủ có theo từng sản phẩm không, hoặc đề nghị giữ nguyên mẫu báo giá cũ — các ý đó đã được trả lời.

## Khảo sát trực tiếp web tham chiếu ngày 12/09

Đã đăng nhập bằng tài khoản khách cung cấp, mở Đơn giá đầu vào → Nguyên công & hệ số, Danh mục quy ước, danh sách báo giá và chi tiết/phân tích báo giá `BG-2026-0196` (đã duyệt, giao diện thông báo chỉ xem). Chỉ điều hướng và đọc; không đổi ô dữ liệu, checkbox, trạng thái, không tạo/lưu/xóa chứng từ. Đây là khảo sát, không phải kiểm thử toàn hệ thống hoặc xác nhận số liệu chuẩn.

### Công thức yếu tố tác động — ảnh khách gửi khớp tab trên web

- Khách bổ sung ảnh và lời “Công thức áp dụng đối với các yếu tố tác động”. Trên tab Nguyên công & hệ số thấy đúng `Đơn giá áp dụng = Giá gốc × (1+kYT1) × (1+kYT2) × … × (1+kYTn)`.
- Đây trực tiếp là cách sinh **đơn giá nguyên công**. Sau đó tiền công phụ thuộc cơ sở tính kg, m², lần… Không đồng nhất phép nhân ra đơn giá với toàn bộ thành tiền báo giá, không áp mọi hệ số lên mọi khoản.
- Theo mô tả trên web: mỗi yếu tố liên kết đúng một tham số đầu vào; giá trị rơi vào khoảng/nhóm nào thì lấy hệ số của khoảng/nhóm đó. Cùng một yếu tố có bảng hệ số riêng theo từng nguyên công. Ví dụ chiều dày ảnh hưởng đến cắt khác hàn.
- Thư viện đang hiển thị: YT1 tổng số cấu kiện; YT2 chiều dày; YT3 vật liệu; YT4 độ phức tạp; YT5 chiều rộng W; YT6 thông số cấu kiện; YT7 hoàn thiện bề mặt; YT8 diện tích bề mặt. Bảng số theo khoảng từ–đến; nhóm vật liệu/hoàn thiện theo danh sách. Đây là cấu hình quan sát, không giới hạn danh mục vào đúng 8 yếu tố.
- Bảng tổng thể tích yếu tố theo nguyên công: Cắt tấm dùng YT1–YT6, Cắt ống dùng YT1/YT2, Chấn dùng YT1/YT2/YT5… Đã đọc trạng thái hiển thị, không tích thử.
- Giá gốc quan sát: cắt tấm 10.000 đ/kg, cắt ống 12.000 đ/kg, chấn 52.000 đ/lần, làm sạch 8.000 đ/m². Các số này không phải giá sản xuất đã chốt; khách nói số minh họa.
- Web mô tả có thêm cách cộng dồn/công thức tự gõ; chưa kiểm chứng thực thi, chưa mặc nhiên coi mọi tính năng của web cũ là phạm vi đã duyệt.
- Bấm nút mở ma trận Cắt tấm đổi tiêu đề thành “Ma trận yếu tố chi phí nhân công”, nhưng phần nội dung quan sát vẫn giữ bảng Nguyên công & hệ số. **Chưa đọc được các hàng ngưỡng/hệ số riêng của ma trận**; không tuyên bố đã kiểm thử bộ tra bậc. File ảnh tên `old-site-factor-matrix` ghi lại trạng thái này, không chứng minh ma trận đã mở đầy đủ.

### Khác biệt cần giữ rõ với bảng giá bán

- Trong **một báo giá đã xem** (`BG-2026-0196`), màn Phân tích giá ghi: `Giá bán đề xuất = Giá gốc × (1 + % lợi nhuận) / (1 − % xử lý − % dự phòng)`. Công thức hiển thị này khác phép nhân nối tiếp trên tab nguyên công và khác Excel; không dùng nó âm thầm thay yêu cầu khách vừa nhắn.
- Lời nhắn khách xác nhận cách tính chi phí tương tự hệ số nhân nối tiếp. Ảnh mới minh họa trực tiếp nguyên công; vẫn phải trình bày tách cấu hình đơn giá công đoạn và cấu trúc giá bán trong URD, đối chiếu một ví dụ cụ thể ở nơi các nguồn khác nhau. Không hỏi lại phép nhân đã rõ, không coi mọi công thức web cũ là đáp án.
- Màn so sánh của báo giá đã xem có **3 dòng**: tính toán, kg, đối thủ; không thấy TMC ở màn đó. **Yêu cầu khách vẫn là 4 phương án, chọn chung toàn báo giá**. Không suy ra TMC bị loại hoặc khẳng định cả website không có TMC.
- Phân loại khách trên tab hệ số được mô tả là cộng vào dự phòng giảm giá (ví dụ Ổn định 0%, VIP −2%), khác Excel nhân thẳng số 3. Đây là quan sát cấu hình của web cũ, không thay câu trả lời khách rằng số mẫu chỉ minh họa.
- Màn chi tiết đã xem thể hiện nhóm sản phẩm, cấu kiện, vật tư; các nhóm cột kích thước, nguyên công, hoàn thiện, hao hụt, kết quả. Danh mục quy ước có trường công thức và loại đầu ra mm/kg/m²… Có các mục chưa thiết lập hoặc số thử; không sao chép làm bộ dữ liệu đúng.
- Trang Đơn giá đầu vào có mô tả đầu trang rằng chỉ khai giá vật tư tại đây, nhưng tab Nguyên công & hệ số vẫn có bảng giá/hệ số. Nhận xét ban đầu trong commentary rằng web “khác ảnh” là do đang ở tab Giá vật tư; **đã tìm thấy đúng nội dung ảnh khi chuyển tab**.

Bằng chứng ảnh nội bộ: [tab nguyên công và hệ số](artifacts/old-site-factors-2026-09-12.png), [chi tiết báo giá](artifacts/old-site-quote-detail-2026-09-12.png), [phân tích giá](artifacts/old-site-price-analysis-2026-09-12.png). Không đóng gói các ảnh dữ liệu của hệ thống khách vào bản demo công khai.

## Việc tiếp theo và trạng thái thực hiện

| Việc | Trạng thái đến lần cập nhật này |
| --- | --- |
| Đọc bản chép lời và Excel 12/09 | Đã phân tích; các kết luận và giới hạn lưu ở trên. |
| Nhận trả lời 3 câu | **Đã nhận** qua người dùng; nguyên văn và kết luận ở mục trên. |
| Xem lại hệ thống tham chiếu | **Đã đăng nhập và khảo sát** tab đơn giá/hệ số, danh mục quy ước, chi tiết/phân tích một báo giá; giới hạn và bằng chứng ở mục trên. Chưa xem trình biên tập AppSheet. |
| Cập nhật URD | **Đã tạo bản trao đổi 1.0**, 10 trang, PDF/Word. Luồng tổng thể và phần báo giá đã mô tả; các phân hệ ERP còn lại cần đặc tả chi tiết theo tiến độ. Chưa được khách duyệt. |
| Ví dụ tính xuyên suốt | **Đã dựng ca minh họa M01** theo cấu trúc nghiệp vụ đã nhận, Excel và thuyết minh 3 trang; đã đối chiếu số độc lập. Không phải sao chép đáp án thật từ Excel khách, chưa được khách xác nhận làm mẫu nghiệm thu. |
| Mẫu báo giá chuyên nghiệp, thông số một ô | **Đã tạo mẫu 1 trang PDF/Word** và sheet đầu ra trong bộ tính; số khớp M01. Đây là mẫu Trường Phát gửi người mua, không phải báo giá tiền dịch vụ Xandro hoặc bản thương mại được duyệt. |
| Bốn PA, cấu hình mở, bảng công đoạn và vật tư hoàn thiện | Là yêu cầu cần đối chiếu/triển khai. Chưa có kiểm chứng demo đáp ứng đầy đủ buổi gặp. |
| Chi phí thực tế / ERP | Phải mô tả liên thông trong luồng tổng thể; chưa triển khai thực. |

Khi nhận phản hồi: ghi lại ngày và nguyên văn/nguồn, giải quyết từng câu đang mở, cập nhật README và tài liệu liên quan rồi mới đổi trạng thái. Không tự chốt câu trả lời do khách bận hoặc im lặng. Việc khách nói hệ số thay đổi không miễn bước kiểm thử công thức bằng một cấu hình mẫu đã xác nhận.

## Bộ hồ sơ trao đổi 1.0 đã tạo ngày 12/09

Thư mục chính: [urd-truong-phat-2026-09-12](urd-truong-phat-2026-09-12). Đọc [hướng dẫn nội bộ](urd-truong-phat-2026-09-12/DOC_TRUOC_NOI_BO.md) trước khi gửi hoặc sửa tiếp.

| File trong `BAN_GUI_KHACH` | Nội dung và giới hạn |
| --- | --- |
| `01_URD_LUONG_TONG_THE_VA_BAO_GIA.pdf` / `.docx` | 10 trang; xem trước trang 4 luồng thao tác, 7 phân tích giá, 10 điểm cần chốt. Phân biệt yêu cầu đã rõ với cách thực hiện đề xuất. |
| `02_BO_TINH_DOI_CHIEU.xlsx` | 8 sheet; 275 công thức đã được Excel tính lại. Ca hai sản phẩm, sơn tại xưởng/mạ ngoài, phần dư, TMC, kg và đối thủ; chọn chung toàn báo giá. Có tỷ lệ và tiền từng nhóm chi phí trên sheet so sánh. |
| `02_THUYET_MINH_BO_TINH.pdf` / `.docx` | 3 trang giải thích ca M01 từ đầu vào, phương án cắt, hao hụt, công đoạn, giá gốc đến giá chào. |
| `03_MAU_BAO_GIA_GUI_NGUOI_MUA.pdf` / `.docx` | Mẫu đầu ra 1 trang, một ô thông số; đúng tiền ca M01, không in chi phí/lợi nhuận nội bộ. Số và điều kiện đang minh họa. |
| `04_THEO_DOI_203_CHUC_NANG_VA_10_BO_SUNG.xlsx` | Giữ nguyên văn 203 mã + BS01–BS10 từ hồ sơ hợp đồng, đối chiếu từng nội dung; có vị trí mô tả trong URD, trạng thái, ca thử và lịch nhóm. Không biến việc giữ đủ mã thành đã đặc tả/triển khai đủ chức năng. |

Ca M01 do Xandro dựng, **không phải số sản xuất thật được khách xác nhận**:

- Hai máng 300 × 50 và 200 × 50, dài 2.000 mm, dày 1,5 mm, mỗi loại 10 cái; hình học chưa bù chấn/lỗ/cạnh. Khối lượng phôi 164,85 kg; mua 6 tấm tổng 220,78125 kg; giữ lại 50,04375 kg; phần không giữ 5,8875 kg. Giả định cắt xén mạch cắt 0, chưa phải phương án chế tạo/tối ưu công nghiệp.
- Giá bán trong mẫu: trực tiếp chưa giao hàng → chung 2% → quản lý 3% → đặc thù 0% → gốc → lợi nhuận 10% → xử lý 3% → dự phòng 5%. Đây là **cơ sở và số giả định đem đối chiếu**, không tự coi mọi khoản đã được khách chốt. Khách hàng trung tính, chưa ép cách tác động phân loại. TMC chỉ thay phôi và cắt/chấn trong ca minh họa, cần chốt phạm vi bảng nhân công thật.
- Giá chốt chi tiết: A 320.398, B 299.953 đ/cái; tiền hàng 6.203.510; giao hàng riêng 200.000; trước thuế 6.403.510; thuế giả định 10% = 640.351; tổng 7.043.861 đồng. TMC 6.724.135, kg 7.836.070, đối thủ 8.085.000 đồng cùng điều kiện thử. **Không dùng thuế mẫu làm kết luận thuế suất thực tế.**
- Excel chỉ minh họa một cấu hình: chưa có bộ tra ma trận động, bộ xếp tấm tự động, phân quyền hoặc nguồn chi phí thực tế ERP. Các số hình học thuộc ca cố định; ô xanh là giá/hệ số/lựa chọn để thử.

Kiểm tra hồ sơ: Word xuất PDF 10 + 3 + 1 trang; đã xem ảnh render. Excel tính lại, thay lựa chọn cả 4 PA và chính sách phần dư, khôi phục đầu vào M01. Script kiểm tra **110 kiểm tra đạt, 0 lỗi**, gồm số học, cache công thức, nội dung phạm vi, số trên PDF và khổ trang. Đây không phải 110 ca kiểm thử ứng dụng hoặc nghiệm thu khách. Bằng chứng trong `KIEM_TRA_NOI_BO/verification-report.json` và `excel-live-tests.json`.

Cần chốt tiếp qua bộ mẫu: C01 cơ sở từng khoản/khách hàng; C02 phạm vi và bậc bảng TMC; C03 quy cách thực/định mức sơn mạ/thuê ngoài; C04 bản xuất, làm tròn và ánh xạ lưới 38 cột/cơ cấu 21 dòng; C05 đầu mối, quyền, lịch kiểm tra. **03.20 đã cho sửa giá chốt; 03.21 đã yêu cầu cảnh báo dưới gốc** — không hỏi lại có cần hai chức năng đó không. Chưa có xác nhận ánh xạ từng cột/dòng cuối cùng.

Công cụ sinh/kiểm tra: `tools/build-urd-pack.py`, `tools/export-urd-pack.ps1`, `tools/verify-urd-pack.py`. Chạy lại sẽ ghi đè file do công cụ sinh, nên phải giữ riêng bản Word/Excel đã được sửa tay. Không sửa file nguồn khách/hợp đồng. Chưa gửi tin/tài liệu ra ngoài; không đổi code ứng dụng hay website trong đợt này.

## Quy tắc bàn giao cho người hoặc bot mới

- Phân biệt **lời khách**, **hành vi Excel**, **đề xuất Xandro**, **hành vi code** và **kết quả đã kiểm thử**. Không chuyển một nhóm thành nhóm khác nếu chưa có bằng chứng.
- Ngữ cảnh chat mới có thể làm rõ nghiệp vụ; thay đổi thương mại phải đối chiếu hợp đồng/bản ký. Nếu nguồn mâu thuẫn, giữ câu hỏi mở và nêu đúng mâu thuẫn, không tự chọn số thuận tiện.
- Không tuyên bố đã nghe audio, đã đăng nhập website cũ, đã deploy, đã gửi tin, đã hoàn tất URD, đã được khách duyệt hay “đảm bảo khách ưng 100%” nếu không có bằng chứng tương ứng.
- Các phản hồi cũ khẳng định “5 câu là đủ” đã được điều chỉnh sau khi đọc lại bản ghi. Ba câu mới đã có trả lời trong mục phản hồi; tiếp tục cụ thể hóa/kiểm chứng, không phục hồi checklist dài hỏi lại khách.
- Hồ sơ này có thông tin doanh nghiệp, hợp đồng và bản chép lời nội bộ. Chỉ đóng gói nội dung cần gửi khách; không công khai toàn workspace/README/tệp nguồn trao đổi cùng demo.
- Người dùng muốn tiếng Việt tự nhiên, dễ hiểu, ngắn gọn. Chủ động làm phần đã được giao; khi báo trạng thái phải nói rõ đã làm tới đâu. Không yêu cầu xác nhận lặp lại, không tự gửi tin cho khách.

## Demo hiện có — hướng dẫn và giới hạn kế thừa

Phần dưới giữ lại hướng dẫn demo đã có trước cập nhật nghiệp vụ 11–12/09. “Đã thực hiện” trong phần này nói về **demo**, không phải đáp ứng đầy đủ hợp đồng. `core.js` hiện tính giá bằng `cost/(1-margin/100)` với chi phí chung trên chi phí trực tiếp; Excel dùng hệ số nối tiếp. Chưa đồng nhất hai cách tính và không được xem biên lợi nhuận demo là công thức khách đã chốt.

Mở **dist/index.html** bằng Chrome hoặc Edge. Đây là bản đóng gói một file, chạy được không cần mạng. Thư mục `dist` cũng có thể đưa lên hosting tĩnh. Chưa xác minh bản triển khai công khai mới tương ứng với mã nguồn hiện tại.

File `index (1).html` là bản gốc, được giữ nguyên. Bản mới kế thừa bộ nhận diện xanh/trắng và các bước khai triển, hao hụt, tính giá, xuất báo giá. Dữ liệu, bộ tính và hình học 3D được tổ chức lại để bám theo mã vật tư.

## Kịch bản mở đầu 90 giây: chứng minh tiết kiệm thao tác

1. Mở **Bảng nhập nhanh**. Nói: “Em lấy vật tư làm gốc. Những thông tin mã đã có thì anh không phải nhập lại.”
2. Đổi **Rộng W chung** từ 300 thành 400 và Tab. Chỉ ra: thân + nắp đổi cùng lúc; tên sản phẩm, khai triển và giá tự tính lại. Không phải mở từng cấu kiện.
3. Bấm **Tạo biến thể**, đổi W và số lượng. Sản phẩm mới giữ cấu thành, công thức, nguyên công; sản phẩm nguồn không đổi.
4. Bấm **+ Cấu kiện**, đặt tên “Giá đỡ”, để bật bước chọn vật tư. Tạo xong sẽ mở ngay giỏ của cấu kiện đó: chọn PH-H402, tìm tiếp LK-M8, nhập định mức rồi thêm một lần. Chỉ ra đích thêm rõ ràng, chuyển từ khóa không mất giỏ, số lượng tổng được nhân sẵn theo từng cấp.
5. Bấm **Hoàn tác** để lấy lại thao tác vừa làm. Nói: “Nhập nhanh nhưng vẫn nhìn được ô nào liên kết, ô nào sửa riêng, và có đường quay lại.”

Đây là kịch bản nói ngắn, không phải cam kết thời gian hoàn thành nghiệp vụ. Nên nạp lại dữ liệu mẫu trước buổi demo, sau khi sao lưu dữ liệu cần giữ.

## Cho khách tự thử thêm

- **Tab** chuyển ô; **Enter** đi xuống cùng cột; **Shift** đi ngược; **Ctrl/Cmd+Z** hoàn tác, **Ctrl/Cmd+Shift+Z** làm lại. Giữ tối đa 30 bước thay đổi trong phiên, không lưu lịch sử hoàn tác sau khi tải lại.
- **Thêm đúng cấp:** nút **+ Vật tư vào cấu kiện** nằm ngay tại dòng cấu kiện; nút ở chân bảng ghi rõ **+ Vật tư vào sản phẩm**. Hộp chọn hiển thị đường dẫn nơi thêm và số lượng cấp chứa; đổi nơi thêm vẫn giữ giỏ. Có thể tạo cấu kiện trống và bổ sung sau.
- **Dán từ Excel:** sao chép các ô theo thứ tự Mã vật tư, Số lượng, L, W, H, F. Bảng xem trước hiện kích thước đã chuẩn hóa và số lượng toàn báo giá. Số mơ hồ như `1.800` phải chọn cách viết Việt Nam (1800) hoặc Quốc tế (1,8); không âm thầm đoán. Báo lỗi chỉ rõ dòng/cột, không ghi đè quy cách cố định; chỉ thêm cả lô khi tất cả dòng hợp lệ. Giới hạn 1.000 dòng/lần; chưa đọc trực tiếp file XLSX.
- **Tìm trong cấu thành:** tìm tên cấu kiện vẫn giữ vật tư con để sửa ngay; tìm mã vật tư giữ đường dẫn sản phẩm/cấu kiện. Những dòng cha chỉ hiện để định vị không được chọn cho thao tác hàng loạt.
- **Định mức / tổng:** ô nhập là số lượng trong một đơn vị cha; số bên dưới là tổng toàn báo giá. Rê chuột để xem phép nhân theo từng cấp.
- **Chọn nhiều dòng:** gán nguyên công, đổi mã cùng hình dạng, nhân bản hoặc xóa một lượt. Chọn cả cha và con thì gán ở cấp cao nhất, tránh cộng lặp. Chọn tất cả chỉ tác động các dòng đang hiển thị, không chọn dòng cha chỉ để định vị; đổi tìm kiếm/bộ lọc sẽ xóa lựa chọn cũ.
- **Nút ⋯ của sản phẩm → Kích thước chung & liên kết:** cấu hình L/W/H và liên kết từng ô của các mã vật tư; tùy chọn mẫu tên chứa {L}, {W}, {H}. Lưu thành mẫu để dùng lại. Thành phần có liên kết khi thêm vào sản phẩm sẽ nhận tham số chung của sản phẩm; sản phẩm con có bộ tham số riêng.
- **Nút ⋯ của dòng vật tư → Sửa riêng kích thước:** tách liên kết có chủ đích; tên tự sinh chuyển sang quy cách tùy chỉnh, bản chào giá bổ sung kích thước chi tiết sửa riêng.
- **Danh mục vật tư:** tìm không dấu, lọc kết hợp hình dạng, mác, T/W/H/Ø. Khi đang thêm mã mà thiếu vật tư, tạo ngay tại đó và quay lại giỏ chọn; Hủy cũng không mất giỏ.
- **Phân tích giá:** vật tư, nguyên công, vận chuyển, lắp đặt ở từng sản phẩm/cấu kiện/mã. Ô nhập là đơn giá ở cấp đó, số đậm là thành tiền. Đổi giá vật tư áp dụng cho cùng mã/ĐVT trong báo giá, giữ nguyên danh mục.
- **Cây chi tiết & 3D:** vùng xem có ở cả sản phẩm, cấu kiện và vật tư. Tấm/thanh dựng theo hình dạng và kích thước thực; thay kích thước cập nhật hình. Với mẫu máng/nắp hỗ trợ, chuyển **Xem phôi khai triển / Xem thành hình**. Có xoay, thu phóng, mặt đứng/mặt cắt/mặt bằng, đặt lại và mở rộng.
- **Trình bày 3D:** bề mặt kim loại có sắc độ sáng/tối, bóng nền mềm, đường bao tiết diện và ống tròn 128 đoạn. Nút **Kích thước** bật/tắt đường đo theo mm ngay trên hình; kích thước quá ngắn hoặc nhãn chồng nhau được ẩn, số đầy đủ của chi tiết vẫn có dưới khung. Với khung mẫu, nhãn là chiều dài từng thanh, không phải kích thước bao. Giả định kỹ thuật nằm trong mục mở rộng, không che vùng xem.
- **Ngữ cảnh 3D:** chọn **Sản phẩm chứa** để nhìn lại tổng thể và tô cam phần đang chọn. Danh sách chi tiết ngay trong khung cho chuyển đến dòng cần sửa. Mẫu khung/máng có bố trí minh họa riêng; sản phẩm tùy ý hiển thị các dòng hình học tách rời, không tự suy ra vị trí lắp ghép. Mỗi dòng một hình đại diện, không nhân toàn bộ số lượng đơn hàng lên hình.
- **Giữ vị trí làm việc:** cây cấu thành giữ vị trí cuộn khi chọn dòng, sửa kích thước, hoàn tác hoặc chuyển tab/trang rồi quay lại trong phiên. Neo theo mã dòng giúp giữ vùng đang xem khi thêm dòng phía trên. Chọn bằng bàn phím không mất tiêu điểm. Thanh tab trên màn hẹp giữ tab đang chọn trong vùng nhìn thấy.
- **Khai triển & hao hụt:** kiểm tra các chi tiết được ghép chung, thử mạch cắt hoặc Chỉnh khổ mua. Khổ quá nhỏ báo lỗi, không tạo số tấm giả.
- **Phần dư tận dụng:** chọn trên sơ đồ hoặc tích vào dòng kích thước. Các phần cùng kích thước được gom để chọn một lần; nút **Từng phần** cho chọn riêng từng tấm/thanh. Có chọn nhanh theo kích thước tối thiểu do người lập xác nhận. Bấm **So sánh 2 phương án giá ↑** để chọn tính cả phần dư hay không tính phần tận dụng; số vật tư phải mua không đổi.
- **Bản chào giá:** tên/quy cách theo dữ liệu hiện tại, không in phân tích chi phí nội bộ. Duyệt minh họa, xuất CSV hoặc In/Lưu PDF.

Phần **Hướng dẫn trình diễn** trong thanh bên có nạp lại dữ liệu mẫu và khôi phục JSON. Dữ liệu tự lưu trong trình duyệt, chưa đồng bộ giữa thiết bị.

## Quy tắc đã thực hiện trong demo — chưa phải toàn bộ yêu cầu mới

- Báo giá chứa nhiều sản phẩm. Sản phẩm chứa vật tư, cấu kiện hoặc sản phẩm con; cấu kiện có nhiều mã vật tư. Số lượng nhân theo từng cấp đúng một lần.
- Quy cách, đơn giá và công thức được chụp lại khi gọi vật tư. Thay giá danh mục không làm đổi giá cũ. Nút **Cập nhật đơn giá mới** chủ động cập nhật giá cho báo giá; giữ nguyên kích thước, công thức và quy cách. Các mã đã đổi đơn vị tính sẽ giữ giá cũ.
- Công thức hỗ trợ L, W, H, T, D, F, số, ngoặc, +, -, *, /. Công thức được phân tích bằng bộ đọc biểu thức, không chạy JavaScript từ nội dung nhập.
- Khối lượng tấm tính theo thể tích nhân khối lượng riêng. Thanh hộp/ống trừ phần rỗng. Bổ sung tiết diện danh nghĩa U, C không mép gấp, H và I (tách dày bụng T và dày cánh TF). Chưa mô phỏng bán kính góc, độ côn cánh hoặc dùng bảng khối lượng hãng. Giá mua hỗ trợ kg, m, m² hoặc tấm/thanh theo hình dạng.
- Xếp tấm theo các khối chữ nhật, thử thứ tự giảm dần và xen kẽ cho nhóm tối đa 1.000 phôi; chọn phương án ít tấm hơn. Thanh xếp theo chiều dài giảm dần. Có mạch cắt, xoay tấm, cảnh báo quá khổ và giới hạn 5.000 phôi/nhóm. Đây là dự toán, không phải cam kết tối ưu nesting công nghiệp.
- Giá vật tư mua theo khổ được phân bổ cho từng dòng theo diện tích/chiều dài sử dụng. Phần dư tận dụng được xác định từ các hình chữ nhật còn trống/đuôi thanh trong phương án cắt, tách riêng mạch cắt. Khi chọn **Không tính phần tận dụng**, trừ giá trị phần dư đã chọn trước khi phân bổ chi phí vật tư; không trừ hai lần qua các cấp sản phẩm/cấu kiện.
- Giá trị phần giữ lại = tỷ lệ diện tích/chiều dài phần đó trên toàn khổ mua × chi phí mua. Áp dụng cho đơn giá kg, m, m², tấm/thanh. Đây là phân bổ giá trị vật tư còn lại, không phải tiền bán phế liệu. Khối lượng mua, khối lượng phôi, diện tích và nguyên công không đổi khi chuyển phương án; chi phí chung, giá chào và VAT tính lại theo chính sách giá hiện tại.
- Lựa chọn phần dư gắn với phương án cắt. Khi kích thước/số lượng/khổ mua/mạch cắt thay đổi, lựa chọn không còn khớp bị ngừng áp dụng và báo cần rà soát. Chưa được xuất/duyệt giá theo phương án loại phần dư cho đến khi xử lý cảnh báo. Lựa chọn ở nhóm vật tư không đổi được giữ. Thay đơn giá không làm mất lựa chọn nếu phương án vật lý không đổi.
- Chưa nhập kho phần giữ lại, chưa lấy phôi dư từ kho cho đơn hàng sau và chưa trừ doanh thu bán phế liệu. Tận dụng thực tế phải được kỹ thuật xác nhận, không suy ra chỉ từ kích thước.
- Nguyên công tính theo kg, m², m, lần hoặc bộ; mỗi phương án tại xưởng/thuê ngoài có thể có cơ sở khác nhau. Vận chuyển/lắp đặt khai báo riêng ở từng cấp, nhân số lượng toàn báo giá và cộng lên một lần. Định mức cụ thể phải được người lập xác nhận để tránh khai báo cùng một công việc ở nhiều cấp.
- Chi phí chung tính trên chi phí trực tiếp. Biên lợi nhuận tính trên giá bán trước thuế. Đơn giá chào làm tròn đến đồng, thành tiền = đơn giá × số lượng, VAT làm tròn đến đồng để tổng trên bản chào giá khớp.
- Duyệt là thao tác minh họa nội bộ, lưu phiên bản trong lịch sử trình duyệt. Sửa báo giá đưa trạng thái về nháp.

## Giới hạn demo và chi tiết cần đối chiếu khi triển khai

- Định nghĩa chính xác khối lượng/diện tích phôi và vật tư. Demo đang dùng: phôi = chi tiết cần cắt; vật tư = lượng mua phân bổ. Diện tích phôi tấm là một mặt, diện tích sơn là hai mặt.
- Quy tắc bù chấn, hệ số dao/cối, khổ mua thực tế, cho phép xoay, mép chừa, tái sử dụng phôi dư và cách phân bổ hao hụt.
- Ngưỡng phần dư đủ dùng, tình trạng vật liệu, hướng cán/bề mặt, giá trị được giữ lại và trách nhiệm nhập kho. Demo lấy tỷ lệ giá mua, chưa có tỷ lệ giảm giá riêng hoặc quản lý tồn kho phần dư.
- Định mức nguyên công, cơ sở tính, vận chuyển/lắp đặt ở cấp nào, và tránh tính trùng vật tư tiêu hao đã nằm trong giá nguyên công.
- 3D hình học danh nghĩa hỗ trợ tấm, hộp rỗng, ống, tròn đặc, vuông đặc, góc L, U/C và H/I. Tiết diện vòng rỗng/chiều dày được thể hiện, không dùng hộp đặc thay thế. Chưa mô phỏng dung sai, bán kính chấn/góc, độ côn hoặc mối hàn; chưa đọc CAD hay tự dựng lắp ghép tùy ý. Máng/nắp thành hình chỉ áp dụng đúng mẫu công thức hỗ trợ; công thức tùy chỉnh chỉ xem phôi khai triển.
- Vật tư theo cái/bộ/kg/lít không có hình dạng/kích thước khai báo sẽ hiện giải thích thiếu hình học, không gán hình từ tên. Sản phẩm trống có nút thêm vật tư tại vùng 3D. Khi cấu thành rất lớn, chỉ dựng tối đa 60 dòng hình học kèm cảnh báo số dòng còn lại; cây vẫn cho xem từng dòng. Tấm/ống hiển thị bằng phép chiếu SVG từ các mặt 3D, không phụ thuộc WebGL hoặc mạng.
- Chưa có backend, tài khoản/phân quyền thật, nhiều người dùng, tích hợp kho, AI đọc ảnh/PDF/CAD hoặc đọc/xuất trực tiếp XLSX. Đã hỗ trợ dán ô từ Excel theo mẫu cột; CSV mở được bằng Excel; PDF tạo qua chức năng in của trình duyệt.
- Liên kết tham số do người dùng cấu hình, không tự suy luận kết cấu hay công thức kỹ thuật từ tên sản phẩm. Kích thước khác như mép F vẫn nhập riêng nếu chưa liên kết.

## Phát triển và kiểm tra

`index.html`, `styles.css`, `core.js`, `entry-core.js`, `model3d.js`, `model3d-render.js`, `ux.js`, `remnant-ui.js`, `model3d-ui.js`, `app.js` là nguồn đang sửa. Không sửa trực tiếp file sinh trong `dist`.

```powershell
npm install
npm start
# Mở http://127.0.0.1:4173
npm test
npm run test:ui
npm run test:ux
npm run test:customer
npm run test:workflow
npm run test:remnants
npm run test:3d
npm run test:scroll
npm run test:site
npm run build
npm run test:offline
```

Kiểm thử giao diện dùng Chromium của Playwright. Khi máy chưa có browser, chạy `npx playwright install chromium`. Ảnh chụp và PDF kiểm tra được sinh trong `artifacts`.

Kết quả kiểm tra lại sau vòng góp ý: [artifacts/customer-review/RECHECK.md](artifacts/customer-review/RECHECK.md). Chỉ đóng gói `dist/index.html` để gửi/đưa lên hosting; không gửi kèm ảnh hệ thống cũ trong thư mục rà soát nội bộ.

Kịch bản thử phần dư và bằng chứng: [artifacts/PHAN-DU-KIEM-THU.md](artifacts/PHAN-DU-KIEM-THU.md).

Kiểm tra 3D theo từng cấp và giới hạn hình học: [artifacts/3D-KIEM-THU.md](artifacts/3D-KIEM-THU.md).

Kiểm tra lỗi mất vị trí cuộn và rà soát toàn trang: [artifacts/SCROLL-REVIEW.md](artifacts/SCROLL-REVIEW.md).
