import { db, newId, markDirty, nowIso } from './db'
import { kurangiStok } from './produkRepo'

/**
 * Membuat transaksi penjualan + item-itemnya dalam satu operasi atomik
 * di IndexedDB, lalu mengurangi stok tiap produk yang terjual.
 * Semua ini terjadi secara instan di device, tanpa menunggu internet.
 */
export async function buatTransaksi({ items, kasirId, metodeBayar = 'tunai', diskon = 0 }) {
  if (!items || items.length === 0) {
    throw new Error('Transaksi harus punya minimal 1 item')
  }

  const transaksiId = newId()
  const nomor = `INV-${Date.now()}`
  const subtotal = items.reduce((sum, it) => sum + it.hargaSatuan * it.qty, 0)
  const total = subtotal - diskon

  await db.transaction('rw', db.transaksi, db.transaksiItem, db.produk, async () => {
    await db.transaksi.put(
      markDirty({
        _id: transaksiId,
        nomor,
        kasirId,
        subtotal,
        diskon,
        total,
        metodeBayar,
        createdAt: nowIso()
      })
    )

    for (const it of items) {
      await db.transaksiItem.put(
        markDirty({
          _id: newId(),
          transaksiId,
          produkId: it.produkId,
          namaProduk: it.namaProduk,
          qty: it.qty,
          hargaSatuan: it.hargaSatuan,
          subtotal: it.hargaSatuan * it.qty
        })
      )
      await kurangiStok(it.produkId, it.qty)
    }
  })

  return { transaksiId, nomor, total }
}

export async function listTransaksiHariIni() {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const all = await db.transaksi.filter((t) => !t._deleted).toArray()
  return all.filter((t) => new Date(t.createdAt) >= startOfDay)
}

export async function ringkasanHariIni() {
  const transaksi = await listTransaksiHariIni()
  const omzet = transaksi.reduce((s, t) => s + t.total, 0)
  const jumlahTransaksi = transaksi.length

  let produkTerjual = 0
  for (const t of transaksi) {
    const items = await db.transaksiItem.where('transaksiId').equals(t._id).toArray()
    produkTerjual += items.reduce((s, it) => s + it.qty, 0)
  }

  return { omzet, jumlahTransaksi, produkTerjual }
}
