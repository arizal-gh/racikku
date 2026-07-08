# Raciku — Apotek Jadi Mudah

Software manajemen apotek **offline-first**: tetap bisa dipakai untuk transaksi, cek stok, dan lihat laporan meski internet mati. Begitu ada koneksi lagi, semua data otomatis tersinkron ke cloud (Supabase) di background — tanpa perlu tindakan apa pun dari kasir/owner.

## Stage yang sudah dibangun (Stage 1 — Tier 1 MVP)

- ✅ Login PIN (owner/karyawan), 100% offline
- ✅ POS/kasir — transaksi tersimpan instan ke perangkat
- ✅ Stok obat — tambah obat, alert stok menipis, alert mendekati kedaluwarsa
- ✅ Laporan penjualan harian
- ✅ Database lokal (IndexedDB via Dexie) — app tetap jalan tanpa internet
- ✅ Sync engine ke Supabase — otomatis aktif begitu online, dan otomatis nonaktif (aman) kalau offline

**Belum dibangun (menyusul di Stage berikutnya, sesuai roadmap):** Smart Apoteker/daily briefing, multi-cabang, resep & racikan, hak akses granular, notifikasi WhatsApp. Ini sengaja ditunda dulu — lihat `Audit-Raciku.md` untuk alasannya.

---

## Cara pakai project ini (untuk yang belum pernah coding)

### 1. Install Node.js
Download dari https://nodejs.org (pilih versi LTS). Install seperti install aplikasi biasa.

### 2. Buka folder project ini di terminal
- Windows: buka folder ini, ketik `cmd` di address bar, Enter
- Mac: buka Terminal, ketik `cd ` (dengan spasi) lalu drag folder ini ke terminal, Enter

### 3. Install dependencies
```bash
npm install
```
(Ini butuh koneksi internet, sekali saja di awal, sekitar 1-2 menit)

### 4. Jalankan aplikasinya
```bash
npm run dev
```
Buka browser ke alamat yang muncul (biasanya `http://localhost:5173`). Login dengan PIN default: **1234**

Coba matikan WiFi laptop kamu setelah aplikasi terbuka — semua fitur (POS, stok, laporan) tetap jalan normal. Itu bukti offline-first-nya bekerja.

---

## Cara upload ke GitHub (repo kamu sendiri)

1. Buat akun di https://github.com kalau belum punya
2. Buat repository baru (tombol hijau "New"), kasih nama misal `raciku`, jangan centang "Add README" (karena sudah ada)
3. Di terminal, dalam folder project ini, jalankan:
```bash
git init
git add .
git commit -m "Stage 1: MVP offline-first - POS, stok, laporan"
git branch -M main
git remote add origin https://github.com/USERNAME-KAMU/raciku.git
git push -u origin main
```
Ganti `USERNAME-KAMU` dengan username GitHub kamu.

---

## Cara mengaktifkan sync ke cloud (Supabase — gratis)

Aplikasi ini **jalan penuh tanpa langkah ini** (semua data tersimpan aman di 1 perangkat). Lakukan ini kalau kamu sudah mau data tersinkron antar-device (misal owner cek dari HP, kasir input dari laptop toko).

1. Daftar gratis di https://supabase.com, buat project baru
2. Buka **SQL Editor** di dashboard Supabase, copy-paste seluruh isi file `supabase/schema.sql` dari project ini, klik Run
3. Buka **Project Settings > API**, salin **Project URL** dan **anon public key**
4. Di folder project ini, copy file `.env.example` jadi `.env`, isi seperti ini:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxx
```
5. Restart `npm run dev` — badge di pojok kanan atas aplikasi akan berubah dari "Mode lokal" jadi "Tersinkron"

⚠️ **Catatan keamanan:** policy di `schema.sql` saat ini dibuat terbuka (siapapun dengan anon key bisa baca/tulis) supaya cepat untuk tahap uji coba. Ini cukup aman selama `.env` tidak kamu bagikan ke publik. Sebelum pakai untuk banyak apotek sekaligus, policy ini perlu diperketat per-apotek — tanyakan lagi ke Claude kalau sudah sampai tahap itu.

---

## Struktur folder

```
src/
  db/            -> Database lokal (Dexie/IndexedDB) + fungsi CRUD
  lib/           -> Supabase client + sync engine (offline-first logic)
  hooks/         -> React hooks (status sync)
  components/    -> Sidebar, StatCard, SyncBadge
  pages/         -> Login, Dashboard, POS, Stok, Laporan
supabase/
  schema.sql     -> Skema database cloud, jalankan di Supabase SQL Editor
```

## Cara kerja offline-first (ringkas)

1. Semua aksi (transaksi, tambah obat, dll) langsung tersimpan ke **IndexedDB di browser** — instan, tanpa nunggu internet
2. Baris data yang berubah ditandai `_dirty = 1`
3. Begitu browser mendeteksi online, `src/lib/sync.js` otomatis push baris `_dirty` ke Supabase, lalu bersihkan tandanya
4. Kalau app dibuka di device lain, `pullRemoteChanges()` menarik data terbaru dari cloud ke lokal

Detail lengkap ada di komentar dalam file `src/lib/sync.js`.
