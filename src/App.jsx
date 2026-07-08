import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import SyncBadge from './components/SyncBadge'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import POS from './pages/POS'
import Stok from './pages/Stok'
import Laporan from './pages/Laporan'
import { getCurrentSession, seedOwnerIfEmpty } from './db/userRepo'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = belum dicek, null = belum login
  const [query, setQuery] = useState('')

  useEffect(() => {
    async function init() {
      await seedOwnerIfEmpty()
      const s = await getCurrentSession()
      setSession(s || null)
    }
    init()
  }, [])

  if (session === undefined) {
    return <div className="flex h-screen items-center justify-center text-gray-400">Memuat...</div>
  }

  if (!session) {
    return <Login />
  }

  return (
    <div className="flex h-screen">
      <Sidebar session={session} />
      <div className="flex-1 overflow-y-auto">
        <header className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari obat, transaksi, atau menu..."
            className="w-80 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
          />
          <SyncBadge />
        </header>
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard session={session} />} />
            <Route path="/pos" element={<POS session={session} />} />
            <Route path="/stok" element={<Stok />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
