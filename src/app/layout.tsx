import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-instrument-sans", display: "swap" });
const instrumentSerif = Instrument_Serif({ subsets: ["latin", "latin-ext"], variable: "--font-instrument-serif", weight: "400", display: "swap" });

export const metadata: Metadata = {
  title: { default: "App Tracking", template: "%s · App Tracking" },
  description: "Theo dõi công việc, thói quen và mục tiêu hằng ngày — local-first.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>{children}</body>
    </html>
  );
}
