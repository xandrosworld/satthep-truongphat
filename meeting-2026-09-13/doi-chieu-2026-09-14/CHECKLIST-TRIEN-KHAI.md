# Checklist triển khai sau cuộc họp 13/09

Phiên bản tài liệu: 14/09/2026 — v2.1, giữ các sửa đổi F01–F14 và bổ sung thương hiệu vật tư thiết bị theo tin nhắn mới.

Phạm vi: luồng báo giá Trường Phát — dùng để bàn giao cho người hoặc bot tiếp tục sửa phần mềm.  
Trạng thái tài liệu: nội bộ, chưa phải biên bản nghiệm thu của khách.

> **Yêu cầu với người/bot thực hiện:** đọc phần 2, mục đang làm và các điểm còn cần đối chiếu ở phần 13 trước khi sửa mã. Không lấy giao diện đang có làm đặc tả. Giữ nguyên 25 mã đầu mục; chỉ đánh dấu hoàn thành khi đạt điều kiện phần 11. Lượt cập nhật v2 chỉ sửa tài liệu, không xác nhận ứng dụng đã đáp ứng.

Các ghi nhận “hiện trạng” và số dòng mã nguồn trong tài liệu được rà tại commit `e8c0cae6f56485f1a65dca88dbae8f0b2d8774ab`; phải kiểm lại khi mã thay đổi. Bản giải thích hiện hành là tài liệu này; các báo cáo phân tích cũ lưu để truy vết, không dùng diễn giải đã bị sửa để ghi đè v2. Ảnh/clip/phiên âm chủ yếu chỉ có trong gói nguồn nội bộ, không đi kèm clone GitHub; xem phần 12.

## Theo dõi triển khai đợt 1 — 14/09/2026

[Báo cáo đợt 1](../../docs/BATCH-01-2026-09-14.md) ghi phần đã sửa, phần còn lại, mã kiểm thử và vị trí ảnh thực tế. “Hiện trạng đã thấy” bên dưới vẫn là mốc trước sửa; không dùng nó để kết luận mã mới chưa có chức năng.

Mã ứng dụng `3cf0b3c` đã push `main`; kiểm bản Netlify lúc **11:00 ngày 14/09/2026** đạt **7/7 nhóm tình huống**, có **12 ảnh thực tế**. Bộ kiểm cục bộ đạt **11/11 nhóm** (141 ca logic, 23 ca máy chủ và các nhóm giao diện). Mã web khớp build đã kiểm, ngoài thẻ thanh công cụ do Netlify nối cuối. Đây là kết quả phạm vi đợt 1, không phải nghiệm thu khách hoặc hoàn thành nguyên cả sáu mã; xem giới hạn từng mã trong báo cáo.

Đợt này xử lý hồ sơ tạo báo giá, vật tư/thương hiệu, dữ liệu tra kg/m–m²/m, khổ/phần dư theo mã, cây chung năm bước và bốn nhóm dòng. Chưa hoàn thành cả DM-02/03/04: còn bộ cấu hình hình dạng tổng quát, khổ mua dùng chung theo máy/xưởng và dòng vật tư nháp chưa mã. Chưa làm DM-05/AI/các công thức giá bổ sung; giữ nguyên yêu cầu và CĐ. Không đổi sang `[x]` chỉ vì các ca đầu vào đã chạy đạt.

## 1. Kết quả cần đạt

Người lập báo giá chỉ nhập dữ liệu một lần, sau đó cùng một hồ sơ đi xuyên suốt:

```text
Tạo báo giá
  → Khách hàng + công trình + tiến độ + tài liệu đầu vào
  → Bóc tách sản phẩm / cấu kiện / mã vật tư
  → Khai triển + hao hụt + khối lượng + diện tích
  → Công đoạn + hoàn thiện + thuê ngoài + vận chuyển + lắp đặt
  → Tính phương án chi tiết
  → So sánh 4 phương án trên cùng mặt bằng
  → Chọn 1 phương án cho toàn báo giá
  → Duyệt và xuất bản chào khách
  → Chuyển dữ liệu đã chốt sang sản xuất để đối chiếu thực tế
```

