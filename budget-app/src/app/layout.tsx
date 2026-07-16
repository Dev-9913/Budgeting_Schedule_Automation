import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget Automation System - 13 Schedules",
  description: "Automated master budget generation for manufacturing companies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

