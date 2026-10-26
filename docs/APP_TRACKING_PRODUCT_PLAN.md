# App Tracking — Product & Implementation Plan

> Phiên bản: 1.0  
> Ngày cập nhật: 2026-10-25  
> Trạng thái: Đặc tả V1 sẵn sàng để coding agent triển khai  
> Ngôn ngữ giao diện mặc định: Tiếng Việt

## 1. Mục đích tài liệu

Tài liệu này là nguồn yêu cầu chính cho coding agent xây dựng một web app theo dõi thói quen, công việc và mục tiêu hằng ngày. Agent cần đọc toàn bộ tài liệu trước khi viết code, thực hiện theo từng phase và không tự mở rộng sang backend, đăng nhập hoặc tính năng mạng xã hội nếu chưa được yêu cầu.

Các tính năng được đánh dấu `*` là đề xuất bổ sung nhằm cải thiện trải nghiệm so với ý tưởng ban đầu.

## 2. Tầm nhìn sản phẩm

App không chỉ là một to-do list. Đây là một hệ thống phản hồi cá nhân theo vòng lặp:

```text
Lên kế hoạch tối hôm trước
        ↓
Thực hiện trong ngày
        ↓
Checkpoint giữa trưa
        ↓
Điều chỉnh kế hoạch
        ↓
Tổng kết cuối ngày
        ↓
Nhìn lại tiến bộ theo tuần/tháng
```

Câu hỏi trung tâm của màn hình chính:

> Hôm nay tôi cần hoàn thành điều gì, và hiện tại tôi đang đi đúng hướng đến đâu?

### Nguyên tắc sản phẩm

1. Công việc không bắt buộc phải chia theo giờ.
2. Hành động quan trọng nhất luôn cách người dùng tối đa một lần bấm.
3. Kết quả dựa trên dữ liệu thật của người dùng, không dùng số liệu hoặc lời khen giả.
4. Gamification giúp duy trì nhịp, không tạo cảm giác tội lỗi.
5. Một ngày xấu không được phá hủy toàn bộ chuỗi tiến bộ.
6. V1 phải hoạt động tốt cho 1–3 hồ sơ cục bộ mà không cần backend.
7. Mobile là trải nghiệm chính để tick việc; desktop phù hợp cho lập kế hoạch và xem thống kê.

## 3. Đối tượng sử dụng V1

- Sinh viên cần theo dõi việc học, tập luyện và mục tiêu cá nhân.
- Người dùng mở app 3–6 lần/ngày trong khoảng 15–90 giây mỗi lần.
- Có thể tạo tối đa 3 hồ sơ trên cùng một trình duyệt/thiết bị.
- Không có đồng bộ nhiều thiết bị trong V1.
- Không có tính năng cạnh tranh hoặc bảng xếp hạng giữa người dùng trong V1.

## 4. Vòng đời một ngày

### 4.1 Tối hôm trước — Plan Tomorrow

Người dùng:

1. Xem các việc chưa hoàn thành hôm nay.
2. Chọn việc cần chuyển sang ngày mai.
3. Thêm công việc mới.
4. Chọn mức độ quan trọng.
5. Liên kết công việc với mục tiêu lớn nếu có.
6. Chọn tối đa 3 việc quan trọng nhất.
7. Xác nhận kế hoạch ngày mai.

`*` Nếu có hơn 5 việc mức Quan trọng hoặc Cực kỳ quan trọng, app cảnh báo rằng ngày mai có thể đang bị lên kế hoạch quá tải.

### 4.2 Buổi sáng — Start the Day

Màn hình Hôm nay hiển thị:

- 3 ưu tiên chính.
- Danh sách công việc còn lại.
- Thói quen tự động xuất hiện theo lịch tuần.
- Một câu động lực ngắn.
- Một bằng chứng tiến bộ cá nhân dựa trên dữ liệu thật.
- Nút chính: `Bắt đầu ngày` hoặc `Cập nhật tiến độ`.

Ví dụ thông điệp:

> Tuần này bạn đã hoàn thành 18/24 việc quan trọng, nhiều hơn tuần trước 3 việc.

### 4.3 Trong ngày — Execute

- Tick hoàn thành công việc đơn giản.
- Với công việc lớn, chọn mức 0%, 25%, 50%, 75% hoặc 100%.
- Không bắt buộc gán thời gian bắt đầu/kết thúc.
- Cho phép chỉnh sửa mức độ ưu tiên và ghi chú.
- Cho phép hoãn hoặc bỏ qua có lý do.

### 4.4 Giữa trưa — Midday Checkpoint

Checkpoint phải hoàn thành trong 30–60 giây:

- Đã hoàn thành bao nhiêu việc?
- Việc quan trọng nhất đã bắt đầu chưa?
- Năng lượng hiện tại: Thấp / Vừa / Tốt.
- Việc gì cần hoãn, bỏ hoặc giảm phạm vi?
- Việc tiếp theo cần tập trung là gì?

