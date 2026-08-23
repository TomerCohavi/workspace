import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "DesignAlign Admin",
  description: "Local design system library — visuals and edits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(geist.variable, geistMono.variable)}>
      <body className="min-h-screen font-sans">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-sm font-semibold tracking-tight">
                DesignAlign
              </span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </Link>
            <span className="font-mono text-xs text-muted-foreground">
              /api/v1
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