## 2. Quy tắc, căn cứ và giới hạn diễn giải

Nhãn nguồn dùng xuyên tài liệu:

- `KH`: tin nhắn/chú thích ảnh khách do người dùng cung cấp; phần nguyên văn khác với diễn giải bên dưới.
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

Nguồn KH mới nhất: [phản hồi bổ sung sau họp](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt). Giữ nguyên lời khách khi sửa phần diễn giải. Không coi mọi quy tắc trong bảng là “khách đã chốt”.

## 3. Ký hiệu trạng thái

- `[ ]` Chưa hoàn thành hoặc chưa kiểm tra lại sau yêu cầu mới.
- `[~]` Đã có một phần trong bản hiện tại nhưng cần sửa/kiểm thử lại.
- `[x]` Chỉ dùng sau khi đủ điều kiện phần 11, gồm kiểm đúng bản đã deploy theo quy trình mới. Khách nghiệm thu là trạng thái riêng.
- `P0`: sai là có thể ra giá sai hoặc làm lệch luồng chính.
- `P1`: bắt buộc để hoàn chỉnh nghiệp vụ báo giá.
- `P2`: nối vận hành/ERP; không được tự nhận đã xong trong demo.

## 4. P0 — sửa ngay trước lần gửi khách tiếp theo

### [~] BG-01 — Gộp đầu vào vào bước “Tạo báo giá mới”

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

### [~] BG-02 — Sửa/khóa đúng bản chất ba phương án giá trọn gói

**Phải sửa phép tính:**

- Chi tiết: tính từ các khoản chi phí và hệ số theo BG-04.
- Kg: `khối lượng phôi sản phẩm × đơn giá/kg`; kết quả này là giá đầy đủ của phương án.
- TMC: kết quả đầy đủ từ công thức riêng theo yêu cầu TC-06; chuỗi cuối và cách xử lý nhánh không TMC phải làm rõ tại CĐ-01 trước khi khóa kết quả tiền.
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

### [ ] BG-03 — Bảng đối chiếu 4 phương án không cộng trùng chi phí

Mỗi cột phương án phải có tối thiểu:

- giá nhập và điều kiện thuế; tổng quy đổi trước thuế để so sánh khi đã đủ điều kiện thuế, nếu chưa rõ thì đánh dấu chưa so được cùng mặt bằng;
- giá quy đổi/kg phôi;
- chênh lệch tiền và tỷ lệ so với phương án chi tiết;
- giá đối thủ và chênh lệch thị trường;
- các khoản vật tư, nguyên công, vận chuyển, lắp đặt, quản lý... lấy từ phương án chi tiết dưới nhãn **tham số đối chiếu**;
- phần chênh còn lại = giá phương án trên cùng mặt bằng thuế − tổng một tập khoản tham chiếu **được định nghĩa, không trùng nhau**, không gọi mặc định là “lãi ròng”.

Excel mẫu `BC Chao gia!AD22 = AD14-SUM(AD15:AD21)` dùng tập khoản cố định: vật tư, sản xuất, vận chuyển nội bộ, giao hàng, lắp đặt, quản lý, xử lý. Đây là căn cứ XL để đối chiếu, không tự cộng cả tổng chi phí sản xuất đã gồm quản lý với quản lý thêm lần nữa. Nếu cho đổi tập khoản tính chỉ số, đó là cấu hình công thức có lưu lại, không phải nút chọn/ẩn cột. Ghi mẫu số của tỷ lệ; kg phôi hoặc giá so sánh bằng 0 thì ghi không áp dụng, không ra Infinity/NaN.

Người dùng chọn một cột làm căn cứ cho toàn báo giá. Mọi điều chỉnh giá cuối phải lưu lý do, người sửa và phiên bản.

**Kiểm tra đạt:** tổng giá và phần chênh còn lại không đổi khi chỉ ẩn/hiện cơ cấu; không trừ hai lần khoản cha/con; chọn phương án không sửa ngược đầu vào cột khác. Giá có/không gồm thuế được đưa về cùng mặt bằng sau khi khai đủ điều kiện.

