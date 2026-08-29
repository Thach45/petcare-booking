<div align="center">

# 🐾 PetCare

**Nền tảng đặt lịch chăm sóc & grooming thú cưng** — full-stack, production-minded, không có khung giờ nào bị đặt trùng.

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Vitest](https://img.shields.io/badge/tested_with-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)

<img src="public/petcare-hero.png" alt="PetCare" width="420" />

</div>

---

## Vì sao dự án này đáng xem

Đa số app "đặt lịch demo" chỉ đẹp trên giao diện — bấm nút là ăn ngay animation "thành công", còn đằng sau chẳng có gì. PetCare thì ngược lại: **UI và API nối thật với nhau, dữ liệu đi hết vào PostgreSQL**, và phần khó nhất của bài toán đặt lịch — hai người cùng bấm giữ một khung giờ — được xử lý đúng ở tầng transaction, không phải bằng `disabled` trên nút bấm.

## Tính năng

| | |
|---|---|
| 🔐 **Xác thực** | Đăng ký/đăng nhập bằng JWT httpOnly cookie, phân quyền `CUSTOMER` / `STAFF` / `ADMIN` |
| 🐶 **Quản lý thú cưng** | Khách tự thêm/sửa thú cưng, cân nặng dùng để tính phụ thu tự động |
| 📅 **Đặt lịch real-time** | Chọn dịch vụ + nhân viên + ngày → chỉ hiện khung giờ **thực sự còn trống**, tính theo giờ làm việc 08:00–20:00 |
| 🔒 **Chống double-booking** | Advisory lock + transaction `Serializable` + exclusion constraint ở DB — hai request cạnh tranh, chỉ một thắng |
| 🛠️ **Trang quản trị** | Xác nhận/hủy lịch, CRUD dịch vụ & nhân sự, theo dõi audit trail từng lần đổi trạng thái |
| 🔔 **Thông báo** | Mỗi lần lịch được tạo/xác nhận/hoàn tất, khách nhận thông báo ngay trong chuông ở header |
| ⭐ **Đánh giá** | Chỉ đánh giá được sau khi lịch hẹn hoàn tất, mỗi lịch một đánh giá (ràng buộc unique ở DB) |
| 💰 **Giá minh bạch** | Giá luôn tính ở server từ `basePrice` + phụ thu cân nặng — client không thể tự gửi giá |

## Công nghệ

| Layer | Lựa chọn |
|---|---|
| Framework | Next.js 14 (App Router), React 18 |
| Ngôn ngữ | TypeScript (strict mode) |
| Database | PostgreSQL + Prisma ORM |
| Xác thực | JWT (`jose`) + `bcryptjs`, httpOnly cookie |
| Validate | Zod trên mọi input API |
| Thời gian | Luxon, xử lý timezone `Asia/Ho_Chi_Minh` |
| Test | Vitest — unit test business logic + integration test race-condition trên DB thật |

## Bắt đầu

```bash
git clone https://github.com/Thach45/petcare-booking.git
cd petcare-booking
npm install
cp .env.example .env   # điền DATABASE_URL, JWT_SECRET
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Tài khoản mẫu (chỉ dùng ở local):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@petcare.local` | in ra console khi chạy `npm run prisma:seed` |
| Khách | `customer@petcare.local` | như trên |

> Seed script cố tình không hard-code mật khẩu vào repo, và không được chạy nhắm vào DB staging/production.

## Chạy test

```bash
npm test
```

23 test, gồm cả một test **bắn hai request `createBooking` song song vào cùng một khung giờ** để chứng minh cơ chế chống double-booking hoạt động thật, không chỉ đọc code là tin.

## Cấu trúc thư mục

```
app/
  api/          → route handlers (REST-ish, JSON, xác thực qua cookie)
  actions/      → server actions dùng cho form trong App Router
  admin/        → trang quản trị (bookings, services, staff)
  account/      → trang khách hàng (pet, lịch hẹn, đánh giá)
services/       → business logic thuần (pricing, availability, booking, notification, review)
validators/     → schema Zod, dùng chung giữa route API và server action
prisma/         → schema.prisma + migration SQL thật (kèm check/exclusion constraint)
tests/          → unit + integration test cho services/
```

## API chính

| Method | Endpoint | Ghi chú |
|---|---|---|
| `POST` | `/api/auth/register`, `/api/auth/login` | trả JWT qua httpOnly cookie |
| `GET` | `/api/auth/me` | thông tin session hiện tại |
| `GET/POST` | `/api/pets` | `PATCH /api/pets/:id` để sửa |
| `GET/POST` | `/api/services` | ghi yêu cầu `ADMIN` |
| `GET/POST` | `/api/employees` | ghi yêu cầu `ADMIN` |
| `GET` | `/api/availability?employeeId=&serviceId=&date=` | slot trống thật, không cache |
| `GET/POST` | `/api/bookings` | `PATCH /api/bookings/:id/status` để đổi trạng thái |
| `GET/PATCH` | `/api/notifications` | `PATCH /api/notifications/:id` đánh dấu đã đọc |
| `GET/POST` | `/api/reviews?serviceId=` | trả kèm `averageRating` |

Danh sách hỗ trợ `page`, `pageSize` (tối đa 100) và filter (`search`, `status`, `employeeId`, `from`, `to`...).

## Điểm kỹ thuật đáng nói

**Chống double-booking, ba lớp:**
1. `pg_advisory_xact_lock` khóa theo `employeeId + ngày` trong transaction — request thứ hai phải đợi request đầu commit/rollback.
2. Transaction chạy ở isolation level `Serializable`, tự phát hiện xung đột đọc/ghi mà lock không bắt hết.
3. **Exclusion constraint** ở tầng PostgreSQL (`EXCLUDE USING gist`) — lớp bảo vệ cuối cùng, hoạt động bất kể ai/ứng dụng nào ghi vào bảng `bookings`, kể cả một script chạy tay bỏ qua toàn bộ code Node.

**Audit trail thật:** mọi lần tạo/đổi trạng thái booking được ghi vào `booking_status_history` trong cùng transaction — không phải log riêng, không thể lệch với dữ liệu chính.

## Còn thiếu (biết rõ, chưa làm)

- Chưa hiển thị điểm đánh giá trung bình công khai trên `/services`/`/pricing` — API `GET /api/reviews?serviceId=` đã trả sẵn `averageRating`, chỉ chưa lên UI.