Kết luận mẫu:

> Bạn đã hoàn thành 2/5 việc và đạt 35% số điểm hôm nay. Hãy ưu tiên bài tập Computer Vision trước khi thêm việc mới.

`*` Cho phép đặt giờ checkpoint tùy chỉnh, ví dụ 11:30, 12:00 hoặc 13:00.

`*` Chế độ `Điều chỉnh ngày` giúp giảm kế hoạch còn 1–3 việc thực tế khi ngày không diễn ra như dự kiến.

### 4.5 Cuối ngày — Daily Review

`*` Một quy trình tối đa 60 giây:

1. Xác nhận trạng thái các việc còn lại.
2. Ghi lý do cho việc bị hoãn/bỏ.
3. Viết ghi chú ngắn nếu muốn.
4. Xem điểm ngày và một nhận xét dựa trên dữ liệu.
5. Chuyển sang bước lên kế hoạch ngày mai.

### 4.6 Cuối tuần — Weekly Review

`*` Báo cáo tuần tự động gồm:

```text
Tuần 21–27/10
Hoàn thành: 31/39 công việc — 79%
Điểm: 286
Chuỗi tốt nhất: Học CV — 6 ngày
Tiến bộ lớn nhất: Chạy bộ — 14 km
Vấn đề chính: 5 việc bị hoãn vì kế hoạch quá tải
Gợi ý: Giảm số việc quan trọng từ 5 xuống 3 mỗi ngày
```

## 5. Kiến trúc thông tin và routes

| Route | Màn hình | Mục đích |
|---|---|---|
| `/today` | Hôm nay | Thực hiện và cập nhật ngày hiện tại |
| `/calendar` | Lịch | Chuyển giữa tháng, tuần và ngày |
| `/habits` | Thói quen | Tạo và quản lý lịch lặp |
| `/goals` | Mục tiêu | Theo dõi mục tiêu lớn và cột mốc |
| `/insights` | Thống kê | Biểu đồ và báo cáo tuần/tháng |
| `/notes` | Ghi chú | Tìm và xem ghi chú theo ngày |
| `/settings` | Cài đặt | Hồ sơ, checkpoint, dữ liệu và giao diện |

Thanh bên desktop có đầy đủ nhãn. Trên mobile, thanh bên chuyển thành bottom navigation tối đa 5 mục: Hôm nay, Lịch, Thói quen, Mục tiêu và Thêm.

## 6. Yêu cầu chức năng

### F-01. Màn hình Hôm nay

Phải trả lời ngay ba câu hỏi:

1. Việc quan trọng nhất hôm nay là gì?
2. Tôi đã hoàn thành được bao nhiêu?
3. Tôi nên làm gì tiếp theo?

Các block theo thứ tự:

1. Tiêu đề ngày, câu nhận xét và hành động chính.
2. Tiến độ ngày: điểm đạt/điểm kế hoạch và tỷ lệ hoàn thành.
3. Ba ưu tiên chính.
4. Danh sách việc còn lại.
5. Thói quen hôm nay.
6. Checkpoint hoặc kết quả checkpoint.
7. Ghi chú nhanh.
8. Xu hướng 7 ngày ở mức tối giản.

### F-02. Lịch tháng, tuần và ngày

#### Chế độ tháng

Mỗi ô ngày hiển thị:

- Ngày trong tháng.
- Số việc hoàn thành, ví dụ `4/6`.
- Điểm trong ngày.
- Một trạng thái màu nhỏ: tốt, một phần, kém hoặc chưa có dữ liệu.

Không hiển thị toàn bộ tên công việc trong ô tháng.

#### Chế độ tuần

Mỗi ngày hiển thị:

- Việc quan trọng nhất.
- Các thói quen cố định.
- Tiến độ.
- Trạng thái checkpoint.
- Ghi chú ngắn nếu có.

#### Chế độ ngày

Hiển thị đầy đủ:

- Công việc.
- Thói quen.
- Mục tiêu liên quan.
- Checkpoint.
- Điểm.
- Ghi chú.
- Tổng kết cuối ngày.

Yêu cầu tương tác:

- Nút chuyển `Tháng / Tuần / Ngày`.
- Nút `Hôm nay`.
- Điều hướng kỳ trước/sau.
- Bấm một ngày để mở ngày đó.
- Trạng thái view và ngày được chọn phải tồn tại khi reload.

### F-03. Công việc hằng ngày

Trường dữ liệu:

- Tiêu đề.
- Mô tả tùy chọn.
- Ngày thực hiện.
- Mức độ quan trọng.
- Tiến độ.
- Mục tiêu liên quan tùy chọn.
- Ghi chú tùy chọn.
- Trạng thái hoãn/bỏ.
- Lý do hoãn/bỏ tùy chọn.
- Thời điểm tạo và cập nhật.

