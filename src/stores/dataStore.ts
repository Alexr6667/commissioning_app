import { create } from 'zustand'
import { db } from '@/lib/db'
import type {
  ChecklistResponse,
  Customer,
  Kart,
  KartModel,
  SyncOperation,
  SyncQueueItem,
  Task,
  TaskItem,
} from '@/lib/types'
import { useSyncStore } from '@/stores/syncStore'

type NewCustomer = Omit<Customer, 'id'>
type NewKartModel = Omit<KartModel, 'id'>
type NewKart = Omit<Kart, 'id'>
type NewTask = Omit<Task, 'id'>
type NewTaskItem = Omit<TaskItem, 'id'>
type NewChecklistResponse = Omit<ChecklistResponse, 'id'>

interface DataState {
  customers: Customer[]
  kartModels: KartModel[]
  karts: Kart[]
  tasks: Task[]
  taskItems: TaskItem[]
  checklistResponses: ChecklistResponse[]
  ready: boolean
  hydrate: () => Promise<void>
  addCustomer: (data: NewCustomer) => Promise<number>
  updateCustomer: (id: number, changes: Partial<NewCustomer>) => Promise<void>
  deleteCustomer: (id: number) => Promise<void>
  addKartModel: (data: NewKartModel) => Promise<number>
  updateKartModel: (id: number, changes: Partial<NewKartModel>) => Promise<void>
  deleteKartModel: (id: number) => Promise<void>
  addKart: (data: NewKart) => Promise<number>
  updateKart: (id: number, changes: Partial<NewKart>) => Promise<void>
  deleteKart: (id: number) => Promise<void>
  addTask: (data: NewTask) => Promise<number>
  updateTask: (id: number, changes: Partial<NewTask>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  addTaskItem: (data: NewTaskItem) => Promise<number>
  updateTaskItem: (id: number, changes: Partial<NewTaskItem>) => Promise<void>
  deleteTaskItem: (id: number) => Promise<void>
  addChecklistResponse: (data: NewChecklistResponse) => Promise<number>
  updateChecklistResponse: (
    id: number,
    changes: Partial<NewChecklistResponse>,
  ) => Promise<void>
  deleteChecklistResponse: (id: number) => Promise<void>
}

async function enqueue(
  entity: SyncQueueItem['entity'],
  entityId: number | string,
  operation: SyncOperation,
  payload?: unknown,
): Promise<void> {
  await db.syncQueue.add({
    entity,
    entityId,
    operation,
    payload,
    createdAt: new Date().toISOString(),
  })
  await useSyncStore.getState().refreshPendingCount()
}

function requireId(id: number | undefined): number {
  if (id === undefined) {
    throw new Error('Dexie did not return an id for the new record')
  }
  return id
}

export const useDataStore = create<DataState>((set, get) => ({
  customers: [],
  kartModels: [],
  karts: [],
  tasks: [],
  taskItems: [],
  checklistResponses: [],
  ready: false,

  hydrate: async () => {
    const [customers, kartModels, karts, tasks, taskItems, checklistResponses] =
      await Promise.all([
        db.customers.toArray(),
        db.kartModels.toArray(),
        db.karts.toArray(),
        db.tasks.toArray(),
        db.taskItems.toArray(),
        db.checklistResponses.toArray(),
      ])
    set({
      customers,
      kartModels,
      karts,
      tasks,
      taskItems,
      checklistResponses,
      ready: true,
    })
    await useSyncStore.getState().refreshPendingCount()
  },

  addCustomer: async (data) => {
    const id = requireId(await db.customers.add(data))
    await enqueue('customers', id, 'create', data)
    await get().hydrate()
    return id
  },

  updateCustomer: async (id, changes) => {
    await db.customers.update(id, changes)
    await enqueue('customers', id, 'update', changes)
    await get().hydrate()
  },

  deleteCustomer: async (id) => {
    await db.customers.delete(id)
    await enqueue('customers', id, 'delete')
    await get().hydrate()
  },

  addKartModel: async (data) => {
    const id = requireId(await db.kartModels.add(data))
    await enqueue('kartModels', id, 'create', data)
    await get().hydrate()
    return id
  },

  updateKartModel: async (id, changes) => {
    await db.kartModels.update(id, changes)
    await enqueue('kartModels', id, 'update', changes)
    await get().hydrate()
  },

  deleteKartModel: async (id) => {
    await db.kartModels.delete(id)
    await enqueue('kartModels', id, 'delete')
    await get().hydrate()
  },

  addKart: async (data) => {
    const id = requireId(await db.karts.add(data))
    await enqueue('karts', id, 'create', data)
    await get().hydrate()
    return id
  },

  updateKart: async (id, changes) => {
    await db.karts.update(id, changes)
    await enqueue('karts', id, 'update', changes)
    await get().hydrate()
  },

  deleteKart: async (id) => {
    await db.karts.delete(id)
    await enqueue('karts', id, 'delete')
    await get().hydrate()
  },

  addTask: async (data) => {
    const id = requireId(await db.tasks.add(data))
    await enqueue('tasks', id, 'create', data)
    await get().hydrate()
    return id
  },

  updateTask: async (id, changes) => {
    await db.tasks.update(id, changes)
    await enqueue('tasks', id, 'update', changes)
    await get().hydrate()
  },

  deleteTask: async (id) => {
    await db.tasks.delete(id)
    await enqueue('tasks', id, 'delete')
    await get().hydrate()
  },

  addTaskItem: async (data) => {
    const id = requireId(await db.taskItems.add(data))
    await enqueue('taskItems', id, 'create', data)
    await get().hydrate()
    return id
  },

  updateTaskItem: async (id, changes) => {
    await db.taskItems.update(id, changes)
    await enqueue('taskItems', id, 'update', changes)
    await get().hydrate()
  },

  deleteTaskItem: async (id) => {
    await db.taskItems.delete(id)
    await enqueue('taskItems', id, 'delete')
    await get().hydrate()
  },

  addChecklistResponse: async (data) => {
    const id = requireId(await db.checklistResponses.add(data))
    await enqueue('checklistResponses', id, 'create', data)
    await get().hydrate()
    return id
  },

  updateChecklistResponse: async (id, changes) => {
    await db.checklistResponses.update(id, changes)
    await enqueue('checklistResponses', id, 'update', changes)
    await get().hydrate()
  },

  deleteChecklistResponse: async (id) => {
    await db.checklistResponses.delete(id)
    await enqueue('checklistResponses', id, 'delete')
    await get().hydrate()
  },
}))
