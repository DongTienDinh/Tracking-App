import { expect, test, type Page } from "@playwright/test";

const consoleErrors = new WeakMap<Page, string[]>();

function tomorrowDateKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function taskRow(page: Page, title: string) {
  return page.getByTestId("task-row").filter({ hasText: title });
}

async function openDaySetup(page: Page, date?: string) {
  if (date) {
    await page.goto(`/calendar?view=day&date=${date}#day-setup`);
  } else if (!page.url().includes("/calendar?view=day")) {
    await page.getByLabel("Thiết lập ngày trong lịch").click();
  }
  await expect(page).toHaveURL(/\/calendar\?view=day&date=/);
  await expect(page.getByRole("region", { name: "Thiết lập ngày" })).toBeVisible();
}

async function openDayTracking(page: Page) {
  const details = page.locator(".day-tracking");
  if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open))) {
    await details.locator("summary").click();
  }
}

test.beforeEach(async ({ page }, testInfo) => {
  const errors: string[] = [];
  consoleErrors.set(page, errors);
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/today");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if (!testInfo.title.includes("onboarding")) {
    await page.getByLabel("Tên của bạn").fill("Minh");
    await page.getByRole("button", { name: "Bắt đầu ngày của tôi" }).click();
    await expect(page.getByRole("heading", { name: /Hôm nay của Minh/ })).toBeVisible();
  }
});

test.afterEach(async ({ page }) => {
  expect(consoleErrors.get(page) ?? []).toEqual([]);
});

test("onboarding yêu cầu tên ở lần mở đầu tiên", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Chào bạn. Mình nên gọi bạn là gì?" })).toBeVisible();
  await page.getByRole("button", { name: "Bắt đầu ngày của tôi" }).click();
  await expect(page.locator("#onboarding-error")).toHaveText("Hãy nhập tên bạn muốn sử dụng.");
  await page.getByLabel("Tên của bạn").fill("An");
  await page.getByRole("button", { name: "Bắt đầu ngày của tôi" }).click();
  await expect(page.getByRole("heading", { name: /Hôm nay của An/ })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Tên của bạn")).toHaveCount(0);
});

test("root không báo hydration mismatch khi extension chèn class vào html", async ({ page }) => {
  await page.addInitScript(() => {
    const addExtensionClass = () => document.documentElement?.classList.add("mdl-js");
    addExtensionClass();
    new MutationObserver(addExtensionClass).observe(document, { childList: true, subtree: true });
  });
  await page.goto("/settings");
  await expect(page.locator("html")).toHaveClass(/mdl-js/);
  await expect(page.getByRole("heading", { name: "Cài đặt" })).toBeVisible();
});

test("E2E-01: lưu kế hoạch, trở về hôm nay và tính tiến độ theo phần trăm", async ({ page }) => {
  const tomorrow = await page.evaluate(tomorrowDateKey);
  await openDaySetup(page, tomorrow);
  const plan = page.getByRole("region", { name: "Kế hoạch và công việc" });
  await plan.getByText("Tùy chọn nâng cao").click();
  await plan.getByLabel("Tên công việc").fill("Học Computer Vision");
  await plan.getByLabel("Mức độ").selectOption("important");
  await plan.getByLabel("Theo tiến độ").check();
  await plan.getByRole("button", { name: "Thêm việc" }).click();
  await plan.getByRole("button", { name: "Xác nhận kế hoạch" }).click();

  await expect(page).toHaveURL(new RegExp(`/today\\?planSaved=${tomorrow}`));
  await expect(page.getByRole("dialog", { name: "Đã lưu kế hoạch ngày" })).toBeVisible();
  await page.getByRole("button", { name: "Tiếp tục theo dõi" }).click();
  await page.goto(`/calendar?view=day&date=${tomorrow}`);

  const row = taskRow(page, "Học Computer Vision");
  await expect(row).toHaveCount(1);
  await expect(row.getByRole("button", { name: /Bỏ .* khỏi Top 3/ })).toBeVisible();
  await row.getByLabel("Tiến độ Học Computer Vision").selectOption("50");
  await expect(page.getByText("1 việc · 50% hoàn thành")).toBeVisible();
  await row.getByLabel("Tiến độ Học Computer Vision").selectOption("100");
  await expect(page.getByText("1 việc · 100% hoàn thành")).toBeVisible();
  await page.reload();
  await expect(taskRow(page, "Học Computer Vision").getByLabel("Tiến độ Học Computer Vision")).toHaveValue("100");
});