Các mức tiến độ:

| Trạng thái | Giá trị |
|---|---:|
| Chưa bắt đầu | 0% |
| Đã bắt đầu | 25% |
| Hoàn thành một nửa | 50% |
| Gần hoàn thành | 75% |
| Hoàn thành | 100% |
| Hoãn | Không nhận/phạt điểm |
| Bỏ qua | Có thể bị phạt tùy độ quan trọng |

Với việc dạng nhị phân, UI chỉ cần checkbox 0%/100%.

`*` Khi hoãn hoặc bỏ qua, cho phép chọn lý do: Thiếu thời gian, Kế hoạch quá nhiều, Không còn cần thiết, Sức khỏe, hoặc Khác.

### F-04. Thói quen và lịch lặp

Hai kiểu lập lịch:

1. Ngày cố định: thứ Hai, Tư, Sáu.
2. Chỉ tiêu tuần: 3 lần/tuần, thực hiện ngày nào cũng được.

Trường dữ liệu:

- Tên thói quen.
- Nhóm: Học tập / Tập luyện / Cá nhân / Khác.
- Kiểu lịch.
- Các ngày lặp hoặc số lần/tuần.
- Điểm mỗi lần.
- Ngày bắt đầu.
- Trạng thái hoạt động/tạm dừng.
- Mục tiêu liên quan tùy chọn.

`*` Hỗ trợ phiên bản tối thiểu:

- Chạy chuẩn: 5 km; tối thiểu: đi bộ 15 phút.
- Học chuẩn: 90 phút; tối thiểu: đọc 15 phút.

Phiên bản tối thiểu giữ nhịp nhưng chỉ nhận 50% điểm.

### F-05. Checkpoint

Checkpoint lưu:

- Thời điểm thực hiện.
- Tỷ lệ hoàn thành lúc checkpoint.
- Mức năng lượng.
- Việc tiếp theo được chọn.
- Các thay đổi kế hoạch.
- Ghi chú tùy chọn.

Nếu người dùng bỏ qua checkpoint, app không phạt điểm.

### F-06. Mục tiêu lớn

Mỗi mục tiêu có:

- Tên.
- Mô tả.
- Ngày bắt đầu.
- Ngày dự kiến hoàn thành.
- Trạng thái.
- Danh sách cột mốc.
- Công việc/thói quen liên quan.
- Tiến độ được tính từ cột mốc.

Ví dụ:

```text
Hoàn thành đồ án Computer Vision — 42%
✓ Chọn bộ dữ liệu
✓ Xây dựng baseline
● Thử nghiệm mô hình SOTA
○ Ablation study
○ Viết báo cáo
```

`*` Trường `Tại sao mục tiêu này quan trọng?` được hiển thị lại khi người dùng mất nhịp.

`*` Cảnh báo mục tiêu bị bỏ quên, ví dụ không có hoạt động liên quan trong 8 ngày.

### F-07. Ghi chú theo ngày

Mỗi ngày có một ghi chú tự do. Có thể gợi ý ba câu hỏi nhưng không bắt buộc:

1. Hôm nay điều gì diễn ra tốt?
2. Điều gì cản trở bạn?
3. Ngày mai bạn sẽ thay đổi điều gì?

### F-08. Động lực dựa trên dữ liệu

Màn hình Hôm nay hiển thị một thông điệp được tạo từ dữ liệu cục bộ:

- So sánh với tuần trước.
- Quãng đường/khối lượng tích lũy.
- Chuỗi đang duy trì.
- Cột mốc gần đạt.

Không dùng số liệu bịa đặt và không lặp một thông điệp quá hai ngày liên tiếp nếu còn lựa chọn khác.

`*` Người dùng có thể tạo danh sách câu nói cá nhân và bật/tắt câu nói mặc định.

### F-09. Thống kê

V1 cần các hình thức trực quan sau:

1. Tỷ lệ hoàn thành theo tuần.
2. Điểm mỗi ngày trong 30 ngày.
3. Lịch nhiệt hoạt động.
4. Tiến độ từng mục tiêu.
5. Chuỗi thói quen.
6. Phân bố công việc theo nhóm.
7. Tỷ lệ Hoàn thành / Hoãn / Bỏ.
8. So sánh Kế hoạch / Thực tế.

Màn hình Hôm nay chỉ hiển thị tiến độ ngày, chuỗi nổi bật và một xu hướng 7 ngày. Các biểu đồ đầy đủ thuộc `/insights`.

### F-10. Hồ sơ cục bộ

- Tạo tối đa 3 hồ sơ.
- Chuyển hồ sơ từ menu cài đặt hoặc switcher.
- Dữ liệu của các hồ sơ tách biệt.
- Không có mật khẩu hoặc đăng nhập trong V1.

