import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check-In",
  description: "Rest stops, made simple.",
  themeColor: "#F0E6D2",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream text-ink font-sans antialiased">{children}</body>
    </html>
  );
}
