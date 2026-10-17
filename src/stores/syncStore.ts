import { create } from 'zustand'
import { db } from '@/lib/db'
import type { SyncStatus } from '@/lib/types'

interface SyncState {
  status: SyncStatus
  pendingCount: number
  setStatus: (status: SyncStatus) => void
  refreshPendingCount: () => Promise<void>
  /** Mock helper — later features will replace this with real sync. */
  mockSetSyncing: (syncing: boolean) => void
}

export const useSyncStore = create<SyncState>((set) => ({
  status: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'idle',
  pendingCount: 0,

  setStatus: (status) => set({ status }),

  refreshPendingCount: async () => {
    const pendingCount = await db.syncQueue.count()
    set({ pendingCount })
  },

  mockSetSyncing: (syncing) =>
    set((state) => ({
      status: syncing ? 'syncing' : state.status === 'offline' ? 'offline' : 'idle',
    })),
}))

export function bindOnlineListeners(): () => void {
  const onOnline = () => useSyncStore.getState().setStatus('idle')
  const onOffline = () => useSyncStore.getState().setStatus('offline')

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}
