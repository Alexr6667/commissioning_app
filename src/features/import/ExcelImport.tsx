import { useRef, useState, type ChangeEvent } from 'react'
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
  applyImport,
  buildImportPreview,
  type ImportPreview,
  type ImportResult,
} from '@/features/import/parseExcelImport'
import { useDataStore } from '@/stores/dataStore'

interface ExcelImportProps {
  onBack: () => void
}

export function ExcelImport({ onBack }: ExcelImportProps) {
  const customers = useDataStore((s) => s.customers)
  const kartModels = useDataStore((s) => s.kartModels)
  const karts = useDataStore((s) => s.karts)
  const addCustomer = useDataStore((s) => s.addCustomer)
  const addKart = useDataStore((s) => s.addKart)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  function resetFileInput() {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setResult(null)
    setPreview(null)
    setParseError(null)
    setFileName(null)

    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setParseError('Please select a .xlsx file.')
      resetFileInput()
      return
    }

    try {
      const buffer = await file.arrayBuffer()
      const nextPreview = buildImportPreview(buffer, {
        customers,
        kartModels,
        karts,
      })
      setFileName(file.name)
      setPreview(nextPreview)
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : 'Could not read the Excel file.',
      )
      resetFileInput()
    }
  }

  async function handleConfirm() {
    if (!preview) return
    setImporting(true)
    setParseError(null)
    try {
      const nextResult = await applyImport(preview, {
        customers: useDataStore.getState().customers,
        kartModels: useDataStore.getState().kartModels,
        karts: useDataStore.getState().karts,
        addCustomer,
        addKart,
      })
      setResult(nextResult)
      setPreview(null)
      setFileName(null)
      resetFileInput()
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : 'Import failed unexpectedly.',
      )
    } finally {
      setImporting(false)
    }
  }

  function handleClear() {
    setPreview(null)
    setResult(null)
    setParseError(null)
    setFileName(null)
    resetFileInput()
  }

  const canImport =
    preview !== null &&
    (preview.validCustomerCount > 0 || preview.validKartCount > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Excel import</CardTitle>
        <CardDescription>
          Import customers and karts from a .xlsx file. Preview rows, then
          confirm to create new records only. Use sheets named Customers and
          Karts, or one sheet with a Type column.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="space-y-2">
          <Label htmlFor="excel-file">Excel file (.xlsx)</Label>
          <Input
            ref={fileInputRef}
            id="excel-file"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
          />
          {fileName ? (
            <p className="text-sm text-muted-foreground">Selected: {fileName}</p>
          ) : null}
          {parseError ? (
            <p className="text-sm text-destructive" role="alert">
              {parseError}
            </p>
          ) : null}
        </div>

        {preview ? (
          <div className="space-y-4">
            <section className="space-y-1">
              <h2 className="text-sm font-medium">Preview</h2>
              <p className="text-sm text-muted-foreground">
                {preview.validCustomerCount === 1
                  ? '1 valid customer row'
                  : `${preview.validCustomerCount} valid customer rows`}
                {' · '}
                {preview.validKartCount === 1
                  ? '1 valid kart row'
                  : `${preview.validKartCount} valid kart rows`}
                {' · '}
                {preview.errors.length === 1
                  ? '1 validation issue'
                  : `${preview.errors.length} validation issues`}
              </p>
            </section>

            {preview.customers.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">Customers to create</h3>
                <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-muted-foreground">
                  {preview.customers.map((row) => (
                    <li key={`customer-${row.rowNumber}`}>
                      Row {row.rowNumber}: {row.title}
                      {row.trackName ? ` — ${row.trackName}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {preview.karts.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-medium">Karts to create</h3>
                <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-muted-foreground">
                  {preview.karts.map((row) => (
                    <li key={`kart-${row.rowNumber}`}>
                      Row {row.rowNumber}: {row.chassisNumber}
                      {row.modelTitle ? ` · ${row.modelTitle}` : ''}
                      {row.customerTitle ? ` · ${row.customerTitle}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {preview.errors.length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-medium text-destructive">
                  Validation errors
                </h3>
                <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-destructive">
                  {preview.errors.map((issue, index) => (
                    <li key={`${issue.kind}-${issue.rowNumber}-${index}`}>
                      {issue.kind === 'customer' ? 'Customer' : 'Kart'} row{' '}
                      {issue.rowNumber}: {issue.message}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}

        {result ? (
          <section className="space-y-2 rounded-md border border-border p-4">
            <h2 className="text-sm font-medium">Import complete</h2>
            <p className="text-sm text-muted-foreground">
              Created {result.createdCustomers}{' '}
              {result.createdCustomers === 1 ? 'customer' : 'customers'} and{' '}
              {result.createdKarts} {result.createdKarts === 1 ? 'kart' : 'karts'}.
            </p>
            {result.errors.length > 0 ? (
              <ul className="max-h-48 space-y-1 overflow-y-auto text-sm text-destructive">
                {result.errors.map((issue, index) => (
                  <li key={`result-${issue.kind}-${issue.rowNumber}-${index}`}>
                    {issue.kind === 'customer' ? 'Customer' : 'Kart'} row{' '}
                    {issue.rowNumber}: {issue.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No validation issues reported.
              </p>
            )}
          </section>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        {(preview || result || parseError) && (
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear
          </Button>
        )}
        <Button
          type="button"
          disabled={!canImport || importing}
          onClick={() => void handleConfirm()}
        >
          {importing ? 'Importing…' : 'Confirm import'}
        </Button>
      </CardFooter>
    </Card>
  )
}
