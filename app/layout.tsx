"use client";

import "./globals.css";
import Header from "@/app/components/Header";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ❌ Hide header on login page
  const hideHeader = pathname === "/";

  return (
    <html lang="en">
      <body>
        {!hideHeader && <Header />}
        {children}
      </body>
    </html>
  );
}