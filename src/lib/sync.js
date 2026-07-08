import { db } from '../db/db'
import { supabase, isCloudConfigured } from './supabase'

/**
 * SYNC ENGINE
 * -----------
 * Strategi: "local write, background push" (offline-first).
 *
 * 1. UI selalu baca/tulis ke Dexie (IndexedDB) secara langsung -> instan,
 *    tidak pernah menunggu network, tidak pernah gagal karena offline.
 * 2. Setiap kali ada baris `_dirty = 1` di tabel manapun, sync engine ini
 *    akan mencoba push ke Supabase begitu ada koneksi.
 * 3. Sync dipicu oleh 3 hal: event 'online' dari browser, interval
 *    berkala (jaga-jaga event 'online' tidak terpicu), dan manual
 *    (misal tombol "Sync sekarang").
 * 4. Konflik: strategi default last-write-wins berdasarkan `updatedAt`.
 *    Ini cukup untuk kasus 1 apotek dengan beberapa kasir; kalau nanti
 *    butuh resolusi lebih canggih (multi-cabang), ganti di sini saja -
 *    seluruh app tidak perlu tahu detail ini.
 */

const TABLES_TO_SYNC = ['produk', 'users', 'transaksi', 'transaksiItem']

let syncing = false
const listeners = new Set()

export function onSyncStatusChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify(status) {
  for (const fn of listeners) fn(status)
}

export async function pushDirtyRows() {
  if (!isCloudConfigured) return { pushed: 0, skipped: 'no-cloud-config' }
  if (!navigator.onLine) return { pushed: 0, skipped: 'offline' }
  if (syncing) return { pushed: 0, skipped: 'already-syncing' }

  syncing = true
  notify('syncing')
  let pushed = 0

  try {
    for (const table of TABLES_TO_SYNC) {
      const dirtyRows = await db[table].where('_dirty').equals(1).toArray()
      if (dirtyRows.length === 0) continue

      const { error } = await supabase.from(table).upsert(
        dirtyRows.map(({ _dirty, ...row }) => row),
        { onConflict: '_id' }
      )

      if (error) {
        console.error(`Sync gagal untuk tabel ${table}:`, error.message)
        continue // lanjut ke tabel lain, coba lagi nanti
      }

      // Berhasil push -> bersihkan flag dirty di lokal
      await db[table].bulkPut(dirtyRows.map((row) => ({ ...row, _dirty: 0 })))
      pushed += dirtyRows.length
    }

    await db.syncMeta.put({ _id: 'lastSync', at: new Date().toISOString() })
    notify('idle')
    return { pushed }
  } catch (err) {
    console.error('Sync error:', err)
    notify('error')
    return { pushed, error: err.message }
  } finally {
    syncing = false
  }
}

/** Pull perubahan dari cloud (misal dari device lain) ke lokal. */
export async function pullRemoteChanges() {
  if (!isCloudConfigured || !navigator.onLine) return

  const meta = await db.syncMeta.get('lastPull')
  const since = meta?.at || '1970-01-01'

  for (const table of TABLES_TO_SYNC) {
    const { data, error } = await supabase.from(table).select('*').gt('updatedAt', since)
    if (error) {
      console.error(`Pull gagal untuk tabel ${table}:`, error.message)
      continue
    }
    if (data?.length) {
      await db[table].bulkPut(data.map((row) => ({ ...row, _dirty: 0 })))
    }
  }

  await db.syncMeta.put({ _id: 'lastPull', at: new Date().toISOString() })
}

export async function syncNow() {
  await pushDirtyRows()
  await pullRemoteChanges()
}

/** Panggil sekali saat app start (lihat main.jsx). */
export function initSyncEngine() {
  window.addEventListener('online', () => {
    notify('online')
    syncNow()
  })
  window.addEventListener('offline', () => notify('offline'))

  // Jaring pengaman: coba sync tiap 30 detik kalau online,
  // untuk jaga-jaga event 'online' browser tidak selalu akurat.
  setInterval(() => {
    if (navigator.onLine) syncNow()
  }, 30_000)

  // Percobaan pertama saat app dibuka
  if (navigator.onLine) syncNow()
}
