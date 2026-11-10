import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { UserNav } from "@/components/UserNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Musang Blacklist — Platform Reputasi P2P",
  description: "Cek rekam jejak rekening bank dan nomor WhatsApp sebelum bertransaksi.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  return (
    <html lang="id">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground">
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 transition opacity-90 hover:opacity-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-soft">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                Musang<span className="text-primary">Blacklist</span>
              </span>
            </Link>

            <nav className="flex items-center gap-2 text-sm font-medium">
              <Link
                href="/report"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Lapor Penipuan
              </Link>
              <UserNav session={session} />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
