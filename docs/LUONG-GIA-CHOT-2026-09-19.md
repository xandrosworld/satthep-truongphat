# Luồng giá chốt ngày 19/09/2026

Căn cứ: khách xác nhận lúc 17:34 và 17:45: dùng chung khối lượng/diện tích tính toán; chọn một phương án cho toàn báo giá; PA đặc thù chỉ thay phần khai đặc thù, phần còn lại tính chi tiết; chi phí chung và quản lý nhân nối tiếp sau vận chuyển giao hàng/lắp đặt. Giá sản xuất chỉ gồm vận chuyển nhập phôi và vận chuyển gia công thuê ngoài.

## Quy tắc triển khai

- Giá sản xuất gồm vật tư, thiết bị/công sản xuất, nguyên công, hoàn thiện, vận chuyển nhập/thuê ngoài và các yếu tố đặc thù sản xuất đã khai. Không gồm giao hàng/lắp đặt công trình.
- Cơ sở trước chi phí chung/quản lý = giá sản xuất + giao hàng + lắp đặt.
- Giá gốc = cơ sở trên × (1 + chi phí chung/100) × (1 + quản lý/100). Sau đó mới áp chuỗi hệ số giá bán.
- `special` và các yếu tố bổ sung được khai là sản xuất vẫn nằm trong giá sản xuất. Không chuyển chúng sang phí chung/quản lý hoặc tự tạo hệ số mới.
- TMC và các phương án theo đầu mục dùng lượng vật lý từ tính toán. Giữ bảng tiền công/hao hụt riêng đã khai; không suy ra lượng vật lý khác từ tên sản phẩm. Ngoài phạm vi đặc thù giữ nguyên nhánh chi tiết. Không thay cơ chế lựa chọn một PA cho toàn báo giá.
- Có lựa chọn **Theo đặc thù (kết hợp các nhóm)** cho toàn báo giá: nhóm TMC dùng TMC, nhóm tự khai dùng phương án nhóm đã gán, phần cơ khí còn lại dùng chi tiết. Không suy ra nhóm từ tên. Thiếu phân nhóm hoặc thiếu dữ liệu nhánh thì chặn lựa chọn.
- Khoản đã nằm trong gói chỉ tính một lần qua khai luồng / khoản đã gồm hiện có.
- Giá kg/đối thủ khai riêng bốn khoản: nhập phôi, vận chuyển gia công thuê ngoài, giao hàng, lắp đặt. Mỗi khoản chọn đã gồm / chưa gồm cộng từ tính toán / không áp dụng. Báo giá theo luồng mới thiếu xác nhận thì PA đó chưa đủ điều kiện chọn.
- Khoản bổ sung lấy đúng chi phí chưa thuế của PA tính toán đã phân bổ cho sản phẩm, không nhân lại hệ số giá bán. Chuẩn hóa thuế trong giá nguồn trước, cộng phí còn thiếu, làm tròn đơn giá một lần, rồi tính thuế đầu ra.
- Cơ cấu chi phí của PA kg/đối thủ là dự toán tham khảo; không suy ngược chi phí thực tế từ giá bán.

## Báo giá mới và lịch sử

- Báo giá mới từ các form tạo mới dùng `costSequence=delivery-before-overhead-v1`.
- Báo giá đã lưu không có dấu phiên bản mới hoặc có `legacy` giữ nguyên kết quả. Có nút **Áp dụng luồng đã chốt 19/09** tại Giá & hệ số và Phân tích giá, chỉ cho bản nháp và người có quyền sửa hệ số.
- Chuyển luồng giữ số liệu/đơn giá, bỏ giá chốt tay và xác nhận thuế để rà lại. Bản đã trình/duyệt phải dùng chức năng mở bản sửa có quyền; lịch sử bản duyệt giữ nguyên.
- Ca demo lịch sử giữ đáp án cũ để đối chiếu hồi quy; chuyển bằng nút trên nếu thử luồng mới.

## Số mẫu kiểm thử độc lập

Các số dưới đây chỉ kiểm phép tính, không phải đơn giá/định mức kinh doanh khách xác nhận.

