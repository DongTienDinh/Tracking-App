"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { BarChart3, Download, Moon, NotebookPen, Sparkles, Sun, Upload } from "lucide-react";
import type { Profile, ThemeBackground, ThemeChoice, ThemeCustomization, ThemeEffectChoice, ThemeEffectDensity, ThemeEffectSpeed, ThemeMode } from "@/domain/types";
import { defaultThemeCustomization, resolveTheme, THEME_LABELS } from "@/domain/theme";
import { PageHeader } from "@/components/ui/page-header";
import { toDateKey } from "@/lib/dates";
import { useAppStore } from "@/store/app-store";

function ProfileForm({ profile }: { profile: Profile }) {
  const updateProfile = useAppStore((state) => state.updateProfile);
  const [name, setName] = useState(profile.name);
  const [checkpointTime, setCheckpointTime] = useState(profile.preferences.checkpointTime);
  const [saved, setSaved] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateProfile(profile.id, { name: name.trim(), preferences: { ...profile.preferences, checkpointTime } });
    setSaved(true);
  }
  return <form className="stack" onSubmit={submit}><div className="field"><label htmlFor="profile-name">Tên hồ sơ</label><input id="profile-name" name="profileName" autoComplete="off" className="input" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} required maxLength={60} /></div><div className="field"><label htmlFor="checkpoint-time">Giờ checkpoint</label><input id="checkpoint-time" name="checkpointTime" autoComplete="off" className="input" type="time" value={checkpointTime} onChange={(event) => { setCheckpointTime(event.target.value); setSaved(false); }} /></div><div className="task-actions"><button className="button" type="submit">Lưu hồ sơ</button>{saved ? <span className="status good" aria-live="polite">Đã lưu</span> : null}</div></form>;
}

const SPECIAL_THEMES: ThemeChoice[] = ["spring", "summer", "autumn", "winter", "tet", "christmas", "national-day"];
const BACKGROUND_OPTIONS: Array<{ value: ThemeBackground; label: string }> = [
  { value: "soft", label: "Dịu" }, { value: "vivid", label: "Rực rỡ" }, { value: "custom", label: "Tự chọn" },
];
const EFFECT_OPTIONS: Array<{ value: ThemeEffectChoice; label: string }> = [
  { value: "auto", label: "Theo chủ đề" }, { value: "petals", label: "Cánh hoa" }, { value: "sunlight", label: "Ánh nắng" }, { value: "leaves", label: "Lá rơi" },
  { value: "snow", label: "Tuyết" }, { value: "confetti", label: "Dải màu" }, { value: "sparkles", label: "Lấp lánh" },
];

