# Feature Contract: 11 – Kart Models + Template Editor

## Goal
Let users manage Kart Models (create, list, edit, soft-delete) and maintain a structured checklist template on each model. Templates are stored as a typed JSON array on the KartModel record. No authentication or real SharePoint sync yet — all writes remain optimistic local Dexie updates that enqueue a sync-queue item.

## Scope (in)
- Typed checklist field definition used by KartModel.checklistTemplate:
  - key: string (unique within the template)
  - label: string
  - type: 'text' | 'checkbox' | 'number' | 'select' | 'textarea'
  - required: boolean
  - options?: string[] (for select)
  - section?: string
- Update the KartModel TypeScript type so checklistTemplate is ChecklistField[] (instead of unknown)
- Feature folder `src/features/kart-models/` containing:
  - List view of all kart models (title, description, active flag, field count)
  - Create / edit form for a model (title, description, active, currentRecommendedFirmware)
  - Template editor UI that lets the user:
    - Add a field
    - Remove a field
    - Reorder fields (simple up/down or drag-and-drop is acceptable; either is fine)
    - Edit key, label, type, required, options (comma-separated or add/remove), and optional section
  - Soft-delete (set active = false) rather than hard delete for now
- All reads and writes go through the existing Zustand dataStore (addKartModel / updateKartModel / etc.). Optimistic local writes only.
- Replace or extend the current home page so the kart-model list and create/edit entry points are reachable (a simple route or tab is fine; no full router required if not already present)
- Seed data may be extended or left as-is; the seeded Junior Kart model should remain usable
- Use shadcn/ui components (Button, Input, Card, Select, Switch/Checkbox, etc.) + Tailwind
- Do **not** add AI or tool attribution to the PR description or commits

## Scope (out)
- No MSAL / authentication
- No real Microsoft Graph or SharePoint calls
- No task creation or checklist completion UI
- No firmware file upload or changelog
- No customer preferred-firmware logic
- No hard deletes or cascade behaviour
- No full routing library unless already present

## Acceptance criteria
- `npm run build` succeeds with no TypeScript errors
- User can create a new kart model with a non-empty title
- User can edit an existing model’s title, description, active flag, and recommended firmware
- User can add, remove, and reorder checklist fields on a model
- Field key, label, type, required, options, and section are persisted and reloaded correctly from IndexedDB
- List view shows models and their field counts
- Changes survive a page reload (Dexie)
- Sync-status indicator still reflects pending count after model changes
- PR description contains no “Built with Cursor” or similar attribution

## Notes
This is Step 1.1. Keep the change focused on Kart Models and the template editor. Later steps will snapshot the template onto tasks and build the checklist completion UI.
