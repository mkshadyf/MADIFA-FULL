import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QueueItem {
  id: string
  title: string
  status: 'queued' | 'downloading' | 'completed' | 'error'
  progress: number
  error: string | undefined
  retryCount: number
  lastRetry: Date | undefined
  priority: number
  addedAt: number
}

interface QueueStore {
  queue: Map<string, QueueItem>
  addToQueue: (
    contentId: string,
    title: string,
    priority?: number
  ) => Promise<void>
  removeFromQueue: (contentId: string) => Promise<void>
  retryDownload: (contentId: string) => Promise<void>
  getErroredItems: () => Array<
    Pick<QueueItem, 'id' | 'title' | 'error' | 'retryCount' | 'lastRetry'>
  >
  clearQueue: () => void
}

export const useQueueStore = create<QueueStore>()(
  persist(
    (set, get) => ({
      queue: new Map(),

      addToQueue: async (contentId, title, priority = 0) => {
        const { queue } = get()
        queue.set(contentId, {
          id: contentId,
          title,
          status: 'queued',
          progress: 0,
          error: undefined,
          retryCount: 0,
          lastRetry: undefined,
          priority,
          addedAt: Date.now(),
        })
        set({ queue: new Map(queue) })
      },

      removeFromQueue: async contentId => {
        const { queue } = get()
        queue.delete(contentId)
        set({ queue: new Map(queue) })
      },

      retryDownload: async contentId => {
        const { queue } = get()
        const item = queue.get(contentId)
        if (item) {
          queue.set(contentId, {
            ...item,
            status: 'queued',
            progress: 0,
            error: undefined,
            retryCount: item.retryCount + 1,
            lastRetry: new Date(),
          })
          set({ queue: new Map(queue) })
        }
      },

      getErroredItems: () => {
        const { queue } = get()
        return Array.from(queue.values())
          .filter(item => item.status === 'error')
          .map(({ id, title, error, retryCount, lastRetry }) => ({
            id,
            title,
            error: error || 'Unknown error',
            retryCount,
            lastRetry,
          }))
      },

      clearQueue: () => {
        set({ queue: new Map() })
      },
    }),
    {
      name: 'download-queue',
      partialize: state => ({
        queue: Array.from(state.queue.entries()),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        queue: new Map(persistedState.queue || []),
      }),
    }
  )
)
