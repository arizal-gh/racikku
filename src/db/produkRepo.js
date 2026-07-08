import { db, newId, markDirty } from './db'

/**
 * Repository pattern: every function here writes to the LOCAL database
 * only. Nothing here ever calls the network directly. The sync engine
 * (src/lib/sync.js) is solely responsible for pushing/pulling to Supabase.
 * This separation is what makes offline-first possible: the UI never
 * needs to know or care whether the device is online.
 */

export async function listProduk() {
  return db.produk.filter((p) => !p._deleted).toArray()
}

export async function getProduk(id) {
  return db.produk.get(id)
}

export async function createProduk(data) {
  const record = markDirty({
    _id: newId(),
    nama: data.nama,
    kategori: data.kategori || 'Umum',
    stok: Number(data.stok) || 0,
    hargaBeli: Number(data.hargaBeli) || 0,
    hargaJual: Number(data.hargaJual) || 0,
    minStok: Number(data.minStok) || 10,
    expiredAt: data.expiredAt || null
  })
  await db.produk.put(record)
  return record
}

export async function updateProduk(id, changes) {
  const existing = await db.produk.get(id)
  if (!existing) throw new Error('Produk tidak ditemukan')
  const record = markDirty({ ...existing, ...changes })
  await db.produk.put(record)
  return record
}

/** Kurangi stok saat transaksi terjadi. Ini dipanggil dari POS. */
export async function kurangiStok(id, qty) {
  const existing = await db.produk.get(id)
  if (!existing) throw new Error('Produk tidak ditemukan')
  const record = markDirty({ ...existing, stok: existing.stok - qty })
  await db.produk.put(record)
  return record
}

export async function deleteProduk(id) {
  const existing = await db.produk.get(id)
  if (!existing) return
  await db.produk.put(markDirty({ ...existing, _deleted: 1 }))
}

/** Produk dengan stok di bawah ambang minimum -> untuk alert dashboard */
export async function listStokMenipis() {
  const all = await listProduk()
  return all.filter((p) => p.stok <= p.minStok)
}

/** Produk yang akan kedaluwarsa dalam N hari -> untuk alert dashboard */
export async function listAkanExpired(hari = 30) {
  const all = await listProduk()
  const batas = Date.now() + hari * 24 * 60 * 60 * 1000
  return all.filter((p) => p.expiredAt && new Date(p.expiredAt).getTime() <= batas)
}
