import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ToastProvider } from "@/context/ToastContext";
import { ModalProvider } from "@/context/ModalContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Automation Flow Builder",
  description: "Visual email automation editor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-slate-50 min-h-screen text-slate-900`}
      >
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold tracking-tighter">
                    AF
                  </span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                  <Link
                    href="/automations"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Flow<span className="text-indigo-600">Builder</span>
                  </Link>
                </h1>
              </div>
              <nav className="flex items-center space-x-6">
                <Link
                  href="/automations"
                  className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all"
                >
                  Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <ModalProvider>
            <ToastProvider>{children}</ToastProvider>
          </ModalProvider>
        </main>
      </body>
    </html>
  );
}
