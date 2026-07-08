import { useEffect, useState } from 'react'
import { listProduk } from '../db/produkRepo'
import { buatTransaksi } from '../db/transaksiRepo'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    n || 0
  )
}

export default function POS({ session }) {
  const [produkList, setProdukList] = useState([])
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([]) // { produkId, namaProduk, qty, hargaSatuan, stokTersedia }
  const [notice, setNotice] = useState('')

  useEffect(() => {
    listProduk().then(setProdukList)
  }, [])

  const filtered = produkList.filter((p) => p.nama.toLowerCase().includes(query.toLowerCase()))

  function addToCart(produk) {
    setCart((prev) => {
      const existing = prev.find((it) => it.produkId === produk._id)
      if (existing) {
        return prev.map((it) =>
          it.produkId === produk._id ? { ...it, qty: Math.min(it.qty + 1, produk.stok) } : it
        )
      }
      if (produk.stok <= 0) {
        setNotice(`${produk.nama} stok habis`)
        return prev
      }
      return [
        ...prev,
        { produkId: produk._id, namaProduk: produk.nama, qty: 1, hargaSatuan: produk.hargaJual, stokTersedia: produk.stok }
      ]
    })
  }

  function updateQty(produkId, qty) {
    setCart((prev) =>
      prev
        .map((it) => (it.produkId === produkId ? { ...it, qty: Math.max(1, Math.min(qty, it.stokTersedia)) } : it))
        .filter((it) => it.qty > 0)
    )
  }

  function removeFromCart(produkId) {
    setCart((prev) => prev.filter((it) => it.produkId !== produkId))
  }

  const total = cart.reduce((s, it) => s + it.qty * it.hargaSatuan, 0)

  async function handleBayar() {
    if (cart.length === 0) return
    try {
      await buatTransaksi({
        items: cart,
        kasirId: session?.userId
      })
      setCart([])
      setNotice('Transaksi berhasil disimpan.')
      setProdukList(await listProduk())
    } catch (err) {
      setNotice(`Gagal: ${err.message}`)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Daftar produk */}
      <div className="lg:col-span-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari nama obat..."
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-brand-500"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((p) => (
            <button
              key={p._id}
              onClick={() => addToCart(p)}
              disabled={p.stok <= 0}
              className="rounded-xl border border-gray-200 bg-white p-3 text-left hover:border-brand-400 disabled:opacity-40"
            >
              <p className="text-sm font-medium">{p.nama}</p>
              <p className="text-xs text-gray-400">Stok: {p.stok}</p>
              <p className="mt-1 text-sm font-semibold text-brand-700">{formatRupiah(p.hargaJual)}</p>
            </button>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-sm text-gray-400">Produk tidak ditemukan.</p>}
        </div>
      </div>

      {/* Keranjang */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 font-medium">Keranjang</h2>
        {cart.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada item.</p>
        ) : (
          <ul className="mb-4 space-y-3">
            {cart.map((it) => (
              <li key={it.produkId} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{it.namaProduk}</p>
                  <p className="text-xs text-gray-400">{formatRupiah(it.hargaSatuan)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(it.produkId, it.qty - 1)}
                    className="h-6 w-6 rounded-full border border-gray-300 text-xs"
                  >
                    −
                  </button>
                  <span className="w-5 text-center">{it.qty}</span>
                  <button
                    onClick={() => updateQty(it.produkId, it.qty + 1)}
                    className="h-6 w-6 rounded-full border border-gray-300 text-xs"
                  >
                    +
                  </button>
                  <button onClick={() => removeFromCart(it.produkId)} className="ml-1 text-gray-300 hover:text-red-500">
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mb-4 flex justify-between border-t border-gray-100 pt-3 font-semibold">
          <span>Total</span>
          <span>{formatRupiah(total)}</span>
        </div>

        {notice && <p className="mb-3 text-center text-xs text-gray-500">{notice}</p>}

        <button
          onClick={handleBayar}
          disabled={cart.length === 0}
          className="w-full rounded-lg bg-brand-600 py-3 font-medium text-white hover:bg-brand-700 disabled:opacity-40"
        >
          Bayar
        </button>
      </div>
    </div>
  )
}