| Trường hợp | Đáp án |
| --- | --- |
| Chi phí sản xuất 2.200, giao/lắp 140, chung 20%, quản lý 30% | Giá gốc 2.340 × 1,2 × 1,3 = 3.650,4 |
| Tăng giao hàng 100, giữ dữ liệu sản xuất | Giá sản xuất không đổi; giá gốc tăng 156 |
| TMC: sản xuất 2.510, giao/lắp 140, chung 5%, quản lý 3% | Giá gốc 2.865,975 |
| Giá đối thủ 1.100 đã gồm VAT 10%, 2 SP; thiếu giao/lắp tổng 140; VAT đầu ra 8% | Giá chưa thuế 2.140; VAT 171; tổng 2.311 |
| Giá kg 200, 20 kg phôi; thiếu nhập phôi 60 và giao hàng 100 | Tổng trước thuế 4.160 |

## Kiểm chứng

- 560/560 kiểm thử đơn vị/API đạt trên cây phát hành tách riêng các sửa dở có sẵn.
- Có kiểm API lưu/mở lại, chống ghi đè phiên bản, chặn đổi luồng ngoài quyền, mở sửa nhưng giữ nguyên bản duyệt cũ.
- `tests/confirmed-flow-browser.cjs`: thao tác chuyển luồng, khai khoản chưa gồm, chọn PA, Excel, bản chào, lưu/mở lại và mobile.
- `tests/pricing-review-browser.cjs` và `tools/verify-cost-flows.cjs` đạt trên cây phát hành.
- Bằng chứng cục bộ: `artifacts/confirmed-flow-release-tests.log`, `artifacts/confirmed-flow-release/artifacts/customer-review/confirmed-flow/local/`.
- Kiểm web thật dùng dữ liệu thử trong bộ nhớ trình duyệt, chặn ghi nghiệp vụ; không tự chuyển báo giá/danh mục khách.

Phần thực hiện này thuộc hoàn thiện GĐ1. Không triển khai ghi nhận sản xuất/kho/chi phí thực tế của GĐ2 và không coi kết quả kiểm thử nội bộ là khách nghiệm thu.

## Bổ sung của khách lúc 17:55 — các đầu chi phí có thể mở rộng

- Không giới hạn nghiệp vụ ở bốn ô tổng tiền. Bảng khoản chi cho thêm nhiều dòng tên riêng, đơn giá/cách tính, hệ số, phạm vi và cách phân bổ riêng. Ví dụ bốc xếp nhập phôi, nhiều chặng giao hàng, cẩu hạ khi lắp đặt.
- Công việc sản xuất bổ sung khai ở nguyên công/đơn giá; yếu tố theo tỷ lệ bổ sung khai ở chuỗi hệ số sản xuất hoặc giá bán đúng vị trí. Các danh sách này không cố định số khoản.
- Các khoản vẫn được phân vào nhóm tính giá để giữ quy tắc: nhập phôi/thuê ngoài vào sản xuất, giao hàng/lắp đặt vào sau sản xuất và trước chi phí chung/quản lý.
- Phương án theo đầu mục xác định nhóm khoản đã gồm/không áp dụng/lấy theo tính toán hoặc công thức riêng. Giá kg/đối thủ xác nhận phạm vi bốn nhóm phí và cộng tổng các khoản chưa gồm của nhóm đó một lần.
- Giới hạn hiện tại: quy tắc đã gồm/chưa gồm đang khai theo **nhóm chi phí**, chưa khai khác nhau cho từng dòng trong cùng nhóm. Nếu có gói bao gồm một chặng giao hàng nhưng không gồm chặng khác, cần tách rõ quy tắc/phạm vi trước khi mở rộng cấp dòng; không tự coi cả hai chặng là đã gồm.
- Kiểm thử thêm nhiều khoản và hệ số có tên riêng: chi phí sản xuất, chi phí sau giao/lắp, phân bổ, giá kg/đối thủ và mở lại dữ liệu phải cùng tổng. Không cài đơn giá mẫu vào danh mục thật.
