import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator'
import { CustomerForm } from '@/features/customers/CustomerForm'
import { CustomerList } from '@/features/customers/CustomerList'
import { KartModelForm } from '@/features/kart-models/KartModelForm'
import { KartModelList } from '@/features/kart-models/KartModelList'
import { KartForm } from '@/features/karts/KartForm'
import { KartList } from '@/features/karts/KartList'
import { TaskDetail } from '@/features/tasks/TaskDetail'
import { TaskForm } from '@/features/tasks/TaskForm'
import { TaskList } from '@/features/tasks/TaskList'
import { seedIfEmpty } from '@/lib/db'
import { useDataStore } from '@/stores/dataStore'
import { bindOnlineListeners } from '@/stores/syncStore'

type Screen =
  | { name: 'home' }
  | { name: 'customers' }
  | { name: 'customer-editor'; customerId?: number }
  | { name: 'models' }
  | { name: 'editor'; modelId?: number }
  | { name: 'karts' }
  | { name: 'kart-editor'; kartId?: number }
  | { name: 'tasks' }
  | { name: 'task-editor'; taskId?: number }
  | { name: 'task-detail'; taskId: number }

function App() {
  const ready = useDataStore((s) => s.ready)
  const customers = useDataStore((s) => s.customers)
  const kartModels = useDataStore((s) => s.kartModels)
  const karts = useDataStore((s) => s.karts)
  const tasks = useDataStore((s) => s.tasks)
  const hydrate = useDataStore((s) => s.hydrate)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  useEffect(() => {
    const unbind = bindOnlineListeners()
    void (async () => {
      await seedIfEmpty()
      await hydrate()
    })()
    return unbind
  }, [hydrate])

  const onCustomers =
    screen.name === 'customers' || screen.name === 'customer-editor'
  const onModels = screen.name === 'models' || screen.name === 'editor'
  const onKarts = screen.name === 'karts' || screen.name === 'kart-editor'
  const onTasks =
    screen.name === 'tasks' ||
    screen.name === 'task-editor' ||
    screen.name === 'task-detail'

  return (
    <div className="min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Commissioning App</p>
            <h1 className="text-lg font-medium">Workshop</h1>
          </div>
          <nav className="flex gap-2" aria-label="Primary">
            <Button
              type="button"
              variant={screen.name === 'home' ? 'default' : 'outline'}
              onClick={() => setScreen({ name: 'home' })}
            >
              Home
            </Button>
            <Button
              type="button"
              variant={onCustomers ? 'default' : 'outline'}
              onClick={() => setScreen({ name: 'customers' })}
            >
              Customers
            </Button>
            <Button
              type="button"
              variant={onModels ? 'default' : 'outline'}
              onClick={() => setScreen({ name: 'models' })}
            >
              Kart models
            </Button>
            <Button
              type="button"
              variant={onKarts ? 'default' : 'outline'}
              onClick={() => setScreen({ name: 'karts' })}
            >
              Karts
            </Button>
            <Button
              type="button"
              variant={onTasks ? 'default' : 'outline'}
              onClick={() => setScreen({ name: 'tasks' })}
            >
              Tasks
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6 pb-24">
        {!ready ? (
          <p className="text-sm text-muted-foreground">Loading local data…</p>
        ) : screen.name === 'home' ? (
          <Card>
            <CardHeader>
              <CardTitle>Local data</CardTitle>
              <CardDescription>
                Offline foundation: Dexie + Zustand. Customers, kart models,
                karts, and tasks are edited here and saved on this device.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <section className="space-y-2">
                <h2 className="text-sm font-medium">Customers</h2>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {customers.map((customer) => (
                    <li key={customer.id}>
                      {customer.title}
                      {customer.trackName ? ` — ${customer.trackName}` : ''}
                      {customer.isLocked ? ' (locked)' : ''}
                    </li>
                  ))}
                </ul>
              </section>
              <p className="text-sm text-muted-foreground">
                {kartModels.length === 1
                  ? '1 kart model stored locally.'
                  : `${kartModels.length} kart models stored locally.`}
              </p>
              <p className="text-sm text-muted-foreground">
                {karts.length === 1
                  ? '1 kart stored locally.'
                  : `${karts.length} karts stored locally.`}
              </p>
              <p className="text-sm text-muted-foreground">
                {tasks.length === 1
                  ? '1 task stored locally.'
                  : `${tasks.length} tasks stored locally.`}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => setScreen({ name: 'customers' })}
                >
                  Customers
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScreen({ name: 'customer-editor' })}
                >
                  New customer
                </Button>
                <Button type="button" onClick={() => setScreen({ name: 'models' })}>
                  Kart models
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScreen({ name: 'editor' })}
                >
                  New kart model
                </Button>
                <Button type="button" onClick={() => setScreen({ name: 'karts' })}>
                  Karts
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScreen({ name: 'kart-editor' })}
                >
                  New kart
                </Button>
                <Button type="button" onClick={() => setScreen({ name: 'tasks' })}>
                  Tasks
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScreen({ name: 'task-editor' })}
                >
                  New task
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : screen.name === 'customers' ? (
          <CustomerList
            onCreate={() => setScreen({ name: 'customer-editor' })}
            onEdit={(customerId) =>
              setScreen({ name: 'customer-editor', customerId })
            }
          />
        ) : screen.name === 'customer-editor' ? (
          <CustomerForm
            key={screen.customerId ?? 'new'}
            customerId={screen.customerId}
            onCancel={() => setScreen({ name: 'customers' })}
            onSaved={() => setScreen({ name: 'customers' })}
          />
        ) : screen.name === 'models' ? (
          <KartModelList
            onCreate={() => setScreen({ name: 'editor' })}
            onEdit={(modelId) => setScreen({ name: 'editor', modelId })}
          />
        ) : screen.name === 'editor' ? (
          <KartModelForm
            key={screen.modelId ?? 'new'}
            modelId={screen.modelId}
            onCancel={() => setScreen({ name: 'models' })}
            onSaved={() => setScreen({ name: 'models' })}
          />
        ) : screen.name === 'karts' ? (
          <KartList
            onCreate={() => setScreen({ name: 'kart-editor' })}
            onEdit={(kartId) => setScreen({ name: 'kart-editor', kartId })}
          />
        ) : screen.name === 'kart-editor' ? (
          <KartForm
            key={screen.kartId ?? 'new'}
            kartId={screen.kartId}
            onCancel={() => setScreen({ name: 'karts' })}
            onSaved={() => setScreen({ name: 'karts' })}
          />
        ) : screen.name === 'tasks' ? (
          <TaskList
            onCreate={() => setScreen({ name: 'task-editor' })}
            onEdit={(taskId) => setScreen({ name: 'task-editor', taskId })}
            onOpenItems={(taskId) =>
              setScreen({ name: 'task-detail', taskId })
            }
          />
        ) : screen.name === 'task-detail' ? (
          <TaskDetail
            key={screen.taskId}
            taskId={screen.taskId}
            onBack={() => setScreen({ name: 'tasks' })}
          />
        ) : (
          <TaskForm
            key={screen.taskId ?? 'new'}
            taskId={screen.taskId}
            onCancel={() => setScreen({ name: 'tasks' })}
            onSaved={() => setScreen({ name: 'tasks' })}
          />
        )}
      </main>
      <SyncStatusIndicator />
    </div>
  )
}

export default App
