# Hoàn thiện nhóm sáu mục đầu vào và cấu thành — 14/09/2026

Phạm vi: **BG-01, DM-01, DM-02, DM-03, DM-04, UX-01**. Đây là kết quả triển khai/kiểm chứng nội bộ, không thay biên bản nghiệm thu của khách và không có nghĩa hoàn thành toàn bộ GĐ1.

## Phần bổ sung so với đợt 1 ban đầu

| Mã | Chức năng và kiểm soát |
| --- | --- |
| BG-01 | Giữ và kiểm hồi quy hồ sơ đầy đủ ngay lúc tạo báo giá; khách mới/cũ, liên hệ, dự án, hạn chào, tiến độ, yêu cầu và tệp gốc. Lưu/mở lại và tải tệp được kiểm cả trình duyệt lẫn máy chủ cục bộ. |
| DM-01 | Giữ mã tự sinh, nhóm mở, vật liệu–mác/đặc tính liên kết, gợi ý tên, thương hiệu thiết bị và giá độc lập. Quy ước tự khai tạo được mã vật tư; sửa mã này giữ đúng các thông số cố định và đơn vị của quy ước. |
| DM-02 | Thêm bộ quy ước hình dạng: khai trường cố định/nhập ở đơn, đơn vị, công thức khai triển và kg/diện tích trên đơn vị, ghi chú/điều kiện; thử cả phôi và khổ mua. Kiểm biến, đơn vị, chia 0, kết quả không hợp lệ. Mỗi sửa tạo phiên bản mới; mã vật tư/dòng đơn giữ bản quy ước đã chọn. Cùng tiết diện khác chiều dài được gom cắt; khác tiết diện không gộp nhầm. |
| DM-03 | Thêm danh mục khổ dùng chung độc lập với SKU, ghi xưởng/máy, chọn vào dòng đơn hoặc nhập khổ riêng. Khổ đã chọn có bản sao nguồn; sửa/ngừng dùng khổ chung không đổi đơn cũ. Giữ kiểm vừa khổ, ngưỡng phần dư, biên bao gồm bằng ngưỡng, mạch cắt và cảnh báo phương án cũ. |
| DM-04 | Thêm dòng vật tư nháp trước khi có mã; lưu/mở lại được, có nhãn thiếu mã, không được coi là dòng có giá 0 hợp lệ. Chọn mã sau vẫn giữ định danh, vị trí, số lượng, công đoạn. Cùng cây xuyên năm bảng. |
| UX-01 | Bốn nhóm dòng có nền/nhãn/thụt cấp. Bổ sung và kiểm trạng thái chọn, rê chuột, cảnh báo, đã duyệt/đã khóa; chỉnh chữ phụ trên bảng công đoạn cho đủ tương phản. Đơn trình duyệt đã duyệt không bị gắn nhầm nhãn khóa máy chủ. |

Các phần có sẵn và bằng chứng đợt đầu được ghi trong [báo cáo lịch sử](BATCH-01-2026-09-14.md). Không xóa lịch sử đó hoặc lấy các câu “còn thiếu” tại mốc cũ làm trạng thái bản mới.

## Cách dùng phần mới

1. **Quy ước & công thức → + Quy ước hình dạng**: chọn thanh/tấm; khai các ký hiệu, nơi nhập, đơn vị, số thử. Công thức dài/rộng trả mm. Công thức khối lượng trả kg/m hoặc kg/m²; công thức diện tích trả m²/m hoặc m²/m². Thử với khổ mua và kiểm kết quả trước khi lưu.
2. **Tạo mã vật tư theo quy ước**: nhập thông số cố định, vật liệu, đơn vị giá, giá và khổ ban đầu. Mác/đặc tính bổ sung trong **Sửa vật tư**. Số thử của trường biến được điền lúc thêm dòng và phải chỉnh theo dữ liệu đơn thật.
3. Trong báo giá, mở chi tiết vật tư → **Thông số quy ước** để nhập trường biến và xem kết quả một chi tiết/toàn đơn. **kg/m · m²/m** vẫn cho ghi đè bằng bảng tra có căn cứ và chủ động lưu về mã.
4. **Danh mục vật tư → Khổ mua dùng chung**: khai nhiều khổ, xưởng/máy tương ứng. Ở **Khai triển & hao hụt → Chọn khổ**, chọn khổ chung hoặc nhập riêng. Người lập chọn máy/xưởng phù hợp; hệ thống không tự đoán năng lực máy hay tối ưu chọn giữa mọi khổ.
5. **+ Vật tư → Thêm dòng nháp — chọn mã sau**: khai tên tạm và lượng. Dòng còn nháp hiện rõ chưa có giá; phải chọn mã và xử lý các lỗi đầu vào trước khi chốt/xuất chính thức.

