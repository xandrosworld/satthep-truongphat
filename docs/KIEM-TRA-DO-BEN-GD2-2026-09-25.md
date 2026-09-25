# Kiểm tra số liệu, tình huống lỗi và khôi phục GĐ2 — 25/09/2026

Phạm vi: ba việc người dùng yêu cầu trong lúc chờ khách rà luồng sản xuất. Không thay bố cục hoặc quy trình sản xuất đang chờ góp ý. Đây là bằng chứng tự kiểm, không thay nghiệm thu với người dùng thực tế.

## 1. Đối chiếu số liệu xuyên suốt

- Chạy luồng báo giá → duyệt → đơn hàng → mua vật tư → nhập/giữ/xuất kho → công đoạn sản xuất → QC → giao hàng → hợp đồng/thu tiền/chi tiền → báo cáo.
- Kiểm tra tổng sau thuế, doanh thu trước thuế theo sản phẩm, công nợ còn lại, thực thu/thực chi và tồn cuối. Gửi lại chứng từ không cộng thêm tiền lần thứ hai.
- Kiểm tra chia nhiều đợt mua cho một lệnh, gộp mua nhiều lệnh, phân bổ chi phí và không giữ trùng tồn vật lý.
- Kiểm tra cân đối vật tư cấp = sản phẩm + phần dư + phế; yêu cầu sai cân đối bị từ chối mà không sinh chứng từ dở dang. Kết thúc công đoạn, nhập phần dư và giao hàng không ghi trùng khi gửi đồng thời.
- Kiểm tra phần dư tận dụng không bị trừ hai lần, không làm giảm sai lượng mua; giao hàng và lắp đặt có khối lượng/chi phí độc lập.

Bằng chứng: `tests/reports-flow.test.cjs`, `production-flow.test.cjs`, `production-dossier-purchasing.test.cjs`, `delivery-remnant-feedback.test.cjs`, `logistics-lots.test.cjs`.

## 2. Mất mạng, ghi đồng thời và phân quyền

Đã sửa lỗi giao diện xóa trạng thái chưa lưu khi người dùng nhập tiếp trong lúc chờ phản hồi lưu. Nội dung mới được giữ nguyên và báo còn thay đổi chưa lưu. Các lần bấm lưu khi yêu cầu cũ chưa xong dùng chung một yêu cầu; phản hồi của phiên/màn hình cũ không được áp vào báo giá khác.

- Hai tài khoản gửi 12 yêu cầu sửa cùng một phiên bản: chỉ một yêu cầu thành công; các yêu cầu còn lại nhận xung đột, không ghi đè.
- 12 yêu cầu thu tiền có cùng mã thao tác: một chứng từ. Đổi nội dung nhưng dùng lại mã thao tác bị từ chối; thu vượt công nợ bị chặn.
- Mất mạng trước khi lưu: giữ nội dung chưa lưu và phiên bản máy chủ không tăng; kết nối lại lưu được.
- Máy chủ đã ghi nhưng mất phản hồi: gửi lại bị chặn theo phiên bản, không tạo thêm bản ghi; tải lại thấy nội dung máy chủ đã ghi.
- Thu hồi quyền có hiệu lực ở API, kể cả khi phát lại yêu cầu cũ. Nhân viên không được gọi API sao lưu; tài khoản kỹ thuật không nhận giá từ danh sách được quản trị viên mở trước đó.
- Bản đã duyệt không bị sửa bởi yêu cầu lưu cũ.

Bằng chứng: `tests/resilience.test.cjs`, `tests/resilience-browser.cjs`, các bộ kiểm thử phân quyền và thông báo hiện có. Bộ kiểm thử trình duyệt workspace cũng kiểm tra lưu–tải lại, thay đổi số lượng và tài khoản kỹ thuật.

## 3. Khôi phục và tải

### Khôi phục trên máy chủ, môi trường tách biệt

- Xuất snapshot SQLite nhất quán từ ứng dụng đang chạy, không dừng hoặc ghi nghiệp vụ thử lên hệ thống thật.
- Lưu ảnh Docker đang chạy, `.env`, Compose và Caddyfile trong thư mục chỉ quản trị truy cập; kiểm tra checksum, nạp lại ảnh và kiểm tra cấu hình Compose đã giải nén.
- Khôi phục vào đường dẫn mới bằng công cụ từ chối ghi đè dữ liệu hiện hữu. Container diễn tập không có mạng ra ngoài, giới hạn CPU/RAM, không xuất cổng công khai.
- Kiểm tra `integrity_check`, khóa ngoại và hash toàn bộ nội dung từng bảng (trừ phiên đăng nhập cố ý xóa): **47 bảng, 1.996 bản ghi** khớp snapshot.
- **15 tệp đính kèm, 3.542.439 byte** còn nguyên; dữ liệu tệp hiện được lưu trong SQLite. Kiểm tra cả các bảng chứa hình chat và tài liệu nghiệp vụ thông qua hash toàn bảng.
- Phiên cũ không truy cập được; mở giao diện và 8 API đọc nghiệp vụ trên bản phục hồi. Cấu hình HTTPS origin được nạp lại từ cấu hình đã sao lưu.
- Bước khôi phục/đối chiếu/mở thử ứng dụng mất khoảng **7,1 giây**, không bao gồm xuất/nạp ảnh Docker; đây không phải cam kết thời gian phục hồi toàn VPS.
- Snapshot nguồn không thay đổi. Ứng dụng thật vẫn healthy sau diễn tập.
- Đã xác nhận lịch sao lưu hằng ngày trong `/etc/cron.d/truongphat-backup`. Không tạo lịch trùng, không xóa bản sao cũ.