`*` Cho phép xuất và nhập dữ liệu JSON để sao lưu. Đây là yêu cầu quan trọng vì dữ liệu localStorage có thể bị xóa khi người dùng dọn trình duyệt.

## 7. Hệ thống điểm

### 7.1 Điểm cơ bản

| Mức độ | Điểm cơ bản |
|---|---:|
| Thường | 5 |
| Trung bình | 10 |
| Quan trọng | 20 |
| Cực kỳ quan trọng | 30 |

### 7.2 Công thức

```text
Điểm nhận = Điểm cơ bản × Hệ số hoàn thành
Hiệu suất ngày = Tổng điểm nhận / Tổng điểm kế hoạch × 100
```

| Tiến độ | Hệ số |
|---:|---:|
| 0% | 0.00 |
| 25% | 0.25 |
| 50% | 0.50 |
| 75% | 0.75 |
| 100% | 1.00 |

Ví dụ:

| Công việc | Điểm gốc | Hoàn thành | Điểm nhận |
|---|---:|---:|---:|
| Học Computer Vision | 20 | 75% | 15 |
| Chạy bộ | 10 | 100% | 10 |
| Đọc sách | 5 | 0% | 0 |

```text
Điểm đạt: 25
Điểm kế hoạch: 35
Hiệu suất: 25 / 35 = 71.4%
```

### 7.3 Điểm phạt

| Trường hợp bỏ qua | Điểm phạt |
|---|---:|
| Việc thường | 0 |
| Việc trung bình | -2 |
| Việc quan trọng | -5 |
| Việc cực kỳ quan trọng | -8 |
| Hoãn có chủ đích | 0 |

`*` Tổng điểm phạt tối đa mỗi ngày là `-10`.

`*` `Ngày phục hồi` không áp dụng điểm phạt khi người dùng bị bệnh hoặc có sự cố. Ngày này vẫn lưu vào lịch nhưng không làm giảm thống kê hiệu suất dài hạn.

## 8. Cơ chế chuỗi

Các chuỗi độc lập:

- Chuỗi của từng thói quen.
- Chuỗi lên kế hoạch buổi tối.
- Chuỗi checkpoint.
- Chuỗi đạt tối thiểu 70% kế hoạch ngày.
- Chuỗi đạt mục tiêu tuần.

Quy tắc:

- Thói quen theo ngày tính chuỗi theo ngày đã lên lịch.
- Thói quen `3 lần/tuần` tính chuỗi theo tuần, không bắt buộc đúng ngày.
- Ngày không nằm trong lịch không làm mất chuỗi.
- Ngày phục hồi không làm tăng nhưng cũng không làm mất chuỗi.

`*` Mỗi tháng cấp tối đa 1 vé bảo toàn chuỗi. V1 có thể bật/tắt tính năng này trong Settings.

## 9. Trạng thái dữ liệu và quy tắc nghiệp vụ

### 9.1 State machine của công việc

```text
PLANNED → IN_PROGRESS → COMPLETED
   │            │
   ├────────────┴──→ DEFERRED → PLANNED (ngày mới)
   └───────────────→ SKIPPED
```

Quy tắc:

- `COMPLETED` luôn có progress 100.
- `IN_PROGRESS` có progress 25, 50 hoặc 75.
- `DEFERRED` bắt buộc có ngày mới nếu người dùng muốn chuyển tiếp.
- Một task được tạo cho ngày khác nhưng chưa đến ngày vẫn là `PLANNED`.
- Không nhân đôi điểm khi task được chuyển ngày.
- Điểm chỉ thuộc về ngày task thực sự được hoàn thành.

### 9.2 Tính tiến độ mục tiêu

Mặc định:

```text
Tiến độ mục tiêu = Tổng trọng số milestone đã hoàn thành / Tổng trọng số milestone
```

Nếu chưa đặt trọng số, mỗi milestone có trọng số bằng nhau.

## 10. Mô hình dữ liệu đề xuất

Coding agent có thể điều chỉnh tên trường nhưng phải giữ ý nghĩa và schema version.

