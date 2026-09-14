# Checklist triển khai sau cuộc họp 13/09

Ngày chốt tài liệu: 14/09/2026  
Phạm vi: luồng báo giá Trường Phát — dùng để bàn giao cho người hoặc bot tiếp tục sửa phần mềm.  
Trạng thái tài liệu: nội bộ, chưa phải biên bản nghiệm thu của khách.

> **Yêu cầu với người/bot thực hiện:** đọc hết phần “Quy tắc chốt” và các mục P0 trước khi sửa mã. Không lấy giao diện đang có làm đặc tả. Không đánh dấu hoàn thành chỉ vì đã có ô/nút; phải chạy đủ tiêu chí kiểm tra của từng mã.

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

## 2. Quy tắc chốt — không được hiểu khác

| Mã | Nội dung đã chốt | Hệ quả bắt buộc khi làm |
| --- | --- | --- |
| D01 | Mã vật tư là gốc của bóc tách và tính giá. | Mọi dòng phải giữ được liên kết tới mã vật tư; không nhập lại vật liệu/mác/đặc tính đã có. |
| D02 | Chọn **một phương án giá chung cho toàn báo giá**. | Không cho mỗi sản phẩm chọn một phương án khác nhau để tạo tổng hỗn hợp. Giá chốt riêng chỉ là điều chỉnh có lý do, không phải chọn lại phương án. |
| D03 | Phương án tính toán là phương án bóc chi tiết các khoản. | Chỉ phương án này hình thành giá theo chuỗi chi phí và hệ số chi tiết. |
| D04 | Giá theo kg, TMC và đối thủ **đã bao gồm toàn bộ chi phí**. | Không cộng tiếp vận chuyển, lắp đặt, quản lý sản xuất, lợi nhuận hoặc hệ số bán của phương án tính toán vào ba giá này. |
| D05 | Các khoản từ phương án tính toán có thể chuyển sang để đối chiếu. | Hiển thị chúng như tham số/cơ cấu tham khảo; không làm thay đổi tổng của kg/TMC/đối thủ. |
| D06 | AI bóc tách được bổ sung sau khi cấu trúc dữ liệu ổn định. | Không bỏ quên AI; triển khai sau khi mô hình khách hàng–hồ sơ–sản phẩm–vật tư đã ổn định. |
| D07 | Ngay lúc tạo báo giá phải nhận đủ thông tin và tài liệu. | Không bắt người dùng tạo hồ sơ rỗng rồi đi qua nhiều màn hình để nhập lại đầu vào. |
| D08 | Các hệ số là dữ liệu thay đổi được, số trong file chỉ minh họa. | Không hard-code số mẫu thành quy tắc nghiệp vụ. Lưu snapshot theo phiên bản báo giá. |
| D09 | Một công đoạn có thể ở cấp vật tư, cấu kiện hoặc sản phẩm. | Lượng và yếu tố phải lấy đúng đối tượng đang thực hiện; tránh cộng cùng công việc hai lần. |
| D10 | Thuế chưa được khách xác nhận là nằm trong giá trọn gói của ba phương án. | Giữ thuế thành điều kiện riêng sau giá chào; không tự gọi “toàn bộ chi phí” là đã có VAT. |
| D11 | Liên kết kích thước giữa các cấp là **công thức**, không phải chỉ lấy hai số bằng nhau. | Cho phép tham chiếu tham số cha/con và tính lại theo công thức; ví dụ `L vật tư A = W sản phẩm - 20` chỉ là ví dụ minh họa. |
| D12 | Phải nhận ra ngay bốn loại dòng trong cây cấu thành. | Tạo độ tương phản rõ cho sản phẩm, cấu kiện, vật tư trong cấu kiện và vật tư trực tiếp trong sản phẩm; không chỉ dựa vào màu. |
| D13 | Thiết bị/linh kiện có thể có chi phí lắp đặt riêng ngoài giá mua. | Cho chọn tính theo phần trăm giá trị thiết bị hoặc đơn giá cụ thể; tách với lắp đặt tại công trình và chống cộng trùng. |

Nguồn mới nhất cho D04–D07: [phản hồi bổ sung sau họp](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt).

## 3. Ký hiệu trạng thái

- `[ ]` Chưa hoàn thành hoặc chưa kiểm tra lại sau yêu cầu mới.
- `[~]` Đã có một phần trong bản hiện tại nhưng cần sửa/kiểm thử lại.
- `[x]` Chỉ dùng sau khi có bằng chứng kiểm thử khớp mã nguồn đang bàn giao.
- `P0`: sai là có thể ra giá sai hoặc làm lệch luồng chính.
- `P1`: bắt buộc để hoàn chỉnh nghiệp vụ báo giá.
- `P2`: nối vận hành/ERP; không được tự nhận đã xong trong demo.

## 4. P0 — sửa ngay trước lần gửi khách tiếp theo

### [ ] BG-01 — Gộp đầu vào vào bước “Tạo báo giá mới”

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

