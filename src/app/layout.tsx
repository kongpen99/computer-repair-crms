import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Computer Repair Management System",
  description: "ระบบจัดเก็บและบันทึกประวัติการซ่อมเครื่อง Computer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${geist.variable} h-full`}>
      <body className="min-h-full font-sans antialiased bg-[#F0F2F5]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
