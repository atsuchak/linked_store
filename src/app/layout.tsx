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
  title: "Link Base",
  description: "Store, manage, and find your important links instantly.",
  icons: {
    icon: [
      { url: '/favicon-bg/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-bg/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-bg/favicon.ico' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicon-bg/site.webmanifest',
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
        suppressHydrationWarning={true}
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