Cho phép “Lưu nháp” khi thiếu dữ liệu chưa bắt buộc; nhưng trước tính/chọn giá phải báo rõ trường nào còn thiếu. Sau khi tạo, mọi dữ liệu nằm trong **cùng một hồ sơ báo giá**, sửa ở đâu cũng cập nhật cùng nguồn, không tạo hai bản sao lệch nhau.

**Kiểm tra đạt:** tạo một báo giá mới từ đầu, chọn khách, nhập dự án/hạn chào/yêu cầu, đính kèm một PDF; mở lại báo giá vẫn thấy đủ dữ liệu và tải đúng tệp gốc. Không phải nhập lại ở bước bóc tách.

**Đối chiếu:** P1 dòng 200–206; [ảnh demo tại 00:46:00](frames/video_00-46-00.png); mã hiện tại `team-access-ui.js:11`, `intake-ui.js:11`.

![Màn hình hồ sơ yêu cầu đang nằm sau bước tạo báo giá](checklist-images/06-ho-so-yeu-cau.png)

### [~] BG-02 — Sửa/khóa đúng bản chất ba phương án giá trọn gói

**Phải sửa phép tính:**

- Chi tiết: tính từ các khoản chi phí và hệ số theo BG-04.
- Kg: `khối lượng phôi sản phẩm × đơn giá/kg`; kết quả này là giá đầy đủ của phương án.
- TMC: kết quả theo bảng/công thức TMC là giá đầy đủ của phương án đối với phần áp dụng.
- Đối thủ: `số lượng × giá đối thủ từng sản phẩm`; kết quả này là giá đầy đủ của phương án.
- Không lấy giá gốc chi tiết rồi cộng/nhân tiếp vào kg, TMC hoặc đối thủ.
- Không dùng chi phí chi tiết làm “giá gốc” để tính tiếp lợi nhuận cho ba phương án.
- Nếu thiếu giá đầu vào, trạng thái là **Chưa đủ dữ liệu**, không biến thành 0 đồng.

**Kiểm tra đạt:** đặt các khoản vận chuyển/quản lý/lắp đặt của phương án chi tiết thành số khác 0; tổng kg/TMC/đối thủ không đổi. Chỉ cột tham số đối chiếu thay đổi. Test phải bắt được lỗi cộng trùng.

**Hiện trạng cần chú ý:** `pricing-core.js:137–145` đã thay giá chào của kg/đối thủ bằng giá nhập trọn gói và chỉ giữ chi phí chi tiết làm mốc so sánh; hướng này phù hợp nhưng phải có test chống cộng trùng. Riêng TMC ở `pricing-core.js:122–124` vẫn đi qua `makeCost(...)` và các lớp hệ số của phương án tính toán, nên phải rà/sửa để kết quả TMC là giá đầy đủ theo chính phương án TMC. Dòng mô tả “Kg / đối thủ dùng gốc chi tiết” ở `pricing-ui.js` phải viết rõ đó chỉ là **gốc tham chiếu để đối chiếu**, không phải khoản cộng vào giá chào.

**Đối chiếu hình:** [bảng giá đầu vào 01:18:00](frames/video_01-18-00.png), [TMC/giá kg/đối thủ 01:20:00](frames/video_01-20-00.png), [ảnh bản hiện tại](../../artifacts/customer-review/implemented-2026-09-13/07-so-sanh-4-phuong-an.png).

![Bảng giá đầu vào dùng làm cơ sở lựa chọn](checklist-images/11-don-gia-dau-vao.png)

![Khu vực giá kg, đối thủ và TMC trong demo](checklist-images/12-bon-phuong-an.png)

### [ ] BG-03 — Bảng đối chiếu 4 phương án không cộng trùng chi phí

Mỗi cột phương án phải có tối thiểu:

- tổng giá trước thuế của phương án;
- giá quy đổi/kg phôi;
- chênh lệch tiền và tỷ lệ so với phương án chi tiết;
- giá đối thủ và chênh lệch thị trường;
- các khoản vật tư, nguyên công, vận chuyển, lắp đặt, quản lý... lấy từ phương án chi tiết dưới nhãn **tham số đối chiếu**;
- phần chênh còn lại = giá phương án trọn gói − tổng các khoản tham chiếu đã chọn, có tên rõ, không gọi mặc định là “lãi ròng”.

Người dùng chọn một cột làm căn cứ cho toàn báo giá. Mọi điều chỉnh giá cuối phải lưu lý do, người sửa và phiên bản.

**Kiểm tra đạt:** tổng cột trọn gói đúng giá nhập/công thức riêng dù ẩn/hiện cơ cấu tham chiếu; chọn phương án không sửa ngược dữ liệu đầu vào của các cột khác.

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

**Kiểm tra đạt:** test độc lập từng lớp; giao hàng/lắp đặt không bị nhân hệ số sản xuất; các hệ số bán nhân nối tiếp, không cộng gộp; `20%` được lưu/hiểu là `0,20` trong phép `(1 + hs)`.

