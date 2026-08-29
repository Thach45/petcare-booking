# Pet Care & Grooming Booking

Next.js 14 App Router, TypeScript, Prisma và PostgreSQL cho đặt lịch chăm sóc thú cưng — bao gồm cả API và UI.

## Khởi chạy

1. Sao chép `.env.example` thành `.env` và thay `DATABASE_URL`, `JWT_SECRET`.
2. Cài dependencies: `npm install`.
3. Sinh Prisma client và tạo database: `npx prisma migrate dev --name init`.
4. Nạp dữ liệu mẫu: `npm run prisma:seed`.
5. Chạy: `npm run dev`.

Tài khoản quản trị mẫu: `admin@petcare.local`. Xem mật khẩu in ra console khi chạy `npm run prisma:seed` (không hard-code trong repo). Chỉ dùng trong môi trường phát triển — không chạy seed nhắm vào DB staging/production.

## Trạng thái UI (cập nhật 29/08/2026)

Đã nối API thật: đăng ký/đăng nhập, đặt lịch (`/booking`, chọn thú cưng/dịch vụ/nhân viên/khung giờ trống thật), quản lý thú cưng và xem lịch hẹn của khách (`/account`), xử lý trạng thái booking + CRUD dịch vụ/nhân sự từ trang admin (`/admin/*`), `/pricing` và `/services` lấy dữ liệu thật từ `GET /api/services`, thông báo trong header (chuông) và đánh giá dịch vụ sau khi hoàn tất lịch hẹn.

Còn chưa làm (ngoài phạm vi hiện tại):
- Chưa có UI hiển thị đánh giá công khai (trung bình sao theo dịch vụ) trên `/services`/`/pricing` — API `GET /api/reviews?serviceId=` đã trả sẵn `averageRating`.

## API chính

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET|POST /api/pets`, `GET|PATCH /api/pets/:id`
- `GET|POST /api/services`, `PATCH /api/services/:id` (ghi yêu cầu ADMIN)
- `GET|POST /api/employees`, `PATCH /api/employees/:id` (ghi yêu cầu ADMIN)
- `GET /api/availability?employeeId=&serviceId=&date=YYYY-MM-DD`
- `GET|POST /api/bookings`, `PATCH /api/bookings/:id/status`
- `GET /api/notifications`, `PATCH /api/notifications` (đánh dấu tất cả đã đọc), `PATCH /api/notifications/:id`
- `GET /api/reviews?serviceId=`, `POST /api/reviews` (chỉ cho booking `COMPLETED` của chính mình, mỗi booking 1 đánh giá)

Danh sách hỗ trợ `page`, `pageSize` (tối đa 100) và các filter phù hợp (`search`, `species`, `status`, `employeeId`, `from`, `to`). API xác thực bằng HTTP-only JWT cookie.

## Notifications & Reviews

Mỗi lần tạo booking hoặc đổi trạng thái, hệ thống ghi một `Notification` cho khách hàng trong cùng transaction (bảng `notifications`) — hiển thị qua chuông thông báo ở header, tự làm mới mỗi 30s. Mọi thay đổi trạng thái booking cũng được ghi vào `booking_status_history` để làm audit trail. Khách hàng chỉ có thể đánh giá (`reviews`) sau khi booking đã `COMPLETED`, và chỉ một đánh giá cho mỗi booking (ràng buộc unique ở DB).

## Quy tắc dữ liệu quan trọng

Giá luôn được tính trong server từ `Service.basePrice` và `Pet.weight`; client không thể gửi giá. Mọi lượt tạo booking chạy transaction Serializable và PostgreSQL transaction advisory lock theo `employeeId + ngày làm việc`, sau đó kiểm tra khoảng thời gian chồng lấn. Vì vậy hai request cạnh tranh không thể cùng chiếm một slot. Booking `CANCELLED` được loại khỏi cả kiểm tra xung đột lẫn kết quả slot trống.