test("E2E-02: checkpoint lưu snapshot và tồn tại sau reload", async ({ page }) => {
  await openDaySetup(page);
  const todaySetup = page.getByRole("region", { name: "Kế hoạch và công việc" });
  await todaySetup.getByText("Tùy chọn nâng cao").click();
  const title = todaySetup.getByLabel("Tên công việc");
  const priority = todaySetup.getByLabel("Mức độ", { exact: true });
  for (const [name, level] of [["Việc 20", "important"], ["Việc 10A", "medium"], ["Việc 10B", "medium"], ["Việc 10C", "medium"], ["Việc 10D", "medium"]] as const) {
    await title.fill(name);
    await priority.selectOption(level);
    await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  }
  await taskRow(page, "Việc 20").getByLabel("Xong").check();
  await openDayTracking(page);
  await page.getByLabel("Năng lượng hiện tại").selectOption("medium");
  await page.getByLabel("Việc tập trung tiếp theo").selectOption({ label: "Việc 10A" });
  await page.getByLabel("Điều chỉnh kế hoạch").fill("Giữ lại ba việc thực tế");
  await page.getByRole("button", { name: "Lưu checkpoint" }).click();
  await expect(page.getByText("Đã lưu · 20%")).toBeVisible();
  await page.reload();
  await openDaySetup(page);
  await openDayTracking(page);
  await expect(page.getByLabel("Điều chỉnh kế hoạch")).toHaveValue("Giữ lại ba việc thực tế");
  await expect(page.getByLabel("Năng lượng hiện tại")).toHaveValue("medium");
});

test("checkpoint 12:00 hiển thị đủ bốn việc và cập nhật tiến độ thật", async ({ page }) => {
  await openDaySetup(page);
  const setup = page.getByRole("region", { name: "Kế hoạch và công việc" });
  for (const name of ["Đọc paper", "Chạy baseline", "Ghi kết quả", "Tập thể dục"]) {
    await setup.getByLabel("Tên công việc").fill(name);
    await setup.getByRole("button", { name: "Thêm việc", exact: true }).click();
  }

  await page.goto("/today");
  const checkpoint = page.getByRole("region", { name: "Checkpoint 12:00" });
  await expect(checkpoint.getByRole("checkbox")).toHaveCount(4);
  await checkpoint.getByRole("checkbox", { name: "Đọc paper" }).check();
  await expect(checkpoint).toContainText("1/4 việc đã hoàn thành");
  await checkpoint.getByRole("button", { name: "Xác nhận checkpoint" }).click();
  await expect(checkpoint).toContainText("Đã ghi nhận 1/4 việc hoàn thành.");
  await page.reload();
  await expect(page.getByRole("region", { name: "Checkpoint 12:00" }).getByRole("checkbox", { name: "Đọc paper" })).toBeChecked();
});

test("checkpoint sau 12:00 nhắc động viên khi chưa hoàn thành việc nào", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-27T12:05:00+07:00"));
  await page.goto("/today");
  await openDaySetup(page);
  await page.getByRole("region", { name: "Kế hoạch và công việc" }).getByLabel("Tên công việc").fill("Bắt đầu bài tập");
  await page.getByRole("region", { name: "Kế hoạch và công việc" }).getByRole("button", { name: "Thêm việc", exact: true }).click();
  await page.goto("/today");
  const checkpoint = page.getByRole("region", { name: "Checkpoint 12:00" });
  await expect(checkpoint).toContainText("Đừng bỏ cuộc");
  await expect(checkpoint.getByRole("button", { name: "Xác nhận checkpoint" })).toBeDisabled();
});

