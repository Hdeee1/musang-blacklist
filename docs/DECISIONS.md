# Architecture & Decisions

## 1. System Baseline (Kondisi Saat Ini)

- **Pola Arsitektur:** Fullstack Next.js App Router (Modular Monolith) dengan React Server Components dan Server Actions / Route Handlers.
- **Struktur Direktori Inti:**
  - `src/app`: App Router pages, route handlers, layouts, dan styles.
  - `src/components`: Reusable UI components terpisah dari logic.
  - `src/lib`: Domain logic, client DB, Zod validations, dan auth helpers.
  - `src/types`: Definisi tipe TypeScript domain.
  - `tests`: Vitest unit and integration tests.
  - `docs`: Dokumentasi produk, arsitektur, dan lisensi aset.
  - `assets`: Aset statis dan lisensi.
- **Database & Penyimpanan:** PostgreSQL (containerized lokal via docker-compose), Prisma ORM 6 dengan model relasional (User, BlacklistEntry, Report, ReportEvidence, ModerationLog), singleton client di `src/lib/db.ts`, dan seed dev terpisah.
- **Autentikasi & State:** Session stateless JWT via cookie HttpOnly (`musang_session`, ditandatangani `jose` dengan `SESSION_SECRET`), password hashing `bcryptjs`, RBAC via Next.js middleware (`/admin` hanya ADMIN, `/report` wajib login).
- **Penyimpanan Berkas Bukti:** Disimpan lokal di `public/uploads/evidence/` (di-ignore git), nama berkas UUID teracak, validasi tipe JPG/PNG/WebP maks. 2MB (1-3 file), penolakan privasi ketat (tanpa KTP/KK/wajah).
- **Komunikasi & Integrasi:** REST API / Server Actions, format error RFC 9457 Problem Details, validasi skema Zod di boundary, rate limiting untuk endpoint publik.

## 2. Decision Log

| ID     | Tanggal    | Lingkup               | Keputusan                                                                                      | Alasan & Batasan (Kenapa)                                                                                | Konsekuensi / Aturan Wajib                                                                                     |
| :----- | :--------- | :-------------------- | :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------- |
| ADR-01 | 2026-11-05 | Bootstrap             | Next.js 15 App Router + TypeScript + Tailwind CSS                                              | Performa SSR/SEO untuk halaman pencarian publik dan DX fullstack terpadu                                 | Strict TypeScript aktif, boundary validation via Zod, dilarang menyimpan secret di client                      |
| ADR-02 | 2026-11-05 | Database & Infra      | PostgreSQL lokal via Docker Compose + multi-stage Dockerfile                                   | Kebutuhan transaksi data laporan penipuan, integritas referensial, dan kemudahan setup `make dev`        | Semua skema wajib pakai migrasi terversi, database lokal dijalankan dengan docker-compose                      |
| ADR-03 | 2026-11-05 | Database ORM          | Prisma ORM 6 dengan model User, BlacklistEntry, Report, ReportEvidence, ModerationLog          | Skema relasional terstruktur, strongly-typed client, kemudahan migrasi dan seeding dev terpisah          | Akses database wajib via singleton `src/lib/db.ts`, dilarang query tanpa parameter                             |
| ADR-04 | 2026-11-05 | Autentikasi & RBAC    | Stateless JWT (jose) dalam cookie HttpOnly + bcryptjs password hashing                         | Kepatuhan keamanan web (tanpa token di localStorage), kompatibilitas Edge middleware, dan efisiensi      | Token wajib diverifikasi di middleware & route handlers, error konsisten RFC 9457                              |
| ADR-05 | 2026-11-09 | Pelaporan & Bukti     | Form pelaporan terautentikasi + upload bukti transaksi berbasis disk dengan proteksi privasi   | Memenuhi alur MVP pelaporan (status PENDING), batas 1-3 berkas maks 2MB, dan Hard Rule #1 Privasi        | File bukti diverifikasi MIME & ukuran, nama file UUID, blokir KTP/KK/SIM/selfie                                |
| ADR-06 | 2026-11-09 | Moderasi Admin        | Dashboard moderasi admin dengan aksi transaksional APPROVE / REJECT dan audit log              | Menjaga akurasi data blacklist publik via evaluasi bukti nyata admin, serta reputasi pelapor             | Wajib role ADMIN, seluruh perubahan status dan relasi dibungkus dalam prisma.$transaction                      |
| ADR-07 | 2026-11-09 | Pencarian & Detail    | Pencarian publik berbasis SSR dengan normalisasi format nomor (08 vs +62) & halaman detail     | Akses instan, SEO indexable untuk halaman penipu, dan kejelasan status (BLACKLISTED vs DATA BERSIH)      | Data pencarian hanya menampilkan status BLACKLISTED yang diapprove, error konsisten RFC 9457                   |
| ADR-08 | 2026-11-09 | Keamanan & Rate Limit | In-memory tiered rate limiter, Edge middleware enforcement, CSRF origin check, dan CSP sandbox | Melindungi endpoint pencarian publik, brute-force auth, spam pelaporan, dan file bukti sesuai PRODUCT.md | Edge & route handler 429 RFC 9457 / HTML, header X-RateLimit-* & Retry-After, upload berkas terisolasi sandbox |
