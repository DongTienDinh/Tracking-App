# App Tracking V1

Ứng dụng lập kế hoạch và theo dõi tiến độ cá nhân theo mô hình local-first. Toàn bộ hồ sơ, task, habit, goal, checkpoint, ghi chú và báo cáo được lưu trong `localStorage`; ứng dụng không gửi dữ liệu tới backend.

## Tính năng

- Vòng lặp ngày: Plan Tomorrow → Execute → Midday Checkpoint → Daily Review.
- Task nhị phân hoặc theo tiến độ 0/25/50/75/100, Top 3, hoãn có chuỗi liên kết và phạt khi bỏ.
- Calendar Month/Week/Day, tuần bắt đầu từ thứ Hai và hỗ trợ deep link.
- Habit theo ngày cố định hoặc chỉ tiêu tuần, minimum habit, streak và Recovery Day.
- Goal/milestone có trọng số, liên kết task/habit và cảnh báo 8 ngày không hoạt động.
- Insights từ dữ liệu thật: tuần, 30 ngày, heatmap, plan/actual, phân bố, streak và weekly report.
- Tối đa ba hồ sơ độc lập; export/import backup JSON có kiểm tra schema.

## Yêu cầu

- Node.js 20.9 trở lên.
- `pnpm` qua Corepack.

```powershell
corepack enable
corepack pnpm install
```

Nếu Windows không cho phép `corepack enable`, có thể dùng trực tiếp `corepack pnpm <command>` như các lệnh bên dưới.

## Chạy local

```powershell
corepack pnpm dev
```

Mở `http://localhost:3000`. Route `/` tự chuyển đến `/today`.

## Kiểm tra và build

```powershell
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm build
corepack pnpm start
```

Playwright cần trình duyệt Chromium ở lần chạy đầu:

```powershell
corepack pnpm exec playwright install chromium
```

## Backup và khôi phục

1. Vào **Cài đặt → Dữ liệu** và chọn **Export JSON**.
2. Giữ file `app-tracking-backup-YYYY-MM-DD.json` ở nơi an toàn.
3. Để khôi phục, chọn **Import JSON**, kiểm tra cảnh báo rồi xác nhận.

Import là thao tác thay thế toàn bộ. File được xác thực bằng Zod trước khi xác nhận; JSON hoặc schema không hợp lệ sẽ bị từ chối và dữ liệu hiện tại không thay đổi. Khóa lưu trữ của ứng dụng là `app-tracking:v1`.

## Đưa ứng dụng lên Internet

Vercel tự nhận diện Next.js và cấp miễn phí một URL dạng `ten-du-an.vercel.app`. Không cần mua tên miền để chia sẻ ứng dụng.

### Cách khuyên dùng: GitHub và Vercel Dashboard

1. Tạo một repository mới trên GitHub.
2. Từ thư mục dự án, commit và đẩy mã nguồn lên repository đó:

```powershell
git add .
git commit -m "Deploy App Tracking"
git branch -M main
git remote add origin https://github.com/<ten-github>/<ten-repository>.git
git push -u origin main
```

Nếu dự án đã có remote, kiểm tra bằng `git remote -v` và không chạy lại dòng `git remote add origin`.

3. Đăng nhập `https://vercel.com`, chọn **Add New → Project** và import repository vừa tạo.
4. Giữ **Framework Preset: Next.js**. Dự án không cần biến môi trường, backend hoặc thư mục output tùy chỉnh.
5. Chọn **Deploy**. Khi hoàn tất, Vercel hiển thị URL production để gửi cho người khác.
6. Những lần sau chỉ cần `git push`; Vercel sẽ tự build và cập nhật URL production.

### Cách dùng dòng lệnh

```powershell
corepack pnpm dlx vercel@latest login
corepack pnpm dlx vercel@latest link
corepack pnpm dlx vercel@latest deploy
corepack pnpm dlx vercel@latest deploy --prod
```

Lệnh `deploy` tạo URL preview; `deploy --prod` đưa bản đã kiểm tra lên URL production.

### Tên miền riêng

Tên miền là tùy chọn. Khi đã mua tên miền, vào **Project → Settings → Domains**, thêm tên miền và làm theo bản ghi DNS Vercel cung cấp. Vercel tự cấp HTTPS sau khi DNS hợp lệ.

> **Lưu ý về dữ liệu:** ứng dụng đang dùng `localStorage`. Mỗi người truy cập URL sẽ có dữ liệu riêng trong trình duyệt của họ; dữ liệu không được chia sẻ giữa người dùng hoặc giữa các thiết bị. Muốn đăng nhập và đồng bộ dữ liệu cần bổ sung backend/database ở phiên bản sau.

## Kiến trúc

- `src/domain`: pure functions cho điểm, streak, lịch, goal và thống kê.
- `src/store`: Zustand store, adapter `localStorage`, migration và backup validation.
- `src/components`: UI theo từng feature; component không chứa quy tắc tính điểm.
- `src/app`: Next.js App Router, shell và routes.
- `src/test`: fixtures và E2E; unit/integration test nằm cạnh domain/component/store.

Dữ liệu demo chỉ tồn tại trong test fixtures, không tự động chèn vào dữ liệu thật.
