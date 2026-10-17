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

interface KartModelListProps {
  onCreate: () => void
  onEdit: (modelId: number) => void
}

function fieldCount(template: unknown): number {
  return Array.isArray(template) ? template.length : 0
}

export function KartModelList({ onCreate, onEdit }: KartModelListProps) {
  const kartModels = useDataStore((s) => s.kartModels)
  const updateKartModel = useDataStore((s) => s.updateKartModel)
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null)

  async function handleDeactivate(id: number) {
    setDeactivatingId(id)
    try {
      await updateKartModel(id, { active: false })
    } finally {
      setDeactivatingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Kart models</h2>
          <p className="text-sm text-muted-foreground">
            Models and their checklist templates, stored locally.
          </p>
        </div>
        <Button type="button" onClick={onCreate}>
          New model
        </Button>
      </div>

      {kartModels.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No kart models</CardTitle>
            <CardDescription>Create a model to start a checklist template.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {kartModels.map((model) => {
            const id = model.id
            if (id === undefined) return null
            const count = fieldCount(model.checklistTemplate)
            const deactivating = deactivatingId === id
            return (
              <li key={id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{model.title}</CardTitle>
                    <CardDescription>
                      {model.description?.trim() ? model.description : 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span
                        className={
                          model.active
                            ? 'rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground'
                            : 'rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground'
                        }
                      >
                        {model.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-muted-foreground">
                        {count === 1 ? '1 field' : `${count} fields`}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => onEdit(id)}>
                        Edit
                      </Button>
                      {model.active ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => void handleDeactivate(id)}
                          disabled={deactivating}
                        >
                          {deactivating ? 'Deactivating…' : 'Deactivate'}
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
