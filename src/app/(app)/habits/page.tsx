import type { Metadata } from "next";
import { HabitsScreen } from "@/components/habits/habits-screen";

export const metadata: Metadata = { title: "Thói quen" };
export default function HabitsPage() { return <HabitsScreen />; }
