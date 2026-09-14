# Hoàn tất 5 mã Dày / TMC — 14/09/2026

Đóng **DM-05, TC-06, BG-02, BG-03, BG-05** về triển khai và kiểm chứng nội bộ. Checklist **22/25 hoàn tất**, còn BG-06 (AI), ERP-01 và ERP-02 (giai đoạn nối vận hành). Không phải tuyên bố khách nghiệm thu toàn hệ thống hoặc đã triển khai máy chủ sản xuất.

## Bản triển khai và bằng chứng

- Mã ứng dụng: `90f76393d4c30b9836cbec1625e82c2dfbb79fa7`, tiếp sau `6ffcadd`.
- [Netlify](https://baogia-truongphat.netlify.app/) khớp **toàn bộ HTML** bản build lúc **18:56:05 giờ Việt Nam**, chỉ cho phép đúng toolbar Netlify đã nhận diện nối cuối.
- SHA-256 ứng dụng chuẩn LF: `24334d3170cffb75a2008e30ba8b16346bf287d9a72865d4d280f7767a812103`.
- Local: **12/12 tác vụ**, **254 ca logic + 47 ca máy chủ**; 8 bộ giao diện, **65 nhóm / 58 ảnh**.
- Web thật: **65/65 nhóm / 58 ảnh**, hoàn tất **18:57:27**. Phiên trình duyệt riêng, dữ liệu QA; không sửa hồ sơ trên máy khách. Không lỗi JavaScript trong các lượt kiểm.
- Tệp XLSX tải thật được đọc lại và đối chiếu từng số tiền. Bốn ca từ nguồn công thức có PDF qua nút In thật, đã đọc nội dung PDF xác nhận không trắng và đúng tổng. Ca duyệt/phát hành, nguồn giá, thuế, ẩn/hiện và khóa phiên bản có bộ hồi quy riêng.

[Manifest bằng chứng](../artifacts/customer-review/scope-completion-2026-09-14/manifest.json) · [Đối chiếu deployment](../artifacts/customer-review/scope-completion-2026-09-14/live/deployment-check.json) · [Kết quả local](../artifacts/customer-review/scope-completion-2026-09-14/verification.json).

## DM-05: liên kết yêu cầu Dày, không sửa ngầm mã cố định

Vào **Cấu thành → Đối chiếu Dày / chọn dòng áp dụng** cạnh hàng kích thước chung.

- Người lập chỉ định từng dòng **phải khớp PRODUCT_T** hoặc **dùng độ dày riêng**, có lý do và lịch sử. Chọn qua cấp cấu kiện được; sản phẩm con lấy Dày của chính nó.
- Liên kết kiểm `T mã = T yêu cầu`, không ghi đè thông số danh mục. Lệch mã hoặc thiếu T nguồn: báo đúng dòng/giá trị, loại kết quả lượng cũ khỏi tính hợp lệ và chặn trình/phát hành.
- Xử lý bằng **chọn lại mã vật tư thực sự** (lấy quy cách, giá, hãng của mã được chọn), sửa T nguồn cho đúng yêu cầu, hoặc khai dùng Dày riêng có lý do. Không tự chọn mã/giá/hãng thay khách.
- Dòng chưa liên kết giữ nguyên quy cách mã và được ghi rõ là chưa áp Dày chung; không coi mọi vật tư phải cùng T. Bu lông/đóng gói không nhận liên kết. Sản phẩm nhiều độ dày được hỗ trợ bằng phạm vi tường minh.
- Đã kiểm đổi mã qua form thật, tính lại lượng/giá, reload, mẫu, biến thể, lịch sử, lỗi nguồn, dữ liệu sai và khóa snapshot máy chủ. Hồi quy công thức L/W/H xuyên cấp, đơn vị, vòng lặp và số lượng giữ nguyên.

Đây là quyết định triển khai dựa trên quy tắc **quy cách mã cố định + liên kết do người lập chọn** đã có tại DM-01/DM-02/DM-05; không ghi thành khách yêu cầu tự chọn mã. CĐ-04 đã được xử lý bằng quy tắc này, không cần chờ xác nhận một cơ chế tự thay mã chưa từng được yêu cầu.

[Ảnh lệch Dày bị chặn](../artifacts/customer-review/scope-completion-2026-09-14/thickness-scope-browser/live/02-chan-ma-khong-khop-day.png) · [Chọn mã phù hợp](../artifacts/customer-review/scope-completion-2026-09-14/thickness-scope-browser/live/03-chon-ma-dung-tinh-lai.png).

## TMC: đối chiếu công thức gốc, sửa cơ sở chi phí chung

Nguồn vẫn là workbook đã có `260514 XD phần mềm.xlsx`, SHA-256 `0471d8036da78b19b635eb71e2e6ad2b30c82e0700765c72735271e1d2335e7e`. Không cần đợi một file mới chỉ để kiểm được nhánh tính.

Ba lớp bằng chứng tách biệt:

1. **Dữ liệu đã điền trong workbook:** đọc OOXML gốc, tính lại CB/CE/CM/CO và đối chiếu các ô nối BC Chao gia/Output: **7/7 khớp**, không sửa file. D4:D7 gốc là cơ khí; không gọi chúng là đơn TMC thật.
2. **Nhánh TMC có kiểm soát:** dùng công thức CA/CB/CE/CM/CO và bảng bậc/giá AS/AT từ chính file gốc; khai rõ đầu vào QA cho TMC thuần và đơn hỗn hợp. Đáp án tính độc lập trước khi so với ứng dụng. Đây không phải Excel engine tính lại toàn workbook và không phải đơn kinh doanh khách đã duyệt.
3. **Ứng dụng thực tế:** so các số trung gian, phần ngoài TMC giữ chi tiết theo xác nhận 15:46:38; kiểm local, web thật, XLSX/PDF thực xuất. Kiểm riêng nguồn thuế, thay giá, tham chiếu không cộng lại, lựa chọn giá cuối và snapshot.

| Ca QA theo nguồn | CP chung TMC | Trước thuế toàn đơn | Sau thuế QA 8% |
| --- | ---: | ---: | ---: |
| Dạng dài — TMC thuần | 4.000 | 21.360 | 23.069 |
| Dạng dài — TMC + cơ khí | 4.000 | 28.047 | 30.291 |
| Phụ kiện theo cái — TMC thuần | 62,4 | 9.548 | 10.312 |
| Phụ kiện theo cái — TMC + cơ khí | 61,2 | 16.231 | 17.529 |

- `CA`: mm × lượng × 2 trong mẫu tương đương **2.000 đ/m**, không phải 2 đ/m. Cấu hình vẫn cho thay số theo nguồn, không gán 2.000 làm mặc định kinh doanh.
- `CB`: bổ sung cơ sở **toàn sản phẩm trước CP chung**, gồm vật tư, phụ, nhân công ghép, hoàn thiện, VC nhập/thuê ngoài và lắp đặt; không gồm giao hàng hoặc nhân lại hệ số. Trước đây cơ sở % chỉ có phôi/nhân công nên chưa biểu diễn đủ CB.
- Nhiều phần TMC được cộng **một lần trên tổng cơ sở**, không nhân CP chung theo số phần. Các bảng chọn cơ sở này phải cùng tỷ lệ; tỷ lệ khác nhau, khoản chung cộng trùng hay khai trên phần chỉ bổ sung công đều bị chặn. Ca hai phần: `4.940 × 2% = 98,8`, một dòng tổng trong UI/Excel. Tỷ lệ/bậc và căn cứ của từng đơn vẫn phải khai rõ.
- `CI2` của Excel là **hệ số nhân**; phép chuyển sang ô phần tăng % là `(CI2 - 1) × 100`, không đọc hệ số nhân 3 thành 3%. Chuyển đổi chỉ ở bộ đối chiếu có ghi nguồn, không đổi hệ số báo giá cũ.
- Giá đơn vị được làm tròn theo quy tắc ứng dụng rồi nhân lượng; báo cáo giữ cả CM/CO chưa làm tròn của công thức nguồn để nhìn rõ chênh lệch làm tròn, không giấu sai số.
- Phần giao hàng CP3 trong workbook cũ là phép tính riêng. Các ca đối chiếu nguyên chuỗi đặt giao hàng bằng 0; **không suy ra miễn giao hàng**. Yêu cầu mới ba lớp/giá đầy đủ được kiểm riêng với giao hàng/lắp đặt khác 0; không cộng CP3 thêm lần nữa lên giá đã đầy đủ. Chuỗi TMC lưu riêng, không sao chép hệ số chi tiết bằng thao tác ẩn/hiện.

Không phát sinh công thức cửa gió/tủ điện; không suy từ tên sản phẩm; không tự coi giá thiếu là hàng ngoài TMC. Ca một sản phẩm chứa cả phần TMC và phần không TMC không được tự thêm thành yêu cầu bắt buộc khi chưa có tình huống nghiệp vụ. **CĐ-01 đã đóng về đối chiếu các nhánh đang yêu cầu**, không đồng nghĩa chốt giá/thuế/hệ số của mọi đơn thực tế.

[Đối chiếu nguồn gốc, dữ liệu nội bộ](../artifacts/customer-review/scope-completion-2026-09-14/source-audit/workbook-audit.json) · [Bảng số từng nhánh](../artifacts/customer-review/scope-completion-2026-09-14/source-audit/branch-reconciliation.json) · [Ảnh đơn hỗn hợp](../artifacts/customer-review/scope-completion-2026-09-14/tmc-workbook-browser/live/02-long-mixed.png) · [Ảnh chi phí chung một lần](../artifacts/customer-review/scope-completion-2026-09-14/tmc-workbook-browser/live/05-nhieu-phan-chi-tinh-chung-mot-lan.png).

## Chạy lại

```powershell
./tools/audit-tmc-workbook.ps1 -SourcePath '12.9/260514 XD phần mềm.xlsx'
node tools/verify-scope-completion.cjs
```

Workbook và tệp bằng chứng ở workspace riêng, không đưa lên Git công khai. Bộ kiểm nguồn dừng nếu thiếu file, hash/công thức đổi hoặc phép đối chiếu không khớp; không tự thay nguồn.

Đặt các biến URL tương ứng để chạy 8 bộ browser trên deployment đã kiểm hash: `TMC_WORKBOOK_URL`, `THICKNESS_SCOPE_URL`, `TMC_COMMON_URL`, `THICKNESS_URL`, `BATCH_TWO_URL`, `TMC_URL`, `GROUP_PRICE_URL`, `BATCH_SIX_URL`. Đặt biến `*_ROOT` vào thư mục đợt này để không ghi đè bằng chứng đợt khác. Máy chủ kiểm localhost; Netlify vẫn là ứng dụng lưu trình duyệt, chưa phải triển khai ERP/máy chủ đa người.
