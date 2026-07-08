import { useEffect, useState } from 'react'
import { listProduk, createProduk, updateProduk } from '../db/produkRepo'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    n || 0
  )
}

const emptyForm = { nama: '', kategori: '', stok: '', hargaBeli: '', hargaJual: '', minStok: '10', expiredAt: '' }

export default function Stok() {
  const [produkList, setProdukList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  async function load() {
    setProdukList(await listProduk())
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    await createProduk(form)
    setForm(emptyForm)
    setShowForm(false)
    load()
  }

  async function handleTambahStok(produk) {
    const jumlah = prompt(`Tambah stok untuk ${produk.nama} (saat ini: ${produk.stok})`)
    if (!jumlah || isNaN(jumlah)) return
    await updateProduk(produk._id, { stok: produk.stok + Number(jumlah) })
    load()
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Obat & Stok</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {showForm ? 'Batal' : '+ Tambah Obat'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
          <input required placeholder="Nama obat" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input placeholder="Kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Stok awal" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Harga beli" value={form.hargaBeli} onChange={(e) => setForm({ ...form, hargaBeli: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input required type="number" placeholder="Harga jual" value={form.hargaJual} onChange={(e) => setForm({ ...form, hargaJual: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input type="number" placeholder="Stok minimum (alert)" value={form.minStok} onChange={(e) => setForm({ ...form, minStok: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <input type="date" value={form.expiredAt} onChange={(e) => setForm({ ...form, expiredAt: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          <button type="submit" className="col-span-full rounded-lg bg-brand-600 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Simpan Obat
          </button>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Harga Jual</th>
              <th className="px-4 py-3">Kedaluwarsa</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {produkList.map((p) => (
              <tr key={p._id} className="border-t border-gray-100">
                <td className="px-4 py-3">{p.nama}</td>
                <td className={`px-4 py-3 ${p.stok <= p.minStok ? 'font-medium text-amber-600' : ''}`}>{p.stok}</td>
                <td className="px-4 py-3">{formatRupiah(p.hargaJual)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {p.expiredAt ? new Date(p.expiredAt).toLocaleDateString('id-ID') : '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleTambahStok(p)} className="text-xs text-brand-600 hover:underline">
                    + Stok
                  </button>
                </td>
              </tr>
            ))}
            {produkList.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Belum ada obat. Klik "+ Tambah Obat" untuk mulai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
