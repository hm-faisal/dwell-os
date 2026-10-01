import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/Sonner";
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
  title: "DwellOS — Seamless Property & Room Living",
  description:
    "An Apple-inspired operating system for modern property and tenant living.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-950">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className:
              "apple-glass rounded-2xl shadow-xl border border-black/10 dark:border-white/10",
          }}
        />
      </body>
    </html>
  );
}
