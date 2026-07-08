import Dexie from 'dexie'

/**
 * RACIKU LOCAL DATABASE (IndexedDB via Dexie)
 * ---------------------------------------------
 * This is the source of truth for the app while offline.
 * Every write (new sale, stock update, etc.) goes here FIRST,
 * instantly, with no network required.
 *
 * Every table that needs to sync to the cloud has a `_dirty` flag
 * and `_deleted` flag. The sync engine (see src/lib/sync.js) reads
 * rows where _dirty = 1, pushes them to Supabase, then clears the flag.
 *
 * `_id` is a client-generated UUID (not an auto-increment number) so
 * that records created offline never collide with records from other
 * devices once everything syncs to the same Supabase table.
 */

export const db = new Dexie('racikku')

db.version(1).stores({
  // Master data
  produk: '_id, nama, kategori, stok, hargaBeli, hargaJual, expiredAt, minStok, _dirty, _deleted, updatedAt',
  users: '_id, nama, role, pin, _dirty, _deleted, updatedAt', // role: 'owner' | 'karyawan'

  // Transactional data
  transaksi: '_id, nomor, kasirId, total, metodeBayar, createdAt, _dirty, _deleted, updatedAt',
  transaksiItem: '_id, transaksiId, produkId, namaProduk, qty, hargaSatuan, subtotal, _dirty, _deleted, updatedAt',

  // Local-only: tracks current logged-in session (never synced)
  session: '_id',

  // Local-only: sync bookkeeping
  syncMeta: '_id'
})

// ---- Helpers -------------------------------------------------

export function newId() {
  return crypto.randomUUID()
}

export function nowIso() {
  return new Date().toISOString()
}

/** Mark a record dirty so the sync engine picks it up next time we're online. */
export function markDirty(record) {
  return { ...record, _dirty: 1, _deleted: 0, updatedAt: nowIso() }
}
