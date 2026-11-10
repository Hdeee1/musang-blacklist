import Link from "next/link";
import { CheckCircle2, FileCheck2, Lock, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { SearchConsole } from "@/components/SearchConsole";

export default function HomePage() {
  return (
    <div className="py-6 sm:py-10 space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Basis Data Reputasi P2P Komunitas</span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl sm:leading-tight">
          Cek Rekam Jejak Rekening & Kontak Sebelum Bertransaksi
        </h1>

        <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl">
          Verifikasi nomor rekening bank atau nomor WhatsApp penjual sebelum mengirim uang.
          Setiap entri blacklist didukung oleh bukti transfer nyata dan diverifikasi oleh tim kurator.
        </p>

        {/* Search Console Component */}
        <div className="mt-8 w-full max-w-2xl text-left">
          <SearchConsole />
        </div>
      </section>

      {/* Trust & Integrity Standards */}
      <section className="border-t border-border/80 pt-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Standar Integritas & Validasi Bukti
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Musang Blacklist bukan forum tuduhan anonim. Kami menerapkan kurasi ketat untuk menjaga keadilan dan akurasi data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Bukti Transaksi Nyata</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Setiap laporan wajib melampirkan tangkapan layar mutasi bank, struk transfer ATM/m-banking, serta bukti percakapan jual beli yang tidak terputus.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/60 text-[11px] font-medium text-primary">
              Wajib minimal 1 bukti transfer
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 text-success mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Perlindungan Privasi Ketat</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Kebijakan anti-doxxing: sistem melarang dan menolak pengunggahan KTP, KK, SIM, atau foto wajah. Fokus murni pada nomor rekening dan kontak penipu.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/60 text-[11px] font-medium text-success">
              Bebas penyalahgunaan PII
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning mb-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Kurasi Tim Independen</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Laporan tidak langsung terbit otomatis. Moderator mengevaluasi bukti secara cermat untuk memastikan tidak ada laporan palsu atau perselisihan sepihak.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-border/60 text-[11px] font-medium text-warning">
              Sistem reputasi pelapor aktif
            </div>
          </div>
        </div>
      </section>

      {/* Safety Checklist for Buyers */}
      <section className="rounded-2xl border border-border bg-secondary/50 p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="text-xs font-bold text-primary">Panduan Transaksi Aman</span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Langkah Pencegahan Sebelum Mengirimkan Uang
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Mayoritas penipuan jual beli di media sosial memanfaatkan kelengahan pembeli saat mentransfer langsung ke rekening pribadi penjual yang belum dikenal.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground mb-2">
                1
              </span>
              <h4 className="text-xs font-bold text-foreground">Minta Data Lengkap</h4>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                Minta nama bank, nomor rekening, dan nama pemilik rekening secara jelas tanpa singkatan.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground mb-2">
                2
              </span>
              <h4 className="text-xs font-bold text-foreground">Cek Rekam Jejak</h4>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                Masukkan nomor rekening dan WhatsApp di Musang Blacklist untuk memeriksa riwayat laporan korban terdahulu.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground mb-2">
                3
              </span>
              <h4 className="text-xs font-bold text-foreground">Gunakan Rekber</h4>
              <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                Jika nilai transaksi besar atau penjual mendesak pembayaran cepat, selalu gunakan Rekening Bersama tepercaya.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Report CTA Banner */}
      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-destructive">
            <ShieldAlert className="h-4 w-4" />
            <span>Pernah Menjadi Korban Penipuan?</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Bantu Lindungi Pembeli Lain dengan Melaporkan Bukti Transaksi
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Laporkan nomor rekening atau nomor WhatsApp pelaku penipuan disertai bukti mutasi transfer Anda. Laporan Anda menyelamatkan calon korban berikutnya.
          </p>
        </div>

        <Link
          href="/report"
          className="inline-flex items-center gap-2 shrink-0 rounded-xl bg-destructive px-5 py-3 text-xs sm:text-sm font-bold text-destructive-foreground shadow-subtle transition hover:opacity-90"
        >
          <span>Kirim Laporan Penipuan</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
