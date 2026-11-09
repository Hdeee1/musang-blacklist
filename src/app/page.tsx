export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-400">
        Platform Reputasi P2P Komunitas
      </span>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
        Cek Sebelum Transfer
      </h1>
      <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base dark:text-slate-400">
        Verifikasi nomor rekening bank atau nomor WhatsApp untuk menghindari penipuan transaksi P2P
        berdasarkan bukti laporan terverifikasi.
      </p>

      <div className="mt-8 w-full max-w-xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form className="flex flex-col gap-3 sm:flex-row" action="/search" method="GET">
          <label htmlFor="search-query" className="sr-only">
            Nomor Rekening atau Nomor WhatsApp
          </label>
          <input
            id="search-query"
            name="q"
            type="text"
            required
            placeholder="Masukkan No. Rekening atau No. WA..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Cari
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span>Contoh cepat:</span>
          <a
            href="/search?q=1234567890"
            className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700 hover:text-red-600 dark:bg-slate-800 dark:text-slate-300"
          >
            1234567890 (BCA)
          </a>
          <a
            href="/search?q=08123456789"
            className="rounded bg-slate-100 px-2 py-0.5 font-mono text-slate-700 hover:text-red-600 dark:bg-slate-800 dark:text-slate-300"
          >
            08123456789 (WA)
          </a>
        </div>
      </div>
    </div>
  );
}
