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
import { useDataStore } from '@/stores/dataStore'

const KART_STATUSES = [
  { value: 'New', label: 'New' },
  { value: 'In progress', label: 'In progress' },
  { value: 'Complete', label: 'Complete' },
  { value: 'Archived', label: 'Archived' },
] as const

const NONE_VALUE = '__none__'

interface KartFormProps {
  kartId?: number
  onCancel: () => void
  onSaved: () => void
}

function parseOptionalId(value: string | null): number | undefined {
  if (!value || value === NONE_VALUE) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function KartForm({ kartId, onCancel, onSaved }: KartFormProps) {
  const karts = useDataStore((s) => s.karts)
  const kartModels = useDataStore((s) => s.kartModels)
  const customers = useDataStore((s) => s.customers)
  const addKart = useDataStore((s) => s.addKart)
  const updateKart = useDataStore((s) => s.updateKart)

  const kart = kartId === undefined ? undefined : karts.find((item) => item.id === kartId)

  const [chassisNumber, setChassisNumber] = useState(kart?.chassisNumber ?? '')
  const [modelId, setModelId] = useState<string>(
    kart?.modelId !== undefined ? String(kart.modelId) : NONE_VALUE,
  )
  const [customerId, setCustomerId] = useState<string>(
    kart?.customerId !== undefined ? String(kart.customerId) : NONE_VALUE,
  )
  const [status, setStatus] = useState(kart?.status ?? 'New')
  const [notes, setNotes] = useState(kart?.notes ?? '')
  const [latestKnownFirmware, setLatestKnownFirmware] = useState(
    kart?.latestKnownFirmware ?? '',
  )
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const activeModels = kartModels.filter(
    (model) =>
      model.active !== false ||
      (kart?.modelId !== undefined && model.id === kart.modelId),
  )

  const modelOptions = [
    { value: NONE_VALUE, label: 'No model' },
    ...activeModels
      .filter((model) => model.id !== undefined)
      .map((model) => ({ value: String(model.id), label: model.title })),
  ]

  const customerOptions = [
    { value: NONE_VALUE, label: 'No customer' },
    ...customers
      .filter((customer) => customer.id !== undefined)
      .map((customer) => ({ value: String(customer.id), label: customer.title })),
  ]

  function isDuplicateChassis(trimmed: string): boolean {
    return karts.some(
      (item) =>
        item.id !== kartId &&
        item.chassisNumber.trim().toLowerCase() === trimmed.toLowerCase(),
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedChassis = chassisNumber.trim()
    if (!trimmedChassis) {
      setError('Chassis number is required.')
      return
    }
    if (isDuplicateChassis(trimmedChassis)) {
      setError('Chassis number must be unique.')
      return
    }

    const payload = {
      chassisNumber: trimmedChassis,
      modelId: parseOptionalId(modelId),
      customerId: parseOptionalId(customerId),
      status: status.trim() || 'New',
      notes: notes.trim(),
      latestKnownFirmware: latestKnownFirmware.trim(),
    }

    setSaving(true)
    setError(null)
    try {
      if (kartId === undefined) {
        await addKart(payload)
      } else {
        await updateKart(kartId, payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the kart.')
    } finally {
      setSaving(false)
    }
  }

  if (kartId !== undefined && !kart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kart not found</CardTitle>
          <CardDescription>This kart is not in the local database.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Back to karts
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <Card>
        <CardHeader>
          <CardTitle>{kartId === undefined ? 'New kart' : 'Edit kart'}</CardTitle>
          <CardDescription>
            Kart details are saved on this device and queued for sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="kart-chassis">Chassis number</Label>
            <Input
              id="kart-chassis"
              value={chassisNumber}
              onChange={(event) => setChassisNumber(event.target.value)}
              aria-invalid={
                error === 'Chassis number is required.' ||
                error === 'Chassis number must be unique.'
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kart-model">Model</Label>
            <Select
              items={modelOptions}
              value={modelId}
              onValueChange={(value) => {
                if (value) setModelId(value)
              }}
            >
              <SelectTrigger id="kart-model" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kart-customer">Customer</Label>
            <Select
              items={customerOptions}
              value={customerId}
              onValueChange={(value) => {
                if (value) setCustomerId(value)
              }}
            >
              <SelectTrigger id="kart-customer" className="w-full">
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
            <Label htmlFor="kart-status">Status</Label>
            <Select
              items={[...KART_STATUSES]}
              value={status}
              onValueChange={(value) => {
                if (value) setStatus(value)
              }}
            >
              <SelectTrigger id="kart-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KART_STATUSES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kart-firmware">Latest known firmware</Label>
            <Input
              id="kart-firmware"
              value={latestKnownFirmware}
              onChange={(event) => setLatestKnownFirmware(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kart-notes">Notes</Label>
            <Textarea
              id="kart-notes"
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
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save kart'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
