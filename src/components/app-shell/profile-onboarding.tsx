"use client";

import { type FormEvent, useState } from "react";
import { useAppStore } from "@/store/app-store";

const reservedNames = new Set(["hồ sơ mới", "sinh viên ai"]);

export function ProfileOnboarding({ profileId }: { profileId: string }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const updateProfile = useAppStore((state) => state.updateProfile);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();

    if (!normalizedName) {
      setError("Hãy nhập tên bạn muốn sử dụng.");
      return;
    }

    if (reservedNames.has(normalizedName.toLocaleLowerCase("vi-VN"))) {
      setError("Hãy dùng tên của bạn thay cho tên hồ sơ mặc định.");
      return;
    }

    updateProfile(profileId, { name: normalizedName });
  }

  return (
    <main className="onboarding-shell">
      <section className="onboarding-panel" aria-labelledby="onboarding-title">
        <div className="onboarding-brand"><span className="brand-mark" aria-hidden="true">A</span><span>App Tracking</span></div>
        <div>
          <h1 id="onboarding-title">Chào bạn. Mình nên gọi bạn là gì?</h1>
          <p className="onboarding-copy">Tên này sẽ xuất hiện trong trang hôm nay và giúp trải nghiệm của bạn mang tính cá nhân hơn.</p>
        </div>
        <form className="onboarding-form" onSubmit={submit} noValidate>
          <label htmlFor="onboarding-name">Tên của bạn</label>
          <input
            id="onboarding-name"
            name="name"
            type="text"
            autoComplete="name"
            autoFocus
            maxLength={60}
            value={name}
            aria-describedby={error ? "onboarding-error" : undefined}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError("");
            }}
          />
          {error ? <p className="form-error" id="onboarding-error" role="alert">{error}</p> : null}
          <button className="button" type="submit">Bắt đầu ngày của tôi</button>
        </form>
        <p className="onboarding-privacy">Dữ liệu chỉ được lưu trên thiết bị này.</p>
      </section>
    </main>
  );
}
