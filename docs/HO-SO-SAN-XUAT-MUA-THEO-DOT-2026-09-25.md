# Hồ sơ chuẩn bị sản xuất và mua vật tư theo đợt

Lệnh sản xuất lấy dữ liệu kỹ thuật từ đúng phiên bản báo giá đã duyệt, theo sản phẩm và số lượng của lô. Hồ sơ hiển thị đầu vào, yêu cầu, địa điểm/lịch thực hiện, cấu thành và kích thước; giữ nguyên các màn vật tư, công đoạn và phương án cắt. Dữ liệu giá không nằm trong gói kỹ thuật.

## Hồ sơ tại nhà máy

- Kế thừa bản vẽ PDF/ảnh/CAD và liên kết tài liệu từ đầu vào; tệp chỉ có trên máy người khai được chỉ rõ là chưa có trên máy chủ.
- Bổ sung bản vẽ sản xuất PDF, ảnh, DWG/DXF/STEP (tối đa 10 MB mỗi tệp), phiên bản, ghi chú và quan hệ thay thế. Giữ bản cũ để đối chiếu.
- Kỹ sư khai yêu cầu bổ sung, chọn máy đang hoạt động hoặc thiết bị khác/thủ công, ghi phương pháp từng công đoạn và xác nhận rà soát. Nếu không cần bản vẽ phải ghi căn cứ.
- Thêm bản vẽ, thay đổi kỹ thuật hoặc duyệt lại công nghệ làm mất xác nhận hồ sơ; cần rà soát lại. Không sửa trực tiếp hồ sơ của lô đã bắt đầu. Báo giá nguồn và lịch sử duyệt không bị thay đổi.
- Máy chủ kiểm tra quyền sản xuất, phiên bản và quyền tải tệp thuộc lệnh. Tệp và hồ sơ nằm trong cơ chế sao lưu hiện có.

## Kho và mua vật tư

- Giữ nguyên đối chiếu tồn theo mã, đơn vị và kích thước phù hợp phương án cắt, lựa chọn lô/tấm và giữ kho trước khi sản xuất.
- Màn Mua hàng có **Đặt vật tư theo lệnh / đợt**: chọn một hoặc nhiều lệnh, xem nhu cầu chưa giữ, phần đang đặt, gợi ý thiếu và nhập số lượng của đợt.
- Gợi ý của nhiều lệnh không sử dụng cùng một lượng tồn hai lần. Có thể mua một phần rồi lập đợt tiếp theo, hoặc gom tối đa 50 lệnh.
- Gộp dòng mua chỉ khi cùng mã, đơn vị và kích thước. Mỗi dòng lưu phân bổ số lượng về từng lệnh/đơn hàng; chi tiết yêu cầu mua hiển thị phân bổ.
- Kiểm tra lại nhu cầu và phiên bản tại thời điểm ghi; chặn trùng mã yêu cầu và số lượng vượt phần chưa giữ/chưa đặt.
- Luồng duyệt, đặt, giao, nhận và nhập kho giữ nguyên quyền. Nhận hàng đối chiếu ID dòng và kích thước; nhập kho tách phân bổ về từng lệnh, giữ lượng còn cần và ghi chi phí đúng từng lệnh. Phần thừa nếu nhu cầu đã thay đổi trở thành tồn khả dụng.
- Mua hàng cũ tiếp tục hoạt động và được tính vào số đang đặt. Không tự sắp lại chi tiết lên tấm khác kích thước: tấm lựa chọn phải phù hợp phương án cắt đang duyệt.

## Kiểm chứng

Kiểm thử API bao gồm lịch sử bản vẽ, quyền xem/sửa/tải tệp, xung đột phiên bản, khóa sau khi bắt đầu, mất xác nhận khi đổi công nghệ, tính bất biến của báo giá, mua chia đợt/gộp lệnh, chống trùng nhu cầu, phân bổ kho và tổng chi phí. Trình duyệt kiểm tra tải bản vẽ, rà soát thiết bị/phương pháp, mua gộp và màn hình 390 px; kiểm tra lại các luồng thay đổi kỹ thuật và sản xuất theo công đoạn.
