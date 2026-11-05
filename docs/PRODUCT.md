# Product Specification — Blacklist App

## Overview

Platform pencarian rekam jejak penipuan P2P berbasis **Nomor Rekening Bank** dan **Nomor WhatsApp** — data yang sulit diubah penipu. Laporan divalidasi oleh bukti transaksi nyata (screenshot transfer + chat), bukan tuduhan anonim.

## Problem

Penipuan P2P di media sosial (Facebook, Telegram, Instagram) tinggi karena penipu bebas mengganti nama akun. Tidak ada platform reputasi terpusat berbasis data transaksi.

## Target User

| Role                      | Kebutuhan                                    |
| ------------------------- | -------------------------------------------- |
| Buyer                     | Validasi rekam jejak seller sebelum transfer |
| Pelapor (Korban / Rekber) | Submit data penipu dengan bukti transaksi    |
| Admin                     | Moderasi laporan: approve / reject           |

## Fitur Scope

### ✅ MVP (In Scope)

- **Pencarian**: Nomor Rekening + Nomor WhatsApp (instan, public, rate-limited).
- **Halaman Detail**: Status BLACKLISTED, kronologi singkat, screenshot bukti.
- **Pelaporan**: Form + upload min. 1 bukti screenshot (maks. 3 file, 2MB/file).
- **Autentikasi**: Register/Login email + password. Skor reputasi pelapor.
- **Moderasi**: Dashboard admin Approve / Reject antrean laporan.
- **Platform**: Web-only.

### ❌ Post-MVP (Out of Scope — Jangan Implementasi)

- Pencarian berdasarkan nama alias atau link media sosial.
- Grafik statistik frekuensi penipuan.
- Google Auth / OAuth.
- Integrasi API pihak ketiga otomatis.
- Deteksi spam laporan via AI.

## User Flows (MVP)

**Pencarian (Public):**

```
Input No. Rekening/WA → Cari di DB
  └─ Ditemukan     → Halaman detail (BLACKLISTED + bukti + kronologi)
  └─ Tidak Ditemukan → "Data bersih / belum dilaporkan"
```

**Pelaporan (Authenticated User):**

```
Login → Form laporan → Input data penipu + upload bukti → Submit → Status: PENDING
```

**Moderasi (Admin Only):**

```
Dashboard → Antrean laporan → Evaluasi bukti
  └─ Valid      → APPROVE → data masuk pencarian publik
  └─ Palsu/Spam → REJECT  → diarsipkan
```

## Non-Functional Requirements

- **Privasi**: Dilarang menerima/menyimpan/menampilkan KTP, KK, foto wajah.
- **Keamanan Publik**: API pencarian wajib diproteksi Cloudflare + rate-limiting.
