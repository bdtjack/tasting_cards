import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pour Tags",
  description: "Digital tasting cards for breweries, wineries, and distilleries",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