```ts
type Priority = "normal" | "medium" | "important" | "critical";
type Progress = 0 | 25 | 50 | 75 | 100;
type TaskStatus = "planned" | "in_progress" | "completed" | "deferred" | "skipped";
type EnergyLevel = "low" | "medium" | "good";

interface Profile {
  id: string;
  name: string;
  createdAt: string;
  checkpointTime: string;
  locale: "vi-VN";
}

interface DailyTask {
  id: string;
  profileId: string;
  date: string; // YYYY-MM-DD theo timezone local
  title: string;
  description?: string;
  priority: Priority;
  progress: Progress;
  status: TaskStatus;
  isTopPriority: boolean;
  goalId?: string;
  habitId?: string;
  note?: string;
  deferReason?: string;
  deferredTo?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

interface Habit {
  id: string;
  profileId: string;
  name: string;
  category: "study" | "fitness" | "personal" | "other";
  scheduleType: "fixed_days" | "weekly_target";
  weekdays?: number[];
  weeklyTarget?: number;
  basePoints: number;
  minimumVersion?: {
    label: string;
    pointMultiplier: 0.5;
  };
  goalId?: string;
  startDate: string;
  isActive: boolean;
}

interface Goal {
  id: string;
  profileId: string;
  title: string;
  description?: string;
  why?: string;
  startDate: string;
  targetDate?: string;
  status: "active" | "paused" | "completed" | "archived";
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  title: string;
  weight: number;
  isCompleted: boolean;
  completedAt?: string;
}

interface MiddayCheckpoint {
  id: string;
  profileId: string;
  date: string;
  completedAt: string;
  completionPercent: number;
  energy: EnergyLevel;
  nextTaskId?: string;
  note?: string;
}

interface DailyNote {
  id: string;
  profileId: string;
  date: string;
  content: string;
  updatedAt: string;
}

interface DayMeta {
  profileId: string;
  date: string;
  isRecoveryDay: boolean;
  planConfirmedAt?: string;
  reviewCompletedAt?: string;
}

interface AppStorage {
  schemaVersion: number;
  activeProfileId: string;
  profiles: Profile[];
  tasks: DailyTask[];
  habits: Habit[];
  goals: Goal[];
  checkpoints: MiddayCheckpoint[];
  notes: DailyNote[];
  days: DayMeta[];
}
```

## 11. Kiến trúc kỹ thuật V1

### 11.1 Stack chính

| Lớp | Công nghệ | Lý do |
|---|---|---|
| Framework | Next.js App Router | Routing, layout, khả năng mở rộng và deploy dễ dàng |
| UI | React + TypeScript strict | Component rõ ràng, kiểm tra kiểu dữ liệu |
| Styling | Tailwind CSS + CSS variables | Tốc độ xây dựng, token giao diện nhất quán |
| State | Zustand theo các slice nhỏ | Trạng thái cục bộ đơn giản, tránh Context re-render rộng |
| Persistence | Zustand persist + localStorage có version | Không cần backend, phù hợp V1 nhỏ |
| Validation | Zod | Kiểm tra schema khi import/migrate dữ liệu |
| Date | date-fns | Xử lý lịch tháng/tuần/ngày và locale Việt Nam |
| Icons | Lucide React, dùng hạn chế | Icon outline nhất quán, không dùng icon trang trí dư thừa |
| Charts | SVG/CSS tự xây cho các chart nhỏ | Giảm bundle, kiểm soát accessibility và thiết kế |
| Unit tests | Vitest + Testing Library | Test logic điểm, chuỗi và component |
| E2E | Playwright | Kiểm tra luồng người dùng trên desktop/mobile |

Không cài chart library lớn trong V1 nếu SVG/CSS đã đủ. Không cài calendar library lớn nếu ba view có thể xây từ `date-fns` và component riêng.

### 11.2 Local-first

- Không API server.
- Không auth.
- Không database từ xa.
- Mọi dữ liệu được lưu trong localStorage theo một key có version, ví dụ `app-tracking:v1`.
- Mọi truy cập localStorage nằm trong một storage adapter, không đọc rải rác trong component.
- Cần xử lý hydration để không nhấp nháy hoặc render sai dữ liệu.
- Có migration function khi schemaVersion thay đổi.
- Có Export/Import JSON trước khi người dùng xóa dữ liệu.

### 11.3 Khi nào mới thêm backend

Chỉ thêm Supabase/PostgreSQL hoặc giải pháp tương đương khi có một trong các yêu cầu:

- Đồng bộ nhiều thiết bị.
- 2–3 người dùng ở các thiết bị khác nhau cần dữ liệu riêng.
- Đăng nhập.
- Chia sẻ mục tiêu hoặc lịch.
- Gửi notification đáng tin cậy từ server.

Khi đó cần migration từ localStorage lên server; không triển khai trong V1 này.

## 12. Cấu trúc source đề xuất

```text
src/
  app/
    (app)/
      layout.tsx
      today/page.tsx
      calendar/page.tsx
      habits/page.tsx
      goals/page.tsx
      insights/page.tsx
      notes/page.tsx
      settings/page.tsx
  components/
    app-shell/
    calendar/
    tasks/
    habits/
    goals/
    insights/
    notes/
    checkpoint/
    ui/
  domain/
    scoring.ts
    streaks.ts
    scheduling.ts
    goals.ts
    insights.ts
  store/
    app-store.ts
    slices/
    migrations/
    storage-adapter.ts
  lib/
    dates.ts
    ids.ts
    validation.ts
  test/
    fixtures/
    e2e/
```

Domain logic không đặt trực tiếp trong React component. Các hàm tính điểm, chuỗi, lịch lặp và thống kê phải là pure function để có thể unit test.

## 13. Thiết kế giao diện

