import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linked Store",
  description: "Store, manage, and find your important links instantly.",
};

import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DownloadAppButton } from "@/components/DownloadAppButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen relative">
            <Navbar />
            <main className="pt-24 flex-grow relative z-10 flex flex-col">
              {children}
            </main>
            <Footer />
            {/* <DownloadAppButton /> */}
          </div>
        </Providers>
      </body>
    </html>
  );
}
