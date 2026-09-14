# So sánh và cài đặt theo nhóm — 14/09/2026

Phạm vi: phần yêu cầu mới của TC-06, BG-02, BG-03, BG-05. Không triển khai AI/ERP, không tự đổi mã vật tư theo Dày. Khách đồng ý hướng tổ chức theo tin người dùng xác nhận tại [nguồn 7–8](nguon/2026-09-14-phan-hoi-bo-sung-sau-hop.txt); không có xác nhận mới cho các công thức số còn thiếu.

## Phần đã triển khai

1. Phân loại sản phẩm bằng định danh nhóm. TMC chỉ áp cho sản phẩm thuộc nhóm TMC; phần ngoài TMC giữ tính chi tiết. Không đoán nhóm từ tên hay từ giá bị thiếu.
2. Chọn các cách muốn đối chiếu ở bước Giá hoặc Phân tích giá. Không có TMC thì không hiện TMC trong so sánh/lựa chọn áp dụng, không bắt khai đầu vào TMC để phát hành phương án chi tiết hợp lệ. Có nhóm nhưng thiếu giá hoặc chưa phân loại thì báo rõ, không trả giá 0 hợp lệ.
3. Chọn một phương án giá chào cuối ở khối riêng. Bật/tắt cột không đổi tổng, nguồn giá, hệ số, giá chốt tay hay xác nhận thuế. Khi bỏ sản phẩm cuối cùng của nhóm đang dùng làm giá chào, giữ lựa chọn cũ và báo không còn áp dụng; người lập phải chọn lại, không âm thầm đổi tiền.
4. Cài đặt tập trung theo nhóm: liên kết đến bảng nhân công/hao hụt, chuỗi TMC và hệ số chi tiết. Có thể thêm nhóm với tham số có tên, mã, đơn vị, công thức, nguồn và phạm vi đã gồm. Không cài giá/công thức cửa gió hoặc tủ điện giả làm dữ liệu khách.
5. Cấu hình được lưu trong từng báo giá; nhóm dùng lại cho các sản phẩm cùng nhóm trong báo giá đó. Nhân bản báo giá giữ bản sao độc lập. Bản đã duyệt khóa, thay tham số bản nháp yêu cầu rà lại căn cứ giá/thuế; máy chủ kiểm quyền sửa hệ số. Chưa bổ sung danh mục nhóm dùng chung xuyên báo giá trên Netlify.
6. Excel phân tích và bảng thuế nội bộ cùng lựa chọn cột với màn hình; sheet `Cong thuc nhom` ghi công thức, biến thực dùng, nguồn, tổng trước làm tròn và đơn giá/thành tiền. Giá gốc và các hệ số chi tiết trong cột công thức nhóm được ghi là tham khảo, không tự cộng thêm. Bản chào/XLSX/PDF khách chỉ chứa giá cuối và thông tin được phép công bố.

## Quy ước công thức nhóm

Kết quả là tổng trước thuế của một dòng sản phẩm. `Q`, `KG`, `AREA` là số lượng, kg phôi và m² **toàn dòng**; `COST`/`DETAIL` là tổng giá gốc/giá đề xuất chi tiết của dòng. `L/W/H/T` là kích thước chung mm, thiếu biến thì báo lỗi. Biến tự khai có tiền tố `P_`; tỷ lệ 10% dùng giá trị 10 và chia 100 trong công thức. Không nhân thêm hệ số chi tiết sau kết quả. Chia tổng cho Q, làm tròn đơn giá đồng rồi nhân Q theo quy ước hiện có. Số 0 khai tường minh khác dữ liệu thiếu/lỗi chia 0.

Mỗi phương án nhóm gồm nhánh công thức cho nhóm đó và nhánh chi tiết cho các sản phẩm ngoài nhóm, trên cùng phạm vi toàn đơn. Đây không phải lựa chọn phương án bán riêng từng dòng.

## Kiểm thử và bằng chứng

- Logic: **248/248**; máy chủ localhost: **46/46**. Có kiểm dữ liệu nhập lỗi, mất nhóm, sai công thức, nguồn giá thay đổi, không được sửa hệ số, khóa bản duyệt và loại thông tin riêng khỏi bản khách.
- Bộ trình duyệt mới: **14/14 nhóm**, thao tác thật từ chọn cột, tạo nhóm, khai tham số, phân loại, xác nhận giá/thuế, chọn giá, lưu/mở lại, duyệt đến tải XLSX/PDF; kiểm màn hình rộng và 390px.
- Ca nhóm QA độc lập: 30 kg × 120 + 3 sản phẩm × 100 = **3.900**; phần ngoài nhóm tính chi tiết **4.630**; toàn đơn **8.530 trước thuế + 682 thuế thử = 9.212**. TMC hỗn hợp giữ **10.009 trước thuế / 10.810 sau thuế** như ca hồi quy. Số này là QA, không phải bảng giá khách.
- Chạy lại: `node tools/verify-group-pricing.cjs`. Hồ sơ local ở `artifacts/customer-review/group-pricing-2026-09-14/`. Phiên trình duyệt riêng dùng dữ liệu QA, không sửa dữ liệu khách.
- Local đã đạt **9/9 tác vụ**, gồm build, logic, máy chủ và sáu bộ trình duyệt (nhóm mới, TMC, thuế, nguồn giá/bản chào, chế tạo, Dày). Đang xác minh Netlify; chưa ghi nhận triển khai web trong bản báo cáo này.

## Vì sao chưa được đóng trọn bốn mã

Giữ **TC-06/BG-02/BG-03/BG-05 `[~]`** cho điều kiện CĐ-01. Xong cơ chế cấu hình/so sánh không đồng nghĩa đã khớp công thức số của khách.

Đã đọc lại workbook gốc bằng XML, không sửa file; SHA-256 `0471d8036da78b19b635eb71e2e6ad2b30c82e0700765c72735271e1d2335e7e`. Các dòng mẫu `XD Gia!D4:D7` đều là chi tiết cơ khí, `BT4=0`, `CA4=0`. Chúng chỉ đi qua nhánh dùng công chi tiết và chi phí chung CB; chưa cho đáp án số của TMC thuần/đơn TMC hỗn hợp.

Điểm cần đối chiếu cụ thể: `CE4` chọn chi phí chung `CA4` hoặc `CB4`; `CB4` dùng cơ sở gồm cả các khoản BP/BQ/BR/BU/BV/BW/BY; `CM4` nhân trực tiếp `CI2` rồi chia lượng. Bộ bảy hệ số TMC hiện có không tự chứng minh đã tái hiện nhánh CA/CB và đầu ra này sau thay đổi công thức ngày 12/09. Không chuyển hệ số nhân thành phần trăm ngầm, không lấy một ô xác nhận làm bằng chứng khớp workbook.

Cần một bảng tính đã điền và tính ra tiền cho TMC thuần và đơn có TMC + cơ khí khác, gồm khoản giữ/thay, chi phí chung, hệ số và tổng cuối theo cách khách muốn dùng hiện nay. Không hỏi lại nhánh ngoài TMC hoặc hướng gom theo nhóm đã chốt. Ca một sản phẩm gộp hai phần chỉ cần nếu thực tế có.

Tổng checklist vẫn **17/25 hoàn tất; 8 mã còn mở**: DM-05, TC-06, BG-02, BG-03, BG-05, BG-06, ERP-01, ERP-02. Không dùng số tiểu chức năng của đợt này để giảm số mã còn lại. Netlify vẫn lưu dữ liệu trong trình duyệt; kiểm máy chủ localhost không phải triển khai ERP/server sản xuất.
