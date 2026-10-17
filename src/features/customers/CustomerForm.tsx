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
import { useDataStore } from '@/stores/dataStore'

interface CustomerFormProps {
  customerId?: number
  onCancel: () => void
  onSaved: () => void
}

export function CustomerForm({ customerId, onCancel, onSaved }: CustomerFormProps) {
  const customers = useDataStore((s) => s.customers)
  const addCustomer = useDataStore((s) => s.addCustomer)
  const updateCustomer = useDataStore((s) => s.updateCustomer)
  const customer =
    customerId === undefined
      ? undefined
      : customers.find((item) => item.id === customerId)

  const [title, setTitle] = useState(customer?.title ?? '')
  const [trackName, setTrackName] = useState(customer?.trackName ?? '')
  const [contact, setContact] = useState(customer?.contact ?? '')
  const [siteAddress, setSiteAddress] = useState(customer?.siteAddress ?? '')
  const [notes, setNotes] = useState(customer?.notes ?? '')
  const [isLocked, setIsLocked] = useState(customer?.isLocked ?? false)
  const [externalId, setExternalId] = useState(customer?.externalId ?? '')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Title is required.')
      return
    }

    const payload = {
      title: trimmedTitle,
      trackName: trackName.trim(),
      contact: contact.trim(),
      siteAddress: siteAddress.trim(),
      notes: notes.trim(),
      isLocked,
      externalId: externalId.trim() || undefined,
    }

    setSaving(true)
    setError(null)
    try {
      if (customerId === undefined) {
        await addCustomer(payload)
      } else {
        await updateCustomer(customerId, payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the customer.')
    } finally {
      setSaving(false)
    }
  }

  if (customerId !== undefined && !customer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer not found</CardTitle>
          <CardDescription>This customer is not in the local database.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Back to customers
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <Card>
        <CardHeader>
          <CardTitle>{customerId === undefined ? 'New customer' : 'Edit customer'}</CardTitle>
          <CardDescription>
            Customer details are saved on this device and queued for sync.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer-title">Title</Label>
            <Input
              id="customer-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={error === 'Title is required.'}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-track">Track name</Label>
            <Input
              id="customer-track"
              value={trackName}
              onChange={(event) => setTrackName(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-contact">Contact</Label>
            <Input
              id="customer-contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-address">Site address</Label>
            <Textarea
              id="customer-address"
              value={siteAddress}
              onChange={(event) => setSiteAddress(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-notes">Notes</Label>
            <Textarea
              id="customer-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-external-id">External ID</Label>
            <Input
              id="customer-external-id"
              value={externalId}
              onChange={(event) => setExternalId(event.target.value)}
            />
          </div>
          <Label className="font-normal">
            <Switch checked={isLocked} onCheckedChange={setIsLocked} />
            Locked
          </Label>

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
            {saving ? 'Saving…' : 'Save customer'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