### [~] BG-04 — Giữ đúng ba lớp giá của phương án tính toán

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

### [~] BG-05 — Chọn một phương án chung cho toàn báo giá

Giữ bốn cột để so sánh nhưng chỉ có một lựa chọn cấp báo giá. Không đặt nút chọn phương án trên từng sản phẩm. Cho xem đơn giá từng sản phẩm do phương án đã chọn sinh ra; nếu sửa giá cuối từng sản phẩm thì phải có lý do và tổng vẫn ghi phương án gốc.

**Kiểm tra đạt:** một phương án cấp báo giá chi phối toàn bộ các dòng, không cho A tự chọn kg và B tự chọn đối thủ. Với TMC, chạy cả đơn có sản phẩm TMC và không TMC, rồi sản phẩm có cấu thành pha trộn theo nhánh đã đối chiếu tại TC-06/CĐ-01. Chọn chung không có nghĩa ép mọi sản phẩm dùng bảng nhân công TMC.

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

### [~] DM-01 — Danh mục vật tư theo nhóm, trường nhập phụ thuộc loại

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

### [~] DM-02 — Quy ước hình dạng và công thức do người dùng quản lý

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

### [~] DM-03 — Khổ mua chuẩn và phần dư

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

### [~] DM-04 — Thư viện mẫu và tạo nhanh tại báo giá

- Thư viện gom sản phẩm/cấu kiện mẫu, không kéo mọi danh mục thành mục menu riêng.
- Trong báo giá thêm được dòng sản phẩm, cấu kiện hoặc vật tư trống.
- Có thể lấy mã/mẫu gần giống, sửa thành mã mới rồi chủ động lưu về danh mục.
- Không sửa đè mã/mẫu gốc; phải hiện rõ đang tạo bản sao.
- Cùng cây sản phẩm–cấu kiện–vật tư phải **hiển thị xuyên suốt** cấu thành → công đoạn → khai triển/hao hụt → khối lượng/diện tích → giá áp dụng. Giữ định danh, tên, cha–con, số lượng; từng bảng thay cột nghiệp vụ tương ứng. Không chỉ giữ cây trong dữ liệu phía sau rồi trình bày các bảng rời không đối chiếu được (PA2 dòng 129–143, 261–273).

**Kiểm tra đạt:** tạo dòng mới/biến thể không đổi mẫu gốc; tải lại giữ đúng cha–con. Với sản phẩm có một cấu kiện chứa vật tư và một vật tư trực tiếp, chuyển qua đủ năm bảng trên vẫn đối chiếu được cùng các dòng, số lượng và cấp; sửa bản nháp cập nhật thống nhất, không bắt nhập lại.

**Đối chiếu:** PA1 00:26:58–00:29:49 (mốc bản chép); [dòng sản phẩm/cấu kiện trống 00:32:00 video](frames/video_00-32-00.png).

![Dòng trống để thêm cấu thành trực tiếp](checklist-images/05-cau-thanh-dong-trong.png)

### [ ] DM-05 — Liên kết kích thước bằng công thức, không sao chép bằng nhau

- Mỗi kích thước của sản phẩm, cấu kiện hoặc vật tư có thể là giá trị cố định, giá trị nhập tay hoặc kết quả công thức.
- Công thức tham chiếu rõ tham số chính dòng và cấp cha/tổ tiên, ví dụ `vật_tư_A.L = sản_phẩm.W - 20` kể cả vật tư nằm trong cấu kiện. Đây là ví dụ khách nêu, không phải mặc định cho mọi vật tư. Việc cho phụ thuộc hai chiều hoặc tham chiếu dòng bất kỳ ngoài cây không phải yêu cầu khách đã chốt.
- Khi tham số nguồn đổi, toàn bộ giá trị phụ thuộc phải tính lại theo thứ tự và kéo theo khai triển, khối lượng, diện tích, giá.
- Trên giao diện phải thấy cả công thức đang dùng và kết quả đã tính; không dùng riêng ký hiệu `↔` khiến người dùng hiểu là hai số luôn bằng nhau.
- Cho phép chủ động chuyển về giá trị cố định hoặc thay công thức, đồng thời lưu người sửa, phiên bản và công thức trong snapshot báo giá.
- Chặn tham chiếu vòng, tham số không tồn tại, sai đơn vị, chia cho 0 và kết quả âm/không hợp lệ; thông báo phải chỉ đúng dòng và biến lỗi.

