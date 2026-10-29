import { Suspense } from "react";
import type { Metadata } from "next";
import { TodayDashboard } from "@/components/tasks/today-dashboard";

export const metadata: Metadata = { title: "Hôm nay" };

export default function TodayPage() {
  return <Suspense fallback={<div className="page"><div className="skeleton panel" /></div>}><TodayDashboard /></Suspense>;
}