### 13.1 Hướng thiết kế

Đây là app screen, không phải landing page. Giao diện cần:

- Sáng, bình tĩnh, ưu tiên nội dung.
- Một màu nhấn chính dùng cho dữ liệu và tối đa một hành động chính.
- Sidebar cùng tông với nền, không dùng sidebar tối trên canvas sáng.
- Card phẳng, border nhẹ hoặc khác biệt màu nền; không dùng cả border và shadow nặng.
- Không gradient, glow, glassmorphism hoặc icon nằm trong ô màu trên mọi card.
- Không tạo hàng bốn KPI card giống dashboard template.
- Số liệu phải cộng đúng và lấy từ dữ liệu thật.
- Chart một chủ đề dùng một màu; trạng thái tốt/xấu dùng màu semantic.
- H1 app khoảng 20–24px; không dùng hero title kiểu landing page.
- Touch target trên mobile tối thiểu 44px.

### 13.2 Màn hình desktop

- Sidebar có nhãn, khoảng 224–240px.
- Canvas dùng hết chiều rộng còn lại với gutter nhất quán 24–32px.
- Khu vực Hôm nay có cột chính và một rail phụ cho mục tiêu/ghi chú nếu đủ rộng.
- Không để card ngắn bị kéo cao tạo khoảng trắng lớn.

### 13.3 Màn hình mobile

- Bottom navigation hoặc top bar gọn.
- Mỗi lần chỉ hiển thị một vùng nội dung chính.
- Calendar tháng có thể cuộn nhưng trang không được cuộn ngang.
- Chart cao khoảng 160–200px.
- Danh sách task ưu tiên xuất hiện trong 60% đầu màn hình.
- Action quan trọng không bị giấu trong menu ba chấm.

### 13.4 Accessibility

- Điều hướng đầy đủ bằng bàn phím.
- Focus indicator rõ ràng.
- Checkbox và progress control có label truy cập được.
- Không chỉ dựa vào màu để biểu thị trạng thái.
- Text thông thường đạt tương phản WCAG AA.
- Hỗ trợ `prefers-reduced-motion`.
- Modal phải trap focus và trả focus về trigger khi đóng.
- Các chart có text summary hoặc bảng dữ liệu tương đương.

## 14. Skills coding agent phải sử dụng

Các skill có thể dùng chung trong một task; không bị giới hạn một skill cho mỗi prompt.

### 14.1 `$design-taste-frontend`

Mục đích:

- Chọn hướng thiết kế app/dashboard.
- Thiết kế app shell, Today, Calendar và Insights.
- Tránh giao diện dashboard AI chung chung.
- Chạy lint/inspect ở chế độ app và xem ảnh chụp ở 1440, 768, 390px.

Thời điểm dùng:

- Trước khi xây UI.
- Khi xây màn hình mới.
- Khi giao diện trông rời rạc hoặc generic.
- Trước nghiệm thu UI cuối cùng.

Yêu cầu cho agent:

```text
Sử dụng $design-taste-frontend theo nhánh app screen.
Đọc references/app-screens.md trước khi thiết kế.
Không áp dụng quy trình landing page cho dashboard này.
```

### 14.2 `$vercel-react-best-practices`

Mục đích:

- Tối ưu React/Next.js.
- Tránh re-render không cần thiết.
- Giảm bundle.
- Quản lý localStorage đúng schema/version.
- Tránh hydration flicker.
- Tách tải phần Insights/chart nếu nặng.

Ưu tiên áp dụng:

1. Không tạo async waterfall.
2. Import trực tiếp, tránh barrel file lớn.
3. Dynamic import phần chart/insights nếu đáng kể.
4. Đọc localStorage một lần qua adapter/store.
5. Derived state được tính từ state gốc, không đồng bộ bằng effect.
6. Component không được định nghĩa bên trong component khác.
7. Dùng `startTransition` cho chuyển view hoặc lọc không khẩn cấp nếu UI bị chậm.

Thời điểm dùng:

- Từ lúc scaffold component React đầu tiên.
- Khi review mỗi phase.
- Trước khi chạy build production.

### 14.3 `$web-design-guidelines`

Mục đích:

- Audit accessibility.
- Audit form, keyboard, responsive, semantics và UX.
- Báo lỗi theo file và dòng để sửa có hệ thống.

Thời điểm dùng:

- Sau khi mỗi nhóm màn hình hoàn thành.
- Bắt buộc trước nghiệm thu V1.

Khi dùng skill này, agent phải fetch guideline mới nhất theo chỉ dẫn của skill trước khi review.

### 14.4 `$playwright-cli`

Mục đích:

- Chạy test hành vi thật trong trình duyệt.
- Kiểm tra Desktop, Tablet và Mobile.
- Kiểm tra localStorage, reload và state persistence.
- Chụp ảnh và kiểm tra console error.

Thời điểm dùng:

