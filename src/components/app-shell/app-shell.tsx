"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, CheckSquare2, Goal, Menu, MoreHorizontal, NotebookPen, Repeat2, Settings } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { HydrationGate } from "@/components/app-shell/hydration-gate";
import { ProfileOnboarding } from "@/components/app-shell/profile-onboarding";
import { ThemeController } from "@/components/app-shell/theme-controller";

const primaryNav = [
  { href: "/today", label: "Hôm nay", icon: CheckSquare2 },
  { href: "/calendar", label: "Lịch", icon: CalendarDays },
  { href: "/habits", label: "Thói quen", icon: Repeat2 },
  { href: "/goals", label: "Mục tiêu", icon: Goal },
];
const secondaryNav = [
  { href: "/insights", label: "Thống kê", icon: BarChart3 },
  { href: "/notes", label: "Ghi chú", icon: NotebookPen },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

function NavLink({ href, label, icon: Icon, pathname, onClick }: (typeof primaryNav)[number] & { pathname: string; onClick?: () => void }) {
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return <Link className={`nav-link${active ? " active" : ""}`} href={href} aria-current={active ? "page" : undefined} onClick={onClick}><Icon aria-hidden="true" />{label}</Link>;
}

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const profiles = useAppStore((state) => state.profiles);
  const activeProfileId = useAppStore((state) => state.activeProfileId);
  const switchProfile = useAppStore((state) => state.switchProfile);
  const activeProfile = profiles.find((profile) => profile.id === activeProfileId);
  const pageName = [...primaryNav, ...secondaryNav].find((item) => pathname.startsWith(item.href))?.label ?? "App Tracking";
  const appearance = activeProfile ? (
    <ThemeController {...activeProfile.preferences} />
  ) : null;

  if (
    activeProfile?.id === "profile-default"
    && ["Hồ sơ mới", "Sinh viên AI"].includes(activeProfile.name)
  ) {
    return <>{appearance}<ProfileOnboarding profileId={activeProfile.id} /></>;
  }

  return (
    <>{appearance}<div className="app-shell">
      <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
      <aside className="sidebar" aria-label="Điều hướng chính">
        <Link href="/today" className="brand"><span className="brand-mark" aria-hidden="true">A</span><span>App Tracking</span></Link>
        <label className="sr-only" htmlFor="profile-switcher">Hồ sơ hiện tại</label>
        <select id="profile-switcher" name="activeProfile" autoComplete="off" className="profile-switcher" value={activeProfileId} onChange={(event) => switchProfile(event.target.value)}>
          {profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}
        </select>
        <nav className="nav-group" aria-label="Công việc hằng ngày">
          <p className="nav-label">Mỗi ngày</p>
          {primaryNav.map((item) => <NavLink {...item} pathname={pathname} key={item.href} />)}
        </nav>
        <nav className="nav-group sidebar-bottom" aria-label="Báo cáo và cài đặt">
          {secondaryNav.map((item) => <NavLink {...item} pathname={pathname} key={item.href} />)}
        </nav>
      </aside>

      <header className="mobile-bar"><strong>{pageName}</strong><Menu size={18} aria-hidden="true" /></header>
      <main className="app-main" id="main-content" tabIndex={-1}>{children}</main>

      {moreOpen ? (
        <nav className="more-sheet" aria-label="Điều hướng bổ sung">
          {secondaryNav.map((item) => <NavLink {...item} pathname={pathname} key={item.href} onClick={() => setMoreOpen(false)} />)}
        </nav>
      ) : null}
      <nav className="bottom-nav" aria-label="Điều hướng di động">
        {primaryNav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return <Link className={`bottom-link${active ? " active" : ""}`} href={href} key={href} aria-current={active ? "page" : undefined}><Icon aria-hidden="true" />{label}</Link>;
        })}
        <button type="button" className={`bottom-link${secondaryNav.some((item) => pathname.startsWith(item.href)) ? " active" : ""}`} aria-expanded={moreOpen} onClick={() => setMoreOpen((value) => !value)}><MoreHorizontal aria-hidden="true" />Thêm</button>
      </nav>
    </div></>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return <HydrationGate><ShellContent>{children}</ShellContent></HydrationGate>;
}
