import type { ChecklistField, ChecklistFieldType } from '@/lib/types'

export const FIELD_TYPE_OPTIONS: { value: ChecklistFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'textarea', label: 'Textarea' },
]

const FIELD_TYPES = new Set<string>(FIELD_TYPE_OPTIONS.map((option) => option.value))

export interface FieldDraft {
  draftId: string
  key: string
  label: string
  type: ChecklistFieldType
  required: boolean
  optionsText: string
  section: string
}

export function isChecklistFieldType(value: string): value is ChecklistFieldType {
  return FIELD_TYPES.has(value)
}

export function parseOptions(text: string): string[] {
  return text
    .split(',')
    .map((option) => option.trim())
    .filter((option) => option.length > 0)
}

export function toDrafts(fields: ChecklistField[] | undefined): FieldDraft[] {
  return (fields ?? []).map((field) => ({
    draftId: crypto.randomUUID(),
    key: field.key,
    label: field.label,
    type: isChecklistFieldType(field.type) ? field.type : 'text',
    required: field.required,
    optionsText: field.options?.join(', ') ?? '',
    section: field.section ?? '',
  }))
}

export function createEmptyField(existing: FieldDraft[]): FieldDraft {
  const keys = new Set(existing.map((field) => field.key))
  let n = existing.length + 1
  let key = `field_${n}`
  while (keys.has(key)) {
    n += 1
    key = `field_${n}`
  }
  return {
    draftId: crypto.randomUUID(),
    key,
    label: '',
    type: 'text',
    required: false,
    optionsText: '',
    section: '',
  }
}

export function moveField(
  fields: FieldDraft[],
  index: number,
  direction: -1 | 1,
): FieldDraft[] {
  const target = index + direction
  if (target < 0 || target >= fields.length) return fields
  const next = fields.slice()
  const [item] = next.splice(index, 1)
  if (!item) return fields
  next.splice(target, 0, item)
  return next
}

export function toChecklistFields(fields: FieldDraft[]): ChecklistField[] {
  return fields.map((field) => {
    const section = field.section.trim()
    const result: ChecklistField = {
      key: field.key.trim(),
      label: field.label.trim(),
      type: field.type,
      required: field.required,
    }
    if (field.type === 'select') {
      result.options = parseOptions(field.optionsText)
    }
    if (section) result.section = section
    return result
  })
}

export function validateModelDraft(title: string, fields: FieldDraft[]): string | null {
  if (!title.trim()) return 'Title is required.'

  const seen = new Set<string>()
  for (const [index, field] of fields.entries()) {
    const key = field.key.trim()
    const label = field.label.trim()
    const position = index + 1
    if (!key) return `Field ${position} needs a key.`
    if (seen.has(key)) return `Field key "${key}" is used more than once.`
    seen.add(key)
    if (!label) return `Field ${position} needs a label.`
    if (field.type === 'select' && parseOptions(field.optionsText).length === 0) {
      return `Field ${position} needs at least one option.`
    }
  }

  return null
}
