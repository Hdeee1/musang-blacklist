# Musang Blacklist

Platform pencarian rekam jejak penipuan transaksi P2P berbasis **Nomor Rekening Bank** dan **Nomor WhatsApp**, divalidasi oleh bukti transaksi nyata dari komunitas.

## Stack Teknologi

- **Runtime & Bahasa:** Node.js (v20+), TypeScript (Strict ESM)
- **Framework:** Next.js 15 (App Router), React 19
- **Styling:** Tailwind CSS
- **Validasi Boundary:** Zod
- **Testing:** Vitest
- **Tooling:** ESLint (Flat Config), Prettier, pnpm
- **Infrastruktur & Delivery:** Docker multi-stage, Docker Compose (PostgreSQL), GitHub Actions CI

## Prasyarat

- Node.js >= 20.0.0
- pnpm >= 9.x / 12.x
- Docker & Docker Compose (opsional, untuk database PostgreSQL lokal)

## Memulai Cepat

1. **Clone repository dan salin environment:**

   ```bash
   cp .env.example .env
   ```

2. **Setup dependensi:**

   ```bash
   make setup
   ```

3. **Jalankan database lokal (opsional):**

   ```bash
   docker compose up -d postgres
   ```

4. **Jalankan server development:**
   ```bash
   make dev
   ```
   Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

## Perintah Task Runner

| Perintah          | Deskripsi                                               |
| :---------------- | :------------------------------------------------------ |
| `make setup`      | Menginstal seluruh dependensi via `pnpm`                |
| `make dev`        | Menjalankan Next.js development server                  |
| `make build`      | Menjalankan production build aplikasi                   |
| `make test`       | Menjalankan automated test via Vitest                   |
| `make lint`       | Menjalankan linter ESLint                               |
| `make typecheck`  | Menjalankan verifikasi tipe TypeScript (`tsc --noEmit`) |
| `make format`     | Memeriksa format kode via Prettier                      |
| `make format-fix` | Merapikan format kode secara otomatis                   |

## Struktur Direktori

```text
├── .agents/          # Instruksi, aturan & skill AI
├── .github/          # CI/CD workflows
├── assets/           # Aset statis & berkas lisensi
├── docs/             # Dokumentasi produk & arsitektur (PRODUCT.md, DECISIONS.md, ASSETS.md)
├── public/           # File statis publik
├── src/
│   ├── app/          # Next.js App Router (pages, layout, API routes)
│   ├── components/   # Komponen UI
│   ├── lib/          # Logika utilitas, validasi Zod, dan helpers
│   └── types/        # Definisi TypeScript domain types
└── tests/            # Test suite Vitest
```

## Kebijakan & Privasi

Sesuai aturan keamanan produk:

- **Dilarang** menerima, menyimpan, atau menampilkan identitas kependudukan sensitif (KTP, KK, foto wajah).
- Validasi data berfokus murni pada bukti transaksi finansial dan jejak kontak pelaku penipuan.