test("Today hiển thị chuỗi hoạt động hiện tại", async ({ page }) => {
  await openDaySetup(page);
  const setup = page.getByRole("region", { name: "Kế hoạch và công việc" });
  await setup.getByLabel("Tên công việc").fill("Hoàn thành một phiên học");
  await setup.getByRole("button", { name: "Thêm việc", exact: true }).click();
  await taskRow(page, "Hoàn thành một phiên học").getByLabel("Xong").check();
  await page.goto("/today");
  await expect(page.locator(".today-streak")).toContainText("1 ngày");
  await page.reload();
  await expect(page.locator(".today-streak")).toContainText("1 ngày");
});

test("E2E-03: habit chỉ tiêu 3 lần một tuần tăng streak tuần", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-20T08:00:00+07:00"));
  await page.goto("/habits");
  await page.getByLabel("Tên thói quen").fill("Chạy bộ");
  await page.getByRole("button", { name: "Chỉ tiêu tuần" }).click();
  await page.getByLabel("Số lần mỗi tuần").fill("3");
  await page.getByRole("button", { name: "Tạo thói quen" }).click();
  await page.getByRole("button", { name: "Hoàn thành", exact: true }).click();

  await page.clock.setFixedTime(new Date("2026-10-22T08:00:00+07:00"));
  await page.reload();
  await page.getByRole("button", { name: "Hoàn thành", exact: true }).click();
  await page.clock.setFixedTime(new Date("2026-10-25T08:00:00+07:00"));
  await page.reload();
  await page.getByRole("button", { name: "Hoàn thành", exact: true }).click();

  const habit = page.locator("article").filter({ hasText: "Chạy bộ" });
  await expect(habit).toContainText("Chuỗi");
  await expect(habit.locator(".habit-metrics strong").first()).toHaveText("1");
});

test("lịch thói quen có hoạt động riêng cho từng ngày", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-26T08:00:00+07:00"));
  await page.goto("/habits");
  await page.getByLabel("Tên thói quen").fill("Lịch vận động");
  await page.getByLabel("T3").check();
  await page.getByLabel("T4").uncheck();
  await page.getByLabel("T6").uncheck();
  await page.getByLabel("Hoạt động Thứ Hai").fill("Gym");
  await page.getByLabel("Hoạt động Thứ Ba").fill("Chạy bộ");
  await page.getByRole("button", { name: "Tạo thói quen" }).click();

  const habit = page.locator("article").filter({ hasText: "Lịch vận động" });
  await expect(habit).toContainText("T2: Gym");
  await expect(habit).toContainText("T3: Chạy bộ");
  await expect(habit).toContainText("Hôm nayGym");

  await page.clock.setFixedTime(new Date("2026-10-27T08:00:00+07:00"));
  await page.reload();
  await expect(habit).toContainText("Hôm nayChạy bộ");
  await habit.getByRole("button", { name: "Chỉnh lịch" }).click();
  await habit.getByLabel("Hoạt động Thứ Ba").fill("Yoga");
  await habit.getByRole("button", { name: "Lưu lịch tuần" }).click();
  await expect(habit).toContainText("T3: Yoga");
  await expect(habit).toContainText("Hôm nayYoga");
});

test("checklist nhỏ tự tính tiến độ công việc và kế hoạch ngày", async ({ page }) => {
  await openDaySetup(page);
  const plan = page.getByRole("region", { name: "Kế hoạch và công việc" });
  await plan.getByText("Tùy chọn nâng cao").click();
  await plan.getByLabel("Tên công việc").fill("Chạy pipeline");
  await plan.getByLabel("Checklist nhỏ (mỗi dòng một mục)").fill("Chuẩn bị dữ liệu\nChạy model\nĐánh giá");
  await plan.getByRole("button", { name: "Thêm việc", exact: true }).click();

  const row = taskRow(page, "Chạy pipeline");
  await expect(row.getByRole("checkbox")).toHaveCount(3);
  await row.getByRole("checkbox", { name: "Chuẩn bị dữ liệu" }).check();
  await expect(row).toContainText("33.3%");
  await expect(page.getByText("1 việc · 33% hoàn thành")).toBeVisible();
  await row.getByRole("checkbox", { name: "Chạy model" }).check();
  await row.getByRole("checkbox", { name: "Đánh giá" }).check();
  await expect(page.getByText("1 việc · 100% hoàn thành")).toBeVisible();
});

