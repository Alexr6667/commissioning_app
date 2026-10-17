import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ChecklistField } from '@/lib/types'
import { useDataStore } from '@/stores/dataStore'

interface ChecklistFormProps {
  taskItemId: number
  onCancel: () => void
  onSaved: () => void
}

type FieldValues = Record<string, string>

interface FieldGroup {
  section: string | undefined
  fields: ChecklistField[]
}

function groupBySection(fields: ChecklistField[]): FieldGroup[] {
  const order: string[] = []
  const map = new Map<string, ChecklistField[]>()

  for (const field of fields) {
    const key = field.section?.trim() ?? ''
    if (!map.has(key)) {
      order.push(key)
      map.set(key, [])
    }
    map.get(key)!.push(field)
  }

  return order.map((key) => ({
    section: key === '' ? undefined : key,
    fields: map.get(key)!,
  }))
}

function isEmptyValue(field: ChecklistField, value: string | undefined): boolean {
  if (field.type === 'checkbox') {
    return value !== 'true'
  }
  return value === undefined || value.trim() === ''
}

function fieldLabel(field: ChecklistField): string {
  return field.required ? `${field.label} *` : field.label
}

export function ChecklistForm({
  taskItemId,
  onCancel,
  onSaved,
}: ChecklistFormProps) {
  const taskItems = useDataStore((s) => s.taskItems)
  const karts = useDataStore((s) => s.karts)
  const checklistResponses = useDataStore((s) => s.checklistResponses)
  const addChecklistResponse = useDataStore((s) => s.addChecklistResponse)
  const updateChecklistResponse = useDataStore((s) => s.updateChecklistResponse)

  const taskItem = taskItems.find((item) => item.id === taskItemId)
  const snapshot = taskItem?.checklistTemplateSnapshot ?? []
  const groups = groupBySection(snapshot)

  const existingForItem = checklistResponses.filter(
    (response) => response.taskItemId === taskItemId,
  )

  const [values, setValues] = useState<FieldValues>(() => {
    const initial: FieldValues = {}
    for (const field of snapshot) {
      const existing = existingForItem.find(
        (response) => response.fieldKey === field.key,
      )
      if (field.type === 'checkbox') {
        initial[field.key] = existing?.value === 'true' ? 'true' : 'false'
      } else {
        initial[field.key] = existing?.value ?? ''
      }
    }
    return initial
  })
  const [technician, setTechnician] = useState(() => {
    const withTech = existingForItem.find((response) => response.technician?.trim())
    return withTech?.technician ?? ''
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  function setFieldValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const missing = snapshot.filter((field) =>
      field.required ? isEmptyValue(field, values[field.key]) : false,
    )
    if (missing.length > 0) {
      setError(
        `Fill required fields: ${missing.map((field) => field.label).join(', ')}.`,
      )
      return
    }

    setSaving(true)
    setError(null)
    const timestamp = new Date().toISOString()
    const technicianValue = technician.trim() || undefined

    try {
      for (const field of snapshot) {
        const value =
          field.type === 'checkbox'
            ? values[field.key] === 'true'
              ? 'true'
              : 'false'
            : values[field.key]?.trim() || undefined
        const existing = existingForItem.find(
          (response) => response.fieldKey === field.key,
        )
        if (existing?.id !== undefined) {
          await updateChecklistResponse(existing.id, {
            value,
            technician: technicianValue,
            timestamp,
          })
        } else {
          await addChecklistResponse({
            taskItemId,
            fieldKey: field.key,
            value,
            technician: technicianValue,
            timestamp,
          })
        }
      }
      onSaved()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save the checklist.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!taskItem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task item not found</CardTitle>
          <CardDescription>
            This item is not in the local database.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Back
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const chassis =
    taskItem.kartId === undefined
      ? 'No kart'
      : (karts.find((kart) => kart.id === taskItem.kartId)?.chassisNumber ??
        `Unknown kart (#${taskItem.kartId})`)

  if (snapshot.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No checklist</CardTitle>
          <CardDescription>
            This item has no checklist template snapshot.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Back
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
          <CardDescription>
            Complete the checklist for {chassis}. Values are saved on this
            device and queued for sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {groups.map((group) => (
            <section
              key={group.section ?? '__ungrouped__'}
              className="space-y-4"
            >
              {group.section ? (
                <h3 className="text-sm font-medium">{group.section}</h3>
              ) : null}
              {group.fields.map((field) => {
                const id = `checklist-${field.key}`
                const value = values[field.key] ?? ''
                return (
                  <div key={field.key} className="space-y-1.5">
                    {field.type === 'checkbox' ? (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={id}
                          checked={value === 'true'}
                          onCheckedChange={(checked) =>
                            setFieldValue(
                              field.key,
                              checked === true ? 'true' : 'false',
                            )
                          }
                        />
                        <Label htmlFor={id}>{fieldLabel(field)}</Label>
                      </div>
                    ) : (
                      <>
                        <Label htmlFor={id}>{fieldLabel(field)}</Label>
                        {field.type === 'textarea' ? (
                          <Textarea
                            id={id}
                            value={value}
                            onChange={(event) =>
                              setFieldValue(field.key, event.target.value)
                            }
                            required={field.required}
                          />
                        ) : field.type === 'select' ? (
                          <Select
                            items={(field.options ?? []).map((option) => ({
                              value: option,
                              label: option,
                            }))}
                            value={value || undefined}
                            onValueChange={(next) => {
                              if (next) setFieldValue(field.key, next)
                            }}
                          >
                            <SelectTrigger id={id} className="w-full">
                              <SelectValue placeholder="Select…" />
                            </SelectTrigger>
                            <SelectContent>
                              {(field.options ?? []).map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={id}
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={value}
                            onChange={(event) =>
                              setFieldValue(field.key, event.target.value)
                            }
                            required={field.required}
                          />
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </section>
          ))}

          <div className="space-y-1.5">
            <Label htmlFor="checklist-technician">Technician (optional)</Label>
            <Input
              id="checklist-technician"
              value={technician}
              onChange={(event) => setTechnician(event.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save checklist'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