**Nguồn:** [công thức khách gửi](../../docs/nguon/2026-09-12-cong-thuc-gia-khach-bo-sung.txt).

### [~] BG-05 — Chọn một phương án chung cho toàn báo giá

Giữ bốn cột để so sánh nhưng chỉ có một lựa chọn cấp báo giá. Không đặt nút chọn phương án trên từng sản phẩm. Cho xem đơn giá từng sản phẩm do phương án đã chọn sinh ra; nếu sửa giá cuối từng sản phẩm thì phải có lý do và tổng vẫn ghi phương án gốc.

**Kiểm tra đạt:** chọn TMC làm căn cứ thì toàn báo giá chuyển sang TMC; không có sản phẩm A theo kg và B theo đối thủ trong cùng một phiên bản.

### [ ] BG-06 — AI bóc tách tạo bản nháp có kiểm soát

**Thứ tự triển khai:** hoàn thiện BG-01 và mô hình cấu thành trước; sau đó nối AI.  
**Luồng bắt buộc:**

1. Người dùng đính kèm ảnh/PDF; Excel/CSV có cấu trúc thì ưu tiên nhập bảng trực tiếp.
2. Hệ thống lưu tệp gốc bất biến và tạo một “lần bóc tách”.
3. AI đề xuất sản phẩm, thông số, số lượng, đơn vị và ghi chú; mỗi giá trị giữ được nguồn tệp/trang/vùng và mức chắc chắn nếu nhà cung cấp hỗ trợ.
4. Dòng không chắc hoặc thiếu số liệu phải được đánh dấu; không tự điền số đo, mã vật tư hay công thức.
5. Người dùng duyệt/sửa trước khi đưa vào cấu thành và tính giá.
6. Lưu lịch sử dữ liệu AI đề xuất và dữ liệu người dùng đã duyệt.

AI không tự duyệt giá, không tự chọn phương án và không ghi đè dòng đã xác nhận. Phạm vi đã có căn cứ là ảnh/PDF cho cấu kiện đơn giản; không tự tuyên bố đọc chính xác mọi CAD/3D.

**Kiểm tra đạt:** dùng một PDF rõ và một ảnh mờ. PDF rõ sinh bản nháp có nguồn; ảnh mờ tạo cảnh báo và không bịa số. Sửa kết quả rồi chạy lại AI không được âm thầm ghi đè bản đã duyệt.

## 5. P1 — danh mục và đầu vào dùng lại

### [~] DM-01 — Danh mục vật tư theo nhóm, trường nhập phụ thuộc loại

- Nhóm mở rộng được: phôi gia công; linh kiện/thiết bị; vật tư tiêu hao; xăng dầu; vật tư phụ.
- Mã có thể sinh tự động; tên được gợi ý từ vật liệu + hình dạng + mác + đặc tính + quy cách nhưng người dùng được sửa.
- Vật liệu, mác, đặc tính là các lựa chọn liên kết; mác và đặc tính là hai nhánh song song thuộc vật liệu.
- Phôi mới có trường hình dạng/kích thước kỹ thuật phù hợp. Linh kiện không bị ép nhập dài–rộng–cao; dùng một ô thông số kỹ thuật.
- Khối lượng riêng lấy từ vật liệu; giá và khổ mua tách khỏi quy cách mã.

**Kiểm tra đạt:** chọn Thép chỉ thấy mác/đặc tính phù hợp; đổi vật liệu làm sạch lựa chọn không hợp lệ; tên gợi ý cập nhật nhưng không ghi đè tên người dùng đã tự sửa.

**Đối chiếu:** P1 00:03:03–00:08:10 và 00:15:26–00:20:47; [form vật tư hệ thống tham khảo](frames/video_00-10-00.png), [mác vật liệu](frames/video_00-20-00.png), [form bản hiện tại](../../artifacts/customer-review/implemented-2026-09-13/04-vat-tu-chon-va-goi-y-ten.png).

![Form vật tư hệ thống khách dùng để tham khảo cấu trúc](checklist-images/01-vat-tu.png)

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

Thép hình đặc thù phải cho lưu dữ liệu tra kg/m và diện tích/m, không ép mọi tiết diện dùng công thức hình học đơn giản.

**Kiểm tra đạt:** cùng bộ đầu vào cho cùng kết quả giữa màn thử và báo giá; một công thức lỗi bị chặn với thông báo chỉ rõ biến; bản đã duyệt giữ số cũ sau khi sửa quy ước.

**Đối chiếu:** P1 00:08:12–00:14:14; [màn sửa công thức 00:16:00](frames/video_00-16-00.png), [bảng quy ước bản demo 01:08:00](frames/video_01-08-00.png).

![Cách tham khảo để khai và thử công thức](checklist-images/02-cong-thuc.png)

![Bảng quy ước hình dạng trong bản demo](checklist-images/15-quy-uoc-hinh-dang.png)

### [~] DM-03 — Khổ mua chuẩn và phần dư

