import Link from "next/link";
import { Search } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
      <span className="inline-flex items-center rounded-full bg-brand/5 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-primary ring-1 ring-inset ring-primary/20">
        Platform Reputasi P2P Komunitas
      </span>
      <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Cek Sebelum Kamu Transfer
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
        Verifikasi nomor rekening bank atau nomor WhatsApp untuk memeriksa apakah pernah dilaporkan
        sebagai penipu berdasarkan bukti transaksi nyata.
      </p>

      <div className="mt-8 w-full max-w-xl">
        <form
          action="/search"
          method="GET"
          className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-card transition-shadow hover:shadow-soft"
        >
          <Search className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
          <label htmlFor="search-query" className="sr-only">
            Nomor Rekening atau Nomor WhatsApp
          </label>
          <input
            id="search-query"
            name="q"
            type="text"
            required
            placeholder="Cari No. Rekening atau No. WhatsApp..."
            className="w-full bg-transparent px-2 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
          >
            Cek Sekarang
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Contoh cepat:</span>
          <Link
            href="/search?q=1234567890"
            className="rounded-lg border border-border/70 bg-secondary px-2.5 py-1 font-mono text-secondary-foreground transition hover:text-primary hover:border-primary/40"
          >
            1234567890 (BCA)
          </Link>
          <Link
            href="/search?q=08123456789"
            className="rounded-lg border border-border/70 bg-secondary px-2.5 py-1 font-mono text-secondary-foreground transition hover:text-primary hover:border-primary/40"
          >
            08123456789 (WA)
          </Link>
        </div>
      </div>
    </div>
  );
}
