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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TemplateEditor } from '@/features/kart-models/TemplateEditor'
import {
  toChecklistFields,
  toDrafts,
  validateModelDraft,
  type FieldDraft,
} from '@/features/kart-models/templateDraft'
import { useDataStore } from '@/stores/dataStore'

interface KartModelFormProps {
  modelId?: number
  onCancel: () => void
  onSaved: () => void
}

export function KartModelForm({ modelId, onCancel, onSaved }: KartModelFormProps) {
  const kartModels = useDataStore((s) => s.kartModels)
  const addKartModel = useDataStore((s) => s.addKartModel)
  const updateKartModel = useDataStore((s) => s.updateKartModel)
  const model =
    modelId === undefined ? undefined : kartModels.find((item) => item.id === modelId)

  const [title, setTitle] = useState(model?.title ?? '')
  const [description, setDescription] = useState(model?.description ?? '')
  const [firmware, setFirmware] = useState(model?.currentRecommendedFirmware ?? '')
  const [active, setActive] = useState(model?.active ?? true)
  const [fields, setFields] = useState<FieldDraft[]>(() => toDrafts(model?.checklistTemplate))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = validateModelDraft(title, fields)
    if (message) {
      setError(message)
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      active,
      currentRecommendedFirmware: firmware.trim(),
      checklistTemplate: toChecklistFields(fields),
    }

    setSaving(true)
    setError(null)
    try {
      if (modelId === undefined) {
        await addKartModel(payload)
      } else {
        await updateKartModel(modelId, payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the kart model.')
    } finally {
      setSaving(false)
    }
  }

  if (modelId !== undefined && !model) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kart model not found</CardTitle>
          <CardDescription>This model is not in the local database.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Back to models
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <Card>
        <CardHeader>
          <CardTitle>{modelId === undefined ? 'New kart model' : 'Edit kart model'}</CardTitle>
          <CardDescription>
            Title, firmware, and the checklist template are saved on this device.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="model-title">Title</Label>
            <Input
              id="model-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={error === 'Title is required.'}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model-description">Description</Label>
            <Textarea
              id="model-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="model-firmware">Recommended firmware</Label>
            <Input
              id="model-firmware"
              value={firmware}
              onChange={(event) => setFirmware(event.target.value)}
            />
          </div>
          <Label className="font-normal">
            <Switch checked={active} onCheckedChange={setActive} />
            Active
          </Label>

          <TemplateEditor fields={fields} onChange={setFields} />

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
            {saving ? 'Saving…' : 'Save model'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
