import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithPin } from '../db/userRepo'

export default function Login() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await loginWithPin(pin)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-xl font-bold text-white">
            R
          </div>
          <h1 className="text-lg font-semibold">Masuk ke Racikku</h1>
          <p className="text-sm text-gray-500">Masukkan PIN kamu</p>
        </div>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          className="mb-3 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-brand-500"
          autoFocus
        />

        {error && <p className="mb-3 text-center text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-brand-600 py-3 font-medium text-white hover:bg-brand-700"
        >
          Masuk
        </button>

        <p className="mt-4 text-center text-xs text-gray-400">
          PIN default owner pertama kali: 1234 (segera ganti di Pengaturan)
        </p>
      </form>
    </div>
  )
}