Ví dụ thử, không phải định mức khách: `10 kg/m`, `0,5 m²/m`, dài `2.000 mm` → `20 kg`, `1 m²` một chi tiết; lượng 3 → `60 kg`, `3 m²`. Mua theo khổ là phép tính riêng. Diện tích vật lý không tự thay phạm vi sơn/gia công.

## Mã nguồn và quy tắc bảo toàn

- `definition-core.js`: kiểm quy ước, tính lượng, gom cùng tiết diện, danh mục khổ, dòng nháp/chọn mã. Công thức dùng bộ phân tích phép toán hiện có, không thực thi JavaScript từ ô nhập.
- `definition-ui.js`: quản lý quy ước/khổ, tạo mã, nhập thông số và dòng nháp; trạng thái khóa hiển thị theo chế độ thực tế.
- `core.js`: cùng phép tính cho màn thử, BOM, lượng mua; lỗi dòng nháp đưa vào lỗi báo giá. Kiểu dữ liệu cũ không có quy ước riêng vẫn giữ phép tính cũ.
- `db.shapeDefinitions`, `db.stockSizes`: danh mục làm việc; `spec.shapeDefinition` và `spec.stockSource`: bản sao đã chọn. Sửa danh mục không tự viết lại đơn cũ. Lưu/đồng bộ danh mục qua máy chủ giữ hai bảng mới.
- Mã máy chủ lưu nháp được nhưng kiểm lại dữ liệu khi trình/duyệt; bản đã trình/duyệt bị khóa. Netlify hiện tại không phải máy chủ dùng chung.
- Chưa mở rộng thành liên kết công thức từ tham số sản phẩm cha sang vật tư con: việc đó thuộc **DM-05**. Không nhầm công thức hình dạng DM-02 với DM-05.

## Kiểm chứng có thể chạy lại

```powershell
npm ci
npm run verify:batch-one:complete

$env:BATCH_ONE_VERIFY_ROOT = 'artifacts/customer-review/batch-01-complete-2026-09-14'
node tools/check-batch-one-live.cjs
$env:BATCH_ONE_URL = 'https://baogia-truongphat.netlify.app/'
$env:BATCH_ONE_ARTIFACT_ROOT = 'artifacts/customer-review/batch-01-complete-2026-09-14/regression'
node tests/batch-one-browser.cjs
node tests/definition-browser.cjs
node tests/definition-states-browser.cjs
Remove-Item Env:BATCH_ONE_URL, Env:BATCH_ONE_ARTIFACT_ROOT, Env:BATCH_ONE_VERIFY_ROOT
```

Cần Microsoft Edge, Node hỗ trợ `node:sqlite`. Bộ kiểm tạo dữ liệu/tài khoản giả trong phiên riêng; không dùng dữ liệu khách. Ảnh/log để cục bộ vì repo công khai.

Gốc bằng chứng: `artifacts/customer-review/batch-01-complete-2026-09-14/`:

- `verification.json`, các `.log`: build, ca logic/máy chủ, nhóm giao diện/hồi quy và mã SHA-256 nguồn/build.
- `local/`, `live/`: sáu ảnh quy ước/khổ/dòng nháp và hai ảnh trạng thái; `results.json`, `states-results.json` ghi ca kiểm và tỷ lệ tương phản đo được.
- `regression/local/`, `regression/live/`: 12 ảnh và kết quả hồ sơ, thương hiệu, cây, dữ liệu tra, phần dư, màn hẹp trên bản mới.
- `team/`: hai ảnh và kết quả khóa năm bảng/lưu quy ước máy chủ; `regression/team/` kiểm hồ sơ và tệp máy chủ.
- `live/deployment-check.json`: so toàn bộ HTML web với build đã kiểm, chỉ cho phép đúng thanh công cụ Netlify được nối cuối.

## Trạng thái phát hành

Kiểm cục bộ kết thúc **11:40:08 ngày 14/09/2026 (giờ Việt Nam)**: đạt **14/14 nhóm**, gồm **152/152 ca logic**, **26/26 ca máy chủ**, các nhóm giao diện mới và hồi quy. SHA-256 build sau chuẩn hóa LF: `b0f93c8ec0131878c0a0eb27817378b0480a73c0f72d54018216ba619cc2f00a`. Đã kiểm không có nguồn/build thay đổi sau lần chạy này.

Đang phát hành và kiểm web; chưa đánh dấu sáu mã `[x]` trước khi bản deploy đúng mã và kiểm trực tiếp web đều đạt. Kết quả phát hành cuối sẽ được bổ sung tại đây sau khi chạy xong.

Giới hạn giữ nguyên: Netlify lưu dữ liệu/tệp theo trình duyệt; chức năng máy chủ được kiểm trên máy chủ thử cục bộ, chưa triển khai máy chủ Internet trong đợt này. Không tuyên bố đã kiểm đơn thật của khách, AI bóc tách, DM-05, công thức TMC/thuế hoặc lắp đặt thiết bị thuộc các mục khác.
