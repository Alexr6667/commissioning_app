import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TaskItemForm } from '@/features/tasks/TaskItemForm'
import type { TaskType } from '@/lib/types'
import { useDataStore } from '@/stores/dataStore'

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  EndOfLine: 'End of line',
  Onsite: 'Onsite',
  CustomerVisit: 'Customer visit',
}

interface TaskDetailProps {
  taskId: number
  onBack: () => void
}

export function TaskDetail({ taskId, onBack }: TaskDetailProps) {
  const tasks = useDataStore((s) => s.tasks)
  const customers = useDataStore((s) => s.customers)
  const karts = useDataStore((s) => s.karts)
  const taskItems = useDataStore((s) => s.taskItems)
  const updateTaskItem = useDataStore((s) => s.updateTaskItem)

  const [mode, setMode] = useState<
    { name: 'list' } | { name: 'add' } | { name: 'edit'; taskItemId: number }
  >({ name: 'list' })
  const [removingId, setRemovingId] = useState<number | null>(null)

  const task = tasks.find((item) => item.id === taskId)
  const items = taskItems.filter((item) => item.taskId === taskId)

  function customerTitle(customerId: number | undefined): string {
    if (customerId === undefined) return 'No customer'
    return (
      customers.find((customer) => customer.id === customerId)?.title ??
      'Unknown customer'
    )
  }

  function typeLabel(type: TaskType | undefined): string {
    if (!type) return 'No type'
    return TASK_TYPE_LABELS[type]
  }

  function chassisFor(kartId: number | undefined): string {
    if (kartId === undefined) return 'No kart'
    return (
      karts.find((kart) => kart.id === kartId)?.chassisNumber ??
      `Unknown kart (#${kartId})`
    )
  }

  async function handleMarkRemoved(id: number) {
    setRemovingId(id)
    try {
      await updateTaskItem(id, { status: 'Removed' })
    } finally {
      setRemovingId(null)
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
          <Button type="button" variant="outline" onClick={onBack}>
            Back to tasks
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (mode.name === 'add') {
    return (
      <TaskItemForm
        taskId={taskId}
        onCancel={() => setMode({ name: 'list' })}
        onSaved={() => setMode({ name: 'list' })}
      />
    )
  }

  if (mode.name === 'edit') {
    return (
      <TaskItemForm
        key={mode.taskItemId}
        taskId={taskId}
        taskItemId={mode.taskItemId}
        onCancel={() => setMode({ name: 'list' })}
        onSaved={() => setMode({ name: 'list' })}
      />
    )
  }

  const statusLabel = task.status?.trim() ? task.status : 'No status'

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onBack}>
            Back to tasks
          </Button>
          <h2 className="mt-3 text-lg font-medium">{task.title}</h2>
          <p className="text-sm text-muted-foreground">
            {typeLabel(task.type)} · {customerTitle(task.customerId)} ·{' '}
            {statusLabel}
          </p>
        </div>
        <Button type="button" onClick={() => setMode({ name: 'add' })}>
          Add item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No items</CardTitle>
            <CardDescription>
              Add a kart to this task to start commissioning work.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const id = item.id
            if (id === undefined) return null
            const removing = removingId === id
            const removed = item.status === 'Removed'
            const itemStatus = item.status?.trim() ? item.status : 'No status'
            return (
              <li key={id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{chassisFor(item.kartId)}</CardTitle>
                    <CardDescription>
                      {item.notes?.trim() ? item.notes : 'No notes'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={
                        removed
                          ? 'rounded-md bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground'
                          : 'rounded-md bg-secondary px-2 py-0.5 text-sm font-medium text-secondary-foreground'
                      }
                    >
                      {itemStatus}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setMode({ name: 'edit', taskItemId: id })
                        }
                      >
                        Edit
                      </Button>
                      {!removed ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => void handleMarkRemoved(id)}
                          disabled={removing}
                        >
                          {removing ? 'Removing…' : 'Remove'}
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
