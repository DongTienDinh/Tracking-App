import type { Metadata } from "next";
import { InsightsScreen } from "@/components/insights/insights-screen";

export const metadata: Metadata = { title: "Thống kê" };
export default function InsightsPage() { return <InsightsScreen />; }
