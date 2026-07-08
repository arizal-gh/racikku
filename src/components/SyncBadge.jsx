import { useSyncStatus } from '../hooks/useSyncStatus'

export default function SyncBadge() {
  const { online, status, label } = useSyncStatus()

  const dotColor = !online
    ? 'bg-amber-500'
    : status === 'syncing'
    ? 'bg-blue-500 animate-pulse'
    : 'bg-brand-500'

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} aria-hidden="true" />
      {label}
    </div>
  )
}