**Kiểm tra đạt:** `W sản phẩm = 600`, `L vật tư = W sản phẩm - 20` cho 580; đổi W thành 700 cho 680, kéo theo khai triển, kg, diện tích và giá theo các dữ liệu đầu vào tương ứng. Thử cả vật tư trực tiếp và vật tư qua một cấp cấu kiện. Tiết diện cố định của thép hộp không đổi theo W/H chung của sản phẩm. Công thức vòng/biến thiếu bị chặn, không giữ kết quả cũ như thể hợp lệ.

**Đối chiếu giao diện hiện tại:** [ảnh kích thước cha–con đang hiển thị liên kết trực tiếp](../../artifacts/customer-review/09-new-variant-pass.png). Ảnh này xác định vùng cần sửa; yêu cầu công thức lấy từ chú thích mới của khách, không suy ra chỉ từ ảnh hiện trạng.

![Vùng kích thước cha và vật tư con cần chuyển sang liên kết bằng công thức](../../artifacts/customer-review/09-new-variant-pass.png)

### [~] UX-01 — Phân biệt rõ bốn loại dòng trong cây cấu thành

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

### [~] TC-01 — Số lượng xuyên các cấp, không phụ thuộc vị trí dòng

Số lượng thực hiện của một dòng = số lượng qua chuỗi cha × số lượng của dòng. Dùng khóa cha–con, không dùng “dòng gần nhất phía trên” như Excel. `XD Gia!BF4` là căn cứ XL về lượng theo đối tượng; chưa có quy tắc cộng gộp mọi dòng cùng mã ở nhiều sản phẩm thành một lô. Không tự bổ sung cơ chế tạo lô vào giai đoạn này.

Mỗi yếu tố ghi rõ lấy số sản phẩm, số cấu kiện hay số vật tư đang thực hiện. Lượng tính tiền theo đơn vị của công việc (kg/m²/m/cái/lần...), không mặc định mọi yếu tố đều lấy cùng một con số. Phân biệt lượng đơn vị và toàn đơn theo DM-02.

**Kiểm tra đạt:** sản phẩm 2 × cấu kiện 3 × vật tư 4 = 24; đổi thứ tự hiển thị không đổi kết quả; hai dòng cùng mã không tự cộng gộp nếu chưa có thao tác tạo lô.

### [~] TC-02 — Công đoạn đúng cấp và không tính hai lần

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

### [~] TC-03 — Đơn giá nguyên công theo yếu tố tác động

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

### [~] TC-04 — Hoàn thiện bề mặt sinh vật tư theo định mức

- Sơn/mạ/làm sạch là công đoạn nhưng được nhóm riêng để thấy phần thuê ngoài và vật tư phát sinh.
- Tiền công/máy tách khỏi vật tư hoàn thiện.
- Chọn phương pháp hoàn thiện phải sinh nhu cầu mã vật tư tương ứng theo diện tích/khối lượng, định mức, số lớp và hao hụt.
- Dùng lại mã sơn/mạ có sẵn; không tạo mã danh mục mới mỗi lần tính.
- Tổng hợp được lượng vật tư hoàn thiện cần mua.
- Diện tích/khối lượng xử lý lấy đúng công việc và đối tượng; không mặc định tổng mọi bề mặt vật tư con là diện tích hoàn thiện sản phẩm. Vật tư phát sinh được dùng ở các bảng qua cùng định danh; không tính tiền hai lần trong vật tư và hoàn thiện.

