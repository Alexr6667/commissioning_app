import * as XLSX from 'xlsx'
import type { Customer, Kart, KartModel } from '@/lib/types'

export interface ParsedCustomerRow {
  rowNumber: number
  title: string
  trackName?: string
  contact?: string
  siteAddress?: string
  notes?: string
  preferredControllerFirmware?: string
  preferredControllerCpfFile?: string
  externalId?: string
}

export interface ParsedKartRow {
  rowNumber: number
  chassisNumber: string
  modelTitle?: string
  customerTitle?: string
  status?: string
  notes?: string
  latestKnownFirmware?: string
}

export interface RowIssue {
  kind: 'customer' | 'kart'
  rowNumber: number
  message: string
}

export interface ImportPreview {
  customers: ParsedCustomerRow[]
  karts: ParsedKartRow[]
  errors: RowIssue[]
  validCustomerCount: number
  validKartCount: number
}

export interface ImportResult {
  createdCustomers: number
  createdKarts: number
  errors: RowIssue[]
}

type RawRow = Record<string, unknown>

function cellString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function normalizeHeader(header: unknown): string {
  return cellString(header).replace(/\s+/g, '').toLowerCase()
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase()
}

function getField(row: RawRow, ...aliases: string[]): string {
  const map = new Map<string, unknown>()
  for (const [key, value] of Object.entries(row)) {
    map.set(normalizeHeader(key), value)
  }
  for (const alias of aliases) {
    const found = map.get(normalizeHeader(alias))
    if (found !== undefined) return cellString(found)
  }
  return ''
}

function sheetToRows(sheet: XLSX.WorkSheet): RawRow[] {
  return XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' })
}

function classifySheetName(name: string): 'customers' | 'karts' | 'unknown' {
  const key = normalizeKey(name).replace(/\s+/g, '')
  if (key === 'customers' || key === 'customer') return 'customers'
  if (key === 'karts' || key === 'kart') return 'karts'
  return 'unknown'
}

function rowLooksLikeKart(row: RawRow): boolean {
  return Boolean(getField(row, 'ChassisNumber', 'Chassis Number'))
}

function rowLooksLikeCustomer(row: RawRow): boolean {
  const title = getField(row, 'Title')
  const type = normalizeKey(getField(row, 'Type', 'Entity', 'RecordType'))
  if (type === 'kart' || type === 'karts') return false
  if (type === 'customer' || type === 'customers') return true
  return Boolean(title) && !rowLooksLikeKart(row)
}

function parseCustomerRow(row: RawRow, rowNumber: number): ParsedCustomerRow {
  return {
    rowNumber,
    title: getField(row, 'Title'),
    trackName: getField(row, 'TrackName', 'Track Name') || undefined,
    contact: getField(row, 'Contact') || undefined,
    siteAddress: getField(row, 'SiteAddress', 'Site Address') || undefined,
    notes: getField(row, 'Notes') || undefined,
    preferredControllerFirmware:
      getField(
        row,
        'PreferredControllerFirmware',
        'Preferred Controller Firmware',
      ) || undefined,
    preferredControllerCpfFile:
      getField(
        row,
        'PreferredControllerCpfFile',
        'Preferred Controller Cpf File',
      ) || undefined,
    externalId: getField(row, 'ExternalId', 'External Id') || undefined,
  }
}

function parseKartRow(row: RawRow, rowNumber: number): ParsedKartRow {
  return {
    rowNumber,
    chassisNumber: getField(row, 'ChassisNumber', 'Chassis Number'),
    modelTitle: getField(row, 'ModelTitle', 'Model Title') || undefined,
    customerTitle: getField(row, 'CustomerTitle', 'Customer Title') || undefined,
    status: getField(row, 'Status') || undefined,
    notes: getField(row, 'Notes') || undefined,
    latestKnownFirmware:
      getField(row, 'LatestKnownFirmware', 'Latest Known Firmware') ||
      undefined,
  }
}

function collectFromWorkbook(workbook: XLSX.WorkBook): {
  customers: ParsedCustomerRow[]
  karts: ParsedKartRow[]
} {
  const customers: ParsedCustomerRow[] = []
  const karts: ParsedKartRow[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue
    const rows = sheetToRows(sheet)
    const kind = classifySheetName(sheetName)

    rows.forEach((row, index) => {
      const rowNumber = index + 2 // header is row 1
      const type = normalizeKey(getField(row, 'Type', 'Entity', 'RecordType'))

      if (kind === 'customers' || type === 'customer' || type === 'customers') {
        customers.push(parseCustomerRow(row, rowNumber))
        return
      }
      if (kind === 'karts' || type === 'kart' || type === 'karts') {
        karts.push(parseKartRow(row, rowNumber))
        return
      }

      if (rowLooksLikeKart(row)) {
        karts.push(parseKartRow(row, rowNumber))
      } else if (rowLooksLikeCustomer(row)) {
        customers.push(parseCustomerRow(row, rowNumber))
      }
    })
  }

  return { customers, karts }
}

function findByTitle<T extends { title: string }>(
  items: T[],
  title: string,
): T | undefined {
  const key = normalizeKey(title)
  return items.find((item) => normalizeKey(item.title) === key)
}

