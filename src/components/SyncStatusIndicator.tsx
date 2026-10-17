import { useSyncStore } from '@/stores/syncStore'
import { cn } from '@/lib/utils'
import type { SyncStatus } from '@/lib/types'

const statusLabel: Record<SyncStatus, string> = {
  idle: 'Synced',
  syncing: 'Syncing…',
  error: 'Sync error',
  offline: 'Offline',
}

const statusDot: Record<SyncStatus, string> = {
  idle: 'bg-emerald-500',
  syncing: 'bg-amber-500 animate-pulse',
  error: 'bg-destructive',
  offline: 'bg-muted-foreground',
}

export function SyncStatusIndicator() {
  const status = useSyncStore((s) => s.status)
  const pendingCount = useSyncStore((s) => s.pendingCount)

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground shadow-sm"
    >
      <span
        className={cn('size-2 shrink-0 rounded-full', statusDot[status])}
        aria-hidden
      />
      <span className="font-medium">{statusLabel[status]}</span>
      <span className="text-muted-foreground">
        {pendingCount === 0
          ? 'No pending'
          : `${pendingCount} pending`}
      </span>
    </div>
  )
}