**Kiểm tra đạt:** thay diện tích xử lý/số lớp làm lượng sơn thay đúng định mức; giá sơn đổi cập nhật đúng phần tiền của bản nháp được chọn. Tính lại không tạo mã danh mục hoặc dòng nhu cầu trùng. Thuê ngoài đã gồm sơn không cộng tiền sơn lần hai nhưng vẫn truy vết được nhu cầu/công việc.

### [~] TC-05 — Tách vận chuyển và lắp đặt theo bản chất

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

### [ ] TC-06 — TMC là bảng giá riêng nhưng tổng phương án là trọn gói

**Căn cứ:** KH về giá đầy đủ, PA2 dòng 305–329 về nhân công/hao hụt đặc thù, XL về các nhánh công thức. Công thức cuối và phần không TMC còn điểm CĐ-01; không tuyên bố đã khóa toàn bộ.

- Chỉ áp bảng nhân công/hao hụt TMC cho nhóm thang/máng/phụ kiện phù hợp; không ép khung máy thành TMC.
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

**Trước khi đóng mục:** lập bảng số trung gian từ file mẫu cho (a) sản phẩm TMC thuần, (b) đơn có TMC và sản phẩm khác, (c) một sản phẩm có cả phần TMC lẫn không TMC. Ghi nguồn đầu vào, khoản thay thế, khoản giữ lại, hệ số và tổng. Nếu không xác định được nhánh bằng nguồn hiện có, giữ trạng thái CĐ-01 và hỏi đúng bước còn thiếu; không chế công thức hoặc bỏ ca pha trộn.

**Kiểm tra đạt:** đúng đơn vị mét/cái và số lượng; không trùng công/hao hụt; dòng TMC thiếu bậc/giá bị báo thiếu; cả ba ca trên khớp nhánh có căn cứ. Giữ nguyên đầu vào TMC, đổi riêng khoản tham khảo thì tổng không đổi; đổi đầu vào TMC thật thì tổng tính lại. Chỉ đóng TC-06/BG-05 sau khi đã xử lý các nhánh liên quan của CĐ-01.

### [ ] TC-07 — Chi phí lắp đặt riêng của thiết bị/linh kiện

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

### [~] GD-01 — Giá tham chiếu và giá áp dụng của từng báo giá

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

### [~] GD-02 — Hệ số mở, chia đúng lớp và có quyền sửa

- Nhóm hệ số chia theo lớp giá đã định nghĩa ở BG-04, có cơ sở tính rõ; không tự thêm một lớp nhân hệ số vào giá gốc chỉ vì có ba nhóm giao diện.
- Cho thêm yếu tố có tên/căn cứ; không dùng một ô “khác” để che mọi khoản.
- Lưu người sửa, thời điểm và phiên bản.
- Quyền xem giá vốn/lợi nhuận, sửa hệ số và duyệt giá cuối tách biệt.
- Chính sách gán quyền cho người/chức danh thật còn cần thiết lập với khách; không mặc định mọi tài khoản “kinh doanh” chỉ được xem bản đã duyệt. Kiểm bằng các tài khoản thử có tập quyền cụ thể.

**Kiểm tra đạt:** tài khoản thử không có quyền xem nội bộ không nhận giá vốn qua giao diện/API/tệp; tài khoản không có quyền sửa hệ số hoặc duyệt không thực hiện được hành động đó. Đổi hệ số bản nháp không đổi phiên bản đã duyệt. Quy tắc duyệt dưới giá gốc nếu sử dụng phải được cấu hình/chấp thuận, không tự gán cho một chức danh. Demo trình duyệt không thay kiểm quyền trên máy chủ.

**Đối chiếu:** [nhóm hệ số 01:24:00](frames/video_01-24-00.png).

![Khu vực hệ số trong demo cần tổ chức theo đúng lớp giá](checklist-images/13-he-so.png)

### [~] GD-03 — Bản chào giá chuyên nghiệp và nhất quán

