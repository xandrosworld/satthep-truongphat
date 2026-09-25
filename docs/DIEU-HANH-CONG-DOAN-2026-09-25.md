# Điều hành công đoạn và nhập kho sản xuất — 25/09/2026

Đối chiếu phản hồi ảnh điều hành xưởng. Đây là đợt bổ sung luồng sản xuất, không phải biên bản nghiệm thu toàn bộ GĐ2.

| Yêu cầu | Xử lý |
|---|---|
| Thông tin chào giá sang lệnh | Giữ snapshot kỹ thuật theo phiên bản đã duyệt: sản phẩm, đường dẫn vật tư/cấu kiện, kích thước, khối lượng, công đoạn, phương án cắt, hoàn thiện. Không đưa giá nội bộ vào hồ sơ xưởng. |
| Thay vật tư | Dùng đề nghị thay đổi kỹ thuật hiện có: nêu lý do → kỹ thuật xác nhận → Admin áp dụng; đối chiếu lại kho và công nghệ. Không sửa ngược báo giá gốc. |
| Điều chỉnh/bổ sung công nghệ | Tab **Công nghệ & nhập kho công đoạn** cho lập tiến trình, đổi thứ tự, thêm/bỏ bước chưa làm; kỹ thuật xác nhận và Admin duyệt. Phần đã bắt đầu được giữ nguyên. |
| Tổng hợp kho, mua thiếu | Giữ luồng đối chiếu nhu cầu, tồn khả dụng, giữ riêng cho lệnh và đề nghị mua thiếu; không cho bắt đầu nếu chưa giữ đủ vật tư. |
| Người, thiết bị, trình tự, định mức | Tiến trình cần thiết bị hoặc ghi Thủ công, định mức, đơn vị và hao hụt dự kiến. Bắt đầu cần nhân sự còn hoạt động. Bước sau chờ bước trước đối soát, nhập kho. |
| Cân bằng vật tư, hoàn dư | Khai từng lô: cấp ra = vào sản phẩm + tận dụng + phế. Khai kích thước, khối lượng phần tận dụng; hệ thống kiểm tra tỷ lệ tấm nguồn, nhập lại kho nguồn và nhập phôi/bán thành phẩm trong cùng giao dịch. Sai cân bằng không ghi phiếu. |
| So sánh hao hụt | Lưu hao hụt dự kiến/thực tế, khối lượng dự kiến/thực tế và giải trình bắt buộc. Tỷ lệ hao hụt sau trừ tận dụng = phế / (phôi sản phẩm + phế). |
| Tiến độ, vướng mắc, kiến nghị | Ghi sản lượng tăng dần, nhân sự, thiết bị, giờ, sự cố, kiến nghị; lưu nhật ký từng lần cập nhật. Sản lượng hoàn thành phải xác nhận rõ khi đối soát. |
| Phiếu phôi, bán thành phẩm, thành phẩm | Đối soát nhập công đoạn; bắt đầu bước sau xuất công đoạn trước; QC đủ và hoàn thành nhập thành phẩm; xác nhận giao hàng xuất thành phẩm. Kho và báo cáo có bảng riêng để truy vết. |

## Cách vận hành

1. Mở lệnh, kiểm tra hồ sơ kỹ thuật và đối chiếu/giữ vật tư trong Kho.
2. Mở **Công nghệ & nhập kho công đoạn**, khai tiến trình và lý do, gửi kỹ thuật xác nhận rồi Admin duyệt áp dụng.
3. Trong **Công đoạn**, chọn người, thiết bị; bắt đầu và cập nhật tiến độ/vướng mắc.
4. Khi đủ sản lượng, mở **Đối soát & nhập kho công đoạn**. Khai sản lượng thực tế, toàn bộ khối lượng từng lô, tấm/thanh tận dụng, phế, kho nhận và giải trình.
5. Người có quyền cập nhật + xác nhận sản xuất và cập nhật kho xác nhận. Khi cân bằng đúng, phiếu được ghi và công đoạn kết thúc. Tiếp tục bước sau.
6. QC đủ số lượng và hoàn thành lệnh để nhập thành phẩm; xác nhận giao hàng trong đơn hàng để xuất thành phẩm.

## Giới hạn và bảo toàn dữ liệu

- Luồng chuyển công đoạn tuần tự cho toàn lô của lệnh. Có thể ghi tiến độ một phần, nhưng chỉ chuyển bước khi đủ lô; chia lệnh theo lô để sản xuất gối đầu. Không tự suy ra trình tự công nghệ từ thứ tự khai báo báo giá.
- Đổi vật tư áp dụng trước khi đã giữ/cấp kho hoặc bắt đầu sản xuất theo cơ chế đề nghị hiện có. Không viết lại vật tư/công nghệ của bước đã làm.
- Lệnh cũ đã hoàn thành giữ nguyên lịch sử. Lệnh cũ chưa chạy cần đối chiếu kho và duyệt tiến trình trước khi chạy. Lệnh cũ đã chạy nhưng chưa có hồ sơ kho/định mức cần đối chiếu lịch sử riêng; không tự tạo chứng từ giả để vượt kiểm tra.
- Vật tư do nhà gia công cấp không nhập phần dư vào kho sở hữu. Giao dịch đối soát hiện dùng phần vào sản phẩm và phế; nghiệp vụ nhận lại phần dư thuộc sở hữu nhà gia công cần hồ sơ riêng.
- Tồn phôi/bán thành phẩm/thành phẩm theo số lượng, khối lượng; chưa tự định giá thành phẩm. Không cộng giá trị ước tính vào giá trị tồn vật tư.
- Số lượng, khối lượng, hao hụt, người và thiết bị cần khai thực tế. Hệ thống không tự xác nhận thay người vận hành.
- Kiểm soát quyền ở API, kiểm tra phiên bản, chống ghi trùng, giao dịch SQLite nguyên tử; backup bao gồm hồ sơ tiến trình và phiếu công đoạn.

## Kiểm tra

- Toàn bộ `tests/*.test.cjs`: 733/733 đạt trước bước hoàn thiện nhật ký; kiểm tra lại nhóm sản xuất/kho sau thay đổi cuối: 7/7 đạt.
- Trình duyệt: `production-flow-browser.cjs`, `production-browser.cjs`, `production-changes-browser.cjs`, `reports-browser.cjs` đạt. Có chạy lại trình duyệt luồng công đoạn sau thay đổi cuối.
- Kiểm tra thực: thiếu quyền, thiếu người, chưa duyệt, chuyển bước sớm, thiếu sản lượng, sai cân bằng, gửi trùng đồng thời, hoàn dư, khóa quá khứ, nhập thành phẩm, giao hàng, báo cáo và giữ nguyên báo giá gốc.
- Giao diện kiểm tra 1440px và 390px; không tràn khung. Nhật ký và phiếu là dữ liệu lưu trên máy chủ.

Triển khai/kiểm tra HTTPS sẽ được ghi sau khi phát hành.
