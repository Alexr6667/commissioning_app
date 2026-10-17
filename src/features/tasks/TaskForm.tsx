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
import type { TaskType } from '@/lib/types'
import { useDataStore } from '@/stores/dataStore'

const TASK_TYPES = [
  { value: 'EndOfLine', label: 'End of line' },
  { value: 'Onsite', label: 'Onsite' },
  { value: 'CustomerVisit', label: 'Customer visit' },
] as const satisfies ReadonlyArray<{ value: TaskType; label: string }>

const TASK_STATUSES = [
  { value: 'New', label: 'New' },
  { value: 'In progress', label: 'In progress' },
  { value: 'Complete', label: 'Complete' },
  { value: 'Cancelled', label: 'Cancelled' },
] as const

const NONE_VALUE = '__none__'

interface TaskFormProps {
  taskId?: number
  onCancel: () => void
  onSaved: () => void
}

function parseOptionalId(value: string | null): number | undefined {
  if (!value || value === NONE_VALUE) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function isTaskType(value: string): value is TaskType {
  return TASK_TYPES.some((option) => option.value === value)
}

export function TaskForm({ taskId, onCancel, onSaved }: TaskFormProps) {
  const tasks = useDataStore((s) => s.tasks)
  const customers = useDataStore((s) => s.customers)
  const addTask = useDataStore((s) => s.addTask)
  const updateTask = useDataStore((s) => s.updateTask)

  const task = taskId === undefined ? undefined : tasks.find((item) => item.id === taskId)

  const [title, setTitle] = useState(task?.title ?? '')
  const [type, setType] = useState<TaskType>(task?.type ?? 'EndOfLine')
  const [customerId, setCustomerId] = useState<string>(
    task?.customerId !== undefined ? String(task.customerId) : NONE_VALUE,
  )
  const [assignee, setAssignee] = useState(task?.assignee ?? '')
  const [status, setStatus] = useState(task?.status ?? 'New')
  const [dates, setDates] = useState(task?.dates ?? '')
  const [overallNotes, setOverallNotes] = useState(task?.overallNotes ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const customerOptions = [
    { value: NONE_VALUE, label: 'No customer' },
    ...customers
      .filter((customer) => customer.id !== undefined)
      .map((customer) => ({ value: String(customer.id), label: customer.title })),
  ]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required.')
      return
    }

    const payload = {
      title: trimmedTitle,
      type,
      customerId: parseOptionalId(customerId),
      assignee: assignee.trim() || undefined,
      status: status.trim() || 'New',
      dates: dates.trim() || undefined,
      overallNotes: overallNotes.trim() || undefined,
    }

    setSaving(true)
    setError(null)
    try {
      if (taskId === undefined) {
        await addTask(payload)
      } else {
        await updateTask(taskId, payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the task.')
    } finally {
      setSaving(false)
    }
  }

  if (taskId !== undefined && !task) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task not found</CardTitle>
          <CardDescription>This task is not in the local database.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Back to tasks
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <Card>
        <CardHeader>
          <CardTitle>{taskId === undefined ? 'New task' : 'Edit task'}</CardTitle>
          <CardDescription>
            Task details are saved on this device and queued for sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={error === 'Title is required.'}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-type">Type</Label>
            <Select
              items={[...TASK_TYPES]}
              value={type}
              onValueChange={(value) => {
                if (value && isTaskType(value)) setType(value)
              }}
            >
              <SelectTrigger id="task-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-customer">Customer</Label>
            <Select
              items={customerOptions}
              value={customerId}
              onValueChange={(value) => {
                if (value) setCustomerId(value)
              }}
            >
              <SelectTrigger id="task-customer" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-assignee">Assignee</Label>
            <Input
              id="task-assignee"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              placeholder="Technician name"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-status">Status</Label>
            <Select
              items={[...TASK_STATUSES]}
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(value)
              }}
            >
              <SelectTrigger id="task-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-dates">Dates</Label>
            <Input
              id="task-dates"
              type="date"
              value={dates}
              onChange={(event) => setDates(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-notes">Overall notes</Label>
            <Textarea
              id="task-notes"
              value={overallNotes}
              onChange={(event) => setOverallNotes(event.target.value)}
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
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save task'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
