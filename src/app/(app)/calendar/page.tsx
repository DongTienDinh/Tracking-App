import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarScreen } from "@/components/calendar/calendar-screen";

export const metadata: Metadata = { title: "Lịch" };

export default function CalendarPage() {
  return <Suspense fallback={<div className="page"><div className="skeleton panel" /></div>}><CalendarScreen /></Suspense>;
}