- Thông tin khách/người nhận/công trình lấy từ hồ sơ, không nhập lại.
- Một ô “Thông số kỹ thuật” cho từng sản phẩm như khách góp ý.
- Có số lượng, đơn vị, đơn giá, thành tiền, thuế, vận chuyển/lắp đặt nếu thể hiện riêng, tổng thanh toán.
- Điều kiện hiệu lực, giao hàng, thanh toán, bảo hành và ghi chú phải theo báo giá đang chốt.
- Phần ký theo mẫu Trường Phát chấp thuận; mẫu một bên ký là lựa chọn đề xuất, không phải yêu cầu đã chốt. Không lấy yêu cầu “chỉ phần ký của tao” trong báo giá dịch vụ Xandro trước đây áp sang mọi báo giá Trường Phát xuất cho khách của họ.
- Kiểm tra câu chữ “đã/chưa VAT”, “đã/chưa vận chuyển/lắp đặt” không mâu thuẫn.
- Khoản vận chuyển/lắp đặt hiển thị riêng nhưng đã gồm trong giá phương án chỉ là phần phân rã, không cộng tổng lần nữa. Không tự thêm VAT nếu giá nhập đã gồm, không tự coi đã gồm khi chưa rõ (D10).

**Kiểm tra đạt:** bản phát hành chính thức chỉ chứa giá bán đã duyệt, không lộ giá vốn/hệ số; nếu cho xem/in nháp thì ghi rõ “Nháp” và không coi đã duyệt. Tổng dòng, khoản đã bao gồm, thuế và tổng thanh toán nhất quán; thông tin khách đúng snapshot.

### [~] GD-04 — Trạng thái, lịch sử và không ghi đè

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

### Ca E — bốn phương án

- [ ] Phương án chi tiết khớp công thức ba lớp.
- [ ] Kg = kg phôi × giá/kg; không cộng thêm chi phí chi tiết.
- [ ] TMC có công thức riêng tạo đủ giá, không chỉ bảng nhân công; không cộng lại quản lý/vận chuyển chỉ dùng tham khảo.
- [ ] Đối thủ = số lượng × giá đối thủ; không nhân thêm lợi nhuận/hệ số bán.
- [ ] Thay chi phí tham khảo của chi tiết không làm đổi ba tổng trọn gói.
- [ ] Thay đầu vào thực sự của TMC làm tính lại TMC theo công thức riêng; không đánh đồng với ca giữ nguyên giá phía trên.
- [ ] Đúng đơn vị thân/nắp/phụ kiện; không nhân mét/số lượng hai lần.
- [ ] Đối chiếu TMC thuần, đơn có sản phẩm TMC và sản phẩm khác, sản phẩm pha trộn theo CĐ-01; không tự gán TMC cho hàng không thuộc nhóm.
- [ ] Thiếu giá đầu vào hiển thị “Chưa đủ dữ liệu”, không phải 0 đồng.
- [ ] Chỉ chọn được một phương án cho toàn báo giá.
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
| BG-03 | KH bảng tổng thể bốn phương án; XL `BC Chao gia!AD22` | Công thức chỉ số không theo bộ lọc hiển thị; CĐ-03. |
| BG-04 | KH công thức ba lớp ngày 12/09 | Không tự phân lớp khoản mới CĐ-02. |
| BG-05 | KH chọn chung cả báo giá | CĐ-01 với nhánh TMC; lưu điều chỉnh là ĐX. |
| BG-06 | KH nhắc AI sau họp; phạm vi ảnh/PDF trong hồ sơ dự án | Thứ tự làm/kiểm soát bản nháp là ĐX, không phải lịch hoãn khách đã duyệt. |
| DM-01 | KH chọn vật liệu/mác/đặc tính, tên gợi ý; KH mới nội dung 4 yêu cầu thương hiệu thiết bị; PA1 dòng 23–26 và phần danh mục | Sinh mã/lọc có nguồn PA; cách tổ chức trường thương hiệu/chọn hãng là ĐX. |
| DM-02 | PA1 phần quy ước; PA2 dòng 173–193 | Nhập dữ liệu tra ngay trong đơn, không ép hình học. |
| DM-03 | PA1 phần khổ mua; PA2 dòng 129–153 | Ngưỡng mm phải được khai, không tự đặt số cố định. |
| DM-04 | PA1 phần tạo trống/thư viện; PA2 dòng 129–143, 261–273 | Cây phải đọc được xuyên các bảng. |
| DM-05 | KH chú thích liên kết kích thước | Cơ chế kiểm tham chiếu/khóa snapshot là ĐX. |
| UX-01 | KH bốn nhóm màu tương phản | Nhãn/thụt cấp/thử thang xám là ĐX. |
| TC-01 | KH lượng bám bản chất; XL `XD Gia!BF4` | Định danh cây là ĐX; không tự thêm gom lô. |
| TC-02 | KH công việc theo ba cấp; PA2 dòng 43–65, 97–125 | Phương pháp chung từng nguyên công; không xóa dòng khi thuê đã gồm. |
| TC-03 | KH công thức yếu tố; PA2 dòng 77–95, 355–363; XL `Data!AB4` | Không biến hệ số nhân thành phần tăng, không chung độ khó mọi việc. |
| TC-04 | KH hoàn thiện sinh vật tư; PA1 phần định mức, PA2 dòng 53–65 | Theo diện tích xử lý thực, không đếm vật tư phát sinh hai lần. |
| TC-05 | KH tách vận chuyển; PA2 dòng 201–257 | Nhiều cách đo và công thức yếu tố, không chỉ giá gói. |
| TC-06 | KH trọn gói; PA2 dòng 305–329; XL công thức nêu ngay tại mục | CĐ-01 chưa được giải đáp bằng việc đổi tên phương án. |
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

