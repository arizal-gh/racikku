-- ============================================================
-- RACIKU - Skema Database Supabase (Cloud)
-- ============================================================
-- Jalankan ini di: Supabase Dashboard > SQL Editor > New Query
-- Struktur ini SENGAJA dibuat mirror 1:1 dari skema Dexie lokal
-- (src/db/db.js) supaya sync engine bisa upsert tanpa transformasi.
-- ============================================================

create table if not exists produk (
  _id uuid primary key,
  nama text not null,
  kategori text,
  stok integer not null default 0,
  "hargaBeli" numeric not null default 0,
  "hargaJual" numeric not null default 0,
  "minStok" integer not null default 10,
  "expiredAt" date,
  _deleted boolean default false,
  "updatedAt" timestamptz default now()
);

create table if not exists users (
  _id uuid primary key,
  nama text not null,
  role text not null check (role in ('owner', 'karyawan')),
  pin text not null,
  _deleted boolean default false,
  "updatedAt" timestamptz default now()
);

create table if not exists transaksi (
  _id uuid primary key,
  nomor text not null,
  "kasirId" uuid references users(_id),
  subtotal numeric not null default 0,
  diskon numeric not null default 0,
  total numeric not null default 0,
  "metodeBayar" text default 'tunai',
  "createdAt" timestamptz default now(),
  _deleted boolean default false,
  "updatedAt" timestamptz default now()
);

create table if not exists "transaksiItem" (
  _id uuid primary key,
  "transaksiId" uuid references transaksi(_id),
  "produkId" uuid references produk(_id),
  "namaProduk" text not null,
  qty integer not null,
  "hargaSatuan" numeric not null,
  subtotal numeric not null,
  _deleted boolean default false,
  "updatedAt" timestamptz default now()
);

-- Index untuk mempercepat query sync ("ambil yang berubah sejak X")
create index if not exists idx_produk_updated on produk ("updatedAt");
create index if not exists idx_users_updated on users ("updatedAt");
create index if not exists idx_transaksi_updated on transaksi ("updatedAt");
create index if not exists idx_transaksiitem_updated on "transaksiItem" ("updatedAt");

-- ============================================================
-- Row Level Security (RLS) - PENTING untuk produksi.
-- Untuk Stage 1 (uji coba 1 apotek), kita nyalakan RLS dengan
-- policy sederhana: siapapun yang punya anon key bisa baca/tulis.
-- Ini CUKUP untuk MVP/validasi, tapi sebelum ada banyak apotek
-- (multi-tenant), policy ini WAJIB diperketat per apotek.
-- ============================================================
alter table produk enable row level security;
alter table users enable row level security;
alter table transaksi enable row level security;
alter table "transaksiItem" enable row level security;

create policy "allow all for anon (MVP only)" on produk for all using (true) with check (true);
create policy "allow all for anon (MVP only)" on users for all using (true) with check (true);
create policy "allow all for anon (MVP only)" on transaksi for all using (true) with check (true);
create policy "allow all for anon (MVP only)" on "transaksiItem" for all using (true) with check (true);
