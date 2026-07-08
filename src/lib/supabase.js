import { createClient } from '@supabase/supabase-js'

// Isi nilai ini di file .env (lihat .env.example).
// Kalau kosong, app tetap jalan penuh secara offline - sync akan
// otomatis nyala begitu kredensial ini diisi.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const isCloudConfigured = Boolean(supabase)