Giới hạn: diễn tập trên cùng VPS bằng container độc lập; chưa mô phỏng mất toàn bộ VPS/DNS/chứng chỉ hoặc phục hồi từ nơi lưu ngoài máy chủ. Bản cấu hình chứa bí mật chỉ giữ ở thư mục hạn chế quyền trên máy chủ, không đưa vào Git hay báo cáo.

### Kiểm thử tải

Công cụ `tools/load-rehearsal.cjs` chỉ chấp nhận ứng dụng con trên loopback và tạo dữ liệu giả riêng: 150 báo giá, 50 tài khoản; tăng từ 10 → 30 → 50 luồng người dùng không nghỉ, trộn xem danh sách/chi tiết/tổng quan/báo cáo và lưu. Sau đó 50 tài khoản sửa đồng thời một phiên bản để kiểm tra chống ghi đè. Không gọi AI ngoài hoặc thao tác trên dữ liệu vận hành.

Đã phát hiện ngắt kết nối ở bài tải trước tối ưu. Bản sửa giảm tính lại dấu kiểm tra bàn giao, ghi nhớ mô tả thay đổi theo nội dung và dùng chung kết quả danh sách. Bất kỳ ghi dữ liệu trên kết nối hiện tại hoặc commit từ kết nối SQLite khác đều làm mất hiệu lực danh sách; phân quyền được kiểm tra lại theo từng yêu cầu. Bộ nhớ đệm có giới hạn, không giữ phản hồi đã lọc theo một người dùng để trả cho người khác. Thời gian giữ kết nối nhàn rỗi được tăng để không đóng kết nối giữa các đợt xử lý dồn.

Kết quả cuối trên máy chủ (p95: thời gian mà 95% yêu cầu hoàn tất trong giới hạn đó):

| Giới hạn container | 10 người — p95 | 30 người — p95 | 50 người — p95 | Yêu cầu chậm nhất ở mức 50 |
|---|---:|---:|---:|---:|
| 0,5 CPU / 768 MB | 1,69 giây | 4,51 giây | 8,30 giây | 13,62 giây |
| 1 CPU / 768 MB | 0,87 giây | 2,61 giây | 3,80 giây | 6,29 giây |
| 2 CPU / 768 MB | 0,63 giây | 1,49 giây | 2,83 giây | 9,29 giây |

Mỗi lượt cấu hình có **1.800 yêu cầu đọc/lưu đúng kết quả**, thêm 50 yêu cầu tranh chấp cùng phiên bản: 1 được ghi, 49 nhận HTTP 409 như mong đợi. Không tự gửi lại các yêu cầu lỗi trong bài tải. Trước tối ưu bài tải gặp ECONNRESET; các lượt cuối nêu trên không gặp lỗi kết nối.

Giới hạn CPU áp cho cả trình phát tải và ứng dụng trong container. Đây là tải liên tục không có thời gian người dùng đọc/nhập, không phải chứng minh 50 người thực tế luôn phản hồi dưới 3 giây. Mức 0,5 CPU không phù hợp tải cao này; ngay mức 2 CPU vẫn có độ trễ đuôi cần theo dõi nếu vận hành đông. Không thay cấu hình tài nguyên production chỉ dựa trên số đo này. Tải dùng dữ liệu giả; bảng tài chính/sản xuất trong bài tải không mô phỏng quy mô nhiều năm, mạng WAN, render trình duyệt hoặc đồng thời nhận dạng AI.

## Chạy lại và bằng chứng

```sh
node --test tests/*.test.cjs
node tools/build.cjs
node tests/resilience-browser.cjs
node tests/quote-workspace-browser.cjs
node tools/load-rehearsal.cjs
```

Diễn tập máy chủ: `sh /opt/truongphat/deploy/vietnix/rehearse.sh`. Cần quyền quản trị Docker, đủ chỗ cho ảnh ứng dụng và các bản dữ liệu; giữ kết quả trong `/srv/truongphat/rehearsals/`. Script không dừng container vận hành.

Kết quả: **760 kiểm thử tự động đạt**, kiểm tra lại nhóm danh sách/thông báo/ghi đồng thời sau điều chỉnh cache đạt; 2 kịch bản trình duyệt độ bền và workspace đạt. Log cục bộ: `artifacts/resilience-all-tests.log`, `resilience-unit.log`, `resilience-browser.log`, `resilience-workspace.log`, `recovery-final.log`, `load-local.json`, `load-server-final.json`, `load-onecpu.json`, `load-twocpu.json`. Dữ liệu thực và cấu hình bí mật không nằm trong các báo cáo tải.

Các việc vẫn cần khách: chạy bộ dữ liệu nghiệp vụ có đáp án, rà luồng sản xuất, cấu hình vận hành, đào tạo và ký nghiệm thu. Không tự đóng các mục đó bằng kết quả kiểm thử tự động.
