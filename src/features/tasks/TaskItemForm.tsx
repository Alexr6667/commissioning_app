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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { ChecklistField, Kart, Task } from '@/lib/types'
import { useDataStore } from '@/stores/dataStore'

function snapshotChecklistTemplate(
  template: ChecklistField[] | undefined,
): ChecklistField[] | undefined {
  if (template === undefined) return undefined
  return structuredClone(template)
}

const TASK_ITEM_STATUSES = [
  { value: 'New', label: 'New' },
  { value: 'In progress', label: 'In progress' },
  { value: 'Complete', label: 'Complete' },
  { value: 'Removed', label: 'Removed' },
] as const

interface TaskItemFormProps {
  taskId: number
  taskItemId?: number
  onCancel: () => void
  onSaved: () => void
}

function kartLabel(kart: Kart): string {
  const chassis = kart.chassisNumber.trim() || 'Untitled chassis'
  return chassis
}

function sortKartsForTask(karts: Kart[], task: Task | undefined): Kart[] {
  const customerId = task?.customerId
  const withIds = karts.filter((kart) => kart.id !== undefined)
  if (customerId === undefined) {
    return [...withIds].sort((a, b) =>
      a.chassisNumber.localeCompare(b.chassisNumber, undefined, {
        sensitivity: 'base',
      }),
    )
  }

  const customerKarts = withIds
    .filter((kart) => kart.customerId === customerId)
    .sort((a, b) =>
      a.chassisNumber.localeCompare(b.chassisNumber, undefined, {
        sensitivity: 'base',
      }),
    )
  const otherKarts = withIds
    .filter((kart) => kart.customerId !== customerId)
    .sort((a, b) =>
      a.chassisNumber.localeCompare(b.chassisNumber, undefined, {
        sensitivity: 'base',
      }),
    )
  return [...customerKarts, ...otherKarts]
}

export function TaskItemForm({
  taskId,
  taskItemId,
  onCancel,
  onSaved,
}: TaskItemFormProps) {
  const tasks = useDataStore((s) => s.tasks)
  const karts = useDataStore((s) => s.karts)
  const kartModels = useDataStore((s) => s.kartModels)
  const taskItems = useDataStore((s) => s.taskItems)
  const addTaskItem = useDataStore((s) => s.addTaskItem)
  const updateTaskItem = useDataStore((s) => s.updateTaskItem)

  const task = tasks.find((item) => item.id === taskId)
  const taskItem =
    taskItemId === undefined
      ? undefined
      : taskItems.find((item) => item.id === taskItemId)

  const sortedKarts = sortKartsForTask(karts, task)
  const customerId = task?.customerId
  const customerKarts =
    customerId === undefined
      ? []
      : sortedKarts.filter((kart) => kart.customerId === customerId)
  const otherKarts =
    customerId === undefined
      ? sortedKarts
      : sortedKarts.filter((kart) => kart.customerId !== customerId)

  const defaultKartId =
    taskItem?.kartId !== undefined
      ? String(taskItem.kartId)
      : customerKarts[0]?.id !== undefined
        ? String(customerKarts[0].id)
        : otherKarts[0]?.id !== undefined
          ? String(otherKarts[0].id)
          : ''

  const [kartId, setKartId] = useState(defaultKartId)
  const [status, setStatus] = useState(taskItem?.status ?? 'New')
  const [notes, setNotes] = useState(taskItem?.notes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const kartOptions = sortedKarts.map((kart) => ({
    value: String(kart.id),
    label: kartLabel(kart),
  }))

  const isEditing = taskItemId !== undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isEditing) {
      const parsedKartId = Number(kartId)
      if (!kartId || !Number.isFinite(parsedKartId)) {
        setError('Select a kart.')
        return
      }

      const kart = karts.find((item) => item.id === parsedKartId)
      const model =
        kart?.modelId === undefined
          ? undefined
          : kartModels.find((item) => item.id === kart.modelId)
      const checklistTemplateSnapshot = snapshotChecklistTemplate(
        model?.checklistTemplate,
      )

      setSaving(true)
      setError(null)
      try {
        await addTaskItem({
          taskId,
          kartId: parsedKartId,
          status: status.trim() || 'New',
          notes: notes.trim() || undefined,
          checklistTemplateSnapshot,
        })
        onSaved()
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Could not save the task item.',
        )
      } finally {
        setSaving(false)
      }
      return
    }

    setSaving(true)
    setError(null)
    try {
      await updateTaskItem(taskItemId, {
        status: status.trim() || 'New',
        notes: notes.trim() || undefined,
      })
      onSaved()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save the task item.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (!task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task not found</CardTitle>
          <CardDescription>This task is not in the local database.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Back
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (isEditing && !taskItem) {
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

  const linkedKart =
    taskItem?.kartId !== undefined
      ? karts.find((kart) => kart.id === taskItem.kartId)
      : undefined

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit task item' : 'Add task item'}</CardTitle>
          <CardDescription>
            Link a kart to “{task.title}”. Changes are saved on this device and
            queued for sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isEditing ? (
            <div className="space-y-1.5">
              <Label>Kart</Label>
              <p className="text-sm">
                {linkedKart
                  ? linkedKart.chassisNumber
                  : taskItem?.kartId !== undefined
                    ? `Unknown kart (#${taskItem.kartId})`
                    : 'No kart'}
              </p>
            </div>
          ) : kartOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No karts available. Create a kart first, then add it to this task.
            </p>
          ) : (
            <div className="space-y-1.5">
              <Label htmlFor="task-item-kart">Kart</Label>
              <Select
                items={kartOptions}
                value={kartId}
                onValueChange={(value) => {
                  if (value) setKartId(value)
                }}
              >
                <SelectTrigger id="task-item-kart" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {customerKarts.length > 0 ? (
                    <SelectGroup>
                      <SelectLabel>Customer karts</SelectLabel>
                      {customerKarts.map((kart) => (
                        <SelectItem key={kart.id} value={String(kart.id)}>
                          {kartLabel(kart)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : null}
                  {otherKarts.length > 0 ? (
                    <SelectGroup>
                      {customerId !== undefined ? (
                        <SelectLabel>Other karts</SelectLabel>
                      ) : null}
                      {otherKarts.map((kart) => (
                        <SelectItem key={kart.id} value={String(kart.id)}>
                          {kartLabel(kart)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="task-item-status">Status</Label>
            <Select
              items={[...TASK_ITEM_STATUSES]}
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(value)
              }}
            >
              <SelectTrigger id="task-item-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_ITEM_STATUSES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-item-notes">Notes</Label>
            <Textarea
              id="task-item-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving || (!isEditing && kartOptions.length === 0)}
          >
            {saving ? 'Saving…' : isEditing ? 'Save item' : 'Add item'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
