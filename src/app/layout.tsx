import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2 } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { UserNav } from "@/components/UserNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Musang Blacklist — Platform Reputasi P2P Terverifikasi Bukti",
  description:
    "Cek rekam jejak nomor rekening bank dan nomor WhatsApp sebelum bertransaksi online. Basis data penipu terverifikasi bukti transfer nyata.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  return (
    <html lang="id">
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
        {/* Top Civic Navigation */}
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="group flex items-center gap-3 transition"
              aria-label="Musang Blacklist Beranda"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-brand-foreground shadow-subtle ring-1 ring-border transition group-hover:scale-105">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-foreground leading-none">
                  Musang<span className="text-primary font-black">Blacklist</span>
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-wide mt-0.5">
                  Basis Data Reputasi P2P
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-3 text-sm font-medium">
              <Link
                href="/search"
                className="hidden sm:inline-flex rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                Cari Data
              </Link>
              <Link
                href="/report"
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground transition hover:bg-secondary/80"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                <span>Lapor Penipuan</span>
              </Link>
              <div className="h-4 w-px bg-border/80 mx-1" aria-hidden="true" />
              <UserNav session={session} />
            </nav>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">{children}</main>

        {/* Civic Trust Footer */}
        <footer className="mt-auto border-t border-border bg-card/50">
          <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              {/* Brand & Purpose */}
              <div className="md:col-span-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-brand-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                  </span>
                  <span className="text-sm font-extrabold tracking-tight text-foreground">
                    Musang Blacklist
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground max-w-md">
                  Inisiatif komunitas untuk transparansi dan pencegahan penipuan transaksi P2P
                  di Indonesia. Setiap laporan divalidasi oleh bukti transfer dan tangkapan layar transaksi nyata.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                    <Lock className="h-3 w-3 text-primary" /> Bebas PII KTP/KK/Wajah
                  </span>
                  <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                    <CheckCircle2 className="h-3 w-3 text-success" /> Validasi Tim Independen
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="md:col-span-3 space-y-2">
                <h3 className="text-xs font-bold text-foreground">Navigasi Utama</h3>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>
                    <Link href="/" className="hover:text-primary transition">
                      Pemeriksaan Nomor Rekening / WA
                    </Link>
                  </li>
                  <li>
                    <Link href="/report" className="hover:text-primary transition">
                      Formulir Pelaporan Penipuan
                    </Link>
                  </li>
                  <li>
                    <Link href="/my-reports" className="hover:text-primary transition">
                      Riwayat & Status Laporan
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Trust & Privacy Notice */}
              <div className="md:col-span-3 space-y-2">
                <h3 className="text-xs font-bold text-foreground">Kebijakan Privasi</h3>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Musang Blacklist menolak dan melarang keras pengunggahan dokumen kependudukan pribadi.
                  Hanya rekam jejak finansial yang diverifikasi untuk melindungi sesama pembeli online.
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-border/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
              <p>© {new Date().getFullYear()} Musang Blacklist. Komunitas Bebas Penipuan P2P.</p>
              <p>Divalidasi dengan integritas bukti transfer perbankan nyata.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
