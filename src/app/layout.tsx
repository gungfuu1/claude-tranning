import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PEA HUB | หลักสูตรอบรม การไฟฟ้าส่วนภูมิภาค",
  description: "หลักสูตรอบรมด้านระบบไฟฟ้า ความปลอดภัย พลังงานทดแทน และดิจิทัล จากการไฟฟ้าส่วนภูมิภาค",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${plexThai.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
