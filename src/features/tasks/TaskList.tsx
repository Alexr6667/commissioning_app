import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { TaskType } from '@/lib/types'
import { useDataStore } from '@/stores/dataStore'

const TASK_TYPE_LABELS: Record<TaskType, string> = {
  EndOfLine: 'End of line',
  Onsite: 'Onsite',
  CustomerVisit: 'Customer visit',
}

interface TaskListProps {
  onCreate: () => void
  onEdit: (taskId: number) => void
}

export function TaskList({ onCreate, onEdit }: TaskListProps) {
  const tasks = useDataStore((s) => s.tasks)
  const customers = useDataStore((s) => s.customers)
  const updateTask = useDataStore((s) => s.updateTask)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

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

  async function handleCancel(id: number) {
    setCancellingId(id)
    try {
      await updateTask(id, { status: 'Cancelled' })
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            Commissioning jobs linked to a customer, stored locally.
          </p>
        </div>
        <Button type="button" onClick={onCreate}>
          New task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No tasks</CardTitle>
            <CardDescription>Create a task to get started.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => {
            const id = task.id
            if (id === undefined) return null
            const cancelling = cancellingId === id
            const cancelled = task.status === 'Cancelled'
            const statusLabel = task.status?.trim() ? task.status : 'No status'
            const assigneeLabel = task.assignee?.trim()
              ? task.assignee
              : null
            return (
              <li key={id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{task.title}</CardTitle>
                    <CardDescription>
                      {typeLabel(task.type)} · {customerTitle(task.customerId)}
                      {assigneeLabel ? ` · ${assigneeLabel}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={
                        cancelled
                          ? 'rounded-md bg-muted px-2 py-0.5 text-sm font-medium text-muted-foreground'
                          : 'rounded-md bg-secondary px-2 py-0.5 text-sm font-medium text-secondary-foreground'
                      }
                    >
                      {statusLabel}
                    </span>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => onEdit(id)}>
                        Edit
                      </Button>
                      {!cancelled ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => void handleCancel(id)}
                          disabled={cancelling}
                        >
                          {cancelling ? 'Cancelling…' : 'Cancel'}
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
