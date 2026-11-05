import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Musang Blacklist — Platform Reputasi P2P",
  description: "Cek rekam jejak rekening bank dan nomor WhatsApp sebelum bertransaksi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
            <a href="/" className="text-lg font-bold tracking-tight text-red-600 dark:text-red-500">
              Musang Blacklist
            </a>
            <nav className="flex items-center gap-4 text-sm font-medium">
              <a href="/report" className="hover:text-red-600">
                Lapor Penipuan
              </a>
              <a
                href="/login"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Masuk
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