test("E2E-04: hoãn task tạo đúng một occurrence và chỉ ngày mới có tiến độ", async ({ page }) => {
  const tomorrow = await page.evaluate(tomorrowDateKey);
  await openDaySetup(page);
  const todaySetup = page.getByRole("region", { name: "Kế hoạch và công việc" });
  await todaySetup.getByText("Tùy chọn nâng cao").click();
  await todaySetup.getByLabel("Tên công việc").fill("Chạy baseline");
  await todaySetup.getByLabel("Mức độ").selectOption("important");
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  await taskRow(page, "Chạy baseline").locator(".task-adjustments summary").click();
  await taskRow(page, "Chạy baseline").getByRole("button", { name: "Hoãn" }).click();
  const currentOccurrence = page.getByRole("region", { name: "Kế hoạch và công việc" }).getByTestId("task-row").filter({ hasText: "Chạy baseline" });
  await expect(currentOccurrence).toContainText(`Đã hoãn đến ${tomorrow}`);
  await expect(page.getByText(/0% hoàn thành/)).toBeVisible();

  await page.goto(`/calendar?view=day&date=${tomorrow}`);
  await expect(taskRow(page, "Chạy baseline")).toHaveCount(1);
  await taskRow(page, "Chạy baseline").getByLabel("Xong").check();
  await expect(page.getByText("1 việc · 100% hoàn thành")).toBeVisible();
});

test("E2E-05: hồ sơ không lẫn dữ liệu và giữ hồ sơ đang hoạt động", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("Hồ sơ mới").fill("Nghiên cứu");
  await page.getByRole("button", { name: "Tạo hồ sơ" }).click();
  await page.goto("/today");
  await openDaySetup(page);
  await page.getByLabel("Tên công việc").first().fill("Task hồ sơ nghiên cứu");
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();

  await page.goto("/settings");
  await page.locator(".profile-choice").filter({ hasText: "Minh" }).click();
  await page.goto("/today");
  await expect(taskRow(page, "Task hồ sơ nghiên cứu")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: /Hôm nay của Minh/ })).toBeVisible();
});

test("E2E-06: export, reset và import phục hồi dữ liệu", async ({ page }) => {
  await openDaySetup(page);
  await page.getByLabel("Tên công việc").first().fill("Task backup");
  await page.getByRole("button", { name: "Thêm việc", exact: true }).click();
  await page.goto("/habits");
  await page.getByLabel("Tên thói quen").fill("Habit backup");
  await page.getByRole("button", { name: "Tạo thói quen" }).click();
  await page.goto("/goals");
  await page.getByLabel("Tên mục tiêu").fill("Goal backup");
  await page.getByRole("button", { name: "Tạo mục tiêu" }).click();
  await page.goto("/notes");
  await page.getByLabel("Ghi chú nhanh").fill("Note backup");
  await page.getByLabel("Ghi chú nhanh").blur();

  await page.goto("/settings");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON" }).click();
  const download = await downloadPromise;
  const backupPath = await download.path();
  expect(backupPath).toBeTruthy();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Xóa và bắt đầu lại" }).click();
  await page.goto("/today");
  await page.getByLabel("Tên của bạn").fill("Tạm thời");
  await page.getByRole("button", { name: "Bắt đầu ngày của tôi" }).click();
  await expect(taskRow(page, "Task backup")).toHaveCount(0);

  await page.goto("/settings");
  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Import JSON" }).click();
  const chooser = await chooserPromise;
  page.once("dialog", (dialog) => dialog.accept());
  await chooser.setFiles(backupPath!);
  await expect(page.getByText("Đã khôi phục dữ liệu từ backup.")).toBeVisible();
  await page.goto("/today");
  await expect(taskRow(page, "Task backup")).toHaveCount(1);
  await page.goto("/habits");
  await expect(page.getByText("Habit backup", { exact: true })).toBeVisible();
  await page.goto("/goals");
  await expect(page.getByText("Goal backup", { exact: true })).toBeVisible();
  await page.goto("/notes");
  await expect(page.getByLabel("Ghi chú nhanh")).toHaveValue("Note backup");
});

