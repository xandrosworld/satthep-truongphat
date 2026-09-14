# Phản hồi về khai báo và cách tính giá, tối 14/09/2026

Nguồn chính là tin nhắn khách lúc 22:59–23:06 do người dùng cung cấp. Khách yêu cầu tiếp tục sửa ngay; ảnh ghi chú dự kiến gửi sau không phải điều kiện để xử lý năm ý đã rõ. Nguồn họp bổ trợ: `transcripts/HAI-PHAN-02.txt`, các dòng 27–47 về nhiều cơ sở đơn giá và dòng 77–89 về độ phức tạp theo từng công đoạn. Đây là phiên âm AI; không gọi thành đã nghe xác minh toàn bộ ghi âm.

## Yêu cầu và hành vi hiện tại

| Yêu cầu khách | Cách sử dụng / thay đổi |
| --- | --- |
| Không nhập công thức trên bảng tổng; mở sửa phải có sẵn dữ liệu | **Danh mục quy ước → Hình dạng & công thức** giữ bảy cột thông tin để xem. **Sửa công thức** mở toàn bộ thông số, nơi nhập, tên, công thức khai triển dài/rộng, khối lượng và diện tích. Công thức mặc định hiện thành giá trị để sửa, không chỉ là chữ gợi ý. Lưu thành phiên bản; Hủy giữ nguyên dữ liệu. |
| Có tên bên cạnh ký hiệu thông số | **Thông số cấu kiện** có Ký hiệu, Tên/diễn giải và Đơn vị riêng. Tên sửa được, tìm được không dấu, hiện trong trình sửa công thức và khi nhập kích thước theo quy ước. Không đổi ký hiệu trong công thức khi sửa diễn giải. Ký hiệu riêng chưa rõ ý nghĩa để người lập khai tên, không tự suy diễn. |
| Đơn giá nguyên công/hoàn thiện thể hiện các cách tính để báo giá lựa chọn | **Đơn giá đầu vào → Nguyên công & hệ số → Sửa cách tính / đơn giá** khai nhiều phương án. Mỗi phương án có tên, phương pháp, giá/đơn vị tại xưởng và thuê ngoài. Có giá theo đơn vị, giá gốc nhân yếu tố, giá gói; báo giá vẫn cho nhập giá riêng. Không điền các mức giá kinh doanh do phần mềm tự đặt. |
| Báo giá khai trực tiếp mức độ phức tạp và dùng hệ số tính tiền | **Công đoạn & định mức** hiện cách tính và độ phức tạp tại từng công việc. Mở công việc, chọn **Khai trực tiếp tên và hệ số nhân**, hoặc lấy tên/hệ số từ danh mục. Hệ số trực tiếp thay các yếu tố `complexity` trong bảng, nhân đúng một lần và không lan sang công việc khác. Có thể bỏ khai riêng để dùng lại bảng yếu tố. |
| Mỗi dòng khai báo có kiểm tra tổng thể | Nút **Kiểm tra tổng thể** tại dòng quy ước, thông số/danh mục, khổ, vật tư, công đoạn và phạm vi cấu thành. Màn sửa công thức và đơn giá kiểm ngay dữ liệu chưa lưu. Kết quả nêu mục hợp lệ, mục sai/thiếu, đầu vào và phép tính. |

## Luồng giá xuyên suốt

1. Khai các cách tính trong bảng giá dùng chung; mỗi cách có định danh ổn định.
2. Tại báo giá, **Giá & hệ số → Nguyên công / bề mặt → Lấy bảng … từ danh mục**: chọn lấy cả bảng cách tính/hệ số/định mức hoặc chỉ giá cơ sở và đơn vị.
3. Sang **Công đoạn & định mức**, chọn cách tính đã khai cho nguyên công. Cách tính thống nhất cho cùng mã nguyên công trong báo giá theo yêu cầu trước; nơi thực hiện, lượng và độ phức tạp giữ riêng từng công việc.
4. Xem phép tính ngay trong màn sửa. Cách theo kg/tấn/m²/m³ lấy lượng tương ứng; mét/lần/bộ dùng định mức được nhập rõ, hoặc nhập tổng lượng/định mức riêng. Gói phân biệt toàn dòng và một đơn vị tại cấp thực hiện.
5. Lưu, mở lại và xuất danh mục giữ cách tính đã khai. Đầu vào tiền của phương án được chọn xuất hiện trong phần xác nhận nguồn giá/thuế; không lấy một ô giá cũ không còn dùng để xác nhận thay.