- Khổ tấm/thanh là dữ liệu kho/mua hàng, tách khỏi mã vật tư.
- Cho chọn nhiều khổ chuẩn theo năng lực máy/xưởng và nhập khổ đặc thù cho đơn.
- Phân biệt phần dư đủ điều kiện tái sử dụng với phế liệu.
- Người lập chọn giữ phần dư hay tính vào hao hụt, có giải thích tác động giá.
- Kết quả phải có bảng theo từng mã: nhu cầu, phương án xếp/cắt, hao hụt, phần dư giữ lại và lượng mua.

**Kiểm tra đạt:** đổi khổ mua chỉ đổi phương án cắt/hao hụt, không đổi quy cách mã; phần dư giữ lại không bị tính đồng thời là hao hụt.

**Đối chiếu:** P1 00:20:50–00:22:48; P2 về phần dư; [khổ chuẩn 00:26:00](frames/video_00-26-00.png), [hao hụt/phần dư 01:04:00](frames/video_01-04-00.png).

![Danh mục khổ chuẩn tham khảo](checklist-images/04-kho-chuan.png)

![Bảng hao hụt và phần dư trong bản demo](checklist-images/09-hao-hut-phan-du.png)

### [~] DM-04 — Thư viện mẫu và tạo nhanh tại báo giá

- Thư viện gom sản phẩm/cấu kiện mẫu, không kéo mọi danh mục thành mục menu riêng.
- Trong báo giá thêm được dòng sản phẩm, cấu kiện hoặc vật tư trống.
- Có thể lấy mã/mẫu gần giống, sửa thành mã mới rồi chủ động lưu về danh mục.
- Không sửa đè mã/mẫu gốc; phải hiện rõ đang tạo bản sao.
- Cùng một cây sản phẩm–cấu kiện–vật tư phải đi xuyên các bước sau.

**Kiểm tra đạt:** tạo sản phẩm mới từ dòng trống; tạo biến thể từ mẫu; sửa biến thể không làm đổi mẫu gốc; tải lại báo giá vẫn giữ đúng quan hệ cha–con.

**Đối chiếu:** P1 00:26:58–00:29:49; [dòng sản phẩm/cấu kiện trống 00:32:00](frames/video_00-32-00.png).

![Dòng trống để thêm cấu thành trực tiếp](checklist-images/05-cau-thanh-dong-trong.png)

### [ ] DM-05 — Liên kết kích thước bằng công thức, không sao chép bằng nhau

- Mỗi kích thước của sản phẩm, cấu kiện hoặc vật tư có thể là giá trị cố định, giá trị nhập tay hoặc kết quả công thức.
- Công thức được tham chiếu rõ tham số của chính dòng và dòng cha, ví dụ `vật_tư_A.L = sản_phẩm.W - 20`. Ví dụ này do khách nêu để mô tả cơ chế, không phải quy tắc mặc định cho mọi vật tư.
- Khi tham số nguồn đổi, toàn bộ giá trị phụ thuộc phải tính lại theo thứ tự và kéo theo khai triển, khối lượng, diện tích, giá.
- Trên giao diện phải thấy cả công thức đang dùng và kết quả đã tính; không dùng riêng ký hiệu `↔` khiến người dùng hiểu là hai số luôn bằng nhau.
- Cho phép chủ động chuyển về giá trị cố định hoặc thay công thức, đồng thời lưu người sửa, phiên bản và công thức trong snapshot báo giá.
- Chặn tham chiếu vòng, tham số không tồn tại, sai đơn vị, chia cho 0 và kết quả âm/không hợp lệ; thông báo phải chỉ đúng dòng và biến lỗi.

**Kiểm tra đạt:** đặt `W sản phẩm = 600` và công thức `L vật tư = W sản phẩm - 20` cho kết quả 580; đổi `W` thành 700 thì kết quả thành 680 và các đại lượng phụ thuộc được tính lại. Kích thước cố định khác không đổi. Công thức vòng bị chặn trước khi lưu.

**Đối chiếu giao diện hiện tại:** [ảnh kích thước cha–con đang hiển thị liên kết trực tiếp](../../artifacts/customer-review/09-new-variant-pass.png). Ảnh này xác định vùng cần sửa; yêu cầu công thức lấy từ chú thích mới của khách, không suy ra chỉ từ ảnh hiện trạng.

![Vùng kích thước cha và vật tư con cần chuyển sang liên kết bằng công thức](../../artifacts/customer-review/09-new-variant-pass.png)

### [ ] UX-01 — Phân biệt rõ bốn loại dòng trong cây cấu thành

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

Số lượng thực hiện của một dòng = số lượng qua chuỗi cha × số lượng của dòng. Dùng khóa cha–con, không dùng “dòng gần nhất phía trên” như Excel. Theo công thức Excel hiện có, hệ số số lượng xét trên dòng/đối tượng đó; chưa có quy tắc cộng gộp mọi dòng cùng mã ở nhiều sản phẩm thành một lô.

