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

interface CustomerListProps {
  onCreate: () => void
  onEdit: (customerId: number) => void
}

export function CustomerList({ onCreate, onEdit }: CustomerListProps) {
  const customers = useDataStore((s) => s.customers)
  const updateCustomer = useDataStore((s) => s.updateCustomer)
  const [lockingId, setLockingId] = useState<number | null>(null)

  async function handleLock(id: number) {
    setLockingId(id)
    try {
      await updateCustomer(id, { isLocked: true })
    } finally {
      setLockingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Customers</h2>
          <p className="text-sm text-muted-foreground">
            Tracks and contacts stored locally on this device.
          </p>
        </div>
        <Button type="button" onClick={onCreate}>
          New customer
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No customers</CardTitle>
            <CardDescription>Create a customer to get started.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3">
          {customers.map((customer) => {
            const id = customer.id
            if (id === undefined) return null
            const locking = lockingId === id
            const locked = customer.isLocked === true
            return (
              <li key={id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{customer.title}</CardTitle>
                    <CardDescription>
                      {customer.trackName?.trim()
                        ? customer.trackName
                        : 'No track name'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={
                            locked
                              ? 'rounded-md bg-muted px-2 py-0.5 font-medium text-muted-foreground'
                              : 'rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground'
                          }
                        >
                          {locked ? 'Locked' : 'Unlocked'}
                        </span>
                        <span className="text-muted-foreground">
                          {customer.contact?.trim()
                            ? customer.contact
                            : 'No contact'}
                        </span>
                      </div>
                      {customer.preferredControllerFirmware?.trim() ? (
                        <p className="text-muted-foreground">
                          Preferred firmware:{' '}
                          {customer.preferredControllerFirmware.trim()}
                        </p>
                      ) : null}
                      {customer.preferredControllerCpfFile?.trim() ? (
                        <p className="text-muted-foreground">
                          CPF: {customer.preferredControllerCpfFile.trim()}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => onEdit(id)}>
                        Edit
                      </Button>
                      {!locked ? (
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => void handleLock(id)}
                          disabled={locking}
                        >
                          {locking ? 'Locking…' : 'Lock'}
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
