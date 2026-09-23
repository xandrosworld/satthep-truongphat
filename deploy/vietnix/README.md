# Chuyển Railway → VPS Vietnix

Tên miền dự kiến: **truongphat-group.xyz**. Chuẩn bị cho Linux có Docker Engine và Docker Compose plugin. Chưa thay DNS hoặc dừng Railway bằng các tệp này.

## Kiến trúc và dữ liệu

- Caddy mở cổng 80/443 và cấp/gia hạn HTTPS; ứng dụng Node.js ở mạng Docker nội bộ, không mở cổng 4174 ra Internet.
- SQLite: `/srv/truongphat/data/truongphat.sqlite`. Tài khoản/mật khẩu băm, báo giá, lịch sử, đơn hàng, sản xuất, ảnh chat, tệp đầu vào và dữ liệu AI đều nằm trong SQLite.
- Tệp cấu hình bí mật: `deploy/vietnix/.env`. Chuyển API key bằng kênh riêng. Không đưa vào Git/image/archive công khai.
- Không dùng JSON từ nút Sao lưu dữ liệu để di chuyển toàn bộ: JSON không chứa đủ dữ liệu đăng nhập/tệp nguồn.
- Một instance ứng dụng dùng SQLite. Không chạy hai máy chủ cùng nhận cập nhật cho cùng hệ thống.

## Trước khi cài

1. Xác nhận IP, bản phân phối/phiên bản Linux (`cat /etc/os-release`), kiến trúc (`uname -m`), SSH, dung lượng trống, quyền quản lý DNS.
2. Cài Docker Engine + Compose plugin theo tài liệu đúng hệ điều hành. Không cài Windows/.NET/IIS cho ứng dụng này.
3. Giữ cổng SSH đang dùng; mở TCP 80, TCP 443 và tùy chọn UDP 443. Không công khai database hoặc cổng ứng dụng.
4. Đặt mã nguồn cùng phiên bản đã chạy trên Railway tại `/opt/truongphat`. Logo `assets/truong-phat-logo.jpg` phải có.
5. Chuẩn bị chỗ trống cho database hoạt động, bản xuất và backup; kiểm tra `df -h`. Kích thước ảnh/PDF có thể lớn hơn phần mã nguồn nhiều lần.

```sh
cd /opt/truongphat/deploy/vietnix
cp .env.example .env
chmod 600 .env
openssl rand -hex 32
# Điền chuỗi vừa tạo vào TP_SETUP_KEY; điền OPENAI_API_KEY.
# Giữ OPENAI_MODEL hiện hành, không tự nâng model khi chuyển máy.
sudo install -d -m 700 /srv/truongphat/data /srv/truongphat/backups /srv/truongphat/incoming
docker compose config --quiet
docker compose build app
docker compose run --rm --no-deps --entrypoint caddy proxy validate --config /etc/caddy/Caddyfile --adapter caddyfile
```

Không chạy `docker compose config` không có `--quiet` trong log dùng chung vì có thể in biến bí mật. Chưa chạy app trên thư mục dữ liệu rỗng: tránh tạo database mới trước khi khôi phục.

## Xuất từ Railway và diễn tập

Triển khai phiên bản có `server/migrate.cjs` và `server/maintenance.cjs` lên Railway trước. Lấy đường dẫn DB thực tế từ cấu hình dịch vụ, không giả định nếu biến đã đổi. Các lệnh sau chạy **trong container Railway qua SSH**, không phải trên máy cá nhân:

```sh
node server/migrate.cjs export "$TP_DATABASE_PATH" /data/transfer-rehearsal.sqlite
node server/migrate.cjs verify /data/transfer-rehearsal.sqlite
```

Lấy cả `.sqlite` và `.sqlite.manifest.json` về qua SSH/SFTP/SCP nếu dịch vụ hỗ trợ. Xác nhận phương thức truyền với Railway CLI hiện hành; không in binary/base64 database vào terminal hoặc chat, không dùng `railway run` để giả làm lệnh chạy trong container. Nếu SCP không được hỗ trợ, dùng kênh truyền riêng có xác thực và thời hạn ngắn. Không public backup qua URL.

Chuyển cặp tệp tới `/srv/truongphat/incoming/` trên VPS. Khôi phục bản diễn tập vào thư mục **riêng** với hostname staging riêng; không ghi đè bản chuẩn và không để người dùng nhập dữ liệu thật vào staging.

## Chốt chuyển nhà

1. Thông báo khoảng bảo trì và yêu cầu mọi người lưu phần đang làm. Đợi các lần đọc AI đang chạy hoàn tất.
2. Trong container Railway, bật khóa bảo trì không cần restart:

