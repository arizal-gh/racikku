import { useEffect, useState } from 'react'
import { db } from '../db/db'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    n || 0
  )
}

export default function Laporan() {
  const [transaksi, setTransaksi] = useState([])

  useEffect(() => {
    async function load() {
      const all = await db.transaksi.filter((t) => !t._deleted).toArray()
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setTransaksi(all)
    }
    load()
  }, [])

  const totalOmzet = transaksi.reduce((s, t) => s + t.total, 0)

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Laporan Penjualan</h1>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-500">Total omzet (semua waktu)</p>
        <p className="text-2xl font-semibold text-brand-700">{formatRupiah(totalOmzet)}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr>
              <th className="px-4 py-3">No. Invoice</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((t) => (
              <tr key={t._id} className="border-t border-gray-100">
                <td className="px-4 py-3">{t.nomor}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 capitalize">{t.metodeBayar}</td>
                <td className="px-4 py-3 text-right font-medium">{formatRupiah(t.total)}</td>
              </tr>
            ))}
            {transaksi.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  Belum ada transaksi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