function AppearanceSettings({ profile }: { profile: Profile }) {
  const updateProfile = useAppStore((state) => state.updateProfile);
  const { themeMode, themeChoice, themeCustomizations } = profile.preferences;
  const resolvedTheme = resolveTheme(themeChoice);
  const customization = themeCustomizations[resolvedTheme];
  const {
    background: themeBackground,
    backgroundColor: customBackground,
    accentColor: customAccent,
    effectsEnabled: themeEffects,
    effectChoice: themeEffectChoice,
    effectDensity: themeEffectDensity,
    effectSpeed: themeEffectSpeed,
    effectColor: customEffectColor,
  } = customization;

  function updateAppearance(patch: Partial<Profile["preferences"]>) {
    updateProfile(profile.id, { preferences: { ...profile.preferences, ...patch } });
  }

  function updateThemeCustomization(patch: Partial<ThemeCustomization>) {
    updateAppearance({
      themeCustomizations: {
        ...themeCustomizations,
        [resolvedTheme]: { ...customization, ...patch },
      },
    });
  }

  function resetCurrentTheme() {
    updateAppearance({
      themeCustomizations: {
        ...themeCustomizations,
        [resolvedTheme]: defaultThemeCustomization(resolvedTheme),
      },
    });
  }

  return (
    <div className="appearance-settings stack">
      <fieldset className="appearance-fieldset">
        <legend>Độ sáng</legend>
        <div className="mode-picker">
          {(["light", "dark"] as ThemeMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={themeMode === mode ? "active" : ""}
              aria-pressed={themeMode === mode}
              onClick={() => updateAppearance({ themeMode: mode })}
            >
              {mode === "light" ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
              {mode === "light" ? "Sáng" : "Tối"}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="theme-choice">Chủ đề</label>
        <select
          id="theme-choice"
          name="themeChoice"
          className="select"
          value={themeChoice}
          onChange={(event) => updateAppearance({ themeChoice: event.target.value as ThemeChoice })}
        >
          <option value="default">Mặc định — không đổi theo mùa</option>
          <option value="auto">Tự động theo mùa và ngày lễ</option>
          <optgroup label="Chọn thủ công">
            {SPECIAL_THEMES.map((theme) => <option value={theme} key={theme}>{THEME_LABELS[theme]}</option>)}
          </optgroup>
        </select>
      </div>

      <fieldset className="appearance-fieldset">
        <legend>Nền ứng dụng</legend>
        <div className="background-picker">
          {BACKGROUND_OPTIONS.map((option) => (
            <button key={option.value} type="button" className={themeBackground === option.value ? "active" : ""} aria-pressed={themeBackground === option.value} onClick={() => updateThemeCustomization({ background: option.value })}>
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="theme-palette-heading">
        <span><strong>Bảng màu {THEME_LABELS[resolvedTheme]}</strong><small>Lưu riêng cho chủ đề này.</small></span>
        <button type="button" className="button ghost compact" onClick={resetCurrentTheme}>Khôi phục màu gốc</button>
      </div>
      <div className="color-customizer" aria-label={`Bảng màu ${THEME_LABELS[resolvedTheme]}`}>
        <label><span>Nền</span><input aria-label="Màu nền tùy chỉnh" type="color" value={customBackground} onChange={(event) => updateThemeCustomization({ background: "custom", backgroundColor: event.target.value })} /><small>{customBackground.toUpperCase()}</small></label>
        <label><span>Màu nhấn</span><input aria-label="Màu nhấn tùy chỉnh" type="color" value={customAccent} onChange={(event) => updateThemeCustomization({ background: "custom", accentColor: event.target.value })} /><small>{customAccent.toUpperCase()}</small></label>
      </div>

      <label className="effect-toggle">
        <span><strong>Hiệu ứng rơi</strong><small>Bật lớp chuyển động phía trên nền ứng dụng.</small></span>
        <input
          type="checkbox"
          checked={themeEffects}
          onChange={(event) => updateThemeCustomization({ effectsEnabled: event.target.checked })}
        />
      </label>

      {themeEffects ? (
        <div className="effect-controls">
          <div className="field"><label htmlFor="effect-choice">Kiểu rơi</label><select id="effect-choice" className="select" value={themeEffectChoice} onChange={(event) => updateThemeCustomization({ effectChoice: event.target.value as ThemeEffectChoice })}>{EFFECT_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></div>
          <div className="field"><label htmlFor="effect-density">Mật độ</label><select id="effect-density" className="select" value={themeEffectDensity} onChange={(event) => updateThemeCustomization({ effectDensity: event.target.value as ThemeEffectDensity })}><option value="low">Thưa</option><option value="medium">Vừa</option><option value="high">Dày</option></select></div>
          <div className="field"><label htmlFor="effect-speed">Tốc độ</label><select id="effect-speed" className="select" value={themeEffectSpeed} onChange={(event) => updateThemeCustomization({ effectSpeed: event.target.value as ThemeEffectSpeed })}><option value="slow">Chậm</option><option value="normal">Vừa</option><option value="fast">Nhanh</option></select></div>
          <label className="effect-color"><span>Màu hạt</span><input aria-label="Màu hiệu ứng rơi" type="color" value={customEffectColor} onChange={(event) => updateThemeCustomization({ effectColor: event.target.value })} /><small>{customEffectColor.toUpperCase()}</small></label>
        </div>
      ) : null}

      <div className="theme-preview" data-preview-theme={resolvedTheme}>
        <div className="theme-preview-copy">
          <Sparkles size={17} aria-hidden="true" />
          <span><strong>{THEME_LABELS[resolvedTheme]}</strong><small>{themeMode === "light" ? "Bản sáng" : "Bản tối"} · {BACKGROUND_OPTIONS.find((option) => option.value === themeBackground)?.label}{themeChoice === "auto" ? " · tự động" : ""}</small></span>
        </div>
        <div className="theme-preview-swatches" aria-hidden="true"><span /><span /><span /></div>
      </div>
      <p className="panel-note">Mỗi chủ đề giữ một bảng màu và hiệu ứng riêng. Mật độ cao dùng 36 hạt CSS nhưng không tạo vòng lặp JavaScript. Chế độ giảm chuyển động của thiết bị luôn được tôn trọng.</p>
    </div>
  );
}

export function SettingsScreen() {
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const profiles = useAppStore((state) => state.profiles);
  const profile = profiles.find((item) => item.id === activeProfileId)!;
  const storageError = useAppStore((state) => state.storageError);
  const createProfile = useAppStore((state) => state.createProfile);
  const switchProfile = useAppStore((state) => state.switchProfile);
  const deleteProfile = useAppStore((state) => state.deleteProfile);
  const exportBackup = useAppStore((state) => state.exportBackup);
  const importBackup = useAppStore((state) => state.importBackup);
  const resetAll = useAppStore((state) => state.resetAll);
  const [newProfileName, setNewProfileName] = useState("");
  const [message, setMessage] = useState<{ type: "good" | "bad"; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  function addProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newProfileName.trim() || profiles.length >= 3) return;
    createProfile(newProfileName);
    setNewProfileName("");
  }
  function downloadBackup() {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `app-tracking-${toDateKey(new Date())}.json`; anchor.click();
    URL.revokeObjectURL(url);
    setMessage({ type: "good", text: "Đã tạo backup JSON." });
  }
  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const json = await file.text();
      if (!window.confirm("Import sẽ thay thế toàn bộ dữ liệu App Tracking hiện tại. Tiếp tục?")) return;
      importBackup(json);
      setMessage({ type: "good", text: "Đã khôi phục dữ liệu từ backup." });
    } catch (error) {
      setMessage({ type: "bad", text: error instanceof Error ? error.message : "Không thể import backup." });
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="page">
      <PageHeader title="Cài đặt" subtitle="Hồ sơ, checkpoint và dữ liệu đều nằm trên trình duyệt này." />
      {storageError ? <div className="error" style={{ marginBottom: 20 }}>{storageError} Hãy export dữ liệu nếu trình duyệt vẫn cho phép.</div> : null}
      {message ? <div className={message.type === "bad" ? "error" : "notice"} style={{ marginBottom: 20 }} aria-live="polite">{message.text}</div> : null}

      <section className="settings-section">
        <div className="settings-copy">
          <h2>Giao diện</h2>
          <p>Chọn sáng hoặc tối độc lập với chủ đề. Bạn luôn có thể quay lại Mặc định để tắt lớp màu theo mùa.</p>
          <ul className="settings-help-list">
            <li>Nền chỉ đổi không gian bao quanh nội dung.</li>
            <li>Màu nhấn dùng cho nút, biểu đồ và trạng thái.</li>
            <li>Hiệu ứng nằm sau thao tác và không chặn cú nhấp.</li>
          </ul>
        </div>
        <div className="settings-panel"><AppearanceSettings profile={profile} /></div>
      </section>

      <section className="settings-section">
        <div className="settings-copy"><h2>Hồ sơ hiện tại</h2><p>Đổi tên và chọn thời điểm checkpoint phù hợp với lịch học của bạn.</p></div>
        <div className="settings-panel"><ProfileForm key={profile.id} profile={profile} /></div>
      </section>

      <section className="settings-section">
        <div className="settings-copy"><h2>Quản lý hồ sơ</h2><p>Tối đa ba hồ sơ trên thiết bị. Dữ liệu của mỗi hồ sơ được tách riêng.</p></div>
        <div className="settings-panel stack">
          <div className="profile-list">{profiles.map((item) => <div key={item.id}><button type="button" className={`profile-choice${item.id === activeProfileId ? " active" : ""}`} onClick={() => switchProfile(item.id)}><strong>{item.name}</strong><span>{item.id === activeProfileId ? "Đang dùng" : "Chuyển hồ sơ"}</span></button>{profiles.length > 1 ? <button type="button" className="button ghost compact" onClick={() => { if (window.confirm(`Xóa hồ sơ “${item.name}” và toàn bộ dữ liệu liên quan?`)) deleteProfile(item.id); }}>Xóa</button> : null}</div>)}</div>
          <form className="form-row" onSubmit={addProfile}><div className="field"><label htmlFor="new-profile">Hồ sơ mới</label><input id="new-profile" name="newProfile" autoComplete="off" className="input" value={newProfileName} onChange={(event) => setNewProfileName(event.target.value)} disabled={profiles.length >= 3} placeholder={profiles.length >= 3 ? "Đã đạt giới hạn 3 hồ sơ" : "Tên hồ sơ…"} /></div><button className="button secondary" type="submit" disabled={profiles.length >= 3}>Tạo hồ sơ</button></form>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-copy"><h2>Dữ liệu</h2><p>Backup toàn bộ trước khi dọn dữ liệu trình duyệt. File lỗi sẽ không ghi đè dữ liệu hiện tại.</p></div>
        <div className="settings-panel stack">
          <div className="task-actions"><button className="button" type="button" onClick={downloadBackup}><Download size={16} aria-hidden="true" />Export JSON</button><button className="button secondary" type="button" onClick={() => fileInput.current?.click()}><Upload size={16} aria-hidden="true" />Import JSON</button><input ref={fileInput} className="sr-only" type="file" name="backupFile" accept="application/json,.json" onChange={importFile} /></div>
          <p className="panel-note">Backup bao gồm hồ sơ, tasks, habits, goals, notes, checkpoint và lịch sử tổng kết.</p>
        </div>
      </section>

      <section className="settings-section">
        <div className="settings-copy"><h2>Lối tắt</h2><p>Mở các mục nằm trong menu Thêm trên thiết bị di động.</p></div>
        <div className="settings-panel task-actions"><Link className="button secondary" href="/insights"><BarChart3 size={16} aria-hidden="true" />Thống kê</Link><Link className="button secondary" href="/notes"><NotebookPen size={16} aria-hidden="true" />Ghi chú</Link></div>
      </section>

      <section className="settings-section">
        <div className="settings-copy"><h2>Xóa toàn bộ dữ liệu</h2><p>Thao tác này không thể hoàn tác nếu bạn chưa export backup.</p></div>
        <div className="settings-panel"><button className="button danger" type="button" onClick={() => { if (window.confirm("Xóa toàn bộ dữ liệu App Tracking trên trình duyệt này?")) resetAll(); }}>Xóa và bắt đầu lại</button></div>
      </section>
    </div>
  );
}
