export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

export type SyncOperation = 'create' | 'update' | 'delete'

export interface Customer {
  id?: number
  title: string
  trackName?: string
  contact?: string
  siteAddress?: string
  notes?: string
  isLocked?: boolean
  preferredControllerFirmware?: string
  preferredControllerCpfFile?: string
  externalId?: string
}

export type ChecklistFieldType =
  | 'text'
  | 'checkbox'
  | 'number'
  | 'select'
  | 'textarea'

export interface ChecklistField {
  key: string
  label: string
  type: ChecklistFieldType
  required: boolean
  options?: string[]
  section?: string
}

export interface KartModel {
  id?: number
  title: string
  description?: string
  checklistTemplate?: ChecklistField[]
  active?: boolean
  currentRecommendedFirmware?: string
}

export interface Kart {
  id?: number
  chassisNumber: string
  modelId?: number
  customerId?: number
  status?: string
  notes?: string
  latestKnownFirmware?: string
}

export type TaskType = 'EndOfLine' | 'Onsite' | 'CustomerVisit'

export interface Task {
  id?: number
  title: string
  type?: TaskType
  customerId?: number
  assignee?: string
  status?: string
  dates?: string
  overallNotes?: string
  targetFirmwareOverrides?: string
}

export interface TaskItem {
  id?: number
  taskId: number
  kartId?: number
  status?: string
  notes?: string
  /** Snapshot of KartModel.checklistTemplate at TaskItem creation. */
  checklistTemplateSnapshot?: ChecklistField[]
}

export interface ChecklistResponse {
  id?: number
  taskItemId: number
  fieldKey: string
  value?: string
  technician?: string
  timestamp?: string
  attachment?: string
}

export interface SyncQueueItem {
  id?: number
  entity: string
  entityId: number | string
  operation: SyncOperation
  payload?: unknown
  createdAt: string
}