**Kiểm tra đạt:** sản phẩm 2 × cấu kiện 3 × vật tư 4 = 24; đổi thứ tự hiển thị không đổi kết quả; hai dòng cùng mã không tự cộng gộp nếu chưa có thao tác tạo lô.

### [~] TC-02 — Công đoạn đúng cấp và không tính hai lần

- Khai công đoạn tại vật tư/cấu kiện/sản phẩm.
- Cấp trên chỉ bổ sung việc thực sự làm sau khi ghép cấp con.
- Với từng nguyên công, chọn một phương pháp tính chung cho toàn báo giá; không hiểu thành tất cả nguyên công cùng một đơn vị hoặc cùng đơn giá.
- Mặc định tại xưởng; đánh dấu thuê ngoài đúng phần.
- Thuê trọn sản phẩm/cấu kiện/công đoạn phải ghi rõ bên cấp vật tư và công việc sau khi nhận về.
- Gói thuê đã gồm vật tư/công việc nào thì không cộng lại khoản đó.

**Kiểm tra đạt:** công đoạn hàn ở vật tư và hàn bổ sung ở cấu kiện được phân biệt bằng đối tượng/công việc; chọn “thuê đã gồm vật tư” làm mất đúng dòng vật tư liên quan, không xóa vật tư khác.

**Đối chiếu:** P2 về công đoạn và thuê ngoài; [ma trận công đoạn bản tham khảo 00:50:00](frames/video_00-50-00.png), [bảng công đoạn bản demo 00:56:00](frames/video_00-56-00.png).

![Ma trận chọn yếu tố/công đoạn dùng để hiểu cách thao tác tổng thể](checklist-images/07-ma-tran-cong-doan.png)

![Bảng công đoạn của bản demo](checklist-images/08-cong-doan.png)

### [~] TC-03 — Đơn giá nguyên công theo yếu tố tác động

`Đơn giá áp dụng = Giá gốc × (1 + hs1) × (1 + hs2) × ...`

- Yếu tố được gắn cho từng nguyên công; có loại khoảng số và danh sách giá trị.
- Tham số lấy đúng cấp đang gia công: số lượng, khối lượng, chiều dày, kích thước, độ phức tạp...
- Các bậc phải có biên rõ: trên mốc trước đến hết mốc hiện tại; trên mốc cuối dùng bậc cuối nếu cấu hình như vậy.
- Cho thêm bậc/yếu tố; không cố định số cột mẫu.
- Giá tại xưởng và thuê ngoài tách biệt.

**Kiểm tra đạt:** kiểm đúng giá ở dưới biên, đúng biên, trên biên và trên mốc cuối; 20% làm đơn giá tăng 20%, không thành nhân 2,0 hoặc 120% hai lần.

**Đối chiếu:** [cấu hình yếu tố và bảng bậc 01:26:00](frames/video_01-26-00.png); Excel `Data!AB4`, `XD Gia!BF4`.

![Cấu hình yếu tố số lượng và bảng bậc](checklist-images/14-bang-yeu-to.png)

### [~] TC-04 — Hoàn thiện bề mặt sinh vật tư theo định mức

- Sơn/mạ/làm sạch là công đoạn nhưng được nhóm riêng để thấy phần thuê ngoài và vật tư phát sinh.
- Tiền công/máy tách khỏi vật tư hoàn thiện.
- Chọn phương pháp hoàn thiện phải sinh nhu cầu mã vật tư tương ứng theo diện tích/khối lượng, định mức, số lớp và hao hụt.
- Dùng lại mã sơn/mạ có sẵn; không tạo mã danh mục mới mỗi lần tính.
- Tổng hợp được lượng vật tư hoàn thiện cần mua.

**Kiểm tra đạt:** thay diện tích hoặc số lớp làm lượng sơn thay đúng tỷ lệ; thuê ngoài đã gồm sơn không cộng vật tư sơn lần hai.

### [~] TC-05 — Tách vận chuyển và lắp đặt theo bản chất

Tách ít nhất:

- vận chuyển nhập vật tư;
- vận chuyển đi/nhận lại hàng thuê ngoài;
- vận chuyển giao khách;
- lắp đặt.

Mỗi khoản có phạm vi đối tượng, nguồn–đích/tuyến, số lượt, lượng vận chuyển, đơn vị/cách tính, giá và cơ sở phân bổ. Lắp đặt khai theo từng sản phẩm, có thể theo cái/mét/bộ/trọn gói. Tổng phân bổ phải bằng tổng khoản chi, kể cả làm tròn; không chia sang sản phẩm không thuộc chuyến.

**Kiểm tra đạt:** chuyến đi và chuyến về không bị gộp mất; hai tuyến không phân bổ chéo; giá trọn gói không bị nhân thêm lượng.

**Đối chiếu:** [màn vận chuyển/lắp đặt 01:12:00](frames/video_01-12-00.png).

![Các nhóm vận chuyển và lắp đặt trong demo](checklist-images/10-van-chuyen-lap-dat.png)

### [ ] TC-06 — TMC là bảng giá riêng nhưng tổng phương án là trọn gói

