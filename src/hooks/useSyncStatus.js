import { useEffect, useState } from 'react'
import { onSyncStatusChange } from '../lib/sync'
import { isCloudConfigured } from '../lib/supabase'

/**
 * Dipakai di UI (misal badge kecil di header) untuk menunjukkan
 * apakah data sedang tersimpan lokal saja atau sudah tersinkron ke cloud.
 */
export function useSyncStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  const [status, setStatus] = useState('idle') // idle | syncing | error | offline

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    const unsub = onSyncStatusChange(setStatus)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      unsub()
    }
  }, [])

  return {
    online,
    status,
    cloudConfigured: isCloudConfigured,
    label: !isCloudConfigured
      ? 'Mode lokal (belum terhubung cloud)'
      : online
      ? status === 'syncing'
        ? 'Menyinkronkan...'
        : 'Tersinkron'
      : 'Offline - data aman di perangkat ini'
  }
}