```sh
node server/maintenance.cjs enable
# Đợi ít nhất 60 giây để request đã bắt đầu hoàn tất.
node server/migrate.cjs export "$TP_DATABASE_PATH" /data/transfer-final.sqlite --frozen /data/maintenance
node server/migrate.cjs verify /data/transfer-final.sqlite
```

Đường dẫn marker mặc định là thư mục chứa DB + `/maintenance`; thay `/data/maintenance` nếu DB nằm ở thư mục khác. Healthcheck vẫn trả 200 khi bảo trì; trang và API trả 503. Nếu còn AI đang xử lý, bản xuất cuối bị từ chối. Không tắt khóa trên Railway khi VPS bắt đầu nhận dữ liệu.

3. Chuyển cặp `transfer-final.sqlite` + manifest tới VPS, kiểm tra lại hash. Khôi phục khi app đang dừng và thư mục đích chưa có DB/WAL/SHM:

```sh
cd /opt/truongphat/deploy/vietnix
docker compose run --rm --no-deps -v /srv/truongphat/incoming:/incoming:ro app \
  node server/migrate.cjs verify /incoming/transfer-final.sqlite
docker compose run --rm --no-deps -v /srv/truongphat/incoming:/incoming:ro app \
  node server/migrate.cjs restore /incoming/transfer-final.sqlite /data/truongphat.sqlite
```

Khôi phục giữ tài khoản/mật khẩu, xóa phiên đăng nhập cũ; mọi người đăng nhập lại. Công cụ từ chối ghi đè database đã có. Nếu đã diễn tập ở thư mục đích, dừng container và di chuyển **cả thư mục dữ liệu diễn tập** sang nơi lưu riêng trước; không xóa bản duy nhất.

4. Chạy `docker compose up -d app`. Kiểm tra `docker compose ps` và API từ trong mạng Docker. Kiểm tra số lượng bảng/tài khoản/báo giá/ảnh/tệp bằng báo cáo manifest, không in nội dung riêng tư.
5. Chốt DNS: bản ghi A của `@` trỏ IP VPS. Chỉ thêm AAAA nếu VPS có IPv6 được cấu hình. Không đổi MX/TXT email. Bộ này dùng tên miền gốc, chưa tự cấu hình `www`.
6. Chạy `docker compose up -d proxy`, đợi DNS và chứng chỉ. Kiểm tra HTTPS, đăng nhập, báo giá cũ, chat/ảnh, tệp nguồn, quyền nhân viên, lưu nháp, đơn hàng. Kiểm tra AI báo đã cấu hình; không gọi AI tính phí chỉ để thử đường truyền nếu chưa cần.
7. Mở sử dụng trên tên miền mới. Giữ Railway trong bảo trì và giữ bản sao cuối tới khi nghiệm thu chuyển nhà. Dữ liệu chỉ lưu trên trình duyệt cũ chưa lên máy chủ không tự chuyển theo tên miền; cần lưu/xuất trước bước 1.

## Backup và quay lui

`sh /opt/truongphat/deploy/vietnix/backup.sh` tạo bản SQLite nhất quán + manifest tại thư mục backup của VPS, không cần dừng ứng dụng. Có thể đặt cron hàng ngày sau khi chạy thử. Bộ này **chưa tự xóa backup**: cần chốt số ngày giữ và sao chép ra nơi độc lập với VPS.

- Nếu VPS chưa nhận cập nhật thật: dừng app VPS; chuyển người dùng về Railway và chạy `node server/maintenance.cjs disable` trên Railway.
- Nếu VPS đã có cập nhật thật: bật bảo trì VPS, đợi request/AI hoàn tất, xuất bản đầy đủ mới từ VPS rồi khôi phục về máy dự phòng; không mở lại database Railway cũ và làm mất phần dữ liệu mới.
- Hết bảo trì VPS: `docker compose exec -T app node server/maintenance.cjs disable`.
- Cập nhật mã sau này: backup → lưu mã commit hiện hành → lấy bản mới → build → `docker compose up -d`. Không dùng `docker compose down -v` và không xóa thư mục dữ liệu.

Tài liệu đối chiếu: [Caddy HTTPS](https://caddyserver.com/docs/automatic-https), [reverse proxy/WebSocket](https://caddyserver.com/docs/caddyfile/directives/reverse_proxy), [Docker Compose healthcheck/startup](https://docs.docker.com/compose/how-tos/startup-order/), [Docker Engine installation](https://docs.docker.com/engine/install/).