- Chỉ áp cho nhóm thang/máng/phụ kiện phù hợp.
- Có hệ số hao hụt riêng và bảng nhân công theo chủng loại, khổ/kích thước, đơn vị thân/nắp/phụ kiện.
- Khoản nhân công TMC đã gộp công việc nào thì không cộng lại nguyên công chi tiết đó.
- Theo phản hồi mới, **tổng phương án TMC là giá đã gồm toàn bộ chi phí**. Phân rã từ phương án chi tiết chỉ để đối chiếu.
- Dòng thuộc TMC nhưng thiếu bảng/giá phải báo thiếu; không tự rơi về 0 hoặc lặng lẽ dùng giá khác.

**Kiểm tra đạt:** hàng không thuộc TMC không được mang nhãn TMC; hàng thuộc TMC thiếu bậc bị chặn; thay chi phí chi tiết tham khảo không làm đổi tổng giá TMC.

### [ ] TC-07 — Chi phí lắp đặt riêng của thiết bị/linh kiện

- Với mã thuộc nhóm thiết bị/linh kiện, ngoài giá mua phải cho khai chi phí lắp đặt của chính chi tiết đó.
- Mỗi mã/dòng chọn một trong các cách: không có chi phí; đã gồm trong giá nhà cung cấp; phần trăm trên giá trị thiết bị; hoặc đơn giá lắp đặt cụ thể.
- Nếu theo phần trăm: `chi phí lắp đặt chi tiết = giá trị thiết bị × tỷ lệ`. Nếu theo đơn giá: tính đúng theo đơn vị và số lượng của dòng.
- Khoảng 20–30% khách nêu chỉ là ví dụ để mô tả cách tính, không được đặt thành mặc định cứng.
- Hiển thị tách giá mua thiết bị và chi phí lắp đặt chi tiết trước khi cộng vào phương án tính toán.
- Phân biệt khoản này với công đoạn lắp ráp đã khai và lắp đặt toàn bộ sản phẩm tại công trình. Trường “đã gồm” phải ngăn cộng trùng.
- Khi đối chiếu phương án kg/TMC/đối thủ, khoản này chỉ là cơ cấu tham khảo từ phương án tính toán; không cộng thêm vào ba tổng giá trọn gói.

**Kiểm tra đạt:** thiết bị giá 10.000.000 đồng, tỷ lệ thử 20% cho chi phí lắp đặt 2.000.000 đồng; chuyển sang đơn giá thử 1.500.000 đồng/thiết bị thì tổng đi theo số lượng. Chọn “đã gồm” cho kết quả cộng thêm bằng 0 và không đồng thời tính ở công đoạn/lắp đặt công trình.

**Đối chiếu giao diện hiện tại:** [ảnh khu vực giá riêng của báo giá](../../artifacts/customer-review/implemented-2026-09-13/05-gia-rieng-cua-bao-gia.png). Cần bổ sung cấu hình chi phí lắp đặt thiết bị tại dữ liệu giá/dòng thiết bị tương ứng.

![Khu vực giá cần bổ sung chi phí lắp đặt thiết bị và linh kiện](../../artifacts/customer-review/implemented-2026-09-13/05-gia-rieng-cua-bao-gia.png)

## 7. P1 — giá đầu vào, duyệt và đầu ra

### [~] GD-01 — Giá tham chiếu và giá áp dụng của từng báo giá

- Danh mục giữ lịch sử giá theo mã/đơn vị/ngày.
- Báo giá chọn hoặc nhập giá áp dụng rồi lưu snapshot.
- Sửa danh mục không tự đổi báo giá đã lưu/đã duyệt.
- Có thao tác cập nhật giá có xác nhận và báo rõ dòng thay đổi.
- Giá kg nhập theo sản phẩm hoặc quy tắc của đơn; giá đối thủ nhập riêng từng sản phẩm.

**Kiểm tra đạt:** tạo hai báo giá cùng mã vật tư, cập nhật danh mục; báo giá cũ giữ giá, báo giá mới lấy giá mới. Cập nhật không xóa đơn giá đã chỉnh riêng nếu chưa xác nhận.

### [~] GD-02 — Hệ số mở, chia đúng lớp và có quyền sửa

- Nhóm hệ số giá sản xuất, giá gốc và giá bán phải rõ tác động.
- Cho thêm yếu tố có tên/căn cứ; không dùng một ô “khác” để che mọi khoản.
- Lưu người sửa, thời điểm và phiên bản.
- Quyền xem giá vốn/lợi nhuận, sửa hệ số và duyệt giá cuối tách biệt.

**Kiểm tra đạt:** tài khoản kinh doanh chỉ thấy bản giá bán đã duyệt; không nhận giá vốn qua giao diện/API. Đổi hệ số trên bản nháp không làm đổi phiên bản đã duyệt.

**Đối chiếu:** [nhóm hệ số 01:24:00](frames/video_01-24-00.png).

![Khu vực hệ số trong demo cần tổ chức theo đúng lớp giá](checklist-images/13-he-so.png)

