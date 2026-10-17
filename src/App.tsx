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
import { seedIfEmpty } from '@/lib/db'
import { useDataStore } from '@/stores/dataStore'
import { bindOnlineListeners } from '@/stores/syncStore'

function App() {
  const ready = useDataStore((s) => s.ready)
  const customers = useDataStore((s) => s.customers)
  const kartModels = useDataStore((s) => s.kartModels)
  const hydrate = useDataStore((s) => s.hydrate)
  const addCustomer = useDataStore((s) => s.addCustomer)
  const [adding, setAdding] = useState(false)

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
    <main className="relative flex min-h-svh items-center justify-center p-6">
      <SyncStatusIndicator />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Commissioning App</CardTitle>
          <CardDescription>
            Offline foundation: Dexie + Zustand. Sample data below is loaded
            from IndexedDB.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {!ready ? (
            <p className="text-sm text-muted-foreground">Loading local data…</p>
          ) : (
            <>
              <section className="space-y-2">
                <h2 className="text-sm font-medium">Customers</h2>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {customers.map((c) => (
                    <li key={c.id}>
                      {c.title}
                      {c.trackName ? ` — ${c.trackName}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="space-y-2">
                <h2 className="text-sm font-medium">Kart models</h2>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {kartModels.map((m) => (
                    <li key={m.id}>
                      {m.title}
                      {m.description ? ` — ${m.description}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
              <Button
                type="button"
                onClick={() => void handleAddSampleCustomer()}
                disabled={adding}
              >
                {adding ? 'Saving…' : 'Add customer (optimistic)'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

export default App
