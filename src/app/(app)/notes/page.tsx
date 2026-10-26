import type { Metadata } from "next";
import { NotesScreen } from "@/components/notes/notes-screen";

export const metadata: Metadata = { title: "Ghi chú" };
export default function NotesPage() { return <NotesScreen />; }