export function buildImportPreview(
  buffer: ArrayBuffer,
  existing: {
    customers: Customer[]
    kartModels: KartModel[]
    karts: Kart[]
  },
): ImportPreview {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const { customers, karts } = collectFromWorkbook(workbook)
  const errors: RowIssue[] = []

  const validCustomers: ParsedCustomerRow[] = []
  const seenCustomerTitles = new Set(
    existing.customers.map((c) => normalizeKey(c.title)),
  )

  for (const row of customers) {
    if (!row.title) {
      errors.push({
        kind: 'customer',
        rowNumber: row.rowNumber,
        message: 'Title is required.',
      })
      continue
    }
    validCustomers.push(row)
    seenCustomerTitles.add(normalizeKey(row.title))
  }

  const existingChassis = new Set(
    existing.karts.map((k) => normalizeKey(k.chassisNumber)),
  )
  const previewChassis = new Set<string>()
  const validKarts: ParsedKartRow[] = []

  for (const row of karts) {
    const issues: string[] = []

    if (!row.chassisNumber) {
      issues.push('ChassisNumber is required.')
    } else {
      const chassisKey = normalizeKey(row.chassisNumber)
      if (existingChassis.has(chassisKey)) {
        issues.push(`Duplicate chassis number "${row.chassisNumber}" already exists.`)
      } else if (previewChassis.has(chassisKey)) {
        issues.push(
          `Duplicate chassis number "${row.chassisNumber}" appears more than once in the file.`,
        )
      }
    }

    if (row.modelTitle) {
      if (!findByTitle(existing.kartModels, row.modelTitle)) {
        issues.push(`Unknown model "${row.modelTitle}".`)
      }
    }

    if (row.customerTitle) {
      const known =
        findByTitle(existing.customers, row.customerTitle) ||
        seenCustomerTitles.has(normalizeKey(row.customerTitle))
      if (!known) {
        issues.push(`Unknown customer "${row.customerTitle}".`)
      }
    }

    if (issues.length > 0) {
      for (const message of issues) {
        errors.push({ kind: 'kart', rowNumber: row.rowNumber, message })
      }
      continue
    }

    previewChassis.add(normalizeKey(row.chassisNumber))
    validKarts.push(row)
  }

  return {
    customers: validCustomers,
    karts: validKarts,
    errors,
    validCustomerCount: validCustomers.length,
    validKartCount: validKarts.length,
  }
}

export async function applyImport(
  preview: ImportPreview,
  deps: {
    customers: Customer[]
    kartModels: KartModel[]
    karts: Kart[]
    addCustomer: (data: Omit<Customer, 'id'>) => Promise<number>
    addKart: (data: Omit<Kart, 'id'>) => Promise<number>
  },
): Promise<ImportResult> {
  const errors: RowIssue[] = [...preview.errors]
  let createdCustomers = 0
  let createdKarts = 0

  const customerIdByTitle = new Map<string, number>()
  for (const customer of deps.customers) {
    if (customer.id !== undefined) {
      customerIdByTitle.set(normalizeKey(customer.title), customer.id)
    }
  }

  for (const row of preview.customers) {
    try {
      const id = await deps.addCustomer({
        title: row.title,
        trackName: row.trackName,
        contact: row.contact,
        siteAddress: row.siteAddress,
        notes: row.notes,
        preferredControllerFirmware: row.preferredControllerFirmware,
        preferredControllerCpfFile: row.preferredControllerCpfFile,
        externalId: row.externalId,
      })
      customerIdByTitle.set(normalizeKey(row.title), id)
      createdCustomers += 1
    } catch (err) {
      errors.push({
        kind: 'customer',
        rowNumber: row.rowNumber,
        message:
          err instanceof Error ? err.message : 'Could not create customer.',
      })
    }
  }

  // Re-check chassis against live store in case of race; still create-only.
  const liveChassis = new Set(
    deps.karts.map((k) => normalizeKey(k.chassisNumber)),
  )

  for (const row of preview.karts) {
    const chassisKey = normalizeKey(row.chassisNumber)
    if (liveChassis.has(chassisKey)) {
      errors.push({
        kind: 'kart',
        rowNumber: row.rowNumber,
        message: `Duplicate chassis number "${row.chassisNumber}" already exists.`,
      })
      continue
    }

    const model = row.modelTitle
      ? findByTitle(deps.kartModels, row.modelTitle)
      : undefined
    if (row.modelTitle && !model?.id) {
      errors.push({
        kind: 'kart',
        rowNumber: row.rowNumber,
        message: `Unknown model "${row.modelTitle}".`,
      })
      continue
    }

    let customerId: number | undefined
    if (row.customerTitle) {
      customerId = customerIdByTitle.get(normalizeKey(row.customerTitle))
      if (customerId === undefined) {
        errors.push({
          kind: 'kart',
          rowNumber: row.rowNumber,
          message: `Unknown customer "${row.customerTitle}".`,
        })
        continue
      }
    }

    try {
      await deps.addKart({
        chassisNumber: row.chassisNumber,
        modelId: model?.id,
        customerId,
        status: row.status || 'New',
        notes: row.notes,
        latestKnownFirmware: row.latestKnownFirmware,
      })
      liveChassis.add(chassisKey)
      createdKarts += 1
    } catch (err) {
      errors.push({
        kind: 'kart',
        rowNumber: row.rowNumber,
        message: err instanceof Error ? err.message : 'Could not create kart.',
      })
    }
  }

  return { createdCustomers, createdKarts, errors }
}
