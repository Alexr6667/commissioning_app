import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDataStore } from '@/stores/dataStore'

interface KartListProps {
  onCreate: () => void
  onEdit: (kartId: number) => void
}

export function KartList({ onCreate, onEdit }: KartListProps) {
  const karts = useDataStore((s) => s.karts)
  const kartModels = useDataStore((s) => s.kartModels)
  const customers = useDataStore((s) => s.customers)
  const updateKart = useDataStore((s) => s.updateKart)
  const [archivingId, setArchivingId] = useState<number | null>(null)

  function modelTitle(modelId: number | undefined): string {
    if (modelId === undefined) return 'No model'
    return kartModels.find((model) => model.id === modelId)?.title ?? 'Unknown model'
  }

  function customerTitle(customerId: number | undefined): string {
    if (customerId === undefined) return 'No customer'
    return (
      customers.find((customer) => customer.id === customerId)?.title ?? 'Unknown customer'
    )
  }

  async function handleArchive(id: number) {
    setArchivingId(id)
    try {
      await updateKart(id, { status: 'Archived' })
    } finally {
      setArchivingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Karts</h2>
          <p className="text-sm text-muted-foreground">
            Chassis linked to a model and customer, stored locally.
          </p>
        </div>
        <Button type="button" onClick={onCreate}>
          New kart
        </Button>
      </div>

      {karts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No karts</CardTitle>
            <CardDescription>Create a kart to get started.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {karts.map((kart) => {
            const id = kart.id
            if (id === undefined) return null
            const archiving = archivingId === id
            const archived = kart.status === 'Archived'
            const statusLabel = kart.status?.trim() ? kart.status : 'No status'
            return (
              <li key={id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{kart.chassisNumber}</CardTitle>
                    <CardDescription>
                      {modelTitle(kart.modelId)} · {customerTitle(kart.customerId)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <span
                      className={
                        archived
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
                      {!archived ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => void handleArchive(id)}
                          disabled={archiving}
                        >
                          {archiving ? 'Archiving…' : 'Archive'}
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
