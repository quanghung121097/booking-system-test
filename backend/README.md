# Booking API – Backend

**Laravel 13 · PHP 8.4 · MySQL · Sanctum (xác thực token)**

## Cài đặt

```bash
cp .env.example .env          # điền DB_USERNAME, DB_PASSWORD, ...
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve             # http://localhost:8000
```

Tài khoản demo: `test@example.com` / `password`

---

## Xác thực

### Lấy token

```http
POST /api/auth/token
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password"
}
```

Phản hồi:
```json
{ "token": "1|plainTextToken..." }
```

### Sử dụng token

Thêm header sau vào tất cả request được bảo vệ:
```
Authorization: Bearer <token>
```

---

## Danh sách API

| Phương thức | Endpoint | Xác thực | Mô tả |
|-------------|----------|----------|-------|
| POST | `/api/auth/token` | Không | Lấy bearer token |
| GET | `/api/rooms` | ✓ | Danh sách phòng (kèm số lượng booking) |
| GET | `/api/rooms/{id}` | ✓ | Chi tiết một phòng |
| GET | `/api/rooms/{id}/bookings` | ✓ | Danh sách booking của phòng |
| POST | `/api/bookings` | ✓ | Tạo booking mới |
| DELETE | `/api/bookings/{id}` | ✓ | Xóa booking (chỉ booking của mình) |

### Tạo booking — dữ liệu gửi lên

```json
{
  "room_id": 1,
  "user_name": "Nguyễn Văn A",
  "start_time": "2026-09-01T09:00:00",
  "end_time":   "2026-09-01T11:00:00"
}
```

### Quy tắc validation

| Trường | Quy tắc |
|--------|---------|
| `room_id` | Bắt buộc, phải tồn tại trong bảng rooms |
| `user_name` | Bắt buộc, tối đa 255 ký tự |
| `start_time` | Bắt buộc, phải ở tương lai |
| `end_time` | Bắt buộc, phải sau `start_time` |

Ngoài validation, hệ thống kiểm tra **chồng lịch (overlap)**: nếu phòng đã có booking trùng khung giờ → trả về 422.

### Định dạng response

```json
{ "data": { ... } }                          // 200/201
{ "message": "..." }                         // lỗi 4xx/5xx
{ "message": "...", "errors": { ... } }      // lỗi validation 422
```

---

## Cấu trúc ứng dụng

```
app/
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php       POST /api/auth/token
│   │   ├── RoomController.php       GET  /api/rooms
│   │   └── BookingController.php    GET|POST|DELETE /api/bookings
│   ├── Requests/
│   │   └── StoreBookingRequest.php  Quy tắc validation + thông báo lỗi
│   └── Resources/
│       ├── RoomResource.php         Định dạng JSON cho phòng
│       └── BookingResource.php      Định dạng JSON, thời gian ISO8601
├── Models/
│   ├── Room.php                     HasMany bookings
│   └── Booking.php                  BelongsTo room, cast datetime
├── Policies/
│   └── BookingPolicy.php            Chỉ cho xóa booking của chính mình
├── Repositories/
│   ├── Contracts/
│   │   ├── RoomRepositoryInterface.php
│   │   └── BookingRepositoryInterface.php
│   ├── RoomRepository.php           withCount('bookings')
│   └── BookingRepository.php        hasOverlap() — toán học khoảng thời gian
└── Services/
    └── BookingService.php           Kiểm tra overlap → DomainException
```

---

## Quyết định thiết kế

### Mẫu Repository + Service

Controller chỉ xử lý HTTP (nhận request → gọi service → trả response). Logic nghiệp vụ nằm trong `BookingService`. Truy cập dữ liệu được trừu tượng hoá qua các interface (`BookingRepositoryInterface`, `RoomRepositoryInterface`), giúp dễ dàng viết unit test và thay thế implementation mà không ảnh hưởng đến logic nghiệp vụ.

```php
// Controller inject interface, không inject class cụ thể
public function __construct(
    private readonly BookingService $bookingService,
    private readonly BookingRepositoryInterface $bookingRepository,
) {}
```

### Phát hiện Chồng lịch (Overlap)

Dùng toán học khoảng thời gian: hai booking chồng nhau khi `A.start < B.end AND A.end > B.start`. Kiểm tra tại tầng service (không phải chỉ validation) để đảm bảo quy tắc được áp dụng bất kể gọi từ đâu.

```php
Booking::where('room_id', $roomId)
    ->where('start_time', '<', $end)
    ->where('end_time', '>', $start)
    ->exists();
```

Index tổng hợp `(room_id, start_time, end_time)` trên bảng `bookings` đảm bảo truy vấn hiệu quả ngay cả khi có nhiều dữ liệu.

### DomainException cho quy tắc nghiệp vụ

Lỗi chồng lịch ném `\DomainException` (không phải `\Exception` chung) để phân biệt rõ ràng lỗi nghiệp vụ với lỗi hệ thống. Mã lỗi `422` được xử lý trực tiếp trong error handler toàn cục ở `bootstrap/app.php`.

### Sanctum Token xác thực phi trạng thái

Token bearer phù hợp với kiến trúc SPA + API — không cần cookie session. Token cũ bị xóa mỗi khi đăng nhập mới để tránh tích lũy token và giảm nguy cơ bảo mật.

### Dependency Injection qua Interface

Mọi dependency đều được inject qua interface, được binding trong `AppServiceProvider::register()`. Đây là nguyên tắc Dependency Inversion: class cấp cao không phụ thuộc vào implementation cụ thể, dễ thay thế khi test hoặc mở rộng.

### Bootstrap gọn nhẹ của Laravel 13

Dùng API fluent mới `Application::configure()` trong `bootstrap/app.php`. Không có `Kernel.php`, không có class `Middleware/` riêng — middleware và xử lý exception được đăng ký trực tiếp, giảm bớt boilerplate.
