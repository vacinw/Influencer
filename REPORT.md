# Báo Cáo Tổng Quan Dự Án InfluConnect

**Tên dự án:** Nền Tảng Web Kết Nối Influencer và Nhãn Hàng (InfluConnect)

## 1. Tổng Quan Về Công Nghệ Sử Dụng (Tech Stack)

### 1.1. Frontend (Giao diện người dùng)
*   **Ngôn ngữ chính:** `TypeScript`
*   **Framework/Thư viện cốt lõi:** `React (v19)`
*   **Trình quản lý module và Build Tool:** `Vite`
*   **Định tuyến (Routing):** `React Router DOM (v7)`
*   **CSS Framework:** `Tailwind CSS (v4)` kết hợp với `PostCSS` và một số plugin tạo giao diện typography.
*   **Giao tiếp API:** `Axios`
*   **Các thư viện hỗ trợ giao diện và tính năng khác:**
    *   `lucide-react`: Bộ icon giao diện hiện đại.
    *   `easymde`, `react-simplemde-editor`, `react-markdown`: Hiển thị và soạn thảo nội dung Rich Text (Markdown), rất hữu ích cho text mô tả Campaign.
    *   `react-simple-star-rating`: Hệ thống đánh giá sao (Review sao).
    *   `react-social-media-embed`: Hỗ trợ nhúng nội dung từ các mạng xã hội.

### 1.2. Backend (Máy chủ và Xử lý logic)
*   **Ngôn ngữ chính:** `Java (JDK 21)` (Sử dụng phiên bản tiên tiến nhất)
*   **Framework chính:** `Spring Boot (v3.2.0)`
*   **Bảo mật & Phân quyền:**
    *   `Spring Security`: Quản lý Authentication và Authorization.
    *   `OAuth2 Client`: Tích hợp đăng nhập qua Google (Đăng nhập mạng xã hội).
    *   `JJWT (io.jsonwebtoken)`: Triển khai xác thực phi trạng thái (Stateless Authentication) bằng JSON Web Token.
*   **Tương tác cơ sở dữ liệu:** `Spring Data JPA` (sử dụng `Hibernate` dưới nền).
*   **Cơ sở dữ liệu:** `MySQL` thông qua `mysql-connector-j`.
*   **Hỗ trợ tiện ích khác:**
    *   `Lombok`: Giảm thiểu boilerplate code cho các class Java.
    *   `Cloudinary`: Lưu trữ và quản lý tài nguyên hình ảnh (Avatar, Banner chiến dịch, Upload file) thông qua API Cloudinary HTTP44.
    *   `Spring Boot Validation`: Kiểm tra tính hợp lệ dữ liệu đầu vào.
    *   `Thymeleaf`: Template Engine dùng để tạo định dạng template (có thể cho các email gửi đi).

### 1.3. Các Dịch Vụ / Nền Tảng Bên Thứ 3
*   **Sepay (sepay.vn):** Cổng thanh toán tích hợp tự động qua QR code giúp người dùng nạp tiền vào ví.
*   **Cloudinary:** Lưu trữ dữ liệu media.
*   **Google OAuth 2.0:** Hệ thống xác thực bằng tài khoản Google.

---

## 2. Mô Tả Chức Năng Chi Tiết Hệ Thống

Hệ thống được thiết kế dựa trên mô hình Role-Based Access Control (RBAC) với 3 vai trò chính: **Admin (Quản trị viên)**, **Creator/Brand (Nhãn hàng - Người tạo chiến dịch)**, và **Receiver/KOL (Người ảnh hưởng - Người nhận chiến dịch)**.

### 2.1. Phân Hệ Người Dùng Chung (Public & Guest)
*   **Xác thực và Cấp quyền (Authentication/Authorization):**
    *   Đăng ký và Đăng nhập bằng Email/Password truyền thống.
    *   Đăng nhập nhanh qua **Google OAuth2**.
    *   Màn hình Chọn Vai Trò (Role Selection) cho người dùng đăng nhập lần đầu tiên để định danh là Brand hay KOL.
    *   Hệ thống xác minh tài khoản (Verification Page).
*   **Khám Phá (Explore / Home):**
    *   Cho phép người lạ chưa đăng nhập vẫn có thể lướt xem các danh sách chiến dịch (Campaigns), danh mục đa dạng (Categories).
    *   Xem thông tin chi tiết của một hạng mục công việc (Job Detail) mà nhãn hàng đang tuyển.
*   **Quản Lý Hồ Sơ (Profile):**
    *   Cập nhật thông tin cá nhân tùy theo vai trò.
    *   Các Influencer/KOL có thể cập nhật portfolio, các đường link social media của bản thân để làm đẹp hồ sơ ứng tuyển.