test("giao diện sáng/tối và chủ đề đặc biệt được lưu độc lập", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Tối" }).click();
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("autumn");

  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "autumn");
  await expect(page.getByTestId("seasonal-effect")).toHaveClass(/effect-leaves/);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "autumn");
  await expect(page.getByRole("button", { name: "Tối" })).toHaveAttribute("aria-pressed", "true");

  await page.getByLabel("Chủ đề", { exact: true }).selectOption("default");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "default");
  await expect(page.getByTestId("seasonal-effect")).toHaveCount(0);

  await page.getByRole("button", { name: "Sáng" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
});

test("mỗi chủ đề giữ bảng màu và hiệu ứng rơi riêng sau reload", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("autumn");
  await page.getByRole("button", { name: "Tự chọn", exact: true }).click();
  await page.getByLabel("Màu nền tùy chỉnh").fill("#224466");
  await page.getByLabel("Màu nhấn tùy chỉnh").fill("#ff6b35");
  await page.getByLabel("Kiểu rơi").selectOption("sparkles");
  await page.getByLabel("Mật độ").selectOption("high");
  await page.getByLabel("Tốc độ").selectOption("fast");
  await page.getByLabel("Màu hiệu ứng rơi").fill("#ffd166");

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme-background", "custom");
  await expect(root).toHaveAttribute("data-effect-density", "high");
  await expect(root).toHaveAttribute("data-effect-speed", "fast");
  await expect(page.getByTestId("seasonal-effect")).toHaveClass(/effect-sparkles/);
  await expect(page.getByTestId("seasonal-effect").locator("span")).toHaveCount(36);
  await expect(root).toHaveCSS("--custom-background", "#224466");
  await expect(root).toHaveCSS("--custom-accent", "#ff6b35");
  await expect(root).toHaveCSS("--custom-effect", "#ffd166");
  await expect(page.locator(".brand-mark")).toHaveCSS("background-color", "rgb(255, 107, 53)");
  await expect(page.getByTestId("seasonal-effect").locator("i").first()).toHaveCSS("background-color", "rgb(255, 209, 102)");

  await page.getByLabel("Chủ đề", { exact: true }).selectOption("christmas");
  await expect(root).toHaveAttribute("data-theme", "christmas");
  await expect(root).toHaveAttribute("data-theme-background", "vivid");
  await expect(page.getByLabel("Màu nền tùy chỉnh")).toHaveValue("#e8f1eb");
  await expect(page.getByLabel("Màu nhấn tùy chỉnh")).toHaveValue("#27724d");
  await expect(page.getByLabel("Kiểu rơi")).toHaveValue("snow");
  await expect(page.getByLabel("Mật độ")).toHaveValue("high");
  await expect(page.getByLabel("Tốc độ")).toHaveValue("slow");
  await expect(page.getByLabel("Màu hiệu ứng rơi")).toHaveValue("#ddefe8");
  await expect(page.getByTestId("seasonal-effect")).toHaveClass(/effect-snow/);

  await page.getByLabel("Chủ đề", { exact: true }).selectOption("autumn");
  await expect(root).toHaveAttribute("data-theme-background", "custom");
  await expect(page.getByLabel("Màu nền tùy chỉnh")).toHaveValue("#224466");
  await expect(page.getByLabel("Màu nhấn tùy chỉnh")).toHaveValue("#ff6b35");
  await expect(page.getByLabel("Kiểu rơi")).toHaveValue("sparkles");
  await expect(page.getByLabel("Màu hiệu ứng rơi")).toHaveValue("#ffd166");

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "autumn");
  await expect(root).toHaveAttribute("data-theme-background", "custom");
  await expect(page.getByLabel("Kiểu rơi")).toHaveValue("sparkles");
  await expect(page.getByLabel("Mật độ")).toHaveValue("high");
  await expect(page.getByLabel("Tốc độ")).toHaveValue("fast");
  await expect(page.getByLabel("Màu nền tùy chỉnh")).toHaveValue("#224466");
});

