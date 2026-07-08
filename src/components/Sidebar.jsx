import { NavLink } from 'react-router-dom'
import { logout } from '../db/userRepo'
import { useNavigate } from 'react-router-dom'

const menu = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/pos', label: 'Penjualan (POS)', icon: '🛒' },
  { to: '/stok', label: 'Obat & Stok', icon: '💊' },
  { to: '/laporan', label: 'Laporan', icon: '📋' }
]

export default function Sidebar({ session }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">
          R
        </div>
        <div>
          <p className="font-semibold leading-tight">Raciku</p>
          <p className="text-[11px] text-gray-400 leading-tight">Apotek jadi mudah</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-100 p-3">
        <div className="mb-2 rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-sm font-medium">{session?.nama}</p>
          <p className="text-xs capitalize text-gray-400">{session?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
        >
          Keluar
        </button>
      </div>
    </aside>
  )
}
