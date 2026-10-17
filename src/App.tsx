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
import { KartModelForm } from '@/features/kart-models/KartModelForm'
import { KartModelList } from '@/features/kart-models/KartModelList'
import { seedIfEmpty } from '@/lib/db'
import { useDataStore } from '@/stores/dataStore'
import { bindOnlineListeners } from '@/stores/syncStore'

type Screen =
  | { name: 'home' }
  | { name: 'models' }
  | { name: 'editor'; modelId?: number }

function App() {
  const ready = useDataStore((s) => s.ready)
  const customers = useDataStore((s) => s.customers)
  const kartModels = useDataStore((s) => s.kartModels)
  const hydrate = useDataStore((s) => s.hydrate)
  const addCustomer = useDataStore((s) => s.addCustomer)
  const [adding, setAdding] = useState(false)
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  useEffect(() => {
    const unbind = bindOnlineListeners()
    void (async () => {
      await seedIfEmpty()
      await hydrate()
    })()
    return unbind
  }, [hydrate])

  async function handleAddSampleCustomer() {
    setAdding(true)
    try {
      await addCustomer({
        title: `New customer ${customers.length + 1}`,
        trackName: 'Local write test',
        notes: 'Created via Zustand → Dexie optimistic write.',
      })
    } finally {
      setAdding(false)
    }
  }

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
              variant={screen.name === 'home' ? 'outline' : 'default'}
              onClick={() => setScreen({ name: 'models' })}
            >
              Kart models
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
                Offline foundation: Dexie + Zustand. Kart models are edited from
                here and saved on this device.
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
                    </li>
                  ))}
                </ul>
              </section>
              <p className="text-sm text-muted-foreground">
                {kartModels.length === 1
                  ? '1 kart model stored locally.'
                  : `${kartModels.length} kart models stored locally.`}
              </p>
              <div className="flex flex-wrap gap-2">
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
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void handleAddSampleCustomer()}
                  disabled={adding}
                >
                  {adding ? 'Saving…' : 'Add customer (optimistic)'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : screen.name === 'models' ? (
          <KartModelList
            onCreate={() => setScreen({ name: 'editor' })}
            onEdit={(modelId) => setScreen({ name: 'editor', modelId })}
          />
        ) : (
          <KartModelForm
            key={screen.modelId ?? 'new'}
            modelId={screen.modelId}
            onCancel={() => setScreen({ name: 'models' })}
            onSaved={() => setScreen({ name: 'models' })}
          />
        )}
      </main>
      <SyncStatusIndicator />
    </div>
  )
}

export default App
