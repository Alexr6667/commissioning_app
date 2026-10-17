import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createEmptyField,
  FIELD_TYPE_OPTIONS,
  isChecklistFieldType,
  moveField,
  type FieldDraft,
} from '@/features/kart-models/templateDraft'

interface TemplateEditorProps {
  fields: FieldDraft[]
  onChange: (fields: FieldDraft[]) => void
}

export function TemplateEditor({ fields, onChange }: TemplateEditorProps) {
  function updateField(index: number, changes: Partial<FieldDraft>) {
    onChange(
      fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...changes } : field,
      ),
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Checklist template</h3>
          <p className="text-sm text-muted-foreground">
            {fields.length === 1 ? '1 field' : `${fields.length} fields`}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange([...fields, createEmptyField(fields)])}
        >
          Add field
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
          No checklist fields yet.
        </p>
      ) : (
        <ol className="space-y-3">
          {fields.map((field, index) => (
            <li
              key={field.draftId}
              className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Field {index + 1}</p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Move field ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => onChange(moveField(fields, index, -1))}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Move field ${index + 1} down`}
                    disabled={index === fields.length - 1}
                    onClick={() => onChange(moveField(fields, index, 1))}
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label={`Remove field ${index + 1}`}
                    onClick={() => onChange(fields.filter((_, fieldIndex) => fieldIndex !== index))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`${field.draftId}-key`}>Key</Label>
                  <Input
                    id={`${field.draftId}-key`}
                    value={field.key}
                    onChange={(event) => updateField(index, { key: event.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${field.draftId}-label`}>Label</Label>
                  <Input
                    id={`${field.draftId}-label`}
                    value={field.label}
                    onChange={(event) => updateField(index, { label: event.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${field.draftId}-type`}>Type</Label>
                  <Select
                    items={FIELD_TYPE_OPTIONS}
                    value={field.type}
                    onValueChange={(value) => {
                      if (!value || !isChecklistFieldType(value)) return
                      updateField(index, { type: value })
                    }}
                  >
                    <SelectTrigger id={`${field.draftId}-type`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`${field.draftId}-section`}>Section</Label>
                  <Input
                    id={`${field.draftId}-section`}
                    value={field.section}
                    placeholder="Optional"
                    onChange={(event) => updateField(index, { section: event.target.value })}
                  />
                </div>
              </div>

              <Label className="font-normal">
                <Checkbox
                  checked={field.required}
                  onCheckedChange={(checked) => updateField(index, { required: checked })}
                />
                Required
              </Label>

              {field.type === 'select' ? (
                <div className="space-y-1.5">
                  <Label htmlFor={`${field.draftId}-options`}>Options</Label>
                  <Input
                    id={`${field.draftId}-options`}
                    value={field.optionsText}
                    placeholder="Comma-separated, e.g. Pass, Fail"
                    onChange={(event) => updateField(index, { optionsText: event.target.value })}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