## 13. Các điểm còn cần đối chiếu — không tự quyết thay khách

Các điểm dưới đây không làm dừng toàn bộ dự án. Làm phần đã đủ căn cứ; chưa đóng mục tính tiền liên quan khi chưa giải quyết điểm CĐ. Khi có câu trả lời, lưu nguyên văn, ngày/nguồn và cập nhật đúng ID, không ghi đè lời cũ.

| Mã | Còn thiếu điều gì | Cách xử lý và điều kiện đóng | Ảnh hưởng |
| --- | --- | --- | --- |
| CĐ-01 | Chuỗi tạo giá TMC đầy đủ và nhánh không TMC trong đơn/sản phẩm pha trộn. | Dựng bảng số trung gian từ XL cho ba ca TC-06; đối chiếu công thức/đầu ra theo phản hồi mới. Bước nào chưa có căn cứ thì hỏi khách trên chính ví dụ đó. Không lấy câu “chọn chung phương án” để tự cấm hoặc tự đặt nhánh kết hợp. | TC-06, BG-02/BG-05 và chỉ số TMC tại BG-03. |
| CĐ-02 | Lắp đặt thiết bị là công việc nào, tiền thiết bị làm cơ sở là gì, thuộc lớp giá nào khi có cả việc tại xưởng/công trình. | Ghi rõ đối tượng, phạm vi, giá trị và lượng trong ví dụ; đối chiếu lớp giá với công thức KH, hỏi đúng công việc chưa rõ. Không xin lại tỷ lệ cố định; khách đã nói tỷ lệ thay đổi. | TC-07, phần lắp đặt tương ứng tại TC-05/BG-04. |
| CĐ-03 | Giá nhập thực tế đã/chưa gồm thuế và điều kiện thuế của ca báo giá. | Cho khai rõ tại đầu vào, đưa về cùng mặt bằng, kiểm bản xuất. Chưa xác nhận thì để trạng thái chưa xác nhận trước phát hành, không cộng thêm hoặc coi đã gồm ngầm. | BG-02/BG-03, GD-01/GD-03. |

Không hỏi lại khách: chọn chung toàn báo giá; kg theo phôi; đối thủ nhập theo sản phẩm; ba giá đã đầy đủ và khoản chuyển sang chỉ để đối chiếu; hệ số sửa được; cần AI, form đầu vào, công thức kích thước, bốn nhóm màu, lắp đặt thiết bị theo %/đơn giá.

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