- Sau khi có luồng end-to-end đầu tiên.
- Sau mỗi phase chức năng lớn.
- Trước khi báo hoàn thành.

Viewport tối thiểu:

- Desktop: 1440×900.
- Tablet: 768×1024.
- Mobile: 390×844.

## 15. Trình tự phối hợp skills

```text
1. $design-taste-frontend
   → chốt app shell, tokens và cấu trúc màn hình

2. $vercel-react-best-practices
   → triển khai React/Next.js và review hiệu năng liên tục

3. $web-design-guidelines
   → audit UI/accessibility sau khi màn hình ổn định

4. $playwright-cli
   → chạy hành vi thật, responsive, persistence và regression

5. Lặp lại bước 1–4 cho các lỗi được phát hiện
```

Ví dụ prompt kết hợp:

```text
Hãy xây dựng màn hình Today theo APP_TRACKING_PRODUCT_PLAN.md.
Sử dụng $design-taste-frontend theo app-screen rules cho bố cục và giao diện,
đồng thời dùng $vercel-react-best-practices cho cấu trúc React/Next.js.
Sau khi hoàn thành, dùng $web-design-guidelines để audit source và
$playwright-cli để kiểm tra tại 1440x900, 768x1024 và 390x844.
Không thêm backend hoặc auth.
```

## 16. Kế hoạch triển khai theo phase

### Phase 0 — Khảo sát và chốt nền tảng

- Đọc tài liệu này.
- Kiểm tra repo hiện có.
- Xác nhận package manager.
- Chạy design skill ở chế độ app.
- Ghi lại style/tokens được chọn.
- Không viết chức năng trước khi app shell được chốt.

Đầu ra:

- App shell desktop/mobile.
- Design tokens.
- Cấu trúc route.
- Dataset mẫu thực tế, các tổng phải cộng đúng.

### Phase 1 — Domain và persistence

- Khai báo types/schema.
- Storage adapter.
- Store slices.
- Schema version và migration.
- Pure functions cho scoring, priority và daily completion.
- Export/import JSON.

Test bắt buộc:

- Công thức điểm.
- Điểm phạt tối đa.
- Task deferred không bị tính điểm hai lần.
- Reload vẫn giữ dữ liệu.
- Import sai schema bị từ chối an toàn.

### Phase 2 — Today và daily planning

- Today page.
- CRUD task.
- Top 3 priorities.
- Plan Tomorrow.
- Progress 0/25/50/75/100.
- Daily note.
- Midday checkpoint.
- Daily review.

### Phase 3 — Calendar

- Month view.
- Week view.
- Day view.
- Điều hướng thời gian.
- Deep link/query cho ngày và view được chọn.
- Kiểm tra các tháng bắt đầu Chủ nhật/Thứ hai, tháng 28/29/30/31 ngày.

### Phase 4 — Habits và streaks

- Fixed-day habits.
- Weekly-target habits.
- Minimum version.
- Daily/weekly streak.
- Recovery day.
- Streak protection nếu bật.

### Phase 5 — Goals

- CRUD goal.
- Milestone.
- Liên kết task/habit.
- Tính tiến độ.
- Goal sidebar/rail.
- Inactivity warning.

### Phase 6 — Insights và motivation

- 7-day trend trên Today.
- Weekly completion.
- 30-day score chart.
- Activity heatmap.
- Goal progress.
- Weekly report.
- Data-driven motivation messages.

### Phase 7 — Audit và hardening

- UI audit bằng web-design-guidelines.
- Browser test bằng Playwright.
- Kiểm tra keyboard và reduced motion.
- Kiểm tra empty/loading/error states.
- Kiểm tra console không có error/warning đáng kể.
- Build production thành công.
- Kiểm tra performance budget.

## 17. Kịch bản E2E bắt buộc

### E2E-01. Lên kế hoạch và hoàn thành task

1. Tạo task cho ngày mai.
2. Chọn mức Quan trọng.
3. Đánh dấu vào Top 3.
4. Reload trang.
5. Task vẫn tồn tại.
6. Chuyển sang ngày mai.
7. Cập nhật 50%, sau đó 100%.
8. Điểm thay đổi đúng 10 rồi 20.

### E2E-02. Checkpoint

1. Có 5 task, tổng 60 điểm.
2. Hoàn thành 20 điểm.
3. Mở checkpoint.
4. UI hiển thị khoảng 33.3%.
5. Chọn năng lượng Vừa và task tiếp theo.
6. Reload.
7. Checkpoint vẫn tồn tại.

### E2E-03. Thói quen theo tuần

1. Tạo thói quen chạy 3 lần/tuần.
2. Hoàn thành vào Thứ ba, Thứ năm, Chủ nhật.
3. Tuần được tính đạt dù không có ngày cố định.
4. Chuỗi tuần tăng một.

### E2E-04. Hoãn task