### [~] GD-03 — Bản chào giá chuyên nghiệp và nhất quán

- Thông tin khách/người nhận/công trình lấy từ hồ sơ, không nhập lại.
- Một ô “Thông số kỹ thuật” cho từng sản phẩm như khách góp ý.
- Có số lượng, đơn vị, đơn giá, thành tiền, thuế, vận chuyển/lắp đặt nếu thể hiện riêng, tổng thanh toán.
- Điều kiện hiệu lực, giao hàng, thanh toán, bảo hành và ghi chú phải theo báo giá đang chốt.
- Chỉ có phần ký của đơn vị chào giá nếu dùng mẫu báo giá một bên ký.
- Kiểm tra câu chữ “đã/chưa VAT”, “đã/chưa vận chuyển/lắp đặt” không mâu thuẫn.

**Kiểm tra đạt:** bản in/PDF/Excel chỉ chứa giá bán được duyệt, không lộ giá vốn/hệ số; tổng các dòng khớp tổng thanh toán; thông tin khách đúng snapshot.

### [~] GD-04 — Trạng thái, lịch sử và không ghi đè

Giữ trạng thái giao dịch riêng với duyệt nội bộ. Bản đã duyệt là bất biến; chỉnh tiếp tạo phiên bản mới. Lưu lịch sử ai sửa, ai trình, ai duyệt, phương án được chọn, giá chốt và lý do điều chỉnh.

**Kiểm tra đạt:** hai người cùng mở một báo giá không ghi đè im lặng; người không có quyền không duyệt được; khôi phục phiên bản cũ chỉ tạo bản sao làm việc.

## 8. P2 — nối sang vận hành thực tế

### [ ] ERP-01 — Hồ sơ chuyển sản xuất

Sau khi báo giá/đơn hàng được chốt, chuyển nguyên cấu trúc đã duyệt: sản phẩm–cấu kiện–vật tư, công đoạn, tự làm/thuê ngoài, định mức, lượng, giá kế hoạch và phiên bản. Không tạo lại mã bằng tay ở sản xuất.

### [ ] ERP-02 — Đối chiếu kế hoạch và thực tế

Chi phí thực tế phải ghi về đúng đầu mục: vật tư, công đoạn tại xưởng, thuê ngoài, hoàn thiện, vận chuyển từng loại, lắp đặt và chi phí chung. Báo cáo so kế hoạch–thực tế theo đơn/sản phẩm/chỉ số để điều chỉnh tham số về sau. Đây là yêu cầu nối ERP, không được đánh dấu hoàn thành chỉ vì bảng báo giá có cột chi phí.

## 9. Thứ tự thực hiện để không phải làm lại

1. BG-01: ổn định hồ sơ tạo báo giá và nơi lưu tệp.
2. DM-01 → DM-05 và UX-01: ổn định danh mục, quy ước, liên kết công thức và cách đọc cây cấu thành.
3. TC-01 → TC-07: ổn định lượng, công đoạn, hao hụt, logistics và lắp đặt thiết bị.
4. BG-04, BG-02, BG-03, BG-05: sửa bộ tính và bảng so sánh theo quyết định mới.
5. GD-01 → GD-04: snapshot, duyệt và đầu ra.
6. BG-06: nối AI vào cấu trúc đã ổn định.
7. Chạy một báo giá thật cùng khách, ghi sai lệch thành ca kiểm thử.
8. Sau nghiệm thu phần báo giá mới nối ERP-01/ERP-02 theo kế hoạch dự án.

## 10. Bộ kiểm thử nghiệm thu tối thiểu

### Ca A — tạo hồ sơ và tài liệu

- [ ] Tạo khách mới ngay trong form báo giá.
- [ ] Nhập công trình, hạn chào, tiến độ, yêu cầu kỹ thuật.
- [ ] Đính kèm PDF và Excel; tải lại đúng tệp sau khi đăng nhập lại.
- [ ] Đưa dòng yêu cầu sang cấu thành mà không nhập lại.

### Ca B — cấu thành và số lượng

- [ ] Sản phẩm 2 × cấu kiện 3 × vật tư 4 = 24.
- [ ] Đảo/sắp xếp dòng không đổi kết quả.
- [ ] Tạo biến thể không sửa mẫu gốc.
- [ ] `W sản phẩm = 600`, `L vật tư = W sản phẩm - 20` cho 580; đổi `W = 700` cho 680.
- [ ] Công thức vòng hoặc tham chiếu biến thiếu bị chặn, không giữ giá cũ như thể hợp lệ.
- [ ] Nhận ra đúng bốn loại dòng bằng màu kết hợp nhãn/biểu tượng/thụt cấp; không phụ thuộc riêng vào màu.

### Ca C — công thức và hao hụt

- [ ] Kiểm tấm 1.000 × 200 × 2 mm với khối lượng riêng thử 7.850 kg/m³ cho 3,14 kg/chi tiết.
- [ ] Đổi khổ mua làm thay hao hụt nhưng không đổi mã vật tư.
- [ ] Phần dư giữ lại không đồng thời tính vào hao hụt.

