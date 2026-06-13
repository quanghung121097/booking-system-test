# Booking Frontend

**React 19 · Vite 8 · React Hook Form · Zod · Axios**

Giao diện người dùng tự viết hoàn toàn bằng CSS Modules và CSS custom properties — không dùng thư viện component bên ngoài.

## Cài đặt

```bash
cp .env.example .env    # đặt VITE_API_URL (xem comment trong file mẫu)
npm install
npm run dev             # http://localhost:5173
```

## Biến môi trường

| Biến | Mặc định | Mô tả |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` (Docker) hoặc `http://localhost:8000/api` (local) | URL gốc Backend API — xem `frontend/.env.example` |

---

## Cấu trúc ứng dụng

```
src/
├── api/
│   └── axios.js              Instance Axios + interceptor request/response
├── context/
│   └── BookingContext.jsx    State toàn cục (useReducer) + tất cả action API
├── hooks/
│   ├── useRooms.js           Tải phòng khi mount, trả về {rooms, loading, error}
│   └── useBookings.js        Tải booking khi selectedRoom thay đổi
├── schemas/
│   └── bookingSchema.js      Zod schema — nguồn sự thật duy nhất cho validation
├── components/
│   ├── RoomList/
│   │   ├── RoomList.jsx      Danh sách phòng, highlight phòng đang chọn
│   │   └── RoomList.module.css
│   ├── BookingList/
│   │   ├── BookingList.jsx   Render BookingCard cho từng booking
│   │   └── BookingCard.jsx   Card với badge "Đã qua", xác nhận trước khi xóa
│   ├── BookingForm/
│   │   ├── BookingForm.jsx   RHF + zodResolver, hiển thị lỗi từ server
│   │   └── BookingForm.module.css
│   └── ui/
│       ├── Button.jsx        Trạng thái loading, variant (primary/danger)
│       ├── Spinner.jsx       Spinner CSS với aria-label
│       └── ErrorMessage.jsx  role="alert", trả null khi không có lỗi
├── pages/
│   └── Dashboard.jsx         Sidebar (phòng) + main (form + danh sách)
├── App.jsx                   Bọc BookingProvider + header
└── main.jsx                  React 19 root, StrictMode
```

### Luồng dữ liệu

```
BookingProvider (useReducer)
  ├── RoomList ← useRooms() ← fetchRooms()
  ├── BookingForm ← createBooking()
  └── BookingList
        └── BookingCard ← deleteBooking() [cập nhật lạc quan]
```

---

## Quyết định thiết kế

### useReducer thay vì nhiều useState

Các thay đổi state được mô tả rõ ràng bằng action types có tên (`SET_LOADING`, `SET_ERROR`, `SET_ROOMS`, `SELECT_ROOM`, `SET_BOOKINGS`, `ADD_BOOKING`, `REMOVE_BOOKING`). Mỗi thay đổi đều có thể theo dõi trong React DevTools mà không cần lần theo nhiều `setState` rải rác khắp component tree.

### Zod + React Hook Form — một nguồn sự thật

Schema validation nằm trong `schemas/bookingSchema.js` và được kết nối qua `zodResolver`. Quy tắc phía client (thời gian bắt đầu phải ở tương lai, kết thúc phải sau bắt đầu) và lỗi từ server 422 (thông báo chồng lịch) đều được hiển thị qua cùng một `formState.errors`, tập trung toàn bộ logic validation vào một nơi.

```js
// Lỗi từ server được map vào form — không cần state riêng
setError('root.serverError', { message: e.message });
```

### Cập nhật lạc quan (Optimistic UI) khi xóa

Booking bị xóa khỏi state ngay lập tức khi người dùng xác nhận (dispatch `REMOVE_BOOKING`), sau đó request `DELETE` mới được gửi lên server. Nếu server trả lỗi, `SET_ERROR` được dispatch và danh sách booking được tải lại để khôi phục trạng thái đúng. Điều này cho phản hồi tức thì mà không cần đợi network.

### Custom hooks tách logic khỏi UI

`useRooms` và `useBookings` đóng gói pattern `useEffect` + gọi context. Component chỉ nhận dữ liệu cần thiết (`rooms`, `loading`, `error`) mà không biết gì về cách dữ liệu được tải. `useBookings` còn thiết lập `AbortController` để hủy request đang chờ khi component unmount.

### UI atoms tái sử dụng

`Button`, `Spinner`, và `ErrorMessage` là các primitive nhỏ, tập trung. `Button` tự xử lý trạng thái `loading` (hiển thị spinner, tự disable), nên không component nào phải lặp lại logic đó. `ErrorMessage` trả về `null` khi không có lỗi, giúp call site không cần conditional wrapper.

### Không dùng thư viện component

Toàn bộ style được tự viết bằng CSS Modules cho từng component và `index.css` toàn cục với CSS custom properties (`--color-primary`, `--radius`…). Điều này giữ bundle nhỏ gọn và thể hiện khả năng xây dựng UI nhất quán mà không phụ thuộc vào design system bên thứ ba.