1. Tạo task quan trọng 20 điểm.
2. Hoãn sang ngày mai.
3. Ngày hiện tại không nhận và không bị phạt điểm.
4. Ngày mai chỉ có một bản task.
5. Hoàn thành ngày mai nhận đúng 20 điểm.

### E2E-05. Hồ sơ

1. Tạo hai hồ sơ.
2. Mỗi hồ sơ tạo task khác nhau.
3. Chuyển hồ sơ không lẫn dữ liệu.
4. Reload giữ đúng hồ sơ đang hoạt động.

### E2E-06. Export/import

1. Tạo dữ liệu mẫu.
2. Export JSON.
3. Xóa dữ liệu hồ sơ.
4. Import file vừa export.
5. Tasks, goals, habits và notes được phục hồi đúng.

### E2E-07. Responsive

Kiểm tra ở 1440×900, 768×1024 và 390×844:

- Không cuộn ngang trang.
- Navigation chuyển đúng dạng.
- Task action có touch target tối thiểu 44px trên mobile.
- Calendar đọc được.
- Chart không cắt label.
- Modal không vượt viewport.

## 18. Performance budget

- Không có request mạng bắt buộc để dùng app sau khi tải source.
- Chuyển route chính không tạo cảm giác trễ trên dataset 1.000 tasks.
- Thao tác tick task cập nhật UI trong một frame cảm nhận được, mục tiêu dưới 100ms.
- Tính statistics trên 10.000 task không khóa UI quá 200ms trên máy thông thường; nếu vượt, memoize theo dữ liệu hoặc chuyển tính toán sang idle time.
- Không đọc/parse toàn bộ localStorage trong mỗi render.
- Insights/chart nặng được tải khi người dùng mở trang Insights.
- Không có hydration mismatch.
- Production build phải hoàn thành không lỗi.

## 19. Empty, loading và error states

- Ngày chưa có task vẫn giữ bố cục và hiển thị CTA `Lên kế hoạch cho ngày này`.
- Chart chưa có dữ liệu hiển thị trục/zero state và câu giải thích, không dùng minh họa giả.
- Import lỗi hiển thị lý do và không ghi đè dữ liệu hiện tại.
- Storage lỗi hiển thị cảnh báo cùng lựa chọn export dữ liệu nếu có thể.
- Loading dùng skeleton phẳng đúng kích thước, không shimmer gradient.
- Giá trị thật bằng 0 hiển thị `0`; dữ liệu không tồn tại hiển thị dấu `—`.

## 20. Ngoài phạm vi V1

- Backend/database từ xa.
- Authentication.
- Đồng bộ nhiều thiết bị.
- Google Calendar.
- Email/push notification từ server.
- AI tự động lập lịch.
- Chia sẻ mục tiêu.
- Bảng xếp hạng.
- Marketplace template.
- Native mobile app.
- Gamification phức tạp như level, vật phẩm hoặc tiền ảo.

## 21. Definition of Done

V1 chỉ được xem là hoàn thành khi:

- Tất cả route chính hoạt động.
- Vòng lặp Plan → Execute → Checkpoint → Review hoạt động đầy đủ.
- Month/Week/Day calendar hoạt động.
- Điểm, phạt và streak có unit test.
- Dữ liệu tồn tại sau reload.
- Export/import hoạt động.
- Không lẫn dữ liệu giữa các hồ sơ.
- Không có lỗi console nghiêm trọng.
- Production build thành công.
- `design-taste-frontend` app inspection không còn FAIL chưa xử lý.
- `web-design-guidelines` không còn lỗi accessibility mức nghiêm trọng.
- Các kịch bản Playwright quan trọng vượt qua ở desktop và mobile.
- README có hướng dẫn chạy, build và sao lưu dữ liệu.

## 22. Prompt khởi động dành cho coding agent

```text
Hãy đọc toàn bộ file docs/APP_TRACKING_PRODUCT_PLAN.md và kiểm tra codebase hiện tại.

Mục tiêu là xây V1 local-first của ứng dụng theo dõi công việc, thói quen và mục tiêu hằng ngày.
Không thêm backend, auth hoặc đồng bộ cloud.

Trước tiên hãy thực hiện Phase 0 và báo lại:
1. Hiện trạng repo và stack.
2. Các quyết định kiến trúc đề xuất.
3. Cấu trúc dữ liệu và route.
4. Những điểm mơ hồ hoặc xung đột trong tài liệu.
5. Kế hoạch triển khai theo phase.

Sử dụng $design-taste-frontend theo app-screen rules để chốt hướng UI.
Khi bắt đầu viết React/Next.js, áp dụng $vercel-react-best-practices.
Sau mỗi nhóm màn hình, audit bằng $web-design-guidelines và kiểm tra luồng thật bằng $playwright-cli.

Chưa bắt đầu Phase 1 cho đến khi Phase 0 đã rõ ràng.
```

