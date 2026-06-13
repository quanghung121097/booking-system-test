# Hệ thống Đặt phòng (Booking System)

Ứng dụng đặt phòng họp full-stack — **Laravel 13 API + React 19 SPA**, đóng gói bằng Docker Compose.

## Tài khoản demo

Sau khi chạy `make seed` (hoặc `php artisan db:seed`), dùng thông tin sau để đăng nhập:

```
Email:    test@example.com
Mật khẩu: password
```

## Công nghệ sử dụng

| Tầng | Công nghệ |
|---|---|
| Backend | Laravel 13, PHP 8.4, MySQL 8.0, Sanctum (xác thực token) |
| Frontend | React 19, Vite 8, React Hook Form + Zod, Axios |
| Hạ tầng | Docker Compose, Nginx (reverse proxy), PHP-FPM |

## Kiến trúc

```
Trình duyệt
  └── Nginx :8080 (host)
        ├── /api/*       →  PHP-FPM (Laravel 13)
        ├── /sanctum/*   →  PHP-FPM
        └── /*           →  Vite dev server (React 19, HMR)

Docker network: booking-net
Các service: nginx · php · frontend · mysql
```

---

## Biến môi trường (Git)

**Không commit** các file `.env` thật — chúng chứa secret và cấu hình cá nhân.

| File trên Git | Copy thành | Dùng khi |
|---------------|------------|----------|
| `.env.docker.example` | `.env` + `backend/.env` | Chạy bằng Docker |
| `backend/.env.example` | `backend/.env` | Chạy Laravel local (không Docker) |
| `frontend/.env.example` | `frontend/.env` | Chạy React (cả Docker và local) |

Sau khi copy, tự điền `DB_USERNAME`, `DB_PASSWORD`, `APP_KEY` (hoặc chạy `make key` / `php artisan key:generate`).

---

## Hướng dẫn cho người mới (sau khi pull code)

Chọn **một** trong hai cách dưới đây. Khuyến nghị dùng **Docker** nếu bạn muốn setup nhanh, không cần cài PHP/MySQL/Node trên máy.

### Bước 0 — Clone repository

```bash
git clone <url-repo> booking-system
cd booking-system
```

### Cách A — Chạy bằng Docker (khuyến nghị)

**Yêu cầu:** Docker ≥ 24.x, Docker Compose ≥ 2.x

```bash
# 1. Tạo file env (docker-compose + Laravel — dùng cùng mật khẩu DB)
cp .env.docker.example .env
cp .env.docker.example backend/.env
# Tùy chọn: sửa DB_USERNAME / DB_PASSWORD / DB_ROOT_PASSWORD trong cả hai file

# 2. Tạo file env cho React
cp frontend/.env.example frontend/.env
# frontend/.env mặc định: VITE_API_URL=http://localhost:8080/api

# 3. Build và khởi động container
make build
make up

# 4. Cài dependency PHP (volume mount ghi đè vendor trong image)
make install

# 5. Khởi tạo database và dữ liệu mẫu
make key
make migrate
make seed
```

**Truy cập ứng dụng**

| Mục | URL |
|-----|-----|
| Giao diện web (qua Nginx) | http://localhost:8080 |
| API | http://localhost:8080/api |
| Vite trực tiếp (debug) | http://localhost:5173 |
| MySQL (DBeaver/TablePlus) | `localhost:3307` |