test("giảm chuyển động ẩn hiệu ứng chủ đề", async ({ page }) => {
  await page.goto("/settings");
  await page.getByLabel("Chủ đề", { exact: true }).selectOption("spring");
  await expect(page.getByTestId("seasonal-effect")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.getByTestId("seasonal-effect")).toBeHidden();
});

test("Daily Review được lưu và phục hồi", async ({ page }) => {
  await openDaySetup(page);
  await openDayTracking(page);
  await page.getByRole("textbox", { name: "Tổng kết cuối ngày" }).fill("Hoàn thành phần dữ liệu, mai tối ưu mô hình.");
  await page.getByRole("button", { name: "Hoàn thành tổng kết" }).click();
  await expect(page.getByText("Đã hoàn thành", { exact: true })).toBeVisible();
  await page.reload();
  await openDaySetup(page);
  await openDayTracking(page);
  await expect(page.getByRole("textbox", { name: "Tổng kết cuối ngày" })).toHaveValue("Hoàn thành phần dữ liệu, mai tối ưu mô hình.");
});

test("goal không hoạt động 8 ngày hiển thị lại lý do", async ({ page }) => {
  await page.goto("/goals");
  await page.getByLabel("Tên mục tiêu").fill("Đồ án thị giác máy tính");
  await page.getByLabel("Tại sao mục tiêu này quan trọng?").fill("Đây là hướng nghiên cứu chính của tôi.");
  await page.getByRole("button", { name: "Tạo mục tiêu" }).click();
  await page.evaluate(() => {
    const key = "app-tracking:v1";
    const backup = JSON.parse(localStorage.getItem(key)!);
    backup.state.goals[0].startDate = "2026-10-01";
    backup.state.goals[0].createdAt = "2026-10-01T00:00:00.000Z";
    backup.state.goals[0].updatedAt = "2026-10-01T00:00:00.000Z";
    localStorage.setItem(key, JSON.stringify(backup));
  });
  await page.reload();
  await expect(page.getByText(/ngày chưa có hoạt động liên quan/)).toBeVisible();
  await expect(page.getByText("Đây là hướng nghiên cứu chính của tôi.", { exact: true })).toBeVisible();
});

test("E2E-07: mọi route không cuộn ngang ở viewport bắt buộc", async ({ page }, testInfo) => {
  for (const route of ["/today", "/calendar", "/habits", "/goals", "/insights", "/notes", "/settings"]) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow, `${route} overflow ở ${testInfo.project.name}`).toBe(false);
    await expect(page.locator("h1")).toBeVisible();
    if (route === "/today") {
      await openDaySetup(page);
      const setupOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(setupOverflow, `/calendar day setup bị overflow ở ${testInfo.project.name}`).toBe(false);
    }
  }
});

test("keyboard skip link và reduced motion hoạt động", async ({ page }) => {
  await page.locator("body").evaluate((body) => {
    body.tabIndex = -1;
    body.focus();
  });
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Bỏ qua điều hướng" });
  if (!await skipLink.evaluate((link) => link === document.activeElement)) await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.emulateMedia({ reducedMotion: "reduce" });
  const duration = await page.getByLabel("Thiết lập ngày trong lịch").evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(parseFloat(duration)).toBeLessThanOrEqual(0.00001);
});