Sửa bảng chung không viết lại báo giá đã lưu. Nếu chủ động lấy bảng mới mà cách đang chọn không còn khả dụng, hệ thống báo chọn lại, không âm thầm dùng giá khác. Khôi phục giá cũ giữ các cách tính mới thêm và tên/diễn giải đã sửa, chỉ phục hồi các ô giá/đơn vị có ở mốc cũ.

## Các đáp án kiểm tra

Các số dưới đây là dữ liệu thử, không phải đơn giá hoặc tiêu chuẩn sản xuất đã được khách chốt.

- Công việc có 94,2 kg và 16 m²: 2.000 đ/kg → 188.400 đ; 4.000 đ/m² → 64.000 đ; 2.000.000 đ/tấn → 188.400 đ; giá gói toàn dòng 500.000 đ → đúng 500.000 đ.
- Với cách 2.000 đ/kg, khai riêng hệ số 1,2 → `94,2 × 2.000 × 1,2 = 226.080 đ`. Công việc bên cạnh có 70,65 kg giữ 141.300 đ. Không nhân thêm hệ số phức tạp từ bảng lần thứ hai.
- Phôi thử tam giác 1.000 × 200 × 2 mm, RHO 7.850: 1,57 kg và 0,1 m². Đổi khai triển thành `(L + 100)` và `(W + 20)` cho ba phôi: 5,6991 kg và 0,363 m². Khổ mua và diện tích bao để xếp phôi vẫn tính riêng.
- Sai đơn vị công thức, chia 0, giá âm/trống, hệ số không dương, lựa chọn cách tính bị mất, bậc tra sai đều có kiểm tra tương ứng. Kiểm mẫu không xác nhận thay người lập rằng công thức hoặc giá đã đúng nghiệp vụ của mọi đơn hàng.

## Kiểm chứng và triển khai

Chạy `npm run verify:declaration-review`. Bộ kiểm gồm toàn bộ logic/máy chủ cùng mười luồng trình duyệt về khai báo, công thức phôi, quy ước, cấu thành, công đoạn, hoàn thiện, tính giá, xuất và bảo toàn bản lưu.

Bằng chứng lưu riêng tại `artifacts/customer-review/review-2026-09-14-late/`:

- [Kết quả tổng](../artifacts/customer-review/review-2026-09-14-late/verification.json).
- [Luồng mới qua giao diện](../artifacts/customer-review/review-2026-09-14-late/ui/results.json), [công thức phôi](../artifacts/customer-review/review-2026-09-14-late/shape-row/results.json).
- [Đối chiếu toàn bộ HTML deployment](../artifacts/customer-review/review-2026-09-14-late/live/deployment-check.json).
- [Kiểm giao diện trên web thật](../artifacts/customer-review/review-2026-09-14-late/live/ui/results.json), [công thức phôi trên web](../artifacts/customer-review/review-2026-09-14-late/live/shape-row/results.json).
- [Thông tin bản bàn giao](../artifacts/customer-review/review-2026-09-14-late/DELIVERY.json).

Đối chiếu deployment bằng `tools/check-rules-catalog-live.cjs`, đặt `RULES_CATALOG_REVIEW_ROOT=artifacts/customer-review/review-2026-09-14-late`. Công cụ chỉ chấp nhận HTML khớp toàn bộ build đã kiểm, ngoài toolbar Netlify đã nhận diện. Kiểm web dùng `DECLARATION_REVIEW_URL`, `SHAPE_ROW_URL`, `RULES_CATALOG_URL` và thư mục bằng chứng tương ứng, trong phiên trình duyệt thử độc lập.

Netlify hiện là ứng dụng lưu trong trình duyệt. Kiểm API, phân quyền và lưu máy chủ chạy trên máy chủ thử cục bộ, không được gọi thành máy chủ sản xuất đã triển khai. Không quay thêm clip. Ảnh ghi chú khách gửi tiếp có thể bổ sung yêu cầu; đợt này không phải khách đã nghiệm thu toàn bộ dự án.