Xem [Tài khoản demo](#tài-khoản-demo) ở đầu README để đăng nhập.

**Kiểm tra nhanh sau khi chạy**

```bash
make logs          # xem log container
curl http://localhost:8080/api/rooms -H "Authorization: Bearer <token>"
```

**Reset toàn bộ dữ liệu**

```bash
make fresh
```

---

### Cách B — Chạy local không dùng Docker

**Yêu cầu**

| Công cụ | Phiên bản tối thiểu |
|---------|---------------------|
| PHP | 8.3+ (khuyến nghị 8.4) + các extension: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath` |
| Composer | 2.x |
| Node.js | 20.x |
| npm | 10.x |
| MySQL | 8.0 |

#### 1. Chuẩn bị MySQL

Tạo database và user (ví dụ qua MySQL CLI):

```sql
CREATE DATABASE booking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'booking_user'@'localhost' IDENTIFIED BY 'booking_pass';
GRANT ALL PRIVILEGES ON booking_db.* TO 'booking_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Backend (Laravel API)

```bash
cd backend

# Cài dependency
composer install

# Tạo và chỉnh file env
cp .env.example .env
```

Sửa các dòng quan trọng trong `backend/.env`:

```env
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=booking_db
DB_USERNAME=booking_user
DB_PASSWORD=booking_pass
```

Tiếp tục:

```bash
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
# API chạy tại http://localhost:8000
```

#### 3. Frontend (React SPA)

Mở terminal mới:

```bash
cd frontend

npm install
cp .env.example .env
```

Sửa `frontend/.env` trỏ tới API local:

```env
VITE_API_URL=http://localhost:8000/api
```

Chạy dev server:

```bash
npm run dev
# Mở http://localhost:5173
```

---

### So sánh nhanh hai cách chạy

| | Docker | Local (không Docker) |
|---|--------|---------------------|
| Cài đặt | Chỉ cần Docker | Cần PHP, Composer, Node, MySQL |
| URL app | http://localhost:8080 | http://localhost:5173 |
| URL API | http://localhost:8080/api | http://localhost:8000/api |
| File env backend | `cp .env.docker.example .env` + `backend/.env` | `cp backend/.env.example backend/.env` |
| File env frontend | `VITE_API_URL=http://localhost:8080/api` | `VITE_API_URL=http://localhost:8000/api` |
| Lệnh migrate/seed | `make install` → `make migrate` / `make seed` | `composer install` → `php artisan migrate` / `db:seed` |

---

## Cài đặt với Docker (chi tiết)

### Yêu cầu

- Docker ≥ 24.x
- Docker Compose ≥ 2.x

### Chạy lần đầu

```bash
# 1. Cấu hình biến môi trường
cp .env.docker.example .env
cp .env.docker.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Build và khởi động tất cả container
make build
make up

# 3. Cài dependency PHP
make install

# 4. Khởi tạo ứng dụng
make key        # sinh APP_KEY cho Laravel
make migrate    # chạy tất cả migration
make seed       # tạo dữ liệu mẫu (tài khoản + 8 phòng + booking)
```

Truy cập: **http://localhost:8080**

Đăng nhập bằng [tài khoản demo](#tài-khoản-demo).

### Reset toàn bộ dữ liệu

```bash
make fresh      # down -v → up → migrate → seed chỉ 1 lệnh
```

### Các service và cổng

| Service | Host nội bộ | Cổng expose |
|---------|-------------|-------------------|
| Nginx | `nginx` | **8080** → 80 |
| PHP-FPM | `php` | 9000 (chỉ nội bộ) |
| MySQL | `mysql` | **3307** → 3306 |
| React / Vite | `frontend` | 5173 |

### Các lệnh Makefile

| Lệnh | Mô tả |
|---|---|
| `make up` | Khởi động tất cả container |
| `make down` | Dừng tất cả container |
| `make build` | Build lại image (--no-cache) |
| `make install` | Cài Composer dependency trong container PHP |
| `make fresh` | Reset toàn bộ: down + up + migrate + seed |
| `make logs` | Xem log realtime tất cả container |
| `make shell-php` | Mở bash trong container PHP |
| `make shell-mysql` | Mở MySQL CLI |
| `make migrate` | Chạy migration |
| `make seed` | Chạy seeder |
| `make key` | Sinh Laravel APP_KEY |
| `make optimize` | Cache config / routes / views |
| `make test` | Chạy bộ test PHP |

---

## Cấu trúc thư mục

```
booking-system/
├── docker-compose.yml          Stack local (4 service)
├── .env.docker.example         Mẫu env Docker — copy sang .env và backend/.env
├── .gitignore                  Bỏ qua .env, chỉ giữ *.example
├── Makefile                    Các lệnh tắt
├── docker/
│   └── mysql/init.sql          Khởi tạo DB và phân quyền
├── nginx/
│   ├── Dockerfile
│   └── conf.d/default.conf     Cấu hình reverse proxy
├── backend/                    Laravel 13 API
│   ├── Dockerfile              PHP-FPM (php:8.4-fpm-alpine)
│   ├── .dockerignore
│   └── README.md               Tài liệu API + Quyết định thiết kế
└── frontend/                   React 19 SPA
    ├── Dockerfile              Vite dev server (node:20-alpine)
    ├── .dockerignore
    └── README.md               Tài liệu Frontend + Quyết định thiết kế
```

---

## Tham khảo nhanh API

```
POST   /api/auth/token              Lấy bearer token
GET    /api/rooms                   Danh sách phòng (kèm số lượng booking)
GET    /api/rooms/{id}              Chi tiết một phòng
GET    /api/rooms/{id}/bookings     Danh sách booking của một phòng
POST   /api/bookings                Tạo booking mới
DELETE /api/bookings/{id}           Xóa booking
```

Tất cả route (trừ lấy token) yêu cầu header:
```
Authorization: Bearer <token>
```

### Ví dụ: tạo booking

```bash
# Lấy token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"password"}' | jq -r .token)

# Tạo booking
curl -X POST http://localhost:8080/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "room_id": 1,
    "user_name": "Nguyễn Văn A",
    "start_time": "2026-09-01T09:00:00",
    "end_time":   "2026-09-01T11:00:00"
  }'
```

### Định dạng response

```json
{ "data": { ... } }                           // tài nguyên đơn (200/201)
{ "data": [ ... ] }                           // danh sách (200)
{ "message": "..." }                          // lỗi (4xx/5xx)
{ "message": "...", "errors": { ... } }       // lỗi validation (422)
```

---

## Xử lý sự cố

### Cổng đã bị chiếm dụng

Nếu cổng **8080** hoặc **3307** đang được service khác sử dụng, đổi cổng host trong `docker-compose.yml`:

```yaml
nginx:
  ports: ["8090:80"]   # truy cập tại http://localhost:8090

mysql:
  ports: ["3308:3306"] # kết nối TablePlus/DBeaver tại localhost:3308
```

Sau khi đổi cổng Nginx, cập nhật `frontend/.env`:

```env
VITE_API_URL=http://localhost:8090/api
```

Mạng nội bộ Docker (`DB_HOST=mysql`, `fastcgi_pass php:9000`) không bị ảnh hưởng.

### Lỗi permission storage

Nếu xuất hiện lỗi `Permission denied` với `storage/logs`:

```bash
docker compose exec php chown -R www-data:www-data storage bootstrap/cache
```

`Dockerfile` đã có `ENTRYPOINT` tự động fix quyền mỗi khi container khởi động với volume được mount.

### Vite HMR không hoạt động

Nginx đã cấu hình forward WebSocket headers (`Upgrade`, `Connection`) tới Vite dev server. Hãy truy cập qua **http://localhost:8080** (cổng Nginx), không truy cập trực tiếp cổng 5173 khi dùng Docker.

### Chạy local không Docker — lỗi thường gặp

| Triệu chứng | Cách xử lý |
|-------------|------------|
| Frontend gọi API bị CORS / 404 | Kiểm tra `VITE_API_URL` trong `frontend/.env` khớp với `php artisan serve` (mặc định `:8000`) |
| `SQLSTATE[HY000] [1045] Access denied` | Kiểm tra user/password MySQL trong `backend/.env` |
| `could not find driver` | Cài PHP extension `pdo_mysql` (`sudo apt install php8.4-mysql` trên Ubuntu) |
| Trang trắng sau `npm run dev` | Chạy lại `npm install`, kiểm tra Node ≥ 20 |