### Ca D — công đoạn và thuê ngoài

- [ ] Kiểm tra bậc dưới biên/đúng biên/trên biên.
- [ ] Công đoạn tại xưởng và thuê ngoài lấy đúng đơn giá/cơ sở.
- [ ] Gói thuê gồm vật tư không cộng vật tư lần hai.
- [ ] Sơn theo diện tích × định mức × số lớp sinh đúng lượng vật tư.
- [ ] Lắp đặt thiết bị tính đúng theo phần trăm hoặc đơn giá cụ thể và nhân đúng số lượng.
- [ ] Lắp đặt thiết bị đã gồm trong giá/công đoạn không bị cộng lại với lắp đặt tại công trình.

### Ca E — bốn phương án

- [ ] Phương án chi tiết khớp công thức ba lớp.
- [ ] Kg = kg phôi × giá/kg; không cộng thêm chi phí chi tiết.
- [ ] TMC là giá đầy đủ; không cộng thêm quản lý/vận chuyển từ chi tiết.
- [ ] Đối thủ = số lượng × giá đối thủ; không nhân thêm lợi nhuận/hệ số bán.
- [ ] Thay chi phí tham khảo của chi tiết không làm đổi ba tổng trọn gói.
- [ ] Thiếu giá đầu vào hiển thị “Chưa đủ dữ liệu”, không phải 0 đồng.
- [ ] Chỉ chọn được một phương án cho toàn báo giá.

### Ca F — duyệt và xuất

- [ ] Người không có quyền không sửa hệ số/duyệt dưới giá gốc.
- [ ] Bản duyệt giữ nguyên khi danh mục giá đổi.
- [ ] PDF/Excel khớp tổng và không lộ giá vốn.
- [ ] Điều kiện VAT/vận chuyển/lắp đặt hiển thị nhất quán.

### Ca G — AI

- [ ] PDF rõ sinh bản nháp có nguồn đối chiếu.
- [ ] Ảnh mờ bị cảnh báo, không bịa số.
- [ ] Người dùng phải xác nhận trước khi nhập vào cấu thành.
- [ ] Chạy lại không ghi đè dữ liệu đã duyệt.

## 11. Điều kiện được đánh dấu hoàn thành

Một mã chỉ đổi sang `[x]` khi có đủ:

1. mã nguồn đã sửa;
2. bài kiểm thử tự động hoặc kịch bản thao tác tái hiện được;
3. ảnh/video kết quả của đúng bản build;
4. số phiên bản hoặc SHA-256 của bản đã kiểm tra;
5. không còn cảnh báo sai nghĩa theo D01–D13.

“Có giao diện”, “test cũ vẫn xanh” hoặc “khách nói gần ổn” không đủ để đánh dấu hoàn thành. Nghiệm thu của khách là trạng thái riêng.

## 12. Nguồn đối chiếu

- [Phản hồi mới nhất sau cuộc họp](../../docs/nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt)
- [Bản chép phần 1](transcripts/HAI-PHAN-01.txt)
- [Bản chép phần 2](transcripts/HAI-PHAN-02.txt)
- [Công thức khách gửi](../../docs/nguon/2026-09-12-cong-thuc-gia-khach-bo-sung.txt)
- [Rà công thức Excel và câu hỏi](RA-SOAT-LAI-CAU-HOI.md)
- [Bảng công thức Excel](DOI-CHIEU-EXCEL.md)
- [Trang xem toàn bộ 47 ảnh và 16 clip](index.html)
- [README trạng thái dự án](../../README.md)

### Bản đồ ảnh và clip

Các ảnh trong `checklist-images` là bản cắt vùng chia sẻ màn hình từ khung hình gốc 1280 × 720; không chỉnh nội dung. Mở clip tương ứng để xem khoảng 10 giây trước và 30 giây sau mốc ảnh.

| Chủ đề | Ảnh cắt | Khung gốc | Clip có tiếng và hình |
| --- | --- | --- | --- |
| Form vật tư | [01](checklist-images/01-vat-tu.png) | [00:10:00](frames/video_00-10-00.png) | [00:09:50–00:10:30](clips/video_00-09-50_den_00-10-30.mp4) |
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
| Bảng yếu tố/bậc | [14](checklist-images/14-bang-yeu-to.png) | [01:26:00](frames/video_01-26-00.png) | [01:25:50–01:26:30](clips/video_01-25-50_den_01-26-30.mp4) |

### Cảnh báo nguồn

Bản chép P1/P2 do AI tạo, chưa nghe xác minh toàn bộ 90 phút. P2 không có mốc từng lượt nói. Ảnh khung hình chứng minh màn hình xuất hiện ở mốc video, không tự chứng minh câu nói cụ thể đồng bộ với ảnh. Khi số liệu/công thức mâu thuẫn, ưu tiên tin nhắn khách mới hơn và kiểm lại trên một báo giá thực tế.
