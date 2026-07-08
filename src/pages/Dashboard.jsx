import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import { ringkasanHariIni } from '../db/transaksiRepo'
import { listStokMenipis, listAkanExpired } from '../db/produkRepo'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    n || 0
  )
}

export default function Dashboard({ session }) {
  const [ringkasan, setRingkasan] = useState({ omzet: 0, jumlahTransaksi: 0, produkTerjual: 0 })
  const [stokMenipis, setStokMenipis] = useState([])
  const [akanExpired, setAkanExpired] = useState([])

  async function load() {
    setRingkasan(await ringkasanHariIni())
    setStokMenipis(await listStokMenipis())
    setAkanExpired(await listAkanExpired(30))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Selamat datang, {session?.nama} 👋</h1>
        <p className="text-sm text-gray-500">Ringkasan apotek kamu hari ini.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Penjualan Hari Ini" value={formatRupiah(ringkasan.omzet)} icon="💰" tone="brand" />
        <StatCard label="Transaksi" value={ringkasan.jumlahTransaksi} icon="🧾" tone="blue" />
        <StatCard label="Produk Terjual" value={ringkasan.produkTerjual} icon="📦" tone="amber" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-medium">Stok Menipis</h2>
          {stokMenipis.length === 0 ? (
            <p className="text-sm text-gray-400">Semua stok aman.</p>
          ) : (
            <ul className="space-y-2">
              {stokMenipis.map((p) => (
                <li key={p._id} className="flex justify-between text-sm">
                  <span>{p.nama}</span>
                  <span className="font-medium text-amber-600">Sisa {p.stok}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-medium">Mendekati Kedaluwarsa (30 hari)</h2>
          {akanExpired.length === 0 ? (
            <p className="text-sm text-gray-400">Tidak ada obat yang mendekati kedaluwarsa.</p>
          ) : (
            <ul className="space-y-2">
              {akanExpired.map((p) => (
                <li key={p._id} className="flex justify-between text-sm">
                  <span>{p.nama}</span>
                  <span className="font-medium text-red-600">
                    {new Date(p.expiredAt).toLocaleDateString('id-ID')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
