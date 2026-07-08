import { db, newId, markDirty } from './db'

/**
 * Login sederhana berbasis PIN, disimpan & divalidasi 100% lokal -
 * supaya kasir tetap bisa login walau internet mati. Autentikasi
 * "resmi" (email/password lewat Supabase Auth) bisa ditambah di
 * Stage berikutnya untuk owner yang mau akses dari luar apotek.
 */

export async function listUsers() {
  return db.users.filter((u) => !u._deleted).toArray()
}

export async function createUser({ nama, role, pin }) {
  const record = markDirty({ _id: newId(), nama, role, pin })
  await db.users.put(record)
  return record
}

export async function loginWithPin(pin) {
  const users = await listUsers()
  const user = users.find((u) => u.pin === pin)
  if (!user) throw new Error('PIN salah')
  await db.session.put({ _id: 'current', userId: user._id, nama: user.nama, role: user.role })
  return user
}

export async function getCurrentSession() {
  return db.session.get('current')
}

export async function logout() {
  await db.session.delete('current')
}

/** Dipakai saat pertama kali app dibuka & belum ada user sama sekali. */
export async function seedOwnerIfEmpty() {
  const users = await listUsers()
  if (users.length === 0) {
    await createUser({ nama: 'Owner', role: 'owner', pin: '1234' })
  }
}