### 2.2. Phân Hệ Nhãn Hàng / Người Tạo Chiến Dịch (Creator)
*   **Đăng tải & Quản lý Nháp / Chiến dịch (Campaign Management):**
    *   Tạo chiến dịch mới: Khai báo đầy đủ các thông tin (Tên chiến dịch, mô tả - Markdown, giá tiền, số lượng cần tuyển, ngày bắt đầu/kết thúc, hình ảnh banner).
    *   Chỉnh sửa và hủy chiến dịch.
    *   Dashboard theo dõi nhanh sự quan tâm đối với các chiến dịch đã đăng tải.
*   **Quản Lý Ứng Viên (Applicants Management):**
    *   Xem danh sách các KOLs (`ApplicantsList`) đã bấm ứng tuyển (Apply) vào các chiến dịch của mình.
    *   Xem hồ sơ ứng viên (Profile) để quyết định Duyệt (Approve) hay Từ chối (Reject).
*   **Công việc & Hợp đồng:** Theo dõi quá trình thực hiện công việc (Job) của KOL sau khi đã đồng ý, phê duyệt báo cáo hoàn thành công việc.

### 2.3. Phân Hệ Người Ảnh Hưởng / KOL (Receiver)
*   **Tìm kiếm & Ứng tuyển:**
    *   Lướt qua các Campaign trên nền tảng, lọc theo mô tả/brand hoặc tình trạng.
    *   Ứng tuyển vào các chiến dịch phù hợp với bản thân.
*   **Báo cáo & Nhận thù lao:**
    *   Quản lý các chiến dịch đang trong tiến trình (Dashboard KOL).
    *   (Dự kiến / Có sẵn cơ chế) Báo cáo tiến độ và nghiệm thu để Brand duyệt nghiệm thu.
    *   Nhận thù lao: Thù lao sẽ được cộng vào **Ví Điện Tử (Wallet)** của KOL sau khi hoàn tất công việc.

### 2.4. Tính Năng Ví Điện Tử và Thanh Toán (Wallet Module)
Đây là module cốt lõi liên quan đến sự vận hành tiền tệ của hệ thống:
*   **Ví người dùng:** Tích hợp ví chung để quản lý số dư (Balance).
*   **Nạp tiền (Deposit):** Nhãn hàng có thể nạp tiền thông qua chuyển khoản ngân hàng quét mã QR Code tạo ra bởi **Sepay** tự động xác nhận số dư khi ngân hàng ghi nhận.
*   **Tạo yêu cầu Rút Tiền (Withdrawal):** Influencer/KOL sau khi kiếm được thu nhập có thể đặt lệnh yêu cầu rút tiền về tài khoản ngân hàng của họ. Lệnh này sẽ được gửi tới Admin ở trạng thái "Pending".
*   **Lịch sử giao dịch:** Kiểm kê lại toàn bộ các lịch sử vào/ra của dòng tiền.

### 2.5. Phân Hệ Quản Trị Viên (Admin Dashboard)
*   **Quản Lý Người Dùng & Vai Trò:**
    *   Xem danh sách toàn bộ Users trên hệ thống. 
    *   Khóa/Mở Khóa (Ban/Unban) tài khoản khi có vi phạm.
*   **Quản Lý Chiến Dịch (Admin Campaign Management):**
    *   Admin có toàn quyền kiểm soát tính hợp lệ của tất cả chiến dịch.
    *   Thực hiện thao tác CRUD (Cho phép sửa các mô tả sai luật, xóa/loại bỏ các chiến dịch vi phạm tiêu chuẩn cộng đồng).
*   **Quản Lý Rút Tiền (Withdrawal Management):**
    *   Tiếp nhận các lệnh (Withdrawal Requests) rút tiền từ KOLs.
    *   Duyệt (Approve) hoặc Từ Chối (Reject) lệnh rút tiền, kèm theo quá trình chuyển tiền thực tế ngoài hệ thống.
*   **Chức Năng Thông Báo & Banner:** Quản lý thay đổi Banner quảng cáo, bắn Notification trên nền tảng.

### 2.6. Các Chức Năng Hỗ Trợ Khác
*   **Review & Rating:** Hệ thống Đánh giá giữa Creator và Receiver sau khi hoàn thành chiến dịch nhằm nâng cao uy tín cho KOL và Brand.
*   **Thông báo (Notification):** Bắn thông báo (bell-icon) khi có ai đó Apply, Được Duyệt, hoặc Khi lệnh rút tiền thay đổi trạng thái, v.v.

---
