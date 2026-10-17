import Dexie, { type EntityTable } from 'dexie'
import type {
  ChecklistResponse,
  Customer,
  Kart,
  KartModel,
  SyncQueueItem,
  Task,
  TaskItem,
} from '@/lib/types'

class CommissioningDB extends Dexie {
  customers!: EntityTable<Customer, 'id'>
  kartModels!: EntityTable<KartModel, 'id'>
  karts!: EntityTable<Kart, 'id'>
  tasks!: EntityTable<Task, 'id'>
  taskItems!: EntityTable<TaskItem, 'id'>
  checklistResponses!: EntityTable<ChecklistResponse, 'id'>
  syncQueue!: EntityTable<SyncQueueItem, 'id'>

  constructor() {
    super('CommissioningDB')
    this.version(1).stores({
      customers: '++id, title, externalId',
      kartModels: '++id, title, active',
      karts: '++id, chassisNumber, customerId, modelId',
      tasks: '++id, title, customerId, status',
      taskItems: '++id, taskId, kartId, status',
      checklistResponses: '++id, taskItemId, fieldKey',
      syncQueue: '++id, entity, createdAt',
    })
  }
}

export const db = new CommissioningDB()

/** Seed 1–2 sample records on first load so the UI can be tested. */
export async function seedIfEmpty(): Promise<void> {
  const customerCount = await db.customers.count()
  if (customerCount > 0) return

  await db.customers.add({
    title: 'Demo Motorsport Track',
    trackName: 'Silver Circuit',
    contact: 'Alex Demo',
    notes: 'Sample customer seeded for offline foundation.',
  })

  await db.kartModels.add({
    title: 'Junior Kart',
    description: 'Sample kart model with a basic checklist template.',
    active: true,
    checklistTemplate: [
      { key: 'chassis_ok', label: 'Chassis OK', type: 'checkbox', required: true },
      { key: 'firmware', label: 'Firmware version', type: 'text', required: true },
    ],
  })
}
